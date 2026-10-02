// Explore Bharat Safar — Survey of India (SOI) Sovereign Cartographic Compliance Suite
// Reference: EBS-BLU-41-BDE Section 1, EBS-DOC-16-MAP Section 6, EBS-DOC-26-RULES
import { LatLngPoint } from './haversine';
import { BoundingBoxCoordinates, isPointInBoundingBox } from './bounding-box';

/**
 * Sovereign Geographic Extents of Bharat as mandated by Survey of India (SOI):
 * - Northernmost: Indira Col & Siachen Glacier, UT of Ladakh (~37.1° N)
 * - Southernmost: Indira Point, Great Nicobar Island (~6.75° N)
 * - Westernmost: Guhar Moti / Sir Creek, Gujarat (~68.1° E)
 * - Easternmost: Kibithu, Arunachal Pradesh (~97.45° E)
 */
export const BHARAT_SOVEREIGN_BOUNDING_BOX: BoundingBoxCoordinates = {
  minLat: 6.5,
  maxLat: 37.6,
  minLng: 68.0,
  maxLng: 97.6,
};

export const BHARAT_MAINLAND_BOUNDING_BOX: BoundingBoxCoordinates = {
  minLat: 8.0,
  maxLat: 37.6,
  minLng: 68.0,
  maxLng: 97.6,
};

export const BHARAT_NATIONAL_CENTROID: LatLngPoint = {
  latitude: 20.5937,
  longitude: 78.9629,
};

export interface SovereignTerritoryDefinition {
  name: string;
  isoCode: string;
  type: 'STATE' | 'UNION_TERRITORY';
  capital: string;
  approxCentroid: LatLngPoint;
}

/**
 * Authoritative Catalog of all 28 States and 8 Union Territories of Bharat
 */
