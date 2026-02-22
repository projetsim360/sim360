import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent } from '@/components/ui/card';
import { meetingApi } from '../api/meeting.api';
import type { Meeting } from '../types/meeting.types';

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Planifiee',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminee',
  CANCELLED: 'Annulee',
};

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
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
  const simId = searchParams.get('simId');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            <Link to="/simulations" className="text-sm text-primary hover:underline">
              Voir les simulations
            </Link>
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
          <Link
            to={`/simulations/${simId}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            Retour a la simulation
          </Link>
        </ToolbarActions>
      </Toolbar>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-red-600 text-sm">{error}</p>
          </CardContent>
        </Card>
      ) : meetings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-muted-foreground text-sm">
              Aucune reunion pour cette simulation.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {meetings.map((meeting) => (
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
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700">
                        {TYPE_LABELS[meeting.type] ?? meeting.type}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium ${STATUS_COLORS[meeting.status]}`}
                      >
                        {STATUS_LABELS[meeting.status]}
                      </span>
                    </div>
                  </div>

                  {meeting.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      {meeting.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span>{meeting.participants.length} participant(s)</span>
                      {meeting._count?.messages !== undefined && (
                        <span>{meeting._count.messages} message(s)</span>
                      )}
                      <span>{meeting.durationMinutes} min</span>
                    </div>
                    <span className="text-primary font-medium">
                      {meeting.status === 'SCHEDULED'
                        ? 'Demarrer →'
                        : meeting.status === 'IN_PROGRESS'
                          ? 'Reprendre →'
                          : meeting.status === 'COMPLETED'
                            ? 'Voir resume →'
                            : ''}
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
