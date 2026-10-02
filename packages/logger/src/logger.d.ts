export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
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
export declare class StructuredLogger {
    private readonly name;
    private readonly defaultMeta;
    private readonly minLevelPriority;
    constructor(options?: LoggerOptions);
    private shouldLog;
    private write;
    trace(message: string, meta?: Record<string, unknown>): void;
    debug(message: string, meta?: Record<string, unknown>): void;
    info(message: string, meta?: Record<string, unknown>): void;
    warn(message: string, meta?: Record<string, unknown>): void;
    error(message: string, meta?: Record<string, unknown>): void;
    fatal(message: string, meta?: Record<string, unknown>): void;
    child(bindings: Record<string, unknown>): StructuredLogger;
}
export declare function createLogger(name: string, options?: Omit<LoggerOptions, 'name'>): StructuredLogger;
export declare const logger: StructuredLogger;
//# sourceMappingURL=logger.d.ts.map