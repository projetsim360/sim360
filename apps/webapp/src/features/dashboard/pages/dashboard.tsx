import { useAuth } from '@/providers/auth-provider';
import { Toolbar, ToolbarHeading } from '@/components/layouts/layout-6/components/toolbar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Settings, UserCircle, Shield, BarChart3, Users, FolderOpen } from '@/components/keenicons/icons';

export default function DashboardPage() {
  const { user } = useAuth();

  const initials = user
    ? `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`.toUpperCase()
    : '';

  const fullName = user ? `${user.firstName} ${user.lastName}` : '';
  const apiBase = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';

  return (
    <div className="container">
      <Toolbar>
        <ToolbarHeading title="Tableau de bord" />
      </Toolbar>

      <div className="grid gap-5 lg:gap-7.5">
        {/* Welcome + Quick Actions row */}
        <div className="grid lg:grid-cols-3 gap-5 lg:gap-7.5 items-stretch">
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardContent className="flex items-center gap-4 py-5">
                <Avatar className="size-16">
                  {user?.avatar ? (
                    <AvatarImage
                      src={`${apiBase}${user.avatar}`}
                      alt={fullName}
                      className="size-16"
                    />
                  ) : null}
                  <AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-foreground">
                    Bienvenue, {user?.firstName} !
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">{user?.email}</p>
                  {user?.role && (
                    <Badge variant="primary" appearance="light" size="sm" className="mt-1.5">
                      {user.role}
                    </Badge>
                  )}
                </div>
                <Button variant="outline" asChild className="hidden sm:flex">
                  <Link to="/profile/edit">
                    <Settings className="size-4" />
                    Mon profil
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <div className="grid grid-cols-2 gap-5 lg:gap-7.5 h-full items-stretch">
              <StatCard
                label="Simulations"
                value="0"
                color="text-blue-500"
              />
              <StatCard
                label="Rapports"
                value="0"
                color="text-green-500"
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid lg:grid-cols-3 gap-5 lg:gap-7.5 items-stretch">
          <QuickActionCard
            icon={<UserCircle className="size-5 text-blue-500" />}
            title="Mon profil"
            description="Modifier vos informations personnelles"
            to="/profile/edit"
          />
          <QuickActionCard
            icon={<Shield className="size-5 text-green-500" />}
            title="Sécurité"
            description="Mot de passe et paramètres de sécurité"
            to="/profile/edit"
          />
          <QuickActionCard
            icon={<BarChart3 className="size-5 text-purple-500" />}
            title="Statistiques"
            description="Visualiser vos métriques"
            to="/dashboard"
            disabled
          />
        </div>

        {/* Info row */}
        <div className="grid lg:grid-cols-3 gap-5 lg:gap-7.5 items-stretch">
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="size-4.5" />
                  Informations du profil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <InfoRow label="Nom complet" value={fullName} />
                  <InfoRow label="Email" value={user?.email ?? '-'} />
                  <InfoRow label="Rôle" value={user?.role ?? '-'} />
                  <InfoRow
                    label="Email vérifié"
                    value={user?.emailVerifiedAt ? 'Oui' : 'Non'}
                  />
                  <InfoRow
                    label="Profil complété"
                    value={user?.profileCompleted ? 'Oui' : 'Non'}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="size-4.5" />
                  Activité récente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                  Aucune activité récente pour le moment.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-5 h-full">
        <span className={`text-2xl font-bold ${color}`}>{value}</span>
        <span className="text-xs text-muted-foreground mt-1">{label}</span>
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function QuickActionCard({
  icon,
  title,
  description,
  to,
  disabled,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  to: string;
  disabled?: boolean;
}) {
  const card = (
    <Card className={`h-full transition-colors ${disabled ? 'opacity-50' : 'hover:border-primary/50'}`}>
      <CardContent className="py-5">
        <div className="flex items-center gap-3 mb-2">
          {icon}
          <h3 className="font-medium text-foreground">{title}</h3>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  if (disabled) return card;

  return <Link to={to}>{card}</Link>;
}
