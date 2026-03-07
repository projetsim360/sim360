import { useParams, Link } from 'react-router';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components/keenicons';
import { useDebriefing } from '../api/valorization.api';
import { CompetencyRadarChart } from '../components/competency-radar-chart';
import { DebriefingSection } from '../components/debriefing-section';

export default function DebriefingPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useDebriefing(id!);

  if (isLoading) {
    return (
      <>
        <Toolbar>
          <ToolbarHeading title="Debriefing" />
        </Toolbar>
        <div className="container-fixed">
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </div>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <Toolbar>
          <ToolbarHeading title="Debriefing" />
        </Toolbar>
        <div className="container-fixed">
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-destructive">
                Impossible de charger le debriefing.
              </p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Toolbar>
        <ToolbarHeading title="Debriefing" />
        <ToolbarActions>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/simulations/${id}/portfolio`}>
              <KeenIcon icon="folder" style="solid" className="text-sm" />
              Voir le portfolio
            </Link>
          </Button>
          <Button variant="primary" size="sm" disabled>
            <KeenIcon icon="download" style="solid" className="text-sm" />
            Telecharger le certificat
          </Button>
        </ToolbarActions>
      </Toolbar>

      <div className="container-fixed space-y-5">
        {/* Header: Score + Simulation info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Global score */}
              <div className="flex flex-col items-center justify-center shrink-0">
                <div className="flex items-center justify-center size-24 rounded-full bg-primary/10 border-4 border-primary">
                  <span className="text-3xl font-bold text-primary">
                    {data.globalScore}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground mt-2">Score global</span>
              </div>

              {/* Simulation info */}
              <div className="flex-1 min-w-0 text-center md:text-left">
                <h2 className="text-xl font-semibold text-gray-900">
                  {data.projectName}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Scenario : {data.scenarioTitle}
                </p>
                {data.completedAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Termine le{' '}
                    {new Date(data.completedAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Radar chart */}
        <Card>
          <CardHeader>
            <CardTitle>Competences evaluees</CardTitle>
          </CardHeader>
          <CardContent>
            <CompetencyRadarChart scores={data.competencyScores} />
          </CardContent>
        </Card>

        {/* Strengths, Improvements, Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <DebriefingSection
            title="Points forts"
            items={data.strengths}
            icon="check-circle"
            iconColor="text-green-600"
          />
          <DebriefingSection
            title="Axes d'amelioration"
            items={data.improvements}
            icon="information-2"
            iconColor="text-yellow-600"
          />
          <DebriefingSection
            title="Recommandations"
            items={data.recommendations}
            icon="message-text"
            iconColor="text-blue-600"
          />
        </div>

        {/* Presentation finale (US-7.10) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeenIcon icon="people" style="solid" className="text-base text-primary" />
              Presentation finale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-sm text-gray-700">
                  L'apprenant a presente son projet devant un comite d'evaluation
                  lors de la phase de cloture de la simulation.
                </p>
                {data.closureMeetingCompleted ? (
                  <div className="mt-3">
                    <Badge variant="success" appearance="light" size="sm">
                      <KeenIcon icon="check-circle" style="solid" className="text-xs mr-1" />
                      Presentation effectuee
                    </Badge>
                  </div>
                ) : (
                  <div className="mt-3">
                    <Badge variant="warning" appearance="light" size="sm">
                      <KeenIcon icon="time" style="solid" className="text-xs mr-1" />
                      Presentation non effectuee
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debriefing summary */}
        {data.debriefingSummary && (
          <Card>
            <CardHeader>
              <CardTitle>Resume du debriefing</CardTitle>
            </CardHeader>
            <CardContent>
              <blockquote className="border-l-4 border-primary pl-4 italic text-sm text-gray-700 leading-relaxed">
                {data.debriefingSummary}
              </blockquote>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-center gap-3 pb-5">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/simulations/${id}/cv-suggestions`}>
              <KeenIcon icon="document" style="solid" className="text-sm" />
              Suggestions CV
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/profile/badges">
              <KeenIcon icon="award" style="solid" className="text-sm" />
              Mes badges
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
