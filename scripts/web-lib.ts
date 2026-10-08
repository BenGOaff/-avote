/**
 * Accès réseau partagé par les scripts de recherche (positions, médias) :
 * relecture des pages citées et collecte des pages lues par Claude.
 */
import type Anthropic from '@anthropic-ai/sdk'
import { canonicalUrl, stripHtml } from './veille-lib'

/** Texte d'une page (HTML ou PDF), pour vérifier qu'une citation y figure. */
export async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CaVoteRecherche/1.0; +https://xn--avote-xra.fr/methodologie)' }, signal: AbortSignal.timeout(25_000), redirect: 'follow' })
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length > 25_000_000) return null
    if ((res.headers.get('content-type') ?? '').includes('pdf') || url.toLowerCase().endsWith('.pdf')) {
      const { extractText, getDocumentProxy } = await import('unpdf')
      const pdf = await getDocumentProxy(new Uint8Array(buf))
      const { text } = await extractText(pdf, { mergePages: true })
      return Array.isArray(text) ? text.join('\n') : text
    }
    return stripHtml(buf.toString('utf8'))
  } catch {
    return null
  }
}

/** Textes des pages lues par Claude pendant la recherche, indexés par URL. */
export function collectEvidence(content: Anthropic.Beta.BetaContentBlock[], into: Map<string, string>) {
  for (const b of content) {
    if (b.type !== 'web_fetch_tool_result') continue
    const c = b.content
    if (c.type !== 'web_fetch_result') continue
    const src = c.content.source
    if (src.type === 'text') {
      const url = canonicalUrl(c.url)
      if (url) into.set(url, (into.get(url) ?? '') + '\n' + src.data)
    }
  }
}
