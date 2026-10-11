/**
 * Nearest ancestor that scrolls vertically, or the window.
 * In this app `html` and `body` are `h-full`, so pages scroll inside an inner element,
 * not the window: `window.scrollY` stays 0 and scroll-driven UI must watch the real scroller.
 */
export function findScrollParent(start: HTMLElement | null | undefined): HTMLElement | Window {
  if (typeof window === 'undefined') return globalThis as unknown as Window;
  for (let el = start ?? null; el && el !== document.body; el = el.parentElement) {
    const { overflowY } = getComputedStyle(el);
    if (overflowY === 'auto' || overflowY === 'scroll') return el;
  }
  return window;
}
