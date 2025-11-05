import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import * as fs from 'fs';
import * as path from 'path';

async function exportSwagger() {
  const app = await NestFactory.create(AppModule, { logger: false });

  // CORS configuration
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

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

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Hummii API')
    .setDescription('Service Marketplace Platform API for Canada')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer('http://localhost:3000', 'Local Development')
    .addServer('https://api.hummii.ca', 'Production')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('contractors', 'Contractor profiles')
    .addTag('orders', 'Order management')
    .addTag('chat', 'Real-time chat')
    .addTag('reviews', 'Reviews and ratings')
    .addTag('subscriptions', 'Subscription management')
    .addTag('notifications', 'Notifications')
    .addTag('disputes', 'Dispute resolution')
    .addTag('categories', 'Category management')
    .addTag('seo', 'SEO and sitemap')
    .addTag('analytics', 'Analytics tracking')
    .addTag('admin', 'Admin panel endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Create docs/api directory if it doesn't exist
  const docsDir = path.join(__dirname, '../../docs/api');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // Export JSON
  const jsonPath = path.join(docsDir, 'swagger.json');
  fs.writeFileSync(jsonPath, JSON.stringify(document, null, 2));

  console.log(`✅ Swagger JSON exported to ${jsonPath}`);
  console.log(`📊 Total paths: ${Object.keys(document.paths).length}`);

  await app.close();
  process.exit(0);
}

exportSwagger().catch((error) => {
  console.error('❌ Error exporting Swagger:', error);
  process.exit(1);
});

