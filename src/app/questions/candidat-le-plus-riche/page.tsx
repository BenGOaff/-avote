import type { Metadata } from 'next'
import Link from 'next/link'
import { QuestionShell } from '@/components/QuestionShell'
import { Shuffle } from '@/components/Shuffle'
import { NET_DEFINITION } from '@/lib/patrimoine'
import { questionPage, richest } from '@/lib/questions-candidats'

const q = questionPage('riche')

export const metadata: Metadata = {
  title: q.metaTitle,
  description: q.description,
  alternates: { canonical: q.path },
}

const year = (d: string) => d.slice(0, 4)

export default function RichestPage() {
  const { net, other, missing } = richest()
  const top = net[0]
  const shortText = top
    ? `Parmi les candidats dont le patrimoine a été rendu public, ${top.name} déclare le plus élevé : ${top.p.label} nets en ${year(top.p.date)}. Ces chiffres datent de la présidentielle 2022 ; ceux de 2027 seront publiés après la validation des candidatures. ${missing.length} candidats n’ont pas de patrimoine publié qu’on puisse reprendre.`
    : 'Aucun patrimoine de candidat n’a encore été rendu public pour 2027.'
  const sources = [...net, ...other].map((x) => ({
    title: `Patrimoine de ${x.name}`,
    publisher: x.p.publisher,
    url: x.p.url,
  }))
  // Une même source pour plusieurs candidats : une seule ligne
  const uniq = [...new Map(sources.map((s) => [s.url, { ...s, title: 'Déclarations de patrimoine des candidats' }])).values()]
  return (
    <QuestionShell
      id="riche"
      shortText={shortText}
      short={
        <>
          {top ? (
            <p>
              Parmi les candidats dont le patrimoine a été rendu public, <strong>{top.name}</strong> déclare le plus élevé : <strong>{top.p.label}</strong> nets
              en {year(top.p.date)}.
            </p>
          ) : (
            <p>Aucun patrimoine de candidat n’a encore été rendu public pour 2027.</p>
          )}
          <p>
            Ces chiffres datent de la présidentielle 2022. Ceux de 2027 seront publiés par la Haute Autorité pour la transparence de la vie publique après la
            validation des candidatures. {missing.length} candidats n’ont pas de patrimoine publié qu’on puisse reprendre.
          </p>
        </>
      }
      method={
        <>
          <p>
            Seuls les montants déclarés sur l’honneur et rendus publics (Haute Autorité pour la transparence de la vie publique, Journal officiel), ou un
            article qui en rapporte le contenu. Jamais les déclarations des parlementaires : elles sont consultables en préfecture, leur publication est
            interdite. Ça vote ? ne recalcule aucun montant.
          </p>
          <p>
            {NET_DEFINITION}. Un patrimoine estimé, sans les dettes, ne se compare pas à un patrimoine net : il est rangé à part. Un patrimoine ne dit rien des
            revenus ni de l’origine des biens (héritage, travail, ventes de livres…).
          </p>
          <p className="small">
            <Link href="/methodologie">La méthode</Link>
          </p>
        </>
      }
      sources={uniq}
    >
      {net.length > 0 && (
        <section className="section measure" aria-labelledby="net">
          <h2 id="net" style={{ fontSize: 'var(--h3)' }}>
            Patrimoines nets déclarés, du plus élevé au plus bas
          </h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Candidat</th>
                  <th scope="col" className="num">
                    Patrimoine net
                  </th>
                  <th scope="col">Année</th>
                </tr>
              </thead>
              <tbody>
                {net.map((x) => (
                  <tr key={x.slug}>
                    <td>
                      <Link href={`/candidats/${x.slug}#patrimoine`}>{x.name}</Link>
                    </td>
                    <td className="num">{x.p.label}</td>
                    <td>
                      <a href={x.p.url} rel="noopener noreferrer nofollow" target="_blank">
                        {year(x.p.date)}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {other.length > 0 && (
        <section className="section measure" aria-labelledby="autres">
          <h2 id="autres" style={{ fontSize: 'var(--h3)' }}>
            Autres chiffres publiés, non comparables
          </h2>
          <ul>
            {other.map((x) => (
              <li key={x.slug}>
                <Link href={`/candidats/${x.slug}#patrimoine`}>{x.name}</Link> : {x.p.label}, patrimoine estimé, {x.p.context}.{' '}
                <a href={x.p.url} rel="noopener noreferrer nofollow" target="_blank">
                  Source : {x.p.publisher}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
      {missing.length > 0 && (
        <section className="section measure" aria-labelledby="sans">
          <h2 id="sans" style={{ fontSize: 'var(--h3)' }}>
            Pas de patrimoine publié qu’on puisse reprendre <span className="hint">{missing.length}</span>
          </h2>
          <p className="small">
            <Shuffle as="span" className="echiquier__inline">
              {missing.map((m) => (
                <span key={m.slug}>
                  <Link href={`/candidats/${m.slug}`}>{m.name}</Link>
                </span>
              ))}
            </Shuffle>
          </p>
        </section>
      )}
    </QuestionShell>
  )
}
