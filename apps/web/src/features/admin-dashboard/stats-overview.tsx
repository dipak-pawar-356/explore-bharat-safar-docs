'use client';

// Explore Bharat Safar — Admin Stats Overview Component
// Reference: EBS-DOC-13-ADMIN, EBS-DOC-09-API Section 5.7

import * as React from 'react';
import type { AdminDashboardStats } from '@ebs/types';
import { KpiCategory, KpiColorVariant, KpiTrend, SystemHealthStatus } from '@ebs/types';
import { KpiWidgetCard } from './kpi-widget';

interface StatsOverviewProps {
  stats: AdminDashboardStats;
}

function getHealthBadge(status: SystemHealthStatus) {
  const map: Record<SystemHealthStatus, { label: string; classes: string; dot: string }> = {
    [SystemHealthStatus.OPERATIONAL]: {
      label: 'All Systems Operational',
      classes: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      dot: 'bg-emerald-500',
    },
    [SystemHealthStatus.DEGRADED]: {
      label: 'Degraded Performance',
      classes: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      dot: 'bg-yellow-500',
    },
    [SystemHealthStatus.PARTIAL_OUTAGE]: {
      label: 'Partial Outage',
      classes: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      dot: 'bg-orange-500',
    },
    [SystemHealthStatus.CRITICAL]: {
      label: 'Critical — Immediate Action Required',
      classes: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      dot: 'bg-red-500 animate-pulse',
    },
    [SystemHealthStatus.MAINTENANCE]: {
      label: 'Scheduled Maintenance',
      classes: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      dot: 'bg-slate-400',
    },
  };
  return map[status] ?? map[SystemHealthStatus.OPERATIONAL];
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const healthBadge = getHealthBadge(stats.systemHealth);

  const widgets = [
    {
      id: 'users-total',
      title: 'Total Registered Users',
      value: stats.totalUsers,
      icon: '👤',
      category: KpiCategory.USERS,
      colorVariant: KpiColorVariant.INDIGO,
      description: `${stats.activeUsers.toLocaleString('en-IN')} currently active`,
      trend: KpiTrend.UP,
      trendPercent: 8.4,
      lastUpdated: stats.timestamp,
    },
    {
      id: 'bookings-total',
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: '🎒',
      category: KpiCategory.BOOKINGS,
      colorVariant: KpiColorVariant.SAFFRON,
      description: `${stats.confirmedBookings.toLocaleString('en-IN')} confirmed expeditions`,
      trend: KpiTrend.UP,
      trendPercent: 14.2,
      lastUpdated: stats.timestamp,
    },
    {
      id: 'villages-total',
      title: 'Villages Documented',
      value: stats.totalVillages,
      icon: '🏘️',
      category: KpiCategory.VILLAGES,
      colorVariant: KpiColorVariant.EVERGREEN,
      description: 'Rural Bharat knowledge records',
      trend: KpiTrend.UP,
      trendPercent: 5.1,
      lastUpdated: stats.timestamp,
    },
    {
      id: 'certificates-issued',
      title: 'Certificates Issued',
      value: stats.certificatesIssued,
      icon: '🏅',
      category: KpiCategory.CERTIFICATES,
      colorVariant: KpiColorVariant.AMBER,
      description: 'Verified digital completion certificates',
      trend: KpiTrend.UP,
      trendPercent: 22.7,
      lastUpdated: stats.timestamp,
    },
    {
      id: 'places-total',
      title: 'Places in Discovery',
      value: stats.totalPlaces,
      icon: '📍',
      category: KpiCategory.DISCOVERY,
      colorVariant: KpiColorVariant.TERRACOTTA,
      description: 'State, district & taluka indexed places',
      trend: KpiTrend.STABLE,
      lastUpdated: stats.timestamp,
    },
    {
      id: 'moderation-pending',
      title: 'Pending Moderations',
      value: stats.pendingModerations,
      icon: '⚠️',
      category: KpiCategory.MODERATION,
      colorVariant:
        stats.pendingModerations > 20 ? KpiColorVariant.TERRACOTTA : KpiColorVariant.SLATE,
      description: 'Village updates and content reports awaiting review',
      trend: stats.pendingModerations > 0 ? KpiTrend.UP : KpiTrend.STABLE,
      trendPercent: stats.pendingModerations > 0 ? 3 : undefined,
      lastUpdated: stats.timestamp,
    },
  ];

  return (
    <div className="space-y-6">
      {/* System Health Banner */}
      <div className="flex items-center justify-between gap-4 bg-white dark:bg-bharat-indigo-900 rounded-2xl border border-slate-200 dark:border-slate-800 px-5 py-3">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${healthBadge.dot}`} />
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${healthBadge.classes}`}>
            {healthBadge.label}
          </span>
        </div>
        <div className="text-[11px] text-slate-400 dark:text-slate-600 font-mono">
          Last updated:{' '}
          {new Date(stats.timestamp).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {widgets.map(w => (
          <KpiWidgetCard key={w.id} widget={w} />
        ))}
      </div>
    </div>
  );
}
