import { NextResponse } from 'next/server'
import { totals, urneReady } from '@/lib/urne'
import { isFrozen } from '@/lib/urne-shared'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!urneReady()) return NextResponse.json({ ok: false }, { status: 503 })
  if (isFrozen()) return NextResponse.json({ ok: true, frozen: true })
  try {
    const rows = await totals()
    return NextResponse.json({ ok: true, frozen: false, total: rows.reduce((n, r) => n + r.votes, 0), rows }, { headers: { 'Cache-Control': 'public, max-age=60' } })
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 })
  }
}
