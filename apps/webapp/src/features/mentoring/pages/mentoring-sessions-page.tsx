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
import { Skeleton } from '@/components/ui/skeleton';
import { KeenIcon } from '@/components/keenicons';
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
import { useMentoringSessions, useCreateSession } from '../api/mentoring.api';
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

function StatusBadge({ status }: { status: string }) {
  const tv = useTv();
  const variant = status === 'COMPLETED' ? 'success' : status === 'IN_PROGRESS' ? 'primary' : 'secondary';
  return (
    <Badge variant={variant} size="sm">
      {tv('mentoring.status', status === 'COMPLETED' || status === 'IN_PROGRESS' ? status : 'SCHEDULED')}
    </Badge>
  );
}


export default function MentoringSessionsPage() {
  const tv = useTv();
  const t = useT();
  const { data: sessions, isLoading } = useMentoringSessions();
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

  const onSubmit = (values: SessionFormValues) => {
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

  const allSessions = sessions ?? [];

  return (
    <>
      <Toolbar>
        <ToolbarHeading>
          <h1 className="text-xl font-medium text-gray-900">
            {t('mentoring.sessionsTitle')}
          </h1>
          <p className="text-sm text-gray-700">
            {t('mentoring.sessionsDesc')}
          </p>
        </ToolbarHeading>
        <ToolbarActions>
          <Button variant="outline" size="sm" asChild>
            <Link to="/mentoring">
              <KeenIcon icon="arrow-left" style="duotone" className="text-sm" />
              {t('common.back')}
            </Link>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setDialogOpen(true)}
          >
            <KeenIcon icon="plus" style="duotone" className="text-sm" />
            {t('mentoring.newSession')}
          </Button>
        </ToolbarActions>
      </Toolbar>

      <div className="container-fixed">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <KeenIcon icon="messages" style="duotone" />
              {t('mentoring.allSessions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : allSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <KeenIcon
                  icon="messages"
                  style="duotone"
                  className="text-4xl text-muted-foreground/40 mb-3"
                />
                <p className="text-sm text-muted-foreground">
                  {t('mentoring.noSessions')}
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-4"
                  onClick={() => setDialogOpen(true)}
                >
                  {t('mentoring.createSession')}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {allSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
                        <KeenIcon
                          icon="messages"
                          style="duotone"
                          className="text-primary"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          {tv('mentoring.type', session.type)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t('mentoring.messageCount', { count: session.messages?.length ?? 0 })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={session.status} />
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
                id="create-session-form"
                onSubmit={form.handleSubmit(onSubmit)}
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
              form="create-session-form"
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
