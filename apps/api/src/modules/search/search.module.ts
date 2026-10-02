// Explore Bharat Safar — Enterprise Search Module
// Reference: EBS-DOC-18-SEARCH
// Sprint 11: Enterprise Search Optimization

import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { SearchCacheService } from './search-cache.service';

@Module({
  controllers: [SearchController],
  providers: [SearchService, SearchCacheService],
  exports: [SearchService, SearchCacheService],
})
export class SearchModule {}
