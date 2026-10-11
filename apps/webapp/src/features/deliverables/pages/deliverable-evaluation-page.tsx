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
import { DisabledWithTooltip } from '@/components/ui/disabled-with-tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { toast } from 'sonner';
import {
  useDeliverable,
  useDeliverableEvaluation,
  useDeliverableReference,
  useReviseDeliverable,
} from '../api/deliverables.api';
import { DeliverableStatusBadge } from '../components/deliverable-status-badge';
import { DeliverableWorkflowStepper } from '../components/deliverable-workflow-stepper';
import { EvaluationCard } from '../components/evaluation-card';
import { ReferenceComparison } from '../components/reference-comparison';
import { cn } from '@/lib/utils';
import { getScoreTextClass } from '@/config/theme.constants';
import { useAppLocale } from '@/providers/locale-provider';
import { useT } from '@/i18n/app/use-t';

function gradeColor(grade: string): string {
  switch (grade) {
    case 'A':
      return 'bg-success text-white';
    case 'B':
      return 'bg-primary text-white';
    case 'C':
      return 'bg-warning text-white';
    case 'D':
      return 'bg-[var(--accent-brand)] text-white';
    case 'F':
      return 'bg-destructive text-white';
    default:
      return 'bg-muted text-foreground';
  }
}

