/**
 * Partage vers les réseaux sans aucun script tiers : de simples liens « intent » ouverts au clic,
 * la feuille de partage du téléphone quand elle sait joindre une image, sinon téléchargement + texte copié.
 * Rien n'est envoyé par le site : c'est la personne qui publie, avec ce qu'elle a choisi de montrer.
 */

export type ShareTarget = 'instagram' | 'facebook' | 'x' | 'linkedin' | 'whatsapp' | 'threads' | 'reddit' | 'bluesky' | 'telegram' | 'sms' | 'mail'

/** Nom affiché et format d'image conseillé pour chaque réseau. */
export const TARGETS: Record<ShareTarget, { label: string; image: 'portrait' | 'post' | 'story' | 'paysage' }> = {
  instagram: { label: 'Instagram', image: 'portrait' },
  facebook: { label: 'Facebook', image: 'portrait' },
  x: { label: 'X', image: 'portrait' },
  linkedin: { label: 'LinkedIn', image: 'portrait' },
  whatsapp: { label: 'WhatsApp', image: 'post' },
  threads: { label: 'Threads', image: 'portrait' },
  reddit: { label: 'Reddit', image: 'paysage' },
  bluesky: { label: 'Bluesky', image: 'portrait' },
  telegram: { label: 'Telegram', image: 'post' },
  sms: { label: 'SMS', image: 'post' },
  mail: { label: 'E-mail', image: 'paysage' },
}

/** Lien de la page, marqué pour savoir d'où viennent les visites (aucune donnée personnelle). */
export function trackedUrl(url: string, target: ShareTarget | 'copie' | 'autre'): string {
  const u = new URL(url)
  u.searchParams.set('utm_source', target)
  u.searchParams.set('utm_medium', 'partage')
  return u.toString()
}

const enc = encodeURIComponent

/** Lien de publication préremplie ; null quand le réseau n'en propose pas (Instagram). */
export function intentUrl(target: ShareTarget, { url, text, title }: { url: string; text: string; title: string }): string | null {
  const both = `${text}\n\n${url}`
  switch (target) {
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`
    case 'x':
      return `https://x.com/intent/post?text=${enc(text)}&url=${enc(url)}`
    case 'linkedin':
      return `https://www.linkedin.com/feed/?shareActive=true&text=${enc(both)}`
    case 'whatsapp':
      return `https://wa.me/?text=${enc(both)}`
    case 'threads':
      return `https://www.threads.net/intent/post?text=${enc(both)}`
    case 'reddit':
      return `https://www.reddit.com/submit?url=${enc(url)}&title=${enc(title)}`
    case 'bluesky':
      return `https://bsky.app/intent/compose?text=${enc(both)}`
    case 'telegram':
      return `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}`
    case 'sms':
      return `sms:?&body=${enc(both)}`
    case 'mail':
      return `mailto:?subject=${enc(title)}&body=${enc(both)}`
    case 'instagram':
      return null
  }
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export function download(file: File) {
  const href = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = href
  a.download = file.name
  a.click()
  setTimeout(() => URL.revokeObjectURL(href), 1000)
}

const canShareFile = (file: File) => typeof navigator !== 'undefined' && !!navigator.canShare?.({ files: [file] })
const isTouch = () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

export type ShareOutcome = 'shared' | 'opened' | 'image-saved' | 'instagram' | 'cancelled'

/**
 * Partage vers un réseau. Avec une image : sur téléphone, la feuille de partage joint l'image et le texte ;
 * sur ordinateur, l'image est enregistrée, le texte copié, puis la publication préremplie s'ouvre.
 * La fenêtre est ouverte avant tout `await` pour ne pas être bloquée par le navigateur.
 */
export async function shareTo(target: ShareTarget, opts: { url: string; text: string; title: string; file?: File | null }): Promise<ShareOutcome> {
  const url = trackedUrl(opts.url, target)
  const intent = intentUrl(target, { ...opts, url })
  const file = opts.file ?? null

  if (file && isTouch() && canShareFile(file)) {
    try {
      await navigator.share({ files: [file], text: `${opts.text}\n\n${url}`, title: opts.title })
      return 'shared'
    } catch {
      return 'cancelled'
    }
  }
  if (intent) {
    const app = intent.startsWith('sms:') || intent.startsWith('mailto:')
    const win = app ? null : window.open(intent, '_blank')
    if (win) win.opener = null
    else window.location.href = intent
  }
  if (target === 'instagram' || file) {
    if (file) download(file)
    await copyText(`${opts.text}\n\n${url}`)
    return target === 'instagram' ? 'instagram' : 'image-saved'
  }
  if (target === 'facebook') await copyText(opts.text)
  return 'opened'
}
