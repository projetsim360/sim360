# Simex pro Foundation — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the legacy violet/coral palette of `apps/webapp` with the Simex pro design tokens (Deep Blue + Warm Orange + warm-gray), self-host Montserrat, switch on a Light/Dark theme toggle in `layout-6`, and rebrand all user-visible « Sim360 / ProjectSim360 » strings to « Simex pro ».

**Architecture:** Tokens are inlined directly into `apps/webapp/src/styles/globals.css` (Approach A — no cross-package import). The 92 components in `components/ui/` and the 39 layouts are not modified — they consume the tokens via Tailwind v4 `@theme inline` and adapt automatically. Only `layout-6` receives the `<ThemeToggle>` and the `<Logo>` deployment.

**Tech Stack:** React 19, Tailwind CSS v4, next-themes 0.4, Vite, KeenIcons, pnpm workspaces.

**Reference visuelle :** `design/project/preview/simex-simulation.html` (mockup validé) et `design/project/colors_and_type.css` (source of truth tokens).

**Spec :** `docs/superpowers/specs/2026-05-03-simex-foundation-design.md`.

---

## File Structure

### Create
- `apps/webapp/public/fonts/montserrat/Montserrat-{Thin,ExtraLight,Light,Regular,Medium,SemiBold,Bold,ExtraBold,Black}.ttf` (9 files)
- `apps/webapp/public/fonts/montserrat/Montserrat-{Thin,ExtraLight,Light,Italic,Medium,SemiBold,Bold,ExtraBold,Black}Italic.ttf` (9 files — note `Italic.ttf` is the regular italic) — **16 fichiers au total** (les 8 italiques + 8 romaines + 1 « Italic.ttf »)
- `apps/webapp/src/components/logo/index.tsx` — composant `<Logo>` Simex pro
- `apps/webapp/src/components/theme-toggle/index.tsx` — composant `<ThemeToggle>`

