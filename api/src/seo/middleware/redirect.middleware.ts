import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RedirectService } from '../services/redirect.service';

@Injectable()
export class RedirectMiddleware implements NestMiddleware {
  constructor(private readonly redirectService: RedirectService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Only process GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Check if path matches /performer/* pattern
    const path = req.path;
    if (!path.startsWith('/performer/')) {
      return next();
    }

    // Check for redirect
    const redirect = await this.redirectService.getRedirect(path);

    if (redirect) {
      // Perform 301 redirect
      return res.redirect(redirect.statusCode, redirect.toPath);
    }

    // No redirect found, continue
    next();
  }
}

