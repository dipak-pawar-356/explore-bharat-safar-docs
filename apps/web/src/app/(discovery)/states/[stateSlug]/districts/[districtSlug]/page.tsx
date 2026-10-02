import * as React from 'react';
import Link from 'next/link';

interface DistrictDetailPageProps {
  params: { stateSlug: string; districtSlug: string };
}

export default function DistrictDetailPage({ params }: DistrictDetailPageProps) {
  const districtName = params.districtSlug.replace(/-/g, ' ');
  const stateName = params.stateSlug.replace(/-/g, ' ');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 overflow-x-auto pb-1">
        <Link
          href="/explore"
          className="hover:text-bharat-saffron-600 transition flex items-center gap-1"
        >
          <span>🇮🇳</span> Bharat Map
        </Link>
        <span>/</span>
        <Link
          href={`/states/${params.stateSlug}`}
          className="capitalize hover:text-bharat-saffron-600 transition"
        >
          {stateName}
        </Link>
        <span>/</span>
        <span className="text-bharat-saffron-600 capitalize font-bold">
          {districtName} District
        </span>
      </nav>

      {/* Header Banner */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-bharat-saffron-100 dark:bg-bharat-saffron-950/50 text-bharat-saffron-700 dark:text-bharat-saffron-300 mb-2">
            District Administrative Dossier
          </span>
          <h1 className="text-3xl sm:text-4xl font-black capitalize tracking-tight text-slate-900 dark:text-white">
            {districtName} District
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Constituent Administrative Unit of{' '}
            <strong className="capitalize text-slate-700 dark:text-slate-200">{stateName}</strong>
          </p>
        </div>

        <Link
          href="/explore"
          className="py-2.5 px-5 rounded-xl text-xs font-bold uppercase tracking-wider bg-bharat-saffron-600 hover:bg-bharat-saffron-700 text-white shadow-md transition"
        >
          View on GIS Map →
        </Link>
      </div>

      {/* District Quick Facts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs uppercase font-bold text-slate-400 block mb-1">
            Collectorate Headquarters
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-white capitalize">
            {districtName} City
          </span>
        </div>
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs uppercase font-bold text-slate-400 block mb-1">
            Administrative Hierarchy
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-white">
            State → District → Talukas
          </span>
        </div>
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs uppercase font-bold text-slate-400 block mb-1">
            Emergency Services
          </span>
          <span className="text-lg font-bold text-red-600 dark:text-red-400">
            112 Unified Response
          </span>
        </div>
      </div>

      {/* Emergency Directory Card */}
      <div className="p-6 bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-3xl space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-red-700 dark:text-red-400 flex items-center gap-1.5">
          <span>🚨</span> District Emergency Helplines
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-red-100 dark:border-red-950">
            <span className="text-slate-400 block">District Police Control:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">112 / 100</span>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-red-100 dark:border-red-950">
            <span className="text-slate-400 block">District Civil Hospital:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">108 / 102</span>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-red-100 dark:border-red-950">
            <span className="text-slate-400 block">Disaster Management Cell:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">1077</span>
          </div>
        </div>
      </div>
    </div>
  );
}
