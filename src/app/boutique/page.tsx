import type { Metadata } from 'next'
import Script from 'next/script'
import { PageHeader } from '@/components/PageHeader'
import { UI_COPY } from '@/lib/copy'
import { LEGAL } from '@/lib/legal'
import { absolute } from '@/lib/site'

/**
 * Boutique intégrée : la vitrine Spreadshop affichée par son script, sur sa propre adresse (boutique.xn--avote-xra.fr,
 * voir next.config.mjs). Le navigateur isole cette adresse : le script de Spreadshirt ne peut rien lire de ce que le
 * site garde sur çavote.fr. Sur çavote.fr, /boutique renvoie vers cette adresse.
 */
const shop = LEGAL.shop
const t = UI_COPY.boutique

export const metadata: Metadata = {
  title: 'Boutique',
  description:
    'Tee-shirts, sweats, mugs et sacs de la présidentielle 2027 : des phrases pour chaque camp, et pour ceux qui hésitent. Vendus et livrés par Spreadshirt.',
  alternates: { canonical: shop.url },
}

// Configuration documentée par Spreadshop (intégration JavaScript). startToken : la page « Tous les produits » (/all)
// à l'ouverture. usePushState à false : la navigation dans la
// boutique reste après le # de l'adresse, sans pages fantômes sur le site
// La configuration doit exister avant le script : un seul bloc qui la pose, puis charge le script
const loader = `window.spread_shop_config=${JSON.stringify({ shopName: 'ca-vote', locale: 'fr_FR', prefix: shop.spreadshop, baseId: 'myShop', usePushState: false, startToken: 'all' })};var s=document.createElement('script');s.src=${JSON.stringify(`${shop.spreadshop}/shopfiles/shopclient/shopclient.nocache.js`)};document.body.appendChild(s);`

export default function BoutiquePage() {
  if (!shop.open)
    return (
      <div className="container">
        <PageHeader kicker={t.kicker} title="Pas encore ouverte." lede="Rien n’est en vente pour l’instant." />
      </div>
    )
  return (
    <>
      {/* En-tête discret : la vitrine a déjà son propre bandeau, elle doit arriver tout de suite à l'écran */}
      <div className="container">
        <header className="shop-head">
          <h1 className="shop-head__title">{t.title}</h1>
          <p className="small muted">{t.lede}</p>
        </header>
      </div>
      <div id="myShop" className="shop-embed">
        <p className="container small muted">
          {t.loading} <a href={`${shop.spreadshop}/all`}>ca-vote.myspreadshop.fr</a>
        </p>
      </div>
      <Script id="spreadshop" strategy="afterInteractive">
        {loader}
      </Script>

      <div className="container">
        <div className="measure stack section">
          <div className="card card--flat">
            <h2 style={{ fontSize: 'var(--h3)' }}>{t.rulesTitle}</h2>
            <ul style={{ margin: 0, paddingLeft: '1.2em' }}>
              {t.rules.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <p className="small" style={{ marginTop: 'var(--s3)' }}>
              {t.separate}
            </p>
            <p className="small" style={{ marginTop: 'var(--s3)' }}>
              <a href={absolute('/mentions-legales#boutique')}>{t.who}</a> · <a href={absolute('/confidentialite#boutique')}>{t.data}</a> ·{' '}
              <a href={absolute('/')}>{t.backToSite}</a>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
