import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { clientIp, sameOrigin } from '@/lib/client-ip'
import { SITE_URL } from '@/lib/site'
import { rateLimited } from '@/lib/newsletter'
import { cast, checkWork, claim, fingerprint, invalidateTotals, isChoice, urneReady } from '@/lib/urne'

export const dynamic = 'force-dynamic'

const Body = z.object({ choice: z.string().regex(/^[a-z0-9-]{2,60}$/), challenge: z.string().max(200), nonce: z.string().max(20) }).strict()

export async function POST(req: NextRequest) {
  if (!urneReady()) return NextResponse.json({ ok: false, reason: 'ferme' }, { status: 503 })
  if (!sameOrigin(req, SITE_URL.host)) return NextResponse.json({ ok: false }, { status: 403 })
  if (Number(req.headers.get('content-length') ?? 0) > 1000) return NextResponse.json({ ok: false }, { status: 413 })

  const ip = clientIp(req)
  if (!ip) return NextResponse.json({ ok: false, reason: 'invalide' }, { status: 400 })
  if (rateLimited(`urne:${ip}`, 5, 10 * 60 * 1000)) return NextResponse.json({ ok: false, reason: 'trop' }, { status: 429 })

  let body
  try {
    body = Body.safeParse(await req.json())
  } catch {
    return NextResponse.json({ ok: false, reason: 'invalide' }, { status: 400 })
  }
  if (!body.success || !isChoice(body.data.choice)) return NextResponse.json({ ok: false, reason: 'invalide' }, { status: 400 })
  if (!checkWork(body.data.challenge, body.data.nonce)) return NextResponse.json({ ok: false, reason: 'robot' }, { status: 400 })

  try {
    // Deux appels séparés : l'empreinte d'abord (sans le choix), puis le choix (sans l'empreinte)
    const first = await claim(fingerprint(ip))
    if (!first) return NextResponse.json({ ok: false, reason: 'deja' }, { status: 409 })
    await cast(body.data.choice)
    invalidateTotals()
    return NextResponse.json({ ok: true })
  } catch {
    // Rien n'est journalisé : ni l'adresse, ni le choix
    return NextResponse.json({ ok: false, reason: 'panne' }, { status: 502 })
  }
}
