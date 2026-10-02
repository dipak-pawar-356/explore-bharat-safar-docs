// Explore Bharat Safar — Enterprise Search & Telemetry Validation Schemas
// Reference: EBS-DOC-18-SEARCH, EBS-DOC-09-API, EBS-BLU-41-BDE
// Sprint 11: Search, SEO, Performance, Accessibility & Observability

import { z } from 'zod';

export const SearchContext = {
  DISCOVERY: 'discovery',
  VILLAGES: 'villages',
  BOOKINGS: 'bookings',
  SOCIAL: 'social',
  ADMIN: 'admin',
  GLOBAL: 'global',
} as const;

export type SearchContextType = (typeof SearchContext)[keyof typeof SearchContext];

export const SearchContextSchema = z.enum([
  'discovery',
  'villages',
  'bookings',
  'social',
  'admin',
  'global',
]);

export const GlobalSearchQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .min(1, { message: 'Search query must contain at least 1 character.' })
    .max(100, { message: 'Search query cannot exceed 100 characters.' }),
  context: SearchContextSchema.optional().default('global'),

  category: z.string().optional(),
  stateId: z.string().optional(),
  districtId: z.string().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  radiusKm: z.coerce.number().min(0.1).max(500).optional(),
  minElevation: z.coerce.number().min(0).max(9000).optional(),
  maxElevation: z.coerce.number().min(0).max(9000).optional(),
  cursor: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  typoTolerance: z
    .union([z.boolean(), z.string().transform(val => val === 'true')])
    .optional()
    .default(true),
  includeFacets: z
    .union([z.boolean(), z.string().transform(val => val === 'true')])
    .optional()
    .default(false),
});

export const AutocompleteQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .min(1, { message: 'Prefix query must contain at least 1 character.' })
    .max(50, { message: 'Prefix query cannot exceed 50 characters.' }),
  context: SearchContextSchema.optional().default('global'),
  limit: z.coerce.number().int().min(1).max(20).optional().default(5),
});

export const SearchSuggestionsQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .min(1, { message: 'Suggestion query must contain at least 1 character.' })
    .max(100, { message: 'Suggestion query cannot exceed 100 characters.' }),
  context: SearchContextSchema.optional().default('global'),
});

export const SearchAnalyticsEventSchema = z.object({
  query: z.string().min(1).max(100).trim(),
  context: SearchContextSchema,
  hitsCount: z.number().int().min(0),
  executionTimeMs: z.number().min(0),
  clickedId: z.string().optional(),
  clickedPosition: z.number().int().min(0).optional(),
});

export type GlobalSearchQueryInput = z.infer<typeof GlobalSearchQuerySchema>;
export type AutocompleteQueryInput = z.infer<typeof AutocompleteQuerySchema>;
export type SearchSuggestionsQueryInput = z.infer<typeof SearchSuggestionsQuerySchema>;
export type SearchAnalyticsEventInput = z.infer<typeof SearchAnalyticsEventSchema>;
