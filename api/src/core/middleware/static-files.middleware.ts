import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to handle frontend static file requests
 * Returns 404 without logging for known frontend static files
 * Prevents unnecessary error logs for service workers, manifests, etc.
 */
@Injectable()
export class StaticFilesMiddleware implements NestMiddleware {
  /**
   * List of frontend static file patterns that should return 404 silently
   */
  private readonly frontendStaticPatterns = [
    /^\/sw\.js$/,
    /^\/service-worker\.js$/,
    /^\/manifest\.json$/,
    /^\/robots\.txt$/,
    /^\/favicon\.ico$/,
    /^\/_next\/static\//,
    /^\/_next\/webpack-hmr$/,
    /^\/_next\/on-demand-entries-ping$/,
  ];

  use(req: Request, res: Response, next: NextFunction): void {
    const path = req.path;

    // Check if this is a frontend static file request
    const isFrontendStatic = this.frontendStaticPatterns.some((pattern) =>
      pattern.test(path),
    );

    if (isFrontendStatic) {
      // Return 404 without logging
      // These files should be served by the frontend, not the API
      res.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Cannot ${req.method} ${path}`,
        error: 'Not Found',
      });
      return;
    }

    next();
  }
}

