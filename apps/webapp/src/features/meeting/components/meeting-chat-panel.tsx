import type { RefObject } from 'react';
import { cn } from '@/lib/utils';
import { KeenIcon } from '@/components/keenicons';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatBubble } from './chat-bubble';
import { participantAvatarColor } from './participant-avatar';
import type { ChatMessage, MeetingParticipant } from '../types/meeting.types';

interface MeetingChatPanelProps {
  variant: 'full' | 'drawer';
  participants: MeetingParticipant[];
  messages: ChatMessage[];
  input: string;
  streaming: boolean;
  /** True while the facilitator's opening statement is being prepared. */
  opening?: boolean;
  selectedParticipant: MeetingParticipant | null;
  onInputChange: (v: string) => void;
  onSelectParticipant: (p: MeetingParticipant) => void;
  onSend: () => void;
  scrollRef?: RefObject<HTMLDivElement | null>;
  inputRef?: RefObject<HTMLInputElement | null>;
}

export function MeetingChatPanel({
  variant,
  participants,
  messages,
  input,
  streaming,
  opening = false,
  selectedParticipant,
  onInputChange,
  onSelectParticipant,
  onSend,
  scrollRef,
  inputRef,
}: MeetingChatPanelProps) {
  const dark = variant === 'drawer';

  return (
    <div className={cn(
      'flex flex-col overflow-hidden h-full rounded-xl',
      dark ? 'bg-white/4 border border-white/10' : 'bg-card border border-[var(--neutral-200)]',
    )}>
      <ScrollArea className="flex-1 px-3 py-3" viewportRef={scrollRef}>
        <div className="space-y-3">
          {opening && messages.length === 0 && (
            <div role="status" aria-live="polite" className="flex flex-col items-center justify-center py-12 text-center">
              <div className={cn('size-12 rounded-2xl flex items-center justify-center mb-3', dark ? 'bg-white/8' : 'bg-[var(--brand-50)]')}>
                <span className={cn('size-5 rounded-full border-2 border-t-transparent animate-spin', dark ? 'border-[var(--accent-300)]' : 'border-[var(--brand-500)]')} />
              </div>
              <p className={cn('text-sm font-medium', dark ? 'text-[var(--brand-50)]' : 'text-foreground')}>La réunion démarre…</p>
              <p className={cn('text-xs mt-1 max-w-xs', dark ? 'text-[var(--brand-200)]' : 'text-[var(--neutral-500)]')}>
                Les participants s'installent, l'animateur va ouvrir la séance.
              </p>
            </div>
          )}
          {!opening && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className={cn('size-12 rounded-2xl flex items-center justify-center mb-3', dark ? 'bg-white/8' : 'bg-[var(--brand-50)]')}>
                <KeenIcon icon="message-text" style="duotone" className={cn('size-6', dark ? 'text-[var(--accent-300)]' : 'text-[var(--brand-500)]')} />
              </div>
              <p className={cn('text-sm font-medium', dark ? 'text-[var(--brand-50)]' : 'text-foreground')}>Démarrez la conversation</p>
              <p className={cn('text-xs mt-1 max-w-xs', dark ? 'text-[var(--brand-200)]' : 'text-[var(--neutral-500)]')}>
                Échangez avec les participants pour atteindre les objectifs de la réunion.
              </p>
            </div>
          )}
          {messages.map((msg) => (
            <ChatBubble key={msg.id} msg={msg} participants={participants} tone={dark ? 'dark' : 'light'} />
          ))}
        </div>
      </ScrollArea>

      <div className={cn('border-t p-3', dark ? 'border-white/10' : 'border-[var(--neutral-200)]')}>
        {participants.length > 1 && (
          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            <span className={cn('text-[10px] uppercase tracking-wider font-semibold shrink-0', dark ? 'text-[var(--brand-200)]' : 'text-[var(--neutral-500)]')}>
              Parler à
            </span>
            {participants.map((p) => {
              const active = selectedParticipant?.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSelectParticipant(p)}
                  className={cn(
                    'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer',
                    active
                      ? 'bg-[var(--accent-500)] text-white'
                      : dark
                        ? 'bg-white/8 text-[var(--brand-100)] border border-white/10 hover:bg-white/12'
                        : 'bg-[var(--neutral-100)] text-foreground border border-[var(--neutral-200)] hover:bg-[var(--neutral-200)]',
                  )}
                >
                  <span
                    className="size-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0"
                    style={{ background: active ? 'rgba(255,255,255,0.3)' : participantAvatarColor(p.name) }}
                  >
                    {p.name.charAt(0)}
                  </span>
                  {p.name.split(' ')[0]}
                </button>
              );
            })}
          </div>
        )}
        <div className={cn('flex items-center gap-2 rounded-xl px-3 py-1.5 border', dark ? 'bg-white/8 border-white/12' : 'bg-card border-[var(--neutral-200)]')}>
          <Input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder={`Message pour ${selectedParticipant?.name ?? 'le participant'}…`}
            aria-label="Message pour le participant"
            disabled={streaming || opening}
            className={cn('flex-1 border-0 shadow-none focus-visible:ring-0 focus-visible:outline-none bg-transparent px-0 h-9', dark && 'text-white placeholder:text-[var(--brand-200)]')}
          />
          <Button
            variant="primary"
            size="icon"
            onClick={onSend}
            disabled={!input.trim() || streaming || opening}
            title="Envoyer"
            className="shrink-0 size-8 rounded-lg bg-[var(--accent-500)] hover:bg-[var(--accent-600)] text-white"
          >
            <KeenIcon icon="arrow-up" style="duotone" className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
