import 'server-only'
import candidatures from '@content/acteurs/candidatures.json'

export interface AnnouncedActor {
  slug: string
  name: string
  party?: string
  status: 'declare' | 'demarche' | 'evoque' | 'retire'
  since: string
  source: { title: string; publisher: string; url: string }
  verified: boolean
  retiredAt?: string
  retiredSource?: { title: string; publisher: string; url: string }
  addedBy?: string
}

export function getAnnouncedActors(): AnnouncedActor[] {
  return (candidatures.actors as AnnouncedActor[]).filter((a) => a.verified !== false).sort((a, b) => a.name.localeCompare(b.name, 'fr'))
}

export function getActor(slug: string): AnnouncedActor | undefined {
  return getAnnouncedActors().find((a) => a.slug === slug)
}

export const candidaturesCollectedAt = candidatures.collectedAt
export const pendingVerificationCount = (candidatures.actors as AnnouncedActor[]).filter((a) => !a.verified).length

export const STATUS_LABEL: Record<AnnouncedActor['status'], string> = {
  declare: 'Candidature annoncée',
  demarche: 'Démarche annoncée',
  evoque: 'Évoqué',
  retire: 'Candidature retirée',
}
