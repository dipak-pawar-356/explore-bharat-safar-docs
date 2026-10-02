// Explore Bharat Safar — Notification Circuit Breaker Engine
// Reference: EBS-DOC-29-SERVICES Section 3
// Tripping logic: > 20% failure rate in 60s window trips to OPEN
// Cool-down: 30s transitions to HALF_OPEN
// Sprint 10: Enterprise Notification & Communication Platform

import { Injectable, Logger } from '@nestjs/common';

export enum CircuitState {
  CLOSED = 'CLOSED', // Normal operation
  OPEN = 'OPEN', // Tripped, calls routed to fallback
  HALF_OPEN = 'HALF_OPEN', // Probe calls allowed
}

interface CallRecord {
  timestamp: number;
  success: boolean;
}

@Injectable()
export class NotificationCircuitBreakerEngine {
  private readonly logger = new Logger(NotificationCircuitBreakerEngine.name);
  private readonly stateMap = new Map<string, CircuitState>();
  private readonly callHistory = new Map<string, CallRecord[]>();
  private readonly lastStateChange = new Map<string, number>();

  private readonly failureThresholdPercent = 20; // 20%
  private readonly windowDurationMs = 60000; // 60 seconds
  private readonly coolDownDurationMs = 30000; // 30 seconds
  private readonly minCallsThreshold = 5; // Minimum calls before tripping

  public getState(serviceName: string): CircuitState {
    const currentState = this.stateMap.get(serviceName) || CircuitState.CLOSED;

    if (currentState === CircuitState.OPEN) {
      const trippedAt = this.lastStateChange.get(serviceName) || 0;
      if (Date.now() - trippedAt >= this.coolDownDurationMs) {
        this.logger.log(`Circuit for ${serviceName} cooling down: transitioning OPEN -> HALF_OPEN`);
        this.stateMap.set(serviceName, CircuitState.HALF_OPEN);
        this.lastStateChange.set(serviceName, Date.now());
        return CircuitState.HALF_OPEN;
      }
    }

    return currentState;
  }

  public recordSuccess(serviceName: string): void {
    this.addRecord(serviceName, true);
    const currentState = this.stateMap.get(serviceName) || CircuitState.CLOSED;

    if (currentState === CircuitState.HALF_OPEN) {
      this.logger.log(`Probe call succeeded for ${serviceName}: transitioning HALF_OPEN -> CLOSED`);
      this.stateMap.set(serviceName, CircuitState.CLOSED);
      this.lastStateChange.set(serviceName, Date.now());
      this.callHistory.set(serviceName, []);
    }
  }

  public recordFailure(serviceName: string): void {
    this.addRecord(serviceName, false);
    const currentState = this.stateMap.get(serviceName) || CircuitState.CLOSED;

    if (currentState === CircuitState.HALF_OPEN) {
      this.logger.warn(`Probe call failed for ${serviceName}: re-tripping HALF_OPEN -> OPEN`);
      this.stateMap.set(serviceName, CircuitState.OPEN);
      this.lastStateChange.set(serviceName, Date.now());
      return;
    }

    if (currentState === CircuitState.CLOSED) {
      this.evaluateFailureThreshold(serviceName);
    }
  }

  private addRecord(serviceName: string, success: boolean): void {
    const now = Date.now();
    const records = (this.callHistory.get(serviceName) || []).filter(
      r => now - r.timestamp <= this.windowDurationMs,
    );
    records.push({ timestamp: now, success });
    this.callHistory.set(serviceName, records);
  }

  private evaluateFailureThreshold(serviceName: string): void {
    const records = this.callHistory.get(serviceName) || [];
    if (records.length < this.minCallsThreshold) return;

    const failures = records.filter(r => !r.success).length;
    const failureRate = (failures / records.length) * 100;

    if (failureRate >= this.failureThresholdPercent) {
      this.logger.error(
        `Circuit tripped for ${serviceName}! Failure rate: ${failureRate.toFixed(1)}% (Threshold: ${
          this.failureThresholdPercent
        }%). Transitioning CLOSED -> OPEN.`,
      );
      this.stateMap.set(serviceName, CircuitState.OPEN);
      this.lastStateChange.set(serviceName, Date.now());
    }
  }

  public reset(serviceName?: string): void {
    if (serviceName) {
      this.stateMap.delete(serviceName);
      this.callHistory.delete(serviceName);
      this.lastStateChange.delete(serviceName);
    } else {
      this.stateMap.clear();
      this.callHistory.clear();
      this.lastStateChange.clear();
    }
  }
}
