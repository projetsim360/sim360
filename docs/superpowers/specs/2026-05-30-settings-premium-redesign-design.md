# Design spec — Paramètres premium

**Date :** 2026-05-30
**Sous-projet :** Refonte de la page `/settings`
**Branche cible :** `main` (workflow direct)
**Auteur :** brainstorming validé avec l'utilisateur

---

## Intent

Rendre la page `/settings` cohérente avec le reste du produit (PageHeader
identique au dashboard) et lui donner un visuel premium en gardant la
structure 2 colonnes (scrollspy + cards). En profiter pour :

- **Ajouter** un contrôle « Mode contenu » (Fluide / Centré 1080px) dans la
  carte Apparence.
- **Retirer** le toggle « Mode contenu » du `PageHeader` (qui apparaissait sur
  toutes les pages premium). `/settings` devient la source unique.
- **Supprimer** la fonctionnalité de changement de layout (route, carte,
  entrées menu, fichiers morts).

Le shell général de l'application (sidebar Simex pro, topbar) n'est **pas
touché** — seule la zone de contenu de `/settings` évolue.

## Hors-scope

- Pas de nouvelle section « Suivi des simulations » sur `/settings`.
- Pas de bouton « Nouvelle simulation ».
- Pas de migration TanStack Query (les composants existants utilisent
  `useEffect + api.patch` — on garde le même pattern).
- Pas de changement de schéma BDD (les champs `/users/me/settings` restent
  identiques).
- Le `LayoutSwitcherProvider` et `DynamicLayout` restent en place
  (infrastructure : utilisés par le `SimexShell`). Seule l'UI utilisateur
  qui permettait de changer de layout disparaît.

---

## Visual direction

Style premium, sobre, cohérent avec le reste du produit.

- **PageHeader** : identique au dashboard — breadcrumb 11px neutral, titre
  Montserrat extrabold 30-40px brand-700, sous-titre 14px neutral-500. Pas
  de hero coloré.
- **Sidebar scrollspy interne** : 230px sticky. Groupes (« Compte »,
  « Application », « Avancé ») en eyebrow uppercase neutral-400. Items
  inactifs neutral-500 médium, actif accent-700 bold avec liseré gauche
  3px accent-500 et fond accent-50.
- **Cards** : `bg-card` + bordure `border-border` + radius 14px + double
  shadow (1px subtle + 24px diffuse). Padding 22px×26px desktop. Chaque
  carte = eyebrow accent (uppercase 11px) + h3 Montserrat 18-19px + ligne
  de description neutral-500 + champs séparés par borders top neutral-100.
- **Champs** : grille 170px / 1fr — label gauche + contrôle droite. Inputs
  fond `muted/40` + bordure neutral-200 + radius 7px.
- **Boutons** : action primary accent-500 avec shadow accent, secondaires
  outline neutral-200. Actions alignées à droite, séparées par un border
  top.
- **Zone de danger** : fond gradient blanc → red-50, bordure red-200, h3
  red-900, eyebrow red-600, bouton outline red-200 sur fond red-50.

## Dark mode

Tous les composants utilisent les **tokens sémantiques** (`bg-card`,
`text-foreground`, `text-muted-foreground`, `border-border`) qui flippent
automatiquement via `.dark` dans `globals.css`. Quelques règles
explicites :

- Eyebrow accent : `text-[var(--accent-700)] dark:text-[var(--accent-300)]`
- Scrollspy item actif : `bg-[var(--accent-50)] dark:bg-[var(--accent-500)]/12`
- Titres : `text-foreground` (déjà flippé)
- Bordures intra-carte : `border-border` (déjà flippé)
- CTA accent-500 : conserve son fond + shadow (la même couleur fonctionne
  sur light et dark)
- Zone de danger en dark : `bg-card` + `border-[var(--error-500)]/30`,
  texte `text-[var(--error-300)]` (déjà polish du dark mode pattern
  appliqué au reste du cockpit)

---

## Layout

