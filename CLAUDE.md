# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ProjectSim360 is a SaaS platform for project management simulation. Learners are immersed in realistic scenarios where they make decisions, run virtual meetings with AI participants, and manage a project end-to-end. An AI engine evaluates their actions and provides pedagogical feedback. The platform also supports a recruitment mode where companies evaluate candidates through simulations.

## Monorepo Structure

```
apps/api/          → @sim360/api     — NestJS 10 backend (port 3001)
apps/webapp/       → @sim360/webapp  — React 19 + Vite frontend (port 5173)
libs/core/         → @sim360/core    — Reusable SaaS foundation (auth, users, tenants, events, etc.)
packages/config/   → @sim360/config  — Shared tsconfig presets
packages/shared-types/ → @sim360/shared-types — Shared TypeScript types
prisma/            → Single Prisma schema at root (core + domain models)
```

Package manager: **pnpm 10** with workspaces (`apps/*`, `packages/*`, `libs/*`).

## Essential Commands

### Infrastructure
```bash
docker compose up -d          # Start PostgreSQL (5440), Redis (6379), MailHog (1025/8025), pgAdmin (5050)
docker compose down -v        # Reset all containers and volumes
```

### Database
```bash
pnpm db:generate              # Generate Prisma client
pnpm db:migrate               # Run migrations (dev)
pnpm db:push                  # Push schema without migration
pnpm db:studio                # Open Prisma Studio
pnpm db:seed                  # Seed database (uses tsx prisma/seed.ts)
```

### Development (build order matters)
```bash
pnpm --filter @sim360/core build    # MUST build core first (compiles to libs/core/dist/)
pnpm --filter @sim360/api dev       # Start API in watch mode (nest start --watch)
pnpm --filter @sim360/webapp dev    # Start webapp (vite, port 5173)
```

`turbo dev` runs all packages but **core must be built before API can start** because the API imports `@sim360/core` which resolves to compiled JS in `libs/core/dist/`.

### Build / Lint / Typecheck
```bash
pnpm build                    # Build all (turbo, respects dependency graph)
pnpm lint                     # Lint all packages
pnpm typecheck                # Type-check all packages
pnpm format                   # Prettier format everything
```

### Per-package commands
```bash
pnpm --filter @sim360/api lint
pnpm --filter @sim360/webapp build
pnpm --filter @sim360/core typecheck
```

## Architecture

### libs/core — SaaS Foundation (`@sim360/core`)

Provides all cross-cutting concerns. Imported as a single `CoreModule` in the API's `AppModule`. Compiles to CommonJS (`libs/core/dist/`).

Key modules: PrismaModule, AuthModule (JWT + Google OAuth + 2FA/Speakeasy), UsersModule, TenantsModule, EventStoreModule (3 consumers: socket-io, notifier, audit), NotificationsModule (Socket.io gateway on `/notifications`), AuditModule, RedisCacheModule (BullMQ + cache-manager), MailModule (Nodemailer), StorageModule, HealthModule.

**Important**: Inside `libs/core/src/`, use **relative imports only** (no `@/` aliases). The API uses `@sim360/core` via pnpm workspace resolution to the compiled dist.

Exports custom decorators: `@Cacheable`, `@CacheEvict`, `@Auditable`, `@CurrentUser`, `@CurrentTenant`, `@Public`, `@Roles`.

Uses `GlobalExceptionFilter` (not `HttpExceptionFilter`) in `common/filters`.

### apps/api — NestJS Backend

- `app.module.ts` imports `CoreModule` + domain modules (AiModule, SimulationsModule, MeetingsModule, DashboardModule)
- Global prefix: `api/v1` (excluded: `/health`)
- Swagger docs at `/api/docs`
- Global `ValidationPipe` with `whitelist`, `forbidNonWhitelisted`, `transform`
- Rate limiting via `ThrottlerModule` (3 tiers: short/medium/long)
- API path aliases: `@/*` → `./src/*`

Domain modules:
- **SimulationsModule**: Scenarios CRUD, simulation lifecycle (5 phases: Initiation → Closure), decisions, random events, KPI engine
- **MeetingsModule**: Virtual meetings with AI participants (text + audio modes), real-time streaming responses
- **AiModule**: Orchestrator + specialized services (MeetingAiService, DecisionAiService, EventAiService, FeedbackAiService, TokenTrackerService). Dual provider support (Anthropic/OpenAI) with automatic failover.
- **DashboardModule**: Token usage analytics

### apps/webapp — React Frontend

- React 19, Vite 7, Tailwind CSS v4, React Router v7
- Feature-based structure: `src/features/{dashboard,meeting,simulation,report}/` each with `api/`, `config/`, `pages/`, `types/`, `components/`
- API client: `src/lib/api-client.ts` — thin fetch wrapper with auto token refresh on 401
- State: TanStack React Query for server state (staleTime: 5min), no global state library
- Routing: `src/routing/app-routing-setup.tsx` with auth provider, layout switcher, socket/notification providers
- Menu config: `src/config/menu.config.ts` is the single source of truth for all navigation menus

#### Design System (MUST follow)

