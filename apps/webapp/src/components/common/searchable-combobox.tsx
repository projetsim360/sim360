import { useMemo, useState } from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n/app/use-t';

export interface ComboboxOption {
  value: string;
  label: string;
  group?: string;
}

interface SearchableComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  /** Lets the user keep a value that is not in the list ("Autre"). */
  allowCustom?: boolean;
  customLabel?: (query: string) => string;
  id?: string;
  className?: string;
  disabled?: boolean;
}

/** Popover + search list. Built on the design-system Command/Popover primitives. */
export function SearchableCombobox({
  value,
  onChange,
  options,
  placeholder: placeholderProp,
  searchPlaceholder: searchPlaceholderProp,
  emptyText: emptyTextProp,
  allowCustom = false,
  customLabel: customLabelProp,
  id,
  className,
  disabled,
}: SearchableComboboxProps) {
  const t = useT();
  const placeholder = placeholderProp ?? t('settings.select');
  const searchPlaceholder = searchPlaceholderProp ?? t('combobox.search');
  const emptyText = emptyTextProp ?? t('combobox.empty');
  const customLabel = customLabelProp ?? ((q: string) => t('combobox.use', { value: q }));
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = options.find((o) => o.value === value);
  const display = selected?.label ?? value;

  const groups = useMemo(() => {
    const map = new Map<string, ComboboxOption[]>();
    for (const o of options) {
      const key = o.group ?? '';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(o);
    }
    return [...map.entries()];
  }, [options]);

  const trimmed = query.trim();
  const showCustom =
    allowCustom && trimmed.length > 0 && !options.some((o) => o.label.toLowerCase() === trimmed.toLowerCase());

  const select = (v: string) => {
    onChange(v);
    setOpen(false);
    setQuery('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn('w-full justify-between font-normal', !display && 'text-muted-foreground', className)}
        >
          <span className="truncate">{display || placeholder}</span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-[260px] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} value={query} onValueChange={setQuery} />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>{allowCustom ? t('combobox.typeToAdd') : emptyText}</CommandEmpty>
            {showCustom && (
              <CommandGroup>
                <CommandItem value={`__custom__${trimmed}`} onSelect={() => select(trimmed)}>
                  <Plus className="size-4" />
                  {customLabel(trimmed)}
                </CommandItem>
              </CommandGroup>
            )}
            {groups.map(([group, items]) => (
              <CommandGroup key={group || 'default'} heading={group || undefined}>
                {items.map((o) => (
                  <CommandItem key={o.value} value={o.label} onSelect={() => select(o.value)}>
                    <Check className={cn('size-4', o.value === value ? 'opacity-100' : 'opacity-0')} />
                    <span className="truncate">{o.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
