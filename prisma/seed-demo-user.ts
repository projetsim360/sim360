/**
 * seed-demo-user.ts
 *
 * Cree un utilisateur demo avec un parcours COMPLET :
 * - Compte + onboarding termine (profil, questionnaire, test aptitude, diagnostic)
 * - 1 simulation IT avancee (phase 3/5) avec tout le contexte
 * - Decisions prises, evenements resolus, reunions terminees
 * - Livrables rediges + evalues, emails recus + repondus
 * - Conversation PMO, KPI snapshots, badges de competence
 *
 * Usage: pnpm tsx prisma/seed-demo-user.ts
 * Login: demo@sim360.dev / Demo123!
 */

import {
  PrismaClient,
  UserRole,
  PhaseType,
  RandomEventType,
  Severity,
  ProfileType,
} from '@prisma/client';
import bcryptjs from 'bcryptjs';
const { hashSync } = bcryptjs;

const prisma = new PrismaClient();
const now = new Date();

function daysFromNow(days: number): Date {
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
}

function daysAgo(days: number): Date {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

function hoursAgo(hours: number): Date {
  return new Date(now.getTime() - hours * 60 * 60 * 1000);
}

async function main() {
  console.log('=== Seed Demo User — Parcours Complet ===\n');

  // ─── 1. Tenant ──────────────────────────────────────────
  const tenant = await prisma.tenant.findFirst({ where: { slug: 'sim360-dev' } });
  if (!tenant) throw new Error('Tenant sim360-dev introuvable. Lancez d\'abord: pnpm db:seed');
  console.log(`Tenant: ${tenant.name} (${tenant.id})`);

  // ─── 2. Utilisateur demo ────────────────────────────────
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@sim360.dev' },
    update: {
      passwordHash: hashSync('Demo123!', 12),
      firstName: 'Marie',
      lastName: 'Dupont',
      emailVerifiedAt: daysAgo(14),
      profileCompleted: true,
    },
    create: {
      email: 'demo@sim360.dev',
      passwordHash: hashSync('Demo123!', 12),
      firstName: 'Marie',
      lastName: 'Dupont',
      role: UserRole.MEMBER,
      tenantId: tenant.id,
      isActive: true,
      emailVerifiedAt: daysAgo(14),
      profileCompleted: true,
    },
  });
  console.log(`Utilisateur demo: ${demoUser.email} (${demoUser.id})`);

  // Nettoyage des anciennes donnees demo
  await prisma.userProfile.deleteMany({ where: { userId: demoUser.id } });
  const oldSims = await prisma.simulation.findMany({ where: { userId: demoUser.id }, select: { id: true } });
  for (const s of oldSims) {
    await prisma.simulation.delete({ where: { id: s.id } }).catch(() => {});
  }
  await prisma.competencyBadge.deleteMany({ where: { userId: demoUser.id } });

  // ─── 3. Profil + Onboarding complet ────────────────────
  await prisma.userProfile.create({
    data: {
      userId: demoUser.id,
      tenantId: tenant.id,
      questionnaireData: {
        objective: 'reinforce',
        targetDomain: 'IT / Digital',
        experienceLevel: 'confirmed',
        mainMotivation: 'Renforcer mes competences en gestion de projet IT pour evoluer vers un poste de PMO',
      },
      aptitudeTestData: {
        answers: [
          { questionId: 'scenario-1', answer: '3' },
          { questionId: 'scenario-2', answer: '1' },
          { questionId: 'scenario-3', answer: '1' },
        ],
        scores: { logic: 82, prioritization: 75, organization: 88 },
        categoryScores: {
          planification: 78,
          communication: 85,
          gestionRisques: 72,
          leadership: 80,
          gestionBudget: 68,
        },
      },
      profileType: ProfileType.REINFORCEMENT,
      diagnosticData: {
        profileType: 'REINFORCEMENT',
        summary: 'Marie possede une solide experience en gestion de projet IT (5+ ans). Ses points forts sont la communication et l\'organisation. Axes d\'amelioration : gestion budgetaire et anticipation des risques.',
        personalizedMessage: 'Bienvenue Marie ! Votre profil montre une bonne maitrise des fondamentaux. Nous allons vous challenger sur des scenarios complexes pour renforcer vos competences en gestion financiere et analyse de risques.',
        strengths: ['Communication equipe', 'Organisation et planification', 'Leadership collaboratif', 'Methodologie Agile'],
        areasForImprovement: ['Gestion budgetaire avancee', 'Analyse quantitative des risques', 'Negociation fournisseurs'],
        suggestedSector: 'IT',
        suggestedDifficulty: 'HARD',
      },
      skills: [
        { name: 'Planification', currentLevel: 'intermediate', targetLevel: 'advanced', gap: 33 },
        { name: 'Gestion des risques', currentLevel: 'basic', targetLevel: 'advanced', gap: 66 },
        { name: 'Communication', currentLevel: 'advanced', targetLevel: 'advanced', gap: 0 },
        { name: 'Leadership', currentLevel: 'intermediate', targetLevel: 'advanced', gap: 33 },
        { name: 'Gestion budgetaire', currentLevel: 'basic', targetLevel: 'intermediate', gap: 50 },
        { name: 'Methodologie PMI/Agile', currentLevel: 'intermediate', targetLevel: 'advanced', gap: 33 },
        { name: 'Gestion parties prenantes', currentLevel: 'intermediate', targetLevel: 'advanced', gap: 33 },
        { name: 'Suivi et controle', currentLevel: 'intermediate', targetLevel: 'advanced', gap: 33 },
      ],
      suggestedSector: 'IT',
      selectedSector: 'it',
      suggestedDifficulty: 'HARD',
      onboardingStep: 'completed',
      completedAt: daysAgo(13),
    },
  });
  console.log('Profil + onboarding cree');

  // ─── 4. Scenario IT (reutiliser le seed existant) ──────
  const scenario = await prisma.scenario.findFirst({
    where: { id: 'seed-scenario-ecommerce' },
    include: { phases: { orderBy: { order: 'asc' } } },
  });
  if (!scenario) throw new Error('Scenario seed-scenario-ecommerce introuvable. Lancez d\'abord: pnpm db:seed');

  // ─── 5. Projet ─────────────────────────────────────────
  const project = await prisma.project.create({
    data: {
      tenantId: tenant.id,
      userId: demoUser.id,
      name: 'Refonte Plateforme E-commerce TechShop',
      client: 'TechShop International',
      sector: 'IT',
      description: 'Migration et refonte complete de la plateforme e-commerce : nouveau design responsive, refonte du tunnel d\'achat, integration des paiements multi-devises, et mise en place d\'un back-office analytics.',
      initialBudget: 280000,
      currentBudget: 252000,
      startDate: daysAgo(45),
      deadline: daysFromNow(90),
      status: 'IN_PROGRESS',
      teamMembers: {
        create: [
          { name: 'Lucas Martin', role: 'Tech Lead', expertise: 'SENIOR', personality: 'COOPERATIVE', availability: 1.0, morale: 85, avatar: '/media/avatars/300-1.png' },
          { name: 'Emma Bernard', role: 'Developpeuse Frontend', expertise: 'INTERMEDIATE', personality: 'COOPERATIVE', availability: 1.0, morale: 78, avatar: '/media/avatars/300-2.png' },
          { name: 'Hugo Petit', role: 'Developpeur Backend', expertise: 'SENIOR', personality: 'ANALYTICAL', availability: 0.8, morale: 72, avatar: '/media/avatars/300-3.png' },
          { name: 'Lea Moreau', role: 'Designer UX/UI', expertise: 'SENIOR', personality: 'CREATIVE', availability: 1.0, morale: 90, avatar: '/media/avatars/300-4.png' },
          { name: 'Nathan Roux', role: 'QA Engineer', expertise: 'INTERMEDIATE', personality: 'COOPERATIVE', availability: 1.0, morale: 80, avatar: '/media/avatars/300-5.png' },
          { name: 'Chloe Leroy', role: 'Scrum Master', expertise: 'SENIOR', personality: 'ASSERTIVE', availability: 0.5, morale: 82, avatar: '/media/avatars/300-6.png' },
        ],
      },
    },
  });
  console.log(`Projet cree: ${project.name}`);

  // ─── 6. Simulation (phase 3/5, en cours) ──────────────
  const simulation = await prisma.simulation.create({
    data: {
      projectId: project.id,
      scenarioId: scenario.id,
      userId: demoUser.id,
      tenantId: tenant.id,
      status: 'IN_PROGRESS',
      currentPhaseOrder: 3,
      startedAt: daysAgo(45),
      kpis: {
        create: {
          budget: 72,
          schedule: 65,
          quality: 78,
          teamMorale: 74,
          riskLevel: 45,
        },
      },
    },
  });
  console.log(`Simulation creee: ${simulation.id}`);

  // ─── 7. Phases ─────────────────────────────────────────
  const phasesDefs = [
    { order: 0, name: 'Initiation', type: PhaseType.INITIATION, status: 'COMPLETED', startedAt: daysAgo(45), completedAt: daysAgo(38) },
    { order: 1, name: 'Planification', type: PhaseType.PLANNING, status: 'COMPLETED', startedAt: daysAgo(38), completedAt: daysAgo(25) },
    { order: 2, name: 'Execution Sprint 1', type: PhaseType.EXECUTION, status: 'COMPLETED', startedAt: daysAgo(25), completedAt: daysAgo(10) },
    { order: 3, name: 'Execution Sprint 2', type: PhaseType.MONITORING, status: 'ACTIVE', startedAt: daysAgo(10), completedAt: null },
    { order: 4, name: 'Cloture', type: PhaseType.CLOSURE, status: 'LOCKED', startedAt: null, completedAt: null },
  ];

  for (const p of phasesDefs) {
    await prisma.simulationPhase.create({
      data: { simulationId: simulation.id, ...p },
    });
  }
  console.log('Phases creees (5 phases, 3 completees, 1 active)');

  // ─── 8. KPI Snapshots (evolution realiste) ─────────────
  const kpiSnapshots = [
    { phaseOrder: 0, trigger: 'simulation_start', budget: 100, schedule: 100, quality: 80, teamMorale: 75, riskLevel: 20, takenAt: daysAgo(45) },
    { phaseOrder: 0, trigger: 'decision', budget: 95, schedule: 98, quality: 80, teamMorale: 78, riskLevel: 22, takenAt: daysAgo(42) },
    { phaseOrder: 1, trigger: 'phase_advance', budget: 92, schedule: 95, quality: 82, teamMorale: 80, riskLevel: 25, takenAt: daysAgo(38) },
    { phaseOrder: 1, trigger: 'decision', budget: 88, schedule: 90, quality: 83, teamMorale: 82, riskLevel: 30, takenAt: daysAgo(33) },
    { phaseOrder: 1, trigger: 'meeting', budget: 87, schedule: 88, quality: 85, teamMorale: 80, riskLevel: 28, takenAt: daysAgo(30) },
    { phaseOrder: 2, trigger: 'phase_advance', budget: 85, schedule: 82, quality: 84, teamMorale: 78, riskLevel: 35, takenAt: daysAgo(25) },
    { phaseOrder: 2, trigger: 'event', budget: 78, schedule: 75, quality: 80, teamMorale: 72, riskLevel: 42, takenAt: daysAgo(18) },
    { phaseOrder: 2, trigger: 'decision', budget: 76, schedule: 72, quality: 82, teamMorale: 76, riskLevel: 40, takenAt: daysAgo(14) },
    { phaseOrder: 3, trigger: 'phase_advance', budget: 74, schedule: 68, quality: 80, teamMorale: 75, riskLevel: 43, takenAt: daysAgo(10) },
    { phaseOrder: 3, trigger: 'decision', budget: 72, schedule: 65, quality: 78, teamMorale: 74, riskLevel: 45, takenAt: daysAgo(3) },
  ];

  await prisma.simulationKpiSnapshot.createMany({
    data: kpiSnapshots.map((s) => ({ simulationId: simulation.id, ...s })),
  });
  console.log(`KPI snapshots crees (${kpiSnapshots.length} points)`);

  // ─── 9. Decisions (6 decisions, dont 1 en attente) ─────
  const decisions = [
    {
      phaseOrder: 0, title: 'Choix de la methodologie projet',
      context: 'Le client TechShop souhaite une livraison rapide avec des demonstrations regulieres. L\'equipe a l\'habitude de travailler en cascade. Quel framework adopter ?',
      options: [
        { label: 'Scrum avec sprints de 2 semaines', description: 'Framework agile avec demonstrations regulieres au client', kpiImpact: { schedule: 5, quality: 3, teamMorale: 5 } },
        { label: 'Cascade classique', description: 'Approche sequentielle avec livrables par phase', kpiImpact: { schedule: -5, quality: 5, teamMorale: -3 } },
        { label: 'Kanban', description: 'Flux continu avec limite de WIP', kpiImpact: { schedule: 3, quality: 2, teamMorale: 3 } },
        { label: 'SAFe', description: 'Framework scaled agile pour grandes equipes', kpiImpact: { budget: -8, schedule: -3, teamMorale: -5 } },
      ],
      selectedOption: 0, decidedAt: daysAgo(42),
      kpiImpact: { schedule: 5, quality: 3, teamMorale: 5 },
    },
    {
      phaseOrder: 1, title: 'Strategie de migration des donnees',
      context: 'L\'ancien systeme contient 500 000 produits et 2 millions de comptes clients. La migration doit etre planifiee avec soin pour eviter toute perte de donnees.',
      options: [
        { label: 'Migration incrementale par lots', description: 'Migrer par categories de produits sur 3 sprints', kpiImpact: { budget: -3, schedule: -5, quality: 8 } },
        { label: 'Big bang durant un week-end', description: 'Tout migrer en une fois pendant une maintenance', kpiImpact: { budget: 5, schedule: 5, quality: -5, riskLevel: 15 } },
        { label: 'Double run pendant 1 mois', description: 'Les deux systemes en parallele puis bascule progressive', kpiImpact: { budget: -10, quality: 5, riskLevel: -5 } },
      ],
      selectedOption: 0, decidedAt: daysAgo(33),
      kpiImpact: { budget: -3, schedule: -5, quality: 8 },
    },
    {
      phaseOrder: 1, title: 'Choix du prestataire paiement',
      context: 'TechShop opere dans 5 pays europeens. Il faut choisir un prestataire de paiement multi-devises compatible PCI-DSS.',
      options: [
        { label: 'Stripe', description: 'Solution flexible, API moderne, commission 1.4% + 0.25EUR', kpiImpact: { budget: -2, schedule: 3, quality: 3 } },
        { label: 'Adyen', description: 'Solution enterprise, support multi-devises natif, tarif negocie', kpiImpact: { budget: -5, quality: 5 } },
        { label: 'Developpement interne', description: 'Integration directe des banques, controle total', kpiImpact: { budget: -15, schedule: -10, quality: -3, riskLevel: 10 } },
      ],
      selectedOption: 0, decidedAt: daysAgo(30),
      kpiImpact: { budget: -2, schedule: 3, quality: 3 },
    },
    {
      phaseOrder: 2, title: 'Gestion du depart d\'Emma (Frontend)',
      context: 'Emma Bernard, developpeuse frontend, annonce qu\'elle quitte l\'equipe dans 2 semaines pour un autre poste. Le sprint est a mi-parcours et elle porte 40% des taches frontend.',
      options: [
        { label: 'Recruter un remplacant en urgence', description: 'Contacter les ESN pour un profil disponible rapidement', kpiImpact: { budget: -8, schedule: -3, teamMorale: -2 } },
        { label: 'Redistribuer les taches dans l\'equipe', description: 'Charge supplementaire pour Lucas et les autres', kpiImpact: { schedule: -8, teamMorale: -10 } },
        { label: 'Negocier un delai avec le client', description: 'Reporter la deadline du sprint de 2 semaines', kpiImpact: { schedule: -5, teamMorale: 3 } },
        { label: 'Faire appel a un freelance senior', description: 'Freelance React/Next.js disponible sous 48h', kpiImpact: { budget: -12, schedule: -2, quality: -2 } },
      ],
      selectedOption: 3, decidedAt: daysAgo(18),
      kpiImpact: { budget: -12, schedule: -2, quality: -2 },
    },
    {
      phaseOrder: 3, title: 'Priorisation du backlog Sprint 2',
      context: 'Le Product Owner demande d\'integrer 3 nouvelles fonctionnalites (wishlist, comparateur, avis verifies) qui n\'etaient pas prevues. L\'equipe estime qu\'il faudrait un sprint supplementaire.',
      options: [
        { label: 'Accepter les 3 features, reporter les tests', description: 'Integrer tout mais reduire la phase de QA', kpiImpact: { schedule: -5, quality: -10, riskLevel: 8 } },
        { label: 'Negocier : 1 feature maintenant, 2 en sprint 3', description: 'Prioriser la wishlist, reporter comparateur et avis', kpiImpact: { schedule: -2, quality: 2 } },
        { label: 'Refuser les changements de perimetre', description: 'Appliquer strictement le change control process', kpiImpact: { teamMorale: -5, quality: 5 } },
        { label: 'Demander un budget supplementaire', description: 'Presenter un avenant au client pour couvrir le surcout', kpiImpact: { budget: 5, schedule: -3 } },
      ],
      selectedOption: 1, decidedAt: daysAgo(3),
      kpiImpact: { schedule: -2, quality: 2 },
    },
    {
      phaseOrder: 3, title: 'Incident de securite sur l\'environnement de staging',
      context: 'L\'equipe QA a detecte une faille XSS sur le formulaire de paiement en staging. Le client demande un rapport d\'impact et un plan de remediation sous 24h.',
      options: [
        { label: 'Arreter le sprint pour corriger immediatement', description: 'Mobiliser toute l\'equipe sur le fix de securite', kpiImpact: { schedule: -8, quality: 10, riskLevel: -15 } },
        { label: 'Corriger en parallele du sprint', description: 'Hugo se concentre sur le fix, le reste continue', kpiImpact: { schedule: -3, quality: 5, riskLevel: -8 } },
        { label: 'Reporter au sprint 3', description: 'Documenter et planifier la correction pour plus tard', kpiImpact: { riskLevel: 15, quality: -5 } },
      ],
      selectedOption: null, decidedAt: null,
      kpiImpact: null,
    },
  ];

  for (const d of decisions) {
    await prisma.decision.create({
      data: {
        simulationId: simulation.id,
        phaseOrder: d.phaseOrder,
        title: d.title,
        context: d.context,
        options: d.options,
        selectedOption: d.selectedOption,
        decidedAt: d.decidedAt,
        kpiImpact: d.kpiImpact,
      },
    });
  }
  console.log(`Decisions creees (${decisions.length}, dont 1 en attente)`);

  // ─── 10. Evenements aleatoires ─────────────────────────
  const events = [
    {
      phaseOrder: 1, type: RandomEventType.RISK, title: 'Fuite de donnees chez un sous-traitant',
      description: 'Un sous-traitant hebergeant les maquettes a subi une breche de securite. Les designs du nouveau site ont ete exposes pendant 48h. Le client exige un audit de securite complet.',
      severity: Severity.HIGH,
      options: [
        { label: 'Audit interne rapide', description: 'Verifier nos propres systemes en 2 jours', kpiImpact: { budget: -3, schedule: -2, riskLevel: -5 } },
        { label: 'Audit externe certifie', description: 'Faire appel a un cabinet specialise (10 jours)', kpiImpact: { budget: -8, schedule: -5, riskLevel: -15 } },
      ],
      selectedOption: 1, resolvedAt: daysAgo(32),
      kpiImpact: { budget: -8, schedule: -5, riskLevel: -15 },
    },
    {
      phaseOrder: 2, type: RandomEventType.OPPORTUNITY, title: 'Partenariat avec une marketplace',
      description: 'Amazon propose une integration gratuite de leur SDK marketplace pour TechShop, ce qui permettrait d\'elargir la base client. Cela necessite 1 semaine de dev supplementaire.',
      severity: Severity.MEDIUM,
      options: [
        { label: 'Accepter le partenariat', description: 'Integrer le SDK dans le sprint en cours', kpiImpact: { budget: 5, schedule: -5, quality: -2 } },
        { label: 'Reporter a la V2', description: 'Decliner pour le moment, revisiter apres le lancement', kpiImpact: {} },
      ],
      selectedOption: 1, resolvedAt: daysAgo(20),
      kpiImpact: {},
    },
    {
      phaseOrder: 3, type: RandomEventType.RISK, title: 'Indisponibilite du serveur de staging',
      description: 'Le fournisseur cloud signale une maintenance imprevue de 48h sur la region EU-West. L\'equipe QA ne peut plus tester.',
      severity: Severity.HIGH,
      options: [
        { label: 'Deployer sur une region alternative', description: 'Reconfigurer le CI/CD pour EU-Central (4h de travail)', kpiImpact: { budget: -2, schedule: -1 } },
        { label: 'Attendre la fin de la maintenance', description: 'L\'equipe QA travaille sur la documentation', kpiImpact: { schedule: -3, teamMorale: -5 } },
      ],
      selectedOption: 0, resolvedAt: daysAgo(5),
      kpiImpact: { budget: -2, schedule: -1 },
    },
  ];

  for (const e of events) {
    await prisma.randomEvent.create({
      data: {
        simulationId: simulation.id,
        phaseOrder: e.phaseOrder,
        type: e.type,
        title: e.title,
        description: e.description,
        severity: e.severity,
        options: e.options,
        selectedOption: e.selectedOption,
        resolvedAt: e.resolvedAt,
        kpiImpact: e.kpiImpact,
      },
    });
  }
  console.log(`Evenements aleatoires crees (${events.length})`);

  // ─── 11. Reunions (3 terminees, 1 planifiee) ──────────
  const meetingDefs = [
    {
      phaseOrder: 0, title: 'Kick-off projet TechShop', type: 'KICKOFF', status: 'COMPLETED' as const,
      objectives: ['Presenter le projet', 'Definir les roles', 'Valider le planning macro'],
      startedAt: daysAgo(44), completedAt: daysAgo(44),
      participants: [
        { name: 'Pierre Durand', role: 'Sponsor (DG TechShop)', personality: 'ASSERTIVE', cooperationLevel: 4 },
        { name: 'Sophie Blanc', role: 'Product Owner', personality: 'COOPERATIVE', cooperationLevel: 5 },
        { name: 'Lucas Martin', role: 'Tech Lead', personality: 'COOPERATIVE', cooperationLevel: 4 },
      ],
      messages: [
        { role: 'system', content: 'Reunion de kick-off du projet de refonte e-commerce TechShop.' },
        { role: 'assistant', content: 'Bonjour a tous ! Je suis ravi de lancer officiellement ce projet de refonte. Pierre, souhaitez-vous rappeler les enjeux strategiques ?' },
        { role: 'user', content: 'Bonjour ! Oui, Pierre, pouvez-vous nous donner le contexte business et les objectifs principaux ?' },
        { role: 'assistant', content: 'Pierre Durand : "Merci Marie. TechShop perd 15% de parts de marche depuis 2 ans a cause d\'une plateforme vieillissante. L\'objectif est de doubler le taux de conversion et d\'ouvrir 3 nouveaux marches europeens d\'ici la fin de l\'annee. Le budget est de 280K EUR, non negociable."' },
        { role: 'user', content: 'Merci Pierre. Sophie, quelles sont les priorites fonctionnelles cote produit ?' },
        { role: 'assistant', content: 'Sophie Blanc : "Les priorites sont : 1) Refonte complete du tunnel d\'achat (mobile first), 2) Integration paiements multi-devises, 3) Nouveau back-office analytics pour le marketing. J\'ai prepare un backlog initial de 87 user stories."' },
        { role: 'user', content: 'Lucas, est-ce que l\'equipe technique a des preoccupations sur la stack ou l\'architecture ?' },
        { role: 'assistant', content: 'Lucas Martin : "Oui, la migration depuis l\'ancien systeme Magento vers Next.js + Node.js est un gros chantier. Je recommande une approche progressive avec un strangler pattern. Il faudra aussi prevoir la migration des 500K produits et 2M de comptes."' },
        { role: 'user', content: 'Tres bien. Je propose de valider le planning suivant : Sprint 0 pour le setup technique, puis 4 sprints de dev de 2 semaines chacun. On prevoit une demo client toutes les 2 semaines. Des objections ?' },
        { role: 'assistant', content: 'Sophie : "Ca me va, mais il faut absolument un environnement de demo stable des le sprint 1."\nPierre : "D\'accord. Je veux un reporting hebdomadaire sur les KPIs projet."\nLucas : "OK pour moi. Je commence le setup de l\'infra des demain."' },
      ],
      summary: {
        summary: 'Kick-off reussi. Le projet vise a doubler le taux de conversion et ouvrir 3 marches EU. Budget 280K, methodologie Scrum, 5 sprints prevus. Stack cible : Next.js + Node.js avec migration progressive.',
        keyDecisions: ['Methodologie Scrum validee', 'Demo client bi-hebdomadaire', 'Migration progressive (strangler pattern)', 'Reporting hebdomadaire au sponsor'],
        actionItems: [
          { assignee: 'Lucas', action: 'Setup infrastructure et CI/CD', deadline: 'Sprint 0' },
          { assignee: 'Sophie', action: 'Finaliser le backlog et prioriser', deadline: 'Sprint 0' },
          { assignee: 'Marie', action: 'Plan de communication et matrice RACI', deadline: 'J+3' },
        ],
      },
    },
    {
      phaseOrder: 1, title: 'Revue de planification Sprint 1', type: 'STEERING', status: 'COMPLETED' as const,
      objectives: ['Valider le scope Sprint 1', 'Identifier les risques', 'Definir les criteres de Done'],
      startedAt: daysAgo(36), completedAt: daysAgo(36),
      participants: [
        { name: 'Sophie Blanc', role: 'Product Owner', personality: 'COOPERATIVE', cooperationLevel: 5 },
        { name: 'Lucas Martin', role: 'Tech Lead', personality: 'COOPERATIVE', cooperationLevel: 4 },
        { name: 'Chloe Leroy', role: 'Scrum Master', personality: 'ASSERTIVE', cooperationLevel: 4 },
      ],
      messages: [
        { role: 'system', content: 'Reunion de planification Sprint 1.' },
        { role: 'assistant', content: 'Chloe Leroy : "Bonjour a tous. On a 14 user stories candidates pour le Sprint 1. Notre velocite estimee est de 45 points. Sophie, peux-tu nous presenter les priorites ?"' },
        { role: 'user', content: 'Avant cela, j\'aimerais qu\'on fasse un point sur les risques identifies lors du kick-off. Lucas, ou en est le setup technique ?' },
        { role: 'assistant', content: 'Lucas : "Le CI/CD est en place, l\'environnement de staging est operationnel. Par contre, j\'ai identifie un risque sur la migration Magento : les schemas de donnees sont tres differents, ca va prendre plus de temps que prevu."' },
        { role: 'user', content: 'OK, je note ce risque. On va l\'ajouter au registre. Sophie, on priorise les stories du tunnel d\'achat pour ce sprint ?' },
        { role: 'assistant', content: 'Sophie : "Oui, exactement. Les 5 stories du tunnel d\'achat + 3 stories de l\'authentification. Ca fait 38 points, ca laisse de la marge pour les imprevus."\nChloe : "Parfait. Je suggere qu\'on garde 7 points de buffer. Marie, tu valides ?"' },
        { role: 'user', content: 'Oui, 38 points + buffer ca me va. On definit le Definition of Done : code review, tests unitaires > 80%, demo PO validee. Lucas, c\'est realiste ?' },
        { role: 'assistant', content: 'Lucas : "Oui, on peut tenir ca. Je mets en place SonarQube pour le suivi qualite automatise."' },
      ],
      summary: {
        summary: 'Sprint 1 scope : 8 stories (38 points) focus tunnel achat + authentification. Risque identifie sur migration Magento. Buffer de 7 points. DoD valide.',
        keyDecisions: ['Scope Sprint 1 : 38 points + 7 buffer', 'Priorite tunnel achat + auth', 'SonarQube pour qualite code'],
        actionItems: [
          { assignee: 'Marie', action: 'Mettre a jour le registre des risques (migration Magento)', deadline: 'J+1' },
          { assignee: 'Lucas', action: 'Configurer SonarQube', deadline: 'J+2' },
        ],
      },
    },
    {
      phaseOrder: 2, title: 'Comite de pilotage mi-sprint 2', type: 'STEERING', status: 'COMPLETED' as const,
      objectives: ['Bilan sprint 1', 'Impact depart Emma', 'Ajustement planning'],
      startedAt: daysAgo(15), completedAt: daysAgo(15),
      participants: [
        { name: 'Pierre Durand', role: 'Sponsor', personality: 'ASSERTIVE', cooperationLevel: 3 },
        { name: 'Sophie Blanc', role: 'Product Owner', personality: 'COOPERATIVE', cooperationLevel: 4 },
        { name: 'Lucas Martin', role: 'Tech Lead', personality: 'COOPERATIVE', cooperationLevel: 4 },
      ],
      messages: [
        { role: 'system', content: 'Comite de pilotage : bilan mi-parcours.' },
        { role: 'user', content: 'Bonjour a tous. Avant de commencer, voici les metriques cles : budget consomme 28%, avancement fonctionnel 40%, velocite equipe +12% vs prevision. Par contre, nous avons un point critique a aborder : le depart d\'Emma.' },
        { role: 'assistant', content: 'Pierre Durand : "40% d\'avancement pour 30% du temps ecoule, c\'est correct. Mais le depart d\'Emma m\'inquiete. Quel est l\'impact sur le planning ?"' },
        { role: 'user', content: 'J\'ai fait appel a un freelance senior React qui commence lundi. L\'impact estime est de 1 semaine de retard maximum, le temps qu\'il monte en competence sur le projet.' },
        { role: 'assistant', content: 'Lucas : "Le freelance a un bon profil, j\'ai valide ses references. Le risque est maitrise."\nPierre : "OK. Marie, je veux un plan de contingence au cas ou le freelance ne convient pas. Et je rappelle : la deadline n\'est pas negociable."' },
        { role: 'user', content: 'Compris Pierre. J\'ai deja identifie 2 profils de backup en ESN. Sophie, ou en est le backlog pour le sprint 2 ?' },
        { role: 'assistant', content: 'Sophie : "Sprint 2 focus sur les paiements multi-devises et le back-office. 42 points prevus. C\'est ambitieux mais faisable si le freelance est operationnel rapidement."' },
      ],
      summary: {
        summary: 'Avancement 40% conforme. Depart Emma compense par un freelance senior. Risque maitrise avec plan de backup. Sprint 2 ambitieux (42 pts) focus paiements + back-office.',
        keyDecisions: ['Freelance senior valide pour remplacer Emma', 'Plan de backup ESN en reserve', 'Sprint 2 maintenu a 42 points'],
        actionItems: [
          { assignee: 'Marie', action: 'Onboarding freelance + plan de contingence', deadline: 'Lundi' },
          { assignee: 'Lucas', action: 'Pair programming avec le freelance semaine 1', deadline: 'Sprint 2' },
        ],
      },
    },
    {
      phaseOrder: 3, title: 'Demo client Sprint 2', type: 'REVIEW', status: 'SCHEDULED' as const,
      objectives: ['Presenter le tunnel de paiement', 'Valider le back-office analytics', 'Recueillir les feedbacks'],
      startedAt: null, completedAt: null,
      participants: [
        { name: 'Pierre Durand', role: 'Sponsor', personality: 'ASSERTIVE', cooperationLevel: 3 },
        { name: 'Sophie Blanc', role: 'Product Owner', personality: 'COOPERATIVE', cooperationLevel: 5 },
      ],
      messages: [],
      summary: null,
    },
  ];

  for (const m of meetingDefs) {
    const meeting = await prisma.meeting.create({
      data: {
        simulationId: simulation.id,
        phaseOrder: m.phaseOrder,
        title: m.title,
        type: m.type,
        objectives: m.objectives,
        durationMinutes: 30,
        status: m.status,
        startedAt: m.startedAt,
        completedAt: m.completedAt,
        participants: {
          create: m.participants.map((p, i) => ({
            name: p.name,
            role: p.role,
            personality: p.personality,
            cooperationLevel: p.cooperationLevel,
            avatar: `/media/avatars/300-${(i + 10) % 36 + 1}.png`,
          })),
        },
      },
    });

    if (m.messages.length > 0) {
      await prisma.meetingMessage.createMany({
        data: m.messages.map((msg, i) => ({
          meetingId: meeting.id,
          role: msg.role,
          content: msg.content,
          createdAt: new Date((m.startedAt ?? now).getTime() + i * 60000),
        })),
      });
    }

    if (m.summary) {
      await prisma.meetingSummary.create({
        data: {
          meetingId: meeting.id,
          summary: m.summary.summary,
          keyDecisions: m.summary.keyDecisions,
          actionItems: m.summary.actionItems,
        },
      });
    }
  }
  console.log(`Reunions creees (${meetingDefs.length}, dont 1 planifiee)`);

  // ─── 12. Livrables (7, avec evaluations) ──────────────
  const deliverableDefs = [
    {
      phaseOrder: 0, title: 'Charte de projet', type: 'charter', status: 'VALIDATED' as const,
      dueDate: daysAgo(40), submittedAt: daysAgo(41), revisionNumber: 1,
      content: `# Charte de Projet — Refonte E-commerce TechShop

## 1. Contexte
TechShop International, leader de la vente en ligne de produits tech en Europe, souhaite refondre integralement sa plateforme e-commerce pour repondre aux enjeux de croissance 2024-2025.

## 2. Objectifs
- Doubler le taux de conversion (de 2.1% a 4.2%)
- Ouvrir 3 nouveaux marches (DE, ES, IT)
- Reduire le temps de chargement moyen de 4.2s a 1.5s
- Augmenter le panier moyen de 15%

## 3. Perimetre
**In scope :** Refonte front-end, nouveau tunnel d'achat, paiements multi-devises, back-office analytics, migration des donnees
**Out of scope :** Application mobile native, programme de fidelite, marketplace tiers

## 4. Budget : 280 000 EUR
## 5. Planning : 5 sprints de 2 semaines (10 semaines)
## 6. Equipe : 6 personnes + 1 PM
## 7. Risques majeurs : Migration donnees, disponibilite equipe, complexite paiements multi-devises`,
      evaluation: {
        score: 82, grade: 'B',
        positives: ['Objectifs SMART bien definis', 'Perimetre clair avec in/out scope', 'Budget et planning realistes'],
        improvements: ['Manque la matrice RACI', 'Criteres de succes non mesurables pour certains objectifs'],
        missingElements: ['Plan de communication', 'Processus d\'escalade'],
        recommendations: ['Ajouter une section gouvernance', 'Detailler les jalons cles'],
      },
    },
    {
      phaseOrder: 1, title: 'WBS (Work Breakdown Structure)', type: 'wbs', status: 'VALIDATED' as const,
      dueDate: daysAgo(30), submittedAt: daysAgo(31), revisionNumber: 2,
      content: `# WBS — Refonte E-commerce TechShop

## 1. Initiation (Sprint 0)
- 1.1 Setup environnement dev/staging/prod
- 1.2 Configuration CI/CD (GitHub Actions)
- 1.3 Architecture technique documentee

## 2. Sprint 1 — Tunnel d'achat
- 2.1 Page catalogue (listing, filtres, tri)
- 2.2 Fiche produit (galerie, variantes, stock)
- 2.3 Panier (ajout, modification, suppression)
- 2.4 Checkout step 1 — Identification
- 2.5 Checkout step 2 — Livraison

## 3. Sprint 2 — Paiements & Back-office
- 3.1 Integration Stripe multi-devises
- 3.2 Page de confirmation et suivi commande
- 3.3 Back-office : dashboard analytics
- 3.4 Back-office : gestion produits

## 4. Sprint 3 — Migration & Tests
- 4.1 Migration produits (500K items)
- 4.2 Migration comptes clients (2M)
- 4.3 Tests E2E automatises
- 4.4 Tests de performance

## 5. Sprint 4 — Go-live
- 5.1 Deploiement progressif (canary)
- 5.2 Monitoring et alerting
- 5.3 Documentation utilisateur
- 5.4 Formation equipe support`,
      evaluation: {
        score: 78, grade: 'B',
        positives: ['Decoupage logique par sprint', 'Taches granulaires et claires', 'Inclusion des taches de test et deploiement'],
        improvements: ['Estimation d\'effort manquante par tache', 'Dependencies entre lots non explicitees'],
        missingElements: ['Diagramme de Gantt', 'Chemin critique', 'Estimation en story points'],
        recommendations: ['Ajouter les estimations et les dependencies', 'Identifier le chemin critique'],
      },
    },
    {
      phaseOrder: 1, title: 'Plan de communication', type: 'communication_plan', status: 'VALIDATED' as const,
      dueDate: daysAgo(28), submittedAt: daysAgo(29), revisionNumber: 1,
      content: `# Plan de Communication — Projet TechShop

## Parties prenantes
| Partie prenante | Role | Frequence | Canal | Responsable |
|---|---|---|---|---|
| Pierre Durand | Sponsor | Hebdo | Rapport + call | Marie |
| Sophie Blanc | Product Owner | Quotidien | Slack + daily | Chloe |
| Equipe dev | Executants | Quotidien | Slack + standup | Chloe |
| Equipe QA | Testeurs | Bi-hebdo | Jira + Slack | Nathan |
| Support TechShop | Operationnel | Mensuel | Email + training | Marie |

## Reunions recurrentes
- **Daily standup** : 9h30, 15min, toute l'equipe
- **Sprint review** : fin de sprint, 1h, PO + equipe + sponsor
- **Retrospective** : fin de sprint, 45min, equipe
- **COPIL** : bi-mensuel, 1h, sponsor + PM + PO + Tech Lead`,
      evaluation: {
        score: 85, grade: 'A',
        positives: ['Matrice de communication complete', 'Frequences adaptees par partie prenante', 'Canaux de communication bien definis'],
        improvements: ['Manque un plan de gestion des conflits', 'Pas de processus d\'escalade formalise'],
        missingElements: ['Modeles de rapports'],
        recommendations: ['Ajouter les modeles de reporting'],
      },
    },
    {
      phaseOrder: 2, title: 'Registre des risques', type: 'risk_register', status: 'SUBMITTED' as const,
      dueDate: daysAgo(12), submittedAt: daysAgo(13), revisionNumber: 1,
      content: `# Registre des Risques — Projet TechShop

| # | Risque | Probabilite | Impact | Score | Mitigation | Responsable | Statut |
|---|--------|-------------|--------|-------|-----------|-------------|--------|
| R1 | Migration donnees complexe | Haute | Tres haut | 20 | Migration incrementale par lots | Lucas | En cours |
| R2 | Depart membre equipe cle | Moyenne | Haut | 12 | Plan de backup ESN + doc technique | Marie | Realise |
| R3 | Faille securite paiements | Faible | Critique | 15 | Audit OWASP + tests penetration | Hugo | Planifie |
| R4 | Retard fournisseur cloud | Moyenne | Moyen | 9 | Multi-region + plan de bascule | Lucas | Actif |
| R5 | Changement de perimetre | Haute | Moyen | 12 | Change control process strict | Marie | Actif |
| R6 | Performance insuffisante | Moyenne | Haut | 12 | Tests de charge des Sprint 2 | Nathan | Planifie |`,
      evaluation: {
        score: 72, grade: 'B',
        positives: ['Risques pertinents et bien identifies', 'Scoring correct', 'Responsables assignes'],
        improvements: ['Manque l\'analyse quantitative (EMV)', 'Plans de contingence non detailles'],
        missingElements: ['Matrice probabilite/impact visuelle', 'Budget reserve pour risques'],
        recommendations: ['Calculer l\'EMV pour chaque risque', 'Definir un budget de contingence'],
      },
    },
    {
      phaseOrder: 2, title: 'Rapport d\'avancement Sprint 1', type: 'progress_report', status: 'VALIDATED' as const,
      dueDate: daysAgo(15), submittedAt: daysAgo(16), revisionNumber: 1,
      content: `# Rapport d'Avancement — Sprint 1

## Metriques cles
- **Velocite** : 42 points / 38 prevus (+10.5%)
- **Budget consomme** : 22% (62K / 280K)
- **Defauts detectes** : 12 (8 corriges, 4 mineurs en backlog)
- **Couverture de tests** : 84%

## Livrables termines
- Catalogue produits avec filtres avances
- Fiche produit complete (galerie, variantes, stock temps reel)
- Panier fonctionnel
- Checkout etapes 1-2

## Points d'attention
- Migration Magento plus complexe que prevu (+20% effort)
- Performance page catalogue : 2.8s (objectif 1.5s) — optimisation prevue Sprint 2

## Actions Sprint 2
- Integration Stripe multi-devises
- Back-office analytics (phase 1)
- Optimisation performances front-end`,
      evaluation: {
        score: 88, grade: 'A',
        positives: ['Metriques claires et comparees aux previsions', 'Transparence sur les points d\'attention', 'Actions correctives identifiees'],
        improvements: ['Ajouter l\'EVM (Earned Value Management)', 'Graphique burndown manquant'],
        missingElements: ['Courbe en S du budget'],
        recommendations: ['Integrer l\'analyse de la valeur acquise'],
      },
    },
    {
      phaseOrder: 3, title: 'Cahier de tests Sprint 2', type: 'test_plan', status: 'DRAFT' as const,
      dueDate: daysFromNow(3), submittedAt: null, revisionNumber: 0,
      content: `# Plan de Tests — Sprint 2 (en cours de redaction)

## Scope
- Tests fonctionnels tunnel de paiement
- Tests multi-devises (EUR, GBP, CHF)
- Tests de performance back-office

## TODO
- [ ] Definir les cas de test paiement
- [ ] Preparer les jeux de donnees
- [ ] Configurer l'environnement de test`,
      evaluation: null,
    },
    {
      phaseOrder: 3, title: 'Documentation API Paiements', type: 'technical_spec', status: 'DRAFT' as const,
      dueDate: daysFromNow(7), submittedAt: null, revisionNumber: 0,
      content: null,
      evaluation: null,
    },
  ];

  for (const d of deliverableDefs) {
    const deliverable = await prisma.userDeliverable.create({
      data: {
        simulationId: simulation.id,
        phaseOrder: d.phaseOrder,
        title: d.title,
        type: d.type,
        status: d.status,
        content: d.content,
        dueDate: d.dueDate,
        submittedAt: d.submittedAt,
        revisionNumber: d.revisionNumber,
        lastSavedAt: d.content ? d.submittedAt ?? daysAgo(1) : null,
      },
    });

    if (d.evaluation) {
      await prisma.deliverableEvaluation.create({
        data: {
          deliverableId: deliverable.id,
          revisionNumber: d.revisionNumber,
          score: d.evaluation.score,
          grade: d.evaluation.grade,
          positives: d.evaluation.positives,
          improvements: d.evaluation.improvements,
          missingElements: d.evaluation.missingElements,
          incorrectElements: [],
          recommendations: d.evaluation.recommendations,
          pmiOutputsCovered: [],
          pmiOutputsMissing: [],
        },
      });
    }
  }
  console.log(`Livrables crees (${deliverableDefs.length}, dont 4 evalues)`);

  // ─── 13. Emails simules (6 emails) ────────────────────
  const emailDefs = [
    {
      senderName: 'Claire Fontaine', senderRole: 'DRH', senderEmail: 'claire.fontaine@techshop.com',
      subject: 'Bienvenue dans l\'equipe projet TechShop !', priority: 'NORMAL' as const, status: 'READ' as const,
      phaseOrder: 0, triggerType: 'welcome',
      body: `Chere Marie,

Au nom de toute l'equipe TechShop, je suis ravie de vous accueillir en tant que cheffe de projet pour notre refonte e-commerce.

Votre experience en gestion de projet IT sera un atout precieux pour mener a bien cette transformation numerique. Pierre Durand, notre DG, attend beaucoup de ce projet qui est strategique pour notre croissance 2025.

Voici vos premiers interlocuteurs :
- Sophie Blanc (Product Owner) — sophie.blanc@techshop.com
- Lucas Martin (Tech Lead) — lucas.martin@techshop.com

N'hesitez pas a me contacter si vous avez des questions d'ordre organisationnel.

Bonne integration !
Claire`,
      userResponse: 'Merci Claire pour cet accueil chaleureux ! Je suis tres motivee par ce projet. J\'ai deja pris contact avec Sophie et Lucas pour organiser le kick-off. Pourriez-vous me transmettre l\'organigramme de l\'equipe et les procedures internes de TechShop ?',
      responseScore: 85,
    },
    {
      senderName: 'Pierre Durand', senderRole: 'Sponsor', senderEmail: 'pierre.durand@techshop.com',
      subject: 'Rappel : objectifs Q1 et deadlines', priority: 'HIGH' as const, status: 'READ' as const,
      phaseOrder: 1, triggerType: 'phase_start',
      body: `Marie,

Je vous rappelle que la demo du tunnel d'achat au board est prevue le 15 du mois prochain. C'est un jalon critique pour debloquer le budget de la phase 2.

Les KPIs que je suivrai personnellement :
1. Temps de chargement < 2s
2. Tunnel d'achat fonctionnel de bout en bout
3. Taux de couverture de tests > 80%

Je compte sur vous.

Pierre Durand
Directeur General`,
      userResponse: 'Pierre, merci pour ce rappel. Je vous confirme que nous sommes en bonne voie pour la demo. Le tunnel d\'achat est fonctionnel a 80% et la couverture de tests est a 84%. Je vous enverrai un rapport detaille vendredi.',
      responseScore: 90,
    },
    {
      senderName: 'Sophie Blanc', senderRole: 'Client', senderEmail: 'sophie.blanc@techshop.com',
      subject: 'Demande de changement : wishlist et comparateur', priority: 'NORMAL' as const, status: 'READ' as const,
      phaseOrder: 3, triggerType: 'change_request',
      body: `Bonjour Marie,

Suite aux retours utilisateurs de la beta, nous aimerions ajouter 3 fonctionnalites au scope :
1. Wishlist (liste de souhaits) — impact estime : 8 points
2. Comparateur de produits — impact estime : 13 points
3. Avis verifies (integration Trustpilot) — impact estime : 5 points

Total : 26 points supplementaires.

Je sais que c'est un changement de perimetre, mais les retours utilisateurs sont tres clairs sur ces besoins.

Qu'en pensez-vous ?

Sophie`,
      userResponse: 'Sophie, merci pour ces retours precieux. Je comprends l\'importance de ces features pour les utilisateurs. Apres analyse avec l\'equipe, je propose : 1) Wishlist integree au Sprint 2 actuel (compatible avec notre capacite), 2) Comparateur et avis Trustpilot planifies pour le Sprint 3. Cela necessite un avenant formel au scope — je prepare le document de change request pour validation du sponsor.',
      responseScore: 92,
    },
    {
      senderName: 'Hugo Petit', senderRole: 'Membre equipe', senderEmail: 'hugo.petit@techshop.com',
      subject: 'URGENT — Faille XSS detectee en staging', priority: 'URGENT' as const, status: 'UNREAD' as const,
      phaseOrder: 3, triggerType: 'event_reaction',
      body: `Marie,

Je viens de detecter une vulnerabilite XSS sur le formulaire de paiement en staging. Un attaquant pourrait injecter du code malveillant dans le champ "nom du titulaire de carte".

Niveau de severite : CRITIQUE
Impact potentiel : Vol de donnees de paiement
Environnement affecte : Staging uniquement (pas encore en prod)

J'ai deja :
- Documente la faille dans notre outil de ticketing
- Bloque le deploiement automatique vers la prod
- Prepare un correctif (PR #247) en attente de review

Il faut prendre une decision rapidement : est-ce qu'on arrete le sprint pour traiter ca en priorite ?

Hugo`,
      userResponse: null, responseScore: null,
    },
    {
      senderName: 'Nathan Roux', senderRole: 'Membre equipe', senderEmail: 'nathan.roux@techshop.com',
      subject: 'Rapport de tests Sprint 1 — 84% couverture', priority: 'NORMAL' as const, status: 'READ' as const,
      phaseOrder: 2, triggerType: 'decision_followup',
      body: `Bonjour Marie,

Voici le bilan des tests Sprint 1 :
- Tests unitaires : 312 passes, 0 fails, couverture 84%
- Tests E2E : 28 scenarios, 26 passes, 2 flaky (en investigation)
- Tests de performance : page catalogue 2.8s (objectif 1.5s) — a optimiser

Les 2 tests flaky concernent le panier en mode mobile. J'ai identifie la cause : un timing issue avec l'animation CSS. Correction prevue Sprint 2.

La performance du catalogue est le point d'attention principal. Lucas a propose d'implementer du lazy loading et de la mise en cache cote serveur.

Nathan`,
      userResponse: 'Merci Nathan pour ce rapport detaille. 84% de couverture c\'est bien, on vise 90% pour le Sprint 2. Pour la performance catalogue, je valide l\'approche de Lucas (lazy loading + cache). Peux-tu ajouter des tests de charge specifiques pour valider l\'objectif de 1.5s ?',
      responseScore: 88,
    },
    {
      senderName: 'Pierre Durand', senderRole: 'Sponsor', senderEmail: 'pierre.durand@techshop.com',
      subject: 'RE: Rapport hebdomadaire semaine 6', priority: 'NORMAL' as const, status: 'UNREAD' as const,
      phaseOrder: 3, triggerType: 'decision_followup',
      body: `Marie,

Merci pour le rapport. Je note que le budget est a 72% du prevu et les delais a 65%. C'est preoccupant.

Pouvez-vous me preparer un plan de rattrapage pour le prochain COPIL ? Je veux comprendre :
1. Les causes exactes du depassement
2. Les options pour revenir dans les clous
3. L'impact sur la date de go-live

Pierre`,
      userResponse: null, responseScore: null,
    },
  ];

  for (const e of emailDefs) {
    await prisma.simulatedEmail.create({
      data: {
        simulationId: simulation.id,
        tenantId: tenant.id,
        senderName: e.senderName,
        senderRole: e.senderRole,
        senderEmail: e.senderEmail,
        subject: e.subject,
        body: e.body,
        priority: e.priority,
        status: e.status,
        phaseOrder: e.phaseOrder,
        triggerType: e.triggerType,
        userResponse: e.userResponse,
        responseScore: e.responseScore,
        scheduledAt: daysAgo(45 - e.phaseOrder * 10),
        createdAt: daysAgo(45 - e.phaseOrder * 10),
      },
    });
  }
  console.log(`Emails simules crees (${emailDefs.length}, dont 2 non lus)`);

  // ─── 14. Conversation PMO ──────────────────────────────
  const pmoConversation = await prisma.pmoConversation.create({
    data: {
      simulationId: simulation.id,
      messages: {
        create: [
          { role: 'system', content: 'Conversation initialisee. Agent PMO pret pour la simulation TechShop.', createdAt: daysAgo(44) },
          { role: 'assistant', content: 'Bonjour Marie ! Je suis votre agent PMO pour le projet TechShop. Je suis la pour vous accompagner tout au long de la simulation. N\'hesitez pas a me poser des questions sur la gestion de projet, les livrables a produire, ou les bonnes pratiques PMI.\n\nJe vois que vous etes en phase d\'Initiation. Votre premier livrable a rendre est la **Charte de projet**. Avez-vous besoin d\'aide pour la rediger ?', createdAt: daysAgo(44) },
          { role: 'user', content: 'Oui, quels sont les elements essentiels d\'une charte de projet selon le PMBOK ?', createdAt: daysAgo(44) },
          { role: 'assistant', content: 'Excellente question ! Selon le PMBOK (6e edition), la charte de projet doit contenir :\n\n1. **Justification du projet** — pourquoi ce projet existe\n2. **Objectifs mesurables** — criteres SMART\n3. **Exigences de haut niveau** — besoins cles des parties prenantes\n4. **Description du projet** — perimetre macro\n5. **Risques de haut niveau** — principaux risques identifies\n6. **Jalons cles** — dates importantes\n7. **Budget resumé**\n8. **Criteres de succes** — comment on mesure la reussite\n9. **Chef de projet designe** — vous, Marie !\n10. **Autorite du sponsor** — qui valide quoi\n\nPour TechShop, je vous suggere de bien mettre en avant les objectifs business (taux de conversion, nouveaux marches) et le perimetre clair (in/out scope). Le sponsor Pierre Durand appreciera la precision.\n\nVoulez-vous que je vous aide a structurer chaque section ?', createdAt: daysAgo(44) },
          { role: 'user', content: 'Comment gerer le changement de perimetre demande par Sophie pour la wishlist et le comparateur ?', createdAt: daysAgo(4) },
          { role: 'assistant', content: 'C\'est un cas classique de **change control** ! Voici la demarche recommandee :\n\n1. **Documenter la demande** — Remplissez un formulaire de Change Request avec : description, justification, impact estime (cout, delai, qualite)\n\n2. **Analyser l\'impact** — Les 26 points supplementaires representent environ 60% de la capacite d\'un sprint. C\'est significatif !\n\n3. **Proposer des options** au sponsor :\n   - **Option A** : Tout integrer → +1 sprint, +40K EUR\n   - **Option B** : Prioriser (wishlist maintenant, reste en V2) → impact minimal\n   - **Option C** : Refuser → risque d\'insatisfaction utilisateur\n\n4. **Decision du CCB** (Change Control Board) — Pierre doit valider\n\nVotre reponse a Sophie etait tres pertinente : prioriser la wishlist et reporter le reste. C\'est l\'**Option B**, qui preserve le planning tout en montrant de la flexibilite.\n\n> **Rappel PMI** : Le processus 4.6 "Maitriser les modifications" exige que tout changement soit trace et approuve formellement.\n\nAvez-vous prepare le document de Change Request ?', createdAt: daysAgo(4) },
          { role: 'user', content: 'Pierre me demande un plan de rattrapage pour le budget et les delais. Comment structurer ca ?', createdAt: hoursAgo(5) },
          { role: 'assistant', content: 'Voici comment structurer votre **plan de rattrapage** pour le COPIL :\n\n## 1. Diagnostic (Causes des ecarts)\n- **Budget (72%)** : Recrutement freelance (+12K), audit securite imprevue (+8K)\n- **Delais (65%)** : Depart d\'Emma (-1 semaine), complexite migration Magento (+20% effort)\n\n## 2. Options de rattrapage\n\n| Option | Budget | Delai | Risque |\n|--------|--------|-------|--------|\n| A — Crashing (heures sup) | -15K | +1 semaine | Fatigue equipe |\n| B — Fast tracking (paralleliser) | Neutre | +2 semaines | Qualite |\n| C — Reduire le scope Sprint 3 | +10K | Conforme | Fonctionnalites reportees |\n\n## 3. Recommandation\nJe vous suggere l\'**Option C** combinee avec du fast tracking cible. Concretement :\n- Reporter les features non critiques (comparateur, avis) en V2\n- Paralleliser les tests de performance avec le dev Sprint 3\n- Garder la date de go-live\n\n## 4. Plan d\'action\nIncluez un Gantt revise avec les jalons mis a jour.\n\n> **Attention** : Vous avez aussi une **decision en attente** concernant l\'incident de securite. Pierre va probablement vous interroger dessus au COPIL. Preparez votre reponse !\n\nBesoin d\'aide pour rediger le document ?', createdAt: hoursAgo(4) },
        ],
      },
    },
  });
  console.log(`Conversation PMO creee (${8} messages)`);

  // ─── 15. Badge de competence (simulation precedente) ──
  await prisma.competencyBadge.create({
    data: {
      userId: demoUser.id,
      simulationId: simulation.id,
      tenantId: tenant.id,
      title: 'Chef de Projet Junior',
      description: 'A demontre des competences solides en planification et communication lors d\'un projet IT de complexite moyenne.',
      scenarioTitle: 'Formation initiale — Projet Web',
      sector: 'IT',
      difficulty: 'INTERMEDIATE',
      globalScore: 74,
      competencyScores: {
        planification: 78, communication: 85, risques: 65,
        leadership: 72, rigueur: 80, adaptabilite: 70,
      },
      strengths: ['Communication claire avec les parties prenantes', 'Bonne structuration des livrables', 'Respect des processus PMI'],
      improvements: ['Analyse quantitative des risques', 'Gestion budgetaire en situation de crise'],
      recommendations: ['Suivre une formation en analyse financiere', 'Pratiquer l\'Earned Value Management'],
      debriefingSummary: 'Marie a demontre une bonne maitrise des fondamentaux de la gestion de projet. Sa communication avec les parties prenantes est son point fort. Elle doit progresser sur l\'analyse quantitative des risques et la gestion budgetaire en situation de crise pour atteindre le niveau senior.',
      durationMinutes: 320,
      createdAt: daysAgo(60),
    },
  });
  console.log('Badge de competence cree');

  // ─── 16. Token usage (pour le dashboard IA) ───────────
  const operations = ['meeting_response', 'decision_analysis', 'feedback_generation', 'pmo_chat', 'deliverable_evaluation'];
  for (let i = 0; i < 15; i++) {
    await prisma.aiTokenUsage.create({
      data: {
        tenantId: tenant.id,
        userId: demoUser.id,
        simulationId: simulation.id,
        provider: i % 3 === 0 ? 'openai' : 'anthropic',
        model: i % 3 === 0 ? 'gpt-4o' : 'claude-sonnet-4-20250514',
        operation: operations[i % operations.length],
        inputTokens: 500 + Math.floor(Math.random() * 2000),
        outputTokens: 200 + Math.floor(Math.random() * 1500),
        createdAt: daysAgo(45 - i * 3),
      },
    });
  }
  console.log('Token usage cree (15 entrees)');

  // ─── Resume ────────────────────────────────────────────
  console.log('\n========================================');
  console.log('  SEED DEMO COMPLET !');
  console.log('========================================');
  console.log(`  Email    : demo@sim360.dev`);
  console.log(`  Password : Demo123!`);
  console.log('');
  console.log('  Parcours :');
  console.log('  - Onboarding complet (profil REINFORCEMENT)');
  console.log('  - 1 simulation IT en cours (phase 3/5)');
  console.log('  - 6 decisions (5 prises, 1 en attente)');
  console.log('  - 3 evenements aleatoires resolus');
  console.log('  - 4 reunions (3 terminees avec CR, 1 planifiee)');
  console.log('  - 7 livrables (4 evalues, 1 soumis, 2 brouillons)');
  console.log('  - 6 emails (4 avec reponse, 2 non lus)');
  console.log('  - Conversation PMO (8 messages)');
  console.log('  - Evolution KPIs (10 snapshots)');
  console.log('  - 1 badge de competence');
  console.log('  - 15 entrees token usage');
  console.log('========================================\n');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
