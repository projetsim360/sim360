/**
 * Pure helpers for the public contact form (unit-tested without Nest).
 */

export interface ContactSubmission {
  name: string;
  email: string;
  message: string;
  /** Honeypot: a real visitor never fills it, bots do. */
  website?: string;
  /** Milliseconds between form display and submission, sent by the client. */
  elapsedMs?: number;
}

/** Fastest plausible human submission. Below that, the form was filled by a script. */
export const MIN_FILL_TIME_MS = 2500;

export type SpamVerdict = 'ok' | 'honeypot' | 'too_fast' | 'link_flood';

/** Cheap, silent spam filter: callers accept the message either way so bots learn nothing. */
export function spamVerdict(input: ContactSubmission): SpamVerdict {
  if (input.website && input.website.trim().length > 0) return 'honeypot';
  if (typeof input.elapsedMs === 'number' && input.elapsedMs >= 0 && input.elapsedMs < MIN_FILL_TIME_MS) return 'too_fast';
  const links = (input.message.match(/https?:\/\//gi) ?? []).length;
  if (links > 3) return 'link_flood';
  return 'ok';
}

/** Collapses exotic whitespace and trims; keeps paragraph breaks. */
export function normalizeMessage(message: string): string {
  return message
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t ]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
