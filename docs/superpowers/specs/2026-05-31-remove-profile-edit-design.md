# Spec — Suppression de `/profile/edit`

**Date :** 2026-05-31  
**Statut :** Validé

## Contexte

La page `/profile/edit` est un doublon de `/settings`. Toutes ses sections (photo, informations personnelles, préférences, mot de passe) existent déjà dans `/settings` sous la section `#basic_settings` et `#auth_password`. La page legacy n'apporte aucune valeur supplémentaire et crée une confusion de navigation.

## Objectif

Supprimer `/profile/edit` et consolider l'édition du profil dans `/settings`, sans régression utilisateur.

## Changements

### 1. Suppression du fichier page

**Fichier à supprimer :**
```
apps/webapp/src/pages/profile/edit-profile.tsx
```

### 2. Mise à jour des routes

**Fichier :** `apps/webapp/src/routing/app-routing-setup.tsx`

Remplacer :
```tsx
import { EditProfilePage } from '@/pages/profile/edit-profile';
// ...
<Route path="/profile/edit" element={<EditProfilePage />} />
```

Par :
```tsx
// (import EditProfilePage supprimé)
// ...
<Route path="/profile/edit" element={<Navigate to="/settings" replace />} />
```

`Navigate` est déjà importé depuis `react-router-dom` (utilisé par la route `/settings/layout` existante).

### 3. Mise à jour des menus

**Fichier :** `apps/webapp/src/config/menu.config.ts`

Quatre occurrences de `path: '/profile/edit'` à mettre à jour :

#### APP_SIDEBAR_MENU — entrée "Mon Profil"

Avant :
```typescript
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

Après :
```typescript
{
  title: 'Paramètres du profil',
  icon: UserCircle,
  path: '/settings',
},
```

> Supprimer le groupe enfant : l'entrée "Editer le profil" devient redondante, "Onboarding" n'est pas lié au profil et peut être retiré de ce groupe (il reste accessible via sa propre route).

#### APP_HEADER_MENU

Avant :
```typescript
{ title: 'Mon Profil', path: '/profile/edit' }
```

Après :
```typescript
{ title: 'Mon Profil', path: '/settings' }
```

#### APP_ICON_RAIL_MENU

Avant :
```typescript
{ title: 'Mon Profil', path: '/profile/edit', rootPath: '/profile' }
```

Après :
```typescript
{ title: 'Mon Profil', path: '/settings', rootPath: '/settings' }
```

#### APP_MEGA_MENU

Avant :
```typescript
{ title: 'Mon Profil', path: '/profile/edit' }
```

Après :
```typescript
{ title: 'Mon Profil', path: '/settings' }
```

## Ce qui ne change pas

- La route `/onboarding` reste inchangée.
- La route `/settings` et tous ses composants restent inchangés.
- Aucun changement backend.
- Aucune migration de données.

## Critères d'acceptation

1. Naviguer vers `/profile/edit` redirige vers `/settings` (code HTTP 302 côté navigateur, `replace` dans l'historique).
2. Tous les liens de menu "Mon Profil" (sidebar, header, icon rail, mega menu) pointent vers `/settings`.
3. `edit-profile.tsx` n'existe plus dans le dépôt.
4. Aucune erreur TypeScript (`pnpm --filter @sim360/webapp typecheck` passe).
5. La sidebar ne contient plus de sous-menu enfant sous "Mon Profil".
