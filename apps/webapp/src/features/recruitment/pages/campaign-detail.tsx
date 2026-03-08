import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
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
import type { CandidateResult } from '../types/recruitment.types';

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-4">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', color)}>
          <KeenIcon icon={icon} style="outline" className="size-5" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

const SORT_OPTIONS = [
  { value: 'globalScore', label: 'Score global' },
  { value: 'hardSkillsScore', label: 'Hard Skills' },
  { value: 'softSkillsScore', label: 'Soft Skills' },
  { value: 'reliabilityScore', label: 'Fiabilite' },
  { value: 'adaptabilityScore', label: 'Adaptabilite' },
  { value: 'leadershipScore', label: 'Leadership' },
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
      toast.success('Campagne publiee avec succes');
    } catch {
      toast.error('Erreur lors de la publication');
    }
  };

  const handleClose = async () => {
    try {
      await closeMutation.mutateAsync(id!);
      toast.success('Campagne cloturee');
    } catch {
      toast.error('Erreur lors de la cloture');
    }
  };

  const handleArchive = async () => {
    try {
      await archiveMutation.mutateAsync(id!);
      toast.success('Campagne archivee');
    } catch {
      toast.error("Erreur lors de l'archivage");
    }
  };

  if (loadingCampaign) {
    return (
      <div className="container">
        <Toolbar>
          <ToolbarHeading title="Chargement..." />
        </Toolbar>
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container">
        <Toolbar>
          <ToolbarHeading title="Campagne introuvable" />
        </Toolbar>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground text-sm">Cette campagne n'existe pas.</p>
            <Button variant="primary" size="sm" className="mt-4" asChild>
              <Link to="/recruitment/campaigns">Retour aux campagnes</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // US-8.7: max candidates progress
  const candidateCount = campaign._count?.candidates ?? 0;
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
              Campagne complete
            </Badge>
          )}
          {isAlmostFull && (
            <Badge variant="warning" appearance="light" size="sm">
              Bientot complet
            </Badge>
          )}
          {campaign.status === 'ACTIVE' && (
            <Button variant="outline" size="sm" asChild>
              <Link to={`/recruitment/campaigns/${id}/shortlist`}>
                <KeenIcon icon="star" style="outline" className="size-4" />
                Shortlist
              </Link>
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link to="/recruitment/campaigns">
              <KeenIcon icon="arrow-left" style="outline" className="size-4" />
              Retour
            </Link>
          </Button>
        </ToolbarActions>
      </Toolbar>
        {/* Share link for active campaigns */}
        {campaign.status === 'ACTIVE' && campaign.slug && (
          <Card className="mb-5">
            <CardContent className="py-4">
              <div className="flex items-center gap-3 mb-2">
                <KeenIcon icon="share" style="outline" className="size-4 text-primary" />
                <span className="text-sm font-medium">Lien de candidature</span>
              </div>
              <CampaignLinkShare slug={campaign.slug} />
            </CardContent>
          </Card>
        )}

        {/* US-8.7: Max candidates progress bar */}
        {maxCandidates && (
          <Card className="mb-5">
            <CardContent className="py-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <KeenIcon icon="people" style="outline" className="size-4 text-primary" />
                  Candidats
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
              <KeenIcon icon="chart-simple" style="outline" className="size-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="candidates">
              <KeenIcon icon="people" style="outline" className="size-4" />
              Candidats
            </TabsTrigger>
            <TabsTrigger value="settings">
              <KeenIcon icon="setting-2" style="outline" className="size-4" />
              Parametres
            </TabsTrigger>
          </TabsList>

          {/* Dashboard tab - US-8.9 */}
          <TabsContent value="dashboard">
            {loadingDashboard ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : dashboard ? (
              <div className="space-y-5">
                {/* KPI summary cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  <StatCard label="Total candidats" value={dashboard.totalCandidates} icon="people" color="bg-primary/10 text-primary" />
                  <StatCard label="En attente" value={dashboard.pending} icon="time" color="bg-accent text-muted-foreground" />
                  <StatCard label="En cours" value={dashboard.inProgress} icon="rocket" color="bg-info/10 text-info" />
                  <StatCard label="Termines" value={dashboard.completed} icon="check-circle" color="bg-success/10 text-success" />
                  <StatCard label="Abandonnes" value={dashboard.abandoned} icon="cross-circle" color="bg-destructive/10 text-destructive" />
                  <StatCard
                    label="Score moyen"
                    value={dashboard.averageScore !== null ? `${Math.round(dashboard.averageScore)}%` : '-'}
                    icon="chart-simple"
                    color="bg-warning/10 text-warning"
                  />
                </div>

                {/* Completion rate and average score */}
                {dashboard.totalCandidates > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Taux de completion</CardTitle>
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
                          <p className="text-xs text-muted-foreground">
                            {dashboard.completed} sur {dashboard.totalCandidates} candidats
                          </p>
                          <Progress value={dashboard.completionRate} className="h-2.5 w-full" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Score moyen</CardTitle>
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
                          <p className="text-xs text-muted-foreground">
                            {dashboard.averageScore !== null ? 'sur 100' : 'Aucun resultat'}
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
                  <p className="text-muted-foreground text-sm">Aucune donnee disponible.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Candidates tab - US-8.10 + US-10.6 */}
          <TabsContent value="candidates">
            {candidates.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
                  <KeenIcon icon="people" style="outline" className="size-8 text-muted-foreground" />
                  <p className="text-muted-foreground text-sm">Aucun candidat pour le moment.</p>
                  {campaign.status === 'DRAFT' && (
                    <p className="text-xs text-muted-foreground">
                      Publiez la campagne pour recevoir des candidatures.
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* US-10.6: Sort by competence */}
                <div className="flex items-center justify-end gap-2">
                  <span className="text-xs text-muted-foreground">Trier par competence :</span>
                  <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortKey)}>
                    <SelectTrigger className="w-[180px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
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
                            <TableHead>Candidat</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-center">Phase</TableHead>
                            <TableHead className="text-center">Phase d'abandon</TableHead>
                            <TableHead className="text-right">Score</TableHead>
                            <TableHead className="text-right">Match</TableHead>
                            <TableHead className="text-right">Debut</TableHead>
                            <TableHead className="text-right">Fin</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
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
                                      : 'Candidat inconnu'}
                                  </p>
                                  {candidate.user && (
                                    <p className="text-xs text-muted-foreground">{candidate.user.email}</p>
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
                                      Phase {candidate.abandonedPhase}
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
                                  ? new Date(candidate.startedAt).toLocaleDateString('fr-FR')
                                  : '-'}
                              </TableCell>
                              <TableCell className="text-right text-xs text-muted-foreground">
                                {candidate.completedAt
                                  ? new Date(candidate.completedAt).toLocaleDateString('fr-FR')
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
                                    <KeenIcon icon="eye" style="outline" className="size-4" />
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
                  <CardTitle className="text-sm">Informations de la campagne</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-muted-foreground">Poste</span>
                      <p className="font-medium">{campaign.jobTitle}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Experience</span>
                      <p className="font-medium">{campaign.experienceLevel}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Culture</span>
                      <p className="font-medium">{campaign.culture}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Max candidats</span>
                      <p className="font-medium">{campaign.maxCandidates ?? 'Illimite'}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Description</span>
                    <p className="mt-1 whitespace-pre-wrap">{campaign.jobDescription}</p>
                  </div>
                  {campaign.requiredSkills.length > 0 && (
                    <div>
                      <span className="text-muted-foreground">Competences</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {campaign.requiredSkills.map((s, i) => (
                          <Badge key={i} variant="primary" appearance="light" size="sm">
                            {s.skill} ({s.weight}/10)
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  {campaign.status === 'DRAFT' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="primary" size="sm">
                          <KeenIcon icon="rocket" style="outline" className="size-4" />
                          Publier la campagne
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Publier la campagne ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            La campagne sera accessible via un lien public.
                            Les candidats pourront commencer leur evaluation.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={handlePublish}>Publier</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  {campaign.status === 'ACTIVE' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <KeenIcon icon="lock" style="outline" className="size-4" />
                          Cloturer la campagne
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cloturer la campagne ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Plus aucun candidat ne pourra s'inscrire.
                            Les evaluations en cours pourront se terminer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={handleClose}>Cloturer</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  {campaign.status === 'CLOSED' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <KeenIcon icon="archive" style="outline" className="size-4" />
                          Archiver
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Archiver la campagne ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            La campagne sera deplacee dans les archives.
                            Les donnees resteront consultables.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={handleArchive}>Archiver</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
    </div>
  );
}
