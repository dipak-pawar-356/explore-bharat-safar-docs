// Explore Bharat Safar — Certificate Subsystem NestJS Module
// Reference: EBS-DOC-20-CERT, EBS-BLU-49-REPO

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CertificatesController } from './certificates.controller';
import { CertificatesService } from './certificates.service';
import { CertificateHasherService } from './certificate-hasher.service';
import { CertificateTemplateService } from './certificate-template.service';
import { CertificateEligibilityService } from './certificate-eligibility.service';
import { BookingCertificateBridgeService } from '../../common/services/booking-certificate-bridge.service';

@Module({
  imports: [ConfigModule],
  controllers: [CertificatesController],
  providers: [
    CertificatesService,
    CertificateHasherService,
    CertificateTemplateService,
    CertificateEligibilityService,
    BookingCertificateBridgeService,
  ],
  exports: [CertificatesService],
})
export class CertificatesModule {}
