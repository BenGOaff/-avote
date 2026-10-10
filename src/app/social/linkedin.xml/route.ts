import { socialFeed } from '@/lib/social-feed'

export const dynamic = 'force-static'

export function GET() {
  return socialFeed('linkedin')
}
