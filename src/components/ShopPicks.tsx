import boutique from '@content/boutique.json'
import { LEGAL } from '@/lib/legal'
import { UI_COPY } from '@/lib/copy'

/**
 * Trois produits de la boutique, en vignettes, avec un lien direct vers Spreadshop. Aucun script tiers : les images
 * sont servies par le site. Le choix dépend de `seed` (une page = toujours les mêmes produits, rendu identique côté
 * serveur et navigateur).
 * `designs` ajoute un lien par camp. L'ordre ne dépend jamais d'une réponse : alphabétique, sauf sur un quiz dont le
 * sujet est un camp (`quiz`), où ce camp passe devant. Le lien ne dit donc rien du résultat de la personne.
 */

interface Design {
  id: string
  label: string
  url: string
  apercu?: string
  quizzes?: string[]
}

const { apercus, designs: DESIGNS } = boutique as { apercus: { id: string; alt: string }[]; designs: Design[] }
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

/** Lien d'un aperçu : la page de son motif s'il en a une, sinon l'accueil de la boutique */
export const apercuUrl = (id: string) => DESIGNS.find((d) => d.apercu === id)?.url ?? shop.url

const byLabel = [...DESIGNS].sort((a, b) => a.label.localeCompare(b.label, 'fr'))
const designsFor = (quiz?: string) => {
  const own = quiz ? byLabel.filter((d) => d.quizzes?.includes(quiz)) : []
  return [...own, ...byLabel.filter((d) => !own.includes(d))]
}

export function ShopPicks({
  seed,
  text = UI_COPY.boutiqueLink.quiz,
  count = 3,
  designs = false,
  quiz,
}: {
  seed: string
  text?: string
  count?: number
  designs?: boolean
  quiz?: string
}) {
  if (!shop.open || apercus.length === 0) return null
  const items = pick(seed, count)
  return (
    <aside className="shop-picks card section">
      <p style={{ margin: 0 }}>{text}</p>
      <ul className="shop-picks__list">
        {items.map((a) => (
          <li key={a.id}>
            <a href={apercuUrl(a.id)} rel="noopener">
              <img src={`/img/boutique/${a.id}.webp`} alt={a.alt} width={640} height={640} loading="lazy" />
            </a>
          </li>
        ))}
      </ul>
      {designs && DESIGNS.length > 0 && (
        <nav aria-label={UI_COPY.boutiqueLink.designs} style={{ width: '100%' }}>
          <p className="small muted" style={{ margin: '0 0 var(--s2)' }}>
            {UI_COPY.boutiqueLink.designs}
          </p>
          <ul className="flash-cats">
            {designsFor(quiz).map((d) => (
              <li key={d.id}>
                <a className="flash-cats__chip" href={d.url} rel="noopener">
                  {d.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <a className="btn btn--secondary" href={shop.url} rel="noopener">
        {UI_COPY.boutiqueLink.quizCta}
      </a>
    </aside>
  )
}

/** Sélection « à offrir » de la boutique : six produits, tirés de la même façon */
export const giftPicks = (seed: string) => pick(seed, 6)
