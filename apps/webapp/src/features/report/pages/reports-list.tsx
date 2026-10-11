import { Toolbar, ToolbarHeading } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent } from '@/components/ui/card';
import { FileBarChart } from '@/components/keenicons/icons';
import { useT } from '@/i18n/app/use-t';

export default function ReportsListPage() {
  const t = useT();
  return (
    <div className="container">
      <Toolbar>
        <ToolbarHeading title={t('menu.reports')} />
      </Toolbar>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
          <FileBarChart className="size-10 text-muted-foreground/50" />
          <p className="text-muted-foreground text-sm">
            {t('reports.wip')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
