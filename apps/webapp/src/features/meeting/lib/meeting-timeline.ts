export interface MeetingTimeline {
  elapsedMinutes: number;
  plannedMinutes: number | null;
  remainingMinutes: number | null;
  /** 0..1, capped at 1. Null when no planned duration. */
  progress: number | null;
  overtime: boolean;
  /** "05 min / 60 min" (or "05 min" without planned duration). */
  label: string;
  /** "Reste 55 min", "Dépassement de 3 min" or null. */
  remainingLabel: string | null;
}

const pad = (n: number) => String(n).padStart(2, '0');

export function computeMeetingTimeline(elapsedSeconds: number, durationMinutes?: number | null): MeetingTimeline {
  const elapsedMinutes = Math.max(0, Math.floor(elapsedSeconds / 60));
  const planned = durationMinutes && durationMinutes > 0 ? durationMinutes : null;

  if (planned === null) {
    return {
      elapsedMinutes,
      plannedMinutes: null,
      remainingMinutes: null,
      progress: null,
      overtime: false,
      label: `${pad(elapsedMinutes)} min`,
      remainingLabel: null,
    };
  }

  const remaining = planned - elapsedMinutes;
  const overtime = elapsedSeconds > planned * 60;
  return {
    elapsedMinutes,
    plannedMinutes: planned,
    remainingMinutes: Math.max(0, remaining),
    progress: Math.min(1, Math.max(0, elapsedSeconds / (planned * 60))),
    overtime,
    label: `${pad(elapsedMinutes)} min / ${planned} min`,
    remainingLabel: overtime
      ? `Dépassement de ${Math.max(1, elapsedMinutes - planned)} min`
      : `Reste ${Math.max(0, remaining)} min`,
  };
}
