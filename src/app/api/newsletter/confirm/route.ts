import { NextResponse, type NextRequest } from 'next/server'
import { addContact, openToken, rateLimited } from '@/lib/newsletter'

export const dynamic = 'force-dynamic'

// Confirmation par POST (bouton) : les scanners de liens des messageries ne valident pas à la place de la personne.
export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin')
  if (origin && new URL(origin).host !== req.nextUrl.host) return NextResponse.json({ ok: false }, { status: 403 })
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (rateLimited(`confirm:${ip}`, 10)) return NextResponse.redirect(new URL('/newsletter?etat=limite', req.url), 303)

  const form = await req.formData()
  const token = form.get('t')
  const pending = typeof token === 'string' ? openToken(token) : null
  if (!pending) return NextResponse.redirect(new URL('/newsletter?etat=expire', req.url), 303)
  try {
    const ok = await addContact(pending)
    return NextResponse.redirect(new URL(ok ? '/newsletter?etat=confirme' : '/newsletter?etat=erreur', req.url), 303)
  } catch {
    return NextResponse.redirect(new URL('/newsletter?etat=erreur', req.url), 303)
  }
}
