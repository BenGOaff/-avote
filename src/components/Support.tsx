/**
 * Mention de soutien (charte : espace commercial explicite, jamais dans une explication méthodologique).
 * Lien marqué « sponsored » pour les moteurs de recherche ; aucun paramètre ne transporte de donnée personnelle.
 */
const TIQUIZ = 'https://tiquiz.fr/'

export const tiquizHref = (placement: string) => `${TIQUIZ}?utm_source=cavote&utm_medium=referral&utm_campaign=soutien&utm_content=${encodeURIComponent(placement)}`

export function SupportLine({ placement, made = false }: { placement: string; made?: boolean }) {
  return (
    <p className="small muted" style={{ margin: 'var(--s5) 0 0' }}>
      {made ? 'Quiz créé avec Tiquiz.' : 'Ça vote ? est soutenu par Tiquiz.'}{' '}
      <a href={tiquizHref(placement)} rel="sponsored noopener" target="_blank">
        Crée tes propres quiz
      </a>
    </p>
  )
}
