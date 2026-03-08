import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { KeenIcon } from '@/components/keenicons';
import { toast } from 'sonner';
import { useRespondToEmail } from '../api/simulated-emails.api';

interface EmailResponseFormProps {
  simulationId: string;
  emailId: string;
  onSuccess?: () => void;
}

export function EmailResponseForm({
  simulationId,
  emailId,
  onSuccess,
}: EmailResponseFormProps) {
  const [response, setResponse] = useState('');
  const respondMutation = useRespondToEmail(simulationId);

  const maxLength = 2000;
  const charCount = response.length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!response.trim()) {
      toast.error('Veuillez rediger une reponse avant d\'envoyer.');
      return;
    }

    try {
      await respondMutation.mutateAsync({
        emailId,
        data: { response: response.trim() },
      });
      toast.success('Reponse envoyee avec succes.');
      onSuccess?.();
    } catch {
      toast.error('Erreur lors de l\'envoi de la reponse.');
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <KeenIcon icon="message-text" style="duotone" className="size-5" />
          Repondre
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Textarea
              value={response}
              onChange={(e) => setResponse(e.target.value.slice(0, maxLength))}
              placeholder="Redigez votre reponse ici..."
              rows={6}
              disabled={respondMutation.isPending}
              className="resize-none"
            />
            <div className="flex justify-end mt-1">
              <span className="text-xs text-muted-foreground">
                {charCount}/{maxLength}
              </span>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={respondMutation.isPending || !response.trim()}
            >
              {respondMutation.isPending ? (
                <>
                  <span className="animate-spin mr-2">
                    <KeenIcon icon="loading" style="duotone" className="size-4" />
                  </span>
                  Evaluation en cours...
                </>
              ) : (
                <>
                  <KeenIcon icon="send" style="solid" className="size-4 mr-1" />
                  Envoyer la reponse
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Display result after mutation success */}
        {respondMutation.isSuccess && respondMutation.data && (
          <div className="mt-6 space-y-3 pt-4 border-t border-border">
            <div className="flex items-center gap-3">
              <h4 className="text-sm font-semibold">Evaluation</h4>
              {respondMutation.data.responseScore !== undefined && (
                <Badge
                  variant={
                    respondMutation.data.responseScore >= 70
                      ? 'success'
                      : respondMutation.data.responseScore >= 40
                        ? 'warning'
                        : 'destructive'
                  }
                  size="sm"
                >
                  {respondMutation.data.responseScore}/100
                </Badge>
              )}
            </div>
            {respondMutation.data.responseFeedback && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {respondMutation.data.responseFeedback}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
