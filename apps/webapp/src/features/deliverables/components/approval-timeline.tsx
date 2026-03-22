import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ChainStep {
  role: string;
  memberName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  comment?: string;
}

interface Approval {
  reviewerRole: string;
  status: string;
  comment: string | null;
  reviewedAt: string | null;
}

interface ApprovalTimelineProps {
  chain: ChainStep[] | null;
  approvals: Approval[];
}

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'secondary' | 'success' | 'destructive'; dotColor: string }
> = {
  PENDING: {
    label: 'En attente',
    variant: 'secondary',
    dotColor: 'bg-gray-400',
  },
  APPROVED: {
    label: 'Approuve',
    variant: 'success',
    dotColor: 'bg-green-500',
  },
  REJECTED: {
    label: 'Rejete',
    variant: 'destructive',
    dotColor: 'bg-red-500',
  },
};

function getApprovalForRole(approvals: Approval[], role: string) {
  return approvals.find((a) => a.reviewerRole === role);
}

export function ApprovalTimeline({ chain, approvals }: ApprovalTimelineProps) {
  if (!chain || chain.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucune chaine d&apos;approbation definie.
      </p>
    );
  }

  return (
    <div className="relative space-y-0">
      {chain.map((step, index) => {
        const config = STATUS_CONFIG[step.status] ?? STATUS_CONFIG.PENDING;
        const approval = getApprovalForRole(approvals, step.role);
        const isLast = index === chain.length - 1;

        return (
          <div key={`${step.role}-${index}`} className="relative flex gap-3 pb-5 last:pb-0">
            {/* Vertical line */}
            {!isLast && (
              <div className="absolute left-[9px] top-5 bottom-0 w-px bg-border" />
            )}

            {/* Dot */}
            <div
              className={cn(
                'relative z-10 mt-0.5 size-[18px] shrink-0 rounded-full border-2 border-background',
                config.dotColor,
              )}
            />

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">{step.role}</span>
                <Badge
                  variant={config.variant}
                  appearance="light"
                  size="xs"
                >
                  {config.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {step.memberName}
              </p>
              {step.comment && (
                <p className="text-xs text-muted-foreground mt-1 italic">
                  &laquo; {step.comment} &raquo;
                </p>
              )}
              {approval?.reviewedAt && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {format(new Date(approval.reviewedAt), 'd MMM yyyy HH:mm', {
                    locale: fr,
                  })}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
