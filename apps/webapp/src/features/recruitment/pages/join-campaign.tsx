import { useParams, useNavigate } from 'react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KeenIcon } from '@/components/keenicons';
import { toast } from 'sonner';
import { useCampaignPublicInfo, useJoinCampaign } from '../api/recruitment.api';

export default function JoinCampaignPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: info, isLoading, error } = useCampaignPublicInfo(slug!);
  const joinMutation = useJoinCampaign();

  const handleStart = async () => {
    try {
      const result = await joinMutation.mutateAsync(slug!);
      toast.success('Evaluation demarree avec succes');
      navigate(`/simulations/${result.simulationId}`);
    } catch {
      toast.error("Erreur lors du demarrage de l'evaluation. Veuillez vous connecter.");
      navigate(`/auth/sign-in?redirect=/recruitment/join/${slug}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !info) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <KeenIcon icon="information-2" style="outline" className="size-8 text-destructive" />
            </div>
            <h2 className="text-lg font-semibold">Campagne introuvable</h2>
            <p className="text-sm text-muted-foreground text-center">
              Ce lien de campagne n'est pas valide ou a expire.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!info.isOpen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center">
              <KeenIcon icon="lock" style="outline" className="size-8 text-warning" />
            </div>
            <h2 className="text-lg font-semibold">Campagne terminee</h2>
            <p className="text-sm text-muted-foreground text-center">
              Cette campagne de recrutement est terminee et n'accepte plus de nouvelles candidatures.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <KeenIcon icon="briefcase" style="solid" className="size-8 text-primary" />
          </div>
          <Badge variant="primary" appearance="light" size="sm">
            {info.companyName}
          </Badge>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">{info.title}</h1>
          <p className="text-sm text-muted-foreground">Evaluation par simulation</p>
        </div>

        {/* Details card */}
        <Card>
          <CardContent className="py-6 space-y-5">
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <KeenIcon icon="briefcase" style="outline" className="size-4 text-primary" />
                Poste
              </h3>
              <p className="text-sm font-medium">{info.jobTitle}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <KeenIcon icon="document" style="outline" className="size-4 text-primary" />
                Description
              </h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {info.description}
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <KeenIcon icon="time" style="outline" className="size-4 text-primary" />
              <span className="text-muted-foreground">Duree estimee :</span>
              <span className="font-medium">{info.estimatedDuration}</span>
            </div>

            <div className="rounded-lg border border-border bg-accent/30 p-4">
              <h4 className="text-sm font-semibold mb-2">Comment ca fonctionne ?</h4>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs shrink-0">1</span>
                  Connectez-vous ou creez un compte
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs shrink-0">2</span>
                  Lancez la simulation de gestion de projet
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs shrink-0">3</span>
                  Prenez des decisions, gerez des reunions et des evenements
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs shrink-0">4</span>
                  Recevez votre rapport d'evaluation 360
                </li>
              </ol>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleStart}
              disabled={joinMutation.isPending}
            >
              {joinMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Demarrage...
                </>
              ) : (
                <>
                  <KeenIcon icon="rocket" style="outline" className="size-5" />
                  Commencer l'evaluation
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-xs text-center text-muted-foreground">
          Propulse par ProjectSim360 - Evaluation par simulation de gestion de projet
        </p>
      </div>
    </div>
  );
}
