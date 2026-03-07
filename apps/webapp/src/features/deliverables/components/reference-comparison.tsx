import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { KeenIcon } from '@/components/keenicons';
import { MarkdownPreview } from './markdown-preview';

interface ReferenceComparisonProps {
  userContent: string;
  referenceContent: string;
  deliverableType?: string;
}

/**
 * Computes a rough coverage score by checking how many reference
 * "sections" (lines that look like headings or key phrases) appear
 * in the user content. This is a simple heuristic for display purposes.
 */
function computeCoverageScore(userContent: string, referenceContent: string): number {
  if (!referenceContent || !userContent) return 0;
  const referenceLines = referenceContent
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 10);
  if (referenceLines.length === 0) return 0;

  const userLower = userContent.toLowerCase();
  let matched = 0;
  for (const line of referenceLines) {
    // Check if significant keywords from the line appear in user content
    const keywords = line
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 4);
    if (keywords.length === 0) continue;
    const keywordMatches = keywords.filter((kw) => userLower.includes(kw));
    if (keywordMatches.length / keywords.length >= 0.5) {
      matched++;
    }
  }
  return Math.round((matched / referenceLines.length) * 100);
}

function isMinutesType(type?: string): boolean {
  if (!type) return false;
  const lower = type.toLowerCase();
  return lower.includes('minutes') || lower.includes('cr') || lower.includes('meeting_minutes');
}

/**
 * Parses a meeting minutes text into structured sections for comparison.
 */
function parseMinutesSections(content: string): Array<{ title: string; body: string }> {
  const sections: Array<{ title: string; body: string }> = [];
  const lines = content.split('\n');
  let currentTitle = '';
  let currentBody: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^#{1,3}\s+(.+)/);
    if (headingMatch) {
      if (currentTitle || currentBody.length > 0) {
        sections.push({
          title: currentTitle || 'Introduction',
          body: currentBody.join('\n').trim(),
        });
      }
      currentTitle = headingMatch[1];
      currentBody = [];
    } else {
      currentBody.push(line);
    }
  }

  if (currentTitle || currentBody.length > 0) {
    sections.push({
      title: currentTitle || 'Contenu',
      body: currentBody.join('\n').trim(),
    });
  }

  return sections;
}

export function ReferenceComparison({
  userContent,
  referenceContent,
  deliverableType,
}: ReferenceComparisonProps) {
  const coverageScore = useMemo(
    () => computeCoverageScore(userContent, referenceContent),
    [userContent, referenceContent],
  );

  const isMinutes = isMinutesType(deliverableType);
  const userSections = useMemo(
    () => (isMinutes ? parseMinutesSections(userContent) : []),
    [isMinutes, userContent],
  );
  const referenceSections = useMemo(
    () => (isMinutes ? parseMinutesSections(referenceContent) : []),
    [isMinutes, referenceContent],
  );

  const coverageBadgeVariant =
    coverageScore >= 70 ? 'success' : coverageScore >= 40 ? 'warning' : 'destructive';

  return (
    <div className="space-y-3">
      {/* Coverage score header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <KeenIcon icon="eye" style="solid" className="size-4 text-primary" />
          Comparaison avec la reference
        </h3>
        <Badge variant={coverageBadgeVariant} appearance="light" size="sm">
          Score de couverture : {coverageScore}%
        </Badge>
      </div>

      {isMinutes && userSections.length > 0 && referenceSections.length > 0 ? (
        /* Structured comparison for meeting minutes */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-success/30">
            <CardHeader className="pb-2 bg-success/5 rounded-t-lg">
              <CardTitle className="text-sm flex items-center gap-2 text-success">
                <KeenIcon icon="document" style="solid" className="size-4" />
                Votre livrable
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[500px] overflow-y-auto border-t border-success/20">
                {userSections.map((section, i) => (
                  <div key={i} className="px-4 py-3 border-b border-border last:border-b-0">
                    <h4 className="text-xs font-semibold text-foreground mb-1">{section.title}</h4>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">{section.body}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/30">
            <CardHeader className="pb-2 bg-primary/5 rounded-t-lg">
              <CardTitle className="text-sm flex items-center gap-2 text-primary">
                <KeenIcon icon="abstract-26" style="solid" className="size-4" />
                Reference IA
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[500px] overflow-y-auto border-t border-primary/20">
                {referenceSections.map((section, i) => (
                  <div key={i} className="px-4 py-3 border-b border-border last:border-b-0">
                    <h4 className="text-xs font-semibold text-foreground mb-1">{section.title}</h4>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">{section.body}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Default side-by-side comparison */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-success/30">
            <CardHeader className="pb-2 bg-success/5 rounded-t-lg">
              <CardTitle className="text-sm flex items-center gap-2 text-success">
                <KeenIcon icon="document" style="solid" className="size-4" />
                Votre livrable
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[500px] overflow-y-auto border-t border-success/20">
                <MarkdownPreview content={userContent} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/30">
            <CardHeader className="pb-2 bg-primary/5 rounded-t-lg">
              <CardTitle className="text-sm flex items-center gap-2 text-primary">
                <KeenIcon icon="abstract-26" style="solid" className="size-4" />
                Reference IA
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[500px] overflow-y-auto border-t border-primary/20">
                <MarkdownPreview content={referenceContent} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
