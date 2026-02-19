import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ResetPasswordSuccessPage() {
  return (
    <div className="flex flex-col items-center text-center space-y-5">
      <CheckCircle className="size-12 text-green-500" />
      <h3 className="text-lg font-medium text-mono">Mot de passe réinitialisé !</h3>
      <div className="text-sm text-secondary-foreground">
        Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
      </div>
      <Button asChild className="w-full">
        <Link to="/auth/sign-in">Se connecter</Link>
      </Button>
    </div>
  );
}
