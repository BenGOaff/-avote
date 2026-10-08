import type { Metadata } from 'next'
import { Studio } from './Studio'

export const metadata: Metadata = {
  title: 'Studio — fonds d’écran et visuels pour la présidentielle 2027',
  description: 'Crée un fond d’écran, une photo de profil ou un visuel carré, story ou paysage. Tout est fabriqué sur ton téléphone, rien n’est envoyé.',
  alternates: { canonical: '/studio' },
}

export default function StudioPage() {
  return (
    <div className="container" style={{ paddingTop: 'var(--s6)' }}>
      <p className="kicker">Studio</p>
      <h1>Fabrique ton visuel</h1>
      <p className="lede">Fond d’écran, photo de profil, post ou story. L’image est dessinée sur ton appareil ; ni ton texte ni ta photo ne quittent ton téléphone.</p>
      <Studio />
    </div>
  )
}
