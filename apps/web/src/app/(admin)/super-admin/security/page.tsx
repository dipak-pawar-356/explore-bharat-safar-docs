'use client';

// Explore Bharat Safar — Security Console
// Reference: EBS-DOC-40-SEC-BLUEPRINT (Full document)
// Sprint 9: Items 24 (Security Console), 25 (Login Activity)

import * as React from 'react';
import Link from 'next/link';
import { useAdminRbac } from '@/hooks/use-admin-rbac';

interface SecurityEvent {
  id: string;
  type:
    | 'login_success'
    | 'login_failure'
    | 'mfa_challenge'
    | 'session_terminated'
    | 'permission_denied'
    | 'brute_force';
  actorEmail: string;
  ipAddress: string;
  userAgent?: string;
  location?: string;
  timestamp: string;
  details?: string;
}

const MOCK_SECURITY_EVENTS: SecurityEvent[] = [
  {
    id: 'se-001',
    type: 'brute_force',
    actorEmail: 'attacker@evil.com',
    ipAddress: '203.0.113.42',
    userAgent: 'curl/7.68',
    location: 'Unknown (Flagged)',
    timestamp: new Date(Date.now() - 6 * 3600_000).toISOString(),
    details: '8 failed login attempts — Cloudflare WAF challenge triggered',
  },
  {
    id: 'se-002',
    type: 'login_success',
    actorEmail: 'superadmin@ebs.in',
    ipAddress: '10.0.0.1',
    userAgent: 'Chrome/129.0 (Enterprise Admin)',
    location: 'Mumbai, Maharashtra',
    timestamp: new Date(Date.now() - 8 * 3600_000).toISOString(),
  },
  {
    id: 'se-003',
    type: 'mfa_challenge',
    actorEmail: 'finance@ebs.in',
    ipAddress: '10.0.1.8',
    userAgent: 'Firefox/120.0',
    location: 'Pune, Maharashtra',
    timestamp: new Date(Date.now() - 9 * 3600_000).toISOString(),
    details: 'TOTP verified successfully',
  },
  {
    id: 'se-004',
    type: 'login_failure',
    actorEmail: 'unknown@example.com',
    ipAddress: '198.51.100.23',
    userAgent: 'Python/requests',
    location: 'Unknown',
    timestamp: new Date(Date.now() - 12 * 3600_000).toISOString(),
    details: 'Invalid credentials — user not found',
  },
  {
    id: 'se-005',
    type: 'session_terminated',
    actorEmail: 'booking.admin@ebs.in',
    ipAddress: '10.0.2.15',
    location: 'Nagpur, Maharashtra',
    timestamp: new Date(Date.now() - 14 * 3600_000).toISOString(),
    details: 'Session expired after 15 minutes idle timeout',
  },
  {
    id: 'se-006',
    type: 'permission_denied',
    actorEmail: 'moderator@ebs.in',
    ipAddress: '10.0.3.22',
    location: 'Bangalore, Karnataka',
    timestamp: new Date(Date.now() - 18 * 3600_000).toISOString(),
    details:
      'Attempted access to /api/v1/admin/feature-flags — Insufficient permissions (requires SUPER_ADMIN)',
  },
];

const eventTypeConfig: Record<string, { label: string; icon: string; badge: string }> = {
  login_success: {
    label: 'Login Success',
    icon: '✅',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
  login_failure: {
    label: 'Login Failure',
    icon: '❌',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  },
  mfa_challenge: {
    label: 'MFA Challenge',
    icon: '🔐',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  },
  session_terminated: {
    label: 'Session Terminated',
    icon: '⏹️',
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
  },
  permission_denied: {
    label: 'Permission Denied',
    icon: '🚫',
    badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  },
  brute_force: {
    label: 'Brute-Force Detected',
    icon: '🚨',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  },
};

export default function SecurityConsolePage() {
  const { isSuperAdmin } = useAdminRbac();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Security Console
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Zero-Trust posture monitoring · Session management · Login activity · RBAC: SUPER_ADMIN
          only
        </p>
      </div>

      {/* Security Posture Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Active Admin Sessions', value: '8', icon: '👥', color: 'indigo' },
          { label: 'Failed Logins (24h)', value: '23', icon: '❌', color: 'red' },
          { label: 'MFA Coverage (Admins)', value: '100%', icon: '🔐', color: 'emerald' },
          { label: 'WAF Blocks (24h)', value: '1,420', icon: '🛡️', color: 'amber' },
        ].map(m => (
          <div
            key={m.label}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4"
          >
            <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {m.label}
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <span aria-hidden="true">{m.icon}</span>
              <span className="text-xl font-black text-slate-900 dark:text-white tabular-nums">
                {m.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Security Module Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Session Management', href: '/super-admin/security/sessions', icon: '⚙️' },
          { label: 'Device Management', href: '/super-admin/security/devices', icon: '📱' },
          { label: 'Login Activity', href: '/super-admin/security/login-activity', icon: '🔐' },
          { label: 'API Key Management', href: '/super-admin/security/api-keys', icon: '🗝️' },
        ].map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-2 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            <span aria-hidden="true">{link.icon}</span>
            <span className="group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
              {link.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Recent Security Events */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
          <h2 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Recent Security Events
          </h2>
          <Link
            href="/super-admin/security/login-activity"
            className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {MOCK_SECURITY_EVENTS.map(event => {
            const cfg = eventTypeConfig[event.type] ?? eventTypeConfig.login_success;
            return (
              <div key={event.id} className="flex items-start gap-4 px-5 py-4">
                <span className="text-lg flex-shrink-0 mt-0.5" aria-hidden="true">
                  {cfg.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${cfg.badge}`}
                    >
                      {cfg.label}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      {event.actorEmail}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-600 font-mono">
                      {event.ipAddress}
                    </span>
                  </div>
                  {event.details && (
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {event.details}
                    </div>
                  )}
                </div>
                <div className="text-[10px] font-mono text-slate-400 flex-shrink-0">
                  {new Date(event.timestamp).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Zero-Trust Invariants */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-5 py-4">
        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Zero-Trust Security Controls (EBS-DOC-40-SEC-BLUEPRINT)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
          {[
            '• mTLS enforced on all inter-service communication',
            '• All admin routes behind JWT + @Roles decorator validation',
            '• PostgreSQL RLS policies active on all village-scoped tables',
            '• Session idle timeout: 15 minutes (configurable)',
            '• Cloudflare WAF DDoS protection at edge',
            '• TOTP MFA mandatory for BOOKING_ADMIN and above',
            '• Denial-by-default on all routes without @Roles decorator',
            '• AES-256 encryption at rest for all PII and certificates',
          ].map(item => (
            <div key={item}>{item}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
