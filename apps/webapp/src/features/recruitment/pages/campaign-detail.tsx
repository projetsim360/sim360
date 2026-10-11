import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { KeenIcon } from '@/components/keenicons';
import { EmptyState } from '@/components/ui/empty-state';
import { DisabledWithTooltip } from '@/components/ui/disabled-with-tooltip';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  useCampaign,
  useCampaignDashboard,
  useCandidates,
  usePublishCampaign,
  useCloseCampaign,
  useArchiveCampaign,
} from '../api/recruitment.api';
import { CampaignStatusBadge } from '../components/campaign-status-badge';
import { CandidateStatusBadge } from '../components/candidate-status-badge';
import { CampaignLinkShare } from '../components/campaign-link-share';
import { CampaignWorkflowStepper } from '../components/campaign-workflow-stepper';
import type { CandidateResult } from '../types/recruitment.types';
import type { AppMessageKey } from '@/i18n/app/messages';
import { useTv } from '@/i18n/app/use-t';
import { useAppLocale } from '@/providers/locale-provider';
import { useT } from '@/i18n/app/use-t';

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-4">
        <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', color)}>
          <KeenIcon icon={icon} style="duotone" className="size-5" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

const SORT_OPTIONS = [
  { value: 'globalScore', label: 'valo.overallScore' as AppMessageKey },
  { value: 'hardSkillsScore', label: 'recruit.hardSkills' as AppMessageKey },
  { value: 'softSkillsScore', label: 'recruit.softSkills' as AppMessageKey },
  { value: 'reliabilityScore', label: 'recruit.reliability' as AppMessageKey },
  { value: 'adaptabilityScore', label: 'recruit.adaptability' as AppMessageKey },
  { value: 'leadershipScore', label: 'recruit.leadership' as AppMessageKey },
] as const;

type SortKey = (typeof SORT_OPTIONS)[number]['value'];

function sortCandidates(candidates: CandidateResult[], sortBy: SortKey): CandidateResult[] {
  return [...candidates].sort((a, b) => {
    const valA = a[sortBy] ?? -1;
    const valB = b[sortBy] ?? -1;
    return (valB as number) - (valA as number);
  });
}

