/**
 * Sondages d'intentions de vote publiés par les instituts : sélection des derniers sondages et description chiffrée
 * (fourchettes, rangs, duels testés). Rien n'est calculé qui ressemble à une moyenne ou à une projection : la loi du
 * 19 juillet 1977 (art. 1er) assimile à un sondage toute simulation de vote réalisée à partir de sondages.
 */

export interface PollResult {
  slug: string | null
  name: string
  /** « <1 » publié par l'institut : rangé à 0,5 */
  pct: number
  pctText?: string
}

export interface Poll {
  id: string
  institute: string
  buyer: string
  sponsor?: string | null
  fieldStart: string
  fieldEnd: string
  published: string
  sample: number
  base: string
  method: string
  margin?: string | null
  url: string
  notice?: string | null
  /** Particularité relevée à la lecture (libellés inversés, chiffres arrondis…) */
  note?: string | null
  firstRound: { hypothesis: string; results: PollResult[] }[]
  secondRound: { results: PollResult[] }[]
}

/** Un sondage ne compte parmi les « derniers » que s'il a été réalisé moins de 30 jours avant le plus récent */
export const WINDOW_DAYS = 30
/** Écart en dessous duquel l'ordre de deux candidats ne se lit pas : la marge d'erreur d'un échantillon de 1 000 personnes */
export const CLOSE_POINTS = 3

const DAY = 86_400_000
const keyOf = (r: PollResult) => r.slug ?? r.name

/** Le sondage le plus récent de chaque institut, s'il date de moins de WINDOW_DAYS avant le plus récent de tous */
export function latestPolls(polls: Poll[]): Poll[] {
  const sorted = [...polls].sort((a, b) => b.fieldEnd.localeCompare(a.fieldEnd) || b.published.localeCompare(a.published))
  const newest = sorted[0]
  if (!newest) return []
  const limit = Date.parse(newest.fieldEnd) - WINDOW_DAYS * DAY
  const seen = new Set<string>()
  return sorted.filter((p) => {
    if (seen.has(p.institute) || Date.parse(p.fieldEnd) < limit) return false
    seen.add(p.institute)
    return true
  })
}

/** Rang d'un résultat dans sa liste : 1 + le nombre de candidats strictement devant (deux ex aequo partagent le rang) */
const rankIn = (list: PollResult[], r: PollResult) => 1 + list.filter((x) => x.pct > r.pct).length

export interface CandidateRange {
  key: string
  slug: string | null
  name: string
  /** Nombre d'hypothèses où le candidat est testé */
  tested: number
  min: number
  max: number
  first: number
  second: number
}

export interface FirstRoundSummary {
  hypotheses: number
  candidates: CandidateRange[]
  /** Hypothèses où l'écart entre le 2e et le 3e est de CLOSE_POINTS ou moins */
  closeSecond: number
}

export function firstRoundSummary(polls: Poll[]): FirstRoundSummary {
  const hyps = polls.flatMap((p) => p.firstRound).filter((h) => h.results.length > 0)
  const map = new Map<string, CandidateRange>()
  let closeSecond = 0
  for (const h of hyps) {
    const byPct = [...h.results].sort((a, b) => b.pct - a.pct)
    if (byPct[1] && byPct[2] && byPct[1].pct - byPct[2].pct <= CLOSE_POINTS) closeSecond++
    for (const r of h.results) {
      const k = keyOf(r)
      const c = map.get(k) ?? { key: k, slug: r.slug, name: r.name, tested: 0, min: Infinity, max: -Infinity, first: 0, second: 0 }
      const rank = rankIn(h.results, r)
      c.tested++
      c.min = Math.min(c.min, r.pct)
      c.max = Math.max(c.max, r.pct)
      if (rank === 1) c.first++
      if (rank === 2) c.second++
      map.set(k, c)
    }
  }
  const candidates = [...map.values()].sort((a, b) => b.max - a.max || b.min - a.min || a.name.localeCompare(b.name, 'fr'))
  return { hypotheses: hyps.length, candidates, closeSecond }
}

export interface DuelSide {
  key: string
  slug: string | null
  name: string
  min: number
  max: number
  /** Sondages où ce candidat est devant */
  ahead: number
}

export interface DuelSummary {
  key: string
  polls: number
  sides: [DuelSide, DuelSide]
}

/** Duels de second tour testés, regroupés par paire de candidats, les plus testés d'abord */
export function secondRoundSummary(polls: Poll[]): DuelSummary[] {
  const map = new Map<string, DuelSummary>()
  for (const p of polls)
    for (const d of p.secondRound) {
      if (d.results.length !== 2) continue
      const [a, b] = [...d.results].sort((x, y) => keyOf(x).localeCompare(keyOf(y)))
      const k = `${keyOf(a!)}|${keyOf(b!)}`
      const s = map.get(k) ?? {
        key: k,
        polls: 0,
        sides: [a!, b!].map((r) => ({ key: keyOf(r), slug: r.slug, name: r.name, min: Infinity, max: -Infinity, ahead: 0 })) as [DuelSide, DuelSide],
      }
      s.polls++
      for (const [i, r] of [a!, b!].entries()) {
        const side = s.sides[i]!
        side.min = Math.min(side.min, r.pct)
        side.max = Math.max(side.max, r.pct)
        if (r.pct > [a!, b!][1 - i]!.pct) side.ahead++
      }
      map.set(k, s)
    }
  return [...map.values()]
    .map((s) => ({ ...s, sides: [...s.sides].sort((x, y) => y.ahead - x.ahead || y.max - x.max) as [DuelSide, DuelSide] }))
    .sort((a, b) => b.polls - a.polls || Math.max(...b.sides.map((x) => x.max)) - Math.max(...a.sides.map((x) => x.max)))
}
