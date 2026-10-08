import 'server-only'
import candidatures from '@content/acteurs/candidatures.json'

export interface AnnouncedActor {
  slug: string
  name: string
  party?: string
  status: 'declare' | 'demarche' | 'evoque'
  since: string
  source: { title: string; publisher: string; url: string }
  verified: boolean
}

const showUnverified = process.env.NODE_ENV !== 'production' && process.env.SHOW_DRAFTS === '1'

export function getAnnouncedActors(): AnnouncedActor[] {
  return (candidatures.actors as AnnouncedActor[])
    .filter((a) => a.verified || showUnverified)
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
}

export const candidaturesCollectedAt = candidatures.collectedAt
export const pendingVerificationCount = (candidatures.actors as AnnouncedActor[]).filter((a) => !a.verified).length

export const STATUS_LABEL: Record<AnnouncedActor['status'], string> = {
  declare: 'Candidature annoncée',
  demarche: 'Démarche annoncée',
  evoque: 'Évoqué',
}