- **79 custom UI components** in `src/components/ui/` built on **Radix UI** + **CVA** (Class Variance Authority)
- **Icons**: `KeenIcon` (primary, font-based: solid/duotone/filled/outline) + Lucide (menus)
- **39 layout variants** in `src/components/layouts/`, default: `layout-6`
- **Page pattern**: `Toolbar > ToolbarHeading + ToolbarActions` (from layout-6) + `container-fixed` wrapper + `Card` sections
- **Forms**: react-hook-form + zod + Form components from `src/components/ui/form.tsx`
- **Data tables**: `DataGrid` (TanStack React Table) for complex data, `Table` for simple lists
- **Charts**: Recharts (primary) + ApexCharts (advanced), wrapped via `src/components/ui/chart.tsx`
- **Toasts**: Sonner (`toast()`)
- **Animations**: Framer Motion
- **Theme**: CSS variables + dark mode via next-themes
- **DO NOT install** shadcn/ui, Material UI, Ant Design, or any external UI framework

### Data Model (prisma/schema.prisma)

Single schema at project root. Key domain entities:
- **Scenario** → template with ScenarioPhases, MeetingTemplates, DecisionTemplates, RandomEventTemplates
- **Project** → instance with TeamMembers, Deliverables
- **Simulation** → 1:1 with Project, links to Scenario. Has Phases, Decisions, RandomEvents, Meetings, KPIs, KpiSnapshots
- **Meeting** → Participants, Messages, Summary
- Multi-tenant: most entities have `tenantId`. Users belong to a Tenant with a plan (FREE/STARTER/PRO/ENTERPRISE).
- AI tracking: AiTokenUsage + AiTokenQuota per tenant

## Environment

Copy `.env.example` to `.env`. Key variables:
- `DATABASE_URL`: PostgreSQL (default port 5440 via docker-compose)
- `REDIS_HOST/PORT`: Redis for cache + queues
- `ANTHROPIC_API_KEY` / `OPENAI_API_KEY`: AI providers
- `JWT_SECRET` / `JWT_REFRESH_SECRET`: Auth tokens
- `SMTP_HOST`: MailHog in dev (port 1025, UI on 8025)

## Conventions

- Commit messages in English, prefixed: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`
- Backend code in English, UI text in French
- NestJS modules follow controller → service → DTO pattern with barrel exports via `index.ts`
- Frontend features follow `api/ → config/ → pages/ → types/ → components/` structure
- Prisma models use `@@map("snake_case_table_name")` for table names, PascalCase for model names

## Development Rules

### Backend (NestJS)
- Every new domain module goes in `apps/api/src/modules/{module-name}/`
- Structure: `{module}.module.ts`, `{module}.controller.ts`, `{module}.service.ts`, `dto/`, `guards/` (if needed)
- Always use `@sim360/core` decorators for auth (`@CurrentUser`, `@CurrentTenant`, `@Roles`, `@Public`)
- Always apply `@Auditable()` on mutations (POST, PUT, DELETE)
- DTOs: use `class-validator` + `class-transformer`, one file per DTO, barrel export via `dto/index.ts`
- Services must inject `PrismaService` from `@sim360/core`, never instantiate Prisma directly
- All tenant-scoped queries must filter by `tenantId` — never return cross-tenant data
- AI calls go through `AiService` (dual provider with failover), never call Anthropic/OpenAI directly
- Use `EventStoreService` to emit domain events (e.g., `simulation.started`, `meeting.completed`)

### Frontend (React)
- New features go in `src/features/{feature-name}/` with sub-folders: `api/`, `config/`, `pages/`, `types/`, `components/`, `hooks/`
- API calls: use `apiClient` from `src/lib/api-client.ts` with TanStack Query (`useQuery`, `useMutation`)
- Routes: define in `{feature}/config/{feature}.routes.tsx`, register in `src/routing/app-routing.tsx`
- Menu items: add to `src/config/menu.config.ts` AND feature-specific menu config
- No inline styles — use Tailwind CSS v4 classes exclusively
- Forms: use `react-hook-form` with zod validation schemas
- Toasts/notifications: use the existing notification system, not custom alerts

### Prisma / Database
- Schema lives at `prisma/schema.prisma` — single file for all models
- After schema changes: `pnpm db:generate` then `pnpm db:migrate` (creates migration file)
- Always rebuild core after Prisma changes: `pnpm --filter @sim360/core build`
- Relations: use explicit `@relation` with `onDelete` cascade rules
- Indexes: add `@@index` for frequently queried fields (especially `tenantId`, `simulationId`)

### Testing
- Backend: Jest (NestJS default). Run: `pnpm --filter @sim360/api test`
- Frontend: Vitest. Run: `pnpm --filter @sim360/webapp test`
- Single test: `pnpm --filter @sim360/api test -- --testPathPattern=module-name`

## User Stories Reference

All user stories are in `docs/US/` organized by epic (10 epics, 87 US total). See `docs/US/README.md` for the index and dependency graph. Implementation order:
1. EPIC 1 (Admin Referentiel) → 2. EPIC 2 (Profiling) → 3. EPIC 3 (PMO Agent) → 4. EPIC 4 (Deliverables) → 5. EPIC 5 (Narrative) → 6. EPIC 6 (Adaptation) → 7. EPIC 7 (Valorization) → 8-10. EPICs 8-10 (Recruitment)

## Sub-Agents

Custom agents are available in `.claude/agents/` for specialized tasks:
- `backend.md` — NestJS module development (controllers, services, DTOs, guards)
- `frontend.md` — React feature development (pages, components, hooks, API calls)
- `prisma.md` — Database schema design and migrations
- `reviewer.md` — Code review and quality checks
