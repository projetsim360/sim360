# Plan d'implémentation final — ProjectSim360

> Basé sur l'analyse des écarts entre le commentaire de vision produit et l'état actuel du code.
> Date : 2026-03-21

---

## Vue d'ensemble

| Phase | Chantiers | Effort | Statut |
|-------|-----------|--------|--------|
| **Phase 1 — Fondations** | Brownfield, Livrables Métiers, Passation | ~12j | **COMPLETE** |
| **Phase 2 — IA & Scénarios** | Génération IA scénario, Greenfield brut, Handbook PMBOK | ~8j | **COMPLETE** |
| **Phase 3 — Premium & Export** | Mentorat, Portfolio PDF/ZIP, Feature gating, Recommandation | ~10j | **COMPLETE** |
| **Phase 4 — Polish** | Voice Q&A PMO, Agent RH d'accueil | ~5j | **COMPLETE** |

**Toutes les 4 phases sont implementees. Date de completion : 2026-03-21.**

---

## Phase 1 — Fondations (~12 jours)

### 1.1 Brownfield Scenario (Reprise de projet) — P0, ~5j

**Problème** : `currentPhaseOrder: 0` est hardcodé. Impossible de démarrer en phase 2+ (Exécution). Aucun contexte historique.

#### Schema Prisma

```prisma
// Ajouter à Scenario
enum ScenarioType {
  GREENFIELD
  BROWNFIELD
}

model Scenario {
  // ... champs existants
  scenarioType        ScenarioType @default(GREENFIELD)
  startingPhaseOrder  Int          @default(0)
  brownfieldContext    Json?        // Contexte historique pour les reprises
}
```

Structure `brownfieldContext` :
```json
{
  "previousDecisions": [
    { "phase": 0, "title": "Choix du framework", "outcome": "React sélectionné", "impact": "positive" },
    { "phase": 1, "title": "Réduction budget 20%", "outcome": "Scope réduit", "impact": "negative" }
  ],
  "completedDeliverables": [
    { "name": "Charte de projet", "score": 78, "status": "VALIDATED" },
    { "name": "Plan de management", "score": 65, "status": "VALIDATED" }
  ],
  "accumulatedDelays": 15,
  "budgetUsed": 0.65,
  "knownRisks": [
    { "title": "Turnover équipe technique", "severity": "HIGH", "status": "ACTIVE" }
  ],
  "teamMorale": "low",
  "previousPmNotes": "Le précédent chef de projet a quitté en phase d'Exécution suite à un conflit avec le Sponsor."
}
```

#### Backend

**Fichiers à modifier :**
- `apps/api/src/modules/simulations/dto/create-simulation.dto.ts`
  - Ajouter `startingPhaseOrder?: number` (optionnel, défaut 0)
- `apps/api/src/modules/simulations/services/simulations.service.ts`
  - Modifier `create()` : si `startingPhaseOrder > 0`, marquer phases 0..N-1 comme COMPLETED
  - Générer KPI snapshots historiques pour les phases passées
  - Créer décisions/meetings synthétiques depuis `brownfieldContext`
- `apps/api/src/modules/simulations/services/scenarios.service.ts`
  - Support CRUD pour `scenarioType`, `startingPhaseOrder`, `brownfieldContext`

**Nouveau service :**
- `apps/api/src/modules/simulations/services/brownfield-context.service.ts`
  - `generateHistoricalData(scenario, simulation)` : pré-remplir phases, décisions, KPIs
  - `generatePmoBriefing(simulation)` : prompt PMO contextuel pour Brownfield

**Seed :**
- `prisma/seed.ts` : ajouter 1-2 scénarios Brownfield (démarrage phase 2 "Exécution")

#### Frontend

**Fichiers à modifier :**
- `apps/webapp/src/features/simulation/pages/create-simulation.tsx`
  - Afficher un badge "Greenfield" / "Brownfield" sur les cartes scénario
  - Pour Brownfield : afficher un résumé du contexte (retards, budget utilisé, risques)
