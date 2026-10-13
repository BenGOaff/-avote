'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { UI_COPY } from '@/lib/copy'
import { cssFamily, fitText, loadImage } from '@/lib/canvas'
import type { RankingEntry } from '@/lib/engine/scoring'

/**
 * Partage du résultat : une image dessinée sur l'appareil (canvas), envoyée par le menu de partage du téléphone
 * ou téléchargée. Rien ne passe par le serveur ; la personne voit l'image avant de la partager et choisit ce qu'elle montre.
 * Jamais affiché sans classement publiable ni avec les candidats fictifs (le parent en décide).
 */

const R = UI_COPY.results
const W = 1080
const H = 1350
// Mêmes couleurs que la palette « papier » du Studio
const BG = '#F5F0E6'
const FG = '#191919'
const YELLOW = '#FFE34D'
const SITE = 'https://xn--avote-xra.fr/test'

type Choice = 'top3' | 'top1'

export function ResultShare({ entries, quick }: { entries: RankingEntry[]; quick: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [choice, setChoice] = useState<Choice>('top3')
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const shown = entries.slice(0, choice === 'top3' ? 3 : 1)
  // Le dessin ne dépend que de ce qui s'affiche : une empreinte stable évite de redessiner à chaque rendu
  const shownRef = useRef(shown)
  shownRef.current = shown
  const sig = shown.map((e) => `${e.slug}:${Math.round(e.rankScore ?? 0)}:${e.closeToPrevious}`).join('|')

  const paint = useCallback(
    async (canvas: HTMLCanvasElement) => {
      canvas.width = W
      canvas.height = H
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const shown = shownRef.current
      const display = cssFamily('--ff-display', 'Arial Black')
      const ui = cssFamily('--ff-ui', 'Arial')
      await Promise.all([document.fonts.load(`80px ${display}`), document.fonts.load(`700 40px ${ui}`), document.fonts.load(`600 40px ${ui}`)]).catch(() => {})
      const logo = await loadImage('/brand/logo-horizontal.svg')
      const m = 86
      const width = W - 2 * m

      ctx.fillStyle = BG
      ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = FG
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'

      // En-tête
      ctx.font = `700 30px ${ui}`
      ctx.fillText(R.shareImgKicker.toUpperCase() + (quick ? ` · ${R.shareImgQuick.toUpperCase()}` : ''), m, m)
      const title = fitText(ctx, R.shareImgTitle(shown.length), display, width, 230, 84)
      ctx.font = `${title.size}px ${display}`
      title.lines.forEach((l, i) => ctx.fillText(l, m, m + 64 + i * title.size * 1.08))
      let y = m + 64 + title.lines.length * title.size * 1.08 + 56

      // Candidats : rang, nom, score sur 100 et barre, centrés entre le titre et le pied
      const rowH = shown.length === 1 ? 300 : 228
      y += Math.max(0, (H - m - 230 - y - rowH * shown.length) / 2)
      shown.forEach((e, i) => {
        const score = Math.round(e.rankScore ?? 0)
        ctx.fillStyle = FG
        ctx.fillRect(m, y, width, 4)
        ctx.font = `700 34px ${ui}`
        ctx.fillText(`${i + 1}`, m, y + 30)
        const nameSize = shown.length === 1 ? 82 : 60
        const name = fitText(ctx, e.name, display, width - 70, nameSize * 1.1, nameSize)
        ctx.font = `${name.size}px ${display}`
        ctx.fillText(name.lines[0] ?? e.name, m + 70, y + 24)
        const barY = y + 24 + name.size * 1.15 + 18
        const barH = shown.length === 1 ? 44 : 34
        const barW = width - 260
        ctx.lineWidth = 4
        ctx.strokeStyle = FG
        ctx.strokeRect(m + 70, barY, barW, barH)
        ctx.fillStyle = YELLOW
        ctx.fillRect(m + 72, barY + 2, Math.max(0, ((barW - 4) * score) / 100), barH - 4)
        ctx.fillStyle = FG
        ctx.font = `${shown.length === 1 ? 64 : 48}px ${display}`
        ctx.textAlign = 'right'
        ctx.fillText(`${score}`, W - m - 70, barY - (shown.length === 1 ? 12 : 8))
        ctx.font = `600 26px ${ui}`
        ctx.fillText('/100', W - m, barY + (shown.length === 1 ? 16 : 10))
        ctx.textAlign = 'left'
        if (e.closeToPrevious) {
          ctx.font = `600 26px ${ui}`
          ctx.fillText(R.shareImgTie, m + 70, barY + barH + 12)
        }
        y += rowH
      })

      // Pied : avertissement, appel et logo
      const foot = H - m
      ctx.font = `600 28px ${ui}`
      const note = fitText(ctx, R.shareImgNote, ui, width, 80, 28, 1.3, '600')
      ctx.font = `600 ${note.size}px ${ui}`
      note.lines.forEach((l, i) => ctx.fillText(l, m, foot - 190 + i * note.size * 1.3))
      const logoH = 64
      const logoW = (logo.width / logo.height) * logoH
      ctx.drawImage(logo, m, foot - logoH, logoW, logoH)
      ctx.font = `700 32px ${ui}`
      ctx.textAlign = 'right'
      ctx.textBaseline = 'alphabetic'
      const cta = R.shareImgCta
      const ctaW = ctx.measureText(cta).width
      ctx.fillStyle = YELLOW
      ctx.fillRect(W - m - ctaW - 12, foot - 44, ctaW + 24, 30)
      ctx.fillStyle = FG
      ctx.fillText(cta, W - m, foot - 18)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sig, quick],
  )

  useEffect(() => {
    let cancelled = false
    const c = canvasRef.current
    if (!c) return
    setReady(false)
    paint(c)
      .catch(() => {})
      .finally(() => !cancelled && setReady(true))
    return () => {
      cancelled = true
    }
  }, [paint])

  const share = async () => {
    const c = canvasRef.current
    if (!c) return
    setBusy(true)
    const blob = await new Promise<Blob | null>((r) => c.toBlob(r, 'image/png'))
    setBusy(false)
    if (!blob) return
    const file = new File([blob], 'mon-resultat-ca-vote.png', { type: 'image/png' })
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text: `${R.shareMessage} ${SITE}` })
        return
      } catch {
        /* partage annulé : on propose le téléchargement */
      }
    }
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <section className="section share-result" aria-labelledby="partager">
      <h2 id="partager">{R.shareTitle}</h2>
      <p className="muted">{R.shareText}</p>
      {entries.length > 1 && (
        <div className="row" role="radiogroup" aria-label={R.shareTitle}>
          {(['top3', 'top1'] as const).map((c) => (
            <label key={c} className="chip">
              <input type="radio" name="share-choice" checked={choice === c} onChange={() => setChoice(c)} />
              {c === 'top3' ? R.shareTop3 : R.shareTop1}
            </label>
          ))}
        </div>
      )}
      <canvas ref={canvasRef} className="share-result__preview" role="img" aria-label={R.shareAlt} width={W} height={H} />
      <div className="row">
        <button className="btn btn--highlight" onClick={share} disabled={!ready || busy}>
          {busy ? R.shareBusy : R.shareBtn}
        </button>
      </div>
    </section>
  )
}
