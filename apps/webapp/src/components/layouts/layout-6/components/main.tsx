import { useBodyClass } from '@/hooks/use-body-class';
import { useIsMobile } from '@/hooks/use-mobile';
import { useContextualMenu } from '@/hooks/use-contextual-menu';
import { Footer } from './footer';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { SimulationContextBar } from './simulation-context-bar';
import { Outlet, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';

export function Main() {
  const isMobile = useIsMobile();
  const { isInSimulation, simulationId } = useContextualMenu();
  const location = useLocation();

  useBodyClass(`
    [--header-height:60px]
    [--sidebar-width:270px]
    lg:overflow-hidden
    bg-muted!
  `);

  return (
    <div className="flex grow">
      {!isMobile && <Sidebar />}

      {isMobile && <Header />}

      <div className="flex flex-col lg:flex-row grow pt-(--header-height) lg:pt-0">
        <div className="flex flex-col grow items-stretch rounded-xl bg-background border border-input lg:ms-(--sidebar-width) mt-0 lg:mt-[15px] m-[15px]">
          {isInSimulation && simulationId && (
            <SimulationContextBar simulationId={simulationId} />
          )}
          <div className="flex flex-col grow kt-scrollable-y-auto [--kt-scrollbar-width:auto] pt-5">
            <main className="grow px-4 lg:px-5" role="content">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </main>
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}
