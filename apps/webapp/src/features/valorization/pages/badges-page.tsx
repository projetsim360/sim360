import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent } from '@/components/ui/card';
import { KeenIcon } from '@/components/keenicons';
import { useMyBadges } from '../api/valorization.api';
import { BadgeCard } from '../components/badge-card';

export default function BadgesPage() {
  const { data: badges, isLoading, error } = useMyBadges();

  if (isLoading) {
    return (
      <div className="container">
        <Toolbar>
          <ToolbarHeading title="Mes badges" />
        </Toolbar>
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <Toolbar>
          <ToolbarHeading title="Mes badges" />
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
    <div className="container">
      <Toolbar>
        <ToolbarHeading title="Mes badges" />
        <ToolbarActions />
      </Toolbar>
        {!badges || badges.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
              <KeenIcon icon="award" style="solid" className="text-4xl text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Vous n'avez pas encore de badge. Terminez une simulation pour obtenir votre premier badge de competence.
              </p>
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
