import { NextResponse, type NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

/** Diagnostic temporaire : renvoie à l'appelant ses propres en-têtes d'adresse, pour choisir la source fiable. À retirer. */
export function GET(req: NextRequest) {
  const pick = ['x-forwarded-for', 'x-real-ip', 'x-client-ip', 'true-client-ip', 'cf-connecting-ip', 'x-hcdn-client-ip', 'forwarded']
  return NextResponse.json(
    { headers: Object.fromEntries(pick.map((h) => [h, req.headers.get(h)])), names: [...req.headers.keys()].filter((k) => /ip|forward|client|hcdn/i.test(k)) },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
