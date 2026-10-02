// Explore Bharat Safar — Section 3: Booking DTOs
// Reference: EBS-DOC-14-BOOKING, EBS-BLU-43-BKG, EBS-DOC-09-API

import type { ParticipantDto, FoodPreference, TrekExperienceLevel } from '@ebs/types';

export class ParticipantItemDto implements ParticipantDto {
  fullName!: string;
  age!: number;
  gender!: string;
  dateOfBirth?: string;
  emergencyContactName!: string;
  emergencyContactPhone!: string;
  foodPreference?: FoodPreference;
  experienceLevel?: TrekExperienceLevel;
  medicalDeclarations?: string;
  specialNotes?: string;
}

export class ReserveSlotDto {
  batchId!: string;
  participants!: ParticipantItemDto[];
  addonIds?: string[];
  couponCode?: string;
  termsAccepted!: boolean;
  termsVersion!: string;
}

export class ConfirmBookingDto {
  confirmDirect?: boolean;
  offlineReceiptNotes?: string;
}

export class CancelBookingDto {
  reason!: string;
  confirmCancellation!: boolean;
}

export class WaitlistJoinDto {
  batchId!: string;
  partySize!: number;
  contactPhone!: string;
}

export class CreateBatchDto {
  experienceId!: string;
  batchStartDate!: string;
  batchEndDate!: string;
  reportingTime!: string;
  totalCapacity!: number;
  batchPriceInr!: number;
  leadGuideUserId?: string;
}

export class UpdateBatchDto {
  totalCapacity?: number;
  batchPriceInr?: number;
  status?: 'OPEN' | 'FILLING_FAST' | 'SOLD_OUT' | 'COMPLETED' | 'CANCELLED';
  leadGuideUserId?: string;
}

export class ExperienceFilterDto {
  q?: string;
  category?: string;
  experienceType?: string;
  difficulty?: string;
  minPrice?: number;
  maxPrice?: number;
  maxAltitude?: number;
  durationDays?: number;
  stateSlug?: string;
  page?: number;
  limit?: number;
}