export default function DeliverableEvaluationPage() {
  const { intlLocale } = useAppLocale();
  const t = useT();
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
      toast.success(t('evaluation.revisionOpened'));
      navigate(`/simulations/${id}/deliverables/${delId}/edit`);
    } catch (err) {
      toast.error(
        (err as Error).message || t('evaluation.reviseError'),
      );
    }
  }

  if (isLoading) {
    return (
      <div className="container">
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (!deliverable || !evaluation) {
    return (
      <div className="container">
        <Toolbar>
          <ToolbarHeading title={t('evaluation.title')} />
        </Toolbar>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive text-sm">
              {t('evaluation.notFound')}
            </p>
            <Button mode="link" asChild className="mt-2">
              <Link
                to={id ? `/simulations/${id}/deliverables` : '/simulations'}
              >
                {t('editor.backToList')}
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
    <div className="container">
      <Toolbar>
        <ToolbarHeading title={deliverable.title} />
        <ToolbarActions>
          <DeliverableStatusBadge status={deliverable.status} />
          <Button variant="outline" size="sm" asChild>
            <Link to={`/simulations/${id}/deliverables`}>
              <KeenIcon icon="arrow-left" style="duotone" className="size-4" />
              {t('common.back')}
            </Link>
          </Button>
        </ToolbarActions>
      </Toolbar>

      {/* Workflow stepper */}
      <div className="mb-5">
        <DeliverableWorkflowStepper status={deliverable.status} />
      </div>

      <div className="space-y-6">
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
                <p className="text-sm text-muted-foreground mt-1">{t('evaluation.outOf100')}</p>
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
                      {t('evaluation.revisionOn', { n: evaluation.revisionNumber, date: new Date(evaluation.createdAt).toLocaleDateString(intlLocale) })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="ml-auto flex items-center gap-3">
                <Badge variant="secondary" appearance="light" size="sm">
                  {t('evaluation.revisionOf', { n: deliverable.revisionNumber, max: deliverable.maxRevisions })}
                </Badge>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReference(!showReference)}
                >
                  <KeenIcon
                    icon="eye"
                    style="duotone"
                    className="size-4"
                  />
                  {showReference
                    ? t('evaluation.hideReference')
                    : t('evaluation.showReference')}
                </Button>

                {canRevise ? (
                  <DisabledWithTooltip disabled={reviseMutation.isPending} reason={t('evaluation.revising')}>
                    <Button
                      size="sm"
                      onClick={handleRevise}
                      disabled={reviseMutation.isPending}
                    >
                      <KeenIcon
                        icon="pencil"
                        style="duotone"
                        className="size-4"
                      />
                      {t('evaluation.revise')}
                    </Button>
                  </DisabledWithTooltip>
                ) : (
                  <DisabledWithTooltip
                    disabled
                    reason={
                      deliverable.status === 'VALIDATED'
                        ? t('evaluation.alreadyValidated')
                        : t('evaluation.maxRevisions')
                    }
                  >
                    <Button size="sm" disabled>
                      <KeenIcon
                        icon="pencil"
                        style="duotone"
                        className="size-4"
                      />
                      {t('evaluation.revise')}
                    </Button>
                  </DisabledWithTooltip>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Previous evaluations (collapsible) */}
        {deliverable.evaluations &&
          deliverable.evaluations.length > 1 && (
            <Collapsible>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <KeenIcon icon="time" style="duotone" className="size-4 text-muted-foreground" />
                      {t('evaluation.previous', { n: deliverable.evaluations.length - 1 })}
                    </CardTitle>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        <KeenIcon icon="arrow-down" style="duotone" className="size-3 mr-1" />
                        {t('evaluation.toggle')}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    {deliverable.evaluations
                      .filter((ev) => ev.id !== evaluation.id)
                      .sort((a, b) => b.revisionNumber - a.revisionNumber)
                      .map((prevEval) => (
                        <div
                          key={prevEval.id}
                          className="rounded-lg border border-border p-4 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  'inline-flex items-center justify-center w-7 h-7 rounded text-sm font-bold',
                                  gradeColor(prevEval.grade),
                                )}
                              >
                                {prevEval.grade}
                              </span>
                              <span className="text-sm font-medium">
                                {t('evaluation.revisionN', { n: prevEval.revisionNumber })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={cn('text-sm font-semibold', getScoreTextClass(prevEval.score))}>
                                {prevEval.score}/100
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {new Date(prevEval.createdAt).toLocaleDateString(intlLocale)}
                              </span>
                            </div>
                          </div>
                          {prevEval.recommendations.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-muted-foreground mb-1">
                                {t('evaluation.recommendationsColon')}
                              </p>
                              <ul className="space-y-0.5">
                                {prevEval.recommendations.map((rec, ri) => (
                                  <li key={ri} className="text-sm text-muted-foreground flex items-start gap-1.5">
                                    <KeenIcon
                                      icon="abstract-26"
                                      style="duotone"
                                      className="size-3 shrink-0 mt-0.5 text-primary"
                                    />
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {prevEval.improvements.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-muted-foreground mb-1">
                                {t('evaluation.improvementsColon')}
                              </p>
                              <ul className="space-y-0.5">
                                {prevEval.improvements.map((imp, ii) => (
                                  <li key={ii} className="text-sm text-muted-foreground flex items-start gap-1.5">
                                    <KeenIcon
                                      icon="information-2"
                                      style="duotone"
                                      className="size-3 shrink-0 mt-0.5 text-warning"
                                    />
                                    {imp}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}

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
                deliverableType={deliverable.type}
              />
            ) : (
              <Card>
                <CardContent className="py-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    {t('evaluation.noReference')}
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Evaluation sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EvaluationCard
            title={t('evaluation.positives')}
            icon="check-circle"
            iconColor="text-success"
            items={evaluation.positives}
            emptyMessage={t('evaluation.positivesEmpty')}
          />

          <EvaluationCard
            title={t('evaluation.improvements')}
            icon="information-2"
            iconColor="text-warning"
            items={evaluation.improvements}
            emptyMessage={t('evaluation.improvementsEmpty')}
          />

          <EvaluationCard
            title={t('evaluation.missing')}
            icon="cross-circle"
            iconColor="text-destructive"
            items={evaluation.missingElements}
            emptyMessage={t('evaluation.missingEmpty')}
          />

          <EvaluationCard
            title={t('evaluation.recommendations')}
            icon="abstract-26"
            iconColor="text-primary"
            items={evaluation.recommendations}
            emptyMessage={t('evaluation.recommendationsEmpty')}
          />
        </div>

        {/* Incorrect elements */}
        {evaluation.incorrectElements.length > 0 && (
          <EvaluationCard
            title={t('evaluation.incorrect')}
            icon="cross"
            iconColor="text-destructive"
            items={evaluation.incorrectElements}
          />
        )}

        {/* PMI Alignment */}
        {(evaluation.pmiOutputsCovered.length > 0 ||
          evaluation.pmiOutputsMissing.length > 0) && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <KeenIcon
                    icon="book"
                    style="duotone"
                    className="size-4 text-primary"
                  />
                  {t('evaluation.pmi')}
                </CardTitle>
                <Badge
                  variant={
                    evaluation.pmiOutputsMissing.length === 0
                      ? 'success'
                      : evaluation.pmiOutputsCovered.length > evaluation.pmiOutputsMissing.length
                        ? 'warning'
                        : 'destructive'
                  }
                  appearance="light"
                  size="sm"
                >
                  {t('evaluation.outputsCoveredRatio', { done: evaluation.pmiOutputsCovered.length, total: evaluation.pmiOutputsCovered.length + evaluation.pmiOutputsMissing.length })}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Covered */}
                <div>
                  <h4 className="text-sm font-semibold text-success mb-2 flex items-center gap-1.5">
                    <KeenIcon
                      icon="check-circle"
                      style="duotone"
                      className="size-3.5"
                    />
                    {t('evaluation.outputsCovered', { n: evaluation.pmiOutputsCovered.length })}
                  </h4>
                  <ul className="space-y-1.5">
                    {evaluation.pmiOutputsCovered.map((output, i) => (
                      <li
                        key={i}
                        className="text-sm text-foreground flex items-start gap-2"
                      >
                        <KeenIcon
                          icon="check-circle"
                          style="duotone"
                          className="size-4 shrink-0 mt-0.5 text-success"
                        />
                        {output}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Missing */}
                <div>
                  <h4 className="text-sm font-semibold text-destructive mb-2 flex items-center gap-1.5">
                    <KeenIcon
                      icon="cross-circle"
                      style="duotone"
                      className="size-3.5"
                    />
                    {t('evaluation.outputsMissing', { n: evaluation.pmiOutputsMissing.length })}
                  </h4>
                  {evaluation.pmiOutputsMissing.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                      {t('evaluation.allCovered')}
                    </p>
                  ) : (
                    <ul className="space-y-1.5">
                      {evaluation.pmiOutputsMissing.map((output, i) => (
                        <li
                          key={i}
                          className="text-sm text-foreground flex items-start gap-2"
                        >
                          <KeenIcon
                            icon="cross-circle"
                            style="duotone"
                            className="size-4 shrink-0 mt-0.5 text-destructive"
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
                {t('evaluation.autoMinutes')}
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
    </div>
  );
}