export const OFFICIAL_BHARAT_TERRITORIES: readonly SovereignTerritoryDefinition[] = [
  // 28 States
  {
    name: 'Andhra Pradesh',
    isoCode: 'IN-AP',
    type: 'STATE',
    capital: 'Amaravati',
    approxCentroid: { latitude: 15.9129, longitude: 79.74 },
  },
  {
    name: 'Arunachal Pradesh',
    isoCode: 'IN-AR',
    type: 'STATE',
    capital: 'Itanagar',
    approxCentroid: { latitude: 28.218, longitude: 94.7278 },
  },
  {
    name: 'Assam',
    isoCode: 'IN-AS',
    type: 'STATE',
    capital: 'Dispur',
    approxCentroid: { latitude: 26.2006, longitude: 92.9376 },
  },
  {
    name: 'Bihar',
    isoCode: 'IN-BR',
    type: 'STATE',
    capital: 'Patna',
    approxCentroid: { latitude: 25.0961, longitude: 85.3131 },
  },
  {
    name: 'Chhattisgarh',
    isoCode: 'IN-CG',
    type: 'STATE',
    capital: 'Raipur',
    approxCentroid: { latitude: 21.2787, longitude: 81.8661 },
  },
  {
    name: 'Goa',
    isoCode: 'IN-GA',
    type: 'STATE',
    capital: 'Panaji',
    approxCentroid: { latitude: 15.2993, longitude: 74.124 },
  },
  {
    name: 'Gujarat',
    isoCode: 'IN-GJ',
    type: 'STATE',
    capital: 'Gandhinagar',
    approxCentroid: { latitude: 22.2587, longitude: 71.1924 },
  },
  {
    name: 'Haryana',
    isoCode: 'IN-HR',
    type: 'STATE',
    capital: 'Chandigarh',
    approxCentroid: { latitude: 29.0588, longitude: 76.0856 },
  },
  {
    name: 'Himachal Pradesh',
    isoCode: 'IN-HP',
    type: 'STATE',
    capital: 'Shimla',
    approxCentroid: { latitude: 31.1048, longitude: 77.1734 },
  },
  {
    name: 'Jharkhand',
    isoCode: 'IN-JH',
    type: 'STATE',
    capital: 'Ranchi',
    approxCentroid: { latitude: 23.6102, longitude: 85.2799 },
  },
  {
    name: 'Karnataka',
    isoCode: 'IN-KA',
    type: 'STATE',
    capital: 'Bengaluru',
    approxCentroid: { latitude: 15.3173, longitude: 75.7139 },
  },
  {
    name: 'Kerala',
    isoCode: 'IN-KL',
    type: 'STATE',
    capital: 'Thiruvananthapuram',
    approxCentroid: { latitude: 10.8505, longitude: 76.2711 },
  },
  {
    name: 'Madhya Pradesh',
    isoCode: 'IN-MP',
    type: 'STATE',
    capital: 'Bhopal',
    approxCentroid: { latitude: 22.9734, longitude: 78.6569 },
  },
  {
    name: 'Maharashtra',
    isoCode: 'IN-MH',
    type: 'STATE',
    capital: 'Mumbai',
    approxCentroid: { latitude: 19.7515, longitude: 75.7139 },
  },
  {
    name: 'Manipur',
    isoCode: 'IN-MN',
    type: 'STATE',
    capital: 'Imphal',
    approxCentroid: { latitude: 24.6637, longitude: 93.9063 },
  },
  {
    name: 'Meghalaya',
    isoCode: 'IN-ML',
    type: 'STATE',
    capital: 'Shillong',
    approxCentroid: { latitude: 25.467, longitude: 91.3662 },
  },
  {
    name: 'Mizoram',
    isoCode: 'IN-MZ',
    type: 'STATE',
    capital: 'Aizawl',
    approxCentroid: { latitude: 23.1645, longitude: 92.9376 },
  },
  {
    name: 'Nagaland',
    isoCode: 'IN-NL',
    type: 'STATE',
    capital: 'Kohima',
    approxCentroid: { latitude: 26.1584, longitude: 94.5624 },
  },
  {
    name: 'Odisha',
    isoCode: 'IN-OR',
    type: 'STATE',
    capital: 'Bhubaneswar',
    approxCentroid: { latitude: 20.9517, longitude: 85.0985 },
  },
  {
    name: 'Punjab',
    isoCode: 'IN-PB',
    type: 'STATE',
    capital: 'Chandigarh',
    approxCentroid: { latitude: 31.1471, longitude: 75.3412 },
  },
  {
    name: 'Rajasthan',
    isoCode: 'IN-RJ',
    type: 'STATE',
    capital: 'Jaipur',
    approxCentroid: { latitude: 27.0238, longitude: 74.2179 },
  },
  {
    name: 'Sikkim',
    isoCode: 'IN-SK',
    type: 'STATE',
    capital: 'Gangtok',
    approxCentroid: { latitude: 27.533, longitude: 88.5122 },
  },
  {
    name: 'Tamil Nadu',
    isoCode: 'IN-TN',
    type: 'STATE',
    capital: 'Chennai',
    approxCentroid: { latitude: 11.1271, longitude: 78.6569 },
  },
  {
    name: 'Telangana',
    isoCode: 'IN-TG',
    type: 'STATE',
    capital: 'Hyderabad',
    approxCentroid: { latitude: 18.1124, longitude: 79.0193 },
  },
  {
    name: 'Tripura',
    isoCode: 'IN-TR',
    type: 'STATE',
    capital: 'Agartala',
    approxCentroid: { latitude: 23.9408, longitude: 91.9882 },
  },
  {
    name: 'Uttar Pradesh',
    isoCode: 'IN-UP',
    type: 'STATE',
    capital: 'Lucknow',
    approxCentroid: { latitude: 26.8467, longitude: 80.9462 },
  },
  {
    name: 'Uttarakhand',
    isoCode: 'IN-UT',
    type: 'STATE',
    capital: 'Dehradun',
    approxCentroid: { latitude: 30.0668, longitude: 79.0193 },
  },
  {
    name: 'West Bengal',
    isoCode: 'IN-WB',
    type: 'STATE',
    capital: 'Kolkata',
    approxCentroid: { latitude: 22.9868, longitude: 87.855 },
  },

  // 8 Union Territories
  {
    name: 'Andaman and Nicobar Islands',
    isoCode: 'IN-AN',
    type: 'UNION_TERRITORY',
    capital: 'Port Blair',
    approxCentroid: { latitude: 11.7401, longitude: 92.6586 },
  },
  {
    name: 'Chandigarh',
    isoCode: 'IN-CH',
    type: 'UNION_TERRITORY',
    capital: 'Chandigarh',
    approxCentroid: { latitude: 30.7333, longitude: 76.7794 },
  },
  {
    name: 'Dadra and Nagar Haveli and Daman and Diu',
    isoCode: 'IN-DH',
    type: 'UNION_TERRITORY',
    capital: 'Daman',
    approxCentroid: { latitude: 20.4283, longitude: 72.8397 },
  },
  {
    name: 'Delhi',
    isoCode: 'IN-DL',
    type: 'UNION_TERRITORY',
    capital: 'New Delhi',
    approxCentroid: { latitude: 28.7041, longitude: 77.1025 },
  },
  {
    name: 'Jammu and Kashmir',
    isoCode: 'IN-JK',
    type: 'UNION_TERRITORY',
    capital: 'Srinagar',
    approxCentroid: { latitude: 33.7782, longitude: 76.5762 },
  },
  {
    name: 'Ladakh',
    isoCode: 'IN-LA',
    type: 'UNION_TERRITORY',
    capital: 'Leh',
    approxCentroid: { latitude: 34.1526, longitude: 77.5771 },
  },
  {
    name: 'Lakshadweep',
    isoCode: 'IN-LD',
    type: 'UNION_TERRITORY',
    capital: 'Kavaratti',
    approxCentroid: { latitude: 10.5667, longitude: 72.6417 },
  },
  {
    name: 'Puducherry',
    isoCode: 'IN-PY',
    type: 'UNION_TERRITORY',
    capital: 'Puducherry',
    approxCentroid: { latitude: 11.9416, longitude: 79.8083 },
  },
];

/**
 * Validates that a given geographic coordinate lies strictly within the sovereign territory of Bharat.
 */
export function isWithinSovereignBharatBounds(point: LatLngPoint): boolean {
  return isPointInBoundingBox(point, BHARAT_SOVEREIGN_BOUNDING_BOX);
}

/**
 * Verifies that all 28 states and 8 union territories are accounted for in a dataset.
 */
export function verifyAllTerritoriesPresent(isoCodes: readonly string[]): {
  isComplete: boolean;
  totalFound: number;
  expectedTotal: number;
  missingCodes: string[];
} {
  const codeSet = new Set(isoCodes.map(c => c.toUpperCase()));
  const missingCodes: string[] = [];

  for (const territory of OFFICIAL_BHARAT_TERRITORIES) {
    if (!codeSet.has(territory.isoCode)) {
      missingCodes.push(territory.isoCode);
    }
  }

  return {
    isComplete: missingCodes.length === 0,
    totalFound: OFFICIAL_BHARAT_TERRITORIES.length - missingCodes.length,
    expectedTotal: OFFICIAL_BHARAT_TERRITORIES.length,
    missingCodes,
  };
}
