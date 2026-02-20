import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/auth-provider';
import { api } from '@/lib/api-client';
import { AvatarUpload } from '@/components/common/avatar-upload';
import { Check } from '@/components/keenicons/icons';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const STEPS = ['Infos de base', 'Langue', 'Expérience', 'Photo'];

export function ProfileWizardPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await api.post('/users/me/complete-wizard', formData);
      await refreshUser();
      navigate('/dashboard', { replace: true });
    } catch {
      alert('Erreur lors de la sauvegarde du profil');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Bienvenue sur Sim360</h1>
          <p className="text-muted-foreground mt-2">Complétez votre profil pour commencer</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  i <= step
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {i < step ? <Check size={16} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-8 h-0.5 mx-1 ${
                    i < step ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Card>
          <CardContent className="pt-5">
            {/* Step 0: Basic Info */}
            {step === 0 && (
              <div className="grid gap-5">
                <h3 className="text-lg font-semibold">Informations de base</h3>
                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <Label className="flex w-full max-w-32">Prénom</Label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => updateField('firstName', e.target.value)}
                    />
                  </div>
                </div>
                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <Label className="flex w-full max-w-32">Nom</Label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => updateField('lastName', e.target.value)}
                    />
                  </div>
                </div>
                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <Label className="flex w-full max-w-32">Poste</Label>
                    <Input
                      value={formData.jobTitle}
                      onChange={(e) => updateField('jobTitle', e.target.value)}
                      placeholder="Ex: Chef de projet (optionnel)"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Language */}
            {step === 1 && (
              <div className="grid gap-5">
                <h3 className="text-lg font-semibold">Langue préférée</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'fr', label: 'Français', flag: '🇫🇷' },
                    { value: 'en', label: 'English', flag: '🇬🇧' },
                  ].map((lang) => (
                    <button
                      key={lang.value}
                      type="button"
                      onClick={() => updateField('language', lang.value)}
                      className={`p-4 border rounded-lg text-left transition-colors ${
                        formData.language === lang.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <span className="text-2xl">{lang.flag}</span>
                      <p className="mt-2 font-medium">{lang.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Experience */}
            {step === 2 && (
              <div className="grid gap-5">
                <h3 className="text-lg font-semibold">Niveau d'expérience</h3>
                <div className="space-y-3">
                  {[
                    { value: 'beginner', label: 'Débutant', desc: "Je découvre la simulation d'entreprise" },
                    { value: 'intermediate', label: 'Intermédiaire', desc: "J'ai déjà participé à des simulations" },
                    { value: 'advanced', label: 'Avancé', desc: 'Je maîtrise les concepts de simulation' },
                  ].map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => updateField('experienceLevel', level.value)}
                      className={`w-full p-4 border rounded-lg text-left transition-colors ${
                        formData.experienceLevel === level.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <p className="font-medium">{level.label}</p>
                      <p className="text-sm text-muted-foreground mt-1">{level.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Photo */}
            {step === 3 && (
              <div className="grid gap-5">
                <h3 className="text-lg font-semibold">Photo de profil</h3>
                <p className="text-sm text-muted-foreground">
                  Ajoutez une photo pour personnaliser votre profil (optionnel).
                </p>
                <AvatarUpload
                  currentAvatar={user?.avatar}
                  firstName={formData.firstName}
                  lastName={formData.lastName}
                />
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className={step === 0 ? 'invisible' : ''}
              >
                Retour
              </Button>

              {step < STEPS.length - 1 ? (
                <Button type="button" onClick={handleNext} disabled={!canNext()}>
                  Suivant
                </Button>
              ) : (
                <Button type="button" onClick={handleComplete} disabled={isSubmitting}>
                  {isSubmitting ? 'Sauvegarde...' : 'Terminer'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
