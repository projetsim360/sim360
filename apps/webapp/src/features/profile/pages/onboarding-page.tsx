import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useOnboarding } from '../hooks/use-onboarding';
import { useProfile } from '../api/profile.api';
import { OnboardingStepper } from '../components/onboarding-stepper';
import { ProfileSummaryCard } from '../components/profile-summary-card';
import { ProfileImportStep } from './profile-import-step';
import { QuestionnaireStep } from './questionnaire-step';
import { AptitudeTestStep } from './aptitude-test-step';
import { DiagnosticStep } from './diagnostic-step';
import { ChoosePathStep } from './choose-path-step';

const stepVariants = {
  enter: { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

const OnboardingPage = () => {
  const { data: profile } = useProfile();

  const {
    currentStep,
    steps,
    progress,
    canGoBack,
    goToNext,
    goToBack,
    goToStep,
    isStepCompleted,
    markCompleted,
    setQuestionnaireData,
    questionnaireData,
    stepLabels,
  } = useOnboarding();

  const renderStep = () => {
    switch (currentStep) {
      case 'import':
        return (
          <ProfileImportStep
            onNext={() => {
              markCompleted('import');
              goToNext();
            }}
            profile={profile}
          />
        );
      case 'questionnaire':
        return (
          <QuestionnaireStep
            onNext={(data) => {
              setQuestionnaireData(data);
              markCompleted('questionnaire');
              goToNext();
            }}
            onBack={goToBack}
            defaultValues={questionnaireData}
          />
        );
      case 'aptitude-test':
        return (
          <AptitudeTestStep
            onNext={() => {
              markCompleted('aptitude-test');
              goToNext();
            }}
            onBack={goToBack}
          />
        );
      case 'diagnostic':
        return (
          <DiagnosticStep
            onNext={() => {
              markCompleted('diagnostic');
              goToNext();
            }}
            onBack={goToBack}
          />
        );
      case 'choose-path':
        return <ChoosePathStep onBack={goToBack} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground">Bienvenue sur ProjectSim360</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Completez votre profil pour demarrer votre simulation personnalisee
            </p>
          </div>

          <OnboardingStepper
            steps={steps}
            currentStep={currentStep}
            isStepCompleted={isStepCompleted}
            stepLabels={stepLabels}
            onStepClick={goToStep}
          />

          <Progress value={progress} className="mt-6 h-1" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          {/* Main step content */}
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sidebar summary */}
          <div className="hidden lg:block">
            {profile && <ProfileSummaryCard profile={profile} className="sticky top-4" />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
