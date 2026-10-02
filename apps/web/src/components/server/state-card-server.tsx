import * as React from 'react';
import Link from 'next/link';

export interface StateCardServerProps {
  name: string;
  code: string;
  slug: string;
  capital: string;
  placesCount: number;
}

export function StateCardServer({ name, code, slug, capital, placesCount }: StateCardServerProps) {
  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-bharat-indigo-900 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-bold text-bharat-saffron-600 bg-bharat-saffron-50 dark:bg-bharat-indigo-800 px-2 py-0.5 rounded">
          {code}
        </span>
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-3">{name}</h3>
      <p className="text-xs text-slate-500 mt-1">Capital: {capital}</p>
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-500">{placesCount} Attractions</span>
        <Link
          href={`/states/${slug}`}
          className="text-bharat-saffron-600 font-semibold hover:underline"
        >
          Explore &rarr;
        </Link>
      </div>
    </div>
  );
}
