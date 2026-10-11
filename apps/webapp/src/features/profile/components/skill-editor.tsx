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
import { Plus, Trash2, CheckCircle } from '@/components/keenicons/icons';
import { cn } from '@/lib/utils';
import type { SkillGap, SkillLevel } from '../types/profile.types';
import { SKILL_LEVEL_LABELS } from '../types/profile.types';
import { useT } from '@/i18n/app/use-t';
import type { AppMessageKey } from '@/i18n/app/messages';

interface SkillEditorProps {
  skills: SkillGap[];
  onChange: (skills: SkillGap[]) => void;
  className?: string;
}

// Used for the stored `gap` value (backend payload) — unchanged semantics.
const LEVEL_VALUES: Record<SkillLevel, number> = { none: 0, basic: 33, intermediate: 66, advanced: 100 };
// Used for the visual track widths (matches SkillDeltaBar — `none` shows a sliver).
const LEVEL_PCT: Record<SkillLevel, number> = { none: 4, basic: 33, intermediate: 66, advanced: 100 };
const LEVEL_OPTIONS = Object.entries(SKILL_LEVEL_LABELS) as [SkillLevel, string][];

export function SkillEditor({ skills, onChange, className }: SkillEditorProps) {
  const t = useT();
  const [newSkillName, setNewSkillName] = useState('');

  const updateSkillLevel = (index: number, field: 'currentLevel' | 'targetLevel', value: SkillLevel) => {
    const updated = [...skills];
    updated[index] = { ...updated[index], [field]: value };
    const current = LEVEL_VALUES[updated[index].currentLevel];
    const target = LEVEL_VALUES[updated[index].targetLevel];
    updated[index].gap = Math.max(0, target - current);
    onChange(updated);
  };

  const removeSkill = (index: number) => onChange(skills.filter((_, i) => i !== index));

  const addSkill = () => {
    if (!newSkillName.trim()) return;
    onChange([...skills, { name: newSkillName.trim(), currentLevel: 'none', targetLevel: 'intermediate', gap: 66 }]);
    setNewSkillName('');
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex gap-4 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-3.5 rounded-sm bg-[var(--brand-600)]" /> {t('onboarding.diag.current')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-3.5 rounded-sm"
            style={{ background: 'repeating-linear-gradient(45deg, var(--accent-200), var(--accent-200) 4px, var(--accent-100) 4px, var(--accent-100) 8px)' }}
          />{' '}
          {t('onboarding.diag.gap')}
        </span>
      </div>

      <div className="space-y-3">
        {skills.map((skill, index) => {
          const cur = LEVEL_PCT[skill.currentLevel];
          const gap = Math.max(0, LEVEL_PCT[skill.targetLevel] - cur);
          const reached = LEVEL_VALUES[skill.targetLevel] <= LEVEL_VALUES[skill.currentLevel];
          return (
            <div
              key={`${skill.name}-${index}`}
              className="rounded-xl border border-border bg-card p-4 transition-all hover:border-[var(--brand-200)] hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-sm font-bold text-[var(--brand-700)]">{skill.name}</span>
                <button
                  type="button"
                  aria-label={t('onboarding.skills.remove', { name: skill.name })}
                  onClick={() => removeSkill(index)}
                  className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-[var(--error-50)] hover:text-[var(--error-700)]"
                >
                  <Trash2 className="text-sm" />
                </button>
              </div>
              <div className="my-3 flex flex-wrap items-end gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{t('onboarding.diag.current')}</span>
                  <Select value={skill.currentLevel} onValueChange={(v) => updateSkillLevel(index, 'currentLevel', v as SkillLevel)}>
                    <SelectTrigger size="sm" className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEVEL_OPTIONS.map(([value]) => (
                        <SelectItem key={value} value={value}>{t(`skillLevel.${value}` as AppMessageKey)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
                <span className="pb-2 text-muted-foreground">→</span>
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{t('onboarding.skills.target')}</span>
                  <Select value={skill.targetLevel} onValueChange={(v) => updateSkillLevel(index, 'targetLevel', v as SkillLevel)}>
                    <SelectTrigger size="sm" className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEVEL_OPTIONS.map(([value]) => (
                        <SelectItem key={value} value={value}>{t(`skillLevel.${value}` as AppMessageKey)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
              </div>
              <div className="relative h-2.5 overflow-hidden rounded-full bg-[var(--brand-50)]">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-[var(--brand-600)] transition-all duration-500 motion-reduce:transition-none"
                  style={{ width: `${cur}%` }}
                />
                {gap > 0 && (
                  <div
                    className="absolute inset-y-0 rounded-full transition-all duration-500 motion-reduce:transition-none"
                    style={{
                      left: `${cur}%`,
                      width: `${gap}%`,
                      background: 'repeating-linear-gradient(45deg, var(--accent-200), var(--accent-200) 5px, var(--accent-100) 5px, var(--accent-100) 10px)',
                    }}
                  />
                )}
              </div>
              {reached && (
                <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--success-700)]">
                  <CheckCircle className="text-xs" /> Aucun écart — objectif déjà atteint
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        <Input
          value={newSkillName}
          onChange={(e) => setNewSkillName(e.target.value)}
          placeholder={t('onboarding.skills.namePlaceholder')}
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
          {t('common.add')}
        </Button>
      </div>
    </div>
  );
}
