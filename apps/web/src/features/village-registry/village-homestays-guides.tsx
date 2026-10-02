'use client';

// Explore Bharat Safar — Section 2: Verified Village Homestays & Local Guides Directory
// Reference: EBS-BLU-42-VKS Section 9 & 13, EBS-DOC-02-SPEC Section 4.4
import * as React from 'react';
import type { VillageBusinessEntity, RuralHomestayEntity } from '@ebs/types';

interface VillageHomestaysGuidesProps {
  businesses: VillageBusinessEntity[];
  homestays?: RuralHomestayEntity[];
}

export function VillageHomestaysGuides({
  businesses,
  homestays = [],
}: VillageHomestaysGuidesProps) {
  const [selectedFilter, setSelectedFilter] = React.useState<
    'ALL' | 'HOMESTAY' | 'GUIDE' | 'RESTAURANT'
  >('ALL');
  const [selectedHomestayDetails, setSelectedHomestayDetails] =
    React.useState<RuralHomestayEntity | null>(null);

  // Combine direct homestays list or businesses categorized as HOMESTAY
  const combinedHomestays: RuralHomestayEntity[] = React.useMemo(() => {
    if (homestays.length > 0) return homestays;
    return businesses
      .filter(b => b.category === 'HOMESTAY')
      .map(b => ({
        id: b.id,
        villageId: b.villageId,
        name: b.businessName,
        hostName: b.contactPerson,
        hostBio:
          'Generational rural family extending traditional hospitality and farm-fresh agro cuisine.',
        maxGuestCapacity: b.capacity?.maxGuests ?? 8,
        roomCount: b.capacity?.roomsCount ?? 3,
        tariffRange: b.priceRange ?? '₹1,200 – ₹2,000 / night',
        addressDescription: b.addressDescription,
        contactPhone: b.contactPhone,
        amenities:
          b.amenities && b.amenities.length > 0
            ? b.amenities
            : (b.specialties ?? ['Chulha Cooking', 'Solar Bath Water', 'Farm Walk']),
        houseRules:
          b.houseRules && b.houseRules.length > 0
            ? b.houseRules
            : [
                'No alcohol or smoking anywhere within Gaothan premises',
                'Remove footwear before entering living and prayer areas',
                'Community silence observed after 9:30 PM for village harmony',
              ],
        culturalGuidelines:
          b.culturalGuidelines && b.culturalGuidelines.length > 0
            ? b.culturalGuidelines
            : [
                'Modest dress code encouraged while walking through the village settlement',
                'Always seek permission before photographing village elders or shrines',
                'Respect local temple customs and sacred Devrai grove boundaries',
              ],
        verificationStatus:
          b.verificationStatus === 'REJECTED'
            ? 'REJECTED'
            : b.verificationStatus === 'PENDING'
              ? 'PENDING'
              : 'VERIFIED',
        isBookingDisabled: true as const,
        createdAt: b.createdAt,
      }));
  }, [businesses, homestays]);

  const nonHomestayBusinesses = businesses.filter(
    b => b.category !== 'HOMESTAY' && b.category !== 'CRAFT',
  );

  return (
    <div className="space-y-6">
      {/* Directory View Only Regulatory Compliance Masthead */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 dark:text-amber-200">
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5">🛡️</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-amber-200/80 dark:bg-amber-900/60 px-2 py-0.5 rounded text-amber-950 dark:text-amber-100">
                Sovereign Directory View Only
              </span>
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                Zero Commission &bull; No Online Bookings / Payments
              </span>
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 max-w-2xl leading-relaxed">
              Explore Bharat Safar upholds rural autonomy. Travellers connect directly with verified
              village hosts and local guides without commercial aggregator lock-in or platform
              commissions.
            </p>
          </div>
        </div>
        <div className="text-[11px] font-mono font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800 self-start sm:self-center">
          DPDP Act Protected Channels
        </div>
      </div>

      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>🏡</span> Rural Homestays, Community Lodges & Guides Directory
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Stay directly with agrarian families, learn ancestral folklore, and taste authentic
            woodfire cooking.
          </p>
        </div>

        <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 self-start">
          {(['ALL', 'HOMESTAY', 'GUIDE', 'RESTAURANT'] as const).map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedFilter === cat
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat === 'ALL'
                ? 'All Listings'
                : cat === 'HOMESTAY'
                  ? 'Rural Homestays'
                  : cat === 'GUIDE'
                    ? 'Local Guides'
                    : 'Traditional Dhabas'}
            </button>
          ))}
        </div>
      </div>

      {/* Homestays Section */}
      {(selectedFilter === 'ALL' || selectedFilter === 'HOMESTAY') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <span>🌾</span> Verified Gaothan Homestays & Community Lodges
            </h4>
            <span className="text-xs text-slate-400 font-mono">
              {combinedHomestays.length} Lodges Verified
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {combinedHomestays.map(hs => (
              <div
                key={hs.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        {hs.verificationStatus} Village Homestay
                      </span>
                      <h5 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5">
                        {hs.name}
                      </h5>
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400">
                      {hs.tariffRange}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Host: <strong className="text-slate-900 dark:text-white">{hs.hostName}</strong>{' '}
                    &bull; {hs.hostBio}
                  </p>

                  <div className="text-xs text-slate-500">📍 Location: {hs.addressDescription}</div>

                  {/* Capacity & Room Telemetry */}
                  <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400 block font-medium">Guest Capacity:</span>
                      <strong className="text-slate-900 dark:text-white">
                        Up to {hs.maxGuestCapacity} Guests
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Room Allocation:</span>
                      <strong className="text-slate-900 dark:text-white">
                        {hs.roomCount} Traditional Rooms
                      </strong>
                    </div>
                  </div>

                  {/* Amenities Pills */}
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                      Verified Amenities:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {hs.amenities.map((am, aIdx) => (
                        <span
                          key={aIdx}
                          className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                        >
                          ✓ {am}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-mono">
                      Host Contact (DPDP Masked): <strong>{hs.contactPhone}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedHomestayDetails(hs)}
                      className="text-bharat-evergreen-700 dark:text-bharat-evergreen-400 font-bold hover:underline"
                    >
                      House Rules & Guidelines &rarr;
                    </button>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center text-[11px] text-slate-500">
                    Direct enquiry only. No commercial booking fees or advance platform charges.
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Local Guides & Traditional Dhabas */}
      {(selectedFilter === 'ALL' ||
        selectedFilter === 'GUIDE' ||
        selectedFilter === 'RESTAURANT') &&
        nonHomestayBusinesses.length > 0 && (
          <div className="space-y-4 pt-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <span>🚶</span> Local Traditional Guides & Rural Eateries
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nonHomestayBusinesses
                .filter(b => (selectedFilter === 'ALL' ? true : b.category === selectedFilter))
                .map(biz => (
                  <div
                    key={biz.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                          {biz.category}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                          <span>✓</span> {biz.verificationStatus}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 dark:text-white mt-2">
                        {biz.businessName}
                      </h4>

                      <p className="text-xs text-slate-500 mt-1">
                        Guide / Host:{' '}
                        <strong className="text-slate-700 dark:text-slate-300">
                          {biz.contactPerson}
                        </strong>
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        📍 {biz.addressDescription}
                      </p>

                      {biz.priceRange && (
                        <div className="mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          Tariff: {biz.priceRange}
                        </div>
                      )}

                      {biz.specialties && biz.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2.5">
                          {biz.specialties.map((spec, sIdx) => (
                            <span
                              key={sIdx}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="text-[11px] text-slate-400 font-mono">
                        DPDP Masked Line: {biz.contactPhone}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

      {/* House Rules & Cultural Guidelines Modal */}
      {selectedHomestayDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedHomestayDetails.name}
                </h4>
                <p className="text-xs text-slate-500">
                  Host: {selectedHomestayDetails.hostName} &bull; Capacity:{' '}
                  {selectedHomestayDetails.maxGuestCapacity} Guests
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedHomestayDetails(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            {/* House Rules */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <span>📋</span> Village House Rules
              </h5>
              <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-2 text-xs text-amber-950 dark:text-amber-200">
                {selectedHomestayDetails.houseRules.map((rule, rIdx) => (
                  <div key={rIdx} className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cultural Guidelines */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <span>🪔</span> Sacred Cultural & Community Guidelines
              </h5>
              <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-2 text-xs text-emerald-950 dark:text-emerald-200">
                {selectedHomestayDetails.culturalGuidelines.map((guide, gIdx) => (
                  <div key={gIdx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{guide}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Host Direct */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <span className="text-slate-400 font-medium block">Host Direct Coordination:</span>
              <div className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                {selectedHomestayDetails.contactPhone}
              </div>
              <span className="text-[10px] text-slate-500 block">
                Connect via phone between 8:00 AM – 8:00 PM. No commissions charged.
              </span>
            </div>

            <button
              type="button"
              onClick={() => setSelectedHomestayDetails(null)}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 transition"
            >
              Close Guidelines
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
