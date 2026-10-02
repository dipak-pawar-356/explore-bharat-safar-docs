import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://explorebharatsafar.in';
const SITE_NAME = 'Explore Bharat Safar';
const DEFAULT_IMAGE = `${SITE_URL}/og-cover.jpg`;

export interface OpenGraphOptions {
  title: string;
  description: string;
  path?: string;
  imageUrl?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
}

/**
 * Builds standard OpenGraph and Twitter Metadata for Next.js App Router
 */
export function buildSEOMetadata({
  title,
  description,
  path = '',
  imageUrl = DEFAULT_IMAGE,
  type = 'website',
  publishedTime,
}: OpenGraphOptions): Metadata {
  const url = `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: url,
      languages: {
        'en-IN': url,
        'hi-IN': `${url}?lang=hi`,
        'mr-IN': `${url}?lang=mr`,
      },
    },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      locale: 'en_IN',
      type,
      publishedTime,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [imageUrl],
      creator: '@ExploreBharatSafar',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

/**
 * Schema.org WebSite with Sitelinks SearchBox
 */
export function buildWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description:
      'Unified National Digital Travel Discovery Ecosystem. Interactive India GIS map, 650,000+ villages encyclopedia, high-altitude trekking, cultural experiences, and traveler social network.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Schema.org TouristAttraction (Forts, Temples, Waterfalls, Peaks)
 */
export function buildTouristAttractionJsonLd(attraction: {
  name: string;
  description: string;
  url: string;
  latitude: number;
  longitude: number;
  elevationMeters?: number;
  rating?: number;
  reviewCount?: number;
  imageUrl?: string;
  address?: {
    district?: string;
    state?: string;
    country?: string;
  };
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: attraction.name,
    description: attraction.description,
    url: `${SITE_URL}${attraction.url}`,
    image: attraction.imageUrl || DEFAULT_IMAGE,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: attraction.latitude,
      longitude: attraction.longitude,
      elevation: attraction.elevationMeters,
    },
    ...(attraction.address && {
      address: {
        '@type': 'PostalAddress',
        addressLocality: attraction.address.district,
        addressRegion: attraction.address.state,
        addressCountry: attraction.address.country || 'IN',
      },
    }),
    ...(attraction.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: attraction.rating,
        reviewCount: attraction.reviewCount || 1,
      },
    }),
  };
}

/**
 * Schema.org AdministrativeArea / Place (for 650,000+ Indian Villages)
 */
export function buildVillageJsonLd(village: {
  nameEn: string;
  nameLocal?: string;
  state: string;
  district: string;
  pincode?: string;
  lgdCode?: string;
  latitude?: number;
  longitude?: number;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'AdministrativeArea',
    name: village.nameEn,
    alternateName: village.nameLocal,
    url: `${SITE_URL}${village.url}`,
    identifier: village.lgdCode,
    address: {
      '@type': 'PostalAddress',
      addressLocality: village.nameEn,
      addressRegion: village.state,
      postalCode: village.pincode,
      addressCountry: 'IN',
    },
    ...(village.latitude &&
      village.longitude && {
        geo: {
          '@type': 'GeoCoordinates',
          latitude: village.latitude,
          longitude: village.longitude,
        },
      }),
  };
}

/**
 * Schema.org BreadcrumbList for hierarchical SEO navigation
 */
export function buildBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}
