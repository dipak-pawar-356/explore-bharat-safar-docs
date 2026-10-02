// Explore Bharat Safar — Section 3: Booking Draft & Checkout Zustand Store
// Reference: EBS-DOC-14-BOOKING, EBS-BLU-43-BKG

import { create } from 'zustand';
import {
  type ExperienceEntity,
  type BatchEntity,
  type ParticipantDto,
  type BookingOrder,
  FoodPreference,
  TrekExperienceLevel,
} from '@ebs/types';

export interface BookingDraftState {
  experience: ExperienceEntity | null;
  selectedBatch: BatchEntity | null;
  participants: ParticipantDto[];
  selectedAddonIds: string[];
  appliedCoupon: string | null;
  termsAccepted: boolean;
  activeOrder: BookingOrder | null;
  lockExpiresAt: string | null;

  // Actions
  setExperience: (exp: ExperienceEntity | null) => void;
  selectBatch: (batch: BatchEntity | null) => void;
  setParticipants: (participants: ParticipantDto[]) => void;
  addParticipant: (participant: ParticipantDto) => void;
  removeParticipant: (index: number) => void;
  toggleAddon: (addonId: string) => void;
  setAppliedCoupon: (code: string | null) => void;
  setTermsAccepted: (accepted: boolean) => void;
  setActiveOrder: (order: BookingOrder | null, lockExpiresAt?: string | null) => void;
  clearDraft: () => void;
}

const DEFAULT_PARTICIPANT: ParticipantDto = {
  fullName: '',
  age: 25,
  gender: 'MALE',
  emergencyContactName: '',
  emergencyContactPhone: '',
  foodPreference: FoodPreference.VEG,
  experienceLevel: TrekExperienceLevel.BEGINNER,
  medicalDeclarations: '',
};

export const useBookingDraftStore = create<BookingDraftState>(set => ({
  experience: null,
  selectedBatch: null,
  participants: [DEFAULT_PARTICIPANT],
  selectedAddonIds: [],
  appliedCoupon: null,
  termsAccepted: false,
  activeOrder: null,
  lockExpiresAt: null,

  setExperience: experience => set({ experience }),
  selectBatch: selectedBatch => set({ selectedBatch }),
  setParticipants: participants => set({ participants }),

  addParticipant: participant =>
    set(state => ({
      participants:
        state.participants.length < 10 ? [...state.participants, participant] : state.participants,
    })),

  removeParticipant: index =>
    set(state => ({
      participants:
        state.participants.length > 1
          ? state.participants.filter((_, i) => i !== index)
          : state.participants,
    })),

  toggleAddon: addonId =>
    set(state => {
      const exists = state.selectedAddonIds.includes(addonId);
      return {
        selectedAddonIds: exists
          ? state.selectedAddonIds.filter(id => id !== addonId)
          : [...state.selectedAddonIds, addonId],
      };
    }),

  setAppliedCoupon: appliedCoupon => set({ appliedCoupon }),
  setTermsAccepted: termsAccepted => set({ termsAccepted }),

  setActiveOrder: (activeOrder, lockExpiresAt = null) => set({ activeOrder, lockExpiresAt }),

  clearDraft: () =>
    set({
      experience: null,
      selectedBatch: null,
      participants: [DEFAULT_PARTICIPANT],
      selectedAddonIds: [],
      appliedCoupon: null,
      termsAccepted: false,
      activeOrder: null,
      lockExpiresAt: null,
    }),
}));
