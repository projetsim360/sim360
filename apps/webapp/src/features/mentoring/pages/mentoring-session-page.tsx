import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { KeenIcon } from '@/components/keenicons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  useMentoringSession,
  useCompleteSession,
  mentoringApi,
} from '../api/mentoring.api';
import { useQueryClient } from '@tanstack/react-query';
import type { MentoringMessage } from '../types/mentoring.types';

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
  switch (type) {
    case 'DEBRIEFING':
      return 'Debriefing';
    case 'CAREER_COACHING':
      return 'Coaching carriere';
    case 'INTERVIEW_PREP':
      return 'Preparation entretien';
    default:
      return type;
  }
}

export default function MentoringSessionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: session, isLoading } = useMentoringSession(id ?? '');
  const completeSession = useCompleteSession();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages: MentoringMessage[] = session?.messages ?? [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSendMessage = async () => {
    if (!message.trim() || !id) return;
    setSending(true);
    try {
      await mentoringApi.sendMessage(id, message.trim());
      setMessage('');
      queryClient.invalidateQueries({
        queryKey: ['mentoring', 'sessions', id],
      });
    } catch {
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setSending(false);
    }
  };

  const handleComplete = () => {
    if (!id) return;
    completeSession.mutate(id, {
      onSuccess: () => {
        toast.success('Session terminee avec succes');
      },
      onError: () => {
        toast.error('Erreur lors de la cloture de la session');
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <Toolbar>
        <ToolbarHeading>
          <h1 className="text-xl font-medium text-gray-900">
            {isLoading
              ? 'Chargement...'
              : `Session ${session ? getTypeLabel(session.type) : ''}`}
          </h1>
          <p className="text-sm text-gray-700">
            Echangez avec l'apprenant en temps reel
          </p>
        </ToolbarHeading>
        <ToolbarActions>
          <Button variant="outline" size="sm" onClick={() => navigate('/mentoring/sessions')}>
            <KeenIcon icon="arrow-left" style="duotone" className="text-sm" />
            Retour
          </Button>
          {session && session.status !== 'COMPLETED' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <KeenIcon icon="check-circle" style="duotone" className="text-sm" />
                  Terminer la session
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Terminer la session</AlertDialogTitle>
                  <AlertDialogDescription>
                    Etes-vous sur de vouloir terminer cette session de mentorat ?
                    Cette action est irreversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleComplete}>
                    Confirmer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </ToolbarActions>
      </Toolbar>

      <div className="container-fixed space-y-5">
        {/* Session info */}
        <Card>
          <CardContent className="p-4">
            {isLoading ? (
              <div className="flex gap-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-20" />
              </div>
            ) : session ? (
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <KeenIcon icon="messages" style="duotone" className="text-primary" />
                  <span className="text-sm font-medium">
                    {getTypeLabel(session.type)}
                  </span>
                </div>
                {getStatusBadge(session.status)}
                <span className="text-xs text-muted-foreground">
                  {messages.length} message(s)
                </span>
                {session.notes && (
                  <span className="text-xs text-muted-foreground">
                    Notes : {session.notes}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Session introuvable</p>
            )}
          </CardContent>
        </Card>

        {/* Messages */}
        <Card className="flex flex-col" style={{ minHeight: '500px' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <KeenIcon icon="message-text" style="duotone" />
              Conversation
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 px-5" style={{ height: '400px' }}>
              {isLoading ? (
                <div className="space-y-3 py-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-3/4 rounded-lg" />
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <KeenIcon
                    icon="message-text"
                    style="duotone"
                    className="text-4xl text-muted-foreground/40 mb-3"
                  />
                  <p className="text-sm text-muted-foreground">
                    Aucun message pour le moment
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Envoyez le premier message pour demarrer la conversation
                  </p>
                </div>
              ) : (
                <div className="space-y-3 py-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'MENTOR' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                          msg.role === 'MENTOR'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="text-xs opacity-70 mb-1">
                          {msg.role === 'MENTOR' ? 'Vous' : 'Apprenant'}
                        </div>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            {session?.status !== 'COMPLETED' && (
              <div className="border-t p-4 flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Tapez votre message..."
                  disabled={sending || !session}
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={sending || !message.trim()}
                >
                  {sending ? (
                    <KeenIcon
                      icon="loading"
                      style="duotone"
                      className="animate-spin text-sm"
                    />
                  ) : (
                    <KeenIcon icon="send" style="duotone" className="text-sm" />
                  )}
                </Button>
              </div>
            )}

            {session?.status === 'COMPLETED' && (
              <div className="border-t p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Cette session est terminee
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
