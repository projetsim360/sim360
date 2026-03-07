---
paths:
  - "prisma/**"
---

# Regles Prisma

- Schema unique : `prisma/schema.prisma` — jamais de fichier separe
- `id` toujours UUID : `@id @default(uuid())`
- Timestamps : `createdAt DateTime @default(now()) @map("created_at")` et `updatedAt DateTime @updatedAt @map("updated_at")`
- Champs camelCase avec `@map("snake_case")`, tables avec `@@map("snake_case_plural")`
- Tenant isolation : `tenantId String @map("tenant_id")` + relation + `@@index([tenantId])`
- Relations : toujours `onDelete` explicite (Cascade pour enfants, Restrict pour references, SetNull pour optionnels)
- Texte long (contenu IA) : `@db.Text`
- Donnees structurees flexibles : type `Json`
- Apres modification : `pnpm db:generate` → `pnpm db:migrate` → `pnpm --filter @sim360/core build`
