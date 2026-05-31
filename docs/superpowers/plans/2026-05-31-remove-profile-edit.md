# Suppression de `/profile/edit` — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Supprimer la page `/profile/edit` (doublon de `/settings`) et rediriger toutes ses références vers `/settings`.

**Architecture:** La route `/profile/edit` est remplacée par un `<Navigate to="/settings" replace />`. L'import de `EditProfilePage` est retiré. Les 6 occurrences de `path: '/profile/edit'` dans `menu.config.ts` sont mises à jour. Le fichier `edit-profile.tsx` est supprimé.

**Tech Stack:** React Router v7 (`Navigate`), TypeScript, pnpm workspace.

---

## Fichiers touchés

| Action | Fichier |
|--------|---------|
| `MODIFY` | `apps/webapp/src/routing/app-routing-setup.tsx` |
| `MODIFY` | `apps/webapp/src/config/menu.config.ts` |
| `DELETE` | `apps/webapp/src/pages/profile/edit-profile.tsx` |

---

## Task 1 — Route redirect + suppression import

**Fichiers :**
- Modify: `apps/webapp/src/routing/app-routing-setup.tsx`

> Contexte : `Navigate` est déjà importé depuis `react-router` (ligne 2). L'import `EditProfilePage` (ligne 18) est le seul à supprimer.

- [ ] **Step 1 : Supprimer l'import `EditProfilePage`**

Ouvrir `apps/webapp/src/routing/app-routing-setup.tsx`.

Supprimer la ligne 18 :
```tsx
import { EditProfilePage } from '@/pages/profile/edit-profile';
```

Le fichier commence à la ligne 1 par :
```tsx
import { lazy, Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router';
```
`Navigate` est déjà là — aucun import à ajouter.

- [ ] **Step 2 : Remplacer la route `/profile/edit`**

À la ligne 67, remplacer :
```tsx
<Route path="/profile/edit" element={<EditProfilePage />} />
```

Par :
```tsx
<Route path="/profile/edit" element={<Navigate to="/settings" replace />} />
```

- [ ] **Step 3 : Vérifier le typecheck**

```bash
pnpm --filter @sim360/webapp typecheck
```

Résultat attendu : aucune erreur. Si TypeScript signale que `EditProfilePage` est introuvable, vérifier que l'import a bien été supprimé à l'étape 1.

- [ ] **Step 4 : Commit**

```bash
git add apps/webapp/src/routing/app-routing-setup.tsx
git commit -m "feat(webapp): redirect /profile/edit → /settings

Remove EditProfilePage import and replace route with Navigate redirect.
Bookmarks and existing links are preserved via 302-equivalent replace.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 2 — Nettoyage des menus

**Fichiers :**
- Modify: `apps/webapp/src/config/menu.config.ts`

> Contexte : le fichier contient **6 occurrences** de `'/profile/edit'` réparties dans 5 exports (`APP_SIDEBAR_MENU`, `APP_HEADER_MENU`, `APP_ICON_RAIL_MENU`, `APP_MEGA_MENU`, `APP_MEGA_MENU_MOBILE`).

- [ ] **Step 1 : Mettre à jour `APP_SIDEBAR_MENU`**

Remplacer le bloc "Mon Profil" (lignes 51–59) :

```typescript
// AVANT
{
  title: 'Mon Profil',
  icon: UserCircle,
  path: '/profile/edit',
  children: [
    { title: 'Editer le profil', path: '/profile/edit' },
    { title: 'Onboarding', path: '/onboarding' },
  ],
},
```

Par :

```typescript
// APRÈS
{
  title: 'Mon Profil',
  icon: UserCircle,
  path: '/settings',
},
```

> Le sous-menu enfant est supprimé entièrement : "Editer le profil" devient redondant (redirige vers `/settings`), et "Onboarding" n'est pas lié au profil.

- [ ] **Step 2 : Mettre à jour `APP_HEADER_MENU`**

Remplacer (ligne 85) :
```typescript
{ title: 'Mon Profil', path: '/profile/edit', icon: UserCircle },
```

Par :
```typescript
{ title: 'Mon Profil', path: '/settings', icon: UserCircle },
```

- [ ] **Step 3 : Mettre à jour `APP_ICON_RAIL_MENU`**

Remplacer (lignes 123–127) :
```typescript
{
  title: 'Mon Profil',
  icon: UserCircle,
  path: '/profile/edit',
  rootPath: '/profile',
},
```

Par :
```typescript
{
  title: 'Mon Profil',
  icon: UserCircle,
  path: '/settings',
  rootPath: '/settings',
},
```

- [ ] **Step 4 : Mettre à jour `APP_MEGA_MENU`**

Remplacer (ligne 167) :
```typescript
{ title: 'Mon Profil', icon: UserCircle, path: '/profile/edit' },
```

Par :
```typescript
{ title: 'Mon Profil', icon: UserCircle, path: '/settings' },
```

- [ ] **Step 5 : Mettre à jour `APP_MEGA_MENU_MOBILE`**

Remplacer (ligne 216) :
```typescript
{ title: 'Mon Profil', icon: UserCircle, path: '/profile/edit' },
```

Par :
```typescript
{ title: 'Mon Profil', icon: UserCircle, path: '/settings' },
```

- [ ] **Step 6 : Vérifier qu'il ne reste aucune occurrence**

```bash
grep -n "profile/edit" apps/webapp/src/config/menu.config.ts
```

Résultat attendu : aucune ligne affichée.

- [ ] **Step 7 : Typecheck**

```bash
pnpm --filter @sim360/webapp typecheck
```

Résultat attendu : aucune erreur.

- [ ] **Step 8 : Commit**

```bash
git add apps/webapp/src/config/menu.config.ts
git commit -m "feat(webapp): update all menus — /profile/edit → /settings

APP_SIDEBAR_MENU: remove children, point to /settings
APP_HEADER_MENU: /profile/edit → /settings
APP_ICON_RAIL_MENU: /profile/edit → /settings, rootPath updated
APP_MEGA_MENU: /profile/edit → /settings
APP_MEGA_MENU_MOBILE: /profile/edit → /settings

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 3 — Suppression du fichier + vérification finale

**Fichiers :**
- Delete: `apps/webapp/src/pages/profile/edit-profile.tsx`

- [ ] **Step 1 : Vérifier qu'aucun fichier n'importe encore `edit-profile`**

```bash
grep -r "edit-profile\|EditProfilePage" apps/webapp/src --include="*.tsx" --include="*.ts"
```

Résultat attendu : aucune ligne affichée. Si des lignes apparaissent, corriger ces imports avant de continuer.

- [ ] **Step 2 : Supprimer le fichier**

```bash
git rm apps/webapp/src/pages/profile/edit-profile.tsx
```

- [ ] **Step 3 : Typecheck final**

```bash
pnpm --filter @sim360/webapp typecheck
```

Résultat attendu : aucune erreur TypeScript.

- [ ] **Step 4 : Vérification navigateur**

Démarrer le serveur de développement si pas déjà en cours :
```bash
pnpm --filter @sim360/webapp dev
```

Ouvrir `http://localhost:5173/profile/edit` dans le navigateur.

Résultat attendu : la page redirige automatiquement vers `http://localhost:5173/settings`.

- [ ] **Step 5 : Commit final**

```bash
git add -A
git commit -m "feat(webapp): delete edit-profile.tsx — fully consolidated into /settings

The /profile/edit route now redirects to /settings.
All menu references updated. File removed.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```
