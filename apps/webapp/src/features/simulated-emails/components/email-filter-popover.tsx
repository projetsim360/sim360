import { useState } from 'react';
import { KeenIcon } from '@/components/keenicons';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useT } from '@/i18n/app/use-t';

// Note: URGENT priority is visually collapsed into HIGH ("HAUTE") throughout the UI.
// The parent's filter logic should include URGENT when HIGH is selected.
export type PriorityBucket = 'HIGH' | 'NORMAL' | 'LOW';
export type PeriodBucket = 'today' | 'last7' | 'last30';

export interface EmailFilterState {
  priorities: PriorityBucket[];
  period: PeriodBucket | null;
  scoreMin70: boolean;
}

interface EmailFilterPopoverProps {
  filters: EmailFilterState;
  showScoreFilter: boolean;
  onApply: (filters: EmailFilterState) => void;
  onReset: () => void;
}

export function EmailFilterPopover({
  filters,
  showScoreFilter,
  onApply,
  onReset,
}: EmailFilterPopoverProps) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<EmailFilterState>(filters);

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
          {t('emails.filter')}
          {appliedCount > 0 && (
            <span className="ml-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--brand-500)] text-white text-[10px] font-bold">
              {appliedCount}
            </span>
          )}
          <KeenIcon icon="down" style="solid" className="size-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" aria-labelledby="email-filter-popover-title" className="w-72 p-4">
        <div id="email-filter-popover-title" className="font-display text-sm font-bold text-foreground mb-3">
          {t('emails.filters')}
        </div>

        <div className="mb-4">
          <Label className="text-[10px] font-bold uppercase tracking-[1.2px] text-muted-foreground mb-2 block">
            {t('emails.priority')}
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
              {t('emails.priority.high')}
            </ToggleGroupItem>
            <ToggleGroupItem value="NORMAL" size="sm" className="rounded-full">
              {t('emails.priority.normal')}
            </ToggleGroupItem>
            <ToggleGroupItem value="LOW" size="sm" className="rounded-full">
              {t('emails.priority.low')}
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="mb-4">
          <Label className="text-[10px] font-bold uppercase tracking-[1.2px] text-muted-foreground mb-2 block">
            {t('emails.period')}
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
              {t('emails.period.today')}
            </ToggleGroupItem>
            <ToggleGroupItem value="last7" size="sm" className="rounded-full">
              {t('emails.period.7')}
            </ToggleGroupItem>
            <ToggleGroupItem value="last30" size="sm" className="rounded-full">
              {t('emails.period.30')}
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {showScoreFilter && (
          <div className="mb-4 flex items-center justify-between">
            <Label
              htmlFor="filter-score-min"
              className="text-sm text-foreground cursor-pointer"
            >
              {t('emails.scoreMin')}
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              handleResetDraft();
              onReset();
            }}
          >
            {t('meetings.reset')}
          </Button>
          <Button variant="primary" size="sm" onClick={handleApply}>
            {t('emails.apply')}{activeCount > 0 && ` (${activeCount})`}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
