import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { KeenIcon } from '@/components/keenicons';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
} from '@/components/ui/sheet';
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
import { MarkdownContent } from '@/components/ui/markdown-content';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { streamAiResponse } from '@/lib/sse-client';
import { meetingApi } from '../api/meeting.api';
import { MeetingConference } from '../components/meeting-conference';
import type { ChatMessage, MeetingDetail, MeetingParticipant } from '../types/meeting.types';

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Planifiee',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminee',
  CANCELLED: 'Annulee',
};

const STATUS_VARIANT: Record<string, 'secondary' | 'primary' | 'warning' | 'success' | 'destructive'> = {
  SCHEDULED: 'secondary',
  IN_PROGRESS: 'primary',
  COMPLETED: 'success',
  CANCELLED: 'destructive',
};

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

// Stable color for participant avatar
const PARTICIPANT_COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500',
  'bg-violet-500', 'bg-cyan-500', 'bg-pink-500', 'bg-teal-500',
];

function participantColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return PARTICIPANT_COLORS[Math.abs(hash) % PARTICIPANT_COLORS.length];
}

function ParticipantAvatar({ participant, size = 'sm' }: { participant: MeetingParticipant; size?: 'sm' | 'md' }) {
  const s = size === 'md' ? 'size-10' : 'size-8';
  const text = size === 'md' ? 'text-sm' : 'text-xs';

  if (participant.avatar) {
    return <img src={participant.avatar} alt={participant.name} className={cn(s, 'rounded-full object-cover shrink-0')} loading="lazy" />;
  }
  return (
    <div className={cn(s, 'rounded-full flex items-center justify-center text-white font-bold shrink-0', text, participantColor(participant.name))}>
      {participant.name.charAt(0)}
    </div>
  );
}

