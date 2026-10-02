'use client';

// Explore Bharat Safar — Enterprise Admin Notification & Communication Platform
// Sprint 10: Multi-Channel Broadcast Composer, Queue Telemetry, DLQ Inspector, & System Alerts

import * as React from 'react';
import Link from 'next/link';
import { AdminNotificationConsole } from '@/components/notifications/admin-notification-console';

interface Notification {
  id: string;
  type: 'system' | 'moderation' | 'booking' | 'security' | 'village';
  title: string;
  body: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
  createdAt: string;
  isRead: boolean;
  link?: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n-001',
    type: 'security',
    title: 'Brute-Force Attempt Detected',
    body: '8 failed login attempts from 203.0.113.42 targeting superadmin@ebs.in. IP flagged automatically.',
    severity: 'critical',
    createdAt: new Date(Date.now() - 6 * 3600_000).toISOString(),
    isRead: false,
    link: '/super-admin/security/login-activity',
  },
  {
    id: 'n-002',
    type: 'moderation',
    title: 'Moderation Queue: 47 Pending',
    body: '47 items are awaiting review in the moderation queue. 4 items have been escalated.',
    severity: 'warning',
    createdAt: new Date(Date.now() - 30 * 60_000).toISOString(),
    isRead: false,
    link: '/super-admin/moderation/reviews',
  },
  {
    id: 'n-003',
    type: 'booking',
    title: 'Booking Batch Closed: Harishchandragad Oct',
    body: 'Batch #HAR-OCT-2026 closed with 24/26 participants confirmed. 2 slots cancelled (refund pending).',
    severity: 'info',
    createdAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
    isRead: true,
    link: '/booking-admin/batches',
  },
  {
    id: 'n-004',
    type: 'village',
    title: 'Village Submission Approved',
    body: 'Wai Village (Maharashtra) — History & Culture update approved and published by Moderator #mod-001.',
    severity: 'success',
    createdAt: new Date(Date.now() - 3.5 * 3600_000).toISOString(),
    isRead: true,
    link: '/village-admin/moderation-queue',
  },
  {
    id: 'n-005',
    type: 'system',
    title: 'Redis Memory Usage: 78%',
    body: 'Redis cluster memory utilization at 78%. Consider scaling or evicting stale sessions.',
    severity: 'warning',
    createdAt: new Date(Date.now() - 8 * 3600_000).toISOString(),
    isRead: false,
    link: '/super-admin/monitoring/redis',
  },
  {
    id: 'n-006',
    type: 'booking',
    title: '64 Certificates Issued',
    body: 'Harishchandragad Trek Oct 2026: 24 certificates auto-generated after balance clearance.',
    severity: 'success',
    createdAt: new Date(Date.now() - 8 * 3600_000).toISOString(),
    isRead: true,
    link: '/certificate-admin/certificates',
  },
];

const severityConfig = {
  critical: {
    dot: 'bg-red-500 animate-pulse',
    bg: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800',
    text: 'text-red-700 dark:text-red-300',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  },
  warning: {
    dot: 'bg-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800',
    text: 'text-amber-700 dark:text-amber-300',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  },
  info: {
    dot: 'bg-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-300',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  },
  success: {
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-700 dark:text-emerald-300',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
};

const typeIcon: Record<string, string> = {
  system: '⚙️',
  moderation: '🛡️',
  booking: '🎒',
  security: '🔒',
  village: '🏘️',
};

export default function NotificationCenterPage() {
  const [notifications, setNotifications] = React.useState(MOCK_NOTIFICATIONS);
  const [typeFilter, setTypeFilter] = React.useState('ALL');
  const [unreadOnly, setUnreadOnly] = React.useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filtered = notifications.filter(n => {
    const matchType = typeFilter === 'ALL' || n.type === typeFilter;
    const matchRead = !unreadOnly || !n.isRead;
    return matchType && matchRead;
  });

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  const markRead = (id: string) =>
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Enterprise Communication Console
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 animate-pulse">
                {unreadCount} alerts
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dispatch cross-channel broadcasts, monitor BullMQ queue latency, inspect DLQ
            quarantines, and review system audit notifications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/super-admin/notifications/templates"
            className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Notification Templates
          </Link>
          <button
            onClick={markAllRead}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors"
            aria-label="Mark all notifications as read"
          >
            Mark all read
          </button>
        </div>
      </div>

      {/* Enterprise Communication Console: Broadcast Composer & DLQ */}
      <AdminNotificationConsole />

      {/* System Audit Alerts Feed */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          System Alerts & Administrative Events
        </h3>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex gap-1 flex-wrap">
            {['ALL', 'security', 'moderation', 'booking', 'village', 'system'].map(type => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                  typeFilter === type
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {type === 'ALL'
                  ? 'All'
                  : `${typeIcon[type]} ${type.charAt(0).toUpperCase() + type.slice(1)}`}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 ml-auto cursor-pointer">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={e => setUnreadOnly(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              aria-label="Show unread only"
            />
            <span className="text-xs text-slate-600 dark:text-slate-400">Unread only</span>
          </label>
        </div>

        {/* Notification List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-600">
              <div className="text-3xl mb-2">🔔</div>
              <div className="text-sm font-medium">No notifications</div>
            </div>
          ) : (
            filtered.map(n => {
              const cfg = severityConfig[n.severity];
              return (
                <div
                  key={n.id}
                  className={`rounded-2xl border p-4 ${cfg.bg} ${!n.isRead ? 'ring-1 ring-current/20' : 'opacity-80'} transition-all`}
                  role="article"
                  aria-label={`${n.severity} notification: ${n.title}`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot}`}
                      aria-hidden="true"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className={`text-sm font-bold ${cfg.text}`}>{n.title}</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                            {n.body}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${cfg.badge}`}
                          >
                            {n.severity}
                          </span>
                          <span
                            className={`text-xs ${typeIcon[n.type] ? '' : ''}`}
                            aria-hidden="true"
                          >
                            {typeIcon[n.type]}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(n.createdAt).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <div className="flex items-center gap-2">
                          {!n.isRead && (
                            <button
                              onClick={() => markRead(n.id)}
                              className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                              aria-label="Mark as read"
                            >
                              Mark read
                            </button>
                          )}
                          {n.link && (
                            <Link
                              href={n.link}
                              className={`text-[10px] font-semibold ${cfg.text} hover:underline`}
                              aria-label={`View details for: ${n.title}`}
                            >
                              View details →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
