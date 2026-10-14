import type { Metadata } from 'next'
import { TestFlow } from './TestFlow'
import Link from 'next/link'
import { SupportLine } from '@/components/Support'
import { ExampleResult } from '@/components/ExampleResult'
import { UI_COPY } from '@/lib/copy'
import { liveCorpus, questionnaire } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Test et quiz présidentielle 2027 : pour qui voter ?',
  description: `${questionnaire.items.length} questions sur ce que tu veux pour le pays, du pouvoir d’achat aux animaux, avec une explication pour chacune. Le calcul se fait sur ton appareil.`,
  alternates: { canonical: '/test' },
}

const h = UI_COPY.home

export default function TestPage() {
  return (
    <div className="container" style={{ paddingTop: 'var(--s5)' }}>
      <TestFlow corpusVersion={liveCorpus.version} />
      <SupportLine placement="test" />
      {/* Ce que donne le test : utile avant de commencer, et lisible par les moteurs (page sinon presque vide sans JavaScript) */}
      <section className="section" aria-labelledby="obtiens">
        <div className="grid grid--2" style={{ alignItems: 'start' }}>
          <div>
            <h2 id="obtiens">{h.gainTitle}</h2>
            {h.gain.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <p>
              <Link href="/methodologie">{h.gainLink}</Link>
            </p>
          </div>
          <ExampleResult />
        </div>
      </section>
    </div>
  )
}
