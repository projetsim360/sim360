import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api-client';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AuthCard } from '@/components/auth/auth-card';
import { useT } from '@/i18n/app/use-t';

const forgotSchema = (invalidEmail: string) =>
  z.object({
    email: z.string().email(invalidEmail),
  });

type ForgotForm = z.infer<ReturnType<typeof forgotSchema>>;

export function ForgotPasswordPage() {
  const t = useT();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema(t('auth.field.emailInvalid'))),
  });

  const onSubmit = async (data: ForgotForm) => {
    setIsSubmitting(true);
    try {
      await api.post('/auth/forgot-password', data);
    } catch {
      // Always redirect to check-email for security
    } finally {
      setIsSubmitting(false);
      navigate('/auth/check-email', { state: { email: data.email } });
    }
  };

  return (
    <AuthCard
      title={t('auth.forgot.title')}
      subtitle={t('auth.forgot.subtitle')}
      bottomSlot={
        <Link
          to="/auth/sign-in"
          className="font-medium text-[var(--accent-600)] hover:underline"
        >
          {t('auth.backToSignIn')}
        </Link>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auth.field.email')}</FormLabel>
                <FormControl>
                  <Input type="email" placeholder={t('auth.field.emailPlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t('auth.forgot.sending') : t('auth.forgot.submit')}
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
}
