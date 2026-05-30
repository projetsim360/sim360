# Emails — Redesign premium (inbox / responded / archived)

**Date:** 2026-05-30
**Status:** Design — pending implementation
**Branche cible:** `feat/simex-foundation`

---

## 1. Intent

Refondre entièrement les trois pages `/emails/inbox`, `/emails/responded`, `/emails/archived` pour atteindre le même niveau de premium que `/settings` et `/dashboard`, et offrir un véritable confort d'inbox management (tabs, recherche, filtres, tri, multi-sélection, drawer détail, brouillon, raccourcis).

L'utilisateur veut :

- Une UI cohérente avec le reste de Simex pro (PageHeader, cards premium, palette Deep Blue + Warm Orange, dark mode).
- Un flow rapide pour traiter en chaîne les emails qui arrivent pendant une simulation : ouvrir → lire → répondre → suivant, sans round-trip lourd.
- Les contrôles d'inbox standards (recherche, tri, filtres, actions groupées) qui manquent dans la version actuelle.
- Un mobile utilisable sans dégradation grossière.

Le pattern retenu est **liste pleine largeur + drawer latéral** (style Linear / Superhuman) au lieu du split-pane actuel.

---

## 2. Hors-scope

Les éléments suivants ne sont **pas** dans cette refonte :

- **Labels / dossiers personnalisés** — nécessitent un changement Prisma + endpoints.
- **Star / Pin / Snooze** — idem.
- **Recherche full-text dans le corps de l'email** — restera sur sujet + nom expéditeur côté client.
- **Swipe horizontal mobile** pour next/prev — nice-to-have, peut venir en P1.
- **Refonte de `/simulations/:id/intranet`** (page company-intranet) — out of scope.
- **Refonte de la legacy route `/simulations/:id/emails/:emailId`** (EmailDetailPage) — la nouvelle UI rend cette page obsolète. On la laisse intacte pour ne pas casser les liens existants ; deletion = P1.
- **Réorganisation des notifications temps-réel** liées aux emails (Socket.io) — out of scope.

---

## 3. Architecture · vue d'ensemble

### Files map

```
apps/webapp/src/features/simulated-emails/
├── pages/
│   └── email-inbox-page.tsx            [REWRITE complet]
├── components/
│   ├── email-folder-tabs.tsx           [NEW]
│   ├── email-toolbar.tsx               [NEW]
│   ├── email-list.tsx                  [NEW]
│   ├── email-list-row.tsx              [NEW]   (remplace l'ancien email-list-item)
│   ├── email-detail-drawer.tsx        [NEW]
│   ├── email-reply-form.tsx           [NEW]   (remplace email-response-form)
│   ├── email-bulk-bar.tsx              [NEW]
│   ├── email-filter-popover.tsx        [NEW]
│   ├── email-empty-state.tsx           [NEW]
│   ├── email-priority-badge.tsx        [KEEP] léger polish
│   ├── email-list-item.tsx             [DELETE]
│   ├── email-response-form.tsx         [DELETE]
│   └── unread-badge.tsx                [KEEP]
├── hooks/
│   ├── use-email-draft.ts              [NEW]
│   └── use-email-shortcuts.ts          [NEW]
├── api/
│   └── simulated-emails.api.ts         [EXTEND]  (+ bulkArchive, bulkMarkRead)
├── types/
│   └── simulated-email.types.ts        [EXTEND]  (+ BulkEmailActionDto)
└── config/
    ├── simulated-emails.routes.tsx     [KEEP]
    └── simulated-emails.menu.ts        [KEEP]
```

Backend (NestJS) :

```
apps/api/src/modules/simulated-emails/
├── controllers/simulated-emails.controller.ts  [EXTEND]
├── services/simulated-emails.service.ts        [EXTEND]
└── dto/
    └── bulk-email-action.dto.ts                [NEW]
```

---

## 4. Routing & navigation

