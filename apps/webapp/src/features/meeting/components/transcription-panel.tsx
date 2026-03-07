import { useEffect, useRef } from 'react';
import type { ConferenceTranscription } from '../types/meeting.types';

interface TranscriptionPanelProps {
  transcriptions: ConferenceTranscription[];
  open: boolean;
  onClose: () => void;
}

// Stable color based on participant name
function getParticipantColor(name: string): string {
  const colors = [
    'text-blue-400',
    'text-emerald-400',
    'text-purple-400',
    'text-amber-400',
    'text-pink-400',
    'text-cyan-400',
    'text-rose-400',
    'text-indigo-400',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getParticipantBg(name: string): string {
  const colors = [
    'bg-blue-500/10',
    'bg-emerald-500/10',
    'bg-purple-500/10',
    'bg-amber-500/10',
    'bg-pink-500/10',
    'bg-cyan-500/10',
    'bg-rose-500/10',
    'bg-indigo-500/10',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
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
        border-l border-zinc-800/50 bg-zinc-950/95 backdrop-blur-sm flex flex-col
        transition-all duration-300 ease-in-out overflow-hidden
        ${open ? 'w-80 opacity-100' : 'w-0 opacity-0 border-l-0'}
      `}
    >
      {open && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-zinc-300">Transcription en direct</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 scrollbar-thin scrollbar-thumb-zinc-800">
            {transcriptions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-800/50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <p className="text-zinc-600 text-xs text-center">
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
                      <span className="text-[10px] text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatTime(t.timestamp)}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-medium">Vous</span>
                    </div>
                    <div className="max-w-[88%] rounded-2xl rounded-tr-md px-3 py-2 bg-primary/15 text-zinc-200 text-xs leading-relaxed">
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
                      <span className="text-[10px] text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatTime(t.timestamp)}
                      </span>
                    </div>
                    <div className={`max-w-[88%] rounded-2xl rounded-tl-md px-3 py-2 ${getParticipantBg(t.participantName)} text-zinc-300 text-xs leading-relaxed`}>
                      {t.content}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-zinc-800/50 shrink-0">
            <p className="text-[10px] text-zinc-600 text-center">
              {transcriptions.length} message{transcriptions.length !== 1 ? 's' : ''} transcrit{transcriptions.length !== 1 ? 's' : ''}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
