import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FinTracker',
    short_name: 'FinTracker',
    description: 'Personal Monzo finance tracker',
    start_url: '/',
    display: 'standalone',
    background_color: '#0d0d14',
    theme_color: '#6366f1',
    orientation: 'portrait',
    icons: [
      { src: '/icon', sizes: '32x32',   type: 'image/png' },
      { src: '/icon', sizes: '192x192', type: 'image/png' },
      { src: '/icon', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
