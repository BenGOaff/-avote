/* eslint-disable @next/next/no-img-element */
/** Mention obligatoire sur chaque portrait (règlement européen sur l'IA, art. 50). */
export const PORTRAIT_NOTICE = 'Illustration générée par IA'

const initials = (name: string) =>
  name
    .split(/[\s-]+/)
    .filter((w) => w.length > 1 && w[0] === w[0]?.toUpperCase())
    .map((w) => w[0])
    .join('')
    .slice(0, 2)

/** Portrait rond aux couleurs de la famille ; monogramme tant que l'illustration n'est pas livrée. */
export function Portrait({ src, name, bloc, size = 72, notice = false }: { src: string | null; name: string; bloc: string; size?: number; notice?: boolean }) {
  return (
    <figure className={`portrait bloc-${bloc}`} style={{ width: size }}>
      <span className="portrait__frame" style={{ width: size, height: size }}>
        {src ? (
          <img src={src} alt={`${name}, ${PORTRAIT_NOTICE.toLowerCase()}`} width={size} height={size} loading="lazy" decoding="async" />
        ) : (
          <span className="portrait__mono" aria-hidden="true" style={{ fontSize: size * 0.36 }}>
            {initials(name)}
          </span>
        )}
      </span>
      {src && notice && <figcaption className="portrait__notice">{PORTRAIT_NOTICE}</figcaption>}
    </figure>
  )
}