- `apps/webapp/src/features/simulation/pages/simulation-detail.tsx`
  - Pour Brownfield : panneau "Historique hérité" avec décisions passées, livrables validés
- `apps/webapp/src/features/simulation/api/simulation.api.ts`
  - Adapter les types pour inclure `scenarioType`, `brownfieldContext`

---

### 1.2 Livrables Métiers — Délégation & Approbation — P0, ~5j

**Problème** : L'utilisateur produit tous les livrables lui-même. Pas de délégation aux agents IA. Les statuts VALIDATED/REJECTED existent mais aucune transition n'est implémentée.

#### Schema Prisma

```prisma
// Étendre UserDeliverable
model UserDeliverable {
  // ... champs existants
  assignedToMemberId  String?
  assignedToMember    ProjectTeamMember? @relation(fields: [assignedToMemberId], references: [id])
  assignedToRole      String?            // "TECHNICAL_EXPERT", "HR_MANAGER", "ARCHITECT"
  delegationType      DeliverableDelegationType @default(SELF_PRODUCED)
  approvalChain       Json?              // [{role: "SPONSOR", userId: "...", status: "PENDING|APPROVED|REJECTED"}]
  approvedBy          String?
  approvedAt          DateTime?
  rejectionReason     String?
}

enum DeliverableDelegationType {
  SELF_PRODUCED    // Livrable de gestion (le CP produit)
  DELEGATED        // Livrable métier (un expert IA produit)
}

// Nouveau modèle pour l'historique d'approbation
model DeliverableApproval {
  id              String   @id @default(uuid())
  deliverableId   String
  deliverable     UserDeliverable @relation(fields: [deliverableId], references: [id], onDelete: Cascade)
  reviewerId      String   // ProjectTeamMember ID (agent IA) ou User ID (humain)
  reviewerRole    String   // "SPONSOR", "CLIENT", "TECHNICAL_LEAD"
  status          String   // "PENDING", "APPROVED", "REJECTED"
  comment         String?
  reviewedAt      DateTime?
  createdAt       DateTime @default(now())

  @@map("deliverable_approvals")
  @@index([deliverableId])
}
```

#### Backend

**Nouveau service : `apps/api/src/modules/deliverables/services/deliverable-delegation.service.ts`**
```
- assignToExpert(deliverableId, teamMemberId, role)
  → Marque le livrable comme DELEGATED
  → Déclenche la génération IA du contenu par l'agent assigné
  → Notifie le CP quand le livrable est prêt

- generateDelegatedContent(deliverable, teamMember)
  → Appel AiService avec le persona de l'expert (personnalité, compétences)
  → Produit un brouillon que le CP peut réviser
  → Stocke le contenu dans deliverable.content

- requestRevision(deliverableId, feedback)
  → Le CP demande des corrections à l'expert IA
  → L'agent IA régénère en tenant compte du feedback
```

**Nouveau service : `apps/api/src/modules/deliverables/services/approval-workflow.service.ts`**
```
- defineApprovalChain(deliverableId, chain: {role, memberId}[])
  → Stocke la chaîne d'approbation dans approvalChain JSON
  → Crée les entrées DeliverableApproval en status PENDING

- submitForApproval(deliverableId)
  → Transition EVALUATED → PENDING_APPROVAL
  → Notifie le premier reviewer de la chaîne
  → Génère la réponse IA du reviewer (Sponsor, Client)

- processApproval(approvalId, decision: APPROVED|REJECTED, comment?)
  → L'agent IA reviewer donne son avis
  → Si APPROVED par tous → transition vers VALIDATED
  → Si REJECTED → transition vers REJECTED + motif
  → Le CP reçoit une notification avec le verdict

- getApprovalStatus(deliverableId)
  → Retourne l'état de chaque étape de la chaîne
```

