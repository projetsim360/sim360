import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KeenIcon } from '@/components/keenicons';
import { simulationApi } from '../api/simulation.api';
import { aiApi, type AiEvaluationResult } from '../api/ai.api';
import type { Simulation, Decision } from '../types/simulation.types';

function kpiColor(value: number): string {
  if (value > 0) return 'text-success';
  if (value < 0) return 'text-destructive';
  return 'text-muted-foreground';
}

const KPI_LABELS: Record<string, string> = {
  budget: 'Budget',
  schedule: 'Delai',
  quality: 'Qualite',
  teamMorale: 'Moral equipe',
  riskLevel: 'Niveau risque',
};

export default function DecisionPage() {
  const { id, decId } = useParams<{ id: string; decId: string }>();
  const navigate = useNavigate();
  const [sim, setSim] = useState<Simulation | null>(null);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AiEvaluationResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    simulationApi
      .getSimulation(id)
      .then((data) => {
        setSim(data);
        const dec = data.decisions?.find((d: Decision) => d.id === decId);
        if (dec) {
          setDecision(dec);
          if (dec.selectedOption !== null) {
            setSelectedOption(dec.selectedOption);
            setSubmitted(true);
            // Load AI analysis for already-submitted decision
            setAiLoading(true);
            aiApi
              .evaluateDecision(data.id, dec.id, dec.selectedOption)
              .then(setAiAnalysis)
              .catch(() => {})
              .finally(() => setAiLoading(false));
          }
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, decId]);

  async function handleConfirm() {
    if (!id || !decId || selectedOption === null) return;
    setSubmitting(true);
    try {
      await simulationApi.makeDecision(id, decId, selectedOption);
      // Reload to get impact
      const simData = await simulationApi.getSimulation(id);
      setSim(simData);
      const dec = simData.decisions?.find((d: Decision) => d.id === decId);
      if (dec) setDecision(dec);
      setSubmitted(true);

      // Trigger AI analysis (fail silently)
      setAiLoading(true);
      aiApi
        .evaluateDecision(id, decId, selectedOption)
        .then(setAiAnalysis)
        .catch(() => {})
        .finally(() => setAiLoading(false));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (error || !decision) {
    return (
      <div className="container">
        <Toolbar>
          <ToolbarHeading title="Decision" />
        </Toolbar>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive text-sm">
              {error || 'Decision introuvable.'}
            </p>
            <Button variant="link" asChild>
              <Link to={id ? `/simulations/${id}` : '/simulations'}>
                Retour a la simulation
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container">
      <Toolbar>
        <ToolbarHeading title="Decision" />
        <ToolbarActions>
          <Button variant="outline" asChild>
            <Link to={`/simulations/${id}`}>
              <KeenIcon icon="arrow-left" style="outline" className="size-4" /> Retour a la simulation
            </Link>
          </Button>
        </ToolbarActions>
      </Toolbar>

      {/* Decision context */}
      <Card className="mb-5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeenIcon icon="question-2" style="filled" className="size-4" />
            {decision.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {decision.context}
          </p>
          {decision.timeLimitSeconds && !submitted && (
            <p className="mt-3 text-xs text-warning">
              <KeenIcon icon="time" style="outline" className="size-3 inline" /> Limite de temps : {Math.round(decision.timeLimitSeconds / 60)} minutes
            </p>
          )}
        </CardContent>
      </Card>

      {/* Options */}
      <div className="space-y-3 mb-5">
        <h3 className="text-sm font-semibold">Options disponibles</h3>
        {decision.options.map((option, index) => {
          const isSelected = selectedOption === index;
          const isChosen = submitted && decision.selectedOption === index;

          return (
            <Card
              key={index}
              className={`cursor-pointer transition-all ${
                isChosen
                  ? 'ring-2 ring-success bg-success/10'
                  : isSelected
                    ? 'ring-2 ring-primary bg-primary/5'
                    : submitted
                      ? 'opacity-60'
                      : 'hover:shadow-md'
              }`}
              onClick={() => {
                if (!submitted) setSelectedOption(index);
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Radio circle */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      isChosen
                        ? 'border-success bg-success'
                        : isSelected
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground/30'
                    }`}
                  >
                    {(isSelected || isChosen) && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{option.label}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {option.description}
                    </p>
                    {/* Show KPI impact preview (before submission) */}
                    {!submitted && option.kpiImpact && Object.keys(option.kpiImpact).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(option.kpiImpact).map(([key, val]) => (
                          <span
                            key={key}
                            className={`text-[10px] px-1.5 py-0.5 rounded ${
                              (val as number) > 0
                                ? 'bg-success/10 text-success'
                                : (val as number) < 0
                                  ? 'bg-destructive/10 text-destructive'
                                  : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {KPI_LABELS[key] || key}: {(val as number) > 0 ? '+' : ''}{val as number}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Confirm button */}
      {!submitted && (
        <div className="flex justify-end gap-3">
          <Button variant="outline" asChild>
            <Link to={`/simulations/${id}`}>
              Annuler
            </Link>
          </Button>
          <Button onClick={handleConfirm} disabled={selectedOption === null || submitting}>
            {submitting ? (
              <>
                <span className="animate-spin inline-block"><KeenIcon icon="loading" style="outline" className="size-4" /></span>
                Validation...
              </>
            ) : (
              'Confirmer la decision'
            )}
          </Button>
        </div>
      )}

      {/* Post-decision KPI impact */}
      {submitted && decision.kpiImpact && Object.keys(decision.kpiImpact).length > 0 && (
        <Card className="mt-5 border-success/30 bg-success/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-success">
              <KeenIcon icon="check-circle" style="filled" className="size-4 text-success" /> Impact de votre decision
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {Object.entries(decision.kpiImpact).map(([key, val]) => (
                <div key={key} className="text-center p-2 bg-white rounded-lg border border-success/20">
                  <p className="text-xs text-muted-foreground">{KPI_LABELS[key] || key}</p>
                  <p className={`text-lg font-bold ${kpiColor(val as number)}`}>
                    {(val as number) > 0 ? '+' : ''}{val as number}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button asChild>
                <Link to={`/simulations/${id}`}>
                  Retour au tableau de bord
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {submitted && (!decision.kpiImpact || Object.keys(decision.kpiImpact).length === 0) && (
        <div className="mt-5 text-center">
          <p className="text-sm text-success mb-3">Decision enregistree.</p>
          <Button asChild>
            <Link to={`/simulations/${id}`}>
              Retour au tableau de bord
            </Link>
          </Button>
        </div>
      )}

      {/* AI Analysis section */}
      {submitted && aiLoading && (
        <Card className="mt-5 border-primary/20 bg-primary/5">
          <CardContent className="py-6 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2" />
            <p className="text-sm text-primary">Analyse IA en cours...</p>
          </CardContent>
        </Card>
      )}

      {submitted && aiAnalysis && (
        <Card className="mt-5 border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-primary">Analyse IA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiAnalysis.score !== undefined && (
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white ${
                  aiAnalysis.score >= 70 ? 'bg-success' : aiAnalysis.score >= 40 ? 'bg-warning' : 'bg-destructive'
                }`}>
                  {aiAnalysis.score}
                </div>
                <div>
                  <p className="text-sm font-medium">Score de la decision</p>
                  {aiAnalysis.scoreJustification && (
                    <p className="text-xs text-muted-foreground">{aiAnalysis.scoreJustification}</p>
                  )}
                </div>
              </div>
            )}
            <div>
              <h4 className="text-xs font-semibold text-primary mb-1">Coaching</h4>
              <p className="text-sm whitespace-pre-wrap">{aiAnalysis.coaching}</p>
            </div>
            {aiAnalysis.comparison && (
              <div>
                <h4 className="text-xs font-semibold text-primary mb-1">Comparaison avec l'optimal</h4>
                <p className="text-sm whitespace-pre-wrap">{aiAnalysis.comparison}</p>
              </div>
            )}
            {aiAnalysis.patternAnalysis && (
              <div className="border-t border-primary/20 pt-3">
                <h4 className="text-xs font-semibold text-primary mb-1">
                  Profil decisionnel : <span className="capitalize">{aiAnalysis.patternAnalysis.pattern === 'cautious' ? 'Prudent' : aiAnalysis.patternAnalysis.pattern === 'aggressive' ? 'Audacieux' : aiAnalysis.patternAnalysis.pattern === 'balanced' ? 'Equilibre' : 'Variable'}</span>
                  <span className="text-primary/60 font-normal ml-1">({aiAnalysis.patternAnalysis.confidence}%)</span>
                </h4>
                <p className="text-sm text-primary">{aiAnalysis.patternAnalysis.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
