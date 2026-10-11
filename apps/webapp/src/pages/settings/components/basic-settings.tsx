import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { api } from '@/lib/api-client';
import { AvatarUpload } from '@/components/common/avatar-upload';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SearchableCombobox } from '@/components/common/searchable-combobox';
import { JOB_TITLE_OPTIONS } from '@/lib/job-titles';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppLocale } from '@/providers/locale-provider';
import { useT } from '@/i18n/app/use-t';

const FIELD_ROW =
  'grid grid-cols-1 sm:grid-cols-[170px_minmax(0,1fr)] gap-3 sm:gap-4 items-center py-3 border-t border-[var(--neutral-100)] dark:border-white/[0.06] first:border-t-0 first:pt-1';

export function BasicSettings() {
  const { setLocale } = useAppLocale();
  const t = useT();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    jobTitle: '',
    bio: '',
    language: 'fr',
    experienceLevel: '',
  });

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        firstName: user.firstName,
        lastName: user.lastName,
      }));
      api.get<any>('/users/me').then((data) => {
        setForm({
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || '',
          jobTitle: data.jobTitle || '',
          bio: data.bio || '',
          language: data.language || 'fr',
          experienceLevel: data.experienceLevel || '',
        });
        setProfileVisibility(data.profileVisibility ?? true);
      });
    }
  }, [user]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.patch('/users/me/profile', form);
      await refreshUser();
      if (form.language === 'fr' || form.language === 'en') setLocale(form.language);
      toast.success(t('settings.profile.saved'));
    } catch {
      toast.error(t('settings.saveError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      id="basic_settings"
      className="border-[var(--neutral-100)] dark:border-white/[0.06] shadow-[0_1px_2px_rgba(15,26,46,0.04),0_8px_24px_-10px_rgba(15,26,46,0.08)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_-10px_rgba(0,0,0,0.5)]"
    >
      <CardHeader className="flex-col items-start gap-1 pt-5 pb-4 border-b-0">
        <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-[var(--accent-700)] dark:text-[var(--accent-300)]">
          {t('settings.kicker.account')}
        </span>
        <h2 className="font-display text-[19px] font-bold text-foreground m-0">{t('settings.profile.title')}</h2>
        <p className="text-[13px] text-muted-foreground m-0">
          {t('settings.profile.desc')}
        </p>
      </CardHeader>

      <CardContent className="pt-2">
        {/* Photo */}
        <div className={FIELD_ROW}>
          <Label className="text-[13px] font-medium text-foreground">{t('settings.profile.photo')}</Label>
          <div className="flex items-center justify-between flex-wrap gap-2.5">
            <span className="text-[12px] text-muted-foreground">150x150px JPEG, PNG, WebP</span>
            <AvatarUpload
              currentAvatar={user?.avatar}
              firstName={user?.firstName}
              lastName={user?.lastName}
              onUpload={() => refreshUser()}
              onDelete={() => refreshUser()}
            />
          </div>
        </div>

        {/* Prénom */}
        <div className={FIELD_ROW}>
          <Label htmlFor="profile-first-name" className="text-[13px] font-medium text-foreground">
            {t('auth.field.firstName')}
          </Label>
          <Input
            id="profile-first-name"
            type="text"
            value={form.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
          />
        </div>

        {/* Nom */}
        <div className={FIELD_ROW}>
          <Label htmlFor="profile-last-name" className="text-[13px] font-medium text-foreground">
            {t('auth.field.lastName')}
          </Label>
          <Input
            id="profile-last-name"
            type="text"
            value={form.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
          />
        </div>

        {/* Titre de poste */}
        <div className={FIELD_ROW}>
          <Label htmlFor="profile-job-title" className="text-[13px] font-medium text-foreground">
            {t('settings.profile.jobTitle')}
          </Label>
          <SearchableCombobox
            id="profile-job-title"
            value={form.jobTitle}
            onChange={(v) => handleChange('jobTitle', v)}
            options={JOB_TITLE_OPTIONS}
            placeholder={t('settings.profile.jobTitlePh')}
            searchPlaceholder={t('settings.profile.jobTitleSearch')}
            allowCustom
            customLabel={(q) => t('settings.profile.other', { name: q })}
          />
        </div>

        {/* Téléphone */}
        <div className={FIELD_ROW}>
          <Label htmlFor="profile-phone" className="text-[13px] font-medium text-foreground">
            {t('settings.profile.phone')}
          </Label>
          <Input
            id="profile-phone"
            type="text"
            placeholder={t('settings.profile.phonePh')}
            value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
        </div>

        {/* Bio */}
        <div className={FIELD_ROW}>
          <Label htmlFor="profile-bio" className="text-[13px] font-medium text-foreground">
            {t('settings.profile.bio')}
          </Label>
          <Textarea
            id="profile-bio"
            rows={3}
            placeholder={t('settings.profile.bioPh')}
            className="resize-none"
            value={form.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
          />
        </div>

        {/* Langue */}
        <div className={FIELD_ROW}>
          <Label className="text-[13px] font-medium text-foreground">{t('settings.profile.language')}</Label>
          <Select value={form.language} onValueChange={(v) => handleChange('language', v)}>
            <SelectTrigger>
              <SelectValue placeholder={t('settings.select')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fr">{t('settings.lang.fr')}</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Niveau d'expérience */}
        <div className={FIELD_ROW}>
          <Label className="text-[13px] font-medium text-foreground">{t('settings.profile.experience')}</Label>
          <Select value={form.experienceLevel} onValueChange={(v) => handleChange('experienceLevel', v)}>
            <SelectTrigger>
              <SelectValue placeholder={t('settings.selectDash')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">{t('difficulty.BEGINNER')}</SelectItem>
              <SelectItem value="intermediate">{t('difficulty.INTERMEDIATE')}</SelectItem>
              <SelectItem value="advanced">{t('difficulty.ADVANCED')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Visibilité profil */}
        <div className={FIELD_ROW}>
          <Label htmlFor="profile-visibility" className="text-[13px] font-medium text-foreground">
            {t('settings.profile.visibility')}
          </Label>
          <div className="flex items-center gap-2.5">
            <Switch
              id="profile-visibility"
              size="sm"
              checked={profileVisibility}
              onCheckedChange={async (checked) => {
                setProfileVisibility(checked);
                try {
                  await api.patch('/users/me/settings', { profileVisibility: checked });
                  await refreshUser();
                  toast.success(t('settings.profile.visibilitySaved'));
                } catch {
                  setProfileVisibility(!checked);
                  toast.error(t('settings.updateError'));
                }
              }}
            />
            <span className="text-[12px] text-muted-foreground">{t('settings.profile.public')}</span>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-[var(--neutral-100)] dark:border-white/[0.06]">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? t('settings.saving') : t('common.save')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
