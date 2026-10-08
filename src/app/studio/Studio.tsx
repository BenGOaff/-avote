'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { loadState } from '@/lib/local-store'
import { questionnaire } from '@/lib/data'
import { IconDownload } from '@/components/Icons'

/**
 * Studio de partage (cahier §16) : rendu canvas local, polices embarquées, aucun envoi.
 * Par défaut : aucune mention de candidat, d'identité ou d'intention de vote.
 */

type FormatId = 'post' | 'story' | 'paysage' | 'wallpaper' | 'avatar'
const FORMATS: Record<FormatId, { label: string; w: number; h: number; hint: string }> = {
  wallpaper: { label: 'Fond d’écran', w: 1440, h: 2560, hint: 'Zone libre en haut pour l’heure et en bas pour les icônes.' },
  avatar: { label: 'Photo de profil', w: 1080, h: 1080, hint: 'Lisible même rognée en cercle.' },
  post: { label: 'Post carré', w: 1080, h: 1080, hint: 'Instagram, Facebook, LinkedIn.' },
  story: { label: 'Story', w: 1080, h: 1920, hint: 'Marges hautes et basses laissées libres pour l’interface.' },
  paysage: { label: 'Paysage', w: 1200, h: 630, hint: 'X, Bluesky, aperçu de lien.' },
}

type Palette = 'papier' | 'encre' | 'jaune'
const PALETTES: Record<Palette, { bg: string; fg: string; label: string; logo: string }> = {
  papier: { bg: '#F5F0E6', fg: '#191919', label: 'Papier', logo: '/brand/logo-horizontal.svg' },
  encre: { bg: '#191919', fg: '#F5F0E6', label: 'Encre', logo: '/brand/logo-horizontal-clair.svg' },
  jaune: { bg: '#FFE34D', fg: '#191919', label: 'Jaune', logo: '/brand/logo-horizontal.svg' },
}

type Style = 'manifeste' | 'une'

const PHRASES = [
  'Je vote. Je ne sais pas encore pour qui.',
  'J’ai lu le programme. Page 12 comprise.',
  'Indécis, pas indifférent.',
  'Indécise, pas indifférente.',
  'Je veux voir les sources.',
  '2027 : j’ai des questions.',
  'Le montant est précis. Le financement, moins.',
  'Tout le monde promet. Je compare.',
]

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function cssFamily(varName: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
  return v || fallback
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = w
    } else line = test
  }
  if (line) lines.push(line)
  return lines
}

/** Taille de police maximale pour que le texte tienne dans la boîte. */
function fitText(ctx: CanvasRenderingContext2D, text: string, family: string, maxW: number, maxH: number, maxSize: number, lh = 1.08) {
  for (let size = maxSize; size > 24; size -= 4) {
    ctx.font = `${size}px ${family}`
    const lines = wrap(ctx, text, maxW)
    if (lines.length * size * lh <= maxH && lines.every((l) => ctx.measureText(l).width <= maxW)) return { size, lines }
  }
  ctx.font = `24px ${family}`
  return { size: 24, lines: wrap(ctx, text, maxW) }
}

