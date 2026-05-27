import { cn } from '@/lib/utils';
import { KeenIcon } from '@/components/keenicons';
import { MarkdownContent } from '@/components/ui/markdown-content';
import { ParticipantAvatar } from './participant-avatar';
import type { ChatMessage, MeetingParticipant } from '../types/meeting.types';

interface ChatBubbleProps {
  msg: ChatMessage;
  participants: MeetingParticipant[];
  /** 'dark' = sur la scène audio (texte clair sur fond sombre). */
  tone?: 'light' | 'dark';
}

export function ChatBubble({ msg, participants, tone = 'light' }: ChatBubbleProps) {
  const isUser = msg.role === 'user';
  const participant = !isUser && msg.participantName
    ? participants.find((p) => p.name === msg.participantName)
    : null;

  return (
    <div className={cn('flex gap-2.5 max-w-[85%]', isUser ? 'ml-auto flex-row-reverse' : 'mr-auto')}>
      {isUser ? (
        <div className="shrink-0 size-8 rounded-full flex items-center justify-center bg-[var(--accent-500)] text-white">
          <KeenIcon icon="user" style="duotone" className="size-4" />
        </div>
      ) : participant ? (
        <ParticipantAvatar participant={participant} size="sm" />
      ) : (
        <div className="shrink-0 size-8 rounded-full flex items-center justify-center bg-[var(--neutral-200)] text-[var(--neutral-600)]">
          <KeenIcon icon="people" style="duotone" className="size-4" />
        </div>
      )}

      <div>
        {!isUser && msg.participantName && (
          <p className={cn('text-[10px] mb-1 ml-1 font-semibold', tone === 'dark' ? 'text-[var(--accent-300)]' : 'text-[var(--neutral-500)]')}>
            {msg.participantName}
          </p>
        )}
        <div className={cn(
          'rounded-2xl px-4 py-2.5 text-sm',
          isUser
            ? 'bg-[var(--accent-500)] text-white rounded-br-md'
            : tone === 'dark'
              ? 'bg-white/8 text-[var(--brand-50)] rounded-bl-md border border-white/10'
              : 'bg-[var(--brand-50)] text-[var(--brand-700)] rounded-bl-md border border-[var(--brand-100)]',
        )}>
          {!msg.content ? (
            <span className="inline-block w-1.5 h-4 bg-current rounded-full animate-pulse opacity-60" />
          ) : isUser ? (
            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
          ) : (
            <MarkdownContent content={msg.content} />
          )}
        </div>
        <p className={cn('text-[10px] mt-1 ml-1', isUser && 'text-right', tone === 'dark' ? 'text-[var(--brand-200)]' : 'text-[var(--neutral-400)]')}>
          {new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
