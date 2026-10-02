// Explore Bharat Safar — Discovery Engine Module
// Reference: EBS-DOC-03-ARCH, EBS-DOC-09-API
import { Module } from '@nestjs/common';
import { DiscoveryController } from './discovery.controller';
import { DiscoveryService } from './discovery.service';
import { DiscoveryCacheService } from './discovery-cache.service';

@Module({
  controllers: [DiscoveryController],
  providers: [DiscoveryService, DiscoveryCacheService],
  exports: [DiscoveryService, DiscoveryCacheService],
})
export class DiscoveryModule {}
