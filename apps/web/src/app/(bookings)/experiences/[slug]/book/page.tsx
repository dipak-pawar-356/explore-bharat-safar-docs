// Explore Bharat Safar — Section 3: Booking Wizard & Participant Registration Page
// Reference: EBS-DOC-14-BOOKING, EBS-BLU-43-BKG, EBS-DOC-26-RULES

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MOCK_EXPERIENCES,
  MOCK_BATCHES,
  MOCK_ADDONS,
  calculatePricingBreakdown,
} from '@/lib/booking-data';
import { useBookingDraftStore } from '@/store/booking-draft-store';
import { BatchSlotSelector } from '@/features/booking-wizard/batch-slot-selector';
import { ParticipantRosterForm } from '@/features/booking-wizard/participant-roster-form';
import { AddonsSelector } from '@/features/booking-wizard/addons-selector';
import { PricingSummaryCard } from '@/features/booking-wizard/pricing-summary-card';
import {
  TermsWaiverModal,
  CURRENT_TERMS_VERSION,
} from '@/features/booking-wizard/terms-waiver-modal';
import { WaitlistModal } from '@/features/booking-wizard/waitlist-modal';
import {
  type BatchEntity,
  type ParticipantDto,
  type ExperienceEntity,
  type AddonEntity,
  BookingStatus,
  FoodPreference,
  TrekExperienceLevel,
} from '@ebs/types';

