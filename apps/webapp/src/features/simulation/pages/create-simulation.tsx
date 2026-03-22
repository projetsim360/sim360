import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { simulationApi } from '../api/simulation.api';
import type { Scenario } from '../types/simulation.types';

const DIFFICULTY_LABELS: Record<string, string> = {
  BEGINNER: 'Debutant',
  INTERMEDIATE: 'Intermediaire',
  ADVANCED: 'Avance',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  BEGINNER: 'bg-success/10 text-success',
  INTERMEDIATE: 'bg-warning/10 text-warning',
  ADVANCED: 'bg-destructive/10 text-destructive',
};

const SCENARIO_TYPE_CONFIG: Record<string, { label: string; className: string }> = {
  GREENFIELD: { label: 'Nouveau projet', className: 'bg-blue-500/10 text-blue-600' },
  BROWNFIELD: { label: 'Reprise en cours', className: 'bg-amber-500/10 text-amber-600' },
};

const MORALE_LABELS: Record<string, string> = {
  very_low: 'Tres bas',
  low: 'Bas',
  medium: 'Moyen',
  high: 'Bon',
  very_high: 'Excellent',
};

const SECTOR_OPTIONS = [
  { value: 'IT', label: 'Technologies de l\'information' },
  { value: 'CONSTRUCTION', label: 'Construction' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'HEALTHCARE', label: 'Sante' },
  { value: 'FINANCE', label: 'Finance' },
  { value: 'CUSTOM', label: 'Autre / personnalise' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'BEGINNER', label: 'Debutant' },
  { value: 'INTERMEDIATE', label: 'Intermediaire' },
  { value: 'ADVANCED', label: 'Avance' },
];

const SCENARIO_TYPE_OPTIONS = [
  { value: 'GREENFIELD', label: 'Nouveau projet (Greenfield)' },
  { value: 'BROWNFIELD', label: 'Reprise en cours (Brownfield)' },
];

