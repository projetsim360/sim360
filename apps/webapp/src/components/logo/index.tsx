import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  /** Pass `true` on dark surfaces (e.g. brand sidebar) where the "Simex" word must be white. */
  onDark?: boolean;
}

export function Logo({ className, onDark = false }: LogoProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 font-display font-extrabold leading-none tracking-[-0.01em] select-none',
        'text-[22px]',
        className,
      )}
      aria-label="Simex pro"
    >
      <span className={onDark ? 'text-white' : 'text-foreground'}>Simex</span>
      <span className="size-2 rounded-full bg-primary" aria-hidden />
      <span className="text-primary">pro</span>
    </div>
  );
}
