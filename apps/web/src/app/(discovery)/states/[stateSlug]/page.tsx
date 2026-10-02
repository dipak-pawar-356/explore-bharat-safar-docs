import * as React from 'react';
import Link from 'next/link';

interface StateDetailPageProps {
  params: { stateSlug: string };
}

export default function StateDetailPage({ params }: StateDetailPageProps) {
  const stateName = params.stateSlug.replace(/-/g, ' ');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link
          href="/explore"
          className="hover:text-bharat-saffron-600 transition flex items-center gap-1"
        >
          <span>🇮🇳</span> Bharat Discovery Map
        </Link>
        <span>/</span>
        <span className="text-bharat-saffron-600 capitalize font-bold">{stateName}</span>
      </nav>

      {/* Hero Visual Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 min-h-[320px] flex flex-col justify-end p-8 text-white shadow-2xl border border-slate-800">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1600&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

        <div className="relative z-10 max-w-3xl space-y-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-bharat-saffron-600 text-white">
            Sovereign State Dossier
          </span>
          <h1 className="text-4xl sm:text-5xl font-black capitalize tracking-tight text-white drop-shadow-lg">
            {stateName}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed drop-shadow">
            Discover the rich historical kingdoms, sacred temples, monolithic rock-cut cave
            architecture, mountain passes, and vibrant cultural traditions.
          </p>
        </div>
      </div>

      {/* State Quick Facts & Administrative Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs uppercase font-bold text-slate-400 block mb-1">
            State Capital
          </span>
          <span className="text-lg font-extrabold text-slate-900 dark:text-white">
            Administrative HQ
          </span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs uppercase font-bold text-slate-400 block mb-1">
            Official Languages
          </span>
          <span className="text-lg font-extrabold text-slate-900 dark:text-white">
            Regional & Hindi
          </span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs uppercase font-bold text-slate-400 block mb-1">
            Geographic Region
          </span>
          <span className="text-lg font-extrabold text-slate-900 dark:text-white">
            Sovereign Bharat
          </span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs uppercase font-bold text-slate-400 block mb-1">
            Cartographic Standard
          </span>
          <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
            SOI Verified
          </span>
        </div>
      </div>

      {/* Cultural & Tourism Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-xl">
            🏰
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Historical Citadels & Forts
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Hill fortresses, sea bastions, and royal citadels built by legendary dynasties that
            defended the sovereign heritage of Bharat.
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-xl">
            🏛️
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            UNESCO World Heritage
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Internationally recognized rock-cut sanctuaries, medieval temple complexes, and
            biosphere sanctuaries preserved in perpetuity.
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center text-xl">
            🌊
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Rivers, Waterfalls & Ghats
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Perennial waterfalls, sacred river confluences (Prayags), and pristine ghats hosting
            timeless cultural festivals.
          </p>
        </div>
      </div>

      {/* Return to Map CTA */}
      <div className="p-6 bg-bharat-saffron-50 dark:bg-slate-900 border border-bharat-saffron-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Explore {stateName} on the Sovereign GIS Canvas
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Switch to the full interactive GIS map viewport to explore district boundaries and 3D
            landmarks.
          </p>
        </div>
        <Link
          href="/explore"
          className="py-2.5 px-5 rounded-xl text-xs font-bold uppercase tracking-wider bg-bharat-saffron-600 hover:bg-bharat-saffron-700 text-white shadow-md transition"
        >
          Open Map Viewport →
        </Link>
      </div>
    </div>
  );
}
