import {
  CallHandler,
  ExecutionContext,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

export class TelemetryInterceptor implements NestInterceptor {
  private logger = new Logger(TelemetryInterceptor.name);
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const { method, route, url, headers, body } = request;
    const isDevelopment = process.env.NODE_ENV == 'development';
    const isProduction = process.env.NODE_ENV == 'production';
    const endpoints = ['login', 'signup', 'reset', 'change-password'];
    const blacklisted = (element: string) => route.path.includes(element);
    const noBlacklistedData = isProduction && !endpoints.some(blacklisted);
    if (!isDevelopment && noBlacklistedData) {
      this.logger.debug(`Request: ${method} ${route.path}`, {
        method,
        url,
        headers,
        body,
      });
    }
    const now = Date.now();

    return next.handle().pipe(
      tap(() =>
        this.logger.debug('Request duration', {
          duration: `${Date.now() - now} ms`,
        }),
      ),
    );
  }
}
