import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { json, urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './core/filters/http-exception.filter';
import { LoggingInterceptor } from './core/interceptors/logging.interceptor';
import { StaticFilesMiddleware } from './core/middleware/static-files.middleware';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './config/winston.config';
import { getHelmetConfig } from './config/helmet.config';
import { getCorsConfig } from './config/cors.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });

  // Request body size limit (protection against large payload attacks)
  // MUST be before cookie parser
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  // Cookie parser (for HTTP-only cookies with JWT tokens)
  // MUST be before helmet
  app.use(cookieParser());

  // Handle frontend static file requests (sw.js, manifest.json, etc.)
  // Returns 404 without logging to prevent unnecessary error logs
  // MUST be before other middleware to intercept these requests early
  const staticFilesMiddleware = new StaticFilesMiddleware();
  app.use(staticFilesMiddleware.use.bind(staticFilesMiddleware));

  // Security headers with Helmet.js
  // Configured for PIPEDA compliance and maximum security
  // See: /api/src/config/helmet.config.ts for detailed configuration
  app.use(helmet(getHelmetConfig()));

  // CORS with whitelist approach (no wildcards)
  // Only allows requests from trusted domains
  // See: /api/src/config/cors.config.ts for whitelist configuration
  app.enableCors(getCorsConfig());

  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Global pipes (validation)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters (catch ALL exceptions, not just HTTP)
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Hummii API')
    .setDescription('Service Marketplace Platform API for Canada')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('health', 'Health check endpoints')
    .addTag('Authentication', 'Authentication endpoints')
    .addTag('Users', 'User management')
    .addTag('Admin', 'Admin management endpoints')
    .addTag('Orders', 'Order management')
    .addTag('Proposals', 'Order proposals')
    .addTag('Contractors', 'Contractor profiles and management')
    .addTag('Categories', 'Service categories')
    .addTag('Chat', 'Real-time chat')
    .addTag('Reviews', 'Reviews and ratings')
    .addTag('Subscriptions', 'Subscription management')
    .addTag('Disputes', 'Dispute resolution')
    .addTag('Notifications', 'User notifications')
    .addTag('Verification', 'Identity verification')
    .addTag('SEO', 'SEO and metadata')
    .addTag('SEO Admin', 'SEO admin endpoints')
    .addTag('Sitemap', 'XML sitemaps')
    .addTag('Analytics', 'Analytics tracking')
    .addTag('Analytics Admin', 'Analytics admin endpoints')
    .addTag('monitoring', 'Monitoring and metrics')
    .addTag('Webhooks', 'Webhook endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
