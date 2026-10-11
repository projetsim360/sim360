import { useState, useEffect, useId, useMemo } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { SearchableCombobox } from '@/components/common/searchable-combobox';
import { PREFERRED_TIMEZONES, formatTimezoneLabel, getBrowserTimezone, listTimezones, normalizeTimezone } from '@/lib/timezones';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useT } from '@/i18n/app/use-t';

const FIELD_ROW =
  'grid grid-cols-1 sm:grid-cols-[170px_minmax(0,1fr)] gap-3 sm:gap-4 items-center py-3 border-t border-[var(--neutral-100)] dark:border-white/[0.06] first:border-t-0 first:pt-1';

export function Preferences() {
  const t = useT();
  const id1 = useId();
  const id2 = useId();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const [timezone, setTimezone] = useState(() => getBrowserTimezone());
  const timezoneOptions = useMemo(
    () =>
      listTimezones().map((tz) => ({
        value: tz,
        label: formatTimezoneLabel(tz),
        group: PREFERRED_TIMEZONES.includes(tz) ? t('settings.tz.suggestions') : t('settings.tz.all'),
      })),
    [t],
  );
  const [dateFormat, setDateFormat] = useState('dd_mm_yyyy');
  const [simulationViewMode, setSimulationViewMode] = useState('modal');
  const [showSimulationNames, setShowSimulationNames] = useState(true);
  const [showLinkedReports, setShowLinkedReports] = useState(true);
  const [emailVisibility, setEmailVisibility] = useState(true);

  useEffect(() => {
    if (user) {
      setTimezone(normalizeTimezone(user.timezone, getBrowserTimezone()));
      setDateFormat(user.dateFormat || 'dd_mm_yyyy');
      setSimulationViewMode(user.simulationViewMode || 'modal');
      setShowSimulationNames(user.showSimulationNames ?? true);
      setShowLinkedReports(user.showLinkedReports ?? true);
      setEmailVisibility(user.emailVisibility ?? true);
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.patch('/users/me/settings', {
        timezone,
        dateFormat,
        simulationViewMode,
        showSimulationNames,
        showLinkedReports,
        emailVisibility,
      });
      await refreshUser();
      toast.success(t('settings.prefs.saved'));
    } catch {
      toast.error(t('settings.saveError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      id="preferences_general"
      className="border-[var(--neutral-100)] dark:border-white/[0.06] shadow-[0_1px_2px_rgba(15,26,46,0.04),0_8px_24px_-10px_rgba(15,26,46,0.08)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_-10px_rgba(0,0,0,0.5)]"
    >
      <CardHeader className="flex-col items-start gap-1 pt-5 pb-4 border-b-0">
        <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-[var(--accent-700)] dark:text-[var(--accent-300)]">
          {t('settings.kicker.app')}
        </span>
        <h2 className="font-display text-[19px] font-bold text-foreground m-0">{t('settings.prefs.title')}</h2>
        <p className="text-[13px] text-muted-foreground m-0">
          {t('settings.prefs.desc')}
        </p>
      </CardHeader>

      <CardContent className="pt-2">
        {/* Fuseau horaire */}
        <div className={FIELD_ROW}>
          <Label className="text-[13px] font-medium text-foreground">{t('settings.prefs.timezone')}</Label>
          <SearchableCombobox
            value={timezone}
            onChange={setTimezone}
            options={timezoneOptions}
            searchPlaceholder={t('settings.prefs.tzSearch')}
            emptyText={t('settings.prefs.tzEmpty')}
          />
        </div>

        {/* Format de date */}
        <div className={FIELD_ROW}>
          <Label className="text-[13px] font-medium text-foreground">{t('settings.prefs.dateFormat')}</Label>
          <Select value={dateFormat} onValueChange={setDateFormat}>
            <SelectTrigger>
              <SelectValue placeholder={t('settings.select')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dd_mm_yyyy">{t('settings.prefs.ddmmyyyy')}</SelectItem>
              <SelectItem value="mm_dd_yyyy">{t('settings.prefs.mmddyyyy')}</SelectItem>
              <SelectItem value="yyyy_mm_dd">{t('settings.prefs.yyyymmdd')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Ouverture des simulations */}
        <div className={FIELD_ROW}>
          <Label className="text-[13px] font-medium text-foreground">{t('settings.prefs.openIn')}</Label>
          <RadioGroup
            value={simulationViewMode}
            onValueChange={setSimulationViewMode}
            className="flex items-center gap-5"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="modal" id={id1} />
              <Label htmlFor={id1} className="text-foreground text-[13px] font-normal">
                {t('settings.prefs.modal')}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="fullscreen" id={id2} />
              <Label htmlFor={id2} className="text-foreground text-[13px] font-normal">
                {t('settings.prefs.fullscreen')}
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Affichage */}
        <div className={FIELD_ROW}>
          <Label className="text-[13px] font-medium text-foreground">{t('settings.prefs.display')}</Label>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pref-show-sim-names"
                  checked={showSimulationNames}
                  onCheckedChange={(checked) => setShowSimulationNames(checked === true)}
                />
                <Label
                  htmlFor="pref-show-sim-names"
                  className="text-[13px] font-normal text-foreground"
                >
                  {t('settings.prefs.showSimNames')}
                </Label>
              </div>
              <div className="text-[11px] text-muted-foreground pl-6">
                {t('settings.prefs.showSimNamesDesc')}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pref-show-linked-reports"
                  checked={showLinkedReports}
                  onCheckedChange={(checked) => setShowLinkedReports(checked === true)}
                />
                <Label
                  htmlFor="pref-show-linked-reports"
                  className="text-[13px] font-normal text-foreground"
                >
                  {t('settings.prefs.showReports')}
                </Label>
              </div>
              <div className="text-[11px] text-muted-foreground pl-6">
                {t('settings.prefs.showReportsDesc')}
              </div>
            </div>
          </div>
        </div>

        {/* Visibilité email */}
        <div className={FIELD_ROW}>
          <Label htmlFor="pref-email-visibility" className="text-[13px] font-medium text-foreground">
            {t('settings.prefs.emailVisibility')}
          </Label>
          <div className="flex items-center gap-2.5">
            <Switch
              id="pref-email-visibility"
              size="sm"
              checked={emailVisibility}
              onCheckedChange={setEmailVisibility}
            />
            <span className="text-[12px] text-muted-foreground">{t('settings.prefs.visible')}</span>
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
