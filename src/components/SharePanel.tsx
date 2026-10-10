'use client'
import { useEffect, useState } from 'react'
import { UI_COPY } from '@/lib/copy'
import { copyText, shareTo, TARGETS, trackedUrl, type ShareOutcome, type ShareTarget } from '@/lib/share'

const t = UI_COPY.partage
const ORDER: ShareTarget[] = ['instagram', 'facebook', 'x', 'linkedin', 'whatsapp', 'threads', 'reddit', 'bluesky', 'telegram', 'sms', 'mail']

const MESSAGES: Partial<Record<ShareOutcome, string>> = { 'image-saved': t.imageSaved, instagram: t.instagram }

/**
 * Bloc de partage : un bouton par réseau, publication préremplie, lien vers la page.
 * `image` fournit le visuel au format du réseau (studio, carte de publication) ; sans image, le réseau
 * affiche l'aperçu de la page. Aucun script tiers : de simples liens ouverts au clic.
 */
export function SharePanel({
  url,
  text,
  title,
  image,
  imageSrc,
  onPick,
}: {
  url: string
  text: string
  title: string
  image?: (target: ShareTarget) => Promise<File | null>
  /** Visuel déjà prêt sur le site (ex. /social/<id>/carte.png), joint tel quel */
  imageSrc?: string
  /** Le studio redessine l'image au format du réseau choisi */
  onPick?: (target: ShareTarget) => void
}) {
  const [status, setStatus] = useState('')
  const getImage = image ?? (imageSrc ? imageFromUrl(imageSrc, 'ca-vote.png') : undefined)
  // La feuille de partage du téléphone n'existe que côté navigateur : on l'affiche après le premier rendu
  const [native, setNative] = useState(false)
  useEffect(() => setNative('share' in navigator), [])
  const go = async (target: ShareTarget) => {
    onPick?.(target)
    const file = getImage ? await getImage(target) : null
    const out = await shareTo(target, { url, text, title, file })
    setStatus(MESSAGES[out] ?? (target === 'facebook' ? t.textCopied : ''))
  }
  const more = async () => {
    const link = trackedUrl(url, 'autre')
    const file = getImage ? await getImage('instagram') : null
    try {
      await navigator.share(file && navigator.canShare?.({ files: [file] }) ? { files: [file], text: `${text}\n\n${link}`, title } : { text, url: link, title })
    } catch {
      /* partage annulé */
    }
  }
  const copy = async () => {
    if (await copyText(trackedUrl(url, 'copie'))) setStatus(t.copied)
  }
  return (
    <div className="share" role="group" aria-label={t.title}>
      <p className="kicker" style={{ margin: 0 }}>
        {t.title}
      </p>
      <div className="chips" style={{ marginTop: 'var(--s2)' }}>
        {ORDER.map((k) => (
          <button key={k} type="button" className="chip" onClick={() => go(k)}>
            {TARGETS[k].label}
          </button>
        ))}
        {native && (
          <button type="button" className="chip" onClick={more}>
            {t.more}
          </button>
        )}
        <button type="button" className="chip" onClick={copy}>
          {t.copy}
        </button>
      </div>
      <p role="status" className="small muted" style={{ minHeight: '1.5em', margin: 'var(--s2) 0 0' }}>
        {status}
      </p>
    </div>
  )
}

/** Image d'une URL du site (visuel déjà prêt) transformée en fichier à joindre. */
export function imageFromUrl(src: string, name: string) {
  return async (): Promise<File | null> => {
    try {
      const res = await fetch(src)
      if (!res.ok) return null
      return new File([await res.blob()], name, { type: res.headers.get('content-type') ?? 'image/png' })
    } catch {
      return null
    }
  }
}
