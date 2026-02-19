import { Link, Outlet } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

export function AuthLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="grid lg:grid-cols-2 grow">
        {/* Panneau formulaire — gauche sur desktop, order-2 */}
        <div className="flex justify-center items-center p-8 lg:p-10 order-2 lg:order-1">
          <Card className="w-full max-w-[440px]">
            <CardContent className="p-10">
              <Outlet />
            </CardContent>
          </Card>
        </div>

        {/* Panneau branding — droite sur desktop, order-1 */}
        <div className="lg:rounded-xl lg:border lg:border-border lg:m-5 order-1 lg:order-2 bg-primary relative overflow-hidden flex flex-col">
          <img
            src="/media/app/auth-bg.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-20"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="relative z-10 flex flex-col p-8 lg:p-16 gap-4">
            <Link to="/">
              <img
                src="/media/app/mini-logo.svg"
                alt="Sim360"
                className="h-7 max-w-none brightness-0 invert"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </Link>
            <div className="flex flex-col gap-3">
              <h3 className="text-2xl font-semibold text-white">
                Accès sécurisé à votre espace
              </h3>
              <p className="text-base font-medium text-white/80">
                Plateforme de simulation et gestion intelligente pour piloter
                vos activités en temps réel.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
