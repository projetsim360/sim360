import { Toolbar, ToolbarHeading } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from '@/components/keenicons/icons';

export default function MeetingsListPage() {
  return (
    <div className="container">
      <Toolbar>
        <ToolbarHeading title="Réunions" />
      </Toolbar>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
          <Users className="size-10 text-muted-foreground/50" />
          <p className="text-muted-foreground text-sm">
            Module en cours de développement.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
