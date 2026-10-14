'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ComponentProps } from 'react'

/**
 * Lien des menus (barre du haut, rubrique, barre mobile, pied de page) : la page n'est préchargée qu'au survol,
 * au toucher ou au focus. Préchargées dès l'affichage, les dizaines de liens des menus téléchargeaient à chaque page
 * les pages voisines et leurs images, au détriment de la page demandée sur un téléphone.
 */
export function NavLink({ href, onMouseEnter, onTouchStart, onFocus, ...rest }: Omit<ComponentProps<typeof Link>, 'href' | 'prefetch'> & { href: string }) {
  const router = useRouter()
  const warm = () => router.prefetch(href)
  return (
    <Link
      {...rest}
      href={href}
      prefetch={false}
      onMouseEnter={(e) => {
        warm()
        onMouseEnter?.(e)
      }}
      onTouchStart={(e) => {
        warm()
        onTouchStart?.(e)
      }}
      onFocus={(e) => {
        warm()
        onFocus?.(e)
      }}
    />
  )
}
