import { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { KeenIcon } from '@/components/keenicons';
import { toast } from 'sonner';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { simulationApi } from '@/features/simulation/api/simulation.api';
import {
  useSimulatedEmails,
  useArchiveEmail,
  useRespondToEmail,
} from '../api/simulated-emails.api';
import { EmailPriorityBadge } from '../components/email-priority-badge';
import type { SimulatedEmail, EmailStatus } from '../types/simulated-email.types';

type Folder = 'inbox' | 'responded' | 'archived';

const FOLDER_TITLES: Record<Folder, string> = {
  inbox: 'Boite de reception',
  responded: 'Repondus',
  archived: 'Archives',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getStatusesForFolder(folder: Folder): EmailStatus[] {
  switch (folder) {
    case 'inbox':
      return ['UNREAD', 'READ'];
    case 'responded':
      return ['RESPONDED'];
    case 'archived':
      return ['ARCHIVED'];
  }
}

export default function EmailInboxPage() {
  const { id: simIdFromUrl, folder: folderParam } = useParams<{
    id?: string;
    folder?: string;
  }>();

  const activeFolder: Folder =
    folderParam === 'responded' || folderParam === 'archived' || folderParam === 'inbox'
      ? folderParam
      : 'inbox';

  // If accessed via /emails/:folder, fetch the active simulation
  const { data: simulations } = useQuery({
    queryKey: ['simulations'],
    queryFn: () => simulationApi.getSimulations(),
    enabled: !simIdFromUrl,
  });

  const simulationId = useMemo(() => {
    if (simIdFromUrl) return simIdFromUrl;
    if (!simulations || simulations.length === 0) return null;
    // Pick first active simulation
    const active = simulations.find(
      (s: any) => s.status === 'IN_PROGRESS' || s.status === 'ACTIVE',
    );
    return active?.id ?? simulations[0]?.id ?? null;
  }, [simIdFromUrl, simulations]);

  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const { data: emails, isLoading } = useSimulatedEmails(simulationId || '');
  const archiveMutation = useArchiveEmail(simulationId || '');
  const respondMutation = useRespondToEmail(simulationId || '');

  const folderStatuses = getStatusesForFolder(activeFolder);

  const filteredEmails = useMemo(() => {
    if (!emails) return [];
    return [...emails]
      .filter((e) => folderStatuses.includes(e.status))
      .sort(
        (a, b) =>
          new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
      );
  }, [emails, folderStatuses]);

  const selectedEmail = useMemo(
    () => filteredEmails.find((e) => e.id === selectedEmailId) ?? null,
    [filteredEmails, selectedEmailId],
  );

  function handleSelectEmail(email: SimulatedEmail) {
    setSelectedEmailId(email.id);
    setReplyText('');
  }

  async function handleArchive() {
    if (!selectedEmail || !simulationId) return;
    try {
      await archiveMutation.mutateAsync(selectedEmail.id);
      toast.success('Email archive.');
      setSelectedEmailId(null);
    } catch {
      toast.error("Erreur lors de l'archivage.");
    }
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedEmail || !simulationId || !replyText.trim()) return;
    try {
      await respondMutation.mutateAsync({
        emailId: selectedEmail.id,
        data: { response: replyText.trim() },
      });
      toast.success('Reponse envoyee.');
      setReplyText('');
    } catch {
      toast.error("Erreur lors de l'envoi.");
    }
  }

  if (!simulationId && !isLoading) {
    return (
      <div className="container">
        <Toolbar>
          <ToolbarHeading title={FOLDER_TITLES[activeFolder]} />
        </Toolbar>
        <Card>
          <CardContent>
            <EmptyState
              icon="sms"
              title="Aucune simulation active"
              description="Lancez une simulation pour recevoir des emails."
              action={{ label: 'Lancer une simulation', href: '/simulations/new' }}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container">
      <Toolbar>
        <ToolbarHeading title={FOLDER_TITLES[activeFolder]} />
        <ToolbarActions>
          {simulationId && (
            <Button variant="outline" size="sm" asChild>
              <Link to={`/simulations/${simulationId}`}>
                <KeenIcon icon="arrow-left" style="duotone" className="size-4" />
                Simulation
              </Link>
            </Button>
          )}
        </ToolbarActions>
      </Toolbar>

      <Card className="overflow-hidden">
        <div className="flex h-[calc(100vh-200px)] min-h-[500px]">
          {/* Left panel — Email list */}
          <div className="w-80 shrink-0 border-r border-border flex flex-col">
            <div className="p-3 border-b border-border">
              <p className="text-sm font-medium text-foreground">
                {FOLDER_TITLES[activeFolder]}
                <span className="text-muted-foreground font-normal ml-2">
                  ({filteredEmails.length})
                </span>
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                </div>
              ) : filteredEmails.length === 0 ? (
                <EmptyState
                  icon="sms"
                  title="Dossier vide"
                  description="Les emails arrivent au fil de la simulation."
                />
              ) : (
                filteredEmails.map((email) => {
                  const isUnread = email.status === 'UNREAD';
                  const isSelected = selectedEmailId === email.id;
                  return (
                    <div
                      key={email.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelectEmail(email)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ')
                          handleSelectEmail(email);
                      }}
                      className={cn(
                        'px-4 py-3 border-b border-border cursor-pointer transition-colors',
                        isSelected
                          ? 'bg-primary/10 border-l-2 border-l-primary'
                          : 'hover:bg-muted/50',
                        isUnread && !isSelected && 'bg-primary/5',
                      )}
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <div
                          className={cn(
                            'shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold',
                            isUnread
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground',
                          )}
                        >
                          {getInitials(email.senderName)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span
                            className={cn(
                              'text-sm truncate block',
                              isUnread
                                ? 'font-bold text-foreground'
                                : 'font-medium text-foreground',
                            )}
                          >
                            {email.senderName}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground shrink-0">
                          {formatDistanceToNow(new Date(email.scheduledAt), {
                            addSuffix: false,
                            locale: fr,
                          })}
                        </span>
                      </div>
                      <p
                        className={cn(
                          'text-sm truncate',
                          isUnread
                            ? 'font-semibold text-foreground'
                            : 'text-foreground',
                        )}
                      >
                        {email.subject}
                      </p>
                      <p className="text-sm text-muted-foreground truncate mt-0.5">
                        {email.body.slice(0, 80)}...
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <EmailPriorityBadge priority={email.priority} />
                        {email.status === 'RESPONDED' && (
                          <KeenIcon
                            icon="double-check"
                            style="solid"
                            className="size-3.5 text-success"
                          />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right panel — Email detail */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {!selectedEmail ? (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                <KeenIcon
                  icon="sms"
                  style="duotone"
                  className="size-16 text-muted-foreground/20 mb-4"
                />
                <p className="text-sm">Selectionnez un email pour le lire</p>
              </div>
            ) : (
              <>
                {/* Email header bar */}
                <div className="shrink-0 px-6 py-3 border-b border-border flex items-center justify-between bg-background">
                  <div className="flex items-center gap-3">
                    <EmailPriorityBadge priority={selectedEmail.priority} />
                    <span className="text-xs text-muted-foreground">
                      {format(
                        new Date(selectedEmail.scheduledAt),
                        'd MMM yyyy, HH:mm',
                        { locale: fr },
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedEmail.status !== 'ARCHIVED' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleArchive}
                        disabled={archiveMutation.isPending}
                      >
                        <KeenIcon
                          icon="archive"
                          style="duotone"
                          className="size-4"
                        />
                        Archiver
                      </Button>
                    )}
                  </div>
                </div>

                {/* Email content */}
                <div className="flex-1 overflow-y-auto">
                  <div className="px-6 py-5">
                    <h2 className="text-lg font-semibold text-foreground mb-4">
                      {selectedEmail.subject}
                    </h2>

                    <div className="flex items-center gap-4 mb-5">
                      <div className="shrink-0 flex items-center justify-center w-11 h-11 rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                        {getInitials(selectedEmail.senderName)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">
                          {selectedEmail.senderName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {selectedEmail.senderRole} —{' '}
                          {selectedEmail.senderEmail}
                        </p>
                      </div>
                    </div>

                    <Separator className="mb-5" />

                    <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap leading-relaxed">
                      {selectedEmail.body}
                    </div>

                    {/* Response section */}
                    {selectedEmail.status === 'RESPONDED' && (
                      <div className="mt-6 pt-5 border-t border-border space-y-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <KeenIcon
                            icon="double-check"
                            style="solid"
                            className="size-4 text-success"
                          />
                          Votre reponse
                        </div>
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <p className="text-sm text-foreground whitespace-pre-wrap">
                            {selectedEmail.userResponse}
                          </p>
                        </div>
                        {selectedEmail.respondedAt && (
                          <p className="text-xs text-muted-foreground">
                            Repondu le{' '}
                            {format(
                              new Date(selectedEmail.respondedAt),
                              'd MMMM yyyy, HH:mm',
                              { locale: fr },
                            )}
                          </p>
                        )}
                        {selectedEmail.responseScore !== undefined && (
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">Score :</span>
                            <Badge
                              variant={
                                selectedEmail.responseScore >= 70
                                  ? 'success'
                                  : selectedEmail.responseScore >= 40
                                    ? 'warning'
                                    : 'destructive'
                              }
                              size="sm"
                            >
                              {selectedEmail.responseScore}/100
                            </Badge>
                          </div>
                        )}
                        {selectedEmail.responseFeedback && (
                          <div>
                            <h4 className="text-sm font-semibold mb-1">
                              Retour de l'IA
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {selectedEmail.responseFeedback}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Reply form or status message */}
                {selectedEmail.status === 'RESPONDED' ? (
                  <div className="shrink-0 border-t border-border bg-background p-4">
                    <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
                      <KeenIcon icon="check-circle" style="duotone" className="size-4 text-success shrink-0" />
                      <p className="text-sm text-muted-foreground">
                        Vous avez deja repondu a cet email.
                      </p>
                    </div>
                  </div>
                ) : selectedEmail.status === 'ARCHIVED' ? (
                  <div className="shrink-0 border-t border-border bg-background p-4">
                    <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
                      <KeenIcon icon="archive" style="duotone" className="size-4 text-muted-foreground shrink-0" />
                      <p className="text-sm text-muted-foreground">
                        Cet email est archive.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="shrink-0 border-t border-border bg-background p-4">
                    <form onSubmit={handleReply} className="space-y-3">
                      <Textarea
                        value={replyText}
                        onChange={(e) =>
                          setReplyText(e.target.value.slice(0, 2000))
                        }
                        placeholder="Redigez votre reponse..."
                        rows={3}
                        disabled={respondMutation.isPending}
                        className="resize-none"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {replyText.length}/2000
                        </span>
                        <Button
                          type="submit"
                          variant="primary"
                          size="sm"
                          disabled={
                            respondMutation.isPending || !replyText.trim()
                          }
                        >
                          {respondMutation.isPending ? (
                            <>
                              <KeenIcon
                                icon="loading"
                                style="duotone"
                                className="size-4 animate-spin mr-1"
                              />
                              Evaluation...
                            </>
                          ) : (
                            <>
                              <KeenIcon
                                icon="send"
                                style="solid"
                                className="size-4 mr-1"
                              />
                              Envoyer
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
