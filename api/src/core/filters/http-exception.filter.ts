import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const error =
      typeof exceptionResponse === 'string'
        ? { message: exceptionResponse }
        : (exceptionResponse as object);

    response.status(status).json({
      ...error,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    });
  }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  /**
   * List of frontend static file patterns that should not be logged
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

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException ? exception.getResponse() : 'Internal server error';

    // Check if this is a frontend static file request that should not be logged
    const isFrontendStatic =
      status === HttpStatus.NOT_FOUND &&
      this.frontendStaticPatterns.some((pattern) => pattern.test(request.path));

    // Only log errors for non-frontend-static files
    // Frontend static files (sw.js, manifest.json, etc.) should not cause error logs
    if (!isFrontendStatic) {
      // Log the error (Winston will handle this)
      console.error('Unhandled exception:', exception);
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
    });
  }
}
