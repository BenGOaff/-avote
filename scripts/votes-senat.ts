/**
 * Votes au Sénat des candidats sénateurs, depuis les pages officielles des scrutins publics (senat.fr).
 * On retient les scrutins « sur l'ensemble » d'un texte de la session, à partir de la date où le candidat siège,
 * et on recopie la liste nominative où figure son nom : pour, contre, abstention, n'a pas pris part au vote.
 *
 * Usage : npx tsx scripts/votes-senat.ts
 */
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fetchText } from './web-lib'

const ROOT = process.cwd()
const OUT = path.join(ROOT, 'content/acteurs/votes-senat.json')
const SESSION = '2025'
/** Candidats qui siègent au Sénat, avec la date depuis laquelle ils y votent (page sénateur officielle). */
const SENATEURS: Record<string, { name: string; since: string; page: string }> = {
  'bruno-retailleau': { name: 'Bruno Retailleau', since: '2025-11-13', page: 'https://www.senat.fr/senateur/retailleau_bruno04033b.html' },
}
const MONTHS: Record<string, number> = { janvier: 1, février: 2, mars: 3, avril: 4, mai: 5, juin: 6, juillet: 7, août: 8, septembre: 9, octobre: 10, novembre: 11, décembre: 12 }
const ENT: Record<string, string> = { '&deg;': '°', '&nbsp;': ' ', '&amp;': '&', '&#039;': "'", '&quot;': '"', '&rsquo;': '’', '&eacute;': 'é', '&egrave;': 'è', '&agrave;': 'à' }
const text = (h: string) =>
  h
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, (e) => ENT[e] ?? (e.startsWith('&#') ? String.fromCharCode(Number(e.slice(2, -1))) : ' '))
    .replace(/\s+/g, ' ')

/** Texte de la page (avec repli curl si le site refuse le client Node). */
async function get(url: string) {
  const t = await fetchText(url)
  if (!t) throw new Error(`${url} : illisible`)
  return text(t)
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function main() {
  const list = text(await get(`https://www.senat.fr/scrutin-public/scr${SESSION}.html`))
  const items = [...list.matchAll(/Scrutin N°\s*(\d+)\s*:\s*(sur .*?)\s*-\s*consulter le dossier législatif/g)].filter((m) => /^sur l['’]ensemble|constituant l['’]ensemble/.test(m[2]!))
  const out: Record<string, { since: string; page: string; scrutins: unknown[] }> = {}
  for (const [slug, s] of Object.entries(SENATEURS)) out[slug] = { since: s.since, page: s.page, scrutins: [] }
  for (const m of items) {
    const numero = Number(m[1])
    const url = `https://www.senat.fr/scrutin-public/${SESSION}/scr${SESSION}-${numero}.html`
    const s = text(await get(url))
    await sleep(300)
    const d = /Scrutin n°\d+ - séance du (\d+)(?:er)? (\S+) (\d{4})/.exec(s)
    if (!d) continue
    const date = `${d[3]}-${String(MONTHS[d[2]!] ?? 0).padStart(2, '0')}-${d[1]!.padStart(2, '0')}`
    const tot = /(\d+) pour (\d+) contre/.exec(s)
    const sort = /Le Sénat a adopté/.test(s) ? 'adopté' : /Le Sénat n.a pas adopté/.test(s) ? 'rejeté' : ''
    const heads = [
      ...[...s.matchAll(/Ont voté pour /g)].map((x) => [x.index!, 'pour'] as const),
      ...[...s.matchAll(/Ont voté contre /g)].map((x) => [x.index!, 'contre'] as const),
      ...[...s.matchAll(/Abstentions [A-ZÉ]/g)].map((x) => [x.index!, 'abstention'] as const),
      ...[...s.matchAll(/N'ont pas pris part au vote [A-ZÉ]/g)].map((x) => [x.index!, 'non-votant'] as const),
    ].sort((a, b) => a[0] - b[0])
    const first = heads[0]?.[0] ?? s.length
    for (const [slug, sen] of Object.entries(SENATEURS)) {
      if (date < sen.since) continue
      const at = [...s.matchAll(new RegExp(sen.name, 'g'))].map((x) => x.index!).find((i) => i > first)
      const before = at === undefined ? [] : heads.filter(([i]) => i < at)
      const vote = before.length ? before[before.length - 1]![1] : 'absent'
      out[slug]!.scrutins.push({ numero, date, titre: m[2], sort, pour: tot ? Number(tot[1]) : null, contre: tot ? Number(tot[2]) : null, vote, url })
    }
  }
  writeFileSync(
    OUT,
    JSON.stringify({ _note: 'Votes nominatifs au Sénat sur l’ensemble des textes, recopiés des pages officielles des scrutins publics.', source: `https://www.senat.fr/scrutin-public/scr${SESSION}.html`, fetchedAt: new Date().toISOString().slice(0, 10), senateurs: out }, null, 1) + '\n',
  )
  for (const [slug, o] of Object.entries(out)) console.log(slug, o.scrutins.length, 'scrutins')
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
