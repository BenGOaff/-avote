/**
 * Lecture des contenus éditoriaux (dépôt Git = référentiel versionné).
 * Exécuté uniquement côté serveur, au build ou au rendu.
 *
 * Sécurité : les brouillons peuvent provenir d'une IA alimentée par des flux externes.
 * Le HTML brut est donc échappé et seuls les liens http(s) / relatifs sont rendus.
 */
import 'server-only'
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { parse as parseYaml } from 'yaml'
import { Marked, type Tokens } from 'marked'

const ROOT = process.cwd()

import { ArticleSchema, BriefSchema, type ArticleMeta, type BriefMeta } from './content-schema'
export type { SourceRef, ArticleMeta, BriefMeta } from './content-schema'

export interface Article extends ArticleMeta {
  slug: string
  html: string
  readingMinutes: number
}
export interface Brief extends BriefMeta {
  slug: string
  html: string
}

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const marked = new Marked({
  gfm: true,
  breaks: false,
  renderer: {
    html(token: Tokens.HTML | Tokens.Tag) {
      return escapeHtml(token.text)
    },
    link(this: { parser: { parseInline: (t: Tokens.Generic[]) => string } }, token: Tokens.Link) {
      const href = token.href ?? ''
      const ok = /^https?:\/\//i.test(href) || href.startsWith('/') || href.startsWith('#')
      const text = this.parser.parseInline(token.tokens)
      if (!ok) return text
      const external = /^https?:\/\//i.test(href)
      return `<a href="${escapeHtml(href)}"${external ? ' rel="noopener noreferrer nofollow" target="_blank"' : ''}>${text}</a>`
    },
    image(token: Tokens.Image) {
      // Pas d'image distante dans le corps : la CSP l'interdirait de toute façon.
      return escapeHtml(token.text ?? '')
    },
  },
})

/** Typographie française : apostrophe courbe, espaces fines insécables avant ; : ! ? et dans les guillemets. */
export function typo(t: string): string {
  return t
    .replace(/(\p{L})'(\p{L})/gu, '$1’$2')
    .replace(/ ([;:!?])(?=\s|$)/g, '\u202f$1')
    .replace(/« /g, '«\u202f')
    .replace(/ »/g, '\u202f»')
}

export function renderMarkdown(md: string): string {
  return marked.parse(typo(md), { async: false }) as string
}

function typoMeta<T extends { title: string }>(m: T): T {
  const src = m as unknown as Record<string, unknown>
  const out: Record<string, unknown> = { ...src, title: typo(m.title) }
  for (const k of ['dek', 'remark']) if (typeof src[k] === 'string') out[k] = typo(src[k] as string)
  for (const k of ['facts', 'cannotConclude']) if (Array.isArray(src[k])) out[k] = (src[k] as string[]).map(typo)
  return out as unknown as T
}

function splitFrontmatter(raw: string): { data: unknown; body: string } {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!m) throw new Error('Frontmatter absent')
  return { data: parseYaml(m[1] ?? ''), body: m[2] ?? '' }
}

function readDir(dir: string): { slug: string; raw: string; file: string }[] {
  const full = path.join(ROOT, 'content', dir)
  if (!existsSync(full)) return []
  return readdirSync(full)
    .filter((f) => f.endsWith('.md'))
    .map((f) => ({ slug: f.replace(/\.md$/, ''), raw: readFileSync(path.join(full, f), 'utf8'), file: f }))
}

const showDrafts = process.env.SHOW_DRAFTS === '1' && process.env.NODE_ENV !== 'production'

let articlesCache: Article[] | null = null
export function getArticles(): Article[] {
  if (articlesCache) return articlesCache
  const list: Article[] = []
  for (const { slug, raw, file } of readDir('radar')) {
    const { data, body } = splitFrontmatter(raw)
    const parsed = ArticleSchema.safeParse(data)
    if (!parsed.success) throw new Error(`content/radar/${file} invalide : ${parsed.error.message}`)
    if (parsed.data.status !== 'published' && !showDrafts) continue
    const words = body.split(/\s+/).filter(Boolean).length
    list.push({ ...typoMeta(parsed.data), slug, html: renderMarkdown(body), readingMinutes: Math.max(1, Math.round(words / 220)) })
  }
  list.sort((a, b) => b.date.localeCompare(a.date))
  articlesCache = list
  return list
}

export function getArticle(slug: string): Article | undefined {
  return getArticles().find((a) => a.slug === slug)
}

let briefsCache: Brief[] | null = null
export function getBriefs(): Brief[] {
  if (briefsCache) return briefsCache
  const list: Brief[] = []
  for (const { slug, raw, file } of readDir('fil')) {
    const { data, body } = splitFrontmatter(raw)
    const parsed = BriefSchema.safeParse(data)
    if (!parsed.success) throw new Error(`content/fil/${file} invalide : ${parsed.error.message}`)
    if (parsed.data.status !== 'published' && !showDrafts) continue
    list.push({ ...typoMeta(parsed.data), slug, html: renderMarkdown(body) })
  }
  list.sort((a, b) => b.date.localeCompare(a.date))
  briefsCache = list
  return list
}

export interface VeilleStatus {
  lastRun: string | null
  lastSuccess: string | null
  feeds: { id: string; name: string; ok: boolean; lastSuccess: string | null; error?: string }[]
}

export function getVeilleStatus(): VeilleStatus {
  const f = path.join(ROOT, 'content', 'veille', 'status.json')
  if (!existsSync(f)) return { lastRun: null, lastSuccess: null, feeds: [] }
  return JSON.parse(readFileSync(f, 'utf8')) as VeilleStatus
}

export interface CorrectionEntry {
  date: string
  object: string
  wasWrong: string
  evidence: string
  effect: string
  url?: string
}
export function getCorrections(): CorrectionEntry[] {
  const f = path.join(ROOT, 'content', 'corrections.json')
  if (!existsSync(f)) return []
  return (JSON.parse(readFileSync(f, 'utf8')) as CorrectionEntry[]).sort((a, b) => b.date.localeCompare(a.date))
}

