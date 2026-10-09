/**
 * Votes des candidats députés, depuis l'open data officiel de l'Assemblée nationale (XVIIe législature).
 * Télécharge Scrutins.json.zip et la liste des députés en exercice, retrouve les candidats par nom et prénom,
 * et écrit content/acteurs/votes-an.json : scrutins solennels (grands textes) et motions de censure.
 * Aucune interprétation : le vote nominatif est recopié tel quel.
 *
 * Usage : npx tsx scripts/votes-an.ts   (nécessite la commande unzip)
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

const BASE = 'https://data.assemblee-nationale.fr/static/openData/repository/17'
const SCRUTINS = `${BASE}/loi/scrutins/Scrutins.json.zip`
const DEPUTES = `${BASE}/amo/deputes_actifs_mandats_actifs_organes/AMO10_deputes_actifs_mandats_actifs_organes.json.zip`
const ROOT = process.cwd()
const OUT = path.join(ROOT, 'content/acteurs/votes-an.json')

async function fetchZip(url: string, dir: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${url} : ${res.status}`)
  mkdirSync(dir, { recursive: true })
  const file = path.join(dir, 'f.zip')
  writeFileSync(file, Buffer.from(await res.arrayBuffer()))
  execFileSync('unzip', ['-q', '-o', file, '-d', dir])
}

const norm = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z]+/g, ' ').trim()
type Votant = { acteurRef: string }
const list = (x: { votant?: Votant | Votant[] } | null | undefined): Votant[] => (!x?.votant ? [] : Array.isArray(x.votant) ? x.votant : [x.votant])

async function main() {
  const tmp = mkdtempSync(path.join(tmpdir(), 'an-'))
  const dDir = path.join(tmp, 'd')
  const sDir = path.join(tmp, 's')
  await fetchZip(DEPUTES, dDir)
  await fetchZip(SCRUTINS, sDir)

  const candidats = (JSON.parse(readFileSync(path.join(ROOT, 'content/acteurs/candidatures.json'), 'utf8')) as { actors: { slug: string; name: string; verified?: boolean }[] }).actors.filter((a) => a.verified !== false)
  const byName = new Map(candidats.map((c) => [norm(c.name), c.slug]))
  const deputes = new Map<string, string>()
  const acteurs = path.join(dDir, 'json/acteur')
  for (const f of readdirSync(acteurs)) {
    const a = JSON.parse(readFileSync(path.join(acteurs, f), 'utf8')).acteur
    const slug = byName.get(norm(`${a.etatCivil.ident.prenom} ${a.etatCivil.ident.nom}`))
    if (slug) deputes.set(typeof a.uid === 'string' ? a.uid : a.uid['#text'], slug)
  }

  const scrutins: Record<string, unknown>[] = []
  const votes: Record<string, Record<string, string>> = Object.fromEntries([...deputes.values()].map((s) => [s, {}]))
  const dir = path.join(sDir, 'json')
  for (const f of readdirSync(dir)) {
    const x = JSON.parse(readFileSync(path.join(dir, f), 'utf8')).scrutin
    const type = x.typeVote.codeTypeVote
    if (type !== 'SPS' && type !== 'MOC') continue
    const groupes = [x.ventilationVotes.organe.groupes.groupe].flat()
    const seen = new Map<string, string>()
    for (const g of groupes) {
      const dn = g.vote.decompteNominatif ?? {}
      for (const [k, lab] of [['pours', 'pour'], ['contres', 'contre'], ['abstentions', 'abstention'], ['nonVotants', 'non-votant']] as const)
        for (const v of list(dn[k])) if (deputes.has(v.acteurRef)) seen.set(v.acteurRef, lab)
    }
    for (const [uid, slug] of deputes) votes[slug]![x.numero] = seen.get(uid) ?? (type === 'SPS' ? 'absent' : 'pas-pour')
    const d = x.syntheseVote.decompte
    scrutins.push({
      numero: Number(x.numero),
      date: x.dateScrutin,
      type: type === 'MOC' ? 'censure' : 'solennel',
      titre: x.titre,
      sort: x.sort.code,
      dossier: x.objet?.dossierLegislatif?.libelle ?? '',
      pour: Number(d.pour),
      contre: Number(d.contre ?? 0),
      abstentions: Number(d.abstentions ?? 0),
    })
  }
  scrutins.sort((a, b) => (a.numero as number) - (b.numero as number))
  const previous = JSON.parse(readFileSync(OUT, 'utf8'))
  writeFileSync(OUT, JSON.stringify({ ...previous, fetchedAt: new Date().toISOString().slice(0, 10), scrutins, votes }, null, 1) + '\n')
  console.log(`${scrutins.length} scrutins, ${deputes.size} candidats députés : ${[...deputes.values()].join(', ')}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
