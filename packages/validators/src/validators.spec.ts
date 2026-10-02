// Explore Bharat Safar — Validators & Schemas Test Suite
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  EnvironmentSchema,
  validateEnvironment,
  LoginSchema,
  RegisterSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  VerifyEmailSchema,
  RecoverAccountSchema,
  MfaVerifySchema,
  RefreshTokenSchema,
  ReserveSlotSchema,
  ExperienceFilterSchema,
  CreateBatchSchema,
  CancelBookingSchema,
  WaitlistJoinSchema,
  ApplyCouponSchema,
  VillageQuerySchema,
  VillageSearchSchema,
  VillageUpdateSubmissionSchema,
  VillageModerationActionSchema,
  VillageReviewSchema,
  VillageArtisanSchema,
  VillageHomestaySchema,
  sanitizeVillageDataForPublicDisplay,
  DiscoverySearchQuerySchema,
  NearbyPlacesQuerySchema,
  BoundingBoxQuerySchema,
  CreatePaymentIntentSchema,
  VerifyPaymentSignatureSchema,
  ProcessRefundSchema,
  SuperAdminPaymentControlsSchema,
  PaymentHistoryQuerySchema,
  GenerateCertificateSchema,
  BatchFinalizeSchema,
  RevokeCertificateSchema,
  ReissueCertificateSchema,
  PublicCertificateVerifySchema,
  CertificateSearchQuerySchema,
  CertificateSuperAdminControlsSchema,
  CERTIFICATE_NUMBER_REGEX,
  USERNAME_REGEX,
  HASHTAG_REGEX,
  UpdateProfileSchema,
  CreatePostSchema,
  UpdatePostSchema,
  CreateCommunitySchema,
  FeedQuerySchema,
  SearchTravellerQuerySchema,
  HashtagFeedQuerySchema,
  UploadMediaPreSignedSchema,
} from './index';

describe('Environment Schema Validation (EBS-DOC-28-ENV)', () => {
  it('should validate valid environment configuration with defaults', () => {
    const validConfig = {
      NODE_ENV: 'development',
      PORT: '4000',
      DATABASE_URL: 'postgresql://usr:pwd@localhost:5432/ebs_db',
      REDIS_HOST: 'localhost',
      REDIS_PORT: '6379',
      REDIS_PASSWORD: 'local_dev_redis_secret_password_16chars',
    };

    const parsed = EnvironmentSchema.parse(validConfig);
    assert.equal(parsed.PORT, 4000); // Coerced from string
    assert.equal(parsed.NODE_ENV, 'development');
    assert.equal(parsed.REDIS_PORT, 6379);

    const validated = validateEnvironment(validConfig);
    assert.equal(validated.PORT, 4000);
  });

  it('should fail-fast and throw error on invalid configuration in test mode', () => {
    const invalidConfig = {
      NODE_ENV: 'test',
      DATABASE_URL: 'invalid-url',
    };

    assert.throws(() => {
      validateEnvironment(invalidConfig);
    }, /Malformed Environment Configuration/);
  });

  it('should reject invalid DATABASE_URL not starting with postgresql://', () => {
    const invalidConfig = {
      DATABASE_URL: 'mysql://usr:pwd@localhost:3306/db',
    };

    const result = EnvironmentSchema.safeParse(invalidConfig);
    assert.equal(result.success, false);
  });

  it('should reject REDIS_PASSWORD shorter than 16 chars', () => {
    const invalidConfig = {
      DATABASE_URL: 'postgresql://localhost:5432/db',
      REDIS_PASSWORD: 'short',
    };

    const result = EnvironmentSchema.safeParse(invalidConfig);
    assert.equal(result.success, false);
  });
});

