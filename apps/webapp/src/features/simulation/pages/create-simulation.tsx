import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent } from '@/components/ui/card';
import { simulationApi } from '../api/simulation.api';
import type { Scenario } from '../types/simulation.types';

const DIFFICULTY_LABELS: Record<string, string> = {
  BEGINNER: 'Debutant',
  INTERMEDIATE: 'Intermediaire',
  ADVANCED: 'Avance',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  BEGINNER: 'bg-green-100 text-green-700',
  INTERMEDIATE: 'bg-yellow-100 text-yellow-700',
  ADVANCED: 'bg-red-100 text-red-700',
};

export default function CreateSimulationPage() {
  const navigate = useNavigate();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    simulationApi
      .getScenarios()
      .then((data) => setScenarios(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleLaunch() {
    if (!selectedScenario) return;
    setCreating(true);
    try {
      const sim = await simulationApi.createSimulation(selectedScenario.id);
      navigate(`/simulations/${sim.id}`);
    } catch (err: any) {
      setError(err.message);
      setCreating(false);
    }
  }

  return (
    <div className="container">
      <Toolbar>
        <ToolbarHeading title="Nouvelle simulation" />
        <ToolbarActions>
          <Link
            to="/simulations"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            Retour aux simulations
          </Link>
        </ToolbarActions>
      </Toolbar>

      {/* Selected scenario detail panel */}
      {selectedScenario && (
        <Card className="mb-5 border-primary/30 bg-primary/5">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <h2 className="font-semibold text-lg">{selectedScenario.title}</h2>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${DIFFICULTY_COLORS[selectedScenario.difficulty]}`}
                  >
                    {DIFFICULTY_LABELS[selectedScenario.difficulty]}
                  </span>
                </div>

                {selectedScenario.description && (
                  <p className="text-sm text-muted-foreground">
                    {selectedScenario.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span>📁 Secteur : {selectedScenario.sector}</span>
                  <span>⏱ Duree estimee : {selectedScenario.estimatedDurationHours}h</span>
                  {selectedScenario._count?.simulations !== undefined && (
                    <span>👥 {selectedScenario._count.simulations} simulation(s)</span>
                  )}
                </div>

                {/* Objectives */}
                {selectedScenario.objectives.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-1">
                      Objectifs
                    </h4>
                    <ul className="list-disc list-inside text-sm space-y-0.5">
                      {selectedScenario.objectives.map((obj, i) => (
                        <li key={i}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Competencies */}
                {selectedScenario.competencies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedScenario.competencies.map((comp, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                      >
                        {comp}
                      </span>
                    ))}
                  </div>
                )}

                {/* Phases */}
                {selectedScenario.phases.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-1">
                      Phases ({selectedScenario.phases.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedScenario.phases
                        .sort((a, b) => a.order - b.order)
                        .map((phase) => (
                          <span
                            key={phase.id}
                            className="px-2 py-1 bg-white border border-border rounded text-xs"
                          >
                            {phase.order + 1}. {phase.name}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                <button
                  onClick={handleLaunch}
                  disabled={creating}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {creating ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Lancement...
                    </>
                  ) : (
                    <>
                      <span>▶</span>
                      Lancer la simulation
                    </>
                  )}
                </button>
                <button
                  onClick={() => setSelectedScenario(null)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

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

      {/* Scenario grid */}
      {!loading && scenarios.length > 0 && (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            Choisissez un scenario pour demarrer une nouvelle simulation.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {scenarios.map((scenario) => {
              const isSelected = selectedScenario?.id === scenario.id;
              return (
                <Card
                  key={scenario.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? 'ring-2 ring-primary shadow-md' : ''
                  }`}
                  onClick={() => setSelectedScenario(scenario)}
                >
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm">{scenario.title}</h3>
                      <span
                        className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${DIFFICULTY_COLORS[scenario.difficulty]}`}
                      >
                        {DIFFICULTY_LABELS[scenario.difficulty]}
                      </span>
                    </div>

                    {scenario.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {scenario.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>📁 {scenario.sector}</span>
                      <span>⏱ {scenario.estimatedDurationHours}h</span>
                      <span>📊 {scenario.phases.length} phases</span>
                    </div>

                    {scenario.competencies.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {scenario.competencies.slice(0, 4).map((comp, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]"
                          >
                            {comp}
                          </span>
                        ))}
                        {scenario.competencies.length > 4 && (
                          <span className="px-1.5 py-0.5 text-gray-400 text-[10px]">
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
    </div>
  );
}
