/**
 * The demo video, scene by scene: what the camera does on the public site and what the
 * narrator says in each language. Durations are derived from the narration at build time
 * (`run.mjs`), with a visual minimum per scene.
 *
 * Replace or add scenes with product captures (see README) once a stack with the demo
 * account is reachable: the pipeline does not care where a scene's footage comes from.
 */

/** @typedef {{ id: string, minSeconds: number, title: { fr: string, en: string }, narration: { fr: string, en: string }, action: string }} Scene */

/** @type {readonly Scene[]} */
export const SCENES = [
  {
    id: 'hero',
    minSeconds: 6,
    title: { fr: '', en: '' },
    narration: {
      fr: 'Simex pro. La gestion de projet ne s’apprend pas dans un manuel. Elle se vit.',
      en: 'Simex pro. Project management is not learned from a manual. It is lived.',
    },
    action: 'home',
  },
  {
    id: 'concept',
    minSeconds: 7,
    title: { fr: 'Un vrai projet à piloter', en: 'A real project to steer' },
    narration: {
      fr: 'Vous pilotez un projet complet, du brief du commanditaire jusqu’au retour final, avec une équipe qui réagit à vos décisions.',
      en: 'You steer a complete project, from the sponsor brief to the final debrief, with a team that reacts to your decisions.',
    },
    action: 'pilot',
  },
  {
    id: 'step1',
    minSeconds: 9,
    title: { fr: '01 · Choisir un scénario', en: '01 · Pick a scenario' },
    narration: {
      fr: 'Choisissez un scénario : construction, technologies de l’information, santé, finance. Chaque projet démarre avec une équipe et un budget réalistes.',
      en: 'Pick a scenario: construction, information technology, healthcare, finance. Every project starts with a realistic team and budget.',
    },
    action: 'step1',
  },
  {
    id: 'step2',
    minSeconds: 11,
    title: { fr: '02 · Décider en temps réel', en: '02 · Decide in real time' },
    narration: {
      fr: 'Tour après tour, vous rencontrez vos participants simulés, vous arbitrez budget et qualité, vous gérez les imprévus. Chaque décision fait bouger les indicateurs.',
      en: 'Round after round, you meet your simulated participants, trade off budget against quality, and handle the unexpected. Every decision moves the indicators.',
    },
    action: 'step2',
  },
  {
    id: 'step3',
    minSeconds: 9,
    title: { fr: '03 · Recevoir un retour senior', en: '03 · Get senior feedback' },
    narration: {
      fr: 'À la fin, un rapport calibré sur le référentiel PMI : score global, cinq dimensions, recommandations concrètes.',
      en: 'At the end, a report calibrated on the PMI standard: overall score, five dimensions, concrete recommendations.',
    },
    action: 'step3',
  },
  {
    id: 'catalogue',
    minSeconds: 9,
    title: { fr: 'Un catalogue qui grandit', en: 'A growing catalogue' },
    narration: {
      fr: 'Un catalogue qui grandit : débutant, intermédiaire, avancé, dans une vingtaine de secteurs.',
      en: 'A growing catalogue: beginner, intermediate, advanced, across some twenty sectors.',
    },
    action: 'catalogue',
  },
  {
    id: 'pricing',
    minSeconds: 8,
    title: { fr: 'Des plans en dollars canadiens', en: 'Plans in Canadian dollars' },
    narration: {
      fr: 'Un plan gratuit pour commencer, des plans en dollars canadiens pour aller plus loin, sans carte de crédit.',
      en: 'A free plan to get started, plans in Canadian dollars to go further, no credit card needed.',
    },
    action: 'pricing',
  },
  {
    id: 'outro',
    minSeconds: 6,
    title: { fr: 'simex-pro.com', en: 'simex-pro.com' },
    narration: {
      fr: 'Rejoignez le programme pilote sur simex-pro point com.',
      en: 'Join the pilot program at simex-pro dot com.',
    },
    action: 'outro',
  },
];

/** macOS `say` voices: Québec French and North-American English. */
export const VOICES = { fr: 'Amélie', en: 'Samantha' };

/** Catalogue shown during the recording (the preview server has no API). */
export const CATALOGUE_FIXTURE = [
  { id: 'c1', title: 'Migration infonuagique d’un ERP', description: 'Déplacer le cœur financier d’une PME vers le nuage sans arrêter la production.', sector: 'IT', difficulty: 'BEGINNER', scenarioType: 'GREENFIELD', estimatedDurationHours: 2, requiredPlan: 'FREE', competencies: ['Planification', 'Risques', 'Communication'], objectives: [], phaseCount: 5 },
  { id: 'c2', title: 'Nouveau pavillon hospitalier', description: 'Dix-huit mois, un budget serré, des parties prenantes qui ne sont pas d’accord.', sector: 'HEALTHCARE', difficulty: 'ADVANCED', scenarioType: 'GREENFIELD', estimatedDurationHours: 4, requiredPlan: 'PRO', competencies: ['Parties prenantes', 'Budget'], objectives: [], phaseCount: 6 },
  { id: 'c3', title: 'Chantier de pont en milieu urbain', description: 'Logistique, sous-traitants, riverains : un chantier qui ne tolère aucun retard.', sector: 'CONSTRUCTION', difficulty: 'INTERMEDIATE', scenarioType: 'GREENFIELD', estimatedDurationHours: 3, requiredPlan: 'STARTER', competencies: ['Échéancier', 'Sous-traitance'], objectives: [], phaseCount: 6 },
  { id: 'c4', title: 'Refonte du service à la clientèle d’une banque', description: 'Conformité, audits, et une équipe à rassurer.', sector: 'BANKING_INSURANCE', difficulty: 'INTERMEDIATE', scenarioType: 'BROWNFIELD', estimatedDurationHours: 3, requiredPlan: 'STARTER', competencies: ['Conformité', 'Gestion du changement'], objectives: [], phaseCount: 5 },
  { id: 'c5', title: 'Parc éolien communautaire', description: 'Un projet ESG sous contraintes carbone et calendrier politique.', sector: 'ENERGY', difficulty: 'ADVANCED', scenarioType: 'GREENFIELD', estimatedDurationHours: 4, requiredPlan: 'PRO', competencies: ['Risques', 'Parties prenantes'], objectives: [], phaseCount: 7 },
  { id: 'c6', title: 'Lancement d’une application de covoiturage', description: 'Délai de mise en marché et croissance humaine d’une jeune entreprise.', sector: 'DIGITAL_TRANSFORMATION', difficulty: 'BEGINNER', scenarioType: 'GREENFIELD', estimatedDurationHours: 2, requiredPlan: 'FREE', competencies: ['Priorisation', 'Équipe'], objectives: [], phaseCount: 5 },
];
