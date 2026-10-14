import type { MetadataRoute } from 'next'
import { getArticles } from '@/lib/content'
import { absolute } from '@/lib/site'
import { getAnnouncedActors } from '@/lib/actors'
import { getPartis } from '@/lib/partis'
import { actorUpdatedAt, getCandidatSujets, getSujets } from '@/lib/sujets'
import { getIntox, intoxPath, intoxUpdated } from '@/lib/intox'
import { getCandidateDuels } from '@/lib/duels'
import { GUIDES } from '@/lib/guides'
import { getFlashQuizzes } from '@/lib/flash-content'
import { getMedias } from '@/lib/medias'
import { mediaLogoOf } from '@/lib/images'

// Pages publiques uniquement : jamais de route personnelle (résultats, profil). Le test est public : les réponses restent dans le navigateur.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const mediaLogos = getMedias()
    .map((m) => mediaLogoOf(m.slug))
    .filter((x): x is string => !!x)
    .map((x) => absolute(x))
  const statics = ['/', '/test', '/radar', '/candidats', '/programmes', '/comparateur', '/partis', '/livres', '/le-projet', '/contact', '/methodologie', '/sources', '/corrections', '/independance', '/studio', '/newsletter', '/medias', '/medias/libres', '/fake-news', '/verifier', '/urne', '/quiz', '/duel', '/voter', '/boutique', '/confidentialite', '/mentions-legales']
  return [
    ...statics.map((p) => ({
      url: absolute(p),
      // Une date seulement là où le contenu change vraiment à chaque mise en ligne : une date fausse fait ignorer les vraies
      ...(p === '/' || p === '/radar' ? { lastModified: now } : {}),
      changeFrequency: (p === '/radar' || p === '/' ? 'hourly' : 'weekly') as 'hourly' | 'weekly',
      priority: p === '/' ? 1 : p === '/test' ? 0.9 : 0.7,
      // Logos des médias : la page « Qui possède ton info » ressort aussi en recherche d'images
      ...(p === '/medias' ? { images: mediaLogos } : {}),
    })),
    ...getAnnouncedActors().map((a) => {
      const updated = actorUpdatedAt(a.slug)
      return { url: absolute(`/candidats/${a.slug}`), ...(updated ? { lastModified: new Date(updated) } : {}), changeFrequency: 'daily' as const, priority: 0.8 }
    }),
    ...getAnnouncedActors()
      .filter((a) => a.status !== 'retire')
      .flatMap((a) => {
        const updated = actorUpdatedAt(a.slug)
        return getCandidatSujets(a.slug).map((cs) => ({ url: absolute(`/candidats/${a.slug}/${cs.sujet.slug}`), ...(updated ? { lastModified: new Date(updated) } : {}), changeFrequency: 'weekly' as const, priority: 0.7 }))
      }),
    ...getCandidateDuels().map((d) => ({ url: absolute(`/comparateur/${d.slug}`), ...(d.updatedAt ? { lastModified: new Date(d.updatedAt) } : {}), changeFrequency: 'weekly' as const, priority: 0.8 })),
    ...GUIDES.map((g) => ({ url: absolute(`/voter/${g.slug}`), lastModified: new Date(g.checkedAt), changeFrequency: 'monthly' as const, priority: 0.8 })),
    ...getIntox().map((x) => ({ url: absolute(intoxPath(x)), lastModified: new Date(intoxUpdated(x)), changeFrequency: 'monthly' as const, priority: 0.7 })),
    ...getSujets().map((s) => ({ url: absolute(`/programmes/${s.slug}`), lastModified: s.updatedAt ? new Date(s.updatedAt) : now, changeFrequency: 'daily' as const, priority: 0.9, images: [absolute(`/programmes/${s.slug}/carte.png`)] })),
    ...getFlashQuizzes().map((q) => ({ url: absolute(`/quiz/flash/${q.slug}`), changeFrequency: 'monthly' as const, priority: 0.7 })),
    ...getPartis().map((p) => ({ url: absolute(`/partis/${p.slug}`), changeFrequency: 'weekly' as const, priority: 0.7 })),
    ...getArticles().map((a) => ({ url: absolute(`/radar/${a.slug}`), lastModified: new Date(a.updated ?? a.date), changeFrequency: 'monthly' as const, priority: 0.8 })),
  ]
}
