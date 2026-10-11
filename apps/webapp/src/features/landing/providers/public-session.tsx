import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '@/lib/api-client';
import { isAuthenticated } from '@/lib/auth';

/** The few user fields the public pages need (greeting, avatar, "Dashboard" button). */
export interface PublicUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string | null;
  role: string;
}

interface PublicSession {
  user: PublicUser | null;
  /** True while a stored token is being exchanged for the user; false when there is no token. */
  isLoading: boolean;
}

const PublicSessionContext = createContext<PublicSession>({ user: null, isLoading: false });

/**
 * Read-only session for the public site: if a token is stored, fetch the user once.
 * No refresh loop, no socket, no cache: the application entry owns all of that.
 */
export function PublicSessionProvider({ children }: { children: ReactNode }) {
  // Starts signed-out on purpose: the prerendered HTML and the first client render must match.
  const [session, setSession] = useState<PublicSession>({ user: null, isLoading: false });

  useEffect(() => {
    if (!isAuthenticated()) return;
    let cancelled = false;
    setSession({ user: null, isLoading: true });
    api
      .get<PublicUser>('/users/me')
      .then((user) => !cancelled && setSession({ user, isLoading: false }))
      .catch(() => !cancelled && setSession({ user: null, isLoading: false }));
    return () => {
      cancelled = true;
    };
  }, []);

  return <PublicSessionContext.Provider value={session}>{children}</PublicSessionContext.Provider>;
}

export function usePublicSession(): PublicSession {
  return useContext(PublicSessionContext);
}
