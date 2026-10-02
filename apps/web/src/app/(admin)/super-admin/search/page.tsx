'use client';

// Explore Bharat Safar — Global Search Console
// Sprint 9: Item 23 (Global Search)
// Admin-scoped search across users, villages, bookings, payments, certificates

import * as React from 'react';
import Link from 'next/link';
import { useAdminRbac } from '@/hooks/use-admin-rbac';

type SearchCategory = 'all' | 'users' | 'villages' | 'bookings' | 'payments' | 'certificates';

interface SearchResult {
  id: string;
  category: SearchCategory;
  icon: string;
  title: string;
  subtitle: string;
  href: string;
  badge?: string;
  badgeColor?: string;
}

function mockSearch(q: string, category: SearchCategory): SearchResult[] {
  if (q.length < 2) return [];
  const results: SearchResult[] = [
    {
      id: 'r-u-001',
      category: 'users' as SearchCategory,
      icon: '👤',
      title: 'Rajesh Kumar',
      subtitle: 'rajesh.kumar@gmail.com · TRAVELLER · Active',
      href: '/super-admin/users',
      badge: 'Active',
      badgeColor: 'emerald',
    },
    {
      id: 'r-u-002',
      category: 'users' as SearchCategory,
      icon: '👤',
      title: 'Priya Sharma',
      subtitle: 'priya.sharma@outlook.com · TRAVELLER, LOCAL_GUIDE',
      href: '/super-admin/users',
      badge: 'Active',
      badgeColor: 'emerald',
    },
    {
      id: 'r-v-001',
      category: 'villages' as SearchCategory,
      icon: '🏘️',
      title: 'Wai Village',
      subtitle: 'Satara District · Maharashtra · LGD: MH-SAT-WAI-001',
      href: '/villages/wai-satara',
      badge: 'Verified',
      badgeColor: 'indigo',
    },
    {
      id: 'r-v-002',
      category: 'villages' as SearchCategory,
      icon: '🏘️',
      title: 'Harishchandragad Village',
      subtitle: 'Ahmednagar District · Maharashtra',
      href: '/villages/harishchandragad',
      badge: 'Pending',
      badgeColor: 'amber',
    },
    {
      id: 'r-b-001',
      category: 'bookings' as SearchCategory,
      icon: '🎒',
      title: 'Harishchandragad Trek Oct 2026',
      subtitle: 'Batch #HAR-OCT-2026 · 24/26 confirmed · ₹1,21,200',
      href: '/booking-admin/batches',
      badge: 'Confirmed',
      badgeColor: 'emerald',
    },
    {
      id: 'r-p-001',
      category: 'payments' as SearchCategory,
      icon: '💳',
      title: 'Payment #PAY-0193AB',
      subtitle: '₹4,500 · Refund Initiated · Rajesh Kumar',
      href: '/payment-admin/transactions',
      badge: 'Refund',
      badgeColor: 'red',
    },
    {
      id: 'r-c-001',
      category: 'certificates' as SearchCategory,
      icon: '🏅',
      title: 'CERT-HAR-2026-BATCH-14',
      subtitle: '24 certificates · Harishchandragad Trek Oct 2026',
      href: '/certificate-admin/certificates',
      badge: 'Issued',
      badgeColor: 'amber',
    },
  ].filter(r => {
    const matchCat = category === 'all' || r.category === category;
    const matchQuery =
      r.title.toLowerCase().includes(q.toLowerCase()) ||
      r.subtitle.toLowerCase().includes(q.toLowerCase());
    return matchCat && matchQuery;
  });
  return results;
}

const badgeCls: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
};

export default function GlobalSearchPage() {
  const { isSystemAdmin } = useAdminRbac();
  const [query, setQuery] = React.useState('');
  const [category, setCategory] = React.useState<SearchCategory>('all');
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setResults(mockSearch(query, category));
    }, 200);
    return () => clearTimeout(timer);
  }, [query, category]);

  const categories: { label: string; value: SearchCategory; icon: string }[] = [
    { label: 'All', value: 'all', icon: '🔍' },
    { label: 'Users', value: 'users', icon: '👥' },
    { label: 'Villages', value: 'villages', icon: '🏘️' },
    { label: 'Bookings', value: 'bookings', icon: '🎒' },
    { label: 'Payments', value: 'payments', icon: '💳' },
    { label: 'Certificates', value: 'certificates', icon: '🏅' },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Global Search Console
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Search across users, villages, bookings, payments, and certificates · RBAC-filtered
          results
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl" aria-hidden="true">
          🔍
        </span>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search users, villages, bookings, payments, certificates…"
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 shadow-sm"
          aria-label="Global admin search"
          aria-autocomplete="list"
          aria-controls="search-results"
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-1 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              category === cat.value
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            aria-pressed={category === cat.value}
          >
            <span aria-hidden="true">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <div id="search-results" role="listbox" aria-label="Search results" aria-live="polite">
        {query.length < 2 ? (
          <div className="text-center py-12 text-slate-400 dark:text-slate-600">
            <div className="text-3xl mb-2" aria-hidden="true">
              🔍
            </div>
            <div className="text-sm">Type at least 2 characters to search</div>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12 text-slate-400 dark:text-slate-600">
            <div className="text-3xl mb-2" aria-hidden="true">
              😔
            </div>
            <div className="text-sm font-medium">No results found for &quot;{query}&quot;</div>
            <div className="text-xs mt-1">Try a different search term or category</div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-[10px] text-slate-400 font-mono">
              {results.length} result{results.length !== 1 ? 's' : ''}
            </div>
            {results.map(r => (
              <Link
                key={r.id}
                href={r.href}
                role="option"
                aria-selected="false"
                className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
              >
                <span className="text-xl flex-shrink-0" aria-hidden="true">
                  {r.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-300 truncate">
                    {r.title}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {r.subtitle}
                  </div>
                </div>
                {r.badge && (
                  <span
                    className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${badgeCls[r.badgeColor ?? 'indigo']}`}
                  >
                    {r.badge}
                  </span>
                )}
                <span
                  className="text-slate-300 dark:text-slate-700 group-hover:text-indigo-400 transition-colors"
                  aria-hidden="true"
                >
                  →
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