**Modifier : `apps/api/src/modules/deliverables/controllers/deliverables.controller.ts`**
```
Nouveaux endpoints :
POST   /deliverables/:id/assign          → Assigner à un expert
POST   /deliverables/:id/request-revision → Demander corrections à l'expert
POST   /deliverables/:id/approval-chain   → Définir la chaîne d'approbation
POST   /deliverables/:id/submit-approval  → Soumettre pour approbation
GET    /deliverables/:id/approval-status  → Statut d'approbation
POST   /deliverables/:id/approve          → Approuver (agent IA)
POST   /deliverables/:id/reject           → Rejeter (agent IA)
```

#### Frontend

**Nouveaux composants :**
- `apps/webapp/src/features/deliverables/components/expert-assignment-dialog.tsx`
  - Modal avec liste des membres d'équipe IA et leurs compétences
  - Sélection de l'expert + rôle + instructions optionnelles
- `apps/webapp/src/features/deliverables/components/approval-chain-builder.tsx`
  - Interface pour définir la chaîne : Rédacteur → Reviewer → Validateur
  - Drag-and-drop des rôles (Sponsor, Client, Technical Lead)
- `apps/webapp/src/features/deliverables/components/approval-timeline.tsx`
  - Timeline verticale montrant chaque étape d'approbation
  - Statut : En attente / Approuvé / Rejeté + commentaires

**Modifier :**
- `apps/webapp/src/features/deliverables/pages/deliverables-list-page.tsx`
  - Onglets : "Mes livrables" | "Livrables délégués" | "En attente d'approbation"
- `apps/webapp/src/features/deliverables/pages/deliverable-editor-page.tsx`
  - Bouton "Assigner à un expert" (si livrable métier)
  - Bouton "Soumettre pour approbation" (après évaluation)

---

### 1.3 Réunion de Passation Structurée — P0, ~3j

**Problème** : Le PMO accueille via chat texte. Pas de réunion structurée de passation (visio interactive avec discours + Q&A).

#### Schema Prisma

```prisma
// Ajouter aux enums existants
// MeetingType existant + nouveaux types
// KICKOFF, STEERING, STANDUP, RETROSPECTIVE, CRISIS + :
// HANDOVER_HR, HANDOVER_PMO
```

#### Backend

**Nouveau service : `apps/api/src/modules/meetings/services/handover.service.ts`**
```
- triggerHandoverSequence(simulationId, userId)
  → Étape 1 : Créer meeting HANDOVER_HR
    - Agent RH présente : culture entreprise, règles, outils, attentes
    - System prompt structuré en sections
  → Étape 2 : Créer meeting HANDOVER_PMO
    - PMO présente : objectifs projet, phases, méthodologie, livrables attendus
    - Pour Brownfield : ajoute briefing historique (retards, risques, décisions passées)
  → Étape 3 : Envoyer email "Project Handbook" simulé

- generateHandoverAgenda(simulation, meetingType)
  → Retourne un agenda structuré :
    HR : [Bienvenue, Culture, Outils, Règles, Q&A]
    PMO : [Contexte, Objectifs, Phases, Livrables, Méthodologie, Q&A]

- isHandoverComplete(simulationId)
  → Vérifie que les deux meetings sont COMPLETED
  → Gate l'accès au reste de la simulation
```

**Modifier : `apps/api/src/modules/simulations/services/simulations.service.ts`**
```
- Dans create() : après création simulation, appeler triggerHandoverSequence()
- La simulation reste en status ONBOARDING jusqu'à ce que la passation soit terminée
```

#### Frontend

**Nouveau composant :**
- `apps/webapp/src/features/meeting/components/handover-meeting.tsx`
  - Interface dédiée pour la passation (plus formelle que le chat)
  - Sections numérotées avec progression
  - Zone Q&A vocale ou texte
  - Bouton "J'ai compris, passer à la suite" pour avancer

**Modifier :**
- `apps/webapp/src/features/simulation/pages/simulation-detail.tsx`
  - Si simulation en status ONBOARDING : rediriger vers la passation
  - Barre de progression : HR → PMO → Projet

---

## Phase 2 — IA & Scénarios (~8 jours)

### 2.1 Génération IA de scénario depuis profil/custom project — P0, ~4j

**Problème** : `customProjectData` est capturé mais aucun service IA ne génère de scénario.

