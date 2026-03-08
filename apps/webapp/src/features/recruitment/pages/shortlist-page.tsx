import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';
import { useShortlist } from '../api/recruitment.api';
import { CandidateStatusBadge } from '../components/candidate-status-badge';

export default function ShortlistPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [count, setCount] = useState(5);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const { data: shortlist, isLoading, error } = useShortlist(id!, count);

  const toggleSelect = (candidateId: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(candidateId)) return prev.filter((c) => c !== candidateId);
      if (prev.length >= 2) return [prev[1], candidateId];
      return [...prev, candidateId];
    });
  };

  const handleCompare = () => {
    if (selectedForCompare.length === 2) {
      navigate(
        `/recruitment/campaigns/${id}/compare?a=${selectedForCompare[0]}&b=${selectedForCompare[1]}`,
      );
    }
  };

  if (isLoading) {
    return (
      <div className="container">
        <Toolbar>
          <ToolbarHeading title="Shortlist" />
        </Toolbar>
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (error || !shortlist) {
    return (
      <div className="container">
        <Toolbar>
          <ToolbarHeading title="Shortlist" />
        </Toolbar>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive text-sm">Impossible de charger la shortlist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container space-y-5">
      <Toolbar>
        <ToolbarHeading title="Shortlist IA" />
        <ToolbarActions>
          {selectedForCompare.length === 2 && (
            <Button variant="primary" size="sm" onClick={handleCompare}>
              <KeenIcon icon="arrow-two-diagonals" style="outline" className="size-4" />
              Comparer
            </Button>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Top</span>
            {[3, 5, 10].map((n) => (
              <Button
                key={n}
                variant={count === n ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setCount(n)}
              >
                {n}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/recruitment/campaigns/${id}`}>
              <KeenIcon icon="arrow-left" style="outline" className="size-4" />
              Retour
            </Link>
          </Button>
        </ToolbarActions>
      </Toolbar>
        {/* Stats header */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <KeenIcon icon="star" style="outline" className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    Sur {shortlist.totalCandidates} candidats, voici les {shortlist.candidates.length} que nous recommandons
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Selectionnez 2 candidats pour les comparer
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {shortlist.criteria && (
                  <Badge variant="secondary" appearance="light" size="sm">
                    {shortlist.criteria}
                  </Badge>
                )}
                {selectedForCompare.length === 2 && (
                  <Button variant="primary" size="sm" onClick={handleCompare}>
                    <KeenIcon icon="arrow-two-diagonals" style="outline" className="size-4" />
                    Comparer
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shortlisted candidates */}
        <div className="space-y-3">
          {shortlist.candidates.map((candidate, index) => {
            const isSelected = selectedForCompare.includes(candidate.id);
            const candidateName = candidate.user
              ? `${candidate.user.firstName} ${candidate.user.lastName}`
              : 'Candidat';

            return (
              <Card
                key={candidate.id}
                className={cn(
                  'transition-all cursor-pointer',
                  isSelected && 'ring-2 ring-primary',
                )}
                onClick={() => toggleSelect(candidate.id)}
              >
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0',
                        index === 0
                          ? 'bg-yellow-100 text-yellow-700'
                          : index === 1
                            ? 'bg-gray-100 text-gray-600'
                            : index === 2
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-accent text-muted-foreground',
                      )}
                    >
                      #{index + 1}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium">{candidateName}</p>
                        <CandidateStatusBadge status={candidate.status} />
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {candidate.justification}
                      </p>
                    </div>

                    {/* Score */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="text-xl font-bold">
                          {candidate.globalScore !== undefined && candidate.globalScore !== null
                            ? Math.round(candidate.globalScore)
                            : '-'}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Score</p>
                      </div>
                      {candidate.matchPercentage !== undefined && candidate.matchPercentage !== null && (
                        <div className="text-right">
                          <p className="text-xl font-bold text-primary">
                            {Math.round(candidate.matchPercentage)}%
                          </p>
                          <p className="text-[10px] text-muted-foreground">Match</p>
                        </div>
                      )}
                      <Button variant="ghost" size="sm" asChild onClick={(e) => e.stopPropagation()}>
                        <Link to={`/recruitment/campaigns/${id}/candidates/${candidate.id}`}>
                          <KeenIcon icon="eye" style="outline" className="size-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {selectedForCompare.length > 0 && selectedForCompare.length < 2 && (
          <p className="text-xs text-muted-foreground text-center">
            Selectionnez un deuxieme candidat pour lancer la comparaison.
          </p>
        )}
    </div>
  );
}
