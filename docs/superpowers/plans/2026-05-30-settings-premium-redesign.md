# Settings Premium Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesigner `/settings` en version premium cohérente avec le dashboard, intégrer le contrôle « Mode contenu » dans Apparence, retirer le toggle du PageHeader, supprimer entièrement la fonctionnalité « changement de layout » (cards, route, fichiers, entrées menu).

**Architecture:** Page React fonctionnelle avec `PageHeader` (style dashboard) + grille 2 colonnes (`SettingsScrollspy` local 230px sticky + colonne cards). Visuel premium = composition Tailwind sur les composants UI existants (`Card`, `Button`, `Switch`, etc.), pas de nouveau composant partagé. Mode contenu reste géré via `useShellState` (localStorage `simex.content-mode`), pas de change backend.

**Tech Stack:** React 19, Vite, Tailwind CSS v4, design system custom (Radix + CVA), tokens sémantiques dark mode, KeenIcon, framer-motion (optionnel), pas de runner de tests front — vérification = `pnpm typecheck` + Playwright manuel.

**Spec source:** `docs/superpowers/specs/2026-05-30-settings-premium-redesign-design.md`

**Branch:** `main` (workflow direct, 1 commit par tâche).

---

## Vue d'ensemble des tâches

| #   | Tâche                                                          | Fichiers principaux                                                |
|-----|---------------------------------------------------------------|--------------------------------------------------------------------|
| 1   | Retirer le ModeBar du PageHeader                              | `page-header/index.tsx`, `meeting-room.tsx`                        |
| 2   | Nettoyer routing + menu + supprimer fichiers morts            | `app-routing-setup.tsx`, `menu.config.ts`, suppressions            |
| 3   | Restructurer `SettingsSidebar` (SettingsScrollspy local)      | `settings-sidebar.tsx`                                             |
| 4   | Refactor `pages/settings/index.tsx` (PageHeader + grille)     | `pages/settings/index.tsx`                                         |
| 5   | Refondre `Appearance` (visuel premium + Mode contenu)         | `appearance.tsx`                                                   |
| 6   | Repolish des cards simples (basic, prefs, notifs, delete)     | `basic-settings.tsx`, `preferences.tsx`, `notifications.tsx`, `delete-account.tsx` |
| 7   | Repolish des cards Auth (email, password, social, 2FA header) | `auth-email.tsx`, `auth-password.tsx`, `auth-social.tsx`, `auth-two-factor.tsx` |
| 8   | Vérification finale (typecheck + Playwright manuel)           | scripts de vérif                                                   |

---

## Task 1: Retirer le ModeBar du PageHeader

**Files:**
- Modify: `apps/webapp/src/components/page-header/index.tsx`
- Modify: `apps/webapp/src/features/meeting/pages/meeting-room.tsx`

- [ ] **Step 1: Réécrire `page-header/index.tsx` sans le ModeBar**

Remplacer **tout le contenu** du fichier `apps/webapp/src/components/page-header/index.tsx` par :

```tsx
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

/* ============================================================
   Types
   ============================================================ */

export interface BreadcrumbCrumb {
  /** Display label for this crumb. */
  label: string;
  /** Optional route to link to. The last crumb is never linked. */
  to?: string;
}

export interface PageHeaderProps {
  /** Optional breadcrumb trail. The last crumb is rendered as the current page (bold, no link). */
  breadcrumbs?: BreadcrumbCrumb[];
  /** The main page title — Montserrat 800, ~40px. */
  title: string;
  /** Optional subtitle under the title. */
  subtitle?: ReactNode;
  /** Right-aligned actions (buttons, etc.). */
  actions?: ReactNode;
}

/* ============================================================
   PageHeader
   ============================================================ */

export function PageHeader({
  breadcrumbs,
  title,
  subtitle,
  actions,
}: PageHeaderProps) {
  return (
    <div className="px-6 pt-6 pb-0">
      {/* ── Breadcrumb ── */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          aria-label="Fil d'Ariane"
          className="flex items-center flex-wrap gap-x-2.5 gap-y-1 text-xs sm:text-sm mb-3"
        >
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <span key={index} className="flex items-center gap-2.5">
                {index > 0 && (
                  <span
                    className="text-[var(--neutral-300)] select-none"
                    aria-hidden="true"
                  >
                    /
                  </span>
                )}
                {isLast ? (
                  <span className="text-foreground font-semibold">{crumb.label}</span>
                ) : crumb.to ? (
                  <Link
                    to={crumb.to}
                    className="text-[var(--neutral-500)] font-medium hover:text-[var(--accent-600)] transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-[var(--neutral-500)] font-medium">{crumb.label}</span>
                )}
              </span>
            );
          })}
        </nav>
      )}

      {/* ── Page head row: title + actions ── */}
      <div className="flex items-start gap-5 flex-wrap mb-4">
        <div
          className="flex-1 min-w-[280px]"
          data-slot="toolbar-heading"
        >
          <h1
            className={cn(
              'font-display font-extrabold text-[28px] sm:text-[32px] lg:text-[40px] leading-[1.1] tracking-[-0.02em]',
              'text-[var(--brand-700)] text-wrap-balance m-0',
            )}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-[15px] text-[var(--neutral-500)] mt-1.5 max-w-[720px] m-0">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2.5 mt-1.5 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
```

(Le fichier perd : import de `useShellState/ContentMode`, prop `hideContentMode`, bloc conditionnel `{!hideContentMode && (...)}`, fonctions `ModeBar`, `ModeButton`, et les types associés.)

- [ ] **Step 2: Mettre à jour `meeting-room.tsx` (retirer le seul usage de `hideContentMode`)**

Editer `apps/webapp/src/features/meeting/pages/meeting-room.tsx` ligne 116 :

Remplacer :
```tsx
        <PageHeader breadcrumbs={breadcrumbs} title={meeting.title} actions={backAction} hideContentMode />
```

Par :
```tsx
        <PageHeader breadcrumbs={breadcrumbs} title={meeting.title} actions={backAction} />
```

- [ ] **Step 3: Vérifier qu'il n'y a plus aucun usage de `hideContentMode`**

```bash
grep -rn "hideContentMode" /Users/shounsa/Documents/Workspaces/simex-pro/apps/webapp/src
```

Expected : aucune ligne renvoyée (sortie vide).

- [ ] **Step 4: Typecheck**

```bash
pnpm --filter @sim360/webapp typecheck
```

Expected : `0 errors`.

- [ ] **Step 5: Commit**

```bash
git add apps/webapp/src/components/page-header/index.tsx \
        apps/webapp/src/features/meeting/pages/meeting-room.tsx
git commit -m "$(cat <<'EOF'
refactor(page-header): remove Mode contenu toggle (moved to /settings)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Nettoyer routing + menu + supprimer fichiers morts

**Files:**
- Modify: `apps/webapp/src/routing/app-routing-setup.tsx`
- Modify: `apps/webapp/src/config/menu.config.ts`
- Delete: `apps/webapp/src/pages/settings/components/layout-settings.tsx`
- Delete: `apps/webapp/src/pages/settings/layout-selector.tsx`

- [ ] **Step 1: Remplacer la route `/settings/layout` par un redirect**

Editer `apps/webapp/src/routing/app-routing-setup.tsx`. Trouver la section :

```tsx
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/layout" element={<SettingsPage />} />
```

Remplacer la deuxième ligne par un `Navigate` :

```tsx
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/layout" element={<Navigate to="/settings" replace />} />
```

`Navigate` est déjà importé en ligne 2 du fichier (`import { Route, Routes, Navigate } from 'react-router';`).

- [ ] **Step 2: Nettoyer le menu sidebar général**

Editer `apps/webapp/src/config/menu.config.ts`. Trouver le bloc « Paramètres » dans `APP_SIDEBAR_MENU` (lignes 60-68 environ) :

```tsx
  {
    title: 'Paramètres',
    icon: Settings,
    path: '/settings',
    children: [
      { title: 'Général', path: '/settings' },
      { title: 'Layout', path: '/settings/layout' },
    ],
  },
```

Remplacer par (item plat sans children) :

```tsx
  {
    title: 'Paramètres',
    icon: Settings,
    path: '/settings',
  },
```

- [ ] **Step 3: Nettoyer `APP_MEGA_MENU`**

Toujours dans `menu.config.ts`, trouver dans `APP_MEGA_MENU` le bloc « Mon Compte » (lignes 167-178 environ) :

```tsx
      {
        title: 'Mon Compte',
        children: [
          {
            children: [
              { title: 'Mon Profil', icon: UserCircle, path: '/profile/edit' },
              { title: 'Layout', icon: Settings, path: '/settings/layout' },
              { title: 'Préférences', icon: Settings, path: '/settings' },
            ],
          },
        ],
      },
```

Retirer la ligne `{ title: 'Layout', icon: Settings, path: '/settings/layout' },` pour donner :

```tsx
      {
        title: 'Mon Compte',
        children: [
          {
            children: [
              { title: 'Mon Profil', icon: UserCircle, path: '/profile/edit' },
              { title: 'Préférences', icon: Settings, path: '/settings' },
            ],
          },
        ],
      },
