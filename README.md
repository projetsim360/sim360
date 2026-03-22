# ProjectSim360

SaaS platform for project management simulation. Learners are immersed in realistic scenarios where they make decisions, run virtual meetings with AI participants, and manage a project end-to-end.

## Quick Start

```bash
# Prerequisites: Node.js >= 20, pnpm >= 10, Docker

# 1. Start infrastructure
docker compose up -d

# 2. Setup database
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# 3. Build core library (required before API)
pnpm --filter @sim360/core build

# 4. Start development
pnpm --filter @sim360/api dev      # API on http://localhost:3001
pnpm --filter @sim360/webapp dev   # Webapp on http://localhost:5173
```

## Default Accounts

| Role      | Email                    | Password       |
|-----------|--------------------------|----------------|
| Admin     | admin@sim360.dev         | Admin123!      |
| User      | user@sim360.dev          | User123!       |
| Recruiter | recruiter@sim360.dev     | Recruiter123!  |

## Production

- **API**: https://sim360-api-production.up.railway.app
- **Webapp**: https://sim360-production.up.railway.app
- **Swagger**: https://sim360-api-production.up.railway.app/api/docs
