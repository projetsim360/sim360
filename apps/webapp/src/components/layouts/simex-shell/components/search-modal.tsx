import { Search, LayoutDashboard, MonitorPlay, FileText, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchModalProps {
  className?: string;
}

export function SearchModal({ className }: SearchModalProps) {
  return (
    // LOT A: hidden — LOT B will toggle visibility
    <div
      className={cn('hidden', className)}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
        background: 'rgba(15,26,46,0.18)',
        backdropFilter: 'blur(6px) saturate(120%)',
        WebkitBackdropFilter: 'blur(6px) saturate(120%)',
      }}
    >
      <div
        className="w-[min(640px,92vw)] overflow-hidden rounded-lg border border-border bg-card"
        style={{ boxShadow: 'var(--elevation-xl)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input row */}
        <div className="flex items-center gap-2.5 border-b border-border px-[18px] py-3.5">
          <Search className="size-[18px] shrink-0 text-muted-foreground" />
          <input
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

          <div className="flex cursor-pointer items-center gap-3 rounded-sm bg-[var(--accent-50)] px-3 py-2.5 text-sm text-[var(--accent-700)]">
            <LayoutDashboard className="size-4 shrink-0 text-[var(--accent-600)]" />
            Tableau de bord
            <span className="ml-auto text-xs text-muted-foreground">Apprentissage</span>
          </div>

          <div className="flex cursor-pointer items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--accent-50)] hover:text-[var(--accent-700)]">
            <MonitorPlay className="size-4 shrink-0 text-muted-foreground" />
            Simulations
            <span className="ml-auto text-xs text-muted-foreground">Apprentissage</span>
          </div>

          <div className="flex cursor-pointer items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--accent-50)] hover:text-[var(--accent-700)]">
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

          <div className="flex cursor-pointer items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--accent-50)] hover:text-[var(--accent-700)]">
            <Briefcase className="size-4 shrink-0 text-muted-foreground" />
            Déploiement ERP GlobalFinance
            <span className="ml-auto text-xs text-muted-foreground">En cours</span>
          </div>

          <div className="flex cursor-pointer items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--accent-50)] hover:text-[var(--accent-700)]">
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
