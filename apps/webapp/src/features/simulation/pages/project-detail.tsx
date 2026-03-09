import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { Toolbar, ToolbarHeading } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { projectApi } from '../api/project.api';
import type { Project, ProjectTeamMember, Deliverable } from '../types/simulation.types';

const DELIVERABLE_STATUS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'En attente', color: 'bg-gray-100 text-gray-700' },
  IN_PROGRESS: { label: 'En cours', color: 'bg-blue-100 text-blue-700' },
  DELIVERED: { label: 'Livre', color: 'bg-purple-100 text-purple-700' },
  ACCEPTED: { label: 'Accepte', color: 'bg-green-100 text-green-700' },
  REJECTED: { label: 'Rejete', color: 'bg-red-100 text-red-700' },
};

export default function ProjectDetailPage() {
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
          <ToolbarHeading title="Projet" />
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
          <ToolbarHeading title="Projet" />
        </Toolbar>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-red-600 text-sm">{error || 'Projet introuvable'}</p>
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
          description={project.client ? `Client : ${project.client}` : project.sector}
        />
      </Toolbar>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <StatCard label="Budget initial" value={`${project.initialBudget.toLocaleString('fr-FR')} EUR`} />
        <StatCard label="Budget restant" value={`${project.currentBudget.toLocaleString('fr-FR')} EUR`} color={budgetUsed > 80 ? 'text-red-500' : undefined} />
        <StatCard label="Equipe" value={String(project.teamMembers.length)} />
        <StatCard label="Livrables" value={String(project.deliverables.length)} />
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
            <CardTitle className="text-sm">Equipe ({project.teamMembers.length})</CardTitle>
            <Link to={`/projects/${project.id}/team`} className="text-sm text-primary hover:underline">
              Voir tout
            </Link>
          </CardHeader>
          <CardContent>
            {project.teamMembers.length === 0 ? (
              <EmptyState
                icon="people"
                title="Equipe vide"
                description="L'equipe sera constituee au lancement de la simulation."
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
            <CardTitle className="text-sm">Livrables ({project.deliverables.length})</CardTitle>
            <Link to={`/projects/${project.id}/deliverables`} className="text-sm text-primary hover:underline">
              Voir tout
            </Link>
          </CardHeader>
          <CardContent>
            {project.deliverables.length === 0 ? (
              <EmptyState
                icon="document"
                title="Aucun livrable"
                description="Les livrables seront disponibles au fur et a mesure des phases."
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
            Voir la simulation
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
  return (
    <div className="flex items-center gap-3 py-1.5">
      {member.avatar ? (
        <img src={member.avatar} alt={member.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
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
        <span className={`text-[10px] font-medium ${member.morale >= 70 ? 'text-green-600' : member.morale >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
          Moral {member.morale}%
        </span>
      </div>
    </div>
  );
}

function DeliverableRow({ deliverable }: { deliverable: Deliverable }) {
  const status = DELIVERABLE_STATUS[deliverable.status] ?? { label: deliverable.status, color: '' };
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{deliverable.name}</p>
        {deliverable.description && (
          <p className="text-[10px] text-muted-foreground truncate">{deliverable.description}</p>
        )}
      </div>
      <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium ${status.color}`}>
        {status.label}
      </span>
    </div>
  );
}
