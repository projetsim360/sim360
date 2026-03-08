import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { KeenIcon } from '@/components/keenicons';
import { MarkdownContent } from '@/components/ui/markdown-content';
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
  const bottomRef = useRef<HTMLDivElement>(null);
  const elapsed = useChronometer(meeting?.startedAt ?? null, meeting?.status === 'IN_PROGRESS');

  // Load meeting data
  const loadMeeting = useCallback(async () => {
    if (!meetingId) return;
    try {
      const data = await meetingApi.getMeeting(meetingId);
      setMeeting(data);

      // Convert existing messages to ChatMessage format
      const chatMessages: ChatMessage[] = data.messages.map((m) => ({
        id: m.id,
        role: m.role === 'USER' ? 'user' as const : 'assistant' as const,
        content: m.content,
        timestamp: new Date(m.createdAt),
        participantName: m.participant?.name,
      }));
      setMessages(chatMessages);

      // Set default participant
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
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
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
  }, [input, meetingId, streaming, selectedParticipant]);

  if (loading) {
    return (
      <div className="container">
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
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

  // SCHEDULED — Show briefing
  if (meeting.status === 'SCHEDULED') {
    return (
      <div className="container">
        <Toolbar>
          <ToolbarHeading title={meeting.title} />
          <ToolbarActions>
            <Button variant="outline" asChild>
              <Link to={`/simulations/${meeting.simulationId}`}>Retour</Link>
            </Button>
          </ToolbarActions>
        </Toolbar>

        <Card className="mb-5">
          <CardHeader>
            <CardTitle className="text-sm">Briefing de la reunion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {meeting.description && (
              <p className="text-sm text-muted-foreground">{meeting.description}</p>
            )}

            {meeting.objectives.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Objectifs</h4>
                <ul className="space-y-1">
                  {meeting.objectives.map((obj, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-0.5">-</span>
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h4 className="text-sm font-semibold mb-2">Participants</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {meeting.participants.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 p-2 rounded-lg border border-border"
                  >
                    {p.avatar ? (
                      <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                        {p.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground">{p.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <Button
                onClick={handleStart}
                disabled={actionLoading}
              >
                {actionLoading ? 'Demarrage...' : 'Demarrer la reunion'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // COMPLETED — Show summary
  if (meeting.status === 'COMPLETED') {
    return (
      <div className="container">
        <Toolbar>
          <ToolbarHeading title={meeting.title} />
          <ToolbarActions>
            <Badge variant="success" appearance="light">
              {STATUS_LABELS[meeting.status]}
            </Badge>
            <Button variant="outline" asChild>
              <Link to={`/simulations/${meeting.simulationId}`}>Retour</Link>
            </Button>
          </ToolbarActions>
        </Toolbar>

        {meeting.summary && (
          <Card className="mb-5 border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-primary">Resume de la reunion</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{meeting.summary.summary}</p>
              {meeting.summary.keyDecisions.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-semibold text-primary mb-1">Decisions cles</h4>
                  <ul className="space-y-1">
                    {meeting.summary.keyDecisions.map((d, i) => (
                      <li key={i} className="text-sm text-primary">- {d}</li>
                    ))}
                  </ul>
                </div>
              )}

              {meeting.summary.actionItems && meeting.summary.actionItems.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-semibold text-primary mb-1">Actions a mener</h4>
                  <div className="space-y-1.5">
                    {meeting.summary.actionItems.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-primary">
                        <span className="shrink-0 mt-0.5">-</span>
                        <div>
                          <span className="font-medium">{item.task}</span>
                          <span className="text-primary"> ({item.assignee})</span>
                          {item.deadline && <span className="text-primary/60"> - {item.deadline}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {meeting.summary.kpiImpact && Object.keys(meeting.summary.kpiImpact).length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-semibold text-primary mb-1">Impact KPIs</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(meeting.summary.kpiImpact).map(([key, val]) => (
                      <Badge
                        key={key}
                        variant={val > 0 ? 'success' : val < 0 ? 'destructive' : 'secondary'}
                        appearance="light"
                        size="sm"
                      >
                        {key}: {val > 0 ? '+' : ''}{val}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Show conversation history */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Historique de la conversation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="max-w-[75%]">
                    {msg.role === 'assistant' && msg.participantName && (
                      <p className="text-[10px] text-muted-foreground mb-0.5 ml-1">
                        {msg.participantName}
                      </p>
                    )}
                    <div
                      className={`rounded-lg px-3 py-2 text-sm ${
                        msg.role === 'user'
                          ? 'bg-primary text-white'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      {msg.role === 'user' ? msg.content : <MarkdownContent content={msg.content} />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // IN_PROGRESS — Chat or Audio interface
  return (
    <div className="container">
      <Toolbar>
        <ToolbarHeading title={meeting.title} />
        <ToolbarActions>
          {/* Mode toggle */}
          <div className="flex items-center rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setMeetingMode('TEXT')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                meetingMode === 'TEXT' ? 'bg-primary text-white' : 'bg-background text-muted-foreground hover:bg-muted'
              }`}
            >
              <KeenIcon icon="message-text" style="filled" className="size-3.5 inline mr-1" />
              Texte
            </button>
            <button
              onClick={() => setMeetingMode('AUDIO')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                meetingMode === 'AUDIO' ? 'bg-primary text-white' : 'bg-background text-muted-foreground hover:bg-muted'
              }`}
            >
              <KeenIcon icon="microphone" style="filled" className="size-3.5 inline mr-1" />
              Audio
            </button>
          </div>
          <Badge variant="primary" appearance="light">
            {formatElapsed(elapsed)}
          </Badge>
          <Button variant="outline" asChild>
            <Link to={`/simulations/${meeting.simulationId}`}>Retour</Link>
          </Button>
        </ToolbarActions>
      </Toolbar>

      {meetingMode === 'AUDIO' ? (
        <>
          {/* Audio conference mode */}
          <MeetingConference
            meetingId={meetingId!}
            participants={meeting.participants}
            meetingTitle={meeting.title}
            startedAt={meeting.startedAt}
            onEnd={handleComplete}
          />
        </>
      ) : (
        <>
          {/* Participant selector */}
          {meeting.participants.length > 1 && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-muted-foreground">Parler a :</span>
              {meeting.participants.map((p) => (
                <Button
                  key={p.id}
                  onClick={() => setSelectedParticipant(p)}
                  variant={selectedParticipant?.id === p.id ? 'primary' : 'ghost'}
                  size="sm"
                >
                  {p.avatar ? (
                    <img src={p.avatar} alt={p.name} className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                      {p.name.charAt(0)}
                    </span>
                  )}
                  {p.name}
                </Button>
              ))}
            </div>
          )}

          {/* Chat area */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="h-[400px] overflow-y-auto space-y-3 mb-4">
                {messages.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm py-8">
                    Commencez la conversation avec les participants.
                  </p>
                )}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="max-w-[75%]">
                      {msg.role === 'assistant' && msg.participantName && (
                        <p className="text-[10px] text-muted-foreground mb-0.5 ml-1">
                          {msg.participantName}
                        </p>
                      )}
                      <div
                        className={`rounded-lg px-3 py-2 text-sm ${
                          msg.role === 'user'
                            ? 'bg-primary text-white'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        {!msg.content ? (
                          <span className="inline-block animate-pulse">...</span>
                        ) : msg.role === 'user' ? (
                          msg.content
                        ) : (
                          <MarkdownContent content={msg.content} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <Input
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
                  disabled={streaming}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim() || streaming}
                >
                  Envoyer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Complete button */}
          <div className="flex justify-center mb-4">
            <Button
              variant="outline"
              onClick={handleComplete}
              disabled={actionLoading || messages.length === 0}
            >
              {actionLoading ? 'Cloture en cours...' : 'Cloturer la reunion'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
