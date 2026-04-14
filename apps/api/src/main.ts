import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // ── Global pipes ───────────────────────────────────────────────────────────
  // Validates every incoming DTO using class-validator decorators.
  // whitelist: strips unknown properties silently.
  // forbidNonWhitelisted: throws 400 if unknown properties are sent.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ── CORS ───────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // ── Swagger ────────────────────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('StartupCRM API')
    .setDescription('Documentación interactiva de todos los endpoints del backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // ── Start ──────────────────────────────────────────────────────────────────
  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`🚀 API running at http://localhost:${port}`);
  logger.log(`📖 Swagger docs at http://localhost:${port}/docs`);
}

bootstrap();
