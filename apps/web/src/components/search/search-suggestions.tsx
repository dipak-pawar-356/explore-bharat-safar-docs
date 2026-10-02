'use client';

import * as React from 'react';
import { Sparkles, HelpCircle } from 'lucide-react';

interface SearchSuggestionsProps {
  originalQuery: string;
  correctedQuery?: string;
  suggestions?: string[];
  onSelectSuggestion: (query: string) => void;
}

export function SearchSuggestions({
  originalQuery,
  correctedQuery,
  suggestions = [],
  onSelectSuggestion,
}: SearchSuggestionsProps) {
  if (!correctedQuery && suggestions.length === 0) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Search suggestions"
      className="p-3 mb-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2"
    >
      {/* "Did you mean" typo correction */}
      {correctedQuery && correctedQuery.toLowerCase() !== originalQuery.toLowerCase() && (
        <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <HelpCircle className="w-4 h-4 text-bharat-saffron-600 shrink-0" />
          <span>
            Did you mean:{' '}
            <button
              type="button"
              onClick={() => onSelectSuggestion(correctedQuery)}
              className="font-semibold text-bharat-saffron-600 dark:text-bharat-saffron-400 hover:underline inline-flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-bharat-saffron-500 rounded px-1"
            >
              {correctedQuery}
            </button>
            ?
          </span>
        </div>
      )}

      {/* Alternative suggestion pills */}
      {suggestions.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Related:
          </span>
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectSuggestion(suggestion)}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-bharat-saffron-400 hover:text-bharat-saffron-600 dark:hover:text-bharat-saffron-400 transition-colors shadow-sm focus:outline-none focus:ring-1 focus:ring-bharat-saffron-500"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
