import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

/**
 * Guard to protect order-related endpoints
 * Ensures only order owner (client) can access protected routes
 * Security: Checks order ownership before allowing request
 */
@Injectable()
export class OrderOwnerGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const orderId = request.params.id || request.params.orderId;

    if (!orderId) {
      return false;
    }

    // Fetch order to check ownership
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { clientId: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check if current user is the order owner (client)
    return order.clientId === user.userId;
  }
}

