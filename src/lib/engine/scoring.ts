/**
 * Moteur de proximité — implémentation exacte des formules du cahier §10.
 * Aucune donnée ne quitte ce module ; aucun arrondi n'est fait ici (affichage uniquement).
 */
import { ENGINE_CONFIG } from './config'
import type { Actor, Answers, ItemId, Ordinal, Position, Priorities, QuestionSet, ThemeId } from './types'

export type WeightMode = 'global' | 'priorities'

/** Poids de thème bₜ. Global : 1/T. Priorités : (1+pₜ)/(T+Σp), soit (1+pₜ)/17 pour 7 thèmes et 10 jetons. */
export function themeWeights(set: QuestionSet, mode: WeightMode, priorities?: Priorities): Map<ThemeId, number> {
  const T = set.themes.length
  const out = new Map<ThemeId, number>()
  if (mode === 'global' || !priorities) {
    for (const t of set.themes) out.set(t.id, 1 / T)
    return out
  }
  const total = set.themes.reduce((acc, t) => acc + 1 + Math.max(0, priorities[t.id] ?? 0), 0)
  for (const t of set.themes) out.set(t.id, (1 + Math.max(0, priorities[t.id] ?? 0)) / total)
  return out
}

/** Poids d'item wᵢ = bₜ / nₜ (nₜ = items actifs du thème). Ajouter des items ne change pas le poids d'un thème. */
export function itemWeights(set: QuestionSet, themeW: Map<ThemeId, number>): Map<ItemId, number> {
  const counts = new Map<ThemeId, number>()
  for (const it of set.items) if (!it.inactive) counts.set(it.theme, (counts.get(it.theme) ?? 0) + 1)
  const out = new Map<ItemId, number>()
  for (const it of set.items) {
    if (it.inactive) continue
    const n = counts.get(it.theme) ?? 0
    const b = themeW.get(it.theme) ?? 0
    out.set(it.id, n > 0 ? b / n : 0)
  }
  return out
}

/** sᵢ = 1 − |u − c| / 4 */
export function proximity(u: Ordinal, c: Ordinal): number {
  return 1 - Math.abs(u - c) / 4
}

export type ContributionKind = 'known' | 'ambiguous' | 'unknown'

export interface ItemContribution {
  itemId: ItemId
  theme: ThemeId
  user: Ordinal
  position: Position | undefined
  weight: number
  kind: ContributionKind
  /** Proximité si la position est connue et non ambiguë */
  s: number | null
  sMin: number
  sMax: number
}

export interface ActorScore {
  slug: string
  /** Proximité observée sur les items connus (null si aucune position utilisable) */
  observed: number | null
  /** Part du poids répondu couverte par une position utilisable (0..1) */
  coverage: number
  low: number
  high: number
  /** Part du poids répondu où le candidat a une position, exacte ou entre deux niveaux (0..1) */
  documented: number
  /** Score de classement : moyenne pondérée des proximités, une position entre deux niveaux comptant pour le milieu de son intervalle (null si rien de documenté) */
  rankScore: number | null
  W: number
  Wc: number
  knownCount: number
  ambiguousCount: number
  unknownCount: number
  contributions: ItemContribution[]
}

/** Items répondus avec une valeur substantielle (l'ensemble A). */
export function answeredValues(set: QuestionSet, answers: Answers): Map<ItemId, Ordinal> {
  const out = new Map<ItemId, Ordinal>()
  for (const it of set.items) {
    if (it.inactive) continue
    const a = answers[it.id]
    if (a && a.kind === 'value') out.set(it.id, a.value)
  }
  return out
}

function positionKind(p: Position | undefined): ContributionKind {
  if (!p || 'missing' in p) return 'unknown'
  if ('set' in p) return p.set.length === 1 ? 'known' : p.set.length === 0 ? 'unknown' : 'ambiguous'
  return 'known'
}

function knownValue(p: Position): Ordinal | null {
  if ('value' in p) return p.value
  if ('set' in p && p.set.length === 1) return p.set[0] ?? null
  return null
}

