import { z } from 'zod';
export declare const PasswordComplexityRegex: {
    uppercase: RegExp;
    lowercase: RegExp;
    digit: RegExp;
    special: RegExp;
};
export declare const PasswordSchema: z.ZodString;
export declare const EmailSchema: z.ZodString;
export declare const IndianMobileSchema: z.ZodString;
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    totpCode: z.ZodOptional<z.ZodString>;
    turnstileToken: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    totpCode?: string | undefined;
    turnstileToken?: string | undefined;
}, {
    email: string;
    password: string;
    totpCode?: string | undefined;
    turnstileToken?: string | undefined;
}>;
export type LoginInput = z.infer<typeof LoginSchema>;
export declare const RegisterSchema: z.ZodObject<{
    fullName: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    phoneNumber: z.ZodOptional<z.ZodString>;
    role: z.ZodDefault<z.ZodEnum<["TRAVELLER", "VILLAGE_ADMIN", "LOCAL_GUIDE"]>>;
    turnstileToken: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    fullName: string;
    role: "TRAVELLER" | "VILLAGE_ADMIN" | "LOCAL_GUIDE";
    turnstileToken?: string | undefined;
    phoneNumber?: string | undefined;
}, {
    email: string;
    password: string;
    fullName: string;
    turnstileToken?: string | undefined;
    phoneNumber?: string | undefined;
    role?: "TRAVELLER" | "VILLAGE_ADMIN" | "LOCAL_GUIDE" | undefined;
}>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export declare const RefreshTokenSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;
export declare const VerifyEmailSchema: z.ZodObject<{
    token: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
}, {
    token: string;
}>;
export type VerifyEmailInput = z.infer<typeof VerifyEmailSchema>;
export declare const ForgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
    turnstileToken: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    turnstileToken?: string | undefined;
}, {
    email: string;
    turnstileToken?: string | undefined;
}>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export declare const ResetPasswordSchema: z.ZodObject<{
    token: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
    newPassword: string;
}, {
    token: string;
    newPassword: string;
}>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
export declare const RecoverAccountSchema: z.ZodObject<{
    email: z.ZodString;
    recoveryCode: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    newPassword: string;
    recoveryCode: string;
}, {
    email: string;
    newPassword: string;
    recoveryCode: string;
}>;
export type RecoverAccountInput = z.infer<typeof RecoverAccountSchema>;
export declare const MfaVerifySchema: z.ZodObject<{
    totpCode: z.ZodString;
    tempMfaToken: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    totpCode: string;
    tempMfaToken?: string | undefined;
}, {
    totpCode: string;
    tempMfaToken?: string | undefined;
}>;
export type MfaVerifyInput = z.infer<typeof MfaVerifySchema>;
export declare const ChangePasswordSchema: z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    newPassword: string;
    currentPassword: string;
}, {
    newPassword: string;
    currentPassword: string;
}>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
//# sourceMappingURL=auth.schema.d.ts.map