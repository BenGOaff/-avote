/**
 * Ce qu'il reste à faire à la main pour un candidat ajouté automatiquement : portrait, site officiel, nuance.
 * Sert de corps à l'issue GitHub ouverte par la veille (la rédaction est prévenue par GitHub).
 *
 * Usage : npx tsx scripts/a-completer.ts <slug>
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const slug = process.argv[2] ?? ''
const cand = (JSON.parse(readFileSync(path.join(ROOT, 'content/acteurs/candidatures.json'), 'utf8')) as {
  actors: { slug: string; name: string; party?: string; status: string; since: string; source: { title: string; publisher: string; url: string }; links?: unknown[] }[]
}).actors.find((a) => a.slug === slug)
if (!cand) {
  console.error(`candidat inconnu : ${slug}`)
  process.exit(1)
}
const nuances = JSON.parse(readFileSync(path.join(ROOT, 'content/acteurs/nuances.json'), 'utf8')) as { actors: Record<string, unknown> }
const portrait = ['webp', 'png', 'jpg'].some((e) => existsSync(path.join(ROOT, `public/img/candidats/${slug}.${e}`)))
const box = (done: boolean, text: string) => `- [${done ? 'x' : ' '}] ${text}`
console.log(
  [
    `**${cand.name}**${cand.party ? ` (${cand.party})` : ''} a été ajouté automatiquement le ${cand.since}.`,
    `Source : [${cand.source.publisher}, « ${cand.source.title} »](${cand.source.url})`,
    '',
    'La recherche de ses positions est lancée. Reste à faire :',
    '',
    box(portrait, `Portrait : déposer l'image dans le dossier \`candidats/\` (elle sera convertie en \`public/img/candidats/${slug}.webp\`)`),
    box(Boolean(cand.links?.length), 'Site officiel : ajouter son site de campagne ou son programme (champ `links`), pour que le guetteur de programmes le suive'),
    box(slug in nuances.actors, 'Nuance politique : à classer selon la grille du ministère de l’Intérieur (`content/acteurs/nuances.json`)'),
    '',
    'Si cette candidature est une erreur, dis-le en commentaire : elle sera retirée.',
  ].join('\n'),
)
