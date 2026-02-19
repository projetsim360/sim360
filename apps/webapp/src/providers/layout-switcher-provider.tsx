import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

const STORAGE_KEY = 'sim360_layout';
const DEFAULT_LAYOUT = import.meta.env.VITE_DEFAULT_LAYOUT || 'layout-6';

function getInitialLayout(): string {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored || DEFAULT_LAYOUT;
}

interface LayoutSwitcherContextType {
  currentLayout: string;
  setLayout: (layoutId: string) => void;
  resetLayout: () => void;
}

const LayoutSwitcherContext = createContext<LayoutSwitcherContextType | null>(null);

export function LayoutSwitcherProvider({ children }: { children: ReactNode }) {
  const [currentLayout, setCurrentLayout] = useState(getInitialLayout);

  const setLayout = useCallback((layoutId: string) => {
    localStorage.setItem(STORAGE_KEY, layoutId);
    setCurrentLayout(layoutId);
  }, []);

  const resetLayout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentLayout(DEFAULT_LAYOUT);
  }, []);

  return (
    <LayoutSwitcherContext.Provider value={{ currentLayout, setLayout, resetLayout }}>
      {children}
    </LayoutSwitcherContext.Provider>
  );
}

export function useLayoutSwitcher() {
  const context = useContext(LayoutSwitcherContext);
  if (!context) {
    throw new Error('useLayoutSwitcher must be used within a LayoutSwitcherProvider');
  }
  return context;
}
