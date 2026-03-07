import { cn } from '@/lib/utils';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
  if (!content) {
    return (
      <div className={cn('text-sm text-muted-foreground italic p-4', className)}>
        Aucun contenu a afficher.
      </div>
    );
  }

  return (
    <div
      className={cn(
        'prose prose-sm dark:prose-invert max-w-none p-4',
        className,
      )}
    >
      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground bg-transparent p-0 m-0 border-none">
        {content}
      </pre>
    </div>
  );
}
