import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { simulationApi } from '../api/simulation.api';
import type { Simulation, Decision } from '../types/simulation.types';

function kpiColor(value: number): string {
  if (value > 0) return 'text-green-600';
  if (value < 0) return 'text-red-600';
  return 'text-gray-500';
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
      const updated = await simulationApi.makeDecision(id, decId, selectedOption);
      // Reload to get impact
      const simData = await simulationApi.getSimulation(id);
      setSim(simData);
      const dec = simData.decisions?.find((d: Decision) => d.id === decId);
      if (dec) setDecision(dec);
      setSubmitted(true);
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
            <p className="text-red-600 text-sm">
              {error || 'Decision introuvable.'}
            </p>
            <Link
              to={id ? `/simulations/${id}` : '/simulations'}
              className="mt-3 inline-block text-sm text-primary hover:underline"
            >
              Retour a la simulation
            </Link>
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
          <Link
            to={`/simulations/${id}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            ← Retour a la simulation
          </Link>
        </ToolbarActions>
      </Toolbar>

      {/* Decision context */}
      <Card className="mb-5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🤔</span>
            {decision.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {decision.context}
          </p>
          {decision.timeLimitSeconds && !submitted && (
            <p className="mt-3 text-xs text-orange-600">
              ⏰ Limite de temps : {Math.round(decision.timeLimitSeconds / 60)} minutes
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
                  ? 'ring-2 ring-green-500 bg-green-50'
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
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected || isChosen
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    {(isSelected || isChosen) && (
                      <span className="text-xs">✓</span>
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
                                ? 'bg-green-50 text-green-600'
                                : (val as number) < 0
                                  ? 'bg-red-50 text-red-600'
                                  : 'bg-gray-50 text-gray-500'
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
          <Link
            to={`/simulations/${id}`}
            className="inline-flex items-center px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            Annuler
          </Link>
          <button
            onClick={handleConfirm}
            disabled={selectedOption === null || submitting}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {submitting ? (
              <>
                <span className="animate-spin">⏳</span>
                Validation...
              </>
            ) : (
              'Confirmer la decision'
            )}
          </button>
        </div>
      )}

      {/* Post-decision KPI impact */}
      {submitted && decision.kpiImpact && Object.keys(decision.kpiImpact).length > 0 && (
        <Card className="mt-5 border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-green-700">
              ✅ Impact de votre decision
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {Object.entries(decision.kpiImpact).map(([key, val]) => (
                <div key={key} className="text-center p-2 bg-white rounded-lg border border-green-200">
                  <p className="text-xs text-muted-foreground">{KPI_LABELS[key] || key}</p>
                  <p className={`text-lg font-bold ${kpiColor(val as number)}`}>
                    {(val as number) > 0 ? '+' : ''}{val as number}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Link
                to={`/simulations/${id}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Retour au tableau de bord
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {submitted && (!decision.kpiImpact || Object.keys(decision.kpiImpact).length === 0) && (
        <div className="mt-5 text-center">
          <p className="text-sm text-green-600 mb-3">✅ Decision enregistree.</p>
          <Link
            to={`/simulations/${id}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Retour au tableau de bord
          </Link>
        </div>
      )}
    </div>
  );
}