export default function CreateSimulationPage() {
  const navigate = useNavigate();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [recommendedScenarios, setRecommendedScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'catalog' | 'generate'>('catalog');
  const [isGenerated, setIsGenerated] = useState(false);

  // Generation form state
  const [genForm, setGenForm] = useState({
    projectName: '',
    projectDescription: '',
    sector: 'IT',
    difficulty: 'INTERMEDIATE',
    scenarioType: 'GREENFIELD',
    useProfile: true,
    constraints: '',
    learningObjectives: '',
  });
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    Promise.all([
      simulationApi.getScenarios(),
      simulationApi.getRecommendedScenarios(3).catch(() => [] as Scenario[]),
    ])
      .then(([allScenarios, recommended]) => {
        setScenarios(allScenarios);
        setRecommendedScenarios(recommended);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleLaunch() {
    if (!selectedScenario) return;
    setCreating(true);
    try {
      // If scenario is generated (not published), publish it first
      if (isGenerated && !selectedScenario.isPublished) {
        await simulationApi.publishScenario(selectedScenario.id);
      }
      const startingPhase = selectedScenario.scenarioType === 'BROWNFIELD'
        ? selectedScenario.startingPhaseOrder
        : undefined;
      const sim = await simulationApi.createSimulation(selectedScenario.id, startingPhase);
      navigate(`/simulations/${sim.id}`);
    } catch (err: any) {
      setError(err.message);
      setCreating(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const params: Record<string, any> = {
        sector: genForm.sector,
        difficulty: genForm.difficulty,
        scenarioType: genForm.scenarioType,
        useProfile: genForm.useProfile,
      };
      if (genForm.projectName.trim()) params.projectName = genForm.projectName.trim();
      if (genForm.projectDescription.trim()) params.projectDescription = genForm.projectDescription.trim();
      if (genForm.constraints.trim()) params.constraints = genForm.constraints.trim();
      if (genForm.learningObjectives.trim()) params.learningObjectives = genForm.learningObjectives.trim();

      const scenario = await simulationApi.generateScenario(params);
      setSelectedScenario(scenario);
      setIsGenerated(true);
      toast.success('Scenario genere avec succes !');
    } catch (err: any) {
      setError(err.message);
      toast.error('Erreur lors de la generation du scenario');
    } finally {
      setGenerating(false);
    }
  }

  function handleSelectScenario(scenario: Scenario) {
    setSelectedScenario(scenario);
    setIsGenerated(false);
  }

  return (
    <>
      <Toolbar>
        <ToolbarHeading>
          <h1 className="text-xl font-medium text-gray-900">Nouvelle simulation</h1>
          <p className="text-sm text-gray-700">Choisissez un scenario ou generez-en un avec l'IA</p>
        </ToolbarHeading>
        <ToolbarActions>
          <Link to="/simulations">
            <Button variant="outline" size="sm">
              Retour aux simulations
            </Button>
          </Link>
        </ToolbarActions>
      </Toolbar>

      {/* Scenario detail modal */}
      <Dialog open={!!selectedScenario} onOpenChange={(open) => { if (!open) { setSelectedScenario(null); setIsGenerated(false); } }}>
        <DialogContent className="sm:max-w-[820px] p-0 gap-0 max-h-[90vh] flex flex-col">
          {selectedScenario && (
            <>
              {/* Hero header */}
              <div className="relative px-6 pt-6 pb-5 bg-gradient-to-br from-brand-500/5 via-transparent to-transparent border-b border-border shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${DIFFICULTY_COLORS[selectedScenario.difficulty]}`}>
                        {DIFFICULTY_LABELS[selectedScenario.difficulty]}
                      </span>
                      {selectedScenario.scenarioType && (
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${SCENARIO_TYPE_CONFIG[selectedScenario.scenarioType]?.className}`}>
                          {SCENARIO_TYPE_CONFIG[selectedScenario.scenarioType]?.label}
                        </span>
                      )}
                      {isGenerated && (
                        <Badge variant="info" appearance="light" size="sm">Genere par l'IA</Badge>
                      )}
                    </div>
                    <DialogTitle className="text-lg font-semibold leading-snug">{selectedScenario.title}</DialogTitle>
                    {selectedScenario.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed">{selectedScenario.description}</p>
                    )}
                  </div>

                  {/* Quick stats */}
                  <div className="flex gap-4 shrink-0 pt-1">
                    <div className="text-center">
                      <div className="text-lg font-bold text-foreground">{selectedScenario.phases.length}</div>
                      <div className="text-[10px] text-muted-foreground">Phases</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-foreground">{selectedScenario.estimatedDurationHours}h</div>
                      <div className="text-[10px] text-muted-foreground">Duree</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-foreground">{selectedScenario.objectives.length}</div>
                      <div className="text-[10px] text-muted-foreground">Objectifs</div>
                    </div>
                  </div>
                </div>

                {/* Metadata tags */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-background border border-border text-xs text-muted-foreground">
                    <KeenIcon icon="folder" style="duotone" className="text-[10px] leading-none" />
                    {selectedScenario.sector}
                  </span>
                  {selectedScenario._count?.simulations !== undefined && selectedScenario._count.simulations > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-background border border-border text-xs text-muted-foreground">
                      <KeenIcon icon="people" style="duotone" className="text-[10px] leading-none" />
                      {selectedScenario._count.simulations} simulation{selectedScenario._count.simulations > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-6">

                  {/* Two-column layout: Objectives + Competencies */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Objectives */}
                    {selectedScenario.objectives.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Objectifs du scenario</h4>
                        <div className="space-y-2">
                          {selectedScenario.objectives.map((obj, i) => (
                            <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/50">
                              <div className="w-6 h-6 rounded-full bg-brand-500/10 flex items-center justify-center shrink-0">
                                <span className="text-[10px] font-bold text-brand-500">{i + 1}</span>
                              </div>
                              <span className="text-sm text-foreground leading-snug">{obj}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Competencies + Info */}
                    <div className="space-y-5">
                      {selectedScenario.competencies.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Competences travaillees</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedScenario.competencies.map((comp, i) => (
                              <span key={i} className="px-3 py-1 bg-brand-500/5 text-brand-500 border border-brand-500/15 rounded-full text-xs font-medium">
                                {comp}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {isGenerated && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            Ce scenario a ete genere par l'IA et adapte a votre profil. Vous pouvez le lancer directement.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Phases timeline */}
                  {selectedScenario.phases.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        Deroulement du projet
                        {selectedScenario.scenarioType === 'BROWNFIELD' && (
                          <span className="ml-1.5 text-amber-600 font-normal normal-case">
                            — vous demarrez a la phase {selectedScenario.startingPhaseOrder + 1}
                          </span>
                        )}
                      </h4>
                      <div className="grid grid-cols-5 gap-2">
                        {selectedScenario.phases
                          .sort((a, b) => a.order - b.order)
                          .map((phase) => {
                            const isBf = selectedScenario.scenarioType === 'BROWNFIELD';
                            const isBefore = isBf && phase.order < selectedScenario.startingPhaseOrder;
                            const isStart = isBf && phase.order === selectedScenario.startingPhaseOrder;
                            return (
                              <div
                                key={phase.id}
                                className={cn(
                                  'relative p-3 rounded-lg border text-center transition-colors',
                                  isBefore ? 'bg-muted/30 border-border/50 opacity-50' :
                                  isStart ? 'bg-amber-500/5 border-amber-300 dark:border-amber-700' :
                                  'bg-white dark:bg-background border-border',
                                )}
                              >
                                <div className={cn(
                                  'text-[10px] font-bold uppercase tracking-wider mb-1',
                                  isBefore ? 'text-muted-foreground/60' :
                                  isStart ? 'text-amber-600' :
                                  'text-brand-500',
                                )}>
                                  Phase {phase.order + 1}
                                </div>
                                <div className={cn(
                                  'text-xs font-medium',
                                  isBefore ? 'text-muted-foreground/60 line-through' :
                                  'text-foreground',
                                )}>
                                  {phase.name}
                                </div>
                                {isStart && (
                                  <div className="mt-1.5">
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 font-medium">Depart</span>
                                  </div>
                                )}
                                {isBefore && (
                                  <div className="mt-1.5">
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">Termine</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* Brownfield context */}
                  {selectedScenario.scenarioType === 'BROWNFIELD' && selectedScenario.brownfieldContext && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg space-y-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">Contexte de reprise</h4>
                      {selectedScenario.brownfieldContext.previousPmNotes && (
                        <p className="text-sm text-amber-800 dark:text-amber-300 italic leading-relaxed">
                          &laquo; {selectedScenario.brownfieldContext.previousPmNotes} &raquo;
                        </p>
                      )}
                      <div className="grid grid-cols-4 gap-3">
                        <div className="text-center p-2 bg-white dark:bg-background rounded-lg border border-amber-200 dark:border-amber-800">
                          <div className="text-lg font-bold text-destructive">{selectedScenario.brownfieldContext.accumulatedDelays}j</div>
                          <div className="text-[10px] text-muted-foreground">Retard accumule</div>
                        </div>
                        <div className="text-center p-2 bg-white dark:bg-background rounded-lg border border-amber-200 dark:border-amber-800">
                          <div className="text-lg font-bold text-amber-600">{Math.round(selectedScenario.brownfieldContext.budgetUsed * 100)}%</div>
                          <div className="text-[10px] text-muted-foreground">Budget consomme</div>
                        </div>
                        <div className="text-center p-2 bg-white dark:bg-background rounded-lg border border-amber-200 dark:border-amber-800">
                          <div className="text-lg font-bold text-amber-600">{selectedScenario.brownfieldContext.knownRisks.filter((r) => r.status === 'ACTIVE').length}</div>
                          <div className="text-[10px] text-muted-foreground">Risques actifs</div>
                        </div>
                        <div className="text-center p-2 bg-white dark:bg-background rounded-lg border border-amber-200 dark:border-amber-800">
                          <div className="text-lg font-bold text-amber-600">{MORALE_LABELS[selectedScenario.brownfieldContext.teamMorale] ?? selectedScenario.brownfieldContext.teamMorale}</div>
                          <div className="text-[10px] text-muted-foreground">Moral equipe</div>
                        </div>
                      </div>
                      {selectedScenario.brownfieldContext.knownRisks.length > 0 && (
                        <div>
                          <h5 className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 mb-1.5">Risques identifies</h5>
                          <div className="space-y-1">
                            {selectedScenario.brownfieldContext.knownRisks.map((risk, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs p-1.5 bg-white dark:bg-background rounded border border-amber-200/50 dark:border-amber-800/50">
                                <span className={cn('w-2 h-2 rounded-full shrink-0',
                                  risk.severity === 'CRITICAL' ? 'bg-destructive' :
                                  risk.severity === 'HIGH' ? 'bg-orange-500' :
                                  risk.severity === 'MEDIUM' ? 'bg-amber-500' : 'bg-blue-400',
                                )} />
                                <span className="text-foreground flex-1">{risk.title}</span>
                                <span className={cn('text-[10px] px-1.5 py-0.5 rounded',
                                  risk.status === 'ACTIVE' ? 'bg-destructive/10 text-destructive' : 'bg-brand-500/10 text-brand-500',
                                )}>{risk.status}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Sticky footer */}
              <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setSelectedScenario(null); setIsGenerated(false); }}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleLaunch}
                  disabled={creating}
                  variant="primary"
                  className="gap-2 px-6"
                >
                  {creating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Lancement en cours...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Lancer la simulation
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <div className="container-fixed">
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Tab switcher */}
        <div className="flex items-center gap-1 mb-5 p-1 bg-muted rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'catalog'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="flex items-center gap-2">
              <KeenIcon icon="element-11" style="duotone" />
              Catalogue
            </span>
          </button>
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'generate'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="flex items-center gap-2">
              <KeenIcon icon="artificial-intelligence" style="duotone" />
              Generer avec l'IA
            </span>
          </button>
        </div>

        {/* ========== CATALOG TAB ========== */}
        {activeTab === 'catalog' && (
          <>
            {/* Loading */}
            {loading && (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && scenarios.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                  <span className="text-4xl">📋</span>
                  <p className="text-muted-foreground text-sm">
                    Aucun scenario disponible pour le moment.
                  </p>
                </CardContent>
              </Card>
            )}

            {!loading && scenarios.length > 0 && (
              <>
                {/* Recommended scenarios */}
                {recommendedScenarios.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <KeenIcon icon="star" style="solid" className="text-warning" />
                      <h3 className="text-sm font-semibold text-foreground">Recommandes pour vous</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {recommendedScenarios.map((scenario) => {
                        const isSelected = selectedScenario?.id === scenario.id;
                        return (
                          <Card
                            key={scenario.id}
                            className={`cursor-pointer transition-all duration-200 border-warning/30 bg-warning/5 hover:border-brand-500/40 ${
                              isSelected ? 'ring-2 ring-primary' : ''
                            }`}
                            onClick={() => handleSelectScenario(scenario)}
                          >
                            <CardContent className="p-4 space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-semibold text-sm">{scenario.title}</h3>
                                <Badge variant="warning" appearance="light" size="xs">
                                  Recommande
                                </Badge>
                              </div>
                              {scenario.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {scenario.description}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                <span className="inline-flex items-center gap-1"><KeenIcon icon="folder" style="duotone" className="text-[10px] leading-none" />{scenario.sector}</span>
                                <span
                                  className={`px-1.5 py-0.5 rounded-full font-medium ${DIFFICULTY_COLORS[scenario.difficulty]}`}
                                >
                                  {DIFFICULTY_LABELS[scenario.difficulty]}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* All scenarios */}
                <p className="text-sm text-muted-foreground mb-4">
                  Choisissez un scenario pour demarrer une nouvelle simulation.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {scenarios.map((scenario) => {
                    const isSelected = selectedScenario?.id === scenario.id;
                    return (
                      <Card
                        key={scenario.id}
                        className={`cursor-pointer transition-all duration-200 hover:border-brand-500/40 ${
                          isSelected ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => handleSelectScenario(scenario)}
                      >
                        <CardContent className="p-5 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-sm">{scenario.title}</h3>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {scenario.scenarioType === 'BROWNFIELD' && (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${SCENARIO_TYPE_CONFIG.BROWNFIELD.className}`}>
                                  Reprise
                                </span>
                              )}
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${DIFFICULTY_COLORS[scenario.difficulty]}`}
                              >
                                {DIFFICULTY_LABELS[scenario.difficulty]}
                              </span>
                            </div>
                          </div>

                          {scenario.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {scenario.description}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-1"><KeenIcon icon="folder" style="duotone" className="text-xs leading-none" />{scenario.sector}</span>
                            <span className="inline-flex items-center gap-1"><KeenIcon icon="time" style="duotone" className="text-xs leading-none" />{scenario.estimatedDurationHours}h</span>
                            <span className="inline-flex items-center gap-1"><KeenIcon icon="element-11" style="duotone" className="text-xs leading-none" />{scenario.phases.length} phases</span>
                          </div>

                          {scenario.competencies.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {scenario.competencies.slice(0, 4).map((comp, i) => (
                                <span
                                  key={i}
                                  className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-[10px]"
                                >
                                  {comp}
                                </span>
                              ))}
                              {scenario.competencies.length > 4 && (
                                <span className="px-1.5 py-0.5 text-muted-foreground text-[10px]">
                                  +{scenario.competencies.length - 4}
                                </span>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

        {/* ========== GENERATE TAB ========== */}
        {activeTab === 'generate' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeenIcon icon="artificial-intelligence" style="duotone" />
                Generer un scenario avec l'IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm text-muted-foreground">
                Decrivez votre projet et vos objectifs d'apprentissage. L'IA generera un scenario
                de simulation adapte a vos besoins.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Left column */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">
                      Nom du projet
                      <span className="text-muted-foreground font-normal ml-1">(optionnel)</span>
                    </label>
                    <Input
                      placeholder="Ex: Migration vers le cloud"
                      value={genForm.projectName}
                      onChange={(e) => setGenForm((p) => ({ ...p, projectName: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Secteur</label>
                    <Select
                      value={genForm.sector}
                      onValueChange={(v) => setGenForm((p) => ({ ...p, sector: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SECTOR_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Difficulte</label>
                    <Select
                      value={genForm.difficulty}
                      onValueChange={(v) => setGenForm((p) => ({ ...p, difficulty: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DIFFICULTY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Type de scenario</label>
                    <Select
                      value={genForm.scenarioType}
                      onValueChange={(v) => setGenForm((p) => ({ ...p, scenarioType: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SCENARIO_TYPE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Checkbox
                      id="useProfile"
                      checked={genForm.useProfile}
                      onCheckedChange={(checked) =>
                        setGenForm((p) => ({ ...p, useProfile: checked === true }))
                      }
                    />
                    <label htmlFor="useProfile" className="text-sm text-foreground cursor-pointer">
                      Utiliser mon profil pour calibrer le scenario
                    </label>
                  </div>
                </div>

                {/* Right column */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">
                      Description du projet
                      <span className="text-muted-foreground font-normal ml-1">(optionnel)</span>
                    </label>
                    <Textarea
                      placeholder="Decrivez le contexte et les enjeux du projet..."
                      rows={3}
                      value={genForm.projectDescription}
                      onChange={(e) => setGenForm((p) => ({ ...p, projectDescription: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">
                      Objectifs d'apprentissage
                      <span className="text-muted-foreground font-normal ml-1">(optionnel)</span>
                    </label>
                    <Textarea
                      placeholder="Ex: Gestion des risques, planification agile, communication..."
                      rows={3}
                      value={genForm.learningObjectives}
                      onChange={(e) => setGenForm((p) => ({ ...p, learningObjectives: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">
                      Contraintes specifiques
                      <span className="text-muted-foreground font-normal ml-1">(optionnel)</span>
                    </label>
                    <Textarea
                      placeholder="Ex: Budget limite, equipe reduite, delai serre..."
                      rows={3}
                      value={genForm.constraints}
                      onChange={(e) => setGenForm((p) => ({ ...p, constraints: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleGenerate}
                  disabled={generating}
                >
                  {generating ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Generation en cours...
                    </>
                  ) : (
                    <>
                      <KeenIcon icon="artificial-intelligence" style="duotone" />
                      Generer le scenario
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
