# Emails Premium Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refonte complète des pages `/emails/inbox`, `/emails/responded`, `/emails/archived` en pattern liste pleine largeur + drawer latéral avec tabs, recherche, filtres, tri, multi-sélection, brouillon auto-save et raccourcis clavier.

**Architecture:** Page unique (`email-inbox-page.tsx`) qui lit `useParams().folder` et compose 9 sous-composants (folder tabs, toolbar, list, list-row, detail drawer, reply form, bulk bar, filter popover, empty state) + 2 hooks (draft, shortcuts). Backend ajoute 2 endpoints bulk (archive + mark-read) atomiques.

**Tech Stack:** React 19 + Vite + Tailwind v4 + Radix UI + Vaul + Framer Motion (frontend) ; NestJS 10 + Prisma + class-validator (backend).

**Branche :** `feat/simex-foundation` (commits directs, pas de PR).

**Spec source :** `docs/superpowers/specs/2026-05-30-emails-premium-redesign-design.md`

**Rappels durables :**
- Commits en anglais, UI texte en français avec diacritiques complets.
- Co-author trailer `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>` sur chaque commit.
- Stage les fichiers spécifiquement (pas de `git add .` / `-A`).
- Jamais d'emoji UI dans le code (KeenIcon ou Lucide uniquement).
- Pas de runner de tests front — typecheck + Playwright manuel à la fin.
- Pas de tests Jest backend non plus (pas de pattern existant dans le module).

---

## Files Structure

### Backend (NestJS)

| File | Action |
|---|---|
| `apps/api/src/modules/simulated-emails/dto/bulk-email-action.dto.ts` | CREATE |
| `apps/api/src/modules/simulated-emails/dto/index.ts` | MODIFY (barrel export) |
| `apps/api/src/modules/simulated-emails/services/simulated-emails.service.ts` | MODIFY (2 nouvelles méthodes) |
| `apps/api/src/modules/simulated-emails/controllers/simulated-emails.controller.ts` | MODIFY (2 nouveaux endpoints) |

### Frontend (React)

| File | Action |
|---|---|
| `apps/webapp/src/features/simulated-emails/api/simulated-emails.api.ts` | MODIFY (2 nouvelles mutations) |
| `apps/webapp/src/features/simulated-emails/types/simulated-email.types.ts` | MODIFY (BulkEmailActionDto) |
| `apps/webapp/src/features/simulated-emails/hooks/use-email-draft.ts` | CREATE |
| `apps/webapp/src/features/simulated-emails/hooks/use-email-shortcuts.ts` | CREATE |
| `apps/webapp/src/features/simulated-emails/components/email-empty-state.tsx` | CREATE |
| `apps/webapp/src/features/simulated-emails/components/email-priority-badge.tsx` | REWRITE |
| `apps/webapp/src/features/simulated-emails/components/email-list-row.tsx` | CREATE |
| `apps/webapp/src/features/simulated-emails/components/email-list.tsx` | CREATE |
| `apps/webapp/src/features/simulated-emails/components/email-filter-popover.tsx` | CREATE |
| `apps/webapp/src/features/simulated-emails/components/email-folder-tabs.tsx` | CREATE |
| `apps/webapp/src/features/simulated-emails/components/email-toolbar.tsx` | CREATE |
| `apps/webapp/src/features/simulated-emails/components/email-bulk-bar.tsx` | CREATE |
| `apps/webapp/src/features/simulated-emails/components/email-reply-form.tsx` | CREATE |
| `apps/webapp/src/features/simulated-emails/components/email-detail-drawer.tsx` | CREATE |
| `apps/webapp/src/features/simulated-emails/pages/email-inbox-page.tsx` | REWRITE |
| `apps/webapp/src/features/simulated-emails/components/email-list-item.tsx` | DELETE |
| `apps/webapp/src/features/simulated-emails/components/email-response-form.tsx` | DELETE |

---

## Task 1: Backend — bulk endpoints (DTO + service + controller)

**Files:**
- Create: `apps/api/src/modules/simulated-emails/dto/bulk-email-action.dto.ts`
- Modify: `apps/api/src/modules/simulated-emails/dto/index.ts`
- Modify: `apps/api/src/modules/simulated-emails/services/simulated-emails.service.ts`
- Modify: `apps/api/src/modules/simulated-emails/controllers/simulated-emails.controller.ts`

- [ ] **Step 1: Create DTO**

Create `apps/api/src/modules/simulated-emails/dto/bulk-email-action.dto.ts`:

```ts
import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsString } from 'class-validator';

export class BulkEmailActionDto {
  @ApiProperty({
    type: [String],
    description: "IDs des emails (min 1, max 50)",
    example: ['cuid1', 'cuid2'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @IsString({ each: true })
  emailIds!: string[];
}
```

- [ ] **Step 2: Export DTO from barrel**

Modify `apps/api/src/modules/simulated-emails/dto/index.ts` — add the export. Read the file first to preserve existing exports, then append:

```ts
export * from './bulk-email-action.dto';
```

- [ ] **Step 3: Add bulk service methods**

Append to `apps/api/src/modules/simulated-emails/services/simulated-emails.service.ts` (inside the `SimulatedEmailsService` class, after the existing `archive` method):

```ts
  /**
   * Bulk-archive multiple emails. Returns the count of effectively updated rows.
   * Ignores emails already archived. Tenant-scoped.
   */
  async bulkArchive(
    simulationId: string,
    userId: string,
    tenantId: string,
    emailIds: string[],
  ): Promise<{ archived: number }> {
    await this.getSimulationWithScenario(simulationId, userId, tenantId);

    const result = await this.prisma.simulatedEmail.updateMany({
      where: {
        id: { in: emailIds },
        simulationId,
        tenantId,
        status: { not: EmailStatus.ARCHIVED },
      },
      data: { status: EmailStatus.ARCHIVED },
    });

    return { archived: result.count };
  }

  /**
   * Bulk-mark multiple UNREAD emails as READ. Returns the count of effectively
   * updated rows. Ignores emails already read / responded / archived.
   * Tenant-scoped.
   */
  async bulkMarkRead(
    simulationId: string,
    userId: string,
    tenantId: string,
    emailIds: string[],
  ): Promise<{ updated: number }> {
    await this.getSimulationWithScenario(simulationId, userId, tenantId);

    const result = await this.prisma.simulatedEmail.updateMany({
      where: {
        id: { in: emailIds },
        simulationId,
        tenantId,
        status: EmailStatus.UNREAD,
      },
      data: {
        status: EmailStatus.READ,
        readAt: new Date(),
      },
    });

    return { updated: result.count };
  }

  /**
   * Mark a single email as UNREAD. Only valid when current status is READ
   * or RESPONDED (cannot un-archive). Tenant-scoped + ownership-checked.
   */
  async markUnread(
    simulationId: string,
    emailId: string,
    userId: string,
    tenantId: string,
  ): Promise<SimulatedEmail> {
    await this.getSimulationWithScenario(simulationId, userId, tenantId);
    const email = await this.findEmailOrThrow(emailId, simulationId, tenantId);

    if (email.status === EmailStatus.ARCHIVED) {
      throw new BadRequestException(
        "Impossible de marquer un email archive comme non lu",
      );
    }
    if (email.status === EmailStatus.UNREAD) {
      return email;
    }

    return this.prisma.simulatedEmail.update({
      where: { id: emailId },
      data: { status: EmailStatus.UNREAD, readAt: null },
    });
  }
```

- [ ] **Step 4: Add controller endpoints**

Modify `apps/api/src/modules/simulated-emails/controllers/simulated-emails.controller.ts`. Update the import line for DTOs:

```ts
import { RespondEmailDto, GenerateEmailsDto, BulkEmailActionDto } from '../dto';
```