export default function ExperienceBookPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const experience = MOCK_EXPERIENCES.find((e: ExperienceEntity) => e.slug === params.slug);

  // Store state
  const {
    selectedBatch,
    selectBatch,
    participants,
    setParticipants,
    selectedAddonIds,
    toggleAddon,
    appliedCoupon,
    setAppliedCoupon,
    termsAccepted,
    setTermsAccepted,
    setActiveOrder,
  } = useBookingDraftStore();

  // Local UI state
  const [isWaiverModalOpen, setIsWaiverModalOpen] = useState(false);
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const [waitlistBatch, setWaitlistBatch] = useState<BatchEntity | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isReserving, setIsReserving] = useState(false);

  if (!experience) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-2xl font-black text-slate-900">Experience Not Found</h2>
        <Link href="/experiences" className="text-saffron-600 font-bold underline">
          Return to Catalogue
        </Link>
      </div>
    );
  }

  const batches = MOCK_BATCHES[experience.id] || [];

  // Recalculate dynamic pricing breakdown
  const couponDiscount =
    appliedCoupon === 'BHARAT10'
      ? Math.round(experience.basePriceInr * 0.1 * participants.length)
      : appliedCoupon === 'DIWALI2026'
        ? 500
        : 0;

  const pricing = calculatePricingBreakdown(
    selectedBatch?.batchPriceInr || experience.basePriceInr,
    participants.length,
    MOCK_ADDONS,
    selectedAddonIds,
    couponDiscount,
    experience.mandatoryUpfrontPercentage,
  );

  const handleApplyCoupon = (code: string) => {
    if (code === 'BHARAT10' || code === 'DIWALI2026') {
      setAppliedCoupon(code);
      return true;
    }
    return false;
  };

  const handleJoinWaitlistClick = (batch: BatchEntity) => {
    setWaitlistBatch(batch);
    setIsWaitlistModalOpen(true);
  };

  const handleConfirmReservation = async () => {
    setBookingError(null);

    if (!selectedBatch) {
      setBookingError('Please select a departure batch before proceeding.');
      return;
    }

    if (selectedBatch.availableSlots < participants.length) {
      setBookingError(
        `Selected batch only has ${selectedBatch.availableSlots} available slots, but you have ${participants.length} participants.`,
      );
      return;
    }

    // Validate participants
    for (let i = 0; i < participants.length; i++) {
      const p = participants[i];
      if (!p.fullName.trim()) {
        setBookingError(`Participant #${i + 1} requires a full name.`);
        return;
      }
      if (!p.emergencyContactName.trim() || !p.emergencyContactPhone.trim()) {
        setBookingError(
          `Participant #${i + 1} (${p.fullName || 'Traveller'}) requires emergency contact details.`,
        );
        return;
      }
    }

    if (!termsAccepted) {
      setIsWaiverModalOpen(true);
      return;
    }

    setIsReserving(true);

    try {
      // Simulate 15-minute slot lock generation
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      const orderId = `ord-${Date.now().toString(36)}`;
      const orderNumber = `EBS-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      const newOrder = {
        id: orderId,
        orderNumber,
        userId: 'usr-guest-traveller',
        batchId: selectedBatch.id,
        experienceId: experience.id,
        experienceTitle: experience.title,
        participantCount: participants.length,
        status: BookingStatus.PENDING_PAYMENT,
        pricing,
        participants: participants.map((p: ParticipantDto, idx: number) => ({
          id: `ptp-${idx + 1}`,
          bookingId: orderId,
          fullName: p.fullName,
          age: p.age,
          gender: p.gender,
          emergencyContactName: p.emergencyContactName,
          emergencyContactPhone: p.emergencyContactPhone,
          foodPreference: p.foodPreference || FoodPreference.VEG,
          experienceLevel: p.experienceLevel || TrekExperienceLevel.BEGINNER,
          isAttendanceVerified: false,
          createdAt: new Date().toISOString(),
        })),
        selectedAddons: MOCK_ADDONS.filter((a: AddonEntity) => selectedAddonIds.includes(a.id)).map(
          (a: AddonEntity) => ({
            addonId: a.id,
            name: a.name,
            priceInr: a.priceInr,
            quantity: participants.length,
          }),
        ),
        appliedCoupon: appliedCoupon || undefined,
        termsVersion: CURRENT_TERMS_VERSION,
        termsAcceptedAt: new Date().toISOString(),
        lockExpiresAt: expiresAt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setActiveOrder(newOrder, expiresAt);
      router.push(`/checkout/${orderId}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reserve slots. Please try again.';
      setBookingError(msg);
    } finally {
      setIsReserving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/experiences" className="hover:text-slate-800 transition">
          Experiences
        </Link>
        <span>&rsaquo;</span>
        <Link href={`/experiences/${experience.slug}`} className="hover:text-slate-800 transition">
          {experience.title}
        </Link>
        <span>&rsaquo;</span>
        <span className="font-semibold text-slate-800">Booking Registration</span>
      </div>

      {/* Page Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Expedition Registration & Batch Lock
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Lock confirmed slots with distributed concurrency, submit medical safety disclosures, and
          customize expedition add-ons.
        </p>
      </div>

      {bookingError && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 font-semibold flex items-center gap-2">
          <span>⚠️</span>
          <span>{bookingError}</span>
        </div>
      )}

      {/* Grid Layout: Left Registration Steps, Right Sticky Invoice */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Step 1: Batch Departure Selector */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-saffron-600 text-white font-black text-xs">
                1
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900">Select Departure Batch</h2>
                <p className="text-xs text-slate-500">
                  Fixed departure schedules with lead mountain guide assignments.
                </p>
              </div>
            </div>

            <BatchSlotSelector
              batches={batches}
              selectedBatchId={selectedBatch?.id || null}
              onSelectBatch={(batch: BatchEntity) => selectBatch(batch)}
              onJoinWaitlist={handleJoinWaitlistClick}
            />
          </section>

          {/* Step 2: Participant Roster & Medical Telemetry */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-saffron-600 text-white font-black text-xs">
                2
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Traveller Information & Roster
                </h2>
                <p className="text-xs text-slate-500">
                  Configure 1 to 10 participants. Emergency contacts and health disclosures are
                  mandatory.
                </p>
              </div>
            </div>

            <ParticipantRosterForm
              participants={participants}
              onChange={(newParticipants: ParticipantDto[]) => setParticipants(newParticipants)}
              maxParticipants={selectedBatch ? Math.min(10, selectedBatch.availableSlots) : 10}
            />
          </section>

          {/* Step 3: Expedition Add-ons */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-saffron-600 text-white font-black text-xs">
                3
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Technical Add-ons & Equipment Rental
                </h2>
                <p className="text-xs text-slate-500">
                  Certified gear rentals, porter offloading, and cultural culinary add-ons.
                </p>
              </div>
            </div>

            <AddonsSelector
              addons={MOCK_ADDONS}
              selectedAddonIds={selectedAddonIds}
              onToggleAddon={toggleAddon}
            />
          </section>

          {/* Step 4: Terms & Liability Agreement Banner */}
          <section className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">📜</span>
                <h3 className="text-sm font-bold text-slate-900">
                  Wilderness Indemnity & Cancellation Policy
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsWaiverModalOpen(true)}
                className="text-xs font-semibold text-saffron-600 hover:text-saffron-800 underline"
              >
                {termsAccepted ? 'Review Signed Waiver' : 'Read Full Legal Document'}
              </button>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={e => setTermsAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-saffron-600 focus:ring-saffron-500 cursor-pointer"
              />
              <span className="text-xs text-slate-700">
                I confirm on behalf of all {participants.length} participant(s) that I have read and
                agree to the{' '}
                <button
                  type="button"
                  onClick={() => setIsWaiverModalOpen(true)}
                  className="font-bold underline text-slate-900"
                >
                  Adventure Risk Waiver
                </button>{' '}
                and Tiered Refund Schedule (30+ days: 90%, 15-29 days: 50%, 7-14 days: 25%, &lt;7
                days: 0%).
              </span>
            </label>
          </section>
        </div>

        {/* Right Column: Sticky Pricing Summary Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <PricingSummaryCard
              pricing={pricing}
              participantCount={participants.length}
              appliedCoupon={appliedCoupon}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={() => setAppliedCoupon(null)}
              onProceed={handleConfirmReservation}
              proceedLabel="Lock Slots & Proceed to Checkout"
              isProceedDisabled={!selectedBatch || !termsAccepted}
              isLoading={isReserving}
            />
          </div>
        </div>
      </div>

      {/* Terms & Risk Waiver Modal */}
      <TermsWaiverModal
        isOpen={isWaiverModalOpen}
        onClose={() => setIsWaiverModalOpen(false)}
        onAccept={() => {
          setTermsAccepted(true);
        }}
      />

      {/* Waitlist Queue Modal */}
      <WaitlistModal
        isOpen={isWaitlistModalOpen}
        batch={waitlistBatch}
        experienceTitle={experience.title}
        onClose={() => setIsWaitlistModalOpen(false)}
        onSubmit={async (data: { batchId: string; partySize: number; contactPhone: string }) => {
          alert(
            `Enrolled on waitlist for batch #${data.batchId}! We will notify ${data.contactPhone} when a cancellation occurs.`,
          );
        }}
      />
    </div>
  );
}
