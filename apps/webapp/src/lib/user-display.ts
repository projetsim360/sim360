interface DisplayableUser {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  role?: string | null;
}

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super administrateur',
  ADMIN: 'Administrateur',
  MANAGER: 'Gestionnaire',
  MENTOR: 'Mentor',
  MEMBER: 'Apprenant',
  VIEWER: 'Observateur',
};

/** "Prénom Nom", falling back to the e-mail local part, then to a neutral label. */
export function getUserDisplayName(user: DisplayableUser | null | undefined): string {
  const fullName = [user?.firstName, user?.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ');
  if (fullName) return fullName;
  const local = user?.email?.split('@')[0];
  return local || 'Utilisateur';
}

/** Two-letter initials ("Marie Tremblay" → "MT"). */
export function getUserInitials(user: DisplayableUser | null | undefined): string {
  const first = user?.firstName?.trim()?.[0] ?? '';
  const last = user?.lastName?.trim()?.[0] ?? '';
  const initials = `${first}${last}`;
  if (initials) return initials.toUpperCase();
  return (user?.email?.[0] ?? '?').toUpperCase();
}

/** French label for a UserRole enum value. */
export function getRoleLabel(role: string | null | undefined): string {
  if (!role) return '';
  return ROLE_LABELS[role] ?? role;
}

const WORKSPACE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Administration',
  ADMIN: 'Administration',
  MANAGER: 'Gestionnaire',
  MENTOR: 'Mentor',
  MEMBER: 'Apprenant',
  VIEWER: 'Observateur',
};

/** Second word of the "Espace …" chip in the sidebar, by role. */
export function getWorkspaceLabel(role: string | null | undefined): string {
  return (role && WORKSPACE_LABELS[role]) || 'Apprenant';
}

const ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'MENTOR', 'MEMBER', 'VIEWER'] as const;
type KnownRole = (typeof ROLES)[number];
const isKnownRole = (role: string | null | undefined): role is KnownRole => !!role && (ROLES as readonly string[]).includes(role);

/** Catalogue key of a role name (`role.<ROLE>`), for the translated shell. */
export function roleLabelKey(role: string | null | undefined) {
  return `role.${isKnownRole(role) ? role : 'MEMBER'}` as const;
}

/** Catalogue key of the workspace badge (`workspace.<ROLE>`). */
export function workspaceLabelKey(role: string | null | undefined) {
  return `workspace.${isKnownRole(role) ? role : 'MEMBER'}` as const;
}
