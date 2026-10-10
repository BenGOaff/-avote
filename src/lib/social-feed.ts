import 'server-only'
import { getSocialPosts } from './social'
import { absolute } from './site'
import type { SocialPost } from './social-schema'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * Flux d'une publication par réseau, prêt pour un outil d'automatisation (Zapier, Make, n8n) :
 * description = texte à publier, retours à la ligne compris ; guid (« ID » dans Zapier) = adresse du visuel portrait,
 * le champ le plus sûr à brancher sur « Photo » ; enclosure et media:content la répètent pour les autres outils.
 */
// Facebook, Instagram et LinkedIn passent par Zapier (formule gratuite : 100 publications par mois pour les trois réseaux) :
// une publication par jour, la plus forte (pépite ou « pour ou contre »). X reçoit tout, par scripts/social-x.ts.
const DAILY: SocialPost['kind'][] = ['pepite', 'fracture']

export function socialFeed(network: 'x' | 'facebook' | 'linkedin' | 'instagram'): Response {
  const items = getSocialPosts()
    .filter((p) => network === 'x' || DAILY.includes(p.kind))
    .slice(0, 30)
  const link = (p: SocialPost) => absolute(`/social/${p.id}?utm_source=${network}&utm_medium=social&utm_campaign=${p.kind}`)
  // Facebook pénalise les liens sortants et Instagram ne les rend pas cliquables : texte seul, çavote.fr en clair
  const body = (p: SocialPost) =>
    network === 'facebook' ? p.text.facebook : network === 'instagram' ? (p.text.instagram ?? p.text.facebook) : `${p.text[network]}\n\n${link(p)}`
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
<channel>
<title>Ça vote ? — publications ${network}</title>
<link>${absolute('/')}</link>
<description>Publications préparées pour ${network}.</description>
<language>fr-FR</language>
${items
  .map((p) => {
    const img = absolute(`/social/${p.id}/carte.png`)
    return `<item><title>${esc(p.card.title)}</title><link>${esc(link(p))}</link><guid isPermaLink="false">${esc(img)}</guid><pubDate>${new Date(p.at).toUTCString()}</pubDate><description>${esc(body(p))}</description><enclosure url="${esc(img)}" type="image/png" length="0"/><media:content url="${esc(img)}" medium="image" type="image/png"/></item>`
  })
  .join('\n')}
</channel>
</rss>`
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=300' } })
}
