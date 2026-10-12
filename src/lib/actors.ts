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
  /** Pourquoi la candidature s'arrête (« Battu à la primaire… »), sinon « Candidature retirée » */
  retiredReason?: string
  addedBy?: string
  /** Sites officiels : campagne, parti, programme */
  links?: { kind: 'campagne' | 'parti' | 'programme'; url: string }[]
}

export function getAnnouncedActors(): AnnouncedActor[] {
  return (candidatures.actors as AnnouncedActor[]).filter((a) => a.verified !== false).sort((a, b) => a.name.localeCompare(b.name, 'fr'))
}

/** Candidatures en cours : un candidat retiré ou battu à une primaire sort aussitôt du test, des listes et des quiz. */
export const getActiveActors = () => getAnnouncedActors().filter((a) => a.status !== 'retire')

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
