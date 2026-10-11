/**
 * Offline knowledge base for the help assistant ("Aide" tab of the side panel).
 * Answers navigation questions on any page; no backend or model call involved.
 */

export interface HelpLink {
  to: string;
  label: string;
}

export interface HelpTopic {
  id: string;
  /** Example question shown as a suggestion chip. */
  question: string;
  /** Words or short phrases that identify the topic (accents and case are ignored). */
  keywords: string[];
  answer: string;
  link?: HelpLink;
}

export const HELP_TOPICS: HelpTopic[] = [
  {
    id: 'start-simulation',
    question: 'Comment démarrer une simulation ?',
    keywords: ['démarrer', 'commencer', 'lancer', 'nouvelle simulation', 'débuter', 'simulation'],
    answer:
      'Ouvrez « Nouvelle simulation », choisissez un scénario dans le catalogue (vous pouvez filtrer par secteur, niveau et type de situation), puis cliquez sur « Lancer la simulation ».',
    link: { to: '/simulations/new', label: 'Nouvelle simulation' },
  },
  {
    id: 'generate-scenario',
    question: 'Comment créer un nouveau scénario ?',
    keywords: ['créer un scénario', 'nouveau scénario', 'générer', 'scénario sur mesure', 'personnaliser le scénario'],
    answer:
      'Dans « Nouvelle simulation », ouvrez l’onglet « Générer une nouvelle simulation ». Décrivez votre projet, le secteur, le niveau et vos objectifs d’apprentissage, puis lancez la génération.',
    link: { to: '/simulations/new', label: 'Générer une simulation' },
  },
  {
    id: 'edit-profile',
    question: 'Où puis-je modifier mon profil ?',
    keywords: ['profil', 'modifier mon profil', 'photo', 'avatar', 'nom', 'fonction', 'poste', 'téléphone'],
    answer:
      'Votre profil se modifie dans « Paramètres » : nom, fonction, photo, téléphone et biographie. Pensez à cliquer sur « Enregistrer ».',
    link: { to: '/settings', label: 'Paramètres' },
  },
  {
    id: 'security',
    question: 'Comment activer la double authentification ?',
    keywords: ['2fa', 'double authentification', 'deux facteurs', 'sécurité', 'mot de passe', 'authentification'],
    answer:
      'Dans « Paramètres », section sécurité, cliquez sur « Configurer » pour la double authentification. Scannez le code QR avec votre application d’authentification, puis saisissez le code à 6 chiffres. Conservez vos codes de secours.',
    link: { to: '/settings', label: 'Paramètres de sécurité' },
  },
  {
    id: 'timezone',
    question: 'Comment changer mon fuseau horaire ?',
    keywords: ['fuseau', 'heure', 'horaire', 'timezone', 'format de date', 'préférences'],
    answer:
      'Dans « Paramètres », section Préférences, recherchez votre ville ou votre fuseau (par exemple America/Toronto pour l’heure de l’Est), puis enregistrez.',
    link: { to: '/settings', label: 'Préférences' },
  },
  {
    id: 'plan-meeting',
    question: 'Comment planifier une réunion ?',
    keywords: ['planifier', 'réunion', 'organiser une réunion', 'nouvelle réunion', 'convoquer', 'participants'],
    answer:
      'Ouvrez votre simulation, allez dans « Réunions » puis « Planifier une réunion ». Choisissez le sujet, les objectifs, la durée et composez la table : fonction, personnalité et niveau hiérarchique de chaque participant.',
    link: { to: '/simulations?statut=IN_PROGRESS', label: 'Mes simulations en cours' },
  },
  {
    id: 'meeting-run',
    question: 'Comment se déroule une réunion ?',
    keywords: ['se déroule', 'déroule', 'pendant la réunion', 'parler', 'donner la parole', 'audio', 'micro', 'vocal'],
    answer:
      'À l’ouverture, l’animateur lance la séance puis vous donne la parole. Choisissez à qui vous adresser dans « Donner la parole ». La ligne du temps indique le temps écoulé et restant. Le mode vocal s’active avec le bouton « Audio ».',
  },
  {
    id: 'action-items',
    question: 'Où retrouver les actions de suivi ?',
    keywords: ['actions de suivi', 'action', 'suivi', 'tâches', 'à faire', 'responsable', 'échéance'],
    answer:
      'Les actions décidées en réunion apparaissent dans le compte rendu de la réunion et dans « Actions de suivi » du menu de la simulation. Vous pouvez y attribuer un responsable, fixer une échéance et changer le statut.',
  },
  {
    id: 'completed',
    question: 'Montre-moi mes simulations terminées.',
    keywords: ['terminées', 'terminée', 'finies', 'historique', 'anciennes simulations', 'résultats'],
    answer: 'Voici vos simulations terminées. Ouvrez-en une pour consulter le débriefing et le portfolio.',
    link: { to: '/simulations?statut=COMPLETED', label: 'Simulations terminées' },
  },
  {
    id: 'deliverables',
    question: 'Comment remettre un livrable ?',
    keywords: ['livrable', 'remettre', 'soumettre', 'document', 'charte', 'rapport'],
    answer:
      'Dans votre simulation, ouvrez « Livrables », rédigez le document à partir du modèle proposé puis cliquez sur « Soumettre ». Vous recevrez un retour détaillé.',
  },
  {
    id: 'dashboard',
    question: 'Où est mon tableau de bord ?',
    keywords: ['tableau de bord', 'accueil', 'dashboard', 'retour', 'espace apprenant'],
    answer: 'Le tableau de bord est accessible à tout moment depuis « Espace Apprenant », en haut du menu de gauche.',
    link: { to: '/dashboard', label: 'Tableau de bord' },
  },
];

