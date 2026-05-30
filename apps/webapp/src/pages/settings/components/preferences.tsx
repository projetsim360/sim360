import { useState, useEffect, useId } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const FIELD_ROW =
  'grid grid-cols-1 sm:grid-cols-[170px_minmax(0,1fr)] gap-3 sm:gap-4 items-center py-3 border-t border-[var(--neutral-100)] dark:border-white/[0.06] first:border-t-0 first:pt-1';

export function Preferences() {
  const id1 = useId();
  const id2 = useId();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const [timezone, setTimezone] = useState('europe_paris');
  const [dateFormat, setDateFormat] = useState('dd_mm_yyyy');
  const [simulationViewMode, setSimulationViewMode] = useState('modal');
  const [showSimulationNames, setShowSimulationNames] = useState(true);
  const [showLinkedReports, setShowLinkedReports] = useState(true);
  const [emailVisibility, setEmailVisibility] = useState(true);

  useEffect(() => {
    if (user) {
      setTimezone(user.timezone || 'europe_paris');
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
      toast.success('Préférences enregistrées');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
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
          APPLICATION
        </span>
        <h2 className="font-display text-[19px] font-bold text-foreground m-0">Préférences</h2>
        <p className="text-[13px] text-muted-foreground m-0">
          Vos préférences d'usage de la plateforme.
        </p>
      </CardHeader>

      <CardContent className="pt-2">
        {/* Fuseau horaire */}
        <div className={FIELD_ROW}>
          <Label className="text-[13px] font-medium text-foreground">Fuseau horaire</Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="europe_paris">GMT +1:00 - Europe/Paris</SelectItem>
              <SelectItem value="europe_london">GMT +0:00 - Europe/Londres</SelectItem>
              <SelectItem value="america_new_york">GMT -5:00 - Amérique/New York</SelectItem>
              <SelectItem value="america_los_angeles">GMT -8:00 - Amérique/Los Angeles</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Format de date */}
        <div className={FIELD_ROW}>
          <Label className="text-[13px] font-medium text-foreground">Format de date</Label>
          <Select value={dateFormat} onValueChange={setDateFormat}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dd_mm_yyyy">JJ/MM/AAAA</SelectItem>
              <SelectItem value="mm_dd_yyyy">MM/JJ/AAAA</SelectItem>
              <SelectItem value="yyyy_mm_dd">AAAA-MM-JJ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Ouverture des simulations */}
        <div className={FIELD_ROW}>
          <Label className="text-[13px] font-medium text-foreground">Ouvrir en…</Label>
          <RadioGroup
            value={simulationViewMode}
            onValueChange={setSimulationViewMode}
            className="flex items-center gap-5"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="modal" id={id1} />
              <Label htmlFor={id1} className="text-foreground text-[13px] font-normal">
                Modal
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="fullscreen" id={id2} />
              <Label htmlFor={id2} className="text-foreground text-[13px] font-normal">
                Plein écran
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Affichage */}
        <div className={FIELD_ROW}>
          <Label className="text-[13px] font-medium text-foreground">Affichage</Label>
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
                  Afficher les noms des simulations
                </Label>
              </div>
              <div className="text-[11px] text-muted-foreground pl-6">
                Voir le nom à côté de chaque icône
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
                  Afficher les rapports liés
                </Label>
              </div>
              <div className="text-[11px] text-muted-foreground pl-6">
                Afficher les noms des rapports liés aux simulations
              </div>
            </div>
          </div>
        </div>

        {/* Visibilité email */}
        <div className={FIELD_ROW}>
          <Label htmlFor="pref-email-visibility" className="text-[13px] font-medium text-foreground">
            Visibilité de l'email
          </Label>
          <div className="flex items-center gap-2.5">
            <Switch
              id="pref-email-visibility"
              size="sm"
              checked={emailVisibility}
              onCheckedChange={setEmailVisibility}
            />
            <span className="text-[12px] text-muted-foreground">Visible</span>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-[var(--neutral-100)] dark:border-white/[0.06]">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Sauvegarde…' : 'Enregistrer'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
