import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';
import type { SkillWeight } from '../types/recruitment.types';

interface SkillsInputProps {
  value: SkillWeight[];
  onChange: (skills: SkillWeight[]) => void;
  className?: string;
}

export function SkillsInput({ value, onChange, className }: SkillsInputProps) {
  const [newSkill, setNewSkill] = useState('');

  const handleAdd = () => {
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    if (value.some((s) => s.skill.toLowerCase() === trimmed.toLowerCase())) return;
    onChange([...value, { skill: trimmed, weight: 5 }]);
    setNewSkill('');
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleWeightChange = (index: number, weight: number) => {
    const updated = [...value];
    updated[index] = { ...updated[index], weight };
    onChange(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2">
        <Input
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ajouter une competence..."
          className="flex-1"
        />
        <Button type="button" variant="outline" size="sm" onClick={handleAdd} disabled={!newSkill.trim()}>
          <KeenIcon icon="plus" style="outline" className="size-4" />
          Ajouter
        </Button>
      </div>

      {value.length > 0 && (
        <div className="space-y-3">
          {value.map((skill, index) => (
            <div key={index} className="flex items-center gap-3 rounded-lg border border-border p-3">
              <span className="text-sm font-medium min-w-[120px]">{skill.skill}</span>
              <div className="flex-1 flex items-center gap-3">
                <Slider
                  value={[skill.weight]}
                  onValueChange={([val]) => handleWeightChange(index, val)}
                  min={1}
                  max={10}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-8 text-right font-mono">
                  {skill.weight}/10
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(index)}
                className="text-destructive hover:text-destructive"
              >
                <KeenIcon icon="trash" style="outline" className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {value.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Aucune competence ajoutee. Utilisez le champ ci-dessus pour en ajouter.
        </p>
      )}
    </div>
  );
}