export function Studio() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [format, setFormat] = useState<FormatId>('wallpaper')
  const [palette, setPalette] = useState<Palette>('papier')
  const [style, setStyle] = useState<Style>('manifeste')
  const [phrase, setPhrase] = useState(PHRASES[0]!)
  const [custom, setCustom] = useState('')
  const [headline, setHeadline] = useState('Le candidat promet tout. Le tableur demande des précisions.')
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null)
  const [priorityTheme, setPriorityTheme] = useState<string | null>(null)
  const [usePriority, setUsePriority] = useState(false)
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)

  // Priorité principale lue localement, seulement si l'utilisateur choisit de l'afficher
  useEffect(() => {
    loadState().then((s) => {
      if (!s?.priorities) return
      const top = Object.entries(s.priorities).sort((a, b) => b[1] - a[1])[0]
      if (top && top[1] > 0) setPriorityTheme(questionnaire.themes.find((t) => t.id === top[0])?.label ?? null)
    })
  }, [])

  const text = useMemo(() => {
    if (usePriority && priorityTheme) return `Ma priorité pour 2027 : ${priorityTheme.toLowerCase()}.`
    return custom.trim() || phrase
  }, [custom, phrase, usePriority, priorityTheme])

  useEffect(() => {
    let cancelled = false
    const draw = async () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const f = FORMATS[format]
      const p = PALETTES[palette]
      canvas.width = f.w
      canvas.height = f.h
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const display = cssFamily('--ff-display', 'Arial Black')
      const ui = cssFamily('--ff-ui', 'Arial')
      const serif = cssFamily('--ff-serif', 'Georgia')
      await Promise.all([document.fonts.load(`80px ${display}`), document.fonts.load(`700 40px ${ui}`), document.fonts.load(`40px ${serif}`)]).catch(() => {})
      const [symbol, logo] = await Promise.all([loadImage('/brand/symbole.svg'), loadImage(p.logo)])
      if (cancelled) return

      ctx.fillStyle = p.bg
      ctx.fillRect(0, 0, f.w, f.h)
      const m = Math.round(Math.min(f.w, f.h) * 0.08)

      if (format === 'avatar') {
        // Photo facultative recadrée au centre, puis le signe en pastille
        if (photo) {
          const s = Math.max(f.w / photo.width, f.h / photo.height)
          const w = photo.width * s
          const h = photo.height * s
          ctx.drawImage(photo, (f.w - w) / 2, (f.h - h) / 2, w, h)
          const size = f.w * 0.34
          ctx.drawImage(symbol, f.w * 0.6, f.h * 0.6, size, size)
        } else {
          const size = f.w * 0.62
          ctx.drawImage(symbol, (f.w - size) / 2, (f.h - size) / 2 - f.h * 0.04, size, size)
          ctx.fillStyle = p.fg
          ctx.font = `700 ${Math.round(f.w * 0.055)}px ${ui}`
          ctx.textAlign = 'center'
          ctx.fillText('2027', f.w / 2, f.h * 0.86)
        }
        return
      }

      // Zones réservées : horloge et dock (fond d'écran), interface (story)
      const top = format === 'wallpaper' ? f.h * 0.3 : format === 'story' ? f.h * 0.16 : m
      const bottom = format === 'wallpaper' ? f.h * 0.82 : format === 'story' ? f.h * 0.8 : f.h - m
      const left = m
      const width = f.w - 2 * m

      if (style === 'une') {
        // Une de journal fictive, identifiée comme telle
        ctx.fillStyle = p.fg
        const mast = Math.round(width * 0.11)
        ctx.font = `${mast}px ${display}`
        ctx.textBaseline = 'top'
        ctx.textAlign = 'left'
        ctx.fillText('ÇA VOTE', left, top)
        const mw = ctx.measureText('ÇA VOTE').width
        ctx.drawImage(symbol, left + mw + mast * 0.15, top - mast * 0.12, mast * 1.15, mast * 1.15)
        ctx.fillRect(left, top + mast * 1.25, width, Math.max(3, f.w * 0.004))
        ctx.font = `600 ${Math.round(mast * 0.28)}px ${ui}`
        ctx.fillText(`Une fictive · ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`, left, top + mast * 1.4)
        const hTop = top + mast * 2.1
        const { size, lines } = fitText(ctx, headline || ' ', display, width, (bottom - hTop) * 0.82, Math.round(width * 0.14))
        ctx.font = `${size}px ${display}`
        lines.forEach((l, i) => ctx.fillText(l, left, hTop + i * size * 1.08))
        ctx.font = `700 ${Math.round(mast * 0.26)}px ${ui}`
        ctx.textBaseline = 'alphabetic'
        ctx.fillText('SATIRE — çavote.fr', left, bottom)
        return
      }

      // Manifeste typographique
      const logoH = Math.round(Math.min(f.w, f.h) * 0.07)
      const logoW = (logo.width / logo.height) * logoH
      const textBottom = bottom - logoH * 2
      ctx.fillStyle = p.fg
      ctx.textBaseline = 'top'
      ctx.textAlign = 'left'
      const { size, lines } = fitText(ctx, text, display, width * 0.92, textBottom - top, Math.round(width * 0.16))
      ctx.font = `${size}px ${display}`
      const blockH = lines.length * size * 1.08
      const y0 = top + (textBottom - top - blockH) / 2
      // Surlignage jaune sous la dernière ligne, dessiné avant le texte (geste fixe, charte §7)
      if (palette === 'papier') {
        const last = lines[lines.length - 1] ?? ''
        const lw = ctx.measureText(last).width
        ctx.fillStyle = '#FFE34D'
        ctx.fillRect(left - size * 0.05, y0 + (lines.length - 1) * size * 1.08 + size * 0.5, lw + size * 0.1, size * 0.42)
      }
      ctx.fillStyle = p.fg
      lines.forEach((l, i) => ctx.fillText(l, left, y0 + i * size * 1.08))
      ctx.drawImage(logo, left, bottom - logoH, logoW, logoH)
      ctx.fillStyle = p.fg
      ctx.font = `600 ${Math.round(logoH * 0.42)}px ${ui}`
      ctx.textAlign = 'right'
      ctx.textBaseline = 'alphabetic'
      ctx.fillText('çavote.fr', f.w - m, bottom - logoH * 0.25)
    }
    draw()
      .then(() => !cancelled && setReady(true))
      .catch(() => !cancelled && setReady(true))
    return () => {
      cancelled = true
    }
  }, [format, palette, style, text, headline, photo])

  const onPhoto = (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/') || file.size > 15_000_000) return
    const url = URL.createObjectURL(file)
    loadImage(url)
      .then(setPhoto)
      .finally(() => URL.revokeObjectURL(url))
  }

  const exportImage = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    setBusy(true)
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/png'))
    setBusy(false)
    if (!blob) return
    const file = new File([blob], `ca-vote-${format}.png`, { type: 'image/png' })
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Ça vote ?' })
        return
      } catch {
        /* annulé : on propose le téléchargement */
      }
    }
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const f = FORMATS[format]
  return (
    <div className="grid grid--2" style={{ marginTop: 'var(--s5)', alignItems: 'start' }}>
      <div className="stack">
        <fieldset className="card card--flat">
          <legend className="kicker" style={{ margin: 0 }}>
            Format
          </legend>
          <div className="row" role="radiogroup" aria-label="Format">
            {(Object.keys(FORMATS) as FormatId[]).map((k) => (
              <button key={k} role="radio" aria-checked={format === k} className={`btn btn--small ${format === k ? '' : 'btn--secondary'}`} onClick={() => setFormat(k)}>
                {FORMATS[k].label}
              </button>
            ))}
          </div>
          <p className="hint" style={{ margin: 'var(--s2) 0 0' }}>
            {f.w} × {f.h} px. {f.hint}
          </p>
        </fieldset>

        <fieldset className="card card--flat">
          <legend className="kicker" style={{ margin: 0 }}>
            Couleurs
          </legend>
          <div className="row" role="radiogroup" aria-label="Couleurs">
            {(Object.keys(PALETTES) as Palette[]).map((k) => (
              <button key={k} role="radio" aria-checked={palette === k} className={`btn btn--small ${palette === k ? '' : 'btn--secondary'}`} onClick={() => setPalette(k)}>
                <span aria-hidden="true" style={{ width: 16, height: 16, borderRadius: 3, border: '1.5px solid currentColor', background: PALETTES[k].bg }} />
                {PALETTES[k].label}
              </button>
            ))}
          </div>
        </fieldset>

        {format === 'avatar' ? (
          <div className="card card--flat field">
            <label htmlFor="photo">Ta photo (facultatif)</label>
            <input id="photo" type="file" accept="image/*" onChange={(e) => onPhoto(e.target.files?.[0])} />
            <p className="hint" style={{ margin: 0 }}>
              La photo reste sur ton appareil. Sans photo, l’avatar affiche le signe seul.
            </p>
            {photo && (
              <button className="btn btn--ghost btn--small" onClick={() => setPhoto(null)}>
                Retirer la photo
              </button>
            )}
          </div>
        ) : (
          <fieldset className="card card--flat">
            <legend className="kicker" style={{ margin: 0 }}>
              Style
            </legend>
            <div className="row" role="radiogroup" aria-label="Style">
              <button role="radio" aria-checked={style === 'manifeste'} className={`btn btn--small ${style === 'manifeste' ? '' : 'btn--secondary'}`} onClick={() => setStyle('manifeste')}>
                Manifeste
              </button>
              <button role="radio" aria-checked={style === 'une'} className={`btn btn--small ${style === 'une' ? '' : 'btn--secondary'}`} onClick={() => setStyle('une')}>
                Une de journal
              </button>
            </div>
            {style === 'manifeste' ? (
              <div className="stack" style={{ marginTop: 'var(--s4)' }}>
                <div className="field">
                  <label htmlFor="phrase">Phrase</label>
                  <select id="phrase" className="input" value={phrase} onChange={(e) => setPhrase(e.target.value)} disabled={!!custom.trim() || usePriority}>
                    {PHRASES.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="custom">Ou ta propre phrase</label>
                  <input id="custom" className="input" maxLength={90} value={custom} onChange={(e) => setCustom(e.target.value)} disabled={usePriority} />
                </div>
                {priorityTheme && (
                  <label className="checkbox">
                    <input type="checkbox" checked={usePriority} onChange={(e) => setUsePriority(e.target.checked)} />
                    <span>
                      Afficher ma priorité du test : <strong>{priorityTheme}</strong>
                      <br />
                      <span className="hint">Décoché par défaut. Ton image dira ce que tu choisis d’y mettre, rien de plus.</span>
                    </span>
                  </label>
                )}
              </div>
            ) : (
              <div className="field" style={{ marginTop: 'var(--s4)' }}>
                <label htmlFor="headline">Ton gros titre</label>
                <textarea id="headline" className="input" rows={3} maxLength={110} value={headline} onChange={(e) => setHeadline(e.target.value)} />
                <p className="hint" style={{ margin: 0 }}>
                  L’image porte la mention « Une fictive » et « Satire ». N’y mets pas de fausse citation attribuée à une personne réelle.
                </p>
              </div>
            )}
          </fieldset>
        )}

        <button className="btn btn--highlight" onClick={exportImage} disabled={!ready || busy}>
          <IconDownload width={20} height={20} /> {busy ? 'Préparation…' : 'Enregistrer ou partager'}
        </button>
      </div>

      <figure style={{ margin: 0, position: 'sticky', top: 'calc(var(--topbar-h) + 16px)' }}>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`Aperçu : ${format === 'avatar' ? 'photo de profil' : style === 'une' ? headline : text}`}
          style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', border: 'var(--border) solid var(--ink)', borderRadius: 'var(--radius)', background: 'var(--surface)' }}
        />
        <figcaption className="hint" style={{ marginTop: 'var(--s2)' }}>
          Aperçu. Vérifie le texte avant de publier : la publication reste ton geste.
        </figcaption>
      </figure>
    </div>
  )
}
