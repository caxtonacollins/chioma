import { Injectable, Logger } from '@nestjs/common';
import { HealthCheckResult, HealthCheckError } from '@nestjs/terminus';
import * as fs from 'fs';
import * as path from 'path';

export interface EnhancedHealthResult {
  status: 'ok' | 'error' | 'warning';
  timestamp: string;
  version: string;
  uptime: number;
  services: Record<string, any>;
  environment?: string;
  details?: any;
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime = Date.now();

  enhanceHealthResult(
    result: HealthCheckResult,
    includeDetails = false,
  ): EnhancedHealthResult {
    const packageJson = this.getPackageJson();
    const overallStatus = this.determineOverallStatus(result);

    const enhancedResult: EnhancedHealthResult = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: packageJson.version || '1.0.0',
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      services: this.formatServices(result.details),
    };

    if (includeDetails) {
      enhancedResult.environment = process.env.NODE_ENV || 'development';
      enhancedResult.details = {
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch,
        processId: process.pid,
        memoryUsage: process.memoryUsage(),
      };
    }

    return enhancedResult;
  }

  handlePartialFailure(
    error: any,
    includeDetails = false,
  ): EnhancedHealthResult {
    this.logger.error('Health check partial failure', error);

    const packageJson = this.getPackageJson();
    let services = {};
    let status: 'ok' | 'error' | 'warning' = 'error';

    // Extract information from HealthCheckError if available
    if (error instanceof HealthCheckError && error.causes) {
      services = this.formatServices(error.causes);
      status = this.determineOverallStatusFromError(error.causes);
    }

    const result: EnhancedHealthResult = {
      status,
      timestamp: new Date().toISOString(),
      version: packageJson.version || '1.0.0',
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      services,
    };

    if (includeDetails) {
      result.environment = process.env.NODE_ENV || 'development';
      result.details = {
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch,
        processId: process.pid,
        memoryUsage: process.memoryUsage(),
        error: error.message,
      };
    }

    return result;
  }

  private determineOverallStatus(result: HealthCheckResult): 'ok' | 'error' | 'warning' {
    if (result.status === 'ok') {
      return 'ok';
    }

    // Check if any services are still healthy (partial failure)
    const services = Object.values(result.details || {});
    const hasHealthyServices = services.some((service: any) => service.status === 'up');
    
    return hasHealthyServices ? 'warning' : 'error';
  }

  private determineOverallStatusFromError(causes: Record<string, any>): 'ok' | 'error' | 'warning' {
    const services = Object.values(causes || {});
    const healthyServices = services.filter((service: any) => service.status === 'up');
    const totalServices = services.length;

    if (healthyServices.length === totalServices) {
      return 'ok';
    } else if (healthyServices.length > 0) {
      return 'warning';
    } else {
      return 'error';
    }
  }

  private formatServices(details: Record<string, any> | undefined): Record<string, any> {
    if (!details) {
      return {};
    }

    const formatted: Record<string, any> = {};

    Object.entries(details).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        formatted[key] = {
          status: value.status === 'up' ? 'ok' : value.status === 'down' ? 'error' : value.status === 'warning' ? 'warning' : 'error',
          responseTime: value.responseTime || null,
          ...value,
        };
      } else {
        formatted[key] = value;
      }
    });

    return formatted;
  }

  private getPackageJson(): any {
    try {
      const packagePath = path.join(process.cwd(), 'package.json');
      const packageContent = fs.readFileSync(packagePath, 'utf8');
      return JSON.parse(packageContent);
    } catch (error) {
      this.logger.warn('Could not read package.json', error);
      return { version: '1.0.0' };
    }
  }
}