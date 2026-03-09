import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components/keenicons';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
} from '@/components/ui/sheet';

interface ContextualHelpProps {
  title: string;
  description: string;
  tips?: string[];
}

export function ContextualHelp({ title, description, tips }: ContextualHelpProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        className="size-7 rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary"
        onClick={() => setOpen(true)}
      >
        <KeenIcon icon="information-2" style="solid" className="text-xs" />
        <span className="sr-only">Aide contextuelle</span>
      </Button>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <KeenIcon icon="information-2" style="duotone" className="size-5 text-primary" />
            {title}
          </SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        {tips && tips.length > 0 && (
          <SheetBody>
            <h4 className="text-sm font-semibold text-foreground mb-3">Conseils</h4>
            <ul className="space-y-2.5">
              {tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <KeenIcon
                    icon="check-circle"
                    style="duotone"
                    className="size-4 text-primary mt-0.5 shrink-0"
                  />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </SheetBody>
        )}
      </SheetContent>
    </Sheet>
  );
}
