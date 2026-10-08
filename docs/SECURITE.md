# Sécurité et confidentialité

## Invariants (ne jamais casser)

1. Les réponses au test ne quittent jamais le navigateur : pas d’API `/score`, `/profile` ou équivalent, pas de table de profils.
2. Aucune réponse politique n’est envoyée à un LLM.
3. Aucune ressource tierce sur le site (polices, scripts, images) : la CSP l’interdit.
4. Les URL ne contiennent jamais de réponse, de score ou d’identifiant de profil.
5. La newsletter ne reçoit aucune information du test.

Vérifié le 8 octobre 2026 : parcours complet du test au navigateur, **aucune requête vers un domaine extérieur**, aucune erreur JavaScript.

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

Jamais dans le dépôt. `ANTHROPIC_API_KEY` en secret GitHub Actions ; `RESEND_API_KEY` et `NEWSLETTER_SECRET` dans hPanel.
