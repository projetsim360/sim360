import { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components/keenicons';
import { MarkdownContent } from '@/components/ui/markdown-content';
import { PmiGlossaryText } from '@/features/profile/components/pmi-glossary-tooltip';
import { toast } from 'sonner';
import type { PmoMessage } from '../types/pmo.types';

/**
 * Splits message content into segments of plain text and code blocks.
 * Code blocks are delimited by triple backticks (```).
 */
function parseContentSegments(content: string): Array<{ type: 'text' | 'code'; value: string; lang?: string }> {
  const segments: Array<{ type: 'text' | 'code'; value: string; lang?: string }> = [];
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: content.slice(lastIndex, match.index) });
    }
    segments.push({ type: 'code', value: match[2], lang: match[1] || undefined });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    segments.push({ type: 'text', value: content.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ type: 'text', value: content }];
}

interface PmoMessageBubbleProps {
  message: PmoMessage;
  enableGlossaryTooltips?: boolean;
}

export function PmoMessageBubble({ message, enableGlossaryTooltips = false }: PmoMessageBubbleProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  const handleCopyCode = useCallback((code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      toast('Template copie !');
    }).catch(() => {
      toast.error('Impossible de copier le contenu.');
    });
  }, []);

  if (isSystem) {
    return (
      <div className="flex justify-center py-2">
        <p className="text-sm text-muted-foreground italic max-w-md text-center">
          {message.content}
        </p>
      </div>
    );
  }

  const hasCodeBlocks = !isUser && message.content.includes('```');
  const segments = hasCodeBlocks ? parseContentSegments(message.content) : null;

  return (
    <div
      className={cn(
        'flex gap-2.5 max-w-[85%]',
        isUser ? 'ml-auto flex-row-reverse' : 'mr-auto',
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'shrink-0 size-8 rounded-xl flex items-center justify-center',
          isUser
            ? 'bg-brand-500 text-white'
            : 'bg-brand-100 dark:bg-brand-800/40 text-brand-500 dark:text-brand-400',
        )}
      >
        <KeenIcon
          icon={isUser ? 'user' : 'abstract-26'}
          style="duotone"
          className="size-4"
        />
      </div>

      {/* Bubble */}
      <div
        className={cn(
          'rounded-2xl px-4 py-2.5 text-sm',
          isUser
            ? 'bg-brand-500 text-white rounded-br-md'
            : 'bg-muted/60 dark:bg-white/5 text-foreground rounded-bl-md border border-border/50',
        )}
      >
        {segments ? (
          <div className="space-y-2">
            {segments.map((seg, i) =>
              seg.type === 'code' ? (
                <div key={i} className="relative rounded-lg bg-accent dark:bg-accent overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-border">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {seg.lang || 'template'}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => handleCopyCode(seg.value)}
                    >
                      <KeenIcon icon="copy" style="duotone" className="size-3 mr-1" />
                      Copier
                    </Button>
                  </div>
                  <pre className="p-3 text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                    {seg.value}
                  </pre>
                </div>
              ) : (
                <div key={i}>
                  <MarkdownContent content={seg.value} />
                </div>
              ),
            )}
          </div>
        ) : isUser ? (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        ) : (
          <MarkdownContent content={message.content} />
        )}
        <p
          className={cn(
            'text-[10px] mt-1.5',
            isUser
              ? 'text-white/50'
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
    <div className="flex gap-2.5 max-w-[85%] mr-auto">
      <div className="shrink-0 size-8 rounded-xl flex items-center justify-center bg-brand-100 dark:bg-brand-800/40 text-brand-500 dark:text-brand-400">
        <KeenIcon icon="abstract-26" style="duotone" className="size-4" />
      </div>
      <div className="rounded-2xl rounded-bl-md px-4 py-2.5 text-sm bg-muted/60 dark:bg-white/5 text-foreground border border-border/50">
        <MarkdownContent content={content} />
        <span className="inline-block w-1.5 h-4 bg-brand-500 dark:bg-brand-400 rounded-full animate-pulse ml-0.5 align-middle" />
      </div>
    </div>
  );
}
