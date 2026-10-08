import type { NextRequest } from 'next/server'

/**
 * Adresse du visiteur. Derrière le CDN de l'hébergeur, `X-Real-IP` est réécrite avec l'adresse réelle (vérifié le
 * 8 octobre 2026), alors que la première valeur de `X-Forwarded-For` peut être fournie par le visiteur lui-même.
 */
export const clientIp = (req: NextRequest): string => req.headers.get('x-real-ip')?.trim() ?? ''
