import * as React from 'react';
import Link from 'next/link';

interface PlaceDetailPageProps {
  params: { placeSlug: string };
}

export default function PlaceDetailPage({ params }: PlaceDetailPageProps) {
  const placeName = params.placeSlug.replace(/-/g, ' ');

  // Simulated place metadata for the page view
  const isBookingEnabled =
    params.placeSlug.includes('raigad') || params.placeSlug.includes('statue');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 overflow-x-auto pb-1">
        <Link
          href="/explore"
          className="hover:text-bharat-saffron-600 transition flex items-center gap-1"
        >
          <span>🇮🇳</span> Bharat Map
        </Link>
        <span>/</span>
        <span className="capitalize text-slate-600 dark:text-slate-400">Maharashtra</span>
        <span>/</span>
        <span className="capitalize text-slate-600 dark:text-slate-400">Raigad</span>
        <span>/</span>
        <span className="capitalize text-slate-600 dark:text-slate-400">Mahad</span>
        <span>/</span>
        <span className="text-bharat-saffron-600 capitalize font-bold">{placeName}</span>
      </nav>

      {/* Hero 4K Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 min-h-[380px] flex flex-col justify-end p-8 text-white shadow-2xl border border-slate-800">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1600&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        <div className="relative z-10 max-w-4xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-bharat-saffron-600 text-white shadow-md">
              ✓ Verified Heritage Monograph
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-black/50 backdrop-blur-sm text-slate-200">
              Elevation: 820m MSL
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-black/50 backdrop-blur-sm text-amber-300">
              ★ 4.95 (3,420 Verified Reviews)
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black capitalize tracking-tight text-white drop-shadow-lg">
            {placeName}
          </h1>

          <p className="text-sm sm:text-base text-slate-200 max-w-3xl leading-relaxed drop-shadow">
            Historic hill fortress, capital of the Maratha Empire under Chhatrapati Shivaji Maharaj.
            Standing as an eternal symbol of Swarajya, military architecture, and cultural
            resilience.
          </p>
        </div>
      </div>

      {/* Main Grid: Details & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Monograph & Architecture */}
        <div className="lg:col-span-2 space-y-8">
          {/* Architectural & Historical Monograph */}
          <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <span>🏰</span> Historical & Architectural Monograph
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Raigad is situated in the Sahyadri mountain range in the Mahad taluka of Raigad
                district. The fortress sits at an elevation of 820 meters (2,700 ft) above sea
                level, surrounded by deep valleys on all sides with only one fortified pathway
                leading to the top through the massive Maha Darwaja.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <span className="text-xs uppercase font-bold text-slate-400 block mb-1">
                  Architectural Style
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Maratha Bastion & Sahyadri Hill Fort
                </span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <span className="text-xs uppercase font-bold text-slate-400 block mb-1">
                  Key Bastions
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Maha Darwaja, Nagarkhana, Hirkani Buruj
                </span>
              </div>
            </div>
          </div>

          {/* Travel Operations & Guidelines */}
          <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>🧭</span> Travel Operations Matrix
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <span className="text-xs uppercase font-bold text-slate-400 block mb-1">
                  Best Season
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Oct — Feb (Winter)
                </span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <span className="text-xs uppercase font-bold text-slate-400 block mb-1">
                  Operating Hours
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  06:00 AM — 06:00 PM
                </span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <span className="text-xs uppercase font-bold text-slate-400 block mb-1">
                  Ropeway Available
                </span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  Yes (08:00 AM — 05:00 PM)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Location, Emergency, and Conditional Booking CTA */}
        <div className="space-y-6">
          {/* Spatial Coordinates & Transit Card */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Spatial Coordinates
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Latitude / Longitude</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  18.234°N, 73.442°E
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Nearest Major City</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Pune (130 km) / Mumbai (160 km)
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Nearest Railway Station</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Mangaon (30 km)
                </span>
              </div>
            </div>
          </div>

          {/* Emergency Helpline Directory */}
          <div className="p-6 bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-3xl space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-red-700 dark:text-red-400 flex items-center gap-1.5">
              <span>🚨</span> Emergency & Safety Matrix
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Mahad Police Station:</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  +91 2145 222100
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Primary Health Centre:</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  +91 2145 222301
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Mountain Rescue Group:</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  112
                </span>
              </div>
            </div>
          </div>

          {/* STRICT BUSINESS RULE: Super Admin Governed 'Book Now' CTA. Rendered ONLY IF isBookingEnabled == true. */}
          {isBookingEnabled && (
            <div className="p-6 bg-gradient-to-br from-bharat-saffron-500 to-bharat-terracotta-600 rounded-3xl text-white shadow-xl shadow-bharat-saffron-500/20 space-y-4">
              <div>
                <span className="text-xs uppercase font-bold text-bharat-saffron-100 tracking-wider block">
                  Guided Expedition
                </span>
                <h3 className="text-xl font-black">Book Heritage Trek Experience</h3>
                <p className="text-xs text-bharat-saffron-100 mt-1">
                  Verified local guides, emergency protocols, and certified historical chronicles.
                </p>
              </div>
              <Link
                href={`/experiences/${params.placeSlug}?source=discovery`}
                className="block text-center w-full py-3 px-4 rounded-xl text-sm font-bold bg-white text-bharat-saffron-700 hover:bg-slate-100 shadow-md transition"
              >
                Book Now ⚡
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
