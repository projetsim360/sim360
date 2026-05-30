import { forwardRef, type FormEvent } from 'react';
import { KeenIcon } from '@/components/keenicons';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const MAX_LENGTH = 2000;

interface EmailReplyFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (trimmedValue: string) => void;
  isPending: boolean;
}

export const EmailReplyForm = forwardRef<HTMLTextAreaElement, EmailReplyFormProps>(
  function EmailReplyForm({ value, onChange, onSubmit, isPending }, ref) {
    function handleSubmit(e: FormEvent) {
      e.preventDefault();
      const trimmed = value.trim();
      if (!trimmed || isPending) return;
      onSubmit(trimmed);
    }

    return (
      <form
        onSubmit={handleSubmit}
        className="border-t border-[var(--neutral-100)] dark:border-white/[0.06] p-4 bg-[var(--neutral-50)] dark:bg-white/[0.02]"
      >
        <Textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, MAX_LENGTH))}
          placeholder="Rédigez votre réponse..."
          rows={3}
          disabled={isPending}
          className="resize-none bg-background"
          aria-label="Réponse à l'email"
          aria-describedby="reply-counter"
        />
        <div className="flex items-center justify-between mt-2">
          <span
            id="reply-counter"
            aria-live="polite"
            aria-atomic="true"
            className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground"
          >
            {value.length} / {MAX_LENGTH}
            <span aria-hidden="true">·</span>
            <KeenIcon icon="save-2" style="duotone" className="size-3" />
            <span>brouillon auto</span>
          </span>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isPending || !value.trim()}
            className="gap-1.5"
            title="Envoyer (R)"
            aria-keyshortcuts="r"
          >
            {isPending ? (
              <>
                <KeenIcon
                  icon="loading"
                  style="duotone"
                  className="size-3.5 animate-spin"
                />
                Évaluation...
              </>
            ) : (
              <>
                <KeenIcon icon="send" style="duotone" className="size-3.5" />
                Envoyer
              </>
            )}
          </Button>
          <span className="sr-only" aria-live="assertive" aria-atomic="true">
            {isPending ? 'Évaluation en cours…' : ''}
          </span>
        </div>
      </form>
    );
  },
);
