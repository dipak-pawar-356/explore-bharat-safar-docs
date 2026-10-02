// Explore Bharat Safar — Admin Module
// Reference: EBS-DOC-13-ADMIN

import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminUsersService } from './services/admin-users.service';
import { AdminAuditService } from './services/admin-audit.service';
import { AdminSystemService } from './services/admin-system.service';
import { AdminModerationService } from './services/admin-moderation.service';

@Module({
  controllers: [AdminController],
  providers: [
    AdminService,
    AdminUsersService,
    AdminAuditService,
    AdminSystemService,
    AdminModerationService,
  ],
  exports: [AdminService, AdminAuditService],
})
export class AdminModule {}
