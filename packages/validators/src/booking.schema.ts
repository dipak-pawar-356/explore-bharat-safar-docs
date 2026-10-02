// Explore Bharat Safar — Section 3: Travel Booking Engine Validation Schemas
// Reference: EBS-DOC-14-BOOKING, EBS-BLU-43-BKG, EBS-DOC-26-RULES, EBS-DOC-48-VAL

import { z } from 'zod';

export const ParticipantSchema = z.object({
  fullName: z.string().min(2, 'Full name must have at least 2 characters').max(150),
  age: z
    .number()
    .int()
    .min(5, 'Participant age must be between 5 and 99')
    .max(99, 'Participant age must be between 5 and 99'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  dateOfBirth: z.string().optional(),
  emergencyContactName: z.string().min(2, 'Emergency contact name required'),
  emergencyContactPhone: z.string().regex(/^(\+91)?[6-9]\d{9}$/, 'Invalid Indian mobile number'),
  foodPreference: z.enum(['VEG', 'NON_VEG', 'JAIN']).default('VEG'),
  experienceLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('BEGINNER'),
  medicalDeclarations: z.string().max(1000).optional(),
  specialNotes: z.string().max(500).optional(),
});

export type ParticipantInput = z.infer<typeof ParticipantSchema>;

export const ReserveSlotSchema = z
  .object({
    batchId: z.string().uuid('Invalid batch UUID'),
    slots: z
      .number()
      .int()
      .min(1)
      .max(10, 'Maximum 10 slots per single booking reservation')
      .optional(),
    participantNames: z.array(z.string().min(2)).min(1).optional(),
    emergencyContact: z
      .object({
        name: z.string().min(2),
        phone: z.string().regex(/^(\+91)?[6-9]\d{9}$/, 'Invalid Indian mobile number'),
      })
      .optional(),
    participants: z
      .array(ParticipantSchema)
      .min(1, 'At least one participant required')
      .max(10, 'Maximum 10 participants per booking')
      .optional(),
    addonIds: z.array(z.string()).optional(),
    couponCode: z.string().min(3).max(20).optional(),
    termsAccepted: z.boolean().optional(),
    termsVersion: z.string().optional(),
  })
  .refine(
    data => {
      // Must either have participants or participantNames or slots
      if (data.slots !== undefined && data.slots > 10) return false;
      if (data.participants && data.participants.length > 10) return false;
      return true;
    },
    { message: 'Maximum 10 slots allowed per reservation' },
  );

export type ReserveSlotInput = z.infer<typeof ReserveSlotSchema>;

export const ExperienceFilterSchema = z.object({
  q: z.string().max(100).optional(),
  category: z.string().max(50).optional(),
  experienceType: z
    .enum(['TREK', 'HERITAGE_WALK', 'RURAL_HOMESTAY', 'EXPEDITION', 'CAMPING', 'WILDLIFE_SAFARI'])
    .optional(),
  difficulty: z.enum(['EASY', 'MODERATE', 'DIFFICULT', 'CHALLENGING', 'TECHNICAL']).optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  maxAltitude: z.coerce.number().positive().optional(),
  durationDays: z.coerce.number().int().positive().optional(),
  stateSlug: z.string().max(50).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ExperienceFilterInput = z.infer<typeof ExperienceFilterSchema>;

export const CreateBatchSchema = z
  .object({
    experienceId: z.string().uuid('Invalid experience UUID'),
    batchStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    batchEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    reportingTime: z.string().min(2).max(50),
    totalCapacity: z.number().int().min(1, 'Total capacity must be at least 1').max(100),
    batchPriceInr: z.number().positive('Batch price must be positive'),
    leadGuideUserId: z.string().uuid().optional(),
  })
  .refine(data => new Date(data.batchEndDate) >= new Date(data.batchStartDate), {
    message: 'Batch end date must be on or after start date',
    path: ['batchEndDate'],
  });

export type CreateBatchInput = z.infer<typeof CreateBatchSchema>;

export const UpdateBatchSchema = z.object({
  totalCapacity: z.number().int().min(1).max(100).optional(),
  batchPriceInr: z.number().positive().optional(),
  status: z.enum(['OPEN', 'FILLING_FAST', 'SOLD_OUT', 'COMPLETED', 'CANCELLED']).optional(),
  leadGuideUserId: z.string().uuid().optional(),
});

export type UpdateBatchInput = z.infer<typeof UpdateBatchSchema>;

export const CancelBookingSchema = z.object({
  reason: z.string().min(5, 'Reason must be at least 5 characters').max(500),
  confirmCancellation: z.literal(true, {
    errorMap: () => ({ message: 'You must confirm cancellation' }),
  }),
});

export type CancelBookingInput = z.infer<typeof CancelBookingSchema>;

export const WaitlistJoinSchema = z.object({
  batchId: z.string().uuid('Invalid batch UUID'),
  partySize: z.number().int().min(1).max(10),
  contactPhone: z.string().regex(/^(\+91)?[6-9]\d{9}$/, 'Invalid Indian mobile number'),
});

export type WaitlistJoinInput = z.infer<typeof WaitlistJoinSchema>;

export const ApplyCouponSchema = z.object({
  code: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[A-Z0-9_-]+$/, 'Coupon code must be uppercase alphanumeric'),
  orderAmount: z.number().positive(),
});

export type ApplyCouponInput = z.infer<typeof ApplyCouponSchema>;

export const CheckoutPaymentSchema = z.object({
  orderId: z.string().uuid('Invalid order UUID'),
  idempotencyKey: z.string().uuid('Idempotency key must be a valid UUID v4'),
  paymentMethod: z.enum(['UPI', 'NETBANKING', 'CARD']),
  amountPaise: z.number().int().positive('Payment amount in paise must be positive'),
});

export type CheckoutPaymentInput = z.infer<typeof CheckoutPaymentSchema>;
