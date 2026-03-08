import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from '@/components/keenicons/icons';
import { useAuth } from '@/providers/auth-provider';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';

const signInSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Requis'),
  rememberMe: z.boolean().optional(),
});

type SignInForm = z.infer<typeof signInSchema>;

export function SignInPage() {
  const { login, isLoggedIn, isLoading } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      navigate('/dashboard', { replace: true });
    }
  }, [isLoading, isLoggedIn, navigate]);

  const form = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: { rememberMe: false },
  });

  const onSubmit = async (data: SignInForm) => {
    setServerError('');
    setIsSubmitting(true);
    try {
      await login(data.email, data.password, data.rememberMe);
    } catch (error: any) {
      const msg = error.message || '';
      if (msg.startsWith('EMAIL_NOT_VERIFIED:')) {
        setServerError(msg.split(':').slice(1).join(':'));
        return;
      }
      if (msg.startsWith('ACCOUNT_LOCKED:')) {
        setServerError(msg.split(':').slice(1).join(':'));
        return;
      }
      setServerError(error.message || 'Identifiants incorrects');
    } finally {
      setIsSubmitting(false);
    }
  };

  const googleEnabled = import.meta.env.VITE_GOOGLE_OAUTH_ENABLED === 'true';
  const googleUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'}/auth/google`;

  return (
    <div>
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-foreground">Se connecter</h2>
        <p className="text-muted-foreground mt-2">Bienvenue ! Connectez-vous avec vos identifiants.</p>
      </div>

      {googleEnabled && (
        <>
          <Button variant="outline" type="button" className="w-full" asChild>
            <a href={googleUrl} className="flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continuer avec Google
            </a>
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">ou</span>
            </div>
          </div>
        </>
      )}

      {serverError && (
        <Alert variant="destructive" appearance="light" close onClose={() => setServerError('')} className="mb-4">
          <AlertIcon><AlertCircle /></AlertIcon>
          <AlertTitle>{serverError}</AlertTitle>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="votre@email.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mot de passe</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Votre mot de passe"
                      type={passwordVisible ? 'text' : 'password'}
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      mode="icon"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    >
                      {passwordVisible ? (
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

          <div className="flex items-center justify-between">
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm text-muted-foreground cursor-pointer font-normal">
                    Se souvenir de moi
                  </FormLabel>
                </FormItem>
              )}
            />
            <Link to="/auth/forgot-password" className="text-sm text-primary hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Pas encore de compte ?{' '}
        <Link to="/auth/sign-up" className="text-primary hover:underline font-medium">
          S'inscrire
        </Link>
      </p>
    </div>
  );
}
