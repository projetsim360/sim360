import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MarkdownPreview } from './markdown-preview';

interface ReferenceComparisonProps {
  userContent: string;
  referenceContent: string;
}

export function ReferenceComparison({
  userContent,
  referenceContent,
}: ReferenceComparisonProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Mon livrable</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[500px] overflow-y-auto border-t border-border">
            <MarkdownPreview content={userContent} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-primary">
            Exemple de reference
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[500px] overflow-y-auto border-t border-border">
            <MarkdownPreview content={referenceContent} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
