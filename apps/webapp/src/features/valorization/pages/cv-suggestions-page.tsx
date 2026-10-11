import { useParams, Link } from 'react-router';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components/keenicons';
import { toast } from 'sonner';
import { useCvSuggestions } from '../api/valorization.api';
import { useT } from '@/i18n/app/use-t';

function CopyButton({ text }: { text: string }) {
  const t = useT();
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    toast.success(t('valo.copiedShort'));
  };

  return (
    <Button variant="ghost" size="sm" mode="icon" aria-label={t('valo.copy')} onClick={handleCopy}>
      <KeenIcon icon="copy" style="duotone" className="text-sm" />
    </Button>
  );
}

export default function CvSuggestionsPage() {
  const t = useT();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useCvSuggestions(id!);

  if (isLoading) {
    return (
      <div className="container">
        <Toolbar>
          <ToolbarHeading title={t('valo.cv.title')} />
        </Toolbar>
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container">
        <Toolbar>
          <ToolbarHeading title={t('valo.cv.title')} />
        </Toolbar>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-destructive">
              {t('valo.cv.loadError')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container space-y-5">
      <Toolbar>
        <ToolbarHeading title={t('valo.cv.title')} />
        <ToolbarActions>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/simulations/${id}/debriefing`}>
              <KeenIcon icon="chart" style="duotone" className="text-sm" />
              {t('valo.seeDebrief')}
            </Link>
          </Button>
        </ToolbarActions>
      </Toolbar>
        {/* Experience lines */}
        {data.experienceLines && data.experienceLines.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeenIcon icon="briefcase" style="duotone" className="text-base text-primary" />
                {t('valo.cv.lines')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.experienceLines.map((line, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-muted rounded-lg"
                  >
                    <p className="flex-1 text-sm text-foreground">{line}</p>
                    <CopyButton text={line} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Skills to highlight */}
        {data.skillsToHighlight && data.skillsToHighlight.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeenIcon icon="award" style="duotone" className="text-base text-primary" />
                {t('valo.cv.skills')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.skillsToHighlight.map((skill, index) => (
                  <Badge key={index} variant="primary" appearance="light" size="lg">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* First CV for zero-experience profiles (US-7.9) */}
        {(data.firstCvDraft || data.cvDraft) && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <CardTitle className="flex items-center gap-2">
                  <KeenIcon icon="document" style="duotone" className="text-base text-primary" />
                  {t('valo.cv.first')}
                </CardTitle>
                <CopyButton text={data.firstCvDraft || data.cvDraft || ''} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 bg-muted rounded-lg">
                <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                  {data.firstCvDraft || data.cvDraft}
                </pre>
              </div>
              <div className="flex items-start gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <KeenIcon icon="information-2" style="duotone" className="text-sm text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-primary">
                  {t('valo.cv.disclaimer')}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-center gap-3 pb-5">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/simulations/${id}/debriefing`}>
              <KeenIcon icon="arrow-left" style="duotone" className="text-sm" />
              {t('valo.backToDebrief')}
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/profile/badges">
              <KeenIcon icon="award" style="duotone" className="text-sm" />
              {t('menu.myBadges')}
            </Link>
          </Button>
        </div>
    </div>
  );
}
