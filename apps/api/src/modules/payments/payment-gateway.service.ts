// Explore Bharat Safar — Section 4: Payment Gateway Orchestrator & Circuit Breaker
// Reference: EBS-DOC-21-PAYMENT, EBS-DOC-29-THIRD-PARTY, EBS-BLU-40-SECURITY

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import {
  PaymentGatewayProvider,
  type PaymentIntentRequest,
  type PaymentIntentResponse,
  type SuperAdminPaymentControlsDto,
  type SuperAdminPaymentControlsEntity,
} from '@ebs/types';
import type { IPaymentGatewayAdapter } from './payment-gateway.interface';
import { RazorpayAdapter } from './adapters/razorpay.adapter';
import { CashfreeAdapter } from './adapters/cashfree.adapter';
import { MockGatewayAdapter } from './adapters/mock-gateway.adapter';

@Injectable()
export class PaymentGatewayService {
  private readonly logger = new Logger(PaymentGatewayService.name);
  private readonly adapters = new Map<PaymentGatewayProvider, IPaymentGatewayAdapter>();

  // Gateway health & circuit breaker state
  private readonly failureCounters = new Map<PaymentGatewayProvider, number>();
  private readonly failureThreshold = 3;
  private readonly circuitOpenUntil = new Map<PaymentGatewayProvider, number>();
  private readonly circuitCooldownMs = 60 * 1000; // 1 minute cooldown

  // Super Admin Configuration
  private config: SuperAdminPaymentControlsEntity = {
    id: 'global-payment-config-001',
    primaryGateway: PaymentGatewayProvider.RAZORPAY,
    defaultAdvancePercentage: 20,
    isFailoverEnabled: true,
    autoRefundThresholdInr: 50000,
    updatedAt: new Date().toISOString(),
  };

  constructor(
    private readonly razorpayAdapter: RazorpayAdapter,
    private readonly cashfreeAdapter: CashfreeAdapter,
    private readonly mockAdapter: MockGatewayAdapter,
  ) {
    this.adapters.set(PaymentGatewayProvider.RAZORPAY, this.razorpayAdapter);
    this.adapters.set(PaymentGatewayProvider.CASHFREE, this.cashfreeAdapter);
    this.adapters.set(PaymentGatewayProvider.MOCK_SANDBOX, this.mockAdapter);
  }

  /**
   * Retrieves active payment gateway controls configuration.
   */
  getConfig(): SuperAdminPaymentControlsEntity {
    return { ...this.config };
  }

  /**
   * Updates global payment configuration (Super Admin only).
   */
  updateConfig(dto: SuperAdminPaymentControlsDto): SuperAdminPaymentControlsEntity {
    if (dto.defaultAdvancePercentage < 10 || dto.defaultAdvancePercentage > 100) {
      throw new BadRequestException('Advance deposit percentage must be between 10% and 100%.');
    }

    this.config = {
      ...this.config,
      primaryGateway: dto.primaryGateway,
      defaultAdvancePercentage: dto.defaultAdvancePercentage,
      isFailoverEnabled: dto.isFailoverEnabled,
      autoRefundThresholdInr: dto.autoRefundThresholdInr,
      updatedAt: new Date().toISOString(),
    };

    this.logger.log(
      `Payment config updated: Primary=${this.config.primaryGateway}, Advance=${this.config.defaultAdvancePercentage}%, Failover=${this.config.isFailoverEnabled}`,
    );

    return { ...this.config };
  }

  /**
   * Returns specific adapter or dynamically routes based on health and configuration.
   */
  getAdapter(provider?: PaymentGatewayProvider): IPaymentGatewayAdapter {
    const targetProvider = provider || this.config.primaryGateway;

    // Check circuit breaker status
    if (this.isCircuitOpen(targetProvider)) {
      this.logger.warn(`Circuit breaker OPEN for ${targetProvider}.`);
      if (this.config.isFailoverEnabled) {
        const fallback = this.getFallbackProvider(targetProvider);
        this.logger.warn(`Failing over to ${fallback}`);
        const fallbackAdapter = this.adapters.get(fallback);
        if (fallbackAdapter) return fallbackAdapter;
      }
    }

    const adapter = this.adapters.get(targetProvider);
    if (!adapter) {
      throw new BadRequestException(`Unsupported payment gateway provider: ${targetProvider}`);
    }
    return adapter;
  }

  /**
   * Executes order creation with automatic fallback orchestration upon provider error.
   */
  async createOrderWithOrchestration(
    request: PaymentIntentRequest,
  ): Promise<PaymentIntentResponse> {
    const primaryProvider = request.gatewayProvider || this.config.primaryGateway;

    try {
      const adapter = this.getAdapter(primaryProvider);
      const response = await adapter.createOrder(request);
      this.recordSuccess(adapter.provider);
      return response;
    } catch (primaryError) {
      this.logger.error(
        `Failed to create order on primary provider ${primaryProvider}: ${primaryError}`,
      );
      this.recordFailure(primaryProvider);

      if (this.config.isFailoverEnabled) {
        const fallbackProvider = this.getFallbackProvider(primaryProvider);
        this.logger.warn(`Attempting failover order creation with ${fallbackProvider}...`);
        try {
          const fallbackAdapter = this.adapters.get(fallbackProvider);
          if (!fallbackAdapter) {
            throw new Error(`Fallback adapter for ${fallbackProvider} not registered.`);
          }
          const response = await fallbackAdapter.createOrder({
            ...request,
            gatewayProvider: fallbackProvider,
          });
          this.recordSuccess(fallbackProvider);
          return response;
        } catch (fallbackError) {
          this.logger.error(`Fallback provider ${fallbackProvider} also failed: ${fallbackError}`);
          throw new BadRequestException(
            'Payment gateway temporarily unavailable. Please try again.',
          );
        }
      }

      throw primaryError;
    }
  }

  recordFailure(provider: PaymentGatewayProvider): void {
    const count = (this.failureCounters.get(provider) || 0) + 1;
    this.failureCounters.set(provider, count);

    if (count >= this.failureThreshold) {
      const openUntil = Date.now() + this.circuitCooldownMs;
      this.circuitOpenUntil.set(provider, openUntil);
      this.logger.error(
        `Circuit opened for ${provider} after ${count} consecutive failures. Will retry after ${new Date(openUntil).toISOString()}`,
      );
    }
  }

  recordSuccess(provider: PaymentGatewayProvider): void {
    this.failureCounters.set(provider, 0);
    this.circuitOpenUntil.delete(provider);
  }

  private isCircuitOpen(provider: PaymentGatewayProvider): boolean {
    const openUntil = this.circuitOpenUntil.get(provider);
    if (!openUntil) return false;

    if (Date.now() > openUntil) {
      // Cooldown expired, half-open
      this.circuitOpenUntil.delete(provider);
      this.failureCounters.set(provider, 0);
      return false;
    }
    return true;
  }

  private getFallbackProvider(primary: PaymentGatewayProvider): PaymentGatewayProvider {
    if (primary === PaymentGatewayProvider.RAZORPAY) {
      return PaymentGatewayProvider.CASHFREE;
    }
    if (primary === PaymentGatewayProvider.CASHFREE) {
      return PaymentGatewayProvider.RAZORPAY;
    }
    return PaymentGatewayProvider.MOCK_SANDBOX;
  }
}
