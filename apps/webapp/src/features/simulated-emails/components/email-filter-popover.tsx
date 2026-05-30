import { useState } from 'react';
import { KeenIcon } from '@/components/keenicons';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export type PriorityBucket = 'HIGH' | 'NORMAL' | 'LOW';
export type PeriodBucket = 'today' | 'last7' | 'last30';

export interface EmailFilters {
  priorities: PriorityBucket[];
  period: PeriodBucket | null;
  scoreMin70: boolean;
}

interface EmailFilterPopoverProps {
  filters: EmailFilters;
  showScoreFilter: boolean;
  onApply: (filters: EmailFilters) => void;
  onReset: () => void;
}

export function EmailFilterPopover({
  filters,
  showScoreFilter,
  onApply,
  onReset,
}: EmailFilterPopoverProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<EmailFilters>(filters);

  const activeCount =
    draft.priorities.length +
    (draft.period ? 1 : 0) +
    (draft.scoreMin70 ? 1 : 0);

  function handleOpenChange(next: boolean) {
    if (next) setDraft(filters);
    setOpen(next);
  }

  function handleApply() {
    onApply(draft);
    setOpen(false);
  }

  function handleResetDraft() {
    setDraft({ priorities: [], period: null, scoreMin70: false });
  }

  const appliedCount =
    filters.priorities.length +
    (filters.period ? 1 : 0) +
    (filters.scoreMin70 ? 1 : 0);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <KeenIcon icon="filter" style="duotone" className="size-3.5" />
          Filtrer
          {appliedCount > 0 && (
            <span className="ml-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--brand-500)] text-white text-[10px] font-bold">
              {appliedCount}
            </span>
          )}
          <KeenIcon icon="down" style="solid" className="size-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-4">
        <div className="font-display text-sm font-bold text-foreground mb-3">
          Filtres
        </div>

        <div className="mb-4">
          <Label className="text-[10px] font-bold uppercase tracking-[1.2px] text-muted-foreground mb-2 block">
            Priorité
          </Label>
          <ToggleGroup
            type="multiple"
            value={draft.priorities}
            onValueChange={(value) =>
              setDraft((d) => ({ ...d, priorities: value as PriorityBucket[] }))
            }
            className="flex-wrap gap-1.5 justify-start"
          >
            <ToggleGroupItem value="HIGH" size="sm" className="rounded-full">
              HAUTE
            </ToggleGroupItem>
            <ToggleGroupItem value="NORMAL" size="sm" className="rounded-full">
              NORMALE
            </ToggleGroupItem>
            <ToggleGroupItem value="LOW" size="sm" className="rounded-full">
              BASSE
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="mb-4">
          <Label className="text-[10px] font-bold uppercase tracking-[1.2px] text-muted-foreground mb-2 block">
            Période
          </Label>
          <ToggleGroup
            type="single"
            value={draft.period ?? ''}
            onValueChange={(value) =>
              setDraft((d) => ({
                ...d,
                period: value ? (value as PeriodBucket) : null,
              }))
            }
            className="flex-wrap gap-1.5 justify-start"
          >
            <ToggleGroupItem value="today" size="sm" className="rounded-full">
              Aujourd'hui
            </ToggleGroupItem>
            <ToggleGroupItem value="last7" size="sm" className="rounded-full">
              7 jours
            </ToggleGroupItem>
            <ToggleGroupItem value="last30" size="sm" className="rounded-full">
              30 jours
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {showScoreFilter && (
          <div className="mb-4 flex items-center justify-between">
            <Label
              htmlFor="filter-score-min"
              className="text-sm text-foreground cursor-pointer"
            >
              Score IA ≥ 70
            </Label>
            <Switch
              id="filter-score-min"
              checked={draft.scoreMin70}
              onCheckedChange={(v) =>
                setDraft((d) => ({ ...d, scoreMin70: v }))
              }
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-[var(--neutral-100)] dark:border-white/[0.06]">
          <button
            type="button"
            onClick={() => {
              handleResetDraft();
              onReset();
            }}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Réinitialiser
          </button>
          <Button variant="primary" size="sm" onClick={handleApply}>
            Appliquer{activeCount > 0 && ` (${activeCount})`}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
