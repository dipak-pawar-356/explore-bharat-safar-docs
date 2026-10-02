'use client';

// Explore Bharat Safar — Content Moderation Console
// Sprint 9: Items 35 (Review Moderation), 36 (Community Moderation), 37 (Story Moderation),
//           38 (Report Handling), 39 (Abuse Detection)
// Reference: EBS-DOC-13-ADMIN Section 3 (Governance), EBS-DOC-40-SEC §4

import * as React from 'react';
import Link from 'next/link';
import { useAdminRbac } from '@/hooks/use-admin-rbac';

type ModerationContentType = 'reviews' | 'community' | 'stories' | 'reports' | 'abuse';

interface ModerationItem {
  id: string;
  type: ModerationContentType;
  contentPreview: string;
  authorEmail: string;
  targetResource: string;
  reportedAt: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reportCount?: number;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'escalated';
  reportReason?: string;
}

const MOCK_ITEMS: ModerationItem[] = [
  {
    id: 'mod-001',
    type: 'reviews',
    contentPreview:
      '"The guide was completely unprofessional and the safety equipment was broken. SCAM!"',
    authorEmail: 'user42@gmail.com',
    targetResource: 'Harishchandragad Trek (Review)',
    reportedAt: new Date(Date.now() - 30 * 60_000).toISOString(),
    severity: 'high',
    reportCount: 4,
    status: 'pending',
    reportReason: 'Spam/Fake review',
  },
  {
    id: 'mod-002',
    type: 'community',
    contentPreview: '"Buy followers cheap! DM me for ₹100 for 1000 followers on Instagram"',
    authorEmail: 'spambot@spam.com',
    targetResource: 'Maharashtra Treks Community',
    reportedAt: new Date(Date.now() - 45 * 60_000).toISOString(),
    severity: 'critical',
    reportCount: 12,
    status: 'under_review',
    reportReason: 'Spam/Promotional',
  },
  {
    id: 'mod-003',
    type: 'stories',
    contentPreview:
      'Story includes copyrighted music and unauthorized use of a brand logo in thumbnail.',
    authorEmail: 'creator.rajesh@gmail.com',
    targetResource: 'Valley of Flowers Story',
    reportedAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
    severity: 'medium',
    reportCount: 2,
    status: 'pending',
    reportReason: 'Copyright infringement',
  },
  {
    id: 'mod-004',
    type: 'reports',
    contentPreview: 'User claims guide demanded cash bribes beyond listed price during trek.',
    authorEmail: 'traveller.priya@gmail.com',
    targetResource: 'Guide #GDE-00421',
    reportedAt: new Date(Date.now() - 4 * 3600_000).toISOString(),
    severity: 'high',
    reportCount: 3,
    status: 'escalated',
    reportReason: 'Fraud/Extortion',
  },
  {
    id: 'mod-005',
    type: 'abuse',
    contentPreview:
      'Repeated login attempts (8/10) from suspicious IP 203.0.113.42 targeting admin account.',
    authorEmail: 'attacker@evil.com',
    targetResource: 'System Security Event',
    reportedAt: new Date(Date.now() - 6 * 3600_000).toISOString(),
    severity: 'critical',
    status: 'under_review',
    reportReason: 'Brute-force attack pattern',
  },
  {
    id: 'mod-006',
    type: 'reviews',
    contentPreview:
      '"Outstanding experience! Best trek company in Maharashtra. Highly recommended!"',
    authorEmail: 'verified.customer@gmail.com',
    targetResource: 'Rajmachi Trek (Review)',
    reportedAt: new Date(Date.now() - 8 * 3600_000).toISOString(),
    severity: 'low',
    reportCount: 1,
    status: 'approved',
    reportReason: 'Suspected fake positive review',
  },
  {
    id: 'mod-007',
    type: 'community',
    contentPreview:
      'Post contains graphic images of wildlife hunting, violating platform policies.',
    authorEmail: 'hunter.anon@mail.com',
    targetResource: 'Madhya Pradesh Safaris Community',
    reportedAt: new Date(Date.now() - 12 * 3600_000).toISOString(),
    severity: 'critical',
    reportCount: 8,
    status: 'rejected',
    reportReason: 'Illegal activity',
  },
];

const severityBadge: Record<string, string> = {
  low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const statusBadge: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  under_review: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  escalated: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
};

const typeConfig: Record<ModerationContentType, { label: string; icon: string; href: string }> = {
  reviews: { label: 'Reviews', icon: '⭐', href: '/super-admin/moderation/reviews' },
  community: { label: 'Community', icon: '🤝', href: '/super-admin/moderation/community' },
  stories: { label: 'Stories', icon: '📖', href: '/super-admin/moderation/stories' },
  reports: { label: 'Reports', icon: '🚩', href: '/super-admin/moderation/reports' },
  abuse: { label: 'Abuse', icon: '🛡️', href: '/super-admin/moderation/abuse' },
};

