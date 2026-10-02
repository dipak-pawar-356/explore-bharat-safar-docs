// Explore Bharat Safar — Discovery Engine Map Viewport & Geographic State Store
// Reference: EBS-BLU-41-BDE, EBS-DOC-16-MAP
import { create } from 'zustand';
import {
  DiscoveryHierarchyLevel,
  type StateEntity,
  type DistrictEntity,
  type TalukaEntity,
  type PlaceEntity,
  type Landmark3DEntity,
} from '@ebs/types';

export interface ViewportState {
  // Map Camera Projection Coordinates
  latitude: number;
  longitude: number;
  zoom: number;
  pitch: number;
  bearing: number;

  // Active Geographic Hierarchy Tier
  hierarchyLevel: DiscoveryHierarchyLevel;

  // Selected Entities
  selectedStateId: string | null;
  selectedState: StateEntity | null;
  selectedDistrictId: string | null;
  selectedDistrict: DistrictEntity | null;
  selectedTalukaId: string | null;
  selectedTaluka: TalukaEntity | null;
  selectedPlaceId: string | null;
  selectedPlace: PlaceEntity | null;

  // Active Category & Filter State
  activeCategory: string | null;
  searchQuery: string;
  hoveredEntityId: string | null;
  hovered3DLandmarkId: string | null;
  isPreviewDrawerOpen: boolean;

  // 3D Landmark Catalog
  active3DLandmarks: Landmark3DEntity[];

  // Actions
  setViewport: (viewport: Partial<Omit<ViewportState, 'setViewport' | 'resetViewport'>>) => void;
  resetViewport: () => void;
  setHierarchyLevel: (level: DiscoveryHierarchyLevel) => void;
  selectState: (state: StateEntity | null) => void;
  selectDistrict: (district: DistrictEntity | null) => void;
  selectTaluka: (taluka: TalukaEntity | null) => void;
  selectPlace: (place: PlaceEntity | null) => void;
  setActiveCategory: (category: string | null) => void;
  setSearchQuery: (query: string) => void;
  setHoveredEntity: (id: string | null) => void;
  setHovered3DLandmark: (id: string | null) => void;
  openPreviewDrawer: (place: PlaceEntity) => void;
  closePreviewDrawer: () => void;
  drillDownToState: (state: StateEntity) => void;
  drillDownToDistrict: (district: DistrictEntity) => void;
  drillDownToTaluka: (taluka: TalukaEntity) => void;
  drillDownToPlace: (place: PlaceEntity) => void;
  resetToNationalView: () => void;
}

const DEFAULT_INDIA_VIEWPORT = {
  latitude: 20.5937,
  longitude: 78.9629,
  zoom: 4.8,
  pitch: 0,
  bearing: 0,
  hierarchyLevel: DiscoveryHierarchyLevel.NATIONAL,
  selectedStateId: null,
  selectedState: null,
  selectedDistrictId: null,
  selectedDistrict: null,
  selectedTalukaId: null,
  selectedTaluka: null,
  selectedPlaceId: null,
  selectedPlace: null,
  activeCategory: null,
  searchQuery: '',
  hoveredEntityId: null,
  hovered3DLandmarkId: null,
  isPreviewDrawerOpen: false,
  active3DLandmarks: [],
};

