import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { KeenIcon } from '@/components/keenicons';
import { DisabledWithTooltip } from '@/components/ui/disabled-with-tooltip';
import { MarkdownContent } from '@/components/ui/markdown-content';
import { streamAiResponse } from '@/lib/sse-client';
import { meetingApi } from '../api/meeting.api';
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

export default function MeetingLivePage() {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<MeetingParticipant | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const elapsed = useChronometer(meeting?.startedAt ?? null, meeting?.status === 'IN_PROGRESS');

  const loadMeeting = useCallback(async () => {
    if (!meetingId) return;
    try {
      const data = await meetingApi.getMeeting(meetingId);
      setMeeting(data);

      // If meeting is not in progress, redirect
      if (data.status === 'SCHEDULED') {
        navigate(`/meetings/${meetingId}`, { replace: true });
        return;
      }
      if (data.status === 'COMPLETED') {
        navigate(`/meetings/${meetingId}/summary`, { replace: true });
        return;
      }

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
  }, [meetingId, selectedParticipant, navigate]);

  useEffect(() => {
    loadMeeting();
  }, [loadMeeting]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleComplete() {
    if (!meetingId) return;
    setActionLoading(true);
    try {
      await meetingApi.completeMeeting(meetingId);
      navigate(`/meetings/${meetingId}/summary`);
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
          <ToolbarHeading title="Reunion en direct" />
        </Toolbar>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive text-sm">{error || 'Reunion introuvable.'}</p>
            <Button variant="link" asChild>
              <Link to="/meetings">Retour aux reunions</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container">
      <Toolbar>
        <ToolbarHeading title={meeting.title} description="Reunion en direct" />
        <ToolbarActions>
          <Badge variant="primary" appearance="light">
            {formatElapsed(elapsed)}
          </Badge>
          <Badge variant="success" appearance="light">
            {messages.length} messages
          </Badge>
          <Button variant="outline" asChild>
            <Link to={`/simulations/${meeting.simulationId}`}>Retour</Link>
          </Button>
        </ToolbarActions>
      </Toolbar>

      {/* Objectives reminder */}
      {meeting.objectives.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {meeting.objectives.map((obj, i) => (
            <Badge key={i} variant="primary" appearance="light" size="sm">
              {obj}
            </Badge>
          ))}
        </div>
      )}

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
        <DisabledWithTooltip disabled={messages.length === 0} reason="Echangez d'abord avec les participants">
          <Button
            variant="outline"
            onClick={handleComplete}
            disabled={actionLoading || messages.length === 0}
          >
            {actionLoading ? 'Cloture en cours...' : 'Cloturer la reunion'}
          </Button>
        </DisabledWithTooltip>
      </div>
    </div>
  );
}
