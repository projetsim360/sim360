import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { PageHeader } from '@/components/page-header';
import { ScenarioCard } from '../components/scenario-card';
import { ScenarioDialogContent } from '../components/scenario-dialog-content';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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
import {
  EMPTY_SCENARIO_FILTERS,
  SECTORS,
  filterScenarios,
  sectorsPresent,
  type ScenarioFilters,
} from '../config/sectors';

const DIFFICULTY_OPTIONS = [
  { value: 'BEGINNER', label: 'Débutant' },
  { value: 'INTERMEDIATE', label: 'Intermédiaire' },
  { value: 'ADVANCED', label: 'Avancé' },
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
  const [filters, setFilters] = useState<ScenarioFilters>(EMPTY_SCENARIO_FILTERS);
  const availableSectors = useMemo(() => sectorsPresent(scenarios), [scenarios]);
  const visibleScenarios = useMemo(() => filterScenarios(scenarios, filters), [scenarios, filters]);
  const filtersActive =
    filters.sector !== 'ALL' || filters.difficulty !== 'ALL' || filters.scenarioType !== 'ALL';

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
      toast.success('Scénario généré avec succès !');
    } catch (err: any) {
      setError(err.message);
      toast.error('Erreur lors de la génération du scénario');
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
      <PageHeader
        breadcrumbs={[
          { label: 'Tableau de bord', to: '/dashboard' },
          { label: 'Simulations', to: '/simulations' },
          { label: 'Nouvelle' },
        ]}
        title="Nouvelle simulation"
        subtitle="Choisissez un scénario du catalogue ou générez une nouvelle simulation sur mesure."
      />

      {/* Scenario detail modal */}
      <Dialog
        open={!!selectedScenario}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedScenario(null);
            setIsGenerated(false);
          }
        }}
      >
        <DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-[820px]">
          {selectedScenario && (
            <ScenarioDialogContent
              scenario={selectedScenario}
              isGenerated={isGenerated}
              creating={creating}
              onLaunch={handleLaunch}
              onClose={() => {
                setSelectedScenario(null);
                setIsGenerated(false);
              }}
            />
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
        <div className="mb-5 flex items-center gap-1 border-b border-border">
          <button
            onClick={() => setActiveTab('catalog')}
            className={cn(
              'cursor-pointer border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors',
              activeTab === 'catalog'
                ? 'border-[var(--accent-500)] text-[var(--accent-700)]'
                : 'border-transparent text-[var(--neutral-400)] hover:text-[var(--brand-700)]',
            )}
          >
            <span className="flex items-center gap-2">
              <KeenIcon icon="element-11" style="duotone" />
              Catalogue
            </span>
          </button>
          <button
            onClick={() => setActiveTab('generate')}
            className={cn(
              'cursor-pointer border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors',
              activeTab === 'generate'
                ? 'border-[var(--accent-500)] text-[var(--accent-700)]'
                : 'border-transparent text-[var(--neutral-400)] hover:text-[var(--brand-700)]',
            )}
          >
            <span className="flex items-center gap-2">
              <KeenIcon icon="add-files" style="duotone" />
              Générer une nouvelle simulation
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
                  <KeenIcon icon="questionnaire-tablet" style="duotone" className="text-4xl text-[var(--neutral-400)]" />
                  <p className="text-muted-foreground text-sm">
                    Aucun scénario disponible pour le moment.
                  </p>
                </CardContent>
              </Card>
            )}

            {!loading && scenarios.length > 0 && (
              <>
                {/* Recommended scenarios */}
                {recommendedScenarios.length > 0 && (
                  <section className="mb-6">
                    <h3 className="mb-3 font-display text-[15px] font-bold text-[var(--brand-700)]">
                      Recommandés pour vous
                    </h3>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {recommendedScenarios.map((scenario) => (
                        <ScenarioCard
                          key={scenario.id}
                          scenario={scenario}
                          recommended
                          onSelect={handleSelectScenario}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* All scenarios + filters */}
                <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Choisissez un scénario pour démarrer une nouvelle simulation.
                  </p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:w-[620px]">
                    <Select value={filters.sector} onValueChange={(v) => setFilters((f) => ({ ...f, sector: v }))}>
                      <SelectTrigger aria-label="Filtrer par secteur">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Tous les secteurs</SelectItem>
                        {availableSectors.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={filters.difficulty} onValueChange={(v) => setFilters((f) => ({ ...f, difficulty: v }))}>
                      <SelectTrigger aria-label="Filtrer par niveau de responsabilité">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Tous les niveaux</SelectItem>
                        {DIFFICULTY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={filters.scenarioType} onValueChange={(v) => setFilters((f) => ({ ...f, scenarioType: v }))}>
                      <SelectTrigger aria-label="Filtrer par type de situation">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Toutes les situations</SelectItem>
                        {SCENARIO_TYPE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {visibleScenarios.length === 0 && (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                      <p className="text-sm text-muted-foreground">Aucun scénario ne correspond à ces filtres.</p>
                      {filtersActive && (
                        <Button variant="outline" size="sm" onClick={() => setFilters(EMPTY_SCENARIO_FILTERS)}>
                          Réinitialiser les filtres
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {visibleScenarios.map((scenario) => (
                    <ScenarioCard
                      key={scenario.id}
                      scenario={scenario}
                      onSelect={handleSelectScenario}
                    />
                  ))}
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
                <KeenIcon icon="add-files" style="duotone" />
                Générer une nouvelle simulation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm text-muted-foreground">
                Décrivez votre projet et vos objectifs d'apprentissage : un scénario de simulation
                adapté à vos besoins sera préparé pour vous.
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
                      placeholder="Ex. : agrandissement d’une usine"
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
                        {SECTORS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Difficulté</label>
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
                    <label className="text-sm font-medium text-foreground">Type de scénario</label>
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
                      Utiliser mon profil pour calibrer le scénario
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
                      placeholder="Décrivez le contexte et les enjeux du projet…"
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
                      placeholder="Ex. : gestion des risques, planification agile, communication…"
                      rows={3}
                      value={genForm.learningObjectives}
                      onChange={(e) => setGenForm((p) => ({ ...p, learningObjectives: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">
                      Contraintes spécifiques
                      <span className="text-muted-foreground font-normal ml-1">(optionnel)</span>
                    </label>
                    <Textarea
                      placeholder="Ex. : budget limité, équipe réduite, délai serré…"
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
                      <span className="size-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                      Génération en cours…
                    </>
                  ) : (
                    <>
                      <KeenIcon icon="add-files" style="duotone" />
                      Générer la simulation
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
