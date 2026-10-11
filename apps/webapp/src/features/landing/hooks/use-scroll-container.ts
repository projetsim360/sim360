import { useLayoutEffect, useRef, type RefObject } from 'react';
import { findScrollParent } from '@/lib/scroll-parent';

/**
 * Ref to the element that actually scrolls the page, resolved from any element inside it.
 * Hand it to framer-motion's `useScroll({ container })`: with `current` left null (window
 * scrolling) framer falls back to the window.
 */
export function useScrollContainer(probe: RefObject<HTMLElement | null>): RefObject<HTMLElement | null> {
  const container = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    const scroller = findScrollParent(probe.current);
    container.current = scroller instanceof Window ? null : scroller;
  }, [probe]);
  return container;
}
