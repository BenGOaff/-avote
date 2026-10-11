'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { SharePanel } from '@/components/SharePanel'
import { cssFamily, fitText, loadImage } from '@/lib/canvas'
import { UI_COPY } from '@/lib/copy'
import type { FlashQuizFull as Quiz } from '@/lib/flash'
import { flashResult, type FlashResult } from '@/lib/flash-score'
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
async function paintResult(canvas: HTMLCanvasElement, quiz: Quiz, r: FlashResult, format: Format) {
  const { w, h } = SIZES[format]
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const display = cssFamily('--ff-display', 'Arial Black')
  const ui = cssFamily('--ff-ui', 'Arial')
  await Promise.all([document.fonts.load(`80px ${display}`), document.fonts.load(`700 40px ${ui}`)]).catch(() => {})
  const avatar = r.avatar ? await loadImage(r.avatar).catch(() => null) : null
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
  const hook = quiz.title.toUpperCase()
  // Taille réduite si le titre est long : le bandeau ne dépasse jamais l'image
  let hookSize = Math.round(w * (wide ? 0.032 : 0.045))
  ctx.font = `${hookSize}px ${display}`
  const maxHook = w - 2 * m
  if (ctx.measureText(hook).width + hookSize > maxHook) {
    hookSize = Math.floor((hookSize * maxHook) / (ctx.measureText(hook).width + hookSize))
    ctx.font = `${hookSize}px ${display}`
  }
  const hw = ctx.measureText(hook).width
  ctx.fillStyle = YELLOW
  ctx.fillRect(m, top, hw + hookSize, hookSize * 1.5)
  ctx.strokeStyle = INK
  ctx.lineWidth = Math.max(3, w * 0.004)
  ctx.strokeRect(m, top, hw + hookSize, hookSize * 1.5)
  ctx.fillStyle = INK
  ctx.fillText(hook, m + hookSize / 2, top + hookSize * 0.27)

  // Le score à gauche, l'avatar (personnage inventé) à droite, jamais l'un sur l'autre
  const y0 = top + hookSize * 2.3
  const gap = m * 0.4
  const avatarSize = avatar ? (wide ? h * 0.62 : Math.min((w - 2 * m) * 0.42, (bottom - y0) * 0.5)) : 0
  const textW = avatar && !wide ? w - 2 * m - avatarSize - gap : avatar ? (w - 2 * m) * 0.6 : w - 2 * m
  if (avatar) ctx.drawImage(avatar, w - m - avatarSize, wide ? (h - footH - avatarSize) / 2 : y0, avatarSize, avatarSize)
  // « Tu es » en petit, puis le résultat en très grand (une ou deux lignes), puis le libellé surligné
  let ky = y0
  if (r.kicker) {
    const ks = Math.round(w * (wide ? 0.03 : 0.045))
    ctx.font = `${ks}px ${display}`
    ctx.fillText(r.kicker.toUpperCase(), m, y0)
    ky = y0 + ks * 1.3
  }
  const bigMax = Math.round((bottom - y0) * (wide ? 0.42 : 0.3))
  const bigFit = r.kicker ? fitText(ctx, r.big.toUpperCase(), display, textW, (bottom - ky) * 0.42, Math.round(bigMax * 0.6), 1.02) : null
  let scoreSize = bigFit ? bigFit.size : bigMax
  const bigLines = bigFit ? bigFit.lines : [r.big]
  ctx.font = `${scoreSize}px ${display}`
  while (!bigFit && scoreSize > 40 && ctx.measureText(r.big).width > textW) {
    scoreSize -= 6
    ctx.font = `${scoreSize}px ${display}`
  }
  bigLines.forEach((l, i) => ctx.fillText(l, m, ky + i * scoreSize * 1.02))
  let ty = ky + bigLines.length * scoreSize * 1.02
  if (r.label) {
    const tribeFit = fitText(ctx, r.label.toUpperCase(), display, textW, scoreSize * 0.9, Math.round(scoreSize * 0.55))
    tribeFit.lines.forEach((l, i) => {
      const lw = ctx.measureText(l).width
      ctx.fillStyle = YELLOW
      ctx.fillRect(m - tribeFit.size * 0.08, ty + i * tribeFit.size * 1.08 + tribeFit.size * 0.45, lw + tribeFit.size * 0.16, tribeFit.size * 0.5)
      ctx.fillStyle = INK
      ctx.fillText(l, m, ty + i * tribeFit.size * 1.08)
    })
    ty += tribeFit.lines.length * tribeFit.size * 1.08
  }
  const blockEnd = Math.max(ty, wide ? 0 : y0 + avatarSize)

  // La punchline, puis la phrase
  const py = blockEnd + m * 0.5
  const head = r.headline
  const room = bottom - py
  const hf = fitText(ctx, head, display, wide ? textW : w - 2 * m, room * 0.55, Math.round(w * (wide ? 0.04 : 0.065)), 1.1)
  ctx.font = `${hf.size}px ${display}`
  hf.lines.forEach((l, i) => ctx.fillText(l, m, py + i * hf.size * 1.1))
  const ly = py + hf.lines.length * hf.size * 1.1 + hf.size * 0.4
  const lf = fitText(ctx, r.line, ui, wide ? textW : w - 2 * m, bottom - ly, Math.round(w * (wide ? 0.024 : 0.038)), 1.3, '700')
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

async function resultFile(quiz: Quiz, r: FlashResult, format: Format): Promise<File | null> {
  const c = document.createElement('canvas')
  await paintResult(c, quiz, r, format)
  const blob = await new Promise<Blob | null>((ok) => c.toBlob(ok, 'image/png'))
  return blob ? new File([blob], `${quiz.slug}-${r.id}.png`, { type: 'image/png' }) : null
}

export function FlashQuiz({ quiz, url, others }: { quiz: Quiz; url: string; others: { slug: string; title: string }[] }) {
  const [picks, setPicks] = useState<number[]>([])
  // Quiz de connaissances : la réponse choisie, affichée avec la correction avant de passer à la suite
  const [reveal, setReveal] = useState<number | null>(null)
  const done = picks.length === quiz.questions.length
  const r = done ? flashResult(quiz, picks) : null
  const preview = useRef<HTMLCanvasElement>(null)
  const head = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (r && preview.current) void paintResult(preview.current, quiz, r, 'portrait')
  }, [r?.id, quiz]) // eslint-disable-line react-hooks/exhaustive-deps
  // Le focus suit la question affichée (lecteurs d'écran, clavier)
  useEffect(() => {
    head.current?.focus({ preventScroll: true })
  }, [picks.length])

  const pick = (k: number) => {
    if (quiz.mode === 'connaissances') setReveal(k)
    else setPicks((p) => [...p, k])
  }
  const next = () => {
    if (reveal === null) return
    setPicks((p) => [...p, reveal])
    setReveal(null)
  }

  if (!done || !r) {
    const i = picks.length
    const item = quiz.questions[i]!
    return (
      <section className="flash card card--featured" aria-live="polite">
        <div className="flash__top">
          <p className="flash__count">{t.count(i + 1, quiz.questions.length)}</p>
          {i > 0 && (
            <button
              type="button"
              className="btn btn--secondary btn--small"
              onClick={() => {
                setReveal(null)
                setPicks((p) => p.slice(0, -1))
              }}
            >
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
          {item.answers.map((a, k) => {
            const state = reveal === null ? '' : a.correct ? ' is-right' : k === reveal ? ' is-wrong' : ' is-dim'
            return (
              <button key={k} type="button" className={`flash__answer${state}`} onClick={() => pick(k)} disabled={reveal !== null} aria-pressed={reveal === k}>
                {a.label}
                {reveal !== null && a.correct && <span className="flash__mark">{t.right}</span>}
                {reveal === k && !a.correct && <span className="flash__mark">{t.wrong}</span>}
              </button>
            )
          })}
        </div>
        {reveal !== null && (
          <div className="flash__explain" role="status">
            <p>
              <strong>{item.answers[reveal]?.correct ? t.rightLong : t.wrongLong}</strong> {item.explain}
            </p>
            <button type="button" className="btn btn--primary" onClick={next}>
              {i + 1 === quiz.questions.length ? t.seeResult : t.next}
            </button>
          </div>
        )}
      </section>
    )
  }

  // Le score des quiz « tribu » est déjà dans la punchline ; ailleurs, on le rappelle devant
  const shareText = `${quiz.mode === 'score' ? '' : `${[r.kicker, r.big, r.label].filter(Boolean).join(' ')}. `}${r.headline} ${t.shareAsk}`
  return (
    <>
      <section className="flash flash--result card card--featured" aria-live="polite">
        {r.avatar && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="flash__avatar" src={r.avatar} width={800} height={800} alt="" />
        )}
        <h2 className="flash__score" tabIndex={-1} ref={head}>
          {r.kicker && <span className="flash__kicker">{r.kicker}</span>}
          <span className={r.kicker ? 'flash__name' : 'flash__pct'}>{r.big}</span> {r.label && <span className="flash__tribe">{r.label}</span>}
        </h2>
        <p className="flash__headline">{r.headline}</p>
        <p className="flash__line">{r.line}</p>
        <div className="flash__share">
          <canvas
            ref={preview}
            className="flash__preview"
            width={1080}
            height={1350}
            aria-label={t.previewAlt(`${r.kicker ? `${r.kicker} ` : ''}${r.big}${r.label ? ` ${r.label}` : ''}`)}
            role="img"
          />
          <div>
            <SharePanel url={url} title={quiz.title} text={shareText} image={(target: ShareTarget) => resultFile(quiz, r, TARGETS[target].image)} />
            <button
              type="button"
              className="btn btn--secondary btn--small"
              onClick={() => {
                setReveal(null)
                setPicks([])
              }}
            >
              {t.again}
            </button>
          </div>
        </div>
      </section>

      {r.details && r.details.length > 0 && (
        <section className="flash__fact card section" aria-labelledby="accords">
          <h2 id="accords">{t.partyCommon(r.big)}</h2>
          <Stances list={r.details.filter((d) => d.agree)} />
          {r.details.some((d) => !d.agree) && (
            <>
              <h3>{t.partyDiff(r.big)}</h3>
              <Stances list={r.details.filter((d) => !d.agree)} />
            </>
          )}
          <p className="small muted">{t.partyBasis}</p>
        </section>
      )}

      {quiz.fact && (
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
      )}

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

function Stances({ list }: { list: NonNullable<FlashResult['details']> }) {
  if (!list.length) return <p className="muted">{t.noOpinion}</p>
  return (
    <ul className="flash__stances" role="list">
      {list.map((d) => (
        <li key={d.text}>
          <p className="flash__stance-q">{d.text}</p>
          <p className="flash__side">{d.agree ? t.bothSide(d.you) : t.youSide(d.you, d.who)}</p>
          {d.quote && (
            <p className="small">
              {d.who} : « {d.quote} »{' '}
              {d.url && (
                <a href={d.url} rel="noopener noreferrer nofollow" target="_blank">
                  {d.publisher || t.sources}
                </a>
              )}
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}
