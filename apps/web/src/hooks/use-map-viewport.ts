'use client';

import * as React from 'react';

export interface ViewportState {
  zoom: number;
  center: [number, number];
  bounds: [number, number, number, number] | null;
}

export function useMapViewport(
  initialCenter: [number, number] = [78.9629, 20.5937],
  initialZoom: number = 4.5,
) {
  const [viewport, setViewport] = React.useState<ViewportState>({
    zoom: initialZoom,
    center: initialCenter,
    bounds: null,
  });

  const updateViewport = React.useCallback((next: Partial<ViewportState>) => {
    setViewport(prev => ({ ...prev, ...next }));
  }, []);

  return { viewport, updateViewport };
}
