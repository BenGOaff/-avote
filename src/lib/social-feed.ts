import 'server-only'
import { getSocialPosts } from './social'
import { absolute } from './site'
import type { SocialPost } from './social-schema'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * Flux d'une publication par réseau, prêt pour un outil d'automatisation (Zapier, Make, n8n) :
 * description = texte à publier (lien compris), enclosure = visuel aux couleurs du site.
 */
export function socialFeed(network: 'x' | 'facebook' | 'linkedin'): Response {
  const items = getSocialPosts().slice(0, 30)
  const link = (p: SocialPost) => absolute(`/social/${p.id}?utm_source=${network}&utm_medium=social&utm_campaign=${p.kind}`)
  // Facebook pénalise les liens sortants : le texte renvoie à çavote.fr en clair, sans URL
  const body = (p: SocialPost) => (network === 'facebook' ? p.text.facebook : `${p.text[network]}\n\n${link(p)}`)
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
    return `<item><title>${esc(p.card.title)}</title><link>${esc(link(p))}</link><guid isPermaLink="false">${p.id}-${network}</guid><pubDate>${new Date(p.at).toUTCString()}</pubDate><description>${esc(body(p))}</description><enclosure url="${esc(img)}" type="image/png" length="0"/><media:content url="${esc(img)}" medium="image" type="image/png"/></item>`
  })
  .join('\n')}
</channel>
</rss>`
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=300' } })
}
