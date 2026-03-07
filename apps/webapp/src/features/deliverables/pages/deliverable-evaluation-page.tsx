import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KeenIcon } from '@/components/keenicons';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import {
  useDeliverable,
  useDeliverableEvaluation,
  useDeliverableReference,
  useReviseDeliverable,
} from '../api/deliverables.api';
import { DeliverableStatusBadge } from '../components/deliverable-status-badge';
import { EvaluationCard } from '../components/evaluation-card';
import { ReferenceComparison } from '../components/reference-comparison';
import { cn } from '@/lib/utils';

function gradeColor(grade: string): string {
  switch (grade) {
    case 'A':
      return 'bg-success text-white';
    case 'B':
      return 'bg-primary text-white';
    case 'C':
      return 'bg-warning text-white';
    case 'D':
      return 'bg-orange-500 text-white';
    case 'F':
      return 'bg-destructive text-white';
    default:
      return 'bg-muted text-foreground';
  }
}

function scoreColor(score: number): string {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-primary';
  if (score >= 40) return 'text-warning';
  return 'text-destructive';
}

export default function DeliverableEvaluationPage() {
  const { id, delId } = useParams<{ id: string; delId: string }>();
  const navigate = useNavigate();
  const [showReference, setShowReference] = useState(false);

  const { data: deliverable, isLoading: isLoadingDel } = useDeliverable(
    id || '',
    delId || '',
  );
  const { data: evaluation, isLoading: isLoadingEval } =
    useDeliverableEvaluation(id || '', delId || '');
  const { data: referenceData, isLoading: isLoadingRef } =
    useDeliverableReference(id || '', delId || '', showReference);
  const reviseMutation = useReviseDeliverable(id || '');

  const isLoading = isLoadingDel || isLoadingEval;

  async function handleRevise() {
    if (!id || !delId) return;
    try {
      await reviseMutation.mutateAsync(delId);
      toast.success('Livrable ouvert en revision.');
      navigate(`/simulations/${id}/deliverables/${delId}/edit`);
    } catch (err) {
      toast.error(
        (err as Error).message || 'Impossible de reviser ce livrable.',
      );
    }
  }

  if (isLoading) {
    return (
      <div className="container-fixed">
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (!deliverable || !evaluation) {
    return (
      <div className="container-fixed">
        <Toolbar>
          <ToolbarHeading title="Evaluation" />
        </Toolbar>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive text-sm">
              Evaluation introuvable.
            </p>
            <Button variant="link" asChild className="mt-2">
              <Link
                to={id ? `/simulations/${id}/deliverables` : '/simulations'}
              >
                Retour aux livrables
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canRevise =
    deliverable.revisionNumber < deliverable.maxRevisions &&
    (deliverable.status === 'EVALUATED' || deliverable.status === 'REJECTED');

  return (
    <>
      <Toolbar>
        <ToolbarHeading title={deliverable.title} />
        <ToolbarActions>
          <DeliverableStatusBadge status={deliverable.status} />
          <Button variant="outline" size="sm" asChild>
            <Link to={`/simulations/${id}/deliverables`}>
              <KeenIcon icon="arrow-left" style="outline" className="size-4" />
              Retour
            </Link>
          </Button>
        </ToolbarActions>
      </Toolbar>

      <div className="container-fixed space-y-6">
        {/* Score header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              {/* Score circle */}
              <div className="text-center">
                <div
                  className={cn(
                    'w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold',
                    evaluation.score >= 80
                      ? 'bg-success/10 text-success'
                      : evaluation.score >= 60
                        ? 'bg-primary/10 text-primary'
                        : evaluation.score >= 40
                          ? 'bg-warning/10 text-warning'
                          : 'bg-destructive/10 text-destructive',
                  )}
                >
                  {evaluation.score}
                </div>
                <p className="text-xs text-muted-foreground mt-1">sur 100</p>
              </div>

              {/* Grade */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className={cn(
                      'inline-flex items-center justify-center w-10 h-10 rounded-lg text-lg font-bold',
                      gradeColor(evaluation.grade),
                    )}
                  >
                    {evaluation.grade}
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold">
                      {deliverable.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Revision {evaluation.revisionNumber} - Evaluation du{' '}
                      {new Date(evaluation.createdAt).toLocaleDateString(
                        'fr-FR',
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReference(!showReference)}
                >
                  <KeenIcon
                    icon="eye"
                    style="outline"
                    className="size-4"
                  />
                  {showReference
                    ? 'Masquer la reference'
                    : 'Voir l\'exemple de reference'}
                </Button>

                {canRevise ? (
                  <Button
                    size="sm"
                    onClick={handleRevise}
                    disabled={reviseMutation.isPending}
                  >
                    <KeenIcon
                      icon="pencil"
                      style="outline"
                      className="size-4"
                    />
                    Reviser
                  </Button>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button size="sm" disabled>
                          <KeenIcon
                            icon="pencil"
                            style="outline"
                            className="size-4"
                          />
                          Reviser
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {deliverable.status === 'VALIDATED'
                        ? 'Ce livrable est deja valide.'
                        : 'Nombre maximum de revisions atteint.'}
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reference comparison */}
        {showReference && (
          <>
            {isLoadingRef ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : referenceData?.referenceExample ? (
              <ReferenceComparison
                userContent={deliverable.content || ''}
                referenceContent={referenceData.referenceExample}
              />
            ) : (
              <Card>
                <CardContent className="py-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Aucun exemple de reference disponible pour ce livrable.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Evaluation sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EvaluationCard
            title="Points positifs"
            icon="check-circle"
            iconColor="text-success"
            items={evaluation.positives}
            emptyMessage="Aucun point positif identifie."
          />

          <EvaluationCard
            title="Points a ameliorer"
            icon="information-2"
            iconColor="text-warning"
            items={evaluation.improvements}
            emptyMessage="Aucun point a ameliorer."
          />

          <EvaluationCard
            title="Elements manquants"
            icon="cross-circle"
            iconColor="text-destructive"
            items={evaluation.missingElements}
            emptyMessage="Aucun element manquant."
          />

          <EvaluationCard
            title="Recommandations"
            icon="abstract-26"
            iconColor="text-primary"
            items={evaluation.recommendations}
            emptyMessage="Aucune recommandation."
          />
        </div>

        {/* Incorrect elements */}
        {evaluation.incorrectElements.length > 0 && (
          <EvaluationCard
            title="Elements incorrects"
            icon="cross"
            iconColor="text-destructive"
            items={evaluation.incorrectElements}
          />
        )}

        {/* PMI Coverage */}
        {(evaluation.pmiOutputsCovered.length > 0 ||
          evaluation.pmiOutputsMissing.length > 0) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <KeenIcon
                  icon="book"
                  style="solid"
                  className="size-4 text-primary"
                />
                Couverture des outputs PMI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Covered */}
                <div>
                  <h4 className="text-xs font-semibold text-success mb-2 flex items-center gap-1.5">
                    <KeenIcon
                      icon="check"
                      style="solid"
                      className="size-3"
                    />
                    Outputs couverts ({evaluation.pmiOutputsCovered.length})
                  </h4>
                  <ul className="space-y-1">
                    {evaluation.pmiOutputsCovered.map((output, i) => (
                      <li
                        key={i}
                        className="text-sm text-muted-foreground flex items-start gap-2"
                      >
                        <KeenIcon
                          icon="check"
                          style="outline"
                          className="size-3 shrink-0 mt-0.5 text-success"
                        />
                        {output}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Missing */}
                <div>
                  <h4 className="text-xs font-semibold text-destructive mb-2 flex items-center gap-1.5">
                    <KeenIcon
                      icon="cross"
                      style="solid"
                      className="size-3"
                    />
                    Outputs manquants ({evaluation.pmiOutputsMissing.length})
                  </h4>
                  {evaluation.pmiOutputsMissing.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">
                      Tous les outputs sont couverts.
                    </p>
                  ) : (
                    <ul className="space-y-1">
                      {evaluation.pmiOutputsMissing.map((output, i) => (
                        <li
                          key={i}
                          className="text-sm text-muted-foreground flex items-start gap-2"
                        >
                          <KeenIcon
                            icon="cross"
                            style="outline"
                            className="size-3 shrink-0 mt-0.5 text-destructive"
                          />
                          {output}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI-generated CR */}
        {evaluation.aiGeneratedCR && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                Compte rendu genere par l'IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap font-sans text-sm text-foreground">
                {evaluation.aiGeneratedCR}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
