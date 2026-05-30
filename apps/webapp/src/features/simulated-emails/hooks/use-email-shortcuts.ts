import { useEffect } from 'react';

interface ShortcutHandlers {
  enabled: boolean;
  onPrev: () => void;
  onNext: () => void;
  onReply: () => void;
  onArchive: () => void;
  onMarkUnread: () => void;
  onClose: () => void;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return false;
}

/**
 * Inbox-style keyboard shortcuts. Active only when `enabled` is true.
 * Esc fires even from inside inputs; other keys are ignored when typing.
 */
export function useEmailShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    if (!handlers.enabled) return;

    function onKeyDown(e: KeyboardEvent) {
      // Esc always works
      if (e.key === 'Escape') {
        e.preventDefault();
        handlers.onClose();
        return;
      }

      if (isEditableTarget(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key.toLowerCase()) {
        case 'j':
          e.preventDefault();
          handlers.onNext();
          break;
        case 'k':
          e.preventDefault();
          handlers.onPrev();
          break;
        case 'r':
          e.preventDefault();
          handlers.onReply();
          break;
        case 'e':
          e.preventDefault();
          handlers.onArchive();
          break;
        case 'u':
          e.preventDefault();
          handlers.onMarkUnread();
          break;
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [handlers]);
}
