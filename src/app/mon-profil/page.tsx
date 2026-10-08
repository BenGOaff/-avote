import type { Metadata } from 'next'
import { ProfileView } from './ProfileView'
import { PageHeader } from '@/components/PageHeader'

export const metadata: Metadata = { title: 'Mon profil', robots: { index: false, follow: false } }

export default function ProfilePage() {
  return (
    <div className="container">
      <PageHeader kicker="Mon profil" title="Ce qui est gardé sur cet appareil" lede="Ton profil n’existe que dans ce navigateur. Il n’y a pas de compte, donc rien à pirater chez nous." />
      <ProfileView />
    </div>
  )
}
