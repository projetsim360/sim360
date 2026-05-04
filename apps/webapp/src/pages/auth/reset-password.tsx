import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from '@/components/keenicons/icons';
import { api } from '@/lib/api-client';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { AuthCard } from '@/components/auth/auth-card';

const resetSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Minimum 8 caractères')
      .regex(/[a-z]/, 'Au moins une minuscule')
      .regex(/[A-Z]/, 'Au moins une majuscule')
      .regex(/\d/, 'Au moins un chiffre')
      .regex(/[^a-zA-Z\d]/, 'Au moins un caractère spécial'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type ResetForm = z.infer<typeof resetSchema>;

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

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  const newPassword = form.watch('newPassword') ?? '';

  const onSubmit = async (data: ResetForm) => {
    if (!token) {
      setServerError('Token manquant');
      return;
    }

    setServerError('');
    setIsSubmitting(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword: data.newPassword,
      });
      navigate('/auth/reset-password-success');
    } catch (error: any) {
      setServerError(error.message || 'Erreur lors de la réinitialisation');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <AuthCard
        title="Lien invalide."
        subtitle="Le lien de réinitialisation est invalide ou a expiré."
      >
        <Button asChild className="w-full">
          <Link to="/auth/forgot-password">Demander un nouveau lien</Link>
        </Button>
      </AuthCard>
    );
  }

  const strength = newPassword ? getPasswordStrength(newPassword) : null;

  return (
    <AuthCard
      title="Nouveau mot de passe."
      subtitle="Choisissez un mot de passe robuste."
    >
      {serverError && (
        <Alert variant="destructive">
          <AlertIcon />
          <AlertTitle>{serverError}</AlertTitle>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nouveau mot de passe</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Minimum 8 caractères"
                      type={showNewPassword ? 'text' : 'password'}
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      mode="icon"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    >
                      {showNewPassword ? (
                        <EyeOff className="text-muted-foreground" />
                      ) : (
                        <Eye className="text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                {strength && newPassword && (
                  <div className="space-y-1 mt-1.5">
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
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmer le mot de passe</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Retapez votre mot de passe"
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      mode="icon"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="text-muted-foreground" />
                      ) : (
                        <Eye className="text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Mise à jour...' : 'Mettre à jour'}
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
}
