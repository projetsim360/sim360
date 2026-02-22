# Plan d'implementation — Module 3 : Moteur de Scenarios

> **Prochain module a implementer** — Fondation de toute la logique metier.
> Les modules 2 (Reunions), 4 (IA), 5 (Dashboard), 6 (Feedback) en dependent.

---

## Vue d'ensemble

Le Module 3 introduit les entites centrales : **Project**, **Scenario**, **Simulation**.
L'apprenant choisit un scenario, ce qui cree un Project (entite metier) et une Simulation (couche gamification).

```
Scenario (template)  →  POST /simulations  →  Project + Simulation (instances)
                                                  │
                                         ┌────────┼────────┐
                                         │        │        │
                                      Phases  Decisions  Events
```

---

## Phase 1 : Schema Prisma + Migration

**Fichier** : `prisma/schema.prisma`

### 1.1 Enums a ajouter

```prisma
enum ProjectStatus {
  NOT_STARTED
  IN_PROGRESS
  ON_HOLD
  COMPLETED
  FAILED
}

enum SimulationStatus {
  DRAFT
  IN_PROGRESS
  PAUSED
  COMPLETED
  ABANDONED
}

enum Difficulty {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

enum Sector {
  IT
  CONSTRUCTION
  MARKETING
  HEALTHCARE
  FINANCE
  CUSTOM
}

enum PhaseType {
  INITIATION
  PLANNING
  EXECUTION
  MONITORING
  CLOSURE
}

enum DeliverableStatus {
  PENDING
  IN_PROGRESS
  DELIVERED
  ACCEPTED
  REJECTED
}

enum RandomEventType {
  RISK
  OPPORTUNITY
  CONSTRAINT
  STAKEHOLDER
}

enum Severity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}
```

### 1.2 Modeles a creer

