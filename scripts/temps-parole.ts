/**
 * Temps de parole politique, chaîne par chaîne : relevés mensuels publiés par l'Arcom (fichiers CSV « open data »,
 * hors période électorale). Aucun appel à une IA : on additionne les chiffres de l'Arcom, sans les retoucher.
 *
 * Les trois derniers mois publiés sont additionnés, émissions d'information comprises (journaux, magazines, autres
 * programmes). Chaque parti est rangé dans un bloc selon la grille officielle des nuances du ministère de l'Intérieur
 * (content/acteurs/nuances.json) ; un parti absent de la grille reste « non classé ». Le pouvoir exécutif (président
 * de la République et gouvernement) est compté à part, comme le fait l'Arcom.
 *
 * Sortie : content/medias/temps-parole.json. Usage : npx tsx scripts/temps-parole.ts [--dry]
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const DRY = process.argv.includes('--dry')
const OUT = path.join(ROOT, 'content/medias/temps-parole.json')
const BASE = 'https://www.arcom.fr'
const LISTING = (year: number) => `${BASE}/temps-parole/hors-elections/recherche/source/${year}`
const MONTHS = 3
const UA = { 'User-Agent': 'Mozilla/5.0 (compatible; CaVoteRecherche/1.0)' }

/** Nom du service dans les fichiers de l'Arcom → identifiant du média suivi (content/medias/liste.json) */
const SERVICES: Record<string, string> = {
  TF1: 'tf1',
  'France 2': 'france-2',
  'France 3': 'france-3',
  M6: 'm6',
  TMC: 'tmc',
  BFMTV: 'bfmtv',
  CNews: 'cnews',
  LCI: 'lci',
  'franceinfo:': 'franceinfo',
  'France Inter': 'france-inter',
  'France Culture': 'france-culture',
  RMC: 'rmc',
  RTL: 'rtl',
  'Europe 1': 'europe-1',
  'Sud Radio': 'sud-radio',
}

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[^a-z0-9]+/g, ' ').trim()

const nuances = JSON.parse(readFileSync(path.join(ROOT, 'content/acteurs/nuances.json'), 'utf8')) as { nuances: Record<string, { label: string; bloc: string }> }
const partis = JSON.parse(readFileSync(path.join(ROOT, 'content/partis/partis.json'), 'utf8')) as { partis: { name: string; nuance: string }[] }
/** Libellé de parti → bloc : d'abord le libellé exact d'une nuance officielle, puis la nuance du parti dans nos fiches. */
const blocByName = new Map<string, string>()
for (const n of Object.values(nuances.nuances)) blocByName.set(norm(n.label), n.bloc)
for (const p of partis.partis) if (nuances.nuances[p.nuance]) blocByName.set(norm(p.name), nuances.nuances[p.nuance]!.bloc)
// Libellés de l'Arcom qui diffèrent seulement par la forme de ceux de la grille
const ALIASES: Record<string, string> = { 'mouvement democrate': 'MDM', 'les ecologistes': 'VEC', 'divers centre': 'DVC', 'divers droite': 'DVD', 'divers gauche': 'DVG' }
for (const [k, code] of Object.entries(ALIASES)) blocByName.set(k, nuances.nuances[code]!.bloc)
const blocOf = (party: string) => blocByName.get(norm(party)) ?? 'NC'

const seconds = (v: string) => {
  const m = /^(\d+):(\d{2}):(\d{2})$/.exec(v.trim())
  return m ? Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) : 0
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  for (const line of text.replace(/^﻿/, '').split(/\r?\n/)) {
    if (!line.trim()) continue
    const cells: string[] = []
    let cur = ''
    let q = false
    for (let i = 0; i < line.length; i++) {
      const c = line[i]!
      if (c === '"') {
        if (q && line[i + 1] === '"') (cur += '"'), i++
        else q = !q
      } else if (c === ';' && !q) cells.push(cur), (cur = '')
      else cur += c
    }
    cells.push(cur)
    rows.push(cells)
  }
  return rows
}

