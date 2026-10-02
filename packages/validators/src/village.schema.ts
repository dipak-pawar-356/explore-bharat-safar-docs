// Explore Bharat Safar — Village Knowledge Validation Schemas
// Reference: EBS-DOC-02-SPEC, EBS-BLU-42-VKS, EBS-DOC-09-API, EBS-DOC-40-SEC

import { z } from 'zod';

export const VillageQuerySchema = z.object({
  lgdCode: z.coerce.number().int().positive().optional(),
  stateSlug: z.string().min(2).optional(),
  districtSlug: z.string().min(2).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type VillageQueryInput = z.infer<typeof VillageQuerySchema>;

export const VillageContributionSchema = z.object({
  villageLgdCode: z.number().int().positive('Valid LGD code required'),
  category: z.enum(['HISTORY', 'FESTIVAL', 'LOCAL_ARTISAN', 'TEMPLE_MONUMENT', 'HOMESTAY']),
  title: z.string().min(5).max(120),
  description: z.string().min(50).max(5000),
  contributorName: z.string().min(2),
  contributorPhone: z.string().regex(/^\+91[6-9]\d{9}$/),
  sourceReferences: z.array(z.string().url()).optional(),
});

export type VillageContributionInput = z.infer<typeof VillageContributionSchema>;

export const VillageSearchSchema = z.object({
  q: z.string().trim().optional(),
  name: z.string().trim().optional(),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'PIN code must be a 6-digit number')
    .optional(),
  talukaId: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  page: z.coerce.number().int().min(1).default(1),
});

export type VillageSearchInput = z.infer<typeof VillageSearchSchema>;

export const VillageArtisanSchema = z.object({
  artisanName: z.string().min(2).max(150),
  craftCategory: z.enum(['HANDLOOM', 'POTTERY', 'METAL', 'PAINTING', 'WOODCRAFT', 'AGRI_PRODUCE']),
  craftTitle: z.string().min(3).max(150),
  isMasterArtisan: z.boolean().default(false),
  yearsOfExperience: z.number().int().min(0).max(100),
  recognitionAwards: z.array(z.string()).optional(),
  bio: z.string().min(20).max(3000),
  specialties: z.array(z.string()).min(1),
  hasGiTag: z.boolean().default(false),
  giTagRegistrationNumber: z.string().optional(),
  workshopAddress: z.string().min(5).max(300),
  contactPhone: z.string().min(8).max(50),
  rawMaterials: z.array(z.string()).min(1),
});

export type VillageArtisanInput = z.infer<typeof VillageArtisanSchema>;

export const VillageHomestaySchema = z.object({
  name: z.string().min(3).max(150),
  hostName: z.string().min(2).max(150),
  hostBio: z.string().min(20).max(2000),
  maxGuestCapacity: z.number().int().min(1).max(50),
  roomCount: z.number().int().min(1).max(25),
  tariffRange: z.string().min(3).max(100),
  addressDescription: z.string().min(5).max(300),
  contactPhone: z.string().min(8).max(50),
  amenities: z.array(z.string()).min(1),
  houseRules: z.array(z.string()).min(1),
  culturalGuidelines: z.array(z.string()).min(1),
  isBookingDisabled: z.literal(true).default(true), // Strictly directory view only — NO bookings or payments
});

export type VillageHomestayInput = z.infer<typeof VillageHomestaySchema>;

export const VillageUpdateSubmissionSchema = z.object({
  updateType: z.enum([
    'FACILITY_UPDATE',
    'HISTORY_EDIT',
    'MEDIA_UPLOAD',
    'PANCHAYAT_UPDATE',
    'EVENT_CREATE',
    'BUSINESS_ADD',
    'PUBLIC_FACILITY_MODIFICATION',
    'ARTISAN_UPDATE',
    'HOMESTAY_UPDATE',
  ]),
  payload: z.record(z.unknown()),
  editorialNotes: z.string().max(1000).optional(),
});

export type VillageUpdateSubmissionInput = z.infer<typeof VillageUpdateSubmissionSchema>;

export const VillageModerationActionSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  comments: z
    .string()
    .min(5, 'Review comments must be at least 5 characters')
    .max(2000, 'Comments cannot exceed 2000 characters'),
});

export type VillageModerationActionInput = z.infer<typeof VillageModerationActionSchema>;

export const VillageRatingDimensionSchema = z.number().min(1.0).max(5.0);

export const VillageReviewSchema = z.object({
  ratings: z.object({
    cleanliness: VillageRatingDimensionSchema,
    hospitality: VillageRatingDimensionSchema,
    nature: VillageRatingDimensionSchema,
    safety: VillageRatingDimensionSchema,
    food: VillageRatingDimensionSchema,
    accessibility: VillageRatingDimensionSchema,
    photography: VillageRatingDimensionSchema,
    culturalPreservation: VillageRatingDimensionSchema,
    adventure: VillageRatingDimensionSchema,
    overall: VillageRatingDimensionSchema,
  }),
  reviewText: z
    .string()
    .min(10, 'Review must be at least 10 characters')
    .max(3000, 'Review cannot exceed 3000 characters'),
  photoUrls: z.array(z.string().url()).max(10).optional(),
});

export type VillageReviewInput = z.infer<typeof VillageReviewSchema>;

/**
 * DPDP Act 2023 Rural Privacy Sanitization
 * Strips personal residential addresses, personal phone numbers, and identity identifiers.
 * Recursively sanitizes nested objects and arrays of objects.
 */
export function sanitizeVillageDataForPublicDisplay<T extends Record<string, unknown>>(data: T): T {
  const bannedPiiKeys = [
    'aadhaar',
    'voterId',
    'voter_id',
    'voterid',
    'panNumber',
    'pan_number',
    'pannumber',
    'personalMobile',
    'personal_mobile',
    'personalmobile',
    'privateMobile',
    'private_mobile',
    'privatemobile',
    'residentialAddress',
    'residential_address',
    'residentialaddress',
    'privateAddress',
    'private_address',
    'privateaddress',
    'bankAccount',
    'bank_account',
    'bankaccount',
    'creditCard',
    'credit_card',
    'creditcard',
    'debitCard',
    'debit_card',
    'debitcard',
    'accountNumber',
    'account_number',
    'accountnumber',
    'passportNumber',
    'passport_number',
    'passport',
  ];

  function sanitizeValue(value: unknown): unknown {
    if (value === null || typeof value !== 'object') {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map(item => sanitizeValue(item));
    }

    const obj = { ...(value as Record<string, unknown>) };
    for (const key of Object.keys(obj)) {
      if (bannedPiiKeys.some(banned => key.toLowerCase().includes(banned.toLowerCase()))) {
        delete obj[key];
      } else {
        obj[key] = sanitizeValue(obj[key]);
      }
    }
    return obj;
  }

  return sanitizeValue(data) as T;
}
