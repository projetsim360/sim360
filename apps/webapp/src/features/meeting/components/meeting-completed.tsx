import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';
import { ParticipantAvatar } from './participant-avatar';
import { ChatBubble } from './chat-bubble';
import { ActionItemsPanel } from '@/features/action-items/components/action-items-panel';

import type { ChatMessage, MeetingDetail } from '../types/meeting.types';
import { useTv } from '@/i18n/app/use-t';
import { useT } from '@/i18n/app/use-t';

interface MeetingCompletedProps {
  meeting: MeetingDetail;
}

export function MeetingCompleted({ meeting }: MeetingCompletedProps) {
  const tv = useTv();
  const t = useT();
  const [showTranscript, setShowTranscript] = useState(false);

  const messages: ChatMessage[] = meeting.messages.map((m) => ({
    id: m.id,
    role: m.role === 'USER' ? 'user' : 'assistant',
    content: m.content,
    timestamp: new Date(m.createdAt),
    participantName: m.participant?.name,
  }));

  const startedDate = meeting.startedAt
    ? new Date(meeting.startedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : null;
  const durationReal = meeting.startedAt && meeting.completedAt
    ? Math.round((new Date(meeting.completedAt).getTime() - new Date(meeting.startedAt).getTime()) / 60000)
    : null;
  const summary = meeting.summary;

  return (
    <div className="space-y-5">
      {/* Entête */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="size-12 rounded-xl bg-[var(--success-50)] flex items-center justify-center shrink-0">
              <KeenIcon icon="check-circle" style="duotone" className="size-6 text-[var(--success-500)]" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-lg font-extrabold text-[var(--brand-700)]">{meeting.title}</h2>
              {meeting.description && (
                <p className="text-sm text-[var(--neutral-500)] mt-1 line-clamp-2">{meeting.description}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--success-50)] px-2.5 py-1 text-xs font-semibold text-[var(--success-700)]">
                  <span className="size-1.5 rounded-full bg-[var(--success-500)]" />
                  {t('meetingStatus.COMPLETED')}
                </span>
                {durationReal !== null && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--neutral-100)] px-2.5 py-1 text-xs font-medium text-[var(--neutral-600)]">
                    <KeenIcon icon="time" style="duotone" className="text-xs" />
                    {durationReal} min (début {startedDate})
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--neutral-100)] px-2.5 py-1 text-xs font-medium text-[var(--neutral-600)]">
                  <KeenIcon icon="message-text" style="duotone" className="text-xs" />
                  {messages.length} échange{messages.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {summary ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            {/* Synthèse */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-base flex items-center gap-2 text-[var(--brand-700)]">
                  <KeenIcon icon="document" style="duotone" className="size-4 text-[var(--accent-500)]" />
                  {t('room.summary')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{summary.summary}</p>
              </CardContent>
            </Card>

            {/* Décisions clés */}
            {summary.keyDecisions.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="font-display text-base flex items-center gap-2 text-[var(--brand-700)]">
                    <KeenIcon icon="verify" style="duotone" className="size-4 text-[var(--success-500)]" />
                    {t('room.keyDecisions')}
                    <span className="inline-flex items-center justify-center rounded-full bg-[var(--success-50)] px-2 py-0.5 text-[11px] font-bold text-[var(--success-700)]">
                      {summary.keyDecisions.length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {summary.keyDecisions.map((d, i) => (
                    <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-[var(--success-50)] border border-[var(--success-200)]">
                      <div className="size-6 rounded-full bg-[var(--success-200)] flex items-center justify-center shrink-0 mt-0.5">
                        <KeenIcon icon="check" style="outline" className="size-3.5 text-[var(--success-700)]" />
                      </div>
                      <span className="text-sm text-foreground leading-relaxed">{d}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Actions de suivi — editable, persisted (owner, due date, status) */}
            <ActionItemsPanel
              simulationId={meeting.simulationId}
              meetingId={meeting.id}
              assigneeSuggestions={meeting.participants.map((p) => p.name)}
            />

            {/* Transcript repliable */}
            {messages.length > 0 && (
              <Card>
                <button
                  type="button"
                  onClick={() => setShowTranscript((v) => !v)}
                  className="flex items-center justify-between w-full px-5 py-4 cursor-pointer"
                >
                  <span className="font-display text-base font-bold text-[var(--brand-700)] flex items-center gap-2">
                    <KeenIcon icon="message-text" style="duotone" className="size-4 text-[var(--accent-500)]" />
                    {t('room.conversation')}
                    <span className="inline-flex items-center justify-center rounded-full bg-[var(--neutral-100)] px-2 py-0.5 text-[11px] font-bold text-[var(--neutral-600)]">
                      {messages.length}
                    </span>
                  </span>
                  <KeenIcon icon={showTranscript ? 'up' : 'down'} style="duotone" className="size-3.5 text-[var(--neutral-500)]" />
                </button>
                {showTranscript && (
                  <CardContent className="pt-0 space-y-3 border-t border-[var(--neutral-200)]">
                    <div className="pt-4 space-y-3">
                      {messages.map((msg) => (
                        <ChatBubble key={msg.id} msg={msg} participants={meeting.participants} />
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            )}
          </div>

          {/* Colonne droite */}
          <div className="space-y-5">
            {/* Impact KPI */}
            {summary.kpiImpact && Object.keys(summary.kpiImpact).length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="font-display text-base flex items-center gap-2 text-[var(--brand-700)]">
                    <KeenIcon icon="chart-line" style="duotone" className="size-4 text-[var(--accent-500)]" />
                    {t('room.kpiImpact')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(summary.kpiImpact).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between rounded-lg bg-[var(--neutral-50)] px-3 py-2">
                      <span className="text-sm text-[var(--neutral-600)]">{tv('kpiKey', key)}</span>
                      <span className={cn(
                        'text-sm font-bold tabular-nums',
                        val > 0 ? 'text-[var(--success-700)]' : val < 0 ? 'text-[var(--error-700)]' : 'text-[var(--neutral-500)]',
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
                <CardTitle className="font-display text-base flex items-center gap-2 text-[var(--brand-700)]">
                  <KeenIcon icon="people" style="duotone" className="size-4 text-[var(--accent-500)]" />
                  {t('room.participants')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-[var(--brand-50)] border border-[var(--brand-100)]">
                  <div className="size-8 rounded-full bg-[var(--brand-700)] flex items-center justify-center shrink-0">
                    <KeenIcon icon="user" style="duotone" className="size-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{t('room.you')}</p>
                    <p className="text-[10px] text-[var(--neutral-500)]">{t('room.facilitator')}</p>
                  </div>
                </div>
                {meeting.participants.map((p) => (
                  <div key={p.id} className="flex items-center gap-2.5 p-2 rounded-lg">
                    <ParticipantAvatar participant={p} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-[10px] text-[var(--neutral-500)] truncate">{p.role}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-[var(--neutral-500)]">{t('room.noSummary')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
