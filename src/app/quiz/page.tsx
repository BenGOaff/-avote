import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { SupportLine } from '@/components/Support'
import { UI_COPY } from '@/lib/copy'
import { questionnaire, QUICK_ITEMS } from '@/lib/data'
import { getFlashQuizzes } from '@/lib/flash-content'
import type { FlashQuizFull } from '@/lib/flash'
import { catOf, teaserOf, type FlashCat } from '@/lib/flash-teaser'
import { absolute } from '@/lib/site'

const t = UI_COPY.flash
// Les tribus d'abord : ce sont les quiz qui se partagent le plus volontiers
const CATS: FlashCat[] = ['score', 'profil', 'connaissances']

export const metadata: Metadata = {
  title: 'Quiz présidentielle 2027',
  description: 'Suis-je un facho ? Suis-je une gauchiasse ? Des quiz flash satiriques sur la présidentielle 2027 : ris de ton camp, chambre celui d’en face, partage ton score.',
  alternates: { canonical: '/quiz' },
}

export default function QuizHub() {
  const copy = UI_COPY.quiz
  const quizzes = getFlashQuizzes()
  const featured = quizzes.find((q) => q.featured)
  // Données structurées : la liste des quiz, pour les moteurs et les assistants IA
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: t.hubTitle,
    itemListElement: quizzes.map((q, i) => ({ '@type': 'ListItem', position: i + 1, url: absolute(`/quiz/flash/${q.slug}`), name: q.title })),
  }
  return (
    <div className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
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
        <h2 id="flash">{t.hubTitle}</h2>
        <p className="measure">{t.hubLede}</p>
        <nav className="flash-cats" aria-label={t.catsLabel}>
          {CATS.filter((c) => quizzes.some((q) => catOf(q) === c)).map((c) => (
            <a key={c} href={`#quiz-${c}`} className="flash-cats__chip">
              {t.cats[c]}
            </a>
          ))}
        </nav>
        {featured && <FlashCard q={featured} big />}
        {CATS.map((c) => {
          const list = quizzes.filter((q) => catOf(q) === c && q !== featured)
          if (list.length === 0) return null
          return (
            <section key={c} id={`quiz-${c}`} className="flash-cat" aria-labelledby={`quiz-${c}-titre`}>
              <h3 id={`quiz-${c}-titre`}>{t.cats[c]}</h3>
              <ul className="flash-hub" role="list">
                {list.map((q) => (
                  <li key={q.slug}>
                    <FlashCard q={q} />
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </section>
      <SupportLine placement="quiz" />
    </div>
  )
}

/** Carte d'un quiz : l'image d'abord, puis la promesse et un avant-goût du résultat. */
function FlashCard({ q, big = false }: { q: FlashQuizFull; big?: boolean }) {
  const teaser = teaserOf(q)
  return (
    <Link href={`/quiz/flash/${q.slug}`} className={`flash-hub__card${big ? ' flash-hub__card--big' : ''}`}>
      {q.avatar && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="flash-hub__avatar" src={q.avatar} width={800} height={800} alt="" loading={big ? 'eager' : 'lazy'} />
      )}
      <span className="flash-hub__text">
        <span className="flash-hub__badges">
          {big && <span className="flash-hub__badge flash-hub__badge--ink">{t.featured}</span>}
          <span className="flash-hub__badge">{t.length(q.questions.length)}</span>
        </span>
        <span className="flash-hub__title">{q.title}</span>
        <span className="small">{q.lede}</span>
        <span className="flash-hub__teaser">
          {teaser.avatars.map((a) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={a} src={a} width={800} height={800} alt="" loading="lazy" />
          ))}
          <span>{teaser.text}</span>
        </span>
        {big && <span className="btn btn--primary btn--small flash-hub__play">{t.play}</span>}
      </span>
    </Link>
  )
}
