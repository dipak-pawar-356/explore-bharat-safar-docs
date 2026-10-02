'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  MapPin,
  Mountain,
  Compass,
  Building2,
  Calendar,
  Users,
  Shield,
  ExternalLink,
} from 'lucide-react';
import type { ISearchResultItem } from '@ebs/types';
import { SearchContext } from '@ebs/types';

interface SearchResultCardProps {
  item: ISearchResultItem;
  isActive?: boolean;
  onSelect?: (item: ISearchResultItem) => void;
}

export function SearchResultCard({ item, isActive, onSelect }: SearchResultCardProps) {
  const getContextIcon = (ctx: SearchContext) => {
    switch (ctx) {
      case SearchContext.DISCOVERY:
        return <Mountain className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case SearchContext.VILLAGES:
        return <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case SearchContext.BOOKINGS:
        return <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case SearchContext.SOCIAL:
        return <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case SearchContext.ADMIN:
        return <Shield className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      default:
        return <Compass className="w-4 h-4 text-bharat-saffron-600" />;
    }
  };

  const getContextBadgeStyle = (ctx: SearchContext) => {
    switch (ctx) {
      case SearchContext.DISCOVERY:
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case SearchContext.VILLAGES:
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case SearchContext.BOOKINGS:
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case SearchContext.SOCIAL:
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case SearchContext.ADMIN:
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <article
      aria-label={`Search result: ${item.title}`}
      className={`group relative rounded-xl border p-4 transition-all duration-200 ${
        isActive
          ? 'bg-bharat-saffron-50/50 dark:bg-bharat-saffron-950/20 border-bharat-saffron-500 shadow-md ring-2 ring-bharat-saffron-500/20'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
      }`}
      onClick={() => onSelect?.(item)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Header Row: Context Badge & Category */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border ${getContextBadgeStyle(
                item.context,
              )}`}
            >
              {getContextIcon(item.context)}
              <span className="capitalize">{item.context}</span>
            </span>

            {item.category && (
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {item.category}
              </span>
            )}

            {item.distanceKm !== undefined && (
              <span className="inline-flex items-center gap-0.5 text-xs text-slate-500 dark:text-slate-400">
                <MapPin className="w-3 h-3" />
                {item.distanceKm.toFixed(1)} km away
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-bharat-saffron-600 dark:group-hover:text-bharat-saffron-400 transition-colors text-base truncate">
            <Link href={item.url} className="focus:outline-none focus:underline">
              {item.title}
            </Link>
          </h3>

          {/* Subtitle / Location */}
          {item.subtitle && (
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-1">
              {item.subtitle}
            </p>
          )}

          {/* Snippet */}
          {item.highlightSnippet && (
            <p
              className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 italic"
              dangerouslySetInnerHTML={{ __html: item.highlightSnippet }}
            />
          )}

          {/* Badges / Metrics */}
          {item.badges && item.badges.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
              {item.badges.map((badge, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Link Icon */}
        <Link
          href={item.url}
          aria-label={`Open ${item.title}`}
          className="text-slate-400 hover:text-bharat-saffron-600 dark:hover:text-bharat-saffron-400 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}
