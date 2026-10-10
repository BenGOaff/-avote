import type { Metadata } from 'next'
import Link from 'next/link'
import { NuanceTag, NuanceSourceLink } from '@/components/Nuance'
import { notFound } from 'next/navigation'
import { getActor, getAnnouncedActors, STATUS_LABEL } from '@/lib/actors'
import { UI_COPY } from '@/lib/copy'
import { itemsByTheme, liveCorpus, questionnaire } from '@/lib/data'
import { BASIS_LABEL, positionLabel } from '@/lib/answers'
import { formatDate } from '@/components/Editorial'
import { PositionScale } from '@/components/Viz'
import { PartyTrail } from '@/components/PartyTrail'
import { absolute } from '@/lib/site'
import fiches from '@content/acteurs/fiches.json'
import { Portrait } from '@/components/Portrait'
import { portraitOf } from '@/lib/images'
import { nuanceOf } from '@/lib/nuances'
import { NET_DEFINITION, patrimoineOf } from '@/lib/patrimoine'
import { hatvpOf } from '@/lib/hatvp'
import { VOTE_LABEL, VOTES_FETCHED_AT, VOTES_SOURCE, isDeputy, scrutinLabel, scrutinUrl, votesOf } from '@/lib/votes-an'
import { SENAT_FETCHED_AT, senatLabel, senatOf } from '@/lib/votes-senat'
import { CASIER_CHECKED_AT, CASIER_TYPES, casierCounts, casierDate, casierOf } from '@/lib/casier'

export const dynamicParams = false

export function generateStaticParams() {
  return getAnnouncedActors().map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const a = getActor(slug)
  if (!a) return {}
  return {
    title: `${a.name} : ses positions pour la présidentielle 2027`,
    description: `Les positions de ${a.name} sur ${questionnaire.items.length} sujets (impôts, retraites, sécurité, climat, Europe, institutions…), avec la citation et la source de chacune.`,
    alternates: { canonical: `/candidats/${a.slug}` },
    // Fiche indexée seulement quand elle contient des positions (pas de page vide dans les moteurs)
    robots: { index: Object.keys(liveCorpus.positions[slug] ?? {}).length > 0, follow: true },
  }
}

