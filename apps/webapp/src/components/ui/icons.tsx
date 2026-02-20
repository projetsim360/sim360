/**
 * Inline SVG icons for shadcn/radix UI primitives.
 * These need pixel-perfect SVG rendering (not font icons) for indicators,
 * chevrons, close buttons, and other structural UI elements.
 */

import { type ComponentType } from 'react';

type IconProps = { className?: string };
type Icon = ComponentType<IconProps>;

const svg = (d: string, opts?: { fill?: boolean; strokeWidth?: number }): Icon => {
  const Comp = ({ className }: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill={opts?.fill ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={opts?.strokeWidth ?? 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={d} />
    </svg>
  );
  return Comp;
};

// Check / Validation
export const Check = svg('M20 6 9 17l-5-5');
export const CheckIcon = Check;

// X / Close
export const X = svg('M18 6 6 18M6 6l12 12');

// Chevrons
export const ChevronDown = svg('m6 9 6 6 6-6');
export const ChevronDownIcon = ChevronDown;
export const ChevronUp = svg('m18 15-6-6-6 6');
export const ChevronLeft = svg('m15 18-6-6 6-6');
export const ChevronLeftIcon = ChevronLeft;
export const ChevronRight = svg('m9 18 6-6-6-6');
export const ChevronRightIcon = ChevronRight;

// Arrows
export const ArrowLeft = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
  </svg>
);

export const ArrowRight = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
  </svg>
);

// Circle (radio indicator)
export const Circle = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <circle cx="12" cy="12" r="6" />
  </svg>
);
export const CircleIcon = Circle;

// Plus / Minus
export const Plus = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14" /><path d="M12 5v14" />
  </svg>
);

export const CirclePlus = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" />
  </svg>
);

export const MinusIcon = svg('M5 12h14');

// Misc UI
export const Copy = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

export const MoreHorizontal = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
  </svg>
);

export const Search = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
  </svg>
);

export const Star = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export const GripVertical = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="9" cy="12" r="1" /><circle cx="9" cy="5" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="19" r="1" />
  </svg>
);

export const GripHorizontal = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="9" r="1" /><circle cx="19" cy="9" r="1" /><circle cx="5" cy="9" r="1" /><circle cx="12" cy="15" r="1" /><circle cx="19" cy="15" r="1" /><circle cx="5" cy="15" r="1" />
  </svg>
);

export const SquareMinus = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="18" height="18" x="3" y="3" rx="2" /><path d="M8 12h8" />
  </svg>
);

export const SquarePlus = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="18" height="18" x="3" y="3" rx="2" /><path d="M8 12h8" /><path d="M12 8v8" />
  </svg>
);
