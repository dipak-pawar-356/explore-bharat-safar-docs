// Explore Bharat Safar — Map Viewport Store Unit Test Suite
// Reference: EBS-DOC-24-TESTING, EBS-BLU-41-BDE
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { useMapViewportStore } from './map-viewport.store';
import { DiscoveryHierarchyLevel } from '@ebs/types';

describe('useMapViewportStore — Discovery Navigation State', () => {
  beforeEach(() => {
    useMapViewportStore.getState().resetViewport();
  });

  it('should initialize with default India viewport and NATIONAL hierarchy level', () => {
    const state = useMapViewportStore.getState();
    assert.equal(state.hierarchyLevel, DiscoveryHierarchyLevel.NATIONAL);
    assert.equal(state.latitude, 20.5937);
    assert.equal(state.longitude, 78.9629);
    assert.equal(state.selectedStateId, null);
    assert.equal(state.isPreviewDrawerOpen, false);
  });

  it('should drill down to state and update hierarchy level and camera coordinates', () => {
    useMapViewportStore.getState().drillDownToState({
      id: 'state-mh-1',
      name: 'Maharashtra',
      isoCode: 'IN-MH',
      capital: 'Mumbai',
      officialLanguages: ['Marathi'],
      centroid: { latitude: 19.75, longitude: 75.71 },
    });

    const state = useMapViewportStore.getState();
    assert.equal(state.hierarchyLevel, DiscoveryHierarchyLevel.STATE);
    assert.equal(state.selectedStateId, 'state-mh-1');
    assert.equal(state.selectedState?.name, 'Maharashtra');
    assert.equal(state.zoom, 7.5);
  });

  it('should drill down to district and update hierarchy level', () => {
    useMapViewportStore.getState().drillDownToDistrict({
      id: 'dist-raigad-1',
      stateId: 'state-mh-1',
      name: 'Raigad',
      headquarters: 'Alibag',
      centroid: { latitude: 18.23, longitude: 73.44 },
    });

    const state = useMapViewportStore.getState();
    assert.equal(state.hierarchyLevel, DiscoveryHierarchyLevel.DISTRICT);
    assert.equal(state.selectedDistrictId, 'dist-raigad-1');
    assert.equal(state.zoom, 10.5);
  });

  it('should open preview drawer when place is selected', () => {
    useMapViewportStore.getState().openPreviewDrawer({
      id: 'place-1',
      talukaId: 'tal-1',
      name: 'Raigad Fort',
      slug: 'raigad-fort',
      categoryIds: [],
      coordinates: { latitude: 18.234, longitude: 73.442 },
      historicalOverview: 'Maratha fortress',
      isBookingEnabled: true,
      averageRating: 4.95,
      reviewCount: 300,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const state = useMapViewportStore.getState();
    assert.equal(state.isPreviewDrawerOpen, true);
    assert.equal(state.selectedPlaceId, 'place-1');
    assert.equal(state.selectedPlace?.name, 'Raigad Fort');
  });

  it('should close preview drawer when closePreviewDrawer is called', () => {
    useMapViewportStore.getState().closePreviewDrawer();
    const state = useMapViewportStore.getState();
    assert.equal(state.isPreviewDrawerOpen, false);
  });

  it('should toggle active category filter', () => {
    useMapViewportStore.getState().setActiveCategory('fort');
    assert.equal(useMapViewportStore.getState().activeCategory, 'fort');

    useMapViewportStore.getState().setActiveCategory(null);
    assert.equal(useMapViewportStore.getState().activeCategory, null);
  });

  it('should synthesize parent hierarchy entities when drilling down directly to place from search', () => {
    useMapViewportStore.getState().drillDownToPlace({
      id: 'place-kailasa',
      talukaId: 'tal-khuldabad',
      name: 'Kailasa Temple',
      slug: 'kailasa-temple-ellora',
      categoryIds: [],
      coordinates: { latitude: 20.0238, longitude: 75.1793 },
      historicalOverview: 'Rock-cut monolithic temple',
      isBookingEnabled: false,
      averageRating: 4.98,
      reviewCount: 5000,
      talukaName: 'Khuldabad',
      districtName: 'Chhatrapati Sambhajinagar',
      stateName: 'Maharashtra',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const state = useMapViewportStore.getState();
    assert.equal(state.hierarchyLevel, DiscoveryHierarchyLevel.PLACE);
    assert.equal(state.selectedPlaceId, 'place-kailasa');
    assert.equal(state.selectedTaluka?.name, 'Khuldabad');
    assert.equal(state.selectedDistrict?.name, 'Chhatrapati Sambhajinagar');
    assert.equal(state.selectedState?.name, 'Maharashtra');
    assert.equal(state.latitude, 20.0238);
    assert.equal(state.longitude, 75.1793);
    assert.equal(state.isPreviewDrawerOpen, true);
  });

  it('should reset back to national view', () => {
    useMapViewportStore.getState().drillDownToState({
      id: 'state-1',
      name: 'Rajasthan',
      isoCode: 'IN-RJ',
      capital: 'Jaipur',
      officialLanguages: [],
    });

    useMapViewportStore.getState().resetToNationalView();
    const state = useMapViewportStore.getState();
    assert.equal(state.hierarchyLevel, DiscoveryHierarchyLevel.NATIONAL);
    assert.equal(state.selectedStateId, null);
    assert.equal(state.latitude, 20.5937);
  });
});
