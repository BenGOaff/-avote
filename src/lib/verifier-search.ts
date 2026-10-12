/**
 * Recherche du vérificateur (/verifier) : fonctions pures, sans réseau, testées dans verifier-search.test.ts.
 * Index BM25 en mémoire sur nos propres sources (intox démontées, citations des candidats, brèves, faits officiels,
 * propriétaires des médias). Aucune question n'est conservée.
 */

export type PassageKind = 'intox' | 'position' | 'brief' | 'fait' | 'media' | 'candidature'

export const VERDICTS = ['oui', 'non', 'plus-complique', 'pas-verifie', 'opinion'] as const
export type Verdict = (typeof VERDICTS)[number]

/** Réponse de /api/verifier. « ia » : verdict rédigé et contrôlé ; « sources » : passages seuls ; « rien » : rien chez nous. */
export interface VerifierResult {
  mode: 'ia' | 'sources' | 'rien'
  verdict?: Verdict
  answer?: string
  quote?: string
  /** `excerpt` : début du passage, quand il n'y a pas de verdict rédigé */
  sources: { kind: PassageKind; title: string; publisher: string; url: string; date?: string; excerpt?: string }[]
  /** Pourquoi il n'y a pas de verdict : pas encore branché, quota du jour atteint, réponse écartée par nos contrôles */
  why?: 'off' | 'pause' | 'controle'
}

export interface Passage {
  id: string
  kind: PassageKind
  /** Texte cherché et transmis au modèle */
  text: string
  title: string
  publisher: string
  url: string
  date?: string
}

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[“”«»"’']/g, ' ')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const STOP = new Set(
  (
    'a ai au aux avec ce ces cet cette ca c d de des du elle en est et etait il ils je l la le les leur lui ma mais me meme mes mon ' +
    'n ne ni nos notre nous on ou par pas pour qu que qui quoi quel quelle quels quelles s sa sans se ses son sont sur t ta te tes ton tu ' +
    'un une vos votre vous y vrai vraie faux fausse cest dit dire veut veulent fait faire ete etre avoir ' +
    'plus moins tres tout tous toute toutes si comme dans entre aussi bien quand depuis vers chez selon'
  ).split(' '),
)

/** Racine grossière : assez pour rapprocher « retraite » et « retraites », « immigration » et « immigrés ». */
const stem = (w: string) => (w.length > 6 ? w.slice(0, 6) : w.replace(/s$/, ''))

export function terms(s: string): string[] {
  return normalize(s)
    .split(' ')
    .filter((w) => w.length > 1 && !STOP.has(w))
    .map(stem)
}

export interface Index {
  passages: Passage[]
  docTerms: Map<string, number>[]
  lengths: number[]
  avgLen: number
  df: Map<string, number>
}

export function buildIndex(passages: Passage[]): Index {
  const docTerms = passages.map((p) => {
    const m = new Map<string, number>()
    for (const t of terms(p.text)) m.set(t, (m.get(t) ?? 0) + 1)
    return m
  })
  const lengths = docTerms.map((m) => [...m.values()].reduce((a, b) => a + b, 0))
  const df = new Map<string, number>()
  for (const m of docTerms) for (const t of m.keys()) df.set(t, (df.get(t) ?? 0) + 1)
  return { passages, docTerms, lengths, avgLen: lengths.reduce((a, b) => a + b, 0) / Math.max(1, lengths.length), df }
}

export interface Hit {
  passage: Passage
  score: number
  /** Termes distincts de la question trouvés dans le passage */
  matched: number
}

/** Une intox démontée passe devant à pertinence égale : c'est la base que le vérificateur doit explorer d'abord. */
const KIND_BOOST: Record<PassageKind, number> = { intox: 1.3, fait: 1.15, position: 1, brief: 1, media: 1, candidature: 1 }

export function search(index: Index, query: string, k = 8): { hits: Hit[]; queryTerms: number } {
  const q = [...new Set(terms(query))]
  const N = index.passages.length
  const hits: Hit[] = []
  index.docTerms.forEach((m, i) => {
    let score = 0
    let matched = 0
    for (const t of q) {
      const f = m.get(t)
      if (!f) continue
      matched++
      const n = index.df.get(t) ?? 0
      const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5))
      score += (idf * f * 2.2) / (f + 1.2 * (0.25 + 0.75 * (index.lengths[i]! / index.avgLen)))
    }
    if (matched) hits.push({ passage: index.passages[i]!, score: score * KIND_BOOST[index.passages[i]!.kind], matched })
  })
  hits.sort((a, b) => b.score - a.score)
  return { hits: hits.slice(0, k), queryTerms: q.length }
}

/** Assez proche pour mériter une réponse : au moins deux termes de la question (un seul si elle n'en a qu'un). */
export const isRelevant = (h: Hit | undefined, queryTerms: number) => !!h && h.matched >= Math.min(2, queryTerms)

/** Tout nombre de la réponse doit figurer dans les passages cités (pas de chiffre inventé). */
export function unsourcedNumbers(answer: string, sources: string): string[] {
  const nums = (s: string) => (s.match(/\d+(?:[.,]\d+)?/g) ?? []).map((n) => n.replace(',', '.').replace(/^0+(?=\d)/, ''))
  const allowed = new Set(nums(sources.replace(/(\d)[\s  ](?=\d{3}\b)/g, '$1')))
  return nums(answer.replace(/(\d)[\s  ](?=\d{3}\b)/g, '$1')).filter((n) => !allowed.has(n))
}

/** La citation doit figurer mot pour mot (à la normalisation près) dans un passage cité. */
export const quoteIn = (quote: string, text: string) => {
  const q = normalize(quote)
  return q.length >= 12 && normalize(text).includes(q)
}
