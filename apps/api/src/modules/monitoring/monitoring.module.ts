// Explore Bharat Safar — Enterprise Monitoring & Observability Module
// Reference: EBS-TDR-51-TECHSTACK Section 37
// Sprint 11: Enterprise Observability & Production Optimization

import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MonitoringController } from './monitoring.controller';
import { MonitoringService } from './monitoring.service';
import { PerformanceTimingInterceptor } from './monitoring.interceptor';

@Module({
  controllers: [MonitoringController],
  providers: [
    MonitoringService,
    {
      provide: APP_INTERCEPTOR,
      useClass: PerformanceTimingInterceptor,
    },
  ],
  exports: [MonitoringService],
})
export class MonitoringModule {}
