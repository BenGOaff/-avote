import type { Metadata } from 'next'
import Link from 'next/link'
import { formatDate } from '@/components/Editorial'
import { BlocDot } from '@/components/Nuance'
import { PageHeader } from '@/components/PageHeader'
import { ShareButtons } from '@/components/ShareButtons'
import { ShortAnswer } from '@/components/ShortAnswer'
import { getActor } from '@/lib/actors'
import { UI_COPY } from '@/lib/copy'
import { nuanceOf } from '@/lib/nuances'
import { absolute } from '@/lib/site'
import { getSondages, instituteNote, SONDAGES_CHECKED_AT } from '@/lib/sondages'
import type { CandidateRange, DuelSummary, Poll } from '@/lib/sondages-stats'
import { isFrozen } from '@/lib/urne-shared'

const t = UI_COPY.sondages
const PATH = '/sondages'

/** Rendu à nouveau chaque heure : la page se masque d'elle-même la veille et le jour de chaque tour */
export const revalidate = 3600

export const metadata: Metadata = {
  title: t.metaTitle,
  description: t.description,
  alternates: { canonical: PATH },
}

/** Moins de 1 % : l'institut publie « <1 » */
const pct = (n: number) => (n < 1 ? '<1' : n.toLocaleString('fr-FR', { maximumFractionDigits: 1 }))
const nb = (n: number) => n.toLocaleString('fr-FR')
const day = (d: string) =>
  new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(`${d}T12:00:00Z`)).replace(/^1 /, '1er ')
