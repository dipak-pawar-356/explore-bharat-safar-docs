// Explore Bharat Safar — Regional Indic Travel Synonym Dictionary
// Reference: EBS-DOC-18-SEARCH Section 2 & 4
// Sprint 11: Enterprise Search Optimization

import { SearchContext } from '@ebs/types';

export interface SynonymGroup {
  canonical: string;
  terms: string[];
  context: SearchContext;
}

export const INDIC_TRAVEL_SYNONYMS: SynonymGroup[] = [
  // 1. Fortifications & Citadels
  {
    canonical: 'fort',
    terms: [
      'fort',
      'fortress',
      'durg',
      'gad',
      'killa',
      'qila',
      'kota',
      'kot',
      'दुर्ग',
      'किल्ला',
      'गड',
      'किला',
      'कोट',
    ],
    context: SearchContext.DISCOVERY,
  },
  // 2. Waterfalls & Cascades
  {
    canonical: 'waterfall',
    terms: [
      'waterfall',
      'falls',
      'fall',
      'dhodhad',
      'dhabdhaba',
      'jalprapata',
      'chhad',
      'झरना',
      'जलप्रपात',
      'धबधबा',
      'धोधड',
    ],
    context: SearchContext.DISCOVERY,
  },
  // 3. Peaks, Summits & Mountains
  {
    canonical: 'peak',
    terms: [
      'peak',
      'summit',
      'mountain',
      'hill',
      'shikhar',
      'parvat',
      'betta',
      'mala',
      'giri',
      'पर्वत',
      'शिखर',
      'टेकडी',
      'पहाड़',
      'गिरी',
    ],
    context: SearchContext.DISCOVERY,
  },
  // 4. Temples, Shrines & Heritage Sanctuaries
  {
    canonical: 'temple',
    terms: [
      'temple',
      'shrine',
      'mandir',
      'devasthan',
      'kovil',
      'gudi',
      'devalaya',
      'mandiram',
      'मंदिर',
      'देवस्थान',
      'देवालय',
      'मन्दिर',
    ],
    context: SearchContext.DISCOVERY,
  },
  // 5. Mountain Passes & Trails
  {
    canonical: 'pass',
    terms: ['pass', 'ghat', 'darrah', 'la', 'khind', 'खिंड', 'घाट', 'दर्रा', 'ला'],
    context: SearchContext.DISCOVERY,
  },
  // 6. Lakes, Water Bodies & Reservoirs
  {
    canonical: 'lake',
    terms: [
      'lake',
      'taal',
      'talav',
      'sarovar',
      'kunda',
      'pokhari',
      'झील',
      'तलाव',
      'सरोवर',
      'कुंड',
      'ताल',
    ],
    context: SearchContext.DISCOVERY,
  },
  // 7. Caves & Rock-Cut Sanctuaries
  {
    canonical: 'cave',
    terms: ['cave', 'caves', 'leni', 'guha', 'gufa', 'लेणी', 'गुहा', 'गुफा'],
    context: SearchContext.DISCOVERY,
  },
  // 8. Rural Villages & Panchayats
  {
    canonical: 'village',
    terms: [
      'village',
      'gram',
      'panchayat',
      'gaon',
      'kheda',
      'ur',
      'palle',
      'basti',
      'गाव',
      'ग्राम',
      'खेडे',
      'गाँव',
      'बस्ती',
    ],
    context: SearchContext.VILLAGES,
  },
  // 9. Trekking, Expeditions & Trails
  {
    canonical: 'trek',
    terms: [
      'trek',
      'trekking',
      'hike',
      'hiking',
      'trail',
      'expedition',
      'padyatra',
      'ट्रेक',
      'पदभ्रमण',
      'पदयात्रा',
    ],
    context: SearchContext.BOOKINGS,
  },
  // 10. Heritage Artisans & Crafts
  {
    canonical: 'artisan',
    terms: [
      'artisan',
      'craft',
      'craftsman',
      'karigar',
      'shilpkar',
      'हस्तशिल्प',
      'कारीगर',
      'शिल्पकार',
    ],
    context: SearchContext.VILLAGES,
  },
];

export class SynonymDictionaryEngine {
  private static readonly termToCanonicalMap = new Map<string, string>();
  private static readonly canonicalToTermsMap = new Map<string, string[]>();

  static {
    for (const group of INDIC_TRAVEL_SYNONYMS) {
      this.canonicalToTermsMap.set(
        group.canonical.toLowerCase(),
        group.terms.map(t => t.toLowerCase()),
      );
      for (const term of group.terms) {
        this.termToCanonicalMap.set(term.toLowerCase(), group.canonical.toLowerCase());
      }
    }
  }

  /**
   * Expands query string with equivalent regional Indic synonyms
   */
  static expandQuery(query: string): string[] {
    const tokens = query.toLowerCase().trim().split(/\s+/);
    const expansions: Set<string> = new Set([query.trim()]);

    for (const token of tokens) {
      const canonical = this.termToCanonicalMap.get(token);
      if (canonical) {
        const synonyms = this.canonicalToTermsMap.get(canonical) || [];
        for (const syn of synonyms.slice(0, 4)) {
          // Replace token in query with synonym
          const expanded = query.toLowerCase().replace(new RegExp(`\\b${token}\\b`, 'gi'), syn);
          expansions.add(expanded.trim());
        }
      }
    }

    return Array.from(expansions);
  }

  /**
   * Resolves canonical term for a given synonym token
   */
  static getCanonical(token: string): string | null {
    return this.termToCanonicalMap.get(token.toLowerCase().trim()) || null;
  }
}
