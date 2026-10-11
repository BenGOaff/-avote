/**
 * Quiz flash (/quiz/flash/<slug>) : quelques questions sur les clichés de la vie politique, jamais sur des opinions.
 * Chaque tribu est traitée pareil : mêmes règles, même ton, un chiffre vrai et sourcé qui bouscule ses certitudes.
 * Les réponses et le score restent dans le navigateur ; l'image de résultat est dessinée sur l'appareil.
 */
import { z } from 'zod'
import { SourceSchema } from './content-schema'

const AnswerSchema = z.object({
  label: z.string().min(1).max(140),
  /** Mode « score » : 0, 1 ou 2 points */
  points: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional(),
  /** Mode « profil » : clé du résultat vers lequel penche la réponse */
  outcome: z.string().optional(),
  /** Mode « connaissances » : la bonne réponse */
  correct: z.boolean().optional(),
})

const TierSchema = z.object({
  upTo: z.number().int().min(0).max(100),
  headline: z.string().min(5).max(90),
  line: z.string().min(5).max(220),
})
const AvatarSchema = z.string().regex(/^\/img\/quiz\/[a-z0-9-]+\.(png|webp)$/)
const OutcomeSchema = z.object({
  key: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(60),
  headline: z.string().min(5).max(90),
  line: z.string().min(5).max(260),
  /** Personnage inventé du résultat (public/img/quiz/<nom>.webp) */
  avatar: AvatarSchema.optional(),
})

/**
 * Trois sortes de quiz flash :
 *  - « score » : un pourcentage d'appartenance à une tribu (« 72 % facho ») ;
 *  - « profil » : la réponse la plus choisie désigne un résultat (« Tu es Bercy ») ;
 *  - « connaissances » : des questions à bonne réponse, expliquées une à une.
 */
export const FlashQuizSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9-]+$/),
    mode: z.enum(['score', 'profil', 'connaissances']).default('score'),
    title: z.string().min(5).max(70),
    /** Ce qui suit le score : la tribu (« facho »), ou l'unité (« bonnes réponses ») */
    tribe: z.string().min(2).max(30).optional(),
    lede: z.string().min(10).max(220),
    order: z.number().int(),
    questions: z
      .array(
        z.object({
          q: z.string().min(5).max(200),
          answers: z.array(AnswerSchema).min(2).max(6),
          explain: z.string().min(5).max(260).optional(),
        }),
      )
      .min(5)
      .max(12),
    /** Paliers de résultat (modes score et connaissances), du plus bas au plus haut ; `{s}` score, `{c}` bonnes réponses, `{n}` questions */
    tiers: z.array(TierSchema).min(3).optional(),
    outcomes: z.array(OutcomeSchema).min(2).optional(),
    /** Le vrai chiffre : un cliché confronté à une donnée officielle */
    fact: z
      .object({
        cliche: z.string().min(5).max(120),
        text: z.string().min(20).max(600),
        sources: z.array(SourceSchema).min(1),
      })
      .optional(),
    /** Avatar facultatif (public/img/quiz/<slug>.webp), personnage inventé */
    avatar: AvatarSchema.optional(),
  })
  .superRefine((q, ctx) => {
    const bad = (message: string) => ctx.addIssue({ code: 'custom', message })
    if (q.mode !== 'profil' && !q.tiers) bad('paliers obligatoires')
    if (q.mode !== 'profil' && !q.tribe) bad('libellé du score obligatoire')
    if (q.mode === 'profil') {
      const keys = new Set((q.outcomes ?? []).map((o) => o.key))
      if (keys.size < 2) bad('au moins deux résultats')
      q.questions.forEach((x, i) => x.answers.forEach((a) => !keys.has(a.outcome ?? '') && bad(`question ${i + 1} : résultat inconnu « ${a.outcome} »`)))
    }
    if (q.mode === 'connaissances') q.questions.forEach((x, i) => x.answers.filter((a) => a.correct).length !== 1 && bad(`question ${i + 1} : une seule bonne réponse`))
    if (q.mode === 'score') q.questions.forEach((x, i) => x.answers.some((a) => a.points === undefined) && bad(`question ${i + 1} : points manquants`))
  })
export type FlashQuiz = z.infer<typeof FlashQuizSchema>
