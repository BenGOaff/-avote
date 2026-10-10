'use client'
import { SharePanel } from './SharePanel'

/** Partage d'une page : publication préremplie vers chaque réseau, l'aperçu vient de la page elle-même. */
export function ShareButtons({ title, url, text }: { title: string; url: string; text?: string }) {
  return <SharePanel url={url} title={title} text={text ?? title} />
}
