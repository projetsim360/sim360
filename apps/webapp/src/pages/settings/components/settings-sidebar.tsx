import { cn } from '@/lib/utils';
import type { AppMessageKey } from '@/i18n/app/messages';
import { useT } from '@/i18n/app/use-t';

/* ----------------------------------------------------------------
   SettingsScrollspy: local sub-component for the settings nav.
   Emits `data-scrollspy-anchor={target}` anchors consumed by the
   <Scrollspy> hook in pages/settings/index.tsx.
   ---------------------------------------------------------------- */

interface SettingsScrollspyItem {
  title: string;
  target: string;
  /** Variante visuelle pour signaler une action destructive. */
  danger?: boolean;
}

interface SettingsScrollspyGroup {
  label: string;
  items: SettingsScrollspyItem[];
}

const GROUPS: SettingsScrollspyGroup[] = [
  {
    label: 'settings.nav.account',
    items: [
      { title: 'settings.profile.title', target: 'basic_settings' },
      { title: 'auth.field.email', target: 'auth_email' },
      { title: 'auth.field.password', target: 'auth_password' },
      { title: 'settings.social.title', target: 'auth_social' },
      { title: 'settings.nav.twoFactor', target: 'auth_two_factor' },
      { title: 'billing.title', target: 'billing' },
    ],
  },
  {
    label: 'settings.nav.app',
    items: [
      { title: 'settings.prefs.title', target: 'preferences_general' },
      { title: 'settings.nav.appearance', target: 'preferences_appearance' },
      { title: 'settings.notif.title', target: 'preferences_notifications' },
    ],
  },
  {
    label: 'settings.nav.advanced',
    items: [{ title: 'settings.delete.title', target: 'delete_account', danger: true }],
  },
];

export function SettingsSidebar() {
  const t = useT();
  return (
    <nav aria-label={t('settings.nav.label')} className="flex flex-col">
      {GROUPS.map((group) => (
        <div key={group.label} className="mb-1">
          <div
            className={cn(
              'px-3 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.8px]',
              'text-[var(--neutral-400)] dark:text-[var(--neutral-500)]',
            )}
          >
            {t(group.label as AppMessageKey)}
          </div>
          <ul className="flex flex-col">
            {group.items.map((item) => (
              <li key={item.target}>
                <a
                  href={`#${item.target}`}
                  data-scrollspy-anchor={item.target}
                  className={cn(
                    'group flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium rounded-md',
                    'transition-colors',
                    item.danger
                      ? 'text-[var(--error-700)] dark:text-[var(--error-200)]'
                      : 'text-[var(--neutral-600)] dark:text-[var(--neutral-300)]',
                    'hover:bg-[var(--neutral-100)] dark:hover:bg-white/5',
                    'data-[active=true]:bg-[var(--accent-50)] data-[active=true]:text-[var(--accent-700)]',
                    'data-[active=true]:font-bold',
                    'dark:data-[active=true]:bg-[var(--accent-500)]/[0.12] dark:data-[active=true]:text-[var(--accent-300)]',
                    'data-[active=true]:shadow-[inset_3px_0_0_var(--accent-500)]',
                    'data-[active=true]:pl-2.5 data-[active=true]:rounded-none data-[active=true]:rounded-r-md',
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      'size-1.5 rounded-full',
                      item.danger
                        ? 'bg-[var(--error-200)] group-data-[active=true]:bg-[var(--error-500)]'
                        : 'bg-[var(--neutral-300)] dark:bg-[var(--neutral-600)] group-data-[active=true]:bg-[var(--accent-500)]',
                    )}
                  />
                  {t(item.title as AppMessageKey)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
