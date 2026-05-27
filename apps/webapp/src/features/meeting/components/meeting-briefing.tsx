import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components/keenicons';
import { ParticipantAvatar } from './participant-avatar';
import type { MeetingDetail } from '../types/meeting.types';

interface MeetingBriefingProps {
  meeting: MeetingDetail;
  onStart: () => void;
  actionLoading: boolean;
}

export function MeetingBriefing({ meeting, onStart, actionLoading }: MeetingBriefingProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base flex items-center gap-2 text-[var(--brand-700)]">
              <KeenIcon icon="notepad" style="duotone" className="size-4 text-[var(--accent-500)]" />
              Briefing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {meeting.description && (
              <p className="text-sm text-[var(--neutral-600)] leading-relaxed">{meeting.description}</p>
            )}
            {meeting.objectives.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--neutral-500)] mb-2">Objectifs</h4>
                <div className="space-y-2">
                  {meeting.objectives.map((obj, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="size-5 rounded-full bg-[var(--accent-100)] flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-[var(--accent-700)]">{i + 1}</span>
                      </div>
                      <span className="text-sm text-foreground">{obj}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--neutral-100)] px-2.5 py-1 text-xs font-medium text-[var(--neutral-600)]">
                <KeenIcon icon="time" style="duotone" className="text-xs" />
                {meeting.durationMinutes} min
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--neutral-100)] px-2.5 py-1 text-xs font-medium text-[var(--neutral-600)]">
                <KeenIcon icon="people" style="duotone" className="text-xs" />
                {meeting.participants.length} participant{meeting.participants.length > 1 ? 's' : ''}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={onStart}
            disabled={actionLoading}
            className="px-8 bg-[var(--accent-500)] hover:bg-[var(--accent-600)] text-white"
          >
            <KeenIcon icon="rocket" style="duotone" className="text-sm" />
            {actionLoading ? 'Démarrage…' : 'Démarrer la réunion'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base flex items-center gap-2 text-[var(--brand-700)]">
            <KeenIcon icon="people" style="duotone" className="size-4 text-[var(--accent-500)]" />
            Participants
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {meeting.participants.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-[var(--neutral-200)] hover:bg-[var(--neutral-50)] transition-colors">
              <ParticipantAvatar participant={p} size="md" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{p.name}</p>
                <p className="text-xs text-[var(--neutral-500)] truncate">{p.role}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
