import type { NextRequest } from 'next/server'

/**
 * Adresse du visiteur. Derrière le CDN de l'hébergeur, `X-Real-IP` est réécrite avec l'adresse réelle (vérifié le
 * 8 octobre 2026), alors que la première valeur de `X-Forwarded-For` peut être fournie par le visiteur lui-même.
 */
export const clientIp = (req: NextRequest): string => req.headers.get('x-real-ip')?.trim() ?? ''

/**
 * La requête vient-elle de nos propres pages ? Derrière le CDN, `req.nextUrl.host` est l'adresse interne du serveur :
 * on compare donc l'origine à l'hôte public (`X-Forwarded-Host`, `Host`) et au domaine du site.
 */
export function sameOrigin(req: NextRequest, siteHost: string, required = true): boolean {
  const origin = req.headers.get('origin')
  if (!origin) return !required
  let host: string
  try {
    host = new URL(origin).host
  } catch {
    return false
  }
  const allowed = new Set([siteHost, `www.${siteHost}`, req.headers.get('x-forwarded-host')?.split(',')[0]?.trim(), req.headers.get('host')?.trim()].filter(Boolean))
  return allowed.has(host)
}
