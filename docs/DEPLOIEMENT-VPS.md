# Déploiement sur un serveur Docker, derrière un tunnel Cloudflare

Remplace l'hébergement « Web Apps » décrit dans `DEPLOIEMENT-HOSTINGER.md`.

## Principe

- `.github/workflows/image.yml` construit l'image du site à chaque changement de `main` et la publie sur `ghcr.io/bengoaff/cavote` (paquet public).
- Sur le serveur, `deploy/docker-compose.yml` lance trois services :
  - `app` : le site, limité à 1 Go de mémoire et 2 processeurs ;
  - `tunnel` : `cloudflared`, qui relie le site à Cloudflare sans ouvrir de port sur le serveur ;
  - `updater` : toutes les 5 minutes, récupère l'image si elle a changé et ne recrée que `app`.
- Le public ne voit que Cloudflare : l'adresse du serveur n'apparaît dans aucun enregistrement DNS (anonymat, voir `SECURITE.md`).
- L'adresse du visiteur arrive dans `CF-Connecting-IP` ; `CLIENT_IP_HEADER` le dit à l'application (urne, limites de débit).

## Variables (fichier .env du projet Docker, jamais dans le dépôt)

`CLOUDFLARE_TUNNEL_TOKEN`, `RESEND_API_KEY`, `RESEND_FROM`, `RESEND_SEGMENT_ID`, `RESEND_ALERT_SEGMENT_ID`, `NEWSLETTER_SECRET`, `CONTACT_TO`, `URNE_SUPABASE_URL`, `URNE_SUPABASE_KEY`, `URNE_SECRET`, `URNE_TOKEN`, `ANTHROPIC_API_KEY`, `FACTCHECK_MODEL`, `FACTCHECK_DAILY_MAX`.

## Tunnel Cloudflare

Routes publiques du tunnel, toutes vers `http://app:3000` :

- `xn--avote-xra.fr` et `www.xn--avote-xra.fr` ;
- `cavote.fr` et `www.cavote.fr` (redirigés vers le domaine accentué par `next.config.mjs`).

## DNS (zone Cloudflare)

- Le site et `www` des deux domaines : CNAME vers le tunnel, proxifiés.
- Messagerie, à l'identique de l'ancienne zone :
  - MX vers la messagerie Hostinger (`mx1`, `mx2`) ;
  - SPF, DKIM de la messagerie (`hostingermail-*`), `autodiscover`, `autoconfig` ;
  - envoi Resend : sous-domaines `send` et `rsend`, `resend._domainkey` ;
  - `_dmarc`.
- La ligne MX de réception Resend (`inbound-smtp…amazonaws.com`, priorité 4) a été retirée le 29 octobre 2026 : aucune boîte Resend n'existait, et le courrier adressé au domaine s'y perdait. Ne pas la remettre sans créer de boîte de réception chez Resend.
- `quiz` : CNAME vers un service externe, gardé tel quel. `ftp` : retiré avec l'ancien hébergement.

Avant tout changement de serveurs de noms, comparer la zone exportée ligne à ligne.

## Vérifier

- Comparer chaque URL du sitemap avec la production, avec et sans slash final : code, URL d'arrivée, nombre de redirections.
- Ouvrir les pages témoins dans un navigateur : zéro violation CSP, zéro erreur console, feuille de style et police chargées, aucune image cassée, canonical identique.
- Voter dans l'urne de test : un vote accepté, un second refusé.