describe('Auth Validation Schemas', () => {
  it('should accept valid login credentials', () => {
    const valid = LoginSchema.safeParse({
      email: 'explorer@bharat.in',
      password: 'StrongPassword123!',
    });
    assert.equal(valid.success, true);
  });

  it('should accept valid login with TOTP code', () => {
    const valid = LoginSchema.safeParse({
      email: 'admin@bharat.in',
      password: 'StrongPassword123!',
      totpCode: '123456',
    });
    assert.equal(valid.success, true);
  });

  it('should reject malformed email and empty password', () => {
    const invalid = LoginSchema.safeParse({
      email: 'not-an-email',
      password: '',
    });
    assert.equal(invalid.success, false);
  });

  it('should validate Indian mobile numbers on registration', () => {
    const validUser = RegisterSchema.safeParse({
      fullName: 'Siddharth Patil',
      email: 'siddharth@bharat.in',
      password: 'SecurePassword1@',
      phoneNumber: '+919876543210',
      role: 'TRAVELLER',
    });
    assert.equal(validUser.success, true);

    const validUserLocal = RegisterSchema.safeParse({
      fullName: 'Siddharth Patil',
      email: 'siddharth@bharat.in',
      password: 'SecurePassword1@',
      phoneNumber: '9876543210',
      role: 'TRAVELLER',
    });
    assert.equal(validUserLocal.success, true);

    const invalidPhone = RegisterSchema.safeParse({
      fullName: 'Siddharth Patil',
      email: 'siddharth@bharat.in',
      password: 'SecurePassword1@',
      phoneNumber: '1234567890', // Invalid prefix
    });
    assert.equal(invalidPhone.success, false);
  });

  it('should reject short or non-complex passwords in registration', () => {
    const tooShort = RegisterSchema.safeParse({
      fullName: 'Test User',
      email: 'test@bharat.in',
      password: 'Short1!', // Less than 12 chars
    });
    assert.equal(tooShort.success, false);

    const noSpecial = RegisterSchema.safeParse({
      fullName: 'Test User',
      email: 'test@bharat.in',
      password: 'Password12345', // Missing special char
    });
    assert.equal(noSpecial.success, false);
  });

  it('should validate ForgotPasswordSchema', () => {
    assert.equal(ForgotPasswordSchema.safeParse({ email: 'user@bharat.in' }).success, true);
    assert.equal(ForgotPasswordSchema.safeParse({ email: 'invalid' }).success, false);
  });

  it('should validate ResetPasswordSchema', () => {
    const valid = ResetPasswordSchema.safeParse({
      token: 'valid-reset-token-hex',
      newPassword: 'BrandNewSecurePassword1!',
    });
    assert.equal(valid.success, true);

    const invalid = ResetPasswordSchema.safeParse({
      token: '',
      newPassword: 'short',
    });
    assert.equal(invalid.success, false);
  });

  it('should validate VerifyEmailSchema', () => {
    assert.equal(VerifyEmailSchema.safeParse({ token: 'abc-123' }).success, true);
    assert.equal(VerifyEmailSchema.safeParse({ token: '' }).success, false);
  });

  it('should validate RecoverAccountSchema', () => {
    const valid = RecoverAccountSchema.safeParse({
      email: 'user@bharat.in',
      recoveryCode: 'REC-987654',
      newPassword: 'RecoveredPassword123!',
    });
    assert.equal(valid.success, true);
  });

  it('should validate MfaVerifySchema', () => {
    assert.equal(MfaVerifySchema.safeParse({ totpCode: '123456' }).success, true);
    assert.equal(MfaVerifySchema.safeParse({ totpCode: '12345' }).success, false); // 5 digits
    assert.equal(MfaVerifySchema.safeParse({ totpCode: 'abcdef' }).success, false); // letters
  });

  it('should validate RefreshTokenSchema', () => {
    assert.equal(RefreshTokenSchema.safeParse({ refreshToken: 'tok_123' }).success, true);
    assert.equal(RefreshTokenSchema.safeParse({ refreshToken: '' }).success, false);
  });
});