function ChatBubble({ msg, participants }: { msg: ChatMessage; participants: MeetingParticipant[] }) {
  const isUser = msg.role === 'user';
  const participant = !isUser && msg.participantName
    ? participants.find((p) => p.name === msg.participantName)
    : null;

  return (
    <div className={cn('flex gap-2.5 max-w-[85%]', isUser ? 'ml-auto flex-row-reverse' : 'mr-auto')}>
      {/* Avatar */}
      <div className={cn(
        'shrink-0 size-8 rounded-full flex items-center justify-center',
        isUser
          ? 'bg-brand-500 text-white'
          : participant
            ? cn(participantColor(participant.name), 'text-white')
            : 'bg-muted text-muted-foreground',
      )}>
        {isUser ? (
          <KeenIcon icon="user" style="duotone" className="size-4" />
        ) : participant ? (
          <span className="text-xs font-bold">{participant.name.charAt(0)}</span>
        ) : (
          <KeenIcon icon="people" style="duotone" className="size-4" />
        )}
      </div>

      {/* Bubble */}
      <div>
        {!isUser && msg.participantName && (
          <p className="text-[10px] text-muted-foreground mb-1 ml-1 font-medium">
            {msg.participantName}
          </p>
        )}
        <div className={cn(
          'rounded-2xl px-4 py-2.5 text-sm',
          isUser
            ? 'bg-brand-500 text-white rounded-br-md'
            : 'bg-muted/60 dark:bg-white/5 text-foreground rounded-bl-md border border-border/50',
        )}>
          {!msg.content ? (
            <span className="inline-block w-1.5 h-4 bg-brand-500 dark:bg-brand-400 rounded-full animate-pulse" />
          ) : isUser ? (
            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
          ) : (
            <MarkdownContent content={msg.content} />
          )}
        </div>
        {msg.timestamp && (
          <p className={cn('text-[10px] mt-1 ml-1', isUser ? 'text-right text-muted-foreground' : 'text-muted-foreground')}>
            {new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  );
}

export default function MeetingRoomPage() {
  const { meetingId } = useParams<{ meetingId: string }>();
  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<MeetingParticipant | null>(null);
  const [meetingMode, setMeetingMode] = useState<'TEXT' | 'AUDIO'>('TEXT');
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [showAudioWarning, setShowAudioWarning] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const elapsed = useChronometer(meeting?.startedAt ?? null, meeting?.status === 'IN_PROGRESS');

  // Load meeting data
  const loadMeeting = useCallback(async () => {
    if (!meetingId) return;
    try {
      const data = await meetingApi.getMeeting(meetingId);
      setMeeting(data);

      const chatMessages: ChatMessage[] = data.messages.map((m) => ({
        id: m.id,
        role: m.role === 'USER' ? 'user' as const : 'assistant' as const,
        content: m.content,
        timestamp: new Date(m.createdAt),
        participantName: m.participant?.name,
      }));
      setMessages(chatMessages);

      if (data.participants.length > 0 && !selectedParticipant) {
        setSelectedParticipant(data.participants[0]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [meetingId, selectedParticipant]);

  useEffect(() => {
    loadMeeting();
  }, [loadMeeting]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleStart() {
    if (!meetingId) return;
    setActionLoading(true);
    try {
      await meetingApi.startMeeting(meetingId);
      await loadMeeting();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleComplete() {
    if (!meetingId) return;
    setActionLoading(true);
    try {
      await meetingApi.completeMeeting(meetingId);
      await loadMeeting();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  const sendMessage = useCallback(async () => {
    if (!input.trim() || !meetingId || streaming) return;

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

    await streamAiResponse(`/meetings/${meetingId}/messages`, {
      content: userMsg.content,
      participantId: selectedParticipant?.id,
    }, {
      onToken: (token) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: m.content + token } : m,
          ),
        );
      },
      onError: (err) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: `Erreur: ${err}` } : m,
          ),
        );
      },
    });

    setStreaming(false);
    inputRef.current?.focus();
  }, [input, meetingId, streaming, selectedParticipant]);

  if (loading) {
    return (
      <div className="container">
        <Skeleton className="h-10 w-64 mb-5" />
        <Skeleton className="h-48 rounded-lg mb-5" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="container">
        <Toolbar>
          <ToolbarHeading title="Reunion" />
        </Toolbar>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive text-sm">{error || 'Reunion introuvable.'}</p>
            <Button variant="link" asChild>
              <Link to="/simulations">Retour aux simulations</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── SCHEDULED — Briefing ────────────────────────────────────────
  if (meeting.status === 'SCHEDULED') {
    return (
      <div className="container">
        <Toolbar>
          <ToolbarHeading title={meeting.title} />
          <ToolbarActions>
            <Badge variant="secondary" appearance="light" size="sm">
              {STATUS_LABELS[meeting.status]}
            </Badge>
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/simulations/${meeting.simulationId}`}>
                <KeenIcon icon="arrow-left" style="duotone" className="text-xs" />
                Retour
              </Link>
            </Button>
          </ToolbarActions>
        </Toolbar>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Briefing */}
          <div className="lg:col-span-2 space-y-5">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <KeenIcon icon="notepad" style="duotone" className="size-4" />
                  Briefing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {meeting.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{meeting.description}</p>
                )}

                {meeting.objectives.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Objectifs</h4>
                    <div className="space-y-2">
                      {meeting.objectives.map((obj, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <div className="size-5 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-[10px] font-bold text-muted-foreground">{i + 1}</span>
                          </div>
                          <span className="text-sm text-foreground">{obj}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="secondary" size="sm" className="gap-1.5 font-normal">
                    <KeenIcon icon="time" style="duotone" className="text-xs text-muted-foreground" />
                    {meeting.durationMinutes} min
                  </Badge>
                  <Badge variant="secondary" size="sm" className="gap-1.5 font-normal">
                    <KeenIcon icon="people" style="duotone" className="text-xs text-muted-foreground" />
                    {meeting.participants.length} participant{meeting.participants.length > 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <div className="flex justify-center">
              <Button variant="primary" size="lg" onClick={handleStart} disabled={actionLoading} className="px-8">
                <KeenIcon icon="rocket" style="duotone" className="text-sm" />
                {actionLoading ? 'Demarrage...' : 'Demarrer la reunion'}
              </Button>
            </div>
          </div>

          {/* Participants sidebar */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <KeenIcon icon="people" style="duotone" className="size-4" />
                Participants
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {meeting.participants.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <ParticipantAvatar participant={p} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{p.role}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ─── COMPLETED — Compte-rendu ─────────────────────────────────────
  if (meeting.status === 'COMPLETED') {
    const completedDate = meeting.completedAt
      ? new Date(meeting.completedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      : null;
    const startedDate = meeting.startedAt
      ? new Date(meeting.startedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      : null;
    const durationReal = meeting.startedAt && meeting.completedAt
      ? Math.round((new Date(meeting.completedAt).getTime() - new Date(meeting.startedAt).getTime()) / 60000)
      : null;

    return (
      <div className="container">
        <Toolbar>
          <ToolbarHeading title="Compte-rendu" />
          <ToolbarActions>
            <Badge variant="success" appearance="light" size="sm">
              Terminee
            </Badge>
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/simulations/${meeting.simulationId}`}>
                <KeenIcon icon="arrow-left" style="duotone" className="text-xs" />
                Retour
              </Link>
            </Button>
          </ToolbarActions>
        </Toolbar>

        {/* Header card — meeting info */}
        <Card className="mb-5">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                <KeenIcon icon="check-circle" style="duotone" className="size-6 text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold text-foreground">{meeting.title}</h2>
                {meeting.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{meeting.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="secondary" size="sm" className="gap-1.5 font-normal">
                    <KeenIcon icon="calendar" style="duotone" className="text-xs text-muted-foreground" />
                    {completedDate ?? 'Date inconnue'}
                  </Badge>
                  {durationReal !== null && (
                    <Badge variant="secondary" size="sm" className="gap-1.5 font-normal">
                      <KeenIcon icon="time" style="duotone" className="text-xs text-muted-foreground" />
                      {durationReal} min (debut {startedDate})
                    </Badge>
                  )}
                  <Badge variant="secondary" size="sm" className="gap-1.5 font-normal">
                    <KeenIcon icon="people" style="duotone" className="text-xs text-muted-foreground" />
                    {meeting.participants.length} participant{meeting.participants.length > 1 ? 's' : ''}
                  </Badge>
                  <Badge variant="secondary" size="sm" className="gap-1.5 font-normal">
                    <KeenIcon icon="message-text" style="duotone" className="text-xs text-muted-foreground" />
                    {messages.length} echange{messages.length > 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {meeting.summary ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
            {/* Left column — Summary + Decisions */}
            <div className="lg:col-span-2 space-y-5">
              {/* Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <KeenIcon icon="document" style="duotone" className="size-4" />
                    Synthese
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {meeting.summary.summary}
                  </p>
                </CardContent>
              </Card>

              {/* Key decisions */}
              {meeting.summary.keyDecisions.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <KeenIcon icon="verify" style="duotone" className="size-4 text-success" />
                      Decisions cles
                      <Badge variant="success" appearance="light" size="xs">
                        {meeting.summary.keyDecisions.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2.5">
                    {meeting.summary.keyDecisions.map((d, i) => (
                      <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-success/5 border border-success/15">
                        <div className="size-6 rounded-full bg-success/15 flex items-center justify-center shrink-0 mt-0.5">
                          <svg className="size-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        </div>
                        <span className="text-sm text-foreground leading-relaxed">{d}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Action items */}
              {meeting.summary.actionItems && meeting.summary.actionItems.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <KeenIcon icon="clipboard" style="duotone" className="size-4 text-brand-500" />
                      Plan d'actions
                      <Badge variant="primary" appearance="light" size="xs">
                        {meeting.summary.actionItems.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {meeting.summary.actionItems.map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                          <div className="size-7 rounded-full bg-brand-500/10 flex items-center justify-center shrink-0 text-xs font-bold text-brand-500">
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{item.task}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1.5">
                                <span className="size-1.5 rounded-full bg-muted-foreground/40" />
                                {item.assignee}
                              </span>
                              {item.deadline && (
                                <span className="flex items-center gap-1.5">
                                  <span className="size-1.5 rounded-full bg-brand-500/50" />
                                  {item.deadline}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right column — KPIs + Participants */}
            <div className="space-y-5">
              {/* Conversation history trigger */}
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={() => setHistoryDrawerOpen(true)}
                  className="flex items-center justify-between w-full p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <KeenIcon icon="message-text" style="duotone" className="size-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">Conversation</span>
                    <Badge variant="secondary" size="xs">{messages.length}</Badge>
                  </div>
                  <KeenIcon icon="right" style="duotone" className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>
              )}

              {/* KPI Impact */}
              {meeting.summary.kpiImpact && Object.keys(meeting.summary.kpiImpact).length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <KeenIcon icon="chart-line" style="duotone" className="size-4" />
                      Impact KPIs
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(meeting.summary.kpiImpact).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground capitalize">{key}</span>
                        <span className={cn(
                          'text-sm font-semibold',
                          val > 0 ? 'text-success' : val < 0 ? 'text-destructive' : 'text-muted-foreground',
                        )}>
                          {val > 0 ? '+' : ''}{val}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Participants */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <KeenIcon icon="people" style="duotone" className="size-4" />
                    Participants
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {/* User */}
                  <div className="flex items-center gap-2.5 p-2 rounded-lg bg-brand-500/5 border border-brand-500/10">
                    <div className="size-8 rounded-full bg-brand-500 flex items-center justify-center shrink-0">
                      <KeenIcon icon="user" style="duotone" className="size-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">Vous</p>
                      <p className="text-[10px] text-muted-foreground">Animateur</p>
                    </div>
                  </div>
                  {meeting.participants.map((p) => (
                    <div key={p.id} className="flex items-center gap-2.5 p-2 rounded-lg">
                      <ParticipantAvatar participant={p} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{p.role}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Objectives recap */}
              {meeting.objectives.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <KeenIcon icon="focus" style="duotone" className="size-4" />
                      Objectifs a atteindre
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {meeting.objectives.map((obj, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="size-4 rounded-full border-2 border-muted-foreground/30 shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{obj}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <Card className="mb-5">
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">Aucun resume disponible pour cette reunion.</p>
            </CardContent>
          </Card>
        )}

        {/* Conversation history drawer */}
        <Sheet open={historyDrawerOpen} onOpenChange={setHistoryDrawerOpen}>
          <SheetContent className="gap-0 sm:w-[540px] inset-5 start-auto h-auto rounded-lg p-0 sm:max-w-none">
            <SheetHeader className="px-5 py-4 border-b border-border">
              <SheetTitle className="flex items-center gap-2 text-sm">
                <KeenIcon icon="message-text" style="duotone" className="size-4" />
                Historique de la conversation
                <Badge variant="secondary" size="xs">{messages.length}</Badge>
              </SheetTitle>
            </SheetHeader>
            <SheetBody className="p-0">
              <ScrollArea className="h-[calc(100vh-10rem)]">
                <div className="space-y-1 p-4">
                  {messages.map((msg) => (
                    <ChatBubble key={msg.id} msg={msg} participants={meeting.participants} />
                  ))}
                </div>
              </ScrollArea>
            </SheetBody>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  // ─── IN_PROGRESS — Chat or Audio ────────────────────────────────
  return (
    <div className="container">
      <Toolbar>
        <ToolbarHeading title={meeting.title} />
        <ToolbarActions>
          {/* Mode toggle */}
          <div className="flex items-center rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setMeetingMode('TEXT')}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium leading-none transition-colors cursor-pointer',
                meetingMode === 'TEXT'
                  ? 'bg-brand-500 text-white'
                  : 'bg-background text-muted-foreground hover:bg-muted',
              )}
            >
              <KeenIcon icon="message-text" style="duotone" className="text-sm leading-none" />
              Texte
            </button>
            <button
              onClick={() => {
                if (meetingMode !== 'AUDIO') setShowAudioWarning(true);
              }}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium leading-none transition-colors cursor-pointer',
                meetingMode === 'AUDIO'
                  ? 'bg-brand-500 text-white'
                  : 'bg-background text-muted-foreground hover:bg-muted',
              )}
            >
              <KeenIcon icon="speaker" style="duotone" className="text-sm leading-none" />
              Audio
            </button>
          </div>

          {/* Audio warning dialog */}
          <AlertDialog open={showAudioWarning} onOpenChange={setShowAudioWarning}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <KeenIcon icon="speaker" style="duotone" className="size-5 text-warning" />
                  Mode audio
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <span className="block">
                    Le mode audio utilise la synthese vocale en temps reel pour chaque participant.
                    Cette fonctionnalite <span className="font-semibold text-foreground">consomme significativement plus de credits</span> que le mode texte.
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    Chaque participant actif genere un flux audio continu tant que la conference est en cours.
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Rester en texte</AlertDialogCancel>
                <AlertDialogAction onClick={() => setMeetingMode('AUDIO')}>
                  Activer l'audio
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Chronometer */}
          <Badge variant="primary" appearance="light" size="sm" className="inline-flex items-center gap-1.5 tabular-nums">
            <KeenIcon icon="time" style="duotone" className="text-xs leading-none" />
            {formatElapsed(elapsed)}
          </Badge>

          <Button variant="ghost" size="sm" asChild>
            <Link to={`/simulations/${meeting.simulationId}`} className="inline-flex items-center gap-1.5">
              <KeenIcon icon="arrow-left" style="duotone" className="text-xs leading-none" />
              Retour
            </Link>
          </Button>
        </ToolbarActions>
      </Toolbar>

      {meetingMode === 'AUDIO' ? (
        <MeetingConference
          meetingId={meetingId!}
          participants={meeting.participants}
          meetingTitle={meeting.title}
          startedAt={meeting.startedAt}
          onEnd={handleComplete}
          forceSingleMode
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-5">
          {/* Chat area */}
          <Card className="flex flex-col overflow-hidden">
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <ScrollArea className="flex-1 px-4 py-4" viewportRef={scrollRef}>
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="size-14 rounded-2xl bg-brand-50 dark:bg-brand-800/30 flex items-center justify-center mb-4">
                        <KeenIcon icon="message-text" style="duotone" className="size-7 text-brand-500 dark:text-brand-400" />
                      </div>
                      <p className="text-sm font-medium text-foreground">Demarrez la conversation</p>
                      <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                        Echangez avec les participants pour atteindre les objectifs de la reunion.
                      </p>
                    </div>
                  )}
                  {messages.map((msg) => (
                    <ChatBubble key={msg.id} msg={msg} participants={meeting.participants} />
                  ))}
                </div>
              </ScrollArea>

              {/* Input area */}
              <div className="border-t border-border p-3 bg-muted/30 dark:bg-white/3">
                {/* Participant selector inline */}
                {meeting.participants.length > 1 && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium shrink-0">
                      Parler a
                    </span>
                    <div className="flex gap-1 flex-wrap">
                      {meeting.participants.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedParticipant(p)}
                          className={cn(
                            'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer',
                            selectedParticipant?.id === p.id
                              ? 'bg-brand-500 text-white'
                              : 'bg-muted hover:bg-muted/80 text-foreground border border-border',
                          )}
                        >
                          <div className={cn(
                            'size-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0',
                            selectedParticipant?.id === p.id ? 'bg-white/30' : participantColor(p.name),
                          )}>
                            {p.name.charAt(0)}
                          </div>
                          {p.name.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 rounded-xl bg-card dark:bg-white/5 border border-border px-3 py-1.5">
                  <Input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder={`Message pour ${selectedParticipant?.name ?? 'le participant'}...`}
                    aria-label="Message pour le participant"
                    disabled={streaming}
                    className="flex-1 border-0 shadow-none focus-visible:ring-0 focus-visible:outline-none bg-transparent px-0 h-9"
                  />
                  <Button
                    variant="primary"
                    size="icon"
                    onClick={sendMessage}
                    disabled={!input.trim() || streaming}
                    title="Envoyer"
                    className="shrink-0 size-8 rounded-lg"
                  >
                    <KeenIcon icon="arrow-up" style="duotone" className="size-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Participants sidebar */}
          <div className="space-y-3">
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Donner la parole
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-1 space-y-2">
                <p className="text-[10px] text-muted-foreground mb-1">
                  Cliquez sur un participant pour lui adresser la parole.
                </p>
                {meeting.participants.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedParticipant(p);
                      setInput((prev) => {
                        // Si l'input est vide ou ne contient qu'une ancienne mention, on remplace
                        const cleaned = prev.replace(/^@\S+\s*/, '').trim();
                        return `@${p.name.split(' ')[0]} ${cleaned}`;
                      });
                      inputRef.current?.focus();
                    }}
                    className={cn(
                      'flex items-center gap-2.5 w-full p-2 rounded-lg transition-colors cursor-pointer text-left',
                      selectedParticipant?.id === p.id
                        ? 'bg-brand-500/10 border border-brand-500/20'
                        : 'hover:bg-muted/50 border border-transparent',
                    )}
                  >
                    <ParticipantAvatar participant={p} />
                    <div className="min-w-0 flex-1">
                      <p className={cn('text-sm font-medium truncate', selectedParticipant?.id === p.id && 'text-brand-500')}>
                        {p.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">{p.role}</p>
                    </div>
                    {selectedParticipant?.id === p.id && (
                      <div className="flex items-center gap-1">
                        <div className="size-1.5 rounded-full bg-success animate-pulse" />
                        <span className="text-[9px] text-success font-medium">Actif</span>
                      </div>
                    )}
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* End meeting */}
            <DisabledWithTooltip disabled={messages.length === 0} reason="Echangez d'abord avec les participants">
              <Button
                variant="outline"
                size="sm"
                onClick={handleComplete}
                disabled={actionLoading || messages.length === 0}
                className="w-full"
              >
                <KeenIcon icon="check-circle" style="duotone" className="text-xs" />
                {actionLoading ? 'Cloture...' : 'Cloturer la reunion'}
              </Button>
            </DisabledWithTooltip>
          </div>
        </div>
      )}
    </div>
  );
}
