'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiVerifyMfa } from '../../../lib/auth-client';
import { useAuthStore } from '../../../store/auth.store';
import { MfaVerifySchema } from '@ebs/validators';
import { UserRole, AccountStatus } from '@ebs/types';

function MfaChallengeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tempMfaToken = searchParams.get('tempToken') || '';
  const setAuth = useAuthStore(state => state.setAuth);

  const [totpCode, setTotpCode] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = MfaVerifySchema.safeParse({
      totpCode,
      tempMfaToken: tempMfaToken || undefined,
    });
    if (!validation.success) {
      setError(validation.error.errors[0]?.message || 'Please enter a valid 6-digit TOTP code.');
      return;
    }

    setLoading(true);

    try {
      const authData = await apiVerifyMfa({
        totpCode,
        tempMfaToken: tempMfaToken || undefined,
      });

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
        err instanceof Error ? err.message : 'Invalid or expired TOTP code. Please retry.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 font-bold text-xl mb-2">
          🛡️
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Two-Factor Authentication
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Enter the 6-digit verification code from your authenticator app (RFC 6238)
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
            htmlFor="totpCode"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
          >
            6-Digit Authenticator Code
          </label>
          <input
            id="totpCode"
            type="text"
            inputMode="numeric"
            maxLength={6}
            autoFocus
            required
            value={totpCode}
            onChange={e => setTotpCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            className="w-full tracking-widest text-center font-mono px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-2xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading || totpCode.length !== 6}
          className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-600/20 hover:shadow-amber-600/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Verifying Code...' : 'Verify & Continue'}
        </button>
      </form>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
        Lost access to your authenticator device?{' '}
        <Link
          href="/reset-password"
          className="font-semibold text-amber-600 dark:text-amber-400 hover:underline"
        >
          Use Emergency Recovery
        </Link>
      </div>
    </div>
  );
}

export default function MfaChallengePage() {
  return (
    <React.Suspense
      fallback={<div className="p-8 text-center text-sm text-slate-400">Loading...</div>}
    >
      <MfaChallengeForm />
    </React.Suspense>
  );
}
