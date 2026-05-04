import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, PanelLeft, Sparkles, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useShellState } from '../state/shell-state-provider';
import type { ShellVariant, ContentMode } from '../state/shell-state-provider';

/* ============================================================
   DemoControls — gated by VITE_SIMEX_DEMO_CONTROLS=true
   A slim floating pill bar at viewport bottom-center.
   ============================================================ */

function DemoSep() {
  return <span className="mx-[5px] inline-block h-4 w-px bg-neutral-100" />;
}

interface DemoBtnProps {
  active?: boolean;
  accent?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}

function DemoBtn({ active, accent, onClick, children, title }: DemoBtnProps) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        'inline-flex cursor-pointer items-center gap-[5px] rounded-full border-0 px-[11px] py-[5px]',
        'font-sans text-[12px] font-medium leading-none transition-colors duration-150',
        active && !accent &&
          'bg-white font-semibold text-[var(--brand-700)] shadow-[0_1px_2px_rgba(15,26,46,.06),0_0_0_1px_var(--neutral-100)]',
        active && accent &&
          'bg-[var(--accent-100)] font-semibold text-[var(--accent-700)]',
        !active &&
          'bg-transparent text-neutral-600 hover:bg-neutral-50 hover:text-[var(--brand-700)]',
      )}
    >
      {children}
    </button>
  );
}

export function DemoControls() {
  // Guard: only render when the env var is exactly the string 'true'
  if (import.meta.env.VITE_SIMEX_DEMO_CONTROLS !== 'true') return null;

  return <DemoControlsInner />;
}

function DemoControlsInner() {
  const {
    sidebarCollapsed,
    toggleSidebar,
    pmoOpen,
    togglePmo,
    toggleFocusMode,
    shellVariant,
    setShellVariant,
    contentMode,
    setContentMode,
  } = useShellState();

  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <div
      className="simex-demo-bar fixed bottom-4 left-1/2 z-[100] inline-flex -translate-x-1/2 items-center gap-0.5 rounded-full border border-neutral-100 bg-white p-[3px] text-[12px]"
      style={{ boxShadow: '0 4px 12px rgba(15,26,46,.08), 0 2px 4px rgba(15,26,46,.06)', transition: 'transform 250ms var(--ease-in)' }}
    >
      {/* Label */}
      <span className="select-none px-[8px] pr-[10px] font-sans text-[9px] font-semibold uppercase tracking-[1.2px] text-neutral-400">
        Démo
      </span>

      {/* Group: Thème */}
      <span className="inline-flex items-center gap-0.5">
        <DemoBtn active={!isDark} onClick={() => setTheme('light')} title="Thème clair">
          <Moon className="size-[13px]" />
          Clair
        </DemoBtn>
        <DemoBtn active={isDark} onClick={() => setTheme('dark')} title="Thème sombre">
          <Sun className="size-[13px]" />
          Sombre
        </DemoBtn>
      </span>

      <span className="hidden sm:inline-flex"><DemoSep /></span>

      {/* Group: Shell — hidden on mobile (env-only feature) */}
      <span className="hidden sm:inline-flex items-center gap-0.5">
        <DemoBtn
          active={shellVariant === 'brand'}
          onClick={() => setShellVariant('brand' as ShellVariant)}
          title="Shell brand (sombre)"
        >
          Brand
        </DemoBtn>
        <DemoBtn
          active={shellVariant === 'neutre'}
          onClick={() => setShellVariant('neutre' as ShellVariant)}
          title="Shell neutre (clair)"
        >
          Neutre
        </DemoBtn>
      </span>

      <span className="hidden sm:inline-flex"><DemoSep /></span>

      {/* Group: Contenu */}
      <span className="inline-flex items-center gap-0.5">
        <DemoBtn
          active={contentMode === 'fluide'}
          onClick={() => setContentMode('fluide' as ContentMode)}
          title="Contenu fluide (max 1280px)"
        >
          Fluide
        </DemoBtn>
        <DemoBtn
          active={contentMode === 'centre'}
          onClick={() => setContentMode('centre' as ContentMode)}
          title="Contenu centré (max 1080px)"
        >
          Centré
        </DemoBtn>
      </span>

      <DemoSep />

      {/* Group: Actions rapides */}
      <span className="inline-flex items-center gap-0.5">
        <DemoBtn
          active={sidebarCollapsed}
          onClick={toggleSidebar}
          title="Réduire / étendre la barre latérale"
        >
          <PanelLeft className="size-[13px]" />
          {sidebarCollapsed ? 'Sidebar +' : 'Sidebar −'}
        </DemoBtn>
        <DemoBtn
          active={pmoOpen}
          accent={pmoOpen}
          onClick={togglePmo}
          title="Ouvrir / fermer l'agent PMO"
        >
          <Sparkles className="size-[13px]" />
          PMO
        </DemoBtn>
        <DemoBtn onClick={toggleFocusMode} title="Mode focus (masque les contrôles)">
          <Maximize2 className="size-[13px]" />
          Focus
        </DemoBtn>
      </span>
    </div>
  );
}
