import { useParams, Link } from 'react-router';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { useCandidateReport } from '../api/recruitment.api';
import { CandidateStatusBadge } from '../components/candidate-status-badge';

export default function CandidateReportPage() {
  const { id, candidateId } = useParams<{ id: string; candidateId: string }>();
  const { data: candidate, isLoading, error } = useCandidateReport(id!, candidateId!);

  if (isLoading) {
    return (
      <>
        <Toolbar>
          <ToolbarHeading title="Chargement..." />
        </Toolbar>
        <div className="container-fixed flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </>
    );
  }

  if (error || !candidate) {
    return (
      <>
        <Toolbar>
          <ToolbarHeading title="Rapport candidat" />
        </Toolbar>
        <div className="container-fixed">
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-destructive text-sm">Impossible de charger le rapport.</p>
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link to={`/recruitment/campaigns/${id}`}>Retour</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const candidateName = candidate.user
    ? `${candidate.user.firstName} ${candidate.user.lastName}`
    : 'Candidat';

  const radarData = candidate.report360
    ? [
        { axis: 'Hard Skills', value: candidate.report360.hardSkills.score },
        { axis: 'Soft Skills', value: candidate.report360.softSkills.score },
        { axis: 'Fiabilite', value: candidate.report360.reliability.score },
        { axis: 'Adaptabilite', value: candidate.report360.adaptability.score },
        { axis: 'Leadership', value: candidate.report360.leadership.score },
      ]
    : [
        { axis: 'Hard Skills', value: candidate.hardSkillsScore ?? 0 },
        { axis: 'Soft Skills', value: candidate.softSkillsScore ?? 0 },
        { axis: 'Fiabilite', value: candidate.reliabilityScore ?? 0 },
        { axis: 'Adaptabilite', value: candidate.adaptabilityScore ?? 0 },
        { axis: 'Leadership', value: candidate.leadershipScore ?? 0 },
      ];

  return (
    <>
      <Toolbar>
        <ToolbarHeading title={`Rapport 360 - ${candidateName}`} />
        <ToolbarActions>
          <CandidateStatusBadge status={candidate.status} />
          <Button variant="outline" size="sm" asChild>
            <Link to={`/recruitment/campaigns/${id}/candidates/${candidateId}/interview`}>
              <KeenIcon icon="message-text" style="outline" className="size-4" />
              Guide d'entretien
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/recruitment/campaigns/${id}`}>
              <KeenIcon icon="arrow-left" style="outline" className="size-4" />
              Retour
            </Link>
          </Button>
        </ToolbarActions>
      </Toolbar>

      <div className="container-fixed space-y-5">
        {/* Global score */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="md:col-span-1">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="relative">
                <div
                  className={cn(
                    'w-28 h-28 rounded-full border-4 flex items-center justify-center',
                    (candidate.globalScore ?? 0) >= 70
                      ? 'border-success'
                      : (candidate.globalScore ?? 0) >= 40
                        ? 'border-warning'
                        : 'border-destructive',
                  )}
                >
                  <span className="text-3xl font-bold">
                    {candidate.globalScore !== undefined && candidate.globalScore !== null
                      ? Math.round(candidate.globalScore)
                      : '-'}
                  </span>
                </div>
              </div>
              <p className="text-sm font-medium mt-3">Score global</p>
              <p className="text-xs text-muted-foreground">sur 100</p>

              {candidate.matchPercentage !== undefined && candidate.matchPercentage !== null && (
                <div className="w-full mt-6 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Compatibilite</span>
                    <span className="font-semibold">{Math.round(candidate.matchPercentage)}%</span>
                  </div>
                  <Progress value={candidate.matchPercentage} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Radar chart */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm">Profil de competences</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                  <PolarGrid stroke="var(--color-border)" />
                  <PolarAngleAxis
                    dataKey="axis"
                    tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
                  />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke="var(--color-primary)"
                    fill="var(--color-primary)"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Report 360 details */}
        {candidate.report360 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: 'hardSkills' as const, label: 'Hard Skills', icon: 'code' },
              { key: 'softSkills' as const, label: 'Soft Skills', icon: 'people' },
              { key: 'reliability' as const, label: 'Fiabilite', icon: 'shield-tick' },
              { key: 'adaptability' as const, label: 'Adaptabilite', icon: 'arrows-loop' },
              { key: 'leadership' as const, label: 'Leadership', icon: 'crown' },
            ].map(({ key, label, icon }) => (
              <Card key={key}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <KeenIcon icon={icon} style="outline" className="size-4" />
                    {label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <Progress value={candidate.report360![key].score} className="h-2 flex-1 mr-3" />
                    <span className="text-sm font-bold">{candidate.report360![key].score}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{candidate.report360![key].details}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <KeenIcon icon="check-circle" style="outline" className="size-4 text-success" />
                Points forts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {candidate.strengths.length > 0 ? (
                <ul className="space-y-2">
                  {candidate.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <KeenIcon icon="check" style="outline" className="size-3.5 text-success mt-0.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Aucun point fort identifie.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <KeenIcon icon="information-2" style="outline" className="size-4 text-warning" />
                Points d'amelioration
              </CardTitle>
            </CardHeader>
            <CardContent>
              {candidate.weaknesses.length > 0 ? (
                <ul className="space-y-2">
                  {candidate.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <KeenIcon icon="minus" style="outline" className="size-3.5 text-warning mt-0.5 shrink-0" />
                      {w}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Aucun point d'amelioration identifie.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Justification */}
        {candidate.aiJustification && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <KeenIcon icon="artificial-intelligence" style="outline" className="size-4 text-primary" />
                Analyse IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {candidate.aiJustification}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
