import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { clientIp, sameOrigin } from '@/lib/client-ip'
import { rateLimited } from '@/lib/newsletter'
import { isPushEndpoint } from '@/lib/push-shared'
import { SITE_URL } from '@/lib/site'
import { rpc, urneReady } from '@/lib/urne'

export const dynamic = 'force-dynamic'

/**
 * Abonnement aux notifications « ton résultat peut bouger ».
 * Reçoit seulement ce que le navigateur fournit pour notifier (adresse du service et clés de chiffrement) :
 * aucune réponse, aucun résultat. Rien n'est journalisé.
 */
const Sub = z
  .object({
    endpoint: z.string().max(1024).refine(isPushEndpoint),
    keys: z.object({ p256dh: z.string().regex(/^[A-Za-z0-9_-]{80,100}$/), auth: z.string().regex(/^[A-Za-z0-9_-]{16,30}$/) }).strict(),
  })
  .strict()
const Unsub = z.object({ endpoint: z.string().max(1024).refine(isPushEndpoint) }).strict()

async function body(req: NextRequest): Promise<unknown> {
  if (Number(req.headers.get('content-length') ?? 0) > 2000) return null
  try {
    return await req.json()
  } catch {
    return null
  }
}

function guard(req: NextRequest): NextResponse | null {
  if (!sameOrigin(req, SITE_URL.host)) return NextResponse.json({ ok: false }, { status: 403 })
  if (!urneReady()) return NextResponse.json({ ok: false }, { status: 503 })
  if (rateLimited(`push:${clientIp(req) || 'unknown'}`, 10)) return NextResponse.json({ ok: false }, { status: 429 })
  return null
}

export async function POST(req: NextRequest) {
  const stop = guard(req)
  if (stop) return stop
  const parsed = Sub.safeParse(await body(req))
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 })
  try {
    const ok = await rpc<boolean>('alertes_push_add', { p_endpoint: parsed.data.endpoint, p_p256dh: parsed.data.keys.p256dh, p_auth: parsed.data.keys.auth })
    return NextResponse.json({ ok }, { status: ok ? 200 : 503 })
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 })
  }
}

export async function DELETE(req: NextRequest) {
  const stop = guard(req)
  if (stop) return stop
  const parsed = Unsub.safeParse(await body(req))
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 })
  try {
    await rpc<null>('alertes_push_remove', { p_endpoint: parsed.data.endpoint })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 })
  }
}
