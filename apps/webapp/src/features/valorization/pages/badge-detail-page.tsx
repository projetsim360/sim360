import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components/keenicons';
import { toast } from 'sonner';
import { useBadge } from '../api/valorization.api';
import { CompetencyRadarChart } from '../components/competency-radar-chart';
import { DebriefingSection } from '../components/debriefing-section';
import { ShareBadgeDialog } from '../components/share-badge-dialog';

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: 'Facile',
  MEDIUM: 'Intermediaire',
  HARD: 'Difficile',
  EXPERT: 'Expert',
};

export default function BadgeDetailPage() {
  const { badgeId } = useParams<{ badgeId: string }>();
  const { data: badge, isLoading, error } = useBadge(badgeId!);
  const [shareOpen, setShareOpen] = useState(false);

  if (isLoading) {
    return (
      <>
        <Toolbar>
          <ToolbarHeading title="Detail du badge" />
        </Toolbar>
        <div className="container-fixed">
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </div>
      </>
    );
  }

  if (error || !badge) {
    return (
      <>
        <Toolbar>
          <ToolbarHeading title="Detail du badge" />
        </Toolbar>
        <div className="container-fixed">
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-destructive">
                Impossible de charger ce badge.
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
        <ToolbarHeading title="Detail du badge" />
        <ToolbarActions>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const verifyUrl = `${window.location.origin}/badges/${badge.id}/verify`;
              navigator.clipboard.writeText(verifyUrl);
              toast.success('Lien copie dans le presse-papiers');
            }}
          >
            <KeenIcon icon="copy" style="solid" className="text-sm" />
            Copier le lien
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              const verifyUrl = `${window.location.origin}/badges/${badge.id}/verify`;
              const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`;
              window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
            }}
          >
            <KeenIcon icon="linkedin" style="solid" className="text-sm" />
            Partager sur LinkedIn
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShareOpen(true)}>
            <KeenIcon icon="share" style="solid" className="text-sm" />
            Partager
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/simulations/${badge.simulationId}/debriefing`}>
              <KeenIcon icon="chart" style="solid" className="text-sm" />
              Debriefing complet
            </Link>
          </Button>
        </ToolbarActions>
      </Toolbar>

      <div className="container-fixed space-y-5">
        {/* Badge header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Score circle */}
              <div className="flex flex-col items-center justify-center shrink-0">
                <div className="flex items-center justify-center size-24 rounded-full bg-primary/10 border-4 border-primary">
                  <span className="text-3xl font-bold text-primary">
                    {badge.globalScore}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground mt-2">Score global</span>
              </div>

              {/* Badge info */}
              <div className="flex-1 min-w-0 text-center md:text-left space-y-2">
                <h2 className="text-xl font-semibold text-gray-900">{badge.title}</h2>
                <p className="text-sm text-muted-foreground">{badge.description}</p>
                <div className="flex items-center flex-wrap gap-2 justify-center md:justify-start">
                  <Badge variant="secondary" size="sm">
                    {badge.scenarioTitle}
                  </Badge>
                  <Badge variant="info" appearance="light" size="sm">
                    {badge.sector}
                  </Badge>
                  <Badge variant="warning" appearance="light" size="sm">
                    {DIFFICULTY_LABELS[badge.difficulty] ?? badge.difficulty}
                  </Badge>
                  {badge.durationMinutes && (
                    <Badge variant="secondary" size="sm">
                      <KeenIcon icon="time" style="solid" className="text-xs mr-1" />
                      {badge.durationMinutes} min
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Obtenu le{' '}
                  {new Date(badge.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
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
            <CompetencyRadarChart scores={badge.competencyScores} />
          </CardContent>
        </Card>

        {/* Strengths, Improvements, Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <DebriefingSection
            title="Points forts"
            items={badge.strengths}
            icon="check-circle"
            iconColor="text-green-600"
          />
          <DebriefingSection
            title="Axes d'amelioration"
            items={badge.improvements}
            icon="information-2"
            iconColor="text-yellow-600"
          />
          <DebriefingSection
            title="Recommandations"
            items={badge.recommendations}
            icon="message-text"
            iconColor="text-blue-600"
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-3 pb-5">
          <Button variant="outline" size="sm" asChild>
            <Link to="/profile/badges">
              <KeenIcon icon="arrow-left" style="solid" className="text-sm" />
              Retour aux badges
            </Link>
          </Button>
        </div>
      </div>

      {/* Share dialog */}
      <ShareBadgeDialog
        badgeId={badge.id}
        shareToken={badge.shareToken}
        open={shareOpen}
        onOpenChange={setShareOpen}
      />
    </>
  );
}