- Les 3 routes existantes sont **conservées** : `/emails/inbox`, `/emails/responded`, `/emails/archived`. Elles sont la source de vérité du dossier actif.
- Le composant `EmailInboxPage` lit `useParams().folder` et dérive le statut filtré (`UNREAD+READ` / `RESPONDED` / `ARCHIVED`).
- Cliquer un tab dans la page **navigate** vers l'URL correspondante (`useNavigate` de react-router) — aucun state local pour le dossier.
- **Deep-link drawer** : query param optionnel `?email={emailId}`. Si présent et que l'email appartient au dossier courant, le drawer s'ouvre automatiquement. Sinon, ignoré.
- La legacy route `/simulations/:id/emails` continue de pointer vers `EmailInboxPage` (folder default = inbox). `/simulations/:id/emails/:emailId` reste inchangée (EmailDetailPage legacy, intacte).
- Menu : aucun changement à `simulated-emails.menu.ts` — les 3 entrées enfants sous "Emails" restent.

---

## 5. Layout · desktop (≥ 1024px)

```
┌──────────────────────────────────────────────────────────────┐
│  PageHeader (Simulation › Emails · "Emails de la simulation")│
├──────────────────────────────────────────────────────────────┤
│  EmailFolderTabs                                              │
│  [Boîte (3)]  [Répondus (12)]  [Archives (8)]                │
├──────────────────────────────────────────────────────────────┤
│  EmailToolbar                                                 │
│  [ {magnifier} Rechercher... ] [Date ▾] [Filtrer (2) ▾]      │
│  ↑ remplacé par EmailBulkBar quand selection.size > 0       │
├──────────────────────────────────────────────────────────────┤
│  EmailList (rich rows, cards premium)                        │
│    □  avatar  Sender · email/role     · 2h                  │
│              Subject (bold si non lu)                        │
│              Snippet truncated                               │
│              [⚡ HAUTE] [● Non lu]                          │
│  ... (border-left orange si HIGH/URGENT, bg gradient warm)  │
└──────────────────────────────────────────────────────────────┘

                                  + EmailDetailDrawer (slide-in 600px)
                                    quand un email est sélectionné
```

- Wrapper de page : `<>` (PageHeader + container `<div className="px-6 pb-8">`)
- Le drawer Vaul (`@/components/ui/drawer`) overlay la moitié droite, dim backdrop, fermable via ✕/Esc/clic backdrop.

---

## 6. Layout · mobile (< 1024px)

- **Tabs** : scroll horizontal (overflow-x-auto), sticky sous le PageHeader, garde compteurs.
- **Search** : caché par défaut, icône loupe dans la barre de la page (à droite des tabs ou en haut). Clic ouvre un input full-width inline qui pousse les tabs vers le bas. Esc / clear ferme.
- **Filtres** : bouton **FAB** rond bleu en bas-droite (position fixed) qui ouvre une **Sheet** (`@/components/ui/sheet`, side="bottom") avec les mêmes chips toggle.
- **Liste** : même rich row, padding ajusté.
- **Multi-sélection** : pas de checkbox visible par défaut → **long-press** sur une ligne active le mode multi-select (checkbox apparaissent) ; bulk bar fixée en haut de l'écran.
- **Drawer détail** : devient un **Drawer Vaul fullHeight** (bottom sheet plein écran). Le bouton ✕ devient une flèche ‹ retour. Actions secondaires (mark unread, etc.) déplacées dans un menu ⋯ (DropdownMenu).
- **Raccourcis clavier** : désactivés sur mobile (détection via `useIsMobile` hook existant).

---

## 7. Composants — spécifications

### 7.1 `email-folder-tabs.tsx`

- Tabs Radix (`@/components/ui/tabs`).
- 3 triggers : Boîte de réception, Répondus, Archives.
- Compteur visible sur chaque tab : pastille colorée pour le tab actif, gris pour les autres.
- Cliquer un tab → `navigate(\`/emails/${folder}\`)`.
- Compteurs alimentés par les longueurs des sous-listes filtrées de la réponse `getEmails` (single query, on filtre client-side par status).

### 7.2 `email-toolbar.tsx`

