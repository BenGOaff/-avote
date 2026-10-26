import type { Metadata } from 'next'
import { PageHeader } from '@/components/PageHeader'
import { UI_COPY } from '@/lib/copy'
import { DuelFlow } from './DuelFlow'

const T = UI_COPY.duel

export const metadata: Metadata = {
  title: 'Le duel : es-tu d’accord avec tes proches sur la présidentielle ?',
  description:
    'À deux sur un téléphone ou à distance par un lien, 24 questions chacun : le taux d’accord, vos plus gros désaccords et, si vous le voulez, le candidat le plus proche de chacun. Rien n’est enregistré.',
  alternates: { canonical: '/duel' },
}

export default function DuelPage() {
  return (
    <div className="container">
      <PageHeader kicker={T.kicker} title={T.title} lede={T.lede} />
      <div className="measure">
        <DuelFlow />
      </div>
    </div>
  )
}
