import type { Metadata } from 'next'
import { PageHeader } from '@/components/PageHeader'
import { NewsletterForm } from '@/components/NewsletterForm'

export const metadata: Metadata = {
  title: 'Newsletter',
  description: 'La campagne présidentielle 2027 dans ta boîte mail : ce qui a bougé, ce qui a été promis, ce qui a été corrigé.',
  alternates: { canonical: '/newsletter' },
}

const STATES: Record<string, { title: string; body: string; tone: 'info' | 'correction' }> = {
  confirme: { title: 'C’est confirmé.', body: 'Tu recevras la prochaine lettre. Chaque envoi contient un lien de désinscription.', tone: 'info' },
  expire: { title: 'Ce lien n’est plus valable.', body: 'Il a expiré ou il est incomplet. Réinscris-toi ci-dessous, un nouveau lien partira.', tone: 'correction' },
  erreur: { title: 'L’inscription n’a pas abouti.', body: 'Le service d’envoi n’a pas répondu. Réessaie dans quelques minutes.', tone: 'correction' },
  limite: { title: 'Trop de tentatives.', body: 'Réessaie dans quelques minutes.', tone: 'correction' },
}

export default async function NewsletterPage({ searchParams }: { searchParams: Promise<{ etat?: string }> }) {
  const { etat } = await searchParams
  const s = etat ? STATES[etat] : undefined
  return (
    <div className="container">
      <PageHeader kicker="Newsletter" title="La campagne dans ta boîte mail" lede="Ce qui a bougé, ce qui a été promis, ce qui a été corrigé. Sans lien avec tes réponses au test." />
      <div className="narrow stack" style={{ margin: 0 }}>
        {s && (
          <div className={`alert alert--${s.tone}`} role="status">
            <p className="alert__title">{s.title}</p>
            <p>{s.body}</p>
          </div>
        )}
        {etat !== 'confirme' && <NewsletterForm />}
      </div>
    </div>
  )
}
