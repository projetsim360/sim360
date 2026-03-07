---
paths:
  - "apps/webapp/**/*.ts"
  - "apps/webapp/**/*.tsx"
---

# Regles Frontend (React 19 + Design System Custom)

## Design System

Le projet utilise un design system custom construit sur **Radix UI** + **CVA** (Class Variance Authority). **NE PAS** installer shadcn/ui, Material UI, Ant Design ou tout autre framework UI. Tous les composants sont dans `src/components/ui/`.

## Composants UI disponibles (`src/components/ui/`)

### Layout & Structure
- **Card** : `Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription, CardHeading, CardToolbar, CardTable` (variants: default, accent)
- **Toolbar** : `Toolbar, ToolbarHeading, ToolbarActions` (depuis `layout-6/components/toolbar`)
- **Separator** : `Separator`
- **ScrollArea** : `ScrollArea`
- **Resizable** : Panneaux redimensionnables

### Boutons & Interactions
- **Button** : variants (`primary, mono, destructive, secondary, outline, dashed, ghost, dim, foreground, inverse`), sizes (`lg, md, sm, icon`), modes (`default, icon, link, input`), shapes (`default, circle`)
- **Toggle / ToggleGroup** : Bascules
- **Switch** : Interrupteur

### Formulaires
- **Form** : `Form (FormProvider), FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage` — wraps react-hook-form
- **Input** : `Input, InputAddon, InputGroup, InputWrapper` (sizes: sm, md, lg)
- **Textarea** : Zone de texte multiligne
- **Select** : `Select, SelectGroup, SelectValue` (Radix Select)
- **Checkbox** : Case a cocher
- **RadioGroup** : `RadioGroup, RadioGroupItem`
- **DateField** : Champ date
- **InputOTP** : Saisie OTP
- **Calendar** : Calendrier/date picker
- **Slider** : Curseur
- **FileUpload** : Upload de fichiers
- **Validation** : `zod` schemas + `@hookform/resolvers`

### Donnees
- **Table** : `Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell`
- **DataGrid** : Grille avancee (TanStack React Table) avec pagination, tri, filtrage, visibilite colonnes, DnD
- **Pagination** : Controles de pagination
- **Kanban** : Tableau kanban
- **Tree** : Vue arborescente (headless-tree)
- **Sortable** : Listes triables (dnd-kit)

### Feedback
- **Badge** : `Badge, BadgeButton, BadgeDot` — variants (`primary, secondary, success, warning, info, outline, destructive`), appearances (`default, light, outline, ghost`), sizes (`lg, md, sm, xs`)
- **Alert** : `Alert, AlertTitle, AlertIcon, AlertDescription, AlertContent, AlertToolbar` — variants (`secondary, primary, destructive, success, info, mono, warning`), appearances (`solid, outline, light, stroke`)
- **Progress** : Barre de progression
- **Skeleton** : Placeholder de chargement
- **Toaster** : Sonner pour les toasts — utiliser `toast()` de `sonner`

### Overlays & Dialogues
- **Dialog** : `Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogClose` (variants: default, fullscreen)
- **AlertDialog** : Dialogue de confirmation
- **Drawer** : Panneau lateral (Vaul)
- **Sheet** : Overlay
- **Popover** : Popup contextuel
- **HoverCard** : Card au survol
- **Tooltip** : Info-bulle

### Navigation
- **Breadcrumb** : Fil d'Ariane
- **DropdownMenu** : Menu deroulant (Radix)
- **NavigationMenu** : Menu de navigation
- **Menubar** : Barre de menu
- **Command** : Palette de commandes (cmdk)
- **Accordion / AccordionMenu** : Sections depliables
- **Tabs** : Onglets
- **Collapsible** : Contenu repliable

### Charts
- **Chart** : Wrapper Recharts avec theming — `import { ChartContainer, ChartTooltip } from '@/components/ui/chart'`
- **Recharts** : LineChart, BarChart, RadarChart, PieChart, etc.
- **ApexCharts** : Charts avances via `react-apexcharts`

### Animations & Effets
- **Framer Motion** : Animations — `import { motion } from 'framer-motion'`
- **TextReveal, TypingText, WordRotate, ShimmeringText** : Effets texte
- **SlidingNumber, CountingNumber** : Animations numeriques
- **GradientBackground, GridBackground** : Fonds visuels
- **Marquee** : Texte defilant
- **Carousel** : Carrousel

