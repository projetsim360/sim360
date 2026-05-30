import { cn } from '@/lib/utils';
import type { EmailFolder } from '../types/simulated-email.types';

export type { EmailFolder };

export interface EmailFolderTabsProps {
  active: EmailFolder;
  counts: Record<EmailFolder, number>;
  onFolderChange: (folder: EmailFolder) => void;
}

const FOLDERS: { key: EmailFolder; label: string }[] = [
  { key: 'inbox', label: 'Boîte de réception' },
  { key: 'responded', label: 'Répondus' },
  { key: 'archived', label: 'Archives' },
];

export function EmailFolderTabs({ active, counts, onFolderChange }: EmailFolderTabsProps) {
  function handleKeyDown(e: React.KeyboardEvent) {
    const keys = FOLDERS.map((f) => f.key);
    const currentIndex = keys.indexOf(active);
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = keys[(currentIndex + 1) % keys.length];
      onFolderChange(next);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = keys[(currentIndex - 1 + keys.length) % keys.length];
      onFolderChange(prev);
    } else if (e.key === 'Home') {
      e.preventDefault();
      onFolderChange(keys[0]);
    } else if (e.key === 'End') {
      e.preventDefault();
      onFolderChange(keys[keys.length - 1]);
    }
  }

  return (
    <div
      role="tablist"
      aria-label="Dossiers d'emails"
      onKeyDown={handleKeyDown}
      className="flex items-center gap-1 sm:gap-2 overflow-x-auto -mx-1 px-1 border-b border-[var(--neutral-100)] dark:border-white/[0.06]"
    >
      {FOLDERS.map(({ key, label }) => {
        const isActive = key === active;
        const count = counts[key];
        return (
          <button
            key={key}
            role="tab"
            type="button"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onFolderChange(key)}
            className={cn(
              'shrink-0 inline-flex items-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors',
              'border-b-2 -mb-px',
              'focus-visible:outline-none focus-visible:bg-[var(--neutral-50)] dark:focus-visible:bg-white/[0.04] rounded-t',
              isActive
                ? 'border-[var(--brand-500)] text-[var(--brand-600)] dark:text-[var(--brand-400)]'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <span>{label}</span>
            <span
              className={cn(
                'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold',
                isActive
                  ? 'bg-[var(--brand-100)] text-[var(--brand-700)] dark:bg-[var(--brand-900)]/40 dark:text-[var(--brand-300)]'
                  : 'bg-[var(--neutral-100)] text-[var(--neutral-500)] dark:bg-white/[0.06] dark:text-[var(--neutral-400)]',
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
