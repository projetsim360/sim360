import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

/* ============================================================
   Types
   ============================================================ */

export type ShellVariant = 'brand' | 'neutre';
export type ContentMode = 'fluide' | 'centre';

export interface ShellState {
  // Sidebar (desktop collapse)
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Sidebar (mobile drawer)
  sidebarMobileOpen: boolean;
  setSidebarMobileOpen: (v: boolean) => void;
  toggleSidebarMobile: () => void;

  // PMO drawer
  pmoOpen: boolean;
  setPmoOpen: (v: boolean) => void;
  togglePmo: () => void;

  // Search modal
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  openSearch: () => void;
  closeSearch: () => void;

  // Notifications popover
  notifOpen: boolean;
  setNotifOpen: (v: boolean) => void;
  toggleNotif: () => void;

  // User menu popover
  userMenuOpen: boolean;
  setUserMenuOpen: (v: boolean) => void;
  toggleUserMenu: () => void;

  // Shell variant (brand | neutre)
  shellVariant: ShellVariant;
  setShellVariant: (v: ShellVariant) => void;

  // Content mode (fluide | centre)
  contentMode: ContentMode;
  setContentMode: (v: ContentMode) => void;

  // Focus mode
  focusMode: boolean;
  toggleFocusMode: () => void;
}

/* ============================================================
   Context
   ============================================================ */

const ShellStateContext = createContext<ShellState | null>(null);

export function useShellState(): ShellState {
  const ctx = useContext(ShellStateContext);
  if (!ctx) {
    throw new Error('useShellState must be used inside <ShellStateProvider>');
  }
  return ctx;
}

/* ============================================================
   localStorage helpers
   ============================================================ */

const LS_SIDEBAR   = 'simex.sidebar-collapsed';
const LS_VARIANT   = 'simex.shell-variant';
const LS_CONTENT   = 'simex.content-mode';

function readBool(key: string, fallback: boolean): boolean {
  try {
    const v = localStorage.getItem(key);
    if (v === null) return fallback;
    return v === 'true';
  } catch {
    return fallback;
  }
}

function readString<T extends string>(key: string, fallback: T, allowed: T[]): T {
  try {
    const v = localStorage.getItem(key) as T | null;
    if (v && allowed.includes(v)) return v;
    return fallback;
  } catch {
    return fallback;
  }
}

/* ============================================================
   Provider
   ============================================================ */

interface ShellStateProviderProps {
  children: ReactNode;
}

