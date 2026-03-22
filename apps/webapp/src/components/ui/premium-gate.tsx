import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components/keenicons';

interface PremiumGateProps {
  requiredPlan: 'STARTER' | 'PRO' | 'ENTERPRISE';
  currentPlan?: string;
  children: React.ReactNode;
  className?: string;
}

export function PremiumGate({
  requiredPlan,
  currentPlan,
  children,
  className,
}: PremiumGateProps) {
  const planHierarchy: Record<string, number> = {
    FREE: 0,
    STARTER: 1,
    PRO: 2,
    ENTERPRISE: 3,
  };
  const hasAccess =
    planHierarchy[currentPlan ?? 'FREE'] >= planHierarchy[requiredPlan];

  if (hasAccess) return <>{children}</>;

  return (
    <div className={cn('relative', className)}>
      <div className="pointer-events-none opacity-40 blur-[1px]">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm rounded-lg">
        <Badge variant="warning" size="sm" className="mb-2">
          <KeenIcon icon="crown" style="solid" className="text-xs" />
          {requiredPlan}
        </Badge>
        <p className="text-sm font-medium text-foreground mb-2">
          Disponible avec le plan {requiredPlan}
        </p>
        <Button variant="primary" size="sm">
          <KeenIcon icon="arrow-up" style="duotone" className="text-xs" />
          Mettre a niveau
        </Button>
      </div>
    </div>
  );
}
