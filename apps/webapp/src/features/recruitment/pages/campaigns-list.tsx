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
import type { AppMessageKey } from '@/i18n/app/messages';
import { useT } from '@/i18n/app/use-t';

const STATUS_TABS: Array<{ value: string; label: AppMessageKey }> = [
  { value: 'all', label: 'recruit.tab.all' },
  { value: 'DRAFT', label: 'recruit.tab.DRAFT' },
  { value: 'ACTIVE', label: 'recruit.tab.ACTIVE' },
  { value: 'CLOSED', label: 'recruit.tab.CLOSED' },
  { value: 'ARCHIVED', label: 'recruit.tab.ARCHIVED' },
];

export default function CampaignsListPage() {
  const t = useT();
  const [statusFilter, setStatusFilter] = useState('all');
  const { data, isLoading, error } = useCampaigns(
    statusFilter !== 'all' ? { status: statusFilter } : undefined,
  );

  const campaigns = data?.data ?? [];

  return (
    <div className="container">
      <Toolbar>
        <ToolbarHeading title={t('recruit.campaigns')} />
        <ToolbarActions>
          <Button variant="primary" size="sm" asChild>
            <Link to="/recruitment/campaigns/new">
              <KeenIcon icon="plus" style="duotone" className="size-4" />
              {t('recruit.newCampaign')}
            </Link>
          </Button>
        </ToolbarActions>
      </Toolbar>
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-5">
          <TabsList variant="line">
            {STATUS_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {t(tab.label)}
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
                {t('recruit.loadError')}
              </p>
            </CardContent>
          </Card>
        ) : campaigns.length === 0 ? (
          <Card>
            <CardContent>
              <EmptyState
                icon="briefcase"
                title={t('recruit.noCampaigns')}
                description={t('recruit.noCampaignsDesc')}
                action={{ label: t('recruit.newCampaign'), href: '/recruitment/campaigns/new' }}
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
                      <TableHead>{t('recruit.col.title')}</TableHead>
                      <TableHead>{t('recruit.col.job')}</TableHead>
                      <TableHead>{t('actions.statusLabel')}</TableHead>
                      <TableHead className="text-center">{t('recruit.col.candidates')}</TableHead>
                      <TableHead className="text-center">{t('recruit.col.completed')}</TableHead>
                      <TableHead className="text-right">{t('recruit.col.avgScore')}</TableHead>
                      <TableHead className="text-right">{t('recruit.col.actions')}</TableHead>
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
