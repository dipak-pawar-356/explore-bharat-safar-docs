// Explore Bharat Safar — Logging & PII Redaction Test Suite
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { redactSensitiveData, SENSITIVE_KEYS } from './redaction';
import { runWithCorrelationContext, getCorrelationId, getTraceContext } from './correlation';
import { StructuredLogger } from './logger';

describe('PII Redaction Rules', () => {
  it('should redact sensitive keys defined in compliance standards', () => {
    const sensitivePayload = {
      user: {
        id: 'usr_123',
        email: 'traveller@bharat.in',
        password: 'PlainTextPassword123!',
        phoneNumber: '+919876543210',
        aadhaarNumber: '1234 5678 9012',
      },
      payment: {
        cardNumber: '4111222233334444',
        cvv: '123',
        amount: 250000,
      },
      publicInfo: 'Exploring Raigad Fort',
    };

    const redacted = redactSensitiveData(sensitivePayload);

    assert.equal(redacted.user.password, '[REDACTED]');
    assert.equal(redacted.user.phoneNumber, '[REDACTED]');
    assert.equal(redacted.user.aadhaarNumber, '[REDACTED]');
    assert.equal(redacted.payment.cardNumber, '[REDACTED]');
    assert.equal(redacted.payment.cvv, '[REDACTED]');
    assert.equal(redacted.publicInfo, 'Exploring Raigad Fort');
    assert.equal(redacted.payment.amount, 250000);
  });

  it('should handle primitives and null values safely', () => {
    assert.equal(redactSensitiveData(null), null);
    assert.equal(redactSensitiveData('simple string'), 'simple string');
    assert.equal(redactSensitiveData(42), 42);
  });
});

describe('Distributed Correlation Context', () => {
  it('should isolate correlation ID within async context', () => {
    const testId = 'ebs-corr-test-uuid-999';

    runWithCorrelationContext({ correlationId: testId, traceId: 'trace-1' }, () => {
      const activeId = getCorrelationId();
      assert.equal(activeId, testId);

      const ctx = getTraceContext();
      assert.equal(ctx?.traceId, 'trace-1');
    });

    // Outside context, getCorrelationId should return a new generated UUID, not testId
    const outsideId = getCorrelationId();
    assert.notEqual(outsideId, testId);
  });
});

describe('StructuredLogger Instance', () => {
  it('should create logger with custom name and child bindings', () => {
    const rootLogger = new StructuredLogger({ name: 'ebs-test-root' });
    const child = rootLogger.child({ module: 'test-module' });

    assert.ok(child instanceof StructuredLogger);
  });
});
