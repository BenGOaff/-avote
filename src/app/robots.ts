import type { MetadataRoute } from 'next'
import { absolute } from '@/lib/site'

// Les robots des moteurs de réponse IA sont autorisés sur les pages publiques (citations, GEO).
// Les surfaces personnelles (résultats, profil) et l'API sont exclues pour tous ; la page du test, elle, est publique (les réponses restent dans le navigateur).
export default function robots(): MetadataRoute.Robots {
  const disallow = ['/resultats', '/mon-profil', '/api/', '/newsletter/confirmer', '/design', '/plus']
  return {
    rules: [{ userAgent: '*', allow: '/', disallow }],
    sitemap: absolute('/sitemap.xml'),
  }
}
