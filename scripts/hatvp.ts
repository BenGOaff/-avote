/**
 * Pages officielles de la HATVP (Haute Autorité pour la transparence de la vie publique) des candidats,
 * depuis son open data (liste.csv). On relie seulement la page nominative et la liste des mandats déclarés :
 * aucun chiffre des déclarations de patrimoine des parlementaires (leur publication est interdite).
 *
 * Usage : npx tsx scripts/hatvp.ts
 */
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const CSV = 'https://www.hatvp.fr/livraison/opendata/liste.csv'
const ROOT = process.cwd()
const OUT = path.join(ROOT, 'content/acteurs/hatvp.json')
const norm = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z]+/g, ' ').trim()

const MANDAT: Record<string, string> = {
  depute: 'Assemblée nationale',
  senateur: 'Sénat',
  europe: 'Parlement européen',
  region: 'région',
  departement: 'département',
  commune: 'commune',
  epci: 'intercommunalité',
  gouvernement: 'gouvernement',
}

async function main() {
  const res = await fetch(CSV)
  if (!res.ok) throw new Error(`liste.csv : ${res.status}`)
  const lines = (await res.text()).split(/\r?\n/).filter(Boolean)
  const head = lines[0]!.split(';')
  const rows = lines.slice(1).map((l) => Object.fromEntries(l.split(';').map((v, i) => [head[i], v])) as Record<string, string>)
  const candidats = (JSON.parse(readFileSync(path.join(ROOT, 'content/acteurs/candidatures.json'), 'utf8')) as { actors: { slug: string; name: string; verified?: boolean }[] }).actors.filter((a) => a.verified !== false)
  const out: Record<string, { url: string; mandats: string[] }> = {}
  for (const c of candidats) {
    const hits = rows.filter((r) => norm(`${r.prenom} ${r.nom}`) === norm(c.name))
    if (hits.length === 0) continue
    const dossier = hits.find((h) => h.url_dossier)?.url_dossier
    if (!dossier) continue
    out[c.slug] = { url: `https://www.hatvp.fr/fiche-nominative/?declarant=${dossier.split('/').filter(Boolean).pop()}`, mandats: [...new Set(hits.map((h) => MANDAT[h.type_mandat ?? ''] ?? h.type_mandat ?? ''))] }
  }
  writeFileSync(OUT, JSON.stringify({ _note: 'Pages nominatives HATVP des candidats, depuis l’open data officiel (liste.csv). Lien seulement.', source: CSV, fetchedAt: new Date().toISOString().slice(0, 10), pages: out }, null, 2) + '\n')
  console.log(Object.keys(out).length, 'candidats :', Object.keys(out).join(', '))
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
