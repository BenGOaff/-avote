/**
 * Synthèse et remarque des fiches candidats (content/acteurs/fiches.json).
 *
 * Même consigne pour tous les candidats. La synthèse et la remarque ne s'appuient que sur les positions
 * codées et leurs citations vérifiées : aucun fait extérieur, aucun chiffre absent des citations.
 * Usage : ANTHROPIC_API_KEY=… npx tsx scripts/fiches.ts [--actor=slug]
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import Anthropic from '@anthropic-ai/sdk'
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod'
import { z } from 'zod'
import { numbersAreSourced, styleViolations } from './veille-lib'
import type { Corpus, CorpusSource, Position } from '../src/lib/engine/types'

const ROOT = process.cwd()
const ONLY = process.argv.find((a) => a.startsWith('--actor='))?.split('=')[1]
const MODEL = process.env.POSITIONS_MODEL || process.env.VEILLE_MODEL || 'claude-opus-5-5'
const OUT = path.join(ROOT, 'content/acteurs/fiches.json')
const MIN_KNOWN = 5

const VOICE = readFileSync(path.join(ROOT, 'content/voix/profil-vocal.md'), 'utf8')
const questionnaire = JSON.parse(readFileSync(path.join(ROOT, 'content/questionnaire/v0.1.0.json'), 'utf8')) as {
  themes: { id: string; label: string }[]
  items: { id: string; theme: string; text: string }[]
}
const live = JSON.parse(readFileSync(path.join(ROOT, 'content/corpus/live.json'), 'utf8')) as Corpus & { sources: CorpusSource[] }
const fiches: Record<string, { analysis: string; remark: string; basedOn: string; generatedAt: string; model: string }> = existsSync(OUT)
  ? JSON.parse(readFileSync(OUT, 'utf8'))
  : {}

const SCALE = ['tout à fait opposé', 'plutôt opposé', 'position intermédiaire', 'plutôt favorable', 'tout à fait favorable']
const label = (p: Position) => ('value' in p ? SCALE[p.value + 2] : 'set' in p ? `entre « ${SCALE[Math.min(...p.set) + 2]} » et « ${SCALE[Math.max(...p.set) + 2]} »` : 'inconnue')

const Out = z.object({
  analysis: z.string().describe('3 à 4 phrases : ce qui ressort des positions documentées, thème par thème quand c’est utile, et où les positions manquent'),
  remark: z.string().describe('Une phrase de commentaire sec, facultative (chaîne vide sinon), qui porte sur le discours ou les manques, jamais sur la personne'),
})

const client = new Anthropic()

async function main() {
  const sources = new Map(live.sources.map((s) => [s.id, s]))
  for (const actor of live.actors.filter((a) => !ONLY || a.slug === ONLY)) {
    const pos = live.positions[actor.slug] ?? {}
    const known = Object.entries(pos).filter(([, p]) => !('missing' in p))
    if (known.length < MIN_KNOWN) continue
    const unknownThemes = questionnaire.themes
      .map((t) => ({ t, n: questionnaire.items.filter((i) => i.theme === t.id && (!pos[i.id] || 'missing' in pos[i.id]!)).length }))
      .filter((x) => x.n >= 3)
      .map((x) => x.t.label)
    const lines = known.map(([id, p]) => {
      const item = questionnaire.items.find((i) => i.id === id)
      const src = 'sources' in p ? sources.get(p.sources[0] ?? '') : undefined
      return `- « ${item?.text} » : ${label(p)}${'basis' in p && p.basis ? ` (${p.basis})` : ''}. Citation : « ${src?.passage ?? ''} »`
    })
    const sourceText = known.map(([, p]) => ('sources' in p ? sources.get(p.sources[0] ?? '')?.passage ?? '' : '')).join(' ')
    const res = await client.beta.messages.parse({
      model: MODEL,
      max_tokens: 4000,
      system: [
        {
          type: 'text',
          text: `${VOICE}\n\n## Tâche\nTu écris la synthèse de la fiche d'un candidat à la présidentielle 2027, à partir des seules positions codées fournies. La même consigne s'applique à tous les candidats. N'ajoute aucun fait, aucune date, aucun chiffre, aucune qualification politique (« gauche », « droite », « extrême ») qui ne figure pas dans les citations. Pas de jugement sur la personne.`,
          cache_control: { type: 'ephemeral' },
        },
      ],
      output_config: { effort: 'high', format: betaZodOutputFormat(Out) },
      messages: [
        {
          role: 'user',
          content: `Candidat : ${actor.name}${actor.party ? ` (${actor.party})` : ''}\n\nPositions documentées :\n${lines.join('\n')}\n\nThèmes où il manque au moins 3 positions : ${unknownThemes.join(', ') || 'aucun'}.`,
        },
      ],
    })
    const out = res.parsed_output
    if (res.stop_reason === 'refusal' || !out) continue
    const all = `${out.analysis} ${out.remark}`
    if (styleViolations(all).length || numbersAreSourced(all, sourceText).length || out.analysis.length > 900 || out.remark.length > 220) {
      console.warn(`${actor.name} : synthèse rejetée par les contrôles`)
      continue
    }
    fiches[actor.slug] = { analysis: out.analysis.trim(), remark: out.remark.trim(), basedOn: live.version, generatedAt: new Date().toISOString(), model: MODEL }
    console.log(`${actor.name} : synthèse écrite`)
  }
  writeFileSync(OUT, JSON.stringify(fiches, null, 2) + '\n')
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