const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`
const rangeOf = (min: number, max: number) => t.range(pct(min), pct(max))

/** La réponse courte : ce que disent les derniers sondages, en phrases, sans moyenne */
function summary(s: ReturnType<typeof getSondages>): string[] {
  const { latest, first, second } = s
  if (latest.length === 0) return []
  const h = first.hypotheses
  const from = latest.reduce((m, p) => (p.fieldStart < m ? p.fieldStart : m), latest[0]!.fieldStart)
  const to = latest[0]!.fieldEnd
  const out = [
    `Selon les ${plural(latest.length, 'dernier sondage', 'derniers sondages')} (un par institut, réalisés entre le ${day(from)} et le ${day(to)}) :`,
  ]
  if (h > 0) {
    const leaders = first.candidates.filter((c) => c.first > 0).sort((a, b) => b.first - a.first)
    const top = leaders[0]!
    out.push(
      leaders.length === 1
        ? `${top.name} arrive en tête dans ${h > 1 ? `les ${h} hypothèses testées` : 'la seule hypothèse testée'} au premier tour (${rangeOf(top.min, top.max)}).`
        : `En tête au premier tour : ${leaders.map((c) => `${c.name} (${c.first} fois sur ${h})`).join(', ')}.`,
    )
    const seconds = first.candidates.filter((c) => c.second > 0).sort((a, b) => b.second - a.second)
    if (seconds.length > 0)
      out.push(
        `Deuxième place : ${seconds.map((c) => (seconds.length === 1 && c.second === h ? `${c.name}, partout` : `${c.name} (${c.second} fois)`)).join(', ')}. ${t.closeSecond(first.closeSecond, h)}`.trim(),
      )
  }
  const duel = second[0]
  if (duel) {
    const [a, b] = duel.sides
    out.push(
      `Au second tour, le duel le plus testé oppose ${a.name} et ${b.name} : ${a.name} devant dans ${plural(a.ahead, 'sondage', 'sondages')} sur ${duel.polls} (${rangeOf(a.min, a.max)}).`,
    )
  }
  out.push(t.notPrediction)
  return out
}

function Name({ slug, name }: { slug: string | null; name: string }) {
  const n = slug ? nuanceOf(slug) : null
  const actor = slug ? getActor(slug) : undefined
  return (
    <span className="poll__name">
      {n && <BlocDot bloc={n.bloc} />}
      {actor ? <Link href={`/candidats/${actor.slug}`}>{name}</Link> : name}
    </span>
  )
}

/** Fourchette d'un candidat sur une échelle commune : la barre va du plus bas au plus haut relevé */
function RangeRow({ c, scale, h }: { c: CandidateRange; scale: number; h: number }) {
  const left = (c.min / scale) * 100
  const width = Math.max(((c.max - c.min) / scale) * 100, 1.2)
  return (
    <li className="poll__row">
      <div className="poll__label">
        <Name slug={c.slug} name={c.name} />
        <strong className="poll__value">{rangeOf(c.min, c.max)}</strong>
      </div>
      <div className="poll__track" aria-hidden="true">
        <span className="poll__span" style={{ left: `${left}%`, width: `${width}%` }} />
      </div>
      <p className="small muted poll__meta">
        {[t.tested(c.tested, h), c.first > 0 && t.firstPlace(c.first), c.second > 0 && t.secondPlace(c.second)].filter(Boolean).join(' · ')}
      </p>
    </li>
  )
}

function Duel({ d }: { d: DuelSummary }) {
  const [a, b] = d.sides
  return (
    <li className="poll__duel">
      <p className="poll__vs">
        <Name slug={a.slug} name={a.name} /> <span className="muted">contre</span> <Name slug={b.slug} name={b.name} />
      </p>
      <p className="small">
        {t.ahead(a.name, a.ahead, d.polls)} · {a.name} {rangeOf(a.min, a.max)}, {b.name} {rangeOf(b.min, b.max)}
      </p>
      <p className="small muted">{t.duelPolls(d.polls)}</p>
    </li>
  )
}

/** Un sondage avec les indications que la loi impose à sa publication, et tous ses chiffres */
function PollCard({ p }: { p: Poll }) {
  return (
    <li className="card poll__card">
      <h3 className="poll__title">{t.pollHead(p.institute, p.buyer)}</h3>
      <ul className="small poll__facts">
        <li>{p.fieldStart === p.fieldEnd ? t.fieldOne(formatDate(p.fieldEnd)) : t.field(day(p.fieldStart), formatDate(p.fieldEnd))}</li>
        <li>{t.sample(nb(p.sample), p.base)}</li>
        <li>{p.method}</li>
        {p.sponsor && <li>{t.sponsor(p.sponsor)}</li>}
        <li>{p.margin ? `${t.margin(p.margin)}. ${t.marginDefault}` : t.marginDefault}</li>
      </ul>
      {p.note && <p className="small muted">{p.note}</p>}
      <details className="sources">
        <summary>{t.results}</summary>
        {p.firstRound.map((hyp) => (
          <div key={hyp.hypothesis} className="poll__hyp">
            <p className="small">
              <strong>{t.hypothesis(hyp.hypothesis)}</strong>
            </p>
            <ol className="small poll__list">
              {[...hyp.results]
                .sort((x, y) => y.pct - x.pct)
                .map((r) => (
                  <li key={r.slug ?? r.name}>
                    {r.name} : {pct(r.pct)} %
                  </li>
                ))}
            </ol>
          </div>
        ))}
        {p.secondRound.map((d) => (
          <p key={d.results.map((r) => r.slug ?? r.name).join('|')} className="small">
            <strong>{t.duel}</strong> : {d.results.map((r) => `${r.name} ${pct(r.pct)} %`).join(', ')}
          </p>
        ))}
      </details>
      <p className="small">
        {p.url !== p.notice && (
          <a href={p.url} rel="noopener noreferrer nofollow" target="_blank">
            {t.report}
          </a>
        )}
        {p.url !== p.notice && p.notice && ' · '}
        {p.notice && (
          <a href={p.notice} rel="noopener noreferrer nofollow" target="_blank">
            {t.notice}
          </a>
        )}
      </p>
    </li>
  )
}

export default function SondagesPage() {
  const frozen = isFrozen()
  const s = getSondages()
  const lines = frozen ? [] : summary(s)
  const shortText = frozen ? t.frozen : lines.length > 0 ? lines.join(' ') : t.pending
  const scale = Math.max(40, Math.ceil(Math.max(0, ...s.first.candidates.map((c) => c.max)) / 10) * 10)
  const institutes = [...new Set(s.all.map((p) => p.institute))].sort((a, b) => a.localeCompare(b, 'fr'))
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'FAQPage',
        url: absolute(PATH),
        inLanguage: 'fr-FR',
        dateModified: SONDAGES_CHECKED_AT,
        mainEntity: [{ '@type': 'Question', name: t.question, acceptedAnswer: { '@type': 'Answer', text: shortText } }],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: t.kicker, item: absolute('/candidats') },
          { '@type': 'ListItem', position: 2, name: t.title, item: absolute(PATH) },
        ],
      },
    ],
  }
  return (
    <div className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <PageHeader kicker={t.kicker} title={t.title} lede={t.lede} />

      <ShortAnswer updated={UI_COPY.questions.updated(formatDate(SONDAGES_CHECKED_AT))}>
        {frozen ? <p>{t.frozen}</p> : lines.length > 0 ? lines.map((l) => <p key={l}>{l}</p>) : <p>{t.pending}</p>}
      </ShortAnswer>

      <section className="card section sujet__cta" aria-labelledby="toi">
        <h2 id="toi">{t.youTitle}</h2>
        <p>{t.youTest}</p>
        <p>
          <Link href="/test" className="btn btn--primary">
            {t.youTestCta}
          </Link>
        </p>
        <p className="small">{t.youUrne}</p>
        <p>
          <Link href="/urne" className="btn">
            {t.youUrneCta}
          </Link>
        </p>
      </section>

      {!frozen && s.first.hypotheses > 0 && (
        <section className="section measure" aria-labelledby="premier-tour">
          <h2 id="premier-tour" style={{ fontSize: 'var(--h3)' }}>
            {t.firstTitle}
          </h2>
          <p className="small muted">{t.firstNote(s.first.hypotheses)}</p>
          <ul className="poll__ranges">
            {s.first.candidates.map((c) => (
              <RangeRow key={c.key} c={c} scale={scale} h={s.first.hypotheses} />
            ))}
          </ul>
          <p className="small muted poll__scale">
            0 % <span aria-hidden="true">—</span> {scale} %
          </p>
        </section>
      )}

      {!frozen && s.second.length > 0 && (
        <section className="section measure" aria-labelledby="second-tour">
          <h2 id="second-tour" style={{ fontSize: 'var(--h3)' }}>
            {t.secondTitle}
          </h2>
          <p className="small muted">{t.secondNote}</p>
          <ul className="poll__duels">
            {s.second.map((d) => (
              <Duel key={d.key} d={d} />
            ))}
          </ul>
        </section>
      )}

      {!frozen && s.latest.length > 0 && (
        <section className="section" aria-labelledby="liste">
          <h2 id="liste" style={{ fontSize: 'var(--h3)' }}>
            {t.listTitle}
          </h2>
          <ul className="poll__cards">
            {s.latest.map((p) => (
              <PollCard key={p.id} p={p} />
            ))}
          </ul>
          {s.older.length > 0 && (
            <details className="sources">
              <summary>{t.olderTitle(s.older.length)}</summary>
              <ul className="poll__cards">
                {s.older.map((p) => (
                  <PollCard key={p.id} p={p} />
                ))}
              </ul>
            </details>
          )}
        </section>
      )}

      <section className="section measure" aria-labelledby="biais">
        <h2 id="biais" style={{ fontSize: 'var(--h3)' }}>
          {t.biasTitle}
        </h2>
        <ul>
          {t.bias.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        {institutes.some((i) => instituteNote(i)) && (
          <>
            <h3 style={{ fontSize: 'var(--text-ui)' }}>{t.instituteTitle}</h3>
            <ul className="small">
              {institutes.map((i) => {
                const n = instituteNote(i)
                return n ? (
                  <li key={i}>
                    <strong>{i}</strong> : {n.text}{' '}
                    <a href={n.url} rel="noopener noreferrer nofollow" target="_blank">
                      {n.publisher}
                    </a>
                  </li>
                ) : null
              })}
            </ul>
          </>
        )}
        <p className="small">
          <Link href="/radar/2026-10-10-lire-un-sondage">{t.read}</Link>
        </p>
      </section>

      <section className="section measure" aria-labelledby="methode">
        <h2 id="methode" style={{ fontSize: 'var(--h3)' }}>
          {UI_COPY.questions.method}
        </h2>
        {t.method.map((m) => (
          <p key={m}>{m}</p>
        ))}
      </section>

      <ShareButtons url={absolute(PATH)} title={t.metaTitle} text={shortText} />
      <p className="small muted section">
        <Link href={`/contact?sujet=correction&page=${encodeURIComponent(PATH)}`}>{t.error}</Link>
      </p>
    </div>
  )
}
