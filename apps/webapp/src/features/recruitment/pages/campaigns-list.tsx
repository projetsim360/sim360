import { useState } from 'react';
import { Link } from 'react-router';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components/keenicons';
import { EmptyState } from '@/components/ui/empty-state';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCampaigns } from '../api/recruitment.api';
import { CampaignStatusBadge } from '../components/campaign-status-badge';

const STATUS_TABS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'Toutes' },
  { value: 'DRAFT', label: 'Brouillon' },
  { value: 'ACTIVE', label: 'Actives' },
  { value: 'CLOSED', label: 'Cloturees' },
  { value: 'ARCHIVED', label: 'Archivees' },
];

export default function CampaignsListPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const { data, isLoading, error } = useCampaigns(
    statusFilter !== 'all' ? { status: statusFilter } : undefined,
  );

  const campaigns = data?.data ?? [];

  return (
    <div className="container">
      <Toolbar>
        <ToolbarHeading title="Campagnes de recrutement" />
        <ToolbarActions>
          <Button variant="primary" size="sm" asChild>
            <Link to="/recruitment/campaigns/new">
              <KeenIcon icon="plus" style="duotone" className="size-4" />
              Nouvelle campagne
            </Link>
          </Button>
        </ToolbarActions>
      </Toolbar>
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-5">
          <TabsList variant="line">
            {STATUS_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-destructive text-sm">
                Erreur lors du chargement des campagnes.
              </p>
            </CardContent>
          </Card>
        ) : campaigns.length === 0 ? (
          <Card>
            <CardContent>
              <EmptyState
                icon="briefcase"
                title="Aucune campagne"
                description="Creez votre premiere campagne pour evaluer des candidats par simulation."
                action={{ label: 'Nouvelle campagne', href: '/recruitment/campaigns/new' }}
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titre</TableHead>
                      <TableHead>Poste</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-center">Candidats</TableHead>
                      <TableHead className="text-center">Termines</TableHead>
                      <TableHead className="text-right">Score moy.</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign) => (
                      <TableRow key={campaign.id} className="group">
                        <TableCell>
                          <Link
                            to={`/recruitment/campaigns/${campaign.id}`}
                            className="font-medium text-sm hover:text-primary transition-colors"
                          >
                            {campaign.title}
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {campaign.jobTitle}
                        </TableCell>
                        <TableCell>
                          <CampaignStatusBadge status={campaign.status} />
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          {campaign._count?.candidateResults ?? 0}
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          {campaign.completedCount ?? 0}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {campaign.averageScore !== undefined && campaign.averageScore !== null
                            ? (
                              <span className="font-medium">
                                {Math.round(campaign.averageScore)}%
                              </span>
                            )
                            : (
                              <span className="text-muted-foreground">-</span>
                            )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/recruitment/campaigns/${campaign.id}`}>
                              <KeenIcon icon="arrow-right" style="duotone" className="size-4" />
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
        )}
    </div>
  );
}