#### Backend

**Nouveau service : `apps/api/src/modules/ai/services/scenario-generation-ai.service.ts`**
```
- generateScenarioFromProfile(profile: UserProfile)
  Input :
    - profileType (NOVICE/INTERMEDIATE/EXPERT)
    - sector, skills, customProjectData
    - questionnaire answers, gap analysis results
  Output :
    - Scenario complet avec :
      - title, description, sector, difficulty (auto-calibrée)
      - projectTemplate JSON (équipe, budget, deadline)
      - 5 phases avec templates de livrables par phase
      - initialKpis calibrés
      - meetingTemplates, decisionTemplates, randomEventTemplates

- generateFromCustomProject(customProjectData, profileType)
  → Variante qui part du projet custom de l'utilisateur
  → Génère un scénario réaliste autour de ce projet
  → Adapte la difficulté au profil
```

**Modifier : `apps/api/src/modules/profile/services/profile.service.ts`**
```
- submitCustomProject() : après stockage, proposer la génération IA
```

**Nouveau endpoint :**
```
POST /scenarios/generate
  Body: { profileId?, customProjectData?, difficulty? }
  → Appelle ScenarioGenerationAiService
  → Crée le Scenario en base (status DRAFT)
  → Retourne le scénario pour review avant publication
```

#### Frontend

**Modifier : `apps/webapp/src/features/simulation/pages/create-simulation.tsx`**
```
- Ajouter onglet "Générer un scénario personnalisé"
- Formulaire : secteur, difficulté souhaitée, description projet (pré-rempli si custom project existe)
- Bouton "Générer avec l'IA" → loading → preview du scénario → confirmer → lancer simulation
```

---

### 2.2 Greenfield "mandat brut" — P2, ~3j

**Problème** : Tous les scénarios ont un `projectTemplate` pré-rempli. Pas de mode "page blanche".

#### Backend

**Modifier : `apps/api/src/modules/simulations/services/simulations.service.ts`**
```
- Si scenario.scenarioType === GREENFIELD et scenario.projectTemplate est minimal :
  - Ne pas créer d'équipe pré-remplie
  - Créer un livrable obligatoire "Charte de projet" en phase 0
  - L'utilisateur doit le remplir avant de pouvoir avancer
```

**Nouveau service : `apps/api/src/modules/simulations/services/stakeholder-identification.service.ts`**
```
- suggestStakeholders(simulationId, charteContent)
  → Analyse la charte rédigée par l'utilisateur
  → Suggère des parties prenantes pertinentes
  → L'utilisateur valide/modifie la liste
  → Crée les ProjectTeamMember correspondants
```

#### Frontend

**Nouveau composant :**
- `apps/webapp/src/features/simulation/components/stakeholder-builder.tsx`
  - Interface pour ajouter/modifier les parties prenantes
  - Suggestions IA basées sur la charte
  - Rôles, compétences, personnalités

---

### 2.3 Project Handbook PMBOK dans l'email de bienvenue — P1, ~1j

**Problème** : L'email de bienvenue est générique, sans contenu PMBOK.

#### Backend

**Modifier : `apps/api/src/modules/simulated-emails/services/email-generator.service.ts`**
```
- Enrichir le template generateWelcomeEmail() :

  Sections à ajouter :
  1. "Méthodologie Projet" : les 5 phases PMI (Initiation → Clôture)
  2. "Gouvernance" : rôles (Sponsor, CP, équipe), processus d'escalade
  3. "Procédures standards" :
     - Gestion des changements (Change Request process)
     - Gestion des risques (identification, analyse, réponse)
     - Gestion de la qualité (critères d'acceptation)
     - Communication (fréquence réunions, reporting)
  4. "Outils à disposition" : PMO IA, éditeur livrables, réunions virtuelles
  5. "Contacts clés" : Sponsor, PMO, experts techniques
```

---

## Phase 3 — Premium & Export (~10 jours)

### 3.1 Module Mentorat Premium — P1, ~5j

**Problème** : Le debriefing est 100% IA. Aucun rôle MENTOR. Pas de réévaluation humaine.