### Modify
- `apps/webapp/src/styles/globals.css` — réécriture complète des tokens + ajout `@font-face` + dark
- `apps/webapp/src/components/layouts/layout-6/components/sidebar-footer.tsx` — insertion `<ThemeToggle>` + remplacement des hex violets hardcodés par des tokens
- `apps/webapp/src/components/layouts/layout-6/components/header.tsx` — remplacement du logo mobile par `<Logo>`
- `apps/webapp/src/components/layouts/layout-6/components/sidebar-header.tsx` — remplacement du logo desktop par `<Logo>`
- `apps/webapp/src/components/layouts/layout-6/index.tsx` — `<title>` Helmet
- `apps/webapp/index.html` — `<title>`, `<meta name="description">`, `lang="fr"`
- Tous les `<Helmet>` mentionnant « Sim360 / ProjectSim360 » dans `apps/webapp/src/features/` (à griper à l'exécution)

---

## Task 1: Copy Montserrat fonts to webapp public/

**Files:**
- Create: `apps/webapp/public/fonts/montserrat/*.ttf` (16 files)
- Source: `design/project/fonts/Montserrat-*.ttf`

- [ ] **Step 1: Create the destination directory**

```bash
mkdir -p apps/webapp/public/fonts/montserrat
```

- [ ] **Step 2: Copy the 16 TTF files**

```bash
cp design/project/fonts/Montserrat-*.ttf apps/webapp/public/fonts/montserrat/
```

- [ ] **Step 3: Verify count**

```bash
ls apps/webapp/public/fonts/montserrat/ | wc -l
```

Expected output: `16`

- [ ] **Step 4: Verify file integrity**

```bash
ls -la apps/webapp/public/fonts/montserrat/Montserrat-Bold.ttf
```

Expected: file exists, size > 100KB.

- [ ] **Step 5: Commit**

```bash
git add apps/webapp/public/fonts/montserrat/
git commit -m "feat(webapp): self-host Montserrat fonts for Simex pro design"
```

---

## Task 2: Rewrite globals.css with Simex pro tokens

**Files:**
- Modify: `apps/webapp/src/styles/globals.css` (replace tokens + `@theme` + `.dark`, preserve Tailwind/KeenIcons imports and body defaults)

- [ ] **Step 1: Read the current file to understand the preservable head**

```bash
sed -n '1,20p' apps/webapp/src/styles/globals.css
```

The head (lines ~1-20) contains: `@import 'tailwindcss'`, `@import 'tw-animate-css'`, `@plugin "@tailwindcss/typography"`, `@import '../components/keenicons/assets/styles.css'`, the KeenIcons default size rule, and `@custom-variant dark`. **Keep all of those exactly as is.**

- [ ] **Step 2: Replace the file entirely with the new content below**

Open `apps/webapp/src/styles/globals.css` and replace the **entire file** with:

```css
/* Tailwind Core */
@import 'tailwindcss';
@import 'tw-animate-css';

/* Typography plugin (prose classes for markdown rendering) */
@plugin "@tailwindcss/typography";

/* KeenIcons */
@import '../components/keenicons/assets/styles.css';

/* KeenIcons default size — low specificity so parent [&_i]:text-* can override */
i[class*="ki-"] {
  font-size: 1.125rem; /* 18px */
}

/** Dark Mode Variant **/
@custom-variant dark (&:is(.dark *));

/* ==========================================================================
   Montserrat — self-hosted display font (16 weights × normal/italic)
   ========================================================================== */
@font-face { font-family: "Montserrat"; font-style: normal; font-weight: 100; src: url("/fonts/montserrat/Montserrat-Thin.ttf") format("truetype"); font-display: swap; }
@font-face { font-family: "Montserrat"; font-style: italic; font-weight: 100; src: url("/fonts/montserrat/Montserrat-ThinItalic.ttf") format("truetype"); font-display: swap; }
@font-face { font-family: "Montserrat"; font-style: normal; font-weight: 200; src: url("/fonts/montserrat/Montserrat-ExtraLight.ttf") format("truetype"); font-display: swap; }
@font-face { font-family: "Montserrat"; font-style: italic; font-weight: 200; src: url("/fonts/montserrat/Montserrat-ExtraLightItalic.ttf") format("truetype"); font-display: swap; }
@font-face { font-family: "Montserrat"; font-style: normal; font-weight: 300; src: url("/fonts/montserrat/Montserrat-Light.ttf") format("truetype"); font-display: swap; }
@font-face { font-family: "Montserrat"; font-style: italic; font-weight: 300; src: url("/fonts/montserrat/Montserrat-LightItalic.ttf") format("truetype"); font-display: swap; }
@font-face { font-family: "Montserrat"; font-style: normal; font-weight: 400; src: url("/fonts/montserrat/Montserrat-Regular.ttf") format("truetype"); font-display: swap; }
@font-face { font-family: "Montserrat"; font-style: italic; font-weight: 400; src: url("/fonts/montserrat/Montserrat-Italic.ttf") format("truetype"); font-display: swap; }
@font-face { font-family: "Montserrat"; font-style: normal; font-weight: 500; src: url("/fonts/montserrat/Montserrat-Medium.ttf") format("truetype"); font-display: swap; }
@font-face { font-family: "Montserrat"; font-style: italic; font-weight: 500; src: url("/fonts/montserrat/Montserrat-MediumItalic.ttf") format("truetype"); font-display: swap; }
@font-face { font-family: "Montserrat"; font-style: normal; font-weight: 600; src: url("/fonts/montserrat/Montserrat-SemiBold.ttf") format("truetype"); font-display: swap; }
@font-face { font-family: "Montserrat"; font-style: italic; font-weight: 600; src: url("/fonts/montserrat/Montserrat-SemiBoldItalic.ttf") format("truetype"); font-display: swap; }
@font-face { font-family: "Montserrat"; font-style: normal; font-weight: 700; src: url("/fonts/montserrat/Montserrat-Bold.ttf") format("truetype"); font-display: swap; }
@font-face { font-family: "Montserrat"; font-style: italic; font-weight: 700; src: url("/fonts/montserrat/Montserrat-BoldItalic.ttf") format("truetype"); font-display: swap; }
@font-face { font-family: "Montserrat"; font-style: normal; font-weight: 800; src: url("/fonts/montserrat/Montserrat-ExtraBold.ttf") format("truetype"); font-display: swap; }
@font-face { font-family: "Montserrat"; font-style: italic; font-weight: 800; src: url("/fonts/montserrat/Montserrat-ExtraBoldItalic.ttf") format("truetype"); font-display: swap; }
@font-face { font-family: "Montserrat"; font-style: normal; font-weight: 900; src: url("/fonts/montserrat/Montserrat-Black.ttf") format("truetype"); font-display: swap; }
@font-face { font-family: "Montserrat"; font-style: italic; font-weight: 900; src: url("/fonts/montserrat/Montserrat-BlackItalic.ttf") format("truetype"); font-display: swap; }

/* Inter (body) — Google Fonts CDN until self-hosted version is provided */
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

/* ==========================================================================
   Simex pro — Design tokens (light)
   Source of truth: design/project/colors_and_type.css
   ========================================================================== */
:root {
  /* ---------- Brand (Deep Blue) ---------- */
  --brand-50:  #F0F4FA;
  --brand-100: #D6E0EF;
  --brand-200: #B8C7DF;
  --brand-300: #A8B9D4;
  --brand-400: #7E94BB;
  --brand-500: #5A7099;
  --brand-600: #3D5478;
  --brand-700: #1A2B48; /* primary brand */
  --brand-800: #14223A;
  --brand-900: #0F1A2E;
  --brand-950: #08111F;

  /* ---------- Accent (Warm Orange) ---------- */
  --accent-50:  #FFF4ED;
  --accent-100: #FFE4D1;
  --accent-200: #FFCBA8;
  --accent-300: #FFB685;
  --accent-400: #F59763;
  --accent-500: #EE7A3A; /* CTA */
  --accent-600: #D9652D;
  --accent-700: #C45C24;
  --accent-800: #9C4718;
  --accent-900: #7A3A15;
  --accent-950: #4D230C;

  /* ---------- Neutrals (warm gray) ---------- */
  --neutral-0:   #FAFAF9;
  --neutral-50:  #F5F5F4;
  --neutral-100: #E7E5E4;
  --neutral-200: #D6D3D1;
  --neutral-300: #A8A29E;
  --neutral-400: #78716C;
  --neutral-500: #57534E;
  --neutral-600: #44403C;
  --neutral-700: #292524;
  --neutral-800: #1C1917;
  --neutral-900: #0C0A09;

  /* ---------- Semantics ---------- */
  --success-50: #ECFDF5; --success-200: #A7F3D0; --success-500: #10B981; --success-700: #047857; --success-900: #064E3B;
  --warning-50: #FFFBEB; --warning-200: #FCD34D; --warning-500: #F59E0B; --warning-700: #B45309; --warning-900: #78350F;
  --error-50:   #FEF2F2; --error-200:   #FCA5A5; --error-500:   #EF4444; --error-700:   #B91C1C; --error-900:   #7F1D1D;
  --info-50:    #EFF6FF; --info-200:    #93C5FD; --info-500:    #3B82F6; --info-700:    #1D4ED8; --info-900:    #1E3A8A;

  /* ---------- Typography ---------- */
  --font-display: "Montserrat", "Segoe UI", system-ui, -apple-system, sans-serif;
  --font-body:    "Inter", "Segoe UI", system-ui, -apple-system, sans-serif;

  /* ---------- Spacing (4px base) ---------- */
  --space-0_5: 2px;
  --space-1:   4px;
  --space-2:   8px;
  --space-3:   12px;
  --space-4:   16px;
  --space-5:   20px;
  --space-6:   24px;
  --space-8:   32px;
  --space-10:  40px;
  --space-12:  48px;
  --space-16:  64px;
  --space-24:  96px;

  /* ---------- Radius ---------- */
  --radius-xs:   4px;
  --radius-sm:   6px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-full: 9999px;

  /* ---------- Elevation ---------- */
  --elevation-0:  none;
  --elevation-sm: 0 1px 2px rgba(15,26,46,.05), 0 1px 3px rgba(15,26,46,.08);
  --elevation-md: 0 2px 4px rgba(15,26,46,.06), 0 4px 12px rgba(15,26,46,.08);
  --elevation-lg: 0 8px 24px rgba(15,26,46,.12);
  --elevation-xl: 0 16px 40px rgba(15,26,46,.18);
  --shadow-accent: 20px 20px 0 var(--accent-500);

  /* ---------- Motion ---------- */
  --duration-fast:   150ms;
  --duration-base:   200ms;
  --duration-slow:   300ms;
  --duration-slower: 500ms;
  --ease-out:    cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in:     cubic-bezier(0.7, 0, 0.84, 0);

  /* ---------- Layout ---------- */
  --container-max:    1440px;
  --sidebar-width:    260px;
  --toolbar-height:   64px;

  /* ==========================================================================
     Shadcn-compatible aliases (consumed by existing 92 ui/ components)
     ========================================================================== */

  /* Surfaces */
  --background:           var(--neutral-50);
  --foreground:           var(--neutral-900);
  --card:                 #ffffff;
  --card-foreground:      var(--neutral-900);
  --popover:              #ffffff;
  --popover-foreground:   var(--neutral-900);

  /* Brand & CTA */
  --primary:              var(--accent-500);
  --primary-foreground:   #ffffff;
  --primary-hover:        var(--accent-600);

  --secondary:              var(--neutral-100);
  --secondary-foreground:   var(--neutral-700);
  --muted:                  var(--neutral-100);
  --muted-foreground:       var(--neutral-500);
  --accent:                 var(--neutral-100);
  --accent-foreground:      var(--neutral-700);

  /* Destructive */
  --destructive:              var(--error-500);
  --destructive-foreground:   #ffffff;

  /* Semantics with soft/alpha/accent variants */
  --color-success:            var(--success-500);
  --color-success-foreground: #ffffff;
  --color-success-soft:       var(--success-50);
  --color-success-alpha:      var(--success-200);
  --color-success-accent:     var(--success-700);

  --color-warning:            var(--warning-500);
  --color-warning-foreground: #ffffff;
  --color-warning-soft:       var(--warning-50);
  --color-warning-alpha:      var(--warning-200);
  --color-warning-accent:     var(--warning-700);

  --color-info:            var(--info-500);
  --color-info-foreground: #ffffff;
  --color-info-soft:       var(--info-50);
  --color-info-alpha:      var(--info-200);
  --color-info-accent:     var(--info-700);

  /* Borders, inputs, focus */
  --border:   var(--neutral-200);
  --input:    var(--neutral-200);
  --ring:     rgba(238, 122, 58, 0.30);
  --radius:   0.5rem;

  /* Charts (KPI domain) */
  --chart-1: var(--accent-500);   /* Budget */
  --chart-2: var(--success-500);  /* Qualité */
  --chart-3: var(--info-500);     /* Délai */
  --chart-4: var(--error-500);    /* Risque */
  --chart-5: var(--warning-500);  /* Scope */

  color-scheme: light;
}

/* ==========================================================================
   Dark mode
   ========================================================================== */
.dark {
  /* Surfaces */
  --background:           var(--neutral-900);
  --foreground:           var(--neutral-50);
  --card:                 var(--neutral-800);
  --card-foreground:      var(--neutral-50);
  --popover:              var(--neutral-800);
  --popover-foreground:   var(--neutral-50);

  /* Brand & CTA — accent stays orange but slightly lighter for contrast */
  --primary:              var(--accent-400);
  --primary-foreground:   #ffffff;
  --primary-hover:        var(--accent-500);

  --secondary:              var(--neutral-700);
  --secondary-foreground:   var(--neutral-100);
  --muted:                  var(--neutral-700);
  --muted-foreground:       var(--neutral-300);
  --accent:                 var(--neutral-700);
  --accent-foreground:      var(--neutral-100);

  --destructive:            var(--error-200);
  --destructive-foreground: var(--neutral-900);

  --color-success: var(--success-200); --color-success-foreground: var(--neutral-900);
  --color-warning: var(--warning-200); --color-warning-foreground: var(--neutral-900);
  --color-info:    var(--info-200);    --color-info-foreground:    var(--neutral-900);

  --border:   var(--neutral-700);
  --input:    var(--neutral-700);

  --chart-1: var(--accent-400);
  --chart-2: var(--success-200);
  --chart-3: var(--info-200);
  --chart-4: var(--error-200);
  --chart-5: var(--warning-200);

  --elevation-md: 0 2px 4px rgba(0,0,0,.30), 0 4px 12px rgba(0,0,0,.35);
  --elevation-lg: 0 8px 24px rgba(0,0,0,.45);

  color-scheme: dark;
}

/* ==========================================================================
   Tailwind v4 — expose tokens as utility classes
   ========================================================================== */
@theme inline {
  --color-background:            var(--background);
  --color-foreground:            var(--foreground);
  --color-card:                  var(--card);
  --color-card-foreground:       var(--card-foreground);
  --color-popover:               var(--popover);
  --color-popover-foreground:    var(--popover-foreground);
  --color-primary:               var(--primary);
  --color-primary-foreground:    var(--primary-foreground);
  --color-secondary:             var(--secondary);
  --color-secondary-foreground:  var(--secondary-foreground);
  --color-muted:                 var(--muted);
  --color-muted-foreground:      var(--muted-foreground);
  --color-accent:                var(--accent);
  --color-accent-foreground:     var(--accent-foreground);
  --color-destructive:           var(--destructive);
  --color-destructive-foreground:var(--destructive-foreground);
  --color-border:                var(--border);
  --color-input:                 var(--input);
  --color-ring:                  var(--ring);
  --color-success:               var(--color-success);
  --color-warning:               var(--color-warning);
  --color-info:                  var(--color-info);
  --color-chart-1:               var(--chart-1);
  --color-chart-2:               var(--chart-2);
  --color-chart-3:               var(--chart-3);
  --color-chart-4:               var(--chart-4);
  --color-chart-5:               var(--chart-5);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  --font-display: "Montserrat", "Segoe UI", system-ui, sans-serif;
  --font-sans:    "Inter", "Segoe UI", system-ui, sans-serif;
}

/* ==========================================================================
   Body defaults
   ========================================================================== */
body {
  font-family: var(--font-sans);
  font-feature-settings: "ss01", "cv11";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

> ⚠ If the current `globals.css` contains additional content **after** the dark block (e.g., custom utility classes, `@layer` directives, scrollbar styles), preserve them at the very end of the new file. Use `git diff` after the edit to inspect what was lost.

- [ ] **Step 3: Verify the file diff to confirm no important rules were dropped**

```bash
git diff apps/webapp/src/styles/globals.css | head -60
```

If you see deleted rules unrelated to tokens (e.g., scrollbar styles, layer overrides), re-add them at the end of the new file.

- [ ] **Step 4: Restart Vite dev server and check console**

```bash
pnpm --filter @sim360/webapp dev
```

Expected: server starts without PostCSS / Tailwind errors. Open `http://localhost:5173`. The login page renders, primary buttons are **orange**, page background is `#F5F5F4` warm-gray.

- [ ] **Step 5: Stop dev server**

`Ctrl+C` in the terminal.

- [ ] **Step 6: Commit**

```bash
git add apps/webapp/src/styles/globals.css
git commit -m "feat(webapp): replace legacy palette with Simex pro design tokens"
```

---

## Task 3: Create the `<Logo>` component

**Files:**
- Create: `apps/webapp/src/components/logo/index.tsx`

- [ ] **Step 1: Create the directory**

```bash
mkdir -p apps/webapp/src/components/logo
```

- [ ] **Step 2: Create the component**

Write `apps/webapp/src/components/logo/index.tsx`:

```tsx
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  /** Pass `true` on dark surfaces (e.g. brand sidebar) where the "Simex" word must be white */
  onDark?: boolean;
}

export function Logo({ className, onDark = false }: LogoProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 font-display font-extrabold leading-none tracking-[-0.01em] select-none',
        'text-[22px]',
        className,
      )}
      aria-label="Simex pro"
    >
      <span className={onDark ? 'text-white' : 'text-foreground'}>Simex</span>
      <span className="size-2 rounded-full bg-primary" aria-hidden />
      <span className="text-primary">pro</span>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck**

```bash
pnpm --filter @sim360/webapp typecheck
```

Expected: PASS, no new errors.

- [ ] **Step 4: Commit**

```bash
git add apps/webapp/src/components/logo/index.tsx
git commit -m "feat(webapp): add <Logo> component for Simex pro wordmark"
```

---

## Task 4: Create the `<ThemeToggle>` component

**Files:**
- Create: `apps/webapp/src/components/theme-toggle/index.tsx`

- [ ] **Step 1: Create the directory**

```bash
mkdir -p apps/webapp/src/components/theme-toggle
```

- [ ] **Step 2: Create the component**

Write `apps/webapp/src/components/theme-toggle/index.tsx`:

```tsx
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from '@/components/keenicons/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — next-themes resolves on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <Button
      variant="ghost"
      mode="icon"
      aria-label={isDark ? 'Activer le thème clair' : 'Activer le thème sombre'}
      title={isDark ? 'Thème clair' : 'Thème sombre'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn('rounded-lg', className)}
    >
      {isDark ? <Sun className="size-4.5!" /> : <Moon className="size-4.5!" />}
    </Button>
  );
}
```

- [ ] **Step 3: Typecheck**

```bash
pnpm --filter @sim360/webapp typecheck
```

Expected: PASS, no new errors.

- [ ] **Step 4: Commit**

```bash
git add apps/webapp/src/components/theme-toggle/index.tsx
git commit -m "feat(webapp): add <ThemeToggle> bound to next-themes"
```

---

## Task 5: Insert `<ThemeToggle>` in layout-6 sidebar footer

**Files:**
- Modify: `apps/webapp/src/components/layouts/layout-6/components/sidebar-footer.tsx`

The existing sidebar footer hosts the user dropdown, notifications, and chat. We insert the `<ThemeToggle>` alongside the icon group **and** replace the hardcoded violet `#4b2f95` and lavender `#8a7daa` hex values with token references — they belong to the legacy palette.

