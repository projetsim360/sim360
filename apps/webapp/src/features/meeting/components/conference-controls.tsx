import type { ConferenceMode, ViewMode } from '../types/meeting.types';

interface ConferenceControlsProps {
  elapsed: number;
  isMuted: boolean;
  isConnected: boolean;
  conferenceMode: ConferenceMode;
  viewMode: ViewMode;
  transcriptionOpen: boolean;
  isFullscreen: boolean;
  participantCount: number;
  activeParticipantName?: string;
  onToggleMute: () => void;
  onToggleConferenceMode: () => void;
  onToggleViewMode: () => void;
  onToggleTranscription: () => void;
  onToggleFullscreen: () => void;
  onConnect: () => void;
  onDisconnect: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// SVG icons inline for crisp rendering
function MicIcon({ muted }: { muted: boolean }) {
  if (muted) {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 19L5 5m14 0v6a2 2 0 01-2 2H7m-2-2V5a2 2 0 012-2h6a2 2 0 012 2v1M12 19v2m-4 0h8" />
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="w-5 h-5 rotate-[135deg]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

export function ConferenceControls({
  elapsed,
  isMuted,
  isConnected,
  conferenceMode,
  viewMode,
  transcriptionOpen,
  isFullscreen,
  participantCount,
  activeParticipantName,
  onToggleMute,
  onToggleConferenceMode,
  onToggleViewMode,
  onToggleTranscription,
  onToggleFullscreen,
  onConnect,
  onDisconnect,
}: ConferenceControlsProps) {
  // Pre-join state
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center gap-4 py-6">
        <p className="text-sm text-zinc-400">
          {participantCount} participant{participantCount > 1 ? 's' : ''} IA dans cette reunion
        </p>
        <button
          type="button"
          onClick={onConnect}
          className="flex items-center gap-3 px-8 py-3.5 rounded-full bg-primary text-white font-medium text-sm hover:bg-primary/90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
        >
          <MicIcon muted={false} />
          Rejoindre la conference
        </button>
        <p className="text-[11px] text-zinc-600">
          Votre micro sera active en rejoignant
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Active participant indicator in single mode */}
      {conferenceMode === 'single' && activeParticipantName && (
        <div className="flex items-center justify-center gap-2 py-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-zinc-400">
            En conversation avec <span className="text-zinc-200 font-medium">{activeParticipantName}</span>
          </span>
        </div>
      )}

      {/* Main control bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/90 backdrop-blur-md rounded-2xl border border-zinc-800/50">
        {/* Left: Timer + info */}
        <div className="flex items-center gap-3 min-w-[120px]">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-mono text-zinc-300 tabular-nums">{formatTime(elapsed)}</span>
          </div>
        </div>

        {/* Center: Action buttons */}
        <div className="flex items-center gap-2">
          {/* Mute toggle */}
          <button
            type="button"
            onClick={onToggleMute}
            className={`
              relative w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200
              ${isMuted
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 ring-1 ring-red-500/30'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }
            `}
            title={isMuted ? 'Reactiver le micro' : 'Couper le micro'}
          >
            <MicIcon muted={isMuted} />
          </button>

          {/* Separator */}
          <div className="w-px h-6 bg-zinc-800 mx-1" />

          {/* Conference mode toggle */}
          <button
            type="button"
            onClick={onToggleConferenceMode}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-200 text-xs font-medium
              ${conferenceMode === 'all'
                ? 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                : 'bg-primary/15 text-primary hover:bg-primary/25 ring-1 ring-primary/20'
              }
            `}
            title={conferenceMode === 'all' ? 'Passer en mode individuel' : 'Passer en mode tous'}
          >
            {conferenceMode === 'all' ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
            {conferenceMode === 'all' ? 'Tous' : 'Individuel'}
          </button>

          {/* Separator */}
          <div className="w-px h-6 bg-zinc-800 mx-1" />

          {/* Hang up */}
          <button
            type="button"
            onClick={onDisconnect}
            className="w-11 h-11 rounded-full flex items-center justify-center bg-red-500 text-white hover:bg-red-600 active:scale-95 transition-all duration-200 shadow-lg shadow-red-500/20"
            title="Raccrocher"
          >
            <PhoneIcon />
          </button>
        </div>

        {/* Right: View controls */}
        <div className="flex items-center gap-1.5 min-w-[120px] justify-end">
          {/* Grid / Speaker toggle */}
          <button
            type="button"
            onClick={onToggleViewMode}
            className={`
              w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200
              ${viewMode === 'grid'
                ? 'bg-zinc-700/80 text-zinc-200'
                : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
              }
            `}
            title={viewMode === 'grid' ? 'Vue speaker' : 'Vue grille'}
          >
            {viewMode === 'grid' ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>

          {/* Transcription toggle */}
          <button
            type="button"
            onClick={onToggleTranscription}
            className={`
              w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200
              ${transcriptionOpen
                ? 'bg-zinc-700/80 text-zinc-200'
                : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
              }
            `}
            title="Transcriptions"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </button>

          {/* Fullscreen toggle */}
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-all duration-200"
            title={isFullscreen ? 'Quitter le plein ecran' : 'Plein ecran'}
          >
            {isFullscreen ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
