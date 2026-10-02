import { Injectable, PipeTransform, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    if (metadata.type === 'custom') {
      return value;
    }
    return this.sanitize(value);
  }

  private sanitize(value: unknown): unknown {
    if (typeof value === 'string') {
      // Strip dangerous HTML script tags and javascript: URIs
      return value
        .trim()
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:[^\s]*/gi, '');
    }

    if (Array.isArray(value)) {
      return value.map(item => this.sanitize(item));
    }

    if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
      const sanitizedObj: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitizedObj[key] = this.sanitize(val);
      }
      return sanitizedObj;
    }

    return value;
  }
}
