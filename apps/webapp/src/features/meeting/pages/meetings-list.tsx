import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useParams } from 'react-router';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components/keenicons';
import { EmptyState } from '@/components/ui/empty-state';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { meetingApi } from '../api/meeting.api';
import type { Meeting } from '../types/meeting.types';
import { useTv } from '@/i18n/app/use-t';
import { useT } from '@/i18n/app/use-t';

const STATUS_KEYS = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

const STATUS_PILL: Record<string, string> = {
  SCHEDULED: 'bg-[var(--neutral-100)] text-[var(--neutral-600)]',
  IN_PROGRESS: 'bg-[var(--accent-100)] text-[var(--accent-700)]',
  COMPLETED: 'bg-[var(--success-50)] text-[var(--success-700)]',
  CANCELLED: 'bg-[var(--error-50)] text-[var(--error-700)]',
};

const TYPE_KEYS = ['KICKOFF', 'STANDUP', 'STEERING', 'RETROSPECTIVE', 'CRISIS', 'CUSTOM'];

export default function MeetingsListPage() {
  const tv = useTv();
  const t = useT();
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
      <div>
        <PageHeader
          breadcrumbs={[{ label: t('menu.dashboard'), to: '/dashboard' }, { label: t('dashboard.priority.meetings') }]}
          title={t('dashboard.priority.meetings')}
          subtitle={t('meetings.pickSimulation')}
        />
        <div className="px-6 pb-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
              <p className="text-[var(--neutral-500)] text-sm">{t('meetings.noSimulation')}</p>
              <Button mode="link" asChild><Link to="/simulations">{t('meetings.seeSimulations')}</Link></Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: t('menu.dashboard'), to: '/dashboard' },
          { label: t('menu.simulations'), to: '/simulations' },
          { label: t('dashboard.activity.simulation'), to: `/simulations/${simId}` },
          { label: t('dashboard.priority.meetings') },
        ]}
        title={t('dashboard.priority.meetings')}
        actions={
          <Button variant="primary" size="sm" asChild>
            <Link to={`/simulations/${simId}/meetings/new`}>
              <KeenIcon icon="calendar-add" style="duotone" />
              {t('meetingPlan.title')}
            </Link>
          </Button>
        }
        subtitle={filteredMeetings.length !== meetings.length ? t('meetings.countFiltered', { count: meetings.length, shown: filteredMeetings.length }) : t('meetings.count', { count: meetings.length })}
      />

      <div className="px-6 pb-6 space-y-5">
        {/* Filtres */}
        {meetings.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={filterType || 'ALL'} onValueChange={(v) => setFilterType(v === 'ALL' ? '' : v)}>
              <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder={t('meetings.allTypes')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t('meetings.allTypes')}</SelectItem>
                {TYPE_KEYS.map((key) => (
                  <SelectItem key={key} value={key}>{tv('meetingType', key)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus || 'ALL'} onValueChange={(v) => setFilterStatus(v === 'ALL' ? '' : v)}>
              <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder={t('meetings.allStatuses')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t('meetings.allStatuses')}</SelectItem>
                {STATUS_KEYS.map((key) => (
                  <SelectItem key={key} value={key}>{tv('meetingStatus', key)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availablePhases.length > 1 && (
              <Select value={filterPhase || 'ALL'} onValueChange={(v) => setFilterPhase(v === 'ALL' ? '' : v)}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder={t('meetings.allPhases')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t('meetings.allPhases')}</SelectItem>
                  {availablePhases.map((phase) => (
                    <SelectItem key={phase} value={String(phase)}>{t('dashboard.active.phase', { n: phase })}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {(filterType || filterStatus || filterPhase) && (
              <Button variant="ghost" size="sm" onClick={() => { setFilterType(''); setFilterStatus(''); setFilterPhase(''); }}>
                {t('meetings.reset')}
              </Button>
            )}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <Skeleton className="h-5 w-40" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-2/3 mb-3" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card><CardContent className="py-8 text-center"><p className="text-[var(--error-700)] text-sm">{error}</p></CardContent></Card>
        ) : meetings.length === 0 ? (
          <Card>
            <CardContent>
              <EmptyState
                icon="message-text"
                title={t('meetings.emptyTitle')}
                description={t('meetings.emptyText')}
              />
            </CardContent>
          </Card>
        ) : (
          <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4" variants={staggerContainer} initial="hidden" animate="show">
            {filteredMeetings.map((meeting) => (
              <motion.div key={meeting.id} variants={staggerItem}>
                <Link to={`/meetings/${meeting.id}`} className="block h-full">
                  <Card className="hover:shadow-md transition-shadow h-full cursor-pointer">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="font-display text-base font-bold text-[var(--brand-700)]">{meeting.title}</h3>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="inline-flex items-center rounded-full bg-[var(--brand-50)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--brand-700)]">
                            {tv('meetingType', meeting.type)}
                          </span>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_PILL[meeting.status]}`}>
                            {tv('meetingStatus', meeting.status)}
                          </span>
                        </div>
                      </div>

                      {meeting.description && (
                        <p className="text-sm text-[var(--neutral-500)] line-clamp-2 mb-3">{meeting.description}</p>
                      )}

                      <div className="flex items-center justify-between text-sm text-[var(--neutral-500)]">
                        <div className="flex items-center gap-3">
                          <span>{t('meetings.participants', { count: meeting.participants.length })}</span>
                          {meeting._count?.messages !== undefined && (
                            <span>{meeting._count.messages} message{meeting._count.messages > 1 ? 's' : ''}</span>
                          )}
                          <span>{t('meetings.minutesShort', { n: meeting.durationMinutes })}</span>
                        </div>
                        {meeting.status !== 'CANCELLED' && (
                          <span className="text-[var(--accent-600)] font-semibold inline-flex items-center gap-1">
                            {meeting.status === 'SCHEDULED'
                              ? t('meetings.start')
                              : meeting.status === 'IN_PROGRESS'
                                ? t('dashboard.active.resume')
                                : t('meetings.seeMinutes')}
                            <KeenIcon icon="arrow-right" style="duotone" className="size-3" />
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
