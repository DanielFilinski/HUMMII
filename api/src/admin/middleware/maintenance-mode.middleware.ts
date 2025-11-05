import { Injectable, NestMiddleware, ServiceUnavailableException, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { UserRole, Prisma } from '@prisma/client';

/**
 * Maintenance Mode Middleware
 * 
 * Checks if maintenance mode is enabled and returns 503 for non-admin users.
 * Admin users can still access the platform during maintenance.
 */
@Injectable()
export class MaintenanceModeMiddleware implements NestMiddleware {
  private readonly logger = new Logger(MaintenanceModeMiddleware.name);

  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Skip maintenance check for admin routes
    if (req.path.startsWith('/admin')) {
      return next();
    }

    try {
      // Check maintenance mode setting
      const setting = await this.prisma.systemSettings.findUnique({
        where: { key: 'maintenance_mode' },
      });

      if (setting && setting.value.toLowerCase() === 'true') {
        // Check if user is admin (from JWT token if available)
        const user = (req as any).user;
        const isAdmin = user?.roles?.includes(UserRole.ADMIN);

        if (!isAdmin) {
          throw new ServiceUnavailableException(
            'The platform is currently under maintenance. Please try again later.',
          );
        }
      }
    } catch (error) {
      // Handle database errors gracefully
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // P2021: Table does not exist
        if (error.code === 'P2021') {
          this.logger.warn(
            `System settings table not found. Skipping maintenance mode check. Error: ${error.message}`,
          );
          // Continue request processing (fail-open approach)
          return next();
        }
      }

      // For other errors, log and continue (don't block the request)
      this.logger.error(
        `Error checking maintenance mode: ${error instanceof Error ? error.message : String(error)}`,
      );
      // Continue request processing
      return next();
    }

    next();
  }
}

