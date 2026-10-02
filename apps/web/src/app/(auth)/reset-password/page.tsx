'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiForgotPassword, apiResetPassword } from '../../../lib/auth-client';
import { ForgotPasswordSchema, ResetPasswordSchema } from '@ebs/validators';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token');

  const [email, setEmail] = React.useState('');
  const [token, setToken] = React.useState(tokenFromUrl || '');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validation = ForgotPasswordSchema.safeParse({ email });
    if (!validation.success) {
      setError(validation.error.errors[0]?.message || 'Please provide a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiForgotPassword(email);
      setSuccess(res.message);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to dispatch reset instructions.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    const validation = ResetPasswordSchema.safeParse({ token, newPassword });
    if (!validation.success) {
      setError(validation.error.errors[0]?.message || 'Password complexity rules not met.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiResetPassword({ token, newPassword });
      setSuccess(res.message);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Password reset failed. The token may be expired or invalid.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 font-bold text-xl mb-2">
          🔑
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {token ? 'Set New Password' : 'Reset Password'}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {token
            ? 'Enter your new secure password to restore access'
            : 'Enter your registered email address to receive recovery instructions'}
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

      {success && (
        <div
          role="status"
          className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl text-xs text-emerald-700 dark:text-emerald-300 font-medium"
        >
          {success}
        </div>
      )}

      {!token ? (
        <form onSubmit={handleRequestReset} className="space-y-4" noValidate>
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
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="explorer@bharat.in"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-600/20 hover:shadow-amber-600/30 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Sending Instructions...' : 'Dispatch Reset Link'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleCompleteReset} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="newPassword"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              New Secure Password
            </label>
            <input
              id="newPassword"
              type="password"
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Min 12 chars (A-Z, a-z, 0-9, symbol)"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-600/20 hover:shadow-amber-600/30 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Updating Password...' : 'Save New Password & Log In'}
          </button>
        </form>
      )}

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
        Remembered your credentials?{' '}
        <Link
          href="/login"
          className="font-semibold text-amber-600 dark:text-amber-400 hover:underline"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense
      fallback={<div className="p-8 text-center text-sm text-slate-400">Loading...</div>}
    >
      <ResetPasswordForm />
    </React.Suspense>
  );
}