interface ModerationPageProps {
  defaultType?: ModerationContentType;
}

export function ModerationConsole({ defaultType = 'reviews' }: ModerationPageProps) {
  const { canModerateContent } = useAdminRbac();
  const [activeType, setActiveType] = React.useState<ModerationContentType>(defaultType);
  const [statusFilter, setStatusFilter] = React.useState('pending');
  const [notification, setNotification] = React.useState<string | null>(null);

  const filtered = MOCK_ITEMS.filter(item => {
    const matchType = item.type === activeType;
    const matchStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchType && matchStatus;
  });

  const pendingCounts = Object.keys(typeConfig).reduce(
    (acc, type) => ({
      ...acc,
      [type]: MOCK_ITEMS.filter(i => i.type === type && i.status === 'pending').length,
    }),
    {} as Record<string, number>,
  );

  const handleAction = (item: ModerationItem, action: 'approve' | 'reject' | 'escalate') => {
    if (!canModerateContent) return;
    // In production: POST /api/v1/admin/moderation/:id/:action — triggers audit log
    console.info('[AUDIT] Moderation action:', action, item.id);
    setNotification(
      `${action.charAt(0).toUpperCase() + action.slice(1)}: ${item.id} — recorded in audit ledger.`,
    );
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Content Moderation Console
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review queue, report handling, abuse detection · RBAC: MODERATOR+
        </p>
      </div>

      {notification && (
        <div
          role="alert"
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-medium border bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
        >
          <span aria-hidden="true">✅</span>
          {notification}
        </div>
      )}

      {/* Type Tabs with pending counts */}
      <div className="flex gap-1 flex-wrap border-b border-slate-200 dark:border-slate-800">
        {(
          Object.entries(typeConfig) as [
            ModerationContentType,
            (typeof typeConfig)[ModerationContentType],
          ][]
        ).map(([type, config]) => {
          const count = pendingCounts[type] ?? 0;
          return (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
                activeType === type
                  ? 'border-indigo-600 text-indigo-700 dark:text-indigo-300 dark:border-indigo-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
              role="tab"
              aria-selected={activeType === type}
            >
              <span aria-hidden="true">{config.icon}</span>
              {config.label}
              {count > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Status Filter */}
      <div className="flex gap-1">
        {['pending', 'under_review', 'escalated', 'approved', 'rejected', 'all'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
              statusFilter === s
                ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {s.replace(/_/g, ' ').charAt(0).toUpperCase() + s.replace(/_/g, ' ').slice(1)}
          </button>
        ))}
      </div>

      {/* Moderation Items */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400 dark:text-slate-600">
            <div className="text-3xl mb-2" aria-hidden="true">
              ✅
            </div>
            <div className="text-sm font-medium">No items in this queue</div>
          </div>
        ) : (
          filtered.map(item => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3"
              role="article"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${severityBadge[item.severity]}`}
                    >
                      {item.severity}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${statusBadge[item.status]}`}
                    >
                      {item.status.replace(/_/g, ' ')}
                    </span>
                    {item.reportCount && item.reportCount > 1 && (
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                        🚩 {item.reportCount} reports
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    <strong>Target:</strong> {item.targetResource} · <strong>Author:</strong>{' '}
                    {item.authorEmail}
                  </div>
                  {item.reportReason && (
                    <div className="text-[10px] text-slate-400 dark:text-slate-600 mt-0.5">
                      <strong>Reported for:</strong> {item.reportReason}
                    </div>
                  )}
                </div>
                <div className="text-[10px] font-mono text-slate-400 flex-shrink-0">
                  {new Date(item.reportedAt).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>

              <blockquote className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 italic border-l-2 border-slate-300 dark:border-slate-600">
                {item.contentPreview}
              </blockquote>

              {canModerateContent && item.status === 'pending' && (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleAction(item, 'approve')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                    aria-label={`Approve item ${item.id}`}
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => handleAction(item, 'reject')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    aria-label={`Reject item ${item.id}`}
                  >
                    ❌ Remove
                  </button>
                  <button
                    onClick={() => handleAction(item, 'escalate')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                    aria-label={`Escalate item ${item.id}`}
                  >
                    ⬆️ Escalate
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="text-[10px] font-mono text-slate-400 dark:text-slate-600">
        All moderation actions are recorded in the immutable audit ledger · Target SLA: &lt;4h for
        high/critical severity
      </div>
    </div>
  );
}