export const useMapViewportStore = create<ViewportState>(set => ({
  ...DEFAULT_INDIA_VIEWPORT,

  setViewport: viewport => set(state => ({ ...state, ...viewport })),

  resetViewport: () => set(DEFAULT_INDIA_VIEWPORT),

  setHierarchyLevel: level => set({ hierarchyLevel: level }),

  selectState: state =>
    set({
      selectedStateId: state?.id ?? null,
      selectedState: state,
      selectedDistrictId: null,
      selectedDistrict: null,
      selectedTalukaId: null,
      selectedTaluka: null,
      selectedPlaceId: null,
      selectedPlace: null,
      hierarchyLevel: state ? DiscoveryHierarchyLevel.STATE : DiscoveryHierarchyLevel.NATIONAL,
    }),

  selectDistrict: district =>
    set({
      selectedDistrictId: district?.id ?? null,
      selectedDistrict: district,
      selectedTalukaId: null,
      selectedTaluka: null,
      selectedPlaceId: null,
      selectedPlace: null,
      hierarchyLevel: district ? DiscoveryHierarchyLevel.DISTRICT : DiscoveryHierarchyLevel.STATE,
    }),

  selectTaluka: taluka =>
    set({
      selectedTalukaId: taluka?.id ?? null,
      selectedTaluka: taluka,
      selectedPlaceId: null,
      selectedPlace: null,
      hierarchyLevel: taluka ? DiscoveryHierarchyLevel.TALUKA : DiscoveryHierarchyLevel.DISTRICT,
    }),

  selectPlace: place =>
    set({
      selectedPlaceId: place?.id ?? null,
      selectedPlace: place,
      hierarchyLevel: place ? DiscoveryHierarchyLevel.PLACE : DiscoveryHierarchyLevel.TALUKA,
      isPreviewDrawerOpen: place !== null,
    }),

  setActiveCategory: category => set({ activeCategory: category }),

  setSearchQuery: query => set({ searchQuery: query }),

  setHoveredEntity: id => set({ hoveredEntityId: id }),

  setHovered3DLandmark: id => set({ hovered3DLandmarkId: id }),

  openPreviewDrawer: place =>
    set({
      selectedPlace: place,
      selectedPlaceId: place.id,
      isPreviewDrawerOpen: true,
    }),

  closePreviewDrawer: () => set({ isPreviewDrawerOpen: false }),

  drillDownToState: state =>
    set({
      selectedStateId: state.id,
      selectedState: state,
      selectedDistrictId: null,
      selectedDistrict: null,
      selectedTalukaId: null,
      selectedTaluka: null,
      selectedPlaceId: null,
      selectedPlace: null,
      hierarchyLevel: DiscoveryHierarchyLevel.STATE,
      latitude: state.centroid?.latitude ?? 19.75,
      longitude: state.centroid?.longitude ?? 75.71,
      zoom: 7.5,
    }),

  drillDownToDistrict: district =>
    set(state => ({
      selectedStateId: state.selectedStateId ?? (district.stateId || null),
      selectedState:
        state.selectedState ??
        (district.stateName
          ? {
              id: district.stateId || 'state-ref',
              name: district.stateName,
              isoCode: district.stateIsoCode || 'IN-XX',
              capital: '',
              officialLanguages: [],
            }
          : null),
      selectedDistrictId: district.id,
      selectedDistrict: district,
      selectedTalukaId: null,
      selectedTaluka: null,
      selectedPlaceId: null,
      selectedPlace: null,
      hierarchyLevel: DiscoveryHierarchyLevel.DISTRICT,
      latitude: district.centroid?.latitude ?? 18.52,
      longitude: district.centroid?.longitude ?? 73.85,
      zoom: 10.5,
    })),

  drillDownToTaluka: taluka =>
    set(state => ({
      selectedStateId: state.selectedStateId,
      selectedState:
        state.selectedState ??
        (taluka.stateName
          ? {
              id: 'state-ref',
              name: taluka.stateName,
              isoCode: 'IN-XX',
              capital: '',
              officialLanguages: [],
            }
          : null),
      selectedDistrictId: state.selectedDistrictId ?? (taluka.districtId || null),
      selectedDistrict:
        state.selectedDistrict ??
        (taluka.districtName
          ? {
              id: taluka.districtId || 'dist-ref',
              stateId: state.selectedStateId || '',
              name: taluka.districtName,
              headquarters: taluka.districtName,
              stateName: taluka.stateName,
            }
          : null),
      selectedTalukaId: taluka.id,
      selectedTaluka: taluka,
      selectedPlaceId: null,
      selectedPlace: null,
      hierarchyLevel: DiscoveryHierarchyLevel.TALUKA,
      latitude: taluka.centroid?.latitude ?? 18.23,
      longitude: taluka.centroid?.longitude ?? 73.44,
      zoom: 13.5,
    })),

  drillDownToPlace: place =>
    set(state => ({
      selectedStateId: state.selectedStateId,
      selectedState:
        state.selectedState ??
        (place.stateName
          ? {
              id: 'state-ref',
              name: place.stateName,
              isoCode: 'IN-XX',
              capital: '',
              officialLanguages: [],
            }
          : null),
      selectedDistrictId: state.selectedDistrictId,
      selectedDistrict:
        state.selectedDistrict ??
        (place.districtName
          ? {
              id: 'dist-ref',
              stateId: state.selectedStateId || '',
              name: place.districtName,
              headquarters: place.districtName,
              stateName: place.stateName,
            }
          : null),
      selectedTalukaId: state.selectedTalukaId ?? (place.talukaId || null),
      selectedTaluka:
        state.selectedTaluka ??
        (place.talukaName
          ? {
              id: place.talukaId || 'tal-ref',
              districtId: state.selectedDistrictId || '',
              name: place.talukaName,
              districtName: place.districtName,
              stateName: place.stateName,
            }
          : null),
      selectedPlaceId: place.id,
      selectedPlace: place,
      hierarchyLevel: DiscoveryHierarchyLevel.PLACE,
      latitude: place.coordinates.latitude,
      longitude: place.coordinates.longitude,
      zoom: 15.0,
      isPreviewDrawerOpen: true,
    })),

  resetToNationalView: () => set(DEFAULT_INDIA_VIEWPORT),
}));
