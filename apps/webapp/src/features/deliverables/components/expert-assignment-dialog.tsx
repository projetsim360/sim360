import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogBody,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  expertise: string;
  personality: string;
  avatar: string | null;
}

interface ExpertAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamMembers: TeamMember[];
  onAssign: (teamMemberId: string, instructions?: string) => void;
  loading?: boolean;
}

export function ExpertAssignmentDialog({
  open,
  onOpenChange,
  teamMembers,
  onAssign,
  loading = false,
}: ExpertAssignmentDialogProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [instructions, setInstructions] = useState('');

  function handleAssign() {
    if (!selectedMemberId) return;
    onAssign(selectedMemberId, instructions || undefined);
    setSelectedMemberId(null);
    setInstructions('');
  }

  function handleOpenChange(value: boolean) {
    if (!value) {
      setSelectedMemberId(null);
      setInstructions('');
    }
    onOpenChange(value);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>Deleguer le livrable</DialogTitle>
          <DialogDescription>
            Selectionnez un membre de l&apos;equipe pour lui confier la
            realisation de ce livrable.
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <ScrollArea className="max-h-[320px] -mx-1 px-1">
            <div className="space-y-2">
              {teamMembers.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  className={cn(
                    'w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors',
                    selectedMemberId === member.id
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border hover:border-primary/40 hover:bg-muted/50',
                  )}
                  onClick={() => setSelectedMemberId(member.id)}
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="size-10 rounded-full object-cover"
                      />
                    ) : (
                      member.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{member.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {member.role}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Badge variant="info" appearance="light" size="xs">
                        {member.expertise}
                      </Badge>
                      <Badge variant="secondary" appearance="light" size="xs">
                        {member.personality}
                      </Badge>
                    </div>
                  </div>
                  {selectedMemberId === member.id && (
                    <KeenIcon
                      icon="check-circle"
                      style="solid"
                      className="size-5 text-primary shrink-0"
                    />
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>

          <div className="mt-4 space-y-2">
            <label
              htmlFor="assignment-instructions"
              className="text-sm font-medium"
            >
              Instructions{' '}
              <span className="text-muted-foreground font-normal">
                (optionnel)
              </span>
            </label>
            <Textarea
              id="assignment-instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Precisions ou consignes pour le membre de l'equipe..."
              rows={3}
            />
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            variant="mono"
            size="sm"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleAssign}
            disabled={!selectedMemberId || loading}
          >
            {loading ? 'Assignation...' : 'Assigner'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
