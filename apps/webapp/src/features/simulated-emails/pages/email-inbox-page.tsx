import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isAfter, subDays, startOfDay } from 'date-fns';
import { PageHeader } from '@/components/page-header';
import { simulationApi } from '@/features/simulation/api/simulation.api';
import {
  useSimulatedEmails,
  useArchiveEmail,
  useRespondToEmail,
  useBulkArchiveEmails,
  useBulkMarkReadEmails,
  useMarkUnreadEmail,
} from '../api/simulated-emails.api';
import { EmailFolderTabs, type EmailFolder } from '../components/email-folder-tabs';
import { EmailToolbar, type SortKey } from '../components/email-toolbar';
import { EmailBulkBar } from '../components/email-bulk-bar';
import { EmailList } from '../components/email-list';
import { EmailDetailDrawer } from '../components/email-detail-drawer';
import { EmailEmptyState } from '../components/email-empty-state';
import { Card } from '@/components/ui/card';
import type { EmailFilterState } from '../components/email-filter-popover';
import type {
  SimulatedEmail,
  EmailStatus,
  EmailPriority,
} from '../types/simulated-email.types';

const FOLDER_STATUSES: Record<EmailFolder, EmailStatus[]> = {
  inbox: ['UNREAD', 'READ'],
  responded: ['RESPONDED'],
  archived: ['ARCHIVED'],
};

const FOLDER_TITLES: Record<EmailFolder, string> = {
  inbox: 'Boîte de réception',
  responded: 'Emails répondus',
  archived: 'Emails archivés',
};

const FOLDER_SUBTITLES: Record<EmailFolder, string> = {
  inbox: 'Traitez les emails entrants de votre simulation en cours.',
  responded: "Relisez vos réponses et le retour de l'IA.",
  archived: 'Les emails que vous avez archivés.',
};

function parseFolder(raw: string | undefined): EmailFolder {
  if (raw === 'responded' || raw === 'archived') return raw;
  return 'inbox';
}

function priorityMatches(p: EmailPriority, buckets: string[]): boolean {
  if (buckets.length === 0) return true;
  if ((p === 'URGENT' || p === 'HIGH') && buckets.includes('HIGH')) return true;
  if (p === 'NORMAL' && buckets.includes('NORMAL')) return true;
  if (p === 'LOW' && buckets.includes('LOW')) return true;
  return false;
}

function periodMatches(scheduledAt: string, period: string | null): boolean {
  if (!period) return true;
  const date = new Date(scheduledAt);
  const now = new Date();
  if (period === 'today') return isAfter(date, startOfDay(now));
  if (period === 'last7') return isAfter(date, subDays(now, 7));
  if (period === 'last30') return isAfter(date, subDays(now, 30));
  return true;
}

