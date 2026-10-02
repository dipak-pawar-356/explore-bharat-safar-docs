// Explore Bharat Safar — Section 1: Bharat Discovery Engine Validation Schemas
// Reference: EBS-BLU-41-BDE, EBS-DOC-09-API, EBS-DOC-18-SEARCH, EBS-DOC-26-RULES
import { z } from 'zod';

export const DiscoverySearchQuerySchema = z.object({
  q: z
    .string()
    .min(2, { message: 'Search query must be at least 2 characters.' })
    .max(100, { message: 'Search query cannot exceed 100 characters.' })
    .trim(),
  level: z.enum(['state', 'district', 'taluka', 'place', 'all']).optional().default('all'),
  category: z.string().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  radiusKm: z.coerce.number().min(0.1).max(500).optional(),
  bbox: z
    .string()
    .regex(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?,-?\d+(\.\d+)?,-?\d+(\.\d+)?$/, {
      message: 'Bounding box must be formatted as minLng,minLat,maxLng,maxLat',
    })
    .optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export const NearbyPlacesQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().min(0.1).max(500).optional().default(50),
  category: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const BoundingBoxQuerySchema = z
  .object({
    minLat: z.coerce.number().min(-90).max(90),
    minLng: z.coerce.number().min(-180).max(180),
    maxLat: z.coerce.number().min(-90).max(90),
    maxLng: z.coerce.number().min(-180).max(180),
    category: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  })
  .refine(data => data.minLat <= data.maxLat, {
    message: 'minLat must be less than or equal to maxLat',
    path: ['minLat'],
  })
  .refine(data => data.minLng <= data.maxLng, {
    message: 'minLng must be less than or equal to maxLng',
    path: ['minLng'],
  });

export const PlaceFilterSchema = z.object({
  category: z.string().optional(),
  stateId: z.string().uuid().optional(),
  districtId: z.string().uuid().optional(),
  talukaId: z.string().uuid().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  has3DLandmark: z
    .string()
    .optional()
    .transform(val => val === 'true'),
  bookingEnabledOnly: z
    .string()
    .optional()
    .transform(val => val === 'true'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type DiscoverySearchQueryInput = z.infer<typeof DiscoverySearchQuerySchema>;
export type NearbyPlacesQueryInput = z.infer<typeof NearbyPlacesQuerySchema>;
export type BoundingBoxQueryInput = z.infer<typeof BoundingBoxQuerySchema>;
export type PlaceFilterInput = z.infer<typeof PlaceFilterSchema>;
