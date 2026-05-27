import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components/keenicons';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { DisabledWithTooltip } from '@/components/ui/disabled-with-tooltip';
import { cn } from '@/lib/utils';
import { streamAiResponse } from '@/lib/sse-client';
import { MeetingConference } from './meeting-conference';
import { MeetingChatPanel } from './meeting-chat-panel';
import { ParticipantAvatar } from './participant-avatar';
import type { ChatMessage, MeetingDetail, MeetingParticipant } from '../types/meeting.types';

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function useChronometer(startedAt: string | null, active: boolean) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!active || !startedAt) return;
    const start = new Date(startedAt).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startedAt, active]);
  return elapsed;
}

interface MeetingRoomShellProps {
  meeting: MeetingDetail;
  onComplete: () => void;
  actionLoading: boolean;
}

export function MeetingRoomShell({ meeting, onComplete, actionLoading }: MeetingRoomShellProps) {
  const [mode, setMode] = useState<'TEXT' | 'AUDIO'>(meeting.mode);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [showAudioWarning, setShowAudioWarning] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    meeting.messages.map((m) => ({
      id: m.id,
      role: m.role === 'USER' ? 'user' : 'assistant',
      content: m.content,
      timestamp: new Date(m.createdAt),
      participantName: m.participant?.name,
    })),
  );
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<MeetingParticipant | null>(
    meeting.participants[0] ?? null,
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const elapsed = useChronometer(meeting.startedAt, true);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // sendMessage — repris verbatim de l'ancien meeting-room.tsx.
  const sendMessage = useCallback(async () => {
    if (!input.trim() || streaming) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setStreaming(true);

    const assistantId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        participantName: selectedParticipant?.name,
      },
    ]);

    await streamAiResponse(`/meetings/${meeting.id}/messages`, {
      content: userMsg.content,
      participantId: selectedParticipant?.id,
    }, {
      onToken: (token) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + token } : m)),
        );
      },
      onError: (err) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: `Erreur: ${err}` } : m)),
        );
      },
    });

    setStreaming(false);
    inputRef.current?.focus();
  }, [input, streaming, selectedParticipant, meeting.id]);

  return (
    <div className="px-6 pb-6 space-y-3">
      {/* Topbar salle */}
      <div className="flex items-center justify-between gap-3 flex-wrap rounded-xl bg-[var(--brand-700)] px-4 py-2.5">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-display text-sm font-bold text-white truncate">{meeting.title}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--error-500)]/20 px-2.5 py-0.5 text-[11px] font-bold text-[#FCA5A5]">
            <span className="size-1.5 rounded-full bg-[var(--error-500)] animate-pulse" />
            EN DIRECT
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <div role="group" aria-label="Mode de réunion" className="flex items-center rounded-lg border border-white/15 overflow-hidden">
            <button
              type="button"
              aria-pressed={mode === 'TEXT'}
              onClick={() => setMode('TEXT')}
              className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold leading-none transition-colors cursor-pointer',
                mode === 'TEXT' ? 'bg-[var(--accent-500)] text-white' : 'text-[var(--brand-100)] hover:bg-white/10')}
            >
              <KeenIcon icon="message-text" style="duotone" className="text-sm leading-none" />
              Texte
            </button>
            <button
              type="button"
              aria-pressed={mode === 'AUDIO'}
              onClick={() => { if (mode !== 'AUDIO') setShowAudioWarning(true); }}
              className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold leading-none transition-colors cursor-pointer',
                mode === 'AUDIO' ? 'bg-[var(--accent-500)] text-white' : 'text-[var(--brand-100)] hover:bg-white/10')}
            >
              <KeenIcon icon="speaker" style="duotone" className="text-sm leading-none" />
              Audio
            </button>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-white tabular-nums">
            <KeenIcon icon="time" style="duotone" className="text-xs leading-none" />
            {formatElapsed(elapsed)}
          </span>
        </div>
      </div>

      {/* AlertDialog crédits audio */}
      <AlertDialog open={showAudioWarning} onOpenChange={setShowAudioWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <KeenIcon icon="speaker" style="duotone" className="size-5 text-[var(--warning-500)]" />
              Mode audio
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">
                Le mode audio utilise la synthèse vocale en temps réel pour chaque participant.
                Cette fonctionnalité <span className="font-semibold text-foreground">consomme significativement plus de crédits</span> que le mode texte.
              </span>
              <span className="block text-xs text-[var(--neutral-500)]">
                Chaque participant actif génère un flux audio continu tant que la conférence est en cours.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Rester en texte</AlertDialogCancel>
            <AlertDialogAction onClick={() => setMode('AUDIO')}>Activer l'audio</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {mode === 'AUDIO' ? (
        <div className="flex gap-4">
          <div className="flex-1 min-w-0">
            <MeetingConference
              meetingId={meeting.id}
              participants={meeting.participants}
              meetingTitle={meeting.title}
              startedAt={meeting.startedAt}
              onEnd={onComplete}
              forceSingleMode
              chatOpen={chatDrawerOpen}
              onToggleChat={() => setChatDrawerOpen((v) => !v)}
            />
          </div>
          {chatDrawerOpen && (
            <div className="fixed inset-0 z-40 sm:static sm:z-auto sm:w-[300px] sm:shrink-0">
              <div className="absolute inset-0 bg-black/50 sm:hidden" onClick={() => setChatDrawerOpen(false)} />
              <div className="absolute inset-y-0 right-0 w-[88%] max-w-[340px] bg-[var(--brand-900)] p-3 flex flex-col sm:static sm:w-full sm:max-w-none sm:bg-transparent sm:p-0 sm:h-[calc(100vh-180px)]">
                <div className="flex items-center justify-between mb-2 sm:hidden">
                  <span className="text-sm font-semibold text-white">Messages</span>
                  <button type="button" onClick={() => setChatDrawerOpen(false)} className="text-white/70 hover:text-white">
                    <KeenIcon icon="cross" style="outline" className="size-4" />
                  </button>
                </div>
                <div className="flex-1 min-h-0">
                  <MeetingChatPanel
                    variant="drawer"
                    participants={meeting.participants}
                    messages={messages}
                    input={input}
                    streaming={streaming}
                    selectedParticipant={selectedParticipant}
                    onInputChange={setInput}
                    onSelectParticipant={setSelectedParticipant}
                    onSend={sendMessage}
                    scrollRef={scrollRef}
                    inputRef={inputRef}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5">
          <div className="h-[calc(100vh-220px)]">
            <MeetingChatPanel
              variant="full"
              participants={meeting.participants}
              messages={messages}
              input={input}
              streaming={streaming}
              selectedParticipant={selectedParticipant}
              onInputChange={setInput}
              onSelectParticipant={setSelectedParticipant}
              onSend={sendMessage}
              scrollRef={scrollRef}
              inputRef={inputRef}
            />
          </div>

          <div className="space-y-3">
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-[var(--neutral-500)]">
                  Donner la parole
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-1 space-y-2">
                <p className="text-[10px] text-[var(--neutral-500)] mb-1">
                  Cliquez sur un participant pour lui adresser la parole.
                </p>
                {meeting.participants.map((p) => {
                  const active = selectedParticipant?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedParticipant(p);
                        inputRef.current?.focus();
                      }}
                      className={cn('flex items-center gap-2.5 w-full p-2 rounded-lg transition-colors cursor-pointer text-left border',
                        active ? 'bg-[var(--accent-100)] border-[var(--accent-200)]' : 'border-transparent hover:bg-[var(--neutral-50)]')}
                    >
                      <ParticipantAvatar participant={p} />
                      <div className="min-w-0 flex-1">
                        <p className={cn('text-sm font-medium truncate', active && 'text-[var(--accent-700)]')}>{p.name}</p>
                        <p className="text-[10px] text-[var(--neutral-500)] truncate">{p.role}</p>
                      </div>
                      {active && (
                        <span className="flex items-center gap-1">
                          <span className="size-1.5 rounded-full bg-[var(--success-500)] animate-pulse" />
                          <span className="text-[9px] text-[var(--success-700)] font-medium">Actif</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            <DisabledWithTooltip disabled={messages.length === 0} reason="Échangez d'abord avec les participants">
              <Button
                variant="outline"
                size="sm"
                onClick={onComplete}
                disabled={actionLoading || messages.length === 0}
                className="w-full"
              >
                <KeenIcon icon="check-circle" style="duotone" className="text-xs" />
                {actionLoading ? 'Clôture…' : 'Clôturer la réunion'}
              </Button>
            </DisabledWithTooltip>
          </div>
        </div>
      )}
    </div>
  );
}