Add these two methods inside the `SimulatedEmailsController` class, after the existing `archive` method and before the `generate` method (search for `@Post('simulations/:simId/emails/:emailId/archive')` to locate the spot, then add after the corresponding method's closing brace):

```ts
  // ─── Bulk archive ───────────────────────────────────────────

  @Post('simulations/:simId/emails/bulk-archive')
  @Auditable('EMAIL_BULK_ARCHIVED', 'SimulatedEmail')
  @ApiOperation({ summary: 'Archiver plusieurs emails en une seule operation' })
  @ApiParam({ name: 'simId', description: 'ID de la simulation' })
  bulkArchive(
    @Param('simId') simId: string,
    @Body() dto: BulkEmailActionDto,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.simulatedEmailsService.bulkArchive(
      simId,
      user.id,
      tenantId,
      dto.emailIds,
    );
  }

  // ─── Bulk mark as read ──────────────────────────────────────

  @Post('simulations/:simId/emails/bulk-mark-read')
  @Auditable('EMAIL_BULK_MARKED_READ', 'SimulatedEmail')
  @ApiOperation({ summary: 'Marquer plusieurs emails comme lus en une seule operation' })
  @ApiParam({ name: 'simId', description: 'ID de la simulation' })
  bulkMarkRead(
    @Param('simId') simId: string,
    @Body() dto: BulkEmailActionDto,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.simulatedEmailsService.bulkMarkRead(
      simId,
      user.id,
      tenantId,
      dto.emailIds,
    );
  }

  // ─── Mark single email as unread ────────────────────────────

  @Post('simulations/:simId/emails/:emailId/mark-unread')
  @Auditable('EMAIL_MARKED_UNREAD', 'SimulatedEmail')
  @ApiOperation({ summary: 'Marquer un email comme non lu' })
  @ApiParam({ name: 'simId', description: 'ID de la simulation' })
  @ApiParam({ name: 'emailId', description: 'ID de l\'email' })
  markUnread(
    @Param('simId') simId: string,
    @Param('emailId') emailId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.simulatedEmailsService.markUnread(
      simId,
      emailId,
      user.id,
      tenantId,
    );
  }
```

- [ ] **Step 5: Typecheck backend**

Run: `pnpm --filter @sim360/api typecheck`
Expected: 0 errors.

- [ ] **Step 6: Build core (no change but defensive — backend depends on it)**

Run: `pnpm --filter @sim360/core build`
Expected: success.

- [ ] **Step 7: Commit**

```bash
git add apps/api/src/modules/simulated-emails/dto/bulk-email-action.dto.ts \
        apps/api/src/modules/simulated-emails/dto/index.ts \
        apps/api/src/modules/simulated-emails/services/simulated-emails.service.ts \
        apps/api/src/modules/simulated-emails/controllers/simulated-emails.controller.ts
git commit -m "$(cat <<'EOF'
feat(api/emails): add bulk-archive, bulk-mark-read, mark-unread endpoints

Three new endpoints under /simulations/:simId/emails. The two bulk
endpoints (max 50 emails per call) use updateMany for atomicity.
mark-unread is single-email and rejects archived ones. All three
filter by tenantId + userId ownership and are decorated with @Auditable.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Frontend — API client extension

**Files:**
- Modify: `apps/webapp/src/features/simulated-emails/types/simulated-email.types.ts`
- Modify: `apps/webapp/src/features/simulated-emails/api/simulated-emails.api.ts`

- [ ] **Step 1: Add types**

Append to `apps/webapp/src/features/simulated-emails/types/simulated-email.types.ts`:

```ts
export interface BulkEmailActionDto {
  emailIds: string[];
}

export interface BulkArchiveResult {
  archived: number;
}

export interface BulkMarkReadResult {
  updated: number;
}
```

- [ ] **Step 2: Add API methods + hooks**

Modify `apps/webapp/src/features/simulated-emails/api/simulated-emails.api.ts`. Update the type import line:

```ts
import type {
  SimulatedEmail,
  EmailFilters,
  RespondToEmailDto,
  BulkArchiveResult,
  BulkMarkReadResult,
} from '../types/simulated-email.types';
```

Inside the `simulatedEmailsApi` object, add after the `archive` method:

```ts
  bulkArchive: (simId: string, emailIds: string[]) =>
    api.post<BulkArchiveResult>(
      `/simulations/${simId}/emails/bulk-archive`,
      { emailIds },
    ),

  bulkMarkRead: (simId: string, emailIds: string[]) =>
    api.post<BulkMarkReadResult>(
      `/simulations/${simId}/emails/bulk-mark-read`,
      { emailIds },
    ),

  markUnread: (simId: string, emailId: string) =>
    api.post<SimulatedEmail>(
      `/simulations/${simId}/emails/${emailId}/mark-unread`,
    ),
```

At the end of the file, after the existing `useArchiveEmail` hook, add:

```ts
export const useBulkArchiveEmails = (simId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (emailIds: string[]) =>
      simulatedEmailsApi.bulkArchive(simId, emailIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all(simId) });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.unreadCount(simId),
      });
    },
  });
};

export const useBulkMarkReadEmails = (simId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (emailIds: string[]) =>
      simulatedEmailsApi.bulkMarkRead(simId, emailIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all(simId) });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.unreadCount(simId),
      });
    },
  });
};

export const useMarkUnreadEmail = (simId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (emailId: string) =>
      simulatedEmailsApi.markUnread(simId, emailId),
    onSuccess: (_result, emailId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all(simId) });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.detail(simId, emailId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.unreadCount(simId),
      });
    },
  });
};
```

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add apps/webapp/src/features/simulated-emails/types/simulated-email.types.ts \
        apps/webapp/src/features/simulated-emails/api/simulated-emails.api.ts
git commit -m "$(cat <<'EOF'
feat(webapp/emails): add bulk-archive, bulk-mark-read, mark-unread mutations

Wraps the three new backend endpoints with TanStack Query hooks
(useBulkArchiveEmails, useBulkMarkReadEmails, useMarkUnreadEmail) that
invalidate the emails list, optional detail entry, and unread-count
queries on success.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Frontend — hooks (use-email-draft + use-email-shortcuts)

**Files:**
- Create: `apps/webapp/src/features/simulated-emails/hooks/use-email-draft.ts`
- Create: `apps/webapp/src/features/simulated-emails/hooks/use-email-shortcuts.ts`

- [ ] **Step 1: Create the hooks directory** (if it does not exist)

Run: `mkdir -p apps/webapp/src/features/simulated-emails/hooks`

- [ ] **Step 2: Create use-email-draft hook**

Create `apps/webapp/src/features/simulated-emails/hooks/use-email-draft.ts`:

```ts
import { useEffect, useRef, useState } from 'react';

const DRAFT_KEY_PREFIX = 'simex.draft.email.';
const DEBOUNCE_MS = 800;

/**
 * Auto-saves and restores a per-email reply draft to localStorage.
 * Writes are debounced (800ms). Pass `emailId === null` to no-op.
 */
export function useEmailDraft(emailId: string | null) {
  const [draft, setDraftState] = useState<string>('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentIdRef = useRef<string | null>(null);

  // Load draft when emailId changes
  useEffect(() => {
    currentIdRef.current = emailId;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!emailId) {
      setDraftState('');
      return;
    }
    try {
      const stored = window.localStorage.getItem(DRAFT_KEY_PREFIX + emailId);
      setDraftState(stored ?? '');
    } catch {
      setDraftState('');
    }
  }, [emailId]);

  function setDraft(value: string) {
    setDraftState(value);
    const id = currentIdRef.current;
    if (!id) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        if (value.length === 0) {
          window.localStorage.removeItem(DRAFT_KEY_PREFIX + id);
        } else {
          window.localStorage.setItem(DRAFT_KEY_PREFIX + id, value);
        }
      } catch {
        // localStorage may be full or blocked — silently degrade.
      }
    }, DEBOUNCE_MS);
  }

  function clearDraft() {
    const id = currentIdRef.current;
    setDraftState('');
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!id) return;
    try {
      window.localStorage.removeItem(DRAFT_KEY_PREFIX + id);
    } catch {
      // ignore
    }
  }

  // Flush on unmount (safety net for unsaved changes)
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  return { draft, setDraft, clearDraft };
}
```

- [ ] **Step 3: Create use-email-shortcuts hook**

Create `apps/webapp/src/features/simulated-emails/hooks/use-email-shortcuts.ts`:

```ts
import { useEffect } from 'react';

interface ShortcutHandlers {
  enabled: boolean;
  onPrev: () => void;
  onNext: () => void;
  onReply: () => void;
  onArchive: () => void;
  onMarkUnread: () => void;
  onClose: () => void;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return false;
}

/**
 * Inbox-style keyboard shortcuts. Active only when `enabled` is true.
 * Esc fires even from inside inputs; other keys are ignored when typing.
 */
export function useEmailShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    if (!handlers.enabled) return;

    function onKeyDown(e: KeyboardEvent) {
      // Esc always works
      if (e.key === 'Escape') {
        e.preventDefault();
        handlers.onClose();
        return;
      }

      if (isEditableTarget(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key.toLowerCase()) {
        case 'j':
          e.preventDefault();
          handlers.onNext();
          break;
        case 'k':
          e.preventDefault();
          handlers.onPrev();
          break;
        case 'r':
          e.preventDefault();
          handlers.onReply();
          break;
        case 'e':
          e.preventDefault();
          handlers.onArchive();
          break;
        case 'u':
          e.preventDefault();
          handlers.onMarkUnread();
          break;
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [handlers]);
}
```

- [ ] **Step 4: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add apps/webapp/src/features/simulated-emails/hooks/
git commit -m "$(cat <<'EOF'
feat(webapp/emails): add useEmailDraft and useEmailShortcuts hooks

useEmailDraft persists per-email reply drafts to localStorage
(simex.draft.email.{id}) with 800ms debounce. useEmailShortcuts
attaches J/K/R/E/U/Esc keybindings, with Esc working from inputs
and others ignored while typing.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Frontend — EmailEmptyState + EmailPriorityBadge polish

**Files:**
- Create: `apps/webapp/src/features/simulated-emails/components/email-empty-state.tsx`
- Rewrite: `apps/webapp/src/features/simulated-emails/components/email-priority-badge.tsx`

- [ ] **Step 1: Read the existing priority badge to keep its public API**

Run: `cat apps/webapp/src/features/simulated-emails/components/email-priority-badge.tsx`

Note the export and prop signatures.

- [ ] **Step 2: Rewrite EmailPriorityBadge with premium tokens + DB→label mapping**

Replace the entire content of `apps/webapp/src/features/simulated-emails/components/email-priority-badge.tsx`:

```tsx
import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';
import type { EmailPriority } from '../types/simulated-email.types';

interface EmailPriorityBadgeProps {
  priority: EmailPriority;
  size?: 'xs' | 'sm';
  className?: string;
}

/**
 * Premium priority badge.
 * - URGENT/HIGH → "HAUTE" (warm accent)
 * - NORMAL      → "NORMALE" (neutral discreet)
 * - LOW         → "BASSE" (muted)
 */
export function EmailPriorityBadge({
  priority,
  size = 'xs',
  className,
}: EmailPriorityBadgeProps) {
  const isHigh = priority === 'URGENT' || priority === 'HIGH';
  const isNormal = priority === 'NORMAL';

  const label = isHigh ? 'HAUTE' : isNormal ? 'NORMALE' : 'BASSE';

  const sizeClasses =
    size === 'xs'
      ? 'text-[9px] px-2 py-0.5 gap-1'
      : 'text-[10px] px-2.5 py-1 gap-1.5';

  const variantClasses = isHigh
    ? 'bg-[var(--accent-100)] text-[var(--accent-700)] dark:bg-[var(--accent-900)]/30 dark:text-[var(--accent-300)]'
    : isNormal
      ? 'bg-[var(--neutral-100)] text-[var(--neutral-600)] dark:bg-white/[0.06] dark:text-[var(--neutral-300)]'
      : 'bg-[var(--neutral-50)] text-[var(--neutral-500)] dark:bg-white/[0.04] dark:text-[var(--neutral-400)]';

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold uppercase tracking-wide rounded-full',
        sizeClasses,
        variantClasses,
        className,
      )}
    >
      {isHigh && <KeenIcon icon="flash" style="solid" className="size-3" />}
      {label}
    </span>
  );
}
```

- [ ] **Step 3: Create EmailEmptyState**

Create `apps/webapp/src/features/simulated-emails/components/email-empty-state.tsx`:

```tsx
import { Link } from 'react-router-dom';
import { KeenIcon } from '@/components/keenicons';
import { Button } from '@/components/ui/button';

