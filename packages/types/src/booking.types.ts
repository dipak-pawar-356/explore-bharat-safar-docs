// Explore Bharat Safar — Section 3: Travel Booking Engine & Experiences Contracts
// Reference: EBS-DOC-14-BOOKING, EBS-BLU-43-BKG, EBS-DOC-09-API, EBS-DOC-10-DATA, EBS-DOC-26-RULES, EBS-DOC-36-STATE

import { GeoPoint } from './common.types';

export enum DifficultyLevel {
  EASY = 'EASY',
  MODERATE = 'MODERATE',
  DIFFICULT = 'DIFFICULT',
  CHALLENGING = 'CHALLENGING',
  TECHNICAL = 'TECHNICAL',
}

export enum ExperienceType {
  TREK = 'TREK',
  HERITAGE_WALK = 'HERITAGE_WALK',
  RURAL_HOMESTAY = 'RURAL_HOMESTAY',
  EXPEDITION = 'EXPEDITION',
  CAMPING = 'CAMPING',
  WILDLIFE_SAFARI = 'WILDLIFE_SAFARI',
}

export enum BookingStatus {
  DRAFT = 'DRAFT',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  EXPIRED = 'EXPIRED',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  FULLY_PAID = 'FULLY_PAID',
  CONFIRMED = 'CONFIRMED',
  TRIP_COMPLETED = 'TRIP_COMPLETED',
  CANCELLED_BY_USER = 'CANCELLED_BY_USER',
  CANCELLED_BY_ADMIN = 'CANCELLED_BY_ADMIN',
  REFUND_INITIATED = 'REFUND_INITIATED',
  REFUNDED = 'REFUNDED',
  ARCHIVED = 'ARCHIVED',
}

export enum BatchStatus {
  OPEN = 'OPEN',
  FILLING_FAST = 'FILLING_FAST',
  SOLD_OUT = 'SOLD_OUT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum AddonType {
  EQUIPMENT = 'EQUIPMENT',
  TRANSPORT = 'TRANSPORT',
  MEAL = 'MEAL',
  UPGRADE = 'UPGRADE',
  INSURANCE = 'INSURANCE',
}

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FLAT = 'FLAT',
}

export enum FoodPreference {
  VEG = 'VEG',
  NON_VEG = 'NON_VEG',
  JAIN = 'JAIN',
}

