import { useParams, Link } from 'react-router';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { KeenIcon } from '@/components/keenicons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { useCandidateReport, useCampaign } from '../api/recruitment.api';
import { CandidateStatusBadge } from '../components/candidate-status-badge';
import { useT } from '@/i18n/app/use-t';

export default function CandidateReportPage() {
  const t = useT();
  const { id, candidateId } = useParams<{ id: string; candidateId: string }>();
  const { data: candidate, isLoading, error } = useCandidateReport(id!, candidateId!);
  const { data: campaign } = useCampaign(id!);

  if (isLoading) {
    return (
      <div className="container">
        <Toolbar>
          <ToolbarHeading title={t('mentoring.loading')} />
        </Toolbar>
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="container">
        <Toolbar>
          <ToolbarHeading title={t('recruit.report.title')} />
        </Toolbar>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive text-sm">{t('recruit.report.loadError')}</p>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link to={`/recruitment/campaigns/${id}`}>{t('common.back')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const candidateName = candidate.user
    ? `${candidate.user.firstName} ${candidate.user.lastName}`
    : t('recruit.candidate');

  const radarData = candidate.report360
    ? [
        { axis: t('recruit.hardSkills'), value: candidate.report360.hardSkills.score },
        { axis: t('recruit.softSkills'), value: candidate.report360.softSkills.score },
        { axis: t('recruit.reliability'), value: candidate.report360.reliability.score },
        { axis: t('recruit.adaptability'), value: candidate.report360.adaptability.score },
        { axis: t('recruit.leadership'), value: candidate.report360.leadership.score },
      ]
    : [
        { axis: t('recruit.hardSkills'), value: candidate.hardSkillsScore ?? 0 },
        { axis: t('recruit.softSkills'), value: candidate.softSkillsScore ?? 0 },
        { axis: t('recruit.reliability'), value: candidate.reliabilityScore ?? 0 },
        { axis: t('recruit.adaptability'), value: candidate.adaptabilityScore ?? 0 },
        { axis: t('recruit.leadership'), value: candidate.leadershipScore ?? 0 },
      ];

  return (
    <div className="container space-y-5">
      <Toolbar>
        <ToolbarHeading title={t('recruit.report.titleFor', { name: candidateName })} />
        <ToolbarActions>
          <CandidateStatusBadge status={candidate.status} />
          <Button variant="outline" size="sm" asChild>
            <Link to={`/recruitment/campaigns/${id}/candidates/${candidateId}/interview`}>
              <KeenIcon icon="message-text" style="duotone" className="size-4" />
              {t('recruit.guide.title')}
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/recruitment/campaigns/${id}`}>
              <KeenIcon icon="arrow-left" style="duotone" className="size-4" />
              {t('common.back')}
            </Link>
          </Button>
        </ToolbarActions>
      </Toolbar>
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
              <p className="text-sm font-medium mt-3">{t('valo.overallScore')}</p>
              <p className="text-sm text-muted-foreground">{t('evaluation.outOf100')}</p>

              {candidate.matchPercentage !== undefined && candidate.matchPercentage !== null && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-full mt-6 space-y-2 cursor-help">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t('recruit.compatibility')}</span>
                        <span className="font-semibold">{Math.round(candidate.matchPercentage)}%</span>
                      </div>
                      <Progress value={candidate.matchPercentage} className="h-2" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent variant="light" className="max-w-[280px]">
                    {t('recruit.report.matchDesc')}
                  </TooltipContent>
                </Tooltip>
              )}
            </CardContent>
          </Card>

          {/* Radar chart */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm">{t('recruit.report.skillsProfile')}</CardTitle>
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
                    name={t('recruit.score')}
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
              { key: 'hardSkills' as const, label: t('recruit.hardSkills'), icon: 'code' },
              { key: 'softSkills' as const, label: t('recruit.softSkills'), icon: 'people' },
              { key: 'reliability' as const, label: t('recruit.reliability'), icon: 'shield-tick' },
              { key: 'adaptability' as const, label: t('recruit.adaptability'), icon: 'arrows-loop' },
              { key: 'leadership' as const, label: t('recruit.leadership'), icon: 'crown' },
            ].map(({ key, label, icon }) => (
              <Card key={key}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <KeenIcon icon={icon} style="duotone" className="size-4" />
                    {label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <Progress value={candidate.report360![key].score} className="h-2 flex-1 mr-3" />
                    <span className="text-sm font-bold">{candidate.report360![key].score}%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{candidate.report360![key].details}</p>
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
                <KeenIcon icon="check-circle" style="duotone" className="size-4 text-success" />
                {t('valo.strengths')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {candidate.strengths.length > 0 ? (
                <ul className="space-y-2">
                  {candidate.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <KeenIcon icon="check" style="duotone" className="size-3.5 text-success mt-0.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">{t('recruit.report.noStrengths')}</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <KeenIcon icon="information-2" style="duotone" className="size-4 text-warning" />
                {t('recruit.report.improvements')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {candidate.weaknesses.length > 0 ? (
                <ul className="space-y-2">
                  {candidate.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <KeenIcon icon="minus" style="duotone" className="size-3.5 text-warning mt-0.5 shrink-0" />
                      {w}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">{t('recruit.report.noImprovements')}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* US-10.10: Adequation au poste / Gap analysis */}
        {candidate.matchPercentage !== undefined && candidate.matchPercentage !== null && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <KeenIcon icon="chart-simple" style="duotone" className="size-4 text-primary" />
                {t('recruit.report.jobFit')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Big circular match indicator */}
              <div className="flex flex-col items-center gap-3">
                <div
                  className={cn(
                    'w-24 h-24 rounded-full border-4 flex items-center justify-center',
                    candidate.matchPercentage >= 70
                      ? 'border-success'
                      : candidate.matchPercentage >= 40
                        ? 'border-warning'
                        : 'border-destructive',
                  )}
                >
                  <span className="text-2xl font-bold">{Math.round(candidate.matchPercentage)}%</span>
                </div>
                <p className="text-sm font-medium">{t('recruit.report.jobCompat')}</p>
              </div>

              {/* Gap analysis: required vs demonstrated */}
              {campaign?.requiredSkills && campaign.requiredSkills.length > 0 && candidate.competencyScores && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">{t('recruit.report.gaps')}</h4>
                  {campaign.requiredSkills.map((req) => {
                    const demonstrated = candidate.competencyScores?.[req.skill] ?? 0;
                    const requiredNormalized = req.weight * 10; // weight 1-10 -> 10-100 (poids: 1 = peu important, 10 = critique)
                    const gap = demonstrated - requiredNormalized;

                    return (
                      <div key={req.skill} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="font-medium cursor-help">
                                {req.skill} <span className="text-muted-foreground text-xs">({req.weight}/10)</span>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent variant="light" className="max-w-[240px]">
                              Poids de la compétence : {req.weight}/10. 1 = peu important, 10 = critique pour le poste.
                            </TooltipContent>
                          </Tooltip>
                          <span className={cn(
                            'font-medium',
                            gap >= 0 ? 'text-success' : 'text-destructive',
                          )}>
                            {gap >= 0 ? '+' : ''}{gap}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground w-16">{t('recruit.report.required')}</span>
                              <div className="flex-1 h-1.5 bg-accent rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-muted-foreground/40 rounded-full"
                                  style={{ width: `${requiredNormalized}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-muted-foreground w-8 text-right">{requiredNormalized}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground w-16">{t('recruit.report.shown')}</span>
                              <div className="flex-1 h-1.5 bg-accent rounded-full overflow-hidden">
                                <div
                                  className={cn(
                                    'h-full rounded-full',
                                    demonstrated >= requiredNormalized ? 'bg-success' : 'bg-destructive',
                                  )}
                                  style={{ width: `${demonstrated}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-muted-foreground w-8 text-right">{demonstrated}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* AI Justification */}
        {candidate.aiJustification && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <KeenIcon icon="artificial-intelligence" style="duotone" className="size-4 text-primary" />
                {t('recruit.report.detailed')}
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
  );
}
