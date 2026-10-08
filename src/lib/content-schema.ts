/** Schémas des contenus éditoriaux, partagés par le site et les scripts. */
import { z } from 'zod'

export const SourceSchema = z.object({
  title: z.string().min(1),
  publisher: z.string().min(1),
  url: z.string().url().refine((u) => /^https?:\/\//.test(u), 'URL http(s) attendue'),
  date: z.string().optional(),
  passage: z.string().optional(),
})
export type SourceRef = z.infer<typeof SourceSchema>

export const CorrectionSchema = z.object({ date: z.string(), text: z.string() })

export const ArticleSchema = z.object({
  title: z.string().min(5).max(140),
  dek: z.string().min(10).max(320),
  type: z.enum(['satire', 'decryptage', 'promesse', 'avant-apres', 'cout', 'competence']),
  date: z.string(),
  updated: z.string().optional(),
  status: z.enum(['draft', 'published']),
  topics: z.array(z.string()).default([]),
  actors: z.array(z.string()).default([]),
  facts: z.array(z.string()).default([]),
  cannotConclude: z.array(z.string()).default([]),
  affectsScore: z.boolean().default(false),
  sources: z.array(SourceSchema).min(1),
  corrections: z.array(CorrectionSchema).default([]),
  generatedBy: z.string().optional(),
  reviewedBy: z.string().optional(),
})
export type ArticleMeta = z.infer<typeof ArticleSchema>

export const BriefSchema = z.object({
  title: z.string().min(5).max(160),
  date: z.string(),
  status: z.enum(['draft', 'published']),
  topics: z.array(z.string()).default([]),
  remark: z.string().max(220).optional(),
  source: SourceSchema,
  more: z.array(SourceSchema).default([]),
  generatedBy: z.string().optional(),
  reviewedBy: z.string().optional(),
  corrections: z.array(CorrectionSchema).default([]),
})
export type BriefMeta = z.infer<typeof BriefSchema>

