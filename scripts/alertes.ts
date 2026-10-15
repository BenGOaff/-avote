/**
 * Robot des alertes « ton résultat peut bouger » (règles : src/lib/alertes.ts).
 * Chaque jour : s'il y a des changements de position (content/corpus/changes.json) ou des candidats entrés dans le
 * test depuis la dernière alerte, une notification part vers les téléphones abonnés, et un email au segment des
 * alertes quand il y en a assez. Le contenu est public et le même pour tous : aucune réponse n'existe côté serveur.
 *
 * Usage : npx tsx scripts/alertes.ts [--send]
 * Sans --send : affiche ce qui partirait, n'envoie rien et ne déplace pas les curseurs.
 * Variables : URNE_SUPABASE_URL, URNE_SUPABASE_KEY, URNE_TOKEN, VAPID_PRIVATE_KEY (notifications) ;
 *             RESEND_API_KEY, RESEND_FROM, RESEND_ALERT_SEGMENT_ID (email).
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import webpush from 'web-push'
import changes from '@content/corpus/changes.json'
import { digest, pushPayload, touched, who, worthEmail, worthPush, type AlertState, type Change, type Digest } from '../src/lib/alertes'
import { UI_COPY } from '../src/lib/copy'
import { liveCorpus } from '../src/lib/data'
import { VAPID_PUBLIC_KEY } from '../src/lib/push-shared'

const SITE = 'https://xn--avote-xra.fr'
const STATE = join(process.cwd(), 'content/alertes/etat.json')
const SEND = process.argv.includes('--send')
const t = UI_COPY.alertes
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string)

const names = new Map(liveCorpus.actors.map((a) => [a.slug, a.name]))
const name = (s: string) => names.get(s) ?? s
const inTest = liveCorpus.actors.map((a) => a.slug)

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const { URNE_SUPABASE_URL: url, URNE_SUPABASE_KEY: key, URNE_TOKEN: token } = process.env
  const res = await fetch(`${url}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { apikey: key!, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_token: token, ...args }),
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) throw new Error(`Supabase ${fn} : ${res.status}`)
  return (await res.json()) as T
}

/** Envoie à tous les abonnés ; une adresse que le service déclare morte (404, 410) est supprimée. */
async function sendPush(d: Digest): Promise<boolean> {
  const { URNE_SUPABASE_URL, URNE_SUPABASE_KEY, URNE_TOKEN, VAPID_PRIVATE_KEY } = process.env
  if (!URNE_SUPABASE_URL || !URNE_SUPABASE_KEY || !URNE_TOKEN || !VAPID_PRIVATE_KEY) {
    console.log('Notifications : secrets absents, envoi sauté.')
    return false
  }
  webpush.setVapidDetails(SITE, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
  const payload = JSON.stringify(
    pushPayload(d, name, { title: t.notifTitle, body: t.notifBody, mineTitle: t.notifMineTitle, mineBody: t.notifMineBody }, '/resultats'),
  )
  let after = ''
  let sent = 0
  let gone = 0
  for (;;) {
    const page = await rpc<{ endpoint: string; p256dh: string; auth: string }[]>('alertes_push_list', { p_after: after, p_limit: 1000 })
    if (!page.length) break
    after = page.at(-1)!.endpoint
    for (const s of page) {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 24 * 3600, urgency: 'low', topic: 'resultat' })
        sent++
      } catch (e) {
        const code = (e as { statusCode?: number }).statusCode
        if (code === 404 || code === 410) {
          await rpc('alertes_push_remove', { p_endpoint: s.endpoint })
          gone++
        }
      }
    }
  }
  console.log(`Notifications : ${sent} envoyée(s), ${gone} abonnement(s) expiré(s) supprimé(s).`)
  return true
}

