// Explore Bharat Safar — Distributed Correlation Context
// Supports W3C Trace Context (traceId, spanId) and distributed correlation IDs

import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

export interface TraceContext {
  correlationId: string;
  traceId?: string;
  spanId?: string;
  userId?: string;
  tenantId?: string;
}

const asyncLocalStorage = new AsyncLocalStorage<TraceContext>();

/**
 * Executes a callback within a correlation context.
 */
export function runWithCorrelationContext<R>(context: Partial<TraceContext>, fn: () => R): R {
  const completeContext: TraceContext = {
    correlationId: context.correlationId ?? randomUUID(),
    traceId: context.traceId,
    spanId: context.spanId,
    userId: context.userId,
    tenantId: context.tenantId,
  };

  return asyncLocalStorage.run(completeContext, fn);
}

/**
 * Returns the current active trace context if present.
 */
export function getTraceContext(): TraceContext | undefined {
  return asyncLocalStorage.getStore();
}

/**
 * Retrieves the current correlation ID or generates a fallback UUID.
 */
export function getCorrelationId(): string {
  const ctx = asyncLocalStorage.getStore();
  return ctx?.correlationId ?? randomUUID();
}
