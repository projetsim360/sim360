# Feuille de route — correctifs à la suite du test du site

Date : 6 octobre 2026
Source : « Observations et recommandations à la suite du test du site »
Méthode : chaque observation a été vérifiée par lecture du code. Rien n'a été exécuté ni testé sur la prod.

Les charges sont des estimations en jours-développeur, à affiner lot par lot.

---

## Suivi d'exécution

Branche : `fix/retours-test-site`. Rien n'est commité. Aucun test, build, typecheck ni migration n'a été lancé pendant l'implémentation (machine surchargée) : tout est regroupé dans « À exécuter à la fin ».

### Points d'attention

- Rien n'a encore été compilé ni exécuté : le typecheck (étape 4) est le premier contrôle réel.
- Environ 250 fichiers modifiés. La correction des accents et des mentions de l'IA (environ 240 fichiers : webapp, API, core, seeds) a été faite par des agents, vérifiée seulement par recherche textuelle et une analyse syntaxique. Relire le diff avant de commiter.
- Une clé `TWO_FACTOR_ENCRYPTION_KEY` générée a été ajoutée au `.env` local.
- Non fait : indicateur « La réunion démarre… » en mode audio (l'animateur parle dès la connexion, mais sans message d'attente) ; niveaux hiérarchiques dans les 3 scénarios existants ; filtre par métier.

### Décisions prises par défaut

Les 5 décisions de la section 9 n'ayant pas reçu de réponse, voici les choix appliqués (modifiables) :

