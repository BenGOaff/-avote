import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Ça vote ?',
    short_name: 'Ça vote ?',
    description: 'Présidentielle 2027 : le test qui part de tes priorités, et le fil d’actu politique.',
    lang: 'fr',
    start_url: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#F5F0E6',
    theme_color: '#F5F0E6',
    categories: ['news', 'politics', 'education'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Faire le test', url: '/test' },
      { name: 'Le Radar', url: '/radar' },
    ],
  }
}
