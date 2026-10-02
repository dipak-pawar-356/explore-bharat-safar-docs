// Explore Bharat Safar — Admin Controller
// Reference: EBS-DOC-13-ADMIN, EBS-DOC-09-API Section 5.7

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { AdminService } from './admin.service';
import { AdminUsersService } from './services/admin-users.service';
import { AdminAuditService } from './services/admin-audit.service';
import { AdminSystemService } from './services/admin-system.service';
import { AdminModerationService } from './services/admin-moderation.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@ebs/types';
import {
  UpdateUserRolesDto,
  UpdateUserStatusDto,
  ToggleFeatureFlagDto,
  UpdateNavigationTreeDto,
  UpdateGlobalPaymentPercentageDto,
  AdminModerationActionDto,
  AuditLogQueryDto,
  GenerateReportDto,
  UserManagementFilterDto,
} from './dto/admin.dto';
import type { NavigationTree } from '@ebs/types';

type AuthenticatedRequest = FastifyRequest & {
  user: {
    sub: string;
    email: string;
    roles: UserRole[];
  };
};

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly adminUsersService: AdminUsersService,
    private readonly adminAuditService: AdminAuditService,
    private readonly adminSystemService: AdminSystemService,
    private readonly adminModerationService: AdminModerationService,
  ) {}

  // =========================================================================
  // METRICS & DASHBOARD (Section 5.7 — EBS-DOC-09-API)
  // =========================================================================

  /**
   * GET /api/v1/admin/metrics/overview
   * Real-time platform pulse for Super Admin, Finance Admin, and Booking Admin.
   */
  @Get('metrics/overview')
  @Roles(UserRole.SUPER_ADMIN, UserRole.FINANCE_ADMIN, UserRole.BOOKING_ADMIN)
  async getMetricsOverview() {
    return this.adminService.getMetricsOverview();
  }

  /**
   * GET /api/v1/admin/dashboard/stats
   * Comprehensive admin dashboard statistics (all KPI categories).
   */
  @Get('dashboard/stats')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN)
  async getDashboardStats() {
    return this.adminSystemService.getDashboardStats();
  }

  // =========================================================================
  // USER MANAGEMENT (EBS-DOC-13-ADMIN Section 2)
  // =========================================================================

  /**
   * GET /api/v1/admin/users
   * Paginated list of all platform users with role/status filtering.
   */
  @Get('users')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN)
  async listUsers(@Query() filter: UserManagementFilterDto) {
    return this.adminUsersService.listUsers(filter);
  }

  /**
   * GET /api/v1/admin/users/:id
   * Retrieve a single user's full admin profile.
   */
  @Get('users/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN)
  async getUserById(@Param('id') id: string) {
    return this.adminUsersService.getUserById(id);
  }

  /**
   * PATCH /api/v1/admin/users/:id/roles
   * Assign or reassign roles to a user.
   * Business Rule: Only SUPER_ADMIN may grant the SUPER_ADMIN role.
   */
  @Patch('users/:id/roles')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN)
  async updateUserRoles(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateUserRolesDto,
  ) {
    return this.adminUsersService.updateUserRoles(req.user.roles, id, dto);
  }

  /**
   * PATCH /api/v1/admin/users/:id/status
   * Change account status (ACTIVE, SUSPENDED, LOCKED).
   */
  @Patch('users/:id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN)
  async updateUserStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto) {
    return this.adminUsersService.updateUserStatus(id, dto);
  }

  /**
   * DELETE /api/v1/admin/users/:id
   * Soft-delete a user account. Cannot delete the last SUPER_ADMIN.
   */
  @Delete('users/:id')
  @Roles(UserRole.SUPER_ADMIN)
  async deleteUser(@Param('id') id: string) {
    return this.adminUsersService.softDeleteUser(id);
  }

  // =========================================================================
  // SYSTEM CONFIGURATION & FEATURE FLAGS
  // =========================================================================

  /**
   * GET /api/v1/admin/system/health
   * Real-time platform health check across all critical services.
   */
  @Get('system/health')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN)
  async getSystemHealth() {
    return this.adminSystemService.getSystemHealth();
  }

  /**
   * GET /api/v1/admin/system/feature-flags
   * Retrieve all feature flags from system config store.
   */
  @Get('system/feature-flags')
  @Roles(UserRole.SUPER_ADMIN)
  async getFeatureFlags() {
    return this.adminSystemService.getFeatureFlags();
  }

  /**
   * PATCH /api/v1/admin/system/feature-flags/:key
   * Toggle a feature flag on or off. Only SUPER_ADMIN allowed.
   */
  @Patch('system/feature-flags/:key')
  @Roles(UserRole.SUPER_ADMIN)
  async toggleFeatureFlag(@Param('key') key: string, @Body() dto: ToggleFeatureFlagDto) {
    return this.adminSystemService.toggleFeatureFlag(key, dto);
  }

  // =========================================================================
  // NAVIGATION TREE (EBS-DOC-13-ADMIN Section 3.1)
  // =========================================================================

  /**
   * GET /api/v1/admin/config/navigation-tree
   * Retrieve the current dynamic navigation tree configuration.
   */
  @Get('config/navigation-tree')
  @Roles(UserRole.SUPER_ADMIN)
  async getNavigationTree() {
    return this.adminSystemService.getNavigationTree();
  }

  /**
   * PUT /api/v1/admin/config/navigation-tree
   * Reorder, rename, or toggle visibility of navigation sections.
   * Per EBS-DOC-09-API Section 5.7 — no code deployment required.
   */
  @Put('config/navigation-tree')
  @Roles(UserRole.SUPER_ADMIN)
  async updateNavigationTree(
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdateNavigationTreeDto,
  ) {
    return this.adminSystemService.updateNavigationTree(
      dto as unknown as NavigationTree,
      req.user.sub,
    );
  }

  // =========================================================================
  // PAYMENT CONFIGURATION (EBS-DOC-13-ADMIN Section 3.2)
  // =========================================================================

  /**
   * PATCH /api/v1/admin/config/payment-percentage
   * Set global mandatory upfront deposit percentage (10%–100%).
   */
  @Patch('config/payment-percentage')
  @Roles(UserRole.SUPER_ADMIN)
  async updateGlobalPaymentPercentage(@Body() dto: UpdateGlobalPaymentPercentageDto) {
    return this.adminSystemService.updateGlobalPaymentPercentage(dto.percentage, dto.reason);
  }

  /**
   * PATCH /api/v1/admin/places/:placeId/toggle-booking
   * Enable or disable "Book Now" CTA on a specific Place.
   * Per EBS-DOC-13-ADMIN Section 3.3.
   */
  @Patch('places/:placeId/toggle-booking')
  @Roles(UserRole.SUPER_ADMIN)
  async togglePlaceBooking(
    @Param('placeId') placeId: string,
    @Body() body: { enabled: boolean; experienceId?: string },
  ) {
    return this.adminService.togglePlaceBooking(placeId, body.enabled, body.experienceId);
  }

  /**
   * PATCH /api/v1/admin/experiences/:id/upfront-percentage
   * Override the upfront percentage for a specific experience.
   */
  @Patch('experiences/:id/upfront-percentage')
  @Roles(UserRole.SUPER_ADMIN)
  async updateExperienceUpfrontPercentage(
    @Param('id') id: string,
    @Body() body: { percentage: number },
  ) {
    return this.adminService.updateUpfrontPercentage(id, body.percentage);
  }

  // =========================================================================
  // AUDIT LOGS (EBS-DOC-13-ADMIN Section 1.1)
  // =========================================================================

  /**
   * GET /api/v1/admin/audit-logs
   * Paginated, filtered master audit log. Only SUPER_ADMIN.
   */
  @Get('audit-logs')
  @Roles(UserRole.SUPER_ADMIN)
  async getAuditLogs(@Query() query: AuditLogQueryDto) {
    return this.adminAuditService.getAuditLogs(query);
  }

  /**
   * GET /api/v1/admin/audit-logs/summary
   * Summary statistics of audit activity for the KPI dashboard.
   */
  @Get('audit-logs/summary')
  @Roles(UserRole.SUPER_ADMIN)
  async getAuditSummary() {
    return this.adminAuditService.getAuditSummary();
  }

  // =========================================================================
  // CONTENT MODERATION (EBS-DOC-13-ADMIN Section 2 — Social Post Moderation)
  // =========================================================================

  /**
   * GET /api/v1/admin/moderation/queue
   * Paginated content moderation queue (posts, stories, communities).
   */
  @Get('moderation/queue')
  @Roles(UserRole.SUPER_ADMIN, UserRole.MODERATOR, UserRole.SYSTEM_ADMIN)
  async getModerationQueue(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('type') type: string,
    @Query('status') status: string,
  ) {
    return this.adminModerationService.getModerationQueue(
      Number(page) || 1,
      Number(limit) || 20,
      type as Parameters<typeof this.adminModerationService.getModerationQueue>[2],
      status as Parameters<typeof this.adminModerationService.getModerationQueue>[3],
    );
  }

  /**
   * PATCH /api/v1/admin/moderation/queue/:id
   * Apply moderation decision (APPROVE, REJECT, REMOVE, ESCALATE).
   */
  @Patch('moderation/queue/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.MODERATOR)
  async applyModerationDecision(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: AdminModerationActionDto,
  ) {
    return this.adminModerationService.applyModerationDecision(req.user.sub, id, dto);
  }

  // =========================================================================
  // REPORT GENERATION
  // =========================================================================

  /**
   * POST /api/v1/admin/reports/generate
   * Enqueue an async report generation job (CSV, PDF, JSON, XLSX).
   */
  @Post('reports/generate')
  @Roles(UserRole.SUPER_ADMIN, UserRole.FINANCE_ADMIN, UserRole.BOOKING_ADMIN)
  async generateReport(@Request() req: AuthenticatedRequest, @Body() dto: GenerateReportDto) {
    return this.adminSystemService.generateReport(req.user.sub, dto);
  }
}