```

- [ ] **Step 4: Nettoyer `APP_MEGA_MENU_MOBILE`**

Toujours dans `menu.config.ts`, trouver le bloc « Mon Compte » de `APP_MEGA_MENU_MOBILE` (lignes 217-226 environ) :

```tsx
      {
        title: 'Mon Compte',
        children: [
          { title: 'Mon Profil', icon: UserCircle, path: '/profile/edit' },
          { title: 'Layout', icon: Settings, path: '/settings/layout' },
          { title: 'Préférences', icon: Settings, path: '/settings' },
        ],
      },
```

Retirer la ligne `{ title: 'Layout', icon: Settings, path: '/settings/layout' },` pour donner :

```tsx
      {
        title: 'Mon Compte',
        children: [
          { title: 'Mon Profil', icon: UserCircle, path: '/profile/edit' },
          { title: 'Préférences', icon: Settings, path: '/settings' },
        ],
      },
```

- [ ] **Step 5: Supprimer les fichiers morts**

```bash
rm /Users/shounsa/Documents/Workspaces/simex-pro/apps/webapp/src/pages/settings/components/layout-settings.tsx
rm /Users/shounsa/Documents/Workspaces/simex-pro/apps/webapp/src/pages/settings/layout-selector.tsx
```

- [ ] **Step 6: Vérifier qu'il n'y a plus aucune référence à ces fichiers**

```bash
grep -rn "layout-settings\|layout-selector\|LayoutSettings\|LayoutSelectorPage" \
  /Users/shounsa/Documents/Workspaces/simex-pro/apps/webapp/src
```

Expected : aucune ligne renvoyée (la suppression de l'import dans `pages/settings/index.tsx` se fera à la Task 4, mais on note ici qu'il y aura encore une référence ; vérifier juste qu'aucun fichier `.tsx` d'autres features ne les utilise).

Si la commande renvoie uniquement la ligne `pages/settings/index.tsx` (import + usage de `<LayoutSettings />`), c'est OK — sera nettoyé en Task 4.

- [ ] **Step 7: Typecheck (peut échouer — c'est attendu)**

```bash
pnpm --filter @sim360/webapp typecheck
```

Expected : **erreur** sur `apps/webapp/src/pages/settings/index.tsx` parce que l'import `./components/layout-settings` ne résout plus.
**Ne pas committer encore.** La Task 4 corrigera cet import. Si tu veux malgré tout commiter ici (atomic step), garde l'import dans `index.tsx` cassé pour ce commit — mais préfère **enchaîner sur la Task 4 dans le même PR**.

> **Stratégie recommandée :** ne PAS commiter le step 5 (suppression de fichiers) avant d'avoir aussi modifié `index.tsx` (Task 4 step 1). Pour rester atomic, **différer les `rm`** au moment où Task 4 step 1 sera appliqué.
>
> **Plan alternatif :** ne pas faire step 5 maintenant, le faire à la fin de la Task 4 step 1.

- [ ] **Step 8: Commit (routing + menu uniquement)**

Si tu n'as PAS encore supprimé les fichiers (recommandé) :

```bash
git add apps/webapp/src/routing/app-routing-setup.tsx \
        apps/webapp/src/config/menu.config.ts
git commit -m "$(cat <<'EOF'
chore(settings): remove layout switcher from routing and menus

- Replace /settings/layout route with redirect to /settings
- Remove "Layout" entries from sidebar / mega-menu / mobile mega-menu

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

(Les `rm` sont reportés à la Task 4 step 1 pour rester atomic.)

---

## Task 3: Restructurer `SettingsSidebar` (SettingsScrollspy local)

**Files:**
- Modify: `apps/webapp/src/pages/settings/components/settings-sidebar.tsx`

- [ ] **Step 1: Réécrire intégralement `settings-sidebar.tsx`**

Remplacer **tout le contenu** du fichier par :

```tsx
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
                    // Default
                    item.danger
                      ? 'text-[var(--error-700)] dark:text-[var(--error-300)]'
                      : 'text-[var(--neutral-600)] dark:text-[var(--neutral-300)]',
                    // Hover
                    'hover:bg-[var(--neutral-100)] dark:hover:bg-white/5',
                    // Active (driven by Scrollspy adding data-active="true")
                    'data-[active=true]:bg-[var(--accent-50)] data-[active=true]:text-[var(--accent-700)]',
                    'data-[active=true]:font-bold',
                    'data-[active=true]:dark:bg-[var(--accent-500)]/12 data-[active=true]:dark:text-[var(--accent-300)]',
                    'data-[active=true]:shadow-[inset_3px_0_0_var(--accent-500)]',
                    'data-[active=true]:pl-2.5 data-[active=true]:rounded-none data-[active=true]:rounded-r-md',
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      'size-1.5 rounded-full',
                      item.danger
                        ? 'bg-[var(--error-300)] group-data-[active=true]:bg-[var(--error-500)]'
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
```

- [ ] **Step 2: Vérifier le mécanisme Scrollspy**

Inspecter `apps/webapp/src/components/ui/scrollspy.tsx` (le hook existe déjà — vérifier qu'il ajoute bien `data-active="true"` aux éléments avec `data-scrollspy-anchor`). Si le sélecteur du hook attend des `div`, pas des `a`, ajuster le pattern. Si vérification OK, continuer.

```bash
grep -n "data-scrollspy-anchor\|data-active" /Users/shounsa/Documents/Workspaces/simex-pro/apps/webapp/src/components/ui/scrollspy.tsx
```

Expected : confirmation que le hook cherche `[data-scrollspy-anchor]` et ajoute `data-active`. Si le hook utilise `querySelectorAll` indépendamment du tag, les `<a>` fonctionnent. Si problème détecté, remplacer `<a>` par `<button>` ou `<div>` avec navigation via JS (`onClick={() => document.getElementById(item.target)?.scrollIntoView(...)}`).

- [ ] **Step 3: Typecheck**

```bash
pnpm --filter @sim360/webapp typecheck
```

Expected : `0 errors`.

- [ ] **Step 4: Commit**

```bash
git add apps/webapp/src/pages/settings/components/settings-sidebar.tsx
git commit -m "$(cat <<'EOF'
feat(settings): premium scrollspy sidebar with grouped items + danger variant

Local SettingsScrollspy component replaces shared ScrollspyMenu. Emits
the same data-scrollspy-anchor attribute the existing Scrollspy hook
consumes.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Refactor `pages/settings/index.tsx` (PageHeader + grille 2 colonnes)

**Files:**
- Modify: `apps/webapp/src/pages/settings/index.tsx`
- Delete: `apps/webapp/src/pages/settings/components/layout-settings.tsx`
- Delete: `apps/webapp/src/pages/settings/layout-selector.tsx`

- [ ] **Step 1: Réécrire intégralement `pages/settings/index.tsx`**

Remplacer **tout le contenu** du fichier par :

```tsx
import { useRef, useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Scrollspy } from '@/components/ui/scrollspy';
import { PageHeader } from '@/components/page-header';
import { SettingsSidebar } from './components/settings-sidebar';
import { BasicSettings } from './components/basic-settings';
import { AuthEmail } from './components/auth-email';
import { AuthPassword } from './components/auth-password';
import { AuthSocial } from './components/auth-social';
import { AuthTwoFactor } from './components/auth-two-factor';
import { Preferences } from './components/preferences';
import { Appearance } from './components/appearance';
import { Notifications } from './components/notifications';
import { DeleteAccount } from './components/delete-account';

export function SettingsPage() {
  const isMobile = useIsMobile();
  const parentRef = useRef<HTMLElement | Document>(document);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Find the scrollable container that actually has overflow.
    const candidates = document.querySelectorAll('.kt-scrollable-y-auto');
    const scrollable = Array.from(candidates).find(
      (el) => el.scrollHeight > el.clientHeight,
    );
    if (scrollable) {
      (parentRef as React.MutableRefObject<HTMLElement | Document>).current = scrollable as HTMLElement;
    } else {
      (parentRef as React.MutableRefObject<HTMLElement | Document>).current = document;
    }
    setReady(true);
  }, []);

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Compte' }, { label: 'Paramètres' }]}
        title="Paramètres"
        subtitle="Gérez votre profil, votre sécurité et vos préférences."
      />

      <div className="px-6 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-[230px_minmax(0,1fr)] gap-7 lg:gap-7.5">
          {/* Sidebar interne — desktop only */}
          {!isMobile && (
            <aside className="w-[230px] shrink-0">
              <div className="sticky top-4">
                {ready && (
                  <Scrollspy offset={100} targetRef={parentRef}>
                    <SettingsSidebar />
                  </Scrollspy>
                )}
              </div>
            </aside>
          )}

          {/* Cards column */}
          <div className="flex flex-col gap-6 lg:gap-7">
            <BasicSettings />
            <AuthEmail />
            <AuthPassword />
            <AuthSocial />
            <AuthTwoFactor />
            <Preferences />
            <Appearance />
            <Notifications />
            <DeleteAccount />
          </div>
        </div>
      </div>
    </>
  );
}
```

Changements clés vs version actuelle :
- `Toolbar/ToolbarHeading` → `PageHeader` (style dashboard)
- `container` → `px-6 pb-8` (le PageHeader gère son padding top via `px-6 pt-6`)
- `flex` 2 colonnes → `grid grid-cols-[230px_minmax(0,1fr)]` (mobile collapse à 1 col)
- **Import et usage de `<LayoutSettings />` supprimés.**

- [ ] **Step 2: Supprimer les fichiers morts**

```bash
rm /Users/shounsa/Documents/Workspaces/simex-pro/apps/webapp/src/pages/settings/components/layout-settings.tsx
rm /Users/shounsa/Documents/Workspaces/simex-pro/apps/webapp/src/pages/settings/layout-selector.tsx
```

- [ ] **Step 3: Vérifier qu'aucun import ne référence ces fichiers**

```bash
grep -rn "layout-settings\|layout-selector\|LayoutSettings\|LayoutSelectorPage" \
  /Users/shounsa/Documents/Workspaces/simex-pro/apps/webapp/src
