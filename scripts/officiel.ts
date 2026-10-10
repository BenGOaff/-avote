/**
 * Sources officielles de la présidentielle 2027 : parrainages publiés par le Conseil constitutionnel.
 *
 * Avant la liste officielle des candidats (début mars 2027 si le calendrier de 2022 se répète), seule la publication
 * des parrainages est officielle : le Conseil constitutionnel publie, deux fois par semaine dès l'ouverture de la
 * période, un fichier de tous les parrainages validés. Ce script :
 *  - lit ce fichier (format de 2022 : Civilité;Nom;Prénom;Mandat;Circonscription;Département;Candidat;Date de publication) ;
 *  - compte les parrainages par candidat et les range dans content/acteurs/parrainages.json (affichés sur les fiches) ;
 *  - ajoute aux candidatures, avec ce fichier pour source, toute personne qui atteint 500 parrainages sans être suivie ;
 *  - signale (fichier .officiel-alert) l'ouverture du site 2027 du Conseil constitutionnel et chaque nouveau candidat.
 * Aucun appel à une IA ici.
 *
 * Usage : npx tsx scripts/officiel.ts [--dry]   (OFFICIEL_PARRAINAGES_URL pour tester sur le fichier de 2022)
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { slugify } from './veille-lib'

const ROOT = process.cwd()
const DRY = process.argv.includes('--dry')
const SITE = 'https://presidentielle2027.conseil-constitutionnel.fr/'
const CSV_URL = process.env.OFFICIEL_PARRAINAGES_URL || `${SITE}telechargement/parrainagestotal.csv`
const OUT = path.join(ROOT, 'content/acteurs/parrainages.json')
const STATE = path.join(ROOT, 'content/veille/officiel.json')
const ALERT = path.join(ROOT, '.officiel-alert')
const NEW_ACTORS = path.join(ROOT, '.officiel-new-actors')
const THRESHOLD = 500

type Cand = { slug: string; name: string; status: string; since: string; source: { title: string; publisher: string; url: string }; verified: boolean; addedBy?: string }
const CAND_FILE = path.join(ROOT, 'content/acteurs/candidatures.json')

/** « MÉLENCHON Jean-Luc » et « Jean-Luc Mélenchon » donnent la même clé. */
const nameKey = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .split(/[^a-z]+/)
    .filter(Boolean)
    .sort()
    .join(' ')

/** « MÉLENCHON Jean-Luc » → « Jean-Luc Mélenchon » (nom en majuscules suivi du prénom). */
function displayName(csvName: string): string {
  const words = csvName.trim().split(/\s+/)
  const upper = words.filter((w) => w === w.toUpperCase())
  const rest = words.filter((w) => w !== w.toUpperCase())
  const cap = (w: string) => w.toLowerCase().replace(/(^|[-'])(\p{L})/gu, (_, p, c) => p + c.toUpperCase())
  return [...rest, ...upper.map(cap)].join(' ')
}

function parseCsv(text: string): { candidate: string; date: string }[] {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/).filter(Boolean)
  const header = lines.shift()?.split(';').map((h) => h.replace(/"/g, '').trim().toLowerCase()) ?? []
  const iCand = header.indexOf('candidat')
  const iDate = header.findIndex((h) => h.startsWith('date'))
  if (iCand < 0) throw new Error('colonne « Candidat » absente : le format a changé')
  return lines.map((l) => {
    const cells = l.split(';').map((c) => c.replace(/^"|"$/g, '').trim())
    return { candidate: cells[iCand] ?? '', date: iDate >= 0 ? (cells[iDate] ?? '') : '' }
  })
}

/** « 01/02/2022 » → « 2022-02-01 » */
const isoDate = (d: string) => (/^\d{2}\/\d{2}\/\d{4}$/.test(d) ? `${d.slice(6)}-${d.slice(3, 5)}-${d.slice(0, 2)}` : '')

async function get(url: string): Promise<Response | null> {
  try {
    return await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CaVoteRecherche/1.0)' }, signal: AbortSignal.timeout(60_000) })
  } catch {
    return null
  }
}

async function main() {
  const now = new Date().toISOString()
  const state = existsSync(STATE) ? (JSON.parse(readFileSync(STATE, 'utf8')) as { siteOpen?: string; checkedAt?: string }) : {}
  const alerts: string[] = []
  const added: string[] = []

  const site = await get(SITE)
  if (site?.ok && !state.siteOpen) {
    state.siteOpen = now
    alerts.push(`Le site officiel du Conseil constitutionnel pour 2027 est en ligne : ${SITE}`)
  }

  const res = await get(CSV_URL)
  if (res?.ok) {
    const rows = parseCsv(await res.text())
    const counts = new Map<string, number>()
    for (const r of rows) if (r.candidate) counts.set(r.candidate, (counts.get(r.candidate) ?? 0) + 1)
    const published = rows.map((r) => isoDate(r.date)).filter(Boolean).sort().at(-1) ?? ''
    const file = JSON.parse(readFileSync(CAND_FILE, 'utf8')) as { actors: Cand[]; collectedAt: string }
    const byKey = new Map(file.actors.map((a) => [nameKey(a.name), a]))
    const out: Record<string, number> = {}
    const others: { name: string; count: number }[] = []
    for (const [name, n] of [...counts.entries()].sort((a, b) => b[1] - a[1])) {
      const known = byKey.get(nameKey(name))
      if (known) {
        out[known.slug] = n
        continue
      }
      // 500 parrainages validés : la candidature est assurée d'être examinée, on l'ajoute avec la source officielle
      if (n >= THRESHOLD) {
        const display = displayName(name)
        const slug = slugify(display, 80)
        file.actors.push({ slug, name: display, status: 'declare', since: published || now.slice(0, 10), source: { title: 'Parrainages validés pour l’élection présidentielle 2027', publisher: 'Conseil constitutionnel', url: CSV_URL }, verified: true, addedBy: 'sources officielles' })
        out[slug] = n
        added.push(slug)
        alerts.push(`Nouveau candidat avec ${n} parrainages : ${display}`)
      } else others.push({ name: displayName(name), count: n })
    }
    const data = { source: { title: 'Parrainages validés pour l’élection présidentielle 2027', publisher: 'Conseil constitutionnel', url: CSV_URL }, publishedAt: published, fetchedAt: now, threshold: THRESHOLD, counts: out, others }
    console.log(`${rows.length} parrainages, ${counts.size} personnes, publication du ${published || '?'}`)
    for (const [slug, n] of Object.entries(out)) console.log(`  ${slug.padEnd(26)} ${n}`)
    if (!DRY) {
      writeFileSync(OUT, JSON.stringify(data, null, 2) + '\n')
      if (added.length) {
        file.collectedAt = now.slice(0, 10)
        writeFileSync(CAND_FILE, JSON.stringify(file, null, 2) + '\n')
      }
    }
  } else {
    console.log(`Parrainages pas encore publiés (${CSV_URL} : ${res ? res.status : 'injoignable'}).`)
  }

  state.checkedAt = now
  for (const a of alerts) console.log(`! ${a}`)
  if (DRY) return console.log('Mode test : rien n’est écrit.')
  writeFileSync(STATE, JSON.stringify(state, null, 2) + '\n')
  writeFileSync(ALERT, alerts.join('\n'))
  writeFileSync(NEW_ACTORS, added.join('\n'))
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