```prisma
// ─── TEMPLATES (Scenarios) ─────────────────────────────

model Scenario {
  id                    String     @id @default(cuid())
  title                 String
  description           String?    @db.Text
  objectives            String[]
  sector                Sector     @default(IT)
  difficulty            Difficulty @default(BEGINNER)
  estimatedDurationHours Int       @default(4)
  requiredPlan          TenantPlan @default(FREE)
  competencies          String[]
  projectTemplate       Json       // { name, client, sector, description, teamSize, initialBudget, deadlineDays, deliverables[] }
  initialKpis           Json       // { budget: 100, schedule: 100, quality: 80, teamMorale: 75, riskLevel: 20 }
  isPublished           Boolean    @default(false)
  isArchived            Boolean    @default(false)

  createdById           String
  createdBy             User       @relation("ScenariosCreated", fields: [createdById], references: [id])

  phases                ScenarioPhase[]
  simulations           Simulation[]

  createdAt             DateTime   @default(now())
  updatedAt             DateTime   @updatedAt

  @@index([sector, difficulty])
  @@index([isPublished])
  @@map("scenarios")
}

model ScenarioPhase {
  id                 String    @id @default(cuid())
  scenarioId         String
  scenario           Scenario  @relation(fields: [scenarioId], references: [id], onDelete: Cascade)
  order              Int
  name               String
  description        String?   @db.Text
  type               PhaseType
  durationDays       Int       @default(5)
  completionCriteria Json?     // { requiredMeetings: 1, requiredDecisions: 1 }

  meetingTemplates       MeetingTemplate[]
  decisionTemplates      DecisionTemplate[]
  randomEventTemplates   RandomEventTemplate[]

  @@unique([scenarioId, order])
  @@index([scenarioId])
  @@map("scenario_phases")
}

model MeetingTemplate {
  id          String        @id @default(cuid())
  phaseId     String
  phase       ScenarioPhase @relation(fields: [phaseId], references: [id], onDelete: Cascade)
  title       String
  description String?       @db.Text
  type        String        @default("STEERING") // KICKOFF | STANDUP | STEERING | RETROSPECTIVE | CRISIS | CUSTOM
  objectives  String[]
  durationMinutes Int       @default(30)
  participants    Json      // [{ name, role, personality, cooperationLevel }]

  @@index([phaseId])
  @@map("meeting_templates")
}

model DecisionTemplate {
  id             String        @id @default(cuid())
  phaseId        String
  phase          ScenarioPhase @relation(fields: [phaseId], references: [id], onDelete: Cascade)
  title          String
  context        String        @db.Text
  options        Json          // [{ label, description, kpiImpact: { budget, schedule, quality, teamMorale, riskLevel } }]
  optimalOption  Int?          // index de l'option optimale
  timeLimitSeconds Int?        // null = pas de limite

  @@index([phaseId])
  @@map("decision_templates")
}

model RandomEventTemplate {
  id          String          @id @default(cuid())
  phaseId     String
  phase       ScenarioPhase   @relation(fields: [phaseId], references: [id], onDelete: Cascade)
  type        RandomEventType
  title       String
  description String          @db.Text
  severity    Severity        @default(MEDIUM)
  probability Float           @default(0.3) // 0-1
  options     Json            // [{ label, description, kpiImpact }]
  triggerConditions Json?     // { minBudget?, maxQuality?, ... }

  @@index([phaseId])
  @@map("random_event_templates")
}

// ─── INSTANCES (Projets & Simulations) ──────────────────

model Project {
  id             String        @id @default(cuid())
  tenantId       String
  tenant         Tenant        @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  userId         String
  user           User          @relation("UserProjects", fields: [userId], references: [id], onDelete: Cascade)
  name           String
  client         String?
  sector         Sector        @default(IT)
  description    String?       @db.Text
  initialBudget  Float
  currentBudget  Float
  startDate      DateTime      @default(now())
  deadline       DateTime
  status         ProjectStatus @default(NOT_STARTED)

  teamMembers    ProjectTeamMember[]
  deliverables   Deliverable[]
  simulation     Simulation?

  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  @@index([tenantId])
  @@index([userId])
  @@map("projects")
}

model ProjectTeamMember {
  id           String  @id @default(cuid())
  projectId    String
  project      Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  name         String
  role         String  // chef d'equipe, developpeur, designer, QA, etc.
  expertise    String  @default("INTERMEDIATE") // JUNIOR | INTERMEDIATE | SENIOR
  personality  String  @default("COOPERATIVE")  // COOPERATIVE | NEUTRAL | RESISTANT
  availability Float   @default(1.0) // 0-1
  morale       Float   @default(75)  // 0-100
  avatar       String?

  @@index([projectId])
  @@map("project_team_members")
}

model Deliverable {
  id           String           @id @default(cuid())
  projectId    String
  project      Project          @relation(fields: [projectId], references: [id], onDelete: Cascade)
  phaseId      String?
  name         String
  description  String?          @db.Text
  status       DeliverableStatus @default(PENDING)
  qualityScore Float?           // 0-100
  dueDate      DateTime?
  deliveredAt  DateTime?
  dependencies String[]         // IDs d'autres livrables

  @@index([projectId])
  @@map("deliverables")
}

model Simulation {
  id                   String           @id @default(cuid())
  projectId            String           @unique
  project              Project          @relation(fields: [projectId], references: [id], onDelete: Cascade)
  scenarioId           String
  scenario             Scenario         @relation(fields: [scenarioId], references: [id])
  userId               String
  user                 User             @relation("UserSimulations", fields: [userId], references: [id], onDelete: Cascade)
  tenantId             String
  tenant               Tenant           @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  status               SimulationStatus @default(DRAFT)
  currentPhaseOrder    Int              @default(0)
  startedAt            DateTime?
  completedAt          DateTime?
  totalDurationMinutes Int?

  kpis                 SimulationKpi?
  phases               SimulationPhase[]
  decisions            Decision[]
  randomEvents         RandomEvent[]

  createdAt            DateTime         @default(now())
  updatedAt            DateTime         @updatedAt

  @@index([tenantId])
  @@index([userId])
  @@index([status])
  @@map("simulations")
}

model SimulationKpi {
  id           String     @id @default(cuid())
  simulationId String     @unique
  simulation   Simulation @relation(fields: [simulationId], references: [id], onDelete: Cascade)
  budget       Float      @default(100) // % restant
  schedule     Float      @default(100) // % dans les temps
  quality      Float      @default(80)
  teamMorale   Float      @default(75)
  riskLevel    Float      @default(20)  // 0-100
  updatedAt    DateTime   @updatedAt

  @@map("simulation_kpis")
}

model SimulationPhase {
  id           String     @id @default(cuid())
  simulationId String
  simulation   Simulation @relation(fields: [simulationId], references: [id], onDelete: Cascade)
  order        Int
  name         String
  type         PhaseType
  status       String     @default("LOCKED") // LOCKED | ACTIVE | COMPLETED
  startedAt    DateTime?
  completedAt  DateTime?

  @@unique([simulationId, order])
  @@index([simulationId])
  @@map("simulation_phases")
}

model Decision {
  id              String     @id @default(cuid())
  simulationId    String
  simulation      Simulation @relation(fields: [simulationId], references: [id], onDelete: Cascade)
  phaseOrder      Int
  templateId      String?
  title           String
  context         String     @db.Text
  options         Json       // [{ label, description, kpiImpact }]
  selectedOption  Int?
  decidedAt       DateTime?
  kpiImpact       Json?      // impact reel applique
  timeLimitSeconds Int?

  @@index([simulationId])
  @@map("decisions")
}

model RandomEvent {
  id              String          @id @default(cuid())
  simulationId    String
  simulation      Simulation      @relation(fields: [simulationId], references: [id], onDelete: Cascade)
  phaseOrder      Int
  templateId      String?
  type            RandomEventType
  title           String
  description     String          @db.Text
  severity        Severity
  options         Json
  selectedOption  Int?
  resolvedAt      DateTime?
  kpiImpact       Json?

  @@index([simulationId])
  @@map("random_events")
}
```

