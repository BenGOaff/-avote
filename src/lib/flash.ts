/**
 * Quiz flash (/quiz/flash/<slug>) : 7 questions sur les clichés d'une tribu politique, jamais sur des opinions.
 * Chaque tribu est traitée pareil : mêmes règles, même ton, un chiffre vrai et sourcé qui bouscule ses certitudes.
 * Les réponses et le score restent dans le navigateur ; l'image de résultat est dessinée sur l'appareil.
 */
import { z } from 'zod'
import { SourceSchema } from './content-schema'

const AnswerSchema = z.object({ label: z.string().min(1).max(140), points: z.union([z.literal(0), z.literal(1), z.literal(2)]) })

export const FlashQuizSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(5).max(60),
  /** Nom de la tribu tel qu'il s'affiche dans le score (« 72 % facho ») */
  tribe: z.string().min(2).max(30),
  lede: z.string().min(10).max(200),
  order: z.number().int(),
  questions: z
    .array(z.object({ q: z.string().min(5).max(160), answers: z.array(AnswerSchema).length(3) }))
    .min(5)
    .max(10),
  /** Paliers de résultat, du plus bas au plus haut ; `{s}` est remplacé par le score */
  tiers: z
    .array(z.object({ upTo: z.number().int().min(0).max(100), headline: z.string().min(5).max(90), line: z.string().min(5).max(200) }))
    .min(3),
  /** Le vrai chiffre : un cliché de la tribu confronté à une donnée officielle */
  fact: z.object({ cliche: z.string().min(5).max(120), text: z.string().min(20).max(500), sources: z.array(SourceSchema).min(1) }),
  /** Avatar facultatif (public/img/quiz/<slug>.png), personnage inventé */
  avatar: z.string().regex(/^\/img\/quiz\/[a-z0-9-]+\.(png|webp)$/).optional(),
})
export type FlashQuiz = z.infer<typeof FlashQuizSchema>
