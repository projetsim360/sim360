import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BrowserFrameProps {
  /** Fake address shown in the URL bar. */
  url: string;
  children: ReactNode;
  className?: string;
  /** Tailwind aspect class for the whole frame. */
  aspect?: string;
}

/** Dark browser chrome (traffic lights + URL bar) around an illustrative screen. */
export function BrowserFrame({ url, children, className, aspect = 'aspect-[4/3]' }: BrowserFrameProps) {
  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[var(--brand-900)] shadow-2xl flex flex-col',
        aspect,
        className,
      )}
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-white/10 px-4 py-3">
        <span className="size-3 rounded-full bg-[#ff5f56]" />
        <span className="size-3 rounded-full bg-[#ffbd2e]" />
        <span className="size-3 rounded-full bg-[#27c93f]" />
        <span className="ml-4 flex-1 rounded bg-white/10 px-3 py-0.5 text-center text-[10px] text-white/60">{url}</span>
      </div>
      <div className="relative flex-1 min-h-0">{children}</div>
    </div>
  );
}
