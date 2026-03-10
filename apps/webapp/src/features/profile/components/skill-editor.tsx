import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Plus, Trash2 } from '@/components/keenicons/icons';
import { cn } from '@/lib/utils';
import type { SkillGap, SkillLevel } from '../types/profile.types';
import { SKILL_LEVEL_LABELS } from '../types/profile.types';

interface SkillEditorProps {
  skills: SkillGap[];
  onChange: (skills: SkillGap[]) => void;
  className?: string;
}

function getGapColor(gap: number): string {
  if (gap <= 25) return 'bg-success';
  if (gap <= 50) return 'bg-warning';
  if (gap <= 75) return 'bg-[var(--accent-brand)]';
  return 'bg-destructive';
}

export function SkillEditor({ skills, onChange, className }: SkillEditorProps) {
  const [newSkillName, setNewSkillName] = useState('');

  const updateSkillLevel = (index: number, field: 'currentLevel' | 'targetLevel', value: SkillLevel) => {
    const updated = [...skills];
    updated[index] = { ...updated[index], [field]: value };
    const levelValues: Record<SkillLevel, number> = { none: 0, basic: 33, intermediate: 66, advanced: 100 };
    const current = levelValues[updated[index].currentLevel];
    const target = levelValues[updated[index].targetLevel];
    updated[index].gap = Math.max(0, target - current);
    onChange(updated);
  };

  const removeSkill = (index: number) => {
    const updated = skills.filter((_, i) => i !== index);
    onChange(updated);
  };

  const addSkill = () => {
    if (!newSkillName.trim()) return;
    const newSkill: SkillGap = {
      name: newSkillName.trim(),
      currentLevel: 'none',
      targetLevel: 'intermediate',
      gap: 66,
    };
    onChange([...skills, newSkill]);
    setNewSkillName('');
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-3">
        {skills.map((skill, index) => (
          <div
            key={`${skill.name}-${index}`}
            className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{skill.name}</p>
              <div className="flex items-center gap-2 mt-2">
                <Select
                  value={skill.currentLevel}
                  onValueChange={(v) => updateSkillLevel(index, 'currentLevel', v as SkillLevel)}
                >
                  <SelectTrigger size="sm" className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(SKILL_LEVEL_LABELS) as [SkillLevel, string][]).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">vers</span>
                <Select
                  value={skill.targetLevel}
                  onValueChange={(v) => updateSkillLevel(index, 'targetLevel', v as SkillLevel)}
                >
                  <SelectTrigger size="sm" className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(SKILL_LEVEL_LABELS) as [SkillLevel, string][]).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-2">
                <Progress
                  value={skill.gap}
                  className="h-1.5"
                  indicatorClassName={getGapColor(skill.gap)}
                />
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => removeSkill(index)}>
              <Trash2 className="text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Input
          value={newSkillName}
          onChange={(e) => setNewSkillName(e.target.value)}
          placeholder="Nom de la competence..."
          variant="sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addSkill();
            }
          }}
        />
        <Button variant="outline" size="sm" onClick={addSkill} disabled={!newSkillName.trim()}>
          <Plus className="text-sm" />
          Ajouter
        </Button>
      </div>
    </div>
  );
}