/** English knowledge base: same topics and links as the French one. */
export const HELP_TOPICS_EN: HelpTopic[] = [
  {
    id: 'start-simulation',
    question: 'How do I start a simulation?',
    keywords: ['start', 'begin', 'launch', 'new simulation', 'simulation'],
    answer:
      'Open “New simulation”, pick a scenario from the catalogue (you can filter by sector, level and type of situation), then click “Start the simulation”.',
    link: { to: '/simulations/new', label: 'New simulation' },
  },
  {
    id: 'generate-scenario',
    question: 'How do I create a new scenario?',
    keywords: ['create a scenario', 'new scenario', 'generate', 'custom scenario', 'customize the scenario'],
    answer:
      'In “New simulation”, open the “Generate a new simulation” tab. Describe your project, the sector, the level and your learning goals, then start the generation.',
    link: { to: '/simulations/new', label: 'Generate a simulation' },
  },
  {
    id: 'edit-profile',
    question: 'Where can I edit my profile?',
    keywords: ['profile', 'edit my profile', 'photo', 'avatar', 'name', 'job title', 'role', 'phone'],
    answer: 'You edit your profile in “Settings”: name, job title, photo, phone and bio. Remember to click “Save”.',
    link: { to: '/settings', label: 'Settings' },
  },
  {
    id: 'security',
    question: 'How do I turn on two-factor authentication?',
    keywords: ['2fa', 'two factor', 'two-factor', 'security', 'password', 'authentication'],
    answer:
      'In “Settings”, security section, click “Set up” for two-factor authentication. Scan the QR code with your authenticator app, then enter the 6-digit code. Keep your backup codes somewhere safe.',
    link: { to: '/settings', label: 'Security settings' },
  },
  {
    id: 'timezone',
    question: 'How do I change my time zone?',
    keywords: ['time zone', 'timezone', 'time', 'date format', 'preferences'],
    answer:
      'In “Settings”, Preferences section, search for your city or time zone (for example America/Toronto for Eastern time), then save.',
    link: { to: '/settings', label: 'Preferences' },
  },
  {
    id: 'plan-meeting',
    question: 'How do I schedule a meeting?',
    keywords: ['schedule', 'plan a meeting', 'meeting', 'organize a meeting', 'new meeting', 'invite', 'participants'],
    answer:
      'Open your simulation, go to “Meetings” then “Schedule a meeting”. Choose the topic, the goals and the length, then build the table: role, personality and seniority of each participant.',
    link: { to: '/simulations?statut=IN_PROGRESS', label: 'My ongoing simulations' },
  },
  {
    id: 'meeting-run',
    question: 'How does a meeting work?',
    keywords: ['how does', 'during the meeting', 'speak', 'give the floor', 'audio', 'microphone', 'voice'],
    answer:
      'When the meeting opens, the facilitator starts the session and hands you the floor. Choose who to address in “Give the floor”. The timeline shows elapsed and remaining time. Voice mode is turned on with the “Audio” button.',
  },
  {
    id: 'action-items',
    question: 'Where are the follow-up actions?',
    keywords: ['follow-up actions', 'action', 'follow up', 'tasks', 'to do', 'owner', 'due date'],
    answer:
      'Actions agreed in a meeting appear in the meeting minutes and in “Follow-up actions” in the simulation menu. There you can assign an owner, set a due date and change the status.',
  },
  {
    id: 'completed',
    question: 'Show me my completed simulations.',
    keywords: ['completed', 'finished', 'done', 'history', 'past simulations', 'results'],
    answer: 'Here are your completed simulations. Open one to see the debriefing and the portfolio.',
    link: { to: '/simulations?statut=COMPLETED', label: 'Completed simulations' },
  },
  {
    id: 'deliverables',
    question: 'How do I hand in a deliverable?',
    keywords: ['deliverable', 'hand in', 'submit', 'document', 'charter', 'report'],
    answer:
      'In your simulation, open “Deliverables”, write the document from the template provided, then click “Submit”. You will get detailed feedback.',
  },
  {
    id: 'dashboard',
    question: 'Where is my dashboard?',
    keywords: ['dashboard', 'home', 'back', 'learner space'],
    answer: 'The dashboard is always available from “Learner space”, at the top of the left menu.',
    link: { to: '/dashboard', label: 'Dashboard' },
  },
];

