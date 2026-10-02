'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiLogin } from '../../../lib/auth-client';
import { useAuthStore } from '../../../store/auth.store';
import { LoginSchema } from '@ebs/validators';
import { UserRole, AccountStatus } from '@ebs/types';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore(state => state.setAuth);

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [totpCode, setTotpCode] = React.useState('');
  const [showTotp, setShowTotp] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Client-side schema validation via @ebs/validators
    const validation = LoginSchema.safeParse({
      email,
      password,
      totpCode: showTotp && totpCode ? totpCode : undefined,
    });

    if (!validation.success) {
      const formatted = validation.error.format();
      const errors: Record<string, string> = {};
      if (formatted.email?._errors?.[0]) errors.email = formatted.email._errors[0];
      if (formatted.password?._errors?.[0]) errors.password = formatted.password._errors[0];
      if (formatted.totpCode?._errors?.[0]) errors.totpCode = formatted.totpCode._errors[0];
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const authData = await apiLogin({
        email,
        password,
        totpCode: showTotp && totpCode ? totpCode : undefined,
      });

      if (authData.mfaRequired) {
        setShowTotp(true);
        setError(
          'Multi-factor authentication code required. Please enter the 6-digit code from your authenticator app.',
        );
        setLoading(false);
        return;
      }

      // Populate user store
      const user = {
        id: authData.user.id,
        email: authData.user.email,
        isEmailVerified: Boolean(authData.user.isEmailVerified),
        isPhoneVerified: false,
        status: AccountStatus.ACTIVE,
        roles: authData.user.roles || [UserRole.TRAVELLER],
        assignedVillageId: authData.user.assignedVillageId,
        fullName: authData.user.fullName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setAuth(user, authData.accessToken);
      router.push('/');
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Authentication failed. Please check your credentials.';
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
          Explorer Passport Login
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Sign in to your sovereign Explore Bharat Safar account
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

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
          >
            Registered Email Address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="explorer@bharat.in"
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
          />
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Password
            </label>
            <Link
              href="/reset-password"
              className="text-xs text-amber-600 dark:text-amber-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
          />
          {fieldErrors.password && (
            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{fieldErrors.password}</p>
          )}
        </div>

        {showTotp && (
          <div>
            <label
              htmlFor="totpCode"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              6-Digit Authenticator Code (TOTP)
            </label>
            <input
              id="totpCode"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={totpCode}
              onChange={e => setTotpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full tracking-widest text-center font-mono px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-amber-300 dark:border-amber-700 rounded-xl text-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
            {fieldErrors.totpCode && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                {fieldErrors.totpCode}
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-600/20 hover:shadow-amber-600/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? 'Authenticating...'
            : showTotp
              ? 'Verify & Sign In'
              : 'Sign In to Explorer Passport'}
        </button>
      </form>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
        New explorer?{' '}
        <Link
          href="/register"
          className="font-semibold text-amber-600 dark:text-amber-400 hover:underline"
        >
          Create an Account &rarr;
        </Link>
      </div>
    </div>
  );
}