function mail(d: Digest) {
  const people = touched(d)
  const lead = who([...d.fresh, ...people.map((p) => p.actor).filter((a) => !d.fresh.includes(a))].map(name))
  const url = `${SITE}/resultats`
  const li = (s: string) => `<li style="margin:0 0 6px">${s}</li>`
  const link = (slug: string) => `<a href="${SITE}/candidats/${slug}" style="color:#191919">${esc(name(slug))}</a>`
  const html = `<!doctype html><html lang="fr"><body style="margin:0;background:#F5F0E6;font-family:Arial,sans-serif;color:#191919">
<div style="max-width:560px;margin:0 auto;padding:32px 20px">
<p style="font-size:24px;font-weight:900;margin:0 0 24px">ÇA VOTE <span style="background:#FFE34D;padding:0 6px">?</span></p>
<p style="font-size:17px;line-height:1.5">${esc(t.mailIntro)}</p>
${d.fresh.length ? `<h2 style="font-size:19px;margin:24px 0 8px">${esc(t.mailFresh)}</h2><ul style="padding-left:20px;font-size:16px;line-height:1.5">${d.fresh.map((a) => li(link(a))).join('')}</ul>` : ''}
${people.length ? `<h2 style="font-size:19px;margin:24px 0 8px">${esc(t.mailChanged)}</h2><ul style="padding-left:20px;font-size:16px;line-height:1.5">${people.map((p) => li(`${link(p.actor)} : ${esc(t.mailPositions(p.count))}`)).join('')}</ul>` : ''}
<p style="margin:28px 0 12px"><a href="${url}" style="background:#191919;color:#F5F0E6;padding:14px 22px;border-radius:6px;text-decoration:none;font-weight:700;display:inline-block">${esc(t.mailCta)}</a></p>
<p style="font-size:15px;line-height:1.5">${esc(t.mailHint)}</p>
<p style="font-size:13px;line-height:1.5;color:#625E57">${esc(t.mailWhy)}<br><a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#625E57">Se désinscrire</a></p>
</div></body></html>`
  const text = [
    t.mailIntro,
    ...(d.fresh.length ? ['', `${t.mailFresh} :`, ...d.fresh.map((a) => `- ${name(a)} ${SITE}/candidats/${a}`)] : []),
    ...(people.length ? ['', `${t.mailChanged} :`, ...people.map((p) => `- ${name(p.actor)} : ${t.mailPositions(p.count)}`)] : []),
    '',
    `${t.mailCta} : ${url}`,
    t.mailHint,
    '',
    t.mailWhy,
    'Se désinscrire : {{{RESEND_UNSUBSCRIBE_URL}}}',
  ].join('\n')
  return { subject: t.mailSubject(lead), html, text }
}

async function sendEmail(d: Digest, key: string): Promise<boolean> {
  const { RESEND_API_KEY, RESEND_FROM, RESEND_ALERT_SEGMENT_ID } = process.env
  if (!RESEND_API_KEY || !RESEND_FROM || !RESEND_ALERT_SEGMENT_ID) {
    console.log('Email : RESEND_API_KEY, RESEND_FROM ou RESEND_ALERT_SEGMENT_ID absent, envoi sauté.')
    return false
  }
  const m = mail(d)
  const res = await fetch('https://api.resend.com/broadcasts', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `alerte-${key}` },
    body: JSON.stringify({ segment_id: RESEND_ALERT_SEGMENT_ID, from: RESEND_FROM, subject: m.subject, html: m.html, text: m.text, name: `Alerte ${key}`, send: true }),
  })
  if (!res.ok) throw new Error(`Resend : ${res.status} ${(await res.text()).slice(0, 300)}`)
  console.log('Email envoyé.')
  return true
}

async function main() {
  const now = new Date()
  const state = JSON.parse(readFileSync(STATE, 'utf8')) as AlertState
  const all = changes as Change[]

  const p = digest(state.push, all, inTest, now)
  console.log(`Notifications : ${p.changes.length} changement(s), ${p.fresh.length} candidat(s) entré(s) dans le test.`)
  const e = digest(state.email, all, inTest, now)
  const emailDue = worthEmail(e, state.email, now)
  console.log(`Email : ${e.changes.length} changement(s) depuis le dernier, ${emailDue ? 'à envoyer' : 'pas cette fois'}.`)
  if (emailDue) console.log(`\n${mail(e).subject}\n\n${mail(e).text}\n`)

  if (!SEND) {
    console.log('Mode lecture : rien n’est envoyé (ajouter --send).')
    return
  }
  const next: AlertState = { ...state }
  if (!worthPush(p) || (await sendPush(p))) next.push = p.next
  if (emailDue && (await sendEmail(e, e.next.at.slice(0, 16)))) next.email = e.next
  writeFileSync(STATE, `${JSON.stringify(next, null, 2)}\n`)
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
