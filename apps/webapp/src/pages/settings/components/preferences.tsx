import { useState, useEffect, useId } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      toast.success('Préférences sauvegardées');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader id="preferences_general">
        <CardTitle>Préférences</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5 lg:py-7.5">
        {/* Fuseau horaire */}
        <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
          <Label className="flex w-full max-w-56">Fuseau horaire</Label>
          <div className="grow">
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
        </div>

        {/* Format de date */}
        <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5 mb-2">
          <Label className="flex w-full max-w-56">Format de date</Label>
          <div className="grow">
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
        </div>

        {/* Ouverture des simulations */}
        <div className="flex items-center flex-wrap lg:flex-nowrap gap-2.5">
          <Label className="flex w-full max-w-56">Ouvrir les simulations en...</Label>
          <div className="flex items-center gap-5">
            <RadioGroup
              value={simulationViewMode}
              onValueChange={setSimulationViewMode}
              className="flex items-center gap-5"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="modal" id={id1} />
                <Label
                  htmlFor={id1}
                  className="text-foreground text-sm font-normal"
                >
                  Modal
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fullscreen" id={id2} />
                <Label
                  htmlFor={id2}
                  className="text-foreground text-sm font-normal"
                >
                  Plein écran
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Attributs */}
        <div className="flex flex-wrap gap-2.5 mb-1.5">
          <Label className="flex w-full max-w-56">Affichage</Label>
          <div className="flex flex-col items-start gap-5">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={showSimulationNames}
                  onCheckedChange={(checked) => setShowSimulationNames(checked === true)}
                />
                <Label>Afficher les noms des simulations</Label>
              </div>
              <div className="text-xs text-muted-foreground">
                Voir le nom à côté de chaque icône
              </div>
            </div>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={showLinkedReports}
                  onCheckedChange={(checked) => setShowLinkedReports(checked === true)}
                />
                <Label>Afficher les rapports liés</Label>
              </div>
              <div className="text-xs text-muted-foreground">
                Afficher les noms des rapports liés aux simulations
              </div>
            </div>
          </div>
        </div>

        {/* Visibilité email */}
        <div className="flex items-center flex-wrap gap-2.5">
          <Label className="flex w-full max-w-56">Visibilité de l'email</Label>
          <Switch
            size="sm"
            checked={emailVisibility}
            onCheckedChange={setEmailVisibility}
          />
          <Label className="text-foreground text-sm">
            Visible
          </Label>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
