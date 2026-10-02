'use client';

import * as React from 'react';
import { Button, Badge, Drawer } from '@ebs/ui';
import {
  Compass,
  MapPin,
  Mountain,
  Users,
  Search,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Landmark,
} from 'lucide-react';

export default function HomePage() {
  const [selectedState, setSelectedState] = React.useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<
    'discovery' | 'villages' | 'bookings' | 'social'
  >('discovery');

  const statesSample = [
    { name: 'Maharashtra', code: 'IN-MH', capital: 'Mumbai', placesCount: 420, fortsCount: 350 },
    { name: 'Rajasthan', code: 'IN-RJ', capital: 'Jaipur', placesCount: 380, fortsCount: 120 },
    {
      name: 'Himachal Pradesh',
      code: 'IN-HP',
      capital: 'Shimla',
      placesCount: 290,
      treksCount: 180,
    },
    { name: 'Uttarakhand', code: 'IN-UT', capital: 'Dehradun', placesCount: 310, treksCount: 240 },
    {
      name: 'Kerala',
      code: 'IN-KL',
      capital: 'Thiruvananthapuram',
      placesCount: 260,
      ecoSpotsCount: 150,
    },
    {
      name: 'Karnataka',
      code: 'IN-KA',
      capital: 'Bengaluru',
      placesCount: 340,
      heritageCount: 210,
    },
    { name: 'Ladakh', code: 'IN-LA', capital: 'Leh', placesCount: 140, passesCount: 45 },
    { name: 'Gujarat', code: 'IN-GJ', capital: 'Gandhinagar', placesCount: 280, templesCount: 190 },
  ];

  return (
    <main className="flex-1 flex flex-col bg-slate-50 dark:bg-bharat-indigo-950">
      {/* 1. Sovereign Navigation Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-bharat-indigo-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-bharat-saffron-600 to-bharat-terracotta-600 flex items-center justify-center text-white shadow-md">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Explore Bharat Safar
              </span>
              <span className="block text-[10px] tracking-wider uppercase font-semibold text-bharat-saffron-600">
                National Travel Discovery Ecosystem
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('discovery')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                activeTab === 'discovery'
                  ? 'bg-bharat-saffron-50 text-bharat-saffron-700 dark:bg-bharat-indigo-800 dark:text-bharat-saffron-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
              }`}
            >
              Bharat Discovery
            </button>
            <button
              onClick={() => setActiveTab('villages')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                activeTab === 'villages'
                  ? 'bg-bharat-saffron-50 text-bharat-saffron-700 dark:bg-bharat-indigo-800 dark:text-bharat-saffron-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
              }`}
            >
              Rural Bharat (650K+)
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                activeTab === 'bookings'
                  ? 'bg-bharat-saffron-50 text-bharat-saffron-700 dark:bg-bharat-indigo-800 dark:text-bharat-saffron-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
              }`}
            >
              Adventure & Treks
            </button>
            <button
              onClick={() => setActiveTab('social')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                activeTab === 'social'
                  ? 'bg-bharat-saffron-50 text-bharat-saffron-700 dark:bg-bharat-indigo-800 dark:text-bharat-saffron-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
              }`}
            >
              Traveller Community
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
            <Button variant="primary" size="sm">
              Start Exploring
            </Button>
          </div>
        </div>
      </header>

      {/* 2. Hero Bharat Discovery Engine Banner */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 bg-gradient-to-b from-amber-500/10 via-transparent to-transparent">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <Badge variant="saffron" className="px-4 py-1 text-sm shadow-sm gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Discover Bharat. Experience Bharat. Understand Bharat.
          </Badge>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            The World&apos;s Most Immersive{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-bharat-saffron-600 to-bharat-terracotta-600">
              Digital Map of Bharat
            </span>
          </h1>

          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Digitally explore every State, District, and Taluka across India down to 650,000+
            villages, ancient forts, Himalayan trails, and sacred shrines with interactive 3D
            landmarks.
          </p>

          {/* Isolated Search Bar */}
          <div className="max-w-2xl mx-auto relative shadow-2xl rounded-2xl">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Search any State, District, Fort, Waterfall, or UNESCO site..."
                className="w-full pl-12 pr-32 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-bharat-indigo-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bharat-saffron-500 text-base shadow-sm"
              />
              <Button className="absolute right-2" size="sm">
                Explore
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive GIS Map Prototype Canvas */}
      <section className="max-w-7xl mx-auto px-4 w-full mb-16">
        <div className="bg-white dark:bg-bharat-indigo-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-bharat-saffron-600" />
                Sovereign Geographic Drilldown
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                India (L0) &rarr; State (L1) &rarr; District (L2) &rarr; Taluka (L3) &rarr; Places
                (L4)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="evergreen">Survey of India Compliant</Badge>
              <Badge variant="outline">28 States &bull; 8 UTs</Badge>
            </div>
          </div>

          {/* State Directory Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {statesSample.map(s => (
              <div
                key={s.code}
                onClick={() => {
                  setSelectedState(s.name);
                  setIsDrawerOpen(true);
                }}
                className="group p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-bharat-indigo-950/40 hover:border-bharat-saffron-400 dark:hover:border-bharat-saffron-600 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-bharat-saffron-600 px-2 py-0.5 rounded bg-bharat-saffron-100 dark:bg-bharat-indigo-800">
                    {s.code}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-bharat-saffron-600 transition" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-3 group-hover:text-bharat-saffron-600 transition">
                  {s.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1">Capital: {s.capital}</p>
                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>{s.placesCount} Attractions</span>
                  <span className="text-bharat-evergreen-700 dark:text-bharat-evergreen-400 font-semibold">
                    Explore &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Four Pillars Architecture Overview */}
      <section className="max-w-7xl mx-auto px-4 pb-20 w-full">
        <div className="text-center mb-12">
          <Badge variant="terracotta">Ecosystem Architecture</Badge>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            Four Synergistic National Pillars
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-bharat-indigo-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
            <div className="w-12 h-12 rounded-xl bg-bharat-saffron-100 dark:bg-bharat-indigo-800 text-bharat-saffron-600 flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              1. Bharat Discovery Engine
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Interactive GIS Vector map with multi-resolution geometry, 3D landmark models, and
              5-tier drilldown.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-bharat-indigo-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
            <div className="w-12 h-12 rounded-xl bg-bharat-evergreen-100 dark:bg-bharat-indigo-800 text-bharat-evergreen-700 flex items-center justify-center">
              <Landmark className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              2. Rural Knowledge System
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Documenting 650,000+ villages, Gram Panchayats, civic infrastructure, and two-tier
              staging moderation.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-bharat-indigo-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
            <div className="w-12 h-12 rounded-xl bg-bharat-terracotta-100 dark:bg-bharat-indigo-800 text-bharat-terracotta-600 flex items-center justify-center">
              <Mountain className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              3. Experience Booking Engine
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Redis Redlock concurrency, dynamic upfront deposits, tamper-evident digital
              certificates, and verified reviews.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-bharat-indigo-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-bharat-indigo-800 text-indigo-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              4. Traveller Social Network
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Traveller passports, automated travel timelines, 24-hour disappearing stories, and
              privacy-preserving solo matchmaking.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Non-Modal Preview Drawer for State Selection */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedState || 'State Explorer'}
      >
        <div className="space-y-6">
          <div className="rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 h-44 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <MapPin className="w-10 h-10 mx-auto text-bharat-saffron-500 mb-2" />
              <p className="text-sm font-semibold">Interactive GIS Vector Map</p>
              <p className="text-xs text-slate-500">Drilldown to District level</p>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">
              Administrative Structure
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Exploring administrative divisions, heritage forts, ecological corridors, and
              constituent Talukas.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => setIsDrawerOpen(false)}>
              Close
            </Button>
            <Button variant="primary" size="sm" className="gap-2">
              Explore Districts <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Drawer>

      {/* 6. Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-8 px-4 text-center text-xs text-slate-500">
        <p>
          &copy; {new Date().getFullYear()} Explore Bharat Safar. Built strictly conforming to
          Survey of India sovereign standards.
        </p>
      </footer>
    </main>
  );
}
