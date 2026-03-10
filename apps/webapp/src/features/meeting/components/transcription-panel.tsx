import { useEffect, useRef } from 'react';
import type { ConferenceTranscription } from '../types/meeting.types';

interface TranscriptionPanelProps {
  transcriptions: ConferenceTranscription[];
  open: boolean;
  onClose: () => void;
}

// Brand-derived participant colors
const PARTICIPANT_COLORS = [
  { text: 'text-primary', bg: 'bg-primary/10' },
  { text: 'text-success', bg: 'bg-success/10' },
  { text: 'text-[var(--accent-brand)]', bg: 'bg-[var(--accent-brand)]/10' },
  { text: 'text-warning', bg: 'bg-warning/10' },
  { text: 'text-destructive', bg: 'bg-destructive/10' },
  { text: 'text-info', bg: 'bg-info/10' },
];

function getParticipantIndex(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % PARTICIPANT_COLORS.length;
}

// Stable color based on participant name
function getParticipantColor(name: string): string {
  return PARTICIPANT_COLORS[getParticipantIndex(name)].text;
}

function getParticipantBg(name: string): string {
  return PARTICIPANT_COLORS[getParticipantIndex(name)].bg;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export function TranscriptionPanel({ transcriptions, open, onClose }: TranscriptionPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcriptions]);

  return (
    <div
      className={`
        border-l border-border/50 bg-[#0f0d1a]/95 backdrop-blur-sm flex flex-col
        transition-all duration-300 ease-in-out overflow-hidden
        ${open ? 'w-80 opacity-100' : 'w-0 opacity-0 border-l-0'}
      `}
    >
      {open && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm font-medium text-muted-foreground dark:text-white/70">Transcription en direct</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-muted-foreground dark:hover:text-white/70 hover:bg-[#251e3a] transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 scrollbar-thin scrollbar-thumb-[#251e3a]">
            {transcriptions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-10 h-10 rounded-full bg-[#251e3a]/50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <p className="text-muted-foreground text-sm text-center">
                  La transcription apparaitra ici<br />une fois la conversation lancee
                </p>
              </div>
            )}

            {transcriptions.map((t) => (
              <div key={t.id} className="group">
                {t.role === 'user' ? (
                  /* User message — right aligned */
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1.5 mb-0.5 mr-1">
                      <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatTime(t.timestamp)}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium">Vous</span>
                    </div>
                    <div className="max-w-[88%] rounded-2xl rounded-tr-md px-3 py-2 bg-primary/15 text-foreground dark:text-white/90 text-sm leading-relaxed">
                      {t.content}
                    </div>
                  </div>
                ) : (
                  /* Assistant message — left aligned */
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-1.5 mb-0.5 ml-1">
                      <span className={`text-[10px] font-medium ${getParticipantColor(t.participantName)}`}>
                        {t.participantName}
                      </span>
                      <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatTime(t.timestamp)}
                      </span>
                    </div>
                    <div className={`max-w-[88%] rounded-2xl rounded-tl-md px-3 py-2 ${getParticipantBg(t.participantName)} text-muted-foreground dark:text-white/70 text-sm leading-relaxed`}>
                      {t.content}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-border/50 shrink-0">
            <p className="text-[10px] text-muted-foreground text-center">
              {transcriptions.length} message{transcriptions.length !== 1 ? 's' : ''} transcrit{transcriptions.length !== 1 ? 's' : ''}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