#### Schema Prisma

```prisma
// Ajouter à UserRole
// MENTOR

model MentorReview {
  id               String   @id @default(uuid())
  evaluationId     String
  evaluation       DeliverableEvaluation @relation(fields: [evaluationId], references: [id])
  mentorId         String
  mentor           User     @relation(fields: [mentorId], references: [id])
  tenantId         String

  humanScore       Int      // 0-100
  leadershipScore  Int?     // 0-100
  diplomacyScore   Int?     // 0-100
  postureScore     Int?     // 0-100

  feedback         String   // Analyse qualitative
  recommendations  String?  // Conseils pour entretien

  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@map("mentor_reviews")
  @@index([evaluationId])
  @@index([mentorId])
}

model MentoringSession {
  id              String   @id @default(uuid())
  simulationId    String
  simulation      Simulation @relation(fields: [simulationId], references: [id])
  mentorId        String
  mentor          User     @relation(fields: [mentorId], references: [id])
  learnerId       String
  learner         User     @relation(fields: [learnerId], references: [id])
  tenantId        String

  type            String   // "DEBRIEFING", "CAREER_COACHING", "INTERVIEW_PREP"
  status          String   @default("SCHEDULED") // SCHEDULED, IN_PROGRESS, COMPLETED
  notes           String?
  scheduledAt     DateTime?
  completedAt     DateTime?

  messages        MentoringMessage[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("mentoring_sessions")
  @@index([simulationId])
  @@index([mentorId])
}

model MentoringMessage {
  id          String   @id @default(uuid())
  sessionId   String
  session     MentoringSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  senderId    String
  role        String   // "MENTOR", "LEARNER"
  content     String
  createdAt   DateTime @default(now())

  @@map("mentoring_messages")
  @@index([sessionId])
}
```

#### Backend

**Nouveau module : `apps/api/src/modules/mentoring/`**
```
mentoring/
├── mentoring.module.ts
├── mentoring.controller.ts
├── services/
│   ├── mentor-review.service.ts      → CRUD reviews, calcul score final
│   ├── mentoring-session.service.ts  → Sessions interactives mentor-apprenant
│   └── mentor-assignment.service.ts  → Affecter mentors aux apprenants
├── dto/
│   ├── create-mentor-review.dto.ts
│   ├── create-mentoring-session.dto.ts
│   └── send-mentoring-message.dto.ts
└── guards/
    └── mentor.guard.ts               → Vérifie rôle MENTOR
```

**Endpoints :**
```
POST   /mentoring/reviews                    → Créer une réévaluation mentor
GET    /mentoring/reviews/:evaluationId      → Lire la review mentor
PUT    /mentoring/reviews/:id                → Modifier la review
GET    /mentoring/reviews/pending            → Reviews en attente (pour le mentor)

POST   /mentoring/sessions                   → Initier session de débriefing
GET    /mentoring/sessions                   → Lister mes sessions
GET    /mentoring/sessions/:id               → Détail session
POST   /mentoring/sessions/:id/messages      → Envoyer message
GET    /mentoring/sessions/:id/messages      → Historique messages
PATCH  /mentoring/sessions/:id/complete      → Marquer session terminée
```

#### Frontend

**Nouvelle feature : `apps/webapp/src/features/mentoring/`**
```
mentoring/
├── api/mentoring.api.ts
├── config/mentoring.routes.tsx
├── pages/
│   ├── mentor-dashboard-page.tsx      → Vue mentor : reviews en attente, sessions planifiées
│   ├── mentor-review-page.tsx         → Formulaire de réévaluation (scores + feedback)
│   ├── mentoring-session-page.tsx     → Chat mentor-apprenant
│   └── learner-mentoring-page.tsx     → Vue apprenant : mes sessions, mes reviews
├── components/
│   ├── mentor-review-card.tsx         → Score IA vs score humain côte-à-côte
│   ├── mentoring-session-chat.tsx     → Interface de chat
│   └── score-comparison-chart.tsx     → Radar IA vs Mentor
└── types/mentoring.types.ts
```

