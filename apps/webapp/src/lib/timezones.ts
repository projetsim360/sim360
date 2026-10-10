/** Default for the Québec audience the platform targets. */
export const DEFAULT_TIMEZONE = 'America/Toronto';

/** Legacy slugs stored before IANA identifiers were used. */
export const LEGACY_TIMEZONE_MAP: Record<string, string> = {
  europe_paris: 'Europe/Paris',
  europe_london: 'Europe/London',
  america_new_york: 'America/New_York',
  america_los_angeles: 'America/Los_Angeles',
};

/** Shown first in the picker. */
export const PREFERRED_TIMEZONES = [
  'America/Toronto',
  'America/Montreal',
  'America/Halifax',
  'America/Winnipeg',
  'America/Edmonton',
  'America/Vancouver',
  'America/St_Johns',
  'Europe/Paris',
];

const FALLBACK_TIMEZONES = [
  ...PREFERRED_TIMEZONES,
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Mexico_City',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Brussels',
  'Europe/Zurich',
  'Europe/Berlin',
  'Africa/Casablanca',
  'Africa/Algiers',
  'Africa/Tunis',
  'Africa/Abidjan',
  'Africa/Dakar',
  'Africa/Douala',
  'Africa/Kinshasa',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Australia/Sydney',
  'Pacific/Auckland',
];

export function isValidTimezone(tz: string | null | undefined): tz is string {
  if (!tz) return false;
  try {
    new Intl.DateTimeFormat('fr-CA', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** Converts a stored value (legacy slug, IANA id or empty) into a valid IANA id. */
export function normalizeTimezone(value: string | null | undefined, fallback: string = DEFAULT_TIMEZONE): string {
  if (value && LEGACY_TIMEZONE_MAP[value]) return LEGACY_TIMEZONE_MAP[value];
  if (isValidTimezone(value)) return value;
  return fallback;
}

/** Browser time zone, or the default when unavailable. */
export function getBrowserTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return isValidTimezone(tz) ? tz : DEFAULT_TIMEZONE;
  } catch {
    return DEFAULT_TIMEZONE;
  }
}

/** Full IANA list (preferred zones first), from the runtime when supported. */
export function listTimezones(): string[] {
  let all: string[] = [];
  try {
    const intl = Intl as unknown as { supportedValuesOf?: (key: string) => string[] };
    all = intl.supportedValuesOf?.('timeZone') ?? [];
  } catch {
    all = [];
  }
  if (all.length === 0) all = FALLBACK_TIMEZONES;
  const rest = all.filter((tz) => !PREFERRED_TIMEZONES.includes(tz));
  return [...PREFERRED_TIMEZONES.filter(isValidTimezone), ...rest];
}

/** "UTC−04:00", computed for `date` so daylight saving time is taken into account. */
export function formatUtcOffset(tz: string, date: Date = new Date()): string {
  try {
    const part = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'longOffset' })
      .formatToParts(date)
      .find((p) => p.type === 'timeZoneName')?.value;
    if (!part || part === 'GMT') return 'UTC+00:00';
    return part.replace('GMT', 'UTC').replace('-', '−');
  } catch {
    return '';
  }
}

/** "America/Toronto — heure de l'Est (UTC−04:00)" */
export function formatTimezoneLabel(tz: string, date: Date = new Date()): string {
  let name = '';
  try {
    name =
      new Intl.DateTimeFormat('fr-CA', { timeZone: tz, timeZoneName: 'longGeneric' })
        .formatToParts(date)
        .find((p) => p.type === 'timeZoneName')?.value ?? '';
  } catch {
    name = '';
  }
  const offset = formatUtcOffset(tz, date);
  return [tz, name && name !== tz ? `— ${name}` : '', offset ? `(${offset})` : ''].filter(Boolean).join(' ');
}
