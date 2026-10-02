// Explore Bharat Safar — Monitoring & Observability Unit Tests
// Reference: EBS-TDR-51-TECHSTACK Section 37, EBS-DOC-09-API
// Sprint 11: Enterprise Observability & Production Optimization

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import type { FastifyReply } from 'fastify';
import { MonitoringController } from '../monitoring.controller';
import { MonitoringService } from '../monitoring.service';

describe('MonitoringController & Service — Sprint 11', () => {
  let controller: MonitoringController;
  let service: MonitoringService;

  beforeEach(() => {
    service = new MonitoringService();
    controller = new MonitoringController(service);
  });

  it('should return deep subsystem health report', async () => {
    const report = await controller.getHealth();

    assert.ok(report);
    assert.ok(report.status === 'OPERATIONAL' || report.status === 'DEGRADED');
    assert.ok(report.subsystems.database);
    assert.ok(report.subsystems.redis);
    assert.ok(report.subsystems.memory);
    assert.ok(report.uptimeSeconds >= 0);
  });

  it('should export Prometheus format metrics', async () => {
    service.recordHttpRequest(200);
    service.recordSearchQuery();
    service.recordCacheHit();

    const mockReply = {
      header: () => {},
    } as unknown as FastifyReply;

    const metricsText = await controller.getMetrics(mockReply);

    assert.ok(metricsText.includes('ebs_uptime_seconds'));
    assert.ok(metricsText.includes('ebs_system_memory_bytes'));
    assert.ok(metricsText.includes('ebs_subsystem_up'));
    assert.ok(metricsText.includes('ebs_search_queries_total'));
  });

  it('should return telemetry overview for admin dashboard', async () => {
    const telemetry = await controller.getTelemetry();

    assert.ok(telemetry);
    assert.ok(telemetry.subsystems);
    assert.ok(telemetry.searchMetrics);
  });
});
