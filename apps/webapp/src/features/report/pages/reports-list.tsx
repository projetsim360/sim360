import { Toolbar, ToolbarHeading } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent } from '@/components/ui/card';
import { FileBarChart } from '@/components/keenicons/icons';

export default function ReportsListPage() {
  return (
    <div className="container">
      <Toolbar>
        <ToolbarHeading title="Rapports" />
      </Toolbar>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
          <FileBarChart className="size-10 text-muted-foreground/50" />
          <p className="text-muted-foreground text-sm">
            Module en cours de développement.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
