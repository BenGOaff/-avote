/**
 * Données ouvertes, version tableur : une ligne par position documentée (candidat × affirmation), avec la citation et
 * sa source. Les positions non documentées n'ont pas de ligne : une absence n'est pas un avis intermédiaire.
 * Même contenu que /donnees.json, régénéré à chaque déploiement. Aucune donnée de votant n'y figure.
 */
import { liveCorpus, questionnaire } from '@/lib/data'

export const dynamic = 'force-static'

interface Pos {
  value?: number
  set?: number[]
  missing?: boolean
  status?: string
  basis?: string
  sources?: string[]
  note?: string
  codedBy?: string
  codedAt?: string
}
interface Source {
  id: string
  title?: string
  publisher?: string
  url?: string
  date?: string
  passage?: string
  archive?: string
}

const COLUMNS = [
  'candidat_id',
  'candidat',
  'parti',
  'theme',
  'affirmation_id',
  'affirmation',
  'valeur',
  'valeurs_possibles',
  'type_source',
  'citation',
  'source_titre',
  'source_editeur',
  'source_url',
  'source_date',
  'source_archive',
  'note',
  'code_par',
  'code_le',
] as const

const cell = (v: unknown) => {
  const s = v === undefined || v === null ? '' : String(v)
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function GET() {
  const items = questionnaire.items.filter((i) => !i.inactive)
  const themes = new Map(questionnaire.themes.map((t) => [t.id, t.label]))
  const sources = new Map(((liveCorpus as { sources?: Source[] }).sources ?? []).map((s) => [s.id, s]))
  const rows: string[] = [COLUMNS.join(',')]
  for (const a of liveCorpus.actors) {
    const ps = (liveCorpus.positions[a.slug] ?? {}) as Record<string, Pos>
    for (const i of items) {
      const p = ps[i.id]
      if (!p || p.missing || (p.value === undefined && !p.set?.length)) continue
      const src = (p.sources ?? []).map((id) => sources.get(id)).filter((s): s is Source => !!s)
      const join = (f: (s: Source) => string | undefined) => src.map(f).filter(Boolean).join(' | ')
      rows.push(
        [
          a.slug,
          a.name,
          (a as { party?: string }).party,
          themes.get(i.theme),
          i.id,
          i.text,
          p.value,
          p.set?.join('|'),
          p.basis,
          join((s) => s.passage),
          join((s) => s.title),
          join((s) => s.publisher),
          join((s) => s.url),
          join((s) => s.date),
          join((s) => s.archive),
          p.note,
          p.codedBy,
          p.codedAt?.slice(0, 10),
        ]
          .map(cell)
          .join(','),
      )
    }
  }
  return new Response(rows.join('\r\n') + '\r\n', {
    headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'inline; filename="cavote-positions.csv"' },
  })
}