Structure de la page (intérieur du SimexShell, qui n'est pas touché) :

```
┌── apps/webapp/src/pages/settings/index.tsx ──────────────────────────┐
│                                                                       │
│  <PageHeader                                                           │
│    breadcrumbs={[{ label: 'Compte' }, { label: 'Paramètres' }]}        │
│    title="Paramètres"                                                  │
│    subtitle="Gérez votre profil, votre sécurité et vos préférences." │
│  />                                                                    │
│                                                                       │
│  <div class="px-6 pb-8">                                               │
│    <div class="grid grid-cols-[230px_1fr] gap-7"> (lg+)                │
│                                                                       │
│      ┌── <SettingsSidebar /> (sticky top-4) ──┐                       │
│      │                                          │                      │
│      │  COMPTE                                  │                      │
│      │  ● Profil                                │                      │
│      │  ● Email                                 │                      │
│      │  ● Mot de passe                          │                      │
│      │  ● Connexion sociale                     │                      │
│      │  ● Double auth.                          │                      │
│      │                                          │                      │
│      │  APPLICATION                             │                      │
│      │  ● Préférences                           │                      │
│      │  ● Apparence  ← actif                    │                      │
│      │  ● Notifications                         │                      │
│      │                                          │                      │
│      │  AVANCÉ                                  │                      │
│      │  ● Supprimer le compte (rouge)           │                      │
│      └──────────────────────────────────────────┘                      │
│                                                                       │
│      ┌── <BasicSettings /> ──────────────────────────────────────┐    │
│      │  COMPTE · Profil                                            │    │
│      ├────────────────────────────────────────────────────────────┤    │
│      │  <AuthEmail />                                              │    │
│      │  <AuthPassword />                                           │    │
│      │  <AuthSocial />                                             │    │
│      │  <AuthTwoFactor />                                          │    │
│      │  <Preferences />                                            │    │
│      │  <Appearance />  ← contient Mode contenu maintenant         │    │
│      │  <Notifications />                                          │    │
│      │  <DeleteAccount />                                          │    │
│      └────────────────────────────────────────────────────────────┘    │
│    </div>                                                              │
│  </div>                                                                │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

**Mobile (< lg) :** la sidebar disparaît (mêmes 0 colonnes que l'actuel
via `useIsMobile`), les cards prennent toute la largeur, scroll naturel.

---

## Sections finales

L'ordre et l'identité des cartes restent ceux d'aujourd'hui, **sauf**
suppression de `<LayoutSettings />` et intégration de Mode contenu dans
`<Appearance />`.

| Ordre | Composant         | Scrollspy target       | Groupe       |
|-------|-------------------|------------------------|--------------|
| 1     | BasicSettings     | `basic_settings`       | Compte       |
| 2     | AuthEmail         | `auth_email`           | Compte       |
| 3     | AuthPassword      | `auth_password`        | Compte       |
| 4     | AuthSocial        | `auth_social`          | Compte       |
| 5     | AuthTwoFactor     | `auth_two_factor`      | Compte       |
| 6     | Preferences       | `preferences_general`  | Application  |
| 7     | Appearance        | `preferences_appearance` | Application |
| 8     | Notifications     | `preferences_notifications` | Application |
| 9     | DeleteAccount     | `delete_account`       | Avancé       |

---

## Détail des changements par composant

### `pages/settings/index.tsx`

- Remplacer `<Toolbar><ToolbarHeading title="Paramètres" /></Toolbar>` par
  `<PageHeader breadcrumbs={[{ label: 'Compte' }, { label: 'Paramètres' }]} title="Paramètres" subtitle="Gérez votre profil, votre sécurité et vos préférences." />`.
- Container : retirer `container` (le PageHeader gère son propre padding
  `px-6 pt-6`). Wrapper enfant : `<div className="px-6 pb-8">` pour la
  zone 2 colonnes.
- Grille interne : `grid grid-cols-[230px_1fr] gap-7 lg:gap-7.5` (au lieu
  du `flex grow gap-5` actuel).
- **Retirer** l'import et l'usage de `<LayoutSettings />`.
- Le scrollspy garde son `parentRef` pattern actuel (recherche du
  conteneur `.kt-scrollable-y-auto`).

### `pages/settings/components/settings-sidebar.tsx`

- Restructurer en 3 groupes (Compte / Application / Avancé) au lieu des
  groupes actuels (Authentification, Paramètres avancés, Mise en page).
- Fusion de la sous-section « Authentification » en items plats de niveau
  1 (Profil, Email, Mot de passe, Connexion sociale, Double auth.) — la
  hiérarchie 2 niveaux du `ScrollspyMenu` n'est plus utile maintenant
  qu'il n'y a qu'un seul groupe Auth.
- **Retirer** l'item `layout_settings`.
- Item « Supprimer le compte » : ajouter classe `text-[var(--error-700)]
  dark:text-[var(--error-300)]` pour signaler la zone de danger.

**Décision tranchée :** on n'utilise plus le composant partagé
`ScrollspyMenu` (`layouts/layout-1/shared/navbar/scrollspy-menu.tsx`) qui
a un visuel Metronic standard. On crée un sous-composant local
`<SettingsScrollspy>` directement dans `settings-sidebar.tsx` qui :

- Itère la même structure de données (groupes + items avec `target`).
- Émet les mêmes ancres `data-scrollspy-anchor={target}` que le hook
  `Scrollspy` attend déjà côté `index.tsx`.
- Applique le visuel premium custom (eyebrow groupe, hover, liseré
  orange actif).

Pas de modification de `ScrollspyMenu` (intact pour d'éventuels futurs
usages). Pas de nouveau composant UI partagé dans `components/ui/`
(spécifique à `/settings`).

### `pages/settings/components/appearance.tsx`

- Ajouter un nouveau champ Mode contenu sous le toggle « Sidebar
  transparente ».
- Source : `useShellState()` depuis
  `@/components/layouts/simex-shell/state/shell-state-provider` —
  `contentMode` et `setContentMode`.
- UI : pills group (réutiliser le composant `Toggle` / `ToggleGroup` UI
  existant, ou pattern Tabs si plus simple). Deux valeurs :
  - `fluide` → label « Fluide (data) »
  - `centre` → label « Centré 1080px (lecture) »
- Le toggle écrit directement dans le `ShellStateProvider` (qui sync
  `localStorage` + `document.body.dataset.content`). Pas besoin de bouton
  « Enregistrer » spécifique pour ce champ — c'est cohérent avec le
  comportement actuel.
- Label de la section devient : « Thème et présentation » (au lieu de
  juste « Apparence »).

### `pages/settings/components/layout-settings.tsx`

- **Fichier supprimé entièrement.**

### `pages/settings/layout-selector.tsx`

- **Fichier mort à supprimer.** Le routing pointe `/settings/layout` vers
  `SettingsPage` (pas vers `LayoutSelectorPage`) — donc le fichier n'est
  importé nulle part dans le routing actif, c'est du code mort.

### `components/page-header/index.tsx`

- **Retirer** la prop `hideContentMode` (lignes 29-30).
- **Retirer** le bloc `{!hideContentMode && (<ModeBar ... />)}` (lignes
  114-119).
- **Retirer** la `function ModeBar(...)` et les imports liés
  (`useShellState`, `ContentMode`, `ModeBarProps`, `ModeButtonProps`,
  `ModeButton`).
- Le `PageHeader` redevient un simple breadcrumb + titre + actions.

### `features/meeting/pages/meeting-room.tsx`

- Ligne 116 : retirer le prop `hideContentMode` du `<PageHeader>` (le prop
  n'existe plus).

### `routing/app-routing-setup.tsx`

- Ligne 69 : **retirer** la route `<Route path="/settings/layout"
  element={<SettingsPage />} />`. Optionnel : redirect `/settings/layout`
  → `/settings` via `<Navigate to="/settings" replace />` pour les URLs
  bookmarkées. Décision : **on fait le redirect** (1 ligne, sauve les
  bookmarks).

### `config/menu.config.ts`

- **Retirer** les entrées de menu « Layout » dans :
  - `APP_SIDEBAR_MENU` (lignes 60-68 : enfant « Layout » à retirer du
    bloc « Paramètres », garder seulement « Général »)
  - `APP_MEGA_MENU` (ligne 172 : entrée « Layout » à retirer)
  - `APP_MEGA_MENU_MOBILE` (ligne 222 : entrée « Layout » à retirer)
- Le menu « Paramètres » devient un item plat (sans children), pointant
  directement vers `/settings`.

---

## API / data

**Aucun changement backend.** Tous les champs sont déjà supportés :

- `PATCH /users/me/settings` — accepte déjà tous les champs concernés
  (theme, sidebarTransparent, etc.).
- `contentMode` est purement client (localStorage + ShellState), pas de
  persistance BDD. C'est cohérent avec le comportement actuel.
- `layoutPreference` n'est plus touché par l'UI — mais le champ reste
  dans `/users/me/settings` (legacy, ne casse rien).

---

## Composants UI existants à réutiliser

- `Card`, `CardContent`, `CardHeader`, `CardTitle` (cards premium —
  appliquer les classes utilitaires dans le markup, pas de nouvelle
  variante CVA)
- `Button` (variants `primary`, `outline`)
- `Switch`, `Checkbox`, `RadioGroup`, `Select`, `Input`, `Textarea`,
  `Label`
- `PageHeader` (déjà existant — on l'utilise tel quel après retrait du
  ModeBar)
- `<SettingsScrollspy>` (sous-composant local créé dans `settings-sidebar.tsx`)
  qui émet les ancres `data-scrollspy-anchor` consommées par le hook
  `Scrollspy` du PageHeader scrollspy mécanisme
- `KeenIcon` pour les icônes

**Pas de nouveau composant UI partagé.** Tout le visuel premium est de la
composition Tailwind dans les composants existants.

---

## A11y

- Sidebar scrollspy : navigation clavier déjà gérée par le composant
  `ScrollspyMenu`. Item actif a `aria-current="location"`.
- Champ « Mode contenu » : `role="radiogroup"` (ou réutiliser `Toggle`
  existant qui gère déjà l'aria). `aria-label="Largeur du contenu de
  page"`.
- Boutons « Enregistrer » : `disabled` quand loading, `aria-busy`.
- Zone de danger : `role="alert"` sur le wrapper de confirmation pour
  être annoncée aux lecteurs d'écran lors d'une action destructive.
- Focus visible respecté partout (ring-2 ring-accent-500 ring-offset-2).

---

## Acceptance criteria

1. **Sur `/settings`** :
   - PageHeader rendu avec breadcrumb « Compte / Paramètres » et titre
     « Paramètres ».
   - Sidebar interne 230px sticky avec 3 groupes et 9 items (pas de
     « Mise en page »).
   - Cards premium avec eyebrow accent + titre Montserrat + description
     + actions alignées droite.
   - Carte Apparence contient les 3 champs : Thème, Sidebar transparente,
     **Mode contenu**.
   - Aucun item « Layout » dans le menu général sidebar / mega-menus.

2. **Mode contenu** :
   - Change dans `/settings/Apparence` met à jour `document.body.dataset.content`
     et persiste dans `localStorage.simex.content-mode`.
   - Le toggle n'apparaît plus sur `/dashboard`, `/simulations/:id`,
     `/simulations`, `/meetings`, etc.

3. **Suppression du Layout switcher** :
   - L'URL `/settings/layout` redirige (HTTP via React Router `Navigate`)
     vers `/settings`.
   - Aucun lien dans l'app ne mène plus vers `/settings/layout`.
   - Les fichiers `pages/settings/components/layout-settings.tsx` et
     `pages/settings/layout-selector.tsx` n'existent plus.

4. **Dark mode** :
   - Toggle thème sombre → tous les éléments restent lisibles (text-foreground,
     bg-card, border-border).
   - Eyebrows accent passent à `accent-300` (orange clair).
   - Scrollspy item actif a fond `accent-500/12` au lieu de `accent-50`.
   - Zone de danger lisible en dark (bordure et texte rouge clair).

5. **Responsive** :
   - < 1024px (mobile) : sidebar disparaît, cards en pleine largeur,
     PageHeader empile titre + actions.
   - ≥ 1024px : grille 230px + 1fr avec gap 28px.

6. **Régressions** :
   - Aucun warning console.
   - Toutes les autres pages utilisant PageHeader continuent de
     fonctionner (sans le toggle Mode contenu).
   - `meeting-room.tsx` n'utilise plus `hideContentMode` (prop retiré).
   - `typecheck` vert.
   - Vérif Playwright manuelle : `/settings` en light + dark mode +
     mobile 375px sans overflow.

---

## Risks

- **Risque : oublier un usage de `hideContentMode`.** Mitigation : un
  `grep -rn "hideContentMode" apps/webapp` doit retourner 0 résultats
  après la PR.
- **Risque : oublier un usage de `useLayoutSwitcher` dans le UI utilisateur.**
  Mitigation : seuls `layout-settings.tsx` et `layout-selector.tsx`
  doivent disparaître. `dynamic-layout.tsx` et `App.tsx` continuent
  d'utiliser le provider (infrastructure).
- **Risque : le sous-composant `<SettingsScrollspy>` casse le hook
  `Scrollspy`.** Mitigation : conserver la même prop `data-scrollspy-anchor={target}`
  sur chaque item — c'est l'unique contrat avec le hook (vérifié dans
  `scrollspy-menu.tsx:24`).
- **Risque : un toast « Apparence sauvegardée » s'affiche au changement
  de Mode contenu (alors qu'il n'y a pas de sauvegarde BDD).**
  Mitigation : le `setContentMode` du ShellState écrit en localStorage
  uniquement — pas de toast attendu, pas d'API call. Le bouton
  « Enregistrer » de la carte Apparence reste pour Thème + Sidebar
  transparente.
- **Risque : bookmark vers `/settings/layout` retourne une 404 cassée.**
  Mitigation : le `<Navigate to="/settings" replace />` couvre ce cas.

---

## Verification (manuelle, pas de runner front)

1. `pnpm --filter @sim360/webapp typecheck` → 0 erreur.
2. `pnpm --filter @sim360/webapp dev` → ouvrir `/settings`.
3. Vérifier visuellement chaque acceptance criterion (light + dark + 375px).
4. Cliquer chaque toggle / radio / pill du Mode contenu et vérifier que
   `document.body.dataset.content` change (`'fluide'` ou `'centre'`).
5. Ouvrir `/dashboard` et vérifier qu'**aucun** toggle Mode contenu
   n'apparaît dans le header.
6. Naviguer vers `/settings/layout` → redirige vers `/settings`.
7. `grep -rn "hideContentMode\|LayoutSettings\|layout-selector\|/settings/layout" apps/webapp/src` → 0 résultat (sauf le `<Navigate to>` legacy redirect).

---

## File summary

| Action     | Fichier                                                                |
|------------|-----------------------------------------------------------------------|
| **Modify** | `apps/webapp/src/pages/settings/index.tsx`                            |
| **Modify** | `apps/webapp/src/pages/settings/components/settings-sidebar.tsx`      |
| **Modify** | `apps/webapp/src/pages/settings/components/appearance.tsx`            |
| **Modify** | `apps/webapp/src/components/page-header/index.tsx`                    |
| **Modify** | `apps/webapp/src/features/meeting/pages/meeting-room.tsx`             |
| **Modify** | `apps/webapp/src/routing/app-routing-setup.tsx`                       |
| **Modify** | `apps/webapp/src/config/menu.config.ts`                               |
| **Delete** | `apps/webapp/src/pages/settings/components/layout-settings.tsx`       |
| **Delete** | `apps/webapp/src/pages/settings/layout-selector.tsx`                  |

**Inclus dans le scope** : repolish léger de toutes les cards
(`basic-settings`, `preferences`, `notifications`, `auth-email`,
`auth-password`, `auth-social`, `auth-two-factor`, `delete-account`) pour
appliquer uniformément le visuel premium (eyebrow accent + h3 Montserrat
+ ligne description + champs séparés par bordure top + actions alignées
droite). Sinon Apparence (polish) et le reste (non polish) seraient
visuellement incohérents. Le repolish ne change ni la logique métier
(state, API, validation) ni la structure des champs — uniquement le
markup et les classes Tailwind.