export function ShellStateProvider({ children }: ShellStateProviderProps) {
  /* ---- Initial state from localStorage ---- */
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() =>
    readBool(LS_SIDEBAR, false),
  );
  const [sidebarMobileOpen, setSidebarMobileOpenRaw] = useState(false);
  const [pmoOpen, setPmoOpenRaw] = useState(false);
  const [searchOpen, setSearchOpenRaw] = useState(false);
  const [notifOpen, setNotifOpenRaw] = useState(false);
  const [userMenuOpen, setUserMenuOpenRaw] = useState(false);
  const [shellVariant, setShellVariantRaw] = useState<ShellVariant>(() =>
    readString<ShellVariant>(LS_VARIANT, 'brand', ['brand', 'neutre']),
  );
  const [contentMode, setContentModeRaw] = useState<ContentMode>(() =>
    readString<ContentMode>(LS_CONTENT, 'fluide', ['fluide', 'centre']),
  );
  const [focusMode, setFocusMode] = useState(false);

  /* ---- Side-effects: sync state → DOM ---- */

  useEffect(() => {
    document.body.classList.toggle('is-sidebar-collapsed', sidebarCollapsed);
    try { localStorage.setItem(LS_SIDEBAR, String(sidebarCollapsed)); } catch { /* */ }
  }, [sidebarCollapsed]);

  useEffect(() => {
    document.body.dataset.shell = shellVariant;
    try { localStorage.setItem(LS_VARIANT, shellVariant); } catch { /* */ }
  }, [shellVariant]);

  useEffect(() => {
    document.body.dataset.content = contentMode;
    try { localStorage.setItem(LS_CONTENT, contentMode); } catch { /* */ }
  }, [contentMode]);

  useEffect(() => {
    document.body.classList.toggle('is-focus', focusMode);
  }, [focusMode]);

  /* ---- Convenience actions ---- */

  const toggleSidebar = useCallback(() => setSidebarCollapsed((v) => !v), []);

  const setSidebarMobileOpen = useCallback((v: boolean) => setSidebarMobileOpenRaw(v), []);
  const toggleSidebarMobile = useCallback(() => setSidebarMobileOpenRaw((v) => !v), []);

  const setPmoOpen = useCallback((v: boolean) => setPmoOpenRaw(v), []);
  const togglePmo = useCallback(() => setPmoOpenRaw((v) => !v), []);

  const setSearchOpen = useCallback((v: boolean) => setSearchOpenRaw(v), []);
  const openSearch = useCallback(() => setSearchOpenRaw(true), []);
  const closeSearch = useCallback(() => setSearchOpenRaw(false), []);

  const setNotifOpen = useCallback(
    (v: boolean) => {
      setNotifOpenRaw(v);
      if (v) {
        // Close other popovers
        setUserMenuOpenRaw(false);
      }
    },
    [],
  );
  const toggleNotif = useCallback(
    () =>
      setNotifOpenRaw((prev) => {
        if (!prev) setUserMenuOpenRaw(false);
        return !prev;
      }),
    [],
  );

  const setUserMenuOpen = useCallback(
    (v: boolean) => {
      setUserMenuOpenRaw(v);
      if (v) {
        setNotifOpenRaw(false);
      }
    },
    [],
  );
  const toggleUserMenu = useCallback(
    () =>
      setUserMenuOpenRaw((prev) => {
        if (!prev) setNotifOpenRaw(false);
        return !prev;
      }),
    [],
  );

  const setShellVariant = useCallback((v: ShellVariant) => setShellVariantRaw(v), []);
  const setContentMode = useCallback((v: ContentMode) => setContentModeRaw(v), []);
  const toggleFocusMode = useCallback(() => setFocusMode((v) => !v), []);

  /* ---- Global keyboard shortcuts ---- */

  // Track open state in refs for the event listener (avoids stale closure)
  const searchOpenRef = useRef(searchOpen);
  searchOpenRef.current = searchOpen;
  const notifOpenRef = useRef(notifOpen);
  notifOpenRef.current = notifOpen;
  const userMenuOpenRef = useRef(userMenuOpen);
  userMenuOpenRef.current = userMenuOpen;
  const pmoOpenRef = useRef(pmoOpen);
  pmoOpenRef.current = pmoOpen;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Cmd+K / Ctrl+K → open search
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpenRaw(true);
        return;
      }

      // Escape → close in priority order: search > popovers > PMO
      if (e.key === 'Escape') {
        if (searchOpenRef.current) {
          setSearchOpenRaw(false);
          return;
        }
        if (notifOpenRef.current) {
          setNotifOpenRaw(false);
          return;
        }
        if (userMenuOpenRef.current) {
          setUserMenuOpenRaw(false);
          return;
        }
        if (pmoOpenRef.current) {
          setPmoOpenRaw(false);
          return;
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []); // stable — uses refs for current values

  /* ---- Provide ---- */

  const value: ShellState = {
    sidebarCollapsed,
    toggleSidebar,
    sidebarMobileOpen,
    setSidebarMobileOpen,
    toggleSidebarMobile,
    pmoOpen,
    setPmoOpen,
    togglePmo,
    searchOpen,
    setSearchOpen,
    openSearch,
    closeSearch,
    notifOpen,
    setNotifOpen,
    toggleNotif,
    userMenuOpen,
    setUserMenuOpen,
    toggleUserMenu,
    shellVariant,
    setShellVariant,
    contentMode,
    setContentMode,
    focusMode,
    toggleFocusMode,
  };

  return (
    <ShellStateContext.Provider value={value}>
      {children}
    </ShellStateContext.Provider>
  );
}
