// Explore Bharat Safar — Multi-Factor Search Ranking & Scoring Engine
// Reference: EBS-DOC-18-SEARCH Section 2.1 (Trigram + Spatial Proximity Decay)
// Sprint 11: Enterprise Search Optimization

import { TypoToleranceEngine } from './typo-tolerance.engine';

export interface ScoreParameters {
  query: string;
  candidateTitle: string;
  candidateCategory?: string;
  distanceKm?: number;
  popularityScore?: number; // e.g. booking count, follower count, or rating
}

export class RankingScoringEngine {
  /**
   * Computes multi-factor rank score based on text relevance + spatial decay boost
   * Formula: Final = Similarity(q, name) + [ 1 / (1 + ln(1 + distKm)) * 0.25 ]
   */
  static calculateScore(params: ScoreParameters): number {
    const { query, candidateTitle, candidateCategory, distanceKm, popularityScore = 0 } = params;
    const q = query.toLowerCase().trim();
    const title = candidateTitle.toLowerCase().trim();

    // 1. Text Similarity Score
    let textScore = 0;
    if (title === q) {
      textScore = 1.0;
    } else if (title.startsWith(q)) {
      textScore = 0.85;
    } else if (title.includes(q)) {
      textScore = 0.7;
    } else {
      textScore = TypoToleranceEngine.computeSimilarityScore(q, title) * 0.65;
    }

    // 2. Category Relevance Boost
    if (candidateCategory && q.includes(candidateCategory.toLowerCase())) {
      textScore = Math.min(1.0, textScore + 0.1);
    }

    // 3. Spatial Proximity Logarithmic Decay Boost (EBS-DOC-18-SEARCH Section 2.1)
    let spatialBoost = 0;
    if (distanceKm !== undefined && distanceKm >= 0) {
      // Proximity boost capped within 500km
      const decay = 1 / (1 + Math.log(1 + distanceKm));
      spatialBoost = decay * 0.25;
    }

    // 4. Popularity / Quality Normalization (capped at 0.1)
    const popBoost = Math.min(0.1, (popularityScore / 1000) * 0.1);

    const finalScore = textScore + spatialBoost + popBoost;
    return Math.round(finalScore * 1000) / 1000;
  }

  /**
   * Sorts array of search results in descending rank order
   */
  static rankResults<T extends { score: number }>(results: T[]): T[] {
    return results.sort((a, b) => b.score - a.score);
  }
}
