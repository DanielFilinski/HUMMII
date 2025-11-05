import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DisputesService } from '../disputes.service';
import { UserRole } from '@prisma/client';

/**
 * Dispute Access Guard
 *
 * Ensures only dispute participants (initiator or respondent) or admins can access dispute resources
 * Security: Checks user participation before allowing request
 */
@Injectable()
export class DisputeAccessGuard implements CanActivate {
  constructor(private readonly disputesService: DisputesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required to access this resource');
    }

    // Get dispute ID from params
    const disputeId = request.params.id || request.params.disputeId;

    if (!disputeId) {
      return false;
    }

    // Check access (participant or admin)
    const hasAccess = await this.disputesService.checkUserAccess(
      disputeId,
      user.userId,
      user.roles?.includes(UserRole.ADMIN) ? UserRole.ADMIN : undefined,
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        'You are not authorized to access this dispute. Only participants and admins can access disputes.',
      );
    }

    return true;
  }
}

