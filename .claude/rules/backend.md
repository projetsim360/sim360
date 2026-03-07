---
paths:
  - "apps/api/**/*.ts"
  - "libs/core/**/*.ts"
---

# Regles Backend (NestJS + Core)

- Toujours utiliser `PrismaService` de `@sim360/core`, jamais Prisma Client directement
- Toujours filtrer par `tenantId` dans les queries — zero exception
- Decorateurs obligatoires sur les controllers : `@ApiTags`, `@ApiBearerAuth`, `@ApiOperation`
- `@Auditable()` sur toutes les mutations (POST, PUT, DELETE)
- DTOs : un fichier par DTO, `class-validator` + `class-transformer`, barrel export via `dto/index.ts`
- Emettre des evenements domaine via `EventStoreService` pour les changements d'etat importants
- Ne jamais appeler les APIs IA directement — passer par `AiService`
- Dans `libs/core/` : imports relatifs uniquement (pas de `@/` ni `@sim360/`)
