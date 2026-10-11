import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { Toolbar, ToolbarHeading } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { projectApi } from '../api/project.api';
import type { Project, ProjectTeamMember, Deliverable } from '../types/simulation.types';
import { useTv } from '@/i18n/app/use-t';
import { useAppLocale } from '@/providers/locale-provider';
import { useT } from '@/i18n/app/use-t';

const DELIVERABLE_STATUS: Record<string, { variant: 'secondary' | 'primary' | 'success' | 'destructive' }> = {
  PENDING: { variant: 'secondary' },
  IN_PROGRESS: { variant: 'primary' },
  DELIVERED: { variant: 'primary' },
  ACCEPTED: { variant: 'success' },
  REJECTED: { variant: 'destructive' },
};

export default function ProjectDetailPage() {
  const { intlLocale } = useAppLocale();
  const t = useT();
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<(Project & { simulation?: any }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    projectApi
      .getProject(id)
      .then(setProject)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container">
        <Toolbar>
          <ToolbarHeading title={t('sims.project')} />
        </Toolbar>
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container">
        <Toolbar>
          <ToolbarHeading title={t('sims.project')} />
        </Toolbar>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive text-sm">{error || t('projects.notFound')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const budgetUsed = project.initialBudget > 0
    ? Math.round(((project.initialBudget - project.currentBudget) / project.initialBudget) * 100)
    : 0;

  return (
    <div className="container">
      <Toolbar>
        <ToolbarHeading
          title={project.name}
          description={project.client ? t('projects.client', { client: project.client }) : project.sector}
        />
      </Toolbar>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <StatCard label={t('projects.initialBudget')} value={new Intl.NumberFormat(intlLocale, { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(project.initialBudget)} />
        <StatCard label={t('projects.remainingBudget')} value={new Intl.NumberFormat(intlLocale, { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(project.currentBudget)} color={budgetUsed > 80 ? 'text-destructive' : undefined} />
        <StatCard label={t('projects.team')} value={String(project.teamMembers.length)} />
        <StatCard label={t('dashboard.priority.deliverables')} value={String(project.deliverables.length)} />
      </div>

      {/* Description */}
      {project.description && (
        <Card className="mb-5">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">{project.description}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Team */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">{t('projects.teamCount', { count: project.teamMembers.length })}</CardTitle>
            <Link to={`/projects/${project.id}/team`} className="text-sm text-primary hover:underline">
              {t('common.seeAllShort')}
            </Link>
          </CardHeader>
          <CardContent>
            {project.teamMembers.length === 0 ? (
              <EmptyState
                icon="people"
                title={t('projects.teamEmptyTitle')}
                description={t('projects.teamEmptyText')}
              />
            ) : (
              <div className="space-y-2">
                {project.teamMembers.slice(0, 5).map((m) => (
                  <TeamMemberRow key={m.id} member={m} />
                ))}
                {project.teamMembers.length > 5 && (
                  <p className="text-sm text-muted-foreground text-center pt-1">
                    +{project.teamMembers.length - 5} autres
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Deliverables */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">{t('projects.deliverablesCount', { count: project.deliverables.length })}</CardTitle>
            <Link to={`/projects/${project.id}/deliverables`} className="text-sm text-primary hover:underline">
              {t('common.seeAllShort')}
            </Link>
          </CardHeader>
          <CardContent>
            {project.deliverables.length === 0 ? (
              <EmptyState
                icon="document"
                title={t('projects.deliverablesEmptyTitle')}
                description={t('projects.deliverablesEmptyText')}
              />
            ) : (
              <div className="space-y-2">
                {project.deliverables.slice(0, 5).map((d) => (
                  <DeliverableRow key={d.id} deliverable={d} />
                ))}
                {project.deliverables.length > 5 && (
                  <p className="text-sm text-muted-foreground text-center pt-1">
                    +{project.deliverables.length - 5} autres
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Link to simulation */}
      {project.simulation && (
        <div className="mt-5">
          <Link
            to={`/simulations/${project.simulation.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            {t('projects.seeSimulation')}
          </Link>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-4">
        <span className={`text-lg font-bold ${color ?? 'text-foreground'}`}>{value}</span>
        <span className="text-[10px] text-muted-foreground mt-1">{label}</span>
      </CardContent>
    </Card>
  );
}

function TeamMemberRow({ member }: { member: ProjectTeamMember }) {
  const t = useT();
  return (
    <div className="flex items-center gap-3 py-1.5">
      {member.avatar ? (
        <img src={member.avatar} alt={member.name} className="w-7 h-7 rounded-full object-cover shrink-0" loading="lazy" />
      ) : (
        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
          {member.name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{member.name}</p>
        <p className="text-[10px] text-muted-foreground">{member.role}</p>
      </div>
      <div className="text-right shrink-0">
        <span className={`text-[10px] font-medium ${member.morale >= 70 ? 'text-success' : member.morale >= 40 ? 'text-warning' : 'text-destructive'}`}>
          {t('projects.morale', { value: member.morale })}
        </span>
      </div>
    </div>
  );
}

function DeliverableRow({ deliverable }: { deliverable: Deliverable }) {
  const tv = useTv();
  const t = useT();
  const status = DELIVERABLE_STATUS[deliverable.status] ?? { variant: 'secondary' as const };
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{deliverable.name}</p>
        {deliverable.description && (
          <p className="text-[10px] text-muted-foreground truncate">{deliverable.description}</p>
        )}
      </div>
      <Badge variant={status.variant} appearance="light" size="sm">
        {tv('deliverableStatus', deliverable.status)}
      </Badge>
    </div>
  );
}
