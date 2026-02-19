import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { api } from '@/lib/api-client';
import { AvatarUpload } from '@/components/common/avatar-upload';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function BasicSettings() {
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
      toast.success('Paramètres sauvegardés');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="pb-2.5">
      <CardHeader id="basic_settings">
        <CardTitle>Paramètres de base</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5">
        {/* Photo */}
        <div className="flex items-center flex-wrap gap-2.5">
          <Label className="flex w-full max-w-56">Photo</Label>
          <div className="flex items-center justify-between flex-wrap grow gap-2.5">
            <span className="text-sm text-secondary-foreground">
              150x150px JPEG, PNG, WebP
            </span>
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
        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <Label className="flex w-full items-center gap-1 max-w-56">
              Prénom
            </Label>
            <Input
              type="text"
              value={form.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
            />
          </div>
        </div>

        {/* Nom */}
        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <Label className="flex w-full items-center gap-1 max-w-56">
              Nom
            </Label>
            <Input
              type="text"
              value={form.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
            />
          </div>
        </div>

        {/* Titre de poste */}
        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <Label className="flex w-full items-center gap-1 max-w-56">
              Titre de poste
            </Label>
            <Input
              type="text"
              placeholder="Ex: Chef de projet"
              value={form.jobTitle}
              onChange={(e) => handleChange('jobTitle', e.target.value)}
            />
          </div>
        </div>

        {/* Téléphone */}
        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <Label className="flex w-full items-center gap-1 max-w-56">
              Téléphone
            </Label>
            <Input
              type="text"
              placeholder="+33 6 12 34 56 78"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </div>
        </div>

        {/* Bio */}
        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <Label className="flex w-full items-center gap-1 max-w-56">
              Bio
            </Label>
            <Textarea
              rows={3}
              placeholder="Quelques mots sur vous..."
              className="resize-none"
              value={form.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
            />
          </div>
        </div>

        {/* Langue */}
        <div className="flex items-center flex-wrap gap-2.5">
          <Label className="flex w-full max-w-56">Langue</Label>
          <div className="grow">
            <Select value={form.language} onValueChange={(v) => handleChange('language', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Niveau d'expérience */}
        <div className="flex items-center flex-wrap gap-2.5">
          <Label className="flex w-full max-w-56">Niveau d'expérience</Label>
          <div className="grow">
            <Select value={form.experienceLevel} onValueChange={(v) => handleChange('experienceLevel', v)}>
              <SelectTrigger>
                <SelectValue placeholder="— Sélectionner —" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Débutant</SelectItem>
                <SelectItem value="intermediate">Intermédiaire</SelectItem>
                <SelectItem value="advanced">Avancé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Visibilité profil */}
        <div className="flex items-center flex-wrap gap-2.5">
          <Label className="flex w-full max-w-56">Visibilité du profil</Label>
          <div className="flex items-center gap-2">
            <Label className="text-foreground text-sm font-normal">
              Profil public
            </Label>
            <Switch
              size="sm"
              checked={profileVisibility}
              onCheckedChange={async (checked) => {
                setProfileVisibility(checked);
                try {
                  await api.patch('/users/me/settings', { profileVisibility: checked });
                  await refreshUser();
                  toast.success('Visibilité du profil mise à jour');
                } catch {
                  setProfileVisibility(!checked);
                  toast.error('Erreur lors de la mise à jour');
                }
              }}
            />
          </div>
        </div>

        <div className="flex justify-end pt-2.5">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
