import { useParams, Link } from 'react-router';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { KeenIcon } from '@/components/keenicons';
import { useInterviewGuide, useCandidateReport } from '../api/recruitment.api';

export default function InterviewGuidePage() {
  const { id, candidateId } = useParams<{ id: string; candidateId: string }>();
  const { data: questions, isLoading, error } = useInterviewGuide(id!, candidateId!);
  const { data: candidate } = useCandidateReport(id!, candidateId!);

  const candidateName = candidate?.user
    ? `${candidate.user.firstName} ${candidate.user.lastName}`
    : 'Candidat';

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <>
        <Toolbar>
          <ToolbarHeading title="Guide d'entretien" />
        </Toolbar>
        <div className="container-fixed flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </>
    );
  }

  if (error || !questions) {
    return (
      <>
        <Toolbar>
          <ToolbarHeading title="Guide d'entretien" />
        </Toolbar>
        <div className="container-fixed">
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-destructive text-sm">Impossible de charger le guide d'entretien.</p>
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link to={`/recruitment/campaigns/${id}/candidates/${candidateId}`}>
                  Retour au rapport
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Toolbar>
        <ToolbarHeading title={`Guide d'entretien - ${candidateName}`} />
        <ToolbarActions>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <KeenIcon icon="printer" style="outline" className="size-4" />
            Imprimer
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/recruitment/campaigns/${id}/candidates/${candidateId}`}>
              <KeenIcon icon="arrow-left" style="outline" className="size-4" />
              Retour au rapport
            </Link>
          </Button>
        </ToolbarActions>
      </Toolbar>

      <div className="container-fixed space-y-5">
        {/* Header info */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <KeenIcon icon="message-text" style="outline" className="size-4" />
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  Ce guide a ete genere par l'IA en se basant sur les resultats de la simulation
                  du candidat. Il propose des questions ciblees pour approfondir l'evaluation
                  lors d'un entretien en personne.
                </p>
                <p>
                  <strong>{questions.length} questions</strong> preparees pour {candidateName}.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <div className="space-y-4">
          {questions.map((q, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Badge variant="primary" appearance="light" size="sm">
                    Q{index + 1}
                  </Badge>
                  {q.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                    Contexte
                  </p>
                  <p className="text-sm text-muted-foreground">{q.context}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                    Insight attendu
                  </p>
                  <p className="text-sm text-muted-foreground">{q.expectedInsight}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {questions.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <KeenIcon icon="message-text" style="outline" className="size-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                Aucune question generee. Le candidat doit avoir termine sa simulation.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