### 1.3 Relations a ajouter sur les modeles existants

```prisma
// Dans model Tenant, ajouter :
  projects     Project[]
  simulations  Simulation[]

// Dans model User, ajouter :
  projects          Project[]    @relation("UserProjects")
  simulations       Simulation[] @relation("UserSimulations")
  scenariosCreated  Scenario[]   @relation("ScenariosCreated")
```

### 1.4 Commande de migration

```bash
pnpm prisma migrate dev --name add-projects-scenarios-simulations
```

---

## Phase 2 : Event Store — Nouveaux types

**Fichier** : `libs/core/src/event-store/types/event.types.ts`

### 2.1 EventType — ajouter

```typescript
// Project
PROJECT_CREATED = 'project.created',
PROJECT_UPDATED = 'project.updated',

// Scenario
SCENARIO_CREATED = 'scenario.created',
SCENARIO_UPDATED = 'scenario.updated',

// Simulation
SIMULATION_CREATED = 'simulation.created',
SIMULATION_STARTED = 'simulation.started',
SIMULATION_PAUSED = 'simulation.paused',
SIMULATION_RESUMED = 'simulation.resumed',
SIMULATION_PHASE_ADVANCED = 'simulation.phase_advanced',
SIMULATION_COMPLETED = 'simulation.completed',
SIMULATION_ABANDONED = 'simulation.abandoned',

// Decision
DECISION_PRESENTED = 'decision.presented',
DECISION_MADE = 'decision.made',

// Random Event
RANDOM_EVENT_TRIGGERED = 'event.triggered',
RANDOM_EVENT_RESOLVED = 'event.resolved',
```

### 2.2 AggregateType — ajouter

```typescript
PROJECT = 'Project',
SCENARIO = 'Scenario',
SIMULATION = 'Simulation',
DECISION = 'Decision',
RANDOM_EVENT = 'RandomEvent',
```

### 2.3 EVENT_NOTIFICATION_CONFIG — ajouter les entrees

```typescript
[EventType.SIMULATION_CREATED]: {
  notificationType: 'simulation',
  category: 'simulation',
  titleTemplate: 'Simulation demarree',
  bodyTemplate: 'Votre simulation "{{data.title}}" a ete creee.',
  defaultChannels: ['socket'],
  defaultPriority: 1,
},
[EventType.SIMULATION_PHASE_ADVANCED]: {
  notificationType: 'simulation',
  category: 'simulation',
  titleTemplate: 'Nouvelle phase',
  bodyTemplate: 'Phase "{{data.phaseName}}" demarree.',
  defaultChannels: ['socket'],
  defaultPriority: 2,
},
[EventType.DECISION_PRESENTED]: {
  notificationType: 'decision',
  category: 'simulation',
  titleTemplate: 'Decision en attente',
  bodyTemplate: 'Une decision attend votre choix : {{data.title}}',
  defaultChannels: ['socket'],
  defaultPriority: 2,
},
[EventType.RANDOM_EVENT_TRIGGERED]: {
  notificationType: 'event',
  category: 'simulation',
  titleTemplate: 'Alerte projet',
  bodyTemplate: '{{data.title}} — {{data.severity}}',
  defaultChannels: ['socket'],
  defaultPriority: 3,
},
```

