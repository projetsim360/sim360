/**
 * Additional seed scenarios covering more sectors (user test feedback: catalogue was IT/finance only).
 * Data is compact on purpose; `seedSectorScenarios` expands it into Scenario → ScenarioPhase →
 * Meeting/Decision/RandomEvent templates. Idempotent: phases (and their templates) are recreated
 * on every run, scenario fields are refreshed.
 */
import {
  Difficulty,
  PhaseType,
  PrismaClient,
  RandomEventType,
  Sector,
  Severity,
  TenantPlan,
} from '@prisma/client';

/** [budget, schedule, quality, teamMorale, riskLevel] */
type Impact = [number, number, number, number, number];
type Option = [label: string, description: string, impact: Impact];

interface ParticipantSeed {
  name: string;
  role: string;
  personality: 'COOPERATIVE' | 'NEUTRAL' | 'RESISTANT' | 'DIPLOMATIC' | 'AGGRESSIVE';
  cooperationLevel: number;
  seniority: 'EXECUTIVE' | 'SENIOR' | 'INTERMEDIATE' | 'JUNIOR';
  objectives: string;
  constraints: string;
  communicationStyle: string;
}

interface PhaseSeed {
  name: string;
  type: PhaseType;
  durationDays: number;
  description: string;
  meeting: {
    title: string;
    description: string;
    type: 'KICKOFF' | 'STANDUP' | 'STEERING' | 'RETROSPECTIVE' | 'CRISIS';
    objectives: string[];
    durationMinutes: number;
    participants: ParticipantSeed[];
  };
  decision?: { title: string; context: string; optimalOption: number; options: Option[] };
  event?: {
    type: RandomEventType;
    title: string;
    description: string;
    severity: Severity;
    probability: number;
    options: Option[];
  };
}

interface ScenarioSeed {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  sector: Sector;
  difficulty: Difficulty;
  estimatedDurationHours: number;
  competencies: string[];
  project: {
    name: string;
    client: string;
    description: string;
    initialBudget: number;
    deadlineDays: number;
    team: Array<{ name: string; role: string; expertise: 'JUNIOR' | 'INTERMEDIATE' | 'SENIOR'; personality: string; morale: number }>;
    deliverables: string[]; // one per phase, in phase order
  };
  initialKpis: { budget: number; schedule: number; quality: number; teamMorale: number; riskLevel: number };
  phases: PhaseSeed[];
}

const impact = ([budget, schedule, quality, teamMorale, riskLevel]: Impact) => ({
  budget,
  schedule,
  quality,
  teamMorale,
  riskLevel,
});
const options = (opts: Option[]) => opts.map(([label, description, i]) => ({ label, description, kpiImpact: impact(i) }));

const P = (
  name: string,
  role: string,
  seniority: ParticipantSeed['seniority'],
  personality: ParticipantSeed['personality'],
  cooperationLevel: number,
  objectives: string,
  constraints: string,
  communicationStyle: string,
): ParticipantSeed => ({ name, role, seniority, personality, cooperationLevel, objectives, constraints, communicationStyle });

// ─── Scenarios ──────────────────────────────────────────────────────────────

