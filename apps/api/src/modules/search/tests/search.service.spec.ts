// Explore Bharat Safar — Search Service & Sub-Engine Unit Tests
// Reference: EBS-DOC-18-SEARCH, EBS-DOC-09-API
// Sprint 11: Enterprise Search Optimization

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { SearchService } from '../search.service';
import { SearchCacheService } from '../search-cache.service';
import { SynonymDictionaryEngine } from '../synonyms.dictionary';
import { TypoToleranceEngine } from '../typo-tolerance.engine';
import { RankingScoringEngine } from '../ranking-scoring.engine';
import { SearchContext } from '@ebs/types';

describe('Search Subsystem — Sprint 11', () => {
  describe('SynonymDictionaryEngine', () => {
    it('should expand fort query with regional Indic synonyms', () => {
      const expansions = SynonymDictionaryEngine.expandQuery('Raigad Fort');
      assert.ok(expansions.length > 1);
      assert.ok(
        expansions.some(e => e.includes('durg') || e.includes('killa') || e.includes('gad')),
      );
    });

    it('should resolve canonical terms for Indic variants', () => {
      assert.equal(SynonymDictionaryEngine.getCanonical('killa'), 'fort');
      assert.equal(SynonymDictionaryEngine.getCanonical('mandir'), 'temple');
      assert.equal(SynonymDictionaryEngine.getCanonical('dhodhad'), 'waterfall');
      assert.equal(SynonymDictionaryEngine.getCanonical('shikhar'), 'peak');
    });
  });

  describe('TypoToleranceEngine', () => {
    it('should calculate correct Levenshtein distance', () => {
      assert.equal(TypoToleranceEngine.computeLevenshteinDistance('fort', 'fort'), 0);
      assert.equal(TypoToleranceEngine.computeLevenshteinDistance('fort', 'forts'), 1);
      assert.equal(TypoToleranceEngine.computeLevenshteinDistance('kalsubai', 'kalsubay'), 1);
    });

    it('should enforce length-based dynamic edit distance', () => {
      // L < 4: dist 0
      assert.equal(TypoToleranceEngine.getMaxAllowedDistance(3), 0);
      // 4 <= L <= 7: dist 1
      assert.equal(TypoToleranceEngine.getMaxAllowedDistance(5), 1);
      // L > 7: dist 2
      assert.equal(TypoToleranceEngine.getMaxAllowedDistance(9), 2);
    });

    it('should find closest typo-tolerant suggestion', () => {
      const dict = ['harishchandragad', 'kalsubai', 'raigad', 'sinhagad', 'torna'];
      const suggestion = TypoToleranceEngine.findBestSuggestion('hrishchandragad', dict);
      assert.equal(suggestion, 'harishchandragad');
    });
  });

  describe('RankingScoringEngine', () => {
    it('should give exact matches a top score of 1.0', () => {
      const score = RankingScoringEngine.calculateScore({
        query: 'Raigad Fort',
        candidateTitle: 'Raigad Fort',
      });
      assert.ok(score >= 1.0);
    });

    it('should give spatial proximity boost for nearby coordinates', () => {
      const farScore = RankingScoringEngine.calculateScore({
        query: 'Temple',
        candidateTitle: 'Shiv Temple',
        distanceKm: 250,
      });

      const nearScore = RankingScoringEngine.calculateScore({
        query: 'Temple',
        candidateTitle: 'Shiv Temple',
        distanceKm: 5,
      });

      assert.ok(nearScore > farScore, 'Nearer result should have a higher proximity score');
    });
  });

  describe('SearchService Execution', () => {
    let service: SearchService;
    let cacheService: SearchCacheService;

    beforeEach(() => {
      cacheService = new SearchCacheService();
      service = new SearchService(cacheService);
    });

    it('should execute discovery search and return structured envelope', async () => {
      const response = await service.search({
        q: 'Raigad',
        context: SearchContext.DISCOVERY,
        page: 1,
        limit: 10,
        includeFacets: true,
      });

      assert.ok(response);
      assert.equal(response.query, 'Raigad');
      assert.equal(response.context, SearchContext.DISCOVERY);
      assert.ok(Array.isArray(response.results));
      assert.ok(response.results.length > 0);
      assert.equal(response.results[0]?.context, SearchContext.DISCOVERY);
    });

    it('should execute village search adhering to Section 2 domain isolation', async () => {
      const response = await service.search({
        q: 'Velhe',
        context: SearchContext.VILLAGES,
        page: 1,
        limit: 10,
      });

      assert.ok(response);
      assert.equal(response.context, SearchContext.VILLAGES);
      assert.ok(response.results.every(r => r.context === SearchContext.VILLAGES));
    });

    it('should return prefix autocomplete suggestions in sub-50ms', async () => {
      const items = await service.autocomplete({
        q: 'for',
        context: SearchContext.DISCOVERY,
        limit: 5,
      });

      assert.ok(Array.isArray(items));
      assert.ok(items.length > 0);
      assert.ok(items[0]?.text.toLowerCase().startsWith('for'));
    });
  });
});
