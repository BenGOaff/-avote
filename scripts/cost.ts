/**
 * Compteur de dépenses de l'API Claude pour les scripts automatiques.
 * Chaque réponse est comptée (jetons, cache, recherches web) ; au-delà du budget du passage,
 * le script s'arrête proprement au lieu de continuer à dépenser. Le total est écrit dans le
 * résumé du job GitHub Actions.
 */
import { appendFileSync } from 'node:fs'

// Prix en dollars par million de jetons (tarifs publics, octobre 2026). Recherche web : 10 $ / 1 000.
const PRICES: Record<string, { input: number; output: number; cacheWrite: number; cacheRead: number }> = {
  'claude-opus-5-5': { input: 4, output: 20, cacheWrite: 5, cacheRead: 0.2 },
  'claude-sonnet-5-5': { input: 2, output: 10, cacheWrite: 2.5, cacheRead: 0.1 },
  'claude-haiku-5-5': { input: 0.1, output: 0.5, cacheWrite: 0.125, cacheRead: 0.01 },
  'claude-opus-5': { input: 5, output: 25, cacheWrite: 6.25, cacheRead: 0.5 },
  'claude-opus-4-8': { input: 5, output: 25, cacheWrite: 6.25, cacheRead: 0.5 },
}
const SEARCH_USD = 0.01

export interface UsageLike {
  input_tokens?: number | null
  output_tokens?: number | null
  cache_creation_input_tokens?: number | null
  cache_read_input_tokens?: number | null
  server_tool_use?: { web_search_requests?: number | null } | null
}

export class BudgetExceeded extends Error {}

export class CostMeter {
  private usd = 0
  private calls = 0
  private searches = 0
  constructor(
    private readonly label: string,
    private readonly budgetUsd: number,
  ) {}

  /** Compte une réponse ; le modèle servi peut différer du modèle demandé (repli). */
  add(model: string, u: UsageLike | null | undefined) {
    if (!u) return
    const p = PRICES[model] ?? PRICES['claude-opus-5-5']!
    const searches = u.server_tool_use?.web_search_requests ?? 0
    this.usd +=
      ((u.input_tokens ?? 0) * p.input + (u.output_tokens ?? 0) * p.output + (u.cache_creation_input_tokens ?? 0) * p.cacheWrite + (u.cache_read_input_tokens ?? 0) * p.cacheRead) / 1e6 +
      searches * SEARCH_USD
    this.calls++
    this.searches += searches
  }

  get spent() {
    return this.usd
  }

  /** À appeler avant chaque nouvelle tâche : refuse d'en lancer une si le budget est atteint. */
  check() {
    if (this.usd >= this.budgetUsd) throw new BudgetExceeded(`budget du passage atteint (${this.usd.toFixed(2)} $ sur ${this.budgetUsd.toFixed(2)} $)`)
  }

  get exhausted() {
    return this.usd >= this.budgetUsd
  }

  report() {
    const line = `${this.label} : ${this.usd.toFixed(2)} $ dépensés (budget ${this.budgetUsd.toFixed(2)} $), ${this.calls} appels, ${this.searches} recherches web.`
    console.log(line)
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `- ${line}\n`)
  }
}

export function budgetFromEnv(name: string, fallback: number): number {
  const v = Number(process.env[name])
  return Number.isFinite(v) && v > 0 ? v : fallback
}
