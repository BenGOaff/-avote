/**
 * Import de positions de candidats établies hors API (recherche faite dans une session Claude Code).
 * Mêmes garde-fous que scripts/positions.ts : la page est retéléchargée et la citation doit y figurer
 * mot pour mot. Une position déjà vérifiée n'est jamais remplacée par un import (le conflit est signalé).
 * Le contrôle de pertinence (la citation porte-t-elle exactement sur l'affirmation ?) se fait à la relecture,
 * avant l'import : le mode --check affiche chaque affirmation en face de sa citation.
 *
 * Usage :
 *   npx tsx scripts/positions-import.ts --check recherche.json   (vérifie seulement, n'écrit rien)
 *   npx tsx scripts/positions-import.ts recherche.json           (vérifie puis écrit content/corpus/live.json)
 *
 * Format : { "actor": "slug", "positions": [{ itemId, value, set, basis, quote, url, sourceTitle, publisher, date, note }] }
 * (ou une liste de tels objets).
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { z } from 'zod'
import { canonicalUrl, quoteIsInSource } from './veille-lib'
import { fetchText } from './web-lib'
import { mergePosition, posLabel, verifiedPosition, type Change } from './positions-lib'
import type { Corpus, CorpusSource } from '../src/lib/engine/types'

const ROOT = process.cwd()
const args = process.argv.slice(2)
const CHECK = args.includes('--check')
const FILE = args.find((a) => !a.startsWith('--'))
if (!FILE) {
  console.error('Fichier de recherche manquant.')
  process.exit(1)
}
const LIVE = path.join(ROOT, 'content/corpus/live.json')
const CHANGES = path.join(ROOT, 'content/corpus/changes.json')
const questionnaire = JSON.parse(readFileSync(path.join(ROOT, 'content/questionnaire/v0.1.0.json'), 'utf8')) as {
  version: string
  items: { id: string; text: string }[]
}
const candidatures = JSON.parse(readFileSync(path.join(ROOT, 'content/acteurs/candidatures.json'), 'utf8')) as {
  actors: { slug: string; name: string; party?: string; status: string; verified?: boolean }[]
}
const live = JSON.parse(readFileSync(LIVE, 'utf8')) as Corpus & { sources: CorpusSource[]; refreshedAt?: Record<string, string>; note?: string }
live.sources ??= []
live.refreshedAt ??= {}
const changes: Change[] = existsSync(CHANGES) ? JSON.parse(readFileSync(CHANGES, 'utf8')) : []

const Batch = z.object({
  actor: z.string(),
  positions: z.array(
    z.object({
      itemId: z.string(),
      value: z.number().int().min(-2).max(2).nullable(),
      set: z.array(z.number().int().min(-2).max(2)).default([]),
      basis: z.enum(['programme-2027', 'declaration', 'programme-2022', 'parti', 'vote']),
      quote: z.string().min(30),
      url: z.string(),
      sourceTitle: z.string(),
      publisher: z.string(),
      date: z.string().default(''),
      note: z.string().default(''),
    }),
  ),
})

async function main() {
  const raw = JSON.parse(readFileSync(FILE!, 'utf8'))
  const batches = z.array(Batch).parse(Array.isArray(raw) ? raw : [raw])
  const now = new Date().toISOString()
  const pages = new Map<string, string | null>()
  let ok = 0
  let ko = 0
  for (const b of batches) {
    const actor = candidatures.actors.find((a) => a.slug === b.actor && a.verified !== false && (a.status === 'declare' || a.status === 'demarche'))
    if (!actor) {
      console.warn(`✗ ${b.actor} : absent des candidatures retenues`)
      ko += b.positions.length
      continue
    }
    const current = live.positions[actor.slug] ?? {}
    let kept = 0
    for (const p of b.positions) {
      const item = questionnaire.items.find((i) => i.id === p.itemId)
      const label = `${actor.name} · ${p.itemId}`
      if (!item) {
        console.warn(`✗ ${label} : question inconnue`)
        ko++
        continue
      }
      if (p.value === null && p.set.length === 0) {
        console.warn(`✗ ${label} : ni valeur ni ensemble`)
        ko++
        continue
      }
      const url = canonicalUrl(p.url)
      if (!url) {
        console.warn(`✗ ${label} : adresse invalide`)
        ko++
        continue
      }
      if (!pages.has(url)) pages.set(url, await fetchText(url))
      const text = pages.get(url)
      if (!text || !quoteIsInSource(p.quote, text)) {
        console.warn(`✗ ${label} : citation introuvable dans ${url}`)
        ko++
        continue
      }
      const prev = current[item.id]
      const next = verifiedPosition(live.sources, p, url, now)
      if (prev && !('missing' in prev) && posLabel(prev) !== posLabel(next)) {
        console.warn(`! ${label} : déjà codée ${posLabel(prev)}, l'import proposait ${posLabel(next)} (non remplacée, à arbitrer)`)
        continue
      }
      mergePosition(current, changes, actor.slug, item.id, next, now)
      ok++
      kept++
      console.log(`✓ ${label} = ${posLabel(next)} (${p.basis})\n    « ${item.text} »\n    → « ${p.quote} »`)
    }
    if (kept === 0) continue
    live.positions[actor.slug] = current
    if (!live.actors.some((a) => a.slug === actor.slug))
      live.actors.push({ slug: actor.slug, name: actor.name, status: actor.status === 'demarche' ? 'demarche' : 'declare', ...(actor.party ? { party: actor.party } : {}), summary: '' })
    live.refreshedAt![actor.slug] = now
  }
  console.log(`${ok} position(s) vérifiée(s), ${ko} écartée(s).`)
  if (CHECK) return console.log('Vérification seule : rien n’est écrit.')
  const known = new Set(live.actors.map((a) => a.slug))
  for (const slug of Object.keys(live.positions)) if (!known.has(slug)) delete live.positions[slug]
  live.version = `live-${now.slice(0, 16).replace(/[-:T]/g, '')}`
  live.publishedAt = now
  live.questionSet = questionnaire.version
  writeFileSync(LIVE, JSON.stringify(live, null, 2) + '\n')
  writeFileSync(CHANGES, JSON.stringify(changes.slice(-2000), null, 2) + '\n')
  console.log(`Référentiel ${live.version} écrit (${live.actors.length} candidats).`)
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
