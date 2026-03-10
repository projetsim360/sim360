import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KeenIcon } from '@/components/keenicons';
import { MarkdownContent } from '@/components/ui/markdown-content';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { simulationApi } from '../api/simulation.api';
import type { Simulation, RandomEvent } from '../types/simulation.types';

const SEVERITY_VARIANT: Record<string, 'info' | 'warning' | 'destructive'> = {
  LOW: 'info',
  MEDIUM: 'warning',
  HIGH: 'warning',
  CRITICAL: 'destructive',
};

const KPI_LABELS: Record<string, string> = {
  budget: 'Budget',
  schedule: 'Delai',
  quality: 'Qualite',
  teamMorale: 'Moral equipe',
  riskLevel: 'Niveau risque',
};

function kpiColor(value: number): string {
  if (value > 0) return 'text-success';
  if (value < 0) return 'text-destructive';
  return 'text-muted-foreground';
}

export default function RandomEventPage() {
  const { id, evtId } = useParams<{ id: string; evtId: string }>();
  const [sim, setSim] = useState<Simulation | null>(null);
  const [event, setEvent] = useState<RandomEvent | null>(null);
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
        const evt = data.randomEvents?.find((e: RandomEvent) => e.id === evtId);
        if (evt) {
          setEvent(evt);
          if (evt.selectedOption !== null) {
            setSelectedOption(evt.selectedOption);
            setSubmitted(true);
          }
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, evtId]);

  async function handleConfirm() {
    if (!id || !evtId || selectedOption === null) return;
    setSubmitting(true);
    try {
      await simulationApi.respondToEvent(id, evtId, selectedOption);
      const simData = await simulationApi.getSimulation(id);
      setSim(simData);
      const evt = simData.randomEvents?.find((e: RandomEvent) => e.id === evtId);
      if (evt) setEvent(evt);
      setSubmitted(true);
      toast.success('Reaction enregistree.');
    } catch (err: any) {
      setError(err.message);
      toast.error("Erreur lors de l'enregistrement de la reaction.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="container">
        <Skeleton className="h-10 w-56 mb-5" />
        <Skeleton className="h-28 rounded-lg mb-5" />
        <div className="space-y-3">
          <Skeleton className="h-5 w-40" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container">
        <Toolbar>
          <ToolbarHeading title="Evenement" />
        </Toolbar>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive text-sm">{error || 'Evenement introuvable.'}</p>
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
        <ToolbarHeading title="Evenement aleatoire" />
        <ToolbarActions>
          <Button variant="outline" asChild>
            <Link to={`/simulations/${id}`}>
              <KeenIcon icon="arrow-left" style="duotone" className="size-4" /> Retour a la simulation
            </Link>
          </Button>
        </ToolbarActions>
      </Toolbar>

      {/* Event context */}
      <Card className="mb-5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeenIcon icon="flash" style="duotone" className="size-4" />
            {event.title}
            <Badge variant={SEVERITY_VARIANT[event.severity]} appearance="light" size="sm">{event.severity}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MarkdownContent content={event.description} className="text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Type : {event.type} · Phase : {event.phaseOrder}
          </p>
        </CardContent>
      </Card>

      {/* Options */}
      {event.options.length > 0 && (
        <div className="space-y-3 mb-5">
          <h3 className="text-sm font-semibold">Reponses possibles</h3>
          {event.options.map((option, index) => {
            const isSelected = selectedOption === index;
            const isChosen = submitted && event.selectedOption === index;

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
                      <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
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
      )}

      {/* Confirm button */}
      {!submitted && event.options.length > 0 && (
        <div className="flex justify-end gap-3">
          <Button variant="outline" asChild>
            <Link to={`/simulations/${id}`}>
              Reporter
            </Link>
          </Button>
          <Button onClick={handleConfirm} disabled={selectedOption === null || submitting}>
            {submitting ? 'Validation...' : 'Confirmer la reponse'}
          </Button>
        </div>
      )}

      {/* Post-response result */}
      {submitted && (
        <div className="mt-5 text-center">
          <p className="text-sm text-success mb-3">Reponse enregistree.</p>
          <Button asChild>
            <Link to={`/simulations/${id}`}>
              Retour au tableau de bord
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
