import Link from 'next/link'
import { UI_COPY } from '@/lib/copy'
import { getArticles, getBriefs } from '@/lib/content'
import { getActiveActors } from '@/lib/actors'
import { liveCorpus, questionnaire } from '@/lib/data'
import { ArticleCard, BriefItem } from '@/components/Editorial'
import { NewsletterForm } from '@/components/NewsletterForm'
import { TestFlow } from './test/TestFlow'
import { SupportLine } from '@/components/Support'
import { DonateCard } from '@/components/Donate'
import { getFlashQuizzes } from '@/lib/flash-content'


export const revalidate = 1800

export default function HomePage() {
  const briefs = getBriefs().slice(0, 5)
  const articles = getArticles().slice(0, 2)
  const quizzes = getFlashQuizzes().slice(0, 3)
  const actors = getActiveActors()
  const known = Object.values(liveCorpus.positions as Record<string, Record<string, { missing?: boolean }>>).reduce(
    (n, p) => n + Object.values(p).filter((x) => !x.missing).length,
    0,
  )
  const h = UI_COPY.home
  // Questions que les gens posent aux moteurs de recherche et aux IA, avec une réponse courte et sourcée
  const faq = h.faq(questionnaire.items.length, actors.length)
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }
  return (
    <>
      {/* L'accueil s'ouvre directement sur le test complet */}
      <section className="container" style={{ paddingTop: 'var(--s5)' }} aria-label="Le test">
        <TestFlow corpusVersion={liveCorpus.version} />
        <SupportLine placement="accueil-test" />
      </section>

      {/* Trois portes : le test, les jeux, la vérification */}
      <section className="section container" aria-labelledby="portes">
        <h2 id="portes">{h.doorsTitle}</h2>
        <div className="doors">
          <div className="card door">
            <p className="kicker">{h.doors.test.kicker}</p>
            <h3>{h.doors.test.title}</h3>
            <p className="muted">{h.doors.test.text}</p>
            <ul className="door__links">
              {h.doors.test.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="card door">
            <p className="kicker">{h.doors.play.kicker}</p>
            <h3>{h.doors.play.title}</h3>
            <p className="muted">{h.doors.play.text}</p>
            <ul className="door__links">
              {quizzes.map((q) => (
                <li key={q.slug}>
                  <Link href={`/quiz/flash/${q.slug}`}>{q.title}</Link>
                </li>
              ))}
              <li>
                <Link href="/duel">{h.doors.play.duel}</Link>
              </li>
              <li>
                <Link href="/quiz">{h.doors.play.more}</Link>
              </li>
            </ul>
          </div>
          <div className="card door">
            <p className="kicker">{h.doors.check.kicker}</p>
            <h3>{h.doors.check.title}</h3>
            <p className="muted">{h.doors.check.text}</p>
            <ul className="door__links">
              {h.doors.check.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section container" aria-labelledby="radar-titre">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h2 id="radar-titre" style={{ margin: 0 }}>
            {h.radarTitle}
          </h2>
          <Link href="/radar">{h.radarAll}</Link>
        </div>
        <div className="grid grid--2" style={{ marginTop: 'var(--s5)', alignItems: 'start' }}>
          <div>
            <ul className="feed">
              {briefs.map((b) => (
                <BriefItem key={b.slug} b={b} compact />
              ))}
            </ul>
          </div>
          <div className="stack">
            {articles.map((a, i) => (
              <ArticleCard key={a.slug} a={a} featured={i === 0} />
            ))}
          </div>
        </div>
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

      <section className="section container" aria-labelledby="faq">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c') }} />
        <h2 id="faq">{h.faqTitle}</h2>
        <div className="stack">
          {faq.map((f) => (
            <details key={f.q} className="disclosure">
              <summary>{f.q}</summary>
              <div>
                <p style={{ marginTop: 0 }}>{f.a}</p>
                <Link href={f.href}>{f.link}</Link>
              </div>
            </details>
          ))}
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
