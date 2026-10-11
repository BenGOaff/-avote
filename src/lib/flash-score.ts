/** Résultat des quiz flash, calculé dans le navigateur (sans dépendance de validation). */
import type { FlashQuizFull as FlashQuiz } from './flash'
import { UI_COPY } from './copy'
import { sameSide, scoreActor } from './engine/scoring'
import type { Answers, Ordinal, QuestionSet } from './engine/types'

export interface FlashResult {
  /** Identifiant court, pour le nom du fichier image */
  id: string
  /** Petite ligne au-dessus du résultat (« Tu es ») */
  kicker?: string
  /** Le résultat en très grand : « 72 % », « 8/10 », « Bercy » */
  big: string
  /** Surligné sous le résultat : la tribu, l'unité */
  label?: string
  headline: string
  line: string
  /** Personnage propre au résultat, sinon celui du quiz */
  avatar?: string
  /** Mode « partis » : accords et désaccords avec le parti le plus proche, sources à l'appui */
  details?: { text: string; agree: boolean; you: number; who: string; quote?: string; url?: string; publisher?: string }[]
}

const fill = (text: string, v: Record<string, string | number>) => text.replace(/\{(\w)\}/g, (m, k: string) => String(v[k] ?? m))

/** Mode « partis » : même formule que le test (scoreActor), chaque question pesant autant ; un parti = la moyenne de ses candidats. */
function partyResult(q: FlashQuiz, picks: number[]): FlashResult {
  const t = UI_COPY.flash
  const ids = q.items ?? []
  const answers: Answers = {}
  picks.forEach((p, i) => {
    const v = q.questions[i]?.answers[p]?.value
    const id = ids[i]
    if (id && typeof v === 'number') answers[id] = { kind: 'value', value: v as Ordinal }
  })
  const set = { version: 'flash', status: 'validé', themes: [], dimensions: [], items: ids.map((id) => ({ id, version: '', theme: '', concept: '', text: '', explanation: '' })) } as QuestionSet
  const weights = new Map(ids.map((id) => [id, 1]))
  const data = q.partyData ?? {}
  const ranked = (q.parties ?? [])
    .map((party) => {
      const scores = party.actors
        .map((a) => scoreActor(set, answers, Object.fromEntries(Object.entries(data[a] ?? {}).map(([k, v]) => [k, v.p])), weights, a).rankScore)
        .filter((x): x is number => x !== null)
      return { party, pct: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null }
    })
    .filter((x): x is { party: (typeof x)['party']; pct: number } => x.pct !== null)
    .sort((a, b) => b.pct - a.pct)
  const best = ranked[0]
  if (!best) return { id: 'sans-avis', kicker: t.partyKicker, big: '?', headline: t.partyNone, line: t.partyNoneLine, avatar: q.avatar }
  const names = (list: string[]) => list.join(' et ')
  const details: NonNullable<FlashResult['details']> = []
  ids.forEach((id, i) => {
    const a = answers[id]
    if (!a || a.kind !== 'value') return
    const actor = best.party.actors.find((s) => data[s]?.[id])
    const st = actor ? data[actor]?.[id] : undefined
    const same = st ? sameSide(a.value, st.p) : null
    if (same === null || !st) return
    const who = best.party.actorNames?.[best.party.actors.indexOf(actor ?? '')] ?? actor ?? ''
    details.push({ text: q.questions[i]?.q ?? '', agree: same, you: a.value, who, quote: st.quote, url: st.url, publisher: st.publisher })
  })
  const agree = details.filter((d) => d.agree).length
  const next = ranked
    .slice(1, 3)
    .map((r) => `${r.party.short} (${r.pct}\u00a0%)`)
    .join(', ')
  return {
    id: best.party.key,
    kicker: t.partyKicker,
    big: best.party.short,
    label: t.partyLabel(best.pct),
    headline: t.partyHeadline(best.party.name),
    line: t.partyLine(agree, details.length, names(best.party.actorNames ?? best.party.actors), next),
    avatar: q.avatar,
    details,
  }
}

export function flashResult(q: FlashQuiz, picks: number[]): FlashResult {
  if (q.mode === 'partis') return partyResult(q, picks)
  const n = q.questions.length
  if (q.mode === 'profil') {
    const counts = new Map<string, number>()
    picks.forEach((p, i) => {
      const o = q.questions[i]?.answers[p]?.outcome
      if (o) counts.set(o, (counts.get(o) ?? 0) + 1)
    })
    // En cas d'égalité, le premier résultat déclaré l'emporte : même réponses, même résultat
    const outcomes = q.outcomes ?? []
    const best = outcomes.reduce((a, b) => ((counts.get(b.key) ?? 0) > (counts.get(a.key) ?? 0) ? b : a), outcomes[0]!)
    return {
      id: best.key,
      kicker: 'Tu es',
      big: best.name,
      headline: best.headline,
      line: best.line,
      avatar: best.avatar ?? q.avatar,
    }
  }
  const c = q.mode === 'connaissances' ? picks.filter((p, i) => q.questions[i]?.answers[p]?.correct).length : 0
  const s = q.mode === 'connaissances' ? Math.round((c / n) * 100) : Math.round((picks.reduce((t, p, i) => t + (q.questions[i]?.answers[p]?.points ?? 0), 0) / (n * 2)) * 100)
  const tiers = q.tiers ?? []
  const tier = tiers.find((t) => s <= t.upTo) ?? tiers[tiers.length - 1]!
  const v = { s, c, n }
  return {
    id: q.mode === 'connaissances' ? `${c}-sur-${n}` : String(s),
    big: q.mode === 'connaissances' ? `${c}/${n}` : `${s}\u00a0%`,
    label: q.tribe,
    headline: fill(tier.headline, v),
    line: fill(tier.line, v),
    avatar: q.avatar,
  }
}
