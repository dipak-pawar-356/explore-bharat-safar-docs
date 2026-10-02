// Explore Bharat Safar — Typo Tolerance & Fuzzy Search Matching Engine
// Reference: EBS-DOC-18-SEARCH Section 4 (Dynamic Levenshtein Rules)
// Sprint 11: Enterprise Search Optimization

export class TypoToleranceEngine {
  /**
   * Determine allowed Levenshtein edit distance dynamically based on token length (EBS-DOC-18-SEARCH Sec 4)
   * L < 4: Distance = 0 (exact prefix only)
   * 4 <= L <= 7: Distance = 1 (single-character typo)
   * L > 7: Distance = 2
   */
  static getMaxAllowedDistance(tokenLength: number): number {
    if (tokenLength < 4) return 0;
    if (tokenLength <= 7) return 1;
    return 2;
  }

  /**
   * Normalizes regional scripts and diacritics into standard UTF-8 NFC format
   */
  static normalizeText(text: string): string {
    return text.normalize('NFC').trim().toLowerCase();
  }

  /**
   * Calculates Levenshtein edit distance between two strings
   */
  static computeLevenshteinDistance(a: string, b: string): number {
    const s1 = this.normalizeText(a);
    const s2 = this.normalizeText(b);

    if (s1 === s2) return 0;
    if (s1.length === 0) return s2.length;
    if (s2.length === 0) return s1.length;

    const rows = s1.length + 1;
    const cols = s2.length + 1;
    const matrix: number[][] = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));

    for (let i = 0; i <= s1.length; i++) {
      const row = matrix[i];
      if (row) row[0] = i;
    }

    const firstRow = matrix[0];
    if (firstRow) {
      for (let j = 0; j <= s2.length; j++) {
        firstRow[j] = j;
      }
    }

    for (let i = 1; i <= s1.length; i++) {
      const row = matrix[i];
      const prevRow = matrix[i - 1];
      if (!row || !prevRow) continue;
      for (let j = 1; j <= s2.length; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        const del = (prevRow[j] ?? 0) + 1;
        const ins = (row[j - 1] ?? 0) + 1;
        const sub = (prevRow[j - 1] ?? 0) + cost;
        row[j] = Math.min(del, ins, sub);
      }
    }

    const lastRow = matrix[s1.length];
    return lastRow?.[s2.length] ?? 0;
  }

  /**
   * Determines if candidate is a fuzzy match within the permitted Levenshtein distance
   */
  static isFuzzyMatch(query: string, candidate: string): boolean {
    const q = this.normalizeText(query);
    const c = this.normalizeText(candidate);

    if (c.includes(q)) return true;

    const maxDist = this.getMaxAllowedDistance(q.length);
    const dist = this.computeLevenshteinDistance(q, c);

    return dist <= maxDist;
  }

  /**
   * Computes normalized similarity score [0.0 - 1.0]
   */
  static computeSimilarityScore(query: string, candidate: string): number {
    const q = this.normalizeText(query);
    const c = this.normalizeText(candidate);

    if (q === c) return 1.0;
    if (c.startsWith(q)) return 0.9;
    if (c.includes(q)) return 0.8;

    const maxLen = Math.max(q.length, c.length);
    if (maxLen === 0) return 1.0;

    const dist = this.computeLevenshteinDistance(q, c);
    const score = Math.max(0, 1 - dist / maxLen);

    return Math.round(score * 100) / 100;
  }

  /**
   * Finds the best "Did you mean?" suggestion from candidate dictionary
   */
  static findBestSuggestion(query: string, dictionary: string[]): string | null {
    const q = this.normalizeText(query);
    const maxDist = this.getMaxAllowedDistance(q.length);

    let bestCandidate: string | null = null;
    let minDistance = Infinity;

    for (const word of dictionary) {
      const dist = this.computeLevenshteinDistance(q, word);
      if (dist > 0 && dist <= maxDist && dist < minDistance) {
        minDistance = dist;
        bestCandidate = word;
      }
    }

    return bestCandidate;
  }
}
