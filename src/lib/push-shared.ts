/**
 * Notifications sur le téléphone : ce que le navigateur et le serveur partagent.
 * La clé publique VAPID identifie le site auprès des services de notification ; la clé privée reste dans les
 * secrets GitHub (robot scripts/alertes.ts), jamais dans le dépôt.
 */
export const VAPID_PUBLIC_KEY = 'BDePJ2ZnJAVwHJQQZezLtQE63JcFyIlyJ4APgrtgW7GVcAQtGJTFF2j0kbvZQ2p4CsyumDnEMm-nLQRGC1nzFs8'

/** Services de notification des navigateurs : le robot n'envoie qu'à ces adresses, jamais ailleurs. */
const PUSH_HOSTS = [/^fcm\.googleapis\.com$/, /^updates\.push\.services\.mozilla\.com$/, /^web\.push\.apple\.com$/, /^[a-z0-9-]+\.notify\.windows\.com$/]

export function isPushEndpoint(raw: string): boolean {
  try {
    const u = new URL(raw)
    return u.protocol === 'https:' && !u.port && !u.username && !u.password && PUSH_HOSTS.some((h) => h.test(u.hostname))
  } catch {
    return false
  }
}
