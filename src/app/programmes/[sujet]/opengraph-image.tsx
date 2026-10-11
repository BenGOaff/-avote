import { getSujet, getSujets } from '@/lib/sujets'
import { sujetImage } from '@/lib/sujet-card'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Programmes 2027 : qui est pour, qui est contre'

export function generateStaticParams() {
  return getSujets().map((s) => ({ sujet: s.slug }))
}

// Aperçu de lien (Open Graph) ; le visuel portrait est /programmes/<sujet>/carte.png
export default async function Image({ params }: { params: Promise<{ sujet: string }> }) {
  const { sujet } = await params
  const s = getSujet(sujet)
  if (!s) return new Response('Sujet inconnu', { status: 404 })
  return sujetImage(s, 'apercu')
}
