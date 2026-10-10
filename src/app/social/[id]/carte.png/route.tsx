import { getSocialPost, getSocialPosts } from '@/lib/social'
import { socialImage } from '@/lib/social-card'

export const dynamic = 'force-static'

export function generateStaticParams() {
  return getSocialPosts().map((p) => ({ id: p.id }))
}

/** Visuel portrait 1080 × 1350 publié sur Instagram, Facebook, LinkedIn et X. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const p = getSocialPost(id)
  if (!p) return new Response('Publication inconnue', { status: 404 })
  return socialImage(p, 'carte')
}
