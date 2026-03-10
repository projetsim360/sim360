import { useEffect, useRef } from 'react';
import type { ConferenceTranscription, MeetingParticipant } from '../types/meeting.types';

interface UseVoiceSwitcherOptions {
  participants: MeetingParticipant[];
  transcriptions: ConferenceTranscription[];
  isConnected: boolean;
  onSwitch: (participantId: string) => void;
}

/**
 * Detects when the user says a participant's name in their speech
 * and automatically switches the active participant.
 *
 * Listens to user transcriptions from the OpenAI realtime API
 * and matches against participant first names / full names.
 */
export function useVoiceSwitcher({
  participants,
  transcriptions,
  isConnected,
  onSwitch,
}: UseVoiceSwitcherOptions) {
  const lastProcessedRef = useRef(0);

  useEffect(() => {
    if (!isConnected || transcriptions.length === 0) return;

    // Only process new transcriptions since last check
    const newTranscriptions = transcriptions.slice(lastProcessedRef.current);
    lastProcessedRef.current = transcriptions.length;

    for (const t of newTranscriptions) {
      // Only analyze user speech
      if (t.role !== 'user') continue;

      const spoken = t.content.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

      // Check each participant name
      for (const p of participants) {
        const fullName = p.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const firstName = fullName.split(' ')[0];

        // Match if user said the first name or full name
        if (spoken.includes(firstName) || spoken.includes(fullName)) {
          onSwitch(p.id);
          break; // Only switch to the first match
        }
      }
    }
  }, [transcriptions, participants, isConnected, onSwitch]);
}
