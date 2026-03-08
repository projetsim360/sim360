import { useParams, useSearchParams, Link } from 'react-router';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useCompareCandidates } from '../api/recruitment.api';
import { CandidateStatusBadge } from '../components/candidate-status-badge';
import { useEffect, useState } from 'react';
import type { ComparisonResult } from '../types/recruitment.types';

export default function ComparePage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const candidateAId = searchParams.get('a') ?? '';
  const candidateBId = searchParams.get('b') ?? '';

  const compareMutation = useCompareCandidates();
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!candidateAId || !candidateBId || !id) {
      setError('Parametres manquants pour la comparaison.');
      setLoading(false);
      return;
    }

    compareMutation
      .mutateAsync({ campaignId: id, candidateIds: [candidateAId, candidateBId] })
      .then(setResult)
      .catch(() => setError('Erreur lors de la comparaison.'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, candidateAId, candidateBId]);

  if (loading) {
    return (
      <div className="container">
        <Toolbar>
          <ToolbarHeading title="Comparaison" />
        </Toolbar>
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="container">
        <Toolbar>
          <ToolbarHeading title="Comparaison" />
        </Toolbar>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive text-sm">{error ?? 'Impossible de charger la comparaison.'}</p>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link to={`/recruitment/campaigns/${id}/shortlist`}>Retour a la shortlist</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { candidateA, candidateB } = result;

  const nameA = candidateA.user
    ? `${candidateA.user.firstName} ${candidateA.user.lastName}`
    : 'Candidat A';
  const nameB = candidateB.user
    ? `${candidateB.user.firstName} ${candidateB.user.lastName}`
    : 'Candidat B';

  const radarData = [
    {
      axis: 'Hard Skills',
      [nameA]: candidateA.hardSkillsScore ?? 0,
      [nameB]: candidateB.hardSkillsScore ?? 0,
    },
    {
      axis: 'Soft Skills',
      [nameA]: candidateA.softSkillsScore ?? 0,
      [nameB]: candidateB.softSkillsScore ?? 0,
    },
    {
      axis: 'Fiabilite',
      [nameA]: candidateA.reliabilityScore ?? 0,
      [nameB]: candidateB.reliabilityScore ?? 0,
    },
    {
      axis: 'Adaptabilite',
      [nameA]: candidateA.adaptabilityScore ?? 0,
      [nameB]: candidateB.adaptabilityScore ?? 0,
    },
    {
      axis: 'Leadership',
      [nameA]: candidateA.leadershipScore ?? 0,
      [nameB]: candidateB.leadershipScore ?? 0,
    },
  ];

  const scoreItems = [
    { label: 'Score global', a: candidateA.globalScore, b: candidateB.globalScore },
    { label: 'Hard Skills', a: candidateA.hardSkillsScore, b: candidateB.hardSkillsScore },
    { label: 'Soft Skills', a: candidateA.softSkillsScore, b: candidateB.softSkillsScore },
    { label: 'Fiabilite', a: candidateA.reliabilityScore, b: candidateB.reliabilityScore },
    { label: 'Adaptabilite', a: candidateA.adaptabilityScore, b: candidateB.adaptabilityScore },
    { label: 'Leadership', a: candidateA.leadershipScore, b: candidateB.leadershipScore },
    { label: 'Compatibilite', a: candidateA.matchPercentage, b: candidateB.matchPercentage },
  ];

  return (
    <div className="container space-y-5">
      <Toolbar>
        <ToolbarHeading title="Comparaison de candidats" />
        <ToolbarActions>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/recruitment/campaigns/${id}/shortlist`}>
              <KeenIcon icon="arrow-left" style="duotone" className="size-4" />
              Retour a la shortlist
            </Link>
          </Button>
        </ToolbarActions>
      </Toolbar>
        {/* Candidate headers */}
        <div className="grid grid-cols-2 gap-5">
          {[
            { candidate: candidateA, name: nameA, color: 'primary' },
            { candidate: candidateB, name: nameB, color: 'info' },
          ].map(({ candidate, name, color }) => (
            <Card key={candidate.id}>
              <CardContent className="flex items-center gap-4 py-4">
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold',
                    color === 'primary' ? 'bg-primary/10 text-primary' : 'bg-info/10 text-info',
                  )}
                >
                  {name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <CandidateStatusBadge status={candidate.status} />
                    {candidate.globalScore !== undefined && candidate.globalScore !== null && (
                      <span className="text-sm font-bold">{Math.round(candidate.globalScore)}%</span>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/recruitment/campaigns/${id}/candidates/${candidate.id}`}>
                    <KeenIcon icon="eye" style="duotone" className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Radar chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Comparaison des competences</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis
                  dataKey="axis"
                  tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
                />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar
                  name={nameA}
                  dataKey={nameA}
                  stroke="var(--color-primary)"
                  fill="var(--color-primary)"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Radar
                  name={nameB}
                  dataKey={nameB}
                  stroke="var(--color-info-accent, #8b5cf6)"
                  fill="var(--color-info-accent, #8b5cf6)"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Score comparison table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Scores detailles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {scoreItems.map(({ label, a, b }) => {
              const valA = a !== undefined && a !== null ? Math.round(a) : null;
              const valB = b !== undefined && b !== null ? Math.round(b) : null;
              const better = valA !== null && valB !== null ? (valA > valB ? 'a' : valA < valB ? 'b' : 'tie') : null;

              return (
                <div key={label} className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground w-32 shrink-0">{label}</span>
                  <div className="flex-1 flex items-center gap-3">
                    <span
                      className={cn(
                        'text-sm font-medium w-12 text-right',
                        better === 'a' ? 'text-primary font-bold' : '',
                      )}
                    >
                      {valA !== null ? `${valA}%` : '-'}
                    </span>
                    <div className="flex-1 flex items-center gap-1">
                      <div className="flex-1 h-2 bg-accent rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${valA ?? 0}%` }}
                        />
                      </div>
                      <div className="flex-1 h-2 bg-accent rounded-full overflow-hidden">
                        <div
                          className="h-full bg-info rounded-full"
                          style={{ width: `${valB ?? 0}%` }}
                        />
                      </div>
                    </div>
                    <span
                      className={cn(
                        'text-sm font-medium w-12',
                        better === 'b' ? 'text-info font-bold' : '',
                      )}
                    >
                      {valB !== null ? `${valB}%` : '-'}
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* AI Analysis */}
        {result.aiAnalysis && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <KeenIcon icon="artificial-intelligence" style="duotone" className="size-4 text-primary" />
                Analyse comparative IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {result.aiAnalysis}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Recommendation */}
        {result.recommendation && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <KeenIcon icon="star" style="solid" className="size-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Recommandation</h4>
                  <p className="text-sm text-muted-foreground">{result.recommendation}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