### 2.4 Rebuild core

```bash
pnpm --filter @sim360/core build
```

---

## Phase 3 : Backend — Module Simulations

**Emplacement** : `apps/api/src/modules/simulations/`

### 3.1 Structure des fichiers

```
apps/api/src/modules/simulations/
├── simulations.module.ts
├── dto/
│   ├── create-scenario.dto.ts
│   ├── update-scenario.dto.ts
│   ├── create-simulation.dto.ts
│   ├── make-decision.dto.ts
│   └── respond-event.dto.ts
├── services/
│   ├── scenarios.service.ts
│   ├── simulations.service.ts
│   ├── kpi-engine.service.ts        ← calcul des impacts KPI
│   └── simulation-lifecycle.service.ts  ← gestion des phases, conditions
├── controllers/
│   ├── scenarios.controller.ts
│   ├── simulations.controller.ts
│   └── projects.controller.ts
└── guards/
    └── plan.guard.ts                ← verifie le plan du tenant
```

### 3.2 Module

```typescript
// simulations.module.ts
import { Module } from '@nestjs/common';
import { ScenariosController } from './controllers/scenarios.controller';
import { SimulationsController } from './controllers/simulations.controller';
import { ProjectsController } from './controllers/projects.controller';
import { ScenariosService } from './services/scenarios.service';
import { SimulationsService } from './services/simulations.service';
import { KpiEngineService } from './services/kpi-engine.service';
import { SimulationLifecycleService } from './services/simulation-lifecycle.service';

@Module({
  controllers: [ScenariosController, SimulationsController, ProjectsController],
  providers: [ScenariosService, SimulationsService, KpiEngineService, SimulationLifecycleService],
  exports: [ScenariosService, SimulationsService],
})
export class SimulationsModule {}
```

### 3.3 Service : ScenariosService

```typescript
@Injectable()
export class ScenariosService {
  constructor(
    private prisma: PrismaService,
    private eventPublisher: EventPublisherService,
  ) {}

  // Catalogue public — filtres par secteur, difficulte, plan
  async findAll(filters: { sector?, difficulty?, plan? }): Promise<Scenario[]>

  // Detail avec phases et templates
  async findOne(id: string): Promise<Scenario>

  // MANAGER+ : creer un scenario avec ses phases
  async create(userId: string, dto: CreateScenarioDto): Promise<Scenario>

  // MANAGER+ : modifier
  async update(id: string, dto: UpdateScenarioDto): Promise<Scenario>
}
```

### 3.4 Service : SimulationsService

**Methode cle — `create`** (lance une simulation) :

```typescript
async create(userId: string, tenantId: string, dto: CreateSimulationDto) {
  // 1. Verifier le plan du tenant (limite de simulations simultanees)
  // 2. Charger le scenario avec toutes ses phases et templates
  // 3. Creer le Project a partir du projectTemplate du scenario
  //    - Generer les ProjectTeamMember
  //    - Generer les Deliverable
  // 4. Creer la Simulation liee au Project
  //    - Instancier les SimulationPhase (copie des ScenarioPhase)
  //    - Creer les SimulationKpi (valeurs initiales du scenario)
  //    - Instancier les Decision (copie des DecisionTemplate) pour la phase 1
  // 5. Publier l'evenement SIMULATION_CREATED
  // 6. Retourner la simulation avec le projet
  // → Transaction Prisma pour atomicite
}
```

**Autres methodes** :

