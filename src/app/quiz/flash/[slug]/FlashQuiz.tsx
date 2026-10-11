'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { SharePanel } from '@/components/SharePanel'
import { cssFamily, fitText, loadImage } from '@/lib/canvas'
import { UI_COPY } from '@/lib/copy'
import type { FlashQuiz as Quiz } from '@/lib/flash'
import { fillScore, flashScore, flashTier } from '@/lib/flash-score'
import { TARGETS, type ShareTarget } from '@/lib/share'

const t = UI_COPY.flash

// Couleurs de src/styles/tokens.css (le canevas ne lit pas les variables CSS)
const PAPER = '#F5F0E6'
const INK = '#191919'
const YELLOW = '#FFE34D'

type Format = 'portrait' | 'post' | 'story' | 'paysage'
const SIZES: Record<Format, { w: number; h: number }> = {
  portrait: { w: 1080, h: 1350 },
  post: { w: 1080, h: 1080 },
  story: { w: 1080, h: 1920 },
  paysage: { w: 1200, h: 630 },
}

/** Image du résultat, dessinée sur l'appareil : le score ne quitte jamais le navigateur. */
async function paintResult(canvas: HTMLCanvasElement, quiz: Quiz, score: number, format: Format) {
  const { w, h } = SIZES[format]
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const display = cssFamily('--ff-display', 'Arial Black')
  const ui = cssFamily('--ff-ui', 'Arial')
  await Promise.all([document.fonts.load(`80px ${display}`), document.fonts.load(`700 40px ${ui}`)]).catch(() => {})
  const avatar = quiz.avatar ? await loadImage(quiz.avatar).catch(() => null) : null
  const tier = flashTier(quiz, score)
  const wide = format === 'paysage'
  const m = Math.round(Math.min(w, h) * 0.07)
  const footH = Math.round(h * (wide ? 0.13 : 0.085))
  const top = format === 'story' ? h * 0.12 : m
  const bottom = (format === 'story' ? h * 0.84 : h) - footH - m * 0.6

  ctx.fillStyle = PAPER
  ctx.fillRect(0, 0, w, h)
  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'

  // Bandeau-question en jaune
  const hookSize = Math.round(w * (wide ? 0.032 : 0.045))
  ctx.font = `${hookSize}px ${display}`
  const hook = quiz.title.toUpperCase()
  const hw = ctx.measureText(hook).width
  ctx.fillStyle = YELLOW
  ctx.fillRect(m, top, hw + hookSize, hookSize * 1.5)
  ctx.strokeStyle = INK
  ctx.lineWidth = Math.max(3, w * 0.004)
  ctx.strokeRect(m, top, hw + hookSize, hookSize * 1.5)
  ctx.fillStyle = INK
  ctx.fillText(hook, m + hookSize / 2, top + hookSize * 0.27)

  // Avatar (personnage inventé) à droite, s'il existe
  const textW = avatar ? (w - 2 * m) * (wide ? 0.62 : 0.6) : w - 2 * m
  if (avatar) {
    const size = wide ? h * 0.62 : Math.min(w * 0.42, (bottom - top) * 0.45)
    ctx.drawImage(avatar, w - m - size, wide ? (h - footH - size) / 2 : top + hookSize * 2.2, size, size)
  }

  // Le score en très grand, la tribu surlignée dessous
  const y0 = top + hookSize * 2.3
  const scoreSize = Math.round(Math.min(textW * 0.55, (bottom - y0) * (wide ? 0.42 : 0.3)))
  ctx.font = `${scoreSize}px ${display}`
  ctx.fillText(`${score} %`, m, y0)
  const tribe = quiz.tribe.toUpperCase()
  const tribeFit = fitText(ctx, tribe, display, textW, scoreSize * 0.9, Math.round(scoreSize * 0.45))
  const ty = y0 + scoreSize * 1.02
  tribeFit.lines.forEach((l, i) => {
    const lw = ctx.measureText(l).width
    ctx.fillStyle = YELLOW
    ctx.fillRect(m - tribeFit.size * 0.08, ty + i * tribeFit.size * 1.08 + tribeFit.size * 0.45, lw + tribeFit.size * 0.16, tribeFit.size * 0.5)
    ctx.fillStyle = INK
    ctx.fillText(l, m, ty + i * tribeFit.size * 1.08)
  })

  // La punchline, puis la phrase
  const py = ty + tribeFit.lines.length * tribeFit.size * 1.08 + m * 0.5
  const head = fillScore(tier.headline, score)
  const room = bottom - py
  const hf = fitText(ctx, head, display, wide ? textW : w - 2 * m, room * 0.55, Math.round(w * (wide ? 0.04 : 0.065)), 1.1)
  ctx.font = `${hf.size}px ${display}`
  hf.lines.forEach((l, i) => ctx.fillText(l, m, py + i * hf.size * 1.1))
  const ly = py + hf.lines.length * hf.size * 1.1 + hf.size * 0.4
  const lf = fitText(ctx, tier.line, ui, wide ? textW : w - 2 * m, bottom - ly, Math.round(w * (wide ? 0.024 : 0.038)), 1.3, '700')
  ctx.font = `700 ${lf.size}px ${ui}`
  lf.lines.forEach((l, i) => ctx.fillText(l, m, ly + i * lf.size * 1.3))

  // Relance en bas de l'espace libre : de quoi donner envie de répondre
  if (!wide) {
    const ask = Math.round(w * 0.075)
    ctx.font = `${ask}px ${display}`
    ctx.textBaseline = 'alphabetic'
    ctx.fillText(t.shareAsk.toUpperCase(), m, bottom)
    ctx.textBaseline = 'top'
  }

  // Pied noir : appel et signature
  const fy = (format === 'story' ? h * 0.84 : h) - footH
  ctx.fillStyle = INK
  ctx.fillRect(0, fy, w, footH)
  const fs = Math.round(footH * 0.38)
  ctx.font = `${fs}px ${display}`
  ctx.textBaseline = 'middle'
  ctx.fillStyle = YELLOW
  ctx.fillText(t.cardCta.toUpperCase(), m, fy + footH / 2)
  ctx.textAlign = 'right'
  ctx.fillStyle = PAPER
  ctx.fillText('ÇAVOTE.FR', w - m, fy + footH / 2)
}

