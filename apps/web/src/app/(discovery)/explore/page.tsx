import * as React from 'react';
import type { Metadata } from 'next';
import { MapExplorerContainer } from '../../../features/map-explorer';

export const metadata: Metadata = {
  title: 'Explore Bharat — Sovereign GIS Map & Discovery Engine',
  description:
    'Discover 28 States, 8 Union Territories, historical bastions, temples, waterfalls, and offbeat cultural destinations across Bharat.',
};

export default function ExplorePage() {
  return <MapExplorerContainer />;
}
