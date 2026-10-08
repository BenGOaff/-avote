/**
 * Règles communes au codage automatique (scripts/positions.ts) et à l'import de recherches faites
 * hors API (scripts/positions-import.ts) : une position vérifiée s'écrit et se fusionne de la même façon.
 */
import { hashId } from './veille-lib'
import type { CorpusSource, Ordinal, Position, PositionBasis } from '../src/lib/engine/types'

export type Change = { date: string; actor: string; item: string; from: string; to: string; source?: string }

export const posLabel = (p: Position | undefined) => (!p || 'missing' in p ? 'inconnue' : 'set' in p ? `[${p.set.join(',')}]` : String(p.value))

/** Position dont la citation a été vérifiée dans la page `url` ; la source est ajoutée au référentiel si besoin. */
export function verifiedPosition(
  sources: CorpusSource[],
  p: { value: number | null; set: number[]; basis: string; quote: string; sourceTitle: string; publisher: string; date: string; note: string },
  url: string,
  now: string,
): Position {
  const srcId = hashId(url + p.quote)
  if (!sources.some((s) => s.id === srcId))
    sources.push({ id: srcId, title: p.sourceTitle.slice(0, 200) || url, publisher: p.publisher.slice(0, 100) || new URL(url).hostname, url, ...(p.date ? { date: p.date } : {}), passage: p.quote.slice(0, 320) })
  const set = [...new Set(p.set)].sort() as Ordinal[]
  const status = p.basis === 'parti' ? 'parti-uniquement' : p.basis === 'declaration' ? 'declaration-provisoire' : set.length > 1 ? 'ambigu' : 'explicite'
  const meta = { basis: p.basis as PositionBasis, codedBy: 'ia' as const, codedAt: now, ...(p.note ? { note: p.note.slice(0, 240) } : {}) }
  return p.value !== null && set.length <= 1 ? { value: p.value as Ordinal, status, sources: [srcId], ...meta } : { set: set.length ? set : [p.value as Ordinal], status, sources: [srcId], ...meta }
}

/** Écrit la position et journalise le changement ; une recherche infructueuse n'efface pas une position déjà vérifiée. */
export function mergePosition(current: Record<string, Position>, changes: Change[], actor: string, item: string, next: Position, now: string) {
  const prev = current[item]
  if ('missing' in next && prev && !('missing' in prev)) return
  if (posLabel(prev) !== posLabel(next)) changes.push({ date: now, actor, item, from: posLabel(prev), to: posLabel(next), ...('sources' in next ? { source: next.sources[0] } : {}) })
  current[item] = next
}
