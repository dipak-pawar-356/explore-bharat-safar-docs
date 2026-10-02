// Explore Bharat Safar — Section 2: Rural Bharat Knowledge System Contracts
// Reference: EBS-BLU-42-VKS, EBS-DOC-02-SPEC, EBS-DOC-09-API, EBS-DOC-10-DATA, EBS-DOC-40-SEC
import { GeoPoint } from './common.types';

export enum ModerationStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PUBLISHED = 'PUBLISHED',
}

export type VillageBusinessCategory =
  'HOMESTAY' | 'GUIDE' | 'RESTAURANT' | 'CRAFT' | 'RENTAL' | 'AGRI_STALL';

export type VillagePlaceCategory =
  | 'TEMPLE'
  | 'SHRINE'
  | 'WATERFALL'
  | 'SCHOOL'
  | 'MARKET'
  | 'HISTORIC'
  | 'NATURAL_GROVE'
  | 'STEPWELL'
  | 'MEMORIAL';

export interface VillageEntity {
  id: string;
  talukaId: string;
  lgdCode: string; // 6-digit official Census / Local Government Directory code
  nameEn: string;
  nameLocal: string; // Regional / Devanagari script
  pincode: string;
  centroid: GeoPoint;
  cadastralBoundaryGeoJson?: Record<string, unknown> | null;
  populationCount?: number;
  elevationMeters?: number;
  historicalChronicles?: string;
  etymologyMeaning?: string;
  heroImageUrl?: string;
  galleryImageUrls?: string[];
  approvalStatus: ModerationStatus;
  assignedAdminUserId?: string;
  averageRating?: number;
  totalReviews?: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface VillagePanchayatEntity {
  id: string;
  villageId: string;
  gramPanchayatName: string;
  gramSevakName?: string;
  sarpanchName?: string;
  officePhone?: string; // Official office landline only (NO private phone per DPDP Act)
  officeAddress?: string;
  officeTimings?: string;
  officeEmail?: string;
  publicServicesList: string[];
  updatedAt: string;
}

export interface VillageProfileEntity {
  id: string;
  villageId: string;
  etymologyMeaning?: string;
  formationHistory?: string;
  traditionalArts: string[];
  primaryCrops: string[];
  waterSources: string[];
  connectivityProfile: {
    mobileSignals: {
      jio: boolean;
      airtel: boolean;
      bsnl: boolean;
      vi: boolean;
    };
    roadType: 'PMGSY_PAVED' | 'UNPAVED' | 'ALL_WEATHER';
    nearestBusStandDistanceKm?: number;
    nearestRailwayStationKm?: number;
    nearestHighwayKm?: number;
    nearestAirportKm?: number;
  };
  healthcareProfile: {
    hasPHC: boolean;
    hasSubCentre: boolean;
    ashaWorkerContact?: string;
    nearestHospitalKm?: number;
    ambulanceAvailable?: boolean;
    phcContactLandline?: string;
  };
  educationProfile?: {
    primarySchoolsCount: number;
    secondarySchoolsCount: number;
    hasLibrary: boolean;
    hasAnganwadi: boolean;
  };
  civicInfrastructure?: {
    electricitySupplyHoursPerDay: number;
    potableWaterCoveragePercent: number;
    wasteManagementType: string;
  };
}

export interface VillagePlaceEntity {
  id: string;
  villageId: string;
  name: string;
  category: VillagePlaceCategory;
  description: string;
  coordinates: GeoPoint;
  imageUrls?: string[];
  isVerified: boolean;
  createdAt: string;
}

export interface VillageEventEntity {
  id: string;
  villageId: string;
  title: string;
  description: string;
  eventType: 'FESTIVAL' | 'GRAM_SABHA' | 'SPORTS' | 'ENVIRONMENT' | 'JATRA' | 'CULTURAL';
  startDate: string;
  endDate: string;
  locationDetails: string;
  organizerInfo: string;
  galleryUrls?: string[];
  status: 'UPCOMING' | 'ONGOING' | 'CONCLUDED' | 'CANCELLED';
  createdAt: string;
}

export interface VillageBusinessEntity {
  id: string;
  villageId: string;
  businessName: string;
  category: VillageBusinessCategory;
  contactPerson: string;
  contactPhone: string; // Masked / proxy number per DPDP Act
  addressDescription: string;
  priceRange?: string;
  photoUrls?: string[];
  verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  specialties?: string[];
  capacity?: { maxGuests?: number; roomsCount?: number };
  amenities?: string[];
  houseRules?: string[];
  culturalGuidelines?: string[];
  createdAt: string;
}

export interface MasterArtisanInfo {
  name: string;
  experienceYears: number;
  recognition?: string;
  specialization: string;
  contactPhone?: string;
  workshopName?: string;
  bio?: string;
}

export interface ArtisanProfileEntity {
  id: string;
  villageId: string;
  artisanName: string;
  craftCategory: 'HANDLOOM' | 'POTTERY' | 'METAL' | 'PAINTING' | 'WOODCRAFT' | 'AGRI_PRODUCE';
  craftTitle: string;
  isMasterArtisan: boolean;
  yearsOfExperience: number;
  recognitionAwards?: string[];
  bio: string;
  specialties: string[];
  hasGiTag: boolean;
  giTagRegistrationNumber?: string;
  workshopAddress: string;
  contactPhone: string; // DPDP masked
  rawMaterials: string[];
  verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
}

export interface RuralHomestayEntity {
  id: string;
  villageId: string;
  name: string;
  hostName: string;
  hostBio: string;
  maxGuestCapacity: number;
  roomCount: number;
  tariffRange: string;
  addressDescription: string;
  contactPhone: string; // DPDP masked
  amenities: string[];
  houseRules: string[];
  culturalGuidelines: string[];
  verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  isBookingDisabled: true; // Directory view only — NO bookings or payments
  createdAt: string;
}

export interface VillageRatingBreakdown {
  cleanliness: number; // 1.0 - 5.0
  hospitality: number; // 1.0 - 5.0
  nature: number; // 1.0 - 5.0
  safety: number; // 1.0 - 5.0
  food: number; // 1.0 - 5.0
  accessibility: number; // 1.0 - 5.0
  photography: number; // 1.0 - 5.0
  culturalPreservation: number; // 1.0 - 5.0
  adventure: number; // 1.0 - 5.0
  overall: number; // 1.0 - 5.0
}

export interface VillageReviewEntity {
  id: string;
  villageId: string;
  userId: string;
  userDisplayName?: string;
  ratings: VillageRatingBreakdown;
  averageScore: number;
  reviewText: string;
  photoUrls?: string[];
  isVerifiedTraveller: boolean;
  moderationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface AgrarianCropInfo {
  season: 'KHARIF' | 'RABI' | 'ZAID';
  cropName: string;
  sowingPeriod: string;
  harvestPeriod: string;
  indigenousVarieties?: string[];
  waterSource: string;
}

export interface FolkArtisanCraft {
  craftName: string;
  craftType: 'HANDLOOM' | 'POTTERY' | 'METAL' | 'PAINTING' | 'WOODCRAFT' | 'AGRI_PRODUCE';
  description: string;
  hasGiTag: boolean;
  giTagRegistrationNumber?: string;
  primaryPractitionersCount?: number;
  rawMaterials: string[];
  masterArtisans?: MasterArtisanInfo[];
  heritageStory?: string;
}

export interface VillageStagingUpdate {
  id: string;
  villageId: string;
  submittedBy: string;
  submitterEmail?: string;
  updateType:
    | 'FACILITY_UPDATE'
    | 'HISTORY_EDIT'
    | 'MEDIA_UPLOAD'
    | 'PANCHAYAT_UPDATE'
    | 'EVENT_CREATE'
    | 'BUSINESS_ADD'
    | 'PUBLIC_FACILITY_MODIFICATION'
    | 'ARTISAN_UPDATE'
    | 'HOMESTAY_UPDATE';
  payload: Record<string, unknown>;
  editorialNotes?: string;
  status: ModerationStatus;
  reviewedBy?: string;
  reviewComments?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export interface VillageSearchResultItem {
  id: string;
  lgdCode: string;
  nameEnglish: string;
  nameLocal: string;
  pincode: string;
  taluka: string;
  district: string;
  state: string;
  population?: number;
  elevationMeters?: number;
  heroImageUrl?: string;
  centroid: GeoPoint;
}

export interface VillageSearchResponse {
  status: 'success';
  query: string;
  totalMatches: number;
  results: VillageSearchResultItem[];
}

export interface VillageLivingDossier {
  village: VillageEntity;
  hierarchy: {
    stateName: string;
    stateIsoCode: string;
    districtName: string;
    districtHeadquarters: string;
    talukaName: string;
  };
  panchayat?: VillagePanchayatEntity | null;
  profile?: VillageProfileEntity | null;
  places: VillagePlaceEntity[];
  events: VillageEventEntity[];
  businesses: VillageBusinessEntity[];
  recentReviews: VillageReviewEntity[];
  agrarianCalendar: AgrarianCropInfo[];
  folkCrafts: FolkArtisanCraft[];
  artisans?: ArtisanProfileEntity[];
  homestays?: RuralHomestayEntity[];
  metrics: {
    averageRating: number;
    totalReviews: number;
    dimensionAverages: VillageRatingBreakdown;
  };
}
