import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { clientIp, sameOrigin } from '@/lib/client-ip'
import { rateLimited } from '@/lib/newsletter'
import { SITE_URL } from '@/lib/site'
import { verify } from '@/lib/verifier'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const Body = z.object({ q: z.string().trim().min(10).max(300) }).strict()

/** Vérificateur : la question n'est ni stockée ni journalisée (voir src/lib/verifier.ts). */
export async function POST(req: NextRequest) {
  if (!sameOrigin(req, SITE_URL.host)) return NextResponse.json({ ok: false }, { status: 403 })
  if (Number(req.headers.get('content-length') ?? 0) > 1200) return NextResponse.json({ ok: false }, { status: 413 })
  const ip = clientIp(req) || 'unknown'
  if (rateLimited(`verif:${ip}`, 8, 10 * 60 * 1000)) return NextResponse.json({ ok: false, reason: 'trop' }, { status: 429 })

  let parsed
  try {
    parsed = Body.safeParse(await req.json())
  } catch {
    return NextResponse.json({ ok: false, reason: 'invalide' }, { status: 400 })
  }
  if (!parsed.success) return NextResponse.json({ ok: false, reason: 'invalide' }, { status: 400 })
  try {
    const result = await verify(parsed.data.q)
    return NextResponse.json({ ok: true, result }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch {
    return NextResponse.json({ ok: false, reason: 'panne' }, { status: 502 })
  }
}
