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
import { passwordField, passwordStrength } from '@/components/auth/auth-schemas';
import { useT } from '@/i18n/app/use-t';

const resetSchema = (t: ReturnType<typeof useT>) =>
  z
    .object({
      newPassword: passwordField(t),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('auth.password.mismatch'),
      path: ['confirmPassword'],
    });

type ResetForm = z.infer<ReturnType<typeof resetSchema>>;

export function ResetPasswordPage() {
  const t = useT();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ResetForm>({
    resolver: zodResolver(resetSchema(t)),
  });

  const newPassword = form.watch('newPassword') ?? '';

  const onSubmit = async (data: ResetForm) => {
    if (!token) {
      setServerError(t('auth.reset.missingToken'));
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
      setServerError(error.message || t('auth.reset.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <AuthCard
        title={t('auth.reset.invalidTitle')}
        subtitle={t('auth.reset.invalidSubtitle')}
      >
        <Button asChild className="w-full">
          <Link to="/auth/forgot-password">{t('auth.reset.requestNew')}</Link>
        </Button>
      </AuthCard>
    );
  }

  const strength = newPassword ? passwordStrength(newPassword) : null;

  return (
    <AuthCard
      title={t('auth.reset.title')}
      subtitle={t('auth.reset.subtitle')}
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
                <FormLabel>{t('auth.reset.newPassword')}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder={t('auth.password.placeholder')}
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
                    <p className="text-xs text-muted-foreground">{t(strength.label)}</p>
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
                <FormLabel>{t('auth.password.confirm')}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder={t('auth.password.confirmPlaceholder')}
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
            {isSubmitting ? t('auth.reset.updating') : t('auth.reset.submit')}
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
}
