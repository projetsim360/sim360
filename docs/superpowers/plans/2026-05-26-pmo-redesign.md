# PMO Agent Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the PMO agent panel UX & visual hierarchy — a guided chat onboarding (welcome card + quick-replies), KPI tiles in the Contexte tab, and the simulation selector moved into the header — per the validated spec `docs/superpowers/specs/2026-05-26-pmo-redesign-design.md`.

**Architecture:** Pure frontend, three React components in `apps/webapp`. No backend, data-flow, or streaming changes. The shell wrapper `pmo-panel.tsx` owns the header/tabs/selector layout; the shared `pmo-chat.tsx` owns the conversation + onboarding; `pmo-context-panel.tsx` owns the Contexte tab. All three already exist and are wired.

**Tech Stack:** React 19, Tailwind CSS v4 (CSS-var tokens `--brand-*`, `--accent-*`), Radix `Select`, `KeenIcon`, design-system components only.

**Verification approach (read first):** The webapp has **no frontend test runner** (no Vitest/RTL, no `test` script, no test files). This codebase verifies frontend by running the app. Each task is therefore verified by (a) `pnpm --filter @sim360/webapp typecheck` and (b) a **Playwright smoke** against the live app at `http://localhost:5173`, logging in as `admin@sim360.dev` (11 simulations → selector visible) or `recruiter@sim360.dev` (0 sims → empty-state), injecting tokens into `localStorage`, and capturing a screenshot to eyeball. Standing up Vitest is explicitly out of scope. Prereqs: `docker compose up -d`, core built, API on :3001 and webapp on :5173 running.

---

## File Structure

- **Modify** `apps/webapp/src/components/layouts/simex-shell/components/pmo-panel.tsx` — move the `<Select>` into the header as a compact pill, delete the dedicated `sel-wrap` row, switch active-tab token `info-50`→`brand-50`, make the header subtitle show the real phase.
- **Modify** `apps/webapp/src/features/pmo/components/pmo-chat.tsx` — welcome card + "Pour démarrer" quick-reply chips while the user hasn't replied yet; `handleSend` accepts an explicit message; placeholder accent fix.
- **Modify** `apps/webapp/src/features/pmo/components/pmo-context-panel.tsx` — KPIs as a 2-col tile grid with progress bars, fix the Phase card icon, French accents in `KPI_CONFIG`.
- **Create (throwaway, gitignored)** `/tmp/pmo-verify/smoke.mjs` — reusable Playwright smoke used by every task's verification step.

---

## Task 0: Reusable verification smoke script

**Files:**
- Create: `/tmp/pmo-verify/smoke.mjs` (throwaway, not committed)

- [ ] **Step 1: Write the smoke script**

```js
// Usage: node /tmp/pmo-verify/smoke.mjs <admin|recruiter> <tab: chat|context> <out.png>
import { chromium } from '/Users/shounsa/Documents/Workspaces/simex-pro/node_modules/playwright/index.mjs';
const [, , who = 'admin', tab = 'chat', out = '/tmp/pmo-verify/out.png'] = process.argv;
const BASE = 'http://localhost:5173';
const API = 'http://localhost:3001/api/v1';
const creds = who === 'recruiter'
  ? { email: 'recruiter@sim360.dev', password: 'Recruiter123!' }
  : { email: 'admin@sim360.dev', password: 'Admin123!' };
const r = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(creds) });
const { tokens } = await r.json();
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto(BASE, { waitUntil: 'domcontentloaded' });
await p.evaluate((t) => { localStorage.setItem('sim360_access_token', t.accessToken); localStorage.setItem('sim360_refresh_token', t.refreshToken); }, tokens);
await p.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
await p.waitForTimeout(1500);
const skip = p.locator('button:has-text("Passer")').first();
if (await skip.isVisible().catch(() => false)) { await skip.click(); await p.waitForTimeout(500); }
await p.locator('button:has-text("Agent PMO")').first().click();
await p.waitForTimeout(2500);
if (tab === 'context') { await p.locator('button:has-text("Contexte")').first().click(); await p.waitForTimeout(2500); }
const panel = p.locator('aside').filter({ hasText: 'Agent PMO' }).first();
await panel.screenshot({ path: out }).catch(async () => { await p.screenshot({ path: out }); });
console.log('shot:', out);
await b.close();
```

- [ ] **Step 2: Sanity-run it once (baseline)**

