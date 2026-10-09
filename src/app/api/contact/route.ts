import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { clientIp, sameOrigin } from '@/lib/client-ip'
import { sendContact } from '@/lib/contact'
import { rateLimited } from '@/lib/newsletter'
import { SITE_URL } from '@/lib/site'

export const dynamic = 'force-dynamic'

// Champs strictement limités ; tout champ supplémentaire est refusé.
const Body = z
  .object({
    kind: z.enum(['general', 'correction']),
    page: z.string().trim().max(300).default(''),
    message: z.string().trim().min(20).max(4000),
    email: z.union([z.literal(''), z.string().trim().toLowerCase().email().max(254)]).default(''),
    website: z.string().max(0).optional(), // pot de miel anti-robots
    elapsed: z.number().int().min(0).max(86_400_000), // temps passé sur le formulaire : un robot remplit en moins de 3 s
  })
  .strict()

export async function POST(req: NextRequest) {
  if (!sameOrigin(req, SITE_URL.host)) return NextResponse.json({ ok: false }, { status: 403 })
  if (Number(req.headers.get('content-length') ?? 0) > 6000) return NextResponse.json({ ok: false }, { status: 413 })
  const ip = clientIp(req) || 'unknown'
  if (rateLimited(`contact:${ip}`, 3, 15 * 60 * 1000)) return NextResponse.json({ ok: false, reason: 'trop' }, { status: 429 })

  let parsed
  try {
    parsed = Body.safeParse(await req.json())
  } catch {
    return NextResponse.json({ ok: false, reason: 'invalide' }, { status: 400 })
  }
  if (!parsed.success) return NextResponse.json({ ok: false, reason: 'invalide' }, { status: 400 })
  // Robot présumé : même réponse qu'un envoi réussi, rien n'est transmis
  if (parsed.data.website || parsed.data.elapsed < 3000) return NextResponse.json({ ok: true })
  if (rateLimited('contact:all', 60, 60 * 60 * 1000)) return NextResponse.json({ ok: false, reason: 'trop' }, { status: 429 })

  try {
    const { kind, page, message, email } = parsed.data
    if (!(await sendContact({ kind, page, message, email }))) throw new Error('envoi')
  } catch {
    // Pas de journalisation du message ni de l'adresse
    return NextResponse.json({ ok: false, reason: 'panne' }, { status: 502 })
  }
  return NextResponse.json({ ok: true })
}
