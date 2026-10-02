// Explore Bharat Safar — Enterprise Search Controller
// Reference: EBS-DOC-18-SEARCH, EBS-DOC-09-API Section 5.1
// Sprint 11: Enterprise Search Optimization

import { Controller, Get, Post, Query, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SearchService } from './search.service';
import {
  GlobalSearchDto,
  AutocompleteDto,
  SearchSuggestionsDto,
  SearchAnalyticsDto,
} from './dto/search.dto';
import { ISearchResultItem, ISearchResponse, IAutocompleteItem } from '@ebs/types';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  /**
   * Universal Enterprise Search with Ingress Domain Context Isolation
   * GET /api/v1/search?q=raigad&context=discovery
   */
  @Get()
  @ApiOperation({ summary: 'Execute enterprise search across isolated domain sub-engines' })
  @ApiResponse({
    status: 200,
    description: 'Search results matching criteria with relevance scores',
  })
  async search(@Query() dto: GlobalSearchDto): Promise<ISearchResponse<ISearchResultItem>> {
    return this.searchService.search(dto);
  }

  /**
   * Fast Prefix Autocomplete (<50ms target)
   * GET /api/v1/search/autocomplete?q=har&limit=5
   */
  @Get('autocomplete')
  @ApiOperation({ summary: 'Instant prefix typeahead autocomplete suggestions' })
  @ApiResponse({ status: 200, description: 'List of matching typeahead entities' })
  async autocomplete(@Query() dto: AutocompleteDto): Promise<IAutocompleteItem[]> {
    return this.searchService.autocomplete(dto);
  }

  /**
   * "Did you mean?" Typo Suggestions
   * GET /api/v1/search/suggestions?q=Hrishchandragad
   */
  @Get('suggestions')
  @ApiOperation({ summary: 'Retrieve typo-tolerant search suggestions' })
  @ApiResponse({ status: 200, description: 'Corrected query suggestion if applicable' })
  async getSuggestions(
    @Query() dto: SearchSuggestionsDto,
  ): Promise<{ query: string; suggestion: string | null }> {
    return this.searchService.getSuggestions(dto);
  }

  /**
   * Ingest Search Telemetry & Analytics
   * POST /api/v1/search/analytics
   */
  @Post('analytics')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Record client search interaction telemetry' })
  @ApiResponse({ status: 200, description: 'Telemetry recorded successfully' })
  async recordAnalytics(@Body() event: SearchAnalyticsDto): Promise<{ success: boolean }> {
    return this.searchService.recordAnalytics(event);
  }
}
