import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { UI_COPY } from '@/lib/copy'
import { ContactForm } from './ContactForm'

export const metadata: Metadata = {
  title: 'Contact : signaler une erreur, poser une question',
  description: 'Écrire à Ça vote ? : demande de correction sur un candidat, question, bug ou suggestion. Le message est transmis par email, rien n’est stocké sur le site.',
  alternates: { canonical: '/contact' },
}

const t = UI_COPY.contact

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ sujet?: string; page?: string }> }) {
  const sp = await searchParams
  const page = typeof sp.page === 'string' && sp.page.startsWith('/') ? sp.page.slice(0, 300) : ''
  return (
    <div className="container">
      <PageHeader kicker={t.kicker} title={t.title} lede={t.lede} />
      <div className="measure">
        <ContactForm initialKind={sp.sujet === 'correction' ? 'correction' : 'general'} initialPage={page} />
        <p className="small muted section">
          Le message part par email à la rédaction et n’est pas conservé par le site. <Link href="/confidentialite#contact">Le détail</Link> ·{' '}
          <Link href="/corrections">Les corrections déjà faites</Link>
        </p>
      </div>
    </div>
  )
}
