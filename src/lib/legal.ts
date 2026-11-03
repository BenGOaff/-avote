import legal from '@content/legal.json'

export const LEGAL = legal as {
  siteName: string
  contactEmail: string
  controllerName: string
  host: { name: string; address: string; url: string }
  emailProvider: { name: string; url: string }
  /**
   * Boutique : `open` passe à true quand la vitrine Spreadshop est activée et a des produits. `url` est la boutique
   * intégrée, sur sa propre adresse (boutique.çavote.fr), ouverte sur tous les produits (#!/all) ; `spreadshop` est la
   * vitrine chez Spreadshirt.
   */
  shop: { name: string; maker: string; url: string; spreadshop: string; open: boolean }
}

/** Adresse affichée avec la cédille, lien mailto en punycode */
export const displayEmail = (e: string) => e.replace('xn--avote-xra.fr', 'çavote.fr')
