import legal from '@content/legal.json'

export const LEGAL = legal as {
  publisherName: string | null
  publisherLegalForm: string | null
  publisherAddress: string | null
  publisherSiret: string | null
  publicationDirector: string | null
  contactEmail: string
  host: { name: string; address: string; url: string }
  emailProvider: { name: string; url: string }
}

export const orTodo = (v: string | null) => v ?? 'à compléter'
/** Adresse affichée avec la cédille, lien mailto en punycode */
export const displayEmail = (e: string) => e.replace('xn--avote-xra.fr', 'çavote.fr')
