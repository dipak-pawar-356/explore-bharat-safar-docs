// Explore Bharat Safar — Deep Health Diagnostics & Prometheus Metrics Controller
// Reference: EBS-TDR-51-TECHSTACK Section 37, EBS-DOC-09-API
// Sprint 11: Enterprise Observability & Production Optimization

import { Controller, Get, Header, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { MonitoringService } from './monitoring.service';
import { ISystemHealthReport } from '@ebs/types';

@ApiTags('Observability & Health')
@Controller()
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  /**
   * Deep Subsystem Health Diagnostics Probes
   * GET /health & GET /api/v1/health
   */
  @Get('health')
  @ApiOperation({
    summary: 'Deep health diagnostic status of Postgres, PostGIS, Redis, and workers',
  })
  @ApiResponse({ status: 200, description: 'Subsystem health diagnostics report' })
  async getHealth(): Promise<ISystemHealthReport> {
    return this.monitoringService.getHealthReport();
  }

  /**
   * Standard Prometheus Exposition Metrics Format
   * GET /metrics & GET /api/v1/metrics
   */
  @Get('metrics')
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  @ApiOperation({ summary: 'Prometheus metrics exporter for Grafana & Datadog' })
  @ApiResponse({ status: 200, description: 'Raw Prometheus metrics exposition text' })
  async getMetrics(@Res({ passthrough: true }) res: FastifyReply): Promise<string> {
    if (res && typeof res.header === 'function') {
      res.header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    }
    return this.monitoringService.getPrometheusMetrics();
  }

  /**
   * Real-time Administrative Performance & Telemetry Dashboard
   * GET /api/v1/monitoring/telemetry
   */
  @Get('monitoring/telemetry')
  @ApiOperation({ summary: 'Real-time performance metrics and subsystem states for admin console' })
  @ApiResponse({ status: 200, description: 'System performance summary object' })
  async getTelemetry(): Promise<Record<string, unknown>> {
    return this.monitoringService.getTelemetryOverview();
  }
}
