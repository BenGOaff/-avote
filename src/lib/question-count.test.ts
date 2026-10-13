import { describe, expect, it } from 'vitest'
import { QUESTION_COUNT } from './question-count'
import { questionnaire } from './questions'

describe('QUESTION_COUNT', () => {
  it('suit le questionnaire en vigueur', () => {
    expect(QUESTION_COUNT).toBe(questionnaire.items.length)
  })
})
