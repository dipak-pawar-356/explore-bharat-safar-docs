'use client';

// Explore Bharat Safar — Section 1: Isolated Discovery Search Bar
// Reference: EBS-DOC-18-SEARCH Section 1, EBS-BLU-41-BDE Section 7
import * as React from 'react';
import { useMapViewportStore } from '../../store/map-viewport.store';
import type { SpatialSearchResult } from '@ebs/types';

interface DiscoverySearchBarProps {
  onSearchSubmit?: (query: string) => void;
  className?: string;
}

export function DiscoverySearchBar({ onSearchSubmit, className = '' }: DiscoverySearchBarProps) {
  const {
    searchQuery,
    setSearchQuery,
    drillDownToState,
    drillDownToDistrict,
    drillDownToTaluka,
    drillDownToPlace,
  } = useMapViewportStore();

  const [inputVal, setInputVal] = React.useState(searchQuery);
  const [results, setResults] = React.useState<SpatialSearchResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Debounced search query
  React.useEffect(() => {
    if (!inputVal || inputVal.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/v1/discovery/search?q=${encodeURIComponent(inputVal.trim())}`,
        );
        if (res.ok) {
          const json = await res.json();
          const items: SpatialSearchResult[] = json.data?.results || json.results || [];
          setResults(items);
          setIsOpen(items.length > 0);
        }
      } catch {
        // Fallback simulated results for offline or static client
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [inputVal]);

  // Click outside listener
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectResult = (result: SpatialSearchResult) => {
    setIsOpen(false);
    setInputVal(result.name);
    setSearchQuery(result.name);

    if (result.type === 'state') {
      drillDownToState({
        id: result.id,
        name: result.name,
        isoCode: result.locationHierarchy.isoCode || 'IN-XX',
        capital: '',
        officialLanguages: [],
      });
    } else if (result.type === 'district') {
      drillDownToDistrict({
        id: result.id,
        stateId: '',
        name: result.name,
        headquarters: result.name,
        stateName: result.locationHierarchy.state,
      });
    } else if (result.type === 'taluka') {
      drillDownToTaluka({
        id: result.id,
        districtId: '',
        name: result.name,
        districtName: result.locationHierarchy.district,
        stateName: result.locationHierarchy.state,
      });
    } else if (result.type === 'place') {
      drillDownToPlace({
        id: result.id,
        talukaId: '',
        name: result.name,
        slug: result.slug || result.id,
        categoryIds: [],
        coordinates: result.coordinates || { latitude: 18.52, longitude: 73.85 },
        historicalOverview: '',
        isBookingEnabled: result.isBookingEnabled ?? false,
        averageRating: 4.8,
        reviewCount: 100,
        talukaName: result.locationHierarchy.taluka,
        districtName: result.locationHierarchy.district,
        stateName: result.locationHierarchy.state,
      });
    }

    if (onSearchSubmit) {
      onSearchSubmit(result.name);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      const selected = results[selectedIndex];
      if (selected) handleSelectResult(selected);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const clearInput = () => {
    setInputVal('');
    setSearchQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative w-full max-w-2xl ${className}`}>
      <div className="relative flex items-center">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <input
          type="text"
          value={inputVal}
          onChange={e => {
            setInputVal(e.target.value);
            setSelectedIndex(-1);
          }}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search Bharat — Forts, Temples, UNESCO Sites, Waterfalls, States..."
          className="w-full pl-10 pr-12 py-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-bharat-saffron-500 transition"
        />

        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
          {isLoading && (
            <svg
              className="animate-spin h-4 w-4 text-bharat-saffron-600"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          )}

          {inputVal && !isLoading && (
            <button
              type="button"
              onClick={clearInput}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto">
          {results.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={`${item.type}-${item.id}`}
                type="button"
                onClick={() => handleSelectResult(item)}
                className={`w-full text-left px-4 py-3 flex items-center justify-between transition ${
                  isSelected
                    ? 'bg-bharat-saffron-50 dark:bg-slate-800/80'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold uppercase ${
                      item.type === 'state'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                        : item.type === 'district'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                          : item.type === 'taluka'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                    }`}
                  >
                    {item.type[0]}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {[
                        item.locationHierarchy.taluka,
                        item.locationHierarchy.district,
                        item.locationHierarchy.state,
                      ]
                        .filter(Boolean)
                        .join(' • ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.distanceKm !== undefined && (
                    <span className="text-xs text-slate-400">{item.distanceKm} km</span>
                  )}
                  <span className="text-xs uppercase font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {item.type}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
