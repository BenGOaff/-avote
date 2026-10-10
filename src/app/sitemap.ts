import type { MetadataRoute } from 'next'
import { getArticles } from '@/lib/content'
import { absolute } from '@/lib/site'
import { getAnnouncedActors } from '@/lib/actors'
import { getPartis } from '@/lib/partis'

// Pages publiques uniquement : jamais de route personnelle (résultats, profil). Le test est public : les réponses restent dans le navigateur.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const statics = ['/', '/test', '/radar', '/candidats', '/comparateur', '/partis', '/le-projet', '/contact', '/methodologie', '/sources', '/corrections', '/independance', '/studio', '/newsletter', '/medias', '/medias/libres', '/urne', '/quiz', '/boutique', '/confidentialite', '/mentions-legales']
  return [
    ...statics.map((p) => ({ url: absolute(p), lastModified: now, changeFrequency: (p === '/radar' || p === '/' ? 'hourly' : 'weekly') as 'hourly' | 'weekly', priority: p === '/' ? 1 : p === '/test' ? 0.9 : 0.7 })),
    ...getAnnouncedActors().map((a) => ({ url: absolute(`/candidats/${a.slug}`), lastModified: now, changeFrequency: 'daily' as const, priority: 0.8 })),
    ...getPartis().map((p) => ({ url: absolute(`/partis/${p.slug}`), lastModified: now, changeFrequency: 'weekly' as const, priority: 0.7 })),
    ...getArticles().map((a) => ({ url: absolute(`/radar/${a.slug}`), lastModified: new Date(a.updated ?? a.date), changeFrequency: 'monthly' as const, priority: 0.8 })),
  ]
}
