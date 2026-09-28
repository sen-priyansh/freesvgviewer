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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://freesvgviewer.com'),
  title: {
    default: 'Free SVG Viewer & Converter | View, Edit & Convert SVG to PNG or ICO',
    template: '%s | Free SVG Viewer',
  },
  description:
    'Free, ultra-fast, and privacy-focused online SVG viewer and converter. Open, view, zoom, pan, and inspect SVG code. Convert SVG to high-resolution PNG (1x, 2x, 4x) or ICO favicon. 100% offline and secure.',
  keywords: [
    'free svg viewer',
    'svg viewer',
    'svg to png converter',
    'svg to ico converter',
    'svg to favicon converter',
    'svg viewer online',
    'svg to png',
    'svg to ico',
    'convert svg to png',
    'convert svg to ico',
    'svg to favicon',
    'export svg to png',
    'high resolution svg to png',
    'svg code viewer',
    'svg inspector',
    'svg editor online',
    'offline svg viewer',
    'free vector graphics viewer',
    'browser svg tool',
    'client side svg converter',
    'privacy friendly svg viewer',
  ],
  authors: [{ name: 'Free SVG Viewer' }],
  creator: 'Free SVG Viewer',
  publisher: 'Free SVG Viewer',
  applicationName: 'Free SVG Viewer',
  category: 'Developer & Design Tools',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/favicon-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/icons/icon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://freesvgviewer.com',
    siteName: 'Free SVG Viewer',
    title: 'Free SVG Viewer & Converter | View, Inspect & Convert SVG to PNG/ICO',
    description:
      'View, pan, zoom, inspect code, and convert SVG files to high-resolution PNG (1x, 2x, 4x) or ICO favicon. 100% free, private, and works offline.',
    images: [
      {
        url: '/icons/icon-512.png',
        width: 512,
        height: 512,
        alt: 'Free SVG Viewer & Converter',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free SVG Viewer & Converter | Convert SVG to PNG & ICO',
    description:
      'Instant SVG viewer, inspector, and high-res PNG / ICO converter. Runs 100% offline in your browser with zero file uploads.',
    images: ['/icons/icon-512.png'],
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
  name: 'Free SVG Viewer & Converter',
  url: 'https://freesvgviewer.com',
  description:
    'Free, ultra-fast, and privacy-focused online SVG viewer and converter. Open, zoom, pan, inspect code, and convert SVG to PNG or ICO favicon offline.',
  applicationCategory: 'DesignApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires JavaScript. Requires HTML5.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'Free SVG Viewer with pan, zoom and reset controls',
    'SVG to PNG Converter with 1x, 2x, and 4x resolution presets',
    'SVG to ICO Converter for browser favicons',
    'SVG Code Inspector with live syntax highlighting',
    '100% Client-side processing - files never leave your device',
    'Progressive Web App (PWA) with full offline support',
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
