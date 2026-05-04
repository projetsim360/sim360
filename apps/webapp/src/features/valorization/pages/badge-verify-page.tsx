import { useParams } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { KeenIcon } from '@/components/keenicons';
import { useBadgeVerification } from '../api/valorization.api';
import { CompetencyRadarChart } from '../components/competency-radar-chart';

export default function BadgeVerifyPage() {
  const { badgeId } = useParams<{ badgeId: string }>();
  const { data, isLoading, error } = useBadgeVerification(badgeId!);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !data || !data.valid || !data.badge) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center space-y-3">
            <KeenIcon icon="shield-cross" style="duotone" className="text-4xl text-destructive" />
            <h1 className="text-lg font-semibold text-foreground">
              Badge non valide
            </h1>
            <p className="text-sm text-muted-foreground">
              Ce badge n'existe pas ou le lien de verification est invalide.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { badge, userName } = data;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Verified header */}
        <Card>
          <CardContent className="p-6 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-success">
              <KeenIcon icon="shield-tick" style="duotone" className="text-2xl" />
              <span className="text-sm font-semibold uppercase tracking-wide">
                Badge verifie par Simex pro
              </span>
            </div>

            {/* Score */}
            <div className="flex items-center justify-center">
              <div className="flex items-center justify-center size-20 rounded-full bg-primary/10 border-4 border-primary">
                <span className="text-2xl font-bold text-primary">
                  {badge.globalScore}
                </span>
              </div>
            </div>

            {/* Badge info */}
            <h1 className="text-xl font-semibold text-foreground">{badge.title}</h1>
            {userName && (
              <p className="text-sm text-muted-foreground">
                Delivre a <span className="font-medium text-foreground">{userName}</span>
              </p>
            )}
            <p className="text-sm text-muted-foreground">{badge.description}</p>

            {/* Metadata */}
            <div className="flex items-center flex-wrap gap-2 justify-center">
              <Badge variant="secondary" size="sm">{badge.scenarioTitle}</Badge>
              <Badge variant="info" appearance="light" size="sm">{badge.sector}</Badge>
            </div>

            <p className="text-xs text-muted-foreground">
              Obtenu le{' '}
              {new Date(badge.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </CardContent>
        </Card>

        {/* Competency radar */}
        <Card>
          <CardHeader>
            <CardTitle>Competences evaluees</CardTitle>
          </CardHeader>
          <CardContent>
            <CompetencyRadarChart scores={badge.competencyScores} />
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          Ce badge a ete genere par la plateforme Simex pro.
          Il atteste des competences en gestion de projet evaluees lors d'une simulation.
        </p>
      </div>
    </div>
  );
}
