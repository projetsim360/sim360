import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import type { IconType, KeeniconsStyle } from './types';

/**
 * Map Tailwind `size-*` classes (width/height for SVGs) to `text-*`
 * equivalents (font-size for icon fonts).
 */
const sizeToText: Record<string, string> = {
  'size-2': 'text-[0.5rem]',
  'size-2.5': 'text-[0.625rem]',
  'size-3': 'text-xs',
  'size-3.5': 'text-sm',
  'size-4': 'text-base',
  'size-4.5': 'text-lg',
  'size-5': 'text-xl',
  'size-6': 'text-2xl',
  'size-7': 'text-[1.75rem]',
  'size-8': 'text-[2rem]',
  'size-9': 'text-[2.25rem]',
  'size-10': 'text-[2.5rem]',
};

function mapSizeClasses(className: string | undefined): string | undefined {
  if (!className) return undefined;

  return className
    .split(/\s+/)
    .map((cls) => sizeToText[cls] ?? cls)
    .join(' ');
}

export function keenIcon(
  name: string,
  style: KeeniconsStyle = 'filled',
): IconType {
  const Component = forwardRef<HTMLElement, { className?: string }>(
    ({ className, ...props }, ref) => (
      <i
        ref={ref as React.Ref<HTMLElement>}
        className={cn(`ki-${style} ki-${name}`, mapSizeClasses(className))}
        {...props}
      />
    ),
  );
  Component.displayName = `KeenIcon(${name})`;
  return Component as unknown as IconType;
}