1. « Actions de suivi » : on construit la fonctionnalité sur la carte « Actions à suivre » de fin de réunion, plus une vue par simulation.
2. Mentions de l'IA : retirées du parcours apprenant et de la landing. Conservées dans l'administration (« Utilisation IA », consommation de jetons) où elles sont utiles.
3. Photos : volume persistant monté sur `/app/uploads` (un seul serveur).
4. Secteurs : première vague de 6 secteurs (Construction, Santé, Énergie, Administration publique, Manufacturier, Télécommunications).
5. Réunions personnalisées : rattachées à une simulation existante (`Meeting.simulationId` est obligatoire, et l'évaluation/KPI en dépend).

Autre choix : les tests utilisent `node:test` exécuté par `tsx` (déjà installé), sans ajout de Jest/Vitest, pour ne pas modifier le lockfile.

### Résultats de la vérification (6 octobre 2026, base locale)

| Étape | Résultat |
|---|---|
| `pnpm db:generate` | OK |
| Schéma local | Appliqué avec `prisma db push` (ajouts uniquement, aucune perte de données) + SQL des fuseaux (9 utilisateurs convertis). Voir « Migrations » ci-dessous. |
| Build de core | OK |
| Typecheck API | OK |
| Typecheck webapp (`tsc -p tsconfig.app.json`) | 0 erreur introduite par la branche. 141 erreurs existaient déjà (voir ci-dessous). |
| Tests unitaires | 61/61 (core 11, API 18, webapp 32). Le garde-fou des accents a été vérifié avec un fichier sonde. |
| `pnpm db:seed` | OK, 6 nouveaux scénarios |
| Faille 2FA (API réelle) | Jeton temporaire refusé : 401 |
| Réunion personnalisée + ouverture automatique (API réelle) | OK : texte d'ouverture généré, second appel sans doublon |
| Actions de suivi (API réelle) | Création, changement de statut, liste, suppression : OK |
| Smoke Playwright (desktop + mobile) | 16/16 (après ajout d'un `aria-label` manquant sur le bouton « Assistant » en mobile) |

### Migrations : à décider avant la prod

Le dossier `prisma/migrations` (10 migrations, dernière en mars) est très en retard sur le schéma : des tables entières (ex. `user_profiles`) n'y figurent pas. `prisma migrate dev` propose donc de réinitialiser la base, ce qui n'a pas été fait. En prod, `start.sh` lance `prisma migrate deploy || true` : la migration de ce lot ne s'appliquera pas seule.

Options :
1. Comme jusqu'ici en local, appliquer le schéma en prod avec `prisma db push` (les changements de ce lot sont des ajouts), puis exécuter `prisma/sql/retours-test-timezones.sql`.
2. Recaler l'historique : générer une migration de référence (`migrate diff` depuis la base prod), la marquer appliquée (`migrate resolve --applied`), puis repartir sur `migrate deploy`.

### Typecheck webapp : à savoir

Le script `typecheck` du webapp (`tsc --noEmit` sur un `tsconfig.json` qui ne contient que des `references`) ne vérifie aucun fichier. Le vrai contrôle est `npx tsc --noEmit -p tsconfig.app.json`, qui remonte 141 erreurs anciennes : `ToolbarHeading` utilisé avec des enfants au lieu de `title` et `description`, schéma zod de `sign-up.tsx`, `patternAnalysis` dans `decision-page.tsx`, layouts de démonstration…

### Ce qui reste

- Kapapra :
  - définir `TWO_FACTOR_ENCRYPTION_KEY` (64 caractères hex, `openssl rand -hex 32`) **seulement si elle est absente ou invalide**. Ne jamais remplacer une clé valide existante : les secrets 2FA déjà enregistrés deviendraient illisibles et ces comptes ne pourraient plus se connecter ;
  - optionnel : `JWT_2FA_TEMP_SECRET` et `JWT_EMAIL_CHANGE_SECRET` (sinon dérivés de `JWT_SECRET`) ;
  - monter un volume persistant sur `/app/uploads` du service API ;
  - appliquer le schéma (voir « Migrations »), lancer le seed, puis redéployer API et webapp (la conf nginx du webapp a changé).
- Relecture humaine des écrans, et quelques réunions jouées pour juger le ton des participants.

---

## 1. Verdict sur les observations

| # | Observation | Verdict | Constat dans le code |
|---|---|---|---|
| 1.1 | Mentions explicites de l'IA | Vrai | Environ 60 lignes dans 30 fichiers du webapp (landing, shell, simulation, onboarding, livrables, emails, recrutement, mentoring). |
| 1.2 | « 12 scénarios » | Vrai | Texte fixe à 4 endroits (`landing-page.tsx:218, 630, 785`, `auth-branding.tsx:4`). La base ne contient que 3 scénarios. |
| 1.3 | Fonction professionnelle | Vrai | Champ texte libre (`basic-settings.tsx:133`, `wizard.tsx:198`). Aucune liste. |
| 1.4 | Accents et caractères | Vrai, à grande échelle | Environ 110 lignes dans le webapp, 190 dans l'API, 450 dans les seeds. Les consignes envoyées au moteur de génération sont aussi sans accents. |
| 1.5 | Photo de profil | Vrai en prod | Fonctionne en local. En prod : fichiers non servis, adresse d'image fausse, pas de proxy nginx, pas de volume persistant. |
| 1.6 | 2FA | Vrai | Clé de chiffrement absente ou invalide (erreur 500 à la configuration) et cache non invalidé après activation. |
| 1.7 | Fuseaux horaires | Vrai, pire que décrit | Seulement 4 fuseaux codés en dur, Paris par défaut, décalages fixes sans heure d'été. |
| 1.8 | « Espace apprenant » | Vrai | Bouton sans action (`workspace-switcher.tsx`). |
| 1.9 | Nom de l'utilisateur | Vrai | « Admin Sim360 / Mentor / AS » écrit en dur dans `topbar.tsx:192-206`. Les données d'inscription sont correctes. |
| 2.1 | Secteurs | Vrai | 3 scénarios : 1 IT, 2 Finance. Le champ secteur et le filtre API existent, pas le filtre dans le catalogue. |
| 2.2 | « Générer avec l'IA » | Vrai | `create-simulation.tsx:205` (et titre `:277`). |
| 3.1 | Comportement des participants | Vrai | Aucune consigne contre les salutations et remerciements répétés, pas de hiérarchie, personnalité réduite à une étiquette. |
| 3.2 | Silence au démarrage | Vrai | Aucun message d'ouverture, en texte comme en audio. Le système attend l'utilisateur. |
| 3.3 | Réalisme des échanges | Vrai | Même cause que 3.1. En audio, chaque participant ignore l'historique et les autres participants. |
| 4.1 | Assistant vocal global | Vrai (absent) | Seule une dictée existe dans le chat PMO. Le bouton flottant `PmoFab` n'est monté nulle part. |
| 5.1 | Timeline de réunion | Partiel | Le temps écoulé est affiché. La durée prévue existe en base mais n'est pas affichée à côté. |
| 5.2 | Réunions personnalisées | Vrai (absent) | Aucune route ni écran de création. |
| 6.1 | « Actions de suivi » | À reformuler | Ce libellé n'existe pas. La carte « Actions à suivre » en fin de réunion est une liste en lecture seule. Ce n'est pas un bouton cassé : la fonctionnalité n'existe pas. |

### Trouvé en plus : faille de sécurité sur le 2FA

Quand le 2FA est actif, la connexion renvoie un jeton temporaire signé avec le même secret que les jetons d'accès. Le contrôle des jetons (`libs/core/src/auth/strategies/jwt.strategy.ts:23`) ne vérifie pas le type `2fa_temp`. Une personne qui connaît seulement le mot de passe obtient donc un accès complet pendant 5 minutes, sans code 2FA. Le jeton `email_change` a la même faiblesse.

---

## 2. Vue d'ensemble

| Lot | Contenu | Charge estimée | Dépend de |
|---|---|---|---|
| 0 | Faille 2FA | 0,5 j | — |
| 1 | Correctifs critiques (2FA, photo, nom, démarrage de réunion) | 4 à 5 j | Lot 0 |
| 2 | Textes et retouches d'interface | 5 à 6 j | — |
| 3 | Réalisme des participants | 4 à 5 j | — |
| 4 | Secteurs, actions de suivi, réunions personnalisées | 12 à 15 j | Lot 3 pour les réunions personnalisées |
| 5 | Assistant vocal global | à cadrer | Lots 1 à 4 |

Les lots 2 et 3 peuvent avancer en parallèle du lot 1.

Rappel déploiement : un push ne déploie pas. Chaque lot se termine par un « Redeploy » manuel sur console.kapapra.com. Les lots 0 et 1 demandent en plus des changements de configuration (variable d'environnement, volume).

---

## 3. Lot 0 — Faille 2FA (à faire en premier)

À corriger avant de réparer la configuration du 2FA, sinon on remet en service une protection contournable.

- [x] `jwt.strategy.ts` : refuser tout jeton dont le `type` est défini (`2fa_temp`, `email_change`).
- [x] Signer les jetons temporaires avec un secret distinct (`auth.service.ts:144`).
- [x] Test : un jeton temporaire utilisé comme Bearer sur `GET /users/me` doit renvoyer 401.

---

## 4. Lot 1 — Correctifs critiques

### 4.1 2FA (1 j)

- [ ] Générer une clé de 64 caractères hexadécimaux (`openssl rand -hex 32`) et la définir dans `TWO_FACTOR_ENCRYPTION_KEY` sur Kapapra. *(action manuelle ; clé locale ajoutée dans `.env`)*
- [x] Ajouter la variable à `.env.example` et corriger l'exemple de `.env.production.example:30` (l'exemple actuel fait 16 octets et n'est pas de l'hexadécimal).
- [x] Clé absente ou invalide : l'API démarre quand même mais journalise une erreur, et la configuration du 2FA renvoie un message clair (choix plus sûr qu'un plantage au démarrage).
- [x] Vider le cache `user:profile:<id>` à l'activation, à la désactivation et à la régénération des codes de secours (`auth.service.ts:438-516`).
- [ ] Vérifier le parcours complet : configuration, QR code, activation, déconnexion, connexion avec code, code de secours, désactivation.

### 4.2 Photo de profil (1,5 à 2 j)

- [x] Servir `/uploads` dans tous les environnements (`apps/api/src/main.ts:31-33`).
- [x] Ajouter un `location /uploads/` vers l'API dans `apps/webapp/nginx.prod.conf.template`.
- [x] Corriger le calcul de l'adresse de base dans `avatar-upload.tsx:26` : quand `VITE_API_URL` est relatif, utiliser une adresse relative au lieu de `http://localhost:3001`. Corriger aussi les copies dans les anciens layouts.
- [x] Monter un volume persistant sur `/app/uploads` (`docker-compose.prod.yml` fait ; configuration Kapapra à faire à la main).
- [x] Vider l'aperçu local après un téléversement réussi, pour que l'écran montre l'image réellement servie.
- [x] Afficher la photo dans la barre du haut (traité avec 4.3).
- [ ] Vérifier : sélection, aperçu, enregistrement, rechargement de page, déconnexion puis reconnexion, redéploiement.

À décider : garder le disque local avec volume, ou passer à un stockage objet (le code GCS est un squelette vide). Le volume suffit pour un seul serveur.

### 4.3 Nom de l'utilisateur dans la barre du haut (0,5 j)

- [x] `topbar.tsx` : lire l'utilisateur via `useAuth`, afficher prénom et nom, initiales calculées, rôle réel, et `AvatarImage` quand une photo existe.
- [x] `user-menu.tsx` : afficher le nom et l'email.

### 4.4 Démarrage automatique des réunions (1,5 j)

- [x] Mode texte : à l'appel de `start()` (`meetings.service.ts:88`), générer un message d'ouverture par le responsable de la réunion : ouverture, rappel de l'objectif, premier sujet, invitation d'un participant à intervenir.
- [x] Mode audio : après « Rejoindre la conférence », envoyer un `response.create` sur le canal de données du participant animateur (`use-realtime-connections.ts`), avec les mêmes consignes d'ouverture.
- [x] Afficher « La réunion démarre… » pendant la préparation des premières interventions.
- [x] Prévoir le cas où la génération échoue : message d'ouverture de secours tiré du modèle de réunion.

---

## 5. Lot 2 — Textes et retouches d'interface

### 5.1 Accents et typographie (2,5 à 3 j)

- [x] Webapp : corriger les chaînes sans accents (environ 110 lignes, 48 fichiers).
- [x] API et core : corriger les messages visibles par l'utilisateur (environ 190 + 22 lignes).
- [x] Seeds : corriger les textes de scénarios et de modèles de livrables (environ 450 lignes).
- [x] Données déjà en base : les clauses `update` des seeds rafraîchissent maintenant les scénarios, phases, modèles et documents de référence (relancer `pnpm db:seed`). Les réunions déjà copiées dans des simulations existantes gardent l'ancien texte. Effet de bord : le reseed republie (`isPublished: true`) un scénario de seed dépublié, et régénère les identifiants des phases des scénarios 1 et 2.
- [x] Consignes envoyées au moteur de génération : les réécrire avec accents (traité avec le lot 3).
- [ ] Relecture complète des écrans une fois les corrections faites (apostrophes, formulations).
- [x] Ajouter un contrôle automatique simple (liste de mots sans accents interdits) pour éviter les régressions : `apps/webapp/tests/unit/no-unaccented-french.test.ts`.

### 5.2 Mentions de l'IA (1 j)

- [x] Établir une table de remplacement validée, par exemple : « feedback IA » → « retour d'expérience », « Analyse IA » → « Analyse de vos décisions », « Acteurs IA » → « Participants virtuels », « Généré par l'IA » → « Généré automatiquement ».
- [x] Appliquer sur les 30 fichiers concernés.
- [x] `create-simulation.tsx:205` : « Générer avec l'IA » → « Générer une nouvelle simulation » (et titre `:277`).

À décider : conserver ou non les mentions dans la grille tarifaire de la landing (« IA vocale temps réel ») et dans le menu d'administration « Utilisation IA ».

### 5.3 Nombre de scénarios (0,25 j)

- [x] Remplacer « 12 scénarios » par « plusieurs scénarios » aux 4 endroits.

### 5.4 « Espace apprenant » cliquable (0,25 j)

- [x] `workspace-switcher.tsx` : en faire un lien vers le tableau de bord, retirer le chevron tant qu'il n'y a pas de choix d'espace, adapter le libellé au rôle.

### 5.5 Timeline de réunion (0,5 j)

- [x] `meeting-room-shell.tsx:155` et `conference-controls.tsx:121` : afficher « 05 min / 60 min », une barre de progression et le temps restant, à partir de `durationMinutes`.
- [x] Signaler visuellement le dépassement de la durée prévue.

### 5.6 Fuseaux horaires (1 j)

- [x] Remplacer les 4 options par la liste IANA complète (`Intl.supportedValuesOf('timeZone')`), avec recherche.
- [x] Valeur par défaut : le fuseau du navigateur à l'inscription, et `America/Toronto` dans le schéma (comptes Google, valeurs manquantes).
- [x] Migration Prisma : défaut du schéma changé ; SQL de conversion prêt dans `prisma/sql/retours-test-timezones.sql`, à ajouter à la migration générée.
- [x] Calculer les décalages à l'affichage, pour tenir compte de l'heure d'été.

### 5.7 Fonction professionnelle (0,5 j)

- [x] Remplacer le champ texte par une liste avec recherche, contenant les 18 fonctions proposées, plus « Autre » qui ouvre une saisie libre.
- [x] Appliquer dans les paramètres et dans l'assistant de profil. `jobTitle` reste une chaîne : pas de migration.

---

## 6. Lot 3 — Réalisme des participants virtuels

### 6.1 Consignes de comportement (2 j)

- [x] Réécrire le bloc de consignes de `meeting-ai.service.ts:28-88` :
  - pas de salutation ni de remerciement après le premier tour de parole ;
  - pas de formules d'assistant, pas de politesse excessive ;
  - chaque participant défend les intérêts de sa fonction, exprime ses contraintes, demande des données, des échéanciers, relève des risques, propose des alternatives, revient sur un point précédent ;
  - le désaccord est possible pour tous les profils, avec une intensité qui dépend de la personnalité ;
  - vocabulaire métier du secteur du scénario, chiffres, délais, coûts, responsabilités.
- [x] Donner à chaque participant la liste des autres participants et leur rôle.

### 6.2 Historique de conversation (0,5 j)

- [x] Mode texte : ne plus transmettre les messages des autres participants comme s'ils venaient du participant lui-même. Préfixer chaque message par le nom et le rôle de son auteur (`meetings.service.ts:157-162`).

### 6.3 Mode audio (1 à 1,5 j)

- [x] Appliquer le même bloc de consignes qu'en texte (`meetings.service.ts:413-421`).
- [x] Injecter l'historique de la réunion dans les consignes de chaque session Realtime, et le mettre à jour au fil des transcriptions.

### 6.4 Données de personnalité (1 j)

- [x] Ajouter aux participants : niveau hiérarchique, objectifs, contraintes, style de communication (migration Prisma, puis `pnpm db:generate` et rebuild de core).
- [x] Ne plus fixer `expertise` à `INTERMEDIATE` (`meetings.service.ts:185`).
- [ ] Renseigner ces champs dans les seeds des 3 scénarios existants (fait pour les 6 nouveaux). En attendant, l'animateur est choisi d'après le libellé du rôle.

### 6.5 Validation

- [ ] Rejouer 3 réunions types avant et après, et comparer : nombre de salutations, nombre de désaccords, présence de chiffres et de contraintes.

---

## 7. Lot 4 — Contenu et nouvelles fonctionnalités

### 7.1 Secteurs et filtres (4 à 5 j, surtout de la rédaction de contenu)

- [x] Étendre l'énumération `Sector` (aujourd'hui IT, CONSTRUCTION, MARKETING, HEALTHCARE, FINANCE, CUSTOM) ou la remplacer par une table de référence administrable.
- [x] Rédiger de nouveaux scénarios : 6 scénarios complets (5 phases chacun) dans `prisma/seeds/scenarios/sector-scenarios.ts` — Construction, Santé, Énergie, Administration publique, Manufacturier, Télécommunications.
- [x] Ajouter le filtre par secteur dans le catalogue (`create-simulation.tsx:71` appelle `getScenarios()` sans paramètre, l'API accepte déjà `?sector=`).
- [ ] Filtres : niveau (difficulté) et type de situation (nouveau projet / reprise) faits. Le filtre par métier demande un nouveau champ sur `Scenario` : non fait.

### 7.2 Actions de suivi (3 à 4 j)

À confirmer d'abord avec le testeur : quel écran et quel bouton exactement.

- [x] Modèle `ActionItem` : réunion, simulation, tenant, intitulé, responsable, échéance, statut, avec index sur `tenantId` et `simulationId`.
- [x] Reprendre les actions générées en fin de réunion (`MeetingSummary.actionItems`) comme lignes initiales.
- [x] Routes : liste, création, modification, changement de statut, suppression, avec `@Auditable()` et filtrage par tenant.
- [x] Interface : carte « Actions de suivi » modifiable dans `meeting-completed.tsx`, et vue d'ensemble au niveau de la simulation.

### 7.3 Réunions personnalisées (5 à 6 j)

Dépend du lot 3 (champs de personnalité et de hiérarchie).

- [x] Route `POST /simulations/:simId/meetings` et DTO : sujet, objectifs, durée, secteur, enjeux, format, participants (fonction, personnalité, niveau hiérarchique, engagement, objectifs, contraintes, style).
- [x] Formulaire : cadre de la réunion et participants sur une page (`/simulations/:id/meetings/new`), sans étape récapitulative séparée.
- [x] Bouton « Planifier une réunion » dans `meetings-list.tsx`.
- [x] Décision : rattachée à la phase courante d'une simulation (`Meeting.simulationId` obligatoire).

---

## 8. Lot 5 — Assistant d'aide global

- [x] Onglet « Aide » dans le panneau latéral (bouton « Assistant » de la barre du haut), disponible sur toutes les pages, même sans simulation.
- [x] Réponses issues d'une base locale (`features/assistant/lib/help-topics.ts`) avec liens de navigation et suggestions adaptées à la page courante. Aucun appel au backend ni au moteur de génération.
- [x] Voix : question dictée (reconnaissance vocale du navigateur, fr-CA) et réponses lues à voix haute (synthèse vocale du navigateur). Le micro n'apparaît que si le navigateur le permet (pas sous Firefox).
- [ ] Évolution possible : brancher les questions non reconnues sur l'agent PMO.

---

## 9. Décisions attendues

1. « Actions de suivi » : confirmer l'écran visé par le testeur.
2. Mentions de l'IA : les retirer aussi de la grille tarifaire et du menu d'administration, ou seulement du parcours apprenant ?
3. Photos : volume persistant ou stockage objet ?
4. Secteurs : valider la première vague de 6 secteurs.
5. Réunions personnalisées : rattachées à une simulation ou autonomes ?
