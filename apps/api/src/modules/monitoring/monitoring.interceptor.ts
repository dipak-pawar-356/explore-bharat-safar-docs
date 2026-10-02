// Explore Bharat Safar — Server-Timing & Request Telemetry Interceptor
// Reference: EBS-TDR-51-TECHSTACK Section 37 (Golden Signals)
// Sprint 11: Enterprise Observability & Production Optimization

import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { FastifyReply } from 'fastify';
import { MonitoringService } from './monitoring.service';

@Injectable()
export class PerformanceTimingInterceptor implements NestInterceptor {
  constructor(private readonly monitoringService: MonitoringService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startTime = Date.now();
    const httpContext = context.switchToHttp();
    const reply = httpContext.getResponse<FastifyReply>();

    return next.handle().pipe(
      tap(() => {
        const durationMs = Date.now() - startTime;
        try {
          if (reply && typeof reply.header === 'function') {
            reply.header('Server-Timing', `app;dur=${durationMs}`);
          }
          if (reply && reply.statusCode) {
            this.monitoringService.recordHttpRequest(reply.statusCode);
          }
        } catch {
          // Fallback if headers already sent
        }
      }),
    );
  }
}