Run: `mkdir -p /tmp/pmo-verify && node /tmp/pmo-verify/smoke.mjs admin chat /tmp/pmo-verify/baseline.png`
Expected: prints `shot: /tmp/pmo-verify/baseline.png`, file exists. (No commit — throwaway tooling.)

---

## Task 1: `pmo-panel.tsx` — selector in header, tab token, phase subtitle

**Files:**
- Modify: `apps/webapp/src/components/layouts/simex-shell/components/pmo-panel.tsx`

- [ ] **Step 1: Replace the header block to add the compact selector pill and a phase-aware subtitle**

Replace the entire `{/* Header */}` `<header>…</header>` block with:

```tsx
      {/* Header */}
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-[18px] py-4">
        <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-[var(--accent-50)] text-[var(--accent-500)]">
          <Sparkles className="size-[18px]" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="font-display text-[15px] font-bold text-foreground">Agent PMO</span>
          <span className="inline-flex items-center gap-1.5 truncate text-xs text-muted-foreground">
            <span
              className={cn(
                'size-[7px] shrink-0 rounded-full',
                simulationId ? 'bg-[var(--success-500)]' : 'bg-[var(--neutral-300)]',
              )}
              style={simulationId ? { boxShadow: '0 0 0 3px rgba(16,185,129,.18)' } : undefined}
            />
            <span className="truncate">{headerSubtitle}</span>
          </span>
        </div>
        {activeSimulations.length > 1 && (
          <Select value={simulationId ?? undefined} onValueChange={(val) => setOverrideSimId(val)}>
            <SelectTrigger
              className="h-8 max-w-[150px] shrink-0 gap-1.5 rounded-full border-border bg-[var(--brand-50)] px-3 text-xs font-semibold text-[var(--brand-700)]"
              title={activeSimulations.find((s: any) => s.id === simulationId)?.project?.name ?? undefined}
            >
              <SelectValue placeholder="Simulation" />
            </SelectTrigger>
            <SelectContent>
              {activeSimulations.map((s: any) => (
                <SelectItem key={s.id} value={s.id}>
                  {simulationLabel(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <button
          type="button"
          aria-label="Fermer"
          onClick={() => setPmoOpen(false)}
          className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </header>
```

- [ ] **Step 2: Delete the now-duplicate dedicated selector row**

Delete the entire `{/* Simulation selector — only when more than one is in progress */}` block (the `{activeSimulations.length > 1 && ( <div className="shrink-0 border-b border-border px-[18px] py-2.5"> … </div> )}` that sits between the tabs and the body).

- [ ] **Step 3: Switch the active-tab token from `info-50` to `brand-50`**

In both tab buttons, replace the active class:
`'bg-[var(--info-50)] text-[var(--brand-700)]'` → `'bg-[var(--brand-50)] text-[var(--brand-700)]'`
(There are two occurrences — Chat and Contexte. Replace both.)

- [ ] **Step 4: Add the `headerSubtitle` derivation**

Immediately after the `pendingDeliverables` `useMemo`, add:

```tsx
  const headerSubtitle = !simulationId
    ? 'Aucune simulation active'
    : context?.currentPhase
      ? `Phase ${context.simulation.currentPhaseOrder} · ${context.currentPhase.name}`
      : 'En ligne';
```

- [ ] **Step 5: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: no errors (exits clean).

- [ ] **Step 6: Browser-verify (admin — pill in header, no dedicated row)**

Run: `node /tmp/pmo-verify/smoke.mjs admin chat /tmp/pmo-verify/t1.png`
Open `/tmp/pmo-verify/t1.png`. Expected: the simulation selector appears as a compact pill in the header (right of the title, before ✕); there is **no** full-width selector row under the tabs; the active tab is brand-blue; the subtitle reads `Phase N · <name>` (or `En ligne`).

- [ ] **Step 7: Commit**

```bash
git add apps/webapp/src/components/layouts/simex-shell/components/pmo-panel.tsx
git commit -m "feat(webapp): move PMO simulation selector into the panel header"
```

---

## Task 2: `pmo-chat.tsx` — welcome card + quick-replies onboarding

**Files:**
- Modify: `apps/webapp/src/features/pmo/components/pmo-chat.tsx`

- [ ] **Step 1: Add the quick-replies constant (top of file, after imports)**

