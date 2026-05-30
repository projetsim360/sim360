import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { EmailListRow } from './email-list-row';
import { EmailEmptyState } from './email-empty-state';
import type { SimulatedEmail } from '../types/simulated-email.types';

type Folder = 'inbox' | 'responded' | 'archived';

interface EmailListProps {
  emails: SimulatedEmail[];
  folder: Folder;
  isLoading: boolean;
  hasFiltersOrSearch: boolean;
  activeEmailId: string | null;
  selectedIds: Set<string>;
  onSelectEmail: (email: SimulatedEmail) => void;
  onToggleSelect: (emailId: string, checked: boolean) => void;
  onClearFilters: () => void;
}

export function EmailList({
  emails,
  folder,
  isLoading,
  hasFiltersOrSearch,
  activeEmailId,
  selectedIds,
  onSelectEmail,
  onToggleSelect,
  onClearFilters,
}: EmailListProps) {
  return (
    <Card
      className={cn(
        'overflow-hidden',
        'border-[var(--neutral-100)] dark:border-white/[0.06]',
        'shadow-[0_1px_2px_rgba(15,26,46,0.04),0_8px_24px_-10px_rgba(15,26,46,0.08)]',
        'dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_-10px_rgba(0,0,0,0.5)]',
      )}
    >
      {isLoading ? (
        <div className="divide-y divide-[var(--neutral-100)] dark:divide-white/[0.06]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3">
              <Skeleton className="size-4 mt-1.5 shrink-0 rounded" />
              <Skeleton className="size-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : emails.length === 0 ? (
        hasFiltersOrSearch ? (
          <EmailEmptyState variant="no-results" onClearFilters={onClearFilters} />
        ) : (
          <EmailEmptyState variant="empty-folder" folder={folder} />
        )
      ) : (
        <div className="divide-y divide-[var(--neutral-100)] dark:divide-white/[0.06]">
          {emails.map((email) => (
            <EmailListRow
              key={email.id}
              email={email}
              isActive={activeEmailId === email.id}
              isSelected={selectedIds.has(email.id)}
              onClick={() => onSelectEmail(email)}
              onToggleSelect={(checked) => onToggleSelect(email.id, checked)}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
