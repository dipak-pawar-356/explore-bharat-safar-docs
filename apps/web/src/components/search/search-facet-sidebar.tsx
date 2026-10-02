'use client';

import * as React from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import type { ISearchFacet } from '@ebs/types';

interface SearchFacetSidebarProps {
  facets: ISearchFacet[];
  selectedFacets: Record<string, string[]>;
  onToggleFacet: (field: string, value: string) => void;
  onClearAll: () => void;
  isLoading?: boolean;
}

export function SearchFacetSidebar({
  facets,
  selectedFacets,
  onToggleFacet,
  onClearAll,
  isLoading = false,
}: SearchFacetSidebarProps) {
  const [collapsedSections, setCollapsedSections] = React.useState<Record<string, boolean>>({});

  const toggleSection = (field: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const totalActiveFilters = Object.values(selectedFacets).reduce(
    (acc, vals) => acc + vals.length,
    0,
  );

  return (
    <aside
      aria-label="Search filter facets"
      className="w-full lg:w-64 shrink-0 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-bharat-saffron-600" />
          <h2 className="font-semibold text-slate-900 dark:text-white text-sm">Filters</h2>
          {totalActiveFilters > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-xs font-bold bg-bharat-saffron-100 dark:bg-bharat-saffron-950 text-bharat-saffron-700 dark:text-bharat-saffron-300">
              {totalActiveFilters}
            </span>
          )}
        </div>

        {totalActiveFilters > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-medium text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Facet Groups */}
      {facets.length === 0 ? (
        <p className="text-xs text-slate-400 dark:text-slate-500 py-4 text-center">
          No filters available for current query
        </p>
      ) : (
        <div className="space-y-4">
          {facets.map(facet => {
            const isCollapsed = !!collapsedSections[facet.field];
            const activeCount = selectedFacets[facet.field]?.length || 0;

            return (
              <fieldset key={facet.field} className="border-none p-0 m-0">
                <legend className="w-full">
                  <button
                    type="button"
                    onClick={() => toggleSection(facet.field)}
                    className="w-full flex items-center justify-between py-1 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                    aria-expanded={!isCollapsed}
                  >
                    <span>
                      {facet.label}
                      {activeCount > 0 && (
                        <span className="ml-1 text-bharat-saffron-600">({activeCount})</span>
                      )}
                    </span>
                    {isCollapsed ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>
                </legend>

                {!isCollapsed && (
                  <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {facet.options.map(opt => {
                      const isChecked = selectedFacets[facet.field]?.includes(opt.value) || false;

                      return (
                        <label
                          key={opt.value}
                          className={`flex items-center justify-between text-xs px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-bharat-saffron-50 dark:bg-bharat-saffron-950/40 text-bharat-saffron-900 dark:text-bharat-saffron-200 font-medium'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <input
                              type="checkbox"
                              name={facet.field}
                              value={opt.value}
                              checked={isChecked}
                              disabled={isLoading}
                              onChange={() => onToggleFacet(facet.field, opt.value)}
                              className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-700 text-bharat-saffron-600 focus:ring-bharat-saffron-500"
                            />
                            <span className="truncate">{opt.label}</span>
                          </div>
                          <span className="text-[11px] text-slate-400 ml-2">{opt.count}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </fieldset>
            );
          })}
        </div>
      )}
    </aside>
  );
}
