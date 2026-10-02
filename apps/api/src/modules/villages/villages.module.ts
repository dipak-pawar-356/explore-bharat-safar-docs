// Explore Bharat Safar — Section 2: Villages & Rural Knowledge Module
// Reference: EBS-BLU-42-VKS, EBS-DOC-03-ARCH, EBS-DOC-09-API

import { Module } from '@nestjs/common';
import { VillagesController } from './villages.controller';
import { VillagesService } from './villages.service';
import { AuditLogService } from '../../common/services/audit-log.service';

@Module({
  controllers: [VillagesController],
  providers: [VillagesService, AuditLogService],
  exports: [VillagesService],
})
export class VillagesModule {}
