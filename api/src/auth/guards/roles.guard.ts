import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles specified, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // User must be authenticated
    if (!user) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Authentication required to access this resource',
        error: 'Unauthorized',
        // Frontend can use this code to show registration modal
        code: 'AUTH_REQUIRED',
        requiredRoles,
      });
    }

    // Check if user has required role
    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException({
        statusCode: 403,
        message: `Access denied. Required role(s): ${requiredRoles.join(', ')}`,
        error: 'Forbidden',
        code: 'INSUFFICIENT_ROLE',
        requiredRoles,
        userRole: user.role,
      });
    }

    return true;
  }
}
