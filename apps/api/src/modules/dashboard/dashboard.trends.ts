export interface KpiTrend {
  series: number[];
  delta: number | null;
}

export interface DashboardTrends {
  activeSimulations: KpiTrend;
  averageScore: KpiTrend;
  completedSimulations: KpiTrend;
  pendingActions: KpiTrend;
}

interface TrendInput {
  now: Date;
  sims: { createdAt: Date; completedAt: Date | null }[];
  completedScores: { completedAt: Date; score: number }[];
  pendingTotal: number;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const POINTS = 6;

/** End-of-week boundaries, oldest first, ending at `now`. */
function weekBoundaries(now: Date): number[] {
  const end = now.getTime();
  const boundaries: number[] = [];
  for (let i = POINTS - 1; i >= 0; i--) {
    boundaries.push(end - i * WEEK_MS);
  }
  return boundaries;
}

export function buildKpiTrends(input: TrendInput): DashboardTrends {
  // `pendingTotal` is accepted for API symmetry but pending history is not
  // reliably reconstructable, so it does not feed a series (see return).
  const { now, sims, completedScores } = input;
  const boundaries = weekBoundaries(now);

  // Active at each boundary: created on/before boundary and not yet completed by then.
  const activeSeries = boundaries.map(
    (b) =>
      sims.filter(
        (s) => s.createdAt.getTime() <= b && (s.completedAt === null || s.completedAt.getTime() > b),
      ).length,
  );

  // Cumulative completed at each boundary.
  const completedSeries = boundaries.map(
    (b) => sims.filter((s) => s.completedAt !== null && s.completedAt.getTime() <= b).length,
  );

  // Running average score of completions up to each boundary.
  const scoreSeries = boundaries.map((b) => {
    const upTo = completedScores.filter((c) => c.completedAt.getTime() <= b);
    if (upTo.length === 0) return 0;
    return Math.round((upTo.reduce((sum, c) => sum + c.score, 0) / upTo.length) * 10) / 10;
  });

  const oneWeekAgo = now.getTime() - WEEK_MS;
  const thirtyDaysAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;

  const activeNow = activeSeries[POINTS - 1];
  const activeWeekAgo = sims.filter(
    (s) => s.createdAt.getTime() <= oneWeekAgo && (s.completedAt === null || s.completedAt.getTime() > oneWeekAgo),
  ).length;

  const completedLast7d = sims.filter(
    (s) => s.completedAt !== null && s.completedAt.getTime() > oneWeekAgo,
  ).length;

  let scoreDelta: number | null = null;
  if (completedScores.length >= 2) {
    const current = scoreSeries[POINTS - 1];
    const past = completedScores.filter((c) => c.completedAt.getTime() <= thirtyDaysAgo);
    if (past.length > 0) {
      const pastAvg = Math.round((past.reduce((s, c) => s + c.score, 0) / past.length) * 10) / 10;
      scoreDelta = Math.round((current - pastAvg) * 10) / 10;
    }
  }

  return {
    activeSimulations: { series: activeSeries, delta: activeNow - activeWeekAgo },
    averageScore: { series: scoreSeries, delta: scoreDelta },
    completedSimulations: { series: completedSeries, delta: completedLast7d },
    // Pending history is not reliably reconstructable — honest empty contract.
    pendingActions: { series: [], delta: null },
  };
}
