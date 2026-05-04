import { useEffect, useRef } from 'react';
import { Search, LayoutDashboard, MonitorPlay, FileText, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useShellState } from '../state/shell-state-provider';

interface SearchModalProps {
  className?: string;
}

export function SearchModal({ className }: SearchModalProps) {
  const { searchOpen, closeSearch } = useShellState();
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input when the modal opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  if (!searchOpen) return null;

  return (
    // Backdrop — click on it (not on card) to close
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Recherche"
      className={cn(className)}
      onClick={closeSearch}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
        background: 'rgba(15,26,46,0.18)',
        backdropFilter: 'blur(6px) saturate(120%)',
        WebkitBackdropFilter: 'blur(6px) saturate(120%)',
      }}
    >
      {/* Card — stop propagation so clicks inside don't close */}
      <div
        className="w-[min(640px,92vw)] overflow-hidden rounded-lg border border-border bg-card"
        style={{ boxShadow: 'var(--elevation-xl)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input row */}
        <div className="flex items-center gap-2.5 border-b border-border px-[18px] py-3.5">
          <Search className="size-[18px] shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            autoComplete="off"
            placeholder="Rechercher pages, livrables, candidats…"
            className="flex-1 border-0 bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground outline-none"
          />
          <span className="text-[11px] font-semibold text-muted-foreground border border-border rounded-xs px-[7px] py-[3px]">
            Échap
          </span>
        </div>

        {/* Pages section */}
        <div className="p-2">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-[1.2px] text-muted-foreground">
            Pages
          </div>

          <div
            className="flex cursor-pointer items-center gap-3 rounded-sm bg-[var(--accent-50)] px-3 py-2.5 text-sm text-[var(--accent-700)]"
            onClick={closeSearch}
          >
            <LayoutDashboard className="size-4 shrink-0 text-[var(--accent-600)]" />
            Tableau de bord
            <span className="ml-auto text-xs text-muted-foreground">Apprentissage</span>
          </div>

          <div
            className="flex cursor-pointer items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--accent-50)] hover:text-[var(--accent-700)]"
            onClick={closeSearch}
          >
            <MonitorPlay className="size-4 shrink-0 text-muted-foreground" />
            Simulations
            <span className="ml-auto text-xs text-muted-foreground">Apprentissage</span>
          </div>

          <div
            className="flex cursor-pointer items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--accent-50)] hover:text-[var(--accent-700)]"
            onClick={closeSearch}
          >
            <FileText className="size-4 shrink-0 text-muted-foreground" />
            Livrables
            <span className="ml-auto text-xs text-muted-foreground">Apprentissage</span>
          </div>
        </div>

        {/* Simulations récentes section */}
        <div className="p-2">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-[1.2px] text-muted-foreground">
            Simulations récentes
          </div>

          <div
            className="flex cursor-pointer items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--accent-50)] hover:text-[var(--accent-700)]"
            onClick={closeSearch}
          >
            <Briefcase className="size-4 shrink-0 text-muted-foreground" />
            Déploiement ERP GlobalFinance
            <span className="ml-auto text-xs text-muted-foreground">En cours</span>
          </div>

          <div
            className="flex cursor-pointer items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--accent-50)] hover:text-[var(--accent-700)]"
            onClick={closeSearch}
          >
            <Briefcase className="size-4 shrink-0 text-muted-foreground" />
            Lancement produit Q3
            <span className="ml-auto text-xs text-muted-foreground">Brouillon</span>
          </div>
        </div>

        {/* Footer kbd hints */}
        <div className="flex items-center gap-4 border-t border-border px-4 py-2.5 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <kbd className="rounded-xs border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-foreground">↑</kbd>
            <kbd className="rounded-xs border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-foreground">↓</kbd>
            Naviguer
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded-xs border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-foreground">↵</kbd>
            Ouvrir
          </span>
          <span className="ml-auto flex items-center gap-1">
            <kbd className="rounded-xs border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-foreground">Échap</kbd>
            Fermer
          </span>
        </div>
      </div>
    </div>
  );
}
