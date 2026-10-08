import legal from '@content/legal.json'

export const LEGAL = legal as {
  siteName: string
  contactEmail: string
  controllerName: string
  host: { name: string; address: string; url: string }
  emailProvider: { name: string; url: string }
}

/** Adresse affichée avec la cédille, lien mailto en punycode */
export const displayEmail = (e: string) => e.replace('xn--avote-xra.fr', 'çavote.fr')
