// Explore Bharat Safar — Search & Telemetry Validator Tests
// Reference: EBS-DOC-18-SEARCH, EBS-DOC-09-API
// Sprint 11: Search, SEO, Performance, Accessibility & Observability

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  GlobalSearchQuerySchema,
  AutocompleteQuerySchema,
  SearchSuggestionsQuerySchema,
  SearchAnalyticsEventSchema,
  SearchContext,
} from './search.schema';

describe('Search Validation Schemas — Sprint 11', () => {
  describe('GlobalSearchQuerySchema', () => {
    it('should validate standard global search query', () => {
      const input = {
        q: 'Raigad Fort',
        context: 'discovery',
        latitude: 18.2345,
        longitude: 73.4456,
        radiusKm: 50,
        page: 1,
        limit: 20,
      };

      const result = GlobalSearchQuerySchema.safeParse(input);
      assert.ok(result.success);
      if (result.success) {
        assert.equal(result.data.q, 'Raigad Fort');
        assert.equal(result.data.context, SearchContext.DISCOVERY);
        assert.equal(result.data.radiusKm, 50);
      }
    });

    it('should trim whitespace from query', () => {
      const input = { q: '   Kalsubai Peak   ' };
      const result = GlobalSearchQuerySchema.safeParse(input);
      assert.ok(result.success);
      if (result.success) {
        assert.equal(result.data.q, 'Kalsubai Peak');
        assert.equal(result.data.context, SearchContext.GLOBAL);
      }
    });

    it('should reject empty search query', () => {
      const input = { q: '   ' };
      const result = GlobalSearchQuerySchema.safeParse(input);
      assert.equal(result.success, false);
    });

    it('should reject query exceeding 100 characters', () => {
      const input = { q: 'a'.repeat(101) };
      const result = GlobalSearchQuerySchema.safeParse(input);
      assert.equal(result.success, false);
    });

    it('should validate cursor pagination parameters', () => {
      const input = {
        q: 'Village',
        context: 'villages',
        cursor: 'eyJsYXN0SWQiOiJ2aWxsYWdlLTEyMyJ9',
        limit: 15,
      };

      const result = GlobalSearchQuerySchema.safeParse(input);
      assert.ok(result.success);
      if (result.success) {
        assert.equal(result.data.cursor, 'eyJsYXN0SWQiOiJ2aWxsYWdlLTEyMyJ9');
        assert.equal(result.data.limit, 15);
      }
    });

    it('should parse boolean string conversions for typoTolerance and includeFacets', () => {
      const input = {
        q: 'Trek',
        typoTolerance: 'true',
        includeFacets: 'true',
      };

      const result = GlobalSearchQuerySchema.safeParse(input);
      assert.ok(result.success);
      if (result.success) {
        assert.equal(result.data.typoTolerance, true);
        assert.equal(result.data.includeFacets, true);
      }
    });
  });

  describe('AutocompleteQuerySchema', () => {
    it('should validate prefix query with limit', () => {
      const input = {
        q: 'Har',
        context: 'discovery',
        limit: 5,
      };

      const result = AutocompleteQuerySchema.safeParse(input);
      assert.ok(result.success);
      if (result.success) {
        assert.equal(result.data.q, 'Har');
        assert.equal(result.data.limit, 5);
      }
    });

    it('should reject empty prefix query', () => {
      const input = { q: '' };
      const result = AutocompleteQuerySchema.safeParse(input);
      assert.equal(result.success, false);
    });
  });

  describe('SearchSuggestionsQuerySchema', () => {
    it('should validate suggestion query', () => {
      const input = {
        q: 'Hrishchandragad',
        context: 'discovery',
      };

      const result = SearchSuggestionsQuerySchema.safeParse(input);
      assert.ok(result.success);
      if (result.success) {
        assert.equal(result.data.q, 'Hrishchandragad');
      }
    });
  });

  describe('SearchAnalyticsEventSchema', () => {
    it('should validate search analytics telemetry event', () => {
      const input = {
        query: 'Velhe',
        context: 'villages',
        hitsCount: 14,
        executionTimeMs: 42.5,
        clickedId: 'village-556789',
        clickedPosition: 1,
      };

      const result = SearchAnalyticsEventSchema.safeParse(input);
      assert.ok(result.success);
      if (result.success) {
        assert.equal(result.data.query, 'Velhe');
        assert.equal(result.data.hitsCount, 14);
        assert.equal(result.data.clickedId, 'village-556789');
      }
    });

    it('should reject negative execution time or hits count', () => {
      const input = {
        query: 'Test',
        context: 'discovery',
        hitsCount: -1,
        executionTimeMs: -5,
      };

      const result = SearchAnalyticsEventSchema.safeParse(input);
      assert.equal(result.success, false);
    });
  });
});
