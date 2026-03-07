# EPIC 8 — Recrutement — Cote Recruteur

> L'entreprise configure et deploie une campagne d'evaluation par simulation.
> C'est le parcours "Business" decrit dans Parcours_Utilisateur_Business.pdf.

---

## Configuration de la campagne

| ID | User Story | Criteres d'acceptation | Priorite |
|----|-----------|------------------------|----------|
| US-8.1 | En tant que recruteur, je veux creer un compte entreprise sur la plateforme, afin d'acceder aux fonctionnalites de recrutement. | - Inscription avec indication "Entreprise / Recruteur" — Informations obligatoires : nom entreprise, secteur, taille, email pro — Attribution du role MANAGER ou nouveau role RECRUITER — Tenant dedie a l'entreprise | P0 |
| US-8.2 | En tant que recruteur, je veux creer une campagne de recrutement en definissant le poste et les competences recherchees, afin de configurer le "jumeau numerique" du poste. | - Formulaire : titre du poste, description du poste (saisie ou upload PDF), competences recherchees avec poids (1-10), niveau d'experience minimum (junior/confirme/senior), types de projets geres — Sauvegarde en brouillon possible avant publication | P0 |
| US-8.3 | En tant que recruteur, je veux definir la culture de mon entreprise (stricte/agile/collaborative), afin que la simulation reflete notre environnement reel. | - Choix du temperament avec description de l'impact : *exigeant et hierarchique* (PMO severe, processus rigides) / *agile et chaotique* (imprevus constants, pivots frequents) / *collaboratif et humain* (focus gestion d'equipe) — Impact direct sur le ton du PMO et la nature des evenements | P0 |
| US-8.4 | En tant que recruteur, je veux uploader des documents internes anonymises (vieux CR, planning reel, organigramme), afin d'ancrer la simulation dans ma realite. | - Upload optionnel de fichiers PDF/DOCX (max 10 Mo par fichier, max 5 fichiers) — Ces documents alimentent le prompt de generation du scenario — Avertissement : "Assurez-vous d'anonymiser les donnees sensibles" | P2 |
| US-8.5 | En tant que recruteur, je veux que l'IA genere automatiquement un scenario unique pour mon poste, afin qu'aucun candidat ne puisse s'y preparer a l'avance. | - Generation automatique a la publication de la campagne — Le scenario est base sur : fiche de poste + culture + documents internes — Le scenario est unique a la campagne (non reutilisable) — Le recruteur peut previsualiser avant publication | P0 |

---

## Deploiement de la campagne

| ID | User Story | Criteres d'acceptation | Priorite |
|----|-----------|------------------------|----------|
| US-8.6 | En tant que recruteur, je veux recevoir un lien de recrutement unique et partageable, afin de l'integrer dans mes offres d'emploi ou de l'envoyer aux candidats. | - Lien format : `https://app.projectsim360.com/recruitment/join/{slug}` — Slug unique genere automatiquement — Bouton "Copier le lien" — QR Code genere optionnel | P0 |
| US-8.7 | En tant que recruteur, je veux fixer un nombre maximum de candidats par campagne, afin de controler le volume et les couts. | - Champ optionnel `maxCandidates` — Le lien affiche "Campagne complete" une fois le quota atteint — Notification au recruteur quand 80% du quota est atteint | P2 |
| US-8.8 | En tant que recruteur, je veux pouvoir fermer une campagne manuellement, afin de stopper les nouvelles candidatures quand je le souhaite. | - Bouton "Fermer la campagne" avec confirmation — Statut passe a "closed" — Le lien affiche "Cette campagne de recrutement est terminee" — Les simulations en cours peuvent se terminer | P0 |

---

## Monitoring

| ID | User Story | Criteres d'acceptation | Priorite |
|----|-----------|------------------------|----------|
| US-8.9 | En tant que recruteur, je veux voir un dashboard temps reel de ma campagne, afin de suivre l'avancement des candidats. | - Compteurs : total inscrits, en cours, termines, abandonnes — Taux de completion (%) — Mise a jour en temps reel via WebSocket — Graphique d'evolution dans le temps | P0 |
| US-8.10 | En tant que recruteur, je veux voir qui a commence la simulation, qui a abandonne (et a quelle phase), et qui progresse, afin de detecter les signaux faibles. | - Liste des candidats : nom, email, statut (pending/in-progress/completed/abandoned), phase actuelle, date debut, date fin, score (si termine) — Colonne "phase d'abandon" pour ceux qui ont quitte — Tri par colonne | P0 |
| US-8.11 | En tant que recruteur, je veux lister toutes mes campagnes avec leurs statistiques, afin de gerer plusieurs recrutements en parallele. | - Tableau : titre, date creation, statut (draft/active/closed/archived), nb candidats, nb termines, score moyen — Filtres par statut — Actions : ouvrir, fermer, archiver | P1 |

---

## Notes techniques

- **Tables Prisma** : `RecruitmentCampaign`, `CandidateResult`
- **Module backend** : `RecruitmentModule` (apps/api/src/modules/recruitment/)
- **Services** : `RecruitmentService` (CRUD campagnes), `RecruitmentScenarioService` (generation IA du scenario)
- **Endpoints** : `POST/GET /recruitment/campaigns`, `GET /recruitment/campaigns/:id`, `PUT /recruitment/campaigns/:id`, `GET /recruitment/campaigns/:id/candidates`
- **WebSocket** : Evenements temps reel pour le monitoring (`candidate.started`, `candidate.completed`, `candidate.abandoned`)
- **Frontend** : Pages `/recruitment/campaigns/new`, `/recruitment/campaigns`, `/recruitment/campaigns/:id`
- **Dependances** : Moteur de scenarios existant + EPIC 2 (profiling candidat) + EPIC 3/4 (PMO + livrables pour la simulation)
