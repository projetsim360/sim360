import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { streamAiResponse } from '@/lib/sse-client';
import { meetingApi } from '../api/meeting.api';
import type { ChatMessage, MeetingDetail, MeetingParticipant } from '../types/meeting.types';

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Planifiee',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminee',
  CANCELLED: 'Annulee',
};

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
  const bottomRef = useRef<HTMLDivElement>(null);

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
            <p className="text-red-600 text-sm">{error || 'Reunion introuvable.'}</p>
            <Link to="/simulations" className="mt-3 inline-block text-sm text-primary hover:underline">
              Retour aux simulations
            </Link>
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
            <Link
              to={`/simulations/${meeting.simulationId}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              Retour
            </Link>
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
                <h4 className="text-xs font-semibold mb-2">Objectifs</h4>
                <ul className="space-y-1">
                  {meeting.objectives.map((obj, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-0.5">-</span>
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h4 className="text-xs font-semibold mb-2">Participants</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {meeting.participants.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 p-2 rounded-lg border border-border"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-medium">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground">{p.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <button
                onClick={handleStart}
                disabled={actionLoading}
                className="px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Demarrage...' : 'Demarrer la reunion'}
              </button>
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
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
              {STATUS_LABELS[meeting.status]}
            </span>
            <Link
              to={`/simulations/${meeting.simulationId}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              Retour
            </Link>
          </ToolbarActions>
        </Toolbar>

        {meeting.summary && (
          <Card className="mb-5 border-blue-200 bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-blue-700">Resume de la reunion</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{meeting.summary.summary}</p>
              {meeting.summary.keyDecisions.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-xs font-semibold text-blue-700 mb-1">Decisions cles</h4>
                  <ul className="space-y-1">
                    {meeting.summary.keyDecisions.map((d, i) => (
                      <li key={i} className="text-xs text-blue-600">- {d}</li>
                    ))}
                  </ul>
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
                      {msg.content}
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

  // IN_PROGRESS — Chat interface
  return (
    <div className="container">
      <Toolbar>
        <ToolbarHeading title={meeting.title} />
        <ToolbarActions>
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
            En cours
          </span>
          <Link
            to={`/simulations/${meeting.simulationId}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            Retour
          </Link>
        </ToolbarActions>
      </Toolbar>

      {/* Participant selector */}
      {meeting.participants.length > 1 && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-muted-foreground">Parler a :</span>
          {meeting.participants.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedParticipant(p)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedParticipant?.id === p.id
                  ? 'bg-primary text-white'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                {p.name.charAt(0)}
              </span>
              {p.name}
            </button>
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
                    {msg.content || (
                      <span className="inline-block animate-pulse">...</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <input
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
              className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || streaming}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              Envoyer
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Complete button */}
      <div className="flex justify-center mb-4">
        <button
          onClick={handleComplete}
          disabled={actionLoading || messages.length === 0}
          className="px-6 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
        >
          {actionLoading ? 'Cloture en cours...' : 'Cloturer la reunion'}
        </button>
      </div>
    </div>
  );
}
