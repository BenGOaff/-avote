import boutique from '@content/boutique.json'
import { LEGAL } from '@/lib/legal'
import { UI_COPY } from '@/lib/copy'

/**
 * Trois produits de la boutique, en vignettes, avec un lien vers la boutique intégrée (boutique.çavote.fr). Aucun
 * script tiers ici : les images sont servies par le site. Le choix dépend de `seed` (une page = toujours les mêmes
 * produits, rendu identique côté serveur et navigateur) et jamais d'une réponse : le lien ne dit rien du résultat.
 */

const { apercus } = boutique as { apercus: { id: string; alt: string }[] }
const shop = LEGAL.shop

const hash = (s: string) => {
  let h = 2166136261
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0
  return h
}

/** Mélange stable : chaque produit reçoit une note selon `seed`, on garde les premiers. Jamais de doublon. */
const pick = (seed: string, count: number) =>
  apercus
    .map((a) => ({ a, k: hash(`${seed}:${a.id}`) }))
    .sort((x, y) => x.k - y.k)
    .slice(0, count)
    .map((x) => x.a)

export function ShopPicks({ seed, text = UI_COPY.boutiqueLink.quiz, count = 3 }: { seed: string; text?: string; count?: number }) {
  if (!shop.open || apercus.length === 0) return null
  const items = pick(seed, count)
  return (
    <aside className="shop-picks card section">
      <p style={{ margin: 0 }}>{text}</p>
      <ul className="shop-picks__list">
        {items.map((a) => (
          <li key={a.id}>
            <a href={shop.url}>
              <img src={`/img/boutique/${a.id}.webp`} alt={a.alt} width={640} height={640} loading="lazy" />
            </a>
          </li>
        ))}
      </ul>
      <a className="btn btn--secondary" href={shop.url}>
        {UI_COPY.boutiqueLink.quizCta}
      </a>
    </aside>
  )
}
