import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { UI_COPY } from '@/lib/copy'
import { nuanceOf } from '@/lib/nuances'
import { urneChoices } from '@/lib/urne'
import { UrneBooth } from './UrneBooth'

export const metadata: Metadata = {
  title: 'L’urne de Ça vote ? : tu sais déjà pour qui tu votes ?',
  description: 'Glisse ton bulletin pour la présidentielle 2027 : un bulletin par connexion, anonyme, et le dépouillement en direct. Consultation non représentative.',
  alternates: { canonical: '/urne' },
}

const t = UI_COPY.urne

export default function UrnePage() {
  const choices = urneChoices().map((c) => ({ ...c, ...(nuanceOf(c.slug) ? { bloc: nuanceOf(c.slug)!.bloc } : {}) }))
  return (
    <div className="container">
      <PageHeader kicker={t.kicker} title={t.title} lede={t.lede} />
      <UrneBooth choices={choices} />
      <section className="section measure" aria-labelledby="anonymat">
        <h2 id="anonymat" style={{ fontSize: 'var(--h3)' }}>
          {t.howTitle}
        </h2>
        <ul>
          {t.how.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        <p className="small">
          <Link href="/confidentialite#urne">Le détail dans la politique de confidentialité</Link> · <Link href="/radar/2026-10-08-comment-voter">Comment voter pour de vrai</Link> · <Link href="/radar/2026-10-10-lire-un-sondage">Comment lire un vrai sondage</Link>
        </p>
      </section>
    </div>
  )
}
