/**
 * Pure prompt builders for virtual meeting participants (text and audio modes).
 * No Nest / Prisma dependency so they can be unit-tested in isolation.
 */

export interface PromptParticipant {
  id?: string;
  name: string;
  role: string;
  personality?: string | null;
  cooperationLevel?: number | null;
  seniority?: string | null;
  objectives?: string | null;
  constraints?: string | null;
  communicationStyle?: string | null;
}

export interface PromptMeeting {
  title: string;
  type?: string | null;
  objectives?: string[] | null;
  durationMinutes?: number | null;
  description?: string | null;
}

export interface PromptKpis {
  budget: number;
  schedule: number;
  quality: number;
  teamMorale: number;
  riskLevel: number;
}

export interface MeetingPromptContext {
  scenarioTitle: string;
  phaseName: string;
  sector?: string | null;
  kpis: PromptKpis;
  projectDescription?: string;
  meeting?: PromptMeeting;
  /** Everyone else in the room (excluding the participant the prompt is for). */
  otherParticipants?: PromptParticipant[];
}

export interface HistoryMessage {
  role: string; // 'USER' | 'PARTICIPANT' | 'SYSTEM'
  content: string;
  participantId?: string | null;
  participant?: { name: string; role: string } | null;
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export const USER_SPEAKER_LABEL = 'Chef de projet';

const SENIORITY_LABELS: Record<string, string> = {
  EXECUTIVE: 'cadre dirigeant',
  SENIOR: 'senior',
  INTERMEDIATE: 'intermédiaire',
  JUNIOR: 'junior',
};

const SENIOR_ROLE_PATTERN =
  /sponsor|direct(eur|rice)|pr[ée]sident|vp\b|vice|dg\b|ceo|cto|cfo|cio|responsable|chef|manager|gestionnaire|pmo/i;

/** Morale on a 0-100 scale from the 1-5 cooperation level stored on participants. */
export function moraleFromCooperation(cooperationLevel?: number | null): number {
  const level = cooperationLevel ?? 3;
  return Math.max(0, Math.min(100, level * 20));
}

function describeParticipant(p: PromptParticipant): string {
  const parts = [`${p.name} (${p.role}`];
  if (p.seniority) parts.push(`, ${SENIORITY_LABELS[p.seniority] ?? p.seniority}`);
  parts.push(')');
  return parts.join('');
}

function buildBehaviourBlock(participant: PromptParticipant): string[] {
  const morale = moraleFromCooperation(participant.cooperationLevel);
  const personality = (participant.personality ?? 'COOPERATIVE').toUpperCase();

  if (personality === 'RESISTANT' || personality === 'AGGRESSIVE' || morale < 40) {
    return [
      'Attitude : sceptique, sous pression, parfois sec.',
      '- Conteste les propositions risquées ou mal chiffrées, exige des données.',
      '- Rappelle les engagements non tenus et les risques que personne ne veut voir.',
      '- Tu peux refuser un engagement tant que les conditions ne sont pas réunies.',
    ];
  }
  if (personality === 'NEUTRAL' || personality === 'DIPLOMATIC' || morale < 60) {
    return [
      'Attitude : pragmatique et factuel.',
      '- Exprime des réserves argumentées quand c\'est justifié, sans dramatiser.',
      '- Pose les questions qui fâchent (coût, délai, qui fait quoi), propose des compromis.',
    ];
  }
  return [
    'Attitude : engagé et constructif, mais pas complaisant.',
    '- Soutiens les bonnes décisions et propose des solutions concrètes.',
    '- Un participant coopératif peut quand même être en désaccord : dis-le si quelque chose ne tient pas.',
  ];
}

/** Rules shared by every participant, in every mode. Targets the "assistant-like" tone reported in user tests. */
export const REALISM_RULES: string[] = [
  'Règles de réalisme (impératives) :',
  '- Tu es un professionnel en réunion, pas un assistant. Ne propose jamais ton aide, ne résume pas ce que vient de dire ton interlocuteur.',
  '- Pas de « Bonjour », pas de remerciements, pas de « excellente question ». Une seule salutation au tout début de la réunion au maximum, et seulement si tu ouvres la séance.',
  '- Va droit au fait. Phrases courtes, langage oral professionnel, vocabulaire métier de ton domaine.',
  '- Défends les intérêts et les contraintes de ta fonction. Tu peux être d\'accord, en désaccord, contester une décision ou revenir sur un point déjà abordé.',
  '- Appuie-toi sur des éléments concrets : chiffres, délais, coûts, ressources, risques, dépendances, responsabilités.',
  '- Demande des précisions, des données ou un échéancier quand une proposition est floue. Propose une alternative quand tu refuses.',
  '- Tu peux interpeller un autre participant par son prénom ou réagir à ce qu\'il a dit.',
  '- Ne sors jamais de ton rôle et ne mentionne jamais que tu es une IA ou une simulation.',
  '- Réponds en français correct, avec les accents.',
];

export function buildParticipantSystemPrompt(
  participant: PromptParticipant,
  context: MeetingPromptContext,
  options: { maxSentences?: string } = {},
): string {
  const maxSentences = options.maxSentences ?? '2 à 4 phrases';
  const meeting = context.meeting;
  const others = (context.otherParticipants ?? []).filter((p) => p.name !== participant.name);
  const morale = moraleFromCooperation(participant.cooperationLevel);

  const lines: Array<string | false | undefined | null> = [
    `Tu es ${participant.name}, ${participant.role}.`,
    participant.seniority ? `Niveau hiérarchique : ${SENIORITY_LABELS[participant.seniority] ?? participant.seniority}. Adapte ton registre : un dirigeant tranche et parle enjeux, un junior est plus prudent et opérationnel.` : null,
    `Personnalité : ${participant.personality ?? 'COOPERATIVE'}. Moral actuel : ${morale}/100.`,
    participant.communicationStyle ? `Style de communication : ${participant.communicationStyle}.` : null,
    participant.objectives ? `Tes objectifs dans cette réunion : ${participant.objectives}` : null,
    participant.constraints ? `Tes contraintes : ${participant.constraints}` : null,
    '',
    `Projet : « ${context.scenarioTitle} » — phase : ${context.phaseName}.`,
    context.sector ? `Secteur : ${context.sector}.` : null,
    context.projectDescription ? `Contexte : ${context.projectDescription}` : null,
    meeting ? `Réunion : « ${meeting.title} »${meeting.type ? ` (${meeting.type})` : ''}${meeting.durationMinutes ? `, ${meeting.durationMinutes} minutes prévues` : ''}.` : null,
    meeting?.objectives?.length ? `Objectifs de la réunion : ${meeting.objectives.join(' ; ')}.` : null,
    others.length ? `Autres participants : ${others.map(describeParticipant).join(', ')}. Le chef de projet (l'utilisateur) anime le projet.` : `Le chef de projet (l'utilisateur) anime le projet.`,
    '',
    'Indicateurs actuels du projet (sur 100) :',
    `- Budget : ${context.kpis.budget} · Délai : ${context.kpis.schedule} · Qualité : ${context.kpis.quality} · Moral de l'équipe : ${context.kpis.teamMorale} · Niveau de risque : ${context.kpis.riskLevel}`,
    'Laisse ces indicateurs orienter tes préoccupations (un budget bas te rend vigilant sur les coûts, un risque élevé te fait insister sur les parades).',
    '',
    ...buildBehaviourBlock(participant),
    '',
    ...REALISM_RULES,
    `- Longueur : ${maxSentences}.`,
    '',
    'Dans l\'historique, chaque intervention des autres est préfixée par [Nom — rôle]. Ne préfixe pas tes propres réponses.',
  ];

  return lines.filter((l) => l !== null && l !== undefined && l !== false).join('\n');
}

/**
 * Converts stored meeting messages into chat turns from the point of view of `speakerId`.
 * Only the speaker's own lines are `assistant`; everyone else (user and other participants)
 * becomes a `user` turn prefixed with "[Nom — rôle]", so the model never mistakes another
 * participant's words for its own. Consecutive same-role turns are merged and the result
 * always starts with a `user` turn, as required by the Anthropic Messages API.
 */
export function buildSpeakerLabelledHistory(
  messages: HistoryMessage[],
  speakerId: string | null | undefined,
  limit = 20,
): ChatTurn[] {
  const turns: ChatTurn[] = [];

  for (const m of messages.slice(-limit)) {
    if (!m.content?.trim()) continue;
    const isOwn = m.role === 'PARTICIPANT' && !!speakerId && m.participantId === speakerId;
    let turn: ChatTurn;
    if (isOwn) {
      turn = { role: 'assistant', content: m.content };
    } else if (m.role === 'USER') {
      turn = { role: 'user', content: `[${USER_SPEAKER_LABEL}] ${m.content}` };
    } else if (m.role === 'SYSTEM') {
      turn = { role: 'user', content: `[Note de séance] ${m.content}` };
    } else {
      const label = m.participant ? `${m.participant.name} — ${m.participant.role}` : 'Participant';
      turn = { role: 'user', content: `[${label}] ${m.content}` };
    }

    const last = turns[turns.length - 1];
    if (last && last.role === turn.role) {
      last.content = `${last.content}\n\n${turn.content}`;
    } else {
      turns.push({ ...turn });
    }
  }

  if (turns.length > 0 && turns[0].role === 'assistant') {
    turns.unshift({ role: 'user', content: '[Note de séance] La réunion est ouverte.' });
  }
  return turns;
}

/** Appends the new user message to a labelled history, merging with a trailing user turn. */
export function appendUserTurn(history: ChatTurn[], userMessage: string): ChatTurn[] {
  const content = `[${USER_SPEAKER_LABEL}] ${userMessage}`;
  const turns = history.map((t) => ({ ...t }));
  const last = turns[turns.length - 1];
  if (last && last.role === 'user') {
    last.content = `${last.content}\n\n${content}`;
  } else {
    turns.push({ role: 'user', content });
  }
  return turns;
}

/**
 * Picks who opens the meeting: highest seniority first, then a role that looks like
 * a sponsor / manager, then the first participant.
 */
export function pickFacilitator<T extends PromptParticipant>(participants: T[]): T | undefined {
  if (participants.length === 0) return undefined;
  const rank = (p: PromptParticipant) =>
    p.seniority === 'EXECUTIVE' ? 0 : p.seniority === 'SENIOR' ? 1 : SENIOR_ROLE_PATTERN.test(p.role) ? 2 : 3;
  return [...participants].sort((a, b) => rank(a) - rank(b))[0];
}

/** Instruction given to the facilitator to open the meeting (text and audio). */
export function buildOpeningInstruction(context: MeetingPromptContext, facilitator: PromptParticipant): string {
  const meeting = context.meeting;
  const others = (context.otherParticipants ?? []).filter((p) => p.name !== facilitator.name);
  const invitee = others[0];
  return [
    `Tu ouvres la réunion${meeting ? ` « ${meeting.title} »` : ''} en tant que ${facilitator.role}.`,
    'En 3 à 5 phrases, à l\'oral :',
    '1. ouvre la séance (une salutation brève, une seule) ;',
    `2. rappelle l'objectif${meeting?.objectives?.length ? ` (${meeting.objectives.join(' ; ')})` : ''}${meeting?.durationMinutes ? ` et le temps disponible (${meeting.durationMinutes} minutes)` : ''} ;`,
    '3. présente le premier sujet avec un fait concret tiré des indicateurs du projet ;',
    invitee
      ? `4. donne la parole à ${invitee.name} ou au chef de projet avec une question précise.`
      : '4. donne la parole au chef de projet avec une question précise.',
    'Pas de liste à puces, pas de titre : parle comme en réunion.',
  ].join('\n');
}

/** Deterministic opener used when the AI provider fails, so the room is never silent. */
export function buildFallbackOpening(context: MeetingPromptContext): string {
  const meeting = context.meeting;
  const objectives = meeting?.objectives?.length
    ? meeting.objectives.map((o) => o.replace(/\.$/, '')).join(', ')
    : 'faire le point sur le projet';
  const duration = meeting?.durationMinutes ? ` On a ${meeting.durationMinutes} minutes.` : '';
  return `Bonjour à tous, on commence. L'objectif aujourd'hui : ${objectives}.${duration} Chef de projet, peux-tu nous donner ton point de situation pour démarrer ?`;
}
