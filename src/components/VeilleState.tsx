import type { VeilleStatus } from '@/lib/content'
import { formatDate, formatTime } from './Editorial'

/**
 * État réel de la veille (cahier §9.4) : une panne ne doit jamais s'afficher comme « aucune nouveauté ».
 * Calculé au build : la date affichée est celle de la dernière collecte publiée.
 */
export function VeilleState({ status, briefCount }: { status: VeilleStatus; briefCount: number }) {
  if (!status.lastRun) {
    return (
      <div className="alert alert--info">
        <p className="alert__title">La veille n’a pas encore démarré.</p>
        <p>Les premières brèves apparaîtront ici après leur vérification.</p>
      </div>
    )
  }
  const failing = status.feeds.filter((f) => !f.ok)
  const staleHours = status.lastSuccess ? (Date.now() - new Date(status.lastSuccess).getTime()) / 3_600_000 : Infinity
  return (
    <div className={`alert ${staleHours > 12 ? 'alert--correction' : 'alert--info'}`}>
      {staleHours > 12 ? (
        <p className="alert__title">Surveillance interrompue depuis le {status.lastSuccess ? `${formatDate(status.lastSuccess)} à ${formatTime(status.lastSuccess)}` : 'début'}.</p>
      ) : (
        <p className="alert__title">
          Dernière collecte : {formatDate(status.lastRun)} à {formatTime(status.lastRun)}.
        </p>
      )}
      <p className="small">
        {status.feeds.length - failing.length} flux sur {status.feeds.length} répondent.
        {failing.length > 0 && <> En échec : {failing.map((f) => f.name).join(', ')}.</>}
        {briefCount === 0 && ' Les pièces détectées sont en cours de vérification avant publication.'}
      </p>
    </div>
  )
}
