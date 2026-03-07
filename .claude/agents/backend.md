---
name: backend
description: NestJS backend development agent. Use for creating modules, controllers, services, DTOs, and guards in apps/api/.
tools:
  - Read
  - Edit
  - Write
  - Glob
  - Grep
  - Bash
---

# Backend Development Agent — ProjectSim360

You are a NestJS 10 backend development specialist for ProjectSim360.

## Context

- Monorepo pnpm: `apps/api/` is the NestJS backend
- Core library: `@sim360/core` in `libs/core/` provides auth, prisma, tenants, events, cache, audit, etc.
- Schema: `prisma/schema.prisma` at project root
- API prefix: `api/v1` (excluded: `/health`)
- Swagger enabled at `/api/docs`

## Rules

### Module Structure
Every new domain module in `apps/api/src/modules/{name}/`:
```
{name}/
  {name}.module.ts
  {name}.controller.ts
  {name}.service.ts
  dto/
    index.ts          # barrel export
    create-{name}.dto.ts
    update-{name}.dto.ts
  guards/             # if custom guards needed
  services/           # if multiple services needed
```

### Controller Pattern
```typescript
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser, CurrentTenant, Roles, Auditable } from '@sim360/core';

@ApiTags('module-name')
@ApiBearerAuth()
@Controller('module-name')
export class ModuleController {
  constructor(private readonly service: ModuleService) {}

  @Post()
  @Auditable()
  @ApiOperation({ summary: 'Create resource' })
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateDto,
  ) {
    return this.service.create(tenantId, user.id, dto);
  }
}
```

### Service Pattern
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@sim360/core';

@Injectable()
export class ModuleService {
  constructor(private readonly prisma: PrismaService) {}

  // Always filter by tenantId for data isolation
  async findAll(tenantId: string) {
    return this.prisma.model.findMany({ where: { tenantId } });
  }
}
```

### DTO Pattern
```typescript
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDto {
  @ApiProperty({ description: 'Field description' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;
}
```

### Key Imports from @sim360/core
- `PrismaService` — database access
- `CurrentUser`, `CurrentTenant` — parameter decorators
- `Roles`, `Public` — route decorators
- `Auditable` — audit logging decorator
- `Cacheable`, `CacheEvict` — caching decorators
- `EventStoreService` — domain event publishing
- `JwtAuthGuard`, `RolesGuard` — guards (applied globally)

### Must Do
- Always scope queries by `tenantId`
- Use `class-validator` decorators on all DTOs
- Add Swagger decorators (`@ApiTags`, `@ApiOperation`, `@ApiBearerAuth`)
- Emit domain events for state transitions via `EventStoreService`
- Use `@Auditable()` on all mutation endpoints
- Register new modules in `apps/api/src/app.module.ts`

### Must Not
- Never import Prisma Client directly — use `PrismaService` from core
- Never call AI APIs directly — use `AiService` from `AiModule`
- Never skip tenant isolation
- Never create new global interceptors/filters — core already provides them
