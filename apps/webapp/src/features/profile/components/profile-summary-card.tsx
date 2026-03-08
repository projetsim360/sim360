import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SkillBadge } from './skill-badge';
import type { UserProfile } from '../types/profile.types';
import { PROFILE_TYPE_LABELS } from '../types/profile.types';

interface ProfileSummaryCardProps {
  profile: UserProfile;
  className?: string;
}

export function ProfileSummaryCard({ profile, className }: ProfileSummaryCardProps) {
  const hasCV = !!profile.cvFileUrl || !!profile.cvData;
  const hasLinkedin = !!profile.linkedinData;
  const skillCount = profile.skills?.length ?? 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">Resume du profil</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {profile.profileType && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Type de profil :</span>
            <Badge variant="primary" appearance="light" size="sm">
              {PROFILE_TYPE_LABELS[profile.profileType]}
            </Badge>
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">CV :</span>
            <Badge
              variant={hasCV ? 'success' : 'secondary'}
              appearance="light"
              size="sm"
            >
              {hasCV ? 'Importe' : 'Non fourni'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">LinkedIn :</span>
            <Badge
              variant={hasLinkedin ? 'success' : 'secondary'}
              appearance="light"
              size="sm"
            >
              {hasLinkedin ? 'Connecte' : 'Non fourni'}
            </Badge>
          </div>
        </div>

        {profile.questionnaireData && (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Objectif</p>
            <p className="text-sm text-foreground capitalize">
              {profile.questionnaireData.objective === 'reinforce' && 'Renforcer mes competences'}
              {profile.questionnaireData.objective === 'reconversion' && 'Reconversion professionnelle'}
              {profile.questionnaireData.objective === 'discovery' && 'Decouverte'}
            </p>
          </div>
        )}

        {skillCount > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Competences ({skillCount})
            </p>
            <div className="flex flex-wrap gap-2">
              {profile.skills?.slice(0, 5).map((skill) => (
                <SkillBadge
                  key={skill.name}
                  name={skill.name}
                  level={skill.currentLevel}
                />
              ))}
              {skillCount > 5 && (
                <span className="text-sm text-muted-foreground self-center">
                  +{skillCount - 5} autres
                </span>
              )}
            </div>
          </div>
        )}

        {profile.selectedSector && (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Secteur choisi</p>
            <p className="text-sm text-foreground">{profile.selectedSector}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
