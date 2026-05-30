import { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { KeenIcon } from '@/components/keenicons';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/helpers';
import { useIsMobile } from '@/hooks/use-mobile';
import { EmailPriorityBadge } from './email-priority-badge';
import { EmailReplyForm } from './email-reply-form';
import { useEmailDraft } from '../hooks/use-email-draft';
import { useEmailShortcuts } from '../hooks/use-email-shortcuts';
import type { SimulatedEmail } from '../types/simulated-email.types';

interface EmailDetailDrawerProps {
  email: SimulatedEmail | null;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onArchive: () => void;
  onMarkUnread: () => void;
  onRespond: (response: string) => Promise<void>;
  isRespondPending: boolean;
  isArchivePending: boolean;
}

export function EmailDetailDrawer({
  email,
  index,
  total,
  onClose,
  onPrev,
  onNext,
  onArchive,
  onMarkUnread,
  onRespond,
  isRespondPending,
  isArchivePending,
}: EmailDetailDrawerProps) {
  const isMobile = useIsMobile();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { draft, setDraft, clearDraft } = useEmailDraft(email?.id ?? null);

  const isOpen = email !== null;
  const isArchived = email?.status === 'ARCHIVED';
  const isResponded = email?.status === 'RESPONDED';
  const canReply = email && !isArchived && !isResponded;

  function focusReply() {
    if (canReply) textareaRef.current?.focus();
  }

  // EmailReplyForm calls onSubmit(trimmedValue) — we forward it directly
  async function handleSubmit(trimmedValue: string) {
    await onRespond(trimmedValue);
    clearDraft();
  }

  useEmailShortcuts({
    enabled: isOpen && !isMobile,
    onPrev,
    onNext,
    onReply: focusReply,
    onArchive: () => {
      if (!isArchived) onArchive();
    },
    onMarkUnread: () => {
      if (!isArchived && (email?.status === 'READ' || email?.status === 'RESPONDED'))
        onMarkUnread();
    },
    onClose,
  });

  // No-op effect — kept to allow future side-effects when email changes
  useEffect(() => {
    if (!isOpen) return;
  }, [email?.id, isOpen]);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        close={false}
        className={cn(
          'p-0 flex flex-col gap-0',
          isMobile
            ? 'h-[100dvh] max-h-[100dvh] w-full'
            : 'w-full sm:max-w-[600px] lg:max-w-[640px]',
        )}
      >
        {email && (
          <>
            {/* ── Drawer header ── */}
            <div className="shrink-0 px-3 sm:px-4 py-2.5 border-b border-[var(--neutral-100)] dark:border-white/[0.06] flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Fermer"
                className="size-8"
              >
                <KeenIcon
                  icon={isMobile ? 'arrow-left' : 'cross'}
                  style="solid"
                  className="size-4"
                />
              </Button>

              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onPrev}
                  disabled={total <= 1}
                  aria-label="Email précédent"
                  className="size-8"
                >
                  <KeenIcon icon="left" style="solid" className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onNext}
                  disabled={total <= 1}
                  aria-label="Email suivant"
                  className="size-8"
                >
                  <KeenIcon icon="right" style="solid" className="size-3.5" />
                </Button>
                <span className="text-[11px] text-muted-foreground ml-1 hidden sm:inline">
                  {index + 1} / {total}
                </span>
              </div>

              <div className="ml-auto flex items-center gap-1">
                {!isArchived && (email.status === 'READ' || isResponded) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onMarkUnread}
                    className="gap-1.5"
                    title="Marquer comme non lu (U)"
                  >
                    <KeenIcon icon="sms" style="duotone" className="size-3.5" />
                    <span className="hidden sm:inline">Marquer non lu</span>
                  </Button>
                )}
                {!isArchived && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onArchive}
                    disabled={isArchivePending}
                    className="gap-1.5"
                    title="Archiver (E)"
                  >
                    <KeenIcon icon="archive" style="duotone" className="size-3.5" />
                    <span className="hidden sm:inline">Archiver</span>
                  </Button>
                )}
              </div>
            </div>

            {/* ── Body (scrollable) ── */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5">
              <div className="flex items-center gap-2 mb-3">
                <EmailPriorityBadge priority={email.priority} size="sm" />
                <span className="text-xs text-muted-foreground">
                  {format(new Date(email.scheduledAt), 'd MMM yyyy, HH:mm', {
                    locale: fr,
                  })}
                </span>
                {isResponded && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--success-700)] dark:text-[var(--success-400)] ml-auto">
                    <KeenIcon icon="check-circle" style="solid" className="size-3" />
                    Répondu
                  </span>
                )}
                {isArchived && (
                  <span className="text-[10px] font-semibold text-muted-foreground ml-auto">
                    Archivé
                  </span>
                )}
              </div>

              <h2 className="font-display text-[19px] font-bold text-foreground m-0 mb-4 leading-tight">
                {email.subject}
              </h2>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--neutral-50)] dark:bg-white/[0.03] mb-5">
                <div className="shrink-0 flex items-center justify-center size-9 rounded-full bg-gradient-to-br from-[var(--brand-500)] to-[var(--brand-700)] text-white text-[13px] font-bold">
                  {getInitials(email.senderName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-foreground truncate">
                    {email.senderName}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {email.senderRole} · {email.senderEmail}
                  </div>
                </div>
              </div>

              <div className="text-[13px] text-foreground leading-relaxed whitespace-pre-wrap">
                {email.body}
              </div>

              {isResponded && (
                <div className="mt-6 rounded-xl border border-[var(--neutral-100)] dark:border-white/[0.06] overflow-hidden">
                  <div className="px-4 py-3 bg-gradient-to-r from-[var(--brand-50)] to-[var(--success-50)] dark:from-[var(--brand-950)]/30 dark:to-[var(--success-950)]/30 border-b border-[var(--neutral-100)] dark:border-white/[0.06] flex items-center gap-2">
                    <KeenIcon
                      icon="message-text-2"
                      style="duotone"
                      className="size-4 text-[var(--brand-600)] dark:text-[var(--brand-400)]"
                    />
                    <span className="font-semibold text-sm text-foreground">
                      Votre réponse
                    </span>
                    {typeof email.responseScore === 'number' && (
                      <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full bg-[var(--success-500)] text-white text-xs font-bold">
                        {email.responseScore}/100
                      </span>
                    )}
                  </div>
                  <div className="p-4 text-[13px] text-foreground whitespace-pre-wrap leading-relaxed">
                    {email.userResponse}
                  </div>
                  {email.responseFeedback && (
                    <div className="px-4 py-3 bg-[var(--neutral-50)] dark:bg-white/[0.02] border-t border-[var(--neutral-100)] dark:border-white/[0.06]">
                      <div className="text-[10px] font-bold uppercase tracking-[1.2px] text-[var(--accent-700)] dark:text-[var(--accent-300)] mb-1">
                        Retour de l'IA
                      </div>
                      <p className="text-[12.5px] text-muted-foreground leading-relaxed m-0">
                        {email.responseFeedback}
                      </p>
                    </div>
                  )}
                  {email.respondedAt && (
                    <div className="px-4 py-2 text-[11px] text-muted-foreground border-t border-[var(--neutral-100)] dark:border-white/[0.06]">
                      Répondu le{' '}
                      {format(new Date(email.respondedAt), 'd MMMM yyyy à HH:mm', {
                        locale: fr,
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Footer (reply form or status banner) ── */}
            {canReply ? (
              <EmailReplyForm
                ref={textareaRef}
                value={draft}
                onChange={setDraft}
                onSubmit={handleSubmit}
                isPending={isRespondPending}
              />
            ) : (
              <div className="shrink-0 border-t border-[var(--neutral-100)] dark:border-white/[0.06] p-4 bg-[var(--neutral-50)] dark:bg-white/[0.02]">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <KeenIcon
                    icon={isArchived ? 'archive' : 'check-circle'}
                    style="duotone"
                    className="size-4 shrink-0"
                  />
                  {isArchived
                    ? 'Cet email est archivé.'
                    : 'Vous avez déjà répondu à cet email.'}
                </div>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
