/**
 * HUMOR_VARIANTS — remarques facultatives des cartes miroir (charte §19, cahier §4.2, §5.5).
 * Règles locales, explicites, auditables. Aucune n'appelle de service distant.
 * Elles ne prétendent jamais démontrer une contradiction : elles constatent les réponses.
 * Retirées en mode sobre.
 */
import type { Answers, Ordinal } from './engine/types'

const v = (a: Answers, id: string): Ordinal | null => {
  const x = a[id]
  return x && x.kind === 'value' ? x.value : null
}

export interface MirrorRemark {
  /** Constat factuel, toujours affiché */
  fact?: string
  /** Variante humoristique, masquée en mode sobre */
  humor?: string
}

export function mirrorRemark(themeId: string, itemIds: string[], answers: Answers): MirrorRemark {
  const values = itemIds.map((id) => v(answers, id)).filter((x): x is Ordinal => x !== null)

  if (themeId === 'travail') {
    const hosp = v(answers, 'tra-02')
    const dette = v(answers, 'eco-03')
    if (hosp !== null && dette !== null && hosp >= 1 && dette >= 1)
      return {
        fact: 'Tu veux renforcer l’hôpital et faire passer la réduction de la dette avant les nouvelles dépenses. Les programmes devront dire comment ils financent le premier.',
        humor: 'Le tableur vient de s’asseoir à côté de toi.',
      }
  }

  if (themeId === 'eco') {
    const top = v(answers, 'eco-01')
    const cotis = v(answers, 'eco-05')
    if (top !== null && cotis !== null && top >= 1 && cotis >= 1)
      return {
        fact: 'Tu veux que les plus hauts revenus paient davantage et que les employeurs paient moins de cotisations. Ce sont deux leviers distincts ; leur effet dépendra des montants.',
      }
  }

  if (values.length >= 4 && values.every((x) => x === 0))
    return { humor: 'Que des positions intermédiaires. Le milieu est un endroit où l’on peut très bien habiter.' }

  if (values.length >= 4 && values.every((x) => Math.abs(x) === 2)) return { humor: 'Pas beaucoup de nuances sur ce chapitre. Ça a le mérite d’être clair.' }

  const missing = itemIds.length - values.length
  if (missing >= 3)
    return {
      fact: `Tu as passé ou laissé en suspens ${missing} questions ici. Tu peux y revenir à tout moment, les explications restent disponibles.`,
    }

  return {}
}