export enum TrekExperienceLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export enum WaitlistStatus {
  WAITING = 'WAITING',
  NOTIFIED = 'NOTIFIED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

// -------------------------------------------------------------
// Core Domain Entities
// -------------------------------------------------------------

export interface ItineraryDay {
  dayNumber: number;
  title: string;
  description: string;
  altitudeMeters?: number;
  elevationGainMeters?: number;
  trailDistanceKm?: number;
  mealsProvided: string[];
  accommodationType: string;
}

export interface CancellationPolicyRule {
  minDaysBeforeDeparture: number;
  maxDaysBeforeDeparture?: number;
  refundPercentage: number;
  description: string;
}

export interface ExperienceEntity {
  id: string;
  placeId?: string;
  title: string;
  slug: string;
  categorySlug: string;
  experienceType: ExperienceType;
  difficulty: DifficultyLevel;
  durationDays: number;
  durationNights: number;
  maxAltitudeMeters?: number;
  totalTrekDistanceKm?: number;
  basePriceInr: number;
  mandatoryUpfrontPercentage: number; // Configured by Super Admin (10 - 100)
  overviewDescription: string;
  inclusions: string[];
  exclusions: string[];
  itineraryDaywise: ItineraryDay[];
  packingList: string[];
  medicalGuidelines: string;
  cancellationPolicy: CancellationPolicyRule[];
  meetingPointName: string;
  meetingPointCoords: GeoPoint;
  heroImageUrl?: string;
  galleryImages?: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BatchEntity {
  id: string;
  experienceId: string;
  batchStartDate: string;
  batchEndDate: string;
  reportingTime: string;
  totalCapacity: number;
  availableSlots: number;
  batchPriceInr: number;
  leadGuideUserId?: string;
  leadGuideName?: string;
  status: BatchStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddonEntity {
  id: string;
  experienceId?: string; // Optional if global
  name: string;
  description?: string;
  priceInr: number;
  addonType: AddonType;
  isActive: boolean;
}

export interface CouponEntity {
  id: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmountInr: number;
  maxDiscountInr?: number;
  validUntil: string;
  isActive: boolean;
}

export interface PricingBreakdown {
  basePriceTotal: number;
  addOnsTotal: number;
  discountTotal: number;
  subtotal: number;
  taxesGst: number; // 5% statutory GST on adventure treks
  convenienceFee: number;
  totalBookingAmount: number;
  adminUpfrontPercentage: number; // 10% - 100%
  mandatoryAdvanceDeposit: number;
  outstandingBalanceDue: number;
}

export interface CancellationRefundEstimate {
  bookingId: string;
  daysBeforeDeparture: number;
  totalAmountPaid: number;
  refundPercentage: number;
  cancellationFee: number;
  eligibleRefundAmount: number;
  policyTierNote: string;
}

export interface ParticipantDto {
  fullName: string;
  age: number;
  gender: string;
  dateOfBirth?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  foodPreference?: FoodPreference;
  experienceLevel?: TrekExperienceLevel;
  medicalDeclarations?: string;
  specialNotes?: string;
}

export interface BookingParticipantEntity {
  id: string;
  bookingId: string;
  fullName: string;
  age: number;
  gender: string;
  dateOfBirth?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  foodPreference: FoodPreference;
  experienceLevel: TrekExperienceLevel;
  encryptedMedicalDeclarations?: string; // AES-256-GCM Encrypted
  isAttendanceVerified: boolean;
  createdAt: string;
}

export interface TermsAcceptanceRecord {
  orderId: string;
  userId: string;
  termsVersion: string;
  ipAddress?: string;
  userAgent?: string;
  acceptedAt: string;
}

export interface WaitlistEntryEntity {
  id: string;
  batchId: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  partySize: number;
  contactPhone: string;
  status: WaitlistStatus;
  createdAt: string;
}

export interface BookingOrder {
  id: string;
  orderNumber: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  batchId: string;
  experienceId: string;
  experienceTitle: string;
  participantCount: number;
  status: BookingStatus;
  pricing: PricingBreakdown;
  participants: BookingParticipantEntity[];
  selectedAddons: { addonId: string; name: string; priceInr: number; quantity: number }[];
  appliedCoupon?: string;
  termsVersion: string;
  termsAcceptedAt: string;
  lockExpiresAt?: string;
  advanceAmountPaid?: number;
  balanceAmountDue?: number;
  paymentTransactionId?: string;
  createdAt: string;
  updatedAt: string;
}

// -------------------------------------------------------------
// DTOs & Request / Response Payloads
// -------------------------------------------------------------

export interface ReserveSlotDto {
  batchId: string;
  participants: ParticipantDto[];
  addonIds?: string[];
  couponCode?: string;
  termsAccepted: boolean;
  termsVersion: string;
}

export interface ReserveSlotResponse {
  bookingId: string;
  orderNumber: string;
  status: BookingStatus;
  pricing: PricingBreakdown;
  lockExpiresAt: string;
  lockDurationSeconds: number;
}

export interface ExperienceCatalogFilterDto {
  q?: string;
  category?: string;
  experienceType?: ExperienceType;
  difficulty?: DifficultyLevel;
  minPrice?: number;
  maxPrice?: number;
  maxAltitude?: number;
  durationDays?: number;
  stateSlug?: string;
  page?: number;
  limit?: number;
}

export interface ExperienceCatalogResponse {
  items: ExperienceEntity[];
  totalMatches: number;
  page: number;
  limit: number;
  availableCategories: string[];
}

export interface CreateBatchDto {
  experienceId: string;
  batchStartDate: string;
  batchEndDate: string;
  reportingTime: string;
  totalCapacity: number;
  batchPriceInr: number;
  leadGuideUserId?: string;
}

export interface UpdateBatchDto {
  totalCapacity?: number;
  batchPriceInr?: number;
  status?: BatchStatus;
  leadGuideUserId?: string;
}

export interface CancelBookingDto {
  reason: string;
  confirmCancellation: boolean;
}

export interface WaitlistJoinDto {
  batchId: string;
  partySize: number;
  contactPhone: string;
}

export interface BatchManifestDto {
  batchId: string;
  experienceTitle: string;
  startDate: string;
  endDate: string;
  reportingTime: string;
  totalCapacity: number;
  confirmedCount: number;
  lockedCount: number;
  availableSlots: number;
  participants: {
    participantId: string;
    bookingNumber: string;
    fullName: string;
    age: number;
    gender: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    foodPreference: string;
    experienceLevel: string;
    hasMedicalDisclosures: boolean;
    isAttendanceVerified: boolean;
  }[];
}
