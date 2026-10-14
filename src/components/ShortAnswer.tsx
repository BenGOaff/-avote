import type { ReactNode } from 'react'
import { UI_COPY } from '@/lib/copy'

/**
 * « La réponse courte » : la réponse en deux ou trois phrases, en tête de page, avant le détail et les sources.
 * C'est ce que lisent d'abord les gens pressés et ce que reprennent les moteurs de réponse ; le détail suit juste dessous.
 */
export function ShortAnswer({ children, updated, id = 'reponse-courte' }: { children: ReactNode; updated?: string; id?: string }) {
  return (
    <section className="short-answer measure" aria-labelledby={id}>
      <h2 id={id} className="short-answer__title">
        {UI_COPY.shortAnswer.title}
      </h2>
      <div className="short-answer__body">{children}</div>
      {updated && <p className="short-answer__date">{updated}</p>}
    </section>
  )
}
