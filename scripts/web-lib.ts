/**
 * Accès réseau partagé par les scripts de recherche (positions, médias) :
 * relecture des pages citées et collecte des pages lues par Claude.
 */
import { execFile } from 'node:child_process'
import type Anthropic from '@anthropic-ai/sdk'
import { canonicalUrl, stripHtml } from './veille-lib'

const BOT_UA = 'Mozilla/5.0 (compatible; CaVoteRecherche/1.0; +https://xn--avote-xra.fr/methodologie)'
const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
const MAX_BYTES = 25_000_000

/**
 * Certains sites refusent les clients Node quel que soit l’en-tête (empreinte TLS) ou saturent par moments :
 * une seule relecture par curl, présent sur les postes et dans GitHub Actions.
 */
function curlGet(url: string): Promise<Buffer | null> {
  return new Promise((resolve) => {
    const ca = process.env.NODE_EXTRA_CA_CERTS
    execFile(
      'curl',
      ['-sSL', '--fail', '--max-time', '25', '--max-filesize', String(MAX_BYTES), '-A', BROWSER_UA, '-H', 'Accept-Language: fr-FR,fr;q=0.9', ...(ca ? ['--cacert', ca] : []), url],
      { encoding: 'buffer', maxBuffer: MAX_BYTES + 1_000_000 },
      (err, stdout) => resolve(err ? null : stdout),
    )
  })
}

/** Texte d'une page (HTML ou PDF), pour vérifier qu'une citation y figure. */
export async function fetchText(url: string): Promise<string | null> {
  try {
    let buf: Buffer | null = null
    let type = ''
    const res = await fetch(url, { headers: { 'User-Agent': BOT_UA, 'Accept-Language': 'fr-FR,fr;q=0.9' }, signal: AbortSignal.timeout(25_000), redirect: 'follow' })
    if (res.ok) {
      buf = Buffer.from(await res.arrayBuffer())
      type = res.headers.get('content-type') ?? ''
    } else if ([401, 403, 429, 503].includes(res.status)) {
      buf = await curlGet(url)
    }
    if (!buf || buf.length > MAX_BYTES) return null
    if (type.includes('pdf') || url.toLowerCase().endsWith('.pdf') || buf.subarray(0, 5).toString('latin1') === '%PDF-') {
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
