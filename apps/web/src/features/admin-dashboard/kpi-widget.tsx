'use client';

// Explore Bharat Safar — Admin KPI Widget Component
// Reference: EBS-DOC-13-ADMIN Section 2, EBS-DOC-06-STYLEGUIDE

import * as React from 'react';
import type { KpiWidget } from '@ebs/types';
import { KpiTrend, KpiColorVariant } from '@ebs/types';

interface KpiWidgetCardProps {
  widget: KpiWidget;
}

function getTrendIcon(trend?: KpiTrend): string {
  switch (trend) {
    case KpiTrend.UP:
      return '↑';
    case KpiTrend.DOWN:
      return '↓';
    case KpiTrend.STABLE:
      return '→';
    default:
      return '';
  }
}

function getColorClasses(variant: KpiColorVariant): {
  bg: string;
  badge: string;
  trend: string;
  icon: string;
} {
  switch (variant) {
    case KpiColorVariant.SAFFRON:
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/30',
        badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
        trend: 'text-amber-600 dark:text-amber-400',
        icon: 'text-amber-500',
      };
    case KpiColorVariant.EVERGREEN:
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/30',
        badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
        trend: 'text-emerald-600 dark:text-emerald-400',
        icon: 'text-emerald-500',
      };
    case KpiColorVariant.TERRACOTTA:
      return {
        bg: 'bg-orange-50 dark:bg-orange-950/30',
        badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
        trend: 'text-orange-600 dark:text-orange-400',
        icon: 'text-orange-500',
      };
    case KpiColorVariant.INDIGO:
      return {
        bg: 'bg-indigo-50 dark:bg-indigo-950/30',
        badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
        trend: 'text-indigo-600 dark:text-indigo-400',
        icon: 'text-indigo-500',
      };
    case KpiColorVariant.AMBER:
      return {
        bg: 'bg-yellow-50 dark:bg-yellow-950/30',
        badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
        trend: 'text-yellow-600 dark:text-yellow-400',
        icon: 'text-yellow-500',
      };
    default:
      return {
        bg: 'bg-slate-50 dark:bg-slate-950/30',
        badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        trend: 'text-slate-500 dark:text-slate-400',
        icon: 'text-slate-400',
      };
  }
}

export function KpiWidgetCard({ widget }: KpiWidgetCardProps) {
  const colors = getColorClasses(widget.colorVariant);
  const trendIcon = getTrendIcon(widget.trend);
  const trendColor =
    widget.trend === KpiTrend.UP
      ? 'text-emerald-600 dark:text-emerald-400'
      : widget.trend === KpiTrend.DOWN
        ? 'text-red-600 dark:text-red-400'
        : 'text-slate-500 dark:text-slate-400';

  return (
    <div
      className={`rounded-2xl border border-slate-200 dark:border-slate-800 p-5 ${colors.bg} flex flex-col gap-3 min-w-0`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
          {widget.title}
        </span>
        {widget.icon && (
          <span className={`text-lg flex-shrink-0 ${colors.icon}`} aria-hidden="true">
            {widget.icon}
          </span>
        )}
      </div>

      {/* Value */}
      <div className="flex items-end gap-2">
        <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
          {typeof widget.value === 'number' ? widget.value.toLocaleString('en-IN') : widget.value}
        </span>
        {widget.unit && (
          <span className="text-xs text-slate-500 dark:text-slate-400 mb-1">{widget.unit}</span>
        )}
      </div>

      {/* Trend */}
      {widget.trend && widget.trendPercent !== undefined && (
        <div className="flex items-center gap-1.5">
          <span className={`text-sm font-bold tabular-nums ${trendColor}`}>
            {trendIcon} {Math.abs(widget.trendPercent)}%
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">vs last period</span>
        </div>
      )}

      {/* Description */}
      {widget.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
          {widget.description}
        </p>
      )}

      {/* Category Badge */}
      <div className="flex items-center justify-between gap-2 mt-auto">
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${colors.badge}`}
        >
          {widget.category}
        </span>
        <span className="text-[10px] text-slate-400 dark:text-slate-600 font-mono">
          {new Date(widget.lastUpdated).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
}
