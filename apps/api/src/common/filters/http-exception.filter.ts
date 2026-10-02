import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { ApiErrorResponse } from '@ebs/types';
import { logger } from '@ebs/logger';

const DEFAULT_ERROR_CODES: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'EBS_VALIDATION_ERROR',
  [HttpStatus.UNAUTHORIZED]: 'EBS_AUTH_EXPIRED',
  [HttpStatus.FORBIDDEN]: 'EBS_PERM_DENIED',
  [HttpStatus.NOT_FOUND]: 'EBS_RESOURCE_NOT_FOUND',
  [HttpStatus.CONFLICT]: 'EBS_LOCK_CONFLICT',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'EBS_RULE_VIOLATION',
  [HttpStatus.TOO_MANY_REQUESTS]: 'EBS_RATE_EXCEEDED',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'EBS_INTERNAL_ERROR',
};

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';
    let errorCode = 'EBS_INTERNAL_ERROR';
    let details: unknown[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
        errorCode = DEFAULT_ERROR_CODES[status] || `EBS_ERR_${status}`;
      } else if (typeof res === 'object' && res !== null) {
        const obj = res as Record<string, unknown>;
        errorCode = (obj.errorCode as string) || DEFAULT_ERROR_CODES[status] || `EBS_ERR_${status}`;

        if (Array.isArray(obj.message)) {
          message = 'Validation failed for the submitted payload.';
          details = obj.message.map((msg: string) => {
            const parts = msg.split(' ');
            return {
              field: parts[0] || 'unknown',
              issue: msg,
            };
          });
        } else {
          message = (obj.message as string) || message;
          details = obj.details as unknown[] | undefined;
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      errorCode = 'EBS_INTERNAL_ERROR';
    }

    logger.error(`HTTP Exception [${status}] ${errorCode}: ${message}`, {
      statusCode: status,
      errorCode,
      path: request.url,
      correlationId: request.correlationId,
      details,
    });

    const errorPayload: ApiErrorResponse = {
      success: false,
      statusCode: status,
      error: {
        errorCode,
        message,
        details,
      },
      meta: {
        timestamp: new Date().toISOString(),
        correlationId: request.correlationId || 'none',
        path: request.url,
      },
    };

    if (response.status && typeof response.status === 'function') {
      response.status(status).send(errorPayload);
    } else if (response.code && typeof response.code === 'function') {
      response.code(status).send(errorPayload);
    } else {
      response.statusCode = status;
      response.setHeader('Content-Type', 'application/json');
      response.end(JSON.stringify(errorPayload));
    }
  }
}
