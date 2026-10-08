/**
 * Contrôles partagés par la recherche automatique (scripts/medias.ts) et l'import de recherches
 * faites à la main (scripts/medias-import.ts) : les deux voies obéissent aux mêmes règles.
 */

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')

/** La citation doit nommer au moins un propriétaire ou le contrôle final (un mot significatif suffit). */
export function quoteNamesOwner(quote: string, f: { controller: string; group: string; owners: { name: string }[] }): boolean {
  const q = norm(quote)
  const names = [f.controller, f.group, ...f.owners.map((o) => o.name)].filter(Boolean)
  return names.some((n) =>
    norm(n)
      .split(/[^\p{L}\p{N}]+/u)
      .filter((w) => w.length >= 4 && !['groupe', 'famille', 'societe', 'france', 'media', 'medias'].includes(w))
      .some((w) => q.includes(w)),
  )
}

/** Coupe à la dernière phrase complète sous la limite (jamais au milieu d'un mot). */
export function clip(t: string, max: number): string {
  if (t.length <= max) return t
  const cut = t.slice(0, max)
  const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('. '))
  return end > 40 ? cut.slice(0, end + 1) : cut.slice(0, cut.lastIndexOf(' ')) + '…'
}

export const ALERT_DOMAINS = ['arcom.fr', 'conseil-etat.fr', 'legifrance.gouv.fr']
export const OWNER_KINDS = ['entreprise', 'personne', 'famille', 'etat', 'association', 'fondation', 'salaries', 'lecteurs', 'fonds', 'autre'] as const
export const CONTROLLER_KINDS = ['personne', 'famille', 'etat', 'association', 'fondation', 'salaries', 'lecteurs', 'cotee', 'autre', 'inconnu'] as const
export const ALERT_KINDS = ['mise-en-demeure', 'mise-en-garde', 'sanction', 'avertissement', 'non-renouvellement', 'decision-conseil-etat', 'autre'] as const
export const ALERT_TOPICS = ['pluralisme', 'temps-de-parole', 'honnetete-information', 'independance-information', 'campagne-electorale', 'autre-politique'] as const
