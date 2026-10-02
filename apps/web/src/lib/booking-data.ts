// Explore Bharat Safar — Section 3: Booking Engine Data & Calculator Utilities
// Reference: EBS-DOC-14-BOOKING, EBS-BLU-43-BKG, EBS-DOC-26-RULES

import {
  DifficultyLevel,
  ExperienceType,
  BatchStatus,
  BookingStatus,
  AddonType,
  FoodPreference,
  TrekExperienceLevel,
  type ExperienceEntity,
  type BatchEntity,
  type AddonEntity,
  type PricingBreakdown,
  type BookingOrder,
  type CancellationRefundEstimate,
} from '@ebs/types';

export const MOCK_EXPERIENCES: ExperienceEntity[] = [
  {
    id: 'exp-torna-fort-monsoon',
    title: 'Torna Fort Monsoon Ridge Trek & Waterfall Traverse',
    slug: 'torna-fort-monsoon-ridge-trek',
    categorySlug: 'heritage-treks',
    experienceType: ExperienceType.TREK,
    difficulty: DifficultyLevel.MODERATE,
    durationDays: 2,
    durationNights: 1,
    maxAltitudeMeters: 1403,
    totalTrekDistanceKm: 14.5,
    basePriceInr: 2850,
    mandatoryUpfrontPercentage: 30,
    overviewDescription:
      'Scale the highest fort in Pune district, captured by Chhatrapati Shivaji Maharaj at age 16. Traverse the precarious Zunjar Maachi ridge surrounded by monsoon cloud inversions.',
    inclusions: [
      'Certified Wilderness First Aid Trek Leader',
      'Dome Tents and Foam Sleeping Mats',
      'All Meals from Basecamp Velhe (2 Lunch, 1 Dinner, 1 Breakfast)',
      'Forest Department Entry Permits & Eco-Cess',
    ],
    exclusions: [
      'Personal Trekking Gear & Rucksack',
      'Insurance Coverage',
      'Packaged Mineral Water',
    ],
    itineraryDaywise: [
      {
        dayNumber: 1,
        title: 'Velhe Basecamp to Torna Summit via Bhor Budruk',
        description:
          'Ascent through cascading waterfalls, rock patches, and historical bastions to the Mengai Devi temple plateau.',
        altitudeMeters: 1403,
        elevationGainMeters: 820,
        trailDistanceKm: 7.5,
        mealsProvided: ['Breakfast', 'Packed Trail Lunch', 'Hot Dinner'],
        accommodationType: 'Alpine Ridge Tent',
      },
      {
        dayNumber: 2,
        title: 'Zunjar Maachi Exploration & Descent',
        description:
          'Sunrise exploration of the fortified western ridge, followed by ridge descent to Velhe for a celebratory Maharashtrian meal.',
        altitudeMeters: 650,
        trailDistanceKm: 7.0,
        mealsProvided: ['Breakfast', 'Traditional Village Feast'],
        accommodationType: 'Homestay Basecamp',
      },
    ],
    packingList: [
      '40-50L Backpack with rain cover',
      'Trekking shoes with deep lug grip',
      'Poncho or Waterproof Shell Jacket',
      'Personal Hydration Flask (minimum 2 Litres)',
      'Headlamp with spare batteries',
    ],
    medicalGuidelines:
      'Moderate cardiovascular endurance needed. Not suitable for pregnant women or individuals with uncontrolled vertigo/hypertension.',
    cancellationPolicy: [
      {
        minDaysBeforeDeparture: 30,
        refundPercentage: 90,
        description: '30+ days: 90% refund (10% admin retention)',
      },
      {
        minDaysBeforeDeparture: 15,
        maxDaysBeforeDeparture: 29,
        refundPercentage: 50,
        description: '15-29 days: 50% refund',
      },
      {
        minDaysBeforeDeparture: 7,
        maxDaysBeforeDeparture: 14,
        refundPercentage: 25,
        description: '7-14 days: 25% refund',
      },
      {
        minDaysBeforeDeparture: 0,
        maxDaysBeforeDeparture: 6,
        refundPercentage: 0,
        description: '<7 days: Strictly non-refundable',
      },
    ],
    meetingPointName: 'Velhe Police Chowki & Basecamp Hub, Maharashtra',
    meetingPointCoords: { latitude: 18.2975, longitude: 73.6339 },
    isPublished: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'exp-hampta-pass-chandratal',
    title: 'Hampta Pass & Chandratal Glacial Crossing Expedition',
    slug: 'hampta-pass-chandratal-crossing',
    categorySlug: 'high-altitude-treks',
    experienceType: ExperienceType.EXPEDITION,
    difficulty: DifficultyLevel.CHALLENGING,
    durationDays: 5,
    durationNights: 4,
    maxAltitudeMeters: 4287,
    totalTrekDistanceKm: 35.0,
    basePriceInr: 12500,
    mandatoryUpfrontPercentage: 40,
    overviewDescription:
      'Dramatic transition from the lush alpine cedar pine forests of Kullu to the stark, arid, moon-like glacial desert landscapes of Lahaul & Spiti over the 14,065 ft Hampta Pass.',
    inclusions: [
      'IMF Certified Mountain Guides & Technical Staff',
      'High-Altitude 4-Season Geodesic Tents',
      'Crampons & Microspikes for Glacial Moraine Passage',
      'Nutritious High-Altitude Vegetarian Meals & Evening Soups',
      'Chandratal Lake Jeep Excursion & Permits',
    ],
    exclusions: [
      'Offloading of personal rucksack (Mule/Porter service)',
      'Emergency Helicopter Evacuation',
    ],
    itineraryDaywise: [
      {
        dayNumber: 1,
        title: 'Manali to Jobra Drive and Trek to Chika',
        description:
          'Drive along 42 hairpin turns, gentle trek through silver birch forest to river campsite.',
        altitudeMeters: 3100,
        elevationGainMeters: 450,
        trailDistanceKm: 4.0,
        mealsProvided: ['Dinner'],
        accommodationType: 'Alpine Tent',
      },
      {
        dayNumber: 2,
        title: 'Chika to Balu Ka Ghera',
        description:
          'Gradual ascent along glacial streams, crossing boulders and flowering rhododendron meadows.',
        altitudeMeters: 3750,
        elevationGainMeters: 650,
        trailDistanceKm: 8.5,
        mealsProvided: ['Breakfast', 'Lunch', 'Dinner'],
        accommodationType: 'Alpine Tent',
      },
      {
        dayNumber: 3,
        title: 'Pass Crossing: Balu Ka Ghera to Shea Goru via Hampta Pass',
        description:
          'Steep moraine ascent to Hampta Pass summit (4287m), panoramic views of Mt. Indrasan, steep descent to river camp.',
        altitudeMeters: 4287,
        elevationGainMeters: 537,
        trailDistanceKm: 14.0,
        mealsProvided: ['Breakfast', 'Trail Ration', 'Dinner'],
        accommodationType: 'Alpine Tent',
      },
      {
        dayNumber: 4,
        title: 'Shea Goru to Chatru and Excursion to Chandratal Lake',
        description:
          'River crossing at sunrise, descent to Chatru roadhead, vehicle transfer to the Moon Lake (Chandratal).',
        altitudeMeters: 4300,
        trailDistanceKm: 7.0,
        mealsProvided: ['Breakfast', 'Lunch', 'Dinner'],
        accommodationType: 'Camp Site Chatru',
      },
      {
        dayNumber: 5,
        title: 'Chatru to Manali via Atal Tunnel',
        description:
          'Scenic return journey traversing Atal Tunnel, conclusion of expedition at Manali.',
        altitudeMeters: 2050,
        trailDistanceKm: 0,
        mealsProvided: ['Breakfast'],
        accommodationType: 'N/A',
      },
    ],
    packingList: [
      'Down feather jacket (-10°C rated)',
      'Waterproof trekking boots with ankle support',
      'Trekking poles with snow baskets',
      'UV 400 glacier sunglasses',
      'Personal Diamox and AMS first aid kit',
    ],
    medicalGuidelines:
      'High-altitude exposure. Acclimatization discipline mandatory. Mandatory medical clearance certificate required prior to departure.',
    cancellationPolicy: [
      { minDaysBeforeDeparture: 30, refundPercentage: 90, description: '30+ days: 90% refund' },
      {
        minDaysBeforeDeparture: 15,
        maxDaysBeforeDeparture: 29,
        refundPercentage: 50,
        description: '15-29 days: 50% refund',
      },
      {
        minDaysBeforeDeparture: 7,
        maxDaysBeforeDeparture: 14,
        refundPercentage: 25,
        description: '7-14 days: 25% refund',
      },
      {
        minDaysBeforeDeparture: 0,
        maxDaysBeforeDeparture: 6,
        refundPercentage: 0,
        description: '<7 days: Non-refundable',
      },
    ],
    meetingPointName: 'Government Bus Stand / Tourist Information Centre, Mall Road, Manali, HP',
    meetingPointCoords: { latitude: 32.2396, longitude: 77.1887 },
    isPublished: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'exp-velhe-heritage-immersion',
    title: 'Velhe Folk Arts & Warli Masterclass Immersion',
    slug: 'velhe-folk-arts-warli-immersion',
    categorySlug: 'rural-homestays',
    experienceType: ExperienceType.RURAL_HOMESTAY,
    difficulty: DifficultyLevel.EASY,
    durationDays: 2,
    durationNights: 1,
    maxAltitudeMeters: 640,
    totalTrekDistanceKm: 4.0,
    basePriceInr: 3200,
    mandatoryUpfrontPercentage: 25,
    overviewDescription:
      'Stay with local village hosts in Velhe, study traditional Warli painting with master artisans, sample farm-to-table organic meals, and support rural empowerment.',
    inclusions: [
      'Heritage Village Homestay Accommodations',
      'Warli Art Workshop with Traditional Canvas & Brushes',
      'Authentic Farm-to-Table Organic Meals',
    ],
    exclusions: ['Personal Shopping', 'Private Vehicle Transit'],
    itineraryDaywise: [
      {
        dayNumber: 1,
        title: 'Village Welcoming & Artisan Studio Tour',
        description:
          'Traditional welcome, settle into homestay, evening Warli fresco painting workshop.',
        altitudeMeters: 620,
        mealsProvided: ['Welcome Drinks', 'Village Lunch', 'Evening Feast'],
        accommodationType: 'Village Homestay',
      },
    ],
    packingList: ['Casual comfortable cotton attire', 'Personal toiletries'],
    medicalGuidelines: 'Accessible to all ages and fitness levels.',
    cancellationPolicy: [
      { minDaysBeforeDeparture: 30, refundPercentage: 90, description: '30+ days: 90% refund' },
      {
        minDaysBeforeDeparture: 15,
        maxDaysBeforeDeparture: 29,
        refundPercentage: 50,
        description: '15-29 days: 50% refund',
      },
      {
        minDaysBeforeDeparture: 7,
        maxDaysBeforeDeparture: 14,
        refundPercentage: 25,
        description: '7-14 days: 25% refund',
      },
      {
        minDaysBeforeDeparture: 0,
        maxDaysBeforeDeparture: 6,
        refundPercentage: 0,
        description: '<7 days: Non-refundable',
      },
    ],
    meetingPointName: 'Gram Panchayat Bhavan, Velhe',
    meetingPointCoords: { latitude: 18.2975, longitude: 73.6339 },
    isPublished: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

export const MOCK_BATCHES: Record<string, BatchEntity[]> = {
  'exp-torna-fort-monsoon': [
    {
      id: 'bat-torna-oct-01',
      experienceId: 'exp-torna-fort-monsoon',
      batchStartDate: '2026-10-17',
      batchEndDate: '2026-10-18',
      reportingTime: '06:30 AM at Velhe Basecamp',
      totalCapacity: 20,
      availableSlots: 18,
      batchPriceInr: 2850,
      leadGuideName: 'Tukaram Deshmukh (BMC Certified)',
      status: BatchStatus.OPEN,
    },
    {
      id: 'bat-torna-oct-02',
      experienceId: 'exp-torna-fort-monsoon',
      batchStartDate: '2026-10-24',
      batchEndDate: '2026-10-25',
      reportingTime: '06:30 AM at Velhe Basecamp',
      totalCapacity: 15,
      availableSlots: 3,
      batchPriceInr: 2850,
      leadGuideName: 'Sachin Kadam (NIM Certified)',
      status: BatchStatus.FILLING_FAST,
    },
  ],
  'exp-hampta-pass-chandratal': [
    {
      id: 'bat-hampta-diwali',
      experienceId: 'exp-hampta-pass-chandratal',
      batchStartDate: '2026-11-01',
      batchEndDate: '2026-11-05',
      reportingTime: '08:00 AM at Manali',
      totalCapacity: 12,
      availableSlots: 0,
      batchPriceInr: 12500,
      leadGuideName: 'Dorje Angchuk (IMF Expedition Leader)',
      status: BatchStatus.SOLD_OUT,
    },
    {
      id: 'bat-hampta-nov-02',
      experienceId: 'exp-hampta-pass-chandratal',
      batchStartDate: '2026-11-08',
      batchEndDate: '2026-11-12',
      reportingTime: '08:00 AM at Manali',
      totalCapacity: 14,
      availableSlots: 6,
      batchPriceInr: 12500,
      leadGuideName: 'Dorje Angchuk (IMF Expedition Leader)',
      status: BatchStatus.OPEN,
    },
  ],
  'exp-velhe-heritage-immersion': [
    {
      id: 'bat-velhe-oct-01',
      experienceId: 'exp-velhe-heritage-immersion',
      batchStartDate: '2026-10-10',
      batchEndDate: '2026-10-11',
      reportingTime: '10:00 AM at Velhe Panchayat',
      totalCapacity: 10,
      availableSlots: 7,
      batchPriceInr: 3200,
      leadGuideName: 'Sunita Gawade (Artisan Coordinator)',
      status: BatchStatus.OPEN,
    },
  ],
};

export const MOCK_ADDONS: AddonEntity[] = [
  {
    id: 'addon-sleeping-bag',
    name: 'Sub-Zero Sleeping Bag Rental (-5°C rated)',
    description: 'Sterilized alpine sleeping bag with fresh inner cotton fleece liner.',
    priceInr: 350,
    addonType: AddonType.EQUIPMENT,
    isActive: true,
  },
  {
    id: 'addon-trekking-poles',
    name: 'Anti-Shock Telescoping Trekking Poles (Pair)',
    description: 'Lightweight carbon-aluminum alloy poles with mud/snow baskets.',
    priceInr: 200,
    addonType: AddonType.EQUIPMENT,
    isActive: true,
  },
  {
    id: 'addon-personal-porter',
    name: 'Dedicated Personal Trail Porter Assistance',
    description: 'Local mountain porter transports up to 10kg rucksack between camps.',
    priceInr: 1800,
    addonType: AddonType.UPGRADE,
    isActive: true,
  },
  {
    id: 'addon-local-feast',
    name: 'Village Chulha Organic Traditional Dinner Upgrade',
    description: 'Authentic Maharashtrian / Himachali culinary evening with local farming hosts.',
    priceInr: 450,
    addonType: AddonType.MEAL,
    isActive: true,
  },
];

export const MOCK_BOOKINGS: BookingOrder[] = [
  {
    id: 'bkg-demo-1001',
    orderNumber: 'EBS-2026-9041',
    userId: 'usr-traveller-01',
    userName: 'Aarav Sharma',
    userEmail: 'aarav@explorebharatsafar.in',
    batchId: 'bat-torna-oct-01',
    experienceId: 'exp-torna-fort-monsoon',
    experienceTitle: 'Torna Fort Monsoon Ridge Trek & Waterfall Traverse',
    participantCount: 2,
    status: BookingStatus.CONFIRMED,
    pricing: {
      basePriceTotal: 5700,
      addOnsTotal: 700,
      discountTotal: 0,
      subtotal: 6400,
      taxesGst: 320,
      convenienceFee: 0,
      totalBookingAmount: 6720,
      adminUpfrontPercentage: 30,
      mandatoryAdvanceDeposit: 2016,
      outstandingBalanceDue: 4704,
    },
    participants: [
      {
        id: 'ptp-1',
        bookingId: 'bkg-demo-1001',
        fullName: 'Aarav Sharma',
        age: 28,
        gender: 'MALE',
        emergencyContactName: 'Sunita Sharma',
        emergencyContactPhone: '+919820011223',
        foodPreference: FoodPreference.VEG,
        experienceLevel: TrekExperienceLevel.INTERMEDIATE,
        isAttendanceVerified: true,
        createdAt: '2026-09-28T10:00:00Z',
      },
      {
        id: 'ptp-2',
        bookingId: 'bkg-demo-1001',
        fullName: 'Priya Verma',
        age: 26,
        gender: 'FEMALE',
        emergencyContactName: 'Sunita Sharma',
        emergencyContactPhone: '+919820011223',
        foodPreference: FoodPreference.VEG,
        experienceLevel: TrekExperienceLevel.BEGINNER,
        isAttendanceVerified: false,
        createdAt: '2026-09-28T10:00:00Z',
      },
    ],
    selectedAddons: [
      {
        addonId: 'addon-sleeping-bag',
        name: 'Sub-Zero Sleeping Bag Rental',
        priceInr: 350,
        quantity: 2,
      },
    ],
    termsVersion: 'EBS-ADVENTURE-WAIVER-V2026.1',
    termsAcceptedAt: '2026-09-28T10:05:00Z',
    createdAt: '2026-09-28T10:05:00Z',
    updatedAt: '2026-09-28T10:05:00Z',
  },
];

export function calculatePricingBreakdown(
  basePricePerPerson: number,
  participantCount: number,
  addons: AddonEntity[],
  selectedAddonIds: string[],
  couponDiscount: number = 0,
  upfrontPercentage: number = 30,
): PricingBreakdown {
  const basePriceTotal = Math.round(basePricePerPerson * participantCount);
  const addOnsTotal = addons
    .filter(a => selectedAddonIds.includes(a.id))
    .reduce((sum, a) => sum + Math.round(a.priceInr * participantCount), 0);

  const subtotalBeforeDiscount = basePriceTotal + addOnsTotal;
  const discountTotal = Math.min(couponDiscount, subtotalBeforeDiscount);
  const subtotal = subtotalBeforeDiscount - discountTotal;
  const taxesGst = Math.round(subtotal * 0.05); // 5% GST
  const convenienceFee = 0;
  const totalBookingAmount = subtotal + taxesGst + convenienceFee;

  const validUpfrontPct = Math.min(Math.max(upfrontPercentage, 10), 100);
  const mandatoryAdvanceDeposit = Math.round(totalBookingAmount * (validUpfrontPct / 100));
  const outstandingBalanceDue = totalBookingAmount - mandatoryAdvanceDeposit;

  return {
    basePriceTotal,
    addOnsTotal,
    discountTotal,
    subtotal,
    taxesGst,
    convenienceFee,
    totalBookingAmount,
    adminUpfrontPercentage: validUpfrontPct,
    mandatoryAdvanceDeposit,
    outstandingBalanceDue,
  };
}

export function calculateRefundEstimate(
  booking: BookingOrder,
  daysBeforeDeparture: number,
): CancellationRefundEstimate {
  let refundPercentage = 0;
  let policyTierNote = '';

  if (daysBeforeDeparture >= 30) {
    refundPercentage = 90;
    policyTierNote =
      'Tier 1: 30+ days prior to departure (90% refund minus 10% administrative fee)';
  } else if (daysBeforeDeparture >= 15) {
    refundPercentage = 50;
    policyTierNote = 'Tier 2: 15-29 days prior to departure (50% refund)';
  } else if (daysBeforeDeparture >= 7) {
    refundPercentage = 25;
    policyTierNote = 'Tier 3: 7-14 days prior to departure (25% refund)';
  } else {
    refundPercentage = 0;
    policyTierNote = 'Tier 4: Less than 7 days prior to departure (Strictly non-refundable)';
  }

  const eligibleRefundAmount = Math.round(
    (booking.pricing.totalBookingAmount * refundPercentage) / 100,
  );
  const cancellationFee = booking.pricing.totalBookingAmount - eligibleRefundAmount;

  return {
    bookingId: booking.id,
    daysBeforeDeparture,
    totalAmountPaid: booking.pricing.totalBookingAmount,
    refundPercentage,
    cancellationFee,
    eligibleRefundAmount,
    policyTierNote,
  };
}
