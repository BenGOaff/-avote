import { getSocialPost, getSocialPosts } from '@/lib/social'
import { socialImage } from '@/lib/social-card'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Ça vote ?'

export function generateStaticParams() {
  return getSocialPosts().map((p) => ({ id: p.id }))
}

// Aperçu de lien (Open Graph) ; le visuel des fils est /social/<id>/carte.png
export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return socialImage(getSocialPost(id), 'apercu')
}
