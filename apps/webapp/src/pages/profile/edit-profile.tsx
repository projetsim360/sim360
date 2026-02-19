import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/providers/auth-provider';
import { api } from '@/lib/api-client';
import { AvatarUpload } from '@/components/common/avatar-upload';
import { toast } from 'sonner';
import { Toolbar, ToolbarHeading } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';

const profileSchema = z.object({
  firstName: z.string().min(1, 'Requis').max(100),
  lastName: z.string().min(1, 'Requis').max(100),
  bio: z.string().max(500).optional(),
  phone: z.string().max(20).optional(),
  jobTitle: z.string().max(100).optional(),
  language: z.string().optional(),
  experienceLevel: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Requis'),
    newPassword: z
      .string()
      .min(8, 'Minimum 8 caractères')
      .regex(/[a-z]/, 'Au moins une minuscule')
      .regex(/[A-Z]/, 'Au moins une majuscule')
      .regex(/\d/, 'Au moins un chiffre')
      .regex(/[^a-zA-Z\d]/, 'Au moins un caractère spécial'),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmNewPassword'],
  });

type PasswordForm = z.infer<typeof passwordSchema>;

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z\d]/.test(password)) score++;

  if (score <= 2) return { score, label: 'Faible', color: 'bg-red-500' };
  if (score <= 3) return { score, label: 'Moyen', color: 'bg-yellow-500' };
  if (score <= 4) return { score, label: 'Fort', color: 'bg-blue-500' };
  return { score, label: 'Très fort', color: 'bg-green-500' };
}

export function EditProfilePage() {
  const { user, refreshUser } = useAuth();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmNewPassword: '' },
  });

  const newPassword = passwordForm.watch('newPassword');
  const strength = getPasswordStrength(newPassword || '');

  useEffect(() => {
    if (user) {
      profileForm.reset({
        firstName: user.firstName,
        lastName: user.lastName,
      });
      api.get<any>('/users/me').then((data) => {
        profileForm.reset({
          firstName: data.firstName,
          lastName: data.lastName,
          bio: data.bio || '',
          phone: data.phone || '',
          jobTitle: data.jobTitle || '',
          language: data.language || 'fr',
          experienceLevel: data.experienceLevel || '',
        });
      });
    }
  }, [user, profileForm.reset]);

  const onProfileSubmit = async (data: ProfileForm) => {
    setProfileLoading(true);
    try {
      await api.patch('/users/me/profile', data);
      await refreshUser();
      toast.success('Profil mis à jour');
    } catch {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    setPasswordLoading(true);
    try {
      await api.post('/users/me/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      passwordForm.reset();
      toast.success('Mot de passe modifié');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="container">
      <Toolbar>
        <ToolbarHeading title="Mon profil" />
      </Toolbar>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 lg:gap-7.5">
        {/* Colonne gauche */}
        <div className="col-span-1">
          <div className="grid gap-5 lg:gap-7.5">
            {/* Photo de profil */}
            <Card>
              <CardHeader>
                <CardTitle>Photo de profil</CardTitle>
              </CardHeader>
              <CardContent>
                <AvatarUpload
                  currentAvatar={user?.avatar}
                  firstName={user?.firstName}
                  lastName={user?.lastName}
                  onUpload={() => refreshUser()}
                  onDelete={() => refreshUser()}
                />
              </CardContent>
            </Card>

            {/* Informations personnelles */}
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="grid gap-5">
                    <div className="w-full">
                      <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                        <Label className="flex w-full max-w-56">Email</Label>
                        <Input value={user?.email || ''} disabled />
                      </div>
                    </div>

                    <FormField
                      control={profileForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                            <Label className="flex w-full max-w-56">Prénom</Label>
                            <div className="grow">
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                            <Label className="flex w-full max-w-56">Nom</Label>
                            <div className="grow">
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="jobTitle"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                            <Label className="flex w-full max-w-56">Titre de poste</Label>
                            <div className="grow">
                              <FormControl>
                                <Input placeholder="Ex: Chef de projet" {...field} />
                              </FormControl>
                              <FormMessage />
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                            <Label className="flex w-full max-w-56">Téléphone</Label>
                            <div className="grow">
                              <FormControl>
                                <Input placeholder="+33 6 12 34 56 78" {...field} />
                              </FormControl>
                              <FormMessage />
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                            <Label className="flex w-full max-w-56">Bio</Label>
                            <div className="grow">
                              <FormControl>
                                <Textarea
                                  rows={3}
                                  placeholder="Quelques mots sur vous..."
                                  className="resize-none"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end pt-2.5">
                      <Button type="submit" disabled={profileLoading}>
                        {profileLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Colonne droite */}
        <div className="col-span-1">
          <div className="grid gap-5 lg:gap-7.5">
            {/* Préférences */}
            <Card>
              <CardHeader>
                <CardTitle>Préférences</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="grid gap-5">
                    <FormField
                      control={profileForm.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <div className="flex items-center flex-wrap gap-2.5">
                            <Label className="flex w-full max-w-56">Langue</Label>
                            <div className="grow">
                              <Select
                                value={field.value || 'fr'}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="fr">Français</SelectItem>
                                  <SelectItem value="en">English</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="experienceLevel"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <div className="flex items-center flex-wrap gap-2.5">
                            <Label className="flex w-full max-w-56">Niveau d'expérience</Label>
                            <div className="grow">
                              <Select
                                value={field.value || ''}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="— Sélectionner —" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="beginner">Débutant</SelectItem>
                                  <SelectItem value="intermediate">Intermédiaire</SelectItem>
                                  <SelectItem value="advanced">Avancé</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end pt-2.5">
                      <Button type="submit" disabled={profileLoading}>
                        {profileLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Mot de passe */}
            <Card>
              <CardHeader>
                <CardTitle>Mot de passe</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="grid gap-5">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                            <Label className="flex w-full max-w-56">Mot de passe actuel</Label>
                            <div className="grow">
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Votre mot de passe actuel"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                            <Label className="flex w-full max-w-56">Nouveau mot de passe</Label>
                            <div className="grow space-y-2">
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Minimum 8 caractères"
                                  {...field}
                                />
                              </FormControl>
                              {(field.value ?? '').length > 0 && (
                                <div className="space-y-1">
                                  <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                      <div
                                        key={i}
                                        className={`h-1 flex-1 rounded-full transition-colors ${
                                          i <= strength.score ? strength.color : 'bg-muted'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <p className="text-xs text-muted-foreground">{strength.label}</p>
                                </div>
                              )}
                              <FormMessage />
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="confirmNewPassword"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                            <Label className="flex w-full max-w-56">Confirmer</Label>
                            <div className="grow">
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Retapez le nouveau mot de passe"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end pt-2.5">
                      <Button type="submit" disabled={passwordLoading}>
                        {passwordLoading ? 'Modification...' : 'Modifier le mot de passe'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
