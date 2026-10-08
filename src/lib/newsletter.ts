import 'server-only'
import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from 'node:crypto'

/**
 * Newsletter sans base de données (cahier §18, §19) :
 * - aucune donnée n'est stockée par le site ;
 * - le lien de confirmation transporte email + prénom chiffrés et authentifiés (AES-256-GCM) ;
 * - seul un clic de confirmation ajoute le contact chez Resend (double opt-in).
 * La newsletter n'a aucun lien avec le test : elle ne reçoit ni réponse ni résultat.
 */

const TOKEN_TTL_MS = 48 * 3600 * 1000

function key(): Buffer {
  const secret = process.env.NEWSLETTER_SECRET?.trim()
  if (!secret || secret.length < 32) throw new Error('NEWSLETTER_SECRET absent ou trop court (32 caractères minimum).')
  return Buffer.from(hkdfSync('sha256', Buffer.from(secret, 'utf8'), Buffer.alloc(0), 'ca-vote/newsletter/v1', 32))
}

export interface Pending {
  email: string
  firstName: string
  issuedAt: number
}

export function sealToken(p: Omit<Pending, 'issuedAt'>): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key(), iv)
  const body = Buffer.concat([cipher.update(JSON.stringify({ e: p.email, f: p.firstName, t: Date.now() }), 'utf8'), cipher.final()])
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString('base64url')
}

export function openToken(token: string): Pending | null {
  try {
    const raw = Buffer.from(token, 'base64url')
    if (raw.length < 29 || raw.length > 1024) return null
    const decipher = createDecipheriv('aes-256-gcm', key(), raw.subarray(0, 12))
    decipher.setAuthTag(raw.subarray(12, 28))
    const json = Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString('utf8')
    const { e, f, t } = JSON.parse(json) as { e: string; f: string; t: number }
    if (typeof e !== 'string' || typeof t !== 'number' || Date.now() - t > TOKEN_TTL_MS) return null
    return { email: e, firstName: typeof f === 'string' ? f : '', issuedAt: t }
  } catch {
    return null
  }
}

// Limitation de débit en mémoire : aucune adresse IP n'est écrite sur disque ni journalisée.
const hits = new Map<string, number[]>()
export function rateLimited(bucket: string, max = 5, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now()
  const list = (hits.get(bucket) ?? []).filter((t) => now - t < windowMs)
  list.push(now)
  hits.set(bucket, list)
  if (hits.size > 10_000) hits.clear()
  return list.length > max
}

const RESEND = 'https://api.resend.com'

async function resend(path: string, body: unknown, idempotencyKey?: string): Promise<Response> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY absente')
  return fetch(`${RESEND}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  })
}

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string)

export async function sendConfirmation(p: Omit<Pending, 'issuedAt'>, confirmUrl: string): Promise<boolean> {
  const hello = p.firstName ? `Bonjour ${escapeHtml(p.firstName)},` : 'Bonjour,'
  const html = `<!doctype html><html lang="fr"><body style="margin:0;background:#F5F0E6;font-family:Arial,sans-serif;color:#191919">
<div style="max-width:520px;margin:0 auto;padding:32px 20px">
<p style="font-size:24px;font-weight:900;margin:0 0 24px">ÇA VOTE <span style="background:#FFE34D;padding:0 6px">?</span></p>
<p style="font-size:17px;line-height:1.5">${hello}</p>
<p style="font-size:17px;line-height:1.5">Pour recevoir la lettre de Ça vote ?, confirme ton adresse. Sans clic, rien ne se passe et l’adresse n’est conservée nulle part.</p>
<p style="margin:28px 0"><a href="${escapeHtml(confirmUrl)}" style="background:#191919;color:#F5F0E6;padding:14px 22px;border-radius:6px;text-decoration:none;font-weight:700;display:inline-block">Confirmer mon inscription</a></p>
<p style="font-size:14px;line-height:1.5;color:#625E57">Le lien est valable 48 heures. Si tu n’as rien demandé, ignore ce message.</p>
</div></body></html>`
  const text = `${hello.replace(/&#39;/g, "'")}\n\nPour recevoir la lettre de Ça vote ?, confirme ton adresse :\n${confirmUrl}\n\nLe lien est valable 48 heures. Si tu n’as rien demandé, ignore ce message.`
  const res = await resend('/emails', {
    from: process.env.RESEND_FROM,
    to: [p.email],
    subject: 'Confirme ton inscription à Ça vote ?',
    html,
    text,
  })
  return res.ok
}

export async function addContact(p: Pending): Promise<boolean> {
  const segment = process.env.RESEND_SEGMENT_ID
  const res = await resend('/contacts', {
    email: p.email,
    first_name: p.firstName || undefined,
    unsubscribed: false,
    ...(segment ? { segments: [{ id: segment }] } : {}),
  })
  if (res.ok) return true
  // Contact déjà existant : on le rattache au segment
  if ((res.status === 409 || res.status === 422) && segment) {
    const r2 = await resend(`/contacts/${encodeURIComponent(p.email)}/segments/${encodeURIComponent(segment)}`, {})
    return r2.ok || r2.status === 409
  }
  return false
}