```tsx
const QUICK_REPLIES: Array<{ icon: string; tone: string; text: string }> = [
  { icon: 'chart-line', tone: 'text-brand-600 bg-brand-50', text: 'Quel est l\'état de mon projet ?' },
  { icon: 'notepad', tone: 'text-[var(--accent-600)] bg-[var(--accent-50)]', text: 'Aide-moi sur un livrable' },
  { icon: 'check-circle', tone: 'text-success bg-[#ECFDF5]', text: 'Quelle décision dois-je prendre ?' },
  { icon: 'shield-cross', tone: 'text-destructive bg-[#FEF2F2]', text: 'Quels sont mes risques ?' },
];
```

- [ ] **Step 2: Make `handleSend` accept an explicit message**

Change the signature and the trimmed source:

```tsx
  const handleSend = useCallback(
    async (explicit?: string) => {
      const trimmed = (explicit ?? input).trim();
      if (!trimmed || isStreaming) return;
```

Leave the rest of the body unchanged (it already uses `trimmed`). Keep the dependency array as-is plus `input` (already present).

- [ ] **Step 3: Add a "no user message yet" flag (inside the component, after the `messages` state hooks)**

```tsx
  const hasUserMessage = messages.some((m) => m.role === 'user');
```

- [ ] **Step 4: Render the quick-replies block at the end of the messages list**

Inside the `<div className="space-y-4">`, immediately **after** the `{messages.map(...)}` block and **before** the closing of the non-empty branch (i.e., right after the messages map, still inside the `<>…</>`), add:

```tsx
              {!hasUserMessage && !isStreaming && (
                <div className="space-y-2 pt-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Pour démarrer
                  </p>
                  {QUICK_REPLIES.map((q) => (
                    <button
                      key={q.text}
                      type="button"
                      onClick={() => handleSend(q.text)}
                      className="flex w-full items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:border-[var(--accent-300)] hover:bg-[var(--accent-50)]"
                    >
                      <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-lg', q.tone)}>
                        <KeenIcon icon={q.icon} style="duotone" className="size-3.5" />
                      </span>
                      <span className="flex-1">{q.text}</span>
                      <KeenIcon icon="arrow-right" style="duotone" className="size-3.5 text-muted-foreground/50" />
                    </button>
                  ))}
                </div>
              )}
```

Add `cn` to the imports if not already present: `import { cn } from '@/lib/utils';`.

- [ ] **Step 5: Fix the input placeholder accent**

Replace `placeholder="Posez une question a votre agent PMO..."` with `placeholder="Posez votre question à l'agent PMO…"`.

- [ ] **Step 6: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: no errors.

- [ ] **Step 7: Browser-verify (admin — welcome card + quick-replies at start)**

Run: `node /tmp/pmo-verify/smoke.mjs admin chat /tmp/pmo-verify/t2.png`
Open `/tmp/pmo-verify/t2.png`. Expected: at conversation start the welcome card (scenarioInfo objectives badges) shows AND a "Pour démarrer" list of 4 quick-reply chips appears; the input placeholder has the accent. (If the seeded admin conversation already has a user message, the chips correctly do not show — confirm by checking a simulation without prior user turn, or trust the `hasUserMessage` logic and verify the chips render in a fresh conversation.)

- [ ] **Step 8: Verify a quick-reply sends (interaction probe)**

Manually (or extend the smoke): click a chip → it must send the message (a user bubble with that text appears and the PMO streams a reply), and the chips disappear once `hasUserMessage` is true.

- [ ] **Step 9: Commit**

```bash
git add apps/webapp/src/features/pmo/components/pmo-chat.tsx
git commit -m "feat(webapp): add guided welcome card and quick-replies to PMO chat onboarding"
```

---

## Task 3: `pmo-context-panel.tsx` — KPI tiles, phase icon, FR accents

**Files:**
- Modify: `apps/webapp/src/features/pmo/components/pmo-context-panel.tsx`

- [ ] **Step 1: Fix French accents in `KPI_CONFIG`**

```tsx
const KPI_CONFIG: Record<string, { label: string; icon: string; good: 'high' | 'low' }> = {
  budget: { label: 'Budget', icon: 'dollar', good: 'high' },
  schedule: { label: 'Délais', icon: 'time', good: 'high' },
  quality: { label: 'Qualité', icon: 'verify', good: 'high' },
  teamMorale: { label: 'Moral', icon: 'people', good: 'high' },
  riskLevel: { label: 'Risque', icon: 'shield-cross', good: 'low' },
};
```

- [ ] **Step 2: Add a bar-color helper next to `kpiColor`**

