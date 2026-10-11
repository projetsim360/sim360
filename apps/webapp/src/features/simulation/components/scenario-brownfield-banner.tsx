import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';
import type { BrownfieldContext } from '../types/simulation.types';
import { useTv } from '@/i18n/app/use-t';
import { useT } from '@/i18n/app/use-t';

const RISK_DOT: Record<string, string> = {
  CRITICAL: 'bg-[var(--error-500)]',
  HIGH: 'bg-[var(--accent-500)]',
  MEDIUM: 'bg-[var(--warning-500)]',
  LOW: 'bg-[var(--brand-300)]',
};

interface ScenarioBrownfieldBannerProps {
  ctx: BrownfieldContext;
}

export function ScenarioBrownfieldBanner({ ctx }: ScenarioBrownfieldBannerProps) {
  const tv = useTv();
  const t = useT();
  const activeRisks = ctx.knownRisks.filter((r) => r.status === 'ACTIVE').length;
  const budgetPct = Math.round(ctx.budgetUsed * 100);

  return (
    <div className="rounded-xl p-4 text-white sm:p-5" style={{ background: 'var(--brand-700)' }}>
      {/* Header */}
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-500)]">
          <KeenIcon icon="arrows-circle" style="duotone" className="text-sm text-white" />
        </span>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.8px] text-[var(--brand-200)]">
            {t('brownfield.kicker')}
          </div>
          <div className="font-display text-[14px] font-bold text-white">
            {t('brownfield.title')}
          </div>
        </div>
      </div>

      {/* Quote */}
      {ctx.previousPmNotes && (
        <p className="mb-3.5 border-l-2 border-[var(--brand-500)] pl-3 text-[13px] italic leading-relaxed text-[var(--brand-100)]">
          «&nbsp;{ctx.previousPmNotes}&nbsp;»
        </p>
      )}

      {/* KPI tiles */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <div className="rounded-lg border border-white/15 bg-white/10 p-3 text-center">
          <div className="font-display text-[18px] font-extrabold text-[var(--accent-300)]">
            {ctx.accumulatedDelays}
            <span className="text-[11px]">{t('brownfield.daysUnit')}</span>
          </div>
          <div className="text-[9px] font-bold uppercase tracking-[0.5px] text-[var(--brand-200)]">{t('brownfield.delay')}</div>
        </div>
        <div className="rounded-lg border border-white/15 bg-white/10 p-3 text-center">
          <div className="font-display text-[18px] font-extrabold text-[var(--accent-300)]">{budgetPct}%</div>
          <div className="text-[9px] font-bold uppercase tracking-[0.5px] text-[var(--brand-200)]">{t('brownfield.budget')}</div>
        </div>
        <div className="rounded-lg border border-white/15 bg-white/10 p-3 text-center">
          <div className={cn('font-display text-[18px] font-extrabold', activeRisks >= 3 ? 'text-[#FCA5A5]' : 'text-white')}>
            {activeRisks}
          </div>
          <div className="text-[9px] font-bold uppercase tracking-[0.5px] text-[var(--brand-200)]">{t('brownfield.risks')}</div>
        </div>
        <div className="rounded-lg border border-white/15 bg-white/10 p-3 text-center">
          <div className="font-display text-[16px] font-extrabold text-white">
            {tv('morale', ctx.teamMorale)}
          </div>
          <div className="text-[9px] font-bold uppercase tracking-[0.5px] text-[var(--brand-200)]">{t('brownfield.morale')}</div>
        </div>
      </div>

      {/* Risks list */}
      {ctx.knownRisks.length > 0 && (
        <div className="mt-3.5">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.8px] text-[var(--brand-200)]">
            {t('brownfield.knownRisks')}
          </div>
          <div className="flex flex-col gap-1.5">
            {ctx.knownRisks.map((risk, i) => {
              const isActive = risk.status === 'ACTIVE';
              return (
                <div
                  key={`${risk.title}-${i}`}
                  className="flex items-center gap-2.5 rounded-md border border-white/15 bg-white/10 px-2.5 py-1.5"
                >
                  <span className={cn('size-1.5 shrink-0 rounded-full', RISK_DOT[risk.severity] ?? 'bg-[var(--brand-300)]')} />
                  <span className="min-w-0 flex-1 truncate text-[12px] text-white">{risk.title}</span>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold',
                      isActive ? 'bg-white/15 text-white' : 'bg-white/10 text-[var(--brand-200)]',
                    )}
                  >
                    {isActive ? t('brownfield.active') : t('brownfield.resolved')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
