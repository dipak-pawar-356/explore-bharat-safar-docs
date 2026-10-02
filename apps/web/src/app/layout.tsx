import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { SkipLink, LiveAnnouncerProvider } from '@/components/shared/accessibility';
import { buildWebSiteJsonLd } from '@/lib/seo/metadata.helper';

export const metadata: Metadata = {
  title: 'Explore Bharat Safar — Discover, Experience, and Understand Bharat',
  description:
    'Unified National Digital Travel Discovery Ecosystem. Interactive India GIS map, 650,000+ villages encyclopedia, high-altitude trekking, cultural experiences, and traveler social network.',
  keywords: [
    'Bharat',
    'India Travel',
    'GIS India Map',
    'Rural Bharat',
    'Villages of India',
    'Trekking India',
    'Heritage Walks',
    'Explore Bharat Safar',
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://explorebharatsafar.in'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Explore Bharat Safar — Discover, Experience, and Understand Bharat',
    description:
      'Unified National Digital Travel Discovery Ecosystem. Interactive India GIS map, 650,000+ villages encyclopedia, high-altitude trekking, cultural experiences, and traveler social network.',
    url: 'https://explorebharatsafar.in',
    siteName: 'Explore Bharat Safar',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Explore Bharat Safar',
    description: 'Unified National Digital Travel Discovery Ecosystem.',
    creator: '@ExploreBharatSafar',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = buildWebSiteJsonLd();

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased selection:bg-bharat-saffron-500 selection:text-white bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <LiveAnnouncerProvider>
          {/* WCAG 2.2 AA Skip Link */}
          <SkipLink targetId="main-content" />

          {/* App Content */}
          <div id="app-root" className="flex-1 flex flex-col">
            {children}
          </div>
        </LiveAnnouncerProvider>
      </body>
    </html>
  );
}
