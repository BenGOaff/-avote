import { getSocialPost, getSocialPosts } from '@/lib/social'
import { socialImage } from '@/lib/social-card'

export const dynamic = 'force-static'

// Seules les publications connues au moment de la construction existent. Une adresse inconnue (publication pas encore
// déployée) répond 404 sans être mise en cache : sinon Cloudflare garderait ce 404 un an, et LinkedIn ou X recevraient
// « Publication inconnue » même après la mise en ligne.
export const dynamicParams = false

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
