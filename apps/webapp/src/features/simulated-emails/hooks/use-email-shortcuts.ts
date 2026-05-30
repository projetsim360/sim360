import { useEffect, useRef } from 'react';

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
  if (target.isContentEditable) return true;
  if (target.getAttribute('role') === 'textbox') return true;
  const tag = target.tagName;
  if (tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (tag === 'INPUT') {
    const type = (target as HTMLInputElement).type;
    return !['button', 'submit', 'reset', 'checkbox', 'radio'].includes(type);
  }
  return false;
}

/**
 * Inbox-style keyboard shortcuts. Active only when `handlers.enabled` is true.
 * Esc fires even from inside inputs; other keys are ignored when typing.
 *
 * Handlers are held in a ref so the document listener is attached only when
 * `enabled` flips, not on every parent render.
 */
export function useEmailShortcuts(handlers: ShortcutHandlers) {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    if (!handlers.enabled) return;

    function onKeyDown(e: KeyboardEvent) {
      const h = handlersRef.current;

      // Esc always works, even from editable targets
      if (e.key === 'Escape') {
        e.preventDefault();
        h.onClose();
        return;
      }

      if (isEditableTarget(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key.toLowerCase()) {
        case 'j':
          e.preventDefault();
          h.onNext();
          break;
        case 'k':
          e.preventDefault();
          h.onPrev();
          break;
        case 'r':
          e.preventDefault();
          h.onReply();
          break;
        case 'e':
          e.preventDefault();
          h.onArchive();
          break;
        case 'u':
          e.preventDefault();
          h.onMarkUnread();
          break;
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [handlers.enabled]);
}
