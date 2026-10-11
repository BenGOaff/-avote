import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { SupportLine } from '@/components/Support'
import { UI_COPY } from '@/lib/copy'
import { questionnaire, QUICK_ITEMS } from '@/lib/data'
import { getFlashQuizzes } from '@/lib/flash-content'

export const metadata: Metadata = {
  title: 'Quiz présidentielle 2027',
  description: 'Suis-je un facho ? Suis-je une gauchiasse ? Des quiz flash satiriques sur la présidentielle 2027 : ris de ton camp, chambre celui d’en face, partage ton score.',
  alternates: { canonical: '/quiz' },
}

export default function QuizHub() {
  const copy = UI_COPY.quiz
  return (
    <div className="container">
      <PageHeader kicker="Quiz" title="Joue, partage, compare" lede="Découvre de quels candidats tu es proche, ris de ton camp, et repars avec de vrais chiffres à partager." />
      <ul className="grid grid--2 section" role="list" style={{ listStyle: 'none', padding: 0 }}>
        <li className="card card--featured" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
          <p className="kicker" style={{ margin: 0 }}>
            {copy.quickKicker(QUICK_ITEMS.length)}
          </p>
          <h2 style={{ margin: 0, fontSize: 'var(--h3)' }}>
            <Link href="/test?rapide=1">{copy.quickTitle}</Link>
          </h2>
          <p className="small" style={{ margin: 0 }}>
            {copy.quickLede}
          </p>
          <Link className="btn btn--highlight btn--small" href="/test?rapide=1" style={{ marginTop: 'auto', alignSelf: 'flex-start' }}>
            {copy.quickCta}
          </Link>
        </li>
        <li className="card card--flat" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
          <p className="kicker" style={{ margin: 0 }}>
            {copy.fullKicker(questionnaire.items.length)}
          </p>
          <h2 style={{ margin: 0, fontSize: 'var(--h3)' }}>
            <Link href="/test">{copy.fullTitle}</Link>
          </h2>
          <p className="small" style={{ margin: 0 }}>
            {copy.fullLede}
          </p>
          <Link className="btn btn--secondary btn--small" href="/test" style={{ marginTop: 'auto', alignSelf: 'flex-start' }}>
            {copy.fullCta}
          </Link>
        </li>
      </ul>
      <section className="section" aria-labelledby="flash">
        <h2 id="flash">{UI_COPY.flash.hubTitle}</h2>
        <p className="measure">{UI_COPY.flash.hubLede}</p>
        <ul className="flash-hub" role="list">
          {getFlashQuizzes().map((q) => (
            <li key={q.slug}>
              <Link href={`/quiz/flash/${q.slug}`} className="flash-hub__card">
                {q.avatar && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="flash-hub__avatar" src={q.avatar} width={800} height={800} alt="" loading="lazy" />
                )}
                <span className="flash-hub__text">
                  <span className="flash-hub__badge">{UI_COPY.flash.length(q.questions.length)}</span>
                  <span className="flash-hub__title">{q.title}</span>
                  <span className="small">{q.lede}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <SupportLine placement="quiz" />
    </div>
  )
}
