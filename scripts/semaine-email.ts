/**
 * Lettre du lundi : « La semaine de la présidentielle », envoyée par Resend (broadcast) à tout le segment.
 * La même lettre pour tout le monde : elle ne contient ni ne dépend d'aucune réponse au test. Le « ton résultat
 * a peut-être bougé » renvoie au site, où le calcul se fait sur l'appareil.
 *
 * Usage : npx tsx scripts/semaine-email.ts [AAAA-Www] [--send]
 * Sans --send : affiche la lettre, n'envoie rien. Semaine par défaut : celle qui vient de se terminer.
 * Variables : RESEND_API_KEY, RESEND_FROM, RESEND_SEGMENT_ID.
 */
import { UI_COPY } from '../src/lib/copy'
import { dayLabel } from '../src/lib/guides'
import { previousWeek, type WeekRecap } from '../src/lib/semaine'
import { actorName, recapFor } from '../src/lib/semaine-data'

const SITE = 'https://xn--avote-xra.fr'
const t = UI_COPY.semaine
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string)

const args = process.argv.slice(2)
const SEND = args.includes('--send')
const week = args.find((a) => /^\d{4}-W\d{2}$/.test(a)) ?? previousWeek(new Date())

function range(r: WeekRecap) {
  return `Du ${dayLabel(r.start)} au ${dayLabel(r.end)}`.replace(/ \d{4} au/, (m) => (r.start.slice(0, 4) === r.end.slice(0, 4) ? ' au' : m))
}
const summary = (r: WeekRecap) => t.summary(r.addedTotal, r.changedTotal, r.intox.length, r.candidacies.length)

function subjectOf(r: WeekRecap): string {
  const parts = [
    r.addedTotal ? `${r.addedTotal} position${r.addedTotal > 1 ? 's' : ''} nouvelle${r.addedTotal > 1 ? 's' : ''}` : '',
    r.changedTotal ? `${r.changedTotal} qui ${r.changedTotal > 1 ? 'ont' : 'a'} changé` : '',
    r.intox.length ? `${r.intox.length} intox démontée${r.intox.length > 1 ? 's' : ''}` : '',
  ].filter(Boolean)
  return `La semaine de la présidentielle : ${parts.join(', ') || 'les prochains rendez-vous'}`
}