describe('Booking Validation Schemas', () => {
  it('should reject slot counts exceeding maximum allowed limit', () => {
    const result = ReserveSlotSchema.safeParse({
      batchId: '123e4567-e89b-12d3-a456-426614174000',
      slots: 15, // Max is 10
      participantNames: ['Explorer 1'],
      emergencyContact: {
        name: 'Contact',
        phone: '+919876543210',
      },
    });
    assert.equal(result.success, false);
  });

  it('should validate full ReserveSlotSchema with participants and medical notes', () => {
    const result = ReserveSlotSchema.safeParse({
      batchId: '123e4567-e89b-12d3-a456-426614174000',
      participants: [
        {
          fullName: 'Sanjay Deshmukh',
          age: 32,
          gender: 'MALE',
          emergencyContactName: 'Aarti Deshmukh',
          emergencyContactPhone: '+919822012345',
          foodPreference: 'VEG',
          experienceLevel: 'INTERMEDIATE',
          medicalDeclarations: 'Mild allergy to penicillin',
        },
      ],
      addonIds: ['addon-sleeping-bag'],
      couponCode: 'DIWALI2026',
      termsAccepted: true,
      termsVersion: '2026.1',
    });
    assert.equal(result.success, true);
  });

  it('should reject participant with age under 5 or above 99', () => {
    const resultUnder = ReserveSlotSchema.safeParse({
      batchId: '123e4567-e89b-12d3-a456-426614174000',
      participants: [
        {
          fullName: 'Child',
          age: 3, // Under 5
          gender: 'MALE',
          emergencyContactName: 'Parent',
          emergencyContactPhone: '+919822012345',
        },
      ],
    });
    assert.equal(resultUnder.success, false);
  });

  it('should validate ExperienceFilterSchema with defaults and coercion', () => {
    const parsed = ExperienceFilterSchema.parse({
      difficulty: 'MODERATE',
      minPrice: '2500',
      maxPrice: '10000',
      durationDays: '3',
    });
    assert.equal(parsed.difficulty, 'MODERATE');
    assert.equal(parsed.minPrice, 2500);
    assert.equal(parsed.maxPrice, 10000);
    assert.equal(parsed.durationDays, 3);
    assert.equal(parsed.page, 1);
    assert.equal(parsed.limit, 20);
  });

  it('should enforce CreateBatchSchema date constraints (end date >= start date)', () => {
    const validBatch = CreateBatchSchema.safeParse({
      experienceId: '123e4567-e89b-12d3-a456-426614174000',
      batchStartDate: '2026-10-15',
      batchEndDate: '2026-10-18',
      reportingTime: '06:00 AM at Basecamp',
      totalCapacity: 20,
      batchPriceInr: 4500,
    });
    assert.equal(validBatch.success, true);

    const invalidBatch = CreateBatchSchema.safeParse({
      experienceId: '123e4567-e89b-12d3-a456-426614174000',
      batchStartDate: '2026-10-18',
      batchEndDate: '2026-10-15', // End before start
      reportingTime: '06:00 AM',
      totalCapacity: 20,
      batchPriceInr: 4500,
    });
    assert.equal(invalidBatch.success, false);
  });

  it('should validate CancelBookingSchema and require confirmCancellation', () => {
    const valid = CancelBookingSchema.safeParse({
      reason: 'Medical emergency in family prevents travel',
      confirmCancellation: true,
    });
    assert.equal(valid.success, true);

    const invalid = CancelBookingSchema.safeParse({
      reason: 'Medical emergency',
      confirmCancellation: false,
    });
    assert.equal(invalid.success, false);
  });

  it('should validate WaitlistJoinSchema and ApplyCouponSchema', () => {
    const validWaitlist = WaitlistJoinSchema.safeParse({
      batchId: '123e4567-e89b-12d3-a456-426614174000',
      partySize: 2,
      contactPhone: '+919822012345',
    });
    assert.equal(validWaitlist.success, true);

    const validCoupon = ApplyCouponSchema.safeParse({
      code: 'BHARAT_SUMMIT',
      orderAmount: 6000,
    });
    assert.equal(validCoupon.success, true);

    const invalidCoupon = ApplyCouponSchema.safeParse({
      code: 'invalid code with spaces',
      orderAmount: 6000,
    });
    assert.equal(invalidCoupon.success, false);
  });
});

describe('Payment Validation Schemas (EBS-DOC-21-PAY)', () => {
  it('should validate CreatePaymentIntentSchema with default values', () => {
    const valid = CreatePaymentIntentSchema.safeParse({
      orderId: 'ord-2026-9041',
      amountInr: 2850,
      customerPhone: '+919876543210',
      customerEmail: 'traveller@bharat.in',
    });
    assert.equal(valid.success, true);
    if (valid.success) {
      assert.equal(valid.data.gatewayProvider, 'RAZORPAY');
      assert.equal(valid.data.paymentMethod, 'UPI');
    }

    const invalidAmount = CreatePaymentIntentSchema.safeParse({
      orderId: 'ord-2026-9041',
      amountInr: -500, // Negative amount
    });
    assert.equal(invalidAmount.success, false);

    const invalidPhone = CreatePaymentIntentSchema.safeParse({
      orderId: 'ord-2026-9041',
      customerPhone: '9876543210', // Missing +91 prefix
    });
    assert.equal(invalidPhone.success, false);
  });

  it('should validate VerifyPaymentSignatureSchema', () => {
    const valid = VerifyPaymentSignatureSchema.safeParse({
      orderId: 'ord-1001',
      gatewayReference: 'order_O7g9a8F123z',
      gatewayPaymentId: 'pay_O7g9a8F123z',
      gatewaySignature: 'a1b2c3d4e5f60718293a4b5c6d7e8f9a',
    });
    assert.equal(valid.success, true);

    const missingSig = VerifyPaymentSignatureSchema.safeParse({
      orderId: 'ord-1001',
      gatewayReference: 'order_O7g9a8F123z',
      gatewayPaymentId: 'pay_O7g9a8F123z',
      gatewaySignature: '',
    });
    assert.equal(missingSig.success, false);
  });

  it('should validate ProcessRefundSchema constraints', () => {
    const valid = ProcessRefundSchema.safeParse({
      bookingId: 'bkg-torna-01',
      reason: 'Medical fitness advisory precludes high altitude trek',
      refundAmountInr: 2500,
    });
    assert.equal(valid.success, true);

    const tooShortReason = ProcessRefundSchema.safeParse({
      bookingId: 'bkg-torna-01',
      reason: 'sick', // Less than 5 chars
    });
    assert.equal(tooShortReason.success, false);
  });

  it('should enforce SuperAdminPaymentControlsSchema bounds (10% to 100%)', () => {
    const valid = SuperAdminPaymentControlsSchema.safeParse({
      defaultAdvancePercentage: 30,
      primaryGateway: 'RAZORPAY',
      isFailoverEnabled: true,
      autoRefundThresholdInr: 15000,
    });
    assert.equal(valid.success, true);

    const tooLowPct = SuperAdminPaymentControlsSchema.safeParse({
      defaultAdvancePercentage: 5, // Below 10%
      primaryGateway: 'RAZORPAY',
      isFailoverEnabled: true,
      autoRefundThresholdInr: 10000,
    });
    assert.equal(tooLowPct.success, false);

    const tooHighPct = SuperAdminPaymentControlsSchema.safeParse({
      defaultAdvancePercentage: 105, // Above 100%
      primaryGateway: 'RAZORPAY',
      isFailoverEnabled: true,
      autoRefundThresholdInr: 10000,
    });
    assert.equal(tooHighPct.success, false);
  });

  it('should coerce and paginate PaymentHistoryQuerySchema', () => {
    const parsed = PaymentHistoryQuerySchema.parse({
      page: '3',
      limit: '50',
      status: 'SUCCESS',
    });
    assert.equal(parsed.page, 3);
    assert.equal(parsed.limit, 50);
    assert.equal(parsed.status, 'SUCCESS');
  });
});

