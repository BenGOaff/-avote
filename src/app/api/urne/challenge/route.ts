import { NextResponse } from 'next/server'
import { newChallenge, urneReady } from '@/lib/urne'

export const dynamic = 'force-dynamic'

export function GET() {
  if (!urneReady()) return NextResponse.json({ ok: false }, { status: 503 })
  return NextResponse.json(newChallenge(), { headers: { 'Cache-Control': 'no-store' } })
}