- [ ] **Step 1: Open the file**

```bash
$EDITOR apps/webapp/src/components/layouts/layout-6/components/sidebar-footer.tsx
```

- [ ] **Step 2: Replace the file content with the version below**

```tsx
import { MessageCircleMore, MessageSquareDot } from '@/components/keenicons/icons';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserDropdownMenu } from '../../layout-1/shared/topbar/user-dropdown-menu';
import { NotificationsSheet } from '../../layout-1/shared/topbar/notifications-sheet';
import { ChatSheet } from '../../layout-1/shared/topbar/chat-sheet';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/providers/auth-provider';

export function SidebarFooter() {
  const { user } = useAuth();

  const initials = user
    ? `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`.toUpperCase()
    : '?';

  const apiBase = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';

  return (
    <div className="flex flex-center justify-between shrink-0 ps-4 pe-3.5 h-14">
      <UserDropdownMenu
        trigger={
          <Avatar className="size-9 cursor-pointer border-2 border-border dark:border-white/20 shrink-0">
            {user?.avatar ? (
              <AvatarImage
                src={`${apiBase}${user.avatar}`}
                alt={`${user.firstName} ${user.lastName}`}
                className="size-9"
              />
            ) : null}
            <AvatarFallback className="text-xs font-semibold bg-primary text-primary-foreground dark:bg-white/15">{initials}</AvatarFallback>
          </Avatar>
        }
      />

      <div className="flex flex-center gap-1.5">
        <ThemeToggle className="text-muted-foreground hover:text-foreground hover:bg-muted dark:text-white/70 dark:hover:text-white dark:hover:bg-white/10" />
        <NotificationsSheet
          trigger={
            <Button
              variant="ghost"
              mode="icon"
              aria-label="Notifications"
              className="text-muted-foreground hover:text-foreground hover:bg-muted dark:text-white/70 dark:hover:text-white dark:hover:bg-white/10 rounded-lg [&_i]:text-muted-foreground"
            >
              <MessageSquareDot className="size-4.5!" />
            </Button>
          }
        />
        <ChatSheet
          trigger={
            <Button
              variant="ghost"
              mode="icon"
              aria-label="Messages"
              className="text-muted-foreground hover:text-foreground hover:bg-muted dark:text-white/70 dark:hover:text-white dark:hover:bg-white/10 rounded-lg [&_i]:text-muted-foreground"
            >
              <MessageCircleMore className="size-4.5!" />
            </Button>
          }
        />
      </div>
    </div>
  );
}
```

