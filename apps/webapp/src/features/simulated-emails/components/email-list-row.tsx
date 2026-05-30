import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { KeenIcon } from '@/components/keenicons';
import { Checkbox } from '@/components/ui/checkbox';
import { getInitials } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { EmailPriorityBadge } from './email-priority-badge';
import type { SimulatedEmail } from '../types/simulated-email.types';

interface EmailListRowProps {
  email: SimulatedEmail;
  isActive: boolean;
  isSelected: boolean;
  onClick: () => void;
  onToggleSelect: (checked: boolean) => void;
}

export function EmailListRow({
  email,
  isActive,
  isSelected,
  onClick,
  onToggleSelect,
}: EmailListRowProps) {
  const isUnread = email.status === 'UNREAD';
  const isHigh = email.priority === 'URGENT' || email.priority === 'HIGH';
  const isResponded = email.status === 'RESPONDED';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      data-active={isActive ? 'true' : undefined}
      className={cn(
        'group relative flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors',
        'border-b border-[var(--neutral-100)] dark:border-white/[0.06]',
        'hover:bg-[var(--neutral-50)] dark:hover:bg-white/[0.03]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-500)] focus-visible:ring-inset',
        isActive &&
          'bg-[var(--brand-50)] dark:bg-[var(--brand-950)]/40 hover:bg-[var(--brand-50)] dark:hover:bg-[var(--brand-950)]/40',
        isHigh && !isActive && 'bg-gradient-to-r from-[var(--accent-50)] to-transparent dark:from-[var(--accent-950)]/20',
      )}
      style={
        isHigh
          ? { boxShadow: 'inset 3px 0 0 var(--accent-500)' }
          : undefined
      }
    >
      {/* Checkbox */}
      <div
        className="pt-1.5 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onToggleSelect(checked === true)}
          aria-label={`Sélectionner l'email de ${email.senderName}`}
        />
      </div>

      {/* Avatar */}
      <div
        className={cn(
          'shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-[11px] font-bold',
          isUnread
            ? 'bg-gradient-to-br from-[var(--brand-500)] to-[var(--brand-700)] text-white'
            : 'bg-[var(--neutral-200)] dark:bg-white/[0.08] text-[var(--neutral-600)] dark:text-[var(--neutral-300)]',
        )}
      >
        {getInitials(email.senderName)}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-0.5">
          <span
            className={cn(
              'text-[13px] truncate',
              isUnread ? 'font-bold text-foreground' : 'font-medium text-foreground',
            )}
          >
            {email.senderName}
          </span>
          <span className="text-[10px] text-muted-foreground truncate hidden sm:inline">
            {email.senderRole}
          </span>
          <span className="ml-auto text-[11px] text-muted-foreground shrink-0">
            {formatDistanceToNow(new Date(email.scheduledAt), {
              addSuffix: false,
              locale: fr,
            })}
          </span>
        </div>

        <div
          className={cn(
            'text-[13px] mb-0.5',
            isUnread
              ? 'font-semibold text-foreground'
              : 'font-medium text-foreground',
          )}
        >
          {email.subject}
        </div>

        <div className="text-[12px] text-muted-foreground line-clamp-1">
          {email.body}
        </div>

        <div className="flex items-center gap-1.5 mt-1.5">
          <EmailPriorityBadge priority={email.priority} />
          {isResponded && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--success-700)] dark:text-[var(--success-400)]">
              <KeenIcon icon="check-circle" style="solid" className="size-3" />
              Répondu
              {typeof email.responseScore === 'number' && (
                <span className="text-muted-foreground">· {email.responseScore}/100</span>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
