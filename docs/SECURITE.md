# Sécurité et confidentialité

## Invariants (ne jamais casser)

1. Les réponses au test ne quittent jamais le navigateur : pas d’API `/score`, `/profile` ou équivalent, pas de table de profils.
2. Aucune réponse politique n’est envoyée à un LLM.
3. Aucune ressource tierce sur le site (polices, scripts, images) : la CSP l’interdit. Exception : Google Analytics (googletagmanager.com, google-analytics.com), chargé seulement après consentement, coupé pendant le test et sur /test, /resultats, /mon-profil, /studio, /duel. Aucun événement personnalisé n’est envoyé.
4. Les URL ne contiennent jamais de réponse, de score ou d’identifiant de profil.
5. La newsletter ne reçoit aucune information du test.
6. L’urne (`/urne`) ne reçoit que le choix de bulletin, jamais une réponse du test. Deux registres jamais reliés (Supabase UE, schéma `urne`, RLS sans politique) : compteurs (nombres seuls) et empreintes HMAC de l’IP (anti-doublon). Deux appels distincts, protégés par un jeton serveur ; aucun ne porte à la fois une empreinte et un choix. Anti-robots : preuve de travail signée, sans service tiers. Rien n’est journalisé. Résultats gelés la veille et le jour de chaque tour. Empreintes à effacer après le second tour.
7. Le formulaire de contact (`/api/contact`) transmet le message par email (Resend) à l’adresse de contact, puis l’oublie : rien n’est stocké ni journalisé. Champs limités (type, page, message, email facultatif), pot de miel, délai minimal, limite par IP en mémoire. Le lien de don (Buy Me a Coffee) est un simple lien sortant : aucun script ni widget tiers.

8. Le vérificateur (`/api/verifier`) reçoit une question de fait, jamais une réponse au test. Il cherche d’abord dans nos sources ; seulement s’il trouve un passage proche, il envoie la question et ces passages au modèle (Anthropic), sans IP ni identifiant. Rien n’est stocké ni journalisé : la réponse (pas la question) est gardée quelques heures en mémoire sous une empreinte SHA-256 de la question. Limite par IP en mémoire, plafond d’appels par jour (`FACTCHECK_DAILY_MAX`), plafond de dépense mensuel fixé côté Anthropic (espace de travail dédié). Réponse affichée seulement si les sources citées, la citation mot pour mot et les nombres passent les contrôles.

Vérifié le 8 octobre 2026 : parcours complet du test au navigateur, **aucune requête vers un domaine extérieur**, aucune erreur JavaScript.
9. Le duel (`/duel`) se joue sur un seul appareil : les réponses des deux joueurs et leurs prénoms restent dans l’état de la page, jamais écrits dans le navigateur ni envoyés. L’image à partager ne porte que les prénoms et le taux d’accord.
10. Les alertes « ton résultat peut bouger » ne reçoivent aucune réponse. Notification : le navigateur fournit une adresse de service de notification (Google, Mozilla, Apple, Microsoft, vérifiée par liste) et deux clés de chiffrement, rangées dans Supabase (schéma `alertes`, RLS sans politique, fonctions protégées par le jeton serveur), sans IP ni date. Le robot (`scripts/alertes.ts`) envoie à tous le même contenu public chiffré (changements de position du corpus) ; c'est le service worker qui compare avec les réponses lues dans IndexedDB sur l'appareil. Une adresse déclarée morte par le service est supprimée. Email : case facultative à l'inscription, segment Resend dédié, même contenu pour tous.

## En-têtes HTTP (`next.config.mjs`)

CSP sans origine tierce, HSTS, `X-Frame-Options: DENY`, `nosniff`, `Permissions-Policy` restrictive. Sur `/test`, `/resultats`, `/mon-profil`, `/studio` : `Referrer-Policy: no-referrer`, `noindex`, `Cache-Control: private, no-store`.

`script-src` autorise `'unsafe-inline'` : c’est nécessaire pour garder des pages statiques (rapides, résistantes aux pics de trafic) sans nonce. Comme aucun contenu utilisateur n’est injecté dans le HTML et que le Markdown des articles est échappé, le risque XSS reste faible. Passer à une CSP à nonce rendrait toutes les pages dynamiques.

## Newsletter

- Double opt-in : rien n’est enregistré avant le clic de confirmation.
- Le lien de confirmation transporte email + prénom **chiffrés et authentifiés** (AES-256-GCM, clé dérivée par HKDF de `NEWSLETTER_SECRET`), valable 48 h.
- La confirmation se fait par un bouton (POST) : les scanners de liens des messageries ne peuvent pas confirmer à la place de la personne.
- Champs stricts (tout champ inconnu est refusé), pot de miel anti-robots, limitation de débit en mémoire, aucune adresse IP écrite.
- Les seules données stockées (email, prénom) sont chez Resend.

## Contenus générés par IA

Les flux RSS sont traités comme des données non fiables : pas d’outil donné au modèle, sortie structurée, contrôles automatiques (citations, nombres, tournures), Markdown échappé au rendu, liens limités à http(s), relecture humaine avant publication.

## Secrets

Jamais dans le dépôt. `ANTHROPIC_API_KEY` en secret GitHub Actions (robots) et dans hPanel (vérificateur, clé d’un espace de travail Anthropic dédié avec plafond de dépense) ; `RESEND_API_KEY`, `NEWSLETTER_SECRET`, `URNE_SUPABASE_URL`, `URNE_SUPABASE_KEY`, `URNE_TOKEN` et `URNE_SECRET` dans hPanel ; `RESEND_ALERT_SEGMENT_ID` dans hPanel et en secret GitHub ; `URNE_SUPABASE_URL`, `URNE_SUPABASE_KEY`, `URNE_TOKEN` et `VAPID_PRIVATE_KEY` en secrets GitHub pour le robot des alertes. La clé publique VAPID est dans `src/lib/push-shared.ts`.