```typescript
// Liste des simulations de l'utilisateur
async findAll(userId: string, tenantId: string): Promise<Simulation[]>

// Detail avec project, kpis, phase courante, decisions en attente
async findOne(id: string, userId: string): Promise<Simulation>

// Mettre en pause / reprendre
async pause(id: string, userId: string): Promise<Simulation>
async resume(id: string, userId: string): Promise<Simulation>

// Prendre une decision
async makeDecision(simId: string, decisionId: string, dto: MakeDecisionDto): Promise<Decision>
//   1. Verifier que la decision est dans la phase courante et non-decidee
//   2. Appliquer l'impact KPI via KpiEngineService
//   3. Verifier si un evenement aleatoire est declenche
//   4. Publier DECISION_MADE
//   5. Mettre a jour les livrables/equipe si applicable

// Reagir a un evenement aleatoire
async respondToEvent(simId: string, eventId: string, dto: RespondEventDto): Promise<RandomEvent>

// Avancer a la phase suivante
async advancePhase(simId: string, userId: string): Promise<Simulation>
//   1. Verifier les conditions de completion de la phase courante
//   2. Marquer la phase courante COMPLETED
//   3. Deverrouiller la phase suivante (ACTIVE)
//   4. Instancier les decisions/evenements de la nouvelle phase
//   5. Publier SIMULATION_PHASE_ADVANCED
//   6. Si derniere phase completee → SIMULATION_COMPLETED

// KPIs actuels
async getKpis(simId: string): Promise<SimulationKpi>

// Timeline
async getTimeline(simId: string): Promise<TimelineEntry[]>
//   Agrege decisions + events + changements de phase, trie par date
```

### 3.5 Service : KpiEngineService

```typescript
@Injectable()
export class KpiEngineService {
  // Applique un impact KPI (additif, borne a 0-100)
  applyImpact(current: SimulationKpi, impact: KpiImpact): SimulationKpi {
    return {
      budget:     clamp(current.budget + impact.budget, 0, 100),
      schedule:   clamp(current.schedule + impact.schedule, 0, 100),
      quality:    clamp(current.quality + impact.quality, 0, 100),
      teamMorale: clamp(current.teamMorale + impact.teamMorale, 0, 100),
      riskLevel:  clamp(current.riskLevel + impact.riskLevel, 0, 100),
    };
  }

  // Calcule le score final (ponderation)
  calculateFinalScore(kpis: SimulationKpi): number {
    return (kpis.budget * 0.25) + (kpis.schedule * 0.25) +
           (kpis.quality * 0.25) + (kpis.teamMorale * 0.15) +
           ((100 - kpis.riskLevel) * 0.10);
  }

  // Evalue si un evenement aleatoire doit se declencher
  shouldTriggerEvent(template: RandomEventTemplate, kpis: SimulationKpi): boolean
}
```

### 3.6 Controllers

#### ScenariosController

```typescript
@ApiTags('Scenarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('scenarios')
export class ScenariosController {
  @Get()           findAll(@Query() filters)
  @Get(':id')      findOne(@Param('id') id)
  @Post()          @Roles(UserRole.MANAGER, UserRole.ADMIN) create(@Body() dto, @CurrentUser('id') userId)
  @Put(':id')      @Roles(UserRole.MANAGER, UserRole.ADMIN) update(@Param('id') id, @Body() dto)
}
```

#### SimulationsController

```typescript
@ApiTags('Simulations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('simulations')
export class SimulationsController {
  @Post()                                    create(@Body() dto, @CurrentUser('id') userId, @CurrentTenant() tenantId)
  @Get()                                     findAll(@CurrentUser('id') userId, @CurrentTenant() tenantId)
  @Get(':id')                                findOne(@Param('id') id, @CurrentUser('id') userId)
  @Patch(':id/pause')                        pause(@Param('id') id, @CurrentUser('id') userId)
  @Patch(':id/resume')                       resume(@Param('id') id, @CurrentUser('id') userId)
  @Post(':id/advance-phase')                 advancePhase(@Param('id') id, @CurrentUser('id') userId)
  @Post(':id/decisions/:decId/choose')       makeDecision(@Param('id') simId, @Param('decId') decId, @Body() dto)
  @Post(':id/events/:evtId/respond')         respondToEvent(@Param('id') simId, @Param('evtId') evtId, @Body() dto)
  @Get(':id/kpis')                           getKpis(@Param('id') id)
  @Get(':id/timeline')                       getTimeline(@Param('id') id)
}
```

#### ProjectsController

