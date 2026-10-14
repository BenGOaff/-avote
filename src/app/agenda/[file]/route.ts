import { agendaUpdatedAt, getAgenda, getAgendaEvent } from '@/lib/agenda'
import { eventCalendar } from '@/lib/agenda-ics'

export const dynamic = 'force-static'
export const dynamicParams = false

/** Un fichier par rendez-vous : /agenda/<id>.ics */
export function generateStaticParams() {
  return getAgenda().map((e) => ({ file: `${e.id}.ics` }))
}

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params
  const e = getAgendaEvent(file.replace(/\.ics$/, ''))
  if (!e) return new Response('Introuvable', { status: 404 })
  return new Response(eventCalendar(e, `${agendaUpdatedAt}T00:00:00Z`), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${e.id}.ics"`,
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