```

Expected : aucune ligne renvoyée.

- [ ] **Step 4: Typecheck**

```bash
pnpm --filter @sim360/webapp typecheck
```

Expected : `0 errors`.

- [ ] **Step 5: Commit**

```bash
git add apps/webapp/src/pages/settings/index.tsx
git add apps/webapp/src/pages/settings/components/layout-settings.tsx
git add apps/webapp/src/pages/settings/layout-selector.tsx
git commit -m "$(cat <<'EOF'
feat(settings): use PageHeader + 2-column grid, drop layout switcher card

- Page now uses PageHeader (consistent with dashboard) + breadcrumb + subtitle
- 2-column grid (230px scrollspy + cards) replaces flex layout
- Delete <LayoutSettings> card and dead layout-selector page

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Refondre `Appearance` (visuel premium + Mode contenu)

**Files:**
- Modify: `apps/webapp/src/pages/settings/components/appearance.tsx`

- [ ] **Step 1: Réécrire intégralement `appearance.tsx`**

Remplacer **tout le contenu** du fichier par :

```tsx
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { CircleCheck } from '@/components/keenicons/icons';
import { useAuth } from '@/providers/auth-provider';
import { useShellState } from '@/components/layouts/simex-shell/state/shell-state-provider';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const THEMES = [
  { value: 'light', label: 'Clair', bg: 'bg-zinc-100' },
  { value: 'dark', label: 'Sombre', bg: 'bg-zinc-900' },
  { value: 'system', label: 'Système', bg: 'bg-gradient-to-r from-zinc-100 to-zinc-900' },
] as const;

export function Appearance() {
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
      toast.success('Apparence sauvegardée');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      id="preferences_appearance"
      className="border-[var(--neutral-100)] dark:border-white/[0.06] shadow-[0_1px_2px_rgba(15,26,46,0.04),0_8px_24px_-10px_rgba(15,26,46,0.08)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_-10px_rgba(0,0,0,0.5)]"
    >
      <CardHeader className="flex-col items-start gap-1 pb-4 border-b-0">
        <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-[var(--accent-700)] dark:text-[var(--accent-300)]">
          APPARENCE
        </span>
        <h2 className="font-display text-[19px] font-bold text-foreground m-0">
          Thème et présentation
        </h2>
        <p className="text-[13px] text-muted-foreground m-0">
          Comment l'interface s'affiche pour vous.
        </p>
      </CardHeader>

      <CardContent className="pt-2">
        {/* Theme cards */}
        <div className="mb-6">
          <div className="text-[12px] font-semibold text-foreground mb-2.5">Thème</div>
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
                  <span className="text-[12px] font-medium text-foreground">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar transparente */}
        <div className="grid grid-cols-1 sm:grid-cols-[170px_minmax(0,1fr)] gap-3 sm:gap-4 items-center py-3 border-t border-[var(--neutral-100)] dark:border-white/[0.06]">
          <Label className="text-[13px] font-medium text-foreground">Sidebar transparente</Label>
          <div className="flex items-center gap-2.5">
            <Switch
              size="sm"
              checked={sidebarTransparent}
              onCheckedChange={setSidebarTransparent}
            />
            <span className="text-[12px] text-muted-foreground">
              Active un fond transparent pour une interface épurée.
            </span>
          </div>
        </div>

        {/* Mode contenu — NEW */}
        <div
          role="radiogroup"
          aria-label="Largeur du contenu de page"
          className="grid grid-cols-1 sm:grid-cols-[170px_minmax(0,1fr)] gap-3 sm:gap-4 items-center py-3 border-t border-[var(--neutral-100)] dark:border-white/[0.06]"
        >
          <Label className="text-[13px] font-medium text-foreground">
            Mode contenu
            <span className="block text-[10.5px] font-normal text-muted-foreground mt-0.5">
              Largeur du contenu de page
            </span>
          </Label>
          <div className="inline-flex items-center gap-1 p-1 bg-[var(--neutral-100)] dark:bg-white/5 rounded-lg w-fit">
            <button
              type="button"
              role="radio"
              aria-checked={contentMode === 'fluide'}
              onClick={() => setContentMode('fluide')}
              className={cn(
                'px-3 py-1.5 text-[12px] font-semibold rounded-md transition-colors',
                contentMode === 'fluide'
                  ? 'bg-card text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:bg-[var(--brand-700)] dark:text-[var(--accent-300)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Fluide (data)
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={contentMode === 'centre'}
              onClick={() => setContentMode('centre')}
              className={cn(
                'px-3 py-1.5 text-[12px] font-semibold rounded-md transition-colors',
                contentMode === 'centre'
                  ? 'bg-card text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:bg-[var(--brand-700)] dark:text-[var(--accent-300)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Centré 1080px (lecture)
            </button>
          </div>
        </div>

        {/* Save row (Sidebar transparente only — theme + content mode persist directly) */}
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-[var(--neutral-100)] dark:border-white/[0.06]">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Sauvegarde…' : 'Enregistrer'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

Changements clés :
- Import `useShellState` ajouté
- L'`id="preferences_appearance"` est désormais sur la `<Card>` racine (au lieu du `CardHeader`) — c'est l'ancre que le scrollspy cible
- Header premium : eyebrow `APPARENCE` accent + h2 Montserrat + description
- Nouveau champ « Mode contenu » avec 2 pills `role="radio"` (Fluide active par défaut) qui appellent `setContentMode`
- Le bouton « Enregistrer » ne persiste que `sidebarTransparent` (theme via `setTheme`, contentMode via `setContentMode` sont déjà directs)
- Tokens sémantiques (`text-foreground`, `text-muted-foreground`, `bg-card`) — dark mode automatique

- [ ] **Step 2: Typecheck**

```bash
pnpm --filter @sim360/webapp typecheck
```

Expected : `0 errors`.

- [ ] **Step 3: Vérification rapide en dev**

```bash
pnpm --filter @sim360/webapp dev
```

Ouvrir `http://localhost:5173/settings`, scroller jusqu'à « Apparence ». Cliquer alternativement les deux pills « Mode contenu », vérifier dans la console DevTools que `document.body.dataset.content` change (`'fluide'` ou `'centre'`).

- [ ] **Step 4: Commit**

```bash
git add apps/webapp/src/pages/settings/components/appearance.tsx
git commit -m "$(cat <<'EOF'
feat(settings): premium Appearance card with Mode contenu pills

- Eyebrow + Montserrat title + description (premium pattern)
- Move Mode contenu (fluide/centre) toggle here from PageHeader
- Theme + content mode persist directly, sidebar transparente via Save

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Repolish des cards simples (basic, prefs, notifs, delete)

**Files:**
- Modify: `apps/webapp/src/pages/settings/components/basic-settings.tsx`
- Modify: `apps/webapp/src/pages/settings/components/preferences.tsx`
- Modify: `apps/webapp/src/pages/settings/components/notifications.tsx`
- Modify: `apps/webapp/src/pages/settings/components/delete-account.tsx`

### Pattern visuel uniforme

Toutes les cards doivent suivre ce squelette :

```tsx
<Card
  id="<scrollspy_target>"
  className="border-[var(--neutral-100)] dark:border-white/[0.06] shadow-[0_1px_2px_rgba(15,26,46,0.04),0_8px_24px_-10px_rgba(15,26,46,0.08)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_-10px_rgba(0,0,0,0.5)]"
>
  <CardHeader className="flex-col items-start gap-1 pb-4 border-b-0">
    <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-[var(--accent-700)] dark:text-[var(--accent-300)]">
      <EYEBROW>
    </span>
    <h2 className="font-display text-[19px] font-bold text-foreground m-0">
      <TITRE>
    </h2>
    <p className="text-[13px] text-muted-foreground m-0">
      <DESCRIPTION>
    </p>
  </CardHeader>
  <CardContent className="pt-2">
    {/* champs séparés par <div className="... border-t border-[var(--neutral-100)] dark:border-white/[0.06] py-3"> */}
    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-[var(--neutral-100)] dark:border-white/[0.06]">
      <Button onClick={handleSave} disabled={loading}>
        {loading ? 'Sauvegarde…' : 'Enregistrer'}
      </Button>
    </div>
  </CardContent>
</Card>
```

L'`id` est désormais sur la `Card` racine (pas le CardHeader), pour que le scrollspy cible le bloc entier.

- [ ] **Step 1: Réécrire `basic-settings.tsx`**

Remplacer **tout le contenu** par :

```tsx
import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { api } from '@/lib/api-client';
import { AvatarUpload } from '@/components/common/avatar-upload';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const FIELD_ROW = 'grid grid-cols-1 sm:grid-cols-[170px_minmax(0,1fr)] gap-3 sm:gap-4 items-baseline py-3 border-t border-[var(--neutral-100)] dark:border-white/[0.06] first:border-t-0 first:pt-1';

