'use client';

// Explore Bharat Safar — Miniature 3D Landmark WebGL / Vector Token Overlay Layer
// Reference: EBS-BLU-41-BDE Section 3, EBS-DOC-16-MAP Section 3
import * as React from 'react';
import { useMapViewportStore } from '../../store/map-viewport.store';
import type { PlaceEntity } from '@ebs/types';

interface RepresentativeLandmark {
  id: string;
  name: string;
  epithet: string;
  category: string;
  categoryIcon: string;
  latitude: number;
  longitude: number;
  slug: string;
  heroImageUrl: string;
  isBookingEnabled: boolean;
}

const REPRESENTATIVE_LANDMARKS: RepresentativeLandmark[] = [
  {
    id: 'lm-raigad',
    name: 'Raigad Fort',
    epithet: 'Bastion of Swarajya & Capital of Maratha Empire',
    category: 'Hill Fort',
    categoryIcon: '🏰',
    latitude: 18.2345,
    longitude: 73.4421,
    slug: 'raigad-fort',
    heroImageUrl:
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
    isBookingEnabled: true,
  },
  {
    id: 'lm-kailasa',
    name: 'Kailasa Temple',
    epithet: 'Monolithic Rock-Cut Architectural Wonder of Ellora',
    category: 'Rock-Cut Cave & UNESCO Site',
    categoryIcon: '🛕',
    latitude: 20.0238,
    longitude: 75.1793,
    slug: 'kailasa-temple-ellora',
    heroImageUrl:
      'https://images.unsplash.com/photo-1600100397608-f1c5040e9fb2?auto=format&fit=crop&w=800&q=80',
    isBookingEnabled: false,
  },
  {
    id: 'lm-hampi',
    name: 'Hampi Stone Chariot',
    epithet: 'Grand Citadel of the Vijayanagara Empire',
    category: 'UNESCO World Heritage',
    categoryIcon: '🏛️',
    latitude: 15.335,
    longitude: 76.46,
    slug: 'hampi-stone-chariot',
    heroImageUrl:
      'https://images.unsplash.com/photo-1600100397608-f1c5040e9fb2?auto=format&fit=crop&w=800&q=80',
    isBookingEnabled: false,
  },
  {
    id: 'lm-golden-temple',
    name: 'Sri Harmandir Sahib',
    epithet: 'The Golden Temple — Abode of Peace and Service',
    category: 'Spiritual Sanctuary',
    categoryIcon: '✨',
    latitude: 31.62,
    longitude: 74.8765,
    slug: 'golden-temple-amritsar',
    heroImageUrl:
      'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
    isBookingEnabled: false,
  },
  {
    id: 'lm-konark',
    name: 'Konark Sun Temple',
    epithet: 'Colossal Stone Chariot of Surya Bhagwan',
    category: 'UNESCO World Heritage',
    categoryIcon: '☀️',
    latitude: 19.8876,
    longitude: 86.0945,
    slug: 'konark-sun-temple',
    heroImageUrl:
      'https://images.unsplash.com/photo-1600100397608-f1c5040e9fb2?auto=format&fit=crop&w=800&q=80',
    isBookingEnabled: false,
  },
  {
    id: 'lm-statue-of-unity',
    name: 'Statue of Unity',
    epithet: 'Tribute to the Iron Man of India, Sardar Patel',
    category: 'National Monument',
    categoryIcon: '🗽',
    latitude: 21.838,
    longitude: 73.7191,
    slug: 'statue-of-unity',
    heroImageUrl:
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
    isBookingEnabled: true,
  },
];

interface ThreeLandmarkRendererProps {
  onLandmarkClick?: (landmark: RepresentativeLandmark) => void;
  width?: number;
  height?: number;
}

export function ThreeLandmarkRenderer({ onLandmarkClick }: ThreeLandmarkRendererProps) {
  const { openPreviewDrawer, hovered3DLandmarkId, setHovered3DLandmark } = useMapViewportStore();

  // Convert geo-coordinates to approximate SVG viewport space for national India map
  // India bounds: lat 8° to 37°, lng 68° to 97°
  const getPositionStyle = (lat: number, lng: number) => {
    const minLat = 8.0;
    const maxLat = 37.0;
    const minLng = 68.0;
    const maxLng = 97.0;

    const xPct = ((lng - minLng) / (maxLng - minLng)) * 100;
    const yPct = ((maxLat - lat) / (maxLat - minLat)) * 100;

    return {
      left: `${xPct.toFixed(2)}%`,
      top: `${yPct.toFixed(2)}%`,
    };
  };

  const handleSelect = (landmark: RepresentativeLandmark) => {
    const placeEntity: PlaceEntity = {
      id: landmark.id,
      talukaId: '',
      name: landmark.name,
      slug: landmark.slug,
      categoryIds: [],
      coordinates: { latitude: landmark.latitude, longitude: landmark.longitude },
      historicalOverview: landmark.epithet,
      isBookingEnabled: landmark.isBookingEnabled,
      averageRating: 4.9,
      reviewCount: 350,
      heroImageUrl: landmark.heroImageUrl,
      landmark3D: {
        id: `3d-${landmark.id}`,
        placeId: landmark.id,
        name: landmark.name,
        modelAssetUri: `/models/monuments/${landmark.slug}.glb`,
        renderScale: 1.0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    openPreviewDrawer(placeEntity);
    if (onLandmarkClick) onLandmarkClick(landmark);
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {REPRESENTATIVE_LANDMARKS.map(lm => {
        const isHovered = hovered3DLandmarkId === lm.id;
        const pos = getPositionStyle(lm.latitude, lm.longitude);

        return (
          <div
            key={lm.id}
            style={pos}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
            onMouseEnter={() => setHovered3DLandmark(lm.id)}
            onMouseLeave={() => setHovered3DLandmark(null)}
          >
            {/* 3D Landmark Isometric Token */}
            <button
              type="button"
              onClick={() => handleSelect(lm)}
              aria-label={lm.name}
              className={`group relative flex flex-col items-center transition-all duration-300 focus:outline-none ${
                isHovered ? 'scale-125 -translate-y-3 z-30' : 'scale-100 z-10'
              }`}
            >
              {/* Pulsing Aura / Contact Glow */}
              <div
                className={`absolute -inset-2 rounded-full blur-md transition-opacity duration-300 ${
                  isHovered ? 'opacity-100 bg-bharat-saffron-500/40' : 'opacity-0 bg-transparent'
                }`}
              />

              {/* Token Badge */}
              <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-br from-bharat-saffron-500 to-bharat-terracotta-600 text-white shadow-xl flex items-center justify-center border-2 border-white dark:border-slate-900 ring-2 ring-bharat-saffron-400/40 transition">
                <span className="text-base drop-shadow">{lm.categoryIcon}</span>
              </div>

              {/* Pin Stem */}
              <div className="w-0.5 h-2 bg-bharat-saffron-600 dark:bg-bharat-saffron-400 shadow" />

              {/* Ambient Contact Shadow */}
              <div className="w-4 h-1 bg-black/30 rounded-full blur-[1px]" />

              {/* Hover Preview Tooltip */}
              {isHovered && (
                <div className="absolute bottom-full mb-2 w-48 p-2.5 bg-slate-900/95 backdrop-blur-md text-white rounded-xl shadow-2xl border border-slate-700 text-left pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs">{lm.categoryIcon}</span>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-bharat-saffron-400">
                      {lm.category}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold leading-tight">{lm.name}</h4>
                  <p className="text-[10px] text-slate-300 leading-snug mt-1 line-clamp-2">
                    {lm.epithet}
                  </p>
                </div>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
