import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { liveCorpus, questionnaire, QUICK_ITEMS } from '@/lib/data'
import { ENGINE_CONFIG } from '@/lib/engine/config'
import { LEGAL, displayEmail } from '@/lib/legal'

export const metadata: Metadata = {
  title: 'Espace presse : chiffres, méthode, visuels',
  description: 'Ça vote ? en chiffres à jour, la méthode en cinq points, les visuels à télécharger et le contact presse. Données ouvertes en un fichier JSON.',
  alternates: { canonical: '/presse' },
}

const fmt = new Intl.NumberFormat('fr-FR')

/** Chiffres recalculés à chaque déploiement, depuis les fichiers publiés (rien n'est saisi à la main). */
function figures() {
  const positions = Object.values(liveCorpus.positions).flatMap((byItem) => Object.values(byItem))
  const known = positions.filter((p) => p && !('missing' in p) && !('set' in p && p.set.length === 0))
  const sources = (liveCorpus as { sources?: unknown[] }).sources?.length ?? 0
  return {
    candidates: liveCorpus.actors.length,
    questions: questionnaire.items.filter((i) => !i.inactive).length,
    quick: QUICK_ITEMS.length,
    themes: questionnaire.themes.length,
    known: known.length,
    sources,
  }
}

const LOGOS = [
  { href: '/brand/logo-horizontal.svg', label: 'Logo horizontal (SVG, fond clair)' },
  { href: '/brand/logo-horizontal-clair.svg', label: 'Logo horizontal (SVG, fond sombre)' },
  { href: '/brand/logo-compact.svg', label: 'Logo compact (SVG)' },
  { href: '/brand/symbole-512.png', label: 'Symbole (PNG, 512 px)' },
]

export default function PressPage() {
  const f = figures()
  const mail = `mailto:${LEGAL.contactEmail}?subject=Presse`
  return (
    <div className="container">
      <PageHeader
        kicker="Presse"
        title="Espace presse"
        lede="Les chiffres du jour, la méthode en cinq points, les visuels et un contact qui répond. Tout ce qui est écrit ici se vérifie sur le site."
      />
      <div className="measure stack">
        <h2 style={{ fontSize: 'var(--h3)' }}>En chiffres, aujourd’hui</h2>
        <dl className="dl">
          <dt>Candidats suivis</dt>
          <dd>{fmt.format(f.candidates)}</dd>
          <dt>Questions du test</dt>
          <dd>
            {fmt.format(f.questions)} sur {f.themes} thèmes, {f.quick} dans la version rapide
          </dd>
          <dt>Positions documentées</dt>
          <dd>{fmt.format(f.known)}, chacune avec sa citation et son lien</dd>
          <dt>Sources citées</dt>
          <dd>{fmt.format(f.sources)}</dd>
          <dt>Version de la méthode</dt>
          <dd>{ENGINE_CONFIG.version}</dd>
        </dl>
        <p className="small muted">Chiffres recalculés à chaque mise à jour du site, à partir des fichiers publiés.</p>

        <h2 style={{ fontSize: 'var(--h3)' }}>La méthode en cinq points</h2>
        <ol>
          <li>
            Chaque position d’un candidat est une phrase qu’il a écrite ou prononcée. Un programme la retrouve mot pour mot dans la page d’origine avant
            publication ; sinon, elle n’est pas publiée.
          </li>
          <li>
            Quand aucune position n’est trouvée, la case reste vide. Elle ne devient ni « neutre » ni une déduction. Un candidat trop peu documenté sur tes
            réponses est affiché sans rang.
          </li>
          <li>
            Les réponses au test sont calculées dans le navigateur et n’en sortent pas. Le duel à distance fait voyager les réponses dans la partie du lien
            après le #, que le navigateur n’envoie jamais au serveur.
          </li>
          <li>
            Les règles de codage et les formules sont publiques : <Link href="/methodologie">méthode</Link>, <Link href="/sources">sources</Link>,{' '}
            <Link href="/corrections">corrections</Link>.
          </li>
          <li>
            Les données sont ouvertes : questions, positions, citations et liens en un fichier, <a href="/donnees.json">donnees.json</a>, et en tableur, <a href="/positions.csv">positions.csv</a>.
          </li>
        </ol>

        <h2 style={{ fontSize: 'var(--h3)' }}>Ce que le site propose</h2>
        <ul>
          <li>
            <Link href="/test">Le test</Link> : {f.questions} questions, des priorités à répartir, des lignes rouges, et la proximité avec chaque candidat
            question par question.
          </li>
          <li>
            <Link href="/duel">Le duel</Link> : à deux sur un téléphone ou à distance par un lien, pour voir sur quoi on est d’accord avec ses proches.
          </li>
          <li>
            <Link href="/programmes">Les programmes par sujet</Link>, <Link href="/candidats">les fiches candidats</Link> et{' '}
            <Link href="/partis">les partis</Link>.
          </li>
          <li>
            <Link href="/medias">Qui possède ton info</Link>, <Link href="/fake-news">les intox démontées</Link> et{' '}
            <Link href="/verifier">Vrai ou faux ?</Link>
          </li>
          <li>
            <Link href="/quiz">Les quiz</Link> et <Link href="/sondages">les sondages expliqués</Link>.
          </li>
        </ul>

        <h2 style={{ fontSize: 'var(--h3)' }}>Qui édite</h2>
        <p>
          Un projet citoyen, anonyme, sans publicité. Les raisons de l’anonymat, le financement et ce que le site s’interdit sont détaillés dans{' '}
          <Link href="/le-projet">le projet</Link> et <Link href="/independance">l’indépendance</Link>.
        </p>

        <h2 style={{ fontSize: 'var(--h3)' }}>Visuels</h2>
        <ul>
          {LOGOS.map((l) => (
            <li key={l.href}>
              <a href={l.href} download>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="small muted">Libres d’usage pour parler du site. Merci de ne pas les déformer ni les recolorer.</p>

        <h2 style={{ fontSize: 'var(--h3)' }}>Contact presse</h2>
        <p>
          <a href={mail}>{displayEmail(LEGAL.contactEmail)}</a>, objet « Presse ». Réponse écrite, avec les sources de chaque chiffre.
        </p>
      </div>
    </div>
  )
}
