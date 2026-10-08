import { getArticles, getBriefs } from '@/lib/content'
import { absolute } from '@/lib/site'

export const dynamic = 'force-static'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export function GET() {
  const items = [
    ...getArticles().map((a) => ({
      title: a.type === 'satire' ? `[Satire] ${a.title}` : a.title,
      link: absolute(`/radar/${a.slug}`),
      date: a.date,
      description: a.dek,
    })),
    ...getBriefs().map((b) => ({ title: b.title, link: absolute(`/radar#${b.slug}`), date: b.date, description: `Source : ${b.source.publisher}` })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 50)

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>Ça vote ? — Le Radar</title>
<link>${absolute('/radar')}</link>
<atom:link href="${absolute('/feed.xml')}" rel="self" type="application/rss+xml"/>
<description>L’actu de la présidentielle 2027, avec ses sources.</description>
<language>fr-FR</language>
${items
  .map(
    (i) => `<item><title>${esc(i.title)}</title><link>${esc(i.link)}</link><guid isPermaLink="true">${esc(i.link)}</guid><pubDate>${new Date(i.date).toUTCString()}</pubDate><description>${esc(i.description)}</description></item>`,
  )
  .join('\n')}
</channel>
</rss>`
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=600' } })
}
