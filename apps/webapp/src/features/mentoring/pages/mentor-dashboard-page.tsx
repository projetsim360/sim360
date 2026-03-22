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

const SESSION_TYPES = [
  { value: 'DEBRIEFING', label: 'Debriefing' },
  { value: 'CAREER_COACHING', label: 'Coaching carriere' },
  { value: 'INTERVIEW_PREP', label: 'Preparation entretien' },
] as const;

const sessionSchema = z.object({
  simulationId: z.string().min(1, "L'identifiant de simulation est requis"),
  learnerId: z.string().min(1, "L'identifiant de l'apprenant est requis"),
  type: z.string().optional(),
});

type SessionFormValues = z.infer<typeof sessionSchema>;

export default function MentorDashboardPage() {
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
          toast.success('Session creee avec succes');
          setDialogOpen(false);
          form.reset();
        },
        onError: () => {
          toast.error('Erreur lors de la creation de la session');
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
          <h1 className="text-xl font-medium text-gray-900">Espace Mentor</h1>
          <p className="text-sm text-gray-700">
            Gerez vos evaluations et sessions de mentorat
          </p>
        </ToolbarHeading>
        <ToolbarActions>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDialogOpen(true)}
          >
            <KeenIcon icon="plus" style="duotone" className="text-sm" />
            Nouvelle session
          </Button>
          <Button variant="primary" size="sm" asChild>
            <Link to="/mentoring/sessions">
              <KeenIcon icon="messages" style="duotone" className="text-sm" />
              Toutes les sessions
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
                  Evaluations en attente
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
                  Sessions actives
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
                  Sessions terminees
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
              Evaluations en attente de review
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
                Aucune evaluation en attente
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
                        {review.deliverable?.title ?? 'Livrable'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Score IA : {review.score}/100 — Grade : {review.grade}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/mentoring/review/${review.id}`}>
                        Evaluer
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
              Sessions de mentorat
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
                Aucune session de mentorat
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
                        Session {session.type}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {session.status === 'COMPLETED'
                          ? 'Terminee'
                          : session.status === 'IN_PROGRESS'
                            ? 'En cours'
                            : 'Planifiee'}
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
                          ? 'Terminee'
                          : session.status === 'IN_PROGRESS'
                            ? 'En cours'
                            : 'Planifiee'}
                      </Badge>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/mentoring/session/${session.id}`}>
                          Voir
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
            <DialogTitle>Nouvelle session de mentorat</DialogTitle>
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
                      <FormLabel>ID Simulation *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Identifiant de la simulation"
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
                      <FormLabel>ID Apprenant *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Identifiant de l'apprenant"
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
                      <FormLabel>Type de session</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir un type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SESSION_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
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
              Annuler
            </Button>
            <Button
              type="submit"
              form="dashboard-create-session-form"
              variant="primary"
              size="sm"
              disabled={createSession.isPending}
            >
              {createSession.isPending ? 'Creation...' : 'Creer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