export default function CampaignDetailPage() {
  const tv = useTv();
  const { intlLocale } = useAppLocale();
  const t = useT();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sortBy, setSortBy] = useState<SortKey>('globalScore');

  const { data: campaign, isLoading: loadingCampaign } = useCampaign(id!);
  const { data: dashboard, isLoading: loadingDashboard } = useCampaignDashboard(id!);
  const { data: candidatesData } = useCandidates(id!);

  const publishMutation = usePublishCampaign();
  const closeMutation = useCloseCampaign();
  const archiveMutation = useArchiveCampaign();

  const candidates = candidatesData?.data ?? [];
  const sortedCandidates = sortCandidates(candidates, sortBy);

  const handlePublish = async () => {
    try {
      await publishMutation.mutateAsync(id!);
      toast.success(t('recruit.detail.published'));
    } catch {
      toast.error(t('recruit.detail.publishError'));
    }
  };

  const handleClose = async () => {
    try {
      await closeMutation.mutateAsync(id!);
      toast.success(t('recruit.detail.closed'));
    } catch {
      toast.error(t('recruit.detail.closeError'));
    }
  };

  const handleArchive = async () => {
    try {
      await archiveMutation.mutateAsync(id!);
      toast.success(t('recruit.detail.archived'));
    } catch {
      toast.error(t('recruit.detail.archiveError'));
    }
  };

  if (loadingCampaign) {
    return (
      <div className="container">
        <Toolbar>
          <ToolbarHeading title={t('mentoring.loading')} />
        </Toolbar>
        <Skeleton className="h-12 rounded-lg mb-5" />
        <Skeleton className="h-16 rounded-lg mb-5" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container">
        <Toolbar>
          <ToolbarHeading title={t('recruit.join.notFound')} />
        </Toolbar>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground text-sm">{t('recruit.detail.notExist')}</p>
            <Button variant="primary" size="sm" className="mt-4" asChild>
              <Link to="/recruitment/campaigns">{t('recruit.detail.backToCampaigns')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // US-8.7: max candidates progress
  const candidateCount = campaign._count?.candidateResults ?? 0;
  const maxCandidates = campaign.maxCandidates;
  const fillPercent = maxCandidates ? Math.min((candidateCount / maxCandidates) * 100, 100) : null;
  const isAlmostFull = fillPercent !== null && fillPercent >= 80 && fillPercent < 100;
  const isFull = fillPercent !== null && fillPercent >= 100;

  return (
    <div className="container">
      <Toolbar>
        <ToolbarHeading title={campaign.title} />
        <ToolbarActions>
          <CampaignStatusBadge status={campaign.status} />
          {/* US-8.7: capacity badges */}
          {isFull && (
            <Badge variant="destructive" appearance="light" size="sm">
              {t('recruit.join.full')}
            </Badge>
          )}
          {isAlmostFull && (
            <Badge variant="warning" appearance="light" size="sm">
              {t('recruit.detail.almostFull')}
            </Badge>
          )}
          <DisabledWithTooltip
            disabled={campaign.status !== 'ACTIVE'}
            reason={campaign.status === 'DRAFT' ? t('recruit.detail.publishForShortlist') : t('recruit.detail.notActive')}
          >
            <Button variant="outline" size="sm" asChild={campaign.status === 'ACTIVE'}>
              {campaign.status === 'ACTIVE' ? (
                <Link to={`/recruitment/campaigns/${id}/shortlist`}>
                  <KeenIcon icon="star" style="duotone" className="size-4" />
                  {t('recruit.shortlist')}
                </Link>
              ) : (
                <>
                  <KeenIcon icon="star" style="duotone" className="size-4" />
                  {t('recruit.shortlist')}
                </>
              )}
            </Button>
          </DisabledWithTooltip>
          <Button variant="outline" size="sm" asChild>
            <Link to="/recruitment/campaigns">
              <KeenIcon icon="arrow-left" style="duotone" className="size-4" />
              {t('common.back')}
            </Link>
          </Button>
        </ToolbarActions>
      </Toolbar>
        {/* Workflow stepper */}
        <div className="mb-5">
          <CampaignWorkflowStepper campaign={campaign} />
        </div>

        {/* Share link for active campaigns, visible in DRAFT with message */}
        {(campaign.status === 'ACTIVE' || campaign.status === 'DRAFT') && (
          <Card className="mb-5">
            <CardContent className="py-4">
              <div className="flex items-center gap-3 mb-2">
                <KeenIcon icon="share" style="duotone" className="size-4 text-primary" />
                <span className="text-sm font-medium">{t('recruit.detail.applyLink')}</span>
              </div>
              {campaign.status === 'ACTIVE' && campaign.slug ? (
                <CampaignLinkShare slug={campaign.slug} />
              ) : (
                <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
                  <KeenIcon icon="information-2" style="duotone" className="size-4 text-muted-foreground shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    {t('recruit.detail.publishForLink')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* US-8.7: Max candidates progress bar */}
        {maxCandidates && (
          <Card className="mb-5">
            <CardContent className="py-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <KeenIcon icon="people" style="duotone" className="size-4 text-primary" />
                  {t('recruit.col.candidates')}
                </span>
                <span className="text-sm font-bold">
                  {candidateCount} / {maxCandidates} candidats
                </span>
              </div>
              <Progress
                value={fillPercent ?? 0}
                className={cn(
                  'h-2.5',
                  isFull && '[&>div]:bg-destructive',
                  isAlmostFull && '[&>div]:bg-warning',
                )}
              />
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList variant="line" className="mb-5">
            <TabsTrigger value="dashboard">
              <KeenIcon icon="chart-simple" style="duotone" className="size-4" />
              {t('recruit.detail.dashboard')}
            </TabsTrigger>
            <TabsTrigger value="candidates">
              <KeenIcon icon="people" style="duotone" className="size-4" />
              {t('recruit.col.candidates')}
            </TabsTrigger>
            <TabsTrigger value="settings">
              <KeenIcon icon="setting-2" style="duotone" className="size-4" />
              {t('recruit.wizard.settings')}
            </TabsTrigger>
          </TabsList>

          {/* Dashboard tab - US-8.9 */}
          <TabsContent value="dashboard">
            {loadingDashboard ? (
              <div className="space-y-5">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-lg" />
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Skeleton className="h-48 rounded-lg" />
                  <Skeleton className="h-48 rounded-lg" />
                </div>
              </div>
            ) : dashboard ? (
              <div className="space-y-5">
                {/* KPI summary cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  <StatCard label={t('recruit.detail.total')} value={dashboard.totalCandidates} icon="people" color="bg-primary/10 text-primary" />
                  <StatCard label={t('recruit.candidateStatus.PENDING')} value={dashboard.pending} icon="time" color="bg-warning/10 text-warning" />
                  <StatCard label={t('recruit.candidateStatus.IN_PROGRESS')} value={dashboard.inProgress} icon="loading" color="bg-info/10 text-info" />
                  <StatCard label={t('recruit.col.completed')} value={dashboard.completed} icon="check-circle" color="bg-success/10 text-success" />
                  <StatCard label={t('recruit.detail.abandoned')} value={dashboard.abandoned} icon="cross-circle" color="bg-destructive/10 text-destructive" />
                  <StatCard
                    label={t('trainer.avgScore')}
                    value={dashboard.averageScore !== null ? `${Math.round(dashboard.averageScore)}%` : '-'}
                    icon="medal-star"
                    color="bg-primary/10 text-primary"
                  />
                </div>

                {/* Completion rate and average score */}
                {dashboard.totalCandidates > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">{t('recruit.detail.completionRate')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col items-center gap-3">
                          <div
                            className={cn(
                              'w-20 h-20 rounded-full border-4 flex items-center justify-center',
                              dashboard.completionRate >= 70
                                ? 'border-success'
                                : dashboard.completionRate >= 40
                                  ? 'border-warning'
                                  : 'border-destructive',
                            )}
                          >
                            <span className="text-xl font-bold">{Math.round(dashboard.completionRate)}%</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {t('recruit.detail.completedOf', { done: dashboard.completed, total: dashboard.totalCandidates })}
                          </p>
                          <Progress value={dashboard.completionRate} className="h-2.5 w-full" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">{t('trainer.avgScore')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col items-center gap-3">
                          <div
                            className={cn(
                              'w-20 h-20 rounded-full border-4 flex items-center justify-center',
                              (dashboard.averageScore ?? 0) >= 70
                                ? 'border-success'
                                : (dashboard.averageScore ?? 0) >= 40
                                  ? 'border-warning'
                                  : 'border-muted',
                            )}
                          >
                            <span className="text-xl font-bold">
                              {dashboard.averageScore !== null ? Math.round(dashboard.averageScore) : '-'}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {dashboard.averageScore !== null ? t('evaluation.outOf100') : t('recruit.detail.noResult')}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground text-sm">{t('recruit.detail.noData')}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Candidates tab - US-8.10 + US-10.6 */}
          <TabsContent value="candidates">
            {candidates.length === 0 ? (
              <Card>
                <CardContent>
                  <EmptyState
                    icon="people"
                    title={t('recruit.detail.noCandidates')}
                    description={
                      campaign.status === 'DRAFT'
                        ? t('recruit.detail.emptyDraft')
                        : t('recruit.detail.emptyActive')
                    }
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* US-10.6: Sort by competence */}
                <div className="flex items-center justify-end gap-2">
                  <span className="text-sm text-muted-foreground">{t('recruit.detail.sortBy')}</span>
                  <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortKey)}>
                    <SelectTrigger className="w-full sm:w-[180px] h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {t(opt.label)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('recruit.candidate')}</TableHead>
                            <TableHead>{t('actions.statusLabel')}</TableHead>
                            <TableHead className="text-center">{t('recruit.detail.phase')}</TableHead>
                            <TableHead className="text-center">{t('recruit.detail.abandonPhase')}</TableHead>
                            <TableHead className="text-right">{t('recruit.score')}</TableHead>
                            <TableHead className="text-right">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-help">{t('recruit.match')}</span>
                                </TooltipTrigger>
                                <TooltipContent variant="light" className="max-w-[280px]">
                                  {t('recruit.report.matchDesc')}
                                </TooltipContent>
                              </Tooltip>
                            </TableHead>
                            <TableHead className="text-right">{t('recruit.detail.start')}</TableHead>
                            <TableHead className="text-right">{t('recruit.detail.end')}</TableHead>
                            <TableHead className="text-right">{t('recruit.col.actions')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sortedCandidates.map((candidate) => (
                            <TableRow
                              key={candidate.id}
                              className="cursor-pointer hover:bg-accent/50"
                              onClick={() =>
                                navigate(`/recruitment/campaigns/${id}/candidates/${candidate.id}`)
                              }
                            >
                              <TableCell>
                                <div>
                                  <p className="text-sm font-medium">
                                    {candidate.user
                                      ? `${candidate.user.firstName} ${candidate.user.lastName}`
                                      : t('recruit.detail.unknown')}
                                  </p>
                                  {candidate.user && (
                                    <p className="text-sm text-muted-foreground">{candidate.user.email}</p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <CandidateStatusBadge status={candidate.status} />
                              </TableCell>
                              <TableCell className="text-center text-sm">
                                {candidate.currentPhase ?? '-'}
                              </TableCell>
                              <TableCell className="text-center text-sm">
                                {candidate.status === 'ABANDONED' && candidate.abandonedPhase
                                  ? (
                                    <Badge variant="destructive" appearance="light" size="sm">
                                      {t('recruit.detail.phaseN', { n: candidate.abandonedPhase })}
                                    </Badge>
                                  )
                                  : '-'}
                              </TableCell>
                              <TableCell className="text-right text-sm font-medium">
                                {candidate.globalScore !== undefined && candidate.globalScore !== null
                                  ? `${Math.round(candidate.globalScore)}%`
                                  : '-'}
                              </TableCell>
                              <TableCell className="text-right text-sm">
                                {candidate.matchPercentage !== undefined && candidate.matchPercentage !== null
                                  ? `${Math.round(candidate.matchPercentage)}%`
                                  : '-'}
                              </TableCell>
                              <TableCell className="text-right text-xs text-muted-foreground">
                                {candidate.startedAt
                                  ? new Date(candidate.startedAt).toLocaleDateString(intlLocale)
                                  : '-'}
                              </TableCell>
                              <TableCell className="text-right text-xs text-muted-foreground">
                                {candidate.completedAt
                                  ? new Date(candidate.completedAt).toLocaleDateString(intlLocale)
                                  : '-'}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  asChild
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Link to={`/recruitment/campaigns/${id}/candidates/${candidate.id}`}>
                                    <KeenIcon icon="eye" style="duotone" className="size-4" />
                                  </Link>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Settings tab */}
          <TabsContent value="settings">
            <div className="space-y-5">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">{t('recruit.detail.info')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-muted-foreground">{t('recruit.col.job')}</span>
                      <p className="font-medium">{campaign.jobTitle}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t('recruit.form.experience')}</span>
                      <p className="font-medium">{tv('recruit.level', campaign.experienceLevel)}</p>
                    </div>
                    <div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-muted-foreground cursor-help">{t('recruit.wizard.culture')}</span>
                        </TooltipTrigger>
                        <TooltipContent variant="light" className="max-w-[300px]">
                          {tv('recruit.cultureHint', campaign.culture, t('recruit.cultureHint.default'))}
                        </TooltipContent>
                      </Tooltip>
                      <p className="font-medium">{tv('recruit.culture', campaign.culture)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t('recruit.form.maxCandidatesShort')}</span>
                      <p className="font-medium">{campaign.maxCandidates ?? t('recruit.form.unlimited')}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('onboarding.custom.description')}</span>
                    <p className="mt-1 whitespace-pre-wrap">{campaign.jobDescription}</p>
                  </div>
                  {campaign.requiredSkills.length > 0 && (
                    <div>
                      <span className="text-muted-foreground">{t('recruit.wizard.skills')}</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {campaign.requiredSkills.map((s, i) => (
                          <Tooltip key={i}>
                            <TooltipTrigger asChild>
                              <Badge variant="primary" appearance="light" size="sm" className="cursor-help">
                                {s.skill} ({s.weight}/10)
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent variant="light" className="max-w-[240px]">
                              Poids : {s.weight}/10. 1 = peu important, 10 = critique pour le poste.
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">{t('recruit.col.actions')}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  {campaign.status === 'DRAFT' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="primary" size="sm">
                          <KeenIcon icon="rocket" style="duotone" className="size-4" />
                          {t('recruit.detail.publish')}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('recruit.detail.publishQ')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('recruit.detail.publishConfirm')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                          <AlertDialogAction onClick={handlePublish}>{t('recruit.step.publish')}</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  {campaign.status === 'ACTIVE' ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <KeenIcon icon="lock" style="duotone" className="size-4" />
                          {t('recruit.detail.close')}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('recruit.detail.closeQ')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('recruit.detail.closeConfirm')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                          <AlertDialogAction onClick={handleClose}>{t('recruit.step.close')}</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : campaign.status === 'DRAFT' ? (
                    <DisabledWithTooltip disabled reason={t('recruit.detail.afterPublish')}>
                      <Button variant="destructive" size="sm">
                        <KeenIcon icon="lock" style="duotone" className="size-4" />
                        {t('recruit.detail.close')}
                      </Button>
                    </DisabledWithTooltip>
                  ) : null}

                  {campaign.status === 'CLOSED' ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <KeenIcon icon="archive" style="duotone" className="size-4" />
                          {t('emails.archive')}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('recruit.detail.archiveQ')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('recruit.detail.archiveConfirm')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                          <AlertDialogAction onClick={handleArchive}>{t('emails.archive')}</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (campaign.status === 'ACTIVE' || campaign.status === 'DRAFT') ? (
                    <DisabledWithTooltip disabled reason={t('recruit.detail.closeFirst')}>
                      <Button variant="outline" size="sm">
                        <KeenIcon icon="archive" style="duotone" className="size-4" />
                        {t('emails.archive')}
                      </Button>
                    </DisabledWithTooltip>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
    </div>
  );
}
