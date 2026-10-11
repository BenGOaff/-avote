/** Outils de dessin sur canevas, côté navigateur : studio et quiz flash. Rien n'est envoyé, tout est dessiné sur l'appareil. */

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/** Famille de police d'une variable CSS (polices servies par le site). */
export function cssFamily(varName: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
  return v || fallback
}

export function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
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

/** Taille de police maximale pour que le texte tienne dans la boîte (`weight` : préfixe de graisse, ex. « 700 »). */
export function fitText(ctx: CanvasRenderingContext2D, text: string, family: string, maxW: number, maxH: number, maxSize: number, lh = 1.08, weight = '') {
  const font = (size: number) => `${weight ? `${weight} ` : ''}${size}px ${family}`
  for (let size = maxSize; size > 24; size -= 4) {
    ctx.font = font(size)
    const lines = wrap(ctx, text, maxW)
    if (lines.length * size * lh <= maxH && lines.every((l) => ctx.measureText(l).width <= maxW)) return { size, lines }
  }
  ctx.font = font(24)
  return { size: 24, lines: wrap(ctx, text, maxW) }
}
