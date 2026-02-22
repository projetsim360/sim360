# ProjectSim360 — Specification Fonctionnelle MVP

> **Version** : 1.0
> **Date** : 2026-02-21
> **Statut** : Draft

---

## Table des matieres

1. [Vue d'ensemble](#1-vue-densemble)
2. [Module 1 : Auth & Profil (EXISTANT)](#2-module-1--auth--profil-existant)
3. [Module 2 : Reunions Virtuelles](#3-module-2--reunions-virtuelles)
4. [Module 3 : Moteur de Scenarios](#4-module-3--moteur-de-scenarios)
5. [Module 4 : Moteur IA](#5-module-4--moteur-ia)
6. [Module 5 : Dashboard & KPIs](#6-module-5--dashboard--kpis)
7. [Module 6 : Feedback Pedagogique](#7-module-6--feedback-pedagogique)
8. [Module 7 : Abonnement & Paiement](#8-module-7--abonnement--paiement)
9. [Modele de donnees](#9-modele-de-donnees)
10. [Phases de simulation](#10-phases-de-simulation)

---

## 1. Vue d'ensemble

### 1.1 Qu'est-ce que ProjectSim360 ?

ProjectSim360 est une plateforme SaaS de simulation de gestion de projet. Elle plonge les apprenants dans des scenarios realistes ou ils doivent prendre des decisions, animer des reunions virtuelles et piloter un projet de bout en bout. Un moteur IA analyse leurs actions et fournit un feedback pedagogique personnalise.

### 1.2 Proposition de valeur

- **Pour les apprenants** : Pratiquer la gestion de projet dans un environnement sans risque, avec feedback immediat.
- **Pour les formateurs** : Disposer d'un outil interactif avec des metriques precises sur la progression.
- **Pour les entreprises** : Former leurs chefs de projet sur des cas concrets avant de leur confier des projets reels.

### 1.3 Architecture projet-centrique

Chaque simulation est centree sur un **Projet**. Le projet est l'entite metier principale — il represente le projet fictif que l'apprenant doit piloter. La simulation est la couche de gamification qui enveloppe le projet.

```
Projet
  ├── nom, client, secteur, description
  ├── equipe : TeamMember[] (membres fictifs du projet)
  ├── contraintes : budget initial, deadline, ressources
  ├── livrables : Deliverable[] (attendus du projet)
  │
  └── Simulation (couche gamification, 1:1 avec Projet)
        ├── Scenario (template de depart)
        ├── Phases[] (initiation → cloture)
        ├── Reunions[] (evenements planifies)
        ├── Decisions[] (choix de l'apprenant)
        ├── Evenements[] (imprevus)
        ├── KPIs (budget, delai, qualite, moral, risque)
        └── Rapports[] (feedback IA)
```

### 1.4 Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, React Router v7 |
| Backend | NestJS 10, Prisma 6, PostgreSQL |
| Temps reel | Socket.io (namespace `/notifications`) |
| Cache & Queues | Redis, BullMQ |
| IA | Anthropic Claude / OpenAI (via `AiModule`) |
| Auth | JWT + Google OAuth + 2FA (Speakeasy) |
| Event-driven | Event Store avec 3 consumers (Socket.io, Notifier, Audit) |

### 1.5 Roles utilisateur

| Role | Permissions |
|---|---|
| `SUPER_ADMIN` | Acces total a la plateforme |
| `ADMIN` | Gestion du tenant, utilisateurs, audit |
| `MANAGER` | Supervision des apprenants, consultation des rapports |
| `MEMBER` | Participation aux simulations (role par defaut) |
| `VIEWER` | Consultation en lecture seule |

---

## 2. Module 1 : Auth & Profil (EXISTANT)

> Ce module est **entierement implemente** (backend + frontend). Cette section sert de reference rapide.

### 2.1 Authentification

| Fonctionnalite | Route API | Route Frontend | Statut |
|---|---|---|---|
| Inscription | `POST /api/v1/auth/register` | `/auth/sign-up` | DONE |
| Connexion | `POST /api/v1/auth/login` | `/auth/sign-in` | DONE |
| Verification email | `POST /api/v1/auth/verify-email` | `/auth/verify-email` | DONE |
| Mot de passe oublie | `POST /api/v1/auth/forgot-password` | `/auth/forgot-password` | DONE |
| Reset mot de passe | `POST /api/v1/auth/reset-password` | `/auth/reset-password` | DONE |
| Google OAuth | `GET /api/v1/auth/google` | `/auth/google-callback` | DONE |
| 2FA TOTP | `POST /api/v1/auth/2fa/*` | `/auth/verify-2fa` | DONE |
| Refresh token | `POST /api/v1/auth/refresh` | — | DONE |
| Deconnexion | `POST /api/v1/auth/logout` | — | DONE |

### 2.2 Profil & Parametres

| Fonctionnalite | Route API | Route Frontend | Statut |
|---|---|---|---|
| Mon profil | `GET /api/v1/users/me` | `/profile/edit` | DONE |
| Wizard profil | `POST /api/v1/users/me/complete-wizard` | `/profile/wizard` | DONE |
| Modifier profil | `PATCH /api/v1/users/me/profile` | `/profile/edit` | DONE |
| Parametres | `PATCH /api/v1/users/me/settings` | `/settings` | DONE |
| Avatar | `POST/DELETE /api/v1/users/me/avatar` | `/profile/edit` | DONE |
| Changer email | `POST /api/v1/users/me/change-email` | `/profile/edit` | DONE |
| Changer MDP | `POST /api/v1/users/me/change-password` | `/profile/edit` | DONE |
| Supprimer compte | `DELETE /api/v1/users/me` | `/profile/edit` | DONE |

### 2.3 Securite implementee

- Rate limiting 3 niveaux (3/s, 20/10s, 100/min)
- Verrouillage compte apres 5 tentatives (15 min)
- Tokens de verification a usage unique (24h)
- Rotation des refresh tokens
- GDPR : consentement trace (IP, user-agent, date)
- Helmet, CORS, ValidationPipe (whitelist + transform)

---

## 3. Module 2 : Reunions Virtuelles

### 3.1 Description

Les reunions sont le coeur interactif de la simulation. L'apprenant anime des reunions de projet (comite de pilotage, daily standup, retrospective, etc.) ou il interagit avec des participants virtuels generes par l'IA.

### 3.2 User Stories

#### US-2.1 : Consulter la liste des reunions
> **En tant qu'** apprenant,
> **je veux** voir toutes les reunions planifiees pour ma simulation,
> **afin de** savoir ce qui m'attend et me preparer.

**Criteres d'acceptation :**
- Liste triee par date/phase avec statut (planifiee, en cours, terminee, annulee)
- Filtrage par type de reunion et par phase
- Badge indiquant le nombre de participants virtuels
- Acces rapide au detail d'une reunion

#### US-2.2 : Demarrer une reunion
> **En tant qu'** apprenant,
> **je veux** lancer une reunion planifiee,
> **afin de** interagir avec les participants virtuels.

**Criteres d'acceptation :**
- Briefing pre-reunion : contexte, objectifs, participants, documents
- Chronometre visible (duree estimee configurable par scenario)
- Interface chat/dialogue en temps reel avec les participants IA
- L'apprenant peut poser des questions, donner des directives, prendre des decisions

#### US-2.3 : Interagir avec des participants IA
> **En tant qu'** apprenant,
> **je veux** que les participants reagissent de maniere realiste a mes propos,
> **afin de** vivre une experience immersive.

**Criteres d'acceptation :**
- Chaque participant a un profil (nom, role, personnalite, niveau de cooperation)
- Reponses contextuelles basees sur l'etat du projet et les decisions precedentes
- Ton et attitude varies selon la personnalite (cooperative, resistante, neutre)
- Possibilite de conflits ou desaccords entre participants

#### US-2.4 : Cloturer une reunion et consulter le compte-rendu
> **En tant qu'** apprenant,
> **je veux** obtenir un resume automatique de la reunion,
> **afin de** garder une trace des decisions prises.

**Criteres d'acceptation :**
- Resume genere par l'IA : points abordes, decisions, actions
- Liste des actions decidees avec responsable et echeance
- Impact sur les KPIs calcule et affiche
- Reunion marquee comme terminee, impossible a relancer

### 3.3 Modele de donnees

```
Meeting
  ├── id, simulationId (FK), scenarioPhaseId? (FK)
  ├── type: KICKOFF | STANDUP | STEERING | RETROSPECTIVE | CRISIS | CUSTOM
  ├── status: SCHEDULED | IN_PROGRESS | COMPLETED | CANCELLED
  ├── title, description, objectives (String[])
  ├── scheduledAt, startedAt?, completedAt?
  ├── durationMinutes (duree estimee)
  ├── participants: MeetingParticipant[]
  └── messages: MeetingMessage[]

MeetingParticipant
  ├── id, meetingId (FK), name, role, personality
  ├── cooperationLevel: 1-5
  └── avatar?

MeetingMessage
  ├── id, meetingId (FK), participantId? (FK, null = apprenant)
  ├── content, role: USER | PARTICIPANT | SYSTEM
  ├── timestamp
  └── metadata? (Json)

MeetingSummary
  ├── id, meetingId (FK, unique)
  ├── summary, keyDecisions (String[]), actionItems (Json[])
  └── kpiImpact? (Json)
```

### 3.4 Routes API

| Methode | Route | Description | Role |
|---|---|---|---|
| `GET` | `/api/v1/simulations/:simId/meetings` | Lister les reunions d'une simulation | MEMBER+ |
| `GET` | `/api/v1/meetings/:id` | Detail d'une reunion | MEMBER+ |
| `POST` | `/api/v1/meetings/:id/start` | Demarrer une reunion | MEMBER+ |
| `POST` | `/api/v1/meetings/:id/messages` | Envoyer un message (chat) | MEMBER+ |
| `POST` | `/api/v1/meetings/:id/complete` | Cloturer la reunion | MEMBER+ |
| `GET` | `/api/v1/meetings/:id/summary` | Obtenir le compte-rendu | MEMBER+ |

### 3.5 Routes Frontend

| Route | Page | Description |
|---|---|---|
| `/meetings` | `MeetingsListPage` | Liste des reunions (toutes simulations) |
| `/simulations/:simId/meetings` | `SimulationMeetingsPage` | Reunions d'une simulation |
| `/meetings/:id` | `MeetingDetailPage` | Detail / briefing pre-reunion |
| `/meetings/:id/live` | `MeetingLivePage` | Interface de reunion en temps reel |
| `/meetings/:id/summary` | `MeetingSummaryPage` | Compte-rendu post-reunion |

### 3.6 Details techniques

- **Chat IA** : Streaming via SSE (`text/event-stream`) depuis le backend. Le backend orchestre les reponses de chaque participant via le `AiModule` avec un system prompt par personnalite.
- **Socket.io** : Notification temps reel `meeting:started`, `meeting:completed` via le namespace `/notifications`.
- **Historique** : Tous les messages sont persistes dans `MeetingMessage` pour replay et analyse.
- **Event Store** : Evenements `meeting.started`, `meeting.message_sent`, `meeting.completed` publies pour audit et notifications.

---

## 4. Module 3 : Moteur de Scenarios

### 4.1 Description

Le moteur de scenarios definit les regles du jeu : quel type de projet, quelles phases, quels evenements aleatoires, et comment les decisions impactent les KPIs. Un scenario est un template reutilisable ; une simulation est une instance jouee par un apprenant.

### 4.2 User Stories

#### US-3.1 : Parcourir le catalogue de scenarios
> **En tant qu'** apprenant,
> **je veux** consulter les scenarios disponibles,
> **afin de** choisir celui qui correspond a mon besoin de formation.

**Criteres d'acceptation :**
- Catalogue avec filtres : difficulte, secteur, duree estimee, competences ciblees
- Fiche scenario : description, objectifs pedagogiques, nombre de phases, KPIs suivis
- Badge de difficulte (debutant, intermediaire, avance)
- Scenarios verrouilles selon le plan d'abonnement

#### US-3.2 : Lancer une simulation
> **En tant qu'** apprenant,
> **je veux** demarrer une simulation a partir d'un scenario,
> **afin de** commencer mon parcours de formation.

**Criteres d'acceptation :**
- Instanciation du scenario : copie des phases, KPIs initiaux, reunions planifiees
- Briefing initial : contexte du projet, equipe, contraintes, objectifs
- Redirection vers le dashboard de simulation
- Limite de simulations simultanees selon le plan (FREE: 1, STARTER: 3, PRO: 10, ENTERPRISE: illimite)

#### US-3.3 : Naviguer entre les phases
> **En tant qu'** apprenant,
> **je veux** progresser a travers les phases du projet,
> **afin de** vivre le cycle de vie complet.

**Criteres d'acceptation :**
- Progression lineaire : phase suivante debloquee quand conditions remplies
- Conditions de passage : reunions completees, decisions prises, KPIs dans les seuils
- Barre de progression visuelle
- Recapitulatif de phase avant passage a la suivante

#### US-3.4 : Prendre des decisions
> **En tant qu'** apprenant,
> **je veux** etre confronte a des choix strategiques,
> **afin de** experimenter les consequences de mes decisions.

**Criteres d'acceptation :**
- Decision presentee avec contexte, options (2-4), et informations disponibles
- Timer optionnel (pression temporelle)
- Impact sur les KPIs calcule immediatement
- Certaines decisions declenchent des evenements aleatoires
- Historique des decisions consultable

#### US-3.5 : Gerer les evenements aleatoires
> **En tant qu'** apprenant,
> **je veux** faire face a des imprevus,
> **afin de** developper ma capacite d'adaptation.

**Criteres d'acceptation :**
- Evenements declenches par probabilite, phase, ou consequence d'une decision
- Notification en temps reel avec description de l'evenement
- Options de reaction (2-3 choix) avec impacts differents
- Certains evenements declenchent une reunion de crise

### 4.3 Modele de donnees

```
Scenario (template reutilisable)
  ├── id, title, description, objectives (String[])
  ├── sector: IT | CONSTRUCTION | MARKETING | HEALTHCARE | FINANCE | CUSTOM
  ├── difficulty: BEGINNER | INTERMEDIATE | ADVANCED
  ├── estimatedDurationHours, requiredPlan (TenantPlan)
  ├── competencies (String[]) — competences ciblees
  ├── isPublished, isArchived
  ├── projectTemplate (Json) — template du projet fictif
  │     { name, client, sector, description, teamSize,
  │       initialBudget, deadlineDays, deliverables[] }
  ├── phases: ScenarioPhase[]
  ├── initialKpis: Json (budget, deadline, quality, teamMorale)
  └── createdBy (FK User), createdAt, updatedAt

ScenarioPhase
  ├── id, scenarioId (FK), order (Int)
  ├── name, description, type: INITIATION | PLANNING | EXECUTION | MONITORING | CLOSURE
  ├── durationDays (duree fictive dans la simulation)
  ├── meetings: MeetingTemplate[]
  ├── decisions: DecisionTemplate[]
  ├── events: RandomEventTemplate[]
  └── completionCriteria (Json)

Project (projet fictif pilote par l'apprenant — entite metier centrale)
  ├── id, tenantId (FK), userId (FK)
  ├── name, client, sector, description
  ├── initialBudget (Float), currentBudget (Float)
  ├── startDate (DateTime), deadline (DateTime)
  ├── status: NOT_STARTED | IN_PROGRESS | ON_HOLD | COMPLETED | FAILED
  ├── teamMembers: ProjectTeamMember[]
  ├── deliverables: Deliverable[]
  ├── simulation: Simulation (relation 1:1)
  └── createdAt, updatedAt

ProjectTeamMember (membres fictifs de l'equipe projet)
  ├── id, projectId (FK)
  ├── name, role (chef d'equipe, developpeur, designer, etc.)
  ├── expertise: JUNIOR | INTERMEDIATE | SENIOR
  ├── personality: COOPERATIVE | NEUTRAL | RESISTANT
  ├── availability (Float, 0-1) — taux de disponibilite
  ├── morale (Float, 0-100)
  └── avatar?

Deliverable (livrables attendus du projet)
  ├── id, projectId (FK), phaseId? (FK)
  ├── name, description
  ├── status: PENDING | IN_PROGRESS | DELIVERED | ACCEPTED | REJECTED
  ├── qualityScore? (Float, 0-100)
  ├── dueDate?, deliveredAt?
  └── dependencies (String[]) — IDs d'autres livrables

Simulation (couche gamification, liee 1:1 au Project)
  ├── id, projectId (FK, unique), scenarioId (FK), userId (FK), tenantId (FK)
  ├── status: DRAFT | IN_PROGRESS | PAUSED | COMPLETED | ABANDONED
  ├── currentPhaseId? (FK)
  ├── startedAt?, completedAt?, totalDurationMinutes?
  ├── kpis: SimulationKpi (relation 1:1)
  ├── phases: SimulationPhase[]
  ├── meetings: Meeting[]
  ├── decisions: Decision[]
  └── reports: Report[]

SimulationKpi
  ├── id, simulationId (FK, unique)
  ├── budget (Float) — % restant (100 = dans le budget)
  ├── schedule (Float) — % avance/retard (100 = dans les temps)
  ├── quality (Float) — score qualite (0-100)
  ├── teamMorale (Float) — moral equipe (0-100)
  ├── riskLevel (Float) — niveau de risque (0-100)
  └── updatedAt

Decision
  ├── id, simulationId (FK), phaseId (FK), templateId? (FK)
  ├── title, context, options (Json[])
  ├── selectedOption? (Int), decidedAt?
  ├── kpiImpact? (Json)
  └── triggeredEventId? (FK RandomEvent)

RandomEvent
  ├── id, simulationId (FK), phaseId (FK), templateId? (FK)
  ├── type: RISK | OPPORTUNITY | CONSTRAINT | STAKEHOLDER
  ├── title, description, severity: LOW | MEDIUM | HIGH | CRITICAL
  ├── options (Json[]), selectedOption? (Int), resolvedAt?
  └── kpiImpact? (Json)
```

### 4.4 Routes API

#### Projets

| Methode | Route | Description | Role |
|---|---|---|---|
| `GET` | `/api/v1/projects` | Mes projets (liste) | MEMBER+ |
| `GET` | `/api/v1/projects/:id` | Detail d'un projet | MEMBER+ |
| `GET` | `/api/v1/projects/:id/team` | Equipe du projet (membres fictifs) | MEMBER+ |
| `GET` | `/api/v1/projects/:id/deliverables` | Livrables du projet | MEMBER+ |
| `PATCH` | `/api/v1/projects/:id/deliverables/:delId` | Mettre a jour un livrable | MEMBER+ |

#### Scenarios

| Methode | Route | Description | Role |
|---|---|---|---|
| `GET` | `/api/v1/scenarios` | Catalogue de scenarios | MEMBER+ |
| `GET` | `/api/v1/scenarios/:id` | Detail d'un scenario | MEMBER+ |
| `POST` | `/api/v1/scenarios` | Creer un scenario (admin/formateur) | MANAGER+ |
| `PUT` | `/api/v1/scenarios/:id` | Modifier un scenario | MANAGER+ |

#### Simulations

| Methode | Route | Description | Role |
|---|---|---|---|
| `POST` | `/api/v1/simulations` | Lancer une simulation (cree Project + Simulation) | MEMBER+ |
| `GET` | `/api/v1/simulations` | Mes simulations | MEMBER+ |
| `GET` | `/api/v1/simulations/:id` | Detail d'une simulation | MEMBER+ |
| `PATCH` | `/api/v1/simulations/:id/pause` | Mettre en pause | MEMBER+ |
| `PATCH` | `/api/v1/simulations/:id/resume` | Reprendre | MEMBER+ |
| `POST` | `/api/v1/simulations/:id/advance-phase` | Passer a la phase suivante | MEMBER+ |
| `POST` | `/api/v1/simulations/:id/decisions/:decId/choose` | Prendre une decision | MEMBER+ |
| `POST` | `/api/v1/simulations/:id/events/:evtId/respond` | Reagir a un evenement | MEMBER+ |
| `GET` | `/api/v1/simulations/:id/kpis` | KPIs actuels | MEMBER+ |
| `GET` | `/api/v1/simulations/:id/timeline` | Timeline des actions | MEMBER+ |

### 4.5 Routes Frontend

| Route | Page | Description |
|---|---|---|
| `/projects` | `ProjectsListPage` | Mes projets (vue projet-centrique) |
| `/projects/:id` | `ProjectDetailPage` | Vue d'ensemble du projet (equipe, livrables, KPIs) |
| `/projects/:id/team` | `ProjectTeamPage` | Equipe du projet (membres fictifs, moral, dispo) |
| `/projects/:id/deliverables` | `DeliverablesPage` | Suivi des livrables |
| `/simulations` | `SimulationsListPage` | Mes simulations (en cours, terminees) |
| `/simulations/new` | `CreateSimulationPage` | Catalogue de scenarios + lancement |
| `/simulations/:id` | `SimulationDetailPage` | Dashboard de simulation (KPIs, phase, actions) |
| `/simulations/:id/decisions/:decId` | `DecisionPage` | Interface de prise de decision |
| `/simulations/:id/events/:evtId` | `RandomEventPage` | Gestion d'un evenement aleatoire |
| `/simulations/:id/timeline` | `TimelinePage` | Historique chronologique |

### 4.6 Details techniques

- **Instanciation** : A la creation d'une simulation, le backend copie les phases, templates de reunions, decisions et evenements du scenario vers des instances liees a la simulation.
- **Calcul KPIs** : Service `KpiEngineService` applique les impacts de chaque decision/evenement sur les KPIs en temps reel. Formule configurable par scenario.
- **Evenements aleatoires** : Evalues a chaque changement de phase ou decision. Probabilite definie dans le template, modulee par l'etat actuel des KPIs.
- **Event Store** : Evenements `simulation.created`, `simulation.phase_advanced`, `decision.made`, `event.triggered`, `event.resolved`.

---

## 5. Module 4 : Moteur IA

### 5.1 Description

Le moteur IA est le cerveau de la simulation. Il genere les dialogues des participants virtuels, analyse les decisions de l'apprenant, et produit les feedbacks pedagogiques. Il s'appuie sur le `AiModule` existant (Anthropic/OpenAI).

### 5.2 User Stories

#### US-4.1 : Generer des reponses de participants IA
> **En tant que** systeme,
> **je veux** generer des reponses contextuelles pour chaque participant virtuel,
> **afin de** offrir une experience de reunion realiste.

**Criteres d'acceptation :**
- System prompt par participant : role, personnalite, niveau de cooperation, historique
- Contexte injecte : etat du projet (KPIs), decisions passees, phase actuelle
- Streaming des reponses (SSE) pour un rendu progressif
- Temps de reponse < 3s pour le premier token
- Fallback OpenAI si Anthropic indisponible

#### US-4.2 : Analyser les decisions
> **En tant que** systeme,
> **je veux** evaluer la pertinence des decisions de l'apprenant,
> **afin de** fournir un feedback educatif.

**Criteres d'acceptation :**
- Chaque decision evaluee sur : pertinence, timing, impact anticipe vs reel
- Score de decision (0-100) avec justification
- Detection des patterns (trop prudent, trop agressif, equilibre)
- Comparaison avec la "decision optimale" definie dans le template

#### US-4.3 : Generer des comptes-rendus de reunion
> **En tant que** systeme,
> **je veux** produire un resume structure de chaque reunion,
> **afin de** fournir un compte-rendu exploitable.

**Criteres d'acceptation :**
- Resume en 3-5 points cles
- Liste des decisions prises avec responsable
- Actions a suivre avec echeance
- Ton professionnel, format structuré

### 5.3 Architecture IA

```
AiOrchestratorService
  ├── MeetingAiService       — Gestion des dialogues en reunion
  │     ├── buildParticipantPrompt(participant, context)
  │     ├── generateResponse(meetingId, message)
  │     └── generateSummary(meetingId)
  ├── DecisionAiService      — Analyse des decisions
  │     ├── evaluateDecision(decision, context)
  │     └── compareWithOptimal(decision, template)
  ├── FeedbackAiService      — Generation des rapports pedagogiques
  │     ├── generatePhaseReport(simulation, phase)
  │     └── generateFinalReport(simulation)
  └── EventAiService         — Generation d'evenements contextuels
        └── generateEventDescription(template, context)
```

### 5.4 Routes API

| Methode | Route | Description | Role |
|---|---|---|---|
| `POST` | `/api/v1/ai/complete` | Completion generique (EXISTANT) | MEMBER+ |
| `POST` | `/api/v1/ai/meeting/respond` | Reponse d'un participant IA (SSE) | MEMBER+ |
| `POST` | `/api/v1/ai/meeting/summary` | Generer un resume de reunion | MEMBER+ |
| `POST` | `/api/v1/ai/decision/evaluate` | Evaluer une decision | MEMBER+ |
| `POST` | `/api/v1/ai/simulation/report` | Generer un rapport pedagogique | MEMBER+ |

### 5.5 Details techniques

- **Streaming** : Les reponses IA en reunion utilisent SSE (`text/event-stream`). Le frontend consomme via `EventSource` ou `fetch` avec `ReadableStream`.
- **Context Window** : Le contexte injecte au LLM inclut les N derniers messages (max 20), les KPIs actuels, les decisions passees de la phase, et le profil du participant.
- **Cache** : Les prompts systeme des participants sont caches en Redis (TTL 1h). Les comptes-rendus generes sont persistes en base.
- **Cout** : Metriques de tokens consommes tracees par simulation pour facturation future.
- **Fallback** : Si le provider principal (Anthropic) est indisponible, fallback automatique vers OpenAI. Les deux sont deja supportes par le `AiModule`.

---

## 6. Module 5 : Dashboard & KPIs

### 6.1 Description

Le dashboard est le centre de commande de l'apprenant. Il offre une vue d'ensemble de ses simulations en cours, de ses KPIs, et de ses prochaines actions. Un dashboard global agrege toutes les simulations, et chaque simulation a son propre dashboard detaille.

### 6.2 User Stories

#### US-5.1 : Consulter le dashboard global
> **En tant qu'** apprenant,
> **je veux** voir un resume de toute mon activite,
> **afin de** suivre ma progression globale.

**Criteres d'acceptation :**
- Statistiques globales : simulations en cours, terminees, score moyen
- Dernieres activites (decisions, reunions, evenements)
- Prochaines actions a effectuer (reunions planifiees, decisions en attente)
- Graphique d'evolution des scores
- Acces rapide aux simulations en cours

#### US-5.2 : Consulter le dashboard d'une simulation
> **En tant qu'** apprenant,
> **je veux** voir l'etat detaille de ma simulation,
> **afin de** piloter efficacement mon projet.

**Criteres d'acceptation :**
- 4 jauges KPI : Budget, Delai, Qualite, Moral equipe
- Indicateur de risque global
- Phase actuelle avec barre de progression
- Timeline des evenements recents
- Liste des prochaines reunions et decisions en attente
- Alerte si un KPI passe en zone critique (< 30%)

#### US-5.3 : Suivre l'evolution des KPIs dans le temps
> **En tant qu'** apprenant,
> **je veux** voir l'historique de mes KPIs,
> **afin de** comprendre l'impact de mes decisions.

**Criteres d'acceptation :**
- Graphique multi-lignes (budget, delai, qualite, moral) sur l'axe temps
- Points d'inflexion lies aux decisions/evenements (cliquables)
- Comparaison avec les seuils de reussite definis par le scenario
- Export possible en image/PDF

#### US-5.4 : Consulter le dashboard formateur (MANAGER+)
> **En tant que** formateur,
> **je veux** voir la progression de mes apprenants,
> **afin de** identifier ceux qui ont besoin d'aide.

**Criteres d'acceptation :**
- Liste des apprenants avec statut de simulation et score global
- Comparaison des performances entre apprenants (anonymisable)
- Alerte sur les apprenants bloques ou en difficulte
- Filtrage par scenario, periode, statut

### 6.3 Routes API

| Methode | Route | Description | Role |
|---|---|---|---|
| `GET` | `/api/v1/dashboard` | Dashboard global apprenant | MEMBER+ |
| `GET` | `/api/v1/dashboard/stats` | Statistiques agregees | MEMBER+ |
| `GET` | `/api/v1/simulations/:id/dashboard` | Dashboard d'une simulation | MEMBER+ |
| `GET` | `/api/v1/simulations/:id/kpis/history` | Historique des KPIs | MEMBER+ |
| `GET` | `/api/v1/dashboard/trainer` | Dashboard formateur | MANAGER+ |
| `GET` | `/api/v1/dashboard/trainer/learners` | Liste des apprenants | MANAGER+ |

### 6.4 Routes Frontend

| Route | Page | Description |
|---|---|---|
| `/dashboard` | `DashboardPage` | Dashboard global (EXISTANT, a enrichir) |
| `/simulations/:id` | `SimulationDashboardPage` | Dashboard de simulation |
| `/simulations/:id/kpis` | `KpiHistoryPage` | Graphiques KPIs |
| `/trainer/dashboard` | `TrainerDashboardPage` | Vue formateur |

### 6.5 Details techniques

- **Composants graphiques** : Utilisation de Recharts (ou Chart.js) pour les graphiques KPI. Jauges circulaires pour les 4 KPIs principaux.
- **Temps reel** : Les KPIs sont mis a jour via Socket.io (`kpi:updated`) lors de chaque decision/evenement.
- **Cache** : Dashboard global cache en Redis (TTL 60s, invalidation on decision/event).
- **Responsive** : Layout adaptatif — grille 2x2 sur desktop, stack vertical sur mobile.

---

## 7. Module 6 : Feedback Pedagogique

### 7.1 Description

Le module de feedback est le moteur d'apprentissage de la plateforme. Il genere des rapports personnalises a la fin de chaque phase et a la fin de la simulation, analysant les forces et faiblesses de l'apprenant.

### 7.2 User Stories

#### US-6.1 : Recevoir un rapport de phase
> **En tant qu'** apprenant,
> **je veux** obtenir un bilan a la fin de chaque phase,
> **afin de** comprendre ce que j'ai bien fait et ce que je peux ameliorer.

**Criteres d'acceptation :**
- Rapport genere automatiquement au passage de phase
- Sections : resume, points forts, axes d'amelioration, KPIs de la phase
- Score de la phase (0-100) avec repartition par competence
- Recommandations concretes pour la phase suivante
- Notification push + email (selon preferences)

#### US-6.2 : Recevoir un rapport final de simulation
> **En tant qu'** apprenant,
> **je veux** obtenir un bilan complet a la fin de ma simulation,
> **afin de** mesurer ma progression et identifier mes axes de developpement.

**Criteres d'acceptation :**
- Rapport exhaustif : toutes les phases, toutes les decisions, evolution des KPIs
- Score final global et par competence (leadership, communication, gestion des risques, planification, gestion des parties prenantes)
- Comparaison avec la performance "optimale" du scenario
- Graphique radar des competences
- Recommandations personnalisees de formation
- Telechargeable en PDF

#### US-6.3 : Consulter l'historique de mes rapports
> **En tant qu'** apprenant,
> **je veux** acceder a tous mes rapports passes,
> **afin de** suivre ma progression dans le temps.

**Criteres d'acceptation :**
- Liste chronologique des rapports (phases + finaux)
- Filtrage par simulation et par type de rapport
- Graphique d'evolution du score global au fil des simulations
- Comparaison entre simulations du meme scenario

#### US-6.4 : Consulter les rapports d'un apprenant (MANAGER+)
> **En tant que** formateur,
> **je veux** lire les rapports de mes apprenants,
> **afin de** personnaliser mon accompagnement.

**Criteres d'acceptation :**
- Acces aux rapports de tous les apprenants du tenant
- Vue comparative entre apprenants
- Export PDF individuel ou groupe

### 7.3 Modele de donnees

```
Report
  ├── id, simulationId (FK), userId (FK), tenantId (FK)
  ├── type: PHASE | FINAL
  ├── phaseId? (FK, null pour FINAL)
  ├── status: GENERATING | READY | ERROR
  ├── overallScore (Float, 0-100)
  ├── competencyScores (Json) — { leadership, communication, riskManagement, planning, stakeholders }
  ├── strengths (String[])
  ├── improvements (String[])
  ├── recommendations (String[])
  ├── content (Text) — Rapport complet en Markdown
  ├── kpiSnapshot (Json) — KPIs au moment du rapport
  ├── optimalComparison? (Json) — Delta vs performance optimale
  └── generatedAt, createdAt
```

### 7.4 Routes API

| Methode | Route | Description | Role |
|---|---|---|---|
| `GET` | `/api/v1/reports` | Mes rapports (tous) | MEMBER+ |
| `GET` | `/api/v1/reports/:id` | Detail d'un rapport | MEMBER+ |
| `GET` | `/api/v1/simulations/:id/reports` | Rapports d'une simulation | MEMBER+ |
| `POST` | `/api/v1/simulations/:id/reports/generate` | Forcer la generation d'un rapport | MEMBER+ |
| `GET` | `/api/v1/reports/:id/pdf` | Telecharger en PDF | MEMBER+ |
| `GET` | `/api/v1/trainer/reports` | Rapports des apprenants | MANAGER+ |
| `GET` | `/api/v1/trainer/reports/comparison` | Comparaison entre apprenants | MANAGER+ |

### 7.5 Routes Frontend

| Route | Page | Description |
|---|---|---|
| `/reports` | `ReportsListPage` | Liste de mes rapports |
| `/reports/:id` | `ReportDetailPage` | Detail d'un rapport |
| `/simulations/:id/reports` | `SimulationReportsPage` | Rapports d'une simulation |
| `/trainer/reports` | `TrainerReportsPage` | Vue formateur |

### 7.6 Details techniques

- **Generation asynchrone** : La generation du rapport est un job BullMQ (`report-generation` queue). Le statut passe de `GENERATING` a `READY`. Le frontend poll ou recoit une notification Socket.io `report:ready`.
- **Prompt IA** : Le `FeedbackAiService` construit un prompt contenant toutes les decisions, reunions, evenements et KPIs de la phase/simulation. Le LLM produit un rapport structure en JSON parse ensuite.
- **PDF** : Generation via PDFKit (deja utilise pour les exports d'audit). Template specifique avec graphiques embarques.
- **Event Store** : `report.generated`, `report.downloaded`.

---

## 8. Module 7 : Abonnement & Paiement

### 8.1 Description

Module de monetisation de la plateforme. Gestion des plans d'abonnement (FREE, STARTER, PRO, ENTERPRISE) avec Stripe comme processeur de paiement.

### 8.2 Plans d'abonnement

| Fonctionnalite | FREE | STARTER | PRO | ENTERPRISE |
|---|---|---|---|---|
| Simulations simultanees | 1 | 3 | 10 | Illimite |
| Scenarios disponibles | 2 basiques | Tous standards | Tous + premium | Tous + custom |
| Historique rapports | 30 jours | 6 mois | Illimite | Illimite |
| Dashboard formateur | — | — | Oui | Oui |
| Support | Community | Email | Prioritaire | Dedie |
| Utilisateurs par tenant | 1 | 5 | 25 | Illimite |
| Export PDF | — | Oui | Oui | Oui |
| API access | — | — | — | Oui |
| Prix/mois | Gratuit | 19 EUR | 49 EUR | Sur devis |

### 8.3 User Stories

#### US-7.1 : Consulter les plans disponibles
> **En tant qu'** utilisateur,
> **je veux** comparer les plans d'abonnement,
> **afin de** choisir celui qui correspond a mes besoins.

**Criteres d'acceptation :**
- Page de pricing avec comparaison cote a cote
- Plan actuel mis en evidence
- Reduction affichee pour facturation annuelle (-20%)
- CTA clair pour chaque plan
- Accessible depuis le menu principal et le dashboard

#### US-7.2 : Souscrire a un abonnement
> **En tant qu'** utilisateur FREE,
> **je veux** passer a un plan payant,
> **afin de** debloquer des fonctionnalites avancees.

**Criteres d'acceptation :**
- Redirection vers Stripe Checkout
- Support CB, SEPA, et Apple/Google Pay
- Facture generee automatiquement
- Plan active immediatement apres paiement
- Email de confirmation avec recapitulatif

#### US-7.3 : Gerer mon abonnement
> **En tant qu'** abonne,
> **je veux** modifier ou annuler mon abonnement,
> **afin de** garder le controle sur mes depenses.

**Criteres d'acceptation :**
- Upgrade : prorata calcule, effet immediat
- Downgrade : effectif a la fin de la periode en cours
- Annulation : acces maintenu jusqu'a fin de periode, puis retour FREE
- Historique des factures consultable et telechargeable
- Portal Stripe pour mise a jour des moyens de paiement

#### US-7.4 : Gerer les webhooks Stripe
> **En tant que** systeme,
> **je veux** traiter les evenements Stripe,
> **afin de** maintenir la coherence des abonnements.

**Criteres d'acceptation :**
- Evenements geres : `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`
- Idempotence : chaque evenement traite une seule fois (deduplication par `eventId`)
- Retry automatique en cas d'echec
- Alerte admin en cas de paiement echoue

### 8.4 Modele de donnees

```
Subscription
  ├── id, tenantId (FK, unique)
  ├── stripeCustomerId (unique), stripeSubscriptionId (unique)
  ├── plan (TenantPlan)
  ├── status: ACTIVE | PAST_DUE | CANCELLED | TRIALING
  ├── currentPeriodStart, currentPeriodEnd
  ├── cancelAtPeriodEnd (Boolean)
  └── createdAt, updatedAt

Invoice
  ├── id, subscriptionId (FK)
  ├── stripeInvoiceId (unique)
  ├── amountPaid (Int, centimes), currency (default "eur")
  ├── status: PAID | OPEN | VOID | UNCOLLECTIBLE
  ├── invoicePdfUrl?
  ├── periodStart, periodEnd
  └── createdAt

SubscriptionEvent
  ├── id, subscriptionId (FK)
  ├── stripeEventId (unique) — pour idempotence
  ├── type (String), data (Json)
  └── processedAt
```

### 8.5 Routes API

| Methode | Route | Description | Role |
|---|---|---|---|
| `GET` | `/api/v1/billing/plans` | Liste des plans | Public |
| `GET` | `/api/v1/billing/subscription` | Mon abonnement actuel | ADMIN |
| `POST` | `/api/v1/billing/checkout` | Creer une session Stripe Checkout | ADMIN |
| `POST` | `/api/v1/billing/portal` | URL du portail client Stripe | ADMIN |
| `GET` | `/api/v1/billing/invoices` | Historique des factures | ADMIN |
| `POST` | `/api/v1/billing/webhook` | Webhook Stripe (signature verifiee) | Public |
| `PATCH` | `/api/v1/billing/subscription/cancel` | Annuler l'abonnement | ADMIN |

### 8.6 Routes Frontend

| Route | Page | Description |
|---|---|---|
| `/pricing` | `PricingPage` | Comparaison des plans |
| `/billing` | `BillingPage` | Gestion de l'abonnement |
| `/billing/invoices` | `InvoicesPage` | Historique des factures |
| `/billing/success` | `CheckoutSuccessPage` | Confirmation post-paiement |

### 8.7 Details techniques

- **Stripe** : Integration via `stripe` SDK Node.js. Webhooks verifies par signature (`stripe.webhooks.constructEvent`).
- **Middleware de plan** : Guard `PlanGuard` qui verifie le plan du tenant avant l'acces aux fonctionnalites restreintes. Decorateur `@RequiresPlan(TenantPlan.PRO)`.
- **Synchronisation** : Le plan dans `Tenant.plan` est la source de verite locale. Mis a jour par le webhook `customer.subscription.updated`.
- **Event Store** : `subscription.created`, `subscription.upgraded`, `subscription.cancelled`, `payment.failed`.

---

## 9. Modele de donnees

### 9.1 Schema global

Le diagramme ci-dessous montre les relations entre les entites principales :

```
┌──────────────────────────────────────────────────────────────────────┐
│                           TENANT                                      │
│  id, name, slug, plan, isActive                                       │
│  ┌─────────────────┐  ┌──────────────┐  ┌────────────────┐           │
│  │ Subscription    │  │ User[]       │  │ StorageFile[]  │           │
│  │ (1:1)           │  │              │  │                │           │
│  └─────────────────┘  └──────┬───────┘  └────────────────┘           │
│                              │                                        │
└──────────────────────────────┼────────────────────────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
     ┌────────▼─────┐  ┌──────▼──────┐  ┌──────▼──────┐
     │ PROJECT      │  │ Report[]    │  │ AuditLog[]  │
     │ (entite      │  │             │  │             │
     │  centrale)   │  │ simId       │  │             │
     │              │  │ type        │  │             │
     │ name, client │  │ scores      │  │             │
     │ budget       │  └─────────────┘  └─────────────┘
     │ deadline     │
     │              │
     │ ┌────────────┤
     │ │            │
     │ ▼            ▼
     │ TeamMember[] Deliverable[]
     │
     └──────┬───────┐
            │       │
     ┌──────▼────┐  │
     │Simulation │  │ (relation 1:1)
     │           │  │
     │ scenarioId│  │
     │ status    │  │
     │ KPIs      │  │
     └──────┬────┘  │
            │       │
   ┌────────┼────────┬──────────────┐
   │        │        │              │
┌──▼──┐ ┌──▼───┐ ┌──▼──────┐ ┌────▼────────┐
│Phase│ │Meet- │ │Decision │ │RandomEvent  │
│     │ │ing   │ │         │ │             │
│     │ │      │ │ options │ │ severity    │
│     │ │      │ │ impact  │ │ options     │
└─────┘ └──┬───┘ └─────────┘ └─────────────┘
           │
    ┌──────┼──────┐
    │             │
┌───▼────┐ ┌─────▼─────┐
│Message │ │Participant│
│        │ │           │
│content │ │personality│
│role    │ │cooperation│
└────────┘ └───────────┘
```

### 9.2 Entites existantes (deja en base)

| Entite | Table Prisma | Statut |
|---|---|---|
| Tenant | `Tenant` | EXISTANT |
| User | `User` | EXISTANT |
| RefreshToken | `RefreshToken` | EXISTANT |
| DomainEvent | `DomainEvent` | EXISTANT |
| DomainEventConsumer | `DomainEventConsumer` | EXISTANT |
| AuditLog | `AuditLog` | EXISTANT |
| Notification | `Notification` | EXISTANT |
| StorageFile | `StorageFile` | EXISTANT |

### 9.3 Entites a creer

| Entite | Module | Priorite |
|---|---|---|
| **Project** | **Module 3** | **P0** |
| **ProjectTeamMember** | **Module 3** | **P0** |
| **Deliverable** | **Module 3** | **P0** |
| Scenario | Module 3 | P1 |
| ScenarioPhase | Module 3 | P1 |
| MeetingTemplate | Module 3 | P1 |
| DecisionTemplate | Module 3 | P1 |
| RandomEventTemplate | Module 3 | P1 |
| Simulation | Module 3 | P1 |
| SimulationPhase | Module 3 | P1 |
| SimulationKpi | Module 3 | P1 |
| Meeting | Module 2 | P1 |
| MeetingParticipant | Module 2 | P1 |
| MeetingMessage | Module 2 | P1 |
| MeetingSummary | Module 2 | P1 |
| Decision | Module 3 | P1 |
| RandomEvent | Module 3 | P1 |
| Report | Module 6 | P2 |
| Subscription | Module 7 | P2 |
| Invoice | Module 7 | P2 |
| SubscriptionEvent | Module 7 | P2 |

---

## 10. Phases de simulation

### 10.1 Cycle de vie d'une simulation

```
[Catalogue]  →  [Lancement]  →  [Phase 1: Initiation]  →  [Phase 2: Planification]
                                        │                         │
                                   Reunions                  Reunions
                                   Decisions                 Decisions
                                   Evenements                Evenements
                                        │                         │
                                   [Rapport P1]             [Rapport P2]
                                        │                         │
                                        ▼                         ▼
[Rapport Final]  ←  [Phase 5: Cloture]  ←  [Phase 4: Monitoring]  ←  [Phase 3: Execution]
       │                    │                      │                        │
  Score final          Reunions                Reunions                 Reunions
  Competences          Decisions               Decisions                Decisions
  Recommandations      Evenements              Evenements               Evenements
                            │                      │                        │
                       [Rapport P5]            [Rapport P4]            [Rapport P3]
```

### 10.2 Description des phases

| Phase | Nom | Objectifs pedagogiques | Reunions typiques |
|---|---|---|---|
| 1 | **Initiation** | Cadrage, identification des parties prenantes, charte projet | Kickoff, reunion parties prenantes |
| 2 | **Planification** | WBS, estimation, planning, budget, risques | Ateliers de planification, comite |
| 3 | **Execution** | Coordination equipe, suivi des livrables, communication | Daily standups, points d'avancement |
| 4 | **Monitoring** | Suivi KPIs, gestion des ecarts, actions correctives | Comites de pilotage, revues qualite |
| 5 | **Cloture** | Bilan, retour d'experience, archivage | Retrospective, reunion de cloture |

### 10.3 Conditions de passage de phase

| Transition | Conditions |
|---|---|
| Initiation → Planification | Reunion de kickoff completee, objectifs valides |
| Planification → Execution | Plan approuve (reunion comite), budget alloue |
| Execution → Monitoring | Au moins 2 standups completes, 1 decision prise |
| Monitoring → Cloture | Tous les livrables evalues, reunion de pilotage completee |
| Cloture → Fin | Retrospective completee, rapport final genere |

### 10.4 Impact des KPIs

| KPI | Facteurs positifs | Facteurs negatifs |
|---|---|---|
| **Budget** | Decisions d'optimisation, bonne estimation | Scope creep, mauvaise estimation, evenements couteux |
| **Delai** | Planification rigoureuse, priori sation | Retards equipe, dependances non gerees |
| **Qualite** | Revues regulieres, tests, communication | Negligence, compression des delais, turnover |
| **Moral equipe** | Leadership, communication, reconnaissance | Conflits non geres, surcharge, decisions autoritaires |
| **Risque** | Identification proactive, plans de mitigation | Risques ignores, absence de plan B |

### 10.5 Scoring final

Le score final est calcule comme suit :

```
Score Global = (Budget × 0.25) + (Delai × 0.25) + (Qualite × 0.25) + (Moral × 0.15) + (Risque × 0.10)
```

**Niveaux de performance :**

| Score | Niveau | Badge |
|---|---|---|
| 90-100 | Expert | Chef de projet exemplaire |
| 75-89 | Competent | Bonne maitrise de projet |
| 60-74 | En progression | Bases solides, ameliorations possibles |
| 40-59 | Debutant | Necessite un accompagnement |
| 0-39 | En difficulte | Formation approfondie recommandee |

---

## Annexes

### A. Evenements du domaine (Event Store)

| Module | Evenements |
|---|---|
| Auth (EXISTANT) | `user.registered`, `user.logged_in`, `user.updated`, `user.deleted`, `user.password_changed`, `user.email_changed`, `user.avatar_uploaded`, `user.two_factor_enabled`, `user.two_factor_disabled`, `user.google_linked`, `user.google_unlinked` |
| Tenant (EXISTANT) | `tenant.updated` |
| Notification (EXISTANT) | `notification.sent`, `notification.read` |
| Project | `project.created`, `project.updated`, `project.team_updated`, `project.deliverable_updated` |
| Simulation | `simulation.created`, `simulation.started`, `simulation.paused`, `simulation.resumed`, `simulation.completed`, `simulation.abandoned` |
| Phase | `simulation.phase_advanced`, `simulation.phase_completed` |
| Meeting | `meeting.started`, `meeting.message_sent`, `meeting.completed` |
| Decision | `decision.presented`, `decision.made` |
| Random Event | `event.triggered`, `event.resolved` |
| Report | `report.generating`, `report.generated`, `report.downloaded` |
| Billing | `subscription.created`, `subscription.upgraded`, `subscription.downgraded`, `subscription.cancelled`, `payment.succeeded`, `payment.failed` |

### B. Notifications utilisateur

| Evenement | Canal | Message |
|---|---|---|
| Reunion bientot | Socket + Email | "Votre reunion {title} commence dans 5 minutes" |
| Decision en attente | Socket | "Une decision attend votre choix : {title}" |
| Evenement aleatoire | Socket | "Alerte projet : {title}" |
| Rapport pret | Socket + Email | "Votre rapport de {phase} est disponible" |
| KPI critique | Socket | "Attention : {kpi} est passe sous le seuil critique" |
| Phase completee | Socket + Email | "Phase {name} terminee — consultez votre bilan" |
| Paiement echoue | Socket + Email | "Votre paiement a echoue — mettez a jour vos informations" |

### C. Limites techniques MVP

| Contrainte | Valeur |
|---|---|
| Taille max fichier upload | 5 MB |
| Messages par reunion (max) | 100 |
| Simulations simultanees (FREE) | 1 |
| Participants IA par reunion | 2-6 |
| Temps de reponse IA (premier token) | < 3s |
| Rate limit API global | 100 req/min |
| Retention audit logs | 1 an |
| Retention events (BullMQ) | 100 completed, 50 failed |