export function scoreActor(
  set: QuestionSet,
  answers: Answers,
  positions: Record<ItemId, Position> | undefined,
  weights: Map<ItemId, number>,
  slug: string,
): ActorScore {
  const A = answeredValues(set, answers)
  const themeOf = new Map(set.items.map((i) => [i.id, i.theme]))
  let W = 0
  let Wc = 0
  let sumKnown = 0 // Σ(Kc) w·s
  let sumAmbMin = 0
  let sumAmbSpan = 0
  let sumAmbMid = 0
  let Wa = 0
  let sumUnknown = 0
  const contributions: ItemContribution[] = []
  let knownCount = 0
  let ambiguousCount = 0
  let unknownCount = 0

  for (const [itemId, u] of A) {
    const w = weights.get(itemId) ?? 0
    W += w
    const p = positions?.[itemId]
    const kind = positionKind(p)
    let s: number | null = null
    let sMin = 0
    let sMax = 1
    if (kind === 'known' && p) {
      const c = knownValue(p) as Ordinal
      s = proximity(u, c)
      sMin = sMax = s
      Wc += w
      sumKnown += w * s
      knownCount++
    } else if (kind === 'ambiguous' && p && 'set' in p) {
      const ss = p.set.map((c) => proximity(u, c))
      sMin = Math.min(...ss)
      sMax = Math.max(...ss)
      sumAmbMin += w * sMin
      sumAmbSpan += w * (sMax - sMin)
      sumAmbMid += (w * (sMin + sMax)) / 2
      Wa += w
      ambiguousCount++
    } else {
      sumUnknown += w
      unknownCount++
    }
    contributions.push({ itemId, theme: themeOf.get(itemId) ?? '', user: u, position: p, weight: w, kind, s, sMin, sMax })
  }

  if (W === 0) {
    return { slug, observed: null, coverage: 0, low: 0, high: 0, documented: 0, rankScore: null, W, Wc, knownCount, ambiguousCount, unknownCount, contributions }
  }
  const observed = Wc > 0 ? (100 * sumKnown) / Wc : null
  const rankScore = Wc + Wa > 0 ? (100 * (sumKnown + sumAmbMid)) / (Wc + Wa) : null
  // Bornes documentaires (§10.5) : inconnu → 0 (basse) ou 1 (haute) ; ambigu → min / max de l'ensemble.
  const low = (100 * (sumKnown + sumAmbMin)) / W
  const high = low + (100 * (sumUnknown + sumAmbSpan)) / W
  return { slug, observed, coverage: Wc / W, low, high, documented: (Wc + Wa) / W, rankScore, W, Wc, knownCount, ambiguousCount, unknownCount, contributions }
}

// ---------------------------------------------------------------------------
// Classement par candidat documenté (§10.6, version 0.2.0)
// ---------------------------------------------------------------------------

export interface RankingEntry {
  slug: string
  name: string
  /** Score de classement sur 100 (null si rien de documenté sur tes réponses) */
  rankScore: number | null
  /** Assez documenté sur tes réponses pour être classé */
  classable: boolean
  score: ActorScore
  /** Écart avec le classé précédent inférieur au seuil : ordre non déterminant */
  closeToPrevious: boolean
}

export interface RankingResult {
  ranked: boolean
  reasons: string[]
  sensitive: boolean
  answeredCount: number
  /** Nombre de candidats classés (les suivants sont listés à part, pas assez documentés) */
  rankedCount: number
  entries: RankingEntry[]
}

/** Thèmes où le candidat a au moins une position (exacte ou entre deux niveaux) sur tes réponses. */
function documentedThemes(score: ActorScore): number {
  return new Set(score.contributions.filter((c) => c.kind !== 'unknown').map((c) => c.theme)).size
}

export interface RankOptions {
  mode: WeightMode
  priorities?: Priorities
  essentials?: ItemId[]
  /** Version rapide : les affirmations du parcours court ; seuils calculés sur elles, classement annoncé comme indicatif */
  quick?: ItemId[]
}

