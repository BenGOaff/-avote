/**
 * Compteur de dépenses de l'API Claude pour les scripts automatiques.
 * Chaque réponse est comptée (jetons, cache, recherches web) ; au-delà du budget du passage,
 * le script s'arrête proprement au lieu de continuer à dépenser. Le total est écrit dans le
 * résumé du job GitHub Actions.
 *
 * Plafond mensuel (tous les robots confondus) : chaque passage inscrit sa dépense dans un petit registre
 * (.budget/<robot>/<tâche>-<AAAA-MM>.json, conservé d'un passage à l'autre par le cache de GitHub Actions).
 * Avant de dépenser, on additionne le mois en cours : au-delà de MONTHLY_BUDGET_USD, plus aucun appel.
 */
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const BUDGET_ROOT = '.budget'
const month = () => new Date().toISOString().slice(0, 7)

/** Total dépensé ce mois-ci par tous les robots (registres restaurés du cache). */
export function spentThisMonth(): number {
  if (!existsSync(BUDGET_ROOT)) return 0
  let total = 0
  for (const dir of readdirSync(BUDGET_ROOT, { withFileTypes: true }).filter((d) => d.isDirectory()))
    for (const f of readdirSync(path.join(BUDGET_ROOT, dir.name)).filter((f) => f.endsWith(`-${month()}.json`))) {
      try {
        total += Number(JSON.parse(readFileSync(path.join(BUDGET_ROOT, dir.name, f), 'utf8')).spent) || 0
      } catch {
        /* registre illisible : ignoré */
      }
    }
  return total
}

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
  private readonly budgetUsd: number
  private readonly monthBefore: number
  private readonly monthly: number
  constructor(
    private readonly label: string,
    runBudgetUsd: number,
  ) {
    this.monthly = budgetFromEnv('MONTHLY_BUDGET_USD', 30)
    this.monthBefore = spentThisMonth()
    // Le passage ne peut pas dépenser plus que ce qu'il reste dans le mois
    this.budgetUsd = Math.max(0, Math.min(runBudgetUsd, this.monthly - this.monthBefore))
    if (this.budgetUsd === 0) console.warn(`${label} : plafond mensuel atteint (${this.monthBefore.toFixed(2)} $ sur ${this.monthly.toFixed(2)} $), aucun appel ce mois-ci.`)
    // Même en cas d'erreur ou d'arrêt brutal, la dépense est inscrite au registre
    process.once('exit', () => this.flush())
  }

  private flushed = false
  private flush() {
    if (this.flushed) return
    this.flushed = true
    const dir = process.env.BUDGET_LEDGER_DIR
    if (!dir || this.usd === 0) return
    mkdirSync(dir, { recursive: true })
    const file = path.join(dir, `${this.label.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')}-${month()}.json`)
    const prev = existsSync(file) ? Number(JSON.parse(readFileSync(file, 'utf8')).spent) || 0 : 0
    writeFileSync(file, JSON.stringify({ spent: prev + this.usd, updatedAt: new Date().toISOString() }) + '\n')
  }

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

  private tasks = 0
  private running = 0
  /**
   * Lance une tâche en parallèle des autres, seulement si le budget couvre aussi, au coût moyen d'une tâche,
   * celles déjà en cours : sans cette réserve, les tâches lancées juste avant le plafond le font dépasser.
   * Renvoie false (sans rien lancer) quand le budget ne suffit plus.
   */
  async run(task: () => Promise<unknown>): Promise<boolean> {
    const avg = this.tasks ? this.usd / this.tasks : 0
    if (this.exhausted || this.usd + avg * (this.running + 1) > this.budgetUsd) return false
    this.running++
    try {
      await task()
    } finally {
      this.running--
      this.tasks++
    }
    return true
  }

  report() {
    const monthTotal = this.monthBefore + this.usd
    const line = `${this.label} : ${this.usd.toFixed(2)} $ dépensés (budget du passage ${this.budgetUsd.toFixed(2)} $), ${this.calls} appels, ${this.searches} recherches web. Mois en cours : ${monthTotal.toFixed(2)} $ sur ${this.monthly.toFixed(2)} $.`
    console.log(line)
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `- ${line}\n`)
    // Inscription au registre du robot (seulement en CI, où le registre est conservé d'un passage à l'autre)
    this.flush()
  }
}

export function budgetFromEnv(name: string, fallback: number): number {
  const v = Number(process.env[name])
  return Number.isFinite(v) && v > 0 ? v : fallback
}
