'use client';

// Explore Bharat Safar — Section 2: Dedicated Village Search Bar
// Reference: EBS-BLU-42-VKS Section 1, EBS-DOC-09-API Section 5.3
import * as React from 'react';
import Link from 'next/link';
import type { VillageSearchResultItem } from '@ebs/types';

interface VillageSearchBarProps {
  onSelectVillage?: (village: VillageSearchResultItem) => void;
  className?: string;
  autoFocus?: boolean;
}

export function VillageSearchBar({
  onSelectVillage,
  className = '',
  autoFocus = false,
}: VillageSearchBarProps) {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<VillageSearchResultItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Debounced search (250ms)
  React.useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/v1/villages/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const json = await res.json();
          const items: VillageSearchResultItem[] = json.data?.results || json.results || [];
          setResults(items);
          setIsOpen(true);
        } else {
          setResults([]);
        }
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative w-full ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          autoFocus={autoFocus}
          placeholder="Search 650,000+ villages by Name, Marathi/Hindi script, 6-digit LGD Code, or PIN..."
          className="w-full h-12 pl-11 pr-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-bharat-evergreen-600 focus:border-transparent transition shadow-sm"
        />
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base">
          🔍
        </span>
        {isLoading && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-bharat-evergreen-600 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-h-96 overflow-y-auto overflow-hidden">
          <div className="p-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-bharat-evergreen-700 dark:text-bharat-evergreen-400">
              Rural Bharat Knowledge Directory
            </span>
            <span>{results.length} Matches Found</span>
          </div>

          {results.length === 0 && !isLoading ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No rural settlements matching &quot;{query}&quot;. Note: Commercial treks and cities
              are quarantined from Section 2 search.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {results.map(v => (
                <div
                  key={v.id}
                  className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer flex items-center justify-between group"
                  onClick={() => {
                    if (onSelectVillage) onSelectVillage(v);
                    setIsOpen(false);
                  }}
                >
                  <Link
                    href={`/villages/${v.lgdCode}`}
                    className="flex-1"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-bharat-evergreen-600 transition">
                        {v.nameEnglish}
                      </span>
                      {v.nameLocal && (
                        <span className="text-xs text-slate-500 font-medium">({v.nameLocal})</span>
                      )}
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                        LGD: {v.lgdCode}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                      <span>{v.taluka} Taluka</span>
                      <span>•</span>
                      <span>{v.district}</span>
                      <span>•</span>
                      <span>{v.state}</span>
                      <span>•</span>
                      <span>PIN: {v.pincode}</span>
                    </div>
                  </Link>
                  <span className="text-xs text-slate-400 group-hover:translate-x-1 transition">
                    &rarr;
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
