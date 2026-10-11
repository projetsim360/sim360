import { useState } from 'react';
import { Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { KeenIcon } from '@/components/keenicons';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  usePendingReviews,
  useMentoringSessions,
  useCreateSession,
} from '../api/mentoring.api';
import { useTv } from '@/i18n/app/use-t';
import { useT } from '@/i18n/app/use-t';

const SESSION_TYPES = [
  { value: 'DEBRIEFING' },
  { value: 'CAREER_COACHING' },
  { value: 'INTERVIEW_PREP' },
] as const;

const sessionSchema = z.object({
  simulationId: z.string().min(1, 'mentoring.form.simulationRequired'),
  learnerId: z.string().min(1, 'mentoring.form.learnerRequired'),
  type: z.string().optional(),
});

type SessionFormValues = z.infer<typeof sessionSchema>;

export default function MentorDashboardPage() {
  const tv = useTv();
  const t = useT();
  const {
    data: pendingReviews,
    isLoading: loadingReviews,
  } = usePendingReviews();

  const {
    data: sessions,
    isLoading: loadingSessions,
  } = useMentoringSessions();

  const createSession = useCreateSession();
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<SessionFormValues>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      simulationId: '',
      learnerId: '',
      type: 'DEBRIEFING',
    },
  });

  const onSubmitSession = (values: SessionFormValues) => {
    createSession.mutate(
      {
        simulationId: values.simulationId,
        learnerId: values.learnerId,
        type: values.type || undefined,
      },
      {
        onSuccess: () => {
          toast.success(t('mentoring.created'));
          setDialogOpen(false);
          form.reset();
        },
        onError: () => {
          toast.error(t('mentoring.createError'));
        },
      },
    );
  };

  const loading = loadingReviews || loadingSessions;
  const reviews = pendingReviews ?? [];
  const allSessions = sessions ?? [];
  const activeSessions = allSessions.filter((s) => s.status !== 'COMPLETED');
  const completedSessions = allSessions.filter((s) => s.status === 'COMPLETED');

  return (
    <>
      <Toolbar>
        <ToolbarHeading>
          <h1 className="text-xl font-medium text-gray-900">{t('mentoring.spaceTitle')}</h1>
          <p className="text-sm text-gray-700">
            {t('mentoring.spaceDesc')}
          </p>
        </ToolbarHeading>
        <ToolbarActions>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDialogOpen(true)}
          >
            <KeenIcon icon="plus" style="duotone" className="text-sm" />
            {t('mentoring.newSession')}
          </Button>
          <Button variant="primary" size="sm" asChild>
            <Link to="/mentoring/sessions">
              <KeenIcon icon="messages" style="duotone" className="text-sm" />
              {t('mentoring.allSessions')}
            </Link>
          </Button>
        </ToolbarActions>
      </Toolbar>

      <div className="container-fixed space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-warning/10">
                <KeenIcon
                  icon="clipboard-check"
                  style="duotone"
                  className="text-xl text-warning"
                />
              </div>
              <div>
                {loading ? (
                  <Skeleton className="h-7 w-10 mb-1" />
                ) : (
                  <div className="text-2xl font-bold">{reviews.length}</div>
                )}
                <div className="text-xs text-muted-foreground">
                  {t('mentoring.pendingReviews')}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                <KeenIcon
                  icon="messages"
                  style="duotone"
                  className="text-xl text-primary"
                />
              </div>
              <div>
                {loading ? (
                  <Skeleton className="h-7 w-10 mb-1" />
                ) : (
                  <div className="text-2xl font-bold">
                    {activeSessions.length}
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  {t('mentoring.activeSessions')}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-success/10">
                <KeenIcon
                  icon="check-circle"
                  style="duotone"
                  className="text-xl text-success"
                />
              </div>
              <div>
                {loading ? (
                  <Skeleton className="h-7 w-10 mb-1" />
                ) : (
                  <div className="text-2xl font-bold">
                    {completedSessions.length}
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  {t('mentoring.completedSessions')}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending reviews */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <KeenIcon icon="clipboard-check" style="duotone" />
              {t('mentoring.pendingReviewsTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-sm text-muted-foreground py-4 text-center">
                {t('mentoring.noPending')}
              </div>
            ) : (
              <div className="space-y-2">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="text-sm font-medium">
                        {review.deliverable?.title ?? t('mentoring.deliverable')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Score automatique : {review.score}/100 — Grade : {review.grade}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/mentoring/review/${review.id}`}>
                        {t('mentoring.review')}
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <KeenIcon icon="messages" style="duotone" />
              {t('mentoring.sessionsTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : allSessions.length === 0 ? (
              <div className="text-sm text-muted-foreground py-4 text-center">
                {t('mentoring.noSessions')}
              </div>
            ) : (
              <div className="space-y-2">
                {allSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="text-sm font-medium">
                        {tv('mentoring.type', session.type)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {session.status === 'COMPLETED'
                          ? t('mentoring.status.COMPLETED')
                          : session.status === 'IN_PROGRESS'
                            ? t('mentoring.status.IN_PROGRESS')
                            : t('mentoring.status.SCHEDULED')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          session.status === 'COMPLETED'
                            ? 'success'
                            : session.status === 'IN_PROGRESS'
                              ? 'primary'
                              : 'secondary'
                        }
                        size="sm"
                      >
                        {session.status === 'COMPLETED'
                          ? t('mentoring.status.COMPLETED')
                          : session.status === 'IN_PROGRESS'
                            ? t('mentoring.status.IN_PROGRESS')
                            : t('mentoring.status.SCHEDULED')}
                      </Badge>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/mentoring/session/${session.id}`}>
                          {t('mentoring.view')}
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog nouvelle session */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('mentoring.newSessionTitle')}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Form {...form}>
              <form
                id="dashboard-create-session-form"
                onSubmit={form.handleSubmit(onSubmitSession)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="simulationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('mentoring.form.simulationId')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('mentoring.form.simulationPh')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="learnerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('mentoring.form.learnerId')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('mentoring.form.learnerPh')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('mentoring.form.type')}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('mentoring.form.typePh')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SESSION_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {tv('mentoring.type', t.value)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialogOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              form="dashboard-create-session-form"
              variant="primary"
              size="sm"
              disabled={createSession.isPending}
            >
              {createSession.isPending ? t('mentoring.creating') : t('mentoring.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
