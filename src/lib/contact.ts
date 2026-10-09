import 'server-only'
import { LEGAL } from './legal'
import { escapeHtml, resend } from './newsletter'

/**
 * Formulaire de contact : le message est transmis par email à l'adresse de contact, puis oublié.
 * Le site ne stocke rien et ne journalise ni le message ni l'adresse de l'expéditeur.
 * L'adresse de réponse, si la personne la donne, n'apparaît que dans le champ « Répondre à ».
 */
export interface ContactMessage {
  kind: 'general' | 'correction'
  page: string
  message: string
  email: string
}

const KIND_LABEL: Record<ContactMessage['kind'], string> = { general: 'Message', correction: 'Correction' }

export async function sendContact(m: ContactMessage): Promise<boolean> {
  const subject = `[Ça vote ? · ${KIND_LABEL[m.kind]}] ${m.message.replace(/\s+/g, ' ').slice(0, 60)}`
  const text = [`Type : ${KIND_LABEL[m.kind]}`, m.page ? `Page : ${m.page}` : '', m.email ? `Répondre à : ${m.email}` : 'Pas d’adresse de réponse.', '', m.message].filter((l, i) => l || i > 2).join('\n')
  const html = `<!doctype html><html lang="fr"><body style="font-family:Arial,sans-serif;color:#191919"><p><strong>${KIND_LABEL[m.kind]}</strong>${m.page ? ` · ${escapeHtml(m.page)}` : ''}</p><p style="white-space:pre-wrap">${escapeHtml(m.message)}</p><p style="color:#625E57">${m.email ? `Répondre à : ${escapeHtml(m.email)}` : 'Pas d’adresse de réponse.'}</p></body></html>`
  const res = await resend('/emails', {
    from: process.env.RESEND_FROM,
    to: [process.env.CONTACT_TO || LEGAL.contactEmail],
    ...(m.email ? { reply_to: m.email } : {}),
    subject,
    text,
    html,
  })
  return res.ok
}