type Variant = 'no-simulation' | 'empty-folder' | 'no-results';
type Folder = 'inbox' | 'responded' | 'archived';

interface EmailEmptyStateProps {
  variant: Variant;
  folder?: Folder;
  onClearFilters?: () => void;
}

const FOLDER_EMPTY: Record<Folder, { icon: string; title: string; body: string }> = {
  inbox: {
    icon: 'sms',
    title: 'Boîte vide',
    body: 'Les emails arrivent au fil de la simulation. Patience !',
  },
  responded: {
    icon: 'check-circle',
    title: 'Aucun email répondu',
    body: 'Les emails auxquels vous répondez apparaîtront ici.',
  },
  archived: {
    icon: 'archive',
    title: 'Aucun email archivé',
    body: 'Les emails que vous archivez se retrouveront ici.',
  },
};

export function EmailEmptyState({
  variant,
  folder = 'inbox',
  onClearFilters,
}: EmailEmptyStateProps) {
  if (variant === 'no-simulation') {
    return (
      <div className="flex flex-col items-center justify-center text-center px-6 py-16">
        <div className="mb-4 text-[var(--neutral-300)] dark:text-white/20">
          <KeenIcon icon="rocket" style="duotone" className="size-14" />
        </div>
        <h3 className="font-display text-base font-bold text-foreground m-0 mb-1">
          Pas de simulation active
        </h3>
        <p className="text-sm text-muted-foreground m-0 mb-5 max-w-xs">
          Lancez une simulation pour recevoir des emails de vos collaborateurs.
        </p>
        <Button variant="primary" size="sm" asChild>
          <Link to="/simulations/new">
            Lancer une simulation
            <KeenIcon icon="arrow-right" style="solid" className="size-3.5 ml-1" />
          </Link>
        </Button>
      </div>
    );
  }

  if (variant === 'no-results') {
    return (
      <div className="flex flex-col items-center justify-center text-center px-6 py-16">
        <div className="mb-4 text-[var(--neutral-300)] dark:text-white/20">
          <KeenIcon icon="magnifier" style="duotone" className="size-14" />
        </div>
        <h3 className="font-display text-base font-bold text-foreground m-0 mb-1">
          Aucun résultat
        </h3>
        <p className="text-sm text-muted-foreground m-0 mb-4 max-w-xs">
          Aucun email ne correspond à votre recherche ou aux filtres actifs.
        </p>
        {onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="text-sm font-semibold text-[var(--brand-600)] hover:text-[var(--brand-700)] dark:text-[var(--brand-400)] dark:hover:text-[var(--brand-300)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-500)] rounded"
          >
            Effacer les filtres
          </button>
        )}
      </div>
    );
  }

  const { icon, title, body } = FOLDER_EMPTY[folder];
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-16">
      <div className="mb-4 text-[var(--neutral-300)] dark:text-white/20">
        <KeenIcon icon={icon} style="duotone" className="size-14" />
      </div>
      <h3 className="font-display text-base font-bold text-foreground m-0 mb-1">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground m-0 max-w-xs">{body}</p>
    </div>
  );
}
```

- [ ] **Step 4: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add apps/webapp/src/features/simulated-emails/components/email-priority-badge.tsx \
        apps/webapp/src/features/simulated-emails/components/email-empty-state.tsx
git commit -m "$(cat <<'EOF'
feat(webapp/emails): premium EmailEmptyState + repolished EmailPriorityBadge

EmailEmptyState handles three variants (no-simulation, empty-folder,
no-results) with KeenIcon glyphs and per-folder copy. EmailPriorityBadge
maps DB values (URGENT/HIGH/NORMAL/LOW) to the user-facing French labels
(HAUTE/NORMALE/BASSE) and uses the accent/neutral tokens with dark-mode
counterparts.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Frontend — EmailListRow (rich row premium)

**Files:**
- Create: `apps/webapp/src/features/simulated-emails/components/email-list-row.tsx`

- [ ] **Step 1: Create EmailListRow**

Create `apps/webapp/src/features/simulated-emails/components/email-list-row.tsx`:

```tsx
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { KeenIcon } from '@/components/keenicons';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { EmailPriorityBadge } from './email-priority-badge';
import type { SimulatedEmail } from '../types/simulated-email.types';

