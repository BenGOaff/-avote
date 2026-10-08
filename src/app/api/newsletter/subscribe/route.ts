import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { rateLimited, sealToken, sendConfirmation } from '@/lib/newsletter'
import { absolute } from '@/lib/site'

export const dynamic = 'force-dynamic'

// Champs strictement limités : tout champ supplémentaire est refusé (cahier §21).
const Body = z
  .object({
    email: z.string().trim().toLowerCase().email().max(254),
    firstName: z.string().trim().max(60).regex(/^[\p{L}\p{M}' -]*$/u, 'Prénom invalide').default(''),
    consent: z.literal(true),
    website: z.string().max(0).optional(), // pot de miel anti-robots
  })
  .strict()

const GENERIC = { ok: true, message: 'Si l’adresse est valide, un email de confirmation arrive. Pense à vérifier les indésirables.' }

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin')
  if (origin && new URL(origin).host !== req.nextUrl.host) return NextResponse.json({ ok: false }, { status: 403 })
  const len = Number(req.headers.get('content-length') ?? 0)
  if (len > 2000) return NextResponse.json({ ok: false }, { status: 413 })

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (rateLimited(`sub:${ip}`)) return NextResponse.json({ ok: false, message: 'Trop de tentatives. Réessaie dans quelques minutes.' }, { status: 429 })

  let parsed
  try {
    parsed = Body.safeParse(await req.json())
  } catch {
    return NextResponse.json({ ok: false, message: 'Requête invalide.' }, { status: 400 })
  }
  if (!parsed.success) return NextResponse.json({ ok: false, message: 'Vérifie ton email et coche la case de consentement.' }, { status: 400 })
  if (parsed.data.website) return NextResponse.json(GENERIC) // robot : réponse identique, rien n'est envoyé
  if (rateLimited(`mail:${parsed.data.email}`, 3, 60 * 60 * 1000)) return NextResponse.json(GENERIC)

  try {
    const token = sealToken({ email: parsed.data.email, firstName: parsed.data.firstName })
    await sendConfirmation({ email: parsed.data.email, firstName: parsed.data.firstName }, absolute(`/newsletter/confirmer?t=${token}`))
  } catch {
    // Pas de journalisation du corps de requête ni de l'adresse (cahier §15.3, §21)
    return NextResponse.json({ ok: false, message: 'L’envoi a échoué. Réessaie plus tard.' }, { status: 502 })
  }
  return NextResponse.json(GENERIC)
}
