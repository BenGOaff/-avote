import { describe, expect, it } from 'vitest'
import { canonicalUrl, isFullName, isRefusedSource, numbersAreSourced, parseFeed, quoteIsInSource, sameCandidate, styleViolations, stripHtml } from './veille-lib'

const feed = { id: 'f', name: 'Flux', url: 'https://x', kind: 'media' }

describe('veille', () => {
  it('lit un flux RSS et nettoie le HTML', () => {
    const xml = `<?xml version="1.0"?><rss><channel><item><title><![CDATA[Le <b>budget</b> adopté]]></title><link>https://ex.fr/a?utm_source=rss</link><description>&lt;p&gt;Texte &amp; détails&lt;/p&gt;</description><pubDate>Wed, 08 Oct 2026 08:00:00 GMT</pubDate></item></channel></rss>`
    const items = parseFeed(xml, feed)
    expect(items).toHaveLength(1)
    expect(items[0]!.title).toBe('Le budget adopté')
    expect(items[0]!.link).toBe('https://ex.fr/a')
    expect(items[0]!.summary).toBe('Texte & détails')
    expect(items[0]!.date).toBe('2026-10-08T08:00:00.000Z')
  })

  it('lit un flux Atom', () => {
    const xml = `<feed><entry><title>Titre</title><link rel="alternate" href="https://ex.fr/b"/><summary>Résumé</summary><updated>2026-10-08T10:00:00Z</updated></entry></feed>`
    expect(parseFeed(xml, feed)[0]!.link).toBe('https://ex.fr/b')
  })

  it('refuse les liens non http', () => {
    expect(canonicalUrl('javascript:alert(1)')).toBeNull()
  })

  it('vérifie les citations et les nombres', () => {
    const src = 'Le gouvernement annonce 3,5 milliards pour l’hôpital en 2027.'
    expect(quoteIsInSource('annonce 3,5 milliards pour l’hôpital', src)).toBe(true)
    expect(quoteIsInSource('annonce 4 milliards', src)).toBe(false)
    expect(numbersAreSourced('3,5 milliards en 2027', src)).toEqual([])
    expect(numbersAreSourced('12 milliards', src)).toEqual(['12'])
  })

  it('repère les tics interdits', () => {
    expect(styleViolations('Ce n’est pas une réforme, c’est un aveu.')).not.toHaveLength(0)
    expect(styleViolations('La dépense est annoncée. Le financement reste à préciser.')).toHaveLength(0)
    expect(stripHtml('<script>x</script>ok')).toBe('ok')
  })

  it('décode les lettres accentuées nommées', () => {
    expect(stripHtml('ch&ocirc;meur, &Eacute;tat, &ecirc;tre, na&iuml;f, c&oelig;ur, &eacute;t&eacute;')).toBe('chômeur, État, être, naïf, cœur, été')
  })

  it('reconnaît un candidat déjà suivi sous un autre libellé', () => {
    const actors = [{ slug: 'eric-zemmour' }, { slug: 'marine-le-pen' }, { slug: 'dominique-de-villepin' }]
    expect(sameCandidate(actors, 'Zemmour')?.slug).toBe('eric-zemmour')
    expect(sameCandidate(actors, 'Éric Zemmour')?.slug).toBe('eric-zemmour')
    expect(sameCandidate(actors, 'Villepin')?.slug).toBe('dominique-de-villepin')
    expect(sameCandidate(actors, 'Marion Maréchal-Le Pen')).toBeUndefined()
    expect(sameCandidate(actors, 'Sarah Knafo')).toBeUndefined()
    expect(isFullName('Zemmour')).toBe(false)
    expect(isFullName('Sarah Knafo')).toBe(true)
  })
})

describe('isRefusedSource', () => {
  it('refuse les autres tests électoraux et Wikipédia, pas les sites des candidats', () => {
    expect(isRefusedSource('https://monvote2027.fr/candidat/philippe')).toBe(true)
    expect(isRefusedSource('https://votons-2027.fr/candidats/retailleau/programme')).toBe(true)
    expect(isRefusedSource('https://fr.wikipedia.org/wiki/Test')).toBe(true)
    expect(isRefusedSource('https://www.avecretailleau.fr/projet/faq')).toBe(false)
    expect(isRefusedSource('https://www.lutte-ouvriere.org/journal/article/2022-04-06-nathalie-arthaud-la-lutte-de-classe-est-notre-boussole_251898.html')).toBe(false)
  })
})