```typescript
@ApiTags('Projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('projects')
export class ProjectsController {
  @Get()                                     findAll(@CurrentUser('id') userId, @CurrentTenant() tenantId)
  @Get(':id')                                findOne(@Param('id') id)
  @Get(':id/team')                           getTeam(@Param('id') id)
  @Get(':id/deliverables')                   getDeliverables(@Param('id') id)
  @Patch(':id/deliverables/:delId')          updateDeliverable(@Param('id') projId, @Param('delId') delId, @Body() dto)
}
```

### 3.7 DTOs

```typescript
// create-simulation.dto.ts
export class CreateSimulationDto {
  @ApiProperty()
  @IsString()
  scenarioId!: string;
}

// make-decision.dto.ts
export class MakeDecisionDto {
  @ApiProperty()
  @IsInt()
  @Min(0)
  selectedOption!: number;
}

// respond-event.dto.ts
export class RespondEventDto {
  @ApiProperty()
  @IsInt()
  @Min(0)
  selectedOption!: number;
}

// create-scenario.dto.ts
export class CreateScenarioDto {
  @ApiProperty()
  @IsString() @MaxLength(200)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  description?: string;

  @ApiProperty()
  @IsEnum(Sector)
  sector!: Sector;

  @ApiProperty()
  @IsEnum(Difficulty)
  difficulty!: Difficulty;

  @ApiProperty()
  @IsObject()
  projectTemplate!: Record<string, unknown>;

  @ApiProperty()
  @IsObject()
  initialKpis!: Record<string, number>;

  @ApiProperty({ type: [Object] })
  @IsArray()
  phases!: CreateScenarioPhaseDto[];
}
```

---

## Phase 4 : Guard de plan

**Fichier** : `apps/api/src/modules/simulations/guards/plan.guard.ts`

```typescript
// Decorateur
@RequiresPlan(TenantPlan.STARTER)  // utilisation sur les routes

// Le guard verifie :
// 1. Le plan du tenant (via PrismaService → tenant.plan)
// 2. Le nombre de simulations actives vs limite du plan
// Limites : FREE=1, STARTER=3, PRO=10, ENTERPRISE=Infinity
```

---

## Phase 5 : Scenario de seed

**Fichier** : `prisma/seed.ts` (ou `prisma/seeds/scenarios.seed.ts`)

Creer **2 scenarios MVP** pour tester :

### Scenario 1 : "Refonte d'un site e-commerce" (BEGINNER)
- 5 phases, 2-3 reunions par phase, 1-2 decisions par phase
- Equipe : Chef de projet, 2 devs, 1 designer, 1 QA
- Budget : 150 000 EUR, Deadline : 6 mois

### Scenario 2 : "Migration cloud d'infrastructure" (INTERMEDIATE)
- 5 phases, 3-4 reunions, 2-3 decisions, 1-2 evenements aleatoires
- Equipe : Architecte, 3 devs, 1 DevOps, 1 DBA
- Budget : 300 000 EUR, Deadline : 9 mois

---

## Phase 6 : Frontend — Implementation des pages

### 6.1 Structure de fichiers

```
apps/webapp/src/features/simulation/
├── api/
│   └── simulation.api.ts          ← appels API (axios/fetch)
├── hooks/
│   ├── use-simulations.ts         ← liste des simulations
│   ├── use-simulation.ts          ← detail d'une simulation
│   ├── use-scenarios.ts           ← catalogue de scenarios
│   ├── use-create-simulation.ts   ← mutation creation
│   └── use-make-decision.ts       ← mutation decision
├── types/
│   └── simulation.types.ts        ← interfaces TS
├── components/
│   ├── scenario-card.tsx           ← carte scenario dans le catalogue
│   ├── simulation-card.tsx         ← carte simulation dans la liste
│   ├── simulation-status-badge.tsx ← badge de statut
│   ├── kpi-gauge.tsx               ← jauge circulaire KPI
│   ├── kpi-panel.tsx               ← panneau 4 jauges + risque
│   ├── phase-progress-bar.tsx      ← barre de progression phases
│   ├── decision-card.tsx           ← interface de choix
│   ├── random-event-card.tsx       ← alerte evenement
│   └── timeline-item.tsx           ← element de timeline
├── config/
│   ├── simulation.menu.ts         ← deja OK
│   └── simulation.routes.tsx      ← ajouter routes project
├── pages/
│   ├── simulations-list.tsx       ← remplacer placeholder
│   ├── create-simulation.tsx      ← catalogue + lancement
│   ├── simulation-detail.tsx      ← dashboard simulation
│   ├── decision-page.tsx          ← page de decision
│   └── timeline-page.tsx          ← historique
└── index.ts
```

