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
      ambiguousCount++
    } else {
      sumUnknown += w
      unknownCount++
    }
    contributions.push({ itemId, theme: themeOf.get(itemId) ?? '', user: u, position: p, weight: w, kind, s, sMin, sMax })
  }

  if (W === 0) {
    return { slug, observed: null, coverage: 0, low: 0, high: 0, W, Wc, knownCount, ambiguousCount, unknownCount, contributions }
  }
  const observed = Wc > 0 ? (100 * sumKnown) / Wc : null
  // Bornes documentaires (§10.5) : inconnu → 0 (basse) ou 1 (haute) ; ambigu → min / max de l'ensemble.
  const low = (100 * (sumKnown + sumAmbMin)) / W
  const high = low + (100 * (sumUnknown + sumAmbSpan)) / W
  return { slug, observed, coverage: Wc / W, low, high, W, Wc, knownCount, ambiguousCount, unknownCount, contributions }
}

// ---------------------------------------------------------------------------
// Socle commun et classement (§10.6)
// ---------------------------------------------------------------------------

export interface RankingEntry {
  slug: string
  name: string
  commonScore: number | null
  score: ActorScore
  /** Écart avec l'entrée précédente inférieur au seuil : ordre non déterminant */
  closeToPrevious: boolean
}

export interface RankingResult {
  ranked: boolean
  reasons: string[]
  sensitive: boolean
  commonItems: ItemId[]
  commonShare: number
  commonThemes: number
  answeredCount: number
  entries: RankingEntry[]
}

export function commonBase(set: QuestionSet, answers: Answers, actors: Actor[], positions: Record<string, Record<ItemId, Position>>): ItemId[] {
  const A = answeredValues(set, answers)
  const out: ItemId[] = []
  for (const itemId of A.keys()) {
    if (actors.every((a) => positionKind(positions[a.slug]?.[itemId]) === 'known')) out.push(itemId)
  }
  return out
}

function commonScore(
  common: ItemId[],
  answers: Map<ItemId, Ordinal>,
  positions: Record<ItemId, Position> | undefined,
  weights: Map<ItemId, number>,
): number | null {
  let num = 0
  let den = 0
  for (const id of common) {
    const p = positions?.[id]
    const u = answers.get(id)
    if (!p || u === undefined) continue
    const c = knownValue(p)
    if (c === null) continue
    const w = weights.get(id) ?? 0
    num += w * proximity(u, c)
    den += w
  }
  return den > 0 ? (100 * num) / den : null
}

export interface RankOptions {
  mode: WeightMode
  priorities?: Priorities
  essentials?: ItemId[]
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
  const common = commonBase(set, answers, actors, positions)
  const W = [...A.keys()].reduce((acc, id) => acc + (weights.get(id) ?? 0), 0)
  const Wcommon = common.reduce((acc, id) => acc + (weights.get(id) ?? 0), 0)
  const commonShare = W > 0 ? Wcommon / W : 0
  const themeOf = new Map(set.items.map((i) => [i.id, i.theme]))
  const commonThemes = new Set(common.map((id) => themeOf.get(id))).size

