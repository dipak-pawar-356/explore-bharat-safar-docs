'use client';

// Explore Bharat Safar — Flagship Discovery Engine Unified Map Explorer Container
// Reference: EBS-BLU-41-BDE, EBS-DOC-04-UI-UX, EBS-DOC-16-MAP
import * as React from 'react';
import { useMapViewportStore } from '../../store/map-viewport.store';
import { DiscoverySearchBar } from './discovery-search-bar';
import { CategoryFilterBar } from './category-filter-bar';
import { MapCanvasInteractive } from './map-canvas-interactive';
import { StateDrilldownCard } from './state-drilldown-card';
import { DistrictDrilldownCard } from './district-drilldown-card';
import { TalukaPlacesGrid } from './taluka-places-grid';
import { PlaceDossierPreviewDrawer } from './place-dossier-preview-drawer';
import { DiscoveryHierarchyLevel } from '@ebs/types';

export function MapExplorerContainer() {
  const {
    hierarchyLevel,
    selectedState,
    selectedDistrict,
    selectedTaluka,
    resetToNationalView,
    drillDownToState,
    drillDownToDistrict,
  } = useMapViewportStore();

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Top Header & Search Console */}
      <div className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-4 z-30 sticky top-0 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Breadcrumb Hierarchy Navigation */}
          <div className="flex items-center gap-2 text-xs font-semibold overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              type="button"
              onClick={resetToNationalView}
              className={`hover:text-bharat-saffron-600 transition flex items-center gap-1 ${
                hierarchyLevel === DiscoveryHierarchyLevel.NATIONAL
                  ? 'text-bharat-saffron-600 font-bold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <span>🇮🇳</span> Bharat
            </button>

            {selectedState && (
              <>
                <span className="text-slate-300 dark:text-slate-700">/</span>
                <button
                  type="button"
                  onClick={() => drillDownToState(selectedState)}
                  className={`hover:text-bharat-saffron-600 transition ${
                    hierarchyLevel === DiscoveryHierarchyLevel.STATE
                      ? 'text-bharat-saffron-600 font-bold'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {selectedState.name}
                </button>
              </>
            )}

            {selectedDistrict && (
              <>
                <span className="text-slate-300 dark:text-slate-700">/</span>
                <button
                  type="button"
                  onClick={() => drillDownToDistrict(selectedDistrict)}
                  className={`hover:text-bharat-saffron-600 transition ${
                    hierarchyLevel === DiscoveryHierarchyLevel.DISTRICT
                      ? 'text-bharat-saffron-600 font-bold'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {selectedDistrict.name}
                </button>
              </>
            )}

            {selectedTaluka && (
              <>
                <span className="text-slate-300 dark:text-slate-700">/</span>
                <span className="text-bharat-saffron-600 font-bold">{selectedTaluka.name}</span>
              </>
            )}
          </div>

          {/* Search Bar */}
          <DiscoverySearchBar className="flex-1 max-w-xl" />
        </div>

        {/* Category Filters Bar */}
        <div className="max-w-7xl mx-auto mt-3">
          <CategoryFilterBar />
        </div>
      </div>

      {/* Main Map Viewport & Dossier Canvas Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 gap-6">
        {/* Interactive Vector GIS Canvas */}
        <div className="w-full h-[600px] sm:h-[650px]">
          <MapCanvasInteractive />
        </div>

        {/* Dynamic Hierarchical Drilldown Cards */}
        {hierarchyLevel === DiscoveryHierarchyLevel.STATE && <StateDrilldownCard />}
        {hierarchyLevel === DiscoveryHierarchyLevel.DISTRICT && <DistrictDrilldownCard />}
        {(hierarchyLevel === DiscoveryHierarchyLevel.TALUKA ||
          hierarchyLevel === DiscoveryHierarchyLevel.PLACE) && <TalukaPlacesGrid />}
      </div>

      {/* Slide-in Preview Drawer */}
      <PlaceDossierPreviewDrawer />
    </div>
  );
}
