import 'server-only'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { FlashQuizSchema, type FlashQuiz } from './flash'

const DIR = path.join(process.cwd(), 'content/quiz/flash')
let cache: FlashQuiz[] | null = null

/** Quiz flash publiés (content/quiz/flash/*.json), dans l'ordre choisi par la rédaction. */
export function getFlashQuizzes(): FlashQuiz[] {
  if (cache) return cache
  const list: FlashQuiz[] = []
  if (existsSync(DIR))
    for (const f of readdirSync(DIR).filter((f) => f.endsWith('.json'))) {
      const parsed = FlashQuizSchema.safeParse(JSON.parse(readFileSync(path.join(DIR, f), 'utf8')))
      if (!parsed.success) throw new Error(`content/quiz/flash/${f} invalide : ${parsed.error.message}`)
      // Avatar affiché seulement quand le fichier existe : rien de simulé
      const q = parsed.data
      const missing = (src?: string) => !!src && !existsSync(path.join(process.cwd(), 'public', src))
      if (missing(q.avatar)) delete q.avatar
      for (const o of q.outcomes ?? []) if (missing(o.avatar)) delete o.avatar
      list.push(q)
    }
  cache = list.sort((a, b) => a.order - b.order)
  return cache
}

export const getFlashQuiz = (slug: string) => getFlashQuizzes().find((q) => q.slug === slug)