/** Knowledge base for the active interface language. */
export function helpTopicsFor(locale: string): HelpTopic[] {
  return locale === 'en' ? HELP_TOPICS_EN : HELP_TOPICS;
}

/** Lower-case and strip accents and punctuation, so « Réunion » matches "reunion". */
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Best topic for a free-text question, or null. Multi-word keywords weigh more than single words,
 * so "planifier une réunion" beats the generic "réunion".
 */
export function matchHelpTopic(question: string, topics: HelpTopic[] = HELP_TOPICS): HelpTopic | null {
  const q = ` ${normalizeText(question)} `;
  if (!q.trim()) return null;
  let best: { topic: HelpTopic; score: number } | null = null;
  for (const topic of topics) {
    let score = 0;
    for (const kw of topic.keywords) {
      const k = normalizeText(kw);
      if (k && q.includes(` ${k} `)) score += k.split(' ').length * 2;
      else if (k && q.includes(k)) score += 1;
    }
    if (score > 0 && (!best || score > best.score)) best = { topic, score };
  }
  return best?.topic ?? null;
}

/** Suggestions adapted to the current page. */
export function contextualSuggestions(pathname: string, topics: HelpTopic[] = HELP_TOPICS): HelpTopic[] {
  const byId = (ids: string[]) => ids.map((id) => topics.find((t) => t.id === id)).filter(Boolean) as HelpTopic[];
  if (pathname.startsWith('/settings')) return byId(['edit-profile', 'security', 'timezone']);
  if (pathname.startsWith('/meetings') || pathname.includes('/meetings')) return byId(['meeting-run', 'plan-meeting', 'action-items']);
  if (pathname.startsWith('/simulations/new')) return byId(['start-simulation', 'generate-scenario']);
  if (/^\/simulations\/[^/]+/.test(pathname)) return byId(['plan-meeting', 'action-items', 'deliverables']);
  if (pathname.startsWith('/simulations')) return byId(['start-simulation', 'completed', 'generate-scenario']);
  return byId(['start-simulation', 'edit-profile', 'plan-meeting', 'completed']);
}
