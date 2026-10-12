import 'server-only'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { FlashQuizSchema, type FlashQuizFull, type PartyData } from './flash'
import { liveCorpus, questionnaire } from './data'
import { UI_COPY } from './copy'
import { getActiveActors } from './actors'

const DIR = path.join(process.cwd(), 'content/quiz/flash')
let cache: FlashQuizFull[] | null = null

/** Quiz flash publiés (content/quiz/flash/*.json), dans l'ordre choisi par la rédaction. */
export function getFlashQuizzes(): FlashQuizFull[] {
  if (cache) return cache
  const list: FlashQuizFull[] = []
  if (existsSync(DIR))
    for (const f of readdirSync(DIR).filter((f) => f.endsWith('.json'))) {
      const parsed = FlashQuizSchema.safeParse(JSON.parse(readFileSync(path.join(DIR, f), 'utf8')))
      if (!parsed.success) throw new Error(`content/quiz/flash/${f} invalide : ${parsed.error.message}`)
      // Avatar affiché seulement quand le fichier existe : rien de simulé
      const q = parsed.data
      const missing = (src?: string) => !!src && !existsSync(path.join(process.cwd(), 'public', src))
      if (missing(q.avatar)) delete q.avatar
      for (const o of q.outcomes ?? []) if (missing(o.avatar)) delete o.avatar
      list.push(q.mode === 'partis' ? withParties(q) : q)
    }
  cache = list.sort((a, b) => a.order - b.order)
  return cache
}

export const getFlashQuiz = (slug: string) => getFlashQuizzes().find((q) => q.slug === slug)

/**
 * Mode « partis » : les questions sont celles du test (même texte, même échelle), et chaque parti
 * reprend les positions sourcées de ses candidats. Seules les questions retenues partent vers le navigateur.
 * Un candidat retiré ou battu à une primaire sort aussitôt ; un parti sans candidat en lice disparaît du quiz.
 */
function withParties(q: FlashQuizFull): FlashQuizFull {
  const nameOf = new Map(getActiveActors().map((a) => [a.slug, a.name]))
  const parties = (q.parties ?? []).map((p) => ({ ...p, actors: p.actors.filter((s) => nameOf.has(s)) })).filter((p) => p.actors.length > 0)
  const items = (q.items ?? []).map((id) => questionnaire.items.find((i) => i.id === id)).filter((i) => !!i)
  const scale = UI_COPY.test.scale
  const sources = new Map((liveCorpus.sources ?? []).map((s) => [s.id, s]))
  const partyData: PartyData = {}
  for (const party of parties)
    for (const slug of party.actors) {
      partyData[slug] = {}
      for (const it of items) {
        const p = liveCorpus.positions[slug]?.[it.id]
        if (!p || 'missing' in p) continue
        const src = sources.get(p.sources[0] ?? '')
        partyData[slug][it.id] = { p, quote: src?.passage, url: src?.url ?? undefined, publisher: src?.publisher }
      }
    }
  return {
    ...q,
    parties: parties.map((p) => ({ ...p, actorNames: p.actors.map((s) => nameOf.get(s)!) })),
    items: items.map((i) => i.id),
    questions: items.map((i) => ({
      q: i.text,
      explain: i.explanation,
      answers: [
        { label: scale[4], value: 2 },
        { label: scale[3], value: 1 },
        { label: scale[1], value: -1 },
        { label: scale[0], value: -2 },
        { label: UI_COPY.flash.noOpinion, value: null },
      ],
    })),
    partyData,
  }
}
