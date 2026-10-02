import { z } from 'zod';

export declare const VillageQuerySchema: z.ZodObject<{
  lgdCode: z.ZodOptional<z.ZodNumber>;
  stateSlug: z.ZodOptional<z.ZodString>;
  districtSlug: z.ZodOptional<z.ZodString>;
  page: z.ZodDefault<z.ZodNumber>;
  limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
  page: number;
  limit: number;
  lgdCode?: number | undefined;
  stateSlug?: string | undefined;
  districtSlug?: string | undefined;
}, {
  lgdCode?: number | undefined;
  stateSlug?: string | undefined;
  districtSlug?: string | undefined;
  page?: number | undefined;
  limit?: number | undefined;
}>;
export type VillageQueryInput = z.infer<typeof VillageQuerySchema>;

export declare const VillageContributionSchema: z.ZodObject<{
  villageLgdCode: z.ZodNumber;
  category: z.ZodEnum<["HISTORY", "FESTIVAL", "LOCAL_ARTISAN", "TEMPLE_MONUMENT", "HOMESTAY"]>;
  title: z.ZodString;
  description: z.ZodString;
  contributorName: z.ZodString;
  contributorPhone: z.ZodString;
  sourceReferences: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
  villageLgdCode: number;
  category: "HISTORY" | "FESTIVAL" | "LOCAL_ARTISAN" | "TEMPLE_MONUMENT" | "HOMESTAY";
  title: string;
  description: string;
  contributorName: string;
  contributorPhone: string;
  sourceReferences?: string[] | undefined;
}, {
  villageLgdCode: number;
  category: "HISTORY" | "FESTIVAL" | "LOCAL_ARTISAN" | "TEMPLE_MONUMENT" | "HOMESTAY";
  title: string;
  description: string;
  contributorName: string;
  contributorPhone: string;
  sourceReferences?: string[] | undefined;
}>;
export type VillageContributionInput = z.infer<typeof VillageContributionSchema>;

export declare const VillageSearchSchema: z.ZodObject<{
  q: z.ZodOptional<z.ZodString>;
  name: z.ZodOptional<z.ZodString>;
  pincode: z.ZodOptional<z.ZodString>;
  talukaId: z.ZodOptional<z.ZodString>;
  limit: z.ZodDefault<z.ZodNumber>;
  page: z.ZodDefault<z.ZodNumber>;
}>;
export type VillageSearchInput = z.infer<typeof VillageSearchSchema>;

export declare const VillageArtisanSchema: z.ZodObject<{
  artisanName: z.ZodString;
  craftCategory: z.ZodEnum<['HANDLOOM', 'POTTERY', 'METAL', 'PAINTING', 'WOODCRAFT', 'AGRI_PRODUCE']>;
  craftTitle: z.ZodString;
  isMasterArtisan: z.ZodDefault<z.ZodBoolean>;
  yearsOfExperience: z.ZodNumber;
  recognitionAwards: z.ZodOptional<z.ZodArray<z.ZodString>>;
  bio: z.ZodString;
  specialties: z.ZodArray<z.ZodString>;
  hasGiTag: z.ZodDefault<z.ZodBoolean>;
  giTagRegistrationNumber: z.ZodOptional<z.ZodString>;
  workshopAddress: z.ZodString;
  contactPhone: z.ZodString;
  rawMaterials: z.ZodArray<z.ZodString>;
}>;
export type VillageArtisanInput = z.infer<typeof VillageArtisanSchema>;

export declare const VillageHomestaySchema: z.ZodObject<{
  name: z.ZodString;
  hostName: z.ZodString;
  hostBio: z.ZodString;
  maxGuestCapacity: z.ZodNumber;
  roomCount: z.ZodNumber;
  tariffRange: z.ZodString;
  addressDescription: z.ZodString;
  contactPhone: z.ZodString;
  amenities: z.ZodArray<z.ZodString>;
  houseRules: z.ZodArray<z.ZodString>;
  culturalGuidelines: z.ZodArray<z.ZodString>;
  isBookingDisabled: z.ZodDefault<z.ZodLiteral<true>>;
}>;
export type VillageHomestayInput = z.infer<typeof VillageHomestaySchema>;

export declare const VillageUpdateSubmissionSchema: z.ZodObject<{
  updateType: z.ZodEnum<[
    'FACILITY_UPDATE',
    'HISTORY_EDIT',
    'MEDIA_UPLOAD',
    'PANCHAYAT_UPDATE',
    'EVENT_CREATE',
    'BUSINESS_ADD',
    'PUBLIC_FACILITY_MODIFICATION',
    'ARTISAN_UPDATE',
    'HOMESTAY_UPDATE',
  ]>;
  payload: z.ZodRecord<z.ZodString, z.ZodUnknown>;
  editorialNotes: z.ZodOptional<z.ZodString>;
}>;
export type VillageUpdateSubmissionInput = z.infer<typeof VillageUpdateSubmissionSchema>;

export declare const VillageModerationActionSchema: z.ZodObject<{
  action: z.ZodEnum<['APPROVE', 'REJECT']>;
  comments: z.ZodString;
}>;
export type VillageModerationActionInput = z.infer<typeof VillageModerationActionSchema>;

export declare const VillageRatingDimensionSchema: z.ZodNumber;

export declare const VillageReviewSchema: z.ZodObject<{
  ratings: z.ZodObject<{
    cleanliness: z.ZodNumber;
    hospitality: z.ZodNumber;
    nature: z.ZodNumber;
    safety: z.ZodNumber;
    food: z.ZodNumber;
    accessibility: z.ZodNumber;
    photography: z.ZodNumber;
    culturalPreservation: z.ZodNumber;
    adventure: z.ZodNumber;
    overall: z.ZodNumber;
  }>;
  reviewText: z.ZodString;
  photoUrls: z.ZodOptional<z.ZodArray<z.ZodString>>;
}>;
export type VillageReviewInput = z.infer<typeof VillageReviewSchema>;

export declare function sanitizeVillageDataForPublicDisplay<T extends Record<string, unknown>>(data: T): T;
//# sourceMappingURL=village.schema.d.ts.map