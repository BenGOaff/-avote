import { UI_COPY } from '@/lib/copy'

/** Page de dons (Buy Me a Coffee) : simple lien sortant, aucun script ni widget tiers chargé par le site. */
export const DONATE_URL = 'https://buymeacoffee.com/cavote'

const t = UI_COPY.donate

/** Encadré de soutien, aux endroits où le site vient de rendre service. */
export function DonateCard({ lead }: { lead?: string }) {
  return (
    <aside className="card donate" aria-label={t.title}>
      <p className="donate__title">{t.title}</p>
      <p className="donate__text">{lead ?? t.text}</p>
      <a className="btn btn--highlight" href={DONATE_URL} rel="noopener" target="_blank">
        {t.cta}
      </a>
    </aside>
  )
}

/** Lien discret, pour le pied de page et les fins de page. */
export function DonateLink({ label = t.short }: { label?: string }) {
  return (
    <a href={DONATE_URL} rel="noopener" target="_blank">
      {label}
    </a>
  )
}