  // Seuils de publication d'un classement
  const reasons: string[] = []
  if (A.size < cfg.minAnswered) reasons.push(`Il faut au moins ${cfg.minAnswered} réponses sur ${set.items.length} (tu en as ${A.size}).`)
  const halfThemes = set.themes.filter((t) => {
    const items = set.items.filter((i) => i.theme === t.id && !i.inactive)
    const answered = items.filter((i) => A.has(i.id)).length
    return items.length > 0 && answered >= items.length / 2
  }).length
  if (halfThemes < cfg.minThemesHalfAnswered)
    reasons.push(`Il faut avoir répondu à la moitié des questions dans au moins ${cfg.minThemesHalfAnswered} thèmes (${halfThemes} pour l'instant).`)
  if (actors.length < 2) reasons.push('Il faut au moins deux acteurs à comparer.')
  if (commonShare < cfg.minCommonWeightShare)
    reasons.push(`Les positions connues de tous les acteurs couvrent ${Math.round(commonShare * 100)} % de tes réponses ; il en faut ${Math.round(cfg.minCommonWeightShare * 100)} %.`)
  if (commonThemes < cfg.minCommonThemes) reasons.push(`Les positions communes couvrent ${commonThemes} thème(s) ; il en faut ${cfg.minCommonThemes}.`)
  const essentials = (opts.essentials ?? []).filter((id) => A.has(id))
  if (essentials.length > 0) {
    const We = essentials.reduce((acc, id) => acc + (weights.get(id) ?? 0), 0)
    const Wec = essentials.filter((id) => common.includes(id)).reduce((acc, id) => acc + (weights.get(id) ?? 0), 0)
    if (We > 0 && Wec / We < cfg.minEssentialCoverage)
      reasons.push(`Tes lignes rouges sont documentées à ${Math.round((Wec / We) * 100)} % chez tous les acteurs ; il en faut ${Math.round(cfg.minEssentialCoverage * 100)} %.`)
  }

  const ranked = reasons.length === 0
  const base = actors.map((a) => {
    const score = scoreActor(set, answers, positions[a.slug], weights, a.slug)
    return { slug: a.slug, name: a.name, score, commonScore: commonScore(common, A, positions[a.slug], weights) }
  })

  let entries: RankingEntry[]
  if (ranked) {
    const sorted = [...base].sort((x, y) => (y.commonScore ?? -1) - (x.commonScore ?? -1))
    entries = sorted.map((e, i) => {
      const prev = sorted[i - 1]
      const close = !!prev && prev.commonScore !== null && e.commonScore !== null && prev.commonScore - e.commonScore < cfg.closeGap
      return { ...e, closeToPrevious: close }
    })
  } else {
    // Liste alphabétique explicite, annoncée comme telle dans l'interface
    entries = [...base].sort((x, y) => x.name.localeCompare(y.name, 'fr')).map((e) => ({ ...e, closeToPrevious: false }))
  }

  const sensitive = ranked ? isOrderSensitive(set, answers, actors, positions, common, opts, entries) : false
  return { ranked, reasons, sensitive, commonItems: common, commonShare, commonThemes, answeredCount: A.size, entries }
}

/** Ordre strict (hors paires proches) entre acteurs. */
function strictPairs(entries: { slug: string; commonScore: number | null }[], gap: number): Set<string> {
  const pairs = new Set<string>()
  for (const a of entries)
    for (const b of entries) {
      if (a.slug === b.slug || a.commonScore === null || b.commonScore === null) continue
      if (a.commonScore - b.commonScore >= gap) pairs.add(`${a.slug}>${b.slug}`)
    }
  return pairs
}

/**
 * Analyse de sensibilité (§10.6) : on fait varier modérément le poids de chaque thème.
 * Si un acteur nettement devant passe nettement derrière, l'ordre est « sensible aux hypothèses ».
 * Ce n'est pas une probabilité de classement.
 */
function isOrderSensitive(
  set: QuestionSet,
  answers: Answers,
  actors: Actor[],
  positions: Record<string, Record<ItemId, Position>>,
  common: ItemId[],
  opts: RankOptions,
  entries: RankingEntry[],
): boolean {
  const gap = ENGINE_CONFIG.ranking.closeGap
  const reference = strictPairs(entries, gap)
  const A = answeredValues(set, answers)
  const baseTheme = themeWeights(set, opts.mode, opts.priorities)
  for (const t of set.themes) {
    for (const f of ENGINE_CONFIG.sensitivityFactors) {
      const tw = new Map(baseTheme)
      tw.set(t.id, (tw.get(t.id) ?? 0) * f)
      const total = [...tw.values()].reduce((a, b) => a + b, 0)
      for (const [k, v] of tw) tw.set(k, v / total)
      const w = itemWeights(set, tw)
      const variant = actors.map((a) => ({ slug: a.slug, commonScore: commonScore(common, A, positions[a.slug], w) }))
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
