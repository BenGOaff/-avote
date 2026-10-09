/** Page nominative officielle de la HATVP d'un candidat (content/acteurs/hatvp.json, depuis l'open data). */
import data from '@content/acteurs/hatvp.json'

const all = data as unknown as { pages: Record<string, { url: string; mandats: string[] }> }
export const hatvpOf = (slug: string) => all.pages[slug]
