import { getSujet, getSujets } from '@/lib/sujets'
import { sujetImage } from '@/lib/sujet-card'

export const dynamic = 'force-static'

export function generateStaticParams() {
  return getSujets().map((s) => ({ sujet: s.slug }))
}

/** Visuel portrait 1080 × 1350 d'un sujet : partage (Instagram, Facebook, LinkedIn, Pinterest) et Google Images. */
export async function GET(_req: Request, { params }: { params: Promise<{ sujet: string }> }) {
  const { sujet } = await params
  const s = getSujet(sujet)
  if (!s) return new Response('Sujet inconnu', { status: 404 })
  return sujetImage(s, 'carte')
}
