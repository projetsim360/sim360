import { useCallback, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useOnboarding } from '../hooks/use-onboarding';
import { useProfile } from '../api/profile.api';
import { STEP_META } from '../config/onboarding.config';
import type { OnboardingLiveState } from '../config/onboarding.config';
import { OnboardingRail } from '../components/onboarding-rail';
import { OnboardingTopbar } from '../components/onboarding-topbar';
import { ProfilStep } from './profil-step';
import { AptitudeTestStep } from './aptitude-test-step';
import { DiagnosticStep } from './diagnostic-step';
import { ChoosePathStep } from './choose-path-step';

const OnboardingPage = () => {
  const { data: profile } = useProfile();
  const [live, setLive] = useState<OnboardingLiveState>({});
  const handleLive = useCallback(
    (p: Partial<OnboardingLiveState>) => setLive((prev) => ({ ...prev, ...p })),
    [],
  );
  const reduce = useReducedMotion();

  const {
    currentStep,
    currentNumber,
    totalSteps,
    stepperItems,
    goToNext,
    goToBack,
    goToStep,
    markCompleted,
    setQuestionnaireData,
    questionnaireData,
  } = useOnboarding();

  const meta = STEP_META[currentStep];

  const renderBody = () => {
    switch (currentStep) {
      case 'profil':
        return (
          <ProfilStep
            profile={profile}
            defaultValues={questionnaireData}
            onLiveChange={handleLive}
            onNext={(data) => {
              setQuestionnaireData(data);
              markCompleted('profil');
              goToNext();
            }}
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
    <div className="flex min-h-screen w-full bg-[var(--neutral-0)]">
      <OnboardingRail
        items={stepperItems}
        currentStep={currentStep}
        profile={profile}
        live={live}
        onStepClick={goToStep}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <OnboardingTopbar
          items={stepperItems}
          currentStep={currentStep}
          currentNumber={currentNumber}
          totalSteps={totalSteps}
          profile={profile}
          live={live}
          onStepClick={goToStep}
        />
        <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-9 sm:px-8 sm:py-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={reduce ? false : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: -24 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="text-[11.5px] font-bold uppercase tracking-wider text-[var(--accent-700)]">
                Étape {currentNumber} sur {totalSteps}
              </span>
              <h1 className="mt-2 font-display text-[25px] font-extrabold tracking-tight text-[var(--brand-700)]">
                {meta.title}
              </h1>
              <p className="mt-1.5 max-w-[46ch] text-sm leading-relaxed text-[var(--neutral-500)]">
                {meta.lead}
              </p>
              <div className="mt-7">{renderBody()}</div>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default OnboardingPage;
