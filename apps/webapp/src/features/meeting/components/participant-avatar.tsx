import { cn } from '@/lib/utils';
import type { MeetingParticipant } from '../types/meeting.types';

// Palette d'avatars Simex (alignée sur AVATAR_BG du dashboard/cockpit).
const AVATAR_BG = ['#1A2B48', '#EE7A3A', '#3D5478', '#78716C'];

export function participantAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_BG[Math.abs(hash) % AVATAR_BG.length];
}

const SIZE: Record<'sm' | 'md' | 'lg', { box: string; text: string }> = {
  sm: { box: 'size-8', text: 'text-xs' },
  md: { box: 'size-10', text: 'text-sm' },
  lg: { box: 'size-16', text: 'text-xl' },
};

interface ParticipantAvatarProps {
  participant: MeetingParticipant;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ParticipantAvatar({ participant, size = 'sm', className }: ParticipantAvatarProps) {
  const s = SIZE[size];
  if (participant.avatar) {
    return (
      <img
        src={participant.avatar}
        alt={participant.name}
        className={cn(s.box, 'rounded-full object-cover shrink-0', className)}
        loading="lazy"
      />
    );
  }
  return (
    <div
      className={cn(s.box, s.text, 'rounded-full flex items-center justify-center text-white font-bold shrink-0', className)}
      style={{ background: participantAvatarColor(participant.name) }}
    >
      {participant.name.charAt(0).toUpperCase()}
    </div>
  );
}
