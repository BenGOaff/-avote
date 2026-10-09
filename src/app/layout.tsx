import type { Metadata, Viewport } from 'next'
import '@/styles/globals.css'
import { display, hand, serif, ui } from './fonts'
import { SITE } from '@/lib/copy'
import { SITE_URL } from '@/lib/site'
import { TopBar } from '@/components/TopBar'
import { TabBar } from '@/components/TabBar'
import { Footer } from '@/components/Footer'
import { ConsentBanner } from '@/components/ConsentBanner'
import { ServiceWorker } from '@/components/ServiceWorker'
import { Logo } from '@/components/Logo'

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: { default: 'Pour qui voter en 2027 ? Le test de Ça vote ?, sources à l’appui', template: '%s · Ça vote ?' },
  description: SITE.description,
  applicationName: 'Ça vote ?',
  manifest: '/manifest.webmanifest',
  alternates: { canonical: '/', types: { 'application/rss+xml': [{ url: '/feed.xml', title: 'Ça vote ? — Radar' }] } },
  openGraph: { type: 'website', locale: 'fr_FR', siteName: 'Ça vote ?', url: '/' },
  twitter: { card: 'summary_large_image' },
  appleWebApp: { capable: true, title: 'Ça vote ?', statusBarStyle: 'default' },
  formatDetection: { telephone: false },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F5F0E6' },
    { media: '(prefers-color-scheme: dark)', color: '#191919' },
  ],
}

// Applique thème et mode sobre avant le premier rendu (préférences d'affichage, non politiques).
const prefsScript = `try{var t=localStorage.getItem('ca-vote:theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t;if(localStorage.getItem('ca-vote:sobre')==='true')document.documentElement.dataset.sobre='true'}catch(e){}`

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'NewsMediaOrganization',
  name: 'Ça vote ?',
  url: SITE_URL.toString(),
  logo: new URL('/brand/symbole-512.png', SITE_URL).toString(),
  publishingPrinciples: new URL('/methodologie', SITE_URL).toString(),
  correctionsPolicy: new URL('/corrections', SITE_URL).toString(),
  ownershipFundingInfo: new URL('/independance', SITE_URL).toString(),
  inLanguage: 'fr-FR',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${ui.variable} ${serif.variable} ${hand.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: prefsScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      </head>
      <body>
        <a className="skip-link" href="#contenu">
          Aller au contenu
        </a>
        <TopBar logo={<Logo />} />
        <main id="contenu">{children}</main>
        <Footer />
        <TabBar />
        <ServiceWorker />
        <ConsentBanner />
      </body>
    </html>
  )
}
