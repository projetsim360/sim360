import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { CircleCheck } from '@/components/keenicons/icons';
import { useAuth } from '@/providers/auth-provider';
import { useShellState, type ContentMode } from '@/components/layouts/simex-shell/state/shell-state-provider';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AppMessageKey } from '@/i18n/app/messages';
import { useT } from '@/i18n/app/use-t';

const THEMES: Array<{ value: string; label: AppMessageKey; bg: string }> = [
  { value: 'light', label: 'settings.theme.light', bg: 'bg-zinc-100' },
  { value: 'dark', label: 'settings.theme.dark', bg: 'bg-zinc-900' },
  { value: 'system', label: 'settings.theme.system', bg: 'bg-gradient-to-r from-zinc-100 to-zinc-900' },
] as const;

const PILL_BASE =
  'px-3 py-1.5 text-[12px] font-semibold rounded-md transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-500)]/50';
const PILL_ACTIVE =
  'bg-card text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.06)] ' +
  'dark:bg-[var(--brand-700)] dark:text-[var(--accent-300)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]';
const PILL_IDLE = 'text-muted-foreground hover:text-foreground';

const CONTENT_MODES: Array<{ value: ContentMode; label: AppMessageKey }> = [
  { value: 'fluide', label: 'settings.content.fluid' },
  { value: 'centre', label: 'settings.content.centered' },
];

export function Appearance() {
  const t = useT();
  const { theme, setTheme } = useTheme();
  const { user, refreshUser } = useAuth();
  const { contentMode, setContentMode } = useShellState();
  const [sidebarTransparent, setSidebarTransparent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setSidebarTransparent(user.sidebarTransparent ?? false);
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.patch('/users/me/settings', { sidebarTransparent });
      await refreshUser();
      toast.success(t('settings.prefSaved'));
    } catch {
      toast.error(t('settings.saveError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      id="preferences_appearance"
      className="border-[var(--neutral-100)] dark:border-white/[0.06] shadow-[0_1px_2px_rgba(15,26,46,0.04),0_8px_24px_-10px_rgba(15,26,46,0.08)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_-10px_rgba(0,0,0,0.5)]"
    >
      <CardHeader className="flex-col items-start gap-1 pt-5 pb-4 border-b-0">
        <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-[var(--accent-700)] dark:text-[var(--accent-300)]">
          {t('settings.kicker.appearance')}
        </span>
        <h2 className="font-display text-[19px] font-bold text-foreground m-0">
          {t('settings.appearance.title')}
        </h2>
        <p className="text-[13px] text-muted-foreground m-0">
          {t('settings.appearance.desc')}
        </p>
      </CardHeader>

      <CardContent className="pt-2">
        {/* Theme cards */}
        <div className="mb-6">
          <div className="text-[12px] font-semibold text-foreground mb-2.5">{t('settings.theme')}</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {THEMES.map((item) => {
              const isSelected = theme === item.value;
              return (
                <div key={item.value}>
                  <Label
                    className={cn(
                      'flex items-end border rounded-xl h-[120px] mb-1 cursor-pointer transition-all',
                      item.bg,
                      isSelected
                        ? 'border-[var(--accent-500)] border-[3px] ring-1 ring-[var(--accent-500)]/30'
                        : 'border-input hover:border-[var(--accent-500)]/50',
                    )}
                    onClick={() => setTheme(item.value)}
                  >
                    <input
                      type="radio"
                      name="theme_option"
                      className="absolute opacity-0 w-0 h-0"
                      checked={isSelected}
                      onChange={() => setTheme(item.value)}
                    />
                    {isSelected && (
                      <CircleCheck size={18} className="ms-3 mb-3 text-[var(--accent-500)]" />
                    )}
                  </Label>
                  <span className="text-[12px] font-medium text-foreground">{t(item.label)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar transparente */}
        <div className="grid grid-cols-1 sm:grid-cols-[170px_minmax(0,1fr)] gap-3 sm:gap-4 items-center py-3 border-t border-[var(--neutral-100)] dark:border-white/[0.06]">
          <Label htmlFor="appearance-sidebar-transparent" className="text-[13px] font-medium text-foreground">
            {t('settings.transparentSidebar')}
          </Label>
          <div className="flex items-center gap-2.5">
            <Switch
              id="appearance-sidebar-transparent"
              size="sm"
              checked={sidebarTransparent}
              onCheckedChange={setSidebarTransparent}
            />
            <span className="text-[12px] text-muted-foreground">
              {t('settings.transparentSidebarDesc')}
            </span>
          </div>
        </div>

        {/* Mode contenu — NEW */}
        <div className="grid grid-cols-1 sm:grid-cols-[170px_minmax(0,1fr)] gap-3 sm:gap-4 items-center py-3 border-t border-[var(--neutral-100)] dark:border-white/[0.06]">
          <Label id="appearance-content-mode-label" className="text-[13px] font-medium text-foreground">
            {t('settings.contentMode')}
            <span className="block text-[10.5px] font-normal text-muted-foreground mt-0.5">
              {t('settings.contentModeDesc')}
            </span>
          </Label>
          <div
            role="radiogroup"
            aria-labelledby="appearance-content-mode-label"
            className="inline-flex items-center gap-1 p-1 bg-[var(--neutral-100)] dark:bg-white/5 rounded-lg"
          >
            {CONTENT_MODES.map((mode) => {
              const active = contentMode === mode.value;
              return (
                <button
                  key={mode.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setContentMode(mode.value)}
                  className={cn(PILL_BASE, active ? PILL_ACTIVE : PILL_IDLE)}
                >
                  {t(mode.label)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Save row (Sidebar transparente only — theme + content mode persist directly) */}
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-[var(--neutral-100)] dark:border-white/[0.06]">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? t('settings.saving') : t('common.save')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
