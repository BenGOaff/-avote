'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { BASIS_LABEL, ordinalLabel } from '@/lib/answers'
import type { Ordinal } from '@/lib/engine/types'

type Pos = { v: number[]; b: string; q: string; u: string; p: string }
export interface CompareData {
  themes: { id: string; label: string }[]
  items: { id: string; theme: string; text: string }[]
  actors: { slug: string; name: string; bloc: string }[]
  pos: Record<string, Record<string, Pos>>
}

const MAX = 4
type Side = 'pour' | 'entre' | 'contre'
const SIDES: { id: Side; label: string }[] = [
  { id: 'pour', label: 'Pour' },
  { id: 'entre', label: 'Entre les deux' },
  { id: 'contre', label: 'Contre' },
]

/** Pour si toutes les valeurs possibles sont favorables, contre si toutes sont opposées, sinon entre les deux. */
const sideOf = (v: number[]): Side => (v.every((x) => x > 0) ? 'pour' : v.every((x) => x < 0) ? 'contre' : 'entre')
const isStrong = (v: number[]) => v.every((x) => Math.abs(x) === 2)
const label = (v: number[]) => (v.length === 1 ? ordinalLabel(v[0] as Ordinal) : `Entre « ${ordinalLabel(v[0] as Ordinal)} » et « ${ordinalLabel(v[v.length - 1] as Ordinal)} »`)

function Scale({ v }: { v: number[] }) {
  return (
    <span className="duo pos-scale" aria-hidden="true">
      <span className="pos-scale__end">contre</span>
      {[-2, -1, 0, 1, 2].map((x) => (
        <span key={x} className={`duo__dot${v.includes(x) ? ' duo__dot--them' : ''}`} />
      ))}
      <span className="pos-scale__end">pour</span>
    </span>
  )
}

function Quote({ pos }: { pos: Pos }) {
  if (!pos.q) return null
  return (
    <details className="cmp__quote">
      <summary>La citation</summary>
      <blockquote>« {pos.q} »</blockquote>
      <p className="small muted">
        {pos.b && `${BASIS_LABEL[pos.b] ?? pos.b} · `}
        {pos.u ? (
          <a href={pos.u} rel="noopener noreferrer nofollow" target="_blank">
            {pos.p || 'Source'}
          </a>
        ) : (
          pos.p
        )}
      </p>
    </details>
  )
}

export function Comparateur({ data }: { data: CompareData }) {
  const [picked, setPicked] = useState<string[]>([])
  const [theme, setTheme] = useState<string>(data.themes[0]?.id ?? '')
  const items = useMemo(() => data.items.filter((i) => i.theme === theme), [data.items, theme])
  const byslug = useMemo(() => new Map(data.actors.map((a) => [a.slug, a])), [data.actors])
  const known = (slug: string) => Object.keys(data.pos[slug] ?? {}).length

  function toggle(slug: string) {
    setPicked((p) => (p.includes(slug) ? p.filter((s) => s !== slug) : p.length >= MAX ? p : [...p, slug]))
  }

  return (
    <div className="cmp">
      <fieldset className="cmp__pick">
        <legend>
          Candidats à comparer <span className="muted">({picked.length}/{MAX})</span>
        </legend>
        <div className="cmp__chips">
          {data.actors.map((a) => {
            const on = picked.includes(a.slug)
            return (
              <button
                key={a.slug}
                type="button"
                className={`cmp__chip bloc-${a.bloc}${on ? ' is-on' : ''}`}
                aria-pressed={on}
                disabled={!on && picked.length >= MAX}
                onClick={() => toggle(a.slug)}
              >
                <span className="nuance__dot" aria-hidden="true" />
                {a.name}
                <span className="cmp__count">{known(a.slug)}/42</span>
              </button>
            )
          })}
        </div>
        {picked.length > 0 && (
          <button type="button" className="btn btn--secondary btn--small" onClick={() => setPicked([])}>
            Voir tout le monde
          </button>
        )}
      </fieldset>

      <nav className="cmp__themes" aria-label="Thèmes">
        {data.themes.map((t) => (
          <button key={t.id} type="button" className={`cmp__theme${t.id === theme ? ' is-on' : ''}`} aria-pressed={t.id === theme} onClick={() => setTheme(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>

      <ol className="cmp__items">
        {items.map((it) => (
          <li key={it.id} className="cmp__item">
            <h2 className="cmp__q">{it.text}</h2>
            {picked.length === 0 ? (
              <ByStance it={it.id} data={data} byslug={byslug} />
            ) : (
              <div className="cmp__cols" style={{ ['--cols' as string]: picked.length }}>
                {picked.map((slug) => {
                  const a = byslug.get(slug)!
                  const pos = data.pos[slug]?.[it.id]
                  return (
                    <div key={slug} className={`cmp__cell bloc-${a.bloc}`}>
                      <p className="cmp__who">
                        <span className="nuance__dot" aria-hidden="true" />
                        <Link href={`/candidats/${slug}`}>{a.name}</Link>
                      </p>
                      {pos ? (
                        <>
                          <Scale v={pos.v} />
                          <p className="cmp__label">{label(pos.v)}</p>
                          <Quote pos={pos} />
                        </>
                      ) : (
                        <p className="muted small">Pas de position explicite trouvée.</p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}

function ByStance({ it, data, byslug }: { it: string; data: CompareData; byslug: Map<string, CompareData['actors'][number]> }) {
  const withPos = data.actors.flatMap((a) => {
    const pos = data.pos[a.slug]?.[it]
    return pos ? [{ ...a, pos }] : []
  })
  const unknown = data.actors.length - withPos.length
  return (
    <>
      <div className="cmp__sides">
        {SIDES.map((s) => {
          const list = withPos.filter((a) => sideOf(a.pos.v) === s.id)
          return (
            <div key={s.id} className={`cmp__side cmp__side--${s.id}`}>
              <p className="cmp__side-title">
                {s.label} <span className="muted">{list.length}</span>
              </p>
              {list.length === 0 ? (
                <p className="muted small">Personne</p>
              ) : (
                <ul>
                  {list.map((a) => {
                    const pos = a.pos
                    return (
                      <li key={a.slug} className={`bloc-${byslug.get(a.slug)?.bloc}`} title={label(pos.v)}>
                        <span className="nuance__dot" aria-hidden="true" />
                        <span className={isStrong(pos.v) ? 'cmp__strong' : undefined}>{a.name}</span>
                        <span className="visually-hidden"> : {label(pos.v)}</span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </div>
      <p className="small muted cmp__unknown">
        {unknown > 0 ? `${unknown} candidat${unknown > 1 ? 's' : ''} sans position explicite trouvée.` : 'Tous les candidats ont une position connue.'} En gras : position
        catégorique.
      </p>
    </>
  )
}
