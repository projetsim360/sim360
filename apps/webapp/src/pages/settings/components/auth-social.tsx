import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useT } from '@/i18n/app/use-t';

export function AuthSocial() {
  const t = useT();
  const { user, refreshUser } = useAuth();
  const [unlinking, setUnlinking] = useState(false);
  const [showUnlinkForm, setShowUnlinkForm] = useState(false);
  const [password, setPassword] = useState('');

  const isGoogleLinked = !!user?.googleId;

  const handleUnlinkGoogle = async () => {
    if (!password) return;
    setUnlinking(true);
    try {
      await api.post('/auth/social/unlink-google', { password });
      toast.success(t('settings.social.unlinked'));
      setShowUnlinkForm(false);
      setPassword('');
      await refreshUser();
    } catch (error: any) {
      toast.error(error.message || t('settings.social.unlinkError'));
    } finally {
      setUnlinking(false);
    }
  };

  const handleLinkGoogle = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
    sessionStorage.setItem('sim360_redirect_after_login', '/settings');
    window.location.href = `${apiUrl}/auth/google`;
  };

  return (
    <Card
      id="auth_social"
      className="border-[var(--neutral-100)] dark:border-white/[0.06] shadow-[0_1px_2px_rgba(15,26,46,0.04),0_8px_24px_-10px_rgba(15,26,46,0.08)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_-10px_rgba(0,0,0,0.5)]"
    >
      <CardHeader className="flex-col items-start gap-1 pt-5 pb-4 border-b-0">
        <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-[var(--accent-700)] dark:text-[var(--accent-300)]">
          {t('settings.kicker.account')}
        </span>
        <h2 className="font-display text-[19px] font-bold text-foreground m-0">{t('settings.social.title')}</h2>
        <p className="text-[13px] text-muted-foreground m-0">{t('settings.social.desc')}</p>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap border border-[var(--neutral-100)] dark:border-white/[0.06] rounded-xl gap-2 px-4 py-3">
            <div className="flex items-center flex-wrap gap-3">
              <img
                src={toAbsoluteUrl('/media/brand-logos/google.svg')}
                className="size-6 shrink-0"
                alt="Google"
              />
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-semibold text-foreground">Google</span>
                <span className="text-[12px] text-muted-foreground">
                  {isGoogleLinked ? t('settings.social.connected') : t('settings.social.notConnected')}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              {isGoogleLinked ? (
                <Button variant="outline" size="sm" onClick={() => setShowUnlinkForm(!showUnlinkForm)}>
                  {t('settings.social.unlink')}
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={handleLinkGoogle}>
                  {t('settings.social.link')}
                </Button>
              )}
            </div>
          </div>

          {showUnlinkForm && isGoogleLinked && (
            <div className="flex flex-col gap-3 border border-[var(--neutral-100)] dark:border-white/[0.06] rounded-xl p-4 bg-[var(--neutral-50)] dark:bg-white/[0.02]">
              <div className="text-[12px] text-muted-foreground">
                {t('settings.social.unlinkHint')}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[170px_minmax(0,1fr)] gap-3 sm:gap-4 items-center">
                <Label htmlFor="auth-social-unlink-pw" className="text-[13px] font-medium text-foreground">
                  {t('auth.field.password')}
                </Label>
                <Input
                  id="auth-social-unlink-pw"
                  type="password"
                  placeholder={t('auth.field.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setShowUnlinkForm(false); setPassword(''); }}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={!password || unlinking}
                  onClick={handleUnlinkGoogle}
                >
                  {unlinking ? t('settings.social.unlinking') : t('settings.social.confirmUnlink')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
