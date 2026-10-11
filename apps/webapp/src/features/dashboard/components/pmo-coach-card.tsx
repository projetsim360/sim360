import { useShellState } from '@/components/layouts/simex-shell/state/shell-state-provider';
import { KeenIcon } from '@/components/keenicons';
import { useT } from '@/i18n/app/use-t';

export function PmoCoachCard() {
  const { setPmoOpen } = useShellState();
  const t = useT();

  return (
    <button
      type="button"
      onClick={() => setPmoOpen(true)}
      className="block w-full rounded-xl p-4 text-left text-white transition-transform hover:-translate-y-0.5 motion-reduce:transform-none"
      style={{ background: 'var(--brand-700)' }}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-full bg-[var(--accent-500)]">
          <KeenIcon icon="abstract-26" style="duotone" className="text-sm text-white" />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[1px] text-[var(--brand-200)]">
          {t('shell.pmo.tab.chat')}
        </span>
      </div>
      <h4 className="font-display text-[15px] font-bold text-white">{t('dashboard.coach.title')}</h4>
      <p className="mt-1 text-[13px] leading-relaxed text-[var(--brand-100)]">
        {t('dashboard.coach.text')}
      </p>
      <span className="mt-2.5 inline-block text-[13px] font-semibold text-[var(--accent-300)]">
        {t('dashboard.coach.cta')}
      </span>
    </button>
  );
}
