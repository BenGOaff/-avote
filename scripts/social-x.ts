/**
 * Publie sur X les publications préparées (content/social), sans l'API officielle : un navigateur sans écran
 * reprend la session du compte grâce à son cookie `auth_token` (secret X_AUTH_TOKEN), écrit le texte, joint le visuel
 * et envoie. Choix assumé de la rédaction : le compte peut être restreint par X.
 *
 * Seules les publications du jour (24 h) sont reprises, chacune une fois (content/social/_x.json).
 * Le visuel doit être en ligne : on attend que /social/<id>/carte.png réponde, 10 minutes au plus.
 * En cas d'échec, une capture d'écran est laissée dans .x-debug/ pour comprendre ce qui a coincé.
 *
 * Usage : X_AUTH_TOKEN=… npx tsx scripts/social-x.ts [--dry]
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright-core'
import { SocialPostSchema, type SocialPost } from '../src/lib/social-schema'

const ROOT = process.cwd()
const DRY = process.argv.includes('--dry')
const DIR = path.join(ROOT, 'content/social')
const STATE = path.join(DIR, '_x.json')
const SITE = process.env.SITE_URL || 'https://xn--avote-xra.fr'
const TOKEN = process.env.X_AUTH_TOKEN
const DEBUG = path.join(ROOT, '.x-debug')

type State = { posted: Record<string, string> }
const state: State = existsSync(STATE) ? JSON.parse(readFileSync(STATE, 'utf8')) : { posted: {} }

const now = Date.now()
const due: SocialPost[] = readdirSync(DIR)
  .filter((f) => f.endsWith('.json') && !f.startsWith('_'))
  .map((f) => SocialPostSchema.parse(JSON.parse(readFileSync(path.join(DIR, f), 'utf8'))))
  .filter((p) => !state.posted[p.id] && Date.parse(p.at) <= now && now - Date.parse(p.at) < 24 * 3600e3)
  .sort((a, b) => a.at.localeCompare(b.at))

const link = (p: SocialPost) => `${SITE}/social/${p.id}?utm_source=x&utm_medium=social&utm_campaign=${p.kind}`
const text = (p: SocialPost) => `${p.text.x}\n\n${link(p)}`

async function image(p: SocialPost): Promise<Buffer> {
  const url = `${SITE}/social/${p.id}/carte.png`
  for (let i = 0; i < 20; i++) {
    const res = await fetch(url).catch(() => null)
    if (res?.ok) return Buffer.from(await res.arrayBuffer())
    await new Promise((r) => setTimeout(r, 30_000))
  }
  throw new Error(`visuel pas en ligne après 10 minutes : ${url}`)
}

async function main() {
  if (!due.length) return console.log('X : rien à publier')
  if (DRY) {
    for (const p of due) console.log(`--- ${p.id}\n${text(p)}`)
    return
  }
  if (!TOKEN) return console.log('X : secret X_AUTH_TOKEN absent, publication sur X ignorée')

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    locale: 'fr-FR',
    viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  })
  await context.addCookies([
    { name: 'auth_token', value: TOKEN, domain: '.x.com', path: '/', secure: true, httpOnly: true, sameSite: 'None' },
    ...(process.env.X_CT0 ? [{ name: 'ct0', value: process.env.X_CT0, domain: '.x.com', path: '/', secure: true, sameSite: 'Lax' as const }] : []),
  ])
  const page = await context.newPage()
  let failed = 0
  try {
    for (const p of due) {
      try {
        const img = await image(p)
        await page.goto('https://x.com/compose/post', { waitUntil: 'domcontentloaded' })
        if (/\/login|\/i\/flow\/login/.test(page.url())) throw new Error('session X expirée : renouveler le secret X_AUTH_TOKEN')
        const box = page.locator('[data-testid="tweetTextarea_0"]').first()
        await box.waitFor({ timeout: 30_000 })
        await box.click()
        await page.keyboard.insertText(text(p))
        await page.locator('input[data-testid="fileInput"]').first().setInputFiles({ name: `${p.id}.png`, mimeType: 'image/png', buffer: img })
        await page.locator('[data-testid="attachments"] img').first().waitFor({ timeout: 60_000 })
        const send = page.locator('[data-testid="tweetButton"]').first()
        await send.waitFor({ timeout: 30_000 })
        await page.waitForFunction(() => document.querySelector('[data-testid="tweetButton"]')?.getAttribute('aria-disabled') !== 'true', null, { timeout: 60_000 })
        await send.click()
        await box.waitFor({ state: 'detached', timeout: 30_000 })
        state.posted[p.id] = new Date().toISOString()
        writeFileSync(STATE, JSON.stringify(state, null, 1) + '\n')
        console.log(`X : publié ${p.id}`)
        await page.waitForTimeout(20_000 + Math.random() * 20_000)
      } catch (e) {
        failed++
        mkdirSync(DEBUG, { recursive: true })
        await page.screenshot({ path: path.join(DEBUG, `${p.id}.png`) }).catch(() => {})
        console.error(`X : échec ${p.id} sur ${page.url()} : ${(e as Error).message}`)
        if (/session X expirée/.test((e as Error).message)) break
      }
    }
  } finally {
    await browser.close()
  }
  if (failed) process.exitCode = 1
}

main()
