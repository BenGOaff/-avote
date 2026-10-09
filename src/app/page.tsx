import Link from 'next/link'
import { UI_COPY } from '@/lib/copy'
import { getArticles, getBriefs, getVeilleStatus } from '@/lib/content'
import { getAnnouncedActors } from '@/lib/actors'
import { liveCorpus, questionnaire } from '@/lib/data'
import { ArticleCard, BriefItem } from '@/components/Editorial'
import { VeilleState } from '@/components/VeilleState'
import { NewsletterForm } from '@/components/NewsletterForm'
import { ExampleResult } from '@/components/ExampleResult'
import { TestFlow } from './test/TestFlow'
import { SupportLine } from '@/components/Support'
import { DonateCard } from '@/components/Donate'
import { getPartis } from '@/lib/partis'


export const revalidate = 1800

export default function HomePage() {
  const briefs = getBriefs().slice(0, 6)
  const articles = getArticles().slice(0, 3)
  const actors = getAnnouncedActors()
  const known = Object.values(liveCorpus.positions as Record<string, Record<string, { missing?: boolean }>>).reduce(
    (n, p) => n + Object.values(p).filter((x) => !x.missing).length,
    0,
  )
  const h = UI_COPY.home
  return (
    <>
      {/* L'accueil s'ouvre directement sur le test complet */}
      <section className="container" style={{ paddingTop: 'var(--s5)' }} aria-label="Le test">
        <TestFlow />
        <SupportLine placement="accueil-test" />
      </section>

      <section className="section container" aria-labelledby="preuves">
        <h2 id="preuves">{h.proofTitle}</h2>
        <div className="figures figures--compact" role="list">
          <p className="figure" role="listitem">
            <span className="figure__num">{actors.length}</span>
            <span className="figure__label">candidatures suivies</span>
          </p>
          <p className="figure" role="listitem">
            <span className="figure__num">{known}</span>
            <span className="figure__label">positions citées mot pour mot</span>
          </p>
          <p className="figure" role="listitem">
            <span className="figure__num">0</span>
            <span className="figure__label">réponse envoyée à nos serveurs</span>
          </p>
        </div>
        <ul className="proofs">
          {h.proofs.map((x) => (
            <li key={x.href} className="proofs__item">
              <strong>{x.title}</strong>
              <span>{x.text}</span>
              <Link href={x.href}>{x.link}</Link>
            </li>
          ))}
        </ul>
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

      <section className="section container" aria-labelledby="explorer">
        <h2 id="explorer">Explorer</h2>
        <div className="grid grid--2">
          <div className="card card--flat">
            <h3>Les candidats</h3>
            <p className="muted">
              {actors.length > 0 ? `${actors.length} candidatures annoncées : d’où ils viennent, ce qu’ils proposent, avec les sources.` : 'La liste des candidatures annoncées arrive.'}
            </p>
            <Link href="/candidats">Voir les candidats</Link>
          </div>
          <div className="card card--flat">
            <h3>Les partis</h3>
            <p className="muted">{getPartis().length} partis : d’où ils viennent, qui les dirige, combien d’élus, ce qu’ils proposent.</p>
            <Link href="/partis">Voir les partis</Link>
          </div>
          <div className="card card--flat">
            <h3>L’urne</h3>
            <p className="muted">Tu sais déjà pour qui tu votes ? Glisse ton bulletin, anonyme, et regarde le dépouillement.</p>
            <Link href="/urne">Aller voter</Link>
          </div>
          <div className="card card--flat">
            <h3>Qui possède ton info</h3>
            <p className="muted">Les propriétaires des médias, leurs engagements, et les chaînes rappelées à l’ordre par l’Arcom.</p>
            <Link href="/medias">Voir qui possède quoi</Link>
          </div>
          <div className="card card--flat">
            <h3>Comment voter</h3>
            <p className="muted">Inscription avant le 6e vendredi, pièce d’identité, procuration : le mode d’emploi du 18 avril 2027.</p>
            <Link href="/radar/2026-10-08-comment-voter">Lire le mode d’emploi</Link>
          </div>
        </div>
      </section>

      <section className="container">
        <DonateCard />
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
