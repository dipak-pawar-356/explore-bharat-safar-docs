export interface TraceContext {
    correlationId: string;
    traceId?: string;
    spanId?: string;
    userId?: string;
    tenantId?: string;
}
/**
 * Executes a callback within a correlation context.
 */
export declare function runWithCorrelationContext<R>(context: Partial<TraceContext>, fn: () => R): R;
/**
 * Returns the current active trace context if present.
 */
export declare function getTraceContext(): TraceContext | undefined;
/**
 * Retrieves the current correlation ID or generates a fallback UUID.
 */
export declare function getCorrelationId(): string;
//# sourceMappingURL=correlation.d.ts.map