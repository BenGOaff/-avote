'use client'
/**
 * LocalVoterState — existe uniquement dans le navigateur (cahier §12, §19, §20).
 * Session : sessionStorage (effacé à la fermeture de l'onglet).
 * Local : IndexedDB, schéma versionné.
 * Aucune de ces données n'est envoyée au serveur, à un service tiers ou à une IA.
 */
import type { Answers, Priorities } from './engine/types'

export const SCHEMA_VERSION = 1

export interface LocalVoterState {
  schema: number
  persist: 'session' | 'local'
  questionSet: string
  answers: Answers
  /** Version de chaque item au moment de la réponse (une modification de sens redemande la réponse) */
  answeredVersions: Record<string, string>
  priorities: Priorities | null
  essentials: string[]
  hiddenActors: string[]
  corpusVersion: string | null
  /** Dernier index de question vu, pour reprendre */
  cursor: number
  updatedAt: string
}

const DB = 'ca-vote'
const STORE = 'state'
const KEY = 'voter'
const SESSION_KEY = 'ca-vote:voter'

export function emptyState(questionSet: string, persist: 'session' | 'local' = 'session'): LocalVoterState {
  return {
    schema: SCHEMA_VERSION,
    persist,
    questionSet,
    answers: {},
    answeredVersions: {},
    priorities: null,
    essentials: [],
    hiddenActors: [],
    corpusVersion: null,
    cursor: 0,
    updatedAt: new Date().toISOString(),
  }
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1)
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function idbGet<T>(): Promise<T | undefined> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const r = tx.objectStore(STORE).get(KEY)
    r.onsuccess = () => resolve(r.result as T | undefined)
    r.onerror = () => reject(r.error)
    tx.oncomplete = () => db.close()
  })
}

async function idbSet(value: unknown): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(value, KEY)
    tx.oncomplete = () => {
      db.close()
      resolve()
    }
    tx.onerror = () => reject(tx.error)
  })
}

/** Valide grossièrement la forme (fichier importé ou ancienne version). */
export function isValidState(x: unknown): x is LocalVoterState {
  if (!x || typeof x !== 'object') return false
  const s = x as Partial<LocalVoterState>
  return typeof s.schema === 'number' && typeof s.questionSet === 'string' && !!s.answers && typeof s.answers === 'object'
}

function migrate(s: LocalVoterState): LocalVoterState {
  // Schéma 1 : rien à migrer. Les futures migrations s'ajoutent ici, testées, sans perte.
  return { ...emptyState(s.questionSet, s.persist), ...s, schema: SCHEMA_VERSION }
}

export async function loadState(): Promise<LocalVoterState | null> {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as unknown
      if (isValidState(parsed)) return migrate(parsed)
    }
  } catch {
    /* stockage indisponible : on continue sans */
  }
  try {
    if (typeof indexedDB === 'undefined') return null
    const s = await idbGet<unknown>()
    if (isValidState(s)) return migrate(s)
  } catch {
    /* navigation privée ou stockage bloqué */
  }
  return null
}

export async function saveState(s: LocalVoterState): Promise<void> {
  const next = { ...s, updatedAt: new Date().toISOString() }
  if (next.persist === 'local') {
    try {
      await idbSet(next)
      sessionStorage.removeItem(SESSION_KEY)
      return
    } catch {
      /* repli sur la session si IndexedDB est indisponible */
    }
  }
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(next))
  } catch {
    /* rien à faire : le parcours continue en mémoire */
  }
}

/** Effacement intégral : profil, préférences, caches du site. */
export async function eraseAll(): Promise<void> {
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch {}
  try {
    for (const k of Object.keys(localStorage)) if (k.startsWith('ca-vote')) localStorage.removeItem(k)
  } catch {}
  await new Promise<void>((resolve) => {
    try {
      const r = indexedDB.deleteDatabase(DB)
      r.onsuccess = r.onerror = r.onblocked = () => resolve()
    } catch {
      resolve()
    }
  })
  try {
    if ('caches' in window) for (const k of await caches.keys()) await caches.delete(k)
  } catch {}
}

export function exportState(s: LocalVoterState): void {
  const blob = new Blob([JSON.stringify({ ...s, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'ca-vote-mon-profil.json'
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function importState(file: File): Promise<LocalVoterState> {
  if (file.size > 200_000) throw new Error('Fichier trop volumineux.')
  const parsed = JSON.parse(await file.text()) as unknown
  if (!isValidState(parsed)) throw new Error('Ce fichier ne ressemble pas à un profil Ça vote ?.')
  return migrate(parsed)
}

/** Préférences d'affichage (non politiques) */
export type ThemePref = 'auto' | 'light' | 'dark'
export function getPref<T extends string>(key: 'theme' | 'sobre', fallback: T): T {
  try {
    return (localStorage.getItem(`ca-vote:${key}`) as T | null) ?? fallback
  } catch {
    return fallback
  }
}
export function setPref(key: 'theme' | 'sobre', value: string): void {
  try {
    localStorage.setItem(`ca-vote:${key}`, value)
  } catch {}
}
