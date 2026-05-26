import { buildKpiTrends } from './dashboard.trends';

const WEEK = 7 * 24 * 60 * 60 * 1000;

describe('buildKpiTrends', () => {
  const now = new Date('2026-05-26T12:00:00.000Z');

  it('produces 6-point series for active and completed simulations', () => {
    const sims = [
      { createdAt: new Date(now.getTime() - 5 * WEEK), completedAt: null },
      { createdAt: new Date(now.getTime() - 4 * WEEK), completedAt: new Date(now.getTime() - 1 * WEEK) },
      { createdAt: new Date(now.getTime() - 1 * WEEK), completedAt: null },
    ];
    const result = buildKpiTrends({ now, sims, completedScores: [], pendingTotal: 0 });

    expect(result.activeSimulations.series).toHaveLength(6);
    expect(result.completedSimulations.series).toHaveLength(6);
    expect(result.activeSimulations.series[5]).toBe(2);
    expect(result.completedSimulations.series[5]).toBe(1);
  });

  it('computes averageScore delta as null when fewer than 2 completions', () => {
    const result = buildKpiTrends({
      now,
      sims: [],
      completedScores: [{ completedAt: new Date(now.getTime() - 1 * WEEK), score: 80 }],
      pendingTotal: 3,
    });
    expect(result.averageScore.delta).toBeNull();
  });

  it('returns empty series and null delta for pending actions', () => {
    const result = buildKpiTrends({ now, sims: [], completedScores: [], pendingTotal: 5 });
    expect(result.pendingActions.series).toEqual([]);
    expect(result.pendingActions.delta).toBeNull();
  });

  it('computes completed delta as completions in the last 7 days', () => {
    const sims = [
      { createdAt: new Date(now.getTime() - 3 * WEEK), completedAt: new Date(now.getTime() - 2 * WEEK) },
      { createdAt: new Date(now.getTime() - 2 * WEEK), completedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) },
    ];
    const result = buildKpiTrends({ now, sims, completedScores: [], pendingTotal: 0 });
    expect(result.completedSimulations.delta).toBe(1);
  });
});
