import 'server-only'
/**
 * Pages « questions sur les candidats » (/questions/<page>) : chaque réponse est calculée à partir des données déjà publiées
 * sur les fiches (patrimoine, casier, temps de parole, parrainages, intox), sans rien ajouter ni retoucher.
 * Un candidat sans donnée apparaît comme tel : une donnée absente reste absente.
 */
import speech from '@content/medias/temps-parole.json'
import { getActiveActors } from './actors'
import { casierCounts, casierOf, type CasierEntry, type CasierType } from './casier'
import { UI_COPY } from './copy'
import { getIntox, type Intox } from './intox'
import { PARRAINAGES_THRESHOLD, parrainagesOf, parrainagesSource } from './parrainages'
import { patrimoineOf, type Patrimoine } from './patrimoine'
import { propositionPathById } from './sujets'

const P = UI_COPY.questions.pages
export type QuestionId = keyof typeof P | 'ue'

export interface QuestionPage {
  id: QuestionId
  path: string
  question: string
  metaTitle: string
  description: string
}

const own = (id: keyof typeof P, slug: string): QuestionPage => ({
  id,
  path: `/questions/${slug}`,
  ...P[id],
})

/** Les questions, dans l'ordre du hub. « Sortir de l'UE » renvoie vers la page de la proposition du test. */
export const QUESTION_PAGES: QuestionPage[] = [
  own('riche', 'candidat-le-plus-riche'),
  own('condamnes', 'candidats-condamnes'),
  own('tele', 'temps-de-parole-tele'),
  own('parrainages', '500-parrainages'),
  own('intox', 'candidats-fake-news'),
  ...(propositionPathById('eur-09')
    ? [
        {
          id: 'ue' as const,
          path: propositionPathById('eur-09')!,
          question: 'Quel candidat veut sortir de l’Union européenne ?',
          metaTitle: UI_COPY.proposition.metaTitle('Sortie de l’Union européenne'),
          description: '',
        },
      ]
    : []),
]
export const questionPage = (id: QuestionId) => QUESTION_PAGES.find((q) => q.id === id)!

type Who = { slug: string; name: string }
const who = (a: Who): Who => ({ slug: a.slug, name: a.name })

/** Patrimoines publiés : les montants nets d'abord (comparables entre eux), puis les autres chiffres, puis ceux qui n'en ont pas */
export function richest(): {
  net: (Who & { p: Patrimoine })[]
  other: (Who & { p: Patrimoine })[]
  missing: Who[]
} {
  const actors = getActiveActors()
  const withP = actors.flatMap((a) => {
    const p = patrimoineOf(a.slug)
    return p ? [{ ...who(a), p }] : []
  })
  return {
    net: withP.filter((x) => x.p.kind === 'net').sort((a, b) => b.p.amount - a.p.amount),
    other: withP.filter((x) => x.p.kind !== 'net'),
    missing: actors.filter((a) => !patrimoineOf(a.slug)).map(who),
  }
}

export interface CasierRow extends Who {
  counts: Record<CasierType, number>
  entries: CasierEntry[]
}

/** Décisions officielles par candidat ; « unchecked » : candidats dont le casier n'a pas encore été relu */
export function casierRows(): { rows: CasierRow[]; unchecked: Who[] } {
  const actors = getActiveActors()
  const rows = actors.flatMap((a) => {
    const counts = casierCounts(a.slug)
    return counts ? [{ ...who(a), counts, entries: casierOf(a.slug) ?? [] }] : []
  })
  rows.sort((a, b) => b.counts.condamnation - a.counts.condamnation || b.counts['en-cours'] - a.counts['en-cours'] || a.name.localeCompare(b.name, 'fr'))
  return {
    rows,
    unchecked: actors.filter((a) => !casierCounts(a.slug)).map(who),
  }
}

/** Temps de parole par parti, toutes chaînes et radios suivies additionnées (secondes publiées par l'Arcom, non retouchées) */
export function speechByParty(): {
  from: string
  to: string
  source: { title: string; publisher: string; url: string }
  services: string[]
  hours: number
  executive: { hours: number; pct: number }
  parties: { party: string; hours: number; pct: number }[]
} {
  const channels = speech.channels as unknown as {
    service: string
    executive: number
    parties: Record<string, number>
  }[]
  const sums = new Map<string, number>()
  let executive = 0
  for (const c of channels) {
    executive += c.executive
    for (const [party, s] of Object.entries(c.parties)) sums.set(party, (sums.get(party) ?? 0) + s)
  }
  const total = executive + [...sums.values()].reduce((a, b) => a + b, 0)
  const pct = (s: number) => (total ? Math.round((1000 * s) / total) / 10 : 0)
  const hours = (s: number) => Math.round(s / 360) / 10
  return {
    from: speech.from,
    to: speech.to,
    source: speech.source,
    services: channels.map((c) => c.service.replace(/:$/, '')),
    hours: hours(total),
    executive: { hours: hours(executive), pct: pct(executive) },
    parties: [...sums.entries()]
      .sort((a, b) => b[1] - a[1])
      .filter(([, s]) => s > 0)
      .map(([party, s]) => ({ party, hours: hours(s), pct: pct(s) })),
  }
}

/** Parrainages validés par candidat actif ; null tant que le Conseil constitutionnel n'a rien publié */
export function parrainagesRows(): {
  rows: (Who & { n: number; reached: boolean })[]
} | null {
  if (!parrainagesSource) return null
  const rows = getActiveActors()
    .map((a) => ({ ...who(a), n: parrainagesOf(a.slug) ?? 0 }))
    .map((r) => ({ ...r, reached: r.n >= PARRAINAGES_THRESHOLD }))
    .sort((a, b) => b.n - a.n || a.name.localeCompare(b.name, 'fr'))
  return { rows }
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

/** Intox démontées dont une rédaction de fact-checking nomme un candidat actif parmi ceux qui l'ont relayée */
export function intoxByCandidate(): {
  rows: (Who & { items: Intox[] })[]
  total: number
} {
  const all = getIntox()
  const rows = getActiveActors()
    .map((a) => ({
      ...who(a),
      items: all.filter((x) => x.spreaders.some((s) => norm(s) === norm(a.name))),
    }))
    .filter((r) => r.items.length > 0)
    .sort((a, b) => b.items.length - a.items.length || a.name.localeCompare(b.name, 'fr'))
  return { rows, total: all.length }
}
