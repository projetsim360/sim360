import { KeenIcon } from '@/components/keenicons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmailFilterPopover, type EmailFilterState } from './email-filter-popover';

export type SortKey = 'date-desc' | 'date-asc' | 'priority';

const SORT_LABELS: Record<SortKey, string> = {
  'date-desc': 'Date (récent → ancien)',
  'date-asc': 'Date (ancien → récent)',
  priority: 'Priorité (haute → basse)',
};

interface EmailToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
  filters: EmailFilterState;
  showScoreFilter: boolean;
  onFiltersApply: (filters: EmailFilterState) => void;
  onFiltersReset: () => void;
}

export function EmailToolbar({
  search,
  onSearchChange,
  sort,
  onSortChange,
  filters,
  showScoreFilter,
  onFiltersApply,
  onFiltersReset,
}: EmailToolbarProps) {
  return (
    <div className="flex items-center gap-2 py-3">
      <div className="relative flex-1 max-w-md">
        <KeenIcon
          icon="magnifier"
          style="duotone"
          className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher par sujet ou expéditeur..."
          className="pl-9"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Effacer la recherche"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-500)]"
          >
            <KeenIcon icon="cross" style="solid" className="size-3.5" />
          </button>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
            <KeenIcon icon="arrow-up-down" style="duotone" className="size-3.5" />
            <span className="hidden sm:inline">
              {sort === 'priority' ? 'Priorité' : 'Date'}
            </span>
            <KeenIcon icon="down" style="solid" className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
            <DropdownMenuItem key={key} onClick={() => onSortChange(key)}>
              {SORT_LABELS[key]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <EmailFilterPopover
        filters={filters}
        showScoreFilter={showScoreFilter}
        onApply={onFiltersApply}
        onReset={onFiltersReset}
      />
    </div>
  );
}
