import type { MeetingParticipant, ParticipantConnectionStatus } from '../types/meeting.types';

interface ParticipantTileProps {
  participant: MeetingParticipant;
  isSpeaking: boolean;
  isActive: boolean;
  status: ParticipantConnectionStatus;
  isUser?: boolean;
  isMuted?: boolean;
  size?: 'large' | 'small';
  conferenceMode?: 'all' | 'single';
  onClick?: () => void;
}

// Stable color per participant name
function getAccentColor(name: string): string {
  const colors = [
    'from-blue-500/30 to-blue-600/10',
    'from-emerald-500/30 to-emerald-600/10',
    'from-purple-500/30 to-purple-600/10',
    'from-amber-500/30 to-amber-600/10',
    'from-pink-500/30 to-pink-600/10',
    'from-cyan-500/30 to-cyan-600/10',
    'from-rose-500/30 to-rose-600/10',
    'from-indigo-500/30 to-indigo-600/10',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getRingColor(name: string): string {
  const colors = [
    'ring-blue-400/70',
    'ring-emerald-400/70',
    'ring-purple-400/70',
    'ring-amber-400/70',
    'ring-pink-400/70',
    'ring-cyan-400/70',
    'ring-rose-400/70',
    'ring-indigo-400/70',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

const STATUS_DOT: Record<ParticipantConnectionStatus, string> = {
  idle: 'bg-zinc-500',
  connecting: 'bg-yellow-400 animate-pulse',
  connected: 'bg-emerald-400',
  error: 'bg-red-400',
  closed: 'bg-zinc-500',
};

export function ParticipantTile({
  participant,
  isSpeaking,
  isActive,
  status,
  isUser = false,
  isMuted = false,
  size = 'large',
  conferenceMode = 'all',
  onClick,
}: ParticipantTileProps) {
  const isLarge = size === 'large';
  const accent = getAccentColor(participant.name);
  const ringColor = getRingColor(participant.name);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`
        group relative flex flex-col items-center justify-center gap-3 rounded-2xl transition-all duration-300 overflow-hidden
        ${isLarge ? 'min-h-[180px] p-6' : 'min-h-[80px] min-w-[100px] p-3'}
        ${isActive ? 'ring-2 ring-primary/50 bg-zinc-800/80' : 'bg-zinc-900/80 hover:bg-zinc-800/60'}
        ${onClick ? 'cursor-pointer' : 'cursor-default'}
      `}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-b ${accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isActive ? '!opacity-100' : ''}`} />

      {/* Speaking pulse rings */}
      {isSpeaking && (
        <>
          <div className={`absolute inset-0 rounded-2xl ring-2 ${ringColor} animate-ping opacity-20`} />
          <div className={`absolute inset-1 rounded-xl ring-1 ${ringColor} animate-pulse opacity-30`} />
        </>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        {/* Avatar */}
        <div className="relative">
          <div
            className={`
              ${isLarge ? 'w-20 h-20 text-2xl' : 'w-10 h-10 text-sm'}
              rounded-full flex items-center justify-center font-semibold transition-all duration-300
              ${isSpeaking ? `ring-[3px] ${ringColor} scale-105` : 'ring-0 scale-100'}
              ${isUser ? 'bg-primary/20 text-primary' : 'bg-zinc-700/80 text-zinc-200'}
            `}
          >
            {participant.avatar ? (
              <img
                src={participant.avatar}
                alt={participant.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              participant.name.charAt(0).toUpperCase()
            )}
          </div>

          {/* Status dot */}
          {!isUser && (
            <div
              className={`
                absolute -bottom-0.5 -right-0.5
                ${isLarge ? 'w-4 h-4' : 'w-3 h-3'}
                rounded-full border-2 border-zinc-900
                ${STATUS_DOT[status]}
              `}
            />
          )}

          {/* Mute indicator (user only) */}
          {isUser && isMuted && (
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 19L5 5m14 0v6a2 2 0 01-2 2H7" />
              </svg>
            </div>
          )}
        </div>

        {/* Name & Role */}
        <div className="text-center">
          <p className={`font-medium text-zinc-100 truncate ${isLarge ? 'text-sm max-w-[140px]' : 'text-[11px] max-w-[90px]'}`}>
            {isUser ? 'Vous' : participant.name}
          </p>
          {isLarge && !isUser && (
            <p className="text-[11px] text-zinc-500 truncate max-w-[140px] mt-0.5">
              {participant.role}
            </p>
          )}
        </div>

        {/* "Click to talk" hint in single mode */}
        {conferenceMode === 'single' && !isUser && !isActive && isLarge && status !== 'connected' && (
          <span className="text-[10px] text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">
            Cliquer pour parler
          </span>
        )}

        {/* Active indicator in single mode */}
        {conferenceMode === 'single' && isActive && !isUser && (
          <div className="flex items-center gap-1 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-medium">En conversation</span>
          </div>
        )}

        {/* Speaking indicator */}
        {isSpeaking && isLarge && (
          <div className="flex items-center gap-[3px]">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-[3px] bg-emerald-400 rounded-full animate-pulse"
                style={{
                  height: `${8 + Math.random() * 12}px`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: `${0.4 + Math.random() * 0.3}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </button>
  );
}
