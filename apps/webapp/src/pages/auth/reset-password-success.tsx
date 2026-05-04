import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AuthCard } from '@/components/auth/auth-card';

export function ResetPasswordSuccessPage() {
  return (
    <AuthCard
      title="C'est fait."
      subtitle="Votre mot de passe a été mis à jour."
    >
      <Button asChild className="w-full">
        <Link to="/auth/sign-in">Se connecter</Link>
      </Button>
    </AuthCard>
  );
}
