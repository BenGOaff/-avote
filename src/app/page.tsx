import Link from 'next/link'
import { UI_COPY } from '@/lib/copy'
import { getArticles, getBriefs, getVeilleStatus } from '@/lib/content'
import { getAnnouncedActors } from '@/lib/actors'
import { questionnaire } from '@/lib/data'
import { ArticleCard, BriefItem } from '@/components/Editorial'
import { VeilleState } from '@/components/VeilleState'
import { NewsletterForm } from '@/components/NewsletterForm'
import { ExampleResult } from '@/components/ExampleResult'

export const revalidate = 1800

export default function HomePage() {
  const briefs = getBriefs().slice(0, 6)
  const articles = getArticles().slice(0, 3)
  const actors = getAnnouncedActors()
  return (
    <>
      <section className="hero container">
        <p className="kicker">Présidentielle 2027</p>
        <h1>{UI_COPY.home.title}</h1>
        <p className="lede">{UI_COPY.home.lede}</p>
        <div className="hero__cta">
          <Link className="btn btn--highlight" href="/test">
            {UI_COPY.home.cta}
          </Link>
          <Link className="btn btn--secondary" href="/radar">
            {UI_COPY.home.ctaSecondary}
          </Link>
        </div>
        <p className="hint" style={{ marginTop: 'var(--s3)' }}>
          {UI_COPY.home.duration}
        </p>
      </section>

      <section className="section container">
        <div className="grid grid--2" style={{ alignItems: 'start' }}>
          <div>
            <h2>Ce que tu obtiens</h2>
            <p>
              D’abord un résumé de ce que tu as répondu, thème par thème. Ensuite, pour chaque candidat dont les positions sont documentées, une
              proximité sur 100, ce qu’il manque pour la calculer et les passages des programmes qui la justifient.
            </p>
            <p>
              Pas de podium quand les données ne permettent pas de comparer. Et les sujets sur lesquels personne ne s’est prononcé restent marqués
              comme tels.
            </p>
            <p>
              <Link href="/methodologie">Voir le calcul exact</Link>
            </p>
          </div>
          <ExampleResult />
        </div>
      </section>

      <section className="section container" aria-labelledby="radar-titre">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h2 id="radar-titre" style={{ margin: 0 }}>
            Le Radar
          </h2>
          <Link href="/radar">Tout le fil</Link>
        </div>
        <div className="grid grid--2" style={{ marginTop: 'var(--s5)', alignItems: 'start' }}>
          <div>
            {briefs.length > 0 ? (
              <ul className="feed">
                {briefs.map((b) => (
                  <BriefItem key={b.slug} b={b} />
                ))}
              </ul>
            ) : (
              <VeilleState status={getVeilleStatus()} briefCount={0} />
            )}
          </div>
          <div className="stack">
            {articles.map((a, i) => (
              <ArticleCard key={a.slug} a={a} featured={i === 0} />
            ))}
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="grid grid--3">
          <div className="card card--flat">
            <h3>Les candidatures</h3>
            <p className="muted">
              {actors.length > 0
                ? `${actors.length} candidatures annoncées, chacune avec sa source.`
                : 'La liste des candidatures annoncées arrive.'}
            </p>
            <Link href="/candidats">Voir la liste</Link>
          </div>
          <div className="card card--flat">
            <h3>{questionnaire.items.length} questions, 7 thèmes</h3>
            <p className="muted">Chaque question vient avec une explication courte. « Je ne sais pas » est une vraie réponse, pas un zéro.</p>
            <Link href="/methodologie#questions">Lire les questions</Link>
          </div>
          <div className="card card--flat">
            <h3>Le studio</h3>
            <p className="muted">Fonds d’écran, photo de profil, visuels carrés ou stories. Fabriqués sur ton téléphone, sans envoi.</p>
            <Link href="/studio">Créer un visuel</Link>
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="narrow" style={{ margin: 0 }}>
          <h2>La campagne dans ta boîte mail</h2>
          <p>Une lettre courte : ce qui a bougé, ce qui a été promis, ce qui a été corrigé. Elle n’a aucun lien avec tes réponses au test, qui ne nous parviennent jamais.</p>
          <NewsletterForm />
        </div>
      </section>
    </>
  )
}
