export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  plan: TenantPlan;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TenantPlan = 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';

export interface CreateTenantDto {
  name: string;
  slug: string;
  plan?: TenantPlan;
}
