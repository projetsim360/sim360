import { cn } from '@/lib/utils';
import { KeenIcon } from '@/components/keenicons';
import { EmailPriorityBadge } from './email-priority-badge';
import type { SimulatedEmail } from '../types/simulated-email.types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface EmailListItemProps {
  email: SimulatedEmail;
  onClick: (email: SimulatedEmail) => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function EmailListItem({ email, onClick }: EmailListItemProps) {
  const isUnread = email.status === 'UNREAD';
  const isResponded = email.status === 'RESPONDED';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(email)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick(email);
      }}
      className={cn(
        'flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors',
        'hover:bg-muted/50 border-b border-border last:border-b-0',
        isUnread && 'bg-primary/5',
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold',
          isUnread
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground',
        )}
      >
        {getInitials(email.senderName)}
      </div>

      {/* Sender + Subject */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-sm truncate',
              isUnread ? 'font-bold text-foreground' : 'font-medium text-foreground',
            )}
          >
            {email.senderName}
          </span>
          <span className="text-sm text-muted-foreground truncate">
            {email.senderRole}
          </span>
        </div>
        <p
          className={cn(
            'text-sm truncate mt-0.5',
            isUnread ? 'font-semibold text-foreground' : 'text-muted-foreground',
          )}
        >
          {email.subject}
        </p>
      </div>

      {/* Right side: priority + status + time */}
      <div className="flex-shrink-0 flex items-center gap-3">
        <EmailPriorityBadge priority={email.priority} />
        {isResponded && (
          <KeenIcon
            icon="double-check"
            style="solid"
            className="size-4 text-success"
          />
        )}
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDistanceToNow(new Date(email.scheduledAt), {
            addSuffix: true,
            locale: fr,
          })}
        </span>
      </div>
    </div>
  );
}
