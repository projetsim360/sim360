import { useEffect, useRef, useState } from 'react';

const DRAFT_KEY_PREFIX = 'simex.draft.email.';
const DEBOUNCE_MS = 800;

/**
 * Auto-saves and restores a per-email reply draft to localStorage.
 * Writes are debounced (800ms). Pass `emailId === null` to no-op.
 */
export function useEmailDraft(emailId: string | null) {
  const [draft, setDraftState] = useState<string>('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentIdRef = useRef<string | null>(null);

  // Load draft when emailId changes
  useEffect(() => {
    currentIdRef.current = emailId;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!emailId) {
      setDraftState('');
      return;
    }
    try {
      const stored = window.localStorage.getItem(DRAFT_KEY_PREFIX + emailId);
      setDraftState(stored ?? '');
    } catch {
      setDraftState('');
    }
  }, [emailId]);

  function setDraft(value: string) {
    setDraftState(value);
    const id = currentIdRef.current;
    if (!id) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        if (value.length === 0) {
          window.localStorage.removeItem(DRAFT_KEY_PREFIX + id);
        } else {
          window.localStorage.setItem(DRAFT_KEY_PREFIX + id, value);
        }
      } catch {
        // localStorage may be full or blocked — silently degrade.
      }
    }, DEBOUNCE_MS);
  }

  function clearDraft() {
    const id = currentIdRef.current;
    setDraftState('');
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!id) return;
    try {
      window.localStorage.removeItem(DRAFT_KEY_PREFIX + id);
    } catch {
      // ignore
    }
  }

  // Cancel pending write on unmount (debounced writes are best-effort).
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  return { draft, setDraft, clearDraft };
}