function build(r: WeekRecap) {
  const url = `${SITE}/semaine/${r.week}`
  const h2 = (s: string) => `<h2 style="font-size:19px;margin:28px 0 8px">${esc(s)}</h2>`
  const li = (s: string) => `<li style="margin:0 0 6px">${s}</li>`
  const ul = (items: string[]) => `<ul style="padding-left:20px;margin:0;font-size:16px;line-height:1.5">${items.join('')}</ul>`
  const link = (href: string, label: string) => `<a href="${esc(href)}" style="color:#191919">${esc(label)}</a>`
  const people = (list: WeekRecap['added']) =>
    ul(list.map((a) => li(`${link(`${SITE}/candidats/${a.actor}`, actorName(a.actor))} : ${esc(t.positions(a.count))}${a.themes.length ? ` <span style="color:#625E57">(${esc(a.themes.join(', '))})</span>` : ''}`)))
  const blocks = [
    r.added.length ? h2(t.addedTitle) + people(r.added) : '',
    r.changed.length ? h2(t.changedTitle) + people(r.changed) : '',
    r.addedTotal + r.changedTotal > 0
      ? `<div style="background:#FFE34D;padding:16px;margin:24px 0;border-radius:6px"><p style="margin:0 0 8px;font-weight:700">${esc(t.driftTitle)}</p><p style="margin:0 0 12px;line-height:1.5">${esc(t.driftText)}</p>${link(`${SITE}/resultats`, t.driftCta)}</div>`
      : '',
    r.intox.length ? h2(t.intoxTitle) + ul(r.intox.map((x) => li(`<strong>${esc(x.verdict)}</strong> : ${link(`${SITE}/fake-news/${x.id}`, `« ${x.claim} »`)}`))) : '',
    r.candidacies.length
      ? h2(t.candTitle) + ul(r.candidacies.map((c) => li(`${link(`${SITE}/candidats/${c.slug}`, c.name)} ${esc(c.kind === 'nouvelle' ? t.candNew : t.candOut)}`)))
      : '',
    r.next.length ? h2(t.nextTitle) + ul(r.next.map((e) => li(`${link(`${SITE}/agenda#${e.id}`, e.title)} <span style="color:#625E57">(${esc(dayLabel(e.date))})</span>`))) : '',
  ]
  const html = `<!doctype html><html lang="fr"><body style="margin:0;background:#F5F0E6;font-family:Arial,sans-serif;color:#191919">
<div style="max-width:560px;margin:0 auto;padding:32px 20px">
<p style="font-size:24px;font-weight:900;margin:0 0 4px">ÇA VOTE <span style="background:#FFE34D;padding:0 6px">?</span></p>
<p style="margin:0 0 24px;color:#625E57">${esc(t.kicker)} · ${esc(range(r))}</p>
<p style="font-size:18px;line-height:1.5;font-weight:700">${esc(summary(r))}</p>
${blocks.join('\n')}
<p style="margin:28px 0"><a href="${url}" style="background:#191919;color:#F5F0E6;padding:14px 22px;border-radius:6px;text-decoration:none;font-weight:700;display:inline-block">Lire la semaine sur le site</a></p>
<p style="font-size:13px;line-height:1.5;color:#625E57">${esc(t.mailText)} Chaque information renvoie à sa source sur le site.<br><a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#625E57">Se désinscrire</a></p>
</div></body></html>`
  const text = [
    `${t.kicker} · ${range(r)}`,
    '',
    summary(r),
    ...(r.added.length ? ['', `${t.addedTitle} :`, ...r.added.map((a) => `- ${actorName(a.actor)} : ${t.positions(a.count)}`)] : []),
    ...(r.changed.length ? ['', `${t.changedTitle} :`, ...r.changed.map((a) => `- ${actorName(a.actor)} : ${t.positions(a.count)}`)] : []),
    ...(r.addedTotal + r.changedTotal > 0 ? ['', `${t.driftTitle} : ${t.driftText} ${SITE}/resultats`] : []),
    ...(r.intox.length ? ['', `${t.intoxTitle} :`, ...r.intox.map((x) => `- ${x.verdict} : « ${x.claim} » ${SITE}/fake-news/${x.id}`)] : []),
    ...(r.next.length ? ['', `${t.nextTitle} :`, ...r.next.map((e) => `- ${e.title} (${dayLabel(e.date)})`)] : []),
    '',
    `Lire la semaine : ${url}`,
    '',
    `${t.mailText}`,
    'Se désinscrire : {{{RESEND_UNSUBSCRIBE_URL}}}',
  ].join('\n')
  return { subject: subjectOf(r), html, text }
}

async function main() {
  const r = recapFor(week)
  if (r.empty) {
    console.log(`${week} : rien de nouveau, pas de lettre cette semaine.`)
    return
  }
  const mail = build(r)
  console.log(`${week} · ${mail.subject}\n\n${mail.text}`)
  if (!SEND) {
    console.log('\nMode lecture : rien n’est envoyé (ajouter --send).')
    return
  }
  const { RESEND_API_KEY, RESEND_FROM, RESEND_SEGMENT_ID } = process.env
  if (!RESEND_API_KEY || !RESEND_FROM || !RESEND_SEGMENT_ID) {
    console.log('\nRESEND_API_KEY, RESEND_FROM ou RESEND_SEGMENT_ID absent : envoi sauté.')
    return
  }
  const res = await fetch('https://api.resend.com/broadcasts', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `semaine-${week}` },
    body: JSON.stringify({ segment_id: RESEND_SEGMENT_ID, from: RESEND_FROM, subject: mail.subject, html: mail.html, text: mail.text, name: `Semaine ${week}`, send: true }),
  })
  if (!res.ok) {
    const body = (await res.text()).slice(0, 300)
    // Personne n'est encore inscrit : rien à envoyer, ce n'est pas une panne
    if (res.status === 422 && body.includes('no contacts')) return console.log('\nAucun inscrit dans le segment : lettre non envoyée.')
    throw new Error(`Resend : ${res.status} ${body}`)
  }
  console.log(`\nLettre envoyée (${week}).`)
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
