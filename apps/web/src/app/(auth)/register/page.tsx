'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiRegister } from '../../../lib/auth-client';
import { useAuthStore } from '../../../store/auth.store';
import { RegisterSchema } from '@ebs/validators';
import { UserRole, AccountStatus } from '@ebs/types';

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore(state => state.setAuth);

  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [role, setRole] = React.useState<UserRole>(UserRole.TRAVELLER);
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  // Password complexity helpers
  const hasMinLength = password.length >= 12;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSuccessMessage(null);

    const validation = RegisterSchema.safeParse({
      fullName,
      email,
      password,
      phoneNumber: phoneNumber ? phoneNumber.trim() : undefined,
      role,
    });

    if (!validation.success) {
      const formatted = validation.error.format();
      const errors: Record<string, string> = {};
      if (formatted.fullName?._errors?.[0]) errors.fullName = formatted.fullName._errors[0];
      if (formatted.email?._errors?.[0]) errors.email = formatted.email._errors[0];
      if (formatted.password?._errors?.[0]) errors.password = formatted.password._errors[0];
      if (formatted.phoneNumber?._errors?.[0])
        errors.phoneNumber = formatted.phoneNumber._errors[0];
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const authData = await apiRegister({
        fullName,
        email,
        password,
        phoneNumber: phoneNumber ? phoneNumber.trim() : undefined,
        role,
      });

      const user = {
        id: authData.user.id,
        email: authData.user.email,
        isEmailVerified: Boolean(authData.user.isEmailVerified),
        isPhoneVerified: false,
        status: AccountStatus.ACTIVE,
        roles: authData.user.roles || [UserRole.TRAVELLER],
        assignedVillageId: authData.user.assignedVillageId,
        fullName: authData.user.fullName || fullName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setAuth(user, authData.accessToken);
      setSuccessMessage('Account successfully created! Verification link sent to your email.');
      setTimeout(() => router.push('/'), 1200);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Registration failed. Please check your information and try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 font-bold text-xl mb-2">
          🇮🇳
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Create Explorer Passport
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Join Bharat’s Sovereign Digital Cultural & Travel Discovery Ecosystem
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl text-xs text-rose-700 dark:text-rose-300 font-medium"
        >
          {error}
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl text-xs text-emerald-700 dark:text-emerald-300 font-medium"
        >
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        <div>
          <label
            htmlFor="fullName"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
          >
            Full Legal Name
          </label>
          <input
            id="fullName"
            type="text"
            required
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Aaditya Sharma"
            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
          />
          {fieldErrors.fullName && (
            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{fieldErrors.fullName}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="aaditya@bharat.in"
            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
          />
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="phoneNumber"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
          >
            Mobile Number (Optional)
          </label>
          <input
            id="phoneNumber"
            type="tel"
            value={phoneNumber}
            onChange={e => setPhoneNumber(e.target.value)}
            placeholder="+919876543210"
            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
          />
          {fieldErrors.phoneNumber && (
            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
              {fieldErrors.phoneNumber}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="role"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
          >
            Passport Purpose / Role
          </label>
          <select
            id="role"
            value={role}
            onChange={e => setRole(e.target.value as UserRole)}
            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
          >
            <option value={UserRole.TRAVELLER}>Explorer / Traveller</option>
            <option value={UserRole.LOCAL_GUIDE}>Local Heritage Guide</option>
            <option value={UserRole.VILLAGE_ADMIN}>Village Administrator</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
          >
            Secure Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Min 12 chars (A-Z, a-z, 0-9, symbol)"
            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
          />
          {fieldErrors.password && (
            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{fieldErrors.password}</p>
          )}

          {/* Real-time complexity check */}
          <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px]">
            <span
              className={hasMinLength ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}
            >
              ✓ 12+ characters
            </span>
            <span
              className={hasUpper ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}
            >
              ✓ Uppercase letter
            </span>
            <span
              className={hasLower ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}
            >
              ✓ Lowercase letter
            </span>
            <span
              className={
                hasDigit && hasSpecial ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
              }
            >
              ✓ Number & Symbol
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-600/20 hover:shadow-amber-600/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Passport...' : 'Create Explorer Account'}
        </button>
      </form>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
        Already registered?{' '}
        <Link
          href="/login"
          className="font-semibold text-amber-600 dark:text-amber-400 hover:underline"
        >
          Sign In &rarr;
        </Link>
      </div>
    </div>
  );
}