---

### 3.2 Portfolio PDF/ZIP Export — P1, ~2j

**Problème** : Le portfolio retourne du JSON. Pas de PDF ni ZIP.

#### Backend

**Modifier : `apps/api/src/modules/valorization/services/portfolio.service.ts`**
```
- exportPdf(simulationId, userId, options?)
  → Compiler les données portfolio
  → Générer HTML template (livrables, scores, radar, badges)
  → Convertir en PDF via Puppeteer ou @react-pdf/renderer
  → Retourner le buffer PDF

- exportZip(simulationId, userId)
  → Compiler tous les livrables en Markdown
  → Ajouter les évaluations (IA + mentor si Premium)
  → Ajouter le radar chart en image
  → Ajouter les badges en image
  → Créer un ZIP via archiver
  → Retourner le buffer ZIP

- getBestDeliverables(simulationId, userId, minScore?: number)
  → Filtrer les livrables par score (IA ou final si mentor review)
  → Trier par score décroissant
  → Retourner les top livrables pour sélection portfolio
```

**Nouveaux endpoints :**
```
GET  /simulations/:simId/portfolio/export/pdf   → Download PDF
GET  /simulations/:simId/portfolio/export/zip   → Download ZIP
GET  /simulations/:simId/portfolio/best?minScore=80 → Filtrer par score
```

**Dépendances npm :**
```
pnpm --filter @sim360/api add puppeteer archiver
pnpm --filter @sim360/api add -D @types/archiver
```

#### Frontend

**Modifier : `apps/webapp/src/features/valorization/pages/portfolio-page.tsx`**
```
- Boutons "Exporter PDF" et "Exporter ZIP"
- Checkbox pour sélectionner les livrables à inclure
- Slider pour filtrer par score minimum
- Preview avant export
```

---

### 3.3 Feature Gating par Plan — P1, ~2j

**Problème** : Toutes les fonctionnalités sont accessibles à tous les plans.

#### Backend

**Nouveau guard : `libs/core/src/common/guards/plan.guard.ts`**
```typescript
@Injectable()
export class PlanGuard implements CanActivate {
  // Vérifie que le tenant a le plan requis
  // Usage : @RequiredPlan(TenantPlan.PRO)
}
```

**Nouveau décorateur : `libs/core/src/common/decorators/required-plan.decorator.ts`**
```typescript
export const RequiredPlan = (...plans: TenantPlan[]) => SetMetadata('required_plans', plans);
```

**Matrice des accès :**

| Fonctionnalité | FREE | STARTER | PRO | ENTERPRISE |
|----------------|------|---------|-----|------------|
| Simulations | 1 | 3 | 10 | ∞ |
| Livrables de gestion | ✓ | ✓ | ✓ | ✓ |
| Livrables métiers (délégation) | ✗ | ✓ | ✓ | ✓ |
| Évaluation IA | ✓ | ✓ | ✓ | ✓ |
| Jumeau Parfait | ✗ | ✓ | ✓ | ✓ |
| Portfolio JSON | ✓ | ✓ | ✓ | ✓ |
| Portfolio PDF | ✗ | ✓ | ✓ | ✓ |
| Portfolio ZIP | ✗ | ✗ | ✓ | ✓ |
| Mentorat Premium | ✗ | ✗ | ✓ | ✓ |
| Scénario personnalisé IA | ✗ | ✗ | ✓ | ✓ |
| Brownfield scenarios | ✗ | ✓ | ✓ | ✓ |

#### Frontend

**Nouveau composant : `apps/webapp/src/components/ui/premium-gate.tsx`**
```
- Wrapper qui affiche un overlay "Upgrade" si le plan est insuffisant
- CTA vers page de pricing
- Badge "PRO" / "ENTERPRISE" sur les features gated
```

---

### 3.4 Recommandation de scénario par profil — P2, ~1j

**Problème** : Aucun lien entre le profil utilisateur et les scénarios proposés.

#### Backend

