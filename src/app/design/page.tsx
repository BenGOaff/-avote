import type { Metadata } from 'next'
import { Logo } from '@/components/Logo'
import { ScoreBar } from '@/components/ScoreBar'

export const metadata: Metadata = { title: 'Référence de design', robots: { index: false, follow: false } }

// Page interne de référence (charte §19) : à consulter en clair, sombre et mode sobre.
const COLORS = ['paper', 'ink', 'highlight', 'correction', 'reference', 'muted', 'surface', 'line'] as const

export default function DesignPage() {
  return (
    <div className="container stack" style={{ paddingTop: 'var(--s6)' }}>
      <p className="kicker">Interne</p>
      <h1>Référence de design</h1>
      <p className="muted">Basculer thème et mode sobre avec le bouton d’affichage en haut à droite.</p>

      <h2>Logo</h2>
      <div className="row" style={{ gap: 'var(--s6)' }}>
        <Logo />
        <Logo variant="compact" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/symbole.svg" alt="Symbole" width={64} height={64} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/favicon.svg" alt="Favicon" width={32} height={32} />
      </div>

      <h2>Couleurs</h2>
      <div className="grid grid--3">
        {COLORS.map((c) => (
          <div key={c} className="card card--flat row">
            <span style={{ width: 48, height: 48, borderRadius: 6, background: `var(--${c})`, border: '1px solid var(--line)' }} />
            <code>--{c}</code>
          </div>
        ))}
      </div>

      <h2>Typographie</h2>
      <h1>Titre H1 Archivo Black</h1>
      <h2>Titre H2 Archivo Black</h2>
      <h3>Titre H3</h3>
      <p>Texte d’interface Public Sans 17 px, interligne 1,5. Chiffres tabulaires : 1 234,5 % · 74 sur 100.</p>
      <div className="prose">
        <p>Texte d’article Source Serif 4 en 19 px. « Les citations sont exactes et distinguées du commentaire. »</p>
      </div>
      <p className="annotation humor">Annotation manuscrite (masquée en mode sobre)</p>
      <p>
        Un mot <mark className="mark">surligné</mark> dans une phrase.
      </p>

      <h2>Boutons</h2>
      <div className="row">
        <button className="btn">Principal</button>
        <button className="btn btn--highlight">Mise en avant</button>
        <button className="btn btn--secondary">Secondaire</button>
        <button className="btn btn--ghost">Discret</button>
        <button className="btn" disabled>
          Désactivé
        </button>
        <button className="btn" data-loading="true">
          Chargement…
        </button>
      </div>

      <h2>Réponses</h2>
      <div className="answers narrow" style={{ margin: 0 }}>
        <button className="answer" role="radio" aria-checked="false">
          <span className="answer__check" />
          Plutôt favorable
        </button>
        <button className="answer" role="radio" aria-checked="true">
          <span className="answer__check">✓</span>
          Tout à fait favorable (sélectionné)
        </button>
      </div>

      <h2>Badges et alertes</h2>
      <div className="row">
        <span className="badge">Décryptage</span>
        <span className="badge badge--satire">Satire</span>
        <span className="badge badge--correction">Corrigé</span>
        <span className="badge badge--muted">Inconnu</span>
        <span className="badge badge--demo">Fictif</span>
      </div>
      <div className="alert alert--info">
        <p className="alert__title">Information</p>
        <p>On n’a pas trouvé de position explicite sur ce point.</p>
      </div>
      <div className="alert alert--correction">
        <p className="alert__title">Correction</p>
        <p>Nous avions attribué cette proposition au candidat. Elle vient du parti. Le dossier a été corrigé.</p>
      </div>

      <h2>Score</h2>
      <div className="card narrow" style={{ margin: 0 }}>
        <p>
          Proximité sur les sujets documentés : <strong>84 sur 100</strong>. Il manque trois positions.
        </p>
        <ScoreBar value={84} low={70} high={90} label="Exemple" />
      </div>

      <h2>Tableau</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Question</th>
              <th>Réponse</th>
              <th className="num">Poids</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Encadrement des loyers</td>
              <td>Plutôt favorable</td>
              <td className="num">2,4</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