```tsx
function kpiBarVar(key: string, value: number): string {
  const config = KPI_CONFIG[key];
  if (!config) return 'var(--neutral-300)';
  if (config.good === 'high') {
    if (value >= 70) return 'var(--success-500)';
    if (value >= 40) return 'var(--warning-500)';
    return 'var(--destructive)';
  }
  if (value <= 30) return 'var(--success-500)';
  if (value <= 60) return 'var(--warning-500)';
  return 'var(--destructive)';
}
```

- [ ] **Step 3: Replace the KPIs `<Card>` block with a tile grid**

Replace the whole `{/* KPIs */} {context.kpis && ( <Card …> … </Card> )}` block with:

```tsx
          {/* KPIs */}
          {context.kpis && (
            <div>
              <p className="px-1 pb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Indicateurs clés
              </p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(context.kpis).map(([key, value]) => {
                  const config = KPI_CONFIG[key];
                  if (!config) return null;
                  return (
                    <div
                      key={key}
                      className={cn(
                        'flex flex-col gap-2 rounded-xl border border-border bg-card p-3',
                        key === 'riskLevel' && 'col-span-2',
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">{config.label}</span>
                        <span className={cn('text-xl font-extrabold leading-none', kpiColor(key, value))}>
                          {value}%
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${value}%`, background: kpiBarVar(key, value) }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
```

- [ ] **Step 4: Fix the Phase card icon**

In the `{/* Simulation info */}` Card, the icon box uses `bg-brand-500` + `KeenIcon icon="chart-line"`. Ensure it renders by switching to explicit token bg and a verified icon:

```tsx
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-700)] text-white">
                  <KeenIcon icon="chart-line" style="duotone" className="size-4" />
                </div>
```

(If `chart-line` still renders blank, fall back to `icon="abstract-26"` which is confirmed working in `pmo-message-bubble.tsx`.)

- [ ] **Step 5: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: no errors.

- [ ] **Step 6: Browser-verify (admin — Contexte tab tiles)**

Run: `node /tmp/pmo-verify/smoke.mjs admin context /tmp/pmo-verify/t3.png`
Open `/tmp/pmo-verify/t3.png`. Expected: KPIs render as a 2-column grid of tiles, each with a big colored value and a progress bar; the risk tile spans full width; the Phase card shows a filled brand icon box (no blank); labels read "Délais"/"Qualité".

- [ ] **Step 7: Commit**

```bash
git add apps/webapp/src/features/pmo/components/pmo-context-panel.tsx
git commit -m "feat(webapp): render PMO context KPIs as tiles and fix labels/phase icon"
```

---

## Task 4: End-to-end verification

**Files:** none (verification only)

- [ ] **Step 1: Typecheck the whole webapp**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: clean.

- [ ] **Step 2: Smoke all three surfaces**

Run:
```bash
node /tmp/pmo-verify/smoke.mjs admin chat /tmp/pmo-verify/final-chat.png
node /tmp/pmo-verify/smoke.mjs admin context /tmp/pmo-verify/final-context.png
node /tmp/pmo-verify/smoke.mjs recruiter chat /tmp/pmo-verify/final-empty.png
```
Open the three PNGs. Expected:
- `final-chat.png` — header pill selector, brand-blue active tab, welcome card + quick-replies.
- `final-context.png` — KPI tiles grid, filled phase icon, accented labels.
- `final-empty.png` — recruiter (0 sims) → empty-state "Aucune simulation active", no selector pill.

- [ ] **Step 3: Confirm against the spec**

Re-read `docs/superpowers/specs/2026-05-26-pmo-redesign-design.md` and confirm each "Détail par composant" item is visible in the screenshots. Note any gap as a follow-up.

---

## Self-review notes (author)

- **Spec coverage:** Chat onboarding (Task 2), Contexte tiles + hierarchy + icon + FR labels (Task 3), selector in header + tab token + phase subtitle (Task 1), empty-state preserved (Task 4 verify). Hierarchy of Contexte sections (Phase → KPIs → Livrables → …) is unchanged in order; only KPI weight increases — matches spec.
- **Type consistency:** `handleSend(explicit?: string)` is called as `handleSend(q.text)` (Task 2) and `handleSend()` (existing Enter/click). `kpiBarVar` mirrors `kpiColor` thresholds. `simulationLabel`, `activeSimulations`, `overrideSimId`, `context` already exist in `pmo-panel.tsx` from prior work.
- **No new deps, no backend changes.** Verification is browser-based by necessity (no FE test runner).
