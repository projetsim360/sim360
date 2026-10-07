import { z } from 'zod';

export const PERSONALITY_OPTIONS = [
  { value: 'COOPERATIVE', label: 'Coopératif' },
  { value: 'NEUTRAL', label: 'Pragmatique' },
  { value: 'DIPLOMATIC', label: 'Diplomate' },
  { value: 'RESISTANT', label: 'Sceptique / résistant' },
  { value: 'AGGRESSIVE', label: 'Confrontant' },
] as const;

export const SENIORITY_OPTIONS = [
  { value: 'EXECUTIVE', label: 'Cadre dirigeant' },
  { value: 'SENIOR', label: 'Senior / gestionnaire' },
  { value: 'INTERMEDIATE', label: 'Intermédiaire' },
  { value: 'JUNIOR', label: 'Junior' },
] as const;

export const DURATION_OPTIONS = [15, 30, 45, 60, 90] as const;

const participantSchema = z.object({
  name: z.string().trim().min(1, 'Nom requis').max(80),
  role: z.string().trim().min(1, 'Fonction requise').max(120),
  personality: z.enum(['COOPERATIVE', 'NEUTRAL', 'DIPLOMATIC', 'RESISTANT', 'AGGRESSIVE']),
  seniority: z.enum(['EXECUTIVE', 'SENIOR', 'INTERMEDIATE', 'JUNIOR']),
  cooperationLevel: z.number().int().min(1).max(5),
  objectives: z.string().max(500).optional(),
  constraints: z.string().max(500).optional(),
  communicationStyle: z.string().max(120).optional(),
});

export const customMeetingSchema = z.object({
  title: z.string().trim().min(3, 'Indiquez le sujet de la réunion').max(160),
  objectives: z.string().trim().min(3, 'Indiquez au moins un objectif'),
  durationMinutes: z.number().int().min(5).max(120),
  sector: z.string().max(80).optional(),
  stakes: z.string().max(2000).optional(),
  mode: z.enum(['TEXT', 'AUDIO']),
  participants: z.array(participantSchema).min(1, 'Ajoutez au moins un participant').max(6, '6 participants maximum'),
});

export type CustomMeetingFormValues = z.infer<typeof customMeetingSchema>;

export const EMPTY_PARTICIPANT: CustomMeetingFormValues['participants'][number] = {
  name: '',
  role: '',
  personality: 'NEUTRAL',
  seniority: 'INTERMEDIATE',
  cooperationLevel: 3,
  objectives: '',
  constraints: '',
  communicationStyle: '',
};

export const DEFAULT_CUSTOM_MEETING: CustomMeetingFormValues = {
  title: '',
  objectives: '',
  durationMinutes: 30,
  sector: '',
  stakes: '',
  mode: 'TEXT',
  participants: [{ ...EMPTY_PARTICIPANT }],
};

const blankToUndefined = (v?: string) => (v && v.trim() ? v.trim() : undefined);

/** Form values → POST /simulations/:id/meetings body. One objective per line. */
export function toCustomMeetingPayload(values: CustomMeetingFormValues) {
  return {
    title: values.title.trim(),
    objectives: values.objectives
      .split('\n')
      .map((o) => o.replace(/^[-•*]\s*/, '').trim())
      .filter(Boolean)
      .slice(0, 6),
    durationMinutes: values.durationMinutes,
    sector: blankToUndefined(values.sector),
    stakes: blankToUndefined(values.stakes),
    mode: values.mode,
    participants: values.participants.map((p) => ({
      name: p.name.trim(),
      role: p.role.trim(),
      personality: p.personality,
      seniority: p.seniority,
      cooperationLevel: p.cooperationLevel,
      objectives: blankToUndefined(p.objectives),
      constraints: blankToUndefined(p.constraints),
      communicationStyle: blankToUndefined(p.communicationStyle),
    })),
  };
}

export type CustomMeetingPayload = ReturnType<typeof toCustomMeetingPayload>;
