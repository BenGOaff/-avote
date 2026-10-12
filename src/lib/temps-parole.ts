import 'server-only'
import data from '@content/medias/temps-parole.json'
import { BLOCS } from './nuances'

/**
 * Temps de parole politique publiés par l'Arcom, additionnés sur les trois derniers mois publiés (scripts/temps-parole.ts).
 * Parts calculées sur le total exécutif + partis, comme dans les relevés de l'Arcom. Aucun chiffre n'est retouché.
 */
export const SPEECH_SEGMENTS = [
  { id: 'EXG', label: BLOCS.find((b) => b.id === 'EXG')?.label ?? 'Extrême gauche' },
  { id: 'GAU', label: BLOCS.find((b) => b.id === 'GAU')?.label ?? 'Gauche' },
  { id: 'CENT', label: BLOCS.find((b) => b.id === 'CENT')?.label ?? 'Centre' },
  { id: 'DTE', label: BLOCS.find((b) => b.id === 'DTE')?.label ?? 'Droite' },
  { id: 'EXD', label: BLOCS.find((b) => b.id === 'EXD')?.label ?? 'Extrême droite' },
  { id: 'DIV', label: 'Divers et non classés' },
  { id: 'EXEC', label: 'Président et gouvernement' },
] as const

type Raw = { slug: string; service: string; blocs: Record<string, number>; executive: number; parties: Record<string, number> }

export interface SpeechChannel {
  slug: string
  service: string
  hours: number
  shares: { id: string; label: string; pct: number }[]
  top: { party: string; pct: number }[]
}

export function getSpeechTime(): { from: string; to: string; source: { title: string; publisher: string; url: string }; channels: SpeechChannel[] } {
  const channels = (data.channels as unknown as Raw[]).map((c) => {
    const total = Object.values(c.blocs).reduce((a, b) => a + b, 0) + c.executive
    const secs: Record<string, number> = { ...c.blocs, DIV: (c.blocs.DIV ?? 0) + (c.blocs.NC ?? 0), EXEC: c.executive }
    const pct = (s: number) => (total ? Math.round((1000 * s) / total) / 10 : 0)
    return {
      slug: c.slug,
      service: c.service,
      hours: Math.round(total / 360) / 10,
      shares: SPEECH_SEGMENTS.map((s) => ({ id: s.id, label: s.label, pct: pct(secs[s.id] ?? 0) })),
      top: Object.entries(c.parties)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([party, s]) => ({ party, pct: pct(s) })),
    }
  })
  return { from: data.from, to: data.to, source: data.source, channels }
}
