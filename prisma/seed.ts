import { PrismaClient, UserRole, TenantPlan, Difficulty, Sector, PhaseType, RandomEventType, Severity, ReferenceDocumentCategory } from '@prisma/client';
import bcryptjs from 'bcryptjs';
import { seedDeliverableTemplates } from './seeds/deliverable-templates';
const { hashSync } = bcryptjs;

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return hashSync(password, 12);
}

async function main() {
  console.log('Seeding database...');

  // ─── Tenant & Users ───────────────────────────────────────

  // Create default tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'sim360-dev' },
    update: {},
    create: {
      name: 'Sim360 Dev',
      slug: 'sim360-dev',
      plan: TenantPlan.ENTERPRISE,
      isActive: true,
    },
  });

  console.log(`Tenant created: ${tenant.name} (${tenant.id})`);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sim360.dev' },
    update: {
      passwordHash: hashPassword('Admin123!'),
      emailVerifiedAt: new Date(),
      profileCompleted: true,
    },
    create: {
      email: 'admin@sim360.dev',
      passwordHash: hashPassword('Admin123!'),
      firstName: 'Admin',
      lastName: 'Sim360',
      role: UserRole.SUPER_ADMIN,
      tenantId: tenant.id,
      isActive: true,
      emailVerifiedAt: new Date(),
      profileCompleted: true,
    },
  });

  console.log(`Admin user created: ${admin.email} (${admin.id})`);

  // Create regular user
  const user = await prisma.user.upsert({
    where: { email: 'user@sim360.dev' },
    update: {
      passwordHash: hashPassword('User123!'),
      emailVerifiedAt: new Date(),
      profileCompleted: true,
    },
    create: {
      email: 'user@sim360.dev',
      passwordHash: hashPassword('User123!'),
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.MEMBER,
      tenantId: tenant.id,
      isActive: true,
      emailVerifiedAt: new Date(),
      profileCompleted: true,
    },
  });

  console.log(`Test user created: ${user.email} (${user.id})`);

  // ─── Scenarios ────────────────────────────────────────────

  console.log('Seeding scenarios...');

  // We need a user to be the creator. Find the first admin or create a system user.
  let systemUser = await prisma.user.findFirst({ where: { role: UserRole.ADMIN } });
  if (!systemUser) {
    systemUser = await prisma.user.findFirst();
  }
  if (!systemUser) {
    console.log('No users found. Please create a user first, then run the seed.');
    return;
  }

  // ─── Scenario 1: Refonte Site E-commerce (BEGINNER) ───

  const scenario1 = await prisma.scenario.upsert({
    where: { id: 'seed-scenario-ecommerce' },
    update: {},
    create: {
      id: 'seed-scenario-ecommerce',
      title: 'Refonte d\'un site e-commerce',
      description: 'Vous etes chef de projet pour la refonte complete d\'un site e-commerce. Le client, une PME de vente en ligne de produits artisanaux, souhaite moderniser son site pour ameliorer l\'experience utilisateur et augmenter ses ventes. Vous disposez d\'une equipe de 5 personnes et d\'un budget de 150 000 EUR.',
      objectives: [
        'Livrer un site e-commerce responsive et performant',
        'Respecter le budget de 150 000 EUR',
        'Livrer dans les delais (6 mois)',
        'Atteindre un score de satisfaction client > 80%',
      ],
      sector: Sector.IT,
      difficulty: Difficulty.BEGINNER,
      estimatedDurationHours: 3,
      requiredPlan: TenantPlan.FREE,
      competencies: ['planification', 'communication', 'gestion-budget', 'leadership'],
      isPublished: true,
      createdById: systemUser.id,
      projectTemplate: {
        name: 'Refonte E-commerce ArtisanShop',
        client: 'ArtisanShop SAS',
        sector: 'IT',
        description: 'Refonte complete du site e-commerce avec nouveau design, systeme de paiement, et back-office ameliore.',
        teamSize: 5,
        initialBudget: 150000,
        deadlineDays: 180,
        team: [
          { name: 'Sophie Martin', role: 'Lead Developpeur', expertise: 'SENIOR', personality: 'COOPERATIVE', morale: 80 },
          { name: 'Thomas Dupont', role: 'Developpeur Frontend', expertise: 'INTERMEDIATE', personality: 'COOPERATIVE', morale: 75 },
          { name: 'Marie Leclerc', role: 'Designer UX/UI', expertise: 'SENIOR', personality: 'NEUTRAL', morale: 85 },
          { name: 'Pierre Moreau', role: 'Developpeur Backend', expertise: 'JUNIOR', personality: 'COOPERATIVE', morale: 70 },
          { name: 'Julie Bernard', role: 'Testeur QA', expertise: 'INTERMEDIATE', personality: 'NEUTRAL', morale: 75 },
        ],
        deliverables: [
          { name: 'Cahier des charges', description: 'Document detaillant les specifications fonctionnelles et techniques', phaseOrder: 0 },
          { name: 'Maquettes UI/UX', description: 'Maquettes validees pour toutes les pages principales', phaseOrder: 1 },
          { name: 'Site en recette', description: 'Version fonctionnelle deployee en environnement de recette', phaseOrder: 2 },
          { name: 'Rapport de tests', description: 'Rapport complet des tests fonctionnels et de performance', phaseOrder: 3 },
          { name: 'Site en production', description: 'Site deploye et accessible aux utilisateurs finaux', phaseOrder: 4 },
        ],
      },
      initialKpis: { budget: 100, schedule: 100, quality: 80, teamMorale: 75, riskLevel: 20 },
    },
  });

  // Phases for Scenario 1
  const s1Phases = [
    {
      order: 0,
      name: 'Cadrage & Lancement',
      type: PhaseType.INITIATION,
      durationDays: 10,
      description: 'Definir le perimetre du projet, identifier les parties prenantes et organiser le kickoff.',
      completionCriteria: { requiredMeetings: 1, requiredDecisions: 1 },
    },
    {
      order: 1,
      name: 'Planification & Design',
      type: PhaseType.PLANNING,
      durationDays: 20,
      description: 'Elaborer le planning detaille, definir l\'architecture technique et valider les maquettes.',
      completionCriteria: { requiredMeetings: 1, requiredDecisions: 2 },
    },
    {
      order: 2,
      name: 'Developpement',
      type: PhaseType.EXECUTION,
      durationDays: 60,
      description: 'Developper les fonctionnalites du site, integrer les maquettes et mettre en place l\'infrastructure.',
      completionCriteria: { requiredMeetings: 2, requiredDecisions: 1 },
    },
    {
      order: 3,
      name: 'Tests & Recette',
      type: PhaseType.MONITORING,
      durationDays: 20,
      description: 'Tester toutes les fonctionnalites, corriger les bugs et valider avec le client.',
      completionCriteria: { requiredMeetings: 1, requiredDecisions: 1 },
    },
    {
      order: 4,
      name: 'Deploiement & Cloture',
      type: PhaseType.CLOSURE,
      durationDays: 10,
      description: 'Deployer en production, former les utilisateurs et faire le bilan du projet.',
      completionCriteria: { requiredMeetings: 1, requiredDecisions: 0 },
    },
  ];

  for (const phaseData of s1Phases) {
    const phase = await prisma.scenarioPhase.upsert({
      where: {
        scenarioId_order: { scenarioId: scenario1.id, order: phaseData.order },
      },
      update: {},
      create: {
        scenarioId: scenario1.id,
        ...phaseData,
      },
    });

    // Phase 0: Kickoff meeting + decision on methodology
    if (phaseData.order === 0) {
      await prisma.meetingTemplate.create({
        data: {
          phaseId: phase.id,
          title: 'Reunion de lancement (Kickoff)',
          description: 'Premiere reunion avec l\'equipe projet et le client pour presenter le projet, les objectifs et le planning previsionnel.',
          type: 'KICKOFF',
          objectives: ['Presenter le projet', 'Definir les roles', 'Valider le perimetre'],
          durationMinutes: 45,
          participants: [
            { name: 'Claire Dubois', role: 'Client - Directrice', personality: 'Exigeante mais juste', cooperationLevel: 4 },
            { name: 'Sophie Martin', role: 'Lead Dev', personality: 'Pragmatique et directe', cooperationLevel: 5 },
            { name: 'Marie Leclerc', role: 'Designer UX', personality: 'Creative et enthousiaste', cooperationLevel: 4 },
          ],
        },
      });

      await prisma.decisionTemplate.create({
        data: {
          phaseId: phase.id,
          title: 'Choix de la methodologie projet',
          context: 'L\'equipe attend que vous definissiez la methodologie de travail. Le client souhaite un suivi regulier mais n\'est pas familier avec les methodes agiles.',
          optimalOption: 1,
          options: [
            {
              label: 'Cycle en V classique',
              description: 'Approche sequentielle avec phases bien definies. Moins de flexibilite mais plus de previsibilite.',
              kpiImpact: { budget: 5, schedule: 5, quality: -5, teamMorale: -10, riskLevel: 10 },
            },
            {
              label: 'Scrum adapte',
              description: 'Sprints de 2 semaines avec demos regulieres au client. Formation rapide du client necessaire.',
              kpiImpact: { budget: -3, schedule: 0, quality: 10, teamMorale: 10, riskLevel: -5 },
            },
            {
              label: 'Kanban',
              description: 'Flux continu avec tableau visuel. Tres flexible mais necessite une equipe autonome.',
              kpiImpact: { budget: 0, schedule: -5, quality: 5, teamMorale: 5, riskLevel: 5 },
            },
          ],
        },
      });
    }

    // Phase 1: Planning meeting + 2 decisions
    if (phaseData.order === 1) {
      await prisma.meetingTemplate.create({
        data: {
          phaseId: phase.id,
          title: 'Atelier de planification',
          description: 'Seance de travail pour definir le planning detaille, estimer les charges et repartir les taches.',
          type: 'STEERING',
          objectives: ['Definir le WBS', 'Estimer les charges', 'Identifier les risques'],
          durationMinutes: 60,
          participants: [
            { name: 'Sophie Martin', role: 'Lead Dev', personality: 'Pragmatique, pousse pour des estimations realistes', cooperationLevel: 5 },
            { name: 'Thomas Dupont', role: 'Dev Frontend', personality: 'Optimiste sur les delais', cooperationLevel: 4 },
            { name: 'Pierre Moreau', role: 'Dev Backend', personality: 'Prudent, pose beaucoup de questions techniques', cooperationLevel: 3 },
          ],
        },
      });

      await prisma.decisionTemplate.createMany({
        data: [
          {
            phaseId: phase.id,
            title: 'Choix de la stack technique',
            context: 'L\'equipe technique propose deux approches pour la stack frontend. Le site actuel est en PHP/jQuery.',
            optimalOption: 0,
            options: [
              {
                label: 'React + Next.js',
                description: 'Stack moderne, performante. L\'equipe a de l\'experience. Migration complete necessaire.',
                kpiImpact: { budget: -5, schedule: -5, quality: 15, teamMorale: 10, riskLevel: -5 },
              },
              {
                label: 'PHP/Laravel + Livewire',
                description: 'Proche de l\'existant, migration plus douce. Moins performant mais plus rapide a deployer.',
                kpiImpact: { budget: 5, schedule: 10, quality: 0, teamMorale: -5, riskLevel: -10 },
              },
              {
                label: 'WordPress + WooCommerce',
                description: 'Solution cle en main, rapide a mettre en place mais limitee en personnalisation.',
                kpiImpact: { budget: 15, schedule: 15, quality: -15, teamMorale: -15, riskLevel: 5 },
              },
            ],
          },
          {
            phaseId: phase.id,
            title: 'Gestion de la sous-traitance design',
            context: 'Marie (designer) signale qu\'elle ne pourra pas gerer seule toutes les maquettes dans les delais. Elle propose de sous-traiter une partie.',
            optimalOption: 1,
            options: [
              {
                label: 'Tout garder en interne',
                description: 'Marie fait tout, mais avec un risque de retard sur le design.',
                kpiImpact: { budget: 5, schedule: -10, quality: 5, teamMorale: -10, riskLevel: 10 },
              },
              {
                label: 'Sous-traiter les pages secondaires',
                description: 'Marie garde les pages cles, un freelance fait les pages secondaires. Budget supplementaire de 8 000 EUR.',
                kpiImpact: { budget: -5, schedule: 5, quality: 0, teamMorale: 5, riskLevel: 0 },
              },
            ],
          },
        ],
      });
    }

    // Phase 2: Standup + steering + 1 decision + random event
    if (phaseData.order === 2) {
      await prisma.meetingTemplate.createMany({
        data: [
          {
            phaseId: phase.id,
            title: 'Daily Standup - Semaine 3',
            description: 'Point quotidien sur l\'avancement du sprint en cours.',
            type: 'STANDUP',
            objectives: ['Partager les avancees', 'Identifier les blocages'],
            durationMinutes: 15,
            participants: JSON.parse(JSON.stringify([
              { name: 'Sophie Martin', role: 'Lead Dev', personality: 'Directe et efficace', cooperationLevel: 5 },
              { name: 'Thomas Dupont', role: 'Dev Frontend', personality: 'Enthousiaste mais parfois imprecis', cooperationLevel: 4 },
              { name: 'Pierre Moreau', role: 'Dev Backend', personality: 'Technique, remonte les problemes', cooperationLevel: 4 },
            ])),
          },
          {
            phaseId: phase.id,
            title: 'Comite de pilotage mi-projet',
            description: 'Revue d\'avancement avec le client et presentation de la version beta.',
            type: 'STEERING',
            objectives: ['Presenter l\'avancement', 'Recueillir le feedback client', 'Ajuster si necessaire'],
            durationMinutes: 60,
            participants: JSON.parse(JSON.stringify([
              { name: 'Claire Dubois', role: 'Client - Directrice', personality: 'Veut voir du concret', cooperationLevel: 3 },
              { name: 'Marc Petit', role: 'Client - Responsable technique', personality: 'Pointilleux sur les details', cooperationLevel: 4 },
              { name: 'Sophie Martin', role: 'Lead Dev', personality: 'Presente avec assurance', cooperationLevel: 5 },
            ])),
          },
        ],
      });

      await prisma.decisionTemplate.create({
        data: {
          phaseId: phase.id,
          title: 'Gestion du scope creep',
          context: 'Le client demande l\'ajout d\'un module de chat en direct qui n\'etait pas prevu. Cela represente environ 3 semaines de travail supplementaire.',
          optimalOption: 1,
          timeLimitSeconds: 120,
          options: [
            {
              label: 'Accepter sans negocier',
              description: 'Integrer la demande pour satisfaire le client, en absorbant le surcout.',
              kpiImpact: { budget: -15, schedule: -15, quality: -5, teamMorale: -10, riskLevel: 15 },
            },
            {
              label: 'Negocier un avenant',
              description: 'Accepter avec un budget supplementaire de 20 000 EUR et un delai etendu de 2 semaines.',
              kpiImpact: { budget: -5, schedule: -5, quality: 5, teamMorale: 0, riskLevel: 5 },
            },
            {
              label: 'Refuser poliment',
              description: 'Proposer de l\'integrer dans une V2, apres la mise en production.',
              kpiImpact: { budget: 0, schedule: 0, quality: 0, teamMorale: 5, riskLevel: -5 },
            },
          ],
        },
      });

      await prisma.randomEventTemplate.create({
        data: {
          phaseId: phase.id,
          type: RandomEventType.RISK,
          title: 'Depart d\'un developpeur',
          description: 'Pierre Moreau, developpeur backend junior, annonce sa demission pour rejoindre une autre entreprise. Son preavis est d\'un mois.',
          severity: Severity.HIGH,
          probability: 0.6,
          options: [
            {
              label: 'Recruter un remplacant en urgence',
              description: 'Lancer un recrutement express. Cout supplementaire et temps d\'integration.',
              kpiImpact: { budget: -10, schedule: -5, quality: 0, teamMorale: -5, riskLevel: 5 },
            },
            {
              label: 'Repartir la charge sur l\'equipe',
              description: 'Sophie et Thomas absorbent le travail backend. Risque de surcharge.',
              kpiImpact: { budget: 0, schedule: -10, quality: -5, teamMorale: -15, riskLevel: 10 },
            },
            {
              label: 'Faire appel a un freelance',
              description: 'Engager un freelance senior pour 2 mois. Plus cher mais plus rapide.',
              kpiImpact: { budget: -15, schedule: 0, quality: 5, teamMorale: 0, riskLevel: 0 },
            },
          ],
          triggerConditions: {},
        },
      });
    }

    // Phase 3: QA review meeting + decision
    if (phaseData.order === 3) {
      await prisma.meetingTemplate.create({
        data: {
          phaseId: phase.id,
          title: 'Revue qualite et recette client',
          description: 'Presentation de la version recette au client pour validation avant mise en production.',
          type: 'STEERING',
          objectives: ['Valider les fonctionnalites', 'Lister les corrections', 'Obtenir le GO production'],
          durationMinutes: 60,
          participants: JSON.parse(JSON.stringify([
            { name: 'Claire Dubois', role: 'Client - Directrice', personality: 'Satisfaite si le rendu est bon', cooperationLevel: 4 },
            { name: 'Julie Bernard', role: 'QA', personality: 'Rigoureuse, presente les resultats de test', cooperationLevel: 5 },
            { name: 'Sophie Martin', role: 'Lead Dev', personality: 'Confiante sur la qualite', cooperationLevel: 5 },
          ])),
        },
      });

      await prisma.decisionTemplate.create({
        data: {
          phaseId: phase.id,
          title: 'Strategie de deploiement',
          context: 'Le site est pret pour la production. Vous devez choisir la strategie de deploiement.',
          optimalOption: 1,
          options: [
            {
              label: 'Big bang - tout en une fois',
              description: 'Couper l\'ancien site et basculer sur le nouveau en une nuit. Simple mais risque.',
              kpiImpact: { budget: 5, schedule: 5, quality: -10, teamMorale: -5, riskLevel: 15 },
            },
            {
              label: 'Deploiement progressif (blue/green)',
              description: 'Migration progressive avec possibilite de rollback. Plus complexe mais plus sur.',
              kpiImpact: { budget: -5, schedule: -3, quality: 10, teamMorale: 5, riskLevel: -10 },
            },
          ],
        },
      });

      await prisma.randomEventTemplate.create({
        data: {
          phaseId: phase.id,
          type: RandomEventType.CONSTRAINT,
          title: 'Faille de securite detectee',
          description: 'L\'audit de securite revele une vulnerabilite XSS sur le formulaire de paiement. La mise en production est bloquee tant que ce n\'est pas corrige.',
          severity: Severity.CRITICAL,
          probability: 0.4,
          options: [
            {
              label: 'Correction immediate (sprint dedie)',
              description: 'Mobiliser Sophie et Thomas pendant 3 jours pour corriger. Retard sur la production.',
              kpiImpact: { budget: -3, schedule: -5, quality: 15, teamMorale: -5, riskLevel: -20 },
            },
            {
              label: 'Patch rapide + audit complet post-production',
              description: 'Fix rapide de la faille specifique, audit complet programme apres le lancement.',
              kpiImpact: { budget: -2, schedule: 0, quality: 5, teamMorale: 0, riskLevel: 5 },
            },
          ],
          triggerConditions: {},
        },
      });
    }

    // Phase 4: Retrospective
    if (phaseData.order === 4) {
      await prisma.meetingTemplate.create({
        data: {
          phaseId: phase.id,
          title: 'Retrospective projet',
          description: 'Bilan du projet avec l\'equipe : ce qui a bien fonctionne, ce qui peut etre ameliore, lecons apprises.',
          type: 'RETROSPECTIVE',
          objectives: ['Faire le bilan', 'Identifier les lecons apprises', 'Celebrer les succes'],
          durationMinutes: 45,
          participants: JSON.parse(JSON.stringify([
            { name: 'Sophie Martin', role: 'Lead Dev', personality: 'Constructive et bienveillante', cooperationLevel: 5 },
            { name: 'Thomas Dupont', role: 'Dev Frontend', personality: 'Content du travail accompli', cooperationLevel: 5 },
            { name: 'Marie Leclerc', role: 'Designer UX', personality: 'Fiere du resultat visuel', cooperationLevel: 5 },
            { name: 'Julie Bernard', role: 'QA', personality: 'Satisfaite de la qualite finale', cooperationLevel: 5 },
          ])),
        },
      });
    }
  }

  // ─── Scenario 2: Migration Cloud (INTERMEDIATE) ───

  const scenario2 = await prisma.scenario.upsert({
    where: { id: 'seed-scenario-cloud-migration' },
    update: {},
    create: {
      id: 'seed-scenario-cloud-migration',
      title: 'Migration infrastructure vers le Cloud',
      description: 'Vous pilotez la migration de l\'infrastructure on-premise d\'une entreprise de services financiers vers AWS. Le projet implique la migration de 15 applications critiques, la mise en place de la securite cloud et la formation des equipes. Enjeu : zero downtime sur les services critiques.',
      objectives: [
        'Migrer 15 applications vers AWS sans interruption de service',
        'Respecter les normes de securite financiere (PCI-DSS)',
        'Former les equipes DevOps a la gestion cloud',
        'Reduire les couts d\'infrastructure de 30%',
      ],
      sector: Sector.FINANCE,
      difficulty: Difficulty.INTERMEDIATE,
      estimatedDurationHours: 5,
      requiredPlan: TenantPlan.STARTER,
      competencies: ['gestion-risques', 'communication', 'planification', 'leadership', 'gestion-parties-prenantes'],
      isPublished: true,
      createdById: systemUser.id,
      projectTemplate: {
        name: 'Migration Cloud FinanceSecure',
        client: 'FinanceSecure SA',
        sector: 'FINANCE',
        description: 'Migration de l\'infrastructure on-premise vers AWS avec contraintes de securite PCI-DSS et zero downtime.',
        teamSize: 6,
        initialBudget: 300000,
        deadlineDays: 270,
        team: [
          { name: 'Alexandre Roux', role: 'Architecte Cloud', expertise: 'SENIOR', personality: 'COOPERATIVE', morale: 85 },
          { name: 'Camille Petit', role: 'DevOps Engineer', expertise: 'INTERMEDIATE', personality: 'COOPERATIVE', morale: 75 },
          { name: 'Lucas Bernard', role: 'Developpeur Backend', expertise: 'SENIOR', personality: 'NEUTRAL', morale: 80 },
          { name: 'Emma Garcia', role: 'Developpeur Backend', expertise: 'INTERMEDIATE', personality: 'COOPERATIVE', morale: 70 },
          { name: 'Hugo Leroy', role: 'DBA', expertise: 'SENIOR', personality: 'RESISTANT', morale: 60 },
          { name: 'Lea Dubois', role: 'Ingenieure Securite', expertise: 'SENIOR', personality: 'NEUTRAL', morale: 80 },
        ],
        deliverables: [
          { name: 'Audit infrastructure existante', phaseOrder: 0 },
          { name: 'Plan de migration detaille', phaseOrder: 1 },
          { name: 'Environnement AWS configure', phaseOrder: 2 },
          { name: 'Applications migrees (lot 1)', phaseOrder: 2 },
          { name: 'Applications migrees (lot 2)', phaseOrder: 2 },
          { name: 'Rapport de conformite PCI-DSS', phaseOrder: 3 },
          { name: 'Documentation et formation', phaseOrder: 4 },
        ],
      },
      initialKpis: { budget: 100, schedule: 100, quality: 75, teamMorale: 70, riskLevel: 35 },
    },
  });

  // Phases for Scenario 2
  const s2Phases = [
    {
      order: 0,
      name: 'Audit & Cadrage',
      type: PhaseType.INITIATION,
      durationDays: 15,
      description: 'Auditer l\'infrastructure existante, identifier les dependances et definir la strategie de migration.',
      completionCriteria: { requiredMeetings: 1, requiredDecisions: 2 },
    },
    {
      order: 1,
      name: 'Architecture & Planning',
      type: PhaseType.PLANNING,
      durationDays: 25,
      description: 'Concevoir l\'architecture cible AWS, planifier les lots de migration et preparer les environnements.',
      completionCriteria: { requiredMeetings: 1, requiredDecisions: 1 },
    },
    {
      order: 2,
      name: 'Migration & Implementation',
      type: PhaseType.EXECUTION,
      durationDays: 90,
      description: 'Migrer les applications par lots, configurer les services AWS et tester chaque migration.',
      completionCriteria: { requiredMeetings: 2, requiredDecisions: 2 },
    },
    {
      order: 3,
      name: 'Securite & Conformite',
      type: PhaseType.MONITORING,
      durationDays: 30,
      description: 'Audit de securite, mise en conformite PCI-DSS, tests de penetration et monitoring.',
      completionCriteria: { requiredMeetings: 1, requiredDecisions: 1 },
    },
    {
      order: 4,
      name: 'Formation & Cloture',
      type: PhaseType.CLOSURE,
      durationDays: 15,
      description: 'Former les equipes, documenter les procedures et decommissionner l\'ancien infrastructure.',
      completionCriteria: { requiredMeetings: 1, requiredDecisions: 1 },
    },
  ];

  for (const phaseData of s2Phases) {
    const phase = await prisma.scenarioPhase.upsert({
      where: {
        scenarioId_order: { scenarioId: scenario2.id, order: phaseData.order },
      },
      update: {},
      create: {
        scenarioId: scenario2.id,
        ...phaseData,
      },
    });

    if (phaseData.order === 0) {
      await prisma.meetingTemplate.create({
        data: {
          phaseId: phase.id,
          title: 'Kickoff projet migration',
          description: 'Presentation du projet aux parties prenantes cles : direction, equipe IT, RSSI.',
          type: 'KICKOFF',
          objectives: ['Presenter la strategie', 'Obtenir le sponsorship', 'Identifier les risques'],
          durationMinutes: 60,
          participants: JSON.parse(JSON.stringify([
            { name: 'Philippe Moreau', role: 'DSI', personality: 'Strategique, veut des resultats rapides', cooperationLevel: 3 },
            { name: 'Alexandre Roux', role: 'Architecte Cloud', personality: 'Expert technique, confiant', cooperationLevel: 5 },
            { name: 'Hugo Leroy', role: 'DBA', personality: 'Sceptique sur la migration des bases', cooperationLevel: 2 },
            { name: 'Lea Dubois', role: 'Securite', personality: 'Vigilante sur la conformite', cooperationLevel: 4 },
          ])),
        },
      });

      await prisma.decisionTemplate.createMany({
        data: [
          {
            phaseId: phase.id,
            title: 'Strategie de migration',
            context: 'Vous devez definir l\'approche globale de migration. L\'architecte recommande le "lift and shift" pour aller vite, le DBA prefere le "re-platforming".',
            optimalOption: 1,
            options: [
              {
                label: 'Lift & Shift (rehosting)',
                description: 'Deplacement tel quel vers le cloud. Rapide mais n\'optimise pas pour le cloud.',
                kpiImpact: { budget: 5, schedule: 10, quality: -10, teamMorale: 5, riskLevel: 5 },
              },
              {
                label: 'Re-platforming progressif',
                description: 'Adaptation des apps pour tirer parti du cloud. Plus long mais meilleur ROI.',
                kpiImpact: { budget: -5, schedule: -5, quality: 10, teamMorale: 0, riskLevel: -5 },
              },
              {
                label: 'Re-architecting complet',
                description: 'Refonte en microservices cloud-native. Optimal mais tres couteux et long.',
                kpiImpact: { budget: -20, schedule: -20, quality: 20, teamMorale: -10, riskLevel: 15 },
              },
            ],
          },
          {
            phaseId: phase.id,
            title: 'Gestion de la resistance au changement',
            context: 'Hugo (DBA) exprime ouvertement son opposition a la migration. Il craint pour son poste et refuse de cooperer pleinement. D\'autres membres commencent a douter.',
            optimalOption: 0,
            options: [
              {
                label: 'Entretien individuel et reassurance',
                description: 'Prendre le temps d\'ecouter ses craintes, le rassurer sur son role et le former au cloud.',
                kpiImpact: { budget: -2, schedule: -3, quality: 5, teamMorale: 15, riskLevel: -10 },
              },
              {
                label: 'Imposer la decision',
                description: 'Rappeler que la decision est prise et qu\'il doit s\'y conformer.',
                kpiImpact: { budget: 0, schedule: 5, quality: 0, teamMorale: -20, riskLevel: 10 },
              },
              {
                label: 'Le remplacer',
                description: 'Demander un autre DBA plus cooperatif. Risque de perte de connaissance.',
                kpiImpact: { budget: -10, schedule: -15, quality: -5, teamMorale: -10, riskLevel: 20 },
              },
            ],
          },
        ],
      });
    }

    if (phaseData.order === 1) {
      await prisma.meetingTemplate.create({
        data: {
          phaseId: phase.id,
          title: 'Revue d\'architecture cible',
          description: 'Presentation de l\'architecture AWS cible avec review par l\'equipe securite.',
          type: 'STEERING',
          objectives: ['Valider l\'architecture', 'Verifier la conformite securite', 'Planifier les lots'],
          durationMinutes: 90,
          participants: JSON.parse(JSON.stringify([
            { name: 'Alexandre Roux', role: 'Architecte Cloud', personality: 'Presente avec passion', cooperationLevel: 5 },
            { name: 'Lea Dubois', role: 'Securite', personality: 'Challenge chaque choix', cooperationLevel: 4 },
            { name: 'Hugo Leroy', role: 'DBA', personality: 'Plus cooperatif apres les echanges', cooperationLevel: 3 },
            { name: 'Camille Petit', role: 'DevOps', personality: 'Pragmatique, pose les bonnes questions', cooperationLevel: 5 },
          ])),
        },
      });

      await prisma.decisionTemplate.create({
        data: {
          phaseId: phase.id,
          title: 'Choix du provider de base de donnees',
          context: 'Pour les bases de donnees critiques (transactions financieres), il faut choisir entre Amazon RDS, Aurora et une base auto-geree sur EC2.',
          optimalOption: 1,
          options: [
            {
              label: 'Amazon RDS',
              description: 'Service manage standard. Bon rapport qualite/prix, facile a maintenir.',
              kpiImpact: { budget: 0, schedule: 5, quality: 5, teamMorale: 5, riskLevel: -5 },
            },
            {
              label: 'Amazon Aurora',
              description: 'Performance superieure, haute disponibilite native. Plus cher mais ideal pour la finance.',
              kpiImpact: { budget: -8, schedule: 0, quality: 15, teamMorale: 5, riskLevel: -15 },
            },
            {
              label: 'PostgreSQL auto-gere sur EC2',
              description: 'Controle total mais maintenance lourde. Hugo le prefere.',
              kpiImpact: { budget: 5, schedule: -10, quality: 0, teamMorale: -5, riskLevel: 15 },
            },
          ],
        },
      });
    }

    if (phaseData.order === 2) {
      await prisma.meetingTemplate.createMany({
        data: [
          {
            phaseId: phase.id,
            title: 'Point d\'avancement migration lot 1',
            description: 'Revue de la migration des 5 premieres applications (lot 1).',
            type: 'STANDUP',
            objectives: ['Status migration', 'Problemes rencontres', 'Plan lot 2'],
            durationMinutes: 30,
            participants: JSON.parse(JSON.stringify([
              { name: 'Alexandre Roux', role: 'Architecte', cooperationLevel: 5 },
              { name: 'Camille Petit', role: 'DevOps', cooperationLevel: 5 },
              { name: 'Lucas Bernard', role: 'Dev Backend', cooperationLevel: 4 },
            ])),
          },
          {
            phaseId: phase.id,
            title: 'Comite de pilotage mi-parcours',
            description: 'Presentation de l\'avancement global a la direction.',
            type: 'STEERING',
            objectives: ['Presenter l\'avancement', 'Gerer les attentes', 'Obtenir les validations'],
            durationMinutes: 60,
            participants: JSON.parse(JSON.stringify([
              { name: 'Philippe Moreau', role: 'DSI', personality: 'Impatient, veut des chiffres', cooperationLevel: 3 },
              { name: 'Alexandre Roux', role: 'Architecte', cooperationLevel: 5 },
              { name: 'Lea Dubois', role: 'Securite', cooperationLevel: 4 },
            ])),
          },
        ],
      });

      await prisma.decisionTemplate.createMany({
        data: [
          {
            phaseId: phase.id,
            title: 'Incident en production pendant la migration',
            context: 'Pendant la migration du lot 2, un incident majeur survient sur l\'application de trading. Les transactions sont ralenties de 40%. La direction panique.',
            optimalOption: 0,
            timeLimitSeconds: 90,
            options: [
              {
                label: 'Rollback immediat + analyse',
                description: 'Revenir a l\'infrastructure precedente, analyser le probleme et reprendre plus tard.',
                kpiImpact: { budget: -5, schedule: -10, quality: 5, teamMorale: -5, riskLevel: -10 },
              },
              {
                label: 'Correction a chaud',
                description: 'Tenter de corriger en production. Risque eleve mais evite le rollback.',
                kpiImpact: { budget: 0, schedule: 0, quality: -10, teamMorale: -10, riskLevel: 20 },
              },
            ],
          },
          {
            phaseId: phase.id,
            title: 'Budget supplementaire necessaire',
            context: 'Les couts AWS sont 25% plus eleves que prevu a cause d\'une mauvaise estimation du dimensionnement. Il faut soit optimiser soit demander du budget.',
            optimalOption: 2,
            options: [
              {
                label: 'Demander un budget supplementaire',
                description: 'Presenter la situation a la direction et demander 50 000 EUR supplementaires.',
                kpiImpact: { budget: -15, schedule: 0, quality: 0, teamMorale: 0, riskLevel: 0 },
              },
              {
                label: 'Reduire le perimetre',
                description: 'Reporter 3 applications non-critiques a une phase 2 ulterieure.',
                kpiImpact: { budget: 5, schedule: 5, quality: -10, teamMorale: -5, riskLevel: 5 },
              },
              {
                label: 'Optimiser le dimensionnement',
                description: 'Prendre 1 semaine pour optimiser les instances et utiliser des Reserved Instances.',
                kpiImpact: { budget: 5, schedule: -5, quality: 5, teamMorale: 5, riskLevel: -5 },
              },
            ],
          },
        ],
      });

      await prisma.randomEventTemplate.create({
        data: {
          phaseId: phase.id,
          type: RandomEventType.STAKEHOLDER,
          title: 'Changement de direction',
          description: 'Le DSI Philippe Moreau annonce son depart. Son remplacant, plus conservateur, remet en question la strategie cloud-first et demande une justification complete du projet.',
          severity: Severity.HIGH,
          probability: 0.4,
          options: [
            {
              label: 'Preparer une presentation ROI detaillee',
              description: 'Investir du temps pour convaincre le nouveau DSI avec des chiffres.',
              kpiImpact: { budget: -2, schedule: -5, quality: 0, teamMorale: -5, riskLevel: 5 },
            },
            {
              label: 'S\'appuyer sur le sponsor executif',
              description: 'Faire intervenir le DG qui a valide le projet initialement.',
              kpiImpact: { budget: 0, schedule: -2, quality: 0, teamMorale: 0, riskLevel: -5 },
            },
          ],
          triggerConditions: {},
        },
      });
    }

    if (phaseData.order === 3) {
      await prisma.meetingTemplate.create({
        data: {
          phaseId: phase.id,
          title: 'Audit de securite PCI-DSS',
          description: 'Revue avec l\'auditeur externe pour valider la conformite de l\'infrastructure cloud.',
          type: 'STEERING',
          objectives: ['Presenter les mesures de securite', 'Repondre aux questions de l\'auditeur', 'Identifier les gaps'],
          durationMinutes: 90,
          participants: JSON.parse(JSON.stringify([
            { name: 'Lea Dubois', role: 'Securite', personality: 'Bien preparee, confiante', cooperationLevel: 5 },
            { name: 'Jean Auditeur', role: 'Auditeur externe PCI-DSS', personality: 'Methodique et exigeant', cooperationLevel: 3 },
            { name: 'Alexandre Roux', role: 'Architecte', personality: 'Repond aux questions techniques', cooperationLevel: 5 },
          ])),
        },
      });

      await prisma.decisionTemplate.create({
        data: {
          phaseId: phase.id,
          title: 'Non-conformite detectee',
          context: 'L\'audit revele que les logs d\'acces ne sont pas conserves assez longtemps (90 jours au lieu de 365 requis). La correction necessite un changement d\'architecture du logging.',
          optimalOption: 0,
          options: [
            {
              label: 'Corriger avant la certification',
              description: 'Mettre en place S3 Glacier pour l\'archivage long terme. 1 semaine de travail.',
              kpiImpact: { budget: -5, schedule: -5, quality: 15, teamMorale: 0, riskLevel: -15 },
            },
            {
              label: 'Demander une derogation temporaire',
              description: 'Negocier un plan de remediation avec l\'auditeur. Risque reputationnel.',
              kpiImpact: { budget: 0, schedule: 0, quality: -5, teamMorale: 5, riskLevel: 10 },
            },
          ],
        },
      });
    }

    if (phaseData.order === 4) {
      await prisma.meetingTemplate.create({
        data: {
          phaseId: phase.id,
          title: 'Retrospective et bilan final',
          description: 'Bilan du projet avec l\'ensemble de l\'equipe et presentation des resultats a la direction.',
          type: 'RETROSPECTIVE',
          objectives: ['Bilan technique', 'Lecons apprises', 'Plan de maintenance'],
          durationMinutes: 60,
          participants: JSON.parse(JSON.stringify([
            { name: 'Alexandre Roux', role: 'Architecte', cooperationLevel: 5 },
            { name: 'Camille Petit', role: 'DevOps', cooperationLevel: 5 },
            { name: 'Hugo Leroy', role: 'DBA', personality: 'Finalement convaincu par le cloud', cooperationLevel: 4 },
            { name: 'Lea Dubois', role: 'Securite', cooperationLevel: 5 },
            { name: 'Lucas Bernard', role: 'Dev Backend', cooperationLevel: 4 },
            { name: 'Emma Garcia', role: 'Dev Backend', cooperationLevel: 4 },
          ])),
        },
      });

      await prisma.decisionTemplate.create({
        data: {
          phaseId: phase.id,
          title: 'Plan de decommissionnement',
          context: 'Il est temps de decommissionner l\'ancienne infrastructure on-premise. Le bail du datacenter se termine dans 3 mois.',
          optimalOption: 0,
          options: [
            {
              label: 'Decommissionnement progressif (2 mois)',
              description: 'Eteindre serveur par serveur apres verification que tout fonctionne en cloud.',
              kpiImpact: { budget: -3, schedule: 0, quality: 5, teamMorale: 5, riskLevel: -10 },
            },
            {
              label: 'Decommissionnement rapide (2 semaines)',
              description: 'Tout couper rapidement pour economiser les couts de datacenter.',
              kpiImpact: { budget: 5, schedule: 5, quality: -5, teamMorale: -5, riskLevel: 10 },
            },
          ],
        },
      });
    }
  }

  console.log(`Seeded: ${scenario1.title}`);
  console.log(`Seeded: ${scenario2.title}`);

  // ─── Manager / Recruiter user ─────────────────────────────

  const recruiter = await prisma.user.upsert({
    where: { email: 'recruiter@sim360.dev' },
    update: {
      passwordHash: hashPassword('Recruiter123!'),
      emailVerifiedAt: new Date(),
      profileCompleted: true,
    },
    create: {
      email: 'recruiter@sim360.dev',
      passwordHash: hashPassword('Recruiter123!'),
      firstName: 'Sophie',
      lastName: 'Recruteur',
      role: UserRole.MANAGER,
      tenantId: tenant.id,
      isActive: true,
      emailVerifiedAt: new Date(),
      profileCompleted: true,
    },
  });

  console.log(`Recruiter user created: ${recruiter.email}`);

  // ─── Deliverable Templates (EPIC 1 — enriched with PM Kit) ─

  await seedDeliverableTemplates(prisma, tenant.id, admin.id);

  // ─── Reference Documents (EPIC 1) ─────────────────────────

  const refDocs = [
    { id: 'seed-refdoc-pmbok', title: 'Guide PMBOK 7eme edition', category: ReferenceDocumentCategory.STANDARD, content: '# Guide PMBOK\n\nLe Project Management Body of Knowledge (PMBOK) est le standard de reference publie par le PMI pour la gestion de projet.\n\n## Principes cles\n\n1. Stewardship\n2. Team\n3. Stakeholders\n4. Value\n5. Systems Thinking\n6. Leadership\n7. Tailoring\n8. Quality\n9. Complexity\n10. Risk\n11. Adaptability and Resiliency\n12. Change' },
    { id: 'seed-refdoc-glossary', title: 'Glossaire PMI', category: ReferenceDocumentCategory.GLOSSARY, content: '# Glossaire PMI\n\n**WBS** (Work Breakdown Structure) : Decomposition hierarchique du perimetre total du travail.\n\n**RACI** : Matrice d\'attribution des responsabilites (Responsible, Accountable, Consulted, Informed).\n\n**Chemin critique** : Sequence d\'activites determinant la duree minimale du projet.\n\n**Earned Value** : Methode de mesure de la performance du projet.' },
    { id: 'seed-refdoc-bestpractice', title: 'Bonnes pratiques de gestion des risques', category: ReferenceDocumentCategory.BEST_PRACTICE, content: '# Gestion des risques\n\n## Processus\n\n1. Identification\n2. Analyse qualitative\n3. Analyse quantitative\n4. Planification des reponses\n5. Mise en oeuvre\n6. Surveillance' },
  ];

  for (const doc of refDocs) {
    await prisma.referenceDocument.upsert({
      where: { id: doc.id },
      update: {},
      create: {
        id: doc.id,
        tenantId: tenant.id,
        createdById: admin.id,
        title: doc.title,
        category: doc.category,
        content: doc.content,
        isActive: true,
        version: 1,
      },
    });
  }

  console.log(`Seeded: ${refDocs.length} reference documents`);

  // ─── Recruitment Campaign (EPIC 8) ────────────────────────

  await prisma.recruitmentCampaign.upsert({
    where: { slug: 'chef-projet-digital-2026' },
    update: {},
    create: {
      title: 'Chef de Projet Digital Senior',
      slug: 'chef-projet-digital-2026',
      status: 'DRAFT',
      jobTitle: 'Chef de Projet Digital Senior',
      jobDescription: 'Nous recherchons un chef de projet digital senior pour piloter des projets de transformation numerique. Vous serez responsable de la gestion de bout en bout de projets web et mobile avec des equipes de 5 a 10 personnes.',
      requiredSkills: [
        { skill: 'Planification', weight: 9 },
        { skill: 'Communication', weight: 8 },
        { skill: 'Gestion des risques', weight: 7 },
        { skill: 'Leadership', weight: 8 },
        { skill: 'Methodologies agiles', weight: 6 },
      ],
      experienceLevel: 'senior',
      projectTypes: ['web', 'mobile', 'e-commerce'],
      culture: 'AGILE',
      cultureDescription: 'Environnement agile avec des sprints de 2 semaines, standups quotidiens et retrospectives regulieres.',
      maxCandidates: 50,
      recruiterId: recruiter.id,
      tenantId: tenant.id,
    },
  });

  console.log('Seeded: 1 recruitment campaign (draft)');

  // ─── AI Token Quota ───────────────────────────────────────

  await prisma.aiTokenQuota.upsert({
    where: { tenantId: tenant.id },
    update: {},
    create: {
      tenantId: tenant.id,
      monthlyInputLimit: 2000000,
      monthlyOutputLimit: 1000000,
    },
  });

  console.log('Seeded: AI token quota');

  console.log('\nSeeding complete!');
  console.log('─────────────────────────────────────────');
  console.log('Accounts:');
  console.log('  Admin:     admin@sim360.dev / Admin123!');
  console.log('  User:      user@sim360.dev / User123!');
  console.log('  Recruiter: recruiter@sim360.dev / Recruiter123!');
  console.log('─────────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
