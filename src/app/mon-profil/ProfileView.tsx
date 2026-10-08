'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { UI_COPY } from '@/lib/copy'
import { demoCorpus, liveCorpus, questionnaire as set } from '@/lib/data'
import { effectiveAnswers } from '@/lib/answers'
import { eraseAll, exportState, importState, loadState, saveState, type LocalVoterState } from '@/lib/local-store'

export function ProfileView() {
  const [state, setState] = useState<LocalVoterState | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [msg, setMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadState().then((s) => {
      setState(s)
      setLoaded(true)
    })
  }, [])

  if (!loaded) return <p aria-live="polite">Chargement…</p>

  const answers = effectiveAnswers(state, set)
  const answered = Object.keys(answers).length
  const outdated = state ? Object.keys(state.answers).length - answered : 0
  const corpus = liveCorpus.actors.length > 0 ? liveCorpus : demoCorpus
  const corpusChanged = !!state?.corpusVersion && state.corpusVersion !== corpus.version

  const switchPersist = async (persist: 'session' | 'local') => {
    if (!state) return
    if (persist === 'session') await eraseAll()
    const next = { ...state, persist }
    await saveState(next)
    setState(next)
    setMsg(persist === 'local' ? 'Ton profil est maintenant gardé sur cet appareil.' : 'Ton profil sera effacé à la fermeture de l’onglet.')
  }

  return (
    <div className="stack narrow" style={{ margin: 'var(--s5) 0 0' }}>
      <p role="status" aria-live="polite">
        {msg}
      </p>
      {!state ? (
        <div className="card">
          <p>Aucun profil sur cet appareil.</p>
          <div className="row">
            <Link className="btn btn--highlight" href="/test">
              Faire le test
            </Link>
            <button className="btn btn--secondary" onClick={() => fileRef.current?.click()}>
              Importer un fichier de profil
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="card">
            <dl className="dl">
              <dt>Réponses</dt>
              <dd>
                {answered} sur {set.items.length}
              </dd>
              <dt>Priorités</dt>
              <dd>{state.priorities ? 'Réparties' : 'Égales'}</dd>
              <dt>Lignes rouges</dt>
              <dd>{state.essentials.length}</dd>
              <dt>Conservation</dt>
              <dd>{state.persist === 'local' ? 'Sur cet appareil' : 'Jusqu’à la fermeture de l’onglet'}</dd>
              <dt>Questions</dt>
              <dd>v{set.version}</dd>
              <dt>Mis à jour</dt>
              <dd>{new Date(state.updatedAt).toLocaleString('fr-FR')}</dd>
            </dl>
          </div>
          {outdated > 0 && (
            <div className="alert alert--info">
              {outdated} question{outdated > 1 ? 's ont' : ' a'} changé de sens depuis ta réponse. <Link href="/test">Y répondre à nouveau</Link>
            </div>
          )}
          {corpusChanged && (
            <div className="alert alert--info">
              Le référentiel des positions a changé depuis ton dernier passage. <Link href="/resultats">Recalculer mes résultats</Link> ·{' '}
              <Link href="/corrections">Voir ce qui a changé</Link>
            </div>
          )}
          <div className="row">
            <Link className="btn" href="/resultats">
              Mes résultats
            </Link>
            <Link className="btn btn--secondary" href="/test">
              Reprendre le test
            </Link>
          </div>
          <section className="card card--flat stack">
            <h2 style={{ fontSize: 'var(--h3)' }}>Conservation</h2>
            <div className="row">
              <button className={`btn btn--small ${state.persist === 'local' ? '' : 'btn--secondary'}`} onClick={() => switchPersist('local')}>
                {UI_COPY.storage.local}
              </button>
              <button className={`btn btn--small ${state.persist === 'session' ? '' : 'btn--secondary'}`} onClick={() => switchPersist('session')}>
                {UI_COPY.storage.session}
              </button>
            </div>
            <p className="hint">{UI_COPY.storage.localHint}</p>
          </section>
          <section className="card card--flat stack">
            <h2 style={{ fontSize: 'var(--h3)' }}>Changer d’appareil</h2>
            <p className="small">
              Il n’y a pas de synchronisation. Tu peux exporter un fichier et l’importer ailleurs. Ce fichier contient tes réponses politiques : garde-le pour
              toi.
            </p>
            <div className="row">
              <button className="btn btn--secondary btn--small" onClick={() => exportState(state)}>
                Exporter
              </button>
              <button className="btn btn--secondary btn--small" onClick={() => fileRef.current?.click()}>
                Importer
              </button>
            </div>
          </section>
          <section className="card card--flat stack">
            <h2 style={{ fontSize: 'var(--h3)' }}>Tout effacer</h2>
            <p className="small">Réponses, jetons, lignes rouges, préférences d’affichage et fichiers mis en cache par le site. C’est immédiat et définitif.</p>
            <button
              className="btn btn--small"
              style={{ background: 'var(--correction)', borderColor: 'var(--correction)', color: '#fff' }}
              onClick={async () => {
                if (!window.confirm('Effacer définitivement ton profil de cet appareil ?')) return
                await eraseAll()
                setState(null)
                setMsg('Tout a été effacé de cet appareil.')
              }}
            >
              {UI_COPY.erase}
            </button>
          </section>
        </>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        hidden
        onChange={async (e) => {
          const f = e.target.files?.[0]
          if (!f) return
          try {
            const s = await importState(f)
            await saveState(s)
            setState(s)
            setMsg('Profil importé.')
          } catch (err) {
            setMsg(err instanceof Error ? err.message : 'Import impossible.')
          }
        }}
      />
    </div>
  )
}
