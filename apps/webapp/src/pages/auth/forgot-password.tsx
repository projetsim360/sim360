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

const forgotSchema = z.object({
  email: z.string().email('Email invalide'),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
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
      title="Mot de passe oublié ?"
      subtitle="On vous envoie un lien sécurisé."
      bottomSlot={
        <Link
          to="/auth/sign-in"
          className="font-medium text-[var(--accent-600)] hover:underline"
        >
          Retour à la connexion
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="votre@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Envoi...' : 'Envoyer le lien'}
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
}
