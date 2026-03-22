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

function getStatusBadge(status: string) {
  switch (status) {
    case 'COMPLETED':
      return (
        <Badge variant="success" size="sm">
          Terminee
        </Badge>
      );
    case 'IN_PROGRESS':
      return (
        <Badge variant="primary" size="sm">
          En cours
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" size="sm">
          Planifiee
        </Badge>
      );
  }
}

function getTypeLabel(type: string) {
  const found = SESSION_TYPES.find((t) => t.value === type);
  return found ? found.label : type;
}

export default function MentoringSessionsPage() {
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

  const allSessions = sessions ?? [];

  return (
    <>
      <Toolbar>
        <ToolbarHeading>
          <h1 className="text-xl font-medium text-gray-900">
            Sessions de mentorat
          </h1>
          <p className="text-sm text-gray-700">
            Gerez vos sessions de mentorat avec les apprenants
          </p>
        </ToolbarHeading>
        <ToolbarActions>
          <Button variant="outline" size="sm" asChild>
            <Link to="/mentoring">
              <KeenIcon icon="arrow-left" style="duotone" className="text-sm" />
              Retour
            </Link>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setDialogOpen(true)}
          >
            <KeenIcon icon="plus" style="duotone" className="text-sm" />
            Nouvelle session
          </Button>
        </ToolbarActions>
      </Toolbar>

      <div className="container-fixed">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <KeenIcon icon="messages" style="duotone" />
              Toutes les sessions
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
                  Aucune session de mentorat
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-4"
                  onClick={() => setDialogOpen(true)}
                >
                  Creer une session
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
                          {getTypeLabel(session.type)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {session.messages?.length ?? 0} message(s)
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(session.status)}
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
                id="create-session-form"
                onSubmit={form.handleSubmit(onSubmit)}
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
              form="create-session-form"
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
