import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { runWithCorrelationContext } from '@ebs/logger';

@Injectable()
export class CorrelationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const correlationId = request.headers['x-correlation-id'] || uuidv4();
    request.correlationId = correlationId;

    if (response.header) {
      response.header('x-correlation-id', correlationId);
    } else if (response.setHeader) {
      response.setHeader('x-correlation-id', correlationId);
    }

    return runWithCorrelationContext({ correlationId }, () => next.handle());
  }
}
