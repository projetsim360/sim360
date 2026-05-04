import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AuthCardProps {
  /** Main heading — h1 Montserrat 800. Use sentence case French. */
  title: string;
  /** Optional subtitle below the title. */
  subtitle?: ReactNode;
  /** Optional content above the form (e.g., social login button + divider) */
  topSlot?: ReactNode;
  /** Optional content below the form (e.g., "Already have an account?") */
  bottomSlot?: ReactNode;
  /** Form fields */
  children: ReactNode;
  className?: string;
}

export function AuthCard({
  title,
  subtitle,
  topSlot,
  bottomSlot,
  children,
  className,
}: AuthCardProps) {
  return (
    <div
      className={cn(
        'relative w-full rounded-2xl bg-card',
        'p-8 sm:p-10 lg:p-12',
        className,
      )}
    >
      <div className="flex flex-col gap-8">
        {/* Header */}
        <header className="flex flex-col gap-2">
          <h1 className="font-display font-extrabold text-[32px] leading-[1.15] tracking-[-0.015em] text-[var(--brand-700)] dark:text-[var(--neutral-50)] text-balance">
            {title}
          </h1>
          {subtitle ? (
            <p className="font-body text-[14px] text-[var(--muted-foreground)] leading-relaxed">
              {subtitle}
            </p>
          ) : null}
        </header>

        {/* Top slot (e.g., social login) */}
        {topSlot ? (
          <div className="flex flex-col gap-6">
            {topSlot}
            <Divider label="ou" />
          </div>
        ) : null}

        {/* Form content */}
        <div className="flex flex-col gap-5">{children}</div>

        {/* Bottom slot (e.g., links) */}
        {bottomSlot ? (
          <div className="text-[14px] text-[var(--muted-foreground)] text-center pt-2">
            {bottomSlot}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 text-[12px] text-[var(--muted-foreground)] font-medium uppercase tracking-wider">
      <span className="h-px flex-1 bg-[var(--border)]" />
      {label}
      <span className="h-px flex-1 bg-[var(--border)]" />
    </div>
  );
}
