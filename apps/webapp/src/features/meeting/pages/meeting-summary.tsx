import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KeenIcon } from '@/components/keenicons';
import { meetingApi } from '../api/meeting.api';
import type { ChatMessage, MeetingDetail } from '../types/meeting.types';

export default function MeetingSummaryPage() {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const loadMeeting = useCallback(async () => {
    if (!meetingId) return;
    try {
      const data = await meetingApi.getMeeting(meetingId);
      setMeeting(data);

      // Redirect if not completed
      if (data.status !== 'COMPLETED') {
        if (data.status === 'IN_PROGRESS') {
          navigate(`/meetings/${meetingId}/live`, { replace: true });
        } else {
          navigate(`/meetings/${meetingId}`, { replace: true });
        }
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [meetingId, navigate]);

  useEffect(() => {
    loadMeeting();
  }, [loadMeeting]);

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
          <ToolbarHeading title="Resume de reunion" />
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
        <ToolbarHeading title={meeting.title} description="Resume de reunion" />
        <ToolbarActions>
          <Badge variant="success" appearance="light">
            Terminee
          </Badge>
          <Button variant="outline" asChild>
            <Link to={`/simulations/${meeting.simulationId}`}>Retour a la simulation</Link>
          </Button>
        </ToolbarActions>
      </Toolbar>

      {/* Meeting info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <InfoCard label="Type" value={meeting.type} />
        <InfoCard label="Duree prevue" value={`${meeting.durationMinutes} min`} />
        <InfoCard label="Participants" value={String(meeting.participants.length)} />
        <InfoCard label="Messages" value={String(messages.length)} />
      </div>

      {/* Summary */}
      {meeting.summary && (
        <Card className="mb-5 border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-primary">Resume</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm whitespace-pre-wrap">{meeting.summary.summary}</p>

            {meeting.summary.keyDecisions.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-primary mb-1">Decisions cles</h4>
                <ul className="space-y-1">
                  {meeting.summary.keyDecisions.map((d, i) => (
                    <li key={i} className="text-xs text-primary">- {d}</li>
                  ))}
                </ul>
              </div>
            )}

            {meeting.summary.actionItems && meeting.summary.actionItems.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-primary mb-1">Actions a mener</h4>
                <div className="space-y-1.5">
                  {meeting.summary.actionItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-primary">
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
              <div>
                <h4 className="text-xs font-semibold text-primary mb-1">Impact KPIs</h4>
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

      {/* Participants */}
      <Card className="mb-5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Participants ({meeting.participants.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {meeting.participants.map((p) => (
              <div key={p.id} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border">
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                  {p.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-medium">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">{p.role}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conversation history (collapsible) */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Historique de la conversation</CardTitle>
            <Button
              variant="link"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? 'Masquer' : 'Afficher'}
            </Button>
          </div>
        </CardHeader>
        {showHistory && (
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
        )}
      </Card>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-3">
        <span className="text-lg font-bold">{value}</span>
        <span className="text-[10px] text-muted-foreground mt-0.5">{label}</span>
      </CardContent>
    </Card>
  );
}