## Icones

**KeenIcons** (systeme principal) :
```tsx
import { KeenIcon } from '@/components/keenicons';

<KeenIcon icon="shield-tick" style="duotone" />  // styles: solid, duotone, filled, outline
```

**Lucide** (icones secondaires pour menus/navigation) :
```tsx
import { LayoutDashboard, Play, Users } from 'lucide-react';
```

**NE PAS** utiliser d'autres libraries d'icones.

## Layouts

- **39 layouts** dans `src/components/layouts/layout-{1..39}/`
- **Layout par defaut** : `layout-6` (configurable via `VITE_DEFAULT_LAYOUT`)
- **DynamicLayout** : Selecteur automatique dans `src/components/layouts/dynamic-layout.tsx`
- **Ne jamais creer de nouveau layout** — utiliser les existants

### Pattern de page standard

```tsx
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KeenIcon } from '@/components/keenicons';

const MyPage = () => {
  return (
    <>
      <Toolbar>
        <ToolbarHeading>
          <h1 className="text-xl font-medium text-gray-900">Titre de la page</h1>
          <p className="text-sm text-gray-700">Description</p>
        </ToolbarHeading>
        <ToolbarActions>
          <Button variant="primary" size="sm">
            <KeenIcon icon="plus" style="solid" /> Ajouter
          </Button>
        </ToolbarActions>
      </Toolbar>

      <div className="container-fixed">
        <Card>
          <CardHeader>
            <CardTitle>Section</CardTitle>
          </CardHeader>
          <CardContent>
            {/* contenu */}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default MyPage;
```

## API & Data Fetching

```tsx
import { apiClient } from '@/lib/api-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
```

- `apiClient.get/post/put/patch/delete/upload` — gere les tokens automatiquement
- TanStack Query pour le cache — `staleTime: 5min`, `retry: 1`
- **NE PAS** utiliser `fetch`, `axios`, ou `useEffect` pour les donnees serveur

## Auth & Providers

- `useAuth()` : user, isLoggedIn, login, logout, register, refreshUser
- `useSocket()` : connexion Socket.io au namespace `/notifications`
- `useNotificationContext()` : notifications temps reel
- `useLayoutSwitcher()` : changement de layout dynamique
- Tokens : `sim360_access_token`, `sim360_refresh_token` dans localStorage

## Routes & Menus

- Routes dans `{feature}/config/{feature}.routes.tsx` avec `React.lazy()` + `Suspense`
- Enregistrer dans `src/routing/app-routing-setup.tsx`
- Menus dans `{feature}/config/{feature}.menu.ts`
- Exporter depuis `src/features/index.ts`
- Importer dans `src/config/menu.config.ts` (source unique de verite pour la navigation)

### MenuItem interface :
```typescript
{ title, icon?: LucideIcon, path, rootPath?, children?, badge?, separator?, disabled? }
```

## CSS & Theme

- **Tailwind CSS v4** avec variables CSS (`--background, --foreground, --primary, --secondary, etc.`)
- **Dark mode** : `next-themes` avec classe `.dark`
- **Classe utilitaire** : `cn()` depuis `@/lib/utils` (clsx + tailwind-merge)
- **NE PAS** creer de fichiers CSS — Tailwind uniquement
- **NE PAS** utiliser de styles inline

## Regles strictes

1. Utiliser UNIQUEMENT les composants de `src/components/ui/` — ne pas en creer de nouveaux sauf composants metier specifiques dans `features/{name}/components/`
2. Utiliser `KeenIcon` pour les icones, `Lucide` pour les menus
3. Utiliser `Toolbar + ToolbarHeading + ToolbarActions` en haut de chaque page
4. Utiliser `container-fixed` comme wrapper principal de contenu
5. Toasts via `toast()` de `sonner` — pas d'alerts natifs
6. Dialogues de confirmation via `AlertDialog` — pas de `window.confirm()`
7. Tables simples via `Table`, donnees complexes via `DataGrid`
8. UI text en francais
9. Exporter les pages en `default` export (pour lazy loading)