- Container flex avec gap 8px.
- **Search input** (flex:1) : `Input` avec `KeenIcon icon="magnifier"` en addon gauche, placeholder "Rechercher par sujet ou expéditeur...".
- **Sort dropdown** : `DropdownMenu`, label "Date ▾" ou "Priorité ▾", icône `arrow-up-down`. Options : Date (récent → ancien), Date (ancien → récent), Priorité (haute → basse).
- **Filter button** : `Popover`, label "Filtrer (N) ▾" où N = nombre de filtres actifs. Ouvre `email-filter-popover.tsx`.
- Si `selection.size > 0` → la toolbar est remplacée par `email-bulk-bar.tsx`.

### 7.3 `email-list.tsx`

- Wrapper Card premium (border subtle, soft shadow, dark mode tokens).
- Scrollable interne si la liste dépasse.
- Loading : 5 skeletons (style row).
- Empty : `<EmailEmptyState variant="empty-folder" />`.
- Empty + filtres actifs : `<EmailEmptyState variant="no-results" />` avec CTA "Effacer les filtres".
- Aucune simulation : `<EmailEmptyState variant="no-simulation" />` avec CTA "Lancer une simulation".

### 7.4 `email-list-row.tsx`

- Rich row : avatar 32px (initiales, gradient bleu pour non-lu, gris pour lu) · sender + role/email · timestamp `formatDistanceToNow` · subject (bold si non-lu) · snippet (1 ligne truncated via line-clamp-1) · badges (priorité, statut non-lu, score si répondu).
- Si `priority === 'URGENT' || 'HIGH'` → bordure gauche 3px orange (`var(--accent-500)`) + léger gradient warm de fond (`linear-gradient(90deg, var(--accent-50), transparent 60%)`).
- Hover : background `var(--neutral-50)` ou `dark:bg-white/[0.03]`.
- Sélectionné (drawer ouvert sur cet email) : background `var(--brand-50)` + bordure gauche brand.
- Checkbox visible : `data-[selected=true]` ou au hover (desktop) ; toujours visible si multi-select mode (mobile).

### 7.5 `email-detail-drawer.tsx`

- Drawer Vaul (`@/components/ui/drawer`), `direction="right"`, `modal=true`.
- Largeur : `w-[600px]` desktop / `w-full h-full` mobile (bottom sheet).
- Backdrop dim léger (overlay semi-opaque).

**Structure interne** :

```
┌────────────────────────────────────────────────────────┐
│ [X] [‹ ›] 1 / 12      [Marquer non lu] [Archiver]      │  ← drawer-header
├────────────────────────────────────────────────────────┤
│                                                         │
│ [HAUTE (flash)]   15 mai 2026, 14:32                   │
│                                                         │
│ ## Validation budget Q3 — urgent                       │
│                                                         │
│ ┌──────────────────────────────────────────────┐       │
│ │ [SD] Sophie Dupont · CFO · sophie@acme.com   │       │
│ └──────────────────────────────────────────────┘       │
│                                                         │
│ Bonjour,                                                │
│ J'aurais besoin de votre validation...                  │
│                                                         │
│ [Si responded :                                         │
│   ┌────────────────────────────────────────┐            │
│   │ Votre réponse              [82/100]    │            │
│   │ "Parfait, je serai là à 14h..."        │            │
│   │ ─────────────────                      │            │
│   │ RETOUR DE L'IA                         │            │
│   │ Bonne concision...                     │            │
│   └────────────────────────────────────────┘            │
│ ]                                                       │
├────────────────────────────────────────────────────────┤
│  [Si !responded && !archived :]                         │
│  Rédigez votre réponse... (textarea)                   │
│  0 / 2000 · brouillon auto                   [Envoyer] │
└────────────────────────────────────────────────────────┘
```

- **drawer-header** : sticky top, `✕` ferme · `‹ ›` naviguent dans la liste filtrée · "i / total" affiché · actions à droite (marquer non lu, archiver). Si archived, marquer non lu est masqué.
- **Body** : scrollable, padding 18-20px.
- **Footer** : sticky bottom, présent seulement si statut = UNREAD ou READ. Pour RESPONDED ou ARCHIVED, on affiche une bande info ("Vous avez déjà répondu" / "Cet email est archivé") en lecture seule.
- Animation : slide-in 200ms ease-out.
- Quand le drawer s'ouvre, l'email est marqué comme lu par le backend (déjà le comportement de `GET /:emailId`).

