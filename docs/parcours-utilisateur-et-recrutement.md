# ProjectSim360 — Parcours Utilisateur Personnalise & Module Recrutement

> **Version** : 1.0
> **Date** : 2026-03-06
> **Source** : Notes vocales du 2026-02-23
> **Statut** : Draft

---

## Table des matieres

1. [Parcours 1 : Apprenant individuel](#1-parcours-1--apprenant-individuel)
2. [Parcours 2 : Recrutement entreprise](#2-parcours-2--recrutement-entreprise)
3. [Le PMO — Agent IA central](#3-le-pmo--agent-ia-central)
4. [Administration et mise a jour du referentiel](#4-administration-et-mise-a-jour-du-referentiel)
5. [Specifications techniques](#5-specifications-techniques)

---

## 1. Parcours 1 : Apprenant individuel

### 1.1 Etape 1 — Import et analyse du profil

**Objectif** : Personnaliser la simulation en fonction du niveau et de l'experience de l'utilisateur.

**Fonctionnement** :

1. L'utilisateur connecte son profil LinkedIn (ou importe manuellement son CV).
2. Le systeme extrait :
   - Les experiences professionnelles
   - Les competences declarees
   - Le niveau d'experience en gestion de projet
3. L'IA analyse le profil et identifie un **profil type** :
   - **Debutant** : aucune experience en gestion de projet
   - **Reconversion** : experience dans un autre domaine, transition vers la gestion de projet
   - **Renforcement** : chef de projet en poste souhaitant ameliorer ses competences

**Endpoints a creer** :

```
POST /api/v1/profile/import-linkedin
  Body: { linkedinUrl: string } | { linkedinData: object }
  Response: { profile: UserProfile, analysis: ProfileAnalysis }

POST /api/v1/profile/analyze
  Body: { experiences: Experience[], skills: string[] }
  Response: { profileType: 'beginner' | 'reconversion' | 'reinforcement', suggestedCompetencies: Competency[], suggestedScenarios: Scenario[] }
```

### 1.2 Etape 2 — Proposition de competences et generation du cas

**Objectif** : Proposer un parcours de simulation adapte et permettre a l'utilisateur de le personnaliser.

**Fonctionnement** :

1. L'IA propose une liste de **competences a travailler** basee sur l'analyse du profil.
2. L'utilisateur peut :
   - **Accepter** les propositions telles quelles
   - **Modifier** la selection (retirer/ajouter des competences)
   - **Soumettre un cas reel** : l'utilisateur fournit les details d'un projet qu'il connait, et l'IA genere une simulation basee sur ce cas

3. Une fois valide, le systeme genere le scenario de simulation personnalise.

**Endpoints a creer** :

```
POST /api/v1/simulations/personalize
  Body: {
    profileAnalysisId: string,
    selectedCompetencies: string[],
    customCase?: { title: string, description: string, context: string, constraints: string[] }
  }
  Response: { scenario: GeneratedScenario, simulationId: string }
```

### 1.3 Etape 3 — Accueil par le RH puis le PMO

**Objectif** : Immerger l'utilisateur dans un contexte d'entreprise fictif.

**Fonctionnement** :

1. Un **agent RH** (IA) accueille l'utilisateur dans l'entreprise fictive :
   - Presente l'entreprise, sa culture, son secteur d'activite
   - Partage la politique interne et les regles de fonctionnement

2. Le **PMO** (Project Management Office) prend le relais :
   - Presente les bonnes pratiques de gestion de projet de l'entreprise
   - Fournit les templates et documents de reference a utiliser
   - Explique la procedure a suivre pour chaque phase du projet :
     - **Initialisation** : charte de projet, analyse des parties prenantes
     - **Planification** : WBS, echancier, plan de gestion des risques
     - **Execution** : suivi d'avancement, comptes-rendus de reunion
     - **Controle** : tableaux de bord, rapports d'etat
     - **Cloture** : bilan de projet, lecons apprises
   - Precise les livrables attendus a chaque etape

**Implementation** : Ces interactions sont des conversations IA (meme moteur que les reunions) avec des prompts specifiques pour le role RH et le role PMO.

### 1.4 Etape 4 — Production et evaluation des livrables

**Objectif** : L'utilisateur apprend en produisant, pas en consommant.

**Principe fondamental** : L'IA ne genere PAS les livrables a la place de l'utilisateur. L'utilisateur doit les produire lui-meme.

**Fonctionnement** :

1. A chaque etape, le PMO demande a l'utilisateur de fournir un livrable specifique (ex : charte de projet, compte-rendu de reunion, registre des risques).
2. L'utilisateur redige et soumet le livrable.
3. Le **PMO evalue** le livrable soumis :
   - Note les points positifs
   - Identifie les elements manquants ou incorrects
   - Fournit un **exemple de reference** (le livrable tel qu'il aurait du etre redige)
   - Attribue un score de qualite
4. L'utilisateur peut reviser et resoumettre.

**Exemple concret — Compte-rendu de reunion** :
- L'utilisateur participe a une reunion (mode texte ou audio)
- Apres la reunion, on lui demande de rediger le compte-rendu
- L'IA a son propre compte-rendu de reference
- L'utilisateur soumet le sien → l'IA compare les deux et fournit un feedback detaille

**Endpoints a creer** :

```
POST /api/v1/simulations/:id/deliverables
  Body: { phaseId: string, type: DeliverableType, content: string }
  Response: { deliverableId: string }

POST /api/v1/simulations/:id/deliverables/:deliverableId/evaluate
  Response: {
    score: number,
    strengths: string[],
    weaknesses: string[],
    missingElements: string[],
    referenceExample: string,
    recommendations: string[]
  }
```

**Types de livrables** :

| Phase          | Livrables attendus                                          |
|----------------|-------------------------------------------------------------|
| Initialisation | Charte de projet, Analyse des parties prenantes             |
| Planification  | WBS, Echancier, Budget, Plan de risques, Plan de communication |
| Execution      | Comptes-rendus de reunion, Rapports d'avancement            |
| Controle       | Tableaux de bord, Demandes de changement, Rapports d'etat   |
| Cloture        | Bilan de projet, Lecons apprises, PV de reception           |

---

## 2. Parcours 2 : Recrutement entreprise

### 2.1 Vue d'ensemble

Une entreprise peut utiliser la plateforme comme **outil d'evaluation des competences en gestion de projet** dans le cadre d'un recrutement.

### 2.2 Cote recruteur

**Fonctionnement** :

1. L'entreprise cree un compte **entreprise/recruteur** sur la plateforme.
2. Elle renseigne :
   - Les informations de l'entreprise (secteur, taille, culture)
   - Le profil recherche (competences, niveau d'experience, type de projet)
   - Les criteres d'evaluation prioritaires
3. La plateforme genere un **lien de recrutement** unique et partageable.
4. L'entreprise diffuse ce lien dans ses annonces de recrutement.

**Endpoints a creer** :

```
POST /api/v1/recruitment/campaigns
  Body: {
    companyInfo: { name: string, sector: string, size: string, description: string },
    targetProfile: { minExperience: number, requiredSkills: string[], projectTypes: string[] },
    evaluationCriteria: { criteria: string[], weights: Record<string, number> }
  }
  Response: { campaignId: string, recruitmentLink: string }

GET /api/v1/recruitment/campaigns/:id
  Response: { campaign: Campaign, stats: CampaignStats }

GET /api/v1/recruitment/campaigns/:id/results
  Response: { candidates: CandidateResult[], suggestedShortlist: CandidateResult[] }
```

### 2.3 Cote candidat

**Fonctionnement** :

1. Le candidat clique sur le lien de recrutement.
2. Il cree un compte sur la plateforme (ou se connecte s'il en a deja un).
3. La simulation est generee automatiquement en fonction de :
   - Son propre profil (experiences, competences)
   - Les exigences du recruteur (secteur, type de projet, competences evaluees)
4. Le candidat realise la simulation.
5. A la fin, un **score** est calcule et envoye au recruteur.

**Lien avec le parcours 1** : Le parcours candidat reutilise le meme moteur de simulation que le parcours apprenant, avec un scenario adapte aux criteres du recruteur.

### 2.4 Classement et suggestions IA

**Fonctionnement** :

1. L'IA analyse les resultats de tous les candidats.
2. Elle produit un **classement** base sur les scores et les competences demontrees.
3. Elle **suggere une short-list** (ex : les 10 meilleurs sur 250 candidats) avec justification.
4. Le recruteur peut consulter le detail de chaque candidat : score global, scores par competence, points forts, points faibles.

**Endpoint a creer** :

```
GET /api/v1/recruitment/campaigns/:id/shortlist
  Query: { maxCandidates?: number }
  Response: {
    shortlist: [{
      candidateId: string,
      globalScore: number,
      scoresByCompetency: Record<string, number>,
      strengths: string[],
      weaknesses: string[],
      aiJustification: string
    }]
  }
```

---

## 3. Le PMO — Agent IA central

### 3.1 Role

Le PMO (Project Management Office) est un **agent IA** qui joue le role de superviseur et de guide tout au long de la simulation. Il est l'interlocuteur principal de l'apprenant.

### 3.2 Responsabilites

| Responsabilite              | Description                                                              |
|-----------------------------|--------------------------------------------------------------------------|
| Accueil et orientation      | Presente le projet, les phases, la methodologie a suivre                 |
| Distribution des templates  | Fournit les modeles de documents a utiliser pour chaque livrable         |
| Evaluation des livrables    | Note et commente les livrables soumis par l'apprenant                    |
| Fourniture d'exemples       | Genere des livrables de reference pour comparaison                       |
| Suivi de progression        | Rappelle les livrables en attente, les echeances, les etapes suivantes   |
| Conseil                     | Repond aux questions de l'apprenant sur la methodologie                  |

### 3.3 Implementation technique

Le PMO est un **service IA** avec un prompt systeme enrichi par :
- La documentation de reference (templates, standards, bonnes pratiques)
- L'etat courant de la simulation (phase, indicateurs, livrables soumis)
- L'historique des interactions avec l'apprenant

```typescript
// Nouveau service a creer : PmoAiService
interface PmoContext {
  simulation: Simulation;
  currentPhase: Phase;
  submittedDeliverables: Deliverable[];
  referenceDocuments: ReferenceDocument[];
  conversationHistory: Message[];
}
```

---

## 4. Administration et mise a jour du referentiel

### 4.1 Gestion des templates et documents de reference

**Objectif** : Permettre aux admins de maintenir a jour les documents que le PMO utilise comme reference.

**Fonctionnement** :

1. Les admins peuvent **ajouter, modifier et supprimer** :
   - Les templates de livrables (modeles de charte de projet, de PV, etc.)
   - Les standards de qualite (criteres d'evaluation pour chaque type de livrable)
   - Les bonnes pratiques par phase
2. Toute mise a jour est **immediatement disponible** pour le PMO dans les nouvelles simulations.
3. L'historique des versions est conserve.

**Endpoints a creer** :

```
GET    /api/v1/admin/reference-documents
POST   /api/v1/admin/reference-documents
PUT    /api/v1/admin/reference-documents/:id
DELETE /api/v1/admin/reference-documents/:id

GET    /api/v1/admin/deliverable-templates
POST   /api/v1/admin/deliverable-templates
PUT    /api/v1/admin/deliverable-templates/:id
DELETE /api/v1/admin/deliverable-templates/:id
```

### 4.2 Modele de donnees supplementaire

```prisma
model ReferenceDocument {
  id          String   @id @default(uuid())
  title       String
  category    String   // 'template' | 'standard' | 'best-practice'
  phase       String?  // phase concernee (nullable = toutes phases)
  content     String   @db.Text
  version     Int      @default(1)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdById String
  tenantId    String
}

model Deliverable {
  id              String   @id @default(uuid())
  simulationId    String
  phaseId         String
  type            String   // 'project-charter' | 'meeting-minutes' | 'risk-register' | ...
  content         String   @db.Text
  score           Float?
  evaluation      Json?    // { strengths, weaknesses, missingElements, recommendations }
  referenceExample String? @db.Text
  status          String   @default("submitted") // 'submitted' | 'evaluated' | 'revised'
  submittedAt     DateTime @default(now())
  evaluatedAt     DateTime?
  tenantId        String
}

model RecruitmentCampaign {
  id                String   @id @default(uuid())
  companyInfo       Json
  targetProfile     Json
  evaluationCriteria Json
  recruitmentLink   String   @unique
  status            String   @default("active") // 'active' | 'closed' | 'archived'
  createdAt         DateTime @default(now())
  closedAt          DateTime?
  createdById       String
  tenantId          String
}

model CandidateResult {
  id              String   @id @default(uuid())
  campaignId      String
  userId          String
  simulationId    String
  globalScore     Float?
  competencyScores Json?
  strengths       Json?
  weaknesses      Json?
  aiJustification String?  @db.Text
  completedAt     DateTime?
  tenantId        String
}
```

---

## 5. Specifications techniques

### 5.1 Nouveaux modules a creer

| Module                      | Emplacement                                         | Description                                          |
|-----------------------------|-----------------------------------------------------|------------------------------------------------------|
| `ProfileImportService`      | `apps/api/src/modules/profile/`                     | Import LinkedIn, analyse de profil, detection du type |
| `PmoAiService`              | `apps/api/src/modules/ai/services/`                 | Agent IA PMO : accueil, evaluation, conseils          |
| `DeliverableModule`         | `apps/api/src/modules/deliverables/`                | Soumission et evaluation des livrables                |
| `RecruitmentModule`         | `apps/api/src/modules/recruitment/`                 | Campagnes de recrutement, resultats, short-list       |
| `ReferenceDocumentModule`   | `apps/api/src/modules/admin/reference-documents/`   | CRUD des documents de reference et templates          |

### 5.2 Nouvelles pages frontend

| Page                        | Route                                      | Description                                         |
|-----------------------------|--------------------------------------------|-----------------------------------------------------|
| Import de profil            | `/onboarding/profile-import`               | Connexion LinkedIn ou import manuel                  |
| Propositions de competences | `/onboarding/competencies`                 | Selection des competences a travailler               |
| Soumission de cas reel      | `/onboarding/custom-case`                  | Formulaire pour soumettre un cas personnel           |
| Conversation PMO            | `/simulation/:id/pmo`                      | Chat avec l'agent PMO                                |
| Soumission de livrable      | `/simulation/:id/deliverables/submit`      | Editeur pour rediger et soumettre un livrable        |
| Evaluation de livrable      | `/simulation/:id/deliverables/:id/review`  | Vue du feedback et de l'exemple de reference         |
| Creation de campagne        | `/recruitment/campaigns/new`               | Formulaire de creation pour le recruteur             |
| Dashboard recruteur         | `/recruitment/campaigns/:id`               | Resultats, classement et short-list des candidats    |
| Simulation candidat         | `/recruitment/join/:link`                  | Point d'entree pour les candidats via lien           |

### 5.3 Priorite d'implementation

1. **Phase 1** — PMO et livrables : PmoAiService, DeliverableModule, documents de reference, pages de soumission/evaluation
2. **Phase 2** — Personnalisation du parcours : import de profil, analyse IA, generation de scenario personnalise
3. **Phase 3** — Module recrutement : campagnes, lien de recrutement, scoring, short-list IA
