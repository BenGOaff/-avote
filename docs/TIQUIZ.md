# Le quiz Tiquiz

## Le point bloquant

Le test politique ne peut **pas** être sur Tiquiz si Tiquiz collecte un email. Associer un email à des réponses politiques ou à un profil « proche de tel candidat », c’est stocker « qui pense quoi » : une donnée sensible au sens du RGPD (article 9), exactement ce que le projet promet de ne jamais faire. Un tag Systeme.io du type « profil écolo » sur un contact suffit à créer ce fichier.

Le test complet reste donc sur le site, calculé dans le navigateur. Tiquiz sert à autre chose : **un quiz express d’acquisition, sans aucune question d’opinion**, qui collecte prénom + email et renvoie vers le test complet.

## Proposition : « Quel indécis es-tu ? »

Huit questions sur la façon de suivre la campagne. Aucune ne porte sur une opinion, un parti, un candidat ou une intention de vote (pas même « vas-tu voter ? »).

1. **Comment tu suis l’actu politique, la plupart du temps ?** Réseaux sociaux / Télé ou radio / Je lis des articles / Mes proches m’en parlent
2. **Un candidat annonce une mesure. Ton premier réflexe ?** Chercher combien ça coûte / Me demander ce que ça change pour moi / Attendre de voir les réactions / Passer à autre chose
3. **Un débat télévisé, tu tiens combien de temps ?** Jusqu’au bout / 20 minutes / Les extraits le lendemain / Je ne regarde pas
4. **Ce qui te fait décrocher le plus vite ?** Les promesses sans chiffres / Le jargon / Les clashs / La sensation que rien ne change
5. **Un programme de 80 pages, tu en fais quoi ?** Je le lis en diagonale / Je cherche un résumé fiable / Je lis la partie qui me concerne / Rien
6. **Quand tu doutes d’une info, tu fais quoi ?** Je cherche la source / Je compare plusieurs médias / Je demande autour de moi / Je laisse tomber
7. **Ce qui compte le plus pour te décider ?** La cohérence des propositions / L’effet sur ma vie / La personnalité / Je ne sais pas encore
8. **À six mois du vote, tu te sens :** Curieux / Perdu / Agacé / Pressé d’en finir

### Profils (résultats)

- **Le lecteur de bas de page** — tu veux la source avant l’avis. → « Le test complet te montre le passage du programme derrière chaque résultat. »
- **Le pragmatique du quotidien** — tu juges sur ce qui change pour toi. → « Le test part de ce qui compte pour toi, et te dit ce qui reste flou. »
- **Le zappeur lucide** — peu de temps, beaucoup de méfiance. → « Dix minutes, pas de compte, rien n’est envoyé. »
- **L’égaré de bonne foi** — trop de bruit, pas assez de repères. → « Commence par tes priorités, on trie le reste. »

Chaque résultat : bouton **« Faire le test complet »** vers `https://çavote.fr/test` + inscription à la lettre.

### Règles côté Tiquiz / Systeme.io

- Tag Systeme.io autorisé : le **profil d’habitude** (ex. `indecis-lecteur`), jamais une réponse politique.
- Consentement newsletter explicite, non précoché, distinct.
- Si les emails doivent arriver dans Resend plutôt que Systeme.io, il faudra un webhook Tiquiz → `/api/newsletter/subscribe` (à construire) : à décider.

## Intégration au site

Renseigner `NEXT_PUBLIC_TIQUIZ_URL` dans hPanel : la page `/quiz` affiche le quiz dans un cadre (la politique de sécurité n’autorise que ce domaine-là).
