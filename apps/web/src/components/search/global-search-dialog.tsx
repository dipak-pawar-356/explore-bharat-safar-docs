'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Clock, Sparkles, Command, Loader2, ArrowRight, TrendingUp } from 'lucide-react';
import { FocusTrap } from '@/components/shared/accessibility/focus-trap';
import { useLiveAnnouncer } from '@/components/shared/accessibility/live-announcer';
import { SearchResultCard } from './search-result-card';
import { SearchSuggestions } from './search-suggestions';
import { SearchContext } from '@ebs/types';
import type { ISearchResultItem, ISearchResponse } from '@ebs/types';

const RECENT_SEARCHES_KEY = 'ebs_recent_searches';
const POPULAR_SEARCHES = [
  'Sinhagad Fort',
  'Mawlynnong Village',
  'Rohtang Pass Trek',
  'Kedarnath Mandir',
  'Konkan Coastal Trail',
];

interface GlobalSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialContext?: SearchContext;
}

export function GlobalSearchDialog({
  isOpen,
  onClose,
  initialContext = SearchContext.GLOBAL,
}: GlobalSearchDialogProps) {
  const router = useRouter();
  const { announce } = useLiveAnnouncer();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [query, setQuery] = React.useState('');
  const [selectedContext, setSelectedContext] = React.useState<SearchContext>(initialContext);
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<ISearchResultItem[]>([]);
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [correctedQuery, setCorrectedQuery] = React.useState<string | undefined>();
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const [recentSearches, setRecentSearches] = React.useState<string[]>([]);

  // Load recent searches on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored).slice(0, 5));
      }
    } catch {
      // localStorage may fail in private mode
    }
  }, []);

  const saveRecentSearch = (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;
    try {
      const updated = [
        trimmed,
        ...recentSearches.filter(s => s.toLowerCase() !== trimmed.toLowerCase()),
      ].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const clearRecentSearches = () => {
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
      setRecentSearches([]);
    } catch {
      // ignore
    }
  };

  // Auto focus input on open
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setResults([]);
      setActiveIndex(-1);
    }
  }, [isOpen]);

  // Client fallback search for demo resilience
  const simulateClientSearch = React.useCallback(
    (q: string, ctx: SearchContext) => {
      const lower = q.toLowerCase();
      const mockData: ISearchResultItem[] = [
        {
          id: 'place-sinhagad',
          title: 'Sinhagad Fort (Lion Fort)',
          subtitle: 'Haveli, Pune District, Maharashtra • 1,312 m',
          context: SearchContext.DISCOVERY,
          category: 'Fort',
          slug: 'sinhagad-fort',
          url: '/places/sinhagad-fort',
          score: 0.95,
          highlightSnippet:
            'Historical hill fort in Maharashtra famous for the 1670 Battle of Sinhagad.',
          badges: ['Heritage', 'High Elevation', 'Western Ghats'],
        },
        {
          id: 'village-mawlynnong',
          title: 'Mawlynnong Village',
          subtitle: 'East Khasi Hills, Meghalaya • PIN: 793110',
          context: SearchContext.VILLAGES,
          category: 'Gram Panchayat',
          slug: 'mawlynnong-village',
          url: '/villages/mawlynnong',
          score: 0.92,
          highlightSnippet: 'Award-winning cleanest village in Asia known for living root bridges.',
          badges: ['Eco-Tourism', 'Clean Village', 'LGD Verified'],
        },
        {
          id: 'booking-kedarkantha',
          title: 'Kedarkantha Winter Expedition',
          subtitle: 'Sankri, Uttarkashi, Uttarakhand • 3,800 m',
          context: SearchContext.BOOKINGS,
          category: 'Trek Batch',
          slug: 'kedarkantha-winter',
          url: '/bookings/kedarkantha-winter',
          score: 0.88,
          highlightSnippet:
            'Classic summit trek through pine forests and snow ridges in the Garhwal Himalayas.',
          badges: ['Moderate Difficulty', 'Certified Guides'],
        },
        {
          id: 'place-raigad',
          title: 'Raigad Fort (Capital of Maratha Empire)',
          subtitle: 'Mahad, Raigad District, Maharashtra • 820 m',
          context: SearchContext.DISCOVERY,
          category: 'Fort',
          slug: 'raigad-fort',
          url: '/places/raigad-fort',
          score: 0.85,
          highlightSnippet:
            'Iconic capital fort where Chhatrapati Shivaji Maharaj was coronated in 1674.',
          badges: ['Royal Seat', 'Archaeological Survey'],
        },
      ];

      const filtered = mockData.filter(item => {
        const matchesContext = ctx === SearchContext.GLOBAL || item.context === ctx;
        const matchesText =
          item.title.toLowerCase().includes(lower) ||
          item.subtitle?.toLowerCase().includes(lower) ||
          item.highlightSnippet?.toLowerCase().includes(lower);
        return matchesContext && matchesText;
      });

      setResults(filtered);
      announce(`${filtered.length} results found for ${q}`, 'polite');
    },
    [announce],
  );

  // Debounced search execution
  React.useEffect(() => {
    if (!isOpen) return;
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setSuggestions([]);
      setCorrectedQuery(undefined);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          q: trimmed,
          context: selectedContext,
          limit: '6',
        });

        const res = await fetch(`/api/v1/search?${params.toString()}`);
        if (res.ok) {
          const data: ISearchResponse = await res.json();
          setResults(data.results || []);
          setSuggestions(data.suggestions || []);
          setCorrectedQuery(data.correctedQuery);
          announce(`${data.totalHits} results found for ${trimmed}`, 'polite');
        } else {
          // Fallback client simulation if API is unreachable
          simulateClientSearch(trimmed, selectedContext);
        }
      } catch {
        simulateClientSearch(trimmed, selectedContext);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, selectedContext, isOpen, announce, simulateClientSearch]);

  const handleSelectResult = (item: ISearchResultItem) => {
    saveRecentSearch(query || item.title);
    onClose();
    router.push(item.url);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < results.length) {
        handleSelectResult(results[activeIndex]);
      } else if (query.trim()) {
        saveRecentSearch(query);
        onClose();
        router.push(`/search?q=${encodeURIComponent(query.trim())}&context=${selectedContext}`);
      }
    }
  };

  if (!isOpen) return null;

  const contexts = [
    { label: 'All', value: SearchContext.GLOBAL },
    { label: 'Discovery', value: SearchContext.DISCOVERY },
    { label: 'Villages', value: SearchContext.VILLAGES },
    { label: 'Bookings', value: SearchContext.BOOKINGS },
    { label: 'Social', value: SearchContext.SOCIAL },
  ];

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <FocusTrap
        isActive={isOpen}
        onEscape={onClose}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="global-search-heading"
          onClick={e => e.stopPropagation()}
          className="flex flex-col h-full"
        >
          {/* Header & Search Input */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h2 id="global-search-heading" className="sr-only">
              Search Explore Bharat Safar
            </h2>
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={e => {
                  setQuery(e.target.value);
                  setActiveIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search places, forts, villages, PIN codes, treks..."
                aria-autocomplete="list"
                aria-controls="search-results-list"
                aria-activedescendant={
                  activeIndex >= 0 ? `search-result-${results[activeIndex]?.id}` : undefined
                }
                className="w-full pl-11 pr-20 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-base focus:outline-none focus:ring-2 focus:ring-bharat-saffron-500 focus:bg-white dark:focus:bg-slate-800"
              />
              <div className="absolute right-3 flex items-center gap-1.5">
                {loading && <Loader2 className="w-4 h-4 text-bharat-saffron-600 animate-spin" />}
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      inputRef.current?.focus();
                    }}
                    aria-label="Clear search query"
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600">
                  ESC
                </kbd>
              </div>
            </div>

            {/* Context Pills */}
            <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1" role="tablist">
              {contexts.map(c => (
                <button
                  key={c.value}
                  type="button"
                  role="tab"
                  aria-selected={selectedContext === c.value}
                  onClick={() => setSelectedContext(c.value)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedContext === c.value
                      ? 'bg-bharat-saffron-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results / Empty / Recent Body */}
          <div
            id="search-results-list"
            className="flex-1 overflow-y-auto p-4 space-y-3"
            role="listbox"
          >
            {/* Typo and alternative suggestions */}
            <SearchSuggestions
              originalQuery={query}
              correctedQuery={correctedQuery}
              suggestions={suggestions}
              onSelectSuggestion={sug => {
                setQuery(sug);
                inputRef.current?.focus();
              }}
            />

            {/* If query entered and results exist */}
            {query.trim() && results.length > 0 && (
              <div className="space-y-2">
                {results.map((item, idx) => (
                  <div
                    key={item.id}
                    id={`search-result-${item.id}`}
                    role="option"
                    aria-selected={activeIndex === idx}
                  >
                    <SearchResultCard
                      item={item}
                      isActive={activeIndex === idx}
                      onSelect={handleSelectResult}
                    />
                  </div>
                ))}

                {/* View all link */}
                <button
                  type="button"
                  onClick={() => {
                    saveRecentSearch(query);
                    onClose();
                    router.push(
                      `/search?q=${encodeURIComponent(query.trim())}&context=${selectedContext}`,
                    );
                  }}
                  className="w-full mt-3 py-2.5 px-4 rounded-xl text-xs font-semibold text-bharat-saffron-600 dark:text-bharat-saffron-400 bg-bharat-saffron-50 dark:bg-bharat-saffron-950/40 hover:bg-bharat-saffron-100 dark:hover:bg-bharat-saffron-900/60 border border-bharat-saffron-200 dark:border-bharat-saffron-800 flex items-center justify-center gap-1.5 transition-colors"
                >
                  View all results for &ldquo;{query}&rdquo;
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* If query entered but no results */}
            {query.trim() && !loading && results.length === 0 && (
              <div className="text-center py-10 px-4">
                <Sparkles className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  No matching destinations found
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Try searching for forts (e.g. &ldquo;Sinhagad&rdquo;), villages, high-altitude
                  treks, or check your spelling.
                </p>
              </div>
            )}

            {/* When input is blank: Show recent searches and popular suggestions */}
            {!query.trim() && (
              <div className="space-y-5 py-2">
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Recent Searches
                      </span>
                      <button
                        type="button"
                        onClick={clearRecentSearches}
                        className="text-[11px] text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {recentSearches.map((term, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setQuery(term);
                            inputRef.current?.focus();
                          }}
                          className="px-3 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-bharat-saffron-400 hover:text-bharat-saffron-600 dark:hover:text-bharat-saffron-400 border border-slate-200 dark:border-slate-700 transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1 mb-2">
                    <TrendingUp className="w-3.5 h-3.5 text-bharat-saffron-500" />
                    Popular In Bharat
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {POPULAR_SEARCHES.map((term, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setQuery(term);
                          inputRef.current?.focus();
                        }}
                        className="px-3 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-bharat-saffron-400 hover:text-bharat-saffron-600 dark:hover:text-bharat-saffron-400 border border-slate-200 dark:border-slate-700 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer with keyboard shortcuts hint */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 font-mono">
                  ↓↑
                </kbd>{' '}
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 font-mono">
                  ↵
                </kbd>{' '}
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 font-mono">
                  ESC
                </kbd>{' '}
                Close
              </span>
            </div>
            <div className="flex items-center gap-1 font-medium text-bharat-saffron-600 dark:text-bharat-saffron-400">
              <Command className="w-3 h-3" />
              <span>Explore Bharat Safar Search</span>
            </div>
          </div>
        </div>
      </FocusTrap>
    </div>
  );
}
