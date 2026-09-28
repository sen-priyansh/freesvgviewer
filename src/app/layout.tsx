import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import ServiceWorkerRegistrar from '@/components/ServiceWorkerRegistrar';
import PwaInstallPrompt from '@/components/PwaInstallPrompt';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://freesvgviewer.vercel.app'),
  title: {
    default: 'Free SVG Viewer',
    template: '%s | Free SVG Viewer',
  },
  description: 'View, inspect, and convert SVG files to PNG or ICO. Free, fast, and completely offline.',
  keywords: ['svg viewer', 'svg to png', 'svg converter', 'svg to ico'],
  applicationName: 'Free SVG Viewer',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/favicon-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/icons/icon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://freesvgviewer.vercel.app',
    siteName: 'Free SVG Viewer',
    title: 'Free SVG Viewer',
    description: 'View, inspect, and convert SVG files to PNG or ICO. Free, fast, and completely offline.',
    images: [
      {
        url: '/icons/icon-512.png',
        width: 512,
        height: 512,
        alt: 'Free SVG Viewer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free SVG Viewer',
    description: 'View, inspect, and convert SVG files to PNG or ICO. Free, fast, and completely offline.',
    images: ['/icons/icon-512.png'],
  },
  alternates: {
    canonical: '/',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Free SVG Viewer',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0a0a',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Free SVG Viewer',
  url: 'https://freesvgviewer.vercel.app',
  description: 'View, inspect, and convert SVG files to PNG or ICO completely offline.',
  applicationCategory: 'DesignApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires JavaScript. Requires HTML5.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'View, zoom, and pan SVGs',
    'Convert SVG to PNG or ICO',
    'Inspect SVG source code',
    '100% Client-side processing',
    'Progressive Web App (PWA)',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <ServiceWorkerRegistrar />
        {children}
        <PwaInstallPrompt />
        <Analytics />
      </body>
    </html>
  );
}
