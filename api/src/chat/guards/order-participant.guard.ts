import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

/**
 * OrderParticipantGuard
 * 
 * Ensures that the authenticated user is a participant in the order's chat.
 * User must be either the client OR the contractor for the order.
 * 
 * This guard protects chat endpoints from unauthorized access.
 */
@Injectable()
export class OrderParticipantGuard implements CanActivate {
  private readonly logger = new Logger(OrderParticipantGuard.name);

  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const orderId = request.params.orderId;

    if (!user) {
      this.logger.warn('No user found in request');
      throw new ForbiddenException('Authentication required');
    }

    if (!orderId) {
      this.logger.warn('No orderId found in request params');
      throw new ForbiddenException('Order ID is required');
    }

    // Fetch order with minimal fields
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        clientId: true,
        contractorId: true,
      },
    });

    if (!order) {
      this.logger.warn(`Order not found: ${orderId}`);
      throw new NotFoundException('Order not found');
    }

    // Check if user is participant (client OR contractor)
    const isParticipant = order.clientId === user.id || order.contractorId === user.id;

    if (!isParticipant) {
      this.logger.warn(
        `User ${user.id} attempted to access chat for order ${orderId} without authorization`,
      );
      throw new ForbiddenException('You are not a participant of this order');
    }

    // Attach order to request for potential use in controller
    request.order = order;

    return true;
  }
}


