import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div
      className={cn(
        'prose prose-sm dark:prose-invert max-w-none',
        'prose-headings:font-semibold prose-headings:text-inherit prose-headings:mt-3 prose-headings:mb-1',
        'prose-p:my-1 prose-p:leading-relaxed prose-p:text-inherit',
        'prose-a:text-primary prose-a:underline',
        'prose-strong:text-inherit prose-strong:font-semibold',
        'prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-li:text-inherit',
        'prose-code:bg-black/10 dark:prose-code:bg-white/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-none prose-code:after:content-none',
        'prose-pre:bg-black/5 dark:prose-pre:bg-white/5 prose-pre:rounded-lg prose-pre:my-2',
        'prose-blockquote:border-l-primary prose-blockquote:text-inherit/80 prose-blockquote:my-2',
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
