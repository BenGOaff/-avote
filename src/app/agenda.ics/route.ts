import { agendaUpdatedAt } from '@/lib/agenda'
import { agendaCalendar } from '@/lib/agenda-ics'

export const dynamic = 'force-static'

// Calendrier public auquel on s'abonne (webcal) : le même fichier pour tout le monde, aucun identifiant, aucun suivi.
export function GET() {
  return new Response(agendaCalendar(`${agendaUpdatedAt}T00:00:00Z`), {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  })
}
