import { SetMetadata } from '@nestjs/common';

export const AUDITABLE_KEY = 'auditable';

export interface AuditableOptions {
  action: string;
  entity: string;
}

export const Auditable = (action: string, entity: string) =>
  SetMetadata(AUDITABLE_KEY, { action, entity } as AuditableOptions);
