import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { LEGAL, displayEmail } from '@/lib/legal'
import { liveCorpus, questionnaire, QUICK_ITEMS } from '@/lib/data'
import { absolute } from '@/lib/site'
import data from '@content/comparatif/tests.json'

/**
 * Comparatif des tests en ligne pour la présidentielle 2027 (content/comparatif/tests.json).
 * Constats relevés sur les sites eux-mêmes, avec la page qui les montre. Ça vote ? passe la même grille.
 * Les liens sortants portent rel="nofollow" : on cite, on ne recommande pas.
 */

interface Evidence {
  claim: string
  url: string
  quote: string
}
interface Tool {
  self?: boolean
  name: string
  url: string
  editor: string
  model: string
  format: { questions?: string; answerType?: string; duration?: string }
  candidates: { count?: number | string; nonDeclaredOrParties?: string }
  positions: { codedBy?: string; sourcesPerPosition?: string; quotesOrSummaries?: string; unknownPosition?: string }
  privacy: { computation?: string; server?: string; accounts?: string; trackers?: string }
  open: { data?: string; code?: string }
  updated?: string
  strengths: string[]
  limits: string[]
  evidence: Evidence[]
}

const D = data as { checkedAt: string; tools: Tool[]; outdated2022: { name: string; url: string; note: string }[] }
const day = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${D.checkedAt}T12:00:00Z`))
const others = D.tools.filter((t) => !t.self).length

export const metadata: Metadata = {
  title: `Quel test pour savoir pour qui voter en 2027 ? ${others} quiz comparés`,
  description: `Les tests en ligne pour la présidentielle 2027 passés à la même grille : positions sourcées ou non, réponses gardées ou envoyées, méthode publiée. Relevé du ${day}.`,
  alternates: { canonical: '/comparatif-tests' },
}

/** Nos propres chiffres viennent des fichiers publiés, pas d'une saisie */
function withLiveFigures(t: Tool): Tool {
  if (!t.self) return t
  const n = questionnaire.items.filter((i) => !i.inactive).length
  return { ...t, format: { ...t.format, questions: `${QUICK_ITEMS.length} (rapide) ou ${n} (complet)` }, candidates: { ...t.candidates, count: liveCorpus.actors.length } }
}

const anchor = (name: string) =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)

function Ext({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} rel="nofollow noopener noreferrer" target="_blank">
      {children}
    </a>
  )
}

export default function ComparatifPage() {
  const tools = D.tools.map(withLiveFigures)
  const mail = `mailto:${LEGAL.contactEmail}?subject=Comparatif%20des%20tests`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Tests en ligne pour la présidentielle 2027',
    itemListElement: tools.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, url: t.self ? absolute('/test') : t.url })),
  }
  return (
    <div className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <PageHeader
        kicker="Ton vote"
        title="Pour qui voter en 2027 : les tests en ligne comparés"
        lede={`${others} tests relevés le ${day}, passés à la même grille. Ça vote ? en est un : il figure dans la liste, avec ses limites.`}
      />
      <div className="measure stack">
        <h2 style={{ fontSize: 'var(--h3)' }}>Cinq questions à poser à un test</h2>
        <ol>
          <li>
            <strong>D’où viennent les positions des candidats ?</strong> Une citation exacte avec son lien se vérifie. Un résumé, une « estimation » ou une
            position tirée de la mémoire d’une IA, sans source, non.
          </li>
          <li>
            <strong>Que fait le test quand il ne sait pas ?</strong> S’il remplace l’inconnu par « neutre » ou par la ligne du parti, ton résultat mélange
            des faits et des suppositions.
          </li>
          <li>
            <strong>Où partent tes réponses ?</strong> Tes opinions politiques sont des données sensibles. Calculées dans ton navigateur, elles n’en sortent
            pas ; envoyées à un serveur ou à une IA, elles existent ailleurs.
          </li>
          <li>
            <strong>Qui l’édite, et qui paie ?</strong> Publicité, dons, média, parti : ça ne dit pas si le test est juste, mais ça dit où regarder.
          </li>
          <li>
            <strong>Peut-on refaire le calcul ?</strong> Méthode publiée, données ouvertes, code ouvert : chacun de ces points permet à d’autres de vérifier.
          </li>
        </ol>
        <p className="small muted">
          Constats relevés sur les sites eux-mêmes le {day}, chacun avec la page qui le montre. Un site peut avoir changé depuis : la date compte.
        </p>
      </div>

      <section className="section" aria-labelledby="tableau">
        <h2 id="tableau">En un tableau</h2>
        <div className="table-wrap">
          <table>
            <caption className="visually-hidden">Comparatif des tests pour la présidentielle 2027</caption>
            <thead>
              <tr>
                <th scope="col">Test</th>
                <th scope="col">Questions</th>
                <th scope="col">Candidats</th>
                <th scope="col">Position inconnue</th>
                <th scope="col">Tes réponses</th>
                <th scope="col">Ouvert</th>
              </tr>
            </thead>
            <tbody>
              {tools.map((t) => (
                <tr key={t.name}>
                  <th scope="row">
                    <a href={`#${anchor(t.name)}`}>{t.name}</a>
                  </th>
                  <td>{t.format.questions ?? 'non précisé'}</td>
                  <td>{t.candidates.count ?? 'non précisé'}</td>
                  <td>{t.positions.unknownPosition ?? 'non précisé'}</td>
                  <td>{[t.privacy.computation, t.privacy.server].filter(Boolean).join(' ; ') || 'non précisé'}</td>
                  <td>{[t.open.data && `données : ${t.open.data}`, t.open.code && `code : ${t.open.code}`].filter(Boolean).join(' ; ') || 'non'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section" aria-labelledby="fiches">
        <h2 id="fiches">Test par test</h2>
        <div className="stack">
          {tools.map((t) => (
            <article key={t.name} id={anchor(t.name)} className={t.self ? 'card card--featured' : 'card card--flat'} style={{ overflowWrap: 'anywhere' }}>
              <h3 style={{ marginTop: 0 }}>
                {t.self ? <Link href="/test">{t.name}</Link> : <Ext href={t.url}>{t.name}</Ext>}
                {t.self && <span className="small muted"> · c’est nous</span>}
              </h3>
              <dl className="dl">
                <dt>Édité par</dt>
                <dd>{t.editor}</dd>
                <dt>Financement</dt>
                <dd>{t.model}</dd>
                <dt>Format</dt>
                <dd>{[t.format.questions, t.format.answerType].filter(Boolean).join(' · ')}</dd>
                <dt>Positions</dt>
                <dd>{[t.positions.codedBy, t.positions.sourcesPerPosition, t.positions.quotesOrSummaries].filter(Boolean).join(' · ')}</dd>
                {t.privacy.trackers && (
                  <>
                    <dt>Mesure et publicité</dt>
                    <dd>{t.privacy.trackers}</dd>
                  </>
                )}
              </dl>
              {t.strengths.length > 0 && (
                <>
                  <h4>Ce qui tient</h4>
                  <ul>
                    {t.strengths.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </>
              )}
              {t.limits.length > 0 && (
                <>
                  <h4>Ce qui fait douter</h4>
                  <ul>
                    {t.limits.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </>
              )}
              {t.evidence.length > 0 && (
                <details className="disclosure">
                  <summary>Les preuves ({t.evidence.length})</summary>
                  <ul className="small">
                    {t.evidence.map((e, i) => (
                      <li key={i}>
                        {e.claim} :{' '}
                        {t.self ? (
                          <a href={e.url.replace('https://xn--avote-xra.fr', '')}>{e.url.replace('https://xn--avote-xra.fr', '')}</a>
                        ) : (
                          <Ext href={e.url}>{new URL(e.url).hostname.replace(/^www\./, '')}</Ext>
                        )}
                        {e.quote && <> · « {e.quote} »</>}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </article>
          ))}
        </div>
      </section>

      {D.outdated2022.length > 0 && (
        <section className="section measure" aria-labelledby="anciens">
          <h2 id="anciens">Les tests de 2022</h2>
          <ul>
            {D.outdated2022.map((o) => (
              <li key={o.name}>
                <Ext href={o.url}>{o.name}</Ext> : {o.note}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="section measure" aria-labelledby="erreur">
        <h2 id="erreur">Une ligne est fausse ?</h2>
        <p>
          Tu édites l’un de ces tests et un constat ne correspond plus à ton site : écris à <a href={mail}>{displayEmail(LEGAL.contactEmail)}</a>. On
          vérifie sur la page, on corrige, et la correction apparaît dans <Link href="/corrections">les corrections</Link>.
        </p>
        <p>
          Pour faire le nôtre : <Link href="/test">le test</Link>, et la <Link href="/methodologie">méthode</Link> pour savoir comment il calcule.
        </p>
      </section>
    </div>
  )
}
