import type { NextRequest } from 'next/server'

/**
 * Adresse du visiteur, lue dans l'en-tête que pose le frontal devant le site : `X-Real-IP` derrière le CDN de
 * l'hébergeur (vérifié le 8 octobre 2026), `CF-Connecting-IP` derrière un tunnel Cloudflare (CLIENT_IP_HEADER).
 * Jamais la première valeur de `X-Forwarded-For`, que le visiteur peut fournir lui-même.
 */
const IP_HEADER = (process.env.CLIENT_IP_HEADER || 'x-real-ip').toLowerCase()
export const clientIp = (req: NextRequest): string => req.headers.get(IP_HEADER)?.trim() ?? ''

/**
 * La requête vient-elle de nos propres pages ? Derrière le CDN, `req.nextUrl.host` est l'adresse interne du serveur :
 * on compare donc l'origine à l'hôte public (`X-Forwarded-Host`, `Host`) et au domaine du site.
 */
export function sameOrigin(req: NextRequest, siteHost: string, required = true): boolean {
  const origin = req.headers.get('origin')
  // Pages servies sans référent (Referrer-Policy: no-referrer : résultats, profil, test, confirmation) : le navigateur
  // envoie « Origin: null ». Sec-Fetch-Site, posé par le navigateur et qu'aucune page ne peut modifier, dit alors d'où vient la requête.
  if (!origin || origin === 'null') {
    const site = req.headers.get('sec-fetch-site')
    if (site) return site === 'same-origin'
    return !origin && !required
  }
  let host: string
  try {
    host = new URL(origin).host
  } catch {
    return false
  }
  const allowed = new Set([siteHost, `www.${siteHost}`, req.headers.get('x-forwarded-host')?.split(',')[0]?.trim(), req.headers.get('host')?.trim()].filter(Boolean))
  return allowed.has(host)
}
