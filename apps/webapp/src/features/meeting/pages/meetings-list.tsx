import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useParams } from 'react-router';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KeenIcon } from '@/components/keenicons';
import { EmptyState } from '@/components/ui/empty-state';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { meetingApi } from '../api/meeting.api';
import type { Meeting } from '../types/meeting.types';

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Planifiee',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminee',
  CANCELLED: 'Annulee',
};

const STATUS_VARIANT: Record<string, 'secondary' | 'primary' | 'success' | 'destructive'> = {
  SCHEDULED: 'secondary',
  IN_PROGRESS: 'primary',
  COMPLETED: 'success',
  CANCELLED: 'destructive',
};

const TYPE_LABELS: Record<string, string> = {
  KICKOFF: 'Lancement',
  STANDUP: 'Stand-up',
  STEERING: 'Pilotage',
  RETROSPECTIVE: 'Retrospective',
  CRISIS: 'Crise',
  CUSTOM: 'Personnalisee',
};

export default function MeetingsListPage() {
  const [searchParams] = useSearchParams();
  const params = useParams<{ simId?: string }>();
  const simId = params.simId || searchParams.get('simId');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterPhase, setFilterPhase] = useState<string>('');

  useEffect(() => {
    if (!simId) {
      setLoading(false);
      return;
    }
    meetingApi
      .listBySimulation(simId)
      .then(setMeetings)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [simId]);

  const availablePhases = useMemo(() => {
    const phases = [...new Set(meetings.map((m) => m.phaseOrder))].sort((a, b) => a - b);
    return phases;
  }, [meetings]);

  const filteredMeetings = meetings.filter((m) => {
    if (filterType && m.type !== filterType) return false;
    if (filterStatus && m.status !== filterStatus) return false;
    if (filterPhase && m.phaseOrder !== Number(filterPhase)) return false;
    return true;
  });

  if (!simId) {
    return (
      <div className="container">
        <Toolbar>
          <ToolbarHeading title="Reunions" />
        </Toolbar>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-muted-foreground text-sm">
              Selectionnez une simulation pour voir ses reunions.
            </p>
            <Button variant="link" asChild>
              <Link to="/simulations">Voir les simulations</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container">
      <Toolbar>
        <ToolbarHeading title="Reunions" />
        <ToolbarActions>
          <Button variant="outline" asChild>
            <Link to={`/simulations/${simId}`}>Retour a la simulation</Link>
          </Button>
        </ToolbarActions>
      </Toolbar>

      {/* Filters */}
      {meetings.length > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <Select value={filterType || 'ALL'} onValueChange={(v) => setFilterType(v === 'ALL' ? '' : v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tous les types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous les types</SelectItem>
              {Object.entries(TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus || 'ALL'} onValueChange={(v) => setFilterStatus(v === 'ALL' ? '' : v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous les statuts</SelectItem>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {availablePhases.length > 1 && (
            <Select value={filterPhase || 'ALL'} onValueChange={(v) => setFilterPhase(v === 'ALL' ? '' : v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Toutes les phases" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Toutes les phases</SelectItem>
                {availablePhases.map((phase) => (
                  <SelectItem key={phase} value={String(phase)}>Phase {phase}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {(filterType || filterStatus || filterPhase) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setFilterType(''); setFilterStatus(''); setFilterPhase(''); }}
            >
              Reinitialiser
            </Button>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      ) : meetings.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon="message-text"
              title="Aucune reunion"
              description="Les reunions sont planifiees pour chaque phase. Avancez dans la simulation pour les voir apparaitre."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMeetings.map((meeting) => (
            <Link
              key={meeting.id}
              to={`/meetings/${meeting.id}`}
              className="block"
            >
              <Card className="hover:shadow-md transition-shadow h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-semibold text-sm">{meeting.title}</h3>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="primary" appearance="light" size="sm">
                        {TYPE_LABELS[meeting.type] ?? meeting.type}
                      </Badge>
                      <Badge variant={STATUS_VARIANT[meeting.status]} appearance="light" size="sm">
                        {STATUS_LABELS[meeting.status]}
                      </Badge>
                    </div>
                  </div>

                  {meeting.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {meeting.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span>{meeting.participants.length} participant(s)</span>
                      {meeting._count?.messages !== undefined && (
                        <span>{meeting._count.messages} message(s)</span>
                      )}
                      <span>{meeting.durationMinutes} min</span>
                    </div>
                    <span className="text-primary font-medium inline-flex items-center gap-1">
                      {meeting.status === 'SCHEDULED'
                        ? 'Demarrer'
                        : meeting.status === 'IN_PROGRESS'
                          ? 'Reprendre'
                          : meeting.status === 'COMPLETED'
                            ? 'Voir resume'
                            : ''}
                      {meeting.status !== 'CANCELLED' && (
                        <KeenIcon icon="arrow-right" style="duotone" className="size-3" />
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
