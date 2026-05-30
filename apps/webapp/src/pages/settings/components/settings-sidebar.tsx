import { cn } from '@/lib/utils';

/* ----------------------------------------------------------------
   SettingsScrollspy — sous-composant local au visuel premium.
   Émet les ancres `data-scrollspy-anchor={target}` que le hook
   <Scrollspy> de pages/settings/index.tsx consomme déjà.
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
    label: 'Compte',
    items: [
      { title: 'Profil', target: 'basic_settings' },
      { title: 'Email', target: 'auth_email' },
      { title: 'Mot de passe', target: 'auth_password' },
      { title: 'Connexion sociale', target: 'auth_social' },
      { title: 'Double auth.', target: 'auth_two_factor' },
    ],
  },
  {
    label: 'Application',
    items: [
      { title: 'Préférences', target: 'preferences_general' },
      { title: 'Apparence', target: 'preferences_appearance' },
      { title: 'Notifications', target: 'preferences_notifications' },
    ],
  },
  {
    label: 'Avancé',
    items: [{ title: 'Supprimer le compte', target: 'delete_account', danger: true }],
  },
];

export function SettingsSidebar() {
  return (
    <nav aria-label="Sections des paramètres" className="flex flex-col">
      {GROUPS.map((group) => (
        <div key={group.label} className="mb-1">
          <div
            className={cn(
              'px-3 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.8px]',
              'text-[var(--neutral-400)] dark:text-[var(--neutral-500)]',
            )}
          >
            {group.label}
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
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
