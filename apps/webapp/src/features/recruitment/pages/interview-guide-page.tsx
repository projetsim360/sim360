import { useParams, Link } from 'react-router';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { KeenIcon } from '@/components/keenicons';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
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
      <div className="container space-y-5">
        <Toolbar>
          <ToolbarHeading title="Guide d'entretien" />
        </Toolbar>
        <Skeleton className="h-16 rounded-lg" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !questions) {
    return (
      <div className="container">
        <Toolbar>
          <ToolbarHeading title="Guide d'entretien" />
        </Toolbar>
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
    );
  }

  return (
    <div className="container space-y-5">
      <Toolbar>
        <ToolbarHeading title={`Guide d'entretien - ${candidateName}`} />
        <ToolbarActions>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <KeenIcon icon="printer" style="duotone" className="size-4" />
            Imprimer
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/recruitment/campaigns/${id}/candidates/${candidateId}`}>
              <KeenIcon icon="arrow-left" style="duotone" className="size-4" />
              Retour au rapport
            </Link>
          </Button>
        </ToolbarActions>
      </Toolbar>
        {/* Header info */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <KeenIcon icon="message-text" style="duotone" className="size-4" />
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
                  <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                    Contexte
                  </p>
                  <p className="text-sm text-muted-foreground">{q.context}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wide">
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
            <CardContent>
              <EmptyState
                icon="question-2"
                title="Guide non disponible"
                description="Le guide d'entretien sera genere une fois que le candidat aura termine sa simulation."
              />
            </CardContent>
          </Card>
        )}
    </div>
  );
}
