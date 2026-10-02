// Explore Bharat Safar — Certificate Subsystem API Controller
// Reference: EBS-DOC-20-CERT, EBS-DOC-09-API Section 5.5

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Patch,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { CertificatesService } from './certificates.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, type User } from '@ebs/types';
import {
  GenerateCertificateDto,
  BatchFinalizeDto,
  RevokeCertificateDto,
  ReissueCertificateDto,
  CertificateSearchQueryDto,
  CertificateSuperAdminControlsDto,
} from './dto/certificate.dto';

@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  // =========================================================================
  // 1. PUBLIC VERIFICATION ENDPOINT (Zero Authentication Required)
  // =========================================================================

  @Public()
  @Get('verify/:certificateNumber')
  @HttpCode(HttpStatus.OK)
  async verifyCertificate(
    @Param('certificateNumber') certificateNumber: string,
    @Query('hash') hash?: string,
  ) {
    const result = await this.certificatesService.verifyPublicCertificate(certificateNumber, hash);
    return {
      status: 'success',
      data: result,
    };
  }

  // =========================================================================
  // 2. CERTIFICATE DOWNLOAD (Owner Traveller or Admin)
  // =========================================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id/download')
  async downloadCertificate(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Res() reply: FastifyReply,
  ) {
    const { buffer, filename } = await this.certificatesService.downloadCertificatePdf(
      id,
      user.id,
      user.roles,
    );

    reply.header('Content-Type', 'application/pdf');
    reply.header('Content-Disposition', `attachment; filename="${filename}"`);
    return reply.send(buffer);
  }

  // =========================================================================
  // 3. TRAVELLER CERTIFICATE DASHBOARD
  // =========================================================================

  @UseGuards(JwtAuthGuard)
  @Get('my-certificates')
  @HttpCode(HttpStatus.OK)
  async getMyCertificates(@CurrentUser() user: User) {
    const data = await this.certificatesService.getTravellerCertificates(user.id);
    return {
      status: 'success',
      data,
    };
  }

  // =========================================================================
  // 4. CERTIFICATE RECORD DETAILS
  // =========================================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getCertificateDetails(@CurrentUser() user: User, @Param('id') id: string) {
    const data = await this.certificatesService.getCertificate(id, user.id, user.roles);
    return {
      status: 'success',
      data,
    };
  }

  // =========================================================================
  // 5. ADMIN BATCH FINALIZATION & BULK ISSUANCE
  // =========================================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.BOOKING_ADMIN)
  @Post('admin/batch-finalize')
  @HttpCode(HttpStatus.OK)
  async finalizeBatch(@CurrentUser() user: User, @Body() dto: BatchFinalizeDto) {
    const data = await this.certificatesService.finalizeBatchAndMintCertificates(
      user.id,
      user.roles[0],
      dto,
    );
    return {
      status: 'success',
      data,
    };
  }

  // =========================================================================
  // 6. ADMIN SINGLE ISSUANCE
  // =========================================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.BOOKING_ADMIN)
  @Post('admin/generate')
  @HttpCode(HttpStatus.CREATED)
  async generateCertificate(@CurrentUser() user: User, @Body() dto: GenerateCertificateDto) {
    const data = await this.certificatesService.generateCertificate(user.id, user.roles, dto);
    return {
      status: 'success',
      data,
    };
  }

  // =========================================================================
  // 7. ADMIN SEARCH & FILTER
  // =========================================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.SYSTEM_ADMIN,
    UserRole.BOOKING_ADMIN,
    UserRole.FINANCE_ADMIN,
  )
  @Get('admin/search')
  @HttpCode(HttpStatus.OK)
  async searchCertificates(@Query() query: CertificateSearchQueryDto) {
    const data = await this.certificatesService.searchCertificates(query);
    return {
      status: 'success',
      data,
    };
  }

  // =========================================================================
  // 8. ADMIN REVOCATION
  // =========================================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.BOOKING_ADMIN)
  @Post('admin/revoke')
  @HttpCode(HttpStatus.OK)
  async revokeCertificate(@CurrentUser() user: User, @Body() dto: RevokeCertificateDto) {
    const data = await this.certificatesService.revokeCertificate(user.id, user.roles[0], dto);
    return {
      status: 'success',
      data,
    };
  }

  // =========================================================================
  // 9. ADMIN REISSUE
  // =========================================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.BOOKING_ADMIN)
  @Post('admin/reissue')
  @HttpCode(HttpStatus.OK)
  async reissueCertificate(@CurrentUser() user: User, @Body() dto: ReissueCertificateDto) {
    const data = await this.certificatesService.reissueCertificate(user.id, user.roles[0], dto);
    return {
      status: 'success',
      data,
    };
  }

  // =========================================================================
  // 10. AUDIT LOGS
  // =========================================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.BOOKING_ADMIN)
  @Get('admin/audit-logs')
  @HttpCode(HttpStatus.OK)
  async getAuditLogs(@Query('certificateId') certificateId?: string) {
    const data = this.certificatesService.getAuditLogs(certificateId);
    return {
      status: 'success',
      data,
    };
  }

  // =========================================================================
  // 11. SUPER ADMIN CONTROLS
  // =========================================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get('admin/controls')
  @HttpCode(HttpStatus.OK)
  async getControls() {
    const data = this.certificatesService.getControls();
    return {
      status: 'success',
      data,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Patch('admin/controls')
  @HttpCode(HttpStatus.OK)
  async updateControls(@Body() dto: CertificateSuperAdminControlsDto) {
    const data = this.certificatesService.updateControls(dto);
    return {
      status: 'success',
      data,
    };
  }
}
