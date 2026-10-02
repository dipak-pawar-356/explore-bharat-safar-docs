import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import fastifyCookie from '@fastify/cookie';
import { logger } from '@ebs/logger';
import { AppModule } from './app.module';
import { SanitizePipe } from './common/pipes/sanitize.pipe';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
  );

  // Global API Prefix
  app.setGlobalPrefix('api/v1');

  // Register Fastify Cookie Support for HttpOnly Refresh Cookies
  await app.register(fastifyCookie as unknown as Parameters<typeof app.register>[0], {
    secret:
      process.env.COOKIE_SECRET || 'ebs_super_secure_cookie_secret_key_minimum_32_characters_long',
  });

  // Enterprise Security Headers (EBS-DOC-40-SEC-BLUEPRINT Section 30)
  await app.register(helmet as unknown as Parameters<typeof app.register>[0], {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: [
          "'self'",
          'data:',
          'https://media.explorebharatsafar.in',
          'https://*.tile.openstreetmap.org',
        ],
        fontSrc: ["'self'", 'data:'],
        connectSrc: [
          "'self'",
          'https://api.explorebharatsafar.in',
          'wss://api.explorebharatsafar.in',
          'https://api.razorpay.com',
        ],
        frameSrc: ["'self'", 'https://api.razorpay.com'],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    hsts: {
      maxAge: 63072000, // 2 years
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: 'deny' },
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  });

  // Enable CORS
  app.enableCors({
    origin: process.env.APP_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID', 'Idempotency-Key'],
  });

  // Global Pipes: Sanitization + DTO Validation
  app.useGlobalPipes(
    new SanitizePipe(),
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // OpenAPI 3.1 Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Explore Bharat Safar — API Gateway')
    .setDescription('Unified National Digital Travel Discovery & Identity Ecosystem for Bharat')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag(
      'Authentication & Identity',
      'Authentication architecture, session lifecycle, and RBAC governance',
    )
    .addTag('Discovery', 'Bharat Discovery Engine (GIS Map & Entities)')
    .addTag('Villages', 'Rural Bharat Knowledge System')
    .addTag('Bookings', 'Travel Booking & Experience Management')
    .addTag('Social', 'Traveller Social Network & Community')
    .addTag('Admin', 'Governance & Administrative Controls')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
  await app.listen(port, '0.0.0.0');

  logger.info(`Explore Bharat Safar API Gateway running on: http://localhost:${port}/api/v1`, {
    port,
  });
  logger.info(`OpenAPI Documentation available at: http://localhost:${port}/api/docs`, {
    docsPath: '/api/docs',
  });
}

bootstrap().catch(err => {
  logger.fatal('Fatal API Bootstrap Error', {
    error: err instanceof Error ? err.message : String(err),
  });
  process.exit(1);
});
