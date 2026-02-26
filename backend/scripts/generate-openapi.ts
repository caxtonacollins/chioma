/**
 * Generate static OpenAPI 3.0 JSON spec from the NestJS app.
 * Usage: OPENAPI_GENERATE=true npx ts-node -r tsconfig-paths/register scripts/generate-openapi.ts
 * Output: openapi.json (or path from OPENAPI_OUTPUT env)
 */
// Ensure global crypto for Node 18 (TypeORM uses crypto.randomUUID())
if (typeof globalThis.crypto === 'undefined') {
  (globalThis as any).crypto = require('crypto');
}
import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import * as fs from 'fs';
import * as path from 'path';

async function generate() {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix('api', {
    exclude: ['health', 'health/detailed', 'security.txt', '.well-known'],
  });
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  const config = new DocumentBuilder()
    .setTitle('Chioma API')
    .setDescription(
      'REST API for Chioma — Stellar blockchain-based rental payment platform.',
    )
    .setVersion('1.0')
    .setContact('Chioma', 'https://chioma.app', 'support@chioma.app')
    .setLicense('Open Source', 'https://github.com/chioma/chioma')
    .addServer('http://localhost:5000', 'Default')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token',
      },
      'JWT-auth',
    )
    .addTag('Authentication')
    .addTag('Users')
    .addTag('Rent Agreements')
    .addTag('Properties')
    .addTag('Payments')
    .addTag('Stellar')
    .addTag('Anchor')
    .addTag('Disputes')
    .addTag('Audit Logs')
    .addTag('Security')
    .addTag('Health')
    .addTag('Storage')
    .addTag('Reviews')
    .addTag('KYC')
    .addTag('Maintenance')
    .addTag('System')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });

  await app.close();

  const outputPath =
    process.env.OPENAPI_OUTPUT ||
    path.join(__dirname, '..', 'openapi.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(document, null, 2), 'utf8');
  console.log('OpenAPI spec written to', outputPath);
}

generate().catch((err: Error) => {
  console.error('OpenAPI generation failed:', err?.message ?? err);
  if (err?.stack) console.error(err.stack);
  process.exit(1);
});
