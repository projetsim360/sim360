import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from '@/components/keenicons/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n/app/use-t';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const t = useT();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — next-themes resolves on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <Button
      variant="ghost"
      mode="icon"
      aria-label={isDark ? t('shell.topbar.lightTheme') : t('shell.topbar.darkTheme')}
      title={isDark ? t('shell.topbar.lightTheme') : t('shell.topbar.darkTheme')}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn('rounded-lg', className)}
    >
      {isDark ? <Sun className="size-4.5!" /> : <Moon className="size-4.5!" />}
    </Button>
  );
}
