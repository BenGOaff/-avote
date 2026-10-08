import type { MetadataRoute } from 'next'
import { absolute } from '@/lib/site'

// Les robots des moteurs de réponse IA sont autorisés sur les pages publiques (citations, GEO).
// Les surfaces personnelles et l'API sont exclues pour tous.
export default function robots(): MetadataRoute.Robots {
  const disallow = ['/test', '/resultats', '/mon-profil', '/api/', '/newsletter/confirmer', '/design', '/plus']
  return {
    rules: [{ userAgent: '*', allow: '/', disallow }],
    sitemap: absolute('/sitemap.xml'),
  }
}
