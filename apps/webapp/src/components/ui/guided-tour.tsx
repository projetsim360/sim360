import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { KeenIcon } from '@/components/keenicons';

interface TourStep {
  target: string;
  title: string;
  description: string;
}

interface GuidedTourProps {
  steps: TourStep[];
  storageKey: string;
  onComplete?: () => void;
}

interface Position {
  top: number;
  left: number;
  placement: 'bottom' | 'top';
}

function getCardPosition(targetEl: Element): Position {
  const rect = targetEl.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;
  const cardHeight = 180;
  const cardWidth = 360;

  const placement = spaceBelow > cardHeight + 16 ? 'bottom' : 'top';

  let top: number;
  if (placement === 'bottom') {
    top = rect.bottom + window.scrollY + 12;
  } else {
    top = rect.top + window.scrollY - cardHeight - 12;
  }

  let left = rect.left + window.scrollX + rect.width / 2 - cardWidth / 2;
  left = Math.max(16, Math.min(left, window.innerWidth - cardWidth - 16));

  return { top, left, placement };
}

export function GuidedTour({ steps, storageKey, onComplete }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const rafRef = useRef<number>(0);

  const dismiss = useCallback(() => {
    setVisible(false);
    localStorage.setItem(storageKey, 'true');
    onComplete?.();
  }, [storageKey, onComplete]);

  const updatePosition = useCallback(() => {
    if (!visible || currentStep >= steps.length) return;

    const step = steps[currentStep];
    const el = document.querySelector(step.target);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    setTargetRect(rect);
    setPosition(getCardPosition(el));
  }, [visible, currentStep, steps]);

  // Initialize tour visibility
  useEffect(() => {
    if (localStorage.getItem(storageKey)) return;

    // Delay to let the page render
    const timer = setTimeout(() => {
      const firstEl = document.querySelector(steps[0]?.target);
      if (firstEl) {
        setVisible(true);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [storageKey, steps]);

  // Update position when step changes
  useEffect(() => {
    if (!visible) return;

    updatePosition();

    const handleScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updatePosition);
    };

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [visible, currentStep, updatePosition]);

  function handleNext() {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      dismiss();
    }
  }

  if (!visible || !position || !targetRect) return null;

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  return createPortal(
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[9998] bg-black/50 pointer-events-auto" onClick={dismiss} />

      {/* Target highlight */}
      <div
        className="fixed z-[9999] rounded-lg pointer-events-none"
        style={{
          top: targetRect.top - 4,
          left: targetRect.left - 4,
          width: targetRect.width + 8,
          height: targetRect.height + 8,
          boxShadow: '0 0 0 4px rgba(255,255,255,0.8), 0 0 20px 4px rgba(255,255,255,0.3)',
        }}
      />

      {/* Tour card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: position.placement === 'bottom' ? -8 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: position.placement === 'bottom' ? -8 : 8 }}
          transition={{ duration: 0.2 }}
          className="fixed z-[10000] w-[360px]"
          style={{ top: position.top, left: position.left }}
        >
          <Card className="shadow-xl border-primary/30">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center size-7 rounded-full bg-primary/10 shrink-0">
                    <KeenIcon icon="compass" style="duotone" className="size-4 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0 mt-1">
                  {currentStep + 1}/{steps.length}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              <div className="flex items-center justify-between pt-1">
                <Button variant="ghost" size="sm" onClick={dismiss} className="text-xs">
                  Passer
                </Button>
                <Button variant="primary" size="sm" onClick={handleNext} className="text-xs">
                  {isLast ? 'Terminer' : 'Suivant'}
                  <KeenIcon icon="right" style="solid" className="text-[10px] ms-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </>,
    document.body,
  );
}

export type { TourStep, GuidedTourProps };