export default async function ActorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const a = getActor(slug)
  if (!a) notFound()
  const positions = liveCorpus.positions[slug] ?? {}
  const sources = new Map((liveCorpus.sources ?? []).map((s) => [s.id, s]))
  const known = Object.values(positions).filter((p) => !('missing' in p)).length
  const fiche = (fiches as Record<string, { analysis: string; remark: string }>)[slug]
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: { '@type': 'Person', name: a.name, ...(a.party ? { affiliation: { '@type': 'Organization', name: a.party } } : {}) },
    url: absolute(`/candidats/${a.slug}`),
    inLanguage: 'fr-FR',
  }
  return (
    <div className="container" style={{ paddingTop: 'var(--s6)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <p className="kicker">
        <Link href="/candidats">Candidats</Link> · {STATUS_LABEL[a.status]}
      </p>
      <div className="cand-hero">
        <Portrait src={portraitOf(a.slug)} name={a.name} bloc={nuanceOf(a.slug)?.bloc ?? 'DIV'} size={120} notice />
        <h1 style={{ margin: 0 }}>{a.name}</h1>
      </div>
      <p className="row" style={{ gap: 'var(--s3)', margin: '0 0 var(--s3)' }}>
        <NuanceTag slug={a.slug} detail />
        <span className="small">
          <NuanceSourceLink />
        </span>
      </p>
      <PartyTrail slug={a.slug} />
      <div className="measure">
        <p className="lede">
          {a.party ? `${a.party}. ` : ''}
          {a.status === 'retire' ? `Candidature retirée le ${formatDate(a.retiredAt ?? a.since)}.` : `Annonce le ${formatDate(a.since)}.`}{' '}
          <a href={a.source.url} rel="noopener noreferrer nofollow" target="_blank">
            Source : {a.source.publisher}
          </a>
        </p>
        {a.links && a.links.length > 0 && (
          <p>
            {UI_COPY.candidate.linksLead}{' '}
            {a.links.map((l, i) => (
              <span key={l.url}>
                {i > 0 && ' · '}
                <a href={l.url} rel="noopener noreferrer" target="_blank">
                  {UI_COPY.candidate.linkKind[l.kind] ?? l.kind}
                </a>
              </span>
            ))}
          </p>
        )}
        <p className="muted">
          {known > 0 ? `${known} positions connues sur ${questionnaire.items.length}.` : 'Positions en cours de collecte.'}{' '}
          <Link href="/methodologie#codage">Comment c’est codé</Link> ·{' '}
          <Link href={`/contact?sujet=correction&page=${encodeURIComponent(`/candidats/${a.slug}`)}`}>Signaler une erreur</Link>
        </p>
        <PatrimoineBlock slug={a.slug} />
        <CasierBlock slug={a.slug} />
        <VotesBlock slug={a.slug} />
        <SenatBlock slug={a.slug} />
      </div>

      {fiche && (
        <section className="card card--featured measure" aria-labelledby="en-bref" style={{ margin: 'var(--s5) 0' }}>
          <h2 id="en-bref" style={{ fontSize: 'var(--h3)' }}>
            En bref
          </h2>
          <p style={{ margin: 0 }}>{fiche.analysis}</p>
          {fiche.remark && (
            <p className="feed__remark humor" style={{ margin: 'var(--s3) 0 0' }}>
              {fiche.remark}
            </p>
          )}
          <p className="small muted" style={{ margin: 'var(--s3) 0 0' }}>
            <Link href="/methodologie#ia">Résumé rédigé par IA</Link>
          </p>
        </section>
      )}

      {known > 0 &&
        itemsByTheme(questionnaire).map(({ theme, items }) => {
          const withPos = items.filter((it) => positions[it.id] && !('missing' in positions[it.id]!))
          const without = items.filter((it) => !withPos.includes(it))
          return (
            <section key={theme.id} className="section" aria-labelledby={`t-${theme.id}`}>
              <h2 id={`t-${theme.id}`} style={{ fontSize: 'var(--h3)' }}>
                {theme.label} <span className="hint">{withPos.length}/{items.length}</span>
              </h2>
              <div className="grid grid--2">
                {withPos.map((it) => {
                  const p = positions[it.id]!
                  const src = 'sources' in p ? sources.get(p.sources[0] ?? '') : undefined
                  return (
                    <div key={it.id} className="card card--flat pos-card">
                      <p className="pos-card__q">{it.text}</p>
                      <p className="pos-card__a">
                        <PositionScale position={p} /> <strong>{positionLabel(p)}</strong>
                      </p>
                      {'basis' in p && p.basis && <span className="badge badge--muted">{BASIS_LABEL[p.basis]}</span>}
                      {src && (
                        <details className="sources">
                          <summary>Source</summary>
                          {src.passage && <blockquote className="small">« {src.passage} »</blockquote>}
                          <p className="hint" style={{ margin: 0 }}>
                            <a href={src.url ?? undefined} rel="noopener noreferrer nofollow" target="_blank">
                              {src.publisher} — {src.title}
                            </a>
                            {src.date && `, ${src.date}`}
                          </p>
                          {'note' in p && p.note && <p className="hint" style={{ margin: 'var(--s1) 0 0' }}>{p.note}</p>}
                        </details>
                      )}
                    </div>
                  )
                })}
              </div>
              {without.length > 0 && (
                <p className="small muted" style={{ marginTop: 'var(--s3)' }}>
                  Pas de position connue : {without.map((it) => it.text.replace(/\.$/, '')).join(' · ')}.
                </p>
              )}
            </section>
          )
        })}
      <p>
        <Link className="btn btn--highlight" href="/test">
          Comparer avec mes réponses
        </Link>
      </p>
    </div>
  )
}

/** Patrimoine déclaré : le chiffre publié, sa date, son contexte, et ce qu'il n'est pas. */
function PatrimoineBlock({ slug }: { slug: string }) {
  const p = patrimoineOf(slug)
  return (
    <section className="patrimoine" aria-labelledby="patrimoine">
      <h2 id="patrimoine" className="patrimoine__title">
        Patrimoine déclaré
      </h2>
      {p ? (
        <>
          <p className="patrimoine__amount">{p.label}</p>
          <p className="small">
            {p.kind === 'net' ? 'Patrimoine net' : 'Patrimoine estimé'}, {p.context}.{' '}
            <a href={p.url} rel="noopener noreferrer nofollow" target="_blank">
              Source : {p.publisher}
            </a>
          </p>
          <HatvpLink slug={slug} />
          <details className="sources">
            <summary>Ce que ce chiffre veut dire</summary>
            <p className="small">
              Montant déclaré sur l’honneur par le candidat, tel que publié à l’époque. Ça vote ? ne l’a pas recalculé. {p.kind === 'net' ? `${NET_DEFINITION}.` : 'Le résumé publié ne précise pas les dettes.'}{' '}
              Les déclarations des candidats de 2027 seront publiées par la Haute Autorité pour la transparence de la vie publique après la validation des
              candidatures.
            </p>
          </details>
        </>
      ) : (
        <p className="small muted">
          Pas de déclaration publiée qu’on puisse reprendre. Celles des candidats de 2027 seront rendues publiques par la Haute Autorité pour la transparence
          de la vie publique après la validation des candidatures.
        </p>
      )}
      {!p && <HatvpLink slug={slug} />}
    </section>
  )
}

/** Lien vers la page officielle de la HATVP : déclarations d'intérêts et d'activités publiées, mandats concernés. */
function HatvpLink({ slug }: { slug: string }) {
  const h = hatvpOf(slug)
  if (!h) return null
  return (
    <p className="small">
      Déclarations publiées par la Haute Autorité pour la transparence de la vie publique ({h.mandats.join(', ')}) :{' '}
      <a href={h.url} rel="noopener noreferrer nofollow" target="_blank">
        sa page officielle
      </a>
      .
    </p>
  )
}

/** Casier et affaires : décisions officielles seulement, même grille pour tous, relaxes comprises. */
function CasierBlock({ slug }: { slug: string }) {
  const list = casierOf(slug)
  const counts = casierCounts(slug)
  return (
    <section className="casier" aria-labelledby="casier">
      <h2 id="casier" className="patrimoine__title">
        Casier et affaires
      </h2>
      {!list || !counts ? (
        <p className="small muted">Vérification en cours.</p>
      ) : (
        <>
          <ul className="casier__counts">
            {CASIER_TYPES.map((t) => (
              <li key={t.id} className={`casier__count casier__count--${t.id}${counts[t.id] > 0 ? ' is-on' : ''}`}>
                <strong>{counts[t.id] || t.empty}</strong> <span>{t.label.toLowerCase()}</span>
              </li>
            ))}
          </ul>
          {list.length === 0 ? (
            <p className="small">
              Aucune décision de justice ni sanction officielle trouvée dans les sources consultées (au {formatDate(CASIER_CHECKED_AT)}).
            </p>
          ) : (
            <ol className="casier__list">
              {[...list]
                .sort((x, y) => CASIER_TYPES.findIndex((t) => t.id === x.type) - CASIER_TYPES.findIndex((t) => t.id === y.type) || y.date.localeCompare(x.date))
                .map((e) => (
                  <li key={e.title + e.date} className={`casier__item casier__item--${e.type}`}>
                    <p className="casier__head">
                      <span className="stamp">{CASIER_TYPES.find((t) => t.id === e.type)?.one}</span>{' '}
                      <time dateTime={e.date}>{casierDate(e.date)}</time>
                    </p>
                    <p className="casier__title">{e.title}</p>
                    <p className="casier__decision">{e.decision}</p>
                    <p className="small">
                      {e.body}. {e.facts}
                    </p>
                    {e.presumption && <p className="small casier__presumption">Pas de décision définitive : présomption d’innocence.</p>}
                    {e.note && <p className="small muted">{e.note}</p>}
                    <details className="sources">
                      <summary>Source</summary>
                      <p className="small">
                        « {e.quote} »{' '}
                        <a href={e.url} rel="noopener noreferrer nofollow" target="_blank">
                          {e.publisher}
                        </a>
                      </p>
                    </details>
                  </li>
                ))}
            </ol>
          )}
          <p className="small muted">
            Seulement des décisions officielles visant la personne : jugements, mises en examen, sanctions de la HATVP ou du Parlement, comptes de campagne.{' '}
            <Link href="/methodologie#casier">La règle</Link> · Une erreur ? <Link href={`/contact?sujet=correction&page=${encodeURIComponent(`/candidats/${slug}`)}`}>Signale-la</Link>.
          </p>
        </>
      )}
    </section>
  )
}

/** Ses votes à l'Assemblée : les grands textes (scrutins solennels) et les motions de censure, d'après l'open data officiel. */
function VotesBlock({ slug }: { slug: string }) {
  if (!isDeputy(slug)) return null
  const all = votesOf(slug)
  const solennels = all.filter((x) => x.scrutin.type === 'solennel')
  const censures = all.filter((x) => x.scrutin.type === 'censure')
  const count = (k: string) => solennels.filter((x) => x.vote === k).length
  const censureVoted = censures.filter((x) => x.vote === 'pour').length
  return (
    <section className="votes" aria-labelledby="votes-an">
      <h2 id="votes-an" className="patrimoine__title">
        Ses votes à l’Assemblée
      </h2>
      <p className="small">Sur les {solennels.length} votes solennels de la législature, ceux des grands textes :</p>
      <ul className="votes__counts">
        {(['pour', 'contre', 'abstention', 'absent'] as const).map((k) => (
          <li key={k} className={`votes__count votes__count--${k}`}>
            <strong>{count(k)}</strong> {VOTE_LABEL[k].toLowerCase()}
          </li>
        ))}
      </ul>
      <p className="small">
        Motions de censure : en a voté <strong>{censureVoted}</strong> sur {censures.length}.
      </p>
      <details className="sources">
        <summary>Voir chaque vote</summary>
        <ol className="votes__list">
          {[...all].reverse().map(({ scrutin, vote }) => (
            <li key={scrutin.numero} className="votes__row">
              <span className={`votes__chip votes__chip--${vote}`}>{scrutin.type === 'censure' && vote !== 'pour' ? '—' : VOTE_LABEL[vote]}</span>
              <span className="votes__what">
                <a href={scrutinUrl(scrutin.numero)} rel="noopener noreferrer nofollow" target="_blank">
                  {scrutin.type === 'censure' ? 'Motion de censure' : scrutinLabel(scrutin)}
                </a>
                <span className="small muted">
                  {' '}
                  · {formatDate(scrutin.date)} · {scrutin.sort === 'adopté' ? 'adopté' : 'rejeté'} ({scrutin.pour} pour, {scrutin.contre} contre)
                </span>
              </span>
            </li>
          ))}
        </ol>
      </details>
      <p className="small muted">
        Source :{' '}
        <a href={VOTES_SOURCE} rel="noopener noreferrer nofollow" target="_blank">
          open data de l’Assemblée nationale
        </a>
        , relevé du {formatDate(VOTES_FETCHED_AT)}. « N’a pas voté » : ne figure ni parmi les pour, ni parmi les contre, ni parmi les abstentions.
      </p>
    </section>
  )
}

/** Ses votes au Sénat sur l'ensemble des textes, depuis qu'il y siège, d'après les pages officielles des scrutins. */
function SenatBlock({ slug }: { slug: string }) {
  const s = senatOf(slug)
  if (!s || s.scrutins.length === 0) return null
  const count = (k: string) => s.scrutins.filter((x) => x.vote === k).length
  return (
    <section className="votes" aria-labelledby="votes-senat">
      <h2 id="votes-senat" className="patrimoine__title">
        Ses votes au Sénat
      </h2>
      <p className="small">
        Sur les {s.scrutins.length} votes sur l’ensemble d’un texte depuis qu’il siège à nouveau (
        <time dateTime={s.since}>{formatDate(s.since)}</time>) :
      </p>
      <ul className="votes__counts">
        {(['pour', 'contre', 'abstention', 'non-votant'] as const).map((k) => (
          <li key={k} className={`votes__count votes__count--${k}`}>
            <strong>{count(k)}</strong> {k === 'non-votant' ? 'n’a pas pris part au vote' : VOTE_LABEL[k].toLowerCase()}
          </li>
        ))}
      </ul>
      <details className="sources">
        <summary>Voir chaque vote</summary>
        <ol className="votes__list">
          {s.scrutins.map((x) => (
            <li key={x.numero} className="votes__row">
              <span className={`votes__chip votes__chip--${x.vote}`}>{x.vote === 'non-votant' ? 'N’a pas voté' : VOTE_LABEL[x.vote]}</span>
              <span className="votes__what">
                <a href={x.url} rel="noopener noreferrer nofollow" target="_blank">
                  {senatLabel(x.titre)}
                </a>
                <span className="small muted">
                  {' '}
                  · {formatDate(x.date)}
                  {x.sort ? ` · ${x.sort}` : ''}
                  {x.pour !== null ? ` (${x.pour} pour, ${x.contre} contre)` : ''}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </details>
      <p className="small muted">
        Source : pages officielles des scrutins publics du Sénat, relevé du {formatDate(SENAT_FETCHED_AT)}.{' '}
        <a href={s.page} rel="noopener noreferrer nofollow" target="_blank">
          Sa page de sénateur
        </a>
      </p>
    </section>
  )
}
