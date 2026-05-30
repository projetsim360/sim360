import { Link } from 'react-router-dom';
import { KeenIcon } from '@/components/keenicons';
import { Button } from '@/components/ui/button';

type Variant = 'no-simulation' | 'empty-folder' | 'no-results';
type Folder = 'inbox' | 'responded' | 'archived';

interface EmailEmptyStateProps {
  variant: Variant;
  folder?: Folder;
  onClearFilters?: () => void;
}

const FOLDER_EMPTY: Record<Folder, { icon: string; title: string; body: string }> = {
  inbox: {
    icon: 'sms',
    title: 'Boîte vide',
    body: 'Les emails arrivent au fil de la simulation. Patience !',
  },
  responded: {
    icon: 'check-circle',
    title: 'Aucun email répondu',
    body: 'Les emails auxquels vous répondez apparaîtront ici.',
  },
  archived: {
    icon: 'archive',
    title: 'Aucun email archivé',
    body: 'Les emails que vous archivez se retrouveront ici.',
  },
};

export function EmailEmptyState({
  variant,
  folder = 'inbox',
  onClearFilters,
}: EmailEmptyStateProps) {
  if (variant === 'no-simulation') {
    return (
      <div className="flex flex-col items-center justify-center text-center px-6 py-16">
        <div className="mb-4 text-[var(--neutral-300)] dark:text-white/20">
          <KeenIcon icon="rocket" style="duotone" className="size-14" />
        </div>
        <h3 className="font-display text-base font-bold text-foreground m-0 mb-1">
          Pas de simulation active
        </h3>
        <p className="text-sm text-muted-foreground m-0 mb-5 max-w-xs">
          Lancez une simulation pour recevoir des emails de vos collaborateurs.
        </p>
        <Button variant="primary" size="sm" asChild>
          <Link to="/simulations/new">
            Lancer une simulation
            <KeenIcon icon="arrow-right" style="solid" className="size-3.5 ml-1" />
          </Link>
        </Button>
      </div>
    );
  }

  if (variant === 'no-results') {
    return (
      <div className="flex flex-col items-center justify-center text-center px-6 py-16">
        <div className="mb-4 text-[var(--neutral-300)] dark:text-white/20">
          <KeenIcon icon="magnifier" style="duotone" className="size-14" />
        </div>
        <h3 className="font-display text-base font-bold text-foreground m-0 mb-1">
          Aucun résultat
        </h3>
        <p className="text-sm text-muted-foreground m-0 mb-4 max-w-xs">
          Aucun email ne correspond à votre recherche ou aux filtres actifs.
        </p>
        {onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="text-sm font-semibold text-[var(--brand-600)] hover:text-[var(--brand-700)] dark:text-[var(--brand-400)] dark:hover:text-[var(--brand-300)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-500)] rounded"
          >
            Effacer les filtres
          </button>
        )}
      </div>
    );
  }

  const { icon, title, body } = FOLDER_EMPTY[folder];
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-16">
      <div className="mb-4 text-[var(--neutral-300)] dark:text-white/20">
        <KeenIcon icon={icon} style="duotone" className="size-14" />
      </div>
      <h3 className="font-display text-base font-bold text-foreground m-0 mb-1">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground m-0 max-w-xs">{body}</p>
    </div>
  );
}