describe('Village Query Schema', () => {
  it('should coerce and paginate village parameters safely', () => {
    const parsed = VillageQuerySchema.parse({
      lgdCode: '123456',
      page: '2',
      limit: '50',
    });

    assert.equal(parsed.lgdCode, 123456);
    assert.equal(parsed.page, 2);
    assert.equal(parsed.limit, 50);
  });

  it('should validate VillageSearchSchema with pincode and talukaId', () => {
    const valid = VillageSearchSchema.safeParse({
      q: 'Velhe',
      pincode: '412212',
      talukaId: 't-velhe-1',
      page: '1',
      limit: '20',
    });
    assert.equal(valid.success, true);
    if (valid.success) {
      assert.equal(valid.data.pincode, '412212');
      assert.equal(valid.data.limit, 20);
    }

    const invalidPin = VillageSearchSchema.safeParse({
      pincode: '41221', // Not 6 digits
    });
    assert.equal(invalidPin.success, false);
  });

  it('should validate VillageUpdateSubmissionSchema with valid updateType', () => {
    const valid = VillageUpdateSubmissionSchema.safeParse({
      updateType: 'PUBLIC_FACILITY_MODIFICATION',
      payload: { hasPHC: true, ambulanceAvailable: true },
      editorialNotes: 'New PHC sub-centre opened',
    });
    assert.equal(valid.success, true);

    const invalid = VillageUpdateSubmissionSchema.safeParse({
      updateType: 'INVALID_TYPE',
      payload: {},
    });
    assert.equal(invalid.success, false);
  });

  it('should validate VillageModerationActionSchema with mandatory comments', () => {
    const validApprove = VillageModerationActionSchema.safeParse({
      action: 'APPROVE',
      comments: 'Verified with Gram Sevak documents.',
    });
    assert.equal(validApprove.success, true);

    const tooShortComment = VillageModerationActionSchema.safeParse({
      action: 'REJECT',
      comments: 'No', // Min 5 chars
    });
    assert.equal(tooShortComment.success, false);
  });

  it('should validate 10-dimensional ratings in VillageReviewSchema', () => {
    const validReview = VillageReviewSchema.safeParse({
      ratings: {
        cleanliness: 4.5,
        hospitality: 5.0,
        nature: 4.8,
        safety: 4.9,
        food: 4.0,
        accessibility: 3.5,
        photography: 5.0,
        culturalPreservation: 4.7,
        adventure: 4.2,
        overall: 4.6,
      },
      reviewText: 'Incredible village experience with deep historical temples and warm locals.',
    });
    assert.equal(validReview.success, true);

    const invalidScore = VillageReviewSchema.safeParse({
      ratings: {
        cleanliness: 6.0, // Exceeds 5.0
        hospitality: 5.0,
        nature: 4.8,
        safety: 4.9,
        food: 4.0,
        accessibility: 3.5,
        photography: 5.0,
        culturalPreservation: 4.7,
        adventure: 4.2,
        overall: 4.6,
      },
      reviewText: 'Valid review length text',
    });
    assert.equal(invalidScore.success, false);
  });

  it('should validate VillageArtisanSchema correctly', () => {
    const validArtisan = VillageArtisanSchema.safeParse({
      artisanName: 'Bhikaji Ramchandra Jadhav',
      craftCategory: 'PAINTING',
      craftTitle: 'Master Warli Ochre Muralist',
      isMasterArtisan: true,
      yearsOfExperience: 34,
      recognitionAwards: ['State Handicrafts Award 2018', 'Hastakala Ratna 2021'],
      bio: 'Practicing indigenous monochromatic ritual wall murals using rice paste and bamboo pens.',
      specialties: ['Wedding Tarpa Dance Murals', 'Harvest Ritual Triptychs'],
      hasGiTag: true,
      giTagRegistrationNumber: 'GI-WARLI-MH-2014',
      workshopAddress: 'Near Sacred Grove, North Gaothan, Velhe',
      contactPhone: '+91-20-XXXX-7734',
      rawMaterials: ['Rice paste', 'Water', 'Bamboo twigs', 'Red ochre earth'],
    });
    assert.equal(validArtisan.success, true);

    const invalidArtisan = VillageArtisanSchema.safeParse({
      artisanName: 'B', // Too short
      craftCategory: 'INVALID_CATEGORY',
    });
    assert.equal(invalidArtisan.success, false);
  });

  it('should validate VillageHomestaySchema with directory-only constraint', () => {
    const validHomestay = VillageHomestaySchema.safeParse({
      name: 'Sahyadri Foothills Heritage Lodge',
      hostName: 'Anand & Sunita Shinde',
      hostBio:
        'Traditional agricultural family hosting conscious travellers with home-cooked Pithla Bhakri.',
      maxGuestCapacity: 12,
      roomCount: 4,
      tariffRange: '₹1,200 – ₹2,000 / night',
      addressDescription: 'Gaothan Plot 12, Near Stepwell, Velhe',
      contactPhone: '+91-20-XXXX-5521',
      amenities: ['Chulha Cooking', 'Solar Hot Water', 'Verandah Charpai'],
      houseRules: ['No alcohol in Gaothan premises', 'Remove shoes outside living quarters'],
      culturalGuidelines: [
        'Modest dress code in village square',
        'Seek permission before photographing elders',
      ],
      isBookingDisabled: true,
    });
    assert.equal(validHomestay.success, true);
    if (validHomestay.success) {
      assert.equal(validHomestay.data.isBookingDisabled, true);
      assert.equal(validHomestay.data.maxGuestCapacity, 12);
    }
  });

  it('should validate VillageUpdateSubmissionSchema with ARTISAN_UPDATE and HOMESTAY_UPDATE', () => {
    const validArtisanUpdate = VillageUpdateSubmissionSchema.safeParse({
      updateType: 'ARTISAN_UPDATE',
      payload: { artisanName: 'Bhikaji Jadhav', craftCategory: 'PAINTING' },
      editorialNotes: 'Registered Master Artisan update',
    });
    assert.equal(validArtisanUpdate.success, true);

    const validHomestayUpdate = VillageUpdateSubmissionSchema.safeParse({
      updateType: 'HOMESTAY_UPDATE',
      payload: { name: 'Sahyadri Lodge', maxGuestCapacity: 10 },
      editorialNotes: 'Capacity expansion to 10 guests',
    });
    assert.equal(validHomestayUpdate.success, true);
  });

  it('should strip sensitive PII under DPDP Act 2023 compliance including financial and private contacts', () => {
    const dirtyData = {
      villageName: 'Velhe',
      gramPanchayatOfficePhone: '02144-223101',
      sarpanchAadhaar: '1234-5678-9012',
      personalMobile: '+919999988888',
      privateMobile: '+918888877777',
      residentialAddress: 'House 14, Lane 2',
      privateAddress: 'Secret Villa 42',
      bankAccount: '1234567890123456',
      creditCard: '4111-2222-3333-4444',
      accountNumber: '9876543210',
    };

    const sanitized = sanitizeVillageDataForPublicDisplay(dirtyData);
    assert.equal(sanitized.villageName, 'Velhe');
    assert.equal(sanitized.gramPanchayatOfficePhone, '02144-223101');
    assert.equal((sanitized as Record<string, unknown>).sarpanchAadhaar, undefined);
    assert.equal((sanitized as Record<string, unknown>).personalMobile, undefined);
    assert.equal((sanitized as Record<string, unknown>).privateMobile, undefined);
    assert.equal((sanitized as Record<string, unknown>).residentialAddress, undefined);
    assert.equal((sanitized as Record<string, unknown>).privateAddress, undefined);
    assert.equal((sanitized as Record<string, unknown>).bankAccount, undefined);
    assert.equal((sanitized as Record<string, unknown>).creditCard, undefined);
    assert.equal((sanitized as Record<string, unknown>).accountNumber, undefined);
  });

  it('should recursively strip sensitive PII from deeply nested objects and arrays per DPDP Act 2023', () => {
    const deeplyNestedData = {
      villageName: 'Velhe',
      panchayat: {
        officeAddress: 'Main Bazaar Road',
        sarpanchAadhaar: '9999-8888-7777',
        contact: {
          officialOfficePhone: '02144-223101',
          personalMobile: '+919999988888',
          residentialAddress: 'House 5, Brahmin Ali',
        },
      },
      officials: [
        {
          name: 'Sunil More',
          role: 'Gram Sevak',
          privateMobile: '+918888877777',
          bankAccount: '1234567890123456',
        },
        {
          name: 'Rajendra Patil',
          role: 'Sarpanch',
          panNumber: 'ABCDE1234F',
        },
      ],
    };

    const sanitized = sanitizeVillageDataForPublicDisplay(
      deeplyNestedData,
    ) as typeof deeplyNestedData;
    assert.equal(sanitized.villageName, 'Velhe');
    assert.equal(sanitized.panchayat.officeAddress, 'Main Bazaar Road');
    assert.equal(sanitized.panchayat.contact.officialOfficePhone, '02144-223101');
    assert.equal((sanitized.panchayat as Record<string, unknown>).sarpanchAadhaar, undefined);
    assert.equal(
      (sanitized.panchayat.contact as Record<string, unknown>).personalMobile,
      undefined,
    );
    assert.equal(
      (sanitized.panchayat.contact as Record<string, unknown>).residentialAddress,
      undefined,
    );
    assert.equal(sanitized.officials[0]?.name, 'Sunil More');
    assert.equal(sanitized.officials[0]?.role, 'Gram Sevak');
    assert.equal((sanitized.officials[0] as Record<string, unknown>).privateMobile, undefined);
    assert.equal((sanitized.officials[0] as Record<string, unknown>).bankAccount, undefined);
    assert.equal(sanitized.officials[1]?.name, 'Rajendra Patil');
    assert.equal((sanitized.officials[1] as Record<string, unknown>).panNumber, undefined);
  });
});

