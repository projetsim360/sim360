import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';
import type { EmailPriority } from '../types/simulated-email.types';
import { useT } from '@/i18n/app/use-t';

interface EmailPriorityBadgeProps {
  priority: EmailPriority;
  size?: 'xs' | 'sm';
  className?: string;
}

/**
 * Premium priority badge.
 * - URGENT/HIGH -> "HAUTE" (warm accent)
 * - NORMAL      -> "NORMALE" (neutral discreet)
 * - LOW         -> "BASSE" (muted)
 */
export function EmailPriorityBadge({
  priority,
  size = 'xs',
  className,
}: EmailPriorityBadgeProps) {
  const t = useT();
  const isHigh = priority === 'URGENT' || priority === 'HIGH';
  const isNormal = priority === 'NORMAL';

  const label = isHigh ? t('emails.priority.high') : isNormal ? t('emails.priority.normal') : t('emails.priority.low');

  const sizeClasses =
    size === 'xs'
      ? 'text-[9px] px-2 py-0.5 gap-1'
      : 'text-[10px] px-2.5 py-1 gap-1.5';

  const variantClasses = isHigh
    ? 'bg-[var(--accent-100)] text-[var(--accent-700)] dark:bg-[var(--accent-900)]/30 dark:text-[var(--accent-300)]'
    : isNormal
      ? 'bg-[var(--neutral-100)] text-[var(--neutral-600)] dark:bg-white/[0.06] dark:text-[var(--neutral-300)]'
      : 'bg-[var(--neutral-50)] text-[var(--neutral-500)] dark:bg-white/[0.04] dark:text-[var(--neutral-400)]';

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold uppercase tracking-wide rounded-full',
        sizeClasses,
        variantClasses,
        className,
      )}
    >
      {isHigh && <KeenIcon icon="flash" style="solid" className="size-3" />}
      {label}
    </span>
  );
}
