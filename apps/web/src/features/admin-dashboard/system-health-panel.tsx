'use client';

// Explore Bharat Safar — System Health Panel Component
// Reference: EBS-DOC-13-ADMIN (Health Dashboard), EBS-DOC-23-DEVOPS

import * as React from 'react';
import type { SystemHealth } from '@ebs/types';
import { SystemHealthStatus, ServiceStatus } from '@ebs/types';

interface SystemHealthPanelProps {
  health: SystemHealth;
  onRefresh?: () => void;
}

function getServiceStatusBadge(status: ServiceStatus) {
  switch (status) {
    case ServiceStatus.UP:
      return {
        label: 'UP',
        classes: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
        dot: 'bg-emerald-500',
      };
    case ServiceStatus.DOWN:
      return {
        label: 'DOWN',
        classes: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        dot: 'bg-red-500 animate-pulse',
      };
    case ServiceStatus.DEGRADED:
      return {
        label: 'DEGRADED',
        classes: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        dot: 'bg-yellow-500',
      };
    default:
      return {
        label: 'UNKNOWN',
        classes: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
        dot: 'bg-slate-400',
      };
  }
}

function getOverallBadge(status: SystemHealthStatus) {
  const map: Record<SystemHealthStatus, { label: string; bg: string; border: string }> = {
    [SystemHealthStatus.OPERATIONAL]: {
      label: '✓ All Systems Operational',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      border: 'border-emerald-200 dark:border-emerald-800',
    },
    [SystemHealthStatus.DEGRADED]: {
      label: '⚠ Degraded Performance',
      bg: 'bg-yellow-50 dark:bg-yellow-950/30',
      border: 'border-yellow-200 dark:border-yellow-800',
    },
    [SystemHealthStatus.PARTIAL_OUTAGE]: {
      label: '⚠ Partial Service Outage',
      bg: 'bg-orange-50 dark:bg-orange-950/30',
      border: 'border-orange-200 dark:border-orange-800',
    },
    [SystemHealthStatus.CRITICAL]: {
      label: '🚨 Critical — Immediate Action Required',
      bg: 'bg-red-50 dark:bg-red-950/30',
      border: 'border-red-300 dark:border-red-700',
    },
    [SystemHealthStatus.MAINTENANCE]: {
      label: '🔧 Scheduled Maintenance Window',
      bg: 'bg-slate-50 dark:bg-slate-900/50',
      border: 'border-slate-200 dark:border-slate-700',
    },
  };
  return map[status] ?? map[SystemHealthStatus.OPERATIONAL];
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function SystemHealthPanel({ health, onRefresh }: SystemHealthPanelProps) {
  const overallBadge = getOverallBadge(health.status);

  return (
    <div className="space-y-4">
      {/* Overall Status */}
      <div className={`rounded-2xl border p-4 ${overallBadge.bg} ${overallBadge.border}`}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {overallBadge.label}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Uptime: {formatUptime(health.uptime)} · Version: {health.version}
            </div>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              ↻ Refresh
            </button>
          )}
        </div>
      </div>

      {/* Service Checklist */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Service Health Checks
          </h3>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {health.services.map((svc, idx) => {
            const badge = getServiceStatusBadge(svc.status as ServiceStatus);
            return (
              <div key={idx} className="flex items-center gap-4 px-5 py-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${badge.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    {svc.name}
                  </div>
                  {svc.details && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {svc.details}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {svc.latencyMs !== undefined && (
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      {svc.latencyMs}ms
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${badge.classes}`}
                  >
                    {badge.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Last Checked */}
      <div className="text-[11px] text-right font-mono text-slate-400 dark:text-slate-600">
        Health check performed:{' '}
        {new Date(health.timestamp).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })}
      </div>
    </div>
  );
}