function sortEmails(emails: SimulatedEmail[], sort: SortKey): SimulatedEmail[] {
  const arr = [...emails];
  if (sort === 'date-desc') {
    return arr.sort(
      (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
    );
  }
  if (sort === 'date-asc') {
    return arr.sort(
      (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );
  }
  const rank: Record<EmailPriority, number> = { URGENT: 0, HIGH: 1, NORMAL: 2, LOW: 3 };
  return arr.sort((a, b) => {
    const diff = rank[a.priority] - rank[b.priority];
    if (diff !== 0) return diff;
    return new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime();
  });
}

export default function EmailInboxPage() {
  const { id: simIdFromUrl, folder: folderParam } = useParams<{
    id?: string;
    folder?: string;
  }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeFolder = parseFolder(folderParam);
  const showScoreFilter = activeFolder === 'responded';

  // ─── Resolve simulation id ───
  const { data: simulations } = useQuery({
    queryKey: ['simulations'],
    queryFn: () => simulationApi.getSimulations(),
    enabled: !simIdFromUrl,
  });

  const simulationId = useMemo(() => {
    if (simIdFromUrl) return simIdFromUrl;
    if (!simulations || simulations.length === 0) return null;
    const active = simulations.find(
      (s: { status: string }) => s.status === 'IN_PROGRESS' || s.status === 'ACTIVE',
    );
    return active?.id ?? simulations[0]?.id ?? null;
  }, [simIdFromUrl, simulations]);

  // ─── Fetch emails ───
  // useSimulatedEmails already guards with `enabled: !!simId` internally.
  // Passing '' when simulationId is null skips the fetch safely.
  const { data: emailsResponse, isLoading } = useSimulatedEmails(simulationId ?? '');

  const allEmails: SimulatedEmail[] = emailsResponse ?? [];

  // ─── Folder filter (status) ───
  const folderEmails = useMemo(
    () => allEmails.filter((e) => FOLDER_STATUSES[activeFolder].includes(e.status)),
    [allEmails, activeFolder],
  );

  // ─── Counts ───
  const counts = useMemo(
    () => ({
      inbox: allEmails.filter((e) => FOLDER_STATUSES.inbox.includes(e.status)).length,
      responded: allEmails.filter((e) => FOLDER_STATUSES.responded.includes(e.status)).length,
      archived: allEmails.filter((e) => FOLDER_STATUSES.archived.includes(e.status)).length,
    }),
    [allEmails],
  );

  // ─── Toolbar state ───
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('date-desc');
  const [filters, setFilters] = useState<EmailFilterState>({
    priorities: [],
    period: null,
    scoreMin70: false,
  });

  const filtersActive =
    filters.priorities.length > 0 ||
    filters.period !== null ||
    (showScoreFilter && filters.scoreMin70);

  // ─── Apply search + filters + sort ───
  const visibleEmails = useMemo(() => {
    let list = folderEmails;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (e) =>
          e.subject.toLowerCase().includes(q) ||
          e.senderName.toLowerCase().includes(q),
      );
    }
    if (filters.priorities.length > 0) {
      list = list.filter((e) => priorityMatches(e.priority, filters.priorities));
    }
    if (filters.period) {
      list = list.filter((e) => periodMatches(e.scheduledAt, filters.period));
    }
    if (filters.scoreMin70 && activeFolder === 'responded') {
      list = list.filter(
        (e) => typeof e.responseScore === 'number' && e.responseScore >= 70,
      );
    }
    return sortEmails(list, sort);
  }, [folderEmails, search, filters, sort, activeFolder]);

  // ─── Selection (bulk) ───
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  function toggleSelect(emailId: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(emailId);
      else next.delete(emailId);
      return next;
    });
  }

  function selectAll() {
    setSelectedIds(new Set(visibleEmails.map((e) => e.id)));
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  // Reset selection when folder changes (inline to avoid exhaustive-deps warning on clearSelection)
  useEffect(() => {
    setSelectedIds(new Set());
  }, [activeFolder]);

  // ─── Drawer / active email ───
  const [activeEmailId, setActiveEmailId] = useState<string | null>(null);
  const activeEmail = useMemo(
    () => visibleEmails.find((e) => e.id === activeEmailId) ?? null,
    [visibleEmails, activeEmailId],
  );
  const activeIndex = useMemo(
    () => visibleEmails.findIndex((e) => e.id === activeEmailId),
    [visibleEmails, activeEmailId],
  );

  // ─── Deep-link: ?email={id} ───
  useEffect(() => {
    const param = searchParams.get('email');
    if (!param) return;
    const found = folderEmails.find((e) => e.id === param);
    if (found) {
      setActiveEmailId(found.id);
    } else {
      const next = new URLSearchParams(searchParams);
      next.delete('email');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, folderEmails, setSearchParams]);

  function openEmail(email: SimulatedEmail) {
    setActiveEmailId(email.id);
  }

  function closeDrawer() {
    setActiveEmailId(null);
    if (searchParams.has('email')) {
      const next = new URLSearchParams(searchParams);
      next.delete('email');
      setSearchParams(next, { replace: true });
    }
  }

  function goPrev() {
    if (visibleEmails.length === 0) return;
    const i =
      activeIndex < 0 ? 0 : (activeIndex - 1 + visibleEmails.length) % visibleEmails.length;
    setActiveEmailId(visibleEmails[i].id);
  }

  function goNext() {
    if (visibleEmails.length === 0) return;
    const i = activeIndex < 0 ? 0 : (activeIndex + 1) % visibleEmails.length;
    setActiveEmailId(visibleEmails[i].id);
  }

  // ─── Mutations ───
  const archiveMutation = useArchiveEmail(simulationId ?? '');
  const respondMutation = useRespondToEmail(simulationId ?? '');
  const bulkArchiveMutation = useBulkArchiveEmails(simulationId ?? '');
  const bulkMarkReadMutation = useBulkMarkReadEmails(simulationId ?? '');
  const markUnreadMutation = useMarkUnreadEmail(simulationId ?? '');

  async function handleArchive() {
    if (!activeEmail) return;
    try {
      await archiveMutation.mutateAsync(activeEmail.id);
      toast.success('Email archivé.');
      closeDrawer();
    } catch {
      toast.error("Erreur lors de l'archivage.");
    }
  }

  async function handleMarkUnread() {
    if (!activeEmail) return;
    try {
      await markUnreadMutation.mutateAsync(activeEmail.id);
      toast.success('Email marqué comme non lu.');
      closeDrawer();
    } catch {
      toast.error('Erreur lors de la mise à jour.');
    }
  }

  async function handleRespond(response: string) {
    if (!activeEmail) throw new Error('No active email');
    try {
      await respondMutation.mutateAsync({
        emailId: activeEmail.id,
        data: { response },
      });
      toast.success('Réponse envoyée.');
    } catch {
      toast.error("Erreur lors de l'envoi de la réponse.");
      throw; // Re-throw so EmailDetailDrawer.handleSubmit can catch it cleanly
    }
  }

  async function handleBulkArchive() {
    if (selectedIds.size === 0) return;
    try {
      const result = await bulkArchiveMutation.mutateAsync(Array.from(selectedIds));
      toast.success(
        `${result.archived} email${result.archived > 1 ? 's' : ''} archivé${result.archived > 1 ? 's' : ''}.`,
      );
      clearSelection();
    } catch {
      toast.error("Erreur lors de l'archivage groupé.");
    }
  }

  async function handleBulkMarkRead() {
    if (selectedIds.size === 0) return;
    try {
      const result = await bulkMarkReadMutation.mutateAsync(Array.from(selectedIds));
      toast.success(
        `${result.updated} email${result.updated > 1 ? 's' : ''} marqué${result.updated > 1 ? 's' : ''} comme lu${result.updated > 1 ? 's' : ''}.`,
      );
      clearSelection();
    } catch {
      toast.error('Erreur lors de la mise à jour groupée.');
    }
  }

  function clearFilters() {
    setSearch('');
    setFilters({ priorities: [], period: null, scoreMin70: false });
  }

  // ─── No-simulation guard ───
  if (!simulationId && !isLoading) {
    return (
      <>
        <PageHeader
          breadcrumbs={[{ label: 'Simulation' }, { label: 'Emails' }]}
          title={FOLDER_TITLES[activeFolder]}
          subtitle={FOLDER_SUBTITLES[activeFolder]}
        />
        <div className="px-6 pb-8">
          <Card className="border-[var(--neutral-100)] dark:border-white/[0.06] shadow-[0_1px_2px_rgba(15,26,46,0.04),0_8px_24px_-10px_rgba(15,26,46,0.08)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_-10px_rgba(0,0,0,0.5)]">
            <EmailEmptyState variant="no-simulation" />
          </Card>
        </div>
      </>
    );
  }

  const bulkPending = bulkArchiveMutation.isPending || bulkMarkReadMutation.isPending;

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Simulation' }, { label: 'Emails' }]}
        title={FOLDER_TITLES[activeFolder]}
        subtitle={FOLDER_SUBTITLES[activeFolder]}
      />

      <div className="px-6 pb-8 flex flex-col gap-3">
        <EmailFolderTabs
          active={activeFolder}
          counts={counts}
          onFolderChange={(folder) => navigate(`/emails/${folder}`)}
        />

        {selectedIds.size > 0 ? (
          <EmailBulkBar
            selectedCount={selectedIds.size}
            totalCount={visibleEmails.length}
            onSelectAll={selectAll}
            onMarkRead={handleBulkMarkRead}
            onArchive={handleBulkArchive}
            onCancel={clearSelection}
            isPending={bulkPending}
          />
        ) : (
          <EmailToolbar
            search={search}
            onSearchChange={setSearch}
            sort={sort}
            onSortChange={setSort}
            filters={filters}
            showScoreFilter={showScoreFilter}
            onFiltersApply={setFilters}
            onFiltersReset={() => setFilters({ priorities: [], period: null, scoreMin70: false })}
          />
        )}

        <EmailList
          emails={visibleEmails}
          folder={activeFolder}
          isLoading={isLoading}
          hasFiltersOrSearch={filtersActive || search.trim().length > 0}
          activeEmailId={activeEmailId}
          selectedIds={selectedIds}
          onSelectEmail={openEmail}
          onToggleSelect={toggleSelect}
          onClearFilters={clearFilters}
        />
      </div>

      <EmailDetailDrawer
        email={activeEmail}
        index={activeIndex}
        total={visibleEmails.length}
        onClose={closeDrawer}
        onPrev={goPrev}
        onNext={goNext}
        onArchive={handleArchive}
        onMarkUnread={handleMarkUnread}
        onRespond={handleRespond}
        isRespondPending={respondMutation.isPending}
        isArchivePending={archiveMutation.isPending}
      />
    </>
  );
}
