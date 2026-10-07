/** Metadata tag stored on the facilitator's opening message. */
export const OPENING_MESSAGE_KIND = 'opening';

/** True when the meeting has no message yet, i.e. an opening statement should be produced. */
export function needsOpening(meeting: { status: string; messages: unknown[] }): boolean {
  return meeting.status === 'IN_PROGRESS' && meeting.messages.length === 0;
}
