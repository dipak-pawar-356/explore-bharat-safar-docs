// Explore Bharat Safar — Search Controller Unit Tests
// Reference: EBS-DOC-18-SEARCH, EBS-DOC-09-API
// Sprint 11: Enterprise Search Optimization

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { SearchController } from '../search.controller';
import { SearchService } from '../search.service';
import { SearchCacheService } from '../search-cache.service';
import { SearchContext } from '@ebs/types';

describe('SearchController — Sprint 11', () => {
  let controller: SearchController;
  let service: SearchService;
  let cacheService: SearchCacheService;

  beforeEach(() => {
    cacheService = new SearchCacheService();
    service = new SearchService(cacheService);
    controller = new SearchController(service);
  });

  it('should delegate search query to service', async () => {
    const res = await controller.search({
      q: 'Kalsubai',
      context: SearchContext.DISCOVERY,
      limit: 10,
    });

    assert.ok(res);
    assert.equal(res.query, 'Kalsubai');
    assert.equal(res.context, SearchContext.DISCOVERY);
    assert.ok(Array.isArray(res.results));
  });

  it('should delegate autocomplete query to service', async () => {
    const res = await controller.autocomplete({
      q: 'kal',
      context: SearchContext.DISCOVERY,
      limit: 5,
    });

    assert.ok(Array.isArray(res));
  });

  it('should delegate suggestions query to service', async () => {
    const res = await controller.getSuggestions({
      q: 'kalsubay',
      context: SearchContext.DISCOVERY,
    });

    assert.ok(res);
    assert.equal(res.query, 'kalsubay');
  });

  it('should record search analytics telemetry', async () => {
    const res = await controller.recordAnalytics({
      query: 'Raigad Fort',
      context: SearchContext.DISCOVERY,
      hitsCount: 15,
      executionTimeMs: 24,
      clickedId: 'place-raigad-1',
      clickedPosition: 1,
    });

    assert.deepEqual(res, { success: true });
  });
});
