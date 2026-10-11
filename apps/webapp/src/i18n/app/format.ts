/** Locale-aware formatting helpers for the app (pure, unit-testable). */
export type IntlTag = 'fr-CA' | 'en-CA';

const DAY = 24 * 60 * 60 * 1000;

/**
 * "today", "yesterday", "3 days ago", "2 weeks ago", then a short date after a month.
 * Uses Intl.RelativeTimeFormat so both languages read naturally.
 */
export function relativeDate(iso: string, locale: IntlTag, now: number = Date.now()): string {
  const days = Math.floor((now - new Date(iso).getTime()) / DAY);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style: 'short' });
  if (days < 7) return capitalize(rtf.format(-days, 'day'));
  if (days < 30) return capitalize(rtf.format(-Math.floor(days / 7), 'week'));
  return new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'short' });
}

function capitalize(s: string): string {
  return s.charAt(0).toLocaleUpperCase() + s.slice(1);
}

/** Today/yesterday with the time ("Today · 14:05"), then relative days, then a short date. */
export function relativeDateTime(iso: string, locale: IntlTag, now: number = Date.now()): string {
  const d = new Date(iso);
  const days = Math.floor((now - d.getTime()) / DAY);
  if (days <= 1) {
    const time = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    return `${relativeDate(iso, locale, now)} · ${time}`;
  }
  return relativeDate(iso, locale, now);
}
