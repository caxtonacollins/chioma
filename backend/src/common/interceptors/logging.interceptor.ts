import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { sanitizeBody } from '../middleware/logger.middleware';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    const body = sanitizeBody(req.body);

    // Store on res.locals (safe across lifecycle)
    res.locals.requestBody = body;

    return next.handle();
  }
}
