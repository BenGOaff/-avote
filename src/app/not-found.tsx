import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container narrow" style={{ paddingTop: 'var(--s8)', margin: '0 auto' }}>
      <p className="kicker">Erreur 404</p>
      <h1>Cette page n’existe pas.</h1>
      <p>Le lien est peut-être ancien, ou mal recopié. Le reste du site est là.</p>
      <div className="row">
        <Link className="btn" href="/">
          Accueil
        </Link>
        <Link className="btn btn--secondary" href="/radar">
          Le Radar
        </Link>
      </div>
    </div>
  )
}
