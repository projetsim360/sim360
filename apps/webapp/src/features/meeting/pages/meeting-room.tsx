import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components/keenicons';
import { Skeleton } from '@/components/ui/skeleton';
import { meetingApi } from '../api/meeting.api';
import { MeetingBriefing } from '../components/meeting-briefing';
import { MeetingRoomShell } from '../components/meeting-room-shell';
import { MeetingCompleted } from '../components/meeting-completed';
import type { MeetingDetail } from '../types/meeting.types';
import { useT } from '@/i18n/app/use-t';

export default function MeetingRoomPage() {
  const t = useT();
  const { meetingId } = useParams<{ meetingId: string }>();
  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadMeeting = useCallback(async () => {
    if (!meetingId) return;
    try {
      const data = await meetingApi.getMeeting(meetingId);
      setMeeting(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [meetingId]);

  useEffect(() => { loadMeeting(); }, [loadMeeting]);

  const handleStart = useCallback(async () => {
    if (!meetingId) return;
    setActionLoading(true);
    try { await meetingApi.startMeeting(meetingId); await loadMeeting(); }
    catch (err: any) { setError(err.message); }
    finally { setActionLoading(false); }
  }, [meetingId, loadMeeting]);

  const handleComplete = useCallback(async () => {
    if (!meetingId) return;
    setActionLoading(true);
    try { await meetingApi.completeMeeting(meetingId); await loadMeeting(); }
    catch (err: any) { setError(err.message); }
    finally { setActionLoading(false); }
  }, [meetingId, loadMeeting]);

  if (loading) {
    return (
      <div>
        <div className="px-6 pt-6"><Skeleton className="h-10 w-64 mb-5" /></div>
        <div className="px-6">
          <Skeleton className="h-48 rounded-lg mb-5" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div>
        <PageHeader
          breadcrumbs={[
            { label: t('menu.dashboard'), to: '/dashboard' },
            { label: t('menu.simulations'), to: '/simulations' },
            { label: t('dashboard.activity.meeting') },
          ]}
          title={t('dashboard.activity.meeting')}
        />
        <div className="px-6 pb-6">
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-[var(--error-700)] text-sm">{error || t('meetings.notFound')}</p>
              <Button mode="link" asChild><Link to="/simulations">{t('meetings.backToSims')}</Link></Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { label: t('menu.dashboard'), to: '/dashboard' },
    { label: t('menu.simulations'), to: '/simulations' },
    { label: t('dashboard.priority.meetings'), to: `/simulations/${meeting.simulationId}/meetings` },
    { label: meeting.title },
  ];

  const backAction = (
    <Button variant="outline" size="sm" asChild>
      <Link to={`/simulations/${meeting.simulationId}/meetings`}>
        <KeenIcon icon="arrow-left" style="duotone" className="text-xs" />
        {t('dashboard.priority.meetings')}
      </Link>
    </Button>
  );

  if (meeting.status === 'SCHEDULED') {
    return (
      <div>
        <PageHeader breadcrumbs={breadcrumbs} title={meeting.title} subtitle={t('meetings.briefing')} actions={backAction} />
        <div className="px-6 pb-6">
          <MeetingBriefing meeting={meeting} onStart={handleStart} actionLoading={actionLoading} />
        </div>
      </div>
    );
  }

  if (meeting.status === 'IN_PROGRESS') {
    return (
      <div>
        <PageHeader breadcrumbs={breadcrumbs} title={meeting.title} actions={backAction} />
        <MeetingRoomShell meeting={meeting} onComplete={handleComplete} actionLoading={actionLoading} />
      </div>
    );
  }

  if (meeting.status === 'COMPLETED') {
    return (
      <div>
        <PageHeader breadcrumbs={breadcrumbs} title={t('meetings.minutes')} subtitle={meeting.title} actions={backAction} />
        <div className="px-6 pb-6">
          <MeetingCompleted meeting={meeting} />
        </div>
      </div>
    );
  }

  // CANCELLED
  return (
    <div>
      <PageHeader breadcrumbs={breadcrumbs} title={meeting.title} actions={backAction} />
      <div className="px-6 pb-6">
        <Card>
          <CardContent className="py-10 text-center space-y-3">
            <div className="size-12 mx-auto rounded-xl bg-[var(--error-50)] flex items-center justify-center">
              <KeenIcon icon="cross-circle" style="duotone" className="size-6 text-[var(--error-500)]" />
            </div>
            <p className="text-sm text-[var(--neutral-600)]">{t('meetings.cancelled')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