### 6.2 Pages a implementer

#### `simulations-list.tsx`
- Grille de `SimulationCard` (statut, scenario, phase courante, KPIs resumes)
- Filtres : statut (en cours / terminees / toutes)
- Bouton "Nouvelle simulation" → `/simulations/new`
- Etat vide avec CTA

#### `create-simulation.tsx`
- Catalogue de `ScenarioCard` avec filtres (secteur, difficulte)
- Fiche scenario en modal ou panel lateral
- Bouton "Lancer" → `POST /api/v1/simulations` → redirect `/simulations/:id`

#### `simulation-detail.tsx` (dashboard simulation)
- En-tete : nom du projet, phase courante, statut
- `KpiPanel` : 4 jauges + indicateur risque
- `PhaseProgressBar` : phases 1-5 avec statut
- Section "Prochaines actions" : decisions en attente, prochaine reunion
- Bouton "Avancer" quand conditions remplies
- Timeline recente (3 derniers evenements)

#### `decision-page.tsx`
- Contexte de la decision
- Options avec description et indices
- Timer si `timeLimitSeconds` defini
- Bouton de confirmation
- Resultat : impact KPI affiche apres le choix

#### `timeline-page.tsx`
- Liste chronologique inversee
- `TimelineItem` avec icone par type (decision, evenement, phase)
- Filtres par type

### 6.3 Routes a ajouter

```tsx
// Dans simulation.routes.tsx, ajouter :
<Route path="/simulations/:id/decisions/:decId" element={<Suspense><DecisionPage /></Suspense>} />
<Route path="/simulations/:id/events/:evtId" element={<Suspense><RandomEventPage /></Suspense>} />
<Route path="/simulations/:id/timeline" element={<Suspense><TimelinePage /></Suspense>} />
```

---

## Phase 7 : Integration AppModule

**Fichier** : `apps/api/src/app.module.ts`

```typescript
import { SimulationsModule } from './modules/simulations/simulations.module';

@Module({
  imports: [
    ConfigModule.forRoot({ ... }),
    ThrottlerModule.forRoot([...]),
    CoreModule,
    AiModule,
    SimulationsModule,  // ← ajouter ici
  ],
})
export class AppModule {}
```

---

## Ordre d'execution

| Etape | Description | Dependances |
|---|---|---|
| **1** | Schema Prisma + migration | — |
| **2** | Event types dans libs/core + rebuild | Etape 1 |
| **3** | `KpiEngineService` (logique pure, testable unitairement) | — |
| **4** | `ScenariosService` + `ScenariosController` + DTOs | Etape 1, 2 |
| **5** | `SimulationsService` + `SimulationsController` + DTOs | Etape 1, 2, 3 |
| **6** | `ProjectsController` | Etape 5 |
| **7** | `SimulationLifecycleService` (phases, conditions) | Etape 3, 5 |
| **8** | `PlanGuard` | Etape 5 |
| **9** | `SimulationsModule` + integration `AppModule` | Etape 4-8 |
| **10** | Seed de scenarios | Etape 9 |
| **11** | Frontend : types + API + hooks | Etape 9 |
| **12** | Frontend : composants + pages | Etape 11 |
| **13** | Tests E2E scenarios + simulations | Etape 12 |

---

## Risques et points d'attention

| Risque | Mitigation |
|---|---|
| Transaction Prisma complexe a la creation | Utiliser `prisma.$transaction()` interactif |
| Performance du calcul KPI en cascade | KPIs stockes en base, calcul incremental (pas de recalcul total) |
| Limite plan non respectee | Guard + verif dans le service (double protection) |
| Scenario mal configure (phases manquantes) | Validation stricte dans `CreateScenarioDto` + integration tests |
| Core rebuild oublie apres modif event types | Ajouter un check dans le script dev |
