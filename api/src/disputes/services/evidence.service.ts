import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { AuditService } from '../../shared/audit/audit.service';
import { AuditAction, AuditEntity } from '../../shared/audit/enums/audit-action.enum';
import { CloudflareR2Service } from '../../shared/upload/cloudflare-r2.service';
import { UploadSecurityService } from '../../shared/upload/upload-security.service';
import { DisputesService } from '../disputes.service';
import { AddEvidenceDto } from '../dto/add-evidence.dto';
import { UserRole } from '@prisma/client';

/**
 * Evidence Service
 *
 * Handles file upload, validation, and access control for dispute evidence
 */
@Injectable()
export class EvidenceService {
  private readonly logger = new Logger(EvidenceService.name);
  private readonly MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
  private readonly MAX_FILES_PER_DISPUTE = 10;
  private readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf',
    'text/plain',
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly r2Service: CloudflareR2Service,
    private readonly securityService: UploadSecurityService,
    private readonly disputesService: DisputesService,
  ) {}

  /**
   * Upload evidence file for dispute
   * Validates file, uploads to R2, and creates evidence record
   */
  async uploadEvidence(
    disputeId: string,
    file: Express.Multer.File,
    dto: AddEvidenceDto,
    userId: string,
    userRole?: UserRole,
  ) {
    // 1. Check access (participant or admin)
    const hasAccess = await this.disputesService.checkUserAccess(
      disputeId,
      userId,
      userRole,
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        'You are not authorized to upload evidence for this dispute',
      );
    }

    // 2. Validate dispute exists
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        _count: {
          select: { evidence: true },
        },
      },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    // 3. Check file count limit
    if (dispute._count.evidence >= this.MAX_FILES_PER_DISPUTE) {
      throw new BadRequestException(
        `Maximum ${this.MAX_FILES_PER_DISPUTE} files allowed per dispute`,
      );
    }

    // 4. Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File too large. Maximum size is ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }

    // 5. Validate MIME type
    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    // 6. Process file based on type
    let processedBuffer: Buffer;
    let fileHash: string;
    let fileSize: number;
    let mimeType: string;

    if (file.mimetype.startsWith('image/')) {
      // Process image (strip EXIF, resize if needed)
      const processed = await this.securityService.validateAndProcessImage(file, {
        maxWidth: 2048,
        maxHeight: 2048,
        quality: 85,
        format: 'jpeg',
      });
      processedBuffer = processed.buffer;
      fileHash = processed.hash;
      fileSize = processed.size;
      mimeType = 'image/jpeg';
    } else {
      // Process document (PDF, text)
      const validated = await this.securityService.validateDocument(file);
      processedBuffer = file.buffer;
      fileHash = validated.hash;
      fileSize = validated.size;
      mimeType = validated.mimeType;
    }

    // 7. Generate file key for R2
    const fileKey = this.r2Service.generateFileKey(
      `disputes/${disputeId}/evidence`,
      file.originalname,
    );

    // 8. Upload to R2 (create temporary file object for upload)
    const tempFile: Express.Multer.File = {
      ...file,
      buffer: processedBuffer,
      size: fileSize,
      mimetype: mimeType,
    };

    const fileUrl = await this.r2Service.uploadFile(tempFile, fileKey);

    // 9. Create evidence record
    const evidence = await this.prisma.disputeEvidence.create({
      data: {
        disputeId,
        uploadedById: userId,
        fileKey,
        fileUrl,
        fileSize,
        mimeType,
        fileHash,
        evidenceType: dto.evidenceType,
        description: dto.description,
        virusScanStatus: 'pending', // TODO: Implement virus scanning
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // 10. Audit log
    await this.auditService.log({
      action: AuditAction.DISPUTE_EVIDENCE_UPLOADED,
      entity: AuditEntity.DISPUTE_EVIDENCE,
      entityId: evidence.id,
      userId,
      metadata: {
        disputeId,
        evidenceType: dto.evidenceType,
        fileSize,
        mimeType,
      },
    });

    this.logger.log(`Evidence uploaded: ${evidence.id} for dispute: ${disputeId}`);

    return evidence;
  }

  /**
   * Get evidence list for dispute
   * Checks access and returns evidence with signed URLs
   */
  async getEvidence(disputeId: string, userId: string, userRole?: UserRole) {
    // Check access
    const hasAccess = await this.disputesService.checkUserAccess(
      disputeId,
      userId,
      userRole,
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        'You are not authorized to view evidence for this dispute',
      );
    }

    // Get evidence
    const evidence = await this.prisma.disputeEvidence.findMany({
      where: { disputeId },
      orderBy: { uploadedAt: 'desc' },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Generate signed URLs (expires in 1 hour)
    // Note: For now, we return the public URL from R2
    // In production, you should generate presigned URLs for private buckets
    const evidenceWithUrls = evidence.map((item) => ({
      ...item,
      signedUrl: item.fileUrl, // TODO: Generate presigned URL for private buckets
    }));

    return evidenceWithUrls;
  }

  /**
   * Delete evidence (owner only)
   */
  async deleteEvidence(evidenceId: string, userId: string) {
    const evidence = await this.prisma.disputeEvidence.findUnique({
      where: { id: evidenceId },
    });

    if (!evidence) {
      throw new NotFoundException('Evidence not found');
    }

    // Check ownership
    if (evidence.uploadedById !== userId) {
      throw new ForbiddenException(
        'You are not authorized to delete this evidence. Only the uploader can delete evidence.',
      );
    }

    // Delete from R2
    await this.r2Service.deleteFile(evidence.fileKey);

    // Delete from database
    await this.prisma.disputeEvidence.delete({
      where: { id: evidenceId },
    });

    // Audit log
    await this.auditService.log({
      action: AuditAction.DISPUTE_EVIDENCE_DELETED,
      entity: AuditEntity.DISPUTE_EVIDENCE,
      entityId: evidenceId,
      userId,
      metadata: {
        disputeId: evidence.disputeId,
      },
    });

    this.logger.log(`Evidence deleted: ${evidenceId}`);

    return { message: 'Evidence deleted successfully' };
  }

  /**
   * Download evidence with signed URL
   * Checks access and returns signed URL (expires in 1 hour)
   */
  async downloadEvidence(evidenceId: string, userId: string, userRole?: UserRole) {
    const evidence = await this.prisma.disputeEvidence.findUnique({
      where: { id: evidenceId },
      include: {
        dispute: true,
      },
    });

    if (!evidence) {
      throw new NotFoundException('Evidence not found');
    }

    // Check access to dispute
    const hasAccess = await this.disputesService.checkUserAccess(
      evidence.disputeId,
      userId,
      userRole,
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        'You are not authorized to download this evidence',
      );
    }

    // Return signed URL (for now, return public URL)
    // TODO: Generate presigned URL for private buckets
    return {
      evidenceId: evidence.id,
      fileName: evidence.fileKey.split('/').pop(),
      signedUrl: evidence.fileUrl, // TODO: Generate presigned URL
      expiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour
    };
  }
}

