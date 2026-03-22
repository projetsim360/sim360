import { Toolbar, ToolbarHeading } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useMyBadges } from '../api/valorization.api';
import { BadgeCard } from '../components/badge-card';

export default function BadgesPage() {
  const { data: badges, isLoading, error } = useMyBadges();

  if (isLoading) {
    return (
      <div className="container-fixed space-y-5">
        <Toolbar>
          <ToolbarHeading>
            <h1 className="text-xl font-medium text-gray-900">Mes badges</h1>
            <p className="text-sm text-gray-700">Vos badges de competence obtenus</p>
          </ToolbarHeading>
        </Toolbar>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-1.5 w-full rounded-full" />
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="size-10 rounded-full shrink-0" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fixed space-y-5">
        <Toolbar>
          <ToolbarHeading>
            <h1 className="text-xl font-medium text-gray-900">Mes badges</h1>
          </ToolbarHeading>
        </Toolbar>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-destructive">
              Impossible de charger vos badges.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-fixed space-y-5">
      <Toolbar>
        <ToolbarHeading>
          <h1 className="text-xl font-medium text-gray-900">Mes badges</h1>
          <p className="text-sm text-gray-700">
            {badges && badges.length > 0
              ? `${badges.length} badge(s) de competence`
              : 'Vos badges de competence obtenus'}
          </p>
        </ToolbarHeading>
      </Toolbar>

      {!badges || badges.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon="award"
              title="Aucun badge"
              description="Terminez une simulation pour obtenir votre premier badge de competence."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      )}
    </div>
  );
}