### 7.6 `email-reply-form.tsx`

- Textarea (resize none, rows=3 par défaut, étend jusqu'à 6 rows max).
- Counter "X / 2000" + indicateur "💾 brouillon auto" (icône `KeenIcon icon="save-2"`).
- Bouton "Envoyer" primary avec icône `arrow-up`, disabled si texte vide ou en cours de submit. Loading state : icône `loading` animée + label "Évaluation...".
- Sur submit : appelle `respond` mutation, toast succès, vide le brouillon (localStorage), garde le drawer ouvert et bascule sur l'état RESPONDED.
- Connecté à `use-email-draft.ts` (auto-save toutes les 800ms via debounce).

### 7.7 `email-bulk-bar.tsx`

- Conditionnellement rendue à la place de `email-toolbar.tsx` quand `selection.size > 0`.
- Background `var(--brand-50)` / `dark:bg-brand-950/40`, border bottom brand.
- Contenu : "N sélectionnés" (gras) · lien "Tout sélectionner (total)" · spacer · bouton "Marquer comme lu" · bouton "Archiver" · bouton "Annuler" (vide la sélection).
- Boutons Marquer/Archiver appellent les mutations bulk, invalident les queries, toast succès "N emails archivés".
- **Comportement mixed-status** : si la sélection contient un mélange UNREAD / READ / RESPONDED, l'action "Marquer comme lu" ne touche que les UNREAD (le serveur ignore les autres) — le toast utilise `updated` retourné par l'API ("N emails marqués comme lus") plutôt que la taille de la sélection.

### 7.8 `email-filter-popover.tsx`

- Popover Radix (`@/components/ui/popover`), trigger = bouton "Filtrer (N) ▾".
- Contenu :
  - **Priorité** : 3 chips ToggleGroup (multi-select) : HAUTE, NORMALE, BASSE. Mapping vers le champ DB : "HAUTE" sélectionne tous les emails dont `priority ∈ {URGENT, HIGH}` ; "NORMALE" → `NORMAL` ; "BASSE" → `LOW`.
  - **Période** : 3 chips ToggleGroup (single-select) : Aujourd'hui, 7 jours, 30 jours.
  - **Avec score IA ≥ 70** : Switch — visible **uniquement** quand `folder === 'responded'`.
- Footer : "Réinitialiser" (link) + "Appliquer (N)" (primary button, N = filtres actifs).
- Les filtres sont appliqués côté client (in-memory) sur la liste retournée par `getEmails`.

### 7.9 `email-empty-state.tsx`

- 3 variantes via prop `variant`:
  - `no-simulation` : icône `rocket`, titre "Pas de simulation active", description, CTA "Lancer une simulation → /simulations/new".
  - `empty-folder` : icône `sms` (boîte de réception) / `check-circle` (répondus) / `archive` (archives) selon le folder. Titre & description génériques par folder.
  - `no-results` : icône `magnifier`, titre "Aucun résultat", description, link "Effacer les filtres" (callback).
- Layout centré, padding généreux, icône 64px en dégradé gris muted.

### 7.10 `email-priority-badge.tsx`

- Reste, mais aligné sur les nouveaux tokens.
- **Mapping DB → label affiché** :
  - `URGENT` ou `HIGH` → "HAUTE", badge warm (bg `var(--accent-100)`, text `var(--accent-700)`, icône KeenIcon `flash`).
  - `NORMAL` → "NORMALE", badge neutre discret (bg `var(--neutral-100)`, text `var(--neutral-600)`).
  - `LOW` → "BASSE", badge muted (bg `var(--neutral-50)`, text `var(--neutral-500)`, jamais caché — la cohérence prime).
- Variants size : `xs` (dans les rows) et `sm` (dans le drawer).

---

## 8. Hooks

### 8.1 `use-email-draft.ts`

- Signature : `useEmailDraft(emailId: string | null): { draft: string; setDraft: (v: string) => void; clearDraft: () => void; }`
- Stocke chaque brouillon dans `localStorage` sous la clé `simex.draft.email.${emailId}`.
- Debounce 800ms avant écriture.
- `clearDraft` supprime la clé (appelé après envoi réussi).
- Si `emailId` est `null`, no-op (retourne string vide et setters stub).

### 8.2 `use-email-shortcuts.ts`

- Signature : `useEmailShortcuts(options: { enabled: boolean; onPrev: () => void; onNext: () => void; onReply: () => void; onArchive: () => void; onMarkUnread: () => void; onClose: () => void; })`
- Attache `keydown` listener à `document`.
- Mappings : `J` → onNext, `K` → onPrev, `R` → onReply (focus textarea), `E` → onArchive, `U` → onMarkUnread, `Esc` → onClose.
- Ignore si focus dans input/textarea/contenteditable (sauf Esc).
- Désactivé si `enabled === false` (mobile) ou si aucun drawer ouvert.

---

## 9. API · backend

### 9.1 Endpoints existants — réutilisés tels quels

- `GET /simulations/:simId/emails?status=&priority=&phaseOrder=&page=&limit=` — liste paginée
- `GET /simulations/:simId/emails/unread-count` — compteur sidebar
- `GET /simulations/:simId/emails/:emailId` — détail (marque comme lu si UNREAD)
- `POST /simulations/:simId/emails/:emailId/respond` — répondre + évaluation IA
- `POST /simulations/:simId/emails/:emailId/archive` — archiver (single)

### 9.2 Endpoints nouveaux

#### `POST /simulations/:simId/emails/bulk-archive`

- **Body** (`BulkEmailActionDto`) : `{ emailIds: string[] }` (min 1, max 50)
- **Décorateur** : `@Auditable('EMAIL_BULK_ARCHIVED', 'SimulatedEmail')`
- **Comportement** : marque chaque email du tableau en `ARCHIVED` (transaction Prisma `updateMany`), filtre par `tenantId` + ownership. Ignore les emails déjà archivés.
- **Réponse** : `{ archived: number }` — nombre effectivement mis à jour.

#### `POST /simulations/:simId/emails/bulk-mark-read`

- **Body** (`BulkEmailActionDto`) : `{ emailIds: string[] }` (min 1, max 50)
- **Décorateur** : `@Auditable('EMAIL_BULK_MARKED_READ', 'SimulatedEmail')`
- **Comportement** : passe chaque email UNREAD du tableau à READ (transaction `updateMany`), filtre tenant + ownership, met `readAt = now()`. Ignore les emails déjà lus / répondus / archivés.
- **Réponse** : `{ updated: number }`.

### 9.3 DTO partagé

```ts
// apps/api/src/modules/simulated-emails/dto/bulk-email-action.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsString } from 'class-validator';

export class BulkEmailActionDto {
  @ApiProperty({ type: [String], description: 'IDs des emails (max 50)' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @IsString({ each: true })
  emailIds: string[];
}
```

### 9.4 Frontend API extension

```ts
// apps/webapp/src/features/simulated-emails/api/simulated-emails.api.ts

bulkArchive: (simId: string, emailIds: string[]) =>
  api.post<{ archived: number }>(
    `/simulations/${simId}/emails/bulk-archive`,
    { emailIds },
  ),

bulkMarkRead: (simId: string, emailIds: string[]) =>
  api.post<{ updated: number }>(
    `/simulations/${simId}/emails/bulk-mark-read`,
    { emailIds },
  ),

// + hooks useBulkArchiveEmails(simId) et useBulkMarkReadEmails(simId)
// qui invalident QUERY_KEYS.all(simId) et QUERY_KEYS.unreadCount(simId)
```

---

## 10. Visual direction · tokens premium

Alignement strict avec le redesign Settings premium :

- **Cards** : `border-[var(--neutral-100)] dark:border-white/[0.06]`, ombre soft `shadow-[0_1px_2px_rgba(15,26,46,0.04),0_8px_24px_-10px_rgba(15,26,46,0.08)]` (équivalent dark).
- **Eyebrow** : `text-[10px] font-bold uppercase tracking-[1.2px] text-[var(--accent-700)] dark:text-[var(--accent-300)]` — pour les titres de section dans le drawer ("RETOUR DE L'IA", etc.).
- **Heading** : `font-display text-[19px] font-bold text-foreground m-0`.
- **Body text** : `text-[13px] text-muted-foreground` ou `text-foreground` selon importance.
- **Hover** : `hover:bg-[var(--neutral-50)] dark:hover:bg-white/[0.03]`.
- **Active/selected** : `bg-[var(--brand-50)] dark:bg-[var(--brand-950)]/40`.
- **Accent warm** (priorité haute) : `var(--accent-50/500/700)` famille.
- **Success** (réponse score haut) : tokens `success-*` du DS.
- **Toujours dark mode-proof** : utiliser les tokens sémantiques (`foreground`, `muted-foreground`, `card`, `border`) ; ne jamais hardcoder couleurs froides en raw hex.

---

## 11. États (loading / error / empty)

| Surface | Loading | Error | Empty |
|---|---|---|---|
| Liste | 5 skeleton rows | Toast erreur + retry button | `EmailEmptyState` (3 variantes) |
| Drawer détail | Skeleton header + body | Toast erreur + bouton "Fermer" | N/A (drawer fermé si aucun email) |
| Compteurs tabs | 0 (puis update) | 0 silencieux | 0 |
| Bulk action | Boutons disabled + spinner | Toast erreur, sélection conservée | N/A |
| Search/filtres | Filtrage instantané in-memory | N/A | `no-results` empty state |

---

## 12. Accessibilité

- **Focus-visible** : ring 2px brand sur tous les éléments interactifs (`focus-visible:ring-2 focus-visible:ring-[var(--brand-500)] focus-visible:ring-offset-2`).
- **Tabs Radix** : navigation clavier par défaut (← →).
- **Checkbox** : `<input type="checkbox">` natif accessible, `aria-label` "Sélectionner l'email de {sender}".
- **Drawer** : Vaul gère focus trap, restore focus, aria-modal, esc-to-close out-of-the-box.
- **Empty state CTA** : Link semantically `<Link to="...">`, pas une div.
- **Raccourcis clavier** : annoncés via tooltips sur les boutons concernés (R sur "Envoyer", E sur "Archiver"). Ignorés quand focus dans input/textarea.
- **Contrastes** : ≥ 4.5:1 pour le texte body, vérifier en dark mode notamment sur les badges colorés.

---

## 13. Acceptance criteria

1. **Visuel** : `PageHeader` (style dashboard/settings) + tabs avec compteurs + cards premium (border subtle, soft shadow) ; le dark mode flippe correctement tous les fonds, textes, bordures, badges.
2. **Navigation folder** : cliquer un tab change l'URL (`/emails/inbox|responded|archived`) et re-filtre la liste sans rechargement complet.
3. **Drawer ouverture** : cliquer une ligne ouvre le drawer 600px depuis la droite. Esc, ✕, ou clic backdrop le ferme.
4. **Navigation drawer** : flèches ‹ › dans le drawer-header + raccourcis J/K naviguent dans la liste **filtrée** courante (respecte search + filtres). Index "i / total" affiché.
5. **Reply** : textarea avec compteur live 0/2000 ; brouillon auto-saved en localStorage (clé `simex.draft.email.{id}`) avec debounce 800ms ; raccourci R focus le textarea ; submit appelle l'API, vide le brouillon, affiche un toast succès, bascule le drawer en état RESPONDED sans le fermer.
6. **Archive** : raccourci E + bouton dans la barre du drawer ; soft delete (statut → ARCHIVED) ; après archive, le drawer se ferme et la liste re-filtre.
7. **Mark unread** : bouton dans la barre du drawer + raccourci U ; repasse le statut à UNREAD ; visible uniquement si statut ∈ {READ, RESPONDED} et non-archivé.
8. **Bulk** : checkbox sur chaque ligne ; ≥ 1 coché → la bulk bar bleue remplace la toolbar ; "Tout sélectionner" coche tous les emails du dossier courant ; "Marquer comme lu" + "Archiver" appellent les nouveaux endpoints bulk et invalident les queries ; "Annuler" vide la sélection.
9. **Search** : input dans la toolbar, filtre in-memory case-insensitive sur `subject + senderName` ; debounce 200ms ; bouton clear visible quand non-vide.
10. **Sort** : dropdown "Date" (récent → ancien, défaut) / "Date" (ancien → récent) / "Priorité" (URGENT/HIGH → NORMAL → LOW).
11. **Filtres** : popover avec chips toggle ; compteur "(N)" sur le bouton "Filtrer" reflète le nombre de filtres actifs ; "Réinitialiser" remet tout à zéro ; "Appliquer" ferme le popover et applique.
12. **Empty states** : `no-simulation` (CTA "Lancer une simulation"), `empty-folder` (passif, message par dossier), `no-results` (lien "Effacer les filtres" callback). Icônes KeenIcon.
13. **Mobile (< 1024px)** : tabs scrollables ; search en icône loupe → input overlay ; FAB bleu en bas-droite ouvre Sheet pour les filtres ; drawer détail = bottom sheet plein écran ; multi-select via long-press ; raccourcis désactivés.
14. **A11y** : focus-visible ring sur tous les interactifs ; Drawer gère focus trap ; checkbox accessibles ; raccourcis annoncés via tooltip.
15. **Aucun emoji UI** dans le code (ni dans les empty states, ni dans les badges) — uniquement KeenIcon et Lucide.

---

## 14. Risques & mitigations

| Risque | Mitigation |
|---|---|
| Compteurs tabs désynchronisés du serveur après mutation | `invalidateQueries` sur `QUERY_KEYS.all(simId)` après chaque mutation (respond, archive, bulk). |
| Brouillon non sauvegardé si fermeture brutale | Debounce 800ms + flush sur `beforeunload`. |
| Long-press mobile en conflit avec context menu navigateur | `e.preventDefault()` sur `touchstart` long. |
| Search/filter sur grosses listes (1000+) | YAGNI — les simulations génèrent typiquement 10-30 emails. Si > 200, revoir (paginer ou backend search). |
| Mutation bulk partielle (erreur serveur sur certains IDs) | Endpoint répond `{ archived: N }` avec N < emailIds.length ; toast indique "X sur Y emails archivés". |
| Deep-link `?email={id}` vers un email d'un autre dossier | Vérification dans le useEffect : si email pas dans la liste filtrée → ignore (drawer fermé), nettoie le query param. |
| Migration des routes legacy | Aucune — `/simulations/:id/emails` continue de pointer vers la nouvelle page, `EmailDetailPage` laissée intacte pour ne pas casser les liens existants. |

---

## 15. Protocole de vérification

Pas de runner de tests front. Vérification = typecheck + Playwright manuel.

1. `pnpm --filter @sim360/webapp typecheck` (≤ 0 erreur)
2. `pnpm --filter @sim360/api typecheck` (≤ 0 erreur, vérifie les 2 nouveaux endpoints)
3. Lancer le webapp + API local, login dev, lancer une simulation, générer des emails (`POST /emails/generate`).
4. Playwright navigué manuellement :
   - `/emails/inbox` rend PageHeader + tabs + toolbar + liste + cards premium.
   - Clic sur un email → drawer s'ouvre depuis la droite (200ms).
   - Esc ferme le drawer.
   - J/K naviguent dans la liste filtrée.
   - R focus le textarea, taper, attendre 1s → vérifier localStorage `simex.draft.email.{id}`.
   - Envoyer → drawer bascule en RESPONDED, badge score affiché.
   - Cocher 3 emails → bulk bar bleue remplace toolbar → "Archiver" → toast succès, liste filtrée.
   - Tab "Archives" → URL change, liste re-filtre.
   - Search "Sophie" → liste filtre live.
   - Filtres → ouvrir popover → toggle "HAUTE" → compteur "(1)" sur le bouton, liste filtre.
   - Dark mode toggle → tout flippe.
   - Mobile (375px viewport) : tabs scrollables, FAB filtres en bas-droite, drawer = bottom sheet plein écran, long-press active multi-select.
   - 0 erreur console.
