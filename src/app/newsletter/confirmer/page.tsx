import type { Metadata } from 'next'
import { PageHeader } from '@/components/PageHeader'

export const metadata: Metadata = { title: 'Confirmer mon inscription', robots: { index: false, follow: false }, referrer: 'no-referrer' }

export default async function ConfirmPage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t } = await searchParams
  return (
    <div className="container">
      <PageHeader title="Dernière étape" lede="Un clic pour confirmer que tu veux recevoir la lettre de Ça vote ?." />
      <form method="post" action="/api/newsletter/confirm">
        <input type="hidden" name="t" value={typeof t === 'string' ? t.slice(0, 1024) : ''} />
        <button className="btn btn--highlight" type="submit">
          Confirmer mon inscription
        </button>
      </form>
    </div>
  )
}