async function resultFile(quiz: Quiz, score: number, format: Format): Promise<File | null> {
  const c = document.createElement('canvas')
  await paintResult(c, quiz, score, format)
  const blob = await new Promise<Blob | null>((r) => c.toBlob(r, 'image/png'))
  return blob ? new File([blob], `${quiz.slug}-${score}.png`, { type: 'image/png' }) : null
}

export function FlashQuiz({ quiz, url, others }: { quiz: Quiz; url: string; others: { slug: string; title: string }[] }) {
  const [picks, setPicks] = useState<number[]>([])
  const done = picks.length === quiz.questions.length
  const score = done ? flashScore(quiz, picks) : 0
  const tier = flashTier(quiz, score)
  const preview = useRef<HTMLCanvasElement>(null)
  const head = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (done && preview.current) void paintResult(preview.current, quiz, score, 'portrait')
  }, [done, quiz, score])
  // Le focus suit la question affichée (lecteurs d'écran, clavier)
  useEffect(() => {
    head.current?.focus({ preventScroll: true })
  }, [picks.length])

  if (!done) {
    const i = picks.length
    const item = quiz.questions[i]!
    return (
      <section className="flash card card--featured" aria-live="polite">
        <div className="flash__top">
          <p className="flash__count">{t.count(i + 1, quiz.questions.length)}</p>
          {i > 0 && (
            <button type="button" className="btn btn--secondary btn--small" onClick={() => setPicks((p) => p.slice(0, -1))}>
              {t.back}
            </button>
          )}
        </div>
        <div className="flash__progress" aria-hidden="true">
          <span style={{ width: `${(i / quiz.questions.length) * 100}%` }} />
        </div>
        <h2 className="flash__q" tabIndex={-1} ref={head}>
          {item.q}
        </h2>
        <div className="flash__answers">
          {item.answers.map((a, k) => (
            <button key={k} type="button" className="flash__answer" onClick={() => setPicks((p) => [...p, k])}>
              {a.label}
            </button>
          ))}
        </div>
      </section>
    )
  }

  const shareText = `${fillScore(tier.headline, score)} ${t.shareAsk}`
  return (
    <>
      <section className="flash flash--result card card--featured" aria-live="polite">
        <h2 className="flash__score" tabIndex={-1} ref={head}>
          <span className="flash__pct">{score}&nbsp;%</span> <span className="flash__tribe">{quiz.tribe}</span>
        </h2>
        <p className="flash__headline">{fillScore(tier.headline, score)}</p>
        <p className="flash__line">{tier.line}</p>
        <div className="flash__share">
          <canvas ref={preview} className="flash__preview" width={1080} height={1350} aria-label={t.previewAlt(score, quiz.tribe)} role="img" />
          <div>
            <SharePanel
              url={url}
              title={quiz.title}
              text={shareText}
              image={(target: ShareTarget) => resultFile(quiz, score, TARGETS[target].image)}
            />
            <button type="button" className="btn btn--secondary btn--small" onClick={() => setPicks([])}>
              {t.again}
            </button>
          </div>
        </div>
      </section>

      <section className="flash__fact card section" aria-labelledby="vrai-chiffre">
        <p className="kicker">{t.factKicker}</p>
        <h2 id="vrai-chiffre">{quiz.fact.cliche}</h2>
        <p>{quiz.fact.text}</p>
        <p className="small muted">
          {t.sources}{' '}
          {quiz.fact.sources.map((s, i) => (
            <span key={s.url}>
              {i > 0 && ' · '}
              <a href={s.url} rel="noopener noreferrer nofollow" target="_blank">
                {s.publisher}, {s.title}
              </a>
            </span>
          ))}
        </p>
      </section>

      <section className="section">
        <h2>{t.othersTitle}</h2>
        <ul className="row flash__others" role="list">
          {others.map((o) => (
            <li key={o.slug}>
              <Link href={`/quiz/flash/${o.slug}`} className="cmp__theme sujet__tab">
                {o.title}
              </Link>
            </li>
          ))}
        </ul>
        <p>
          <Link href="/test" className="btn btn--primary">
            {t.testCta}
          </Link>
        </p>
      </section>
    </>
  )
}
