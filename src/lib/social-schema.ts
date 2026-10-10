/**
 * Publications pour les réseaux sociaux (content/social/*.json), écrites par scripts/social-plan.ts.
 * Chaque publication a sa page (/social/<id>) et son visuel (/social/<id>/opengraph-image), aux couleurs du site.
 * Partagé entre le site et les scripts : aucune dépendance serveur ici.
 */
import { z } from 'zod'

export const SOCIAL_KINDS = ['pepite', 'fracture', 'flash', 'rendez-vous'] as const

export const SocialPostSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  /** Heure de publication prévue (ISO) : rien ne part avant */
  at: z.string(),
  kind: z.enum(SOCIAL_KINDS),
  card: z.object({
    kicker: z.string().max(40),
    title: z.string().max(110),
    line: z.string().max(180).default(''),
    /** Portrait affiché sur le visuel (un seul candidat concerné) */
    actor: z.string().optional(),
  }),
  text: z.object({
    x: z.string().max(250),
    linkedin: z.string().max(1500),
    facebook: z.string().max(900),
  }),
  /** Page du site vers laquelle la publication invite (test, urne, article…) */
  target: z.string().startsWith('/'),
  targetLabel: z.string().max(40),
  source: z
    .object({
      publisher: z.string(),
      url: z.string().url(),
      title: z.string().default(''),
      quote: z.string().default(''),
      who: z.string().default(''),
    })
    .optional(),
})

export type SocialPost = z.infer<typeof SocialPostSchema>
