import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/providers/auth-provider';
import { api } from '@/lib/api-client';
import { AvatarUpload } from '@/components/common/avatar-upload';
import {
  Check,
  User,
  Globe,
  Award,
  ImageIcon,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from '@/components/keenicons/icons';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';

const STEPS = [
  { label: 'Identite', icon: User, description: 'Vos informations' },
  { label: 'Langue', icon: Globe, description: 'Votre preference' },
  { label: 'Experience', icon: Award, description: 'Votre niveau' },
  { label: 'Photo', icon: ImageIcon, description: 'Votre avatar' },
];

export function ProfileWizardPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    language: 'fr',
    experienceLevel: '',
    bio: '',
    jobTitle: '',
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canNext = () => {
    if (step === 0) return formData.firstName.trim() && formData.lastName.trim();
    if (step === 1) return formData.language;
    if (step === 2) return formData.experienceLevel;
    return true;
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      await api.post('/users/me/complete-wizard', formData);
      await refreshUser();
      navigate('/dashboard', { replace: true });
    } catch {
      setError('Une erreur est survenue. Veuillez reessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressValue = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="flex flex-col min-h-screen">
      <div className="grid lg:grid-cols-2 grow">
        {/* Panneau formulaire — gauche */}
        <div className="flex flex-col justify-center items-center p-6 sm:p-8 lg:p-12 order-2 lg:order-1">
          <div className="w-full max-w-lg">
            {/* Header */}
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Completez votre profil
              </h1>
              <p className="text-muted-foreground mt-1.5 text-sm">
                Etape {step + 1} sur {STEPS.length} &mdash; {STEPS[step].description}
              </p>
            </div>

            {/* Step indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                {STEPS.map((s, i) => {
                  const Icon = s.icon;
                  const isActive = i === step;
                  const isCompleted = i < step;

                  return (
                    <div key={s.label} className="flex items-center flex-1 last:flex-none">
                      <button
                        type="button"
                        onClick={() => i < step && setStep(i)}
                        disabled={i > step}
                        className={`
                          relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300
                          ${isCompleted
                            ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25 cursor-pointer'
                            : isActive
                              ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30 scale-110'
                              : 'bg-muted text-muted-foreground cursor-default'
                          }
                        `}
                      >
                        {isCompleted ? (
                          <Check className="h-4.5 w-4.5" />
                        ) : (
                          <Icon className="h-4.5 w-4.5" />
                        )}
                      </button>
                      {i < STEPS.length - 1 && (
                        <div className="flex-1 mx-2">
                          <div
                            className={`h-0.5 rounded-full transition-colors duration-300 ${
                              i < step ? 'bg-primary' : 'bg-border'
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Progress bar */}
            <Progress value={progressValue} className="mb-6 h-1" />

            {/* Error */}
            {error && (
              <Alert variant="destructive" appearance="light" close onClose={() => setError('')} className="mb-4">
                <AlertIcon><AlertCircle /></AlertIcon>
                <AlertTitle>{error}</AlertTitle>
              </Alert>
            )}

            {/* Step content */}
            <Card className="shadow-sm border-border/60">
              <CardContent className="p-6">
                {/* Step 0: Basic Info */}
                {step === 0 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">Informations de base</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Comment souhaitez-vous etre identifie ?
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">
                            Prenom <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => updateField('firstName', e.target.value)}
                            placeholder="Votre prenom"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">
                            Nom <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => updateField('lastName', e.target.value)}
                            placeholder="Votre nom"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="jobTitle">Poste</Label>
                        <Input
                          id="jobTitle"
                          value={formData.jobTitle}
                          onChange={(e) => updateField('jobTitle', e.target.value)}
                          placeholder="Ex: Chef de projet, Developpeur..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={formData.bio}
                          onChange={(e) => updateField('bio', e.target.value)}
                          placeholder="Decrivez-vous en quelques mots..."
                          rows={3}
                        />
                        <p className="text-xs text-muted-foreground">Optionnel. Visible par les membres de votre equipe.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 1: Language */}
                {step === 1 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">Langue preferee</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Choisissez la langue de l'interface
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { value: 'fr', label: 'Francais', flag: '\uD83C\uDDEB\uD83C\uDDF7', desc: 'Interface en francais' },
                        { value: 'en', label: 'English', flag: '\uD83C\uDDEC\uD83C\uDDE7', desc: 'English interface' },
                      ].map((lang) => {
                        const selected = formData.language === lang.value;
                        return (
                          <button
                            key={lang.value}
                            type="button"
                            onClick={() => updateField('language', lang.value)}
                            className={`
                              group relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200
                              ${selected
                                ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
                                : 'border-border hover:border-primary/40 hover:bg-muted/50'
                              }
                            `}
                          >
                            {selected && (
                              <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                <Check className="h-3 w-3 text-primary-foreground" />
                              </div>
                            )}
                            <span className="text-4xl">{lang.flag}</span>
                            <div className="text-center">
                              <p className={`font-semibold text-sm ${selected ? 'text-primary' : 'text-foreground'}`}>
                                {lang.label}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">{lang.desc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Step 2: Experience */}
                {step === 2 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">Niveau d'experience</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Cela nous aide a adapter votre experience
                      </p>
                    </div>

                    <div className="space-y-3">
                      {[
                        {
                          value: 'beginner',
                          label: 'Debutant',
                          desc: 'Je decouvre la simulation d\'entreprise',
                          emoji: '\uD83C\uDF31',
                        },
                        {
                          value: 'intermediate',
                          label: 'Intermediaire',
                          desc: 'J\'ai deja participe a des simulations',
                          emoji: '\uD83D\uDE80',
                        },
                        {
                          value: 'advanced',
                          label: 'Avance',
                          desc: 'Je maitrise les concepts de simulation',
                          emoji: '\u2B50',
                        },
                      ].map((level) => {
                        const selected = formData.experienceLevel === level.value;
                        return (
                          <button
                            key={level.value}
                            type="button"
                            onClick={() => updateField('experienceLevel', level.value)}
                            className={`
                              group w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200
                              ${selected
                                ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
                                : 'border-border hover:border-primary/40 hover:bg-muted/50'
                              }
                            `}
                          >
                            <span className="text-2xl flex-shrink-0">{level.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <p className={`font-semibold text-sm ${selected ? 'text-primary' : 'text-foreground'}`}>
                                {level.label}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">{level.desc}</p>
                            </div>
                            {selected && (
                              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                <Check className="h-3 w-3 text-primary-foreground" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Step 3: Photo */}
                {step === 3 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">Photo de profil</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Ajoutez une photo pour personnaliser votre compte
                      </p>
                    </div>

                    <div className="flex justify-center py-4">
                      <AvatarUpload
                        currentAvatar={user?.avatar}
                        firstName={formData.firstName}
                        lastName={formData.lastName}
                      />
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4 border border-border/60">
                      <p className="text-xs text-muted-foreground text-center">
                        Cette etape est optionnelle. Vous pourrez toujours ajouter ou modifier votre photo dans les parametres.
                      </p>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-5 border-t border-border/60">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleBack}
                    className={step === 0 ? 'invisible' : ''}
                  >
                    <ArrowLeft className="h-4 w-4 me-2" />
                    Retour
                  </Button>

                  <div className="flex items-center gap-1.5">
                    {STEPS.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          i === step ? 'w-6 bg-primary' : i < step ? 'w-1.5 bg-primary/50' : 'w-1.5 bg-border'
                        }`}
                      />
                    ))}
                  </div>

                  {step < STEPS.length - 1 ? (
                    <Button type="button" onClick={handleNext} disabled={!canNext()}>
                      Suivant
                      <ArrowRight className="h-4 w-4 ms-2" />
                    </Button>
                  ) : (
                    <Button type="button" onClick={handleComplete} disabled={isSubmitting}>
                      {isSubmitting ? 'Sauvegarde...' : 'Terminer'}
                      {!isSubmitting && <Check className="h-4 w-4 ms-2" />}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Panneau branding — droite (identique a AuthLayout) */}
        <div className="lg:rounded-xl lg:border lg:border-border lg:m-5 order-1 lg:order-2 bg-primary relative overflow-hidden flex flex-col">
          <img
            src="/media/app/auth-bg.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-20"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="relative z-10 flex flex-col p-8 lg:p-16 gap-4">
            <Link to="/">
              <img
                src="/media/app/mini-logo.svg"
                alt="Sim360"
                className="h-7 max-w-none brightness-0 invert"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </Link>
            <div className="flex flex-col gap-3">
              <h3 className="text-2xl font-semibold text-white">
                Bienvenue sur Sim360
              </h3>
              <p className="text-base font-medium text-white/80">
                Configurez votre profil pour profiter pleinement de la plateforme
                de simulation et gestion intelligente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