export function rankActors(
  set: QuestionSet,
  answers: Answers,
  actors: Actor[],
  positions: Record<string, Record<ItemId, Position>>,
  opts: RankOptions,
): RankingResult {
  const cfg = ENGINE_CONFIG.ranking
  const weights = itemWeights(set, themeWeights(set, opts.mode, opts.priorities))
  const A = answeredValues(set, answers)

  // Seuils côté votant : assez de réponses pour qu'un classement veuille dire quelque chose
  const reasons: string[] = []
  const minAnswered = opts.quick ? cfg.quickMinAnswered : cfg.minAnswered
  if (A.size < minAnswered) reasons.push(`Il faut au moins ${minAnswered} réponses (tu en as ${A.size}).`)
  const halfThemes = set.themes.filter((t) => {
    const items = set.items.filter((i) => i.theme === t.id && !i.inactive && (!opts.quick || opts.quick.includes(i.id)))
    const answered = items.filter((i) => A.has(i.id)).length
    return items.length > 0 && answered >= items.length / 2
  }).length
  if (halfThemes < cfg.minThemesHalfAnswered)
    reasons.push(`Il faut avoir répondu à la moitié des questions dans au moins ${cfg.minThemesHalfAnswered} thèmes (${halfThemes} pour l'instant).`)

  // Seuils côté candidat : chacun n'est classé que s'il est assez documenté sur TES réponses
  const base = actors.map((a) => {
    const score = scoreActor(set, answers, positions[a.slug], weights, a.slug)
    const classable = score.rankScore !== null && score.documented >= cfg.minActorCoverage && documentedThemes(score) >= cfg.minActorThemes
    return { slug: a.slug, name: a.name, score, rankScore: score.rankScore, classable }
  })
  const classable = base.filter((e) => e.classable)
  if (reasons.length === 0 && classable.length < 2)
    reasons.push(
      `Moins de deux candidats ont une position connue sur au moins ${Math.round(cfg.minActorCoverage * 100)} % de tes réponses, dans ${cfg.minActorThemes} thèmes. Réponds à plus de questions, ou reviens quand les programmes seront plus complets.`,
    )

  const ranked = reasons.length === 0
  let entries: RankingEntry[]
  if (ranked) {
    const sorted = [...classable].sort((x, y) => (y.rankScore ?? -1) - (x.rankScore ?? -1) || x.slug.localeCompare(y.slug))
    const top = sorted.map((e, i) => {
      const prev = sorted[i - 1]
      const close = !!prev && prev.rankScore !== null && e.rankScore !== null && prev.rankScore - e.rankScore < cfg.closeGap
      return { ...e, closeToPrevious: close }
    })
    // Les candidats pas assez documentés suivent, du plus au moins documenté, sans rang
    const rest = base
      .filter((e) => !e.classable)
      .sort((x, y) => y.score.documented - x.score.documented || x.name.localeCompare(y.name, 'fr'))
      .map((e) => ({ ...e, closeToPrevious: false }))
    entries = [...top, ...rest]
  } else {
    // Liste alphabétique explicite, annoncée comme telle dans l'interface
    entries = [...base].sort((x, y) => x.name.localeCompare(y.name, 'fr')).map((e) => ({ ...e, closeToPrevious: false }))
  }

  const sensitive = ranked ? isOrderSensitive(set, answers, actors.filter((a) => classable.some((c) => c.slug === a.slug)), positions, opts, entries) : false
  return { ranked, reasons, sensitive, answeredCount: A.size, rankedCount: ranked ? classable.length : 0, entries }
}

/** Ordre strict (hors paires proches) entre acteurs. */
function strictPairs(entries: { slug: string; rankScore: number | null }[], gap: number): Set<string> {
  const pairs = new Set<string>()
  for (const a of entries)
    for (const b of entries) {
      if (a.slug === b.slug || a.rankScore === null || b.rankScore === null) continue
      if (a.rankScore - b.rankScore >= gap) pairs.add(`${a.slug}>${b.slug}`)
    }
  return pairs
}

/**
 * Analyse de sensibilité (§10.6) : on fait varier modérément le poids de chaque thème.
 * Si un candidat classé nettement devant passe nettement derrière, l'ordre est « sensible aux hypothèses ».
 * Ce n'est pas une probabilité de classement.
 */
function isOrderSensitive(
  set: QuestionSet,
  answers: Answers,
  rankedActors: Actor[],
  positions: Record<string, Record<ItemId, Position>>,
  opts: RankOptions,
  entries: RankingEntry[],
): boolean {
  const gap = ENGINE_CONFIG.ranking.closeGap
  const reference = strictPairs(
    entries.filter((e) => e.classable),
    gap,
  )
  const baseTheme = themeWeights(set, opts.mode, opts.priorities)
  for (const t of set.themes) {
    for (const f of ENGINE_CONFIG.sensitivityFactors) {
      const tw = new Map(baseTheme)
      tw.set(t.id, (tw.get(t.id) ?? 0) * f)
      const total = [...tw.values()].reduce((a, b) => a + b, 0)
      for (const [k, v] of tw) tw.set(k, v / total)
      const w = itemWeights(set, tw)
      const variant = rankedActors.map((a) => ({ slug: a.slug, rankScore: scoreActor(set, answers, positions[a.slug], w, a.slug).rankScore }))
      const pairs = strictPairs(variant, gap)
      for (const p of reference) {
        const [x, y] = p.split('>')
        if (pairs.has(`${y}>${x}`)) return true
      }
    }
  }
  return false
}

// ---------------------------------------------------------------------------
// Lignes rouges (§5.4) — indicateurs distincts, jamais de malus caché
// ---------------------------------------------------------------------------

export type RedLineStatus = 'accord' | 'desaccord' | 'inconnu' | 'ambigu'

export function redLineStatus(u: Ordinal, p: Position | undefined): RedLineStatus {
  const kind = positionKind(p)
  if (kind === 'unknown' || !p) return 'inconnu'
  if (kind === 'ambiguous' && 'set' in p) {
    const ds = p.set.map((c) => Math.abs(u - c) / 4)
    if (ds.every((d) => d >= ENGINE_CONFIG.redLineDistance)) return 'desaccord'
    if (ds.every((d) => d < ENGINE_CONFIG.redLineDistance)) return 'accord'
    return 'ambigu'
  }
  const c = knownValue(p) as Ordinal
  return Math.abs(u - c) / 4 >= ENGINE_CONFIG.redLineDistance ? 'desaccord' : 'accord'
}
