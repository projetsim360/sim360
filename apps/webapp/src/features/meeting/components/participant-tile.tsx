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

// Stable accent colors for participants
const ACCENT_COLORS = [
  { bg: 'bg-violet-500/20', ring: 'ring-violet-400', dot: 'bg-violet-400' },
  { bg: 'bg-emerald-500/20', ring: 'ring-emerald-400', dot: 'bg-emerald-400' },
  { bg: 'bg-amber-500/20', ring: 'ring-amber-400', dot: 'bg-amber-400' },
  { bg: 'bg-rose-500/20', ring: 'ring-rose-400', dot: 'bg-rose-400' },
  { bg: 'bg-cyan-500/20', ring: 'ring-cyan-400', dot: 'bg-cyan-400' },
  { bg: 'bg-blue-500/20', ring: 'ring-blue-400', dot: 'bg-blue-400' },
];

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % ACCENT_COLORS.length;
}

const STATUS_CONFIG: Record<ParticipantConnectionStatus, { dot: string; label: string }> = {
  idle: { dot: 'bg-muted-foreground/50', label: 'Hors ligne' },
  connecting: { dot: 'bg-warning animate-pulse', label: 'Connexion...' },
  connected: { dot: 'bg-success', label: 'Connecte' },
  error: { dot: 'bg-destructive', label: 'Erreur' },
  closed: { dot: 'bg-muted-foreground/50', label: 'Deconnecte' },
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
  const accent = ACCENT_COLORS[hashName(participant.name)];
  const statusCfg = STATUS_CONFIG[status];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`
        group relative flex flex-col items-center justify-center rounded-xl transition-all duration-300 overflow-hidden w-full
        ${isLarge ? 'min-h-[160px] py-5 px-4 gap-2.5' : 'min-h-[70px] min-w-[90px] py-2.5 px-3 gap-1.5'}
        ${isActive
          ? `bg-[#1e1833] ring-1 ${accent.ring}/40`
          : 'bg-[#16122a] hover:bg-[#1e1833]'
        }
        ${onClick ? 'cursor-pointer' : 'cursor-default'}
      `}
    >
      {/* Speaking glow effect */}
      {isSpeaking && (
        <div className={`absolute inset-0 rounded-xl ${accent.bg} animate-pulse`} />
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        {/* Avatar */}
        <div className="relative">
          <div
            className={`
              ${isLarge ? 'w-16 h-16 text-xl' : 'w-9 h-9 text-sm'}
              rounded-full flex items-center justify-center font-semibold transition-all duration-300
              ${isSpeaking ? `ring-[3px] ${accent.ring} scale-105` : 'ring-0 scale-100'}
              ${isUser ? 'bg-brand-500/25 text-brand-400' : 'bg-[#2a2344] text-white/90'}
            `}
          >
            {participant.avatar ? (
              <img
                src={participant.avatar}
                alt={participant.name}
                className="w-full h-full rounded-full object-cover"
                loading="lazy"
              />
            ) : isUser ? (
              /* User icon instead of just "V" */
              <svg className={isLarge ? 'w-7 h-7' : 'w-4 h-4'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            ) : (
              participant.name.charAt(0).toUpperCase()
            )}
          </div>

          {/* Status dot */}
          {!isUser && (
            <div
              className={`
                absolute -bottom-0.5 -right-0.5
                ${isLarge ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5'}
                rounded-full border-2 border-[#16122a]
                ${statusCfg.dot}
              `}
            />
          )}

          {/* Mute indicator (user only) */}
          {isUser && isMuted && (
            <div className={`absolute -bottom-0.5 -right-0.5 ${isLarge ? 'w-5 h-5' : 'w-3.5 h-3.5'} rounded-full bg-destructive flex items-center justify-center`}>
              <svg className={isLarge ? 'w-3 h-3' : 'w-2 h-2'} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 19L5 5m14 0v6a2 2 0 01-2 2H7" />
              </svg>
            </div>
          )}

          {/* Microphone active indicator (user, not muted) */}
          {isUser && !isMuted && status === 'connected' && (
            <div className={`absolute -bottom-0.5 -right-0.5 ${isLarge ? 'w-6 h-6' : 'w-4 h-4'} rounded-full bg-success flex items-center justify-center`}>
              <svg className={isLarge ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5'} viewBox="0 0 24 24" fill="white">
                <path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0014 0h-2zm-5 9a1 1 0 011 1v1h-2v-1a1 1 0 011-1z" />
              </svg>
            </div>
          )}
        </div>

        {/* Name & Role */}
        <div className="text-center">
          <p className={`font-medium text-white/90 truncate ${isLarge ? 'text-sm max-w-[130px]' : 'text-[11px] max-w-[85px]'}`}>
            {isUser ? 'Vous' : participant.name}
          </p>
          {isLarge && !isUser && (
            <p className="text-[11px] text-white/40 truncate max-w-[130px] mt-0.5">
              {participant.role}
            </p>
          )}
        </div>

        {/* Speaking bars */}
        {isSpeaking && isLarge && (
          <div className="flex items-center gap-[3px]">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-[3px] ${accent.dot} rounded-full animate-pulse`}
                style={{
                  height: `${6 + Math.random() * 10}px`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: `${0.4 + Math.random() * 0.3}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* "Click to talk" hint in single mode */}
        {conferenceMode === 'single' && !isUser && !isActive && isLarge && (
          <span className="text-[10px] text-white/30 opacity-0 group-hover:opacity-100 transition-opacity">
            Donner la parole
          </span>
        )}

        {/* Active indicator in single mode */}
        {conferenceMode === 'single' && isActive && !isUser && isLarge && (
          <div className="flex items-center gap-1 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] text-success font-medium">A la parole</span>
          </div>
        )}
      </div>
    </button>
  );
}