export const SECTOR_SCENARIOS: ScenarioSeed[] = [
  // ── Construction ────────────────────────────────────────────────────────
  {
    id: 'seed-scenario-construction-ecole',
    title: 'Agrandissement d’une école primaire',
    description:
      'Vous êtes chargé de projet pour l’ajout de six classes et d’un gymnase à une école primaire en activité. Les travaux doivent se faire sans interrompre les cours, avec un budget de 8,4 M$ et une livraison avant la rentrée suivante.',
    objectives: [
      'Livrer l’agrandissement avant la rentrée scolaire',
      'Respecter le budget de 8,4 M$ (contingence incluse)',
      'Zéro accident avec arrêt de travail sur le chantier',
      'Maintenir les cours sans interruption pendant les travaux',
    ],
    sector: Sector.CONSTRUCTION,
    difficulty: Difficulty.BEGINNER,
    estimatedDurationHours: 3,
    competencies: ['planification', 'gestion-risques', 'communication', 'sante-securite'],
    project: {
      name: 'Agrandissement École des Bouleaux',
      client: 'Centre de services scolaire des Rivières',
      description: 'Ajout de six classes et d’un gymnase, réaménagement de la cour et des accès, travaux en milieu occupé.',
      initialBudget: 8_400_000,
      deadlineDays: 300,
      team: [
        { name: 'Martin Gagnon', role: 'Surintendant de chantier', expertise: 'SENIOR', personality: 'NEUTRAL', morale: 75 },
        { name: 'Isabelle Roy', role: 'Architecte', expertise: 'SENIOR', personality: 'COOPERATIVE', morale: 80 },
        { name: 'Kevin Tremblay', role: 'Estimateur', expertise: 'INTERMEDIATE', personality: 'COOPERATIVE', morale: 70 },
        { name: 'Nadia Bouchard', role: 'Coordonnatrice santé-sécurité', expertise: 'INTERMEDIATE', personality: 'NEUTRAL', morale: 75 },
      ],
      deliverables: ['Charte de projet', 'Échéancier directeur et plan de phasage', 'Rapports d’avancement de chantier', 'Registre des déficiences', 'Dossier de fin de travaux'],
    },
    initialKpis: { budget: 100, schedule: 100, quality: 80, teamMorale: 75, riskLevel: 25 },
    phases: [
      {
        name: 'Démarrage',
        type: PhaseType.INITIATION,
        durationDays: 20,
        description: 'Confirmer la portée, les contraintes de l’école en activité et la gouvernance du projet.',
        meeting: {
          title: 'Réunion de démarrage avec le centre de services',
          description: 'Présenter le projet, valider les contraintes d’exploitation de l’école et la gouvernance.',
          type: 'KICKOFF',
          objectives: ['Valider la portée et le budget', 'Fixer les contraintes de cohabitation avec l’école', 'Définir le circuit d’approbation'],
          durationMinutes: 45,
          participants: [
            P('Louise Bergeron', 'Directrice des ressources matérielles (client)', 'EXECUTIVE', 'DIPLOMATIC', 4, 'Livrer à la rentrée sans dépassement de budget', 'Budget voté par le conseil, aucune marge politique', 'Posée, chiffre tout'),
            P('Daniel Côté', 'Directeur de l’école', 'SENIOR', 'RESISTANT', 2, 'Protéger les élèves du bruit et de la poussière', 'Examens de juin, sorties d’urgence à maintenir', 'Inquiet, revient souvent sur la sécurité des enfants'),
            P('Isabelle Roy', 'Architecte', 'SENIOR', 'COOPERATIVE', 4, 'Obtenir des décisions rapides sur les plans', 'Délais de la ville pour le permis', 'Technique, précise'),
          ],
        },
        decision: {
          title: 'Mode de réalisation',
          context: 'Le client vous demande de recommander le mode de réalisation. La date de rentrée est ferme et le marché des entrepreneurs est saturé.',
          optimalOption: 1,
          options: [
            ['Conception-soumission-construction classique', 'Plans complets avant appel d’offres. Prévisible, mais long : la rentrée est en risque.', [5, -15, 5, 0, 10]],
            ['Gérance de construction avec lots accélérés', 'Lancer les fondations pendant la fin des plans. Plus rapide, demande une coordination serrée.', [-5, 10, 0, 5, 0]],
            ['Clé en main avec un entrepreneur général', 'Un seul contrat, mais moins de contrôle sur la qualité et les choix techniques.', [0, 5, -10, 0, 5]],
          ],
        },
      },
      {
        name: 'Planification',
        type: PhaseType.PLANNING,
        durationDays: 40,
        description: 'Établir l’échéancier directeur, le phasage autour des horaires scolaires et le plan santé-sécurité.',
        meeting: {
          title: 'Atelier de phasage des travaux',
          description: 'Construire le phasage des travaux bruyants autour du calendrier scolaire.',
          type: 'STEERING',
          objectives: ['Arrêter les fenêtres de travaux bruyants', 'Valider le plan de circulation du chantier', 'Identifier les risques majeurs'],
          durationMinutes: 60,
          participants: [
            P('Martin Gagnon', 'Surintendant de chantier', 'SENIOR', 'NEUTRAL', 3, 'Un phasage réaliste pour ses équipes', 'Pénurie de main-d’œuvre en structure d’acier', 'Direct, parle en semaines et en équipes'),
            P('Nadia Bouchard', 'Coordonnatrice santé-sécurité', 'INTERMEDIATE', 'RESISTANT', 2, 'Séparer physiquement le chantier des élèves', 'Exigences de la CNESST, aucune dérogation', 'Ferme, cite la réglementation'),
            P('Daniel Côté', 'Directeur de l’école', 'SENIOR', 'NEUTRAL', 3, 'Aucun travail bruyant pendant les examens', 'Horaire des autobus scolaires', 'Concret, pose des questions sur les élèves'),
          ],
        },
        decision: {
          title: 'Travaux bruyants pendant l’année scolaire',
          context: 'Le pieutage et la charpente d’acier sont très bruyants. L’échéancier ne tient que s’ils commencent en avril, pendant les cours.',
          optimalOption: 2,
          options: [
            ['Travailler en semaine malgré les cours', 'Respecte l’échéancier, mais plaintes probables et tension avec l’école.', [0, 10, 0, -10, 15]],
            ['Tout reporter à l’été', 'Aucune nuisance, mais la rentrée devient très risquée.', [-5, -20, 0, 5, 15]],
            ['Soirs et fins de semaine pour les travaux bruyants', 'Primes de temps supplémentaire, mais école protégée et échéancier préservé.', [-8, 5, 0, -5, -5]],
          ],
        },
      },
      {
        name: 'Construction',
        type: PhaseType.EXECUTION,
        durationDays: 160,
        description: 'Réaliser les travaux, coordonner les sous-traitants et maîtriser les coûts.',
        meeting: {
          title: 'Réunion de chantier hebdomadaire',
          description: 'Faire le point sur l’avancement, les ordres de changement et la sécurité.',
          type: 'STANDUP',
          objectives: ['Revoir l’avancement par lot', 'Traiter les ordres de changement', 'Revoir les incidents de sécurité'],
          durationMinutes: 45,
          participants: [
            P('Martin Gagnon', 'Surintendant de chantier', 'SENIOR', 'NEUTRAL', 3, 'Garder le rythme des équipes', 'Livraison d’acier en retard', 'Bref, factuel'),
            P('Kevin Tremblay', 'Estimateur', 'INTERMEDIATE', 'COOPERATIVE', 4, 'Contenir les ordres de changement', 'Contingence déjà entamée à 40 %', 'Chiffre chaque option'),
            P('Sylvain Morin', 'Sous-traitant en mécanique-électricité', 'SENIOR', 'AGGRESSIVE', 2, 'Faire payer les extras', 'Équipe partagée avec un autre chantier', 'Revendicatif, menace de délais'),
          ],
        },
        event: {
          type: RandomEventType.RISK,
          title: 'Sol contaminé découvert à l’excavation',
          description: 'L’excavation du gymnase révèle des hydrocarbures dans le sol. Les travaux de fondation sont arrêtés en attendant une caractérisation.',
          severity: Severity.HIGH,
          probability: 0.5,
          options: [
            ['Caractérisation complète et disposition en site autorisé', 'Conforme et sûr, coûteux : 3 semaines et 280 000 $.', [-12, -10, 5, 0, -10]],
            ['Déplacer légèrement le gymnase', 'Évite la zone contaminée, mais reprise des plans et du permis.', [-5, -15, -5, -5, 5]],
            ['Excaver par étapes en continuant ailleurs', 'Limite l’arrêt, demande une coordination fine avec l’environnement.', [-8, -4, 0, -3, 0]],
          ],
        },
      },
      {
        name: 'Contrôle et réception',
        type: PhaseType.MONITORING,
        durationDays: 40,
        description: 'Suivre les déficiences, les essais et préparer la réception avec le client.',
        meeting: {
          title: 'Comité de suivi des déficiences',
          description: 'Arbitrer les déficiences avant la réception provisoire.',
          type: 'STEERING',
          objectives: ['Classer les déficiences', 'Fixer la date de réception provisoire', 'Valider le plan d’emménagement'],
          durationMinutes: 45,
          participants: [
            P('Louise Bergeron', 'Directrice des ressources matérielles (client)', 'EXECUTIVE', 'NEUTRAL', 3, 'Réception sans réserve majeure', 'Ne paiera pas la retenue avec des déficiences ouvertes', 'Exigeante, demande des engagements datés'),
            P('Isabelle Roy', 'Architecte', 'SENIOR', 'COOPERATIVE', 4, 'Respect des plans et devis', 'Charge de travail sur deux projets', 'Méthodique'),
            P('Martin Gagnon', 'Surintendant de chantier', 'SENIOR', 'NEUTRAL', 3, 'Démobiliser rapidement', 'Équipes réaffectées dans trois semaines', 'Impatient'),
          ],
        },
        decision: {
          title: 'Ouverture des classes avec déficiences mineures',
          context: 'À trois semaines de la rentrée, 42 déficiences mineures restent ouvertes (peinture, quincaillerie, ajustements de ventilation).',
          optimalOption: 1,
          options: [
            ['Refuser l’occupation tant que tout n’est pas corrigé', 'Qualité maximale, mais rentrée retardée pour six classes.', [0, -15, 10, -5, 5]],
            ['Réception provisoire avec plan de correction daté', 'Les classes ouvrent, les corrections se font hors heures de cours.', [-2, 5, 0, 5, -5]],
            ['Ouvrir sans plan formel', 'Rapide, mais retenue contestée et irritants pour l’école.', [0, 10, -10, -5, 10]],
          ],
        },
      },
      {
        name: 'Clôture',
        type: PhaseType.CLOSURE,
        durationDays: 30,
        description: 'Réception définitive, documents de fin de travaux et bilan.',
        meeting: {
          title: 'Bilan de projet',
          description: 'Retour d’expérience avec le client et l’équipe.',
          type: 'RETROSPECTIVE',
          objectives: ['Mesurer les écarts coût et délai', 'Identifier les leçons apprises', 'Remettre le dossier de fin de travaux'],
          durationMinutes: 45,
          participants: [
            P('Louise Bergeron', 'Directrice des ressources matérielles (client)', 'EXECUTIVE', 'DIPLOMATIC', 4, 'Un bilan utile pour les prochains projets', 'Reddition de comptes au conseil', 'Synthétique'),
            P('Kevin Tremblay', 'Estimateur', 'INTERMEDIATE', 'COOPERATIVE', 4, 'Expliquer les écarts budgétaires', 'Données de coûts incomplètes', 'Précis'),
            P('Nadia Bouchard', 'Coordonnatrice santé-sécurité', 'INTERMEDIATE', 'NEUTRAL', 3, 'Documenter les quasi-accidents', 'Aucune', 'Factuelle'),
          ],
        },
        decision: {
          title: 'Utilisation du solde de contingence',
          context: 'Il reste 120 000 $ de contingence. Le client propose de l’utiliser pour améliorer la cour d’école.',
          optimalOption: 0,
          options: [
            ['Retourner le solde au client avec bilan', 'Transparent, renforce la confiance pour les prochains projets.', [5, 0, 0, 0, -5]],
            ['Financer l’aménagement de la cour', 'Apprécié de l’école, mais hors portée initiale et non approuvé formellement.', [-5, -5, 5, 5, 5]],
            ['Garder une réserve pour la garantie', 'Prudent, mais immobilise des fonds sans justification précise.', [0, 0, 0, 0, -2]],
          ],
        },
      },
    ],
  },

  // ── Santé ───────────────────────────────────────────────────────────────
  {
    id: 'seed-scenario-sante-dossier-patient',
    title: 'Déploiement d’un dossier patient électronique',
    description:
      'Vous dirigez le déploiement d’un dossier patient électronique dans trois hôpitaux régionaux. Le personnel clinique est épuisé, la continuité des soins ne doit jamais être compromise, et le ministère suit le projet de près.',
    objectives: [
      'Mettre en service le dossier dans les trois hôpitaux en 12 mois',
      'Aucun incident de sécurité des patients lié au déploiement',
      'Taux d’adoption clinique supérieur à 85 % après trois mois',
      'Respecter l’enveloppe de 14 M$',
    ],
    sector: Sector.HEALTHCARE,
    difficulty: Difficulty.INTERMEDIATE,
    estimatedDurationHours: 4,
    competencies: ['gestion-changement', 'parties-prenantes', 'gestion-risques', 'communication'],
    project: {
      name: 'Dossier patient régional',
      client: 'Centre intégré de santé du Littoral',
      description: 'Remplacement des dossiers papier et de trois systèmes locaux par un dossier patient électronique unique.',
      initialBudget: 14_000_000,
      deadlineDays: 365,
      team: [
        { name: 'Dre Hélène Fortin', role: 'Médecin conseil en informatique clinique', expertise: 'SENIOR', personality: 'NEUTRAL', morale: 70 },
        { name: 'Patrick Lavoie', role: 'Architecte de solution', expertise: 'SENIOR', personality: 'COOPERATIVE', morale: 75 },
        { name: 'Annie Pelletier', role: 'Conseillère en gestion du changement', expertise: 'INTERMEDIATE', personality: 'COOPERATIVE', morale: 80 },
        { name: 'Samuel Ouellet', role: 'Analyste en sécurité de l’information', expertise: 'INTERMEDIATE', personality: 'RESISTANT', morale: 65 },
      ],
      deliverables: ['Charte et analyse des parties prenantes', 'Plan de déploiement par vagues', 'Plan de formation et de soutien', 'Tableau de bord d’adoption', 'Rapport de fermeture'],
    },
    initialKpis: { budget: 100, schedule: 95, quality: 80, teamMorale: 65, riskLevel: 35 },
    phases: [
      {
        name: 'Démarrage',
        type: PhaseType.INITIATION,
        durationDays: 30,
        description: 'Aligner la direction, les médecins et les soins infirmiers sur les objectifs et la gouvernance.',
        meeting: {
          title: 'Comité directeur de lancement',
          description: 'Valider la gouvernance clinique et le périmètre de la première vague.',
          type: 'KICKOFF',
          objectives: ['Valider la gouvernance clinique', 'Choisir l’hôpital pilote', 'Fixer les indicateurs de succès'],
          durationMinutes: 60,
          participants: [
            P('Marc-André Simard', 'Président-directeur général adjoint', 'EXECUTIVE', 'DIPLOMATIC', 4, 'Respecter l’engagement pris auprès du ministère', 'Visibilité politique, pas de retard annoncé', 'Stratégique, tranche vite'),
            P('Dre Hélène Fortin', 'Médecin conseil en informatique clinique', 'SENIOR', 'NEUTRAL', 3, 'Préserver le temps clinique des médecins', 'Résistance du conseil des médecins', 'Argumente avec des cas cliniques'),
            P('Chantal Leblanc', 'Directrice des soins infirmiers', 'EXECUTIVE', 'RESISTANT', 2, 'Éviter une surcharge des équipes de soins', 'Pénurie de personnel, heures supplémentaires obligatoires', 'Protectrice de ses équipes, directe'),
          ],
        },
        decision: {
          title: 'Choix de l’hôpital pilote',
          context: 'Le premier site déterminera la crédibilité du projet. Deux hôpitaux se proposent, un troisième est imposé par la direction.',
          optimalOption: 1,
          options: [
            ['Le plus gros hôpital, pour un impact maximal', 'Visibilité forte, mais complexité et risque clinique élevés.', [-5, -5, -5, -10, 15]],
            ['Un hôpital de taille moyenne avec des équipes volontaires', 'Apprentissage dans de bonnes conditions, ambassadeurs crédibles.', [0, 0, 10, 10, -10]],
            ['Le site imposé par la direction', 'Appui politique, mais équipes peu engagées.', [0, 5, -5, -10, 5]],
          ],
        },
      },
      {
        name: 'Planification',
        type: PhaseType.PLANNING,
        durationDays: 60,
        description: 'Planifier le déploiement par vagues, la formation et le soutien de proximité.',
        meeting: {
          title: 'Atelier de planification de la formation',
          description: 'Concilier la formation de 2 400 personnes avec la continuité des soins.',
          type: 'STEERING',
          objectives: ['Dimensionner la formation', 'Planifier le soutien de proximité', 'Prévoir le mode dégradé'],
          durationMinutes: 60,
          participants: [
            P('Annie Pelletier', 'Conseillère en gestion du changement', 'INTERMEDIATE', 'COOPERATIVE', 4, 'Former tout le monde avant la mise en service', 'Peu de remplaçants disponibles', 'Structurée, propose des scénarios'),
            P('Chantal Leblanc', 'Directrice des soins infirmiers', 'EXECUTIVE', 'RESISTANT', 2, 'Pas plus de 4 heures de formation par infirmière', 'Budget de remplacement épuisé', 'Refuse ce qui n’est pas financé'),
            P('Patrick Lavoie', 'Architecte de solution', 'SENIOR', 'NEUTRAL', 3, 'Un environnement de formation stable', 'Licences de l’environnement de formation limitées', 'Technique'),
          ],
        },
        decision: {
          title: 'Format de la formation clinique',
          context: 'La formation complète demande 8 heures par employé. Les soins infirmiers n’en acceptent que 4.',
          optimalOption: 2,
          options: [
            ['Imposer 8 heures pour tous', 'Meilleure maîtrise, mais coûts de remplacement élevés et colère des équipes.', [-12, -5, 10, -15, 0]],
            ['Formation en ligne uniquement', 'Peu coûteuse, mais adoption faible et erreurs de saisie.', [5, 5, -15, -5, 15]],
            ['4 heures par rôle + super-utilisateurs sur chaque unité', 'Formation ciblée et soutien sur le terrain pendant trois semaines.', [-6, 0, 5, 5, -5]],
          ],
        },
      },
      {
        name: 'Déploiement',
        type: PhaseType.EXECUTION,
        durationDays: 180,
        description: 'Mettre en service par vagues et soutenir les unités de soins.',
        meeting: {
          title: 'Cellule de crise — première semaine du pilote',
          description: 'Point quotidien sur les incidents de la mise en service.',
          type: 'CRISIS',
          objectives: ['Traiter les incidents critiques', 'Décider des ajustements', 'Rassurer les équipes de soins'],
          durationMinutes: 30,
          participants: [
            P('Dre Hélène Fortin', 'Médecin conseil en informatique clinique', 'SENIOR', 'NEUTRAL', 3, 'Aucun risque pour les patients', 'Médecins qui contournent le système', 'Factuelle, cite des incidents précis'),
            P('Samuel Ouellet', 'Analyste en sécurité de l’information', 'INTERMEDIATE', 'RESISTANT', 2, 'Aucun accès non autorisé aux dossiers', 'Mots de passe partagés observés à l’urgence', 'Alarmiste, rigoureux'),
            P('Annie Pelletier', 'Conseillère en gestion du changement', 'INTERMEDIATE', 'COOPERATIVE', 4, 'Garder les équipes mobilisées', 'Super-utilisateurs fatigués', 'Empathique'),
          ],
        },
        event: {
          type: RandomEventType.RISK,
          title: 'Panne de 4 heures pendant la nuit',
          description: 'Le système est indisponible 4 heures à l’urgence. Les équipes sont revenues au papier, deux ordonnances ont été dupliquées.',
          severity: Severity.CRITICAL,
          probability: 0.4,
          options: [
            ['Suspendre la vague suivante et faire une analyse de cause', 'Sécuritaire, mais retarde le calendrier de six semaines.', [-5, -15, 10, 5, -15]],
            ['Continuer en renforçant le mode dégradé', 'Procédures papier testées chaque semaine, surveillance 24/7 pendant un mois.', [-8, -3, 5, 0, -8]],
            ['Continuer sans changement', 'Garde le calendrier, mais perte de confiance et risque clinique.', [0, 5, -10, -15, 20]],
          ],
        },
      },
      {
        name: 'Suivi de l’adoption',
        type: PhaseType.MONITORING,
        durationDays: 60,
        description: 'Mesurer l’adoption, corriger les irritants et stabiliser.',
        meeting: {
          title: 'Revue de l’adoption clinique',
          description: 'Analyser les indicateurs d’adoption et décider des correctifs.',
          type: 'STEERING',
          objectives: ['Analyser l’adoption par unité', 'Prioriser les irritants', 'Décider de la suite du déploiement'],
          durationMinutes: 45,
          participants: [
            P('Marc-André Simard', 'Président-directeur général adjoint', 'EXECUTIVE', 'NEUTRAL', 3, 'Annoncer le succès au ministère', 'Rapport trimestriel dû dans deux semaines', 'Veut des chiffres simples'),
            P('Dre Hélène Fortin', 'Médecin conseil en informatique clinique', 'SENIOR', 'COOPERATIVE', 4, 'Simplifier la saisie des notes', 'Fournisseur lent à livrer les correctifs', 'Pragmatique'),
            P('Chantal Leblanc', 'Directrice des soins infirmiers', 'EXECUTIVE', 'NEUTRAL', 3, 'Réduire le temps passé à l’écran', 'Taux de roulement en hausse', 'Exigeante'),
          ],
        },
        decision: {
          title: 'Adoption à 62 % chez les médecins',
          context: 'Les infirmières sont à 91 %, mais les médecins continuent à dicter leurs notes sur papier.',
          optimalOption: 1,
          options: [
            ['Rendre la saisie électronique obligatoire immédiatement', 'Rapide, mais conflit ouvert avec le conseil des médecins.', [0, 5, 0, -15, 10]],
            ['Gabarits de notes et reconnaissance vocale, puis obligation', 'Investissement modeste, adoption durable.', [-5, -3, 10, 5, -5]],
            ['Accepter un mode mixte papier-électronique', 'Pas de conflit, mais dossier incomplet et risque clinique.', [0, 0, -10, 0, 10]],
          ],
        },
      },
      {
        name: 'Clôture',
        type: PhaseType.CLOSURE,
        durationDays: 35,
        description: 'Transférer aux opérations, documenter et faire le bilan.',
        meeting: {
          title: 'Bilan et transfert aux opérations',
          description: 'Remettre la solution aux équipes de soutien et tirer les leçons.',
          type: 'RETROSPECTIVE',
          objectives: ['Transférer le soutien', 'Documenter les leçons apprises', 'Fermer les contrats'],
          durationMinutes: 45,
          participants: [
            P('Patrick Lavoie', 'Architecte de solution', 'SENIOR', 'COOPERATIVE', 4, 'Un transfert propre au soutien', 'Équipe de soutien réduite', 'Méthodique'),
            P('Annie Pelletier', 'Conseillère en gestion du changement', 'INTERMEDIATE', 'COOPERATIVE', 4, 'Pérenniser le réseau de super-utilisateurs', 'Budget de fonctionnement non confirmé', 'Positive'),
            P('Marc-André Simard', 'Président-directeur général adjoint', 'EXECUTIVE', 'DIPLOMATIC', 4, 'Clore dans le budget', 'Aucune', 'Synthétique'),
          ],
        },
        decision: {
          title: 'Maintien des super-utilisateurs',
          context: 'Le réseau de super-utilisateurs coûte 300 000 $ par an. Les finances veulent le supprimer à la fin du projet.',
          optimalOption: 2,
          options: [
            ['Supprimer le réseau', 'Économie immédiate, mais recul probable de l’adoption.', [10, 0, -10, -10, 10]],
            ['Le maintenir intégralement', 'Adoption protégée, mais coût récurrent difficile à justifier.', [-10, 0, 5, 5, -5]],
            ['Le réduire à un super-utilisateur par département', 'Compromis financé par les opérations.', [-3, 0, 5, 0, -3]],
          ],
        },
      },
    ],
  },

  // ── Énergie ─────────────────────────────────────────────────────────────
  {
    id: 'seed-scenario-energie-parc-solaire',
    title: 'Construction d’un parc solaire de 20 MW',
    description:
      'Vous êtes gestionnaire de projet pour un parc solaire de 20 MW. Le raccordement au réseau, l’acceptabilité sociale et la volatilité du prix des panneaux sont vos principaux défis. Budget : 32 M$, mise en service commerciale exigée dans 18 mois.',
    objectives: [
      'Mise en service commerciale dans 18 mois',
      'Coût actualisé de l’énergie conforme au contrat d’achat',
      'Entente signée avec la municipalité et les propriétaires voisins',
      'Aucun incident environnemental déclarable',
    ],
    sector: Sector.ENERGY,
    difficulty: Difficulty.ADVANCED,
    estimatedDurationHours: 5,
    competencies: ['gestion-contrats', 'parties-prenantes', 'gestion-risques', 'gestion-budget'],
    project: {
      name: 'Parc solaire de la Plaine',
      client: 'Énergies Boréales inc.',
      description: 'Conception, approvisionnement et construction d’un parc photovoltaïque de 20 MW et de son poste de raccordement.',
      initialBudget: 32_000_000,
      deadlineDays: 540,
      team: [
        { name: 'Olivier Paré', role: 'Ingénieur électrique principal', expertise: 'SENIOR', personality: 'NEUTRAL', morale: 75 },
        { name: 'Émilie Dion', role: 'Responsable des approvisionnements', expertise: 'INTERMEDIATE', personality: 'COOPERATIVE', morale: 80 },
        { name: 'Jean-François Caron', role: 'Responsable des relations avec le milieu', expertise: 'SENIOR', personality: 'DIPLOMATIC', morale: 75 },
        { name: 'Mélanie Giroux', role: 'Contrôleuse de projet', expertise: 'INTERMEDIATE', personality: 'NEUTRAL', morale: 70 },
      ],
      deliverables: ['Analyse de faisabilité et registre des parties prenantes', 'Plan d’approvisionnement et échéancier intégré', 'Rapports de construction', 'Rapport de mise en service', 'Bilan financier et retour d’expérience'],
    },
    initialKpis: { budget: 95, schedule: 95, quality: 80, teamMorale: 75, riskLevel: 40 },
    phases: [
      {
        name: 'Développement',
        type: PhaseType.INITIATION,
        durationDays: 60,
        description: 'Sécuriser les autorisations, le raccordement et l’acceptabilité sociale.',
        meeting: {
          title: 'Rencontre avec la municipalité et les citoyens',
          description: 'Présenter le projet et entendre les préoccupations du milieu.',
          type: 'KICKOFF',
          objectives: ['Présenter le projet', 'Recueillir les préoccupations', 'Proposer une entente de partenariat'],
          durationMinutes: 60,
          participants: [
            P('Lucie Thibault', 'Mairesse', 'EXECUTIVE', 'DIPLOMATIC', 3, 'Des retombées concrètes pour la municipalité', 'Élections dans un an', 'Politique, prudente'),
            P('Gilles Arsenault', 'Représentant des agriculteurs voisins', 'SENIOR', 'AGGRESSIVE', 1, 'Protéger les terres agricoles', 'Méfiance après un ancien projet éolien', 'Confrontant, interrompt'),
            P('Jean-François Caron', 'Responsable des relations avec le milieu', 'SENIOR', 'DIPLOMATIC', 4, 'Signer une entente de voisinage', 'Budget de compensation limité', 'Calme, reformule'),
          ],
        },
        decision: {
          title: 'Entente avec le milieu',
          context: 'La municipalité demande une redevance annuelle. Les agriculteurs exigent un écran végétal et le maintien du pâturage sous les panneaux.',
          optimalOption: 1,
          options: [
            ['Respecter strictement la réglementation, sans plus', 'Aucun coût supplémentaire, mais risque d’opposition et de recours.', [5, -10, 0, 0, 20]],
            ['Redevance + écran végétal + pâturage ovin', 'Acceptabilité forte, coût d’exploitation légèrement plus élevé.', [-6, 5, 5, 5, -15]],
            ['Redevance élevée seulement', 'Appui de la mairie, mais agriculteurs toujours opposés.', [-10, 0, 0, 0, 5]],
          ],
        },
      },
      {
        name: 'Ingénierie et approvisionnement',
        type: PhaseType.PLANNING,
        durationDays: 120,
        description: 'Finaliser l’ingénierie, choisir les fournisseurs et sécuriser les équipements à long délai.',
        meeting: {
          title: 'Comité d’approvisionnement',
          description: 'Arbitrer le choix des panneaux et des onduleurs.',
          type: 'STEERING',
          objectives: ['Choisir le fournisseur de panneaux', 'Sécuriser le transformateur', 'Valider la couverture de change'],
          durationMinutes: 60,
          participants: [
            P('Émilie Dion', 'Responsable des approvisionnements', 'INTERMEDIATE', 'COOPERATIVE', 4, 'Sécuriser les prix rapidement', 'Offres valides 30 jours', 'Comparative, chiffrée'),
            P('Mélanie Giroux', 'Contrôleuse de projet', 'INTERMEDIATE', 'NEUTRAL', 3, 'Rester dans l’enveloppe', 'Dollar américain en hausse', 'Rigoureuse'),
            P('Richard Lessard', 'Vice-président, financement', 'EXECUTIVE', 'RESISTANT', 2, 'Respecter les conditions des prêteurs', 'Clauses de traçabilité sur la chaîne d’approvisionnement', 'Sec, exige des garanties'),
          ],
        },
        decision: {
          title: 'Fournisseur de panneaux',
          context: 'Le moins cher n’offre pas la traçabilité exigée par les prêteurs. Le fournisseur certifié coûte 9 % de plus.',
          optimalOption: 1,
          options: [
            ['Fournisseur le moins cher', 'Économie de 1,1 M$, mais risque de blocage du financement.', [8, 0, -5, 0, 20]],
            ['Fournisseur certifié avec traçabilité', 'Conforme aux prêteurs, prix fixé en dollars canadiens.', [-6, 0, 5, 0, -10]],
            ['Diviser la commande entre les deux', 'Complexité d’intégration et d’entretien.', [0, -5, -5, -5, 5]],
          ],
        },
      },
      {
        name: 'Construction',
        type: PhaseType.EXECUTION,
        durationDays: 240,
        description: 'Construire le parc, le poste et la ligne de raccordement.',
        meeting: {
          title: 'Réunion de coordination de construction',
          description: 'Synchroniser génie civil, installation des structures et poste électrique.',
          type: 'STANDUP',
          objectives: ['Revoir l’avancement par lot', 'Coordonner les livraisons', 'Revoir la conformité environnementale'],
          durationMinutes: 45,
          participants: [
            P('Olivier Paré', 'Ingénieur électrique principal', 'SENIOR', 'NEUTRAL', 3, 'Respecter les exigences du réseau', 'Essais du distributeur planifiés à date fixe', 'Technique, précis'),
            P('Steve Lachance', 'Directeur de chantier (entrepreneur EPC)', 'SENIOR', 'AGGRESSIVE', 2, 'Réclamer les retards causés par le client', 'Pénalités contractuelles', 'Défensif, contractuel'),
            P('Mélanie Giroux', 'Contrôleuse de projet', 'INTERMEDIATE', 'NEUTRAL', 3, 'Suivre la valeur acquise', 'Réclamations en attente', 'Factuelle'),
          ],
        },
        event: {
          type: RandomEventType.CONSTRAINT,
          title: 'Retard de 10 semaines du transformateur',
          description: 'Le fabricant du transformateur principal annonce 10 semaines de retard. La date d’essai avec le distributeur est menacée.',
          severity: Severity.HIGH,
          probability: 0.5,
          options: [
            ['Louer un transformateur temporaire', 'Coûteux (650 000 $) mais préserve la date d’essai.', [-10, 5, 0, 0, -5]],
            ['Renégocier la date d’essai avec le distributeur', 'Peu coûteux, mais pénalités du contrat d’achat d’électricité possibles.', [-3, -10, 0, 0, 10]],
            ['Accélérer la fabrication contre une prime', 'Gagne 5 semaines, sans garantie.', [-6, -3, 0, 0, 5]],
          ],
        },
      },
      {
        name: 'Mise en service',
        type: PhaseType.MONITORING,
        durationDays: 60,
        description: 'Essais, mise en service et atteinte de la performance contractuelle.',
        meeting: {
          title: 'Revue de mise en service',
          description: 'Analyser les essais de performance et décider de la réception.',
          type: 'STEERING',
          objectives: ['Analyser les essais de performance', 'Traiter les réserves', 'Décider de la mise en service commerciale'],
          durationMinutes: 45,
          participants: [
            P('Richard Lessard', 'Vice-président, financement', 'EXECUTIVE', 'NEUTRAL', 3, 'Déclencher la mise en service commerciale', 'Clause des prêteurs sur le ratio de performance', 'Exigeant'),
            P('Olivier Paré', 'Ingénieur électrique principal', 'SENIOR', 'COOPERATIVE', 4, 'Corriger les onduleurs défaillants', 'Pièces de remplacement en commande', 'Précis'),
            P('Steve Lachance', 'Directeur de chantier (entrepreneur EPC)', 'SENIOR', 'RESISTANT', 2, 'Obtenir la réception rapidement', 'Équipe démobilisée', 'Insistant'),
          ],
        },
        decision: {
          title: 'Ratio de performance à 96 % du garanti',
          context: 'Les essais donnent 96 % du ratio garanti à cause de 12 onduleurs défaillants.',
          optimalOption: 1,
          options: [
            ['Accepter la réception telle quelle', 'Mise en service rapide, mais perte de revenus sur 25 ans.', [0, 10, -10, 0, 10]],
            ['Réception conditionnelle avec retenue jusqu’à correction', 'Revenus préservés, entrepreneur sous pression.', [0, 0, 10, 0, -5]],
            ['Refuser la réception', 'Garantie maximale, mais conflit et retard de mise en service.', [-5, -10, 5, -5, 5]],
          ],
        },
      },
      {
        name: 'Clôture',
        type: PhaseType.CLOSURE,
        durationDays: 60,
        description: 'Fermer les contrats, régler les réclamations et transférer à l’exploitation.',
        meeting: {
          title: 'Règlement des réclamations et bilan',
          description: 'Négocier le règlement final avec l’entrepreneur et faire le bilan.',
          type: 'RETROSPECTIVE',
          objectives: ['Régler les réclamations', 'Transférer à l’exploitation', 'Documenter les leçons apprises'],
          durationMinutes: 60,
          participants: [
            P('Steve Lachance', 'Directeur de chantier (entrepreneur EPC)', 'SENIOR', 'AGGRESSIVE', 2, 'Récupérer 1,8 M$ de réclamations', 'Aucune', 'Combatif'),
            P('Mélanie Giroux', 'Contrôleuse de projet', 'INTERMEDIATE', 'NEUTRAL', 3, 'Limiter le règlement à ce qui est documenté', 'Dossier de preuves incomplet', 'Rigoureuse'),
            P('Richard Lessard', 'Vice-président, financement', 'EXECUTIVE', 'DIPLOMATIC', 3, 'Clore sans litige', 'Rapport aux prêteurs', 'Pragmatique'),
          ],
        },
        decision: {
          title: 'Réclamations de l’entrepreneur',
          context: 'L’entrepreneur réclame 1,8 M$. Environ 700 000 $ sont bien documentés.',
          optimalOption: 1,
          options: [
            ['Tout contester devant arbitrage', 'Peut réduire le montant, mais 18 mois de litige.', [-3, -5, 0, -5, 10]],
            ['Régler les montants documentés et négocier le reste', 'Règlement rapide autour de 900 000 $.', [-3, 0, 0, 5, -10]],
            ['Payer la totalité pour clore', 'Fin rapide, mais précédent coûteux.', [-10, 5, 0, 0, -5]],
          ],
        },
      },
    ],
  },

  // ── Administration publique ─────────────────────────────────────────────
  {
    id: 'seed-scenario-public-permis-en-ligne',
    title: 'Refonte du service de permis en ligne d’une ville',
    description:
      'La ville vous confie la refonte du service de demande de permis de rénovation en ligne. Les délais de traitement atteignent 11 semaines, les citoyens se plaignent et le syndicat craint pour les postes de commis.',
    objectives: [
      'Réduire le délai de traitement médian à 3 semaines',
      'Rendre 80 % des demandes complètes au premier dépôt',
      'Respecter les règles d’appel d’offres et l’accessibilité numérique',
      'Livrer dans le budget de 2,6 M$',
    ],
    sector: Sector.PUBLIC_ADMINISTRATION,
    difficulty: Difficulty.INTERMEDIATE,
    estimatedDurationHours: 4,
    competencies: ['gestion-changement', 'parties-prenantes', 'gouvernance', 'communication'],
    project: {
      name: 'Permis en ligne 2.0',
      client: 'Ville de Saint-Laurent-des-Rives',
      description: 'Nouveau parcours citoyen, traitement numérique des demandes et intégration au système de gestion du territoire.',
      initialBudget: 2_600_000,
      deadlineDays: 300,
      team: [
        { name: 'Geneviève Racine', role: 'Analyste d’affaires', expertise: 'SENIOR', personality: 'COOPERATIVE', morale: 80 },
        { name: 'Mathieu Poirier', role: 'Chef d’équipe développement', expertise: 'SENIOR', personality: 'NEUTRAL', morale: 70 },
        { name: 'Sarah Benoît', role: 'Conceptrice en expérience citoyenne', expertise: 'INTERMEDIATE', personality: 'COOPERATIVE', morale: 85 },
        { name: 'Robert Gendron', role: 'Chef de division des permis', expertise: 'SENIOR', personality: 'RESISTANT', morale: 60 },
      ],
      deliverables: ['Analyse de la situation actuelle', 'Plan de projet et stratégie d’approvisionnement', 'Service en ligne en production', 'Rapport de suivi des délais', 'Bilan et recommandations'],
    },
    initialKpis: { budget: 100, schedule: 100, quality: 75, teamMorale: 65, riskLevel: 30 },
    phases: [
      {
        name: 'Démarrage',
        type: PhaseType.INITIATION,
        durationDays: 30,
        description: 'Comprendre le processus actuel et aligner les élus, la direction et le syndicat.',
        meeting: {
          title: 'Lancement avec la direction générale',
          description: 'Confirmer le mandat et les attentes des élus.',
          type: 'KICKOFF',
          objectives: ['Confirmer le mandat', 'Définir les indicateurs de réussite', 'Établir la gouvernance'],
          durationMinutes: 45,
          participants: [
            P('François Bélanger', 'Directeur général', 'EXECUTIVE', 'DIPLOMATIC', 4, 'Un résultat visible avant le budget municipal', 'Conseil municipal divisé', 'Stratégique'),
            P('Robert Gendron', 'Chef de division des permis', 'SENIOR', 'RESISTANT', 2, 'Protéger son équipe et la qualité de l’analyse', 'Convention collective', 'Méfiant, rappelle les échecs passés'),
            P('Geneviève Racine', 'Analyste d’affaires', 'SENIOR', 'COOPERATIVE', 4, 'Cartographier le processus réel', 'Peu d’accès aux commis', 'Structurée'),
          ],
        },
        decision: {
          title: 'Implication du syndicat',
          context: 'Le syndicat demande à être consulté. La direction préfère annoncer le projet une fois la solution choisie.',
          optimalOption: 0,
          options: [
            ['Associer le syndicat dès maintenant à un comité de suivi', 'Plus lent au départ, mais confiance et adoption.', [-2, -3, 5, 10, -10]],
            ['Informer seulement après le choix de la solution', 'Rapide, mais risque de grief et de résistance.', [0, 5, 0, -10, 15]],
            ['Consulter individuellement quelques commis', 'Compromis, mais perçu comme un contournement.', [0, 0, 0, -5, 5]],
          ],
        },
      },
      {
        name: 'Planification',
        type: PhaseType.PLANNING,
        durationDays: 60,
        description: 'Définir la solution et la stratégie d’approvisionnement.',
        meeting: {
          title: 'Comité de sélection de la solution',
          description: 'Choisir entre un développement sur mesure et un progiciel.',
          type: 'STEERING',
          objectives: ['Comparer les options', 'Valider la stratégie d’appel d’offres', 'Fixer le calendrier'],
          durationMinutes: 60,
          participants: [
            P('Mathieu Poirier', 'Chef d’équipe développement', 'SENIOR', 'NEUTRAL', 3, 'Une solution maintenable par l’équipe', 'Deux développeurs seulement', 'Technique'),
            P('Josée Langlois', 'Responsable de l’approvisionnement', 'SENIOR', 'RESISTANT', 2, 'Respecter la Loi sur les cités et villes', 'Délais d’appel d’offres public', 'Procédurale'),
            P('François Bélanger', 'Directeur général', 'EXECUTIVE', 'NEUTRAL', 3, 'Respecter le calendrier annoncé', 'Budget triennal fixé', 'Direct'),
          ],
        },
        decision: {
          title: 'Stratégie de solution',
          context: 'Un progiciel municipal existe, mais couvre 70 % des besoins. Le sur-mesure couvre tout, mais demande plus de temps.',
          optimalOption: 1,
          options: [
            ['Développement sur mesure', 'Adapté, mais long et dépendant d’une petite équipe.', [-10, -10, 10, 0, 10]],
            ['Progiciel + adaptation des processus', 'Rapide, oblige à simplifier certaines règles internes.', [0, 5, 0, -5, -5]],
            ['Progiciel + personnalisations lourdes', 'Couvre tout, mais coûteux à maintenir.', [-8, -5, 0, 0, 10]],
          ],
        },
      },
      {
        name: 'Réalisation',
        type: PhaseType.EXECUTION,
        durationDays: 150,
        description: 'Configurer, intégrer et tester avec des citoyens.',
        meeting: {
          title: 'Revue de sprint avec les commis',
          description: 'Démontrer le parcours et recueillir les commentaires des utilisateurs internes.',
          type: 'STANDUP',
          objectives: ['Démontrer le parcours', 'Recueillir les commentaires', 'Ajuster le carnet de produit'],
          durationMinutes: 45,
          participants: [
            P('Robert Gendron', 'Chef de division des permis', 'SENIOR', 'NEUTRAL', 3, 'Garder la vérification de conformité', 'Règlements d’urbanisme complexes', 'Pointilleux'),
            P('Sarah Benoît', 'Conceptrice en expérience citoyenne', 'INTERMEDIATE', 'COOPERATIVE', 4, 'Un formulaire compréhensible par tous', 'Normes d’accessibilité', 'Centrée sur l’usager'),
            P('Mathieu Poirier', 'Chef d’équipe développement', 'SENIOR', 'NEUTRAL', 3, 'Stabiliser l’intégration au système du territoire', 'API fragile du fournisseur', 'Prudent'),
          ],
        },
        event: {
          type: RandomEventType.STAKEHOLDER,
          title: 'Un conseiller municipal critique le projet en séance publique',
          description: 'Un conseiller affirme que le projet coûte trop cher et menace des emplois. Les médias reprennent l’information.',
          severity: Severity.MEDIUM,
          probability: 0.6,
          options: [
            ['Préparer une présentation factuelle au conseil', 'Données de délais, plan de réaffectation des commis, budget.', [-1, -2, 0, 5, -10]],
            ['Laisser la direction générale répondre seule', 'Pas d’effort du projet, mais message moins précis.', [0, 0, 0, -5, 5]],
            ['Réduire la portée pour calmer le jeu', 'Moins de critiques, mais objectifs de délais compromis.', [5, 0, -10, -5, 0]],
          ],
        },
      },
      {
        name: 'Suivi',
        type: PhaseType.MONITORING,
        durationDays: 45,
        description: 'Mesurer les délais et la qualité des demandes après la mise en ligne.',
        meeting: {
          title: 'Revue des indicateurs de service',
          description: 'Analyser les délais et les demandes incomplètes.',
          type: 'STEERING',
          objectives: ['Analyser les délais', 'Identifier les causes de demandes incomplètes', 'Décider des ajustements'],
          durationMinutes: 45,
          participants: [
            P('François Bélanger', 'Directeur général', 'EXECUTIVE', 'NEUTRAL', 3, 'Annoncer une amélioration chiffrée', 'Séance du conseil la semaine prochaine', 'Veut un message clair'),
            P('Geneviève Racine', 'Analyste d’affaires', 'SENIOR', 'COOPERATIVE', 4, 'Corriger les causes racines', 'Données de traitement incomplètes', 'Analytique'),
            P('Robert Gendron', 'Chef de division des permis', 'SENIOR', 'NEUTRAL', 3, 'Réduire les retours aux citoyens', 'Deux commis en congé', 'Concret'),
          ],
        },
        decision: {
          title: '35 % de demandes encore incomplètes',
          context: 'Les citoyens oublient les plans signés. Le délai médian est passé à 5 semaines, loin de l’objectif de 3.',
          optimalOption: 1,
          options: [
            ['Ajouter des commis temporaires', 'Effet rapide, mais coût récurrent.', [-8, 5, 0, 0, 0]],
            ['Validation des pièces dès le dépôt + guide illustré', 'Traite la cause, investissement modeste.', [-3, 5, 10, 5, -5]],
            ['Assouplir les exigences documentaires', 'Délais réduits, mais conformité affaiblie.', [0, 10, -10, -5, 10]],
          ],
        },
      },
      {
        name: 'Clôture',
        type: PhaseType.CLOSURE,
        durationDays: 30,
        description: 'Transférer aux opérations et présenter le bilan au conseil.',
        meeting: {
          title: 'Bilan au comité exécutif',
          description: 'Présenter les résultats et les recommandations.',
          type: 'RETROSPECTIVE',
          objectives: ['Présenter les résultats', 'Recommander les prochaines étapes', 'Clore le projet'],
          durationMinutes: 45,
          participants: [
            P('François Bélanger', 'Directeur général', 'EXECUTIVE', 'DIPLOMATIC', 4, 'Étendre l’approche à d’autres services', 'Budget de l’an prochain', 'Ambitieux'),
            P('Josée Langlois', 'Responsable de l’approvisionnement', 'SENIOR', 'NEUTRAL', 3, 'Documenter la conformité du processus', 'Vérification interne à venir', 'Procédurale'),
            P('Robert Gendron', 'Chef de division des permis', 'SENIOR', 'COOPERATIVE', 4, 'Reconnaître l’effort de son équipe', 'Aucune', 'Plus ouvert'),
          ],
        },
        decision: {
          title: 'Extension à d’autres permis',
          context: 'Le conseil veut étendre la plateforme aux permis de construction neuve dès l’an prochain.',
          optimalOption: 2,
          options: [
            ['Lancer immédiatement l’extension', 'Profite de l’élan, mais l’équipe est épuisée.', [-5, 5, -5, -10, 10]],
            ['Refuser tant que la stabilisation n’est pas terminée', 'Prudent, mais occasion manquée.', [0, -5, 5, 5, 0]],
            ['Stabiliser 3 mois puis étendre par étapes', 'Équilibre entre ambition et capacité.', [0, 0, 5, 5, -5]],
          ],
        },
      },
    ],
  },

  // ── Manufacturier ───────────────────────────────────────────────────────
  {
    id: 'seed-scenario-manufacturier-ligne-auto',
    title: 'Nouvelle ligne de production automatisée',
    description:
      'Votre usine de pièces métalliques installe une ligne robotisée pour honorer un contrat avec un constructeur de véhicules récréatifs. L’usine doit continuer à produire pendant l’installation, et le client exige des pièces qualifiées dans 9 mois.',
    objectives: [
      'Produire les premières pièces qualifiées dans 9 mois',
      'Atteindre un taux de rendement synthétique de 75 % après 3 mois',
      'Maintenir la production existante pendant l’installation',
      'Respecter le budget de 6,5 M$',
    ],
    sector: Sector.MANUFACTURING,
    difficulty: Difficulty.INTERMEDIATE,
    estimatedDurationHours: 4,
    competencies: ['planification', 'gestion-risques', 'leadership', 'amelioration-continue'],
    project: {
      name: 'Ligne robotisée R-7',
      client: 'Métaux Précis inc.',
      description: 'Installation d’une cellule de soudage et de pliage robotisée, formation des opérateurs et qualification des pièces.',
      initialBudget: 6_500_000,
      deadlineDays: 270,
      team: [
        { name: 'Alain Dufour', role: 'Directeur de production', expertise: 'SENIOR', personality: 'RESISTANT', morale: 65 },
        { name: 'Catherine Vachon', role: 'Ingénieure de procédés', expertise: 'SENIOR', personality: 'COOPERATIVE', morale: 80 },
        { name: 'Yannick Boucher', role: 'Technicien en automatisation', expertise: 'INTERMEDIATE', personality: 'COOPERATIVE', morale: 75 },
        { name: 'Marie-Ève Plante', role: 'Responsable qualité', expertise: 'SENIOR', personality: 'NEUTRAL', morale: 75 },
      ],
      deliverables: ['Charte et étude de rentabilité', 'Plan d’implantation et d’arrêts de production', 'Ligne installée et rapport d’essais', 'Rapport de qualification des pièces', 'Bilan de performance'],
    },
    initialKpis: { budget: 100, schedule: 100, quality: 80, teamMorale: 70, riskLevel: 30 },
    phases: [
      {
        name: 'Démarrage',
        type: PhaseType.INITIATION,
        durationDays: 20,
        description: 'Valider l’étude de rentabilité et les contraintes de production.',
        meeting: {
          title: 'Lancement avec la direction d’usine',
          description: 'Aligner la direction, la production et la qualité.',
          type: 'KICKOFF',
          objectives: ['Valider les objectifs de capacité', 'Identifier les contraintes de production', 'Définir les rôles'],
          durationMinutes: 45,
          participants: [
            P('Pierre-Luc Hébert', 'Président de l’usine', 'EXECUTIVE', 'DIPLOMATIC', 4, 'Honorer le contrat client', 'Pénalités de retard de livraison', 'Ambitieux, pressé'),
            P('Alain Dufour', 'Directeur de production', 'SENIOR', 'RESISTANT', 2, 'Ne pas perdre une heure de production', 'Carnet de commandes plein', 'Bourru, parle en pièces/heure'),
            P('Marie-Ève Plante', 'Responsable qualité', 'SENIOR', 'NEUTRAL', 3, 'Qualifier les pièces du premier coup', 'Exigences du client (PPAP)', 'Rigoureuse'),
          ],
        },
        decision: {
          title: 'Emplacement de la nouvelle ligne',
          context: 'Deux options : déplacer une ligne existante peu utilisée, ou construire une extension du bâtiment.',
          optimalOption: 0,
          options: [
            ['Déplacer l’ancienne ligne de pliage', 'Moins cher, demande 2 semaines d’arrêt partiel.', [5, 0, 0, -5, 5]],
            ['Construire une extension', 'Aucun arrêt, mais 4 mois de plus et 900 000 $.', [-12, -15, 0, 5, 0]],
            ['Installer dans l’entrepôt', 'Rapide, mais flux logistique dégradé.', [0, 5, -5, -5, 5]],
          ],
        },
      },
      {
        name: 'Planification',
        type: PhaseType.PLANNING,
        durationDays: 45,
        description: 'Choisir l’intégrateur et planifier les arrêts et la formation.',
        meeting: {
          title: 'Choix de l’intégrateur robotique',
          description: 'Comparer les offres des intégrateurs.',
          type: 'STEERING',
          objectives: ['Comparer les offres', 'Valider les garanties de performance', 'Fixer le calendrier d’installation'],
          durationMinutes: 60,
          participants: [
            P('Catherine Vachon', 'Ingénieure de procédés', 'SENIOR', 'COOPERATIVE', 4, 'Une cellule fiable et documentée', 'Peu d’expérience interne en robotique', 'Analytique'),
            P('Yannick Boucher', 'Technicien en automatisation', 'INTERMEDIATE', 'NEUTRAL', 3, 'Pouvoir dépanner seul', 'Formation non prévue au budget', 'Pratique'),
            P('Pierre-Luc Hébert', 'Président de l’usine', 'EXECUTIVE', 'NEUTRAL', 3, 'Le meilleur rapport coût-délai', 'Trésorerie serrée', 'Tranchant'),
          ],
        },
        decision: {
          title: 'Intégrateur robotique',
          context: 'L’offre la moins chère vient d’un intégrateur étranger sans soutien local. L’intégrateur régional est 12 % plus cher.',
          optimalOption: 1,
          options: [
            ['Intégrateur étranger le moins cher', 'Économie de 400 000 $, soutien à distance seulement.', [6, 0, -5, -5, 15]],
            ['Intégrateur régional avec soutien sur place', 'Plus cher, dépannage en 4 heures, formation incluse.', [-6, 0, 10, 5, -10]],
            ['Faire l’intégration à l’interne', 'Moins cher, mais l’équipe n’a pas l’expertise.', [10, -15, -10, -10, 20]],
          ],
        },
      },
      {
        name: 'Installation',
        type: PhaseType.EXECUTION,
        durationDays: 120,
        description: 'Installer, programmer et tester la cellule.',
        meeting: {
          title: 'Point d’avancement de l’installation',
          description: 'Suivre l’installation et l’impact sur la production existante.',
          type: 'STANDUP',
          objectives: ['Revoir l’avancement', 'Gérer les interférences avec la production', 'Préparer les essais'],
          durationMinutes: 30,
          participants: [
            P('Alain Dufour', 'Directeur de production', 'SENIOR', 'AGGRESSIVE', 2, 'Récupérer ses opérateurs mobilisés', 'Retard sur deux commandes clients', 'Accuse le projet'),
            P('Yannick Boucher', 'Technicien en automatisation', 'INTERMEDIATE', 'COOPERATIVE', 4, 'Apprendre la programmation', 'Heures supplémentaires', 'Motivé'),
            P('Catherine Vachon', 'Ingénieure de procédés', 'SENIOR', 'COOPERATIVE', 4, 'Stabiliser les paramètres de soudage', 'Matière première variable', 'Méthodique'),
          ],
        },
        event: {
          type: RandomEventType.RISK,
          title: 'Opérateurs inquiets pour leurs emplois',
          description: 'Une rumeur circule : la ligne robotisée supprimerait huit postes. Deux opérateurs expérimentés envisagent de démissionner.',
          severity: Severity.MEDIUM,
          probability: 0.6,
          options: [
            ['Rencontre d’équipe et plan de requalification', 'Transparence, requalification en conduite de cellule.', [-2, -2, 0, 15, -10]],
            ['Laisser la direction des ressources humaines gérer', 'Pas de temps perdu, mais message tardif.', [0, 0, 0, -10, 10]],
            ['Primes de rétention ciblées', 'Retient les deux opérateurs, mais crée des tensions.', [-5, 0, 0, -5, 0]],
          ],
        },
      },
      {
        name: 'Qualification',
        type: PhaseType.MONITORING,
        durationDays: 60,
        description: 'Qualifier les pièces et monter en cadence.',
        meeting: {
          title: 'Revue de qualification avec le client',
          description: 'Présenter les résultats de capabilité au client.',
          type: 'STEERING',
          objectives: ['Présenter la capabilité', 'Traiter les non-conformités', 'Obtenir l’approbation des pièces'],
          durationMinutes: 45,
          participants: [
            P('Nathalie Morin', 'Acheteuse principale du client', 'EXECUTIVE', 'RESISTANT', 2, 'Recevoir des pièces conformes à temps', 'Lancement de son modèle en mars', 'Exigeante, menace de pénalités'),
            P('Marie-Ève Plante', 'Responsable qualité', 'SENIOR', 'NEUTRAL', 3, 'Démontrer une capabilité supérieure à 1,33', 'Capabilité actuelle à 1,1 sur une cote', 'Factuelle'),
            P('Catherine Vachon', 'Ingénieure de procédés', 'SENIOR', 'COOPERATIVE', 4, 'Corriger la dérive de soudage', 'Gabarits à modifier', 'Solution'),
          ],
        },
        decision: {
          title: 'Capabilité insuffisante sur une cote',
          context: 'Une cote critique n’atteint qu’une capabilité de 1,1. Le client veut ses premières pièces dans 3 semaines.',
          optimalOption: 1,
          options: [
            ['Livrer avec inspection à 100 %', 'Livraison à temps, coût d’inspection élevé.', [-6, 5, 0, -5, 0]],
            ['Modifier le gabarit et demander une dérogation de 2 semaines', 'Corrige la cause, petit retard négocié.', [-3, -5, 10, 0, -5]],
            ['Livrer sans mesure particulière', 'Risque de rejet et de rappel.', [0, 10, -15, 0, 20]],
          ],
        },
      },
      {
        name: 'Clôture',
        type: PhaseType.CLOSURE,
        durationDays: 25,
        description: 'Transférer à la production et mesurer la performance.',
        meeting: {
          title: 'Bilan de performance de la ligne',
          description: 'Mesurer le rendement et décider des prochaines améliorations.',
          type: 'RETROSPECTIVE',
          objectives: ['Mesurer le rendement synthétique', 'Transférer à la production', 'Décider des améliorations'],
          durationMinutes: 45,
          participants: [
            P('Pierre-Luc Hébert', 'Président de l’usine', 'EXECUTIVE', 'NEUTRAL', 3, 'Rentabiliser l’investissement', 'Aucune', 'Chiffré'),
            P('Alain Dufour', 'Directeur de production', 'SENIOR', 'NEUTRAL', 3, 'Une ligne simple à opérer', 'Opérateurs encore peu autonomes', 'Plus ouvert'),
            P('Yannick Boucher', 'Technicien en automatisation', 'INTERMEDIATE', 'COOPERATIVE', 4, 'Être reconnu comme référent', 'Aucune', 'Enthousiaste'),
          ],
        },
        decision: {
          title: 'Rendement synthétique à 68 %',
          context: 'L’objectif est de 75 %. Les arrêts viennent surtout des changements de série.',
          optimalOption: 1,
          options: [
            ['Ajouter un quart de travail', 'Compense la capacité, ne traite pas la cause.', [-8, 0, 0, -5, 0]],
            ['Projet SMED de réduction des changements de série', 'Amélioration durable, demande 6 semaines.', [-2, -2, 10, 5, -5]],
            ['Réduire la variété des pièces', 'Plus de rendement, mais moins de clients servis.', [5, 0, -5, 0, 5]],
          ],
        },
      },
    ],
  },

  // ── Télécommunications ──────────────────────────────────────────────────
  {
    id: 'seed-scenario-telecom-fibre-rurale',
    title: 'Déploiement de la fibre optique en milieu rural',
    description:
      'Vous dirigez le raccordement de 6 200 foyers ruraux à la fibre optique, financé en partie par un programme gouvernemental avec date butoir. Poteaux à remplacer, droits de passage et hiver court terme : chaque semaine compte.',
    objectives: [
      'Raccorder 6 200 foyers avant la date butoir du programme',
      'Respecter le budget de 48 M$ et les conditions de la subvention',
      'Taux de satisfaction des abonnés supérieur à 80 %',
      'Aucun accident grave sur les chantiers',
    ],
    sector: Sector.TELECOM,
    difficulty: Difficulty.ADVANCED,
    estimatedDurationHours: 5,
    competencies: ['planification', 'gestion-contrats', 'parties-prenantes', 'gestion-risques'],
    project: {
      name: 'Fibre pour tous — MRC des Collines',
      client: 'TéléRéseau Nord',
      description: 'Construction du réseau de fibre optique, accès aux poteaux, raccordement et activation des abonnés.',
      initialBudget: 48_000_000,
      deadlineDays: 480,
      team: [
        { name: 'Vincent Lemieux', role: 'Ingénieur réseau', expertise: 'SENIOR', personality: 'NEUTRAL', morale: 75 },
        { name: 'Karine Fournier', role: 'Coordonnatrice des droits de passage', expertise: 'INTERMEDIATE', personality: 'COOPERATIVE', morale: 70 },
        { name: 'Éric Labbé', role: 'Contremaître des équipes de construction', expertise: 'SENIOR', personality: 'RESISTANT', morale: 65 },
        { name: 'Stéphanie Michaud', role: 'Responsable du service aux abonnés', expertise: 'INTERMEDIATE', personality: 'COOPERATIVE', morale: 80 },
      ],
      deliverables: ['Charte et plan de conformité au programme', 'Plan de déploiement par secteurs', 'Rapports de construction', 'Rapport d’activation et de satisfaction', 'Reddition de comptes au programme'],
    },
    initialKpis: { budget: 95, schedule: 90, quality: 80, teamMorale: 70, riskLevel: 45 },
    phases: [
      {
        name: 'Démarrage',
        type: PhaseType.INITIATION,
        durationDays: 30,
        description: 'Confirmer les engagements du programme et les secteurs prioritaires.',
        meeting: {
          title: 'Lancement avec le programme de financement',
          description: 'Confirmer les conditions de la subvention et le calendrier.',
          type: 'KICKOFF',
          objectives: ['Confirmer les conditions de la subvention', 'Prioriser les secteurs', 'Établir la reddition de comptes'],
          durationMinutes: 45,
          participants: [
            P('Claudine Ferland', 'Directrice du programme gouvernemental', 'EXECUTIVE', 'NEUTRAL', 3, 'Respect strict de la date butoir', 'Aucune prolongation possible', 'Formelle, procédurale'),
            P('Bernard Lapointe', 'Préfet de la MRC', 'EXECUTIVE', 'DIPLOMATIC', 4, 'Les secteurs les plus mal desservis en premier', 'Pression des citoyens', 'Rassembleur'),
            P('Vincent Lemieux', 'Ingénieur réseau', 'SENIOR', 'NEUTRAL', 3, 'Un ordre de construction techniquement cohérent', 'Capacité du réseau de transport', 'Technique'),
          ],
        },
        decision: {
          title: 'Ordre de déploiement',
          context: 'Le préfet veut commencer par les rangs isolés. Techniquement, partir du central vers l’extérieur est plus rapide.',
          optimalOption: 2,
          options: [
            ['Rangs isolés d’abord', 'Satisfaction politique, mais construction plus lente et coûteuse.', [-8, -10, 0, 0, 10]],
            ['Du central vers l’extérieur', 'Efficace, mais frustration des secteurs les plus mal desservis.', [5, 10, 0, 0, 5]],
            ['Par grappes : un secteur isolé pour chaque secteur proche', 'Équilibre efficacité et équité, communication claire.', [0, 0, 5, 5, -5]],
          ],
        },
      },
      {
        name: 'Planification',
        type: PhaseType.PLANNING,
        durationDays: 90,
        description: 'Obtenir les accès aux poteaux et planifier les équipes.',
        meeting: {
          title: 'Comité des droits de passage',
          description: 'Débloquer les demandes d’accès aux poteaux.',
          type: 'STEERING',
          objectives: ['Revoir les demandes en attente', 'Planifier les remplacements de poteaux', 'Sécuriser les équipes'],
          durationMinutes: 60,
          participants: [
            P('Karine Fournier', 'Coordonnatrice des droits de passage', 'INTERMEDIATE', 'COOPERATIVE', 4, 'Obtenir 1 800 permis en 3 mois', '40 % des poteaux à remplacer', 'Organisée'),
            P('Denis Thériault', 'Représentant du propriétaire des poteaux', 'SENIOR', 'RESISTANT', 2, 'Respecter ses propres priorités d’entretien', 'Équipes limitées', 'Lent, contractuel'),
            P('Éric Labbé', 'Contremaître des équipes de construction', 'SENIOR', 'NEUTRAL', 3, 'Des secteurs prêts à construire', 'Sous-traitants réservés ailleurs à l’automne', 'Concret'),
          ],
        },
        decision: {
          title: 'Remplacement des poteaux',
          context: 'Le propriétaire des poteaux annonce 8 mois pour remplacer ceux qui sont non conformes.',
          optimalOption: 1,
          options: [
            ['Attendre son calendrier', 'Aucun coût, mais la date butoir est manquée.', [0, -20, 0, 0, 20]],
            ['Financer des entrepreneurs qualifiés agréés par le propriétaire', 'Coûteux (2,1 M$), mais calendrier tenu.', [-8, 10, 0, 0, -10]],
            ['Passer en souterrain dans les secteurs problématiques', 'Indépendant des poteaux, mais très coûteux.', [-15, 5, 5, 0, 0]],
          ],
        },
      },
      {
        name: 'Construction',
        type: PhaseType.EXECUTION,
        durationDays: 240,
        description: 'Déployer le réseau secteur par secteur et raccorder les foyers.',
        meeting: {
          title: 'Point hebdomadaire de construction',
          description: 'Suivre la production et la sécurité des équipes.',
          type: 'STANDUP',
          objectives: ['Revoir les kilomètres déployés', 'Revoir la sécurité', 'Résoudre les blocages'],
          durationMinutes: 30,
          participants: [
            P('Éric Labbé', 'Contremaître des équipes de construction', 'SENIOR', 'AGGRESSIVE', 2, 'Plus de temps pour ses équipes', 'Fatigue, heures longues', 'Direct, défend ses gars'),
            P('Vincent Lemieux', 'Ingénieur réseau', 'SENIOR', 'NEUTRAL', 3, 'Qualité des épissures', 'Taux de reprise à 6 %', 'Précis'),
            P('Stéphanie Michaud', 'Responsable du service aux abonnés', 'INTERMEDIATE', 'COOPERATIVE', 4, 'Rendez-vous d’installation respectés', 'Plaintes en hausse', 'Orientée client'),
          ],
        },
        event: {
          type: RandomEventType.CONSTRAINT,
          title: 'Hiver précoce',
          description: 'Le sol gèle trois semaines plus tôt que prévu. Les travaux souterrains et les ancrages deviennent difficiles.',
          severity: Severity.HIGH,
          probability: 0.5,
          options: [
            ['Prioriser l’aérien et reporter le souterrain au printemps', 'Garde la cadence, raccordements reportés pour 900 foyers.', [0, -5, 0, 0, 0]],
            ['Dégeler le sol et continuer', 'Coûteux, cadence réduite.', [-10, -3, 0, -5, 5]],
            ['Arrêter jusqu’au printemps', 'Économique, mais date butoir menacée.', [3, -15, 0, 5, 15]],
          ],
        },
      },
      {
        name: 'Activation',
        type: PhaseType.MONITORING,
        durationDays: 60,
        description: 'Activer les abonnés et suivre la satisfaction.',
        meeting: {
          title: 'Revue de l’activation des abonnés',
          description: 'Analyser l’activation et la satisfaction.',
          type: 'STEERING',
          objectives: ['Analyser le taux d’activation', 'Traiter les plaintes', 'Préparer la reddition de comptes'],
          durationMinutes: 45,
          participants: [
            P('Stéphanie Michaud', 'Responsable du service aux abonnés', 'INTERMEDIATE', 'COOPERATIVE', 4, 'Réduire le délai d’installation', 'Techniciens d’installation en nombre insuffisant', 'Factuelle'),
            P('Claudine Ferland', 'Directrice du programme gouvernemental', 'EXECUTIVE', 'RESISTANT', 2, 'Foyers raccordables prouvés', 'Audit des données', 'Exigeante'),
            P('Vincent Lemieux', 'Ingénieur réseau', 'SENIOR', 'NEUTRAL', 3, 'Stabilité du réseau', 'Pannes isolées sur un secteur', 'Technique'),
          ],
        },
        decision: {
          title: 'Définition d’un foyer « raccordable »',
          context: 'Le programme compte un foyer comme raccordable si la fibre passe devant. 700 foyers ont la fibre en façade, mais aucun branchement possible avant le printemps.',
          optimalOption: 1,
          options: [
            ['Les déclarer raccordables', 'Atteint la cible, mais risque d’audit et de remboursement.', [5, 10, -10, 0, 20]],
            ['Les déclarer avec un plan de branchement daté', 'Transparent, négocie la reconnaissance partielle.', [0, 0, 5, 0, -5]],
            ['Ne pas les déclarer', 'Prudent, mais perte d’une partie de la subvention.', [-10, -5, 5, 0, 0]],
          ],
        },
      },
      {
        name: 'Clôture',
        type: PhaseType.CLOSURE,
        durationDays: 60,
        description: 'Reddition de comptes, transfert à l’exploitation et bilan.',
        meeting: {
          title: 'Reddition de comptes finale',
          description: 'Présenter les résultats au programme et à la MRC.',
          type: 'RETROSPECTIVE',
          objectives: ['Présenter les résultats', 'Fermer les contrats', 'Documenter les leçons apprises'],
          durationMinutes: 45,
          participants: [
            P('Claudine Ferland', 'Directrice du programme gouvernemental', 'EXECUTIVE', 'NEUTRAL', 3, 'Dossier complet et vérifiable', 'Vérificateur général', 'Procédurale'),
            P('Bernard Lapointe', 'Préfet de la MRC', 'EXECUTIVE', 'COOPERATIVE', 4, 'Annoncer la fin du projet', 'Aucune', 'Chaleureux'),
            P('Karine Fournier', 'Coordonnatrice des droits de passage', 'INTERMEDIATE', 'COOPERATIVE', 4, 'Documenter les ententes de poteaux', 'Aucune', 'Méthodique'),
          ],
        },
        decision: {
          title: 'Foyers restants hors subvention',
          context: '180 foyers très isolés ne sont pas raccordés et ne sont plus couverts par la subvention.',
          optimalOption: 2,
          options: [
            ['Les abandonner', 'Économie, mais promesse publique non tenue.', [5, 0, -5, -5, 10]],
            ['Les raccorder aux frais de l’entreprise', 'Image positive, coût de 1,4 M$.', [-10, -5, 5, 5, 0]],
            ['Solution sans fil fixe en attendant un nouveau programme', 'Service immédiat à coût modéré.', [-3, 0, 0, 5, -5]],
          ],
        },
      },
    ],
  },
];

