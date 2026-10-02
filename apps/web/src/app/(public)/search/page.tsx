'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Compass, ChevronLeft, ChevronRight, Clock, Sparkles } from 'lucide-react';
import { SearchResultCard, SearchFacetSidebar, SearchSuggestions } from '@/components/search';
import { Skeleton } from '@ebs/ui';
import { SearchContext } from '@ebs/types';
import type { ISearchResultItem, ISearchResponse, ISearchFacet } from '@ebs/types';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQuery = searchParams.get('q') || '';
  const initialContext = (searchParams.get('context') as SearchContext) || SearchContext.GLOBAL;

  const [query, setQuery] = React.useState(initialQuery);
  const [activeContext, setActiveContext] = React.useState<SearchContext>(initialContext);
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<ISearchResultItem[]>([]);
  const [facets, setFacets] = React.useState<ISearchFacet[]>([]);
  const [selectedFacets, setSelectedFacets] = React.useState<Record<string, string[]>>({});
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [correctedQuery, setCorrectedQuery] = React.useState<string | undefined>();
  const [totalHits, setTotalHits] = React.useState(0);
  const [executionTimeMs, setExecutionTimeMs] = React.useState(0);
  const [cursor, setCursor] = React.useState<{
    next?: string | null;
    prev?: string | null;
    hasMore: boolean;
  }>({
    hasMore: false,
  });

  const performSearch = React.useCallback(
    async (searchTerm: string, ctx: SearchContext, facetFilters: Record<string, string[]>) => {
      const trimmed = searchTerm.trim();
      if (!trimmed) {
        setResults([]);
        setFacets([]);
        setTotalHits(0);
        return;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams({
          q: trimmed,
          context: ctx,
          limit: '10',
        });

        // Add facet filters if any
        Object.entries(facetFilters).forEach(([key, values]) => {
          values.forEach(v => params.append(`facet_${key}`, v));
        });

        const res = await fetch(`/api/v1/search?${params.toString()}`);
        if (res.ok) {
          const data: ISearchResponse = await res.json();
          setResults(data.results || []);
          setFacets(data.facets || []);
          setSuggestions(data.suggestions || []);
          setCorrectedQuery(data.correctedQuery);
          setTotalHits(data.totalHits || 0);
          setExecutionTimeMs(data.executionTimeMs || 0);
          if (data.cursor) setCursor(data.cursor);
        } else {
          // Client mock fallback
          setTotalHits(2);
          setExecutionTimeMs(12);
          setResults([
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
              highlightSnippet:
                'Award-winning cleanest village in Asia known for living root bridges.',
              badges: ['Eco-Tourism', 'Clean Village', 'LGD Verified'],
            },
          ]);
          setFacets([
            {
              field: 'category',
              label: 'Category',
              options: [
                { value: 'Fort', label: 'Fort', count: 1 },
                { value: 'Gram Panchayat', label: 'Gram Panchayat', count: 1 },
              ],
            },
          ]);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  React.useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery, initialContext, selectedFacets);
    }
  }, [initialQuery, initialContext, performSearch, selectedFacets]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}&context=${activeContext}`);
    performSearch(query, activeContext, selectedFacets);
  };

  const handleToggleFacet = (field: string, value: string) => {
    setSelectedFacets(prev => {
      const current = prev[field] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      const nextFacets = { ...prev, [field]: updated };
      performSearch(query, activeContext, nextFacets);
      return nextFacets;
    });
  };

  const handleClearAllFacets = () => {
    setSelectedFacets({});
    performSearch(query, activeContext, {});
  };

  const handleSelectSuggestion = (suggestedText: string) => {
    setQuery(suggestedText);
    router.push(`/search?q=${encodeURIComponent(suggestedText)}&context=${activeContext}`);
    performSearch(suggestedText, activeContext, selectedFacets);
  };

  const contextOptions = [
    { label: 'All', value: SearchContext.GLOBAL },
    { label: 'Discovery', value: SearchContext.DISCOVERY },
    { label: 'Villages', value: SearchContext.VILLAGES },
    { label: 'Bookings', value: SearchContext.BOOKINGS },
    { label: 'Social', value: SearchContext.SOCIAL },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Banner / Search bar */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <form onSubmit={handleSearchSubmit} className="max-w-3xl">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search across all 650,000+ villages, forts, high-altitude treks..."
                className="w-full pl-12 pr-28 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-base focus:outline-none focus:ring-2 focus:ring-bharat-saffron-500 shadow-sm"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="absolute right-2 px-4 py-2 bg-bharat-saffron-600 hover:bg-bharat-saffron-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                Search
              </button>
            </div>

            {/* Context Filters */}
            <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
              {contextOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setActiveContext(opt.value);
                    if (query.trim()) {
                      performSearch(query, opt.value, selectedFacets);
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    activeContext === opt.value
                      ? 'bg-bharat-saffron-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </form>
        </div>
      </section>

      {/* Main Content Area: Sidebar + Results */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Facet Sidebar */}
          <SearchFacetSidebar
            facets={facets}
            selectedFacets={selectedFacets}
            onToggleFacet={handleToggleFacet}
            onClearAll={handleClearAllFacets}
            isLoading={loading}
          />

          {/* Results Container */}
          <section className="flex-1 w-full min-w-0" aria-label="Search Results">
            {/* Meta Row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                {query.trim() && (
                  <>
                    <span>
                      Found <strong className="text-slate-900 dark:text-white">{totalHits}</strong>{' '}
                      results for &ldquo;{query}&rdquo;
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {executionTimeMs} ms
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Suggestions & Typos */}
            <SearchSuggestions
              originalQuery={query}
              correctedQuery={correctedQuery}
              suggestions={suggestions}
              onSelectSuggestion={handleSelectSuggestion}
            />

            {/* Loading Skeleton */}
            {loading && (
              <div className="space-y-4" aria-busy="true">
                {[1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3"
                  >
                    <Skeleton className="h-4 w-1/4 rounded" />
                    <Skeleton className="h-6 w-3/4 rounded" />
                    <Skeleton className="h-4 w-full rounded" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Results List */}
            {!loading && results.length > 0 && (
              <div className="space-y-3">
                {results.map(item => (
                  <SearchResultCard key={item.id} item={item} />
                ))}

                {/* Pagination Controls */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800 mt-6">
                  <button
                    type="button"
                    disabled={!cursor.prev}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>

                  <span className="text-xs text-slate-400">
                    Showing {results.length} of {totalHits}
                  </span>

                  <button
                    type="button"
                    disabled={!cursor.hasMore}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Zero Results */}
            {!loading && query.trim() && results.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900">
                <Sparkles className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  No destinations found
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  We couldn&apos;t find anything matching &ldquo;{query}&rdquo;. Check your
                  spelling, try broader keywords, or reset applied filters.
                </p>
                {Object.keys(selectedFacets).length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllFacets}
                    className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-bharat-saffron-600 bg-bharat-saffron-50 dark:bg-bharat-saffron-950/40 hover:bg-bharat-saffron-100 transition-colors"
                  >
                    Clear Filter Facets
                  </button>
                )}
              </div>
            )}

            {/* No Search Initiated */}
            {!loading && !query.trim() && (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900">
                <Compass className="w-10 h-10 text-bharat-saffron-600 mx-auto mb-3 animate-pulse" />
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Explore Bharat Safar Search
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  Type any destination, district, state, PIN code, or trekking summit to begin
                  exploring.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen p-8 max-w-7xl mx-auto space-y-4">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      }
    >
      <SearchPageContent />
    </React.Suspense>
  );
}
