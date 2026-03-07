import { useState, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components/keenicons';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { useSimulatedEmails, useUnreadEmailCount } from '../api/simulated-emails.api';
import { EmailListItem } from '../components/email-list-item';
import { UnreadBadge } from '../components/unread-badge';
import type { SimulatedEmail, EmailStatus, EmailPriority } from '../types/simulated-email.types';

const STATUS_OPTIONS: { value: EmailStatus; label: string }[] = [
  { value: 'UNREAD', label: 'Non lu' },
  { value: 'READ', label: 'Lu' },
  { value: 'RESPONDED', label: 'Repondu' },
  { value: 'ARCHIVED', label: 'Archive' },
];

const PRIORITY_OPTIONS: { value: EmailPriority; label: string }[] = [
  { value: 'URGENT', label: 'Urgent' },
  { value: 'HIGH', label: 'Haute' },
  { value: 'NORMAL', label: 'Normale' },
  { value: 'LOW', label: 'Basse' },
];

export default function EmailInboxPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  const filters = useMemo(() => {
    const f: Record<string, string> = {};
    if (filterStatus) f.status = filterStatus;
    if (filterPriority) f.priority = filterPriority;
    return Object.keys(f).length > 0 ? (f as { status?: EmailStatus; priority?: EmailPriority }) : undefined;
  }, [filterStatus, filterPriority]);

  const { data: emails, isLoading, error } = useSimulatedEmails(id || '', filters);
  const { data: unreadData } = useUnreadEmailCount(id || '');

  const sortedEmails = useMemo(() => {
    if (!emails) return [];
    return [...emails].sort(
      (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
    );
  }, [emails]);

  function handleEmailClick(email: SimulatedEmail) {
    navigate(`/simulations/${id}/emails/${email.id}`);
  }

  if (!id) {
    return (
      <>
        <Toolbar>
          <ToolbarHeading title="Boite de reception" />
        </Toolbar>
        <div className="container-fixed">
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Aucune simulation selectionnee.
              </p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Toolbar>
        <ToolbarHeading title="Boite de reception" />
        <ToolbarActions>
          {unreadData && unreadData.count > 0 && (
            <div className="flex items-center gap-2">
              <UnreadBadge count={unreadData.count} />
              <span className="text-sm text-muted-foreground">non lu(s)</span>
            </div>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link to={`/simulations/${id}`}>
              <KeenIcon icon="arrow-left" style="outline" className="size-4" />
              Retour
            </Link>
          </Button>
        </ToolbarActions>
      </Toolbar>

      <div className="container-fixed">
        {/* Filters */}
        <div className="flex items-center gap-3 mb-4">
          <Select
            value={filterStatus || 'ALL'}
            onValueChange={(v) => setFilterStatus(v === 'ALL' ? '' : v)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous les statuts</SelectItem>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filterPriority || 'ALL'}
            onValueChange={(v) => setFilterPriority(v === 'ALL' ? '' : v)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Toutes priorites" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Toutes priorites</SelectItem>
              {PRIORITY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(filterStatus || filterPriority) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterStatus('');
                setFilterPriority('');
              }}
            >
              Reinitialiser
            </Button>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-destructive text-sm">
                {(error as Error).message || 'Erreur lors du chargement des emails.'}
              </p>
            </CardContent>
          </Card>
        ) : sortedEmails.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
              <KeenIcon
                icon="sms"
                style="duotone"
                className="size-12 text-muted-foreground/30"
              />
              <p className="text-sm text-muted-foreground">
                Aucun email pour le moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              {sortedEmails.map((email) => (
                <EmailListItem
                  key={email.id}
                  email={email}
                  onClick={handleEmailClick}
                />
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
