import { useParams, Link } from 'react-router';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components/keenicons';
import { toast } from 'sonner';
import { useCvSuggestions } from '../api/valorization.api';

function CopyButton({ text }: { text: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    toast.success('Copie dans le presse-papiers');
  };

  return (
    <Button variant="ghost" size="sm" mode="icon" onClick={handleCopy}>
      <KeenIcon icon="copy" style="solid" className="text-sm" />
    </Button>
  );
}

export default function CvSuggestionsPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useCvSuggestions(id!);

  if (isLoading) {
    return (
      <>
        <Toolbar>
          <ToolbarHeading title="Suggestions pour votre CV" />
        </Toolbar>
        <div className="container-fixed">
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </div>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <Toolbar>
          <ToolbarHeading title="Suggestions pour votre CV" />
        </Toolbar>
        <div className="container-fixed">
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-destructive">
                Impossible de charger les suggestions CV.
              </p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Toolbar>
        <ToolbarHeading title="Suggestions pour votre CV" />
        <ToolbarActions>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/simulations/${id}/debriefing`}>
              <KeenIcon icon="chart" style="solid" className="text-sm" />
              Voir le debriefing
            </Link>
          </Button>
        </ToolbarActions>
      </Toolbar>

      <div className="container-fixed space-y-5">
        {/* Experience lines */}
        {data.experienceLines && data.experienceLines.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeenIcon icon="briefcase" style="solid" className="text-base text-primary" />
                Lignes a ajouter a votre CV
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.experienceLines.map((line, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-muted rounded-lg"
                  >
                    <p className="flex-1 text-sm text-gray-700">{line}</p>
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
                <KeenIcon icon="award" style="solid" className="text-base text-primary" />
                Competences a mettre en avant
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
                  <KeenIcon icon="document" style="solid" className="text-base text-primary" />
                  Votre premier CV
                </CardTitle>
                <CopyButton text={data.firstCvDraft || data.cvDraft || ''} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 bg-muted rounded-lg">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                  {data.firstCvDraft || data.cvDraft}
                </pre>
              </div>
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <KeenIcon icon="information-2" style="solid" className="text-sm text-blue-600 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700">
                  Ce CV est genere a partir de votre simulation. Personnalisez-le avant de l'utiliser.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-center gap-3 pb-5">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/simulations/${id}/debriefing`}>
              <KeenIcon icon="arrow-left" style="solid" className="text-sm" />
              Retour au debriefing
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/profile/badges">
              <KeenIcon icon="award" style="solid" className="text-sm" />
              Mes badges
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
