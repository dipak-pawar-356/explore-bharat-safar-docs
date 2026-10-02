// Explore Bharat Safar — Authentication & Identity Validation Schemas
// Reference: EBS-DOC-12-AUTH, EBS-DOC-40-SEC-BLUEPRINT & EBS-BLU-48-BIZ

import { z } from 'zod';

export const PasswordComplexityRegex = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  digit: /[0-9]/,
  special: /[^A-Za-z0-9]/,
};

export const PasswordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters long')
  .max(128, 'Password must not exceed 128 characters')
  .regex(PasswordComplexityRegex.uppercase, 'Password must contain at least one uppercase letter')
  .regex(PasswordComplexityRegex.lowercase, 'Password must contain at least one lowercase letter')
  .regex(PasswordComplexityRegex.digit, 'Password must contain at least one numerical digit')
  .regex(PasswordComplexityRegex.special, 'Password must contain at least one special symbol');

export const EmailSchema = z
  .string()
  .trim()
  .min(5, 'Email must be at least 5 characters')
  .max(254, 'Email must not exceed 254 characters')
  .email('Please enter a valid RFC-compliant email address');

export const IndianMobileSchema = z
  .string()
  .trim()
  .regex(/^(\+91)?[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number');

export const LoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, 'Password is required'),
  totpCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'TOTP code must be a 6-digit number')
    .optional(),
  turnstileToken: z.string().optional(),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters'),
  email: EmailSchema,
  password: PasswordSchema,
  phoneNumber: IndianMobileSchema.optional(),
  role: z.enum(['TRAVELLER', 'VILLAGE_ADMIN', 'LOCAL_GUIDE']).default('TRAVELLER'),
  turnstileToken: z.string().optional(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;

export const VerifyEmailSchema = z.object({
  token: z.string().trim().min(1, 'Verification token is required'),
});

export type VerifyEmailInput = z.infer<typeof VerifyEmailSchema>;

export const ForgotPasswordSchema = z.object({
  email: EmailSchema,
  turnstileToken: z.string().optional(),
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z.object({
  token: z.string().trim().min(1, 'Password reset token is required'),
  newPassword: PasswordSchema,
});

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

export const RecoverAccountSchema = z.object({
  email: EmailSchema,
  recoveryCode: z.string().trim().min(6, 'Recovery code is required'),
  newPassword: PasswordSchema,
});

export type RecoverAccountInput = z.infer<typeof RecoverAccountSchema>;

export const MfaVerifySchema = z.object({
  totpCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'TOTP code must be 6 numerical digits'),
  tempMfaToken: z.string().optional(),
});

export type MfaVerifyInput = z.infer<typeof MfaVerifySchema>;

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: PasswordSchema,
});

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
