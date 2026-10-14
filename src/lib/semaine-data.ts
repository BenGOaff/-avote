/**
 * Données de « La semaine de la présidentielle », lues dans les fichiers publics du site.
 * Sans dépendance serveur : la page et le script d'envoi de la lettre calculent exactement le même récapitulatif.
 */
import changes from '@content/corpus/changes.json'
import intoxData from '@content/intox/intox.json'
import candidatures from '@content/acteurs/candidatures.json'
import { getAgenda } from './agenda'
import { VERDICT_LABEL, type Verdict } from './intox-labels'
import { questionnaire } from './questions'
import { buildRecap, type Change, type WeekRecap } from './semaine'

/** Première semaine couverte : celle du premier changement de position enregistré */
export const FIRST_DAY = '2026-10-05'

type Cand = { slug: string; name: string; status: string; since: string; retiredAt?: string; verified?: boolean }
const actors = (candidatures as { actors: Cand[] }).actors.filter((a) => a.verified !== false)
const names = new Map(actors.map((a) => [a.slug, a.name]))
export const actorName = (slug: string) => names.get(slug) ?? slug

const themeLabel = new Map(questionnaire.themes.map((t) => [t.id, t.label]))
const itemTheme = new Map(questionnaire.items.map((i) => [i.id, themeLabel.get(i.theme)]))

type IntoxRaw = { id: string; claim: string; verdict: Verdict; debunks: { date: string }[] }

export function recapFor(week: string): WeekRecap {
  return buildRecap(week, {
    changes: changes as Change[],
    themeOf: (item) => itemTheme.get(item),
    intox: (intoxData as { items: IntoxRaw[] }).items.map((x) => ({
      id: x.id,
      claim: x.claim,
      verdict: VERDICT_LABEL[x.verdict],
      // Date de la première vérification : une intox compte la semaine où elle a été démontée
      date: [...x.debunks].map((d) => d.date).sort()[0] ?? '',
    })),
    candidacies: [
      ...actors.map((a) => ({ slug: a.slug, name: a.name, kind: 'nouvelle' as const, date: a.since })),
      ...actors.filter((a) => a.retiredAt).map((a) => ({ slug: a.slug, name: a.name, kind: 'retrait' as const, date: a.retiredAt! })),
    ],
    agenda: getAgenda().map((e) => ({ id: e.id, title: e.title, date: e.date, end: e.end })),
  })
}
