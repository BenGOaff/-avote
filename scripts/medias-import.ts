/**
 * Import de fiches médias et d'alertes Arcom établies hors API (recherche faite dans une session Claude Code,
 * ou à la main). Mêmes garde-fous que scripts/medias.ts : chaque page est retéléchargée, la citation doit y
 * figurer mot pour mot et nommer le propriétaire ; une alerte doit venir d'un site officiel. Ce qui échoue
 * n'est pas importé.
 *
 * Usage :
 *   npx tsx scripts/medias-import.ts --check recherche.json   (vérifie seulement, n'écrit rien)
 *   npx tsx scripts/medias-import.ts recherche.json           (vérifie puis écrit content/medias/proprietaires.json)
 *
 * Format : { "medias": [{ slug, owners, group, controller, controllerKind, otherMedia, note, quote, url,
 *            sourceTitle, publisher, date }], "alertes": [{ slug, searched, items: [{ date, kind, topic,
 *            summary, quote, url, publisher }] }] }
 */
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { z } from 'zod'
import { canonicalUrl, quoteIsInSource } from './veille-lib'
import { fetchText } from './web-lib'
import { ALERT_DOMAINS, ALERT_KINDS, ALERT_TOPICS, CONTROLLER_KINDS, OWNER_KINDS, clip, quoteNamesOwner } from './medias-lib'

const ROOT = process.cwd()
const args = process.argv.slice(2)
const CHECK = args.includes('--check')
const FILE = args.find((a) => !a.startsWith('--'))
if (!FILE) {
  console.error('Fichier de recherche manquant.')
  process.exit(1)
}
const OUT = path.join(ROOT, 'content/medias/proprietaires.json')
const list = JSON.parse(readFileSync(path.join(ROOT, 'content/medias/liste.json'), 'utf8')) as { medias: { slug: string; name: string }[] }
const store = JSON.parse(readFileSync(OUT, 'utf8'))
store.alertes ??= {}

const Input = z.object({
  medias: z
    .array(
      z.object({
        slug: z.string(),
        owners: z.array(z.object({ name: z.string().min(1), kind: z.enum(OWNER_KINDS), share: z.string() })).min(1),
        group: z.string(),
        controller: z.string().min(2),
        controllerKind: z.enum(CONTROLLER_KINDS),
        otherMedia: z.array(z.string()).default([]),
        note: z.string().default(''),
        quote: z.string().min(30),
        url: z.string(),
        sourceTitle: z.string(),
        publisher: z.string(),
        date: z.string(),
      }),
    )
    .default([]),
  alertes: z
    .array(
      z.object({
        slug: z.string(),
        searched: z.boolean(),
        items: z.array(
          z.object({
            date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
            kind: z.enum(ALERT_KINDS),
            topic: z.enum(ALERT_TOPICS),
            summary: z.string().min(20),
            quote: z.string().min(30),
            url: z.string(),
            publisher: z.string(),
          }),
        ),
      }),
    )
    .default([]),
})

const name = (slug: string) => list.medias.find((m) => m.slug === slug)?.name

async function main() {
  const input = Input.parse(JSON.parse(readFileSync(FILE!, 'utf8')))
  const pages = new Map<string, string | null>()
  const page = async (url: string) => {
    if (!pages.has(url)) pages.set(url, await fetchText(url))
    return pages.get(url)!
  }
  let ok = 0
  let ko = 0
  const fail = (label: string, why: string) => {
    ko++
    console.warn(`✗ ${label} : ${why}`)
  }

  for (const f of input.medias) {
    if (!name(f.slug)) {
      fail(f.slug, 'absent de content/medias/liste.json')
      continue
    }
    const url = canonicalUrl(f.url)
    if (!url) {
      fail(f.slug, 'adresse invalide')
      continue
    }
    const text = await page(url)
    if (!text) {
      fail(f.slug, `page illisible (${url})`)
      continue
    }
    if (!quoteIsInSource(f.quote, text)) {
      fail(f.slug, `citation introuvable dans ${url}`)
      continue
    }
    if (!quoteNamesOwner(f.quote, f)) {
      fail(f.slug, 'la citation ne nomme ni le propriétaire ni le contrôle')
      continue
    }
    ok++
    console.log(`✓ ${name(f.slug)} : ${f.controller}`)
    store.medias[f.slug] = {
      slug: f.slug,
      owners: f.owners.map((o) => ({ name: o.name.slice(0, 120), kind: o.kind, share: o.share.slice(0, 40) })),
      group: f.group.slice(0, 120),
      controller: f.controller.slice(0, 160),
      controllerKind: f.controllerKind,
      otherMedia: f.otherMedia.slice(0, 12).map((x) => x.slice(0, 80)),
      note: clip(f.note, 300),
      quote: f.quote.slice(0, 320),
      url,
      sourceTitle: f.sourceTitle.slice(0, 200) || url,
      publisher: f.publisher.slice(0, 100) || new URL(url).hostname,
      date: f.date,
      checkedAt: new Date().toISOString(),
      model: 'recherche vérifiée hors API',
    }
  }

  for (const a of input.alertes) {
    if (!name(a.slug)) {
      fail(a.slug, 'absent de content/medias/liste.json')
      continue
    }
    const items = []
    for (const it of a.items) {
      const label = `${name(a.slug)} (Arcom, ${it.date})`
      const url = canonicalUrl(it.url)
      if (!url || !ALERT_DOMAINS.some((d) => new URL(url).hostname.endsWith(d))) {
        fail(label, `source hors domaines officiels (${it.url})`)
        continue
      }
      const text = await page(url)
      if (!text || !quoteIsInSource(it.quote, text)) {
        fail(label, `citation introuvable dans ${url}`)
        continue
      }
      ok++
      console.log(`✓ ${label} : ${it.kind}, ${it.topic}`)
      items.push({ date: it.date, kind: it.kind, topic: it.topic, summary: clip(it.summary.trim(), 280), quote: it.quote.slice(0, 320), url, publisher: it.publisher.slice(0, 80) || new URL(url).hostname })
    }
    // Recherche inachevée et rien de vérifié : le média n'est pas marqué comme contrôlé
    if (!a.searched && items.length === 0) continue
    const prev = store.alertes[a.slug]?.items ?? []
    // Une décision déjà vérifiée n'est jamais effacée
    for (const p of prev) if (!items.some((i) => i.url === p.url && i.date === p.date)) items.push(p)
    items.sort((x, y) => y.date.localeCompare(x.date))
    store.alertes[a.slug] = { checkedAt: new Date().toISOString(), items }
  }

  console.log(`${ok} élément(s) vérifié(s), ${ko} écarté(s).`)
  if (CHECK) return console.log('Vérification seule : rien n’est écrit.')
  store.updatedAt = new Date().toISOString()
  writeFileSync(OUT, JSON.stringify(store, null, 2) + '\n')
  console.log(`${Object.keys(store.medias).length} fiches sur ${list.medias.length} dans ${path.relative(ROOT, OUT)}.`)
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