// ─── Seeder ─────────────────────────────────────────────────────────────────

export async function seedSectorScenarios(prisma: PrismaClient, createdById: string): Promise<number> {
  for (const sc of SECTOR_SCENARIOS) {
    const content = {
      title: sc.title,
      description: sc.description,
      objectives: sc.objectives,
      sector: sc.sector,
      difficulty: sc.difficulty,
      estimatedDurationHours: sc.estimatedDurationHours,
      requiredPlan: TenantPlan.FREE,
      competencies: sc.competencies,
      isPublished: true,
      projectTemplate: {
        name: sc.project.name,
        client: sc.project.client,
        sector: sc.sector,
        description: sc.project.description,
        teamSize: sc.project.team.length,
        initialBudget: sc.project.initialBudget,
        deadlineDays: sc.project.deadlineDays,
        team: sc.project.team,
        deliverables: sc.project.deliverables.map((name, phaseOrder) => ({
          name,
          description: name,
          phaseOrder,
        })),
      },
      initialKpis: sc.initialKpis,
    };

    // Phases cascade-delete their templates: re-seeding refreshes content without duplicates.
    await prisma.scenarioPhase.deleteMany({ where: { scenarioId: sc.id } });
    await prisma.scenario.upsert({
      where: { id: sc.id },
      update: content,
      create: { id: sc.id, createdById, ...content },
    });

    for (const [order, ph] of sc.phases.entries()) {
      const phase = await prisma.scenarioPhase.create({
        data: {
          scenarioId: sc.id,
          order,
          name: ph.name,
          type: ph.type,
          durationDays: ph.durationDays,
          description: ph.description,
          completionCriteria: { requiredMeetings: 1, requiredDecisions: ph.decision ? 1 : 0 },
        },
      });

      await prisma.meetingTemplate.create({
        data: {
          phaseId: phase.id,
          title: ph.meeting.title,
          description: ph.meeting.description,
          type: ph.meeting.type,
          objectives: ph.meeting.objectives,
          durationMinutes: ph.meeting.durationMinutes,
          participants: ph.meeting.participants as unknown as object[],
        },
      });

      if (ph.decision) {
        await prisma.decisionTemplate.create({
          data: {
            phaseId: phase.id,
            title: ph.decision.title,
            context: ph.decision.context,
            optimalOption: ph.decision.optimalOption,
            options: options(ph.decision.options),
          },
        });
      }

      if (ph.event) {
        await prisma.randomEventTemplate.create({
          data: {
            phaseId: phase.id,
            type: ph.event.type,
            title: ph.event.title,
            description: ph.event.description,
            severity: ph.event.severity,
            probability: ph.event.probability,
            options: options(ph.event.options),
            triggerConditions: {},
          },
        });
      }
    }
  }
  return SECTOR_SCENARIOS.length;
}