What changed:
- Added `import { ThemeToggle } from '@/components/theme-toggle';`
- Replaced `border-[#eae8ee]` → `border-border`
- Replaced `bg-[#4b2f95] dark:bg-white/15 text-white` → `bg-primary text-primary-foreground dark:bg-white/15` on the AvatarFallback
- Replaced `text-[#8a7daa] hover:text-[#4b2f95]` → `text-muted-foreground hover:text-foreground hover:bg-muted` on the icon buttons
- Inserted `<ThemeToggle>` as the first child of the icon group

- [ ] **Step 3: Run dev server and verify visually**

```bash
pnpm --filter @sim360/webapp dev
```

Open http://localhost:5173 and login. In the sidebar footer (bottom of the dark sidebar, desktop) you should see: **Avatar — ThemeToggle (Moon) — Notifications — Chat**. Click the Moon icon: the entire app switches to dark mode. Click again (now Sun): switches back to light. Reload: the choice persists.

- [ ] **Step 4: Stop dev server**

`Ctrl+C`.

- [ ] **Step 5: Commit**

```bash
git add apps/webapp/src/components/layouts/layout-6/components/sidebar-footer.tsx
git commit -m "feat(webapp): add theme toggle in layout-6 sidebar footer + token migration"
```

---

## Task 6: Replace existing logos with `<Logo>` in layout-6

