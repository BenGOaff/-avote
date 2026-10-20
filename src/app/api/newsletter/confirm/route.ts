import { NextResponse, type NextRequest } from 'next/server'
import { clientIp, sameOrigin } from '@/lib/client-ip'
import { SITE_URL } from '@/lib/site'
import { addContact, openToken, rateLimited } from '@/lib/newsletter'

export const dynamic = 'force-dynamic'

// Retour vers la page de la lettre. Adresse relative : derrière le CDN, `req.url` est l'adresse interne du serveur,
// et une redirection vers un autre hôte après le formulaire est bloquée par la CSP (form-action 'self').
const back = (etat: 'confirme' | 'erreur' | 'limite' | 'expire') =>
  new NextResponse(null, { status: 303, headers: { Location: `/newsletter?etat=${etat}`, 'Cache-Control': 'no-store' } })

// Confirmation par POST (bouton) : les scanners de liens des messageries ne valident pas à la place de la personne.
export async function POST(req: NextRequest) {
  // Confirmation par formulaire : en cas de refus, une page lisible plutôt qu'une réponse brute
  if (!sameOrigin(req, SITE_URL.host, false)) return back('erreur')
  const ip = clientIp(req) || 'unknown'
  if (rateLimited(`confirm:${ip}`, 10)) return back('limite')

  const form = await req.formData()
  const token = form.get('t')
  const pending = typeof token === 'string' ? openToken(token) : null
  if (!pending) return back('expire')
  try {
    return back((await addContact(pending)) ? 'confirme' : 'erreur')
  } catch {
    return back('erreur')
  }
}
