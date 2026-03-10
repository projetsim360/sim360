import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { Toolbar, ToolbarHeading } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { projectApi } from '../api/project.api';
import type { ProjectTeamMember } from '../types/simulation.types';

export default function ProjectTeamPage() {
  const { id } = useParams<{ id: string }>();
  const [members, setMembers] = useState<ProjectTeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    projectApi
      .getTeam(id)
      .then(setMembers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="container">
      <Toolbar>
        <ToolbarHeading title="Equipe du projet" />
      </Toolbar>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : members.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">Aucun membre dans l'equipe</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {members.map((m) => (
            <Card key={m.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <CardTitle className="text-sm">{m.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{m.role}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <InfoRow label="Expertise" value={m.expertise} />
                <InfoRow label="Personnalite" value={m.personality} />
                <div className="flex items-center gap-4 pt-1 border-t border-border">
                  <MiniGauge label="Disponibilite" value={m.availability} />
                  <MiniGauge label="Moral" value={m.morale} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="text-muted-foreground shrink-0 w-24">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function MiniGauge({ label, value }: { label: string; value: number }) {
  const color = value >= 70 ? 'text-success' : value >= 40 ? 'text-warning' : 'text-destructive';
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium ${color}`}>{value}%</span>
    </div>
  );
}
