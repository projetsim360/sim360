import { Sparkles, X, MessageCircle, Layers, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PmoPanelProps {
  className?: string;
}

export function PmoPanel({ className }: PmoPanelProps) {
  return (
    <aside
      className={cn(
        // LOT A: collapsed — width 0, opacity 0. LOT B will toggle.
        'sticky flex shrink-0 flex-col overflow-hidden rounded-lg bg-card',
        className,
      )}
      style={{
        top: '16px',
        alignSelf: 'flex-start',
        height: 'calc(100vh - 64px - 32px)',
        margin: '16px 0',
        width: 0,
        opacity: 0,
        transition: 'width 280ms cubic-bezier(0.16,1,0.3,1), margin-right 280ms cubic-bezier(0.16,1,0.3,1), opacity 200ms cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      {/* Header */}
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-[18px] py-4">
        <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-[var(--accent-50)] text-[var(--accent-500)]">
          <Sparkles className="size-[18px]" />
        </div>
        <div className="flex flex-1 flex-col gap-0.5">
          <span className="font-display text-[15px] font-bold text-foreground">Agent PMO</span>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="size-[7px] rounded-full bg-[var(--success-500)]"
              style={{ boxShadow: '0 0 0 3px rgba(16,185,129,.18)' }}
            />
            En ligne · contexte chargé
          </span>
        </div>
        <button
          type="button"
          aria-label="Fermer"
          className="inline-flex size-8 items-center justify-center rounded-sm border-0 bg-transparent text-muted-foreground cursor-pointer transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </header>

      {/* Tabs */}
      <div className="flex shrink-0 gap-1 border-b border-border px-[18px] py-3">
        <button
          type="button"
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm border-0 bg-[var(--info-50)] px-3 py-2 text-[13px] font-semibold text-[var(--brand-700)] transition-colors duration-150"
        >
          <MessageCircle className="size-3.5" />
          Chat
        </button>
        <button
          type="button"
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm border-0 bg-transparent px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
        >
          <Layers className="size-3.5" />
          Contexte
        </button>
      </div>

      {/* Message body */}
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-[18px]">
        {/* Bot message */}
        <div className="max-w-[85%] self-start rounded-md rounded-bl-xs bg-muted px-3.5 py-3 text-sm leading-[1.55] text-foreground">
          Bonjour Alex. Vous êtes en phase Initiation, tour 4. Votre dernière décision (cadrage périmètre) a réduit le risque de 18%. Quelle question voulez-vous explorer ?
        </div>

        {/* User message */}
        <div className="max-w-[85%] self-end rounded-md rounded-br-xs bg-[var(--accent-500)] px-3.5 py-3 text-sm leading-[1.55] text-white">
          Comment justifier mon choix de méthodologie auprès du sponsor ?
        </div>

        {/* Bot message */}
        <div className="max-w-[85%] self-start rounded-md rounded-bl-xs bg-muted px-3.5 py-3 text-sm leading-[1.55] text-foreground">
          Trois leviers concrets : 1) cadre PMI auquel le sponsor est habitué, 2) métriques quantitatives sur les 3 derniers projets similaires, 3) plan de mitigation des risques. Voulez-vous un script d'argumentation ?
        </div>
      </div>

      {/* Footer input */}
      <footer className="flex shrink-0 items-center gap-2.5 border-t border-border px-4 py-3.5">
        <input
          className={cn(
            'h-11 flex-1 rounded-md border border-border bg-card px-3.5',
            'text-sm text-foreground placeholder:text-muted-foreground',
            'outline-none transition-colors',
            'focus:border-[var(--accent-500)] focus:shadow-[0_0_0_3px_rgba(238,122,58,.15)]',
          )}
          placeholder="Demandez au PMO…"
          readOnly
        />
        <button
          type="button"
          aria-label="Envoyer"
          className={cn(
            'inline-flex size-11 shrink-0 cursor-pointer items-center justify-center',
            'rounded-md border-0 bg-[var(--accent-500)] text-white',
            'transition-colors duration-150 hover:bg-[var(--accent-600)]',
          )}
        >
          <ArrowUp className="size-[18px]" />
        </button>
      </footer>
    </aside>
  );
}
