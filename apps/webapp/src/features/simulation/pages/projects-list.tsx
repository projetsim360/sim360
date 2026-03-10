import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Toolbar, ToolbarHeading } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { projectApi, type ProjectListItem } from '../api/project.api';

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Brouillon',
  IN_PROGRESS: 'En cours',
  PAUSED: 'En pause',
  COMPLETED: 'Termine',
  ABANDONED: 'Abandonne',
};

const STATUS_VARIANT: Record<string, 'secondary' | 'primary' | 'warning' | 'success' | 'destructive'> = {
  DRAFT: 'secondary',
  IN_PROGRESS: 'primary',
  PAUSED: 'warning',
  COMPLETED: 'success',
  ABANDONED: 'destructive',
};

export default function ProjectsListPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    projectApi
      .getProjects()
      .then(setProjects)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container">
      <Toolbar>
        <ToolbarHeading title="Mes projets" />
      </Toolbar>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      )}

      {error && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive text-sm">Erreur : {error}</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && projects.length === 0 && (
        <Card>
          <CardContent>
            <EmptyState
              icon="folder"
              title="Aucun projet"
              description="Lancez une simulation pour creer votre premier projet."
              action={{ label: 'Nouvelle simulation', href: '/simulations/new' }}
            />
          </CardContent>
        </Card>
      )}

      {!loading && !error && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => {
            const simStatus = project.simulation?.status;
            return (
              <Card
                key={project.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm truncate">{project.name}</h3>
                      {project.client && (
                        <p className="text-sm text-muted-foreground">Client : {project.client}</p>
                      )}
                    </div>
                    {simStatus && (
                      <Badge variant={STATUS_VARIANT[simStatus] ?? 'secondary'} appearance="light" size="sm">
                        {STATUS_LABELS[simStatus] ?? simStatus}
                      </Badge>
                    )}
                  </div>

                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Secteur : {project.sector}</span>
                    <span>Budget : {project.initialBudget.toLocaleString('fr-FR')} EUR</span>
                  </div>

                  <div className="flex items-center gap-4 text-sm border-t border-border pt-2">
                    <span className="text-muted-foreground">{project._count.teamMembers} membres</span>
                    <span className="text-muted-foreground">{project._count.deliverables} livrables</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
