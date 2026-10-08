import type { Metadata } from 'next'
import { PageHeader } from '@/components/PageHeader'
import { NewsletterForm } from '@/components/NewsletterForm'
import { formatDate } from '@/components/Editorial'
import { ALERT_KIND_LABEL, ALERT_TOPIC_LABEL, CONTROLLER_KIND_LABEL, MEDIA_TYPE_LABEL, byController, getMedias, mediasUpdatedAt, type ArcomAlert, type MediaType } from '@/lib/medias'

export const metadata: Metadata = {
  title: 'Qui possède ton info : les propriétaires des médias français',
  description: 'Qui possède et qui contrôle les principales chaînes, radios, journaux et sites d’information en France, avec la source de chaque fiche.',
  alternates: { canonical: '/medias' },
}

const TYPES: MediaType[] = ['tv', 'radio', 'presse', 'web']

export default function MediasPage() {
  const medias = getMedias()
  const done = medias.filter((m) => m.ownership)
  const pending = medias.filter((m) => !m.ownership)
  const groups = byController(medias)
  return (
    <div className="container">
      <PageHeader
        kicker="Observatoire des médias"
        title="Qui possède ton info"
        lede="Qui possède les chaînes, les radios et les journaux que tu lis, et qui décide en dernier ressort. Chaque fiche cite sa source."
      />

      {done.length === 0 ? (
        <div className="alert alert--info measure">
          <p className="alert__title">Fiches en cours d’établissement.</p>
          <p>Aucune fiche n’est publiée tant que la propriété n’est pas établie par une source citée mot pour mot.</p>
        </div>
      ) : (
        <>
          <section aria-labelledby="qui-quoi">
            <h2 id="qui-quoi" style={{ fontSize: 'var(--h3)' }}>
              Qui possède quoi
            </h2>
            <p className="small muted" style={{ marginTop: 0 }}>
              {done.length} médias sur {medias.length}, regroupés par contrôle final. Mis à jour le {formatDate(mediasUpdatedAt ?? '')}.
            </p>
            <ul className="owners">
              {groups.map((g) => (
                <li key={g.controller} className="owner">
                  <p className="owner__name">{g.controller}</p>
                  <p className="owner__meta">
                    <span className="badge badge--muted">{CONTROLLER_KIND_LABEL[g.kind] ?? g.kind}</span> {g.medias.length} média{g.medias.length > 1 ? 's' : ''}
                  </p>
                  <ul className="owner__medias">
                    {g.medias.map((m) => (
                      <li key={m.slug}>
                        <a href={`#${m.slug}`}>{m.name}</a> <span className="hint">{MEDIA_TYPE_LABEL[m.type]}</span>
                        {m.alerts && m.alerts.length > 0 && <span className="stamp stamp--alert">Arcom × {m.alerts.length}</span>}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="fiches" className="section">
            <h2 id="fiches" style={{ fontSize: 'var(--h3)' }}>
              Les fiches
            </h2>
            {TYPES.map((t) => {
              const list = done.filter((m) => m.type === t)
              if (list.length === 0) return null
              return (
                <div key={t} style={{ marginTop: 'var(--s5)' }}>
                  <h3>{MEDIA_TYPE_LABEL[t]}</h3>
                  <div className="grid grid--2">
                    {list.map((m) => {
                      const o = m.ownership!
                      return (
                        <article key={m.slug} id={m.slug} className="card">
                          <h4 style={{ margin: 0, fontSize: '1.15rem' }}>{m.name}</h4>
                          <dl className="dl" style={{ marginTop: 'var(--s3)' }}>
                            <dt>Contrôle final</dt>
                            <dd>{o.controller}</dd>
                            {o.owners.length > 0 && (
                              <>
                                <dt>Actionnaire{o.owners.length > 1 ? 's' : ''}</dt>
                                <dd>{o.owners.map((x) => `${x.name}${x.share ? ` (${x.share})` : ''}`).join(' ; ')}</dd>
                              </>
                            )}
                            {o.group && (
                              <>
                                <dt>Groupe</dt>
                                <dd>{o.group}</dd>
                              </>
                            )}
                          </dl>
                          {o.note && <p className="small">{o.note}</p>}
                          <blockquote className="small" style={{ margin: 'var(--s3) 0', paddingLeft: 'var(--s3)', borderLeft: 'var(--border) solid var(--line)' }}>
                            « {o.quote} »
                          </blockquote>
                          {(m.type === 'tv' || m.type === 'radio') && <Alerts alerts={m.alerts} checkedAt={m.alertsCheckedAt} />}
                          <p className="hint" style={{ margin: 0 }}>
                            Source :{' '}
                            <a href={o.url} rel="noopener noreferrer nofollow" target="_blank">
                              {o.publisher}
                            </a>
                            {o.date && `, ${formatDate(o.date)}`} · vérifié le {formatDate(o.checkedAt)}
                          </p>
                        </article>
                      )
                    })}
                  </div>
                </div>
              )
            })}
            {pending.length > 0 && (
              <p className="small muted" style={{ marginTop: 'var(--s5)' }}>
                Pas encore établies : {pending.map((m) => m.name).join(', ')}.
              </p>
            )}
          </section>
        </>
      )}

      <section className="section measure stack" aria-labelledby="regles">
        <h2 id="regles" style={{ fontSize: 'var(--h3)' }}>
          Comment les fiches sont établies
        </h2>
        <ul>
          <li>
            Pour la télévision et la radio, les décisions de l’Arcom (et du CSA avant 2022) et du Conseil d’État qui touchent à l’information politique : pluralisme,
            temps de parole, honnêteté et indépendance de l’information, campagnes électorales. Seules les décisions lues sur arcom.fr, conseil-etat.fr ou
            legifrance.gouv.fr sont retenues, avec un extrait vérifié. La presse écrite et les sites ne dépendent pas de l’Arcom.
          </li>
          <li>Une IA cherche qui possède le média aujourd’hui, de préférence dans une source officielle (site du groupe, rapport annuel, Arcom), sinon dans un article de presse daté.</li>
          <li>La fiche cite un passage mot pour mot. Un script relit la page et vérifie que le passage y figure et qu’il nomme le propriétaire. Sinon, rien n’est publié.</li>
          <li>Le capital et le contrôle ne sont pas la même chose : la fiche distingue l’actionnaire direct et celui qui décide en dernier ressort.</li>
          <li>Pas de note de « manipulation », pas de classement moral des propriétaires, pas de ligne éditoriale supposée. Une information inconnue reste inconnue.</li>
          <li>Les fiches sont revérifiées chaque mois. Une erreur ? Écris-nous, la correction sera publiée.</li>
        </ul>
        <h2 style={{ fontSize: 'var(--h3)' }}>Être prévenu des changements</h2>
        <NewsletterForm />
      </section>
    </div>
  )
}

function Alerts({ alerts, checkedAt }: { alerts: ArcomAlert[] | null; checkedAt: string | null }) {
  if (alerts === null) return null
  if (alerts.length === 0)
    return (
      <p className="small muted" style={{ margin: 'var(--s3) 0' }}>
        Arcom : aucune décision liée à l’information politique relevée (vérifié le {formatDate(checkedAt ?? '')}).
      </p>
    )
  return (
    <div className="alerts">
      <p className="alerts__title">Épinglé par l’Arcom</p>
      <ul>
        {alerts.map((a) => (
          <li key={a.url + a.date}>
            <span className="stamp stamp--alert">{ALERT_KIND_LABEL[a.kind] ?? a.kind}</span> <strong>{formatDate(a.date)}</strong> · {ALERT_TOPIC_LABEL[a.topic] ?? a.topic}
            <br />
            {a.summary}{' '}
            <a href={a.url} rel="noopener noreferrer nofollow" target="_blank" className="small">
              {a.publisher}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