export function BasicSettings() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    jobTitle: '',
    bio: '',
    language: 'fr',
    experienceLevel: '',
  });

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        firstName: user.firstName,
        lastName: user.lastName,
      }));
      api.get<any>('/users/me').then((data) => {
        setForm({
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || '',
          jobTitle: data.jobTitle || '',
          bio: data.bio || '',
          language: data.language || 'fr',
          experienceLevel: data.experienceLevel || '',
        });
        setProfileVisibility(data.profileVisibility ?? true);
      });
    }
  }, [user]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.patch('/users/me/profile', form);
      await refreshUser();
      toast.success('Paramètres sauvegardés');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      id="basic_settings"
      className="border-[var(--neutral-100)] dark:border-white/[0.06] shadow-[0_1px_2px_rgba(15,26,46,0.04),0_8px_24px_-10px_rgba(15,26,46,0.08)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_-10px_rgba(0,0,0,0.5)]"
    >
      <CardHeader className="flex-col items-start gap-1 pb-4 border-b-0">
        <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-[var(--accent-700)] dark:text-[var(--accent-300)]">
          COMPTE
        </span>
        <h2 className="font-display text-[19px] font-bold text-foreground m-0">Profil</h2>
        <p className="text-[13px] text-muted-foreground m-0">Vos informations publiques et préférences personnelles.</p>
      </CardHeader>

      <CardContent className="pt-2">
        {/* Photo */}
        <div className={FIELD_ROW}>
          <Label className="text-[13px] font-medium text-foreground">Photo</Label>
          <div className="flex items-center justify-between flex-wrap gap-2.5">
            <span className="text-[12px] text-muted-foreground">150x150px JPEG, PNG, WebP</span>
            <AvatarUpload
              currentAvatar={user?.avatar}
              firstName={user?.firstName}
              lastName={user?.lastName}
              onUpload={() => refreshUser()}
              onDelete={() => refreshUser()}
            />
          </div>
        </div>

        {/* Prénom */}
        <div className={FIELD_ROW}>
          <Label className="text-[13px] font-medium text-foreground">Prénom</Label>
          <Input
            type="text"
            value={form.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
          />
        </div>

        {/* Nom */}
        <div className={FIELD_ROW}>
          <Label className="text-[13px] font-medium text-foreground">Nom</Label>
          <Input
            type="text"
            value={form.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
          />
        </div>

        {/* Titre de poste */}
        <div className={FIELD_ROW}>
          <Label className="text-[13px] font-medium text-foreground">Titre de poste</Label>
          <Input
            type="text"
            placeholder="Ex: Chef de projet"
            value={form.jobTitle}
            onChange={(e) => handleChange('jobTitle', e.target.value)}
          />
        </div>

        {/* Téléphone */}
        <div className={FIELD_ROW}>
          <Label className="text-[13px] font-medium text-foreground">Téléphone</Label>
          <Input
            type="text"
            placeholder="+33 6 12 34 56 78"
            value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
        </div>

        {/* Bio */}
        <div className={FIELD_ROW}>
          <Label className="text-[13px] font-medium text-foreground">Bio</Label>
          <Textarea
            rows={3}
            placeholder="Quelques mots sur vous..."
            className="resize-none"
            value={form.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
          />
        </div>

        {/* Langue */}
        <div className={FIELD_ROW}>
          <Label className="text-[13px] font-medium text-foreground">Langue</Label>
          <Select value={form.language} onValueChange={(v) => handleChange('language', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Niveau d'expérience */}
        <div className={FIELD_ROW}>
          <Label className="text-[13px] font-medium text-foreground">Niveau d'expérience</Label>
          <Select value={form.experienceLevel} onValueChange={(v) => handleChange('experienceLevel', v)}>
            <SelectTrigger>
              <SelectValue placeholder="— Sélectionner —" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Débutant</SelectItem>
              <SelectItem value="intermediate">Intermédiaire</SelectItem>
              <SelectItem value="advanced">Avancé</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Visibilité profil */}
        <div className={FIELD_ROW}>
          <Label className="text-[13px] font-medium text-foreground">Visibilité du profil</Label>
          <div className="flex items-center gap-2.5">
            <Switch
              size="sm"
              checked={profileVisibility}
              onCheckedChange={async (checked) => {
                setProfileVisibility(checked);
                try {
                  await api.patch('/users/me/settings', { profileVisibility: checked });
                  await refreshUser();
                  toast.success('Visibilité du profil mise à jour');
                } catch {
                  setProfileVisibility(!checked);
                  toast.error('Erreur lors de la mise à jour');
                }
              }}
            />
            <span className="text-[12px] text-muted-foreground">Profil public</span>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-[var(--neutral-100)] dark:border-white/[0.06]">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Sauvegarde…' : 'Enregistrer'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Réécrire `preferences.tsx`**

Remplacer **tout le contenu** par :

```tsx
import { useState, useEffect, useId } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const FIELD_ROW = 'grid grid-cols-1 sm:grid-cols-[170px_minmax(0,1fr)] gap-3 sm:gap-4 items-baseline py-3 border-t border-[var(--neutral-100)] dark:border-white/[0.06] first:border-t-0 first:pt-1';

export function Preferences() {
  const id1 = useId();
  const id2 = useId();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const [timezone, setTimezone] = useState('europe_paris');
  const [dateFormat, setDateFormat] = useState('dd_mm_yyyy');
  const [simulationViewMode, setSimulationViewMode] = useState('modal');
  const [showSimulationNames, setShowSimulationNames] = useState(true);
  const [showLinkedReports, setShowLinkedReports] = useState(true);
  const [emailVisibility, setEmailVisibility] = useState(true);

  useEffect(() => {
    if (user) {
      setTimezone(user.timezone || 'europe_paris');
      setDateFormat(user.dateFormat || 'dd_mm_yyyy');
      setSimulationViewMode(user.simulationViewMode || 'modal');
      setShowSimulationNames(user.showSimulationNames ?? true);
      setShowLinkedReports(user.showLinkedReports ?? true);
      setEmailVisibility(user.emailVisibility ?? true);
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.patch('/users/me/settings', {
        timezone,
        dateFormat,
        simulationViewMode,
        showSimulationNames,
        showLinkedReports,
        emailVisibility,
      });
      await refreshUser();
      toast.success('Préférences sauvegardées');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      id="preferences_general"
      className="border-[var(--neutral-100)] dark:border-white/[0.06] shadow-[0_1px_2px_rgba(15,26,46,0.04),0_8px_24px_-10px_rgba(15,26,46,0.08)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_-10px_rgba(0,0,0,0.5)]"
    >
      <CardHeader className="flex-col items-start gap-1 pb-4 border-b-0">
        <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-[var(--accent-700)] dark:text-[var(--accent-300)]">
          APPLICATION
        </span>
        <h2 className="font-display text-[19px] font-bold text-foreground m-0">Préférences</h2>
        <p className="text-[13px] text-muted-foreground m-0">Vos préférences d'usage de la plateforme.</p>
      </CardHeader>

      <CardContent className="pt-2">
        {/* Fuseau horaire */}
        <div className={FIELD_ROW}>
          <Label className="text-[13px] font-medium text-foreground">Fuseau horaire</Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="europe_paris">GMT +1:00 - Europe/Paris</SelectItem>
              <SelectItem value="europe_london">GMT +0:00 - Europe/Londres</SelectItem>
              <SelectItem value="america_new_york">GMT -5:00 - Amérique/New York</SelectItem>
              <SelectItem value="america_los_angeles">GMT -8:00 - Amérique/Los Angeles</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Format de date */}
        <div className={FIELD_ROW}>
          <Label className="text-[13px] font-medium text-foreground">Format de date</Label>
          <Select value={dateFormat} onValueChange={setDateFormat}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dd_mm_yyyy">JJ/MM/AAAA</SelectItem>
              <SelectItem value="mm_dd_yyyy">MM/JJ/AAAA</SelectItem>
              <SelectItem value="yyyy_mm_dd">AAAA-MM-JJ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Ouverture des simulations */}
        <div className={FIELD_ROW}>
          <Label className="text-[13px] font-medium text-foreground">Ouvrir en…</Label>
          <RadioGroup
            value={simulationViewMode}
            onValueChange={setSimulationViewMode}
            className="flex items-center gap-5"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="modal" id={id1} />
              <Label htmlFor={id1} className="text-foreground text-[13px] font-normal">Modal</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="fullscreen" id={id2} />
              <Label htmlFor={id2} className="text-foreground text-[13px] font-normal">Plein écran</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Affichage */}
        <div className={FIELD_ROW}>
          <Label className="text-[13px] font-medium text-foreground">Affichage</Label>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={showSimulationNames}
                  onCheckedChange={(checked) => setShowSimulationNames(checked === true)}
                />
                <Label className="text-[13px] font-normal text-foreground">Afficher les noms des simulations</Label>
              </div>
              <div className="text-[11px] text-muted-foreground pl-6">Voir le nom à côté de chaque icône</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={showLinkedReports}
                  onCheckedChange={(checked) => setShowLinkedReports(checked === true)}
                />
                <Label className="text-[13px] font-normal text-foreground">Afficher les rapports liés</Label>
              </div>
              <div className="text-[11px] text-muted-foreground pl-6">Afficher les noms des rapports liés aux simulations</div>
            </div>
          </div>
        </div>

        {/* Visibilité email */}
        <div className={FIELD_ROW}>
          <Label className="text-[13px] font-medium text-foreground">Visibilité de l'email</Label>
          <div className="flex items-center gap-2.5">
            <Switch
              size="sm"
              checked={emailVisibility}
              onCheckedChange={setEmailVisibility}
            />
            <span className="text-[12px] text-muted-foreground">Visible</span>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-[var(--neutral-100)] dark:border-white/[0.06]">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Sauvegarde…' : 'Enregistrer'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Réécrire `notifications.tsx`**

D'abord, lire le fichier actuel pour récupérer toute la logique métier au-delà des 40 premières lignes :

```bash
cat /Users/shounsa/Documents/Workspaces/simex-pro/apps/webapp/src/pages/settings/components/notifications.tsx
```

Puis remplacer **tout le contenu** par (logique métier conservée, markup repolish) :

```tsx
import { useState, useEffect, useId } from 'react';
import { Mail, Bell } from '@/components/keenicons/icons';
import { useAuth } from '@/providers/auth-provider';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

const FIELD_ROW = 'grid grid-cols-1 sm:grid-cols-[170px_minmax(0,1fr)] gap-3 sm:gap-4 items-baseline py-3 border-t border-[var(--neutral-100)] dark:border-white/[0.06] first:border-t-0 first:pt-1';

export function Notifications() {
  const id1 = useId();
  const id2 = useId();
  const id3 = useId();
  const id4 = useId();
  const id5 = useId();
  const id6 = useId();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const [notifEmail, setNotifEmail] = useState(true);
  const [notifBrowser, setNotifBrowser] = useState(false);
  const [notifDesktopLevel, setNotifDesktopLevel] = useState('important');
  const [notifEmailLevel, setNotifEmailLevel] = useState('unread');
  const [notifAutoSubscribe, setNotifAutoSubscribe] = useState(true);

  useEffect(() => {
    if (user) {
      setNotifEmail(user.notifEmail ?? true);
      setNotifBrowser(user.notifBrowser ?? false);
      setNotifDesktopLevel(user.notifDesktopLevel || 'important');
      setNotifEmailLevel(user.notifEmailLevel || 'unread');
      setNotifAutoSubscribe(user.notifAutoSubscribe ?? true);
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.patch('/users/me/settings', {
        notifEmail,
        notifBrowser,
        notifDesktopLevel,
        notifEmailLevel,
        notifAutoSubscribe,
      });
      await refreshUser();
      toast.success('Notifications sauvegardées');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      id="preferences_notifications"
      className="border-[var(--neutral-100)] dark:border-white/[0.06] shadow-[0_1px_2px_rgba(15,26,46,0.04),0_8px_24px_-10px_rgba(15,26,46,0.08)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_-10px_rgba(0,0,0,0.5)]"
    >
      <CardHeader className="flex-col items-start gap-1 pb-4 border-b-0">
        <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-[var(--accent-700)] dark:text-[var(--accent-300)]">
          APPLICATION
        </span>
        <h2 className="font-display text-[19px] font-bold text-foreground m-0">Notifications</h2>
        <p className="text-[13px] text-muted-foreground m-0">Comment vous voulez être prévenu.</p>
      </CardHeader>

      <CardContent className="pt-2">
        {/* Canal email */}
        <div className={FIELD_ROW}>
          <Label className="text-[13px] font-medium text-foreground inline-flex items-center gap-2">
            <Mail className="size-4 text-muted-foreground" />
            Email
          </Label>
          <div className="flex items-center gap-2.5">
            <Switch size="sm" checked={notifEmail} onCheckedChange={setNotifEmail} />
            <span className="text-[12px] text-muted-foreground">Recevoir les notifications par email</span>
          </div>
        </div>

        {/* Niveau email */}
        {notifEmail && (
          <div className={FIELD_ROW}>
            <Label className="text-[13px] font-medium text-foreground">Quand m'envoyer ?</Label>
            <RadioGroup
              value={notifEmailLevel}
              onValueChange={setNotifEmailLevel}
              className="flex flex-col gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unread" id={id1} />
                <Label htmlFor={id1} className="text-foreground text-[13px] font-normal">Quand je n'ai pas lu</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="immediate" id={id2} />
                <Label htmlFor={id2} className="text-foreground text-[13px] font-normal">Immédiatement</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="digest" id={id3} />
                <Label htmlFor={id3} className="text-foreground text-[13px] font-normal">Résumé quotidien</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Canal navigateur */}
        <div className={FIELD_ROW}>
          <Label className="text-[13px] font-medium text-foreground inline-flex items-center gap-2">
            <Bell className="size-4 text-muted-foreground" />
            Navigateur
          </Label>
          <div className="flex items-center gap-2.5">
            <Switch size="sm" checked={notifBrowser} onCheckedChange={setNotifBrowser} />
            <span className="text-[12px] text-muted-foreground">Notifications push du navigateur</span>
          </div>
        </div>

        {/* Niveau navigateur */}
        {notifBrowser && (
          <div className={FIELD_ROW}>
            <Label className="text-[13px] font-medium text-foreground">Quoi notifier ?</Label>
            <RadioGroup
              value={notifDesktopLevel}
              onValueChange={setNotifDesktopLevel}
              className="flex flex-col gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id={id4} />
                <Label htmlFor={id4} className="text-foreground text-[13px] font-normal">Tout</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="important" id={id5} />
                <Label htmlFor={id5} className="text-foreground text-[13px] font-normal">Important uniquement</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id={id6} />
                <Label htmlFor={id6} className="text-foreground text-[13px] font-normal">Rien</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Auto-subscribe */}
        <div className={FIELD_ROW}>
          <Label className="text-[13px] font-medium text-foreground">Suivi automatique</Label>
          <div className="flex items-center gap-2.5">
            <Checkbox
              checked={notifAutoSubscribe}
              onCheckedChange={(checked) => setNotifAutoSubscribe(checked === true)}
            />
            <span className="text-[12px] text-muted-foreground">
              S'abonner aux fils des simulations auxquelles je participe
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-[var(--neutral-100)] dark:border-white/[0.06]">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Sauvegarde…' : 'Enregistrer'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

> **Note importante :** le composant `notifications.tsx` actuel a peut-être un markup légèrement différent (voir le fichier réel). La logique métier (state hooks, useEffect, handleSave, champs) est conservée à l'identique. Si tu vois un champ supplémentaire dans le fichier actuel non listé ci-dessus, ajoute-le dans la même structure `FIELD_ROW`.

- [ ] **Step 4: Réécrire `delete-account.tsx`**

D'abord, lire le fichier actuel intégralement :

```bash
cat /Users/shounsa/Documents/Workspaces/simex-pro/apps/webapp/src/pages/settings/components/delete-account.tsx
```

Puis remplacer **tout le contenu** par (logique métier conservée, markup variant « zone de danger » premium) :

```tsx
import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { clearTokens } from '@/lib/auth';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function DeleteAccount() {
  const { logout: _logout } = useAuth();
  const [confirmed, setConfirmed] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirmed) return;
    setLoading(true);
    try {
      await api.delete('/users/me', { password });
      clearTokens();
      toast.success('Compte supprimé');
      window.location.href = '/auth/sign-in';
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      id="delete_account"
      className="border-[var(--error-200)] dark:border-[var(--error-500)]/30 bg-gradient-to-b from-white to-[var(--error-50)] dark:from-card dark:to-[var(--error-500)]/[0.04] shadow-[0_1px_2px_rgba(220,38,38,0.06),0_8px_24px_-10px_rgba(220,38,38,0.12)]"
    >
      <CardHeader className="flex-col items-start gap-1 pb-4 border-b-0">
        <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-[var(--error-700)] dark:text-[var(--error-300)]">
          ZONE DE DANGER
        </span>
        <h2 className="font-display text-[19px] font-bold text-[var(--error-700)] dark:text-[var(--error-200)] m-0">
          Supprimer le compte
        </h2>
        <p className="text-[13px] text-muted-foreground m-0">
          Action définitive — toutes vos données et simulations seront perdues.
        </p>
      </CardHeader>

      <CardContent className="pt-2 flex flex-col gap-4">
        <div className="text-[13px] text-foreground">
          Pour confirmer la suppression :
          <ul className="list-disc ms-5 mt-2 text-muted-foreground">
            <li>Cochez la case ci-dessous</li>
            <li>Entrez votre mot de passe</li>
            <li>Cliquez sur « Supprimer mon compte »</li>
          </ul>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="confirm-delete"
            checked={confirmed}
            onCheckedChange={(checked) => setConfirmed(checked === true)}
          />
          <Label htmlFor="confirm-delete" className="text-[13px] font-normal text-foreground">
            Je comprends que cette action est irréversible.
          </Label>
        </div>

        {confirmed && (
          <Input
            type="password"
            placeholder="Votre mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}

        <div className="flex justify-end pt-2">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!confirmed || !password || loading}
          >
            {loading ? 'Suppression…' : 'Supprimer mon compte'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

> **Note :** la prop `logout` est récupérée mais préfixée `_` car non utilisée (la redirection se fait via `window.location.href` après `clearTokens()`). Cela évite un warning unused-var. Si TypeScript se plaint quand même, retire `const { logout: _logout } = useAuth();` et le import.

- [ ] **Step 5: Typecheck**

```bash
pnpm --filter @sim360/webapp typecheck
```

Expected : `0 errors`.

- [ ] **Step 6: Commit**

```bash
git add apps/webapp/src/pages/settings/components/basic-settings.tsx \
        apps/webapp/src/pages/settings/components/preferences.tsx \
        apps/webapp/src/pages/settings/components/notifications.tsx \
        apps/webapp/src/pages/settings/components/delete-account.tsx
git commit -m "$(cat <<'EOF'
feat(settings): premium repolish of basic, preferences, notifications, danger cards

Uniform pattern: eyebrow accent + Montserrat title + description + fields
separated by top border + Save row. Danger card uses gradient + red border.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Repolish des cards Auth (email, password, social, 2FA)

**Files:**
- Modify: `apps/webapp/src/pages/settings/components/auth-email.tsx`
- Modify: `apps/webapp/src/pages/settings/components/auth-password.tsx`
- Modify: `apps/webapp/src/pages/settings/components/auth-social.tsx`
- Modify: `apps/webapp/src/pages/settings/components/auth-two-factor.tsx`

### Stratégie

`auth-email`, `auth-password`, `auth-social` sont moyens → réécriture complète.
`auth-two-factor` est gros (~400 lignes, 5 sous-états) → **seulement** changer les headers de chaque variant et le wrapping Card (logique métier intacte).

- [ ] **Step 1: Réécrire `auth-email.tsx`**

Remplacer **tout le contenu** par :

```tsx
import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const FIELD_ROW = 'grid grid-cols-1 sm:grid-cols-[170px_minmax(0,1fr)] gap-3 sm:gap-4 items-baseline py-3 border-t border-[var(--neutral-100)] dark:border-white/[0.06] first:border-t-0 first:pt-1';

export function AuthEmail() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!newEmail.trim() || !password.trim()) return;
    setLoading(true);
    try {
      await api.post('/users/me/change-email', { newEmail, password });
      setSent(true);
      setEditing(false);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors du changement d'email");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setNewEmail('');
    setPassword('');
  };

  return (
    <Card
      id="auth_email"
      className="border-[var(--neutral-100)] dark:border-white/[0.06] shadow-[0_1px_2px_rgba(15,26,46,0.04),0_8px_24px_-10px_rgba(15,26,46,0.08)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_-10px_rgba(0,0,0,0.5)]"
    >
      <CardHeader className="flex-col items-start gap-1 pb-4 border-b-0">
        <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-[var(--accent-700)] dark:text-[var(--accent-300)]">
          COMPTE
        </span>
        <h2 className="font-display text-[19px] font-bold text-foreground m-0">Email</h2>
        <p className="text-[13px] text-muted-foreground m-0">
          Adresse utilisée pour la connexion et les notifications.
        </p>
      </CardHeader>

      <CardContent className="pt-2">
        {sent && (
          <Alert className="mb-3">
            <AlertDescription>
              Un email de vérification a été envoyé à <strong>{newEmail}</strong>. Cliquez sur le lien pour confirmer le changement.
            </AlertDescription>
          </Alert>
        )}

        <div className={FIELD_ROW}>
          <Label className="text-[13px] font-medium text-foreground">Email actuel</Label>
          <Input type="text" value={user?.email || ''} disabled />
        </div>

        {editing ? (
          <>
            <div className={FIELD_ROW}>
              <Label className="text-[13px] font-medium text-foreground">Nouvel email</Label>
              <Input
                type="email"
                placeholder="nouvel@email.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                autoFocus
              />
            </div>
            <div className={FIELD_ROW}>
              <Label className="text-[13px] font-medium text-foreground">Mot de passe</Label>
              <Input
                type="password"
                placeholder="Confirmez avec votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-[var(--neutral-100)] dark:border-white/[0.06]">
              <Button variant="outline" onClick={handleCancel} disabled={loading}>Annuler</Button>
              <Button onClick={handleSubmit} disabled={loading || !newEmail.trim() || !password.trim()}>
                {loading ? 'Envoi…' : 'Envoyer la vérification'}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-[var(--neutral-100)] dark:border-white/[0.06]">
            <Button variant="outline" size="sm" onClick={() => { setEditing(true); setSent(false); }}>
              Changer d'email
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Réécrire `auth-password.tsx`**

Remplacer **tout le contenu** par :

```tsx
import { useState, useMemo } from 'react';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const FIELD_ROW = 'grid grid-cols-1 sm:grid-cols-[170px_minmax(0,1fr)] gap-3 sm:gap-4 items-baseline py-3 border-t border-[var(--neutral-100)] dark:border-white/[0.06] first:border-t-0 first:pt-1';

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score: 20, label: 'Faible', color: 'bg-destructive' };
  if (score <= 3) return { score: 40, label: 'Moyen', color: 'bg-orange-500' };
  if (score <= 4) return { score: 60, label: 'Bon', color: 'bg-yellow-500' };
  if (score <= 5) return { score: 80, label: 'Fort', color: 'bg-emerald-400' };
  return { score: 100, label: 'Excellent', color: 'bg-emerald-500' };
}

function getPasswordErrors(password: string): string[] {
  const errors: string[] = [];
  if (password.length < 8) errors.push('Au moins 8 caractères');
  if (!/[A-Z]/.test(password)) errors.push('Une lettre majuscule');
  if (!/[a-z]/.test(password)) errors.push('Une lettre minuscule');
  if (!/\d/.test(password)) errors.push('Un chiffre');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('Un caractère spécial');
  return errors;
}

export function AuthPassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);
  const errors = useMemo(() => getPasswordErrors(newPassword), [newPassword]);
  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const isValid = errors.length === 0 && !mismatch && currentPassword.length > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      await api.post('/users/me/change-password', { currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Mot de passe modifié');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du changement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      id="auth_password"
      className="border-[var(--neutral-100)] dark:border-white/[0.06] shadow-[0_1px_2px_rgba(15,26,46,0.04),0_8px_24px_-10px_rgba(15,26,46,0.08)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_-10px_rgba(0,0,0,0.5)]"
    >
      <CardHeader className="flex-col items-start gap-1 pb-4 border-b-0">
        <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-[var(--accent-700)] dark:text-[var(--accent-300)]">
          COMPTE
        </span>
        <h2 className="font-display text-[19px] font-bold text-foreground m-0">Mot de passe</h2>
        <p className="text-[13px] text-muted-foreground m-0">Choisissez un mot de passe robuste.</p>
      </CardHeader>

      <CardContent className="pt-2">
        <div className={FIELD_ROW}>
          <Label className="text-[13px] font-medium text-foreground">Mot de passe actuel</Label>
          <Input
            type="password"
            placeholder="Votre mot de passe actuel"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>

        <div className={FIELD_ROW}>
          <Label className="text-[13px] font-medium text-foreground">Nouveau mot de passe</Label>
          <div className="flex flex-col gap-2">
            <Input
              type="password"
              placeholder="Nouveau mot de passe"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            {newPassword.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Progress value={strength.score} className="h-1.5 flex-1" indicatorClassName={strength.color} />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{strength.label}</span>
                </div>
                {errors.length > 0 && (
                  <ul className="text-xs text-muted-foreground space-y-0.5">
                    {errors.map((err) => (
                      <li key={err} className="text-destructive">- {err}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={FIELD_ROW}>
          <Label className="text-[13px] font-medium text-foreground">Confirmer</Label>
          <div className="flex flex-col gap-1">
            <Input
              type="password"
              placeholder="Confirmer le nouveau mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {mismatch && (
              <span className="text-xs text-destructive">Les mots de passe ne correspondent pas</span>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-[var(--neutral-100)] dark:border-white/[0.06]">
          <Button onClick={handleSubmit} disabled={loading || !isValid}>
            {loading ? 'Modification…' : 'Modifier le mot de passe'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Réécrire `auth-social.tsx`**

Remplacer **tout le contenu** par :

```tsx
import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AuthSocial() {
  const { user, refreshUser } = useAuth();
  const [unlinking, setUnlinking] = useState(false);
  const [showUnlinkForm, setShowUnlinkForm] = useState(false);
  const [password, setPassword] = useState('');

  const isGoogleLinked = !!user?.googleId;

  const handleUnlinkGoogle = async () => {
    if (!password) return;
    setUnlinking(true);
    try {
      await api.post('/auth/social/unlink-google', { password });
      toast.success('Compte Google délié avec succès');
      setShowUnlinkForm(false);
      setPassword('');
      await refreshUser();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la déliaison');
    } finally {
      setUnlinking(false);
    }
  };

  const handleLinkGoogle = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
    sessionStorage.setItem('sim360_redirect_after_login', '/settings');
    window.location.href = `${apiUrl}/auth/google`;
  };

  return (
    <Card
      id="auth_social"
      className="border-[var(--neutral-100)] dark:border-white/[0.06] shadow-[0_1px_2px_rgba(15,26,46,0.04),0_8px_24px_-10px_rgba(15,26,46,0.08)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_-10px_rgba(0,0,0,0.5)]"
    >
      <CardHeader className="flex-col items-start gap-1 pb-4 border-b-0">
        <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-[var(--accent-700)] dark:text-[var(--accent-300)]">
          COMPTE
        </span>
        <h2 className="font-display text-[19px] font-bold text-foreground m-0">Connexion sociale</h2>
        <p className="text-[13px] text-muted-foreground m-0">Liez votre compte à des fournisseurs externes.</p>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap border border-[var(--neutral-100)] dark:border-white/[0.06] rounded-xl gap-2 px-4 py-3">
            <div className="flex items-center flex-wrap gap-3">
              <img
                src={toAbsoluteUrl('/media/brand-logos/google.svg')}
                className="size-6 shrink-0"
                alt="Google"
              />
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-semibold text-foreground">Google</span>
                <span className="text-[12px] text-muted-foreground">
                  {isGoogleLinked ? 'Compte Google connecté' : 'Non connecté'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              {isGoogleLinked ? (
                <Button variant="outline" size="sm" onClick={() => setShowUnlinkForm(!showUnlinkForm)}>
                  Délier
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={handleLinkGoogle}>
                  Lier avec Google
                </Button>
              )}
            </div>
          </div>

          {showUnlinkForm && isGoogleLinked && (
            <div className="flex flex-col gap-3 border border-[var(--neutral-100)] dark:border-white/[0.06] rounded-xl p-4 bg-[var(--neutral-50)] dark:bg-white/[0.02]">
              <div className="text-[12px] text-muted-foreground">
                Pour délier votre compte Google, confirmez avec votre mot de passe.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[170px_minmax(0,1fr)] gap-3 sm:gap-4 items-baseline">
                <Label className="text-[13px] font-medium text-foreground">Mot de passe</Label>
                <Input
                  type="password"
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setShowUnlinkForm(false); setPassword(''); }}
                >
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={!password || unlinking}
                  onClick={handleUnlinkGoogle}
                >
                  {unlinking ? 'Déliaison…' : 'Confirmer la déliaison'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: Repolish `auth-two-factor.tsx` — header seulement, logique intacte**

Le fichier a 5 retours JSX distincts (un par étape : idle non-activé, password, qrcode, backup-codes, idle activé). On change uniquement le **wrapping** : la balise `<Card>` racine + son `id` + le `<CardHeader>` premium. **Le reste du JSX (CardContent, Inputs, OTP, etc.) reste identique.**

Lire le fichier actuel :

```bash
cat /Users/shounsa/Documents/Workspaces/simex-pro/apps/webapp/src/pages/settings/components/auth-two-factor.tsx
```

Appliquer 5 modifications par recherche-remplacement :

**Modification 1 — wrapper « idle non-activé »** (vers ligne 123) :

Remplacer :
```tsx
      <Card>
        <CardHeader id="auth_two_factor">
          <div className="flex items-center justify-between">
            <CardTitle>Authentification à deux facteurs (2FA)</CardTitle>
            <Badge variant="outline">Non activé</Badge>
          </div>
        </CardHeader>
```

Par :
```tsx
      <Card
        id="auth_two_factor"
        className="border-[var(--neutral-100)] dark:border-white/[0.06] shadow-[0_1px_2px_rgba(15,26,46,0.04),0_8px_24px_-10px_rgba(15,26,46,0.08)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_-10px_rgba(0,0,0,0.5)]"
      >
        <CardHeader className="flex-col items-start gap-1 pb-4 border-b-0">
          <div className="flex items-center justify-between w-full">
            <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-[var(--accent-700)] dark:text-[var(--accent-300)]">
              COMPTE
            </span>
            <Badge variant="outline">Non activé</Badge>
          </div>
          <h2 className="font-display text-[19px] font-bold text-foreground m-0">
            Authentification à deux facteurs (2FA)
          </h2>
          <p className="text-[13px] text-muted-foreground m-0">
            Renforcez la sécurité de votre compte avec un second facteur.
          </p>
        </CardHeader>
```

**Modification 2 — wrapper « password » (étape 1/3)** (vers ligne 156) :

Remplacer :
```tsx
      <Card>
        <CardHeader id="auth_two_factor">
          <CardTitle>Configurer le 2FA - Étape 1/3</CardTitle>
        </CardHeader>
```

Par :
```tsx
      <Card
        id="auth_two_factor"
        className="border-[var(--neutral-100)] dark:border-white/[0.06] shadow-[0_1px_2px_rgba(15,26,46,0.04),0_8px_24px_-10px_rgba(15,26,46,0.08)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_-10px_rgba(0,0,0,0.5)]"
      >
        <CardHeader className="flex-col items-start gap-1 pb-4 border-b-0">
          <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-[var(--accent-700)] dark:text-[var(--accent-300)]">
            COMPTE · CONFIGURATION 2FA · ÉTAPE 1/3
          </span>
          <h2 className="font-display text-[19px] font-bold text-foreground m-0">
            Confirmez votre mot de passe
          </h2>
        </CardHeader>
```

**Modification 3 — wrapper « qrcode » (étape 2/3)** (vers ligne 192) :

Remplacer :
```tsx
      <Card>
        <CardHeader id="auth_two_factor">
          <CardTitle>Configurer le 2FA - Étape 2/3</CardTitle>
        </CardHeader>
```

Par :
```tsx
      <Card
        id="auth_two_factor"
        className="border-[var(--neutral-100)] dark:border-white/[0.06] shadow-[0_1px_2px_rgba(15,26,46,0.04),0_8px_24px_-10px_rgba(15,26,46,0.08)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_-10px_rgba(0,0,0,0.5)]"
      >
        <CardHeader className="flex-col items-start gap-1 pb-4 border-b-0">
          <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-[var(--accent-700)] dark:text-[var(--accent-300)]">
            COMPTE · CONFIGURATION 2FA · ÉTAPE 2/3
          </span>
          <h2 className="font-display text-[19px] font-bold text-foreground m-0">
            Scannez le QR code
          </h2>
        </CardHeader>
```

**Modification 4 — wrapper « backup-codes »** (vers ligne 257) :

Remplacer :
```tsx
      <Card>
        <CardHeader id="auth_two_factor">
          <CardTitle>Codes de secours</CardTitle>
        </CardHeader>
```

Par :
```tsx
      <Card
        id="auth_two_factor"
        className="border-[var(--neutral-100)] dark:border-white/[0.06] shadow-[0_1px_2px_rgba(15,26,46,0.04),0_8px_24px_-10px_rgba(15,26,46,0.08)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_-10px_rgba(0,0,0,0.5)]"
      >
        <CardHeader className="flex-col items-start gap-1 pb-4 border-b-0">
          <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-[var(--accent-700)] dark:text-[var(--accent-300)]">
            COMPTE · CODES DE SECOURS
          </span>
          <h2 className="font-display text-[19px] font-bold text-foreground m-0">
            Sauvegardez ces codes
          </h2>
          <p className="text-[13px] text-muted-foreground m-0">
            Chaque code ne peut être utilisé qu'une fois — gardez-les en lieu sûr.
          </p>
        </CardHeader>
```

**Modification 5 — wrapper « idle activé »** (vers ligne 292) :

Remplacer :
```tsx
      <Card>
        <CardHeader id="auth_two_factor">
          <div className="flex items-center justify-between">
            <CardTitle>Authentification à deux facteurs (2FA)</CardTitle>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Activé
            </Badge>
          </div>
        </CardHeader>
```

Par :
```tsx
      <Card
        id="auth_two_factor"
        className="border-[var(--neutral-100)] dark:border-white/[0.06] shadow-[0_1px_2px_rgba(15,26,46,0.04),0_8px_24px_-10px_rgba(15,26,46,0.08)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_-10px_rgba(0,0,0,0.5)]"
      >
        <CardHeader className="flex-col items-start gap-1 pb-4 border-b-0">
          <div className="flex items-center justify-between w-full">
            <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-[var(--accent-700)] dark:text-[var(--accent-300)]">
              COMPTE
            </span>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Activé
            </Badge>
          </div>
          <h2 className="font-display text-[19px] font-bold text-foreground m-0">
            Authentification à deux facteurs (2FA)
          </h2>
          <p className="text-[13px] text-muted-foreground m-0">
            Votre compte est protégé par un second facteur.
          </p>
        </CardHeader>
```

- [ ] **Step 5: Retirer l'import `CardTitle` non utilisé dans `auth-two-factor.tsx`**

Trouver la ligne d'import (~ligne 3) :
```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
```

La remplacer par :
```tsx
import { Card, CardContent, CardHeader } from '@/components/ui/card';
```

- [ ] **Step 6: Typecheck**

```bash
pnpm --filter @sim360/webapp typecheck
```

Expected : `0 errors`.

- [ ] **Step 7: Commit**

```bash
git add apps/webapp/src/pages/settings/components/auth-email.tsx \
        apps/webapp/src/pages/settings/components/auth-password.tsx \
        apps/webapp/src/pages/settings/components/auth-social.tsx \
        apps/webapp/src/pages/settings/components/auth-two-factor.tsx
git commit -m "$(cat <<'EOF'
feat(settings): premium repolish of auth cards (email, password, social, 2FA)

Uniform pattern applied. auth-two-factor keeps its 5 sub-state JSX
branches intact — only the Card wrapper and CardHeader change.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Vérification finale (typecheck + Playwright manuel)

**Files:**
- Create: `/tmp/settings-premium-verify.mjs` (script temporaire)

- [ ] **Step 1: Typecheck final**

```bash
pnpm --filter @sim360/webapp typecheck
```

Expected : `0 errors`.

- [ ] **Step 2: Confirmer les suppressions et nettoyages**

```bash
grep -rn "hideContentMode\|LayoutSettings\|layout-selector\|layout-settings\|LayoutSelectorPage" \
  /Users/shounsa/Documents/Workspaces/simex-pro/apps/webapp/src
```

Expected : aucune ligne renvoyée.

```bash
grep -rn "ModeBar\b" /Users/shounsa/Documents/Workspaces/simex-pro/apps/webapp/src
```

Expected : aucune ligne renvoyée.

- [ ] **Step 3: Démarrer l'API et le webapp**

Dans deux terminaux séparés (ou via Bash run_in_background) :

```bash
pnpm --filter @sim360/core build
pnpm --filter @sim360/api dev
```

```bash
pnpm --filter @sim360/webapp dev
```

Attendre que les deux démarrent (webapp sur http://localhost:5173).

- [ ] **Step 4: Écrire le script de vérification Playwright**

Créer `/tmp/settings-premium-verify.mjs` avec :

```js
import pw from '/Users/shounsa/Documents/Workspaces/simex-pro/node_modules/.pnpm/playwright@1.58.2/node_modules/playwright/index.js';
import { mkdirSync } from 'node:fs';

const { chromium } = pw;
const BASE = 'http://localhost:5173';
const API = 'http://localhost:3001/api/v1';
const OUT = '/tmp/settings-premium-verify';

mkdirSync(OUT, { recursive: true });

async function login() {
  const r = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@sim360.dev', password: 'Admin123!' }),
  });
  return (await r.json()).tokens;
}

async function capture({ theme, viewport, label }) {
  const tokens = await login();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport });
  await ctx.addInitScript(
    ([a, rt, th]) => {
      localStorage.setItem('sim360_access_token', a);
      localStorage.setItem('sim360_refresh_token', rt);
      localStorage.setItem('onboarding_tour_completed', 'true');
      localStorage.setItem('theme', th);
      if (th === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    },
    [tokens.accessToken, tokens.refreshToken, theme],
  );
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('PAGE: ' + e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push('CONSOLE: ' + m.text().slice(0, 200));
  });

  await page.goto(`${BASE}/settings`, { waitUntil: 'networkidle' });
  await page.evaluate((th) => {
    if (th === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, theme);
  await page.waitForTimeout(1500);

  // Capture full page
  await page.screenshot({ path: `${OUT}/${label}-full.png`, fullPage: true });
  await page.screenshot({ path: `${OUT}/${label}-viewport.png`, fullPage: false });

  // Click Apparence in sidebar (scrollspy)
  const apparence = await page.$('a[data-scrollspy-anchor="preferences_appearance"]');
  if (apparence) await apparence.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/${label}-apparence.png`, fullPage: false });

  // Click "Fluide" and "Centré" pills, check body.dataset.content
  const fluide = await page.$('button[role="radio"]:has-text("Fluide")');
  if (fluide) {
    await fluide.click();
    await page.waitForTimeout(300);
    const mode = await page.evaluate(() => document.body.dataset.content);
    console.log(`${label} · after click Fluide: body.dataset.content=${mode}`);
  }
  const centre = await page.$('button[role="radio"]:has-text("Centré")');
  if (centre) {
    await centre.click();
    await page.waitForTimeout(300);
    const mode = await page.evaluate(() => document.body.dataset.content);
    console.log(`${label} · after click Centré: body.dataset.content=${mode}`);
  }

  // Verify /settings/layout redirects
  await page.goto(`${BASE}/settings/layout`, { waitUntil: 'networkidle' });
  const finalUrl = page.url();
  console.log(`${label} · /settings/layout → ${finalUrl}`);

  // Verify dashboard no longer has Mode contenu toggle in PageHeader
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const modeBarCount = await page.$$eval('[aria-label="Mode contenu"]', (els) => els.length);
  console.log(`${label} · dashboard ModeBar count (expect 0): ${modeBarCount}`);
  await page.screenshot({ path: `${OUT}/${label}-dashboard-header.png`, fullPage: false });

  console.log(`${label} · errors: ${errors.length}`);
  if (errors.length) console.log('  ', errors.slice(0, 3).join('\n  '));
  await browser.close();
}

await capture({ theme: 'light', viewport: { width: 1440, height: 1100 }, label: 'desktop-light' });
await capture({ theme: 'dark', viewport: { width: 1440, height: 1100 }, label: 'desktop-dark' });
await capture({ theme: 'light', viewport: { width: 375, height: 812 }, label: 'mobile-light' });

console.log('\nDone — see /tmp/settings-premium-verify/');
```

- [ ] **Step 5: Exécuter le script**

```bash
node /tmp/settings-premium-verify.mjs
```

Expected output :
```
desktop-light · after click Fluide: body.dataset.content=fluide
desktop-light · after click Centré: body.dataset.content=centre
desktop-light · /settings/layout → http://localhost:5173/settings
desktop-light · dashboard ModeBar count (expect 0): 0
desktop-light · errors: 0
desktop-dark · ...similar...
mobile-light · ...similar...
```

- [ ] **Step 6: Inspecter les captures**

```bash
ls /tmp/settings-premium-verify/
```

Ouvrir chaque PNG et vérifier visuellement :

| Capture                       | À vérifier                                                                |
|-------------------------------|--------------------------------------------------------------------------|
| `desktop-light-full.png`      | PageHeader + 2 colonnes + cards premium + zone de danger rouge en bas    |
| `desktop-light-apparence.png` | Card Apparence : eyebrow APPARENCE + thème + sidebar transparente + Mode contenu (2 pills) |
| `desktop-dark-full.png`       | Cards `brand-800` sur fond `brand-950`, eyebrows accent-300, contraste OK |
| `mobile-light-full.png`       | Sidebar interne masquée, cards en pleine largeur, pas d'overflow horizontal |
| `*-dashboard-header.png`      | Aucun toggle « Mode contenu » sous le titre du dashboard                  |

- [ ] **Step 7: Commit éventuel (pas de change code attendu en step 8)**

Si tout est vert, pas de commit nécessaire. Si tu as ajusté du code en réaction à un problème détecté, commit séparé avec message du type :

```bash
git commit -m "$(cat <<'EOF'
fix(settings): <description du fix détecté lors de la vérif>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 8: Pousser sur main**

```bash
git push origin main
```

Expected : push réussi.

- [ ] **Step 9: Nettoyer le script temporaire**

```bash
rm /tmp/settings-premium-verify.mjs
rm -rf /tmp/settings-premium-verify
```

---

## Acceptance criteria (rappel du spec)

À cocher en fin de Task 8 :

- [ ] `/settings` rendue avec PageHeader (« Compte / Paramètres » + titre « Paramètres » + sous-titre).
- [ ] Sidebar interne 230px sticky, 3 groupes (Compte / Application / Avancé), 9 items, pas de « Mise en page ».
- [ ] Toutes les cards ont le pattern : eyebrow accent + titre Montserrat + description + actions alignées à droite.
- [ ] Card Apparence contient Thème + Sidebar transparente + Mode contenu (2 pills role=radio).
- [ ] Clic sur Mode contenu modifie `document.body.dataset.content` (`'fluide'` ou `'centre'`).
- [ ] `/dashboard`, `/simulations/:id`, `/meetings` ne montrent plus de toggle Mode contenu sous le PageHeader.
- [ ] `/settings/layout` redirige vers `/settings`.
- [ ] Pas d'item « Layout » dans les menus (sidebar, mega menu desktop, mega menu mobile).
- [ ] Dark mode : tous les éléments lisibles, eyebrows accent-300, scrollspy actif accent-500/12.
- [ ] Mobile 375px : pas de scroll horizontal, sidebar interne masquée.
- [ ] Aucun warning console.
- [ ] `pnpm --filter @sim360/webapp typecheck` vert.

---

## Self-review

J'ai relu le plan contre le spec :

**Spec coverage :**
- ✅ PageHeader cohérent dashboard → Task 4
- ✅ Sidebar scrollspy polish premium → Task 3
- ✅ Cards premium (eyebrow + titre + description) → Tasks 5/6/7
- ✅ Mode contenu intégré dans Apparence → Task 5
- ✅ ModeBar retiré du PageHeader → Task 1
- ✅ LayoutSettings card supprimée → Task 4 step 2
- ✅ layout-selector.tsx supprimé → Task 4 step 2
- ✅ Route `/settings/layout` redirige → Task 2 step 1
- ✅ Entrées menu « Layout » retirées → Task 2 steps 2-4
- ✅ Dark mode (tokens sémantiques + variantes accent) → couvert dans chaque task
- ✅ A11y (role=radiogroup, aria-label, scrollspy nav) → couvert
- ✅ Acceptance criteria → checklist finale
- ✅ Risks (hideContentMode résidu, ScrollspyMenu cassé, useLayoutSwitcher hors UI) → vérifs grep dans Tasks 1/2/8

**Placeholder scan :**
- Aucun TBD / TODO / fill in details.
- Le « Note importante » sur `notifications.tsx` step 3 demande de vérifier le fichier réel — c'est de la prudence légitime, pas un placeholder.
- Toutes les commandes ont leur sortie attendue.

**Type consistency :**
- `SettingsScrollspyItem`/`SettingsScrollspyGroup` (Task 3) ne sont référencés que dans Task 3 — pas de fuite.
- `FIELD_ROW` (constante string) répétée dans chaque card simple — DRY relatif, mais accepté pour rester self-contained par fichier.
- `useShellState` / `contentMode` / `setContentMode` consistents entre Task 1 (suppression import) et Task 5 (ajout import).

Plan complet.