**Files:**
- Modify: `apps/webapp/src/components/layouts/layout-6/components/header.tsx` (mobile header)
- Modify: `apps/webapp/src/components/layouts/layout-6/components/sidebar-header.tsx` (desktop sidebar header)

- [ ] **Step 1: Read the current sidebar-header to know its structure**

```bash
sed -n '1,50p' apps/webapp/src/components/layouts/layout-6/components/sidebar-header.tsx
```

Note the current logo block (likely an `<img>` from `/media/app/...`).

- [ ] **Step 2: Edit `header.tsx` (mobile)**

Replace the two `<img>` tags inside the `<Link to="/layout-6">` (lines ~32-42 of the original) with the `<Logo>` component:

```tsx
import { Logo } from '@/components/logo';
// ...

<Link to="/layout-6">
  <Logo />
</Link>
```

The mobile header has `bg-muted` (light surface), so `onDark={false}` (default) is correct.

- [ ] **Step 3: Edit `sidebar-header.tsx` (desktop)**

First read the file to locate the existing logo block:

```bash
sed -n '1,50p' apps/webapp/src/components/layouts/layout-6/components/sidebar-header.tsx
```

In the file:
1. Add the import at the top: `import { Logo } from '@/components/logo';`
2. Locate the `<Link>` element that wraps the current logo image(s) (typically `<img src="/media/app/...mini-logo..." />`, often with a `dark:hidden` light variant + a `hidden dark:block` dark variant).
3. Inside that `<Link>`, **delete every `<img>` tag** and replace them with a **single** `<Logo />` element. Keep the `<Link to="...">` and its existing `className` exactly as they are.
4. Decide `onDark`:
   - Inspect the running app (or the file) for the sidebar background color. If the sidebar uses a light surface (`bg-muted` / `bg-background`), use `<Logo />` (default — adapts via `text-foreground`).
   - If the sidebar uses a dark brand surface (`bg-brand-700` / `bg-foreground` / similar), use `<Logo onDark />`.
   - **Default to `<Logo />`** if uncertain — the visual smoke test in step 5 will reveal contrast issues.

