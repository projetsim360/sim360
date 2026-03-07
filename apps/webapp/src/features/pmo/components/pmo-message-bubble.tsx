import { cn } from '@/lib/utils';
import { KeenIcon } from '@/components/keenicons';
import type { PmoMessage } from '../types/pmo.types';

interface PmoMessageBubbleProps {
  message: PmoMessage;
}

export function PmoMessageBubble({ message }: PmoMessageBubbleProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center py-2">
        <p className="text-xs text-muted-foreground italic max-w-md text-center">
          {message.content}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex gap-3 max-w-[85%]',
        isUser ? 'ml-auto flex-row-reverse' : 'mr-auto',
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white',
          isUser ? 'bg-primary' : 'bg-gray-700',
        )}
      >
        <KeenIcon
          icon={isUser ? 'user' : 'abstract-26'}
          style="solid"
          className="size-4"
        />
      </div>

      {/* Bubble */}
      <div
        className={cn(
          'rounded-xl px-4 py-2.5 text-sm',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-gray-100 dark:bg-gray-800 text-foreground rounded-bl-sm',
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <p
          className={cn(
            'text-[10px] mt-1',
            isUser
              ? 'text-primary-foreground/60'
              : 'text-muted-foreground',
          )}
        >
          {new Date(message.createdAt).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}

interface StreamingBubbleProps {
  content: string;
}

export function StreamingBubble({ content }: StreamingBubbleProps) {
  return (
    <div className="flex gap-3 max-w-[85%] mr-auto">
      <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white bg-gray-700">
        <KeenIcon icon="abstract-26" style="solid" className="size-4" />
      </div>
      <div className="rounded-xl rounded-bl-sm px-4 py-2.5 text-sm bg-gray-100 dark:bg-gray-800 text-foreground">
        <p className="whitespace-pre-wrap break-words">
          {content}
          <span className="inline-block w-1.5 h-4 bg-gray-400 animate-pulse ml-0.5 align-middle" />
        </p>
      </div>
    </div>
  );
}
