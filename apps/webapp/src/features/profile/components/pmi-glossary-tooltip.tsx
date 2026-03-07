import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { useGlossary } from '@/features/admin-reference/api/admin-reference.api';
import type { ReferenceDocument } from '@/features/admin-reference/types/admin-reference.types';

interface PmiGlossaryTextProps {
  text: string;
  enabled?: boolean;
  className?: string;
}

/**
 * Wraps text content and detects PMI terms from the glossary API.
 * On hover, shows a tooltip with the term definition and a concrete example.
 * Can be disabled via the `enabled` prop.
 */
export function PmiGlossaryText({
  text,
  enabled = true,
  className,
}: PmiGlossaryTextProps) {
  const { data: glossaryEntries } = useGlossary();

  const glossaryMap = useMemo(() => {
    if (!glossaryEntries || glossaryEntries.length === 0) return null;

    const map = new Map<string, ReferenceDocument>();
    for (const entry of glossaryEntries) {
      if (entry.term) {
        map.set(entry.term.toLowerCase(), entry);
      }
      // Also index by title as fallback
      map.set(entry.title.toLowerCase(), entry);
    }
    return map;
  }, [glossaryEntries]);

  const segments = useMemo(() => {
    if (!enabled || !glossaryMap || glossaryMap.size === 0) {
      return null;
    }

    // Build a regex from all terms, sorted by length (longest first to avoid partial matches)
    const terms = Array.from(glossaryMap.keys()).sort(
      (a, b) => b.length - a.length,
    );
    const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const pattern = new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi');

    const result: Array<
      | { type: 'text'; value: string }
      | { type: 'term'; value: string; entry: ReferenceDocument }
    > = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      // Add preceding text
      if (match.index > lastIndex) {
        result.push({
          type: 'text',
          value: text.slice(lastIndex, match.index),
        });
      }

      const matchedText = match[0];
      const entry = glossaryMap.get(matchedText.toLowerCase());
      if (entry) {
        result.push({ type: 'term', value: matchedText, entry });
      } else {
        result.push({ type: 'text', value: matchedText });
      }

      lastIndex = pattern.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      result.push({ type: 'text', value: text.slice(lastIndex) });
    }

    // If no terms were found, return null
    if (result.every((s) => s.type === 'text')) return null;

    return result;
  }, [text, enabled, glossaryMap]);

  // If disabled or no matches, render plain text
  if (!segments) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {segments.map((segment, i) => {
        if (segment.type === 'text') {
          return <span key={i}>{segment.value}</span>;
        }

        return (
          <Tooltip key={i}>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  'underline decoration-dotted decoration-primary/50 underline-offset-2 cursor-help',
                  'hover:decoration-primary hover:text-primary transition-colors',
                )}
              >
                {segment.value}
              </span>
            </TooltipTrigger>
            <TooltipContent
              variant="light"
              className="max-w-xs p-3 space-y-1.5"
            >
              <p className="font-semibold text-xs text-foreground">
                {segment.entry.term || segment.entry.title}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {segment.entry.content}
              </p>
              {segment.entry.example && (
                <p className="text-xs text-muted-foreground italic border-t border-border pt-1.5 mt-1.5">
                  {segment.entry.example}
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </span>
  );
}
