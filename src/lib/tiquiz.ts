/** Quiz Tiquiz affichés sur le site (content/quiz/tiquiz.json). */
import data from '@content/quiz/tiquiz.json'

export interface TiquizQuiz {
  slug: string
  title: string
  lede: string
  url: string
  duration?: string
}

export const TIQUIZ_QUIZZES = data.quizzes as TiquizQuiz[]
export const getTiquiz = (slug: string) => TIQUIZ_QUIZZES.find((q) => q.slug === slug)
