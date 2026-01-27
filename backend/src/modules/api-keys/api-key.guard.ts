import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiKeyService } from './api-key.service';
import { ApiKeyScope } from './api-key.entity';

export const API_KEY_SCOPE_KEY = 'apiKeyScope';
export const RequireApiKeyScope = (scope: ApiKeyScope) =>
  SetMetadata(API_KEY_SCOPE_KEY, scope);

/**
 * Guard for API key authentication
 * Use on routes that should accept API key authentication
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private apiKeyService: ApiKeyService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = this.extractApiKey(request);

    if (!apiKey) {
      throw new UnauthorizedException('API key required');
    }

    const validationResult = await this.apiKeyService.validateApiKey(apiKey);

    if (!validationResult.valid) {
      throw new UnauthorizedException(validationResult.error);
    }

    // Check required scope
    const requiredScope = this.reflector.get<ApiKeyScope>(
      API_KEY_SCOPE_KEY,
      context.getHandler(),
    );

    if (
      requiredScope &&
      !this.apiKeyService.hasScope(validationResult.apiKey!, requiredScope)
    ) {
      throw new ForbiddenException('Insufficient API key permissions');
    }

    // Record usage
    const ip =
      request.headers['x-forwarded-for']?.split(',')[0] ||
      request.socket.remoteAddress;
    await this.apiKeyService.recordUsage(validationResult.apiKey!.id, ip);

    // Attach API key info to request
    request.apiKey = validationResult.apiKey;
    request.user = validationResult.apiKey!.user;

    return true;
  }

  private extractApiKey(request: any): string | null {
    // Check X-API-Key header
    const headerKey = request.headers['x-api-key'];
    if (headerKey) {
      return headerKey;
    }

    // Check Authorization header with ApiKey scheme
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('ApiKey ')) {
      return authHeader.substring(7);
    }

    // Check query parameter (less secure, but sometimes needed)
    if (request.query?.api_key) {
      return request.query.api_key;
    }

    return null;
  }
}

/**
 * Combined guard that accepts either JWT or API key authentication
 */
@Injectable()
export class JwtOrApiKeyGuard implements CanActivate {
  constructor(
    private apiKeyService: ApiKeyService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Check if already authenticated via JWT
    if (request.user) {
      return true;
    }

    // Try API key authentication
    const apiKey = this.extractApiKey(request);
    if (apiKey) {
      const validationResult = await this.apiKeyService.validateApiKey(apiKey);

      if (validationResult.valid) {
        const requiredScope = this.reflector.get<ApiKeyScope>(
          API_KEY_SCOPE_KEY,
          context.getHandler(),
        );

        if (
          requiredScope &&
          !this.apiKeyService.hasScope(validationResult.apiKey!, requiredScope)
        ) {
          throw new ForbiddenException('Insufficient API key permissions');
        }

        const ip =
          request.headers['x-forwarded-for']?.split(',')[0] ||
          request.socket.remoteAddress;
        await this.apiKeyService.recordUsage(validationResult.apiKey!.id, ip);

        request.apiKey = validationResult.apiKey;
        request.user = validationResult.apiKey!.user;

        return true;
      }
    }

    throw new UnauthorizedException('Authentication required');
  }

  private extractApiKey(request: any): string | null {
    const headerKey = request.headers['x-api-key'];
    if (headerKey) return headerKey;

    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('ApiKey ')) return authHeader.substring(7);

    return null;
  }
}
