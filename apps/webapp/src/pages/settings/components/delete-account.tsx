import { useState } from 'react';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { clearTokens } from '@/lib/auth';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useT } from '@/i18n/app/use-t';

export function DeleteAccount() {
  const t = useT();
  const [confirmed, setConfirmed] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirmed) return;
    setLoading(true);
    try {
      await api.delete('/users/me', { password });
      clearTokens();
      toast.success(t('settings.delete.done'));
      window.location.href = '/auth/sign-in';
    } catch (error: any) {
      toast.error(error.message || t('settings.delete.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      id="delete_account"
      className="border-[var(--error-200)] dark:border-[var(--error-500)]/30 bg-gradient-to-b from-white to-[var(--error-50)] dark:from-card dark:to-[var(--error-500)]/[0.04] shadow-[0_1px_2px_rgba(220,38,38,0.06),0_8px_24px_-10px_rgba(220,38,38,0.12)]"
    >
      <CardHeader className="flex-col items-start gap-1 pt-5 pb-4 border-b-0">
        <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-[var(--error-700)] dark:text-[var(--error-200)]">
          {t('settings.kicker.danger')}
        </span>
        <h2 className="font-display text-[19px] font-bold text-[var(--error-700)] dark:text-[var(--error-200)] m-0">
          {t('settings.delete.title')}
        </h2>
        <p className="text-[13px] text-muted-foreground m-0">
          {t('settings.delete.desc')}
        </p>
      </CardHeader>

      <CardContent className="pt-2 flex flex-col gap-4">
        <div className="text-[13px] text-foreground">
          {t('settings.delete.steps')}
          <ul className="list-disc ms-5 mt-2 text-muted-foreground">
            <li>{t('settings.delete.step1')}</li>
            <li>{t('settings.delete.step2')}</li>
            <li>{t('settings.delete.step3')}</li>
          </ul>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="confirm-delete"
            checked={confirmed}
            onCheckedChange={(checked) => setConfirmed(checked === true)}
          />
          <Label htmlFor="confirm-delete" className="text-[13px] font-normal text-foreground">
            {t('settings.delete.understand')}
          </Label>
        </div>

        {confirmed && (
          <Input
            id="delete-password"
            type="password"
            placeholder={t('auth.field.passwordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}

        <div className="flex justify-end pt-2">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!confirmed || !password || loading}
          >
            {loading ? t('settings.delete.deleting') : t('settings.delete.submit')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