describe('Discovery Validation Schemas', () => {
  it('should validate valid DiscoverySearchQuerySchema', () => {
    const valid = DiscoverySearchQuerySchema.safeParse({
      q: 'Raigad Fort',
      level: 'place',
      category: 'fort',
      limit: '15',
    });
    assert.equal(valid.success, true);
    if (valid.success) {
      assert.equal(valid.data.q, 'Raigad Fort');
      assert.equal(valid.data.limit, 15);
    }
  });

  it('should reject search queries with less than 2 characters', () => {
    const invalid = DiscoverySearchQuerySchema.safeParse({
      q: 'a',
    });
    assert.equal(invalid.success, false);
  });

  it('should validate NearbyPlacesQuerySchema within geographic coordinates', () => {
    const valid = NearbyPlacesQuerySchema.safeParse({
      latitude: '18.2345',
      longitude: '73.4421',
      radiusKm: '25',
    });
    assert.equal(valid.success, true);
    if (valid.success) {
      assert.equal(valid.data.latitude, 18.2345);
      assert.equal(valid.data.radiusKm, 25);
    }
  });

  it('should reject invalid coordinates in NearbyPlacesQuerySchema', () => {
    const invalid = NearbyPlacesQuerySchema.safeParse({
      latitude: 195.0, // Invalid lat > 90
      longitude: 73.0,
    });
    assert.equal(invalid.success, false);
  });

  it('should validate BoundingBoxQuerySchema with valid bounds', () => {
    const valid = BoundingBoxQuerySchema.safeParse({
      minLat: 15.0,
      minLng: 72.0,
      maxLat: 20.0,
      maxLng: 78.0,
    });
    assert.equal(valid.success, true);
  });

  it('should reject BoundingBoxQuerySchema when minLat > maxLat', () => {
    const invalid = BoundingBoxQuerySchema.safeParse({
      minLat: 25.0,
      minLng: 72.0,
      maxLat: 15.0, // Invalid min > max
      maxLng: 78.0,
    });
    assert.equal(invalid.success, false);
  });

  describe('Certificate Validation Schemas (EBS-DOC-20-CERT)', () => {
    const validUuid = '123e4567-e89b-12d3-a456-426614174000';
    const validCertNum = 'EBS-CERT-2026-HARI-8F3A21';

    it('should validate CERTIFICATE_NUMBER_REGEX against valid and invalid formats', () => {
      assert.ok(CERTIFICATE_NUMBER_REGEX.test(validCertNum));
      assert.ok(CERTIFICATE_NUMBER_REGEX.test('EBS-CERT-2026-KALS-ABC123'));
      assert.ok(!CERTIFICATE_NUMBER_REGEX.test('INVALID-CERT-123'));
      assert.ok(!CERTIFICATE_NUMBER_REGEX.test('EBS-CERT-26-HARI-8F3A21')); // Year must be 4 digits
      assert.ok(!CERTIFICATE_NUMBER_REGEX.test('EBS-CERT-2026-H-8F3A21')); // Slug too short
    });

    it('should validate GenerateCertificateSchema with valid UUIDs', () => {
      const valid = GenerateCertificateSchema.safeParse({
        bookingId: validUuid,
        participantId: validUuid,
        batchId: validUuid,
      });
      assert.equal(valid.success, true);

      const invalid = GenerateCertificateSchema.safeParse({
        bookingId: 'not-a-uuid',
        participantId: validUuid,
        batchId: validUuid,
      });
      assert.equal(invalid.success, false);
    });

    it('should validate BatchFinalizeSchema with default markMissingAsAbsent', () => {
      const valid = BatchFinalizeSchema.safeParse({
        batchId: validUuid,
        notes: 'Monsoon trek batch concluded safely at basecamp.',
      });
      assert.equal(valid.success, true);
      if (valid.success) {
        assert.equal(valid.data.markMissingAsAbsent, true);
      }
    });

    it('should validate RevokeCertificateSchema and require min 10 char reason', () => {
      const valid = RevokeCertificateSchema.safeParse({
        certificateNumber: validCertNum,
        reason: 'Issued in error due to participant absence on final summit day.',
      });
      assert.equal(valid.success, true);

      const shortReason = RevokeCertificateSchema.safeParse({
        certificateNumber: validCertNum,
        reason: 'Error', // Less than 10 chars
      });
      assert.equal(shortReason.success, false);

      const invalidCert = RevokeCertificateSchema.safeParse({
        certificateNumber: 'bad-cert',
        reason: 'Issued in error due to participant absence on final summit day.',
      });
      assert.equal(invalidCert.success, false);
    });

    it('should validate ReissueCertificateSchema with optional corrected name', () => {
      const valid = ReissueCertificateSchema.safeParse({
        certificateNumber: validCertNum,
        reason: 'Correction of legal surname per government identity document.',
        correctedName: 'Amitabh Sharma-Patil',
      });
      assert.equal(valid.success, true);
    });

    it('should validate PublicCertificateVerifySchema', () => {
      const valid = PublicCertificateVerifySchema.safeParse({
        certificateNumber: validCertNum,
        hash: '7f8b91a2b3c4d5e6',
      });
      assert.equal(valid.success, true);
    });

    it('should coerce pagination and validate CertificateSearchQuerySchema', () => {
      const valid = CertificateSearchQuerySchema.safeParse({
        q: 'Amitabh',
        status: 'ISSUED',
        page: '2',
        limit: '25',
      });
      assert.equal(valid.success, true);
      if (valid.success) {
        assert.equal(valid.data.page, 2);
        assert.equal(valid.data.limit, 25);
      }
    });

    it('should validate CertificateSuperAdminControlsSchema', () => {
      const valid = CertificateSuperAdminControlsSchema.safeParse({
        autoIssuanceEnabled: true,
        requireAdminBatchFinalize: true,
        directorName: 'Dr. Vikramaditya Joshi',
        leadGuideTitle: 'Chief Expedition Officer',
      });
      assert.equal(valid.success, true);
    });
  });

  describe('Social Platform Validation Schemas (EBS-DOC-15-SOCIAL)', () => {
    it('should validate USERNAME_REGEX correctly', () => {
      assert.ok(USERNAME_REGEX.test('amitabh_sharma'));
      assert.ok(USERNAME_REGEX.test('explorer2026'));
      assert.ok(USERNAME_REGEX.test('sahyadri_king'));
      assert.ok(!USERNAME_REGEX.test('am')); // Too short (< 3)
      assert.ok(!USERNAME_REGEX.test('user@invalid!')); // Invalid characters
      assert.ok(
        !USERNAME_REGEX.test('this_username_is_far_too_long_to_be_allowed_under_standards'),
      ); // > 30
    });

    it('should validate HASHTAG_REGEX correctly', () => {
      assert.ok(HASHTAG_REGEX.test('western_ghats'));
      assert.ok(HASHTAG_REGEX.test('monsoontrek'));
      assert.ok(!HASHTAG_REGEX.test('a')); // Too short
      assert.ok(!HASHTAG_REGEX.test('tag#with#hash')); // Invalid chars
    });

    it('should validate UpdateProfileSchema with valid fields', () => {
      const valid = UpdateProfileSchema.safeParse({
        displayName: 'Amitabh Sharma',
        bio: 'Avid mountaineer exploring the Western Ghats and Sahyadri forts.',
        avatarUrl: 'https://cdn.explorebharatsafar.in/avatars/amitabh.webp',
        homeState: 'Maharashtra',
        homeCity: 'Pune',
        spokenLanguages: ['Marathi', 'Hindi', 'English'],
        isProfilePublic: true,
        isSoloDiscoveryEnabled: true,
      });
      assert.equal(valid.success, true);
    });

    it('should validate CreatePostSchema and enforce 20 char minimum on published journals', () => {
      // Short content on journal must fail
      const invalidShortJournal = CreatePostSchema.safeParse({
        postType: 'EXPEDITION_JOURNAL',
        content: 'Short log',
        status: 'PUBLISHED',
      });
      assert.equal(invalidShortJournal.success, false);

      // Valid long journal
      const validJournal = CreatePostSchema.safeParse({
        title: 'Dawn Ascent of Harishchandragad via Taramati Peak',
        postType: 'EXPEDITION_JOURNAL',
        content:
          'Commenced the trek at 04:30 AM from Khireshwar village under misty skies with roaring winds.',
        visibility: 'PUBLIC',
        status: 'PUBLISHED',
        mediaUrls: ['https://cdn.explorebharatsafar.in/photos/harish1.webp'],
        locationName: 'Harishchandragad, Ahmednagar',
      });
      assert.equal(validJournal.success, true);

      // Short content is allowed for QA or photo showcase
      const validQA = CreatePostSchema.safeParse({
        postType: 'QA',
        content: 'Any water source?',
        status: 'PUBLISHED',
      });
      assert.equal(validQA.success, true);
    });

    it('should reject posts exceeding 10 media attachments', () => {
      const media = Array.from(
        { length: 11 },
        (_, i) => `https://cdn.explorebharatsafar.in/p${i}.jpg`,
      );
      const invalid = CreatePostSchema.safeParse({
        postType: 'PHOTO_SHOWCASE',
        content: 'Photo gallery from monsoon trek',
        mediaUrls: media,
      });
      assert.equal(invalid.success, false);
    });

    it('should validate CreateCommunitySchema', () => {
      const valid = CreateCommunitySchema.safeParse({
        slug: 'sahyadri-fort-guardians',
        title: 'Sahyadri Fort Guardians Collective',
        description:
          'Dedicated to preserving historical bastions and organizing cleanup expeditions.',
        rulesText:
          'Respect historical structures, practice zero-trace mountaineering, and support local villagers.',
        bannerUrl: 'https://cdn.explorebharatsafar.in/guilds/sahyadri-banner.webp',
      });
      assert.equal(valid.success, true);

      const invalidSlug = CreateCommunitySchema.safeParse({
        slug: 'INVALID SLUG WITH SPACES',
        title: 'Test Guild',
        description: 'Test description text here.',
        rulesText: 'Community guidelines text here.',
      });
      assert.equal(invalidSlug.success, false);
    });

    it('should coerce FeedQuerySchema defaults', () => {
      const parsed = FeedQuerySchema.parse({});
      assert.equal(parsed.feedType, 'HOME');
      assert.equal(parsed.limit, 20);

      const custom = FeedQuerySchema.parse({
        feedType: 'FOLLOWING',
        cursor: '1727700000000',
        limit: '15',
      });
      assert.equal(custom.feedType, 'FOLLOWING');
      assert.equal(custom.cursor, '1727700000000');
      assert.equal(custom.limit, 15);
    });

    it('should validate UploadMediaPreSignedSchema with size limits', () => {
      // 5MB image is valid
      const validImage = UploadMediaPreSignedSchema.safeParse({
        mediaType: 'IMAGE',
        mimeType: 'image/webp',
        fileSize: 5 * 1024 * 1024,
      });
      assert.equal(validImage.success, true);

      // 15MB image exceeds 10MB limit
      const invalidLargeImage = UploadMediaPreSignedSchema.safeParse({
        mediaType: 'IMAGE',
        mimeType: 'image/jpeg',
        fileSize: 15 * 1024 * 1024,
      });
      assert.equal(invalidLargeImage.success, false);

      // 45MB video under 60s is valid
      const validVideo = UploadMediaPreSignedSchema.safeParse({
        mediaType: 'VIDEO',
        mimeType: 'video/mp4',
        fileSize: 45 * 1024 * 1024,
        durationSeconds: 45,
      });
      assert.equal(validVideo.success, true);

      // 120MB video exceeds 100MB limit
      const invalidLargeVideo = UploadMediaPreSignedSchema.safeParse({
        mediaType: 'VIDEO',
        mimeType: 'video/mp4',
        fileSize: 120 * 1024 * 1024,
        durationSeconds: 30,
      });
      assert.equal(invalidLargeVideo.success, false);

      // Video exceeding 60s is rejected
      const invalidLongVideo = UploadMediaPreSignedSchema.safeParse({
        mediaType: 'VIDEO',
        mimeType: 'video/mp4',
        fileSize: 20 * 1024 * 1024,
        durationSeconds: 75,
      });
      assert.equal(invalidLongVideo.success, false);
    });
  });
});