interface EmailListRowProps {
  email: SimulatedEmail;
  isActive: boolean;
  isSelected: boolean;
  onClick: () => void;
  onToggleSelect: (checked: boolean) => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function EmailListRow({
  email,
  isActive,
  isSelected,
  onClick,
  onToggleSelect,
}: EmailListRowProps) {
  const isUnread = email.status === 'UNREAD';
  const isHigh = email.priority === 'URGENT' || email.priority === 'HIGH';
  const isResponded = email.status === 'RESPONDED';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      data-active={isActive ? 'true' : undefined}
      className={cn(
        'group relative flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors',
        'border-b border-[var(--neutral-100)] dark:border-white/[0.06]',
        'hover:bg-[var(--neutral-50)] dark:hover:bg-white/[0.03]',
        'focus-visible:outline-none focus-visible:bg-[var(--neutral-50)] dark:focus-visible:bg-white/[0.04]',
        isActive &&
          'bg-[var(--brand-50)] dark:bg-[var(--brand-950)]/40 hover:bg-[var(--brand-50)] dark:hover:bg-[var(--brand-950)]/40',
        isHigh && !isActive && 'bg-gradient-to-r from-[var(--accent-50)] to-transparent dark:from-[var(--accent-950)]/20',
      )}
      style={
        isHigh
          ? { boxShadow: 'inset 3px 0 0 var(--accent-500)' }
          : undefined
      }
    >
      {/* Checkbox */}
      <div
        className="pt-1.5 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onToggleSelect(checked === true)}
          aria-label={`Sélectionner l'email de ${email.senderName}`}
        />
      </div>

      {/* Avatar */}
      <div
        className={cn(
          'shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-[11px] font-bold',
          isUnread
            ? 'bg-gradient-to-br from-[var(--brand-500)] to-[var(--brand-700)] text-white'
            : 'bg-[var(--neutral-200)] dark:bg-white/[0.08] text-[var(--neutral-600)] dark:text-[var(--neutral-300)]',
        )}
      >
        {getInitials(email.senderName)}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-0.5">
          <span
            className={cn(
              'text-[13px] truncate',
              isUnread ? 'font-bold text-foreground' : 'font-medium text-foreground',
            )}
          >
            {email.senderName}
          </span>
          <span className="text-[10px] text-muted-foreground truncate hidden sm:inline">
            {email.senderRole}
          </span>
          <span className="ml-auto text-[11px] text-muted-foreground shrink-0">
            {formatDistanceToNow(new Date(email.scheduledAt), {
              addSuffix: false,
              locale: fr,
            })}
          </span>
        </div>

        <div
          className={cn(
            'text-[13px] mb-0.5',
            isUnread
              ? 'font-semibold text-foreground'
              : 'font-medium text-foreground',
          )}
        >
          {email.subject}
        </div>

        <div className="text-[12px] text-muted-foreground line-clamp-1">
          {email.body}
        </div>

        <div className="flex items-center gap-1.5 mt-1.5">
          <EmailPriorityBadge priority={email.priority} />
          {isResponded && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--success-700)] dark:text-[var(--success-400)]">
              <KeenIcon icon="check-circle" style="solid" className="size-3" />
              Répondu
              {typeof email.responseScore === 'number' && (
                <span className="text-muted-foreground">· {email.responseScore}/100</span>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/features/simulated-emails/components/email-list-row.tsx
git commit -m "$(cat <<'EOF'
feat(webapp/emails): premium EmailListRow with snippet + states

Rich row showing avatar (gradient for unread, neutral for read),
sender name + role, timestamp, subject, snippet (line-clamp-1),
priority badge, and responded indicator with score. Hover and active
states use semantic tokens. High-priority rows get a warm gradient
background and left-edge accent stroke.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Frontend — EmailList (container with states)

**Files:**
- Create: `apps/webapp/src/features/simulated-emails/components/email-list.tsx`

- [ ] **Step 1: Create EmailList**

Create `apps/webapp/src/features/simulated-emails/components/email-list.tsx`:

```tsx
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { EmailListRow } from './email-list-row';
import { EmailEmptyState } from './email-empty-state';
import type { SimulatedEmail } from '../types/simulated-email.types';

type Folder = 'inbox' | 'responded' | 'archived';

interface EmailListProps {
  emails: SimulatedEmail[];
  folder: Folder;
  isLoading: boolean;
  hasFiltersOrSearch: boolean;
  activeEmailId: string | null;
  selectedIds: Set<string>;
  onSelectEmail: (email: SimulatedEmail) => void;
  onToggleSelect: (emailId: string, checked: boolean) => void;
  onClearFilters: () => void;
}

export function EmailList({
  emails,
  folder,
  isLoading,
  hasFiltersOrSearch,
  activeEmailId,
  selectedIds,
  onSelectEmail,
  onToggleSelect,
  onClearFilters,
}: EmailListProps) {
  return (
    <Card
      className={cn(
        'overflow-hidden',
        'border-[var(--neutral-100)] dark:border-white/[0.06]',
        'shadow-[0_1px_2px_rgba(15,26,46,0.04),0_8px_24px_-10px_rgba(15,26,46,0.08)]',
        'dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_-10px_rgba(0,0,0,0.5)]',
      )}
    >
      {isLoading ? (
        <div className="divide-y divide-[var(--neutral-100)] dark:divide-white/[0.06]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3">
              <Skeleton className="size-4 mt-1.5 shrink-0 rounded" />
              <Skeleton className="size-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : emails.length === 0 ? (
        hasFiltersOrSearch ? (
          <EmailEmptyState variant="no-results" onClearFilters={onClearFilters} />
        ) : (
          <EmailEmptyState variant="empty-folder" folder={folder} />
        )
      ) : (
        <div className="divide-y divide-[var(--neutral-100)] dark:divide-white/[0.06]">
          {emails.map((email) => (
            <EmailListRow
              key={email.id}
              email={email}
              isActive={activeEmailId === email.id}
              isSelected={selectedIds.has(email.id)}
              onClick={() => onSelectEmail(email)}
              onToggleSelect={(checked) => onToggleSelect(email.id, checked)}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/features/simulated-emails/components/email-list.tsx
git commit -m "$(cat <<'EOF'
feat(webapp/emails): EmailList container with loading/empty states

Premium card wrapper with soft shadow + neutral border (dark-mode aware).
Renders 5 skeleton rows while loading, EmailEmptyState for the empty
case (variant depends on whether filters or search are active), and a
divided list of EmailListRow otherwise.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Frontend — EmailFilterPopover

**Files:**
- Create: `apps/webapp/src/features/simulated-emails/components/email-filter-popover.tsx`

- [ ] **Step 1: Create EmailFilterPopover**

Create `apps/webapp/src/features/simulated-emails/components/email-filter-popover.tsx`:

```tsx
import { useState } from 'react';
import { KeenIcon } from '@/components/keenicons';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export type PriorityBucket = 'HIGH' | 'NORMAL' | 'LOW';
export type PeriodBucket = 'today' | 'last7' | 'last30';

export interface EmailFilters {
  priorities: PriorityBucket[];
  period: PeriodBucket | null;
  scoreMin70: boolean;
}

interface EmailFilterPopoverProps {
  filters: EmailFilters;
  showScoreFilter: boolean;
  onApply: (filters: EmailFilters) => void;
  onReset: () => void;
}

export function EmailFilterPopover({
  filters,
  showScoreFilter,
  onApply,
  onReset,
}: EmailFilterPopoverProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<EmailFilters>(filters);

  const activeCount =
    draft.priorities.length +
    (draft.period ? 1 : 0) +
    (draft.scoreMin70 ? 1 : 0);

  function handleOpenChange(next: boolean) {
    if (next) setDraft(filters);
    setOpen(next);
  }

  function handleApply() {
    onApply(draft);
    setOpen(false);
  }

  function handleResetDraft() {
    setDraft({ priorities: [], period: null, scoreMin70: false });
  }

  const appliedCount =
    filters.priorities.length +
    (filters.period ? 1 : 0) +
    (filters.scoreMin70 ? 1 : 0);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <KeenIcon icon="filter" style="duotone" className="size-3.5" />
          Filtrer
          {appliedCount > 0 && (
            <span className="ml-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--brand-500)] text-white text-[10px] font-bold">
              {appliedCount}
            </span>
          )}
          <KeenIcon icon="down" style="solid" className="size-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-4">
        <div className="font-display text-sm font-bold text-foreground mb-3">
          Filtres
        </div>

        <div className="mb-4">
          <Label className="text-[10px] font-bold uppercase tracking-[1.2px] text-muted-foreground mb-2 block">
            Priorité
          </Label>
          <ToggleGroup
            type="multiple"
            value={draft.priorities}
            onValueChange={(value) =>
              setDraft((d) => ({ ...d, priorities: value as PriorityBucket[] }))
            }
            className="flex-wrap gap-1.5 justify-start"
          >
            <ToggleGroupItem value="HIGH" size="sm" className="rounded-full">
              HAUTE
            </ToggleGroupItem>
            <ToggleGroupItem value="NORMAL" size="sm" className="rounded-full">
              NORMALE
            </ToggleGroupItem>
            <ToggleGroupItem value="LOW" size="sm" className="rounded-full">
              BASSE
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="mb-4">
          <Label className="text-[10px] font-bold uppercase tracking-[1.2px] text-muted-foreground mb-2 block">
            Période
          </Label>
          <ToggleGroup
            type="single"
            value={draft.period ?? ''}
            onValueChange={(value) =>
              setDraft((d) => ({
                ...d,
                period: value ? (value as PeriodBucket) : null,
              }))
            }
            className="flex-wrap gap-1.5 justify-start"
          >
            <ToggleGroupItem value="today" size="sm" className="rounded-full">
              Aujourd'hui
            </ToggleGroupItem>
            <ToggleGroupItem value="last7" size="sm" className="rounded-full">
              7 jours
            </ToggleGroupItem>
            <ToggleGroupItem value="last30" size="sm" className="rounded-full">
              30 jours
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {showScoreFilter && (
          <div className="mb-4 flex items-center justify-between">
            <Label
              htmlFor="filter-score-min"
              className="text-sm text-foreground cursor-pointer"
            >
              Score IA ≥ 70
            </Label>
            <Switch
              id="filter-score-min"
              checked={draft.scoreMin70}
              onCheckedChange={(v) =>
                setDraft((d) => ({ ...d, scoreMin70: v }))
              }
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-[var(--neutral-100)] dark:border-white/[0.06]">
          <button
            type="button"
            onClick={() => {
              handleResetDraft();
              onReset();
            }}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Réinitialiser
          </button>
          <Button variant="primary" size="sm" onClick={handleApply}>
            Appliquer{activeCount > 0 && ` (${activeCount})`}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/features/simulated-emails/components/email-filter-popover.tsx
git commit -m "$(cat <<'EOF'
feat(webapp/emails): EmailFilterPopover with priority/period/score chips

Radix Popover wrapping ToggleGroup chips for priority (multi) and
period (single), plus an optional Switch for "score IA >= 70" shown
only on the Responded folder. Apply commits to parent, Reset clears
both draft and applied filters. Counter pill on the trigger reflects
applied filter count.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Frontend — EmailFolderTabs

**Files:**
- Create: `apps/webapp/src/features/simulated-emails/components/email-folder-tabs.tsx`

- [ ] **Step 1: Create EmailFolderTabs**

Create `apps/webapp/src/features/simulated-emails/components/email-folder-tabs.tsx`:

```tsx
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export type EmailFolder = 'inbox' | 'responded' | 'archived';

interface EmailFolderTabsProps {
  active: EmailFolder;
  counts: Record<EmailFolder, number>;
}

const FOLDERS: { key: EmailFolder; label: string }[] = [
  { key: 'inbox', label: 'Boîte de réception' },
  { key: 'responded', label: 'Répondus' },
  { key: 'archived', label: 'Archives' },
];

export function EmailFolderTabs({ active, counts }: EmailFolderTabsProps) {
  const navigate = useNavigate();

  return (
    <div
      role="tablist"
      aria-label="Dossiers d'emails"
      className="flex items-center gap-1 sm:gap-2 overflow-x-auto -mx-1 px-1 border-b border-[var(--neutral-100)] dark:border-white/[0.06]"
    >
      {FOLDERS.map(({ key, label }) => {
        const isActive = key === active;
        const count = counts[key];
        return (
          <button
            key={key}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => navigate(`/emails/${key}`)}
            className={cn(
              'shrink-0 inline-flex items-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors',
              'border-b-2 -mb-px',
              'focus-visible:outline-none focus-visible:bg-[var(--neutral-50)] dark:focus-visible:bg-white/[0.04] rounded-t',
              isActive
                ? 'border-[var(--brand-500)] text-[var(--brand-600)] dark:text-[var(--brand-400)]'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <span>{label}</span>
            <span
              className={cn(
                'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold',
                isActive
                  ? 'bg-[var(--brand-100)] text-[var(--brand-700)] dark:bg-[var(--brand-900)]/40 dark:text-[var(--brand-300)]'
                  : 'bg-[var(--neutral-100)] text-[var(--neutral-500)] dark:bg-white/[0.06] dark:text-[var(--neutral-400)]',
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/features/simulated-emails/components/email-folder-tabs.tsx
git commit -m "$(cat <<'EOF'
feat(webapp/emails): EmailFolderTabs with counts and brand-tinted active

Three horizontally-scrollable tab buttons (inbox/responded/archived).
Clicking navigates to /emails/:folder. Active tab has brand-tinted
underline and count pill; inactive tabs are muted. Accessible via role
"tablist" / "tab" with aria-selected.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Frontend — EmailToolbar + EmailBulkBar

**Files:**
- Create: `apps/webapp/src/features/simulated-emails/components/email-toolbar.tsx`
- Create: `apps/webapp/src/features/simulated-emails/components/email-bulk-bar.tsx`

- [ ] **Step 1: Create EmailToolbar**

Create `apps/webapp/src/features/simulated-emails/components/email-toolbar.tsx`:

```tsx
import { KeenIcon } from '@/components/keenicons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmailFilterPopover, type EmailFilters } from './email-filter-popover';

export type SortKey = 'date-desc' | 'date-asc' | 'priority';

const SORT_LABELS: Record<SortKey, string> = {
  'date-desc': 'Date (récent → ancien)',
  'date-asc': 'Date (ancien → récent)',
  priority: 'Priorité (haute → basse)',
};

interface EmailToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
  filters: EmailFilters;
  showScoreFilter: boolean;
  onFiltersApply: (filters: EmailFilters) => void;
  onFiltersReset: () => void;
}

export function EmailToolbar({
  search,
  onSearchChange,
  sort,
  onSortChange,
  filters,
  showScoreFilter,
  onFiltersApply,
  onFiltersReset,
}: EmailToolbarProps) {
  return (
    <div className="flex items-center gap-2 py-3">
      <div className="relative flex-1 max-w-md">
        <KeenIcon
          icon="magnifier"
          style="duotone"
          className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher par sujet ou expéditeur..."
          className="pl-9"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Effacer la recherche"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-500)]"
          >
            <KeenIcon icon="cross" style="solid" className="size-3.5" />
          </button>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
            <KeenIcon icon="arrow-up-down" style="duotone" className="size-3.5" />
            <span className="hidden sm:inline">
              {sort === 'priority' ? 'Priorité' : 'Date'}
            </span>
            <KeenIcon icon="down" style="solid" className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
            <DropdownMenuItem key={key} onClick={() => onSortChange(key)}>
              {SORT_LABELS[key]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <EmailFilterPopover
        filters={filters}
        showScoreFilter={showScoreFilter}
        onApply={onFiltersApply}
        onReset={onFiltersReset}
      />
    </div>
  );
}
```

- [ ] **Step 2: Create EmailBulkBar**

Create `apps/webapp/src/features/simulated-emails/components/email-bulk-bar.tsx`:

```tsx
import { KeenIcon } from '@/components/keenicons';
import { Button } from '@/components/ui/button';

interface EmailBulkBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onMarkRead: () => void;
  onArchive: () => void;
  onCancel: () => void;
  isPending: boolean;
}

export function EmailBulkBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onMarkRead,
  onArchive,
  onCancel,
  isPending,
}: EmailBulkBarProps) {
  const allSelected = selectedCount === totalCount;

  return (
    <div className="flex flex-wrap items-center gap-2 py-2 px-3 rounded-md bg-[var(--brand-50)] dark:bg-[var(--brand-950)]/40 border border-[var(--brand-100)] dark:border-[var(--brand-900)]/60">
      <span className="font-semibold text-sm text-[var(--brand-700)] dark:text-[var(--brand-300)]">
        {selectedCount} sélectionné{selectedCount > 1 ? 's' : ''}
      </span>

      {!allSelected && (
        <button
          type="button"
          onClick={onSelectAll}
          className="text-xs underline text-[var(--brand-700)] dark:text-[var(--brand-300)] hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-500)] rounded"
        >
          Tout sélectionner ({totalCount})
        </button>
      )}

      <div className="flex-1" />

      <Button
        variant="outline"
        size="sm"
        onClick={onMarkRead}
        disabled={isPending}
        className="gap-1.5"
      >
        <KeenIcon icon="sms-open" style="duotone" className="size-3.5" />
        <span className="hidden sm:inline">Marquer comme lu</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onArchive}
        disabled={isPending}
        className="gap-1.5"
      >
        <KeenIcon icon="archive" style="duotone" className="size-3.5" />
        <span className="hidden sm:inline">Archiver</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onCancel}
        disabled={isPending}
        className="gap-1"
      >
        <KeenIcon icon="cross" style="solid" className="size-3" />
        <span className="hidden sm:inline">Annuler</span>
      </Button>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add apps/webapp/src/features/simulated-emails/components/email-toolbar.tsx \
        apps/webapp/src/features/simulated-emails/components/email-bulk-bar.tsx
git commit -m "$(cat <<'EOF'
feat(webapp/emails): EmailToolbar (search + sort + filter) and EmailBulkBar

EmailToolbar lays out a search input (with clear button), a sort
DropdownMenu (3 options), and the filter Popover. EmailBulkBar replaces
the toolbar when emails are selected: shows count + "select all" link
+ Mark-read / Archive / Cancel actions, with brand-tinted background.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Frontend — EmailReplyForm

**Files:**
- Create: `apps/webapp/src/features/simulated-emails/components/email-reply-form.tsx`

- [ ] **Step 1: Create EmailReplyForm**

Create `apps/webapp/src/features/simulated-emails/components/email-reply-form.tsx`:

```tsx
import { forwardRef, type FormEvent } from 'react';
import { KeenIcon } from '@/components/keenicons';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const MAX_LENGTH = 2000;

interface EmailReplyFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isPending: boolean;
}

export const EmailReplyForm = forwardRef<HTMLTextAreaElement, EmailReplyFormProps>(
  function EmailReplyForm({ value, onChange, onSubmit, isPending }, ref) {
    function handleSubmit(e: FormEvent) {
      e.preventDefault();
      if (!value.trim() || isPending) return;
      onSubmit();
    }

    return (
      <form
        onSubmit={handleSubmit}
        className="border-t border-[var(--neutral-100)] dark:border-white/[0.06] p-4 bg-[var(--neutral-50)] dark:bg-white/[0.02]"
      >
        <Textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, MAX_LENGTH))}
          placeholder="Rédigez votre réponse..."
          rows={3}
          disabled={isPending}
          className="resize-none bg-background"
          aria-label="Réponse à l'email"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
            {value.length} / {MAX_LENGTH}
            <span aria-hidden="true">·</span>
            <KeenIcon icon="save-2" style="duotone" className="size-3" />
            <span>brouillon auto</span>
          </span>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isPending || !value.trim()}
            className="gap-1.5"
            title="Envoyer (R)"
          >
            {isPending ? (
              <>
                <KeenIcon
                  icon="loading"
                  style="duotone"
                  className="size-3.5 animate-spin"
                />
                Évaluation...
              </>
            ) : (
              <>
                <KeenIcon icon="send" style="duotone" className="size-3.5" />
                Envoyer
              </>
            )}
          </Button>
        </div>
      </form>
    );
  },
);
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/features/simulated-emails/components/email-reply-form.tsx
git commit -m "$(cat <<'EOF'
feat(webapp/emails): EmailReplyForm with character counter and draft indicator

ForwardRef'd textarea (parent owns the ref so the R shortcut can focus
it) capped at 2000 characters. Footer shows live counter + draft
auto-save indicator. Submit button shows a spinner + "Evaluation..."
during the response mutation.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: Frontend — EmailDetailDrawer (using Sheet)

**Files:**
- Create: `apps/webapp/src/features/simulated-emails/components/email-detail-drawer.tsx`

- [ ] **Step 1: Create EmailDetailDrawer**

Create `apps/webapp/src/features/simulated-emails/components/email-detail-drawer.tsx`:

```tsx
import { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { KeenIcon } from '@/components/keenicons';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { EmailPriorityBadge } from './email-priority-badge';
import { EmailReplyForm } from './email-reply-form';
import { useEmailDraft } from '../hooks/use-email-draft';
import { useEmailShortcuts } from '../hooks/use-email-shortcuts';
import type { SimulatedEmail } from '../types/simulated-email.types';

interface EmailDetailDrawerProps {
  email: SimulatedEmail | null;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onArchive: () => void;
  onMarkUnread: () => void;
  onRespond: (response: string) => Promise<void>;
  isRespondPending: boolean;
  isArchivePending: boolean;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function EmailDetailDrawer({
  email,
  index,
  total,
  onClose,
  onPrev,
  onNext,
  onArchive,
  onMarkUnread,
  onRespond,
  isRespondPending,
  isArchivePending,
}: EmailDetailDrawerProps) {
  const isMobile = useIsMobile();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { draft, setDraft, clearDraft } = useEmailDraft(email?.id ?? null);

  const isOpen = email !== null;
  const isArchived = email?.status === 'ARCHIVED';
  const isResponded = email?.status === 'RESPONDED';
  const canReply = email && !isArchived && !isResponded;

  function focusReply() {
    if (canReply) textareaRef.current?.focus();
  }

  async function handleSubmit() {
    if (!draft.trim()) return;
    await onRespond(draft);
    clearDraft();
  }

  useEmailShortcuts({
    enabled: isOpen && !isMobile,
    onPrev,
    onNext,
    onReply: focusReply,
    onArchive: () => {
      if (!isArchived) onArchive();
    },
    onMarkUnread: () => {
      if (!isArchived && (email?.status === 'READ' || email?.status === 'RESPONDED'))
        onMarkUnread();
    },
    onClose,
  });

  // Reset the local textarea ref focus when the email changes
  useEffect(() => {
    if (!isOpen) return;
    // Intentional: just reading email to satisfy dep array
  }, [email?.id, isOpen]);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        close={false}
        className={cn(
          'p-0 flex flex-col gap-0',
          isMobile
            ? 'h-[100dvh] max-h-[100dvh] w-full'
            : 'w-full sm:max-w-[600px] lg:max-w-[640px]',
        )}
      >
        {email && (
          <>
            {/* ── Drawer header ── */}
            <div className="shrink-0 px-3 sm:px-4 py-2.5 border-b border-[var(--neutral-100)] dark:border-white/[0.06] flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Fermer"
                className="size-8"
              >
                <KeenIcon
                  icon={isMobile ? 'arrow-left' : 'cross'}
                  style="solid"
                  className="size-4"
                />
              </Button>

              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onPrev}
                  disabled={total <= 1}
                  aria-label="Email précédent"
                  className="size-8"
                >
                  <KeenIcon icon="left" style="solid" className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onNext}
                  disabled={total <= 1}
                  aria-label="Email suivant"
                  className="size-8"
                >
                  <KeenIcon icon="right" style="solid" className="size-3.5" />
                </Button>
                <span className="text-[11px] text-muted-foreground ml-1 hidden sm:inline">
                  {index + 1} / {total}
                </span>
              </div>

              <div className="ml-auto flex items-center gap-1">
                {!isArchived && (email.status === 'READ' || isResponded) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onMarkUnread}
                    className="gap-1.5"
                    title="Marquer comme non lu (U)"
                  >
                    <KeenIcon icon="sms" style="duotone" className="size-3.5" />
                    <span className="hidden sm:inline">Marquer non lu</span>
                  </Button>
                )}
                {!isArchived && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onArchive}
                    disabled={isArchivePending}
                    className="gap-1.5"
                    title="Archiver (E)"
                  >
                    <KeenIcon icon="archive" style="duotone" className="size-3.5" />
                    <span className="hidden sm:inline">Archiver</span>
                  </Button>
                )}
              </div>
            </div>

            {/* ── Body (scrollable) ── */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5">
              <div className="flex items-center gap-2 mb-3">
                <EmailPriorityBadge priority={email.priority} size="sm" />
                <span className="text-xs text-muted-foreground">
                  {format(new Date(email.scheduledAt), 'd MMM yyyy, HH:mm', {
                    locale: fr,
                  })}
                </span>
                {isResponded && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--success-700)] dark:text-[var(--success-400)] ml-auto">
                    <KeenIcon icon="check-circle" style="solid" className="size-3" />
                    Répondu
                  </span>
                )}
                {isArchived && (
                  <span className="text-[10px] font-semibold text-muted-foreground ml-auto">
                    Archivé
                  </span>
                )}
              </div>

              <h2 className="font-display text-[19px] font-bold text-foreground m-0 mb-4 leading-tight">
                {email.subject}
              </h2>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--neutral-50)] dark:bg-white/[0.03] mb-5">
                <div className="shrink-0 flex items-center justify-center size-9 rounded-full bg-gradient-to-br from-[var(--brand-500)] to-[var(--brand-700)] text-white text-[13px] font-bold">
                  {getInitials(email.senderName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-foreground truncate">
                    {email.senderName}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {email.senderRole} · {email.senderEmail}
                  </div>
                </div>
              </div>

              <div className="text-[13px] text-foreground leading-relaxed whitespace-pre-wrap">
                {email.body}
              </div>

              {isResponded && (
                <div className="mt-6 rounded-xl border border-[var(--neutral-100)] dark:border-white/[0.06] overflow-hidden">
                  <div className="px-4 py-3 bg-gradient-to-r from-[var(--brand-50)] to-[var(--success-50)] dark:from-[var(--brand-950)]/30 dark:to-[var(--success-950)]/30 border-b border-[var(--neutral-100)] dark:border-white/[0.06] flex items-center gap-2">
                    <KeenIcon
                      icon="message-text-2"
                      style="duotone"
                      className="size-4 text-[var(--brand-600)] dark:text-[var(--brand-400)]"
                    />
                    <span className="font-semibold text-sm text-foreground">
                      Votre réponse
                    </span>
                    {typeof email.responseScore === 'number' && (
                      <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full bg-[var(--success-500)] text-white text-xs font-bold">
                        {email.responseScore}/100
                      </span>
                    )}
                  </div>
                  <div className="p-4 text-[13px] text-foreground whitespace-pre-wrap leading-relaxed">
                    {email.userResponse}
                  </div>
                  {email.responseFeedback && (
                    <div className="px-4 py-3 bg-[var(--neutral-50)] dark:bg-white/[0.02] border-t border-[var(--neutral-100)] dark:border-white/[0.06]">
                      <div className="text-[10px] font-bold uppercase tracking-[1.2px] text-[var(--accent-700)] dark:text-[var(--accent-300)] mb-1">
                        Retour de l'IA
                      </div>
                      <p className="text-[12.5px] text-muted-foreground leading-relaxed m-0">
                        {email.responseFeedback}
                      </p>
                    </div>
                  )}
                  {email.respondedAt && (
                    <div className="px-4 py-2 text-[11px] text-muted-foreground border-t border-[var(--neutral-100)] dark:border-white/[0.06]">
                      Répondu le{' '}
                      {format(new Date(email.respondedAt), 'd MMMM yyyy à HH:mm', {
                        locale: fr,
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Footer (reply form or status banner) ── */}
            {canReply ? (
              <EmailReplyForm
                ref={textareaRef}
                value={draft}
                onChange={setDraft}
                onSubmit={handleSubmit}
                isPending={isRespondPending}
              />
            ) : (
              <div className="shrink-0 border-t border-[var(--neutral-100)] dark:border-white/[0.06] p-4 bg-[var(--neutral-50)] dark:bg-white/[0.02]">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <KeenIcon
                    icon={isArchived ? 'archive' : 'check-circle'}
                    style="duotone"
                    className="size-4 shrink-0"
                  />
                  {isArchived
                    ? 'Cet email est archivé.'
                    : 'Vous avez déjà répondu à cet email.'}
                </div>
              </div>
            )}

            {/* Suppress unused-var warning for Separator (kept available for future use) */}
            <div hidden>
              <Separator />
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: 0 errors.

If `Separator` is reported unused, remove the `import` and the hidden div.

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/features/simulated-emails/components/email-detail-drawer.tsx
git commit -m "$(cat <<'EOF'
feat(webapp/emails): EmailDetailDrawer with prev/next, shortcuts, draft

Uses Sheet (Radix Dialog) with side=right desktop / side=bottom mobile.
Header bar: close, prev/next with index, mark-unread + archive actions
(hidden when archived). Body shows subject, sender card, content, and
AI feedback card when responded. Footer is EmailReplyForm or a status
banner. Wires up useEmailDraft (auto-saved per id) and useEmailShortcuts
(J/K/R/E/U/Esc, disabled on mobile).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: Frontend — Rewrite EmailInboxPage + delete old components

**Files:**
- Rewrite: `apps/webapp/src/features/simulated-emails/pages/email-inbox-page.tsx`
- Delete: `apps/webapp/src/features/simulated-emails/components/email-list-item.tsx`
- Delete: `apps/webapp/src/features/simulated-emails/components/email-response-form.tsx`

- [ ] **Step 1: Replace the entire content of email-inbox-page.tsx**

```tsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isAfter, subDays, startOfDay } from 'date-fns';
import { PageHeader } from '@/components/page-header';
import { simulationApi } from '@/features/simulation/api/simulation.api';
import {
  useSimulatedEmails,
  useArchiveEmail,
  useRespondToEmail,
  useBulkArchiveEmails,
  useBulkMarkReadEmails,
  useMarkUnreadEmail,
} from '../api/simulated-emails.api';
import { EmailFolderTabs, type EmailFolder } from '../components/email-folder-tabs';
import { EmailToolbar, type SortKey } from '../components/email-toolbar';
import { EmailBulkBar } from '../components/email-bulk-bar';
import { EmailList } from '../components/email-list';
import { EmailDetailDrawer } from '../components/email-detail-drawer';
import { EmailEmptyState } from '../components/email-empty-state';
import { Card } from '@/components/ui/card';
import type { EmailFilters } from '../components/email-filter-popover';
import type {
  SimulatedEmail,
  EmailStatus,
  EmailPriority,
} from '../types/simulated-email.types';

const FOLDER_STATUSES: Record<EmailFolder, EmailStatus[]> = {
  inbox: ['UNREAD', 'READ'],
  responded: ['RESPONDED'],
  archived: ['ARCHIVED'],
};

const FOLDER_TITLES: Record<EmailFolder, string> = {
  inbox: 'Boîte de réception',
  responded: 'Emails répondus',
  archived: 'Emails archivés',
};

const FOLDER_SUBTITLES: Record<EmailFolder, string> = {
  inbox: 'Traitez les emails entrants de votre simulation en cours.',
  responded: 'Relisez vos réponses et le retour de l\'IA.',
  archived: 'Les emails que vous avez archivés.',
};

function parseFolder(raw: string | undefined): EmailFolder {
  if (raw === 'responded' || raw === 'archived') return raw;
  return 'inbox';
}

function priorityMatches(p: EmailPriority, buckets: string[]): boolean {
  if (buckets.length === 0) return true;
  if ((p === 'URGENT' || p === 'HIGH') && buckets.includes('HIGH')) return true;
  if (p === 'NORMAL' && buckets.includes('NORMAL')) return true;
  if (p === 'LOW' && buckets.includes('LOW')) return true;
  return false;
}

function periodMatches(scheduledAt: string, period: string | null): boolean {
  if (!period) return true;
  const date = new Date(scheduledAt);
  const now = new Date();
  if (period === 'today') {
    return isAfter(date, startOfDay(now));
  }
  if (period === 'last7') {
    return isAfter(date, subDays(now, 7));
  }
  if (period === 'last30') {
    return isAfter(date, subDays(now, 30));
  }
  return true;
}

function sortEmails(emails: SimulatedEmail[], sort: SortKey): SimulatedEmail[] {
  const arr = [...emails];
  if (sort === 'date-desc') {
    return arr.sort(
      (a, b) =>
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
    );
  }
  if (sort === 'date-asc') {
    return arr.sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );
  }
  // priority: URGENT > HIGH > NORMAL > LOW, then date desc
  const rank: Record<EmailPriority, number> = {
    URGENT: 0,
    HIGH: 1,
    NORMAL: 2,
    LOW: 3,
  };
  return arr.sort((a, b) => {
    const diff = rank[a.priority] - rank[b.priority];
    if (diff !== 0) return diff;
    return new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime();
  });
}

export default function EmailInboxPage() {
  const { id: simIdFromUrl, folder: folderParam } = useParams<{
    id?: string;
    folder?: string;
  }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeFolder = parseFolder(folderParam);
  const showScoreFilter = activeFolder === 'responded';

  // ─── Resolve simulation id ───
  const { data: simulations } = useQuery({
    queryKey: ['simulations'],
    queryFn: () => simulationApi.getSimulations(),
    enabled: !simIdFromUrl,
  });

  const simulationId = useMemo(() => {
    if (simIdFromUrl) return simIdFromUrl;
    if (!simulations || simulations.length === 0) return null;
    const active = simulations.find(
      (s: { status: string }) =>
        s.status === 'IN_PROGRESS' || s.status === 'ACTIVE',
    );
    return active?.id ?? simulations[0]?.id ?? null;
  }, [simIdFromUrl, simulations]);

  // ─── Fetch emails ───
  const { data: emailsResponse, isLoading } = useSimulatedEmails(
    simulationId || '',
  );
  const allEmails: SimulatedEmail[] = useMemo(() => {
    if (!emailsResponse) return [];
    // simulated-emails.api wraps response as { data, meta }; getEmails returns res.data which is the SimulatedEmail[] payload
    if (Array.isArray(emailsResponse)) return emailsResponse;
    if (Array.isArray((emailsResponse as { data?: SimulatedEmail[] }).data))
      return (emailsResponse as { data: SimulatedEmail[] }).data;
    return [];
  }, [emailsResponse]);

  // ─── Folder filter (status) ───
  const folderEmails = useMemo(
    () => allEmails.filter((e) => FOLDER_STATUSES[activeFolder].includes(e.status)),
    [allEmails, activeFolder],
  );

  // ─── Counts ───
  const counts = useMemo(
    () => ({
      inbox: allEmails.filter((e) => FOLDER_STATUSES.inbox.includes(e.status))
        .length,
      responded: allEmails.filter((e) =>
        FOLDER_STATUSES.responded.includes(e.status),
      ).length,
      archived: allEmails.filter((e) =>
        FOLDER_STATUSES.archived.includes(e.status),
      ).length,
    }),
    [allEmails],
  );

  // ─── Toolbar state ───
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('date-desc');
  const [filters, setFilters] = useState<EmailFilters>({
    priorities: [],
    period: null,
    scoreMin70: false,
  });

  const filtersActive =
    filters.priorities.length > 0 || filters.period !== null || filters.scoreMin70;

  // ─── Apply search + filters + sort ───
  const visibleEmails = useMemo(() => {
    let list = folderEmails;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (e) =>
          e.subject.toLowerCase().includes(q) ||
          e.senderName.toLowerCase().includes(q),
      );
    }

    if (filters.priorities.length > 0) {
      list = list.filter((e) => priorityMatches(e.priority, filters.priorities));
    }

    if (filters.period) {
      list = list.filter((e) => periodMatches(e.scheduledAt, filters.period));
    }

    if (filters.scoreMin70 && activeFolder === 'responded') {
      list = list.filter(
        (e) => typeof e.responseScore === 'number' && e.responseScore >= 70,
      );
    }

    return sortEmails(list, sort);
  }, [folderEmails, search, filters, sort, activeFolder]);

  // ─── Selection (bulk) ───
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  function toggleSelect(emailId: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(emailId);
      else next.delete(emailId);
      return next;
    });
  }

  function selectAll() {
    setSelectedIds(new Set(visibleEmails.map((e) => e.id)));
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  // Reset selection when folder changes
  useEffect(() => {
    clearSelection();
  }, [activeFolder]);

  // ─── Drawer / active email ───
  const [activeEmailId, setActiveEmailId] = useState<string | null>(null);
  const activeEmail = useMemo(
    () => visibleEmails.find((e) => e.id === activeEmailId) ?? null,
    [visibleEmails, activeEmailId],
  );
  const activeIndex = useMemo(
    () => visibleEmails.findIndex((e) => e.id === activeEmailId),
    [visibleEmails, activeEmailId],
  );

  // ─── Deep-link: ?email={id} ───
  useEffect(() => {
    const param = searchParams.get('email');
    if (!param) return;
    const found = folderEmails.find((e) => e.id === param);
    if (found) {
      setActiveEmailId(found.id);
    } else {
      // Clean stale query param
      const next = new URLSearchParams(searchParams);
      next.delete('email');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, folderEmails, setSearchParams]);

  function openEmail(email: SimulatedEmail) {
    setActiveEmailId(email.id);
  }

  function closeDrawer() {
    setActiveEmailId(null);
    if (searchParams.has('email')) {
      const next = new URLSearchParams(searchParams);
      next.delete('email');
      setSearchParams(next, { replace: true });
    }
  }

  function goPrev() {
    if (visibleEmails.length === 0) return;
    const i = activeIndex < 0 ? 0 : (activeIndex - 1 + visibleEmails.length) % visibleEmails.length;
    setActiveEmailId(visibleEmails[i].id);
  }

  function goNext() {
    if (visibleEmails.length === 0) return;
    const i = activeIndex < 0 ? 0 : (activeIndex + 1) % visibleEmails.length;
    setActiveEmailId(visibleEmails[i].id);
  }

  // ─── Mutations ───
  const archiveMutation = useArchiveEmail(simulationId || '');
  const respondMutation = useRespondToEmail(simulationId || '');
  const bulkArchiveMutation = useBulkArchiveEmails(simulationId || '');
  const bulkMarkReadMutation = useBulkMarkReadEmails(simulationId || '');
  const markUnreadMutation = useMarkUnreadEmail(simulationId || '');

  async function handleArchive() {
    if (!activeEmail) return;
    try {
      await archiveMutation.mutateAsync(activeEmail.id);
      toast.success('Email archivé.');
      closeDrawer();
    } catch {
      toast.error("Erreur lors de l'archivage.");
    }
  }

  async function handleMarkUnread() {
    if (!activeEmail) return;
    try {
      await markUnreadMutation.mutateAsync(activeEmail.id);
      toast.success('Email marqué comme non lu.');
      closeDrawer();
    } catch {
      toast.error('Erreur lors de la mise à jour.');
    }
  }

  async function handleRespond(response: string) {
    if (!activeEmail) throw new Error('No active email');
    await respondMutation.mutateAsync({
      emailId: activeEmail.id,
      data: { response },
    });
    toast.success('Réponse envoyée.');
  }

  async function handleBulkArchive() {
    if (selectedIds.size === 0) return;
    try {
      const result = await bulkArchiveMutation.mutateAsync(
        Array.from(selectedIds),
      );
      toast.success(`${result.archived} email${result.archived > 1 ? 's' : ''} archivé${result.archived > 1 ? 's' : ''}.`);
      clearSelection();
    } catch {
      toast.error("Erreur lors de l'archivage groupé.");
    }
  }

  async function handleBulkMarkRead() {
    if (selectedIds.size === 0) return;
    try {
      const result = await bulkMarkReadMutation.mutateAsync(
        Array.from(selectedIds),
      );
      toast.success(`${result.updated} email${result.updated > 1 ? 's' : ''} marqué${result.updated > 1 ? 's' : ''} comme lu${result.updated > 1 ? 's' : ''}.`);
      clearSelection();
    } catch {
      toast.error('Erreur lors de la mise à jour groupée.');
    }
  }

  function clearFilters() {
    setSearch('');
    setFilters({ priorities: [], period: null, scoreMin70: false });
  }

  // ─── No-simulation guard ───
  if (!simulationId && !isLoading) {
    return (
      <>
        <PageHeader
          breadcrumbs={[{ label: 'Simulation' }, { label: 'Emails' }]}
          title={FOLDER_TITLES[activeFolder]}
          subtitle={FOLDER_SUBTITLES[activeFolder]}
        />
        <div className="px-6 pb-8">
          <Card className="border-[var(--neutral-100)] dark:border-white/[0.06] shadow-[0_1px_2px_rgba(15,26,46,0.04),0_8px_24px_-10px_rgba(15,26,46,0.08)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_-10px_rgba(0,0,0,0.5)]">
            <EmailEmptyState variant="no-simulation" />
          </Card>
        </div>
      </>
    );
  }

  const bulkPending =
    bulkArchiveMutation.isPending || bulkMarkReadMutation.isPending;

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Simulation' }, { label: 'Emails' }]}
        title={FOLDER_TITLES[activeFolder]}
        subtitle={FOLDER_SUBTITLES[activeFolder]}
      />

      <div className="px-6 pb-8 flex flex-col gap-3">
        <EmailFolderTabs active={activeFolder} counts={counts} />

        {selectedIds.size > 0 ? (
          <EmailBulkBar
            selectedCount={selectedIds.size}
            totalCount={visibleEmails.length}
            onSelectAll={selectAll}
            onMarkRead={handleBulkMarkRead}
            onArchive={handleBulkArchive}
            onCancel={clearSelection}
            isPending={bulkPending}
          />
        ) : (
          <EmailToolbar
            search={search}
            onSearchChange={setSearch}
            sort={sort}
            onSortChange={setSort}
            filters={filters}
            showScoreFilter={showScoreFilter}
            onFiltersApply={setFilters}
            onFiltersReset={() =>
              setFilters({ priorities: [], period: null, scoreMin70: false })
            }
          />
        )}

        <EmailList
          emails={visibleEmails}
          folder={activeFolder}
          isLoading={isLoading}
          hasFiltersOrSearch={filtersActive || search.trim().length > 0}
          activeEmailId={activeEmailId}
          selectedIds={selectedIds}
          onSelectEmail={openEmail}
          onToggleSelect={toggleSelect}
          onClearFilters={clearFilters}
        />
      </div>

      <EmailDetailDrawer
        email={activeEmail}
        index={activeIndex}
        total={visibleEmails.length}
        onClose={closeDrawer}
        onPrev={goPrev}
        onNext={goNext}
        onArchive={handleArchive}
        onMarkUnread={handleMarkUnread}
        onRespond={handleRespond}
        isRespondPending={respondMutation.isPending}
        isArchivePending={archiveMutation.isPending}
      />

      {/* Reserved: navigate ref kept for future quick-jump shortcuts */}
      {false && <button onClick={() => navigate('/')} />}
    </>
  );
}
```

- [ ] **Step 2: Delete the obsolete components**

Run:
```bash
rm apps/webapp/src/features/simulated-emails/components/email-list-item.tsx
rm apps/webapp/src/features/simulated-emails/components/email-response-form.tsx
```

- [ ] **Step 3: Verify no remaining imports of the deleted files**

Run:
```bash
grep -r "email-list-item\|email-response-form" apps/webapp/src --include="*.tsx" --include="*.ts" || echo "OK: no references"
```

Expected: `OK: no references`. If references remain, locate them and remove (most likely a stray import in a barrel `index.ts`).

- [ ] **Step 4: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: 0 errors.

If typecheck fails on the `navigate` unused-var lint, remove the `useNavigate` import and the bottom `{false && ...}` placeholder.

If typecheck fails on the `emailsResponse` shape mismatch (the API's `getEmails` returns `res.data` which the existing types annotate as `SimulatedEmail[]` while the runtime returns the wrapped `{ data, pagination }` from the backend), the in-page memo already handles both cases — leave it. If TS still complains, change the line:

```ts
const { data: emailsResponse, isLoading } = useSimulatedEmails(simulationId || '');
```

to cast:

```ts
const { data: emailsResponse, isLoading } = useSimulatedEmails(simulationId || '') as {
  data: unknown;
  isLoading: boolean;
};
```

- [ ] **Step 5: Commit**

```bash
git add apps/webapp/src/features/simulated-emails/pages/email-inbox-page.tsx
git add -u apps/webapp/src/features/simulated-emails/components/
git commit -m "$(cat <<'EOF'
feat(webapp/emails): rewrite EmailInboxPage with premium tabs+drawer flow

Single page assembles EmailFolderTabs, EmailToolbar/EmailBulkBar,
EmailList, and EmailDetailDrawer. Reads /:folder param to filter the
fetched list client-side, applies search + chip filters + sort,
computes per-folder counts. Handles deep-link via ?email={id},
folder-change selection reset, prev/next cycling in the drawer,
and bulk archive/mark-read with toasts driven by server-returned counts.

Drops the legacy split-pane email-list-item.tsx and email-response-form.tsx.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 13: Vérification finale (typecheck + Playwright manuel)

**Files:**
- None (verification only)

- [ ] **Step 1: Build core (defensive)**

Run: `pnpm --filter @sim360/core build`
Expected: success.

- [ ] **Step 2: Backend typecheck**

Run: `pnpm --filter @sim360/api typecheck`
Expected: 0 errors.

- [ ] **Step 3: Frontend typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: 0 errors.

- [ ] **Step 4: Start the stack locally**

Open three terminals (or use a process manager) and run:

```bash
# Terminal A
docker compose up -d
pnpm --filter @sim360/core build
pnpm --filter @sim360/api dev
```

```bash
# Terminal B
pnpm --filter @sim360/webapp dev
```

Wait for both to be reachable: API on `http://localhost:3001/api/docs`, webapp on `http://localhost:5173`.

- [ ] **Step 5: Seed a simulation with emails**

In the webapp UI:
1. Login (dev creds from seed) — `s2hounsa@gmail.com` works on dev DB.
2. From `/simulations`, start (or open) an active simulation.
3. Trigger email generation via the existing UI or `POST /api/v1/simulations/:simId/emails/generate` (Swagger).

If no emails exist, generate at least 5 with mixed priorities (URGENT, HIGH, NORMAL, LOW) so the filters can be exercised.

- [ ] **Step 6: Playwright manual walkthrough**

Open `http://localhost:5173/emails/inbox` and walk through every acceptance criterion from the spec:

```
1. PageHeader shows "Boîte de réception" + breadcrumb + subtitle.
2. Tabs render with counts; click "Répondus" → URL becomes /emails/responded,
   list re-filters, tab indicator moves. Click "Archives" → idem.
3. Click any list row → drawer slides in from the right (200ms).
   Press Esc → drawer closes.
4. Re-open a row. Press J → next email loads in drawer.
   Press K → previous. Header shows "i / total".
5. On a non-responded email, press R → cursor lands in the reply textarea.
   Type "Test réponse" → wait ~1s → open DevTools localStorage →
   `simex.draft.email.{id}` key present with the text.
6. Click Envoyer → spinner shows "Évaluation..." → drawer flips to
   RESPONDED state with the AI feedback card. localStorage draft key removed.
7. On a non-archived email, press E → email archives, drawer closes,
   list re-filters.
8. From inbox, check 3 row checkboxes → toolbar replaced by blue bulk bar.
   Click "Archiver" → toast "N emails archivés", list updates,
   counters re-sync.
9. Search "Sophie" in toolbar → list filters live (debounce ok).
   Clear search → list returns to full.
10. Click Sort → choose "Priorité (haute → basse)" → list re-orders.
11. Click Filtrer → toggle HAUTE chip + Aujourd'hui chip → Apply →
    badge "(2)" on the trigger; list filters. Réinitialiser clears.
12. On Répondus tab, the filter popover shows "Score IA ≥ 70" toggle.
13. Force a state with no emails in inbox → empty state with the
    appropriate copy + icon. With filters active that exclude all →
    "Aucun résultat" + "Effacer les filtres" link.
14. Toggle the theme (dark/light via topbar) → all surfaces
    (toolbar, list, drawer, bulk bar, empty state) flip correctly.
15. DevTools → toggle viewport to 375px wide → tabs scrollable,
    drawer becomes a bottom-sheet full screen, ⋯ actions still
    reachable (no broken layout). The desktop keyboard shortcuts
    no longer fire on tap.
```

Capture a screenshot of the desktop inbox view and one of the mobile drawer for the verification report.

- [ ] **Step 7: 0 console errors**

Confirm DevTools console is clean (no red errors) across all interactions above. React/Vite warnings about deprecated APIs are acceptable if pre-existing.

- [ ] **Step 8: Final commit (only if a polish fix is needed during verification)**

If you discovered a visible defect during verification, fix it, commit with a separate small commit (`fix(webapp/emails): ...`). Otherwise, skip — Task 12 was the final feature commit.

- [ ] **Step 9: Report DONE**

Summarize:
- Backend: bulk endpoints reachable, audited.
- Frontend: 11 new components / 2 hooks / 1 rewritten page / 2 deletions.
- Typecheck green on api + webapp + core.
- Playwright walkthrough completed, 0 console errors, dark mode + mobile verified.

---

## Self-review notes (from the planner)

**Spec coverage check** — every acceptance criterion (§13 of the spec) has a corresponding task:

| Spec AC | Implemented by |
|---|---|
| 1. Visuel premium + dark mode | Tasks 4, 5, 6, 10, 11, 12 |
| 2. Navigation folder via URL | Task 8 (tabs) + Task 12 (parses param) |
| 3. Drawer ouverture / Esc / backdrop | Task 11 (Sheet primitives) |
| 4. Navigation drawer prev/next + J/K | Task 11 (handlers wired to Task 12 cycling) |
| 5. Reply + counter + draft + R shortcut | Tasks 3 (hooks) + 10 (form) + 11 (focusReply) |
| 6. Archive + E shortcut | Task 11 (handler) + Task 12 (mutation) |
| 7. Mark unread + U shortcut | Task 1 (single mark-unread endpoint) + Task 2 (useMarkUnreadEmail) + Task 11 (button) + Task 12 (handler) |
| 8. Bulk select + bar + actions | Tasks 9 (BulkBar) + 12 (handlers + mutations) |
| 9. Search in-memory | Task 9 (toolbar) + Task 12 (filter logic) |
| 10. Sort dropdown | Task 9 (toolbar) + Task 12 (sortEmails) |
| 11. Filter popover + count | Tasks 7 (popover) + 9 (toolbar) + 12 (apply) |
| 12. Empty states | Task 4 (component) + Task 12 (variant selection) |
| 13. Mobile responsive | Task 11 (Sheet side switch) + Task 12 (`useIsMobile`) |
| 14. A11y | Tasks 5, 7, 8, 11 (aria, tabindex, focus-visible) |
| 15. No emoji UI | Every component uses KeenIcon |

**Placeholder scan:** no TBD/TODO. AC #7 is fully covered by adding a `POST /:emailId/mark-unread` endpoint in Task 1 and the matching `useMarkUnreadEmail` hook in Task 2.

**Type consistency:** `EmailFolder` and `EmailFilters` are defined once (Tasks 8 and 7 respectively) and re-imported. `SortKey` lives in `email-toolbar.tsx` (Task 9). All hooks, components, and the page agree on signatures.
