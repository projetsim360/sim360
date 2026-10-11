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
import { useMutation } from '@tanstack/react-query';
import { meetingApi } from '../api/meeting.api';
import { MeetingConference } from './meeting-conference';
import { MeetingChatPanel } from './meeting-chat-panel';
import { ParticipantAvatar } from './participant-avatar';
import { MeetingTimelineChip } from './meeting-timeline-chip';
import type { ChatMessage, MeetingDetail, MeetingMessage, MeetingParticipant } from '../types/meeting.types';
import { Msg } from '@/i18n/app/msg';
import { useT } from '@/i18n/app/use-t';

function toChatMessage(m: MeetingMessage): ChatMessage {
  return {
    id: m.id,
    role: m.role === 'USER' ? 'user' : 'assistant',
    content: m.content,
    timestamp: new Date(m.createdAt),
    participantName: m.participant?.name,
  };
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
  const t = useT();
  const [mode, setMode] = useState<'TEXT' | 'AUDIO'>(meeting.mode);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [showAudioWarning, setShowAudioWarning] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => meeting.messages.map(toChatMessage));
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

  // Auto-opening: an empty, in-progress meeting gets an opening statement from the facilitator
  // instead of a silent room. The server is idempotent; the ref avoids a double call in StrictMode.
  const openRequested = useRef(false);
  const openMutation = useMutation({
    mutationFn: () => meetingApi.openMeeting(meeting.id),
    onSuccess: (res) => {
      setMessages((prev) => (prev.length === 0 ? res.messages.map(toChatMessage) : prev));
      // Default the reply target to the facilitator who just spoke.
      const opener = res.messages.find((m) => m.role === 'PARTICIPANT');
      const p = meeting.participants.find((x) => x.id === opener?.participantId);
      if (p) setSelectedParticipant(p);
    },
  });
  useEffect(() => {
    if (mode !== 'TEXT' || openRequested.current) return;
    if (meeting.status !== 'IN_PROGRESS' || meeting.messages.length > 0) return;
    openRequested.current = true;
    openMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, meeting.id]);
  const opening = openMutation.isPending;

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
          prev.map((m) => (m.id === assistantId ? { ...m, content: t('common.errorWith', { message: String(err) }) } : m)),
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
            {t('room.live')}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <div role="group" aria-label={t('room.mode')} className="flex items-center rounded-lg border border-white/15 overflow-hidden">
            <button
              type="button"
              aria-pressed={mode === 'TEXT'}
              onClick={() => setMode('TEXT')}
              className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold leading-none transition-colors cursor-pointer',
                mode === 'TEXT' ? 'bg-[var(--accent-500)] text-white' : 'text-[var(--brand-100)] hover:bg-white/10')}
            >
              <KeenIcon icon="message-text" style="duotone" className="text-sm leading-none" />
              {t('room.text')}
            </button>
            <button
              type="button"
              aria-pressed={mode === 'AUDIO'}
              onClick={() => { if (mode !== 'AUDIO') setShowAudioWarning(true); }}
              className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold leading-none transition-colors cursor-pointer',
                mode === 'AUDIO' ? 'bg-[var(--accent-500)] text-white' : 'text-[var(--brand-100)] hover:bg-white/10')}
            >
              <KeenIcon icon="speaker" style="duotone" className="text-sm leading-none" />
              {t('room.audio')}
            </button>
          </div>
          <MeetingTimelineChip elapsedSeconds={elapsed} durationMinutes={meeting.durationMinutes} />
        </div>
      </div>

      {/* AlertDialog crédits audio */}
      <AlertDialog open={showAudioWarning} onOpenChange={setShowAudioWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <KeenIcon icon="speaker" style="duotone" className="size-5 text-[var(--warning-500)]" />
              {t('room.audioTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">
                <Msg id="room.audioText" values={{ b: (chunks) => <span className="font-semibold text-foreground">{chunks}</span> }} />
              </span>
              <span className="block text-xs text-[var(--neutral-500)]">
                {t('room.audioHint')}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('room.stayText')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => setMode('AUDIO')}>{t('room.enableAudio')}</AlertDialogAction>
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
              durationMinutes={meeting.durationMinutes}
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
                  <span className="text-sm font-semibold text-white">{t('room.messages')}</span>
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
                    opening={opening}
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
              opening={opening}
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
                  {t('room.giveFloor')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-1 space-y-2">
                <p className="text-[10px] text-[var(--neutral-500)] mb-1">
                  {t('room.giveFloorHint')}
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
                          <span className="text-[9px] text-[var(--success-700)] font-medium">{t('brownfield.active')}</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            <DisabledWithTooltip disabled={messages.length === 0} reason={t('room.closeReason')}>
              <Button
                variant="outline"
                size="sm"
                onClick={onComplete}
                disabled={actionLoading || messages.length === 0}
                className="w-full"
              >
                <KeenIcon icon="check-circle" style="duotone" className="text-xs" />
                {actionLoading ? t('room.closing') : t('room.close')}
              </Button>
            </DisabledWithTooltip>
          </div>
        </div>
      )}
    </div>
  );
}
