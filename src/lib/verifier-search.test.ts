import { describe, expect, it } from 'vitest'
import { buildIndex, isRelevant, quoteIn, search, terms, unsourcedNumbers, type Passage } from './verifier-search'

// Acteurs et sources fictifs
const P = (id: string, kind: Passage['kind'], text: string): Passage => ({ id, kind, text, title: id, publisher: 'Exemple', url: `https://exemple.fr/${id}` })
const index = buildIndex([
  P('a', 'position', 'Camille Exemple. Retraites : Camille Exemple veut porter l’âge de départ à 66 ans. « Je propose 66 ans »'),
  P('b', 'position', 'Dominique Fictif. Logement : Dominique Fictif veut encadrer les loyers partout.'),
  P('c', 'intox', 'Intox démontée. Affirmation FAUSSE qui circule : « Le vote blanc annule l’élection ». En réalité : il n’est pas compté dans les suffrages exprimés.'),
])

describe('vérificateur : recherche', () => {
  it('rapproche les formes d’un même mot et ignore les mots vides', () => {
    expect(terms('Est-ce vrai que les retraites…')).toEqual(terms('retraite'))
  })
  it('trouve la déclaration du bon candidat', () => {
    const { hits, queryTerms } = search(index, 'Camille Exemple veut-elle la retraite à 66 ans ?')
    expect(hits[0]?.passage.id).toBe('a')
    expect(isRelevant(hits[0], queryTerms)).toBe(true)
  })
  it('remonte une intox démontée', () => {
    expect(search(index, 'Si on vote blanc, l’élection est annulée ?').hits[0]?.passage.id).toBe('c')
  })
  it('ne répond pas sans source proche', () => {
    const { hits, queryTerms } = search(index, 'La Terre est-elle plate ?')
    expect(isRelevant(hits[0], queryTerms)).toBe(false)
  })
})

describe('vérificateur : contrôles', () => {
  it('refuse un nombre absent des sources', () => {
    expect(unsourcedNumbers('Non, il propose 66 ans.', 'départ à 66 ans')).toEqual([])
    expect(unsourcedNumbers('Non, il propose 67 ans.', 'départ à 66 ans')).toEqual(['67'])
    expect(unsourcedNumbers('2 233 904 votes blancs', 'soit 2 233 904 votes blancs')).toEqual([])
  })
  it('exige une citation mot pour mot', () => {
    expect(quoteIn('Je propose 66 ans', index.passages[0]!.text)).toBe(true)
    expect(quoteIn('Je propose 67 ans', index.passages[0]!.text)).toBe(false)
  })
})
