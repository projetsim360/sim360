/**
 * Aptitude test scenarios, one array per locale. Option values ('1'…'4') are what the API
 * scores, so both languages must keep the same ids, values and categories.
 */
export interface TestScenario {
  id: string;
  title: string;
  context: string;
  question: string;
  options: { value: string; label: string }[];
  category: 'prioritization' | 'communication' | 'budget';
}

export const SCENARIOS_FR: TestScenario[] = [
  {
    id: 'scenario-1',
    title: 'Gestion des priorités',
    context:
      'Vous avez 3 tâches urgentes et seulement 2 heures disponibles : corriger un bug critique en production, préparer la présentation pour le comité de pilotage de demain, et répondre à un appel d\'offre dont la deadline est ce soir.',
    question: 'Classez ces tâches par ordre de priorité. Quelle approche adoptez-vous ?',
    options: [
      {
        value: '1',
        label:
          'Bug critique d\'abord (impact immédiat), puis appel d\'offre (deadline), puis présentation (demain)',
      },
      {
        value: '2',
        label:
          'Appel d\'offre d\'abord (deadline ce soir), puis bug critique, puis présentation',
      },
      {
        value: '3',
        label:
          'Déléguer le bug à l\'équipe technique, traiter l\'appel d\'offre soi-même, et reporter la présentation',
      },
      {
        value: '4',
        label:
          'Traiter les 3 en parallèle en y consacrant 40 minutes chacune',
      },
    ],
    category: 'prioritization',
  },
  {
    id: 'scenario-2',
    title: 'Gestion de conflit',
    context:
      'Un membre de votre équipe est en conflit ouvert avec le client. Lors de la dernière réunion, il a contredit publiquement les exigences du client en affirmant qu\'elles étaient irréalistes. Le client menace d\'escalader au sponsor du projet.',
    question: 'Que faites-vous en priorité ?',
    options: [
      {
        value: '1',
        label:
          'Organiser un entretien individuel avec le membre de l\'équipe pour comprendre ses frustrations, puis une médiation avec le client',
      },
      {
        value: '2',
        label:
          'Contacter immédiatement le client pour s\'excuser et retirer le collaborateur du projet',
      },
      {
        value: '3',
        label:
          'Envoyer un email au client et au collaborateur pour recadrer les règles de communication',
      },
      {
        value: '4',
        label:
          'Laisser la situation se calmer d\'elle-même et intervenir uniquement si le client escalade vraiment',
      },
    ],
    category: 'communication',
  },
  {
    id: 'scenario-3',
    title: 'Dépassement budgétaire',
    context:
      'Votre projet a dépassé le budget initial de 20%. Les causes identifiées sont : des changements de périmètre non formalisés (+12%), des retards fournisseur ayant entraîné des pénalités (+5%), et une sous-estimation initiale (+3%). Le sponsor demande un plan d\'action.',
    question: 'Quelle action prenez-vous ?',
    options: [
      {
        value: '1',
        label:
          'Mettre en place un processus de change control strict, renégocier avec le fournisseur, et présenter une ré-estimation au sponsor',
      },
      {
        value: '2',
        label:
          'Réduire le périmètre du projet pour revenir dans le budget initial',
      },
      {
        value: '3',
        label:
          'Demander un budget supplémentaire au sponsor en justifiant chaque dépassement',
      },
      {
        value: '4',
        label:
          'Absorber le surcoût en réduisant la qualité des livrables restants',
      },
    ],
    category: 'budget',
  },
];

export const SCENARIOS_EN: TestScenario[] = [
  {
    id: 'scenario-1',
    title: 'Managing priorities',
    context:
      'You have 3 urgent tasks and only 2 hours: fix a critical bug in production, prepare tomorrow\'s steering committee presentation, and answer a call for tenders due tonight.',
    question: 'Rank these tasks by priority. Which approach do you take?',
    options: [
      { value: '1', label: 'Critical bug first (immediate impact), then the tender (deadline), then the presentation (tomorrow)' },
      { value: '2', label: 'Tender first (due tonight), then the critical bug, then the presentation' },
      { value: '3', label: 'Delegate the bug to the tech team, handle the tender yourself, and postpone the presentation' },
      { value: '4', label: 'Work on all 3 in parallel, 40 minutes each' },
    ],
    category: 'prioritization',
  },
  {
    id: 'scenario-2',
    title: 'Handling a conflict',
    context:
      'A team member is in open conflict with the client. In the last meeting, they publicly contradicted the client\'s requirements, calling them unrealistic. The client threatens to escalate to the project sponsor.',
    question: 'What do you do first?',
    options: [
      { value: '1', label: 'Hold a one-on-one with the team member to understand their frustrations, then mediate with the client' },
      { value: '2', label: 'Call the client right away to apologize and remove the team member from the project' },
      { value: '3', label: 'Email the client and the team member to reset the communication rules' },
      { value: '4', label: 'Let things calm down on their own and step in only if the client really escalates' },
    ],
    category: 'communication',
  },
  {
    id: 'scenario-3',
    title: 'Budget overrun',
    context:
      'Your project is 20% over its initial budget. The identified causes: unformalized scope changes (+12%), supplier delays that triggered penalties (+5%), and an initial underestimate (+3%). The sponsor asks for an action plan.',
    question: 'What action do you take?',
    options: [
      { value: '1', label: 'Set up a strict change control process, renegotiate with the supplier, and present a re-estimate to the sponsor' },
      { value: '2', label: 'Cut the project scope to get back to the initial budget' },
      { value: '3', label: 'Ask the sponsor for extra budget, justifying each overrun' },
      { value: '4', label: 'Absorb the extra cost by lowering the quality of the remaining deliverables' },
    ],
    category: 'budget',
  },
];
