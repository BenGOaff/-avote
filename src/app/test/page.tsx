import type { Metadata } from 'next'
import { TestFlow } from './TestFlow'
import { SupportLine } from '@/components/Support'
import { questionnaire } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Le test',
  description: `${questionnaire.items.length} questions sur ce que tu veux pour le pays, du pouvoir d’achat aux animaux, avec une explication pour chacune. Le calcul se fait sur ton appareil.`,
  robots: { index: false, follow: true },
  alternates: { canonical: '/test' },
}

export default function TestPage() {
  return (
    <div className="container" style={{ paddingTop: 'var(--s5)' }}>
      <TestFlow />
      <SupportLine placement="test" />
    </div>
  )
}
