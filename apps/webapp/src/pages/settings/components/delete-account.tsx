import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export function DeleteAccount() {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <Card>
      <CardHeader id="delete_account">
        <CardTitle>Supprimer le compte</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col lg:py-7.5 lg:gap-7.5 gap-3">
        <div className="flex flex-col gap-5">
          <div className="text-sm text-foreground">
            Nous sommes désolés de vous voir partir. La suppression de votre compte
            est irréversible et entraînera la perte définitive de toutes vos données,
            simulations et rapports. Veuillez consulter nos{' '}
            <Button mode="link" asChild>
              <a href="#">conditions d'utilisation</a>
            </Button>{' '}
            si vous souhaitez continuer.
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="confirm_delete"
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(checked === true)}
            />
            <Label htmlFor="confirm_delete">
              Je confirme la suppression de mon compte
            </Label>
          </div>
        </div>
        <div className="flex justify-end gap-2.5">
          <Button variant="outline" disabled>
            Désactiver plutôt
          </Button>
          <Button variant="destructive" disabled={!confirmed}>
            Supprimer le compte
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