async function get(url: string): Promise<string> {
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(40_000) })
      if (res.ok) return await res.text()
    } catch {
      /* nouvel essai */
    }
    await new Promise((r) => setTimeout(r, 2000 * (i + 1)))
  }
  throw new Error(`injoignable : ${url}`)
}

type File = { url: string; from: string; to: string }

/** Fichiers « partis politiques » (Export_web_1T2T_<début>_<fin>.csv) publiés pour l'année donnée. */
async function listFiles(year: number): Promise<File[]> {
  const html = await get(LISTING(year)).catch(() => '')
  const out: File[] = []
  // Les liens figurent dans les données de la page (barres obliques échappées) : on lit le nom du fichier
  for (const m of html.matchAll(/Export_web_1T2T_(\d{2})-(\d{2})-(\d{4})_(\d{2})-(\d{2})-(\d{4})\.csv/g)) {
    out.push({ url: `${BASE}/sites/default/files/tphe/files/speaking_time_files/${m[0]}`, from: `${m[3]}-${m[2]}-${m[1]}`, to: `${m[6]}-${m[5]}-${m[4]}` })
  }
  return out
}

type Channel = { slug: string; service: string; blocs: Record<string, number>; executive: number; parties: Record<string, number> }

async function main() {
  const year = new Date().getUTCFullYear()
  const files = [...(await listFiles(year)), ...(await listFiles(year - 1))]
  const latest = [...new Map(files.map((f) => [f.from, f])).values()].sort((a, b) => b.from.localeCompare(a.from)).slice(0, MONTHS)
  if (latest.length === 0) {
    console.log('Aucun relevé trouvé sur le site de l’Arcom : fichier inchangé.')
    return
  }
  const previous = existsSync(OUT) ? (JSON.parse(readFileSync(OUT, 'utf8')) as { files: File[] }) : null
  if (previous && JSON.stringify(previous.files.map((f) => f.url)) === JSON.stringify(latest.map((f) => f.url))) {
    console.log('Pas de nouveau relevé publié.')
    return
  }

  const channels = new Map<string, Channel>()
  for (const f of latest) {
    const rows = parseCsv(await get(f.url))
    const services = rows[0]!
    for (let col = 1; col < services.length; col++) {
      const slug = SERVICES[services[col]!.trim()]
      if (!slug) continue
      const ch = channels.get(slug) ?? { slug, service: services[col]!.trim(), blocs: {}, executive: 0, parties: {} }
      for (const row of rows.slice(3)) {
        const label = (row[0] ?? '').trim()
        const s = seconds(row[col] ?? '')
        if (!s || /^(Part |Total Partis|dont |Président de la République$|Gouvernement$)/.test(label)) continue
        if (label === 'Total Pouvoir exécutif') {
          ch.executive += s
          continue
        }
        ch.parties[label] = (ch.parties[label] ?? 0) + s
        const bloc = blocOf(label)
        ch.blocs[bloc] = (ch.blocs[bloc] ?? 0) + s
      }
      channels.set(slug, ch)
    }
  }

  const data = {
    _note:
      'Temps de parole politique publiés par l’Arcom (hors période électorale), additionnés sur les trois derniers mois publiés, en secondes. Blocs : grille officielle des nuances du ministère de l’Intérieur ; NC = parti absent de la grille. Fichier écrit par scripts/temps-parole.ts, ne pas modifier à la main.',
    updatedAt: new Date().toISOString(),
    from: latest[latest.length - 1]!.from,
    to: latest[0]!.to,
    source: { title: 'Relevés des temps de parole hors périodes électorales', publisher: 'Arcom', url: `${BASE}/temps-parole/hors-elections` },
    files: latest,
    channels: [...channels.values()].sort((a, b) => Object.keys(SERVICES).indexOf(a.service) - Object.keys(SERVICES).indexOf(b.service)),
  }
  const unclassified = new Set(data.channels.flatMap((c) => Object.keys(c.parties).filter((p) => blocOf(p) === 'NC')))
  console.log(`${latest.length} mois (${data.from} → ${data.to}), ${data.channels.length} services. Non classés : ${[...unclassified].join(', ') || 'aucun'}`)
  if (!DRY) writeFileSync(OUT, JSON.stringify(data, null, 2) + '\n')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