**Nouveau endpoint :**
```
GET /scenarios/recommended?profileType=EXPERT&sector=IT&limit=5
```

**Algorithme de matching :**
```
1. Filtrer par secteur (exact match ou ALL)
2. Mapper difficulté ↔ profileType :
   - NOVICE → BEGINNER
   - INTERMEDIATE → INTERMEDIATE
   - EXPERT → ADVANCED
3. Si customProjectData existe → scorer similarité avec description scénario
4. Trier par pertinence
5. Retourner top N
```

#### Frontend

**Modifier : `apps/webapp/src/features/simulation/pages/create-simulation.tsx`**
```
- Section "Recommandés pour vous" en haut de page
- Cards avec badge "Recommandé" + explication (ex: "Basé sur votre expertise IT")
```

---

## Phase 4 — Polish (~5 jours)

### 4.1 Voice Q&A dans le chat PMO — P2, ~2j

**Problème** : La voix fonctionne en meeting mais pas dans le chat PMO.

#### Frontend

**Modifier : `apps/webapp/src/features/pmo/components/pmo-chat.tsx`**
```
- Ajouter bouton microphone dans la barre de saisie
- Capture audio via navigator.mediaDevices.getUserMedia
- Transcription via OpenAI Whisper API (POST /audio/transcriptions)
- Injecter le texte transcrit dans le champ de saisie
- Envoi automatique ou confirmation manuelle
```

#### Backend

**Nouveau endpoint (optionnel, peut être fait côté client) :**
```
POST /pmo/transcribe
  Body: audio file (multipart)
  → Appelle OpenAI Whisper API
  → Retourne le texte transcrit
```

---

### 4.2 Agent RH d'accueil — P2, ~2j

**Problème** : Pas d'agent RH présentant la culture d'entreprise avant le PMO.

#### Backend

**Modifier : `apps/api/src/modules/meetings/services/handover.service.ts`**
```
- generateHrWelcomeMeeting(simulation)
  System prompt RH :
    "Tu es la Directrice des Ressources Humaines de {company}.
     Ton rôle est d'accueillir le nouveau Chef de Projet.
     Tu présentes :
     1. La culture d'entreprise et les valeurs
     2. Les règles internes (horaires, communication, escalade)
     3. Les outils mis à disposition
     4. Les attentes envers le poste
     5. Les contacts clés de l'organisation
     Tu es chaleureuse mais professionnelle."
```

#### Frontend

**Modifier : `apps/webapp/src/features/meeting/components/handover-meeting.tsx`**
```
- Étape 1 : Meeting RH (présentation culture + règles)
- Étape 2 : Meeting PMO (présentation projet + méthodologie)
- Barre de progression entre les deux étapes
```

---

## Checklist de validation

### Phase 1 — COMPLETE
- [x] Scénario Brownfield : démarrage en phase 2+ avec contexte historique
- [x] Livrables Métiers : assigner un livrable à un expert IA
- [x] Livrables Métiers : l'expert IA produit le livrable
- [x] Circuit d'approbation : Sponsor/Client valide ou rejette
- [x] Réunion de Passation : meeting HANDOVER_PMO structuré
- [x] Flux post-onboarding : onboarding → simulation → passation → projet

### Phase 2 — COMPLETE
- [x] Générer un scénario IA depuis le profil utilisateur
- [x] Générer un scénario IA depuis un projet custom
- [x] Mode Greenfield "mandat brut" : charte from scratch
- [x] Email de bienvenue contient le handbook PMBOK

### Phase 3 — COMPLETE
- [x] Mentor humain peut réévaluer les notes IA
- [x] Session de mentorat interactive mentor-apprenant
- [x] Portfolio exportable en PDF
- [x] Portfolio exportable en ZIP
- [x] Sélection des meilleurs livrables par score
- [x] Features gated par plan (FREE/STARTER/PRO/ENTERPRISE)
- [x] Scénarios recommandés basés sur le profil

### Phase 4 — COMPLETE
- [x] Voice Q&A dans le chat PMO (Whisper)
- [x] Agent RH d'accueil avant le PMO
