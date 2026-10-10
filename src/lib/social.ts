import 'server-only'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { SocialPostSchema, type SocialPost } from './social-schema'

const DIR = path.join(process.cwd(), 'content/social')
let cache: SocialPost[] | null = null

/** Toutes les publications préparées, des plus récentes aux plus anciennes. */
export function getSocialPosts(): SocialPost[] {
  if (cache) return cache
  const list: SocialPost[] = []
  if (existsSync(DIR))
    for (const f of readdirSync(DIR).filter((f) => f.endsWith('.json') && !f.startsWith('_'))) {
      const parsed = SocialPostSchema.safeParse(JSON.parse(readFileSync(path.join(DIR, f), 'utf8')))
      if (!parsed.success) throw new Error(`content/social/${f} invalide : ${parsed.error.message}`)
      list.push(parsed.data)
    }
  list.sort((a, b) => b.at.localeCompare(a.at))
  cache = list
  return list
}

export const getSocialPost = (id: string) => getSocialPosts().find((p) => p.id === id)

/** Publications dont l'heure est passée (les flux ne montrent rien d'avance). */
export const duePosts = (now = Date.now()) => getSocialPosts().filter((p) => Date.parse(p.at) <= now)
