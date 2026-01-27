import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKey } from './api-key.entity';
import { ApiKeyService } from './api-key.service';
import { ApiKeyController } from './api-key.controller';
import { ApiKeyGuard, JwtOrApiKeyGuard } from './api-key.guard';

@Module({
  imports: [TypeOrmModule.forFeature([ApiKey])],
  controllers: [ApiKeyController],
  providers: [ApiKeyService, ApiKeyGuard, JwtOrApiKeyGuard],
  exports: [ApiKeyService, ApiKeyGuard, JwtOrApiKeyGuard],
})
export class ApiKeyModule {}
