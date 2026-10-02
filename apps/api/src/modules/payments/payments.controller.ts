// Explore Bharat Safar — Section 4: Fintech & Payments API Gateway Controller
// Reference: EBS-DOC-21-PAYMENT, EBS-DOC-09-API Section 5.5, EBS-DOC-29-THIRD-PARTY

import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaymentGatewayProvider, UserRole, type User } from '@ebs/types';
import {
  CreatePaymentIntentDto,
  VerifyPaymentSignatureDto,
  ProcessRefundDto,
  UpdateSuperAdminPaymentControlsDto,
  PaymentHistoryQueryDto,
} from './dto/payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // =========================================================================
  // 1. PAYMENT INTENT & ORDER INITIATION
  // =========================================================================

  @UseGuards(JwtAuthGuard)
  @Post('intent')
  @HttpCode(HttpStatus.CREATED)
  async createPaymentIntent(
    @CurrentUser() user: User,
    @Body() dto: CreatePaymentIntentDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    const data = await this.paymentsService.createPaymentIntent(user.id, dto, idempotencyKey);
    return {
      status: 'success',
      data,
    };
  }

  // =========================================================================
  // 2. SIGNATURE VERIFICATION & CONFIRMATION
  // =========================================================================

  @UseGuards(JwtAuthGuard)
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifyPayment(@CurrentUser() user: User, @Body() dto: VerifyPaymentSignatureDto) {
    const data = await this.paymentsService.verifyPayment(user.id, dto);
    return {
      status: 'success',
      data,
    };
  }

  // =========================================================================
  // 3. SECURE WEBHOOK CALLBACK (HMAC-SHA256 PROTECTED)
  // =========================================================================

  @Public()
  @Post('webhook/:provider')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Param('provider') provider: PaymentGatewayProvider,
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Req() req: FastifyRequest,
  ) {
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    const data = await this.paymentsService.handleWebhook(provider, headers, rawBody);
    return {
      status: 'success',
      data,
    };
  }

  // =========================================================================
  // 4. REFUND & CANCELLATION ENGINE
  // =========================================================================

  @UseGuards(JwtAuthGuard)
  @Post('refund')
  @HttpCode(HttpStatus.OK)
  async processRefund(@CurrentUser() user: User, @Body() dto: ProcessRefundDto) {
    const data = await this.paymentsService.processCancellationRefund(user.id, user.roles, dto);
    return {
      status: 'success',
      data,
    };
  }

  // =========================================================================
  // 5. INVOICE VAULT & TAX RECEIPTS
  // =========================================================================

  @UseGuards(JwtAuthGuard)
  @Get('invoices/:bookingId')
  async getInvoice(@CurrentUser() user: User, @Param('bookingId') bookingId: string) {
    const data = await this.paymentsService.getInvoiceByBooking(bookingId, user.id, user.roles);
    return {
      status: 'success',
      data,
    };
  }

  // =========================================================================
  // 6. TRAVELLER TRANSACTION HISTORY
  // =========================================================================

  @UseGuards(JwtAuthGuard)
  @Get('history')
  async getPaymentHistory(@CurrentUser() user: User) {
    const data = await this.paymentsService.getTravellerTransactions(user.id);
    return {
      status: 'success',
      data,
    };
  }

  // =========================================================================
  // 7. FINANCIAL ADMIN LEDGER & AUDIT
  // =========================================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.FINANCE_ADMIN, UserRole.SYSTEM_ADMIN)
  @Get('admin/ledger')
  async getAdminLedger(@Query() query: PaymentHistoryQueryDto) {
    const data = this.paymentsService.getAdminLedger(query);
    return {
      status: 'success',
      data,
    };
  }

  // =========================================================================
  // 8. SUPER ADMIN PAYMENT CONTROLS
  // =========================================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get('admin/controls')
  async getPaymentControls() {
    const data = this.paymentsService.getPaymentControls();
    return {
      status: 'success',
      data,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Put('admin/controls')
  async updatePaymentControls(@Body() dto: UpdateSuperAdminPaymentControlsDto) {
    const data = this.paymentsService.updatePaymentControls(dto);
    return {
      status: 'success',
      data,
    };
  }
}
