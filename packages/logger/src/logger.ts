// Explore Bharat Safar — Production Structured JSON Logger
// Adheres to Pino specification & OpenTelemetry context injection

import { redactSensitiveData } from './redaction';
import { getTraceContext } from './correlation';

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

const LOG_LEVEL_PRIORITIES: Record<LogLevel, number> = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
};

export interface LoggerOptions {
  name?: string;
  defaultMeta?: Record<string, unknown>;
  minLevel?: LogLevel;
}

export interface LogEntry {
  level: LogLevel;
  time: string;
  name: string;
  msg: string;
  correlationId?: string;
  traceId?: string;
  spanId?: string;
  userId?: string;
  [key: string]: unknown;
}

export class StructuredLogger {
  private readonly name: string;
  private readonly defaultMeta: Record<string, unknown>;
  private readonly minLevelPriority: number;

  constructor(options: LoggerOptions | string = {}) {
    const opts: LoggerOptions = typeof options === 'string' ? { name: options } : options;
    this.name = opts.name ?? 'ebs-service';
    this.defaultMeta = opts.defaultMeta ?? {};
    const configuredLevel =
      (process.env.LOG_LEVEL?.toLowerCase() as LogLevel) || opts.minLevel || 'info';
    this.minLevelPriority = LOG_LEVEL_PRIORITIES[configuredLevel] ?? 30;
  }

  private shouldLog(level: LogLevel): boolean {
    return (LOG_LEVEL_PRIORITIES[level] ?? 30) >= this.minLevelPriority;
  }

  private write(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const trace = getTraceContext();
    const entry: LogEntry = {
      level,
      time: new Date().toISOString(),
      name: this.name,
      msg: message,
      correlationId: trace?.correlationId,
      traceId: trace?.traceId,
      spanId: trace?.spanId,
      userId: trace?.userId,
      ...this.defaultMeta,
      ...(meta ? redactSensitiveData(meta) : {}),
    };

    const serialized = JSON.stringify(entry);
    if (level === 'error' || level === 'fatal') {
      process.stderr.write(serialized + '\n');
    } else {
      process.stdout.write(serialized + '\n');
    }
  }

  public trace(message: string, meta?: Record<string, unknown>): void {
    this.write('trace', message, meta);
  }

  public debug(message: string, meta?: Record<string, unknown>): void {
    this.write('debug', message, meta);
  }

  public info(message: string, meta?: Record<string, unknown>): void {
    this.write('info', message, meta);
  }

  public warn(message: string, meta?: Record<string, unknown>): void {
    this.write('warn', message, meta);
  }

  public error(message: string, meta?: Record<string, unknown>): void {
    this.write('error', message, meta);
  }

  public fatal(message: string, meta?: Record<string, unknown>): void {
    this.write('fatal', message, meta);
  }

  public child(bindings: Record<string, unknown>): StructuredLogger {
    return new StructuredLogger({
      name: this.name,
      defaultMeta: { ...this.defaultMeta, ...bindings },
    });
  }
}

export function createLogger(
  name: string,
  options?: Omit<LoggerOptions, 'name'>,
): StructuredLogger {
  return new StructuredLogger({ name, ...options });
}

export const logger = createLogger('ebs-root');
