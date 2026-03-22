import { Link, useParams } from 'react-router';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { KeenIcon } from '@/components/keenicons';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { CompanyBanner } from '../components/company-banner';

export default function CompanyIntranetPage() {
  const { id: simId } = useParams<{ id: string }>();

  const { data: simulation, isLoading, error } = useQuery({
    queryKey: ['simulation', simId],
    queryFn: () => api.get<any>(`/simulations/${simId}`),
    enabled: !!simId,
  });

  if (!simId) {
    return (
      <div className="container">
        <Toolbar>
          <ToolbarHeading title="Intranet Entreprise" />
        </Toolbar>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Aucune simulation selectionnee.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container-fixed space-y-5">
        <Toolbar>
          <ToolbarHeading>
            <h1 className="text-xl font-medium text-gray-900">Intranet Entreprise</h1>
          </ToolbarHeading>
        </Toolbar>
        <Skeleton className="h-32 w-full rounded-lg" />
        <Card>
          <CardContent className="p-5 space-y-3">
            <Skeleton className="h-5 w-32" />
            <div className="flex items-center gap-4">
              <Skeleton className="size-14 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 space-y-3">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !simulation) {
    return (
      <div className="container">
        <Toolbar>
          <ToolbarHeading title="Intranet Entreprise" />
          <ToolbarActions>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/simulations/${simId}`}>
                <KeenIcon icon="arrow-left" style="duotone" className="size-4" />
                Retour
              </Link>
            </Button>
          </ToolbarActions>
        </Toolbar>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive text-sm">
              Erreur lors du chargement des donnees.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const project = simulation.project;
  const scenario = simulation.scenario;
  const teamMembers = project?.teamMembers || [];

  return (
    <div className="container-fixed space-y-5">
      <Toolbar>
        <ToolbarHeading title="Intranet Entreprise" />
        <ToolbarActions>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/simulations/${simId}/emails`}>
              <KeenIcon icon="sms" style="duotone" className="size-4" />
              Boite de reception
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/simulations/${simId}`}>
              <KeenIcon icon="arrow-left" style="duotone" className="size-4" />
              Retour
            </Link>
          </Button>
        </ToolbarActions>
      </Toolbar>
        {/* Company banner */}
        <CompanyBanner
          companyName={project?.client || scenario?.companyName || 'Entreprise'}
          sector={scenario?.sector}
          culture={scenario?.companyCulture}
        />

        {/* User role */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeenIcon icon="profile-circle" style="duotone" className="size-5" />
              Votre poste
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10">
                <KeenIcon icon="user" style="duotone" className="size-7 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground">Chef de Projet</h3>
                <p className="text-sm text-muted-foreground">
                  Responsable de la gestion du projet {project?.name || ''}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeenIcon icon="briefcase" style="duotone" className="size-5" />
              Projet en cours
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm text-muted-foreground uppercase tracking-wide">
                Nom du projet
              </span>
              <p className="text-sm font-medium text-foreground">
                {project?.name || 'Non defini'}
              </p>
            </div>
            {project?.description && (
              <div>
                <span className="text-sm text-muted-foreground uppercase tracking-wide">
                  Description
                </span>
                <p className="text-sm text-foreground leading-relaxed">
                  {project.description}
                </p>
              </div>
            )}
            {scenario?.description && (
              <div>
                <span className="text-sm text-muted-foreground uppercase tracking-wide">
                  Contexte du scenario
                </span>
                <p className="text-sm text-foreground leading-relaxed">
                  {scenario.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team members */}
        {teamMembers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeenIcon icon="people" style="duotone" className="size-5" />
                Equipe projet
                <Badge variant="secondary" size="sm">
                  {teamMembers.length} membre{teamMembers.length > 1 ? 's' : ''}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {teamMembers.map((member: any, index: number) => (
                  <div
                    key={member.id || index}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border"
                  >
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-muted text-muted-foreground font-semibold text-sm">
                      {(member.name || member.role || '?')
                        .split(' ')
                        .map((w: string) => w[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {member.name || member.role}
                      </p>
                      {member.role && member.name && (
                        <p className="text-sm text-muted-foreground truncate">
                          {member.role}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
