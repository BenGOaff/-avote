import type { FlashQuizFull } from './flash'
import { UI_COPY } from './copy'

const t = UI_COPY.flash

/** Catégorie d'un quiz flash sur la page des quiz */
export type FlashCat = 'score' | 'profil' | 'connaissances'
export const catOf = (q: FlashQuizFull): FlashCat => (q.mode === 'partis' ? 'profil' : q.mode)

/** Avant-goût du résultat, pour donner envie de jouer : quelques visages des résultats possibles, ou l'échelle du score. */
export function teaserOf(q: FlashQuizFull): { avatars: string[]; text: string } {
  if (q.mode === 'profil') {
    const outs = q.outcomes ?? []
    return { avatars: outs.flatMap((o) => (o.avatar ? [o.avatar] : [])).slice(0, 3), text: t.teaserProfil(outs.length) }
  }
  if (q.mode === 'partis') return { avatars: [], text: t.teaserParties(q.parties?.length ?? 0) }
  if (q.mode === 'connaissances') return { avatars: [], text: t.teaserKnow(q.questions.length) }
  return { avatars: [], text: t.teaserScore(q.tribe ?? '') }
}
