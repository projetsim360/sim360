import { useShellState } from '@/components/layouts/simex-shell/state/shell-state-provider';
import { KeenIcon } from '@/components/keenicons';

export function CockpitPmoBanner() {
  const { setPmoOpen } = useShellState();

  return (
    <button
      type="button"
      onClick={() => setPmoOpen(true)}
      className="flex w-full items-center justify-between gap-4 rounded-xl p-4 text-left text-white transition-transform hover:-translate-y-0.5 motion-reduce:transform-none"
      style={{ background: 'var(--brand-700)' }}
    >
      <div className="flex items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-500)]">
          <KeenIcon icon="abstract-26" style="duotone" className="text-base text-white" />
        </span>
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[1px] text-[var(--brand-200)]">
            Agent PMO
          </span>
          <p className="text-[13px] font-semibold text-white">
            Votre coach vous accompagne à chaque décision de cette simulation.
          </p>
        </div>
      </div>
      <span className="shrink-0 text-[13px] font-semibold text-[var(--accent-300)]">Ouvrir le coach →</span>
    </button>
  );
}