Example shape after edit (illustrative — keep your file's actual `<Link>` className):

```tsx
import { Logo } from '@/components/logo';
// existing imports...

<Link to="/layout-6" className="<keep existing className>">
  <Logo />
</Link>
```

- [ ] **Step 4: Typecheck**

```bash
pnpm --filter @sim360/webapp typecheck
```

Expected: PASS.

- [ ] **Step 5: Run dev server and verify**

```bash
pnpm --filter @sim360/webapp dev
```

- Desktop: « Simex • pro » wordmark visible in the top-left of the sidebar (white "Simex" + orange dot + orange "pro" on dark background)
- Mobile: same wordmark in the mobile header (dark "Simex" + orange dot + orange "pro" on light background)

- [ ] **Step 6: Stop dev server, commit**

```bash
git add apps/webapp/src/components/layouts/layout-6/components/header.tsx \
        apps/webapp/src/components/layouts/layout-6/components/sidebar-header.tsx
git commit -m "feat(webapp): swap layout-6 image logos for <Logo> component"
```

---

## Task 7: Rebrand titles and metadata (Sim360 → Simex pro)

**Files:**
- Modify: `apps/webapp/index.html`
- Modify: `apps/webapp/src/components/layouts/layout-6/index.tsx` (Helmet title)
- Modify: any other `<Helmet>` referencing "Sim360" / "ProjectSim360" in `apps/webapp/src/`

- [ ] **Step 1: Update `apps/webapp/index.html`**

Open it. Set:
- `<html lang="fr">`
- `<title>Simex pro</title>`
- `<meta name="description" content="Simex pro — simulation de gestion de projet et évaluation de candidats sur mise en situation." />`

- [ ] **Step 2: Update `apps/webapp/src/components/layouts/layout-6/index.tsx`**

Replace the existing `<Helmet><title>Sim360 - Dashboard</title></Helmet>` with:

```tsx
<Helmet>
  <title>Simex pro — Tableau de bord</title>
</Helmet>
```

- [ ] **Step 3: Find all other Helmet references to Sim360 / ProjectSim360**

```bash
grep -rln "Sim360\|ProjectSim360" apps/webapp/src/ --include="*.tsx" --include="*.ts"
```

- [ ] **Step 4: Inspect each match and replace user-visible occurrences**

For each file in the list, **only replace strings inside `<Helmet><title>`, `<meta>`, alt text, aria-label, JSX text content, and toast messages**. Do **not** touch:
- Imports (`@sim360/...`)
- Type names
- localStorage keys (`sim360_access_token`, `sim360_refresh_token`)
- Variable names

Title pattern: `Simex pro — <PageName>` (em dash, sentence case page name).

- [ ] **Step 5: Final grep to confirm no user-visible Sim360 remains**

```bash
grep -rn "Sim360" apps/webapp/src/ --include="*.tsx" --include="*.ts" | grep -v "@sim360/" | grep -v "sim360_access_token" | grep -v "sim360_refresh_token"
```

Expected: empty output (any remaining match is acceptable only if it's a technical identifier).

- [ ] **Step 6: Build to ensure nothing broke**

```bash
pnpm --filter @sim360/webapp build
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add apps/webapp/index.html apps/webapp/src/
git commit -m "feat(webapp): rebrand user-visible Sim360 → Simex pro"
```

---

## Task 8: Final validation

**Files:** none modified — read-only validation.

- [ ] **Step 1: Lint**

```bash
pnpm --filter @sim360/webapp lint
```

Expected: PASS, no new errors. Pre-existing warnings unrelated to this PR are tolerated and documented.

- [ ] **Step 2: Typecheck**

```bash
pnpm --filter @sim360/webapp typecheck
```

Expected: PASS, 0 errors.

- [ ] **Step 3: Production build**

```bash
pnpm --filter @sim360/webapp build
```

Expected: PASS. Take note of bundle size of `index-*.css` — it should not have ballooned by more than ~5-10KB (Montserrat `@font-face` declarations + new tokens).

- [ ] **Step 4: Smoke test runtime**

```bash
pnpm --filter @sim360/core build && pnpm --filter @sim360/api dev &
pnpm --filter @sim360/webapp dev
```

In the browser at `http://localhost:5173`:

1. **Login page** : wordmark « Simex • pro » visible, primary button is orange (`#EE7A3A`), background warm-gray.
2. **Login** with a test account.
3. **Dashboard** : page title in the browser tab reads « Simex pro — Tableau de bord ». No `#4b2f95` violet visible (use DevTools → Computed → search « 4b2f95 » — should return 0 hits in non-stylesheet computed values).
4. **Theme toggle** in sidebar footer: click → dark mode applies cleanly (cards, sidebar, text contrasts good). Click again → back to light.
5. **Reload** : theme persists (localStorage `theme` key).
6. **Navigate** : `/simulations` → open one → meeting → deliverables. No layout breaks.
7. **DevTools → Network** : Inter loaded from `fonts.googleapis.com`, Montserrat loaded from `/fonts/montserrat/Montserrat-*.ttf`. No 404 on any font.
8. **DevTools → Computed** on a heading : `font-family` includes "Montserrat".
9. **DevTools → Computed** on body text : `font-family` includes "Inter".

- [ ] **Step 5: Document any visual regressions**

Open an issue or note in the PR description for each:
- Hardcoded violet (`#4b2f95`) or coral (`#d4836a`) found in components — these will be cleaned in Phase 5
- `rainbow-button.tsx` (if found) — mark `@deprecated` in a follow-up commit:

```bash
grep -l "rainbow-button" apps/webapp/src/components/ui/
```

If present, prepend at the top of the file (don't modify the body):

```tsx
/** @deprecated Uses removed --color-1..5 rainbow tokens. Will be removed in Phase 5 or rewritten in Phase 2. */
```

- [ ] **Step 6: Final summary commit (if any deprecation marks were added)**

```bash
git add apps/webapp/src/components/ui/rainbow-button.tsx
git commit -m "chore(webapp): mark legacy components @deprecated post-foundation migration"
```

- [ ] **Step 7: PR description**

Use this body:

```markdown
## Phase 1 — Simex pro Foundation

Replaces the legacy violet/coral palette with Simex pro tokens (Deep Blue + Warm Orange + warm-gray neutrals). Self-hosts Montserrat. Adds a Light/Dark theme toggle in `layout-6` sidebar footer. Rebrands user-visible « Sim360 » → « Simex pro ».

### Scope
- Tokens migration (`globals.css` rewritten)
- Montserrat self-hosted (16 weights × normal/italic)
- `<Logo>` and `<ThemeToggle>` components added
- `layout-6` sidebar footer + headers updated
- `<Helmet>` titles + `index.html` rebranded

### Non-goals (later phases)
- New shell layout (Phase 2)
- `<PageHeader>` pattern (Phase 3)
- PMO drawer (Phase 4)
- Page-by-page migration (Phase 5)

### Validation
- `pnpm lint` ✅
- `pnpm typecheck` ✅
- `pnpm build` ✅
- Smoke test 9 steps (see plan)

### Known follow-ups
- N hardcoded `#4b2f95` violets remain in `<file paths>` — cleaned in Phase 5.
- `rainbow-button.tsx` deprecated.

🎨 Ref design: `design/project/preview/simex-simulation.html`
📋 Spec: `docs/superpowers/specs/2026-05-03-simex-foundation-design.md`
```

---

## Self-Review

| Spec section | Covered by |
|---|---|
| §3 Approche A — inline tokens | Task 2 |
| §4 Files touched | Tasks 1-7 |
| §5.1-5.5 Token mapping | Task 2 (full file content) |
| §5.6 Tokens supprimés | Task 2 (omitted from new file) |
| §5.7 Tokens nouveaux | Task 2 (`--brand-*`, `--accent-*`, etc. in `:root`) |
| §6 Fonts (Montserrat self-host + Inter CDN) | Tasks 1, 2 |
| §7 Tailwind `@theme` | Task 2 |
| §8.1 Dark CSS | Task 2 |
| §8.2 ThemeToggle component | Task 4 |
| §8.3 Toolbar insertion | Task 5 (deviated to sidebar-footer per layout-6 reality) |
| §9.1 Logo component | Task 3 |
| §9.2 Helmet & title | Task 7 |
| §10.1 Build & types | Task 8 steps 1-3 |
| §10.2 Smoke test | Task 8 step 4 |
| §11.2 rainbow-button deprecation | Task 8 step 5 |

**Deviation noted:** the spec said "insert ThemeToggle in toolbar". `layout-6` does not have a desktop top-bar — global controls live in the sidebar footer (already hosting user menu + notifications + chat). The plan inserts `<ThemeToggle>` there. Equivalent visibility, conforms to the existing pattern.

**No placeholders, all code is complete, every command has expected output.**
