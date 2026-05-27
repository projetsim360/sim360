import { DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';
import { ScenarioPhaseStrip } from './scenario-phase-strip';
import { ScenarioBrownfieldBanner } from './scenario-brownfield-banner';
import type { Scenario } from '../types/simulation.types';

const DIFFICULTY_LABELS: Record<string, string> = {
  BEGINNER: 'Débutant',
  INTERMEDIATE: 'Intermédiaire',
  ADVANCED: 'Avancé',
  EXPERT: 'Expert',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  BEGINNER: 'bg-[var(--success-50)] text-[var(--success-700)]',
  INTERMEDIATE: 'bg-[var(--warning-50)] text-[var(--warning-700)]',
  ADVANCED: 'bg-[var(--error-50)] text-[var(--error-700)]',
  EXPERT: 'bg-[var(--error-50)] text-[var(--error-700)]',
};

const SCENARIO_TYPE_CONFIG: Record<string, { label: string; className: string }> = {
  GREENFIELD: { label: 'Nouveau projet', className: 'bg-[var(--brand-50)] text-[var(--brand-700)]' },
  BROWNFIELD: { label: 'Reprise en cours', className: 'bg-[var(--warning-50)] text-[var(--warning-700)]' },
};

interface StatTileProps {
  label: string;
  value: string;
  suffix?: string;
}

function StatTile({ label, value, suffix }: StatTileProps) {
  return (
    <div className="rounded-lg border border-border bg-white p-3">
      <div className="text-[10px] font-bold uppercase tracking-[0.5px] text-[var(--neutral-400)]">{label}</div>
      <div className="mt-1 font-display text-[18px] font-extrabold text-[var(--brand-700)]">
        {value}
        {suffix && <span className="text-[11px] text-[var(--neutral-300)]">{suffix}</span>}
      </div>
    </div>
  );
}

interface ScenarioDialogContentProps {
  scenario: Scenario;
  isGenerated: boolean;
  creating: boolean;
  onLaunch: () => void;
  onClose: () => void;
}

export function ScenarioDialogContent({
  scenario,
  isGenerated,
  creating,
  onLaunch,
  onClose,
}: ScenarioDialogContentProps) {
  const typeCfg = SCENARIO_TYPE_CONFIG[scenario.scenarioType];

  return (
    <>
      {/* Hero */}
      <div
        className="shrink-0 border-b border-border px-6 pb-4 pt-6"
        style={{ background: 'linear-gradient(135deg, var(--brand-50), #fff)' }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', DIFFICULTY_COLORS[scenario.difficulty])}>
            {DIFFICULTY_LABELS[scenario.difficulty] ?? scenario.difficulty}
          </span>
          {typeCfg && (
            <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', typeCfg.className)}>
              {typeCfg.label}
            </span>
          )}
          {isGenerated && (
            <span className="rounded-full bg-[var(--brand-100)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--brand-700)]">
              Généré par l'IA
            </span>
          )}
        </div>
        <DialogTitle className="mt-2.5 font-display text-lg font-extrabold leading-snug text-[var(--brand-700)]">
          {scenario.title}
        </DialogTitle>
        {scenario.description && (
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--neutral-500)]">{scenario.description}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-2.5 py-1 text-xs text-[var(--neutral-500)]">
            <KeenIcon icon="folder" style="duotone" className="text-[10px] leading-none" />
            {scenario.sector}
          </span>
          {scenario._count?.simulations !== undefined && scenario._count.simulations > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-2.5 py-1 text-xs text-[var(--neutral-500)]">
              <KeenIcon icon="people" style="duotone" className="text-[10px] leading-none" />
              {scenario._count.simulations} simulation{scenario._count.simulations > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="shrink-0 border-b border-border px-6 py-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatTile label="Phases" value={String(scenario.phases.length)} />
          <StatTile label="Durée" value={String(scenario.estimatedDurationHours)} suffix="h" />
          <StatTile label="Objectifs" value={String(scenario.objectives.length)} />
          <StatTile label="Compétences" value={String(scenario.competencies.length)} />
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-5 p-6">
          {/* Objectives + Competencies */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {scenario.objectives.length > 0 && (
              <div>
                <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.8px] text-[var(--neutral-400)]">
                  Objectifs du scénario
                </div>
                <div className="space-y-2">
                  {scenario.objectives.map((obj, i) => (
                    <div key={i} className="flex items-start gap-2.5 rounded-lg bg-[var(--brand-50)] p-2.5">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent-100)] text-[11px] font-bold text-[var(--accent-700)]">
                        {i + 1}
                      </span>
                      <span className="text-[13px] leading-snug text-[var(--brand-700)]">{obj}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-5">
              {scenario.competencies.length > 0 && (
                <div>
                  <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.8px] text-[var(--neutral-400)]">
                    Compétences travaillées
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {scenario.competencies.map((comp, i) => (
                      <span
                        key={i}
                        className="rounded-full border border-[var(--brand-100)] bg-[var(--brand-50)] px-3 py-1 text-xs font-semibold text-[var(--brand-700)]"
                      >
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {isGenerated && (
                <div className="rounded-lg border border-[var(--brand-100)] bg-[var(--brand-50)] p-3">
                  <p className="text-xs leading-relaxed text-[var(--brand-700)]">
                    Ce scénario a été généré par l'IA et adapté à votre profil. Vous pouvez le lancer directement.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Phase strip */}
          {scenario.phases.length > 0 && (
            <ScenarioPhaseStrip
              phases={scenario.phases}
              scenarioType={scenario.scenarioType}
              startingPhaseOrder={scenario.startingPhaseOrder}
            />
          )}

          {/* Brownfield banner */}
          {scenario.scenarioType === 'BROWNFIELD' && scenario.brownfieldContext && (
            <ScenarioBrownfieldBanner ctx={scenario.brownfieldContext} />
          )}
        </div>
      </div>

      {/* Sticky footer */}
      <div className="flex shrink-0 items-center justify-between border-t border-border bg-[var(--neutral-50)] px-6 py-4">
        <Button variant="outline" size="md" onClick={onClose}>
          Annuler
        </Button>
        <Button variant="primary" size="md" onClick={onLaunch} disabled={creating}>
          {creating ? 'Lancement…' : 'Lancer la simulation'}
        </Button>
      </div>
    </>
  );
}
