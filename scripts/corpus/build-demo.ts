/**
 * Génère le corpus de DÉMONSTRATION (acteurs fictifs) — cahier §29 :
 * « Les données de démonstration doivent utiliser des acteurs fictifs. »
 * Aucune de ces positions ne décrit une personne ou un parti réel.
 *
 * Usage : npx tsx scripts/corpus/build-demo.ts
 */
import { writeFileSync } from 'node:fs'
import questionnaire from '../../content/questionnaire/v0.1.0.json'
import type { Corpus, Ordinal, Position } from '../../src/lib/engine/types'

type Prefs = Record<string, number>

const actors: { slug: string; name: string; summary: string; prefs: Prefs; extra: Record<string, Ordinal>; missing: string[]; ambiguous: Record<string, Ordinal[]> }[] = [
  {
    slug: 'demo-ardoise',
    name: 'Camille Ardoise (fictive)',
    summary: 'Profil fictif : État très présent, forte redistribution, transition rapide.',
    prefs: { intervention: 2, redistribution: 2, biens_communs: 2, autonomie: 1, controle: -1, ouverture: 1, transition: 2, integration: 0, transformation: 2 },
    extra: { 'cli-01': -1, 'eur-03': 0, 'eur-04': 2, 'eur-06': 2, 'dem-04': 2, 'dem-05': 1 },
    missing: ['eur-05'],
    ambiguous: { 'lib-02': [0, 1] },
  },
  {
    slug: 'demo-boussole',
    name: 'Dominique Boussole (fictif)',
    summary: 'Profil fictif : économie de marché, intégration européenne forte, libertés individuelles.',
    prefs: { intervention: -1, redistribution: -1, biens_communs: 0, autonomie: 2, controle: 0, ouverture: 1, transition: 1, integration: 2, transformation: 0 },
    extra: { 'cli-01': 2, 'eur-03': 2, 'eur-04': -2, 'eur-06': 1, 'dem-04': 1, 'dem-05': 1 },
    missing: [],
    ambiguous: {},
  },
  {
    slug: 'demo-clocher',
    name: 'Lou Clocher (fictif)',
    summary: 'Profil fictif : contrôle sécuritaire élevé, immigration réduite, décisions nationales.',
    prefs: { intervention: 1, redistribution: 0, biens_communs: 1, autonomie: -2, controle: 2, ouverture: -2, transition: -1, integration: -2, transformation: 1 },
    extra: { 'cli-01': 2, 'eur-03': 2, 'eur-04': 2, 'eur-06': -2, 'dem-04': 2, 'dem-05': 0 },
    missing: ['lib-01', 'cli-03'],
    ambiguous: {},
  },
  {
    slug: 'demo-dentelle',
    name: 'Sacha Dentelle (fictive)',
    summary: 'Profil fictif : rigueur budgétaire, sécurité, Europe et nucléaire.',
    prefs: { intervention: -2, redistribution: -2, biens_communs: -1, autonomie: 0, controle: 2, ouverture: -1, transition: -1, integration: 1, transformation: -1 },
    extra: { 'cli-01': 2, 'eur-03': 2, 'eur-04': -1, 'eur-06': -1, 'dem-04': 1, 'dem-05': 0 },
    missing: ['dem-02'],
    ambiguous: { 'tra-01': [-2, -1] },
  },
  {
    slug: 'demo-etincelle',
    name: 'Noa Étincelle (fictif)',
    summary: 'Profil fictif : transformation des institutions, décentralisation, positions peu documentées.',
    prefs: { intervention: 1, redistribution: 1, biens_communs: 1, autonomie: 1, controle: -1, ouverture: 0, transition: 1, integration: -1, transformation: 2 },
    extra: { 'cli-01': 0, 'eur-03': 0, 'eur-04': 1, 'eur-06': 0, 'dem-04': 2, 'dem-05': 2 },
    // acteur volontairement peu documenté pour montrer couverture et bornes
    missing: ['eco-02', 'eco-03', 'eco-05', 'tra-02', 'sec-03', 'sec-06', 'lib-03', 'lib-06', 'cli-04', 'cli-06', 'eur-01', 'eur-02', 'eur-05'],
    ambiguous: { 'sec-04': [-1, 0] },
  },
]

const clamp = (n: number): Ordinal => Math.max(-2, Math.min(2, Math.round(n))) as Ordinal

const positions: Corpus['positions'] = {}
for (const a of actors) {
  const p: Record<string, Position> = {}
  for (const item of questionnaire.items as { id: string; dimensions?: Record<string, number> }[]) {
    if (a.missing.includes(item.id)) {
      p[item.id] = { missing: true, status: 'inconnu', note: 'Aucune position explicite trouvée (donnée fictive).' }
      continue
    }
    if (a.ambiguous[item.id]) {
      p[item.id] = { set: a.ambiguous[item.id]!, status: 'ambigu', sources: ['demo-programme'], note: 'Formulation compatible avec plusieurs niveaux (donnée fictive).' }
      continue
    }
    let v: Ordinal
    if (item.id in a.extra) v = a.extra[item.id]!
    else {
      const dims = Object.entries(item.dimensions ?? {})
      v = clamp(dims.reduce((acc, [d, o]) => acc + o * (a.prefs[d] ?? 0), 0) / Math.max(1, dims.length))
    }
    p[item.id] = { value: v, status: 'explicite', sources: ['demo-programme'] }
  }
  positions[a.slug] = p
}

const corpus: Corpus & { sources: unknown[] } = {
  version: 'demo-0.1.0',
  mode: 'demo',
  questionSet: questionnaire.version,
  publishedAt: '2026-10-08T00:00:00Z',
  actors: actors.map(({ slug, name, summary }) => ({ slug, name, summary, status: 'fictif' as const })),
  positions,
  sources: [{ id: 'demo-programme', title: 'Programme fictif de démonstration', publisher: 'Ça vote ? (données de test)', url: null }],
}

writeFileSync('content/corpus/demo.json', JSON.stringify(corpus, null, 2) + '\n')
console.log('corpus de démonstration écrit')
