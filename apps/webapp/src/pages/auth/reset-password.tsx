import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, MoveLeft } from 'lucide-react';
import { api } from '@/lib/api-client';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';

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
      <div className="text-center space-y-5">
        <h1 className="text-2xl font-semibold tracking-tight">Lien invalide</h1>
        <p className="text-muted-foreground">Le lien de réinitialisation est invalide.</p>
        <Button asChild>
          <Link to="/auth/forgot-password">Demander un nouveau lien</Link>
        </Button>
      </div>
    );
  }

  const strength = newPassword ? getPasswordStrength(newPassword) : null;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="block w-full space-y-5">
        <div className="text-center space-y-1 pb-3">
          <h1 className="text-2xl font-semibold tracking-tight">Nouveau mot de passe</h1>
          <p className="text-sm text-muted-foreground">Choisissez un nouveau mot de passe sécurisé.</p>
        </div>

        {serverError && (
          <Alert variant="destructive">
            <AlertIcon />
            <AlertTitle>{serverError}</AlertTitle>
          </Alert>
        )}

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
          {isSubmitting ? 'Réinitialisation...' : 'Réinitialiser'}
        </Button>

        <div className="text-center text-sm">
          <Link
            to="/auth/sign-in"
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <MoveLeft className="size-4" />
            Retour à la connexion
          </Link>
        </div>
      </form>
    </Form>
  );
}
