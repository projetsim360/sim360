import { Link, useParams, useNavigate } from 'react-router';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { KeenIcon } from '@/components/keenicons';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  useSimulatedEmail,
  useArchiveEmail,
} from '../api/simulated-emails.api';
import { EmailPriorityBadge } from '../components/email-priority-badge';
import { EmailResponseForm } from '../components/email-response-form';

export default function EmailDetailPage() {
  const { id: simId, emailId } = useParams<{ id: string; emailId: string }>();
  const navigate = useNavigate();

  const { data: email, isLoading, error } = useSimulatedEmail(simId || '', emailId || '');
  const archiveMutation = useArchiveEmail(simId || '');

  async function handleArchive() {
    if (!emailId) return;
    try {
      await archiveMutation.mutateAsync(emailId);
      toast.success('Email archive.');
      navigate(`/simulations/${simId}/emails`);
    } catch {
      toast.error('Erreur lors de l\'archivage.');
    }
  }

  if (!simId || !emailId) {
    return (
      <div className="container">
        <Toolbar>
          <ToolbarHeading title="Email" />
        </Toolbar>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Parametres manquants.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container space-y-5">
        <Toolbar>
          <ToolbarHeading title="Email" />
        </Toolbar>
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    );
  }

  if (error || !email) {
    return (
      <div className="container">
        <Toolbar>
          <ToolbarHeading title="Email" />
          <ToolbarActions>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/simulations/${simId}/emails`}>
                <KeenIcon icon="arrow-left" style="duotone" className="size-4" />
                Retour
              </Link>
            </Button>
          </ToolbarActions>
        </Toolbar>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive text-sm">
              {(error as Error)?.message || 'Email introuvable.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasResponded = email.status === 'RESPONDED';
  const isArchived = email.status === 'ARCHIVED';

  return (
    <div className="container space-y-5">
      <Toolbar>
        <ToolbarHeading title={email.subject} />
        <ToolbarActions>
          {!isArchived && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleArchive}
              disabled={archiveMutation.isPending}
            >
              <KeenIcon icon="archive" style="duotone" className="size-4" />
              Archiver
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link to={`/simulations/${simId}/emails`}>
              <KeenIcon icon="arrow-left" style="duotone" className="size-4" />
              Retour
            </Link>
          </Button>
        </ToolbarActions>
      </Toolbar>
        {/* Email header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Sender avatar */}
                <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-semibold">
                  {email.senderName
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{email.senderName}</h3>
                  <p className="text-sm text-muted-foreground">{email.senderRole}</p>
                  <p className="text-xs text-muted-foreground">{email.senderEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <EmailPriorityBadge priority={email.priority} />
                <span className="text-xs text-muted-foreground">
                  {format(new Date(email.scheduledAt), 'd MMMM yyyy, HH:mm', {
                    locale: fr,
                  })}
                </span>
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-5">
            <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap leading-relaxed">
              {email.body}
            </div>
          </CardContent>
        </Card>

        {/* Response section */}
        {hasResponded ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <KeenIcon icon="double-check" style="solid" className="size-5 text-success" />
                Votre reponse
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {email.userResponse}
                </p>
              </div>

              {email.respondedAt && (
                <p className="text-xs text-muted-foreground">
                  Repondu le{' '}
                  {format(new Date(email.respondedAt), 'd MMMM yyyy, HH:mm', {
                    locale: fr,
                  })}
                </p>
              )}

              {email.responseScore !== undefined && (
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-sm font-medium">Score :</span>
                  <Badge
                    variant={
                      email.responseScore >= 70
                        ? 'success'
                        : email.responseScore >= 40
                          ? 'warning'
                          : 'destructive'
                    }
                    size="sm"
                  >
                    {email.responseScore}/100
                  </Badge>
                </div>
              )}

              {email.responseFeedback && (
                <div className="pt-2">
                  <h4 className="text-sm font-semibold mb-1">Retour de l'IA</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {email.responseFeedback}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : !isArchived ? (
          <EmailResponseForm
            simulationId={simId}
            emailId={emailId}
          />
        ) : null}
    </div>
  );
}
