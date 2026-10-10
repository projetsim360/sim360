import { PrismaClient, UserRole, TenantPlan, Difficulty, Sector, PhaseType, RandomEventType, Severity, ReferenceDocumentCategory, ScenarioType } from '@prisma/client';
import bcryptjs from 'bcryptjs';
import { seedDeliverableTemplates } from './seeds/deliverable-templates';
import { seedSectorScenarios } from './seeds/scenarios/sector-scenarios';
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

  // Seed-owned content: refreshed on every reseed (update) and used on first insert (create).
  // Clean existing phases (cascade removes their templates) so a re-seed refreshes content without duplicating templates
  await prisma.scenarioPhase.deleteMany({ where: { scenarioId: 'seed-scenario-ecommerce' } });

  const scenario1Content = {
    title: 'Refonte d\'un site e-commerce',
    description: 'Vous êtes chef de projet pour la refonte complète d\'un site e-commerce. Le client, une PME de vente en ligne de produits artisanaux, souhaite moderniser son site pour améliorer l\'expérience utilisateur et augmenter ses ventes. Vous disposez d\'une équipe de 5 personnes et d\'un budget de 150 000 EUR.',
    objectives: [
      'Livrer un site e-commerce responsive et performant',
      'Respecter le budget de 150 000 EUR',
      'Livrer dans les délais (6 mois)',
      'Atteindre un score de satisfaction client > 80%',
    ],
    sector: Sector.IT,
    difficulty: Difficulty.BEGINNER,
    estimatedDurationHours: 3,
    requiredPlan: TenantPlan.FREE,
    competencies: ['planification', 'communication', 'gestion-budget', 'leadership'],
    isPublished: true,
    projectTemplate: {
      name: 'Refonte E-commerce ArtisanShop',
      client: 'ArtisanShop SAS',
      sector: 'IT',
      description: 'Refonte complète du site e-commerce avec nouveau design, système de paiement, et back-office amélioré.',
      teamSize: 5,
      initialBudget: 150000,
      deadlineDays: 180,
      team: [
        { name: 'Sophie Martin', role: 'Lead Développeur', expertise: 'SENIOR', personality: 'COOPERATIVE', morale: 80 },
        { name: 'Thomas Dupont', role: 'Développeur Frontend', expertise: 'INTERMEDIATE', personality: 'COOPERATIVE', morale: 75 },
        { name: 'Marie Leclerc', role: 'Designer UX/UI', expertise: 'SENIOR', personality: 'NEUTRAL', morale: 85 },
        { name: 'Pierre Moreau', role: 'Développeur Backend', expertise: 'JUNIOR', personality: 'COOPERATIVE', morale: 70 },
        { name: 'Julie Bernard', role: 'Testeur QA', expertise: 'INTERMEDIATE', personality: 'NEUTRAL', morale: 75 },
      ],
      deliverables: [
        { name: 'Cahier des charges', description: 'Document détaillant les spécifications fonctionnelles et techniques', phaseOrder: 0 },
        { name: 'Maquettes UI/UX', description: 'Maquettes validées pour toutes les pages principales', phaseOrder: 1 },
        { name: 'Site en recette', description: 'Version fonctionnelle déployée en environnement de recette', phaseOrder: 2 },
        { name: 'Rapport de tests', description: 'Rapport complet des tests fonctionnels et de performance', phaseOrder: 3 },
        { name: 'Site en production', description: 'Site déployé et accessible aux utilisateurs finaux', phaseOrder: 4 },
      ],
    },
    initialKpis: { budget: 100, schedule: 100, quality: 80, teamMorale: 75, riskLevel: 20 },
  };

  const scenario1 = await prisma.scenario.upsert({
    where: { id: 'seed-scenario-ecommerce' },
    update: scenario1Content,
    create: {
      id: 'seed-scenario-ecommerce',
      createdById: systemUser.id,
      ...scenario1Content,
    },
  });

  // Phases for Scenario 1
  const s1Phases = [
    {
      order: 0,
      name: 'Cadrage & Lancement',
      type: PhaseType.INITIATION,
      durationDays: 10,
      description: 'Définir le périmètre du projet, identifier les parties prenantes et organiser le kickoff.',
      completionCriteria: { requiredMeetings: 1, requiredDecisions: 1 },
    },
    {
      order: 1,
      name: 'Planification & Design',
      type: PhaseType.PLANNING,
      durationDays: 20,
      description: 'Élaborer le planning détaillé, définir l\'architecture technique et valider les maquettes.',
      completionCriteria: { requiredMeetings: 1, requiredDecisions: 2 },
    },
    {
      order: 2,
      name: 'Développement',
      type: PhaseType.EXECUTION,
      durationDays: 60,
      description: 'Développer les fonctionnalités du site, intégrer les maquettes et mettre en place l\'infrastructure.',
      completionCriteria: { requiredMeetings: 2, requiredDecisions: 1 },
    },
    {
      order: 3,
      name: 'Tests & Recette',
      type: PhaseType.MONITORING,
      durationDays: 20,
      description: 'Tester toutes les fonctionnalités, corriger les bugs et valider avec le client.',
      completionCriteria: { requiredMeetings: 1, requiredDecisions: 1 },
    },
    {
      order: 4,
      name: 'Déploiement & Clôture',
      type: PhaseType.CLOSURE,
      durationDays: 10,
      description: 'Déployer en production, former les utilisateurs et faire le bilan du projet.',
      completionCriteria: { requiredMeetings: 1, requiredDecisions: 0 },
    },
  ];

  for (const phaseData of s1Phases) {
    const phase = await prisma.scenarioPhase.upsert({
      where: {
        scenarioId_order: { scenarioId: scenario1.id, order: phaseData.order },
      },
      update: { ...phaseData },
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
          title: 'Réunion de lancement (Kickoff)',
          description: 'Première réunion avec l\'équipe projet et le client pour présenter le projet, les objectifs et le planning prévisionnel.',
          type: 'KICKOFF',
          objectives: ['Présenter le projet', 'Définir les rôles', 'Valider le périmètre'],
          durationMinutes: 45,
          participants: [
            { name: 'Claire Dubois', role: 'Client - Directrice', personality: 'Exigeante mais juste', cooperationLevel: 4 },
            { name: 'Sophie Martin', role: 'Lead Dev', personality: 'Pragmatique et directe', cooperationLevel: 5 },
            { name: 'Marie Leclerc', role: 'Designer UX', personality: 'Créative et enthousiaste', cooperationLevel: 4 },
          ],
        },
      });

      await prisma.decisionTemplate.create({
        data: {
          phaseId: phase.id,
          title: 'Choix de la méthodologie projet',
          context: 'L\'équipe attend que vous définissiez la méthodologie de travail. Le client souhaite un suivi régulier mais n\'est pas familier avec les méthodes agiles.',
          optimalOption: 1,
          options: [
            {
              label: 'Cycle en V classique',
              description: 'Approche séquentielle avec phases bien définies. Moins de flexibilité mais plus de prévisibilité.',
              kpiImpact: { budget: 5, schedule: 5, quality: -5, teamMorale: -10, riskLevel: 10 },
            },
            {
              label: 'Scrum adapté',
              description: 'Sprints de 2 semaines avec démos régulières au client. Formation rapide du client nécessaire.',
              kpiImpact: { budget: -3, schedule: 0, quality: 10, teamMorale: 10, riskLevel: -5 },
            },
            {
              label: 'Kanban',
              description: 'Flux continu avec tableau visuel. Très flexible mais nécessite une équipe autonome.',
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
          description: 'Séance de travail pour définir le planning détaillé, estimer les charges et répartir les tâches.',
          type: 'STEERING',
          objectives: ['Définir le WBS', 'Estimer les charges', 'Identifier les risques'],
          durationMinutes: 60,
          participants: [
            { name: 'Sophie Martin', role: 'Lead Dev', personality: 'Pragmatique, pousse pour des estimations réalistes', cooperationLevel: 5 },
            { name: 'Thomas Dupont', role: 'Dev Frontend', personality: 'Optimiste sur les délais', cooperationLevel: 4 },
            { name: 'Pierre Moreau', role: 'Dev Backend', personality: 'Prudent, pose beaucoup de questions techniques', cooperationLevel: 3 },
          ],
        },
      });

      await prisma.decisionTemplate.createMany({
        data: [
          {
            phaseId: phase.id,
            title: 'Choix de la stack technique',
            context: 'L\'équipe technique propose deux approches pour la stack frontend. Le site actuel est en PHP/jQuery.',
            optimalOption: 0,
            options: [
              {
                label: 'React + Next.js',
                description: 'Stack moderne, performante. L\'équipe a de l\'expérience. Migration complète nécessaire.',
                kpiImpact: { budget: -5, schedule: -5, quality: 15, teamMorale: 10, riskLevel: -5 },
              },
              {
                label: 'PHP/Laravel + Livewire',
                description: 'Proche de l\'existant, migration plus douce. Moins performant mais plus rapide à déployer.',
                kpiImpact: { budget: 5, schedule: 10, quality: 0, teamMorale: -5, riskLevel: -10 },
              },
              {
                label: 'WordPress + WooCommerce',
                description: 'Solution clé en main, rapide à mettre en place mais limitée en personnalisation.',
                kpiImpact: { budget: 15, schedule: 15, quality: -15, teamMorale: -15, riskLevel: 5 },
              },
            ],
          },
          {
            phaseId: phase.id,
            title: 'Gestion de la sous-traitance design',
            context: 'Marie (designer) signale qu\'elle ne pourra pas gérer seule toutes les maquettes dans les délais. Elle propose de sous-traiter une partie.',
            optimalOption: 1,
            options: [
              {
                label: 'Tout garder en interne',
                description: 'Marie fait tout, mais avec un risque de retard sur le design.',
                kpiImpact: { budget: 5, schedule: -10, quality: 5, teamMorale: -10, riskLevel: 10 },
              },
              {
                label: 'Sous-traiter les pages secondaires',
                description: 'Marie garde les pages clés, un freelance fait les pages secondaires. Budget supplémentaire de 8 000 EUR.',
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
            objectives: ['Partager les avancées', 'Identifier les blocages'],
            durationMinutes: 15,
            participants: JSON.parse(JSON.stringify([
              { name: 'Sophie Martin', role: 'Lead Dev', personality: 'Directe et efficace', cooperationLevel: 5 },
              { name: 'Thomas Dupont', role: 'Dev Frontend', personality: 'Enthousiaste mais parfois imprécis', cooperationLevel: 4 },
              { name: 'Pierre Moreau', role: 'Dev Backend', personality: 'Technique, remonte les problèmes', cooperationLevel: 4 },
            ])),
          },
          {
            phaseId: phase.id,
            title: 'Comité de pilotage mi-projet',
            description: 'Revue d\'avancement avec le client et présentation de la version beta.',
            type: 'STEERING',
            objectives: ['Présenter l\'avancement', 'Recueillir le feedback client', 'Ajuster si nécessaire'],
            durationMinutes: 60,
            participants: JSON.parse(JSON.stringify([
              { name: 'Claire Dubois', role: 'Client - Directrice', personality: 'Veut voir du concret', cooperationLevel: 3 },
              { name: 'Marc Petit', role: 'Client - Responsable technique', personality: 'Pointilleux sur les détails', cooperationLevel: 4 },
              { name: 'Sophie Martin', role: 'Lead Dev', personality: 'Présente avec assurance', cooperationLevel: 5 },
            ])),
          },
        ],
      });

      await prisma.decisionTemplate.create({
        data: {
          phaseId: phase.id,
          title: 'Gestion du scope creep',
          context: 'Le client demande l\'ajout d\'un module de chat en direct qui n\'était pas prévu. Cela représente environ 3 semaines de travail supplémentaire.',
          optimalOption: 1,
          timeLimitSeconds: 120,
          options: [
            {
              label: 'Accepter sans négocier',
              description: 'Intégrer la demande pour satisfaire le client, en absorbant le surcoût.',
              kpiImpact: { budget: -15, schedule: -15, quality: -5, teamMorale: -10, riskLevel: 15 },
            },
            {
              label: 'Négocier un avenant',
              description: 'Accepter avec un budget supplémentaire de 20 000 EUR et un délai étendu de 2 semaines.',
              kpiImpact: { budget: -5, schedule: -5, quality: 5, teamMorale: 0, riskLevel: 5 },
            },
            {
              label: 'Refuser poliment',
              description: 'Proposer de l\'intégrer dans une V2, après la mise en production.',
              kpiImpact: { budget: 0, schedule: 0, quality: 0, teamMorale: 5, riskLevel: -5 },
            },
          ],
        },
      });

      await prisma.randomEventTemplate.create({
        data: {
          phaseId: phase.id,
          type: RandomEventType.RISK,
          title: 'Départ d\'un développeur',
          description: 'Pierre Moreau, développeur backend junior, annonce sa démission pour rejoindre une autre entreprise. Son préavis est d\'un mois.',
          severity: Severity.HIGH,
          probability: 0.6,
          options: [
            {
              label: 'Recruter un remplaçant en urgence',
              description: 'Lancer un recrutement express. Coût supplémentaire et temps d\'intégration.',
              kpiImpact: { budget: -10, schedule: -5, quality: 0, teamMorale: -5, riskLevel: 5 },
            },
            {
              label: 'Répartir la charge sur l\'équipe',
              description: 'Sophie et Thomas absorbent le travail backend. Risque de surcharge.',
              kpiImpact: { budget: 0, schedule: -10, quality: -5, teamMorale: -15, riskLevel: 10 },
            },
            {
              label: 'Faire appel à un freelance',
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
          title: 'Revue qualité et recette client',
          description: 'Présentation de la version recette au client pour validation avant mise en production.',
          type: 'STEERING',
          objectives: ['Valider les fonctionnalités', 'Lister les corrections', 'Obtenir le GO production'],
          durationMinutes: 60,
          participants: JSON.parse(JSON.stringify([
            { name: 'Claire Dubois', role: 'Client - Directrice', personality: 'Satisfaite si le rendu est bon', cooperationLevel: 4 },
            { name: 'Julie Bernard', role: 'QA', personality: 'Rigoureuse, présente les résultats de test', cooperationLevel: 5 },
            { name: 'Sophie Martin', role: 'Lead Dev', personality: 'Confiante sur la qualité', cooperationLevel: 5 },
          ])),
        },
      });

      await prisma.decisionTemplate.create({
        data: {
          phaseId: phase.id,
          title: 'Stratégie de déploiement',
          context: 'Le site est prêt pour la production. Vous devez choisir la stratégie de déploiement.',
          optimalOption: 1,
          options: [
            {
              label: 'Big bang - tout en une fois',
              description: 'Couper l\'ancien site et basculer sur le nouveau en une nuit. Simple mais risque.',
              kpiImpact: { budget: 5, schedule: 5, quality: -10, teamMorale: -5, riskLevel: 15 },
            },
            {
              label: 'Déploiement progressif (blue/green)',
              description: 'Migration progressive avec possibilité de rollback. Plus complexe mais plus sûr.',
              kpiImpact: { budget: -5, schedule: -3, quality: 10, teamMorale: 5, riskLevel: -10 },
            },
          ],
        },
      });

      await prisma.randomEventTemplate.create({
        data: {
          phaseId: phase.id,
          type: RandomEventType.CONSTRAINT,
          title: 'Faille de sécurité détectée',
          description: 'L\'audit de sécurité révèle une vulnérabilité XSS sur le formulaire de paiement. La mise en production est bloquée tant que ce n\'est pas corrigé.',
          severity: Severity.CRITICAL,
          probability: 0.4,
          options: [
            {
              label: 'Correction immédiate (sprint dédié)',
              description: 'Mobiliser Sophie et Thomas pendant 3 jours pour corriger. Retard sur la production.',
              kpiImpact: { budget: -3, schedule: -5, quality: 15, teamMorale: -5, riskLevel: -20 },
            },
            {
              label: 'Patch rapide + audit complet post-production',
              description: 'Fix rapide de la faille spécifique, audit complet programmé après le lancement.',
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
          description: 'Bilan du projet avec l\'équipe : ce qui a bien fonctionné, ce qui peut être amélioré, leçons apprises.',
          type: 'RETROSPECTIVE',
          objectives: ['Faire le bilan', 'Identifier les leçons apprises', 'Célébrer les succès'],
          durationMinutes: 45,
          participants: JSON.parse(JSON.stringify([
            { name: 'Sophie Martin', role: 'Lead Dev', personality: 'Constructive et bienveillante', cooperationLevel: 5 },
            { name: 'Thomas Dupont', role: 'Dev Frontend', personality: 'Content du travail accompli', cooperationLevel: 5 },
            { name: 'Marie Leclerc', role: 'Designer UX', personality: 'Fière du résultat visuel', cooperationLevel: 5 },
            { name: 'Julie Bernard', role: 'QA', personality: 'Satisfaite de la qualité finale', cooperationLevel: 5 },
          ])),
        },
      });
    }
  }

  // ─── Scenario 2: Migration Cloud (INTERMEDIATE) ───

  // Seed-owned content: refreshed on every reseed (update) and used on first insert (create).
  // Clean existing phases (cascade removes their templates) so a re-seed refreshes content without duplicating templates
  await prisma.scenarioPhase.deleteMany({ where: { scenarioId: 'seed-scenario-cloud-migration' } });

  const scenario2Content = {
    title: 'Migration infrastructure vers le Cloud',
    description: 'Vous pilotez la migration de l\'infrastructure on-premise d\'une entreprise de services financiers vers AWS. Le projet implique la migration de 15 applications critiques, la mise en place de la sécurité cloud et la formation des équipes. Enjeu : zéro downtime sur les services critiques.',
    objectives: [
      'Migrer 15 applications vers AWS sans interruption de service',
      'Respecter les normes de sécurité financière (PCI-DSS)',
      'Former les équipes DevOps à la gestion cloud',
      'Réduire les coûts d\'infrastructure de 30%',
    ],
    sector: Sector.FINANCE,
    difficulty: Difficulty.INTERMEDIATE,
    estimatedDurationHours: 5,
    requiredPlan: TenantPlan.STARTER,
    competencies: ['gestion-risques', 'communication', 'planification', 'leadership', 'gestion-parties-prenantes'],
    isPublished: true,
    projectTemplate: {
      name: 'Migration Cloud FinanceSecure',
      client: 'FinanceSecure SA',
      sector: 'FINANCE',
      description: 'Migration de l\'infrastructure on-premise vers AWS avec contraintes de sécurité PCI-DSS et zéro downtime.',
      teamSize: 6,
      initialBudget: 300000,
      deadlineDays: 270,
      team: [
        { name: 'Alexandre Roux', role: 'Architecte Cloud', expertise: 'SENIOR', personality: 'COOPERATIVE', morale: 85 },
        { name: 'Camille Petit', role: 'DevOps Engineer', expertise: 'INTERMEDIATE', personality: 'COOPERATIVE', morale: 75 },
        { name: 'Lucas Bernard', role: 'Développeur Backend', expertise: 'SENIOR', personality: 'NEUTRAL', morale: 80 },
        { name: 'Emma Garcia', role: 'Développeur Backend', expertise: 'INTERMEDIATE', personality: 'COOPERATIVE', morale: 70 },
        { name: 'Hugo Leroy', role: 'DBA', expertise: 'SENIOR', personality: 'RESISTANT', morale: 60 },
        { name: 'Léa Dubois', role: 'Ingénieure Sécurité', expertise: 'SENIOR', personality: 'NEUTRAL', morale: 80 },
      ],
      deliverables: [
        { name: 'Audit infrastructure existante', phaseOrder: 0 },
        { name: 'Plan de migration détaillé', phaseOrder: 1 },
        { name: 'Environnement AWS configuré', phaseOrder: 2 },
        { name: 'Applications migrées (lot 1)', phaseOrder: 2 },
        { name: 'Applications migrées (lot 2)', phaseOrder: 2 },
        { name: 'Rapport de conformité PCI-DSS', phaseOrder: 3 },
        { name: 'Documentation et formation', phaseOrder: 4 },
      ],
    },
    initialKpis: { budget: 100, schedule: 100, quality: 75, teamMorale: 70, riskLevel: 35 },
  };

  const scenario2 = await prisma.scenario.upsert({
    where: { id: 'seed-scenario-cloud-migration' },
    update: scenario2Content,
    create: {
      id: 'seed-scenario-cloud-migration',
      createdById: systemUser.id,
      ...scenario2Content,
    },
  });

  // Phases for Scenario 2
  const s2Phases = [
    {
      order: 0,
      name: 'Audit & Cadrage',
      type: PhaseType.INITIATION,
      durationDays: 15,
      description: 'Auditer l\'infrastructure existante, identifier les dépendances et définir la stratégie de migration.',
      completionCriteria: { requiredMeetings: 1, requiredDecisions: 2 },
    },
    {
      order: 1,
      name: 'Architecture & Planning',
      type: PhaseType.PLANNING,
      durationDays: 25,
      description: 'Concevoir l\'architecture cible AWS, planifier les lots de migration et préparer les environnements.',
      completionCriteria: { requiredMeetings: 1, requiredDecisions: 1 },
    },
    {
      order: 2,
      name: 'Migration & Implémentation',
      type: PhaseType.EXECUTION,
      durationDays: 90,
      description: 'Migrer les applications par lots, configurer les services AWS et tester chaque migration.',
      completionCriteria: { requiredMeetings: 2, requiredDecisions: 2 },
    },
    {
      order: 3,
      name: 'Sécurité & Conformité',
      type: PhaseType.MONITORING,
      durationDays: 30,
      description: 'Audit de sécurité, mise en conformité PCI-DSS, tests de pénétration et monitoring.',
      completionCriteria: { requiredMeetings: 1, requiredDecisions: 1 },
    },
    {
      order: 4,
      name: 'Formation & Clôture',
      type: PhaseType.CLOSURE,
      durationDays: 15,
      description: 'Former les équipes, documenter les procédures et décommissionner l\'ancien infrastructure.',
      completionCriteria: { requiredMeetings: 1, requiredDecisions: 1 },
    },
  ];

  for (const phaseData of s2Phases) {
    const phase = await prisma.scenarioPhase.upsert({
      where: {
        scenarioId_order: { scenarioId: scenario2.id, order: phaseData.order },
      },
      update: { ...phaseData },
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
          description: 'Présentation du projet aux parties prenantes clés : direction, équipe IT, RSSI.',
          type: 'KICKOFF',
          objectives: ['Présenter la stratégie', 'Obtenir le sponsorship', 'Identifier les risques'],
          durationMinutes: 60,
          participants: JSON.parse(JSON.stringify([
            { name: 'Philippe Moreau', role: 'DSI', personality: 'Stratégique, veut des résultats rapides', cooperationLevel: 3 },
            { name: 'Alexandre Roux', role: 'Architecte Cloud', personality: 'Expert technique, confiant', cooperationLevel: 5 },
            { name: 'Hugo Leroy', role: 'DBA', personality: 'Sceptique sur la migration des bases', cooperationLevel: 2 },
            { name: 'Léa Dubois', role: 'Sécurité', personality: 'Vigilante sur la conformité', cooperationLevel: 4 },
          ])),
        },
      });

      await prisma.decisionTemplate.createMany({
        data: [
          {
            phaseId: phase.id,
            title: 'Stratégie de migration',
            context: 'Vous devez définir l\'approche globale de migration. L\'architecte recommande le "lift and shift" pour aller vite, le DBA préfère le "re-platforming".',
            optimalOption: 1,
            options: [
              {
                label: 'Lift & Shift (rehosting)',
                description: 'Déplacement tel quel vers le cloud. Rapide mais n\'optimise pas pour le cloud.',
                kpiImpact: { budget: 5, schedule: 10, quality: -10, teamMorale: 5, riskLevel: 5 },
              },
              {
                label: 'Re-platforming progressif',
                description: 'Adaptation des apps pour tirer parti du cloud. Plus long mais meilleur ROI.',
                kpiImpact: { budget: -5, schedule: -5, quality: 10, teamMorale: 0, riskLevel: -5 },
              },
              {
                label: 'Re-architecting complet',
                description: 'Refonte en microservices cloud-native. Optimal mais très coûteux et long.',
                kpiImpact: { budget: -20, schedule: -20, quality: 20, teamMorale: -10, riskLevel: 15 },
              },
            ],
          },
          {
            phaseId: phase.id,
            title: 'Gestion de la résistance au changement',
            context: 'Hugo (DBA) exprime ouvertement son opposition à la migration. Il craint pour son poste et refuse de coopérer pleinement. D\'autres membres commencent à douter.',
            optimalOption: 0,
            options: [
              {
                label: 'Entretien individuel et réassurance',
                description: 'Prendre le temps d\'écouter ses craintes, le rassurer sur son rôle et le former au cloud.',
                kpiImpact: { budget: -2, schedule: -3, quality: 5, teamMorale: 15, riskLevel: -10 },
              },
              {
                label: 'Imposer la décision',
                description: 'Rappeler que la décision est prise et qu\'il doit s\'y conformer.',
                kpiImpact: { budget: 0, schedule: 5, quality: 0, teamMorale: -20, riskLevel: 10 },
              },
              {
                label: 'Le remplacer',
                description: 'Demander un autre DBA plus coopératif. Risque de perte de connaissance.',
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
          description: 'Présentation de l\'architecture AWS cible avec review par l\'équipe sécurité.',
          type: 'STEERING',
          objectives: ['Valider l\'architecture', 'Vérifier la conformité sécurité', 'Planifier les lots'],
          durationMinutes: 90,
          participants: JSON.parse(JSON.stringify([
            { name: 'Alexandre Roux', role: 'Architecte Cloud', personality: 'Présente avec passion', cooperationLevel: 5 },
            { name: 'Léa Dubois', role: 'Sécurité', personality: 'Challenge chaque choix', cooperationLevel: 4 },
            { name: 'Hugo Leroy', role: 'DBA', personality: 'Plus coopératif après les échanges', cooperationLevel: 3 },
            { name: 'Camille Petit', role: 'DevOps', personality: 'Pragmatique, pose les bonnes questions', cooperationLevel: 5 },
          ])),
        },
      });

      await prisma.decisionTemplate.create({
        data: {
          phaseId: phase.id,
          title: 'Choix du provider de base de données',
          context: 'Pour les bases de données critiques (transactions financières), il faut choisir entre Amazon RDS, Aurora et une base auto-gérée sur EC2.',
          optimalOption: 1,
          options: [
            {
              label: 'Amazon RDS',
              description: 'Service managé standard. Bon rapport qualité/prix, facile à maintenir.',
              kpiImpact: { budget: 0, schedule: 5, quality: 5, teamMorale: 5, riskLevel: -5 },
            },
            {
              label: 'Amazon Aurora',
              description: 'Performance supérieure, haute disponibilité native. Plus cher mais idéal pour la finance.',
              kpiImpact: { budget: -8, schedule: 0, quality: 15, teamMorale: 5, riskLevel: -15 },
            },
            {
              label: 'PostgreSQL auto-gere sur EC2',
              description: 'Contrôle total mais maintenance lourde. Hugo le préfère.',
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
            description: 'Revue de la migration des 5 premières applications (lot 1).',
            type: 'STANDUP',
            objectives: ['Statut migration', 'Problèmes rencontrés', 'Plan lot 2'],
            durationMinutes: 30,
            participants: JSON.parse(JSON.stringify([
              { name: 'Alexandre Roux', role: 'Architecte', cooperationLevel: 5 },
              { name: 'Camille Petit', role: 'DevOps', cooperationLevel: 5 },
              { name: 'Lucas Bernard', role: 'Dev Backend', cooperationLevel: 4 },
            ])),
          },
          {
            phaseId: phase.id,
            title: 'Comité de pilotage mi-parcours',
            description: 'Présentation de l\'avancement global à la direction.',
            type: 'STEERING',
            objectives: ['Présenter l\'avancement', 'Gérer les attentes', 'Obtenir les validations'],
            durationMinutes: 60,
            participants: JSON.parse(JSON.stringify([
              { name: 'Philippe Moreau', role: 'DSI', personality: 'Impatient, veut des chiffres', cooperationLevel: 3 },
              { name: 'Alexandre Roux', role: 'Architecte', cooperationLevel: 5 },
              { name: 'Léa Dubois', role: 'Sécurité', cooperationLevel: 4 },
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
                label: 'Rollback immédiat + analyse',
                description: 'Revenir à l\'infrastructure précédente, analyser le problème et reprendre plus tard.',
                kpiImpact: { budget: -5, schedule: -10, quality: 5, teamMorale: -5, riskLevel: -10 },
              },
              {
                label: 'Correction a chaud',
                description: 'Tenter de corriger en production. Risque élevé mais évite le rollback.',
                kpiImpact: { budget: 0, schedule: 0, quality: -10, teamMorale: -10, riskLevel: 20 },
              },
            ],
          },
          {
            phaseId: phase.id,
            title: 'Budget supplémentaire nécessaire',
            context: 'Les coûts AWS sont 25% plus élevés que prévu à cause d\'une mauvaise estimation du dimensionnement. Il faut soit optimiser soit demander du budget.',
            optimalOption: 2,
            options: [
              {
                label: 'Demander un budget supplémentaire',
                description: 'Présenter la situation à la direction et demander 50 000 EUR supplémentaires.',
                kpiImpact: { budget: -15, schedule: 0, quality: 0, teamMorale: 0, riskLevel: 0 },
              },
              {
                label: 'Réduire le périmètre',
                description: 'Reporter 3 applications non-critiques à une phase 2 ultérieure.',
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
          description: 'Le DSI Philippe Moreau annonce son départ. Son remplaçant, plus conservateur, remet en question la stratégie cloud-first et demande une justification complète du projet.',
          severity: Severity.HIGH,
          probability: 0.4,
          options: [
            {
              label: 'Préparer une présentation ROI détaillée',
              description: 'Investir du temps pour convaincre le nouveau DSI avec des chiffres.',
              kpiImpact: { budget: -2, schedule: -5, quality: 0, teamMorale: -5, riskLevel: 5 },
            },
            {
              label: 'S\'appuyer sur le sponsor exécutif',
              description: 'Faire intervenir le DG qui a validé le projet initialement.',
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
          title: 'Audit de sécurité PCI-DSS',
          description: 'Revue avec l\'auditeur externe pour valider la conformité de l\'infrastructure cloud.',
          type: 'STEERING',
          objectives: ['Présenter les mesures de sécurité', 'Répondre aux questions de l\'auditeur', 'Identifier les gaps'],
          durationMinutes: 90,
          participants: JSON.parse(JSON.stringify([
            { name: 'Léa Dubois', role: 'Sécurité', personality: 'Bien préparée, confiante', cooperationLevel: 5 },
            { name: 'Jean Auditeur', role: 'Auditeur externe PCI-DSS', personality: 'Méthodique et exigeant', cooperationLevel: 3 },
            { name: 'Alexandre Roux', role: 'Architecte', personality: 'Répond aux questions techniques', cooperationLevel: 5 },
          ])),
        },
      });

      await prisma.decisionTemplate.create({
        data: {
          phaseId: phase.id,
          title: 'Non-conformité détectée',
          context: 'L\'audit révèle que les logs d\'accès ne sont pas conservés assez longtemps (90 jours au lieu de 365 requis). La correction nécessite un changement d\'architecture du logging.',
          optimalOption: 0,
          options: [
            {
              label: 'Corriger avant la certification',
              description: 'Mettre en place S3 Glacier pour l\'archivage long terme. 1 semaine de travail.',
              kpiImpact: { budget: -5, schedule: -5, quality: 15, teamMorale: 0, riskLevel: -15 },
            },
            {
              label: 'Demander une dérogation temporaire',
              description: 'Négocier un plan de remédiation avec l\'auditeur. Risque réputationnel.',
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
          description: 'Bilan du projet avec l\'ensemble de l\'équipe et présentation des résultats à la direction.',
          type: 'RETROSPECTIVE',
          objectives: ['Bilan technique', 'Leçons apprises', 'Plan de maintenance'],
          durationMinutes: 60,
          participants: JSON.parse(JSON.stringify([
            { name: 'Alexandre Roux', role: 'Architecte', cooperationLevel: 5 },
            { name: 'Camille Petit', role: 'DevOps', cooperationLevel: 5 },
            { name: 'Hugo Leroy', role: 'DBA', personality: 'Finalement convaincu par le cloud', cooperationLevel: 4 },
            { name: 'Léa Dubois', role: 'Sécurité', cooperationLevel: 5 },
            { name: 'Lucas Bernard', role: 'Dev Backend', cooperationLevel: 4 },
            { name: 'Emma Garcia', role: 'Dev Backend', cooperationLevel: 4 },
          ])),
        },
      });

      await prisma.decisionTemplate.create({
        data: {
          phaseId: phase.id,
          title: 'Plan de décommissionnement',
          context: 'Il est temps de décommissionner l\'ancienne infrastructure on-premise. Le bail du datacenter se termine dans 3 mois.',
          optimalOption: 0,
          options: [
            {
              label: 'Décommissionnement progressif (2 mois)',
              description: 'Éteindre serveur par serveur après vérification que tout fonctionne en cloud.',
              kpiImpact: { budget: -3, schedule: 0, quality: 5, teamMorale: 5, riskLevel: -10 },
            },
            {
              label: 'Décommissionnement rapide (2 semaines)',
              description: 'Tout couper rapidement pour économiser les coûts de datacenter.',
              kpiImpact: { budget: 5, schedule: 5, quality: -5, teamMorale: -5, riskLevel: 10 },
            },
          ],
        },
      });
    }
  }

  // ─── Scenario 3: Brownfield — Reprise projet ERP (ADVANCED) ───

  // Clean existing brownfield scenario phases for re-seed
  await prisma.scenarioPhase.deleteMany({ where: { scenarioId: 'seed-scenario-brownfield-erp' } });

  // Seed-owned content: refreshed on every reseed (update) and used on first insert (create).
  const scenario3Content = {
    title: 'Reprise d\'un projet ERP en difficulté',
    description: 'Le précédent chef de projet a quitté l\'entreprise en pleine phase d\'exécution. Le projet de déploiement ERP accumulé 3 semaines de retard, le budget est consommé à 65%, et le moral de l\'équipe est au plus bas. Le Sponsor menace d\'annuler le projet si la situation ne s\'amélioré pas rapidement. Vous êtes appelé en renfort pour sauver ce projet.',
    objectives: [
      'Redresser la trajectoire du projet en moins de 2 mois',
      'Livrer le module Finance dans les délais restants',
      'Restaurer la confiance du Sponsor et du Comité de Direction',
      'Stabiliser l\'équipe et réduire le turnover',
    ],
    sector: Sector.FINANCE,
    difficulty: Difficulty.ADVANCED,
    scenarioType: ScenarioType.BROWNFIELD,
    startingPhaseOrder: 2,
    brownfieldContext: {
      previousDecisions: [
        { phase: 0, title: 'Choix de l\'intégrateur ERP', outcome: 'Sélection d\'un intégrateur low-cost', impact: 'negative' },
        { phase: 0, title: 'Périmètre fonctionnel', outcome: 'Tous les modules inclus d\'emblée', impact: 'negative' },
        { phase: 1, title: 'Méthode de déploiement', outcome: 'Big Bang (pas de pilote)', impact: 'negative' },
        { phase: 1, title: 'Formation des utilisateurs', outcome: 'Reportée à plus tard', impact: 'negative' },
      ],
      completedDeliverables: [
        { name: 'Charte de projet', score: 55, status: 'VALIDATED' },
        { name: 'Plan de management', score: 45, status: 'VALIDATED' },
        { name: 'Étude de faisabilité', score: 60, status: 'VALIDATED' },
        { name: 'Spécifications techniques', score: 40, status: 'REJECTED' },
      ],
      accumulatedDelays: 15,
      budgetUsed: 0.65,
      knownRisks: [
        { title: 'Turnover équipe technique (2 départs)', severity: 'HIGH', status: 'ACTIVE' },
        { title: 'Intégrateur en sous-capacité', severity: 'HIGH', status: 'ACTIVE' },
        { title: 'Spécifications incomplètes module Finance', severity: 'CRITICAL', status: 'ACTIVE' },
        { title: 'Résistance au changement des utilisateurs', severity: 'MEDIUM', status: 'ACTIVE' },
      ],
      teamMorale: 'low',
      previousPmNotes: 'Le précédent chef de projet a quitté l\'entreprise après un conflit avec le Sponsor sur le budget. L\'équipe est démotivée et deux développeurs seniors ont démissionné. L\'intégrateur ERP ne respecte pas ses engagements de qualité. Les spécifications du module Finance ont été rejetées et doivent être reprises.',
    },
    estimatedDurationHours: 5,
    requiredPlan: TenantPlan.STARTER,
    competencies: ['leadership', 'gestion-risques', 'communication', 'negociation', 'gestion-crise'],
    isPublished: true,
    projectTemplate: {
      name: 'Déploiement ERP GlobalFinance',
      client: 'GlobalFinance SA',
      sector: 'FINANCE',
      description: 'Déploiement d\'un ERP couvrant les modules Finance, RH et Achats pour une entreprise de 500 collaborateurs.',
      teamSize: 7,
      initialBudget: 350000,
      deadlineDays: 120,
      team: [
        { name: 'Marc Dubois', role: 'Architecte Solution', expertise: 'SENIOR', personality: 'NEUTRAL', morale: 45 },
        { name: 'Camille Fontaine', role: 'Consultant Fonctionnel Finance', expertise: 'SENIOR', personality: 'COOPERATIVE', morale: 50 },
        { name: 'Romain Lefèvre', role: 'Développeur Intégration', expertise: 'INTERMEDIATE', personality: 'RESISTANT', morale: 35 },
        { name: 'Emma Girard', role: 'Analyste Métier RH', expertise: 'INTERMEDIATE', personality: 'COOPERATIVE', morale: 55 },
        { name: 'Lucas Petit', role: 'Développeur Backend', expertise: 'JUNIOR', personality: 'COOPERATIVE', morale: 40 },
        { name: 'Sarah Benali', role: 'Testeuse QA', expertise: 'INTERMEDIATE', personality: 'NEUTRAL', morale: 60 },
        { name: 'David Chang', role: 'Formateur Utilisateurs', expertise: 'SENIOR', personality: 'COOPERATIVE', morale: 65 },
      ],
      deliverables: [
        { name: 'Charte de projet', description: 'Charte initiale (validée par le précédent CP)', phaseOrder: 0 },
        { name: 'Plan de management', description: 'Plan de management (partiellement suivi)', phaseOrder: 1 },
        { name: 'Spécifications module Finance', description: 'À reprendre — rejetées par le client', phaseOrder: 2 },
        { name: 'Plan de migration de données', description: 'Plan de migration vers le nouvel ERP', phaseOrder: 2 },
        { name: 'Rapport de recette', description: 'Résultats des tests de recette', phaseOrder: 3 },
        { name: 'Plan de formation', description: 'Programme de formation des utilisateurs', phaseOrder: 3 },
        { name: 'Bilan de projet', description: 'Bilan final et retour d\'expérience', phaseOrder: 4 },
      ],
    },
    initialKpis: { budget: 100, schedule: 100, quality: 80, teamMorale: 75, riskLevel: 20 },
  };

  const scenario3 = await prisma.scenario.upsert({
    where: { id: 'seed-scenario-brownfield-erp' },
    update: scenario3Content,
    create: {
      id: 'seed-scenario-brownfield-erp',
      createdById: systemUser.id,
      ...scenario3Content,
    },
  });

  // Phases for Scenario 3 (Brownfield ERP)
  const s3Phases = [
    {
      order: 0,
      name: 'Cadrage Initial',
      type: PhaseType.INITIATION,
      durationDays: 10,
      description: 'Phase initiale réalisée par le précédent chef de projet.',
      completionCriteria: { requiredMeetings: 1, requiredDecisions: 2 },
    },
    {
      order: 1,
      name: 'Planification',
      type: PhaseType.PLANNING,
      durationDays: 15,
      description: 'Planification réalisée par le précédent chef de projet.',
      completionCriteria: { requiredMeetings: 1, requiredDecisions: 2 },
    },
    {
      order: 2,
      name: 'Exécution & Redressement',
      type: PhaseType.EXECUTION,
      durationDays: 25,
      description: 'Vous prenez le relais ici. L\'équipe est démotivée, les spécifications du module Finance sont rejetées, et l\'intégrateur ne tient pas ses promesses. A vous de redresser la barre.',
      completionCriteria: { requiredMeetings: 2, requiredDecisions: 3 },
    },
    {
      order: 3,
      name: 'Suivi & Stabilisation',
      type: PhaseType.MONITORING,
      durationDays: 15,
      description: 'Surveillez les progrès, corrigez le tir et préparez la recette.',
      completionCriteria: { requiredMeetings: 1, requiredDecisions: 1 },
    },
    {
      order: 4,
      name: 'Clôture & Bilan',
      type: PhaseType.CLOSURE,
      durationDays: 5,
      description: 'Finalisez le déploiement, formez les utilisateurs et rédigez le bilan.',
      completionCriteria: { requiredMeetings: 1, requiredDecisions: 0 },
    },
  ];

  for (const phaseData of s3Phases) {
    const phase = await prisma.scenarioPhase.create({
      data: {
        scenarioId: scenario3.id,
        ...phaseData,
        completionCriteria: phaseData.completionCriteria as any,
      },
    });

    // Templates for historical phases (0, 1) — will be auto-resolved by BrownfieldContextService
    if (phaseData.order === 0) {
      await prisma.decisionTemplate.createMany({
        data: [
          {
            phaseId: phase.id,
            title: 'Choix de l\'intégrateur ERP',
            context: 'Trois intégrateurs répondent à l\'appel d\'offres. Lequel choisir pour le déploiement ERP ?',
            options: [
              { label: 'Sélection d\'un intégrateur low-cost', description: 'Moins cher mais moins d\'expérience', kpiImpact: { budget: 5, quality: -10, riskLevel: 15 } },
              { label: 'Sélection de l\'intégrateur référence', description: 'Plus cher, meilleure expertise', kpiImpact: { budget: -10, quality: 10, riskLevel: -5 } },
              { label: 'Solution interne', description: 'Équipe interne avec consultant externe', kpiImpact: { budget: 0, schedule: -5, teamMorale: 5 } },
            ] as any,
          },
          {
            phaseId: phase.id,
            title: 'Périmètre fonctionnel',
            context: 'Faut-il déployer tous les modules ERP en une fois ou procéder par lots ?',
            options: [
              { label: 'Tous les modules inclus d\'emblée', description: 'Déploiement complet (Big Bang)', kpiImpact: { schedule: -10, riskLevel: 20, quality: -5 } },
              { label: 'Déploiement par lots', description: 'Module Finance d\'abord, puis RH, puis Achats', kpiImpact: { schedule: 5, riskLevel: -10, quality: 5 } },
            ] as any,
          },
        ],
      });

      await prisma.meetingTemplate.create({
        data: {
          phaseId: phase.id,
          title: 'Réunion de lancement (Kickoff)',
          type: 'KICKOFF',
          objectives: ['Présenter le projet', 'Définir les rôles', 'Valider le planning'],
          durationMinutes: 60,
          participants: [
            { name: 'Jean-Paul Mercier', role: 'Sponsor / DG', personality: 'Exigeant et impatient', cooperationLevel: 2 },
            { name: 'Marc Dubois', role: 'Architecte Solution', personality: 'Technique et pragmatique', cooperationLevel: 4 },
          ] as any,
        },
      });
    }

    if (phaseData.order === 1) {
      await prisma.decisionTemplate.createMany({
        data: [
          {
            phaseId: phase.id,
            title: 'Méthode de déploiement',
            context: 'Comment déployer l\'ERP ? Big Bang ou déploiement progressif avec pilote ?',
            options: [
              { label: 'Big Bang (pas de pilote)', description: 'Déploiement direct en production', kpiImpact: { schedule: 5, riskLevel: 20, quality: -15 } },
              { label: 'Pilote sur un site', description: 'Test sur un site avant généralisation', kpiImpact: { schedule: -10, riskLevel: -10, quality: 10 } },
            ] as any,
          },
          {
            phaseId: phase.id,
            title: 'Formation des utilisateurs',
            context: 'Quand former les utilisateurs finaux ?',
            options: [
              { label: 'Reportée à plus tard', description: 'Se concentrer sur le technique d\'abord', kpiImpact: { schedule: 5, teamMorale: -10, quality: -10, riskLevel: 10 } },
              { label: 'Formation immédiate', description: 'Former des maintenant en parallèle', kpiImpact: { budget: -5, teamMorale: 10, quality: 5, riskLevel: -5 } },
            ] as any,
          },
        ],
      });

      await prisma.meetingTemplate.create({
        data: {
          phaseId: phase.id,
          title: 'Comité de pilotage #1',
          type: 'STEERING',
          objectives: ['Valider le plan de déploiement', 'Présenter le budget prévisionnel'],
          durationMinutes: 45,
          participants: [
            { name: 'Jean-Paul Mercier', role: 'Sponsor / DG', personality: 'Exigeant et impatient', cooperationLevel: 2 },
            { name: 'Camille Fontaine', role: 'Consultant Finance', personality: 'Rigoureuse et diplomate', cooperationLevel: 4 },
          ] as any,
        },
      });
    }

    // Phase 2: Starting phase for learner — decisions and meetings to resolve
    if (phaseData.order === 2) {
      await prisma.decisionTemplate.createMany({
        data: [
          {
            phaseId: phase.id,
            title: 'Gestion de l\'intégrateur défaillant',
            context: 'L\'intégrateur ERP ne respecte pas ses engagements de qualité. Les développements livrés sont buggés et incomplets. Que faites-vous ?',
            options: [
              { label: 'Ultimatum avec pénalités contractuelles', description: 'Mettre la pression légale', kpiImpact: { quality: 5, teamMorale: -5, riskLevel: 5 } },
              { label: 'Renforcer l\'équipe interne', description: 'Recruter 2 devs supplémentaires pour compenser', kpiImpact: { budget: -15, quality: 10, schedule: 5, riskLevel: -10 } },
              { label: 'Changer d\'intégrateur', description: 'Risque mais gain qualité à terme', kpiImpact: { budget: -20, schedule: -15, quality: 15, riskLevel: 10 } },
            ] as any,
            timeLimitSeconds: 120,
          },
          {
            phaseId: phase.id,
            title: 'Reprendre les spécifications Finance',
            context: 'Les spécifications du module Finance ont été rejetées. L\'équipe est découragée. Comment procédez-vous ?',
            options: [
              { label: 'Atelier de co-construction avec le métier', description: 'Réunir les utilisateurs clés pour redéfinir ensemble', kpiImpact: { quality: 10, teamMorale: 10, schedule: -5 } },
              { label: 'Reprendre en interne rapidement', description: 'L\'analyste métier reprend seule les specs', kpiImpact: { schedule: 5, quality: 5, teamMorale: -5 } },
              { label: 'Faire appel à un consultant externe', description: 'Expert finance pour revoir les specs', kpiImpact: { budget: -10, quality: 15, riskLevel: -5 } },
            ] as any,
            timeLimitSeconds: 90,
          },
          {
            phaseId: phase.id,
            title: 'Moral de l\'équipe',
            context: 'Le turnover menace. 2 développeurs envisagent de partir. Comment stabiliser l\'équipe ?',
            options: [
              { label: 'Entretiens individuels et primes', description: 'Écouter et motiver financièrement', kpiImpact: { budget: -5, teamMorale: 15, riskLevel: -10 } },
              { label: 'Réorganiser les responsabilités', description: 'Donner plus d\'autonomie et de visibilité', kpiImpact: { teamMorale: 10, quality: 5, riskLevel: -5 } },
              { label: 'Ignorer et se concentrer sur les livrables', description: 'Le travail d\'abord', kpiImpact: { teamMorale: -15, riskLevel: 15, schedule: 5 } },
            ] as any,
          },
        ],
      });

      await prisma.meetingTemplate.createMany({
        data: [
          {
            phaseId: phase.id,
            title: 'Réunion de crise avec le Sponsor',
            type: 'CRISIS',
            objectives: ['Présenter le plan de redressement', 'Négocier un délai supplémentaire', 'Rassurer sur la faisabilité'],
            durationMinutes: 60,
            participants: [
              { name: 'Jean-Paul Mercier', role: 'Sponsor / DG', personality: 'Très mécontent, impatient, prêt à annuler le projet', cooperationLevel: 1 },
              { name: 'Isabelle Roux', role: 'DAF', personality: 'Analytique, veut des chiffres précis', cooperationLevel: 3 },
            ] as any,
          },
          {
            phaseId: phase.id,
            title: 'Point d\'équipe — Remotivation',
            type: 'STANDUP',
            objectives: ['Écouter les frustrations', 'Présenter la nouvelle organisation', 'Définir les priorités des 2 prochaines semaines'],
            durationMinutes: 30,
            participants: [
              { name: 'Marc Dubois', role: 'Architecte Solution', personality: 'Fatigué mais compétent', cooperationLevel: 3 },
              { name: 'Romain Lefèvre', role: 'Développeur Intégration', personality: 'Frustré et prêt à partir', cooperationLevel: 1 },
              { name: 'Camille Fontaine', role: 'Consultant Finance', personality: 'Positive et motrice', cooperationLevel: 5 },
            ] as any,
          },
        ],
      });

      await prisma.randomEventTemplate.createMany({
        data: [
          {
            phaseId: phase.id,
            type: RandomEventType.RISK,
            title: 'Départ imminent d\'un développeur clé',
            description: 'Romain Lefèvre, le développeur intégration, vient de recevoir une offre concurrente. Il hésite à partir dans les 2 semaines.',
            severity: Severity.HIGH,
            probability: 0.7,
            options: [
              { label: 'Contre-offre salariale', description: '+15% de salaire et télétravail 3j/semaine', kpiImpact: { budget: -5, teamMorale: 10, riskLevel: -15 } },
              { label: 'Le laisser partir', description: 'Accepter son départ et chercher un remplaçant', kpiImpact: { schedule: -10, teamMorale: -10, riskLevel: 10 } },
              { label: 'Négocier un préavis étendu', description: 'Lui demander de rester 1 mois de plus pour la transition', kpiImpact: { teamMorale: -5, riskLevel: -5, schedule: -3 } },
            ] as any,
          },
          {
            phaseId: phase.id,
            type: RandomEventType.OPPORTUNITY,
            title: 'Nouvel outil de test automatisé',
            description: 'L\'éditeur ERP propose un nouvel outil de test automatisé gratuit pendant 3 mois. Cela pourrait accélérer la recette.',
            severity: Severity.LOW,
            probability: 0.5,
            options: [
              { label: 'Adopter l\'outil immédiatement', description: 'Former l\'équipe QA et intégrer dans le workflow', kpiImpact: { quality: 10, schedule: 5, riskLevel: -5 } },
              { label: 'Tester d\'abord sur un module', description: 'Pilote sur le module RH avant généralisation', kpiImpact: { quality: 5, riskLevel: -3 } },
              { label: 'Décliner — trop de changements en cours', description: 'L\'équipe ne peut pas absorber un nouvel outil', kpiImpact: {} },
            ] as any,
          },
        ],
      });
    }

    // Phase 3 & 4: simplified templates
    if (phaseData.order === 3) {
      await prisma.decisionTemplate.create({
        data: {
          phaseId: phase.id,
          title: 'Go/No-Go pour la mise en production',
          context: 'La recette est terminée mais quelques bugs mineurs subsistent. Le Sponsor veut déployer au plus vite.',
          options: [
            { label: 'Go — déployer avec correctifs en parallèle', description: 'Risque contrôle, gain de temps', kpiImpact: { schedule: 10, quality: -5, riskLevel: 5 } },
            { label: 'No-Go — 1 semaine supplémentaire', description: 'Corriger les bugs avant déploiement', kpiImpact: { schedule: -5, quality: 10, riskLevel: -10 } },
          ] as any,
        },
      });

      await prisma.meetingTemplate.create({
        data: {
          phaseId: phase.id,
          title: 'Comité de pilotage — Bilan recette',
          type: 'STEERING',
          objectives: ['Présenter les résultats de recette', 'Décision Go/No-Go', 'Planifier la formation'],
          durationMinutes: 45,
          participants: [
            { name: 'Jean-Paul Mercier', role: 'Sponsor / DG', personality: 'Impatient mais satisfait des progrès', cooperationLevel: 3 },
            { name: 'Sarah Benali', role: 'Testeuse QA', personality: 'Rigoureuse, présente les résultats', cooperationLevel: 5 },
          ] as any,
        },
      });
    }

    if (phaseData.order === 4) {
      await prisma.meetingTemplate.create({
        data: {
          phaseId: phase.id,
          title: 'Retrospective et bilan de projet',
          type: 'RETROSPECTIVE',
          objectives: ['Retour d\'expérience', 'Identifier les leçons apprises', 'Célébrer les succès'],
          durationMinutes: 60,
          participants: [
            { name: 'Jean-Paul Mercier', role: 'Sponsor / DG', personality: 'Reconnaissant si le projet est sauvé', cooperationLevel: 4 },
            { name: 'Marc Dubois', role: 'Architecte Solution', personality: 'Soulagé, partage ses apprentissages', cooperationLevel: 5 },
            { name: 'Camille Fontaine', role: 'Consultant Finance', personality: 'Fière du travail accompli', cooperationLevel: 5 },
          ] as any,
        },
      });
    }
  }

  console.log(`Seeded: ${scenario1.title}`);
  console.log(`Seeded: ${scenario2.title}`);
  console.log(`Seeded: ${scenario3.title} (Brownfield)`);

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

  // ─── Sector scenarios (construction, santé, énergie, public, manufacturier, télécom) ─

  const sectorCount = await seedSectorScenarios(prisma, systemUser.id);
  console.log(`Sector scenarios seeded: ${sectorCount}`);

  // ─── Deliverable Templates (EPIC 1 — enriched with PM Kit) ─

  await seedDeliverableTemplates(prisma, tenant.id, admin.id);

  // ─── Reference Documents (EPIC 1) ─────────────────────────

  const refDocs = [
    { id: 'seed-refdoc-pmbok', title: 'Guide PMBOK 7ème édition', category: ReferenceDocumentCategory.STANDARD, content: '# Guide PMBOK\n\nLe Project Management Body of Knowledge (PMBOK) est le standard de référence publié par le PMI pour la gestion de projet.\n\n## Principes clés\n\n1. Stewardship\n2. Team\n3. Stakeholders\n4. Value\n5. Systems Thinking\n6. Leadership\n7. Tailoring\n8. Quality\n9. Complexity\n10. Risk\n11. Adaptability and Resiliency\n12. Change' },
    { id: 'seed-refdoc-glossary', title: 'Glossaire PMI', category: ReferenceDocumentCategory.GLOSSARY, content: '# Glossaire PMI\n\n**WBS** (Work Breakdown Structure) : Décomposition hiérarchique du périmètre total du travail.\n\n**RACI** : Matrice d\'attribution des responsabilités (Responsible, Accountable, Consulted, Informed).\n\n**Chemin critique** : Séquence d\'activités déterminant la durée minimale du projet.\n\n**Earned Value** : Méthode de mesure de la performance du projet.' },
    { id: 'seed-refdoc-bestpractice', title: 'Bonnes pratiques de gestion des risques', category: ReferenceDocumentCategory.BEST_PRACTICE, content: '# Gestion des risques\n\n## Processus\n\n1. Identification\n2. Analyse qualitative\n3. Analyse quantitative\n4. Planification des réponses\n5. Mise en œuvre\n6. Surveillance' },
  ];

  for (const doc of refDocs) {
    await prisma.referenceDocument.upsert({
      where: { id: doc.id },
      update: {
        title: doc.title,
        category: doc.category,
        content: doc.content,
      },
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
      jobDescription: 'Nous recherchons un chef de projet digital senior pour piloter des projets de transformation numérique. Vous serez responsable de la gestion de bout en bout de projets web et mobile avec des équipes de 5 à 10 personnes.',
      requiredSkills: [
        { skill: 'Planification', weight: 9 },
        { skill: 'Communication', weight: 8 },
        { skill: 'Gestion des risques', weight: 7 },
        { skill: 'Leadership', weight: 8 },
        { skill: 'Méthodologies agiles', weight: 6 },
      ],
      experienceLevel: 'senior',
      projectTypes: ['web', 'mobile', 'e-commerce'],
      culture: 'AGILE',
      cultureDescription: 'Environnement agile avec des sprints de 2 semaines, standups quotidiens et retrospectives régulières.',
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
