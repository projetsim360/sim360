import { useParams, useNavigate, Link } from 'react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KeenIcon } from '@/components/keenicons';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useCampaignPublicInfo, useJoinCampaign } from '../api/recruitment.api';

const INFO_CARDS = [
  {
    icon: 'chart-simple',
    title: 'Decisions strategiques',
    description: 'Prenez des decisions critiques qui impactent le projet : budget, planning, ressources et risques.',
  },
  {
    icon: 'people',
    title: 'Reunions virtuelles',
    description: 'Participez a des reunions avec des parties prenantes simulees par IA et defendez vos choix.',
  },
  {
    icon: 'document',
    title: 'Livrables professionnels',
    description: 'Produisez des livrables concrets : plans, rapports, analyses de risques et tableaux de bord.',
  },
];

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !info) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <KeenIcon icon="information-2" style="duotone" className="size-8 text-destructive" />
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

  if (info.isFull) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center">
              <KeenIcon icon="people" style="duotone" className="size-8 text-warning" />
            </div>
            <h2 className="text-lg font-semibold">Campagne complete</h2>
            <p className="text-sm text-muted-foreground text-center">
              Cette campagne a atteint le nombre maximum de candidats.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!info.isOpen) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center">
              <KeenIcon icon="lock" style="duotone" className="size-8 text-warning" />
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <KeenIcon icon="briefcase" style="duotone" className="size-8 text-white" />
          </div>
          <Badge variant="primary" appearance="light" size="sm">
            {info.companyName}
          </Badge>
          <h1 className="text-2xl font-bold text-foreground mt-2">{info.title}</h1>
          <p className="text-base text-muted-foreground">
            Evaluation par simulation de gestion de projet
          </p>
        </div>

        {/* Job info card */}
        <Card>
          <CardContent className="py-6 space-y-5">
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <KeenIcon icon="briefcase" style="duotone" className="size-4 text-primary" />
                Poste
              </h3>
              <p className="text-sm font-medium">{info.jobTitle}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <KeenIcon icon="document" style="duotone" className="size-4 text-primary" />
                Description
              </h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {info.description}
              </p>
            </div>

            {/* Process description */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Vous allez piloter un projet fictif pendant environ 1 heure.
                Vous serez confronte a des situations realistes : decisions strategiques,
                reunions d'equipe, evenements imprevus et livrables a produire.
                Vos actions seront evaluees par une IA pour produire un rapport 360.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 3 info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {INFO_CARDS.map((card) => (
            <Card key={card.icon}>
              <CardContent className="py-5 flex flex-col items-center text-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <KeenIcon icon={card.icon} style="duotone" className="size-5 text-primary" />
                </div>
                <h4 className="text-sm font-semibold">{card.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How it works + duration */}
        <Card>
          <CardContent className="py-6 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <KeenIcon icon="time" style="duotone" className="size-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Duree estimee</p>
                <p className="text-sm text-muted-foreground">~1 heure</p>
              </div>
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

            <p className="text-sm text-muted-foreground text-center">
              Vous serez guide etape par etape tout au long de la simulation.
            </p>

            <Button
              variant="accent"
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
                  <KeenIcon icon="rocket" style="duotone" className="size-5" />
                  Commencer l'evaluation
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Footer with recruiter note (US-8.1) */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Propulse par ProjectSim360 - Evaluation par simulation de gestion de projet
          </p>
          <p className="text-sm text-muted-foreground">
            Vous etes recruteur ?{' '}
            <Link to="/contact" className="text-primary hover:underline font-medium">
              Contactez-nous pour creer votre espace entreprise.
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
