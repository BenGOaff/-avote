# Déployer sur Hostinger (Web Apps)

Hostinger « Web Apps » (= applications Node.js) héberge Next.js en mode serveur et redéploie à chaque push sur la branche connectée. Sources : docs.hostinger.com/node.js (vérifié le 8 octobre 2026).

## Prérequis

- Offre **Business** ou **Cloud** (les Web Apps n’existent pas sur les offres d’entrée de gamme).
- Le domaine **çavote.fr** (punycode : `xn--avote-xra.fr`). S’il est déjà rattaché à un autre site dans hPanel, il faut d’abord le détacher.

## Étapes

1. hPanel → **Sites web** → **Web Apps** → *Créer une application*.
2. Source : **GitHub**, dépôt `BenGOaff/-avote`, branche `main`.
3. Réglages de build :
   - Framework : **Next.js**
   - Version de Node : **22**
   - Commande de build : `build` (script npm)
   - Dossier de sortie : `.next`
   - Gestionnaire de paquets : npm (détecté via `package-lock.json`)
4. **Variables d’environnement** (hPanel → l’app → Variables d’environnement), voir `.env.example` :
   - `NEXT_PUBLIC_SITE_URL` = `https://çavote.fr`
   - `RESEND_API_KEY`, `RESEND_FROM`, `RESEND_SEGMENT_ID`
   - `NEWSLETTER_SECRET` : générer avec `openssl rand -base64 32`, ne jamais le réutiliser
   - `NEXT_PUBLIC_TIQUIZ_URL` (facultatif)
   Les variables `NEXT_PUBLIC_*` doivent être définies **avant** le build qui les utilise. Enregistrer déclenche un redéploiement.
5. Domaine : rattacher çavote.fr à l’application et activer le SSL.
6. Vérifier : `https://çavote.fr/`, `/test`, `/feed.xml`, `/sitemap.xml`, `/llms.txt`.

## Bon à savoir

- Hostinger force `output: "standalone"` : c’est déjà le réglage du projet.
- L’application s’arrête après une période sans visite et redémarre à la requête suivante (premier chargement plus lent).
- Le disque est réinitialisé à chaque déploiement : le site ne stocke rien localement, c’est voulu.
- Chaque fusion d’une PR de veille sur `main` redéploie le site : c’est ainsi que les brèves sont publiées.
- Le support des domaines accentués (IDN) sur les Web Apps n’est pas documenté explicitement. Si le rattachement de `çavote.fr` échoue, essayer `xn--avote-xra.fr` ou demander au support.

## Resend (newsletter)

1. Ajouter le domaine `xn--avote-xra.fr` dans Resend et poser les enregistrements DNS (SPF, DKIM) dans la zone Hostinger.
2. Créer un **segment** (ex-« audience ») « Newsletter » et copier son identifiant dans `RESEND_SEGMENT_ID`.
3. Créer une clé API avec accès envoi et contacts.
4. Pour les envois de la lettre : *Broadcasts* dans Resend, en ciblant ce segment. Le lien `{{{RESEND_UNSUBSCRIBE_URL}}}` gère la désinscription.
