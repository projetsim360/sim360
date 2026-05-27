# Redesign Réunions IA — D1 (liste + salle) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refondre de façon premium le parcours réunion (liste + salle briefing/en-cours/compte-rendu), avec une salle audio immersive à messagerie coulissante, en décomposant `meeting-room.tsx` (933 lignes) en composants focalisés.

**Architecture:** `meeting-room.tsx` devient un **routeur d'état mince** qui possède `meeting/loading/error/actionLoading` et les handlers `handleStart`/`handleComplete`, et dispatche par `meeting.status` vers trois composants (`MeetingBriefing`, `MeetingRoomShell`, `MeetingCompleted`). `MeetingRoomShell` (état IN_PROGRESS) **possède tout l'état du chat** (mode, messages, input, streaming, participant sélectionné, drawer) et la logique SSE ; `MeetingChatPanel` est un **présentateur contrôlé** réutilisé en mode texte plein écran et en panneau audio coulissant. La logique temps-réel (WebRTC) reste **gelée** : on reskin la présentation de `MeetingConference`, jamais le transport.

**Tech Stack:** React 19, Vite, Tailwind CSS v4 (tokens CSS `--brand-*`/`--accent-*`/`--success-*`/`--warning-*`/`--error-*`/`--neutral-*`), Radix + CVA, KeenIcon, framer-motion (`@/lib/motion`), `PageHeader` (`@/components/page-header`), SSE via `@/lib/sse-client`.

---

## ⚠️ Contraintes transverses (valables pour TOUTES les tâches)

1. **Aucun runner de tests front.** Le webapp n'a pas de Jest/Vitest configuré. **N'écrivez PAS de tests** (`*.spec.tsx`, `*.test.tsx`) et ne cherchez pas de config de test. La vérification par tâche = `pnpm --filter @sim360/webapp typecheck` (doit être vert). La vérification fonctionnelle finale = navigateur Playwright (Task 11). Ignorez toute étape « write the failing test » du template writing-plans : elle ne s'applique pas ici.

2. **Accents français obligatoires.** Le code actuel a des labels sans accents (`'Planifiee'`, `'Reunion'`, `'Demarrer'`, `'Terminee'`, `'Synthese'`…). Toute chaîne UI réémise DOIT porter ses accents : « Planifiée », « En cours », « Terminée », « Annulée », « Démarrer », « Réunion », « Réunions », « Synthèse », « Décisions clés », « Cliquez », « Échangez », « À la parole », etc. Aucun caractère ASCII de substitution.

3. **Contrat temps-réel gelé.** Ne modifiez NI `hooks/use-realtime-connections.ts` NI `hooks/use-voice-switcher.ts` NI la logique interne de `MeetingConference` autour de `connections`/`activeSpeakerId`/`switchParticipant`/`toggleMute`/`connect`/`disconnect`. Seuls le JSX (couleurs, layout, contrôles) et l'ajout de props de passe-plat (`chatOpen`/`onToggleChat`) sont permis.

4. **Pas de change backend.** API meetings inchangée. Pas de nouveau composant dans `components/ui/`.

5. **Branche :** `feat/onboarding-redesign`. Commits en anglais, préfixés (`feat:`, `refactor:`, `chore:`). Stager les fichiers nommés explicitement (jamais `git add -A`/`.`). Trailer de co-auteur sur chaque commit :
   ```
   Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
   ```

### État possédé par `MeetingRoomShell` (référence verrouillée — Tasks 2 & 7)

```
MeetingRoomShell state:
  - mode: 'TEXT' | 'AUDIO'                 (init = meeting.mode)
  - chatDrawerOpen: boolean                (drawer du mode audio)
  - showAudioWarning: boolean              (AlertDialog crédits)
  - messages: ChatMessage[]                (init depuis meeting.messages)
  - input: string
  - streaming: boolean
  - selectedParticipant: MeetingParticipant | null   (init = participants[0])
  - scrollRef: RefObject<HTMLDivElement | null>
  - inputRef:  RefObject<HTMLInputElement | null>
  - sendMessage(): la logique SSE, reprise VERBATIM de meeting-room.tsx:233-281

MeetingChatPanel (présentateur contrôlé, aucun état propre) props:
  variant: 'full' | 'drawer'
  participants, messages, input, streaming, selectedParticipant
  onInputChange(v), onSelectParticipant(p), onSend()
  scrollRef?, inputRef?     ← refs possédées par le shell, transmises
```

### Palette de la scène sombre (mapping hex actuel → token — Tasks 5 & 6)

| Hex actuel | Token de remplacement |
|---|---|
| `#0f0d1a` (fond racine) | dégradé `bg-gradient-to-br from-[var(--brand-800)] to-[var(--brand-900)]` |
| `#16122a` | `var(--brand-800)` |
| `#1a1528` | `var(--brand-800)` |
| `#1e1833` | `var(--brand-700)` |
| `#251e3a` | `var(--brand-700)` |
| `#2a2344` | `var(--brand-600)` |
| `#332b4d` | `var(--brand-600)` |
| anneau/onde « parle » (`success`, palette violet/emerald aléatoire) | `var(--accent-400)` (anneau) / `var(--accent-300)` (onde) |
| `border-border` sur fond sombre | `border-white/10` |

---

### Task 1: Primitives feuilles — `ParticipantAvatar` + `ChatBubble`

**Files:**
- Create: `apps/webapp/src/features/meeting/components/participant-avatar.tsx`
- Create: `apps/webapp/src/features/meeting/components/chat-bubble.tsx`

- [ ] **Step 1: Create `participant-avatar.tsx`**

```tsx
import { cn } from '@/lib/utils';
import type { MeetingParticipant } from '../types/meeting.types';

// Palette d'avatars Simex (alignée sur AVATAR_BG du dashboard/cockpit).
const AVATAR_BG = ['#1A2B48', '#EE7A3A', '#3D5478', '#78716C'];

export function participantAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_BG[Math.abs(hash) % AVATAR_BG.length];
}

const SIZE: Record<'sm' | 'md' | 'lg', { box: string; text: string }> = {
  sm: { box: 'size-8', text: 'text-xs' },
  md: { box: 'size-10', text: 'text-sm' },
  lg: { box: 'size-16', text: 'text-xl' },
};

interface ParticipantAvatarProps {
  participant: MeetingParticipant;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ParticipantAvatar({ participant, size = 'sm', className }: ParticipantAvatarProps) {
  const s = SIZE[size];
  if (participant.avatar) {
    return (
      <img
        src={participant.avatar}
        alt={participant.name}
        className={cn(s.box, 'rounded-full object-cover shrink-0', className)}
        loading="lazy"
      />
    );
  }
  return (
    <div
      className={cn(s.box, s.text, 'rounded-full flex items-center justify-center text-white font-bold shrink-0', className)}
      style={{ background: participantAvatarColor(participant.name) }}
    >
      {participant.name.charAt(0).toUpperCase()}
    </div>
  );
}
```

- [ ] **Step 2: Create `chat-bubble.tsx`**

```tsx
import { cn } from '@/lib/utils';
import { KeenIcon } from '@/components/keenicons';
import { MarkdownContent } from '@/components/ui/markdown-content';
import { ParticipantAvatar } from './participant-avatar';
import type { ChatMessage, MeetingParticipant } from '../types/meeting.types';

interface ChatBubbleProps {
  msg: ChatMessage;
  participants: MeetingParticipant[];
  /** 'dark' = sur la scène audio (texte clair sur fond sombre). */
  tone?: 'light' | 'dark';
}

export function ChatBubble({ msg, participants, tone = 'light' }: ChatBubbleProps) {
  const isUser = msg.role === 'user';
  const participant = !isUser && msg.participantName
    ? participants.find((p) => p.name === msg.participantName)
    : null;

  return (
    <div className={cn('flex gap-2.5 max-w-[85%]', isUser ? 'ml-auto flex-row-reverse' : 'mr-auto')}>
      {isUser ? (
        <div className="shrink-0 size-8 rounded-full flex items-center justify-center bg-[var(--accent-500)] text-white">
          <KeenIcon icon="user" style="duotone" className="size-4" />
        </div>
      ) : participant ? (
        <ParticipantAvatar participant={participant} size="sm" />
      ) : (
        <div className="shrink-0 size-8 rounded-full flex items-center justify-center bg-[var(--neutral-200)] text-[var(--neutral-600)]">
          <KeenIcon icon="people" style="duotone" className="size-4" />
        </div>
      )}

      <div>
        {!isUser && msg.participantName && (
          <p className={cn('text-[10px] mb-1 ml-1 font-semibold', tone === 'dark' ? 'text-[var(--accent-300)]' : 'text-[var(--neutral-500)]')}>
            {msg.participantName}
          </p>
        )}
        <div className={cn(
          'rounded-2xl px-4 py-2.5 text-sm',
          isUser
            ? 'bg-[var(--accent-500)] text-white rounded-br-md'
            : tone === 'dark'
              ? 'bg-white/8 text-[var(--brand-50)] rounded-bl-md border border-white/10'
              : 'bg-[var(--brand-50)] text-[var(--brand-700)] rounded-bl-md border border-[var(--brand-100)]',
        )}>
          {!msg.content ? (
            <span className="inline-block w-1.5 h-4 bg-current rounded-full animate-pulse opacity-60" />
          ) : isUser ? (
            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
          ) : (
            <MarkdownContent content={msg.content} />
          )}
        </div>
        <p className={cn('text-[10px] mt-1 ml-1', isUser && 'text-right', tone === 'dark' ? 'text-[var(--brand-200)]' : 'text-[var(--neutral-400)]')}>
          {new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: PASS (les deux fichiers compilent ; ils ne sont pas encore importés ailleurs, c'est normal).

- [ ] **Step 4: Commit**

```bash
git add apps/webapp/src/features/meeting/components/participant-avatar.tsx apps/webapp/src/features/meeting/components/chat-bubble.tsx
git commit -m "$(cat <<'EOF'
feat(meeting): extract ParticipantAvatar and ChatBubble primitives (Simex palette)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: `MeetingChatPanel` (présentateur contrôlé, variants full/drawer)

**Files:**
- Create: `apps/webapp/src/features/meeting/components/meeting-chat-panel.tsx`

Dépend de Task 1 (`ChatBubble`, `participantAvatarColor`). **Aucun état interne** — tout vient des props (voir bloc « État possédé par MeetingRoomShell »).

- [ ] **Step 1: Create `meeting-chat-panel.tsx`**

```tsx
import type { RefObject } from 'react';
import { cn } from '@/lib/utils';
import { KeenIcon } from '@/components/keenicons';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatBubble } from './chat-bubble';
import { participantAvatarColor } from './participant-avatar';
import type { ChatMessage, MeetingParticipant } from '../types/meeting.types';

interface MeetingChatPanelProps {
  variant: 'full' | 'drawer';
  participants: MeetingParticipant[];
  messages: ChatMessage[];
  input: string;
  streaming: boolean;
  selectedParticipant: MeetingParticipant | null;
  onInputChange: (v: string) => void;
  onSelectParticipant: (p: MeetingParticipant) => void;
  onSend: () => void;
  scrollRef?: RefObject<HTMLDivElement | null>;
  inputRef?: RefObject<HTMLInputElement | null>;
}

export function MeetingChatPanel({
  variant,
  participants,
  messages,
  input,
  streaming,
  selectedParticipant,
  onInputChange,
  onSelectParticipant,
  onSend,
  scrollRef,
  inputRef,
}: MeetingChatPanelProps) {
  const dark = variant === 'drawer';

  return (
    <div className={cn(
      'flex flex-col overflow-hidden h-full rounded-xl',
      dark ? 'bg-white/4 border border-white/10' : 'bg-card border border-[var(--neutral-200)]',
    )}>
      <ScrollArea className="flex-1 px-3 py-3" viewportRef={scrollRef}>
        <div className="space-y-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className={cn('size-12 rounded-2xl flex items-center justify-center mb-3', dark ? 'bg-white/8' : 'bg-[var(--brand-50)]')}>
                <KeenIcon icon="message-text" style="duotone" className={cn('size-6', dark ? 'text-[var(--accent-300)]' : 'text-[var(--brand-500)]')} />
              </div>
              <p className={cn('text-sm font-medium', dark ? 'text-[var(--brand-50)]' : 'text-foreground')}>Démarrez la conversation</p>
              <p className={cn('text-xs mt-1 max-w-xs', dark ? 'text-[var(--brand-200)]' : 'text-[var(--neutral-500)]')}>
                Échangez avec les participants pour atteindre les objectifs de la réunion.
              </p>
            </div>
          )}
          {messages.map((msg) => (
            <ChatBubble key={msg.id} msg={msg} participants={participants} tone={dark ? 'dark' : 'light'} />
          ))}
        </div>
      </ScrollArea>

      <div className={cn('border-t p-3', dark ? 'border-white/10' : 'border-[var(--neutral-200)]')}>
        {participants.length > 1 && (
          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            <span className={cn('text-[10px] uppercase tracking-wider font-semibold shrink-0', dark ? 'text-[var(--brand-200)]' : 'text-[var(--neutral-500)]')}>
              Parler à
            </span>
            {participants.map((p) => {
              const active = selectedParticipant?.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSelectParticipant(p)}
                  className={cn(
                    'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer',
                    active
                      ? 'bg-[var(--accent-500)] text-white'
                      : dark
                        ? 'bg-white/8 text-[var(--brand-100)] border border-white/10 hover:bg-white/12'
                        : 'bg-[var(--neutral-100)] text-foreground border border-[var(--neutral-200)] hover:bg-[var(--neutral-200)]',
                  )}
                >
                  <span
                    className="size-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0"
                    style={{ background: active ? 'rgba(255,255,255,0.3)' : participantAvatarColor(p.name) }}
                  >
                    {p.name.charAt(0)}
                  </span>
                  {p.name.split(' ')[0]}
                </button>
              );
            })}
          </div>
        )}
        <div className={cn('flex items-center gap-2 rounded-xl px-3 py-1.5 border', dark ? 'bg-white/8 border-white/12' : 'bg-card border-[var(--neutral-200)]')}>
          <Input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder={`Message pour ${selectedParticipant?.name ?? 'le participant'}…`}
            aria-label="Message pour le participant"
            disabled={streaming}
            className={cn('flex-1 border-0 shadow-none focus-visible:ring-0 focus-visible:outline-none bg-transparent px-0 h-9', dark && 'text-white placeholder:text-[var(--brand-200)]')}
          />
          <Button
            variant="primary"
            size="icon"
            onClick={onSend}
            disabled={!input.trim() || streaming}
            title="Envoyer"
            className="shrink-0 size-8 rounded-lg bg-[var(--accent-500)] hover:bg-[var(--accent-600)] text-white"
          >
            <KeenIcon icon="arrow-up" style="duotone" className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/features/meeting/components/meeting-chat-panel.tsx
git commit -m "$(cat <<'EOF'
feat(meeting): add controlled MeetingChatPanel (full + drawer variants)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: `MeetingBriefing` (état SCHEDULED)

**Files:**
- Create: `apps/webapp/src/features/meeting/components/meeting-briefing.tsx`

Dépend de Task 1 (`ParticipantAvatar`). Présentateur pur, props `{ meeting, onStart, actionLoading }`. **Ne pas** inclure de wrapper `px-6` : le routeur (Task 8) fournit le padding horizontal.

- [ ] **Step 1: Create `meeting-briefing.tsx`**

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components/keenicons';
import { ParticipantAvatar } from './participant-avatar';
import type { MeetingDetail } from '../types/meeting.types';

interface MeetingBriefingProps {
  meeting: MeetingDetail;
  onStart: () => void;
  actionLoading: boolean;
}

export function MeetingBriefing({ meeting, onStart, actionLoading }: MeetingBriefingProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base flex items-center gap-2 text-[var(--brand-700)]">
              <KeenIcon icon="notepad" style="duotone" className="size-4 text-[var(--accent-500)]" />
              Briefing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {meeting.description && (
              <p className="text-sm text-[var(--neutral-600)] leading-relaxed">{meeting.description}</p>
            )}
            {meeting.objectives.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--neutral-500)] mb-2">Objectifs</h4>
                <div className="space-y-2">
                  {meeting.objectives.map((obj, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="size-5 rounded-full bg-[var(--accent-100)] flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-[var(--accent-700)]">{i + 1}</span>
                      </div>
                      <span className="text-sm text-foreground">{obj}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--neutral-100)] px-2.5 py-1 text-xs font-medium text-[var(--neutral-600)]">
                <KeenIcon icon="time" style="duotone" className="text-xs" />
                {meeting.durationMinutes} min
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--neutral-100)] px-2.5 py-1 text-xs font-medium text-[var(--neutral-600)]">
                <KeenIcon icon="people" style="duotone" className="text-xs" />
                {meeting.participants.length} participant{meeting.participants.length > 1 ? 's' : ''}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={onStart}
            disabled={actionLoading}
            className="px-8 bg-[var(--accent-500)] hover:bg-[var(--accent-600)] text-white"
          >
            <KeenIcon icon="rocket" style="duotone" className="text-sm" />
            {actionLoading ? 'Démarrage…' : 'Démarrer la réunion'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base flex items-center gap-2 text-[var(--brand-700)]">
            <KeenIcon icon="people" style="duotone" className="size-4 text-[var(--accent-500)]" />
            Participants
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {meeting.participants.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-[var(--neutral-200)] hover:bg-[var(--neutral-50)] transition-colors">
              <ParticipantAvatar participant={p} size="md" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{p.name}</p>
                <p className="text-xs text-[var(--neutral-500)] truncate">{p.role}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/features/meeting/components/meeting-briefing.tsx
git commit -m "$(cat <<'EOF'
feat(meeting): add MeetingBriefing component for SCHEDULED state

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: `MeetingCompleted` (état COMPLETED — enrichi)

**Files:**
- Create: `apps/webapp/src/features/meeting/components/meeting-completed.tsx`

Dépend de Task 1 (`ParticipantAvatar`, `ChatBubble`). Présentateur pur, prop `{ meeting }` (`MeetingDetail`). Dérive le transcript directement de `meeting.messages` (aucun état partagé avec le shell). Transcript repliable via un simple `useState` (pas de Sheet). Reskin Simex de l'ancien bloc COMPLETED + ajout impact KPI / action items déjà présents.

- [ ] **Step 1: Create `meeting-completed.tsx`**

```tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';
import { ParticipantAvatar } from './participant-avatar';
import { ChatBubble } from './chat-bubble';
import type { ChatMessage, MeetingDetail } from '../types/meeting.types';

interface MeetingCompletedProps {
  meeting: MeetingDetail;
}

export function MeetingCompleted({ meeting }: MeetingCompletedProps) {
  const [showTranscript, setShowTranscript] = useState(false);

  const messages: ChatMessage[] = meeting.messages.map((m) => ({
    id: m.id,
    role: m.role === 'USER' ? 'user' : 'assistant',
    content: m.content,
    timestamp: new Date(m.createdAt),
    participantName: m.participant?.name,
  }));

  const startedDate = meeting.startedAt
    ? new Date(meeting.startedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : null;
  const durationReal = meeting.startedAt && meeting.completedAt
    ? Math.round((new Date(meeting.completedAt).getTime() - new Date(meeting.startedAt).getTime()) / 60000)
    : null;
  const summary = meeting.summary;

  return (
    <div className="space-y-5">
      {/* Entête */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="size-12 rounded-xl bg-[var(--success-50)] flex items-center justify-center shrink-0">
              <KeenIcon icon="check-circle" style="duotone" className="size-6 text-[var(--success-500)]" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-lg font-extrabold text-[var(--brand-700)]">{meeting.title}</h2>
              {meeting.description && (
                <p className="text-sm text-[var(--neutral-500)] mt-1 line-clamp-2">{meeting.description}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--success-50)] px-2.5 py-1 text-xs font-semibold text-[var(--success-700)]">
                  <span className="size-1.5 rounded-full bg-[var(--success-500)]" />
                  Terminée
                </span>
                {durationReal !== null && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--neutral-100)] px-2.5 py-1 text-xs font-medium text-[var(--neutral-600)]">
                    <KeenIcon icon="time" style="duotone" className="text-xs" />
                    {durationReal} min (début {startedDate})
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--neutral-100)] px-2.5 py-1 text-xs font-medium text-[var(--neutral-600)]">
                  <KeenIcon icon="message-text" style="duotone" className="text-xs" />
                  {messages.length} échange{messages.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {summary ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            {/* Synthèse */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-base flex items-center gap-2 text-[var(--brand-700)]">
                  <KeenIcon icon="document" style="duotone" className="size-4 text-[var(--accent-500)]" />
                  Synthèse
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{summary.summary}</p>
              </CardContent>
            </Card>

            {/* Décisions clés */}
            {summary.keyDecisions.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="font-display text-base flex items-center gap-2 text-[var(--brand-700)]">
                    <KeenIcon icon="verify" style="duotone" className="size-4 text-[var(--success-500)]" />
                    Décisions clés
                    <span className="inline-flex items-center justify-center rounded-full bg-[var(--success-50)] px-2 py-0.5 text-[11px] font-bold text-[var(--success-700)]">
                      {summary.keyDecisions.length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {summary.keyDecisions.map((d, i) => (
                    <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-[var(--success-50)] border border-[var(--success-200)]">
                      <div className="size-6 rounded-full bg-[var(--success-200)] flex items-center justify-center shrink-0 mt-0.5">
                        <KeenIcon icon="check" style="outline" className="size-3.5 text-[var(--success-700)]" />
                      </div>
                      <span className="text-sm text-foreground leading-relaxed">{d}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Actions à suivre */}
            {summary.actionItems && summary.actionItems.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="font-display text-base flex items-center gap-2 text-[var(--brand-700)]">
                    <KeenIcon icon="clipboard" style="duotone" className="size-4 text-[var(--accent-500)]" />
                    Actions à suivre
                    <span className="inline-flex items-center justify-center rounded-full bg-[var(--accent-100)] px-2 py-0.5 text-[11px] font-bold text-[var(--accent-700)]">
                      {summary.actionItems.length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {summary.actionItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-[var(--neutral-200)] hover:bg-[var(--neutral-50)] transition-colors">
                      <div className="size-7 rounded-full bg-[var(--accent-100)] flex items-center justify-center shrink-0 text-xs font-bold text-[var(--accent-700)]">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{item.task}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-[var(--neutral-500)]">
                          <span className="flex items-center gap-1.5">
                            <span className="size-1.5 rounded-full bg-[var(--neutral-400)]" />
                            {item.assignee}
                          </span>
                          {item.deadline && (
                            <span className="flex items-center gap-1.5">
                              <span className="size-1.5 rounded-full bg-[var(--accent-500)]" />
                              {item.deadline}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Transcript repliable */}
            {messages.length > 0 && (
              <Card>
                <button
                  type="button"
                  onClick={() => setShowTranscript((v) => !v)}
                  className="flex items-center justify-between w-full px-5 py-4 cursor-pointer"
                >
                  <span className="font-display text-base font-bold text-[var(--brand-700)] flex items-center gap-2">
                    <KeenIcon icon="message-text" style="duotone" className="size-4 text-[var(--accent-500)]" />
                    Conversation
                    <span className="inline-flex items-center justify-center rounded-full bg-[var(--neutral-100)] px-2 py-0.5 text-[11px] font-bold text-[var(--neutral-600)]">
                      {messages.length}
                    </span>
                  </span>
                  <KeenIcon icon={showTranscript ? 'up' : 'down'} style="duotone" className="size-3.5 text-[var(--neutral-500)]" />
                </button>
                {showTranscript && (
                  <CardContent className="pt-0 space-y-3 border-t border-[var(--neutral-200)]">
                    <div className="pt-4 space-y-3">
                      {messages.map((msg) => (
                        <ChatBubble key={msg.id} msg={msg} participants={meeting.participants} />
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            )}
          </div>

          {/* Colonne droite */}
          <div className="space-y-5">
            {/* Impact KPI */}
            {summary.kpiImpact && Object.keys(summary.kpiImpact).length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="font-display text-base flex items-center gap-2 text-[var(--brand-700)]">
                    <KeenIcon icon="chart-line" style="duotone" className="size-4 text-[var(--accent-500)]" />
                    Impact KPI
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(summary.kpiImpact).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between rounded-lg bg-[var(--neutral-50)] px-3 py-2">
                      <span className="text-sm text-[var(--neutral-600)] capitalize">{key}</span>
                      <span className={cn(
                        'text-sm font-bold tabular-nums',
                        val > 0 ? 'text-[var(--success-700)]' : val < 0 ? 'text-[var(--error-700)]' : 'text-[var(--neutral-500)]',
                      )}>
                        {val > 0 ? '+' : ''}{val}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Participants */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-base flex items-center gap-2 text-[var(--brand-700)]">
                  <KeenIcon icon="people" style="duotone" className="size-4 text-[var(--accent-500)]" />
                  Participants
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-[var(--brand-50)] border border-[var(--brand-100)]">
                  <div className="size-8 rounded-full bg-[var(--brand-700)] flex items-center justify-center shrink-0">
                    <KeenIcon icon="user" style="duotone" className="size-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">Vous</p>
                    <p className="text-[10px] text-[var(--neutral-500)]">Animateur</p>
                  </div>
                </div>
                {meeting.participants.map((p) => (
                  <div key={p.id} className="flex items-center gap-2.5 p-2 rounded-lg">
                    <ParticipantAvatar participant={p} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-[10px] text-[var(--neutral-500)] truncate">{p.role}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-[var(--neutral-500)]">Aucun résumé disponible pour cette réunion.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/features/meeting/components/meeting-completed.tsx
git commit -m "$(cat <<'EOF'
feat(meeting): add enriched MeetingCompleted report (decisions, actions, KPI impact, transcript)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Reskin `participant-tile.tsx` + `transcription-panel.tsx`

**Files:**
- Modify: `apps/webapp/src/features/meeting/components/participant-tile.tsx`
- Modify: `apps/webapp/src/features/meeting/components/transcription-panel.tsx`

Reskin **présentation uniquement** : on remplace les hex sombres et la palette aléatoire violet/emerald par les tokens Simex (voir table « Palette de la scène sombre »). **Ne touchez à aucune prop ni logique.**

- [ ] **Step 1: `participant-tile.tsx` — remplacer le bloc palette `ACCENT_COLORS`/`hashName`**

Remplacez les lignes 15-29 (le commentaire `// Stable accent colors…`, le tableau `ACCENT_COLORS`, et la fonction `hashName`) par :

```tsx
// Anneau/onde « parle » accent Simex (un seul accent, pas de palette aléatoire).
const SPEAKING = { ring: 'ring-[var(--accent-400)]', glow: 'bg-[var(--accent-500)]/15', bar: 'bg-[var(--accent-300)]' };
```

- [ ] **Step 2: `participant-tile.tsx` — appliquer les tokens dans le JSX**

Dans le corps de `ParticipantTile`, appliquez ces remplacements (chercher → remplacer) :

- Supprimez la ligne `const accent = ACCENT_COLORS[hashName(participant.name)];` (devenue inutile ; on utilise `SPEAKING`).
- Conteneur du bouton (lignes ~62-66) :
  - `bg-[#1e1833] ring-1 ${accent.ring}/40` → `bg-[var(--brand-700)] ring-1 ${SPEAKING.ring}/40`
  - `bg-[#16122a] hover:bg-[#1e1833]` → `bg-[var(--brand-800)] hover:bg-[var(--brand-700)]`
- Glow « parle » (ligne ~71) : `${accent.bg} animate-pulse` → `${SPEAKING.glow} animate-pulse`
- Avatar (lignes ~80-84) :
  - `${isSpeaking ? `ring-[3px] ${accent.ring} scale-105` : 'ring-0 scale-100'}` → `${isSpeaking ? `ring-[3px] ${SPEAKING.ring} scale-105` : 'ring-0 scale-100'}`
  - `${isUser ? 'bg-brand-500/25 text-brand-400' : 'bg-[#2a2344] text-white/90'}` → `${isUser ? 'bg-[var(--brand-500)]/30 text-[var(--brand-100)]' : 'bg-[var(--brand-600)] text-white/90'}`
- Status dot border (ligne ~109) : `border-[#16122a]` → `border-[var(--brand-800)]`
- Barres « parle » (ligne ~152) : `${accent.dot} rounded-full animate-pulse` → `${SPEAKING.bar} rounded-full animate-pulse`
- Texte « À la parole » (ligne ~174) : `A la parole` → `À la parole` (accent), et garder `bg-success` → `bg-[var(--success-500)]`, `text-success` → `text-[var(--success-700)]`.
- Dans `STATUS_CONFIG` (lignes 31-37) : remplacer les couleurs par des tokens :
  ```tsx
  const STATUS_CONFIG: Record<ParticipantConnectionStatus, { dot: string; label: string }> = {
    idle: { dot: 'bg-white/30', label: 'Hors ligne' },
    connecting: { dot: 'bg-[var(--warning-500)] animate-pulse', label: 'Connexion…' },
    connected: { dot: 'bg-[var(--success-500)]', label: 'Connecté' },
    error: { dot: 'bg-[var(--error-500)]', label: 'Erreur' },
    closed: { dot: 'bg-white/30', label: 'Déconnecté' },
  };
  ```
- Indicateur user connecté/muet (lignes ~117-130) : `bg-destructive` → `bg-[var(--error-500)]`, `bg-success` → `bg-[var(--success-500)]`.
- Hint « Donner la parole » (ligne ~165) : garder le texte, `text-white/30` inchangé.

- [ ] **Step 3: `transcription-panel.tsx` — reskin tokens**

Remplacez la palette aléatoire `PARTICIPANT_COLORS` (lignes 10-35) et ses helpers par un seul accent, puis appliquez les tokens :

- Remplacez le bloc `PARTICIPANT_COLORS` + `getParticipantIndex` + `getParticipantColor` + `getParticipantBg` (lignes 10-35) par :
  ```tsx
  // Couleurs Simex : nom en accent, bulle assistant en surface translucide.
  function getParticipantColor(): string {
    return 'text-[var(--accent-300)]';
  }
  function getParticipantBg(): string {
    return 'bg-white/8';
  }
  ```
  (Les appels deviennent `getParticipantColor()` / `getParticipantBg()` sans argument — ajustez les deux usages lignes ~109 et ~116.)
- Conteneur racine (ligne ~51) : `bg-[#0f0d1a]/95` → `bg-[var(--brand-900)]/95` ; `border-border/50` → `border-white/10`.
- Bouton fermer hover (ligne ~67) : `hover:bg-[#251e3a]` → `hover:bg-[var(--brand-700)]`.
- Scrollbar (ligne ~76) : `scrollbar-thumb-[#251e3a]` → `scrollbar-thumb-[var(--brand-700)]`.
- Empty-state icône (ligne ~79) : `bg-[#251e3a]/50` → `bg-[var(--brand-700)]/50`.
- Message user (ligne ~101) : `bg-primary/15` → `bg-[var(--accent-500)]/20`.
- Tous les `border-border/50` restants → `border-white/10`.
- Accents : « Connexion… », pas d'accent à corriger dans ce fichier hormis ceux déjà présents.

- [ ] **Step 4: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: PASS (aucune signature de prop modifiée).

- [ ] **Step 5: Commit**

```bash
git add apps/webapp/src/features/meeting/components/participant-tile.tsx apps/webapp/src/features/meeting/components/transcription-panel.tsx
git commit -m "$(cat <<'EOF'
refactor(meeting): reskin ParticipantTile and TranscriptionPanel to Simex tokens

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: `conference-controls.tsx` (+ bouton 💬) + `meeting-conference.tsx` (passe-plat + reskin scène)

**Files:**
- Modify: `apps/webapp/src/features/meeting/components/conference-controls.tsx`
- Modify: `apps/webapp/src/features/meeting/components/meeting-conference.tsx`

Ajoute le bouton « Message » (toggle du panneau chat) via deux nouvelles props **optionnelles** transmises par le shell, et reskin la scène sombre. **La logique realtime reste gelée.**

- [ ] **Step 1: `conference-controls.tsx` — ajouter les props chat**

Dans `ConferenceControlsProps`, ajoutez après `forceSingleMode?: boolean;` :
```tsx
  chatOpen?: boolean;
  onToggleChat?: () => void;
```
Et dans la signature de la fonction (déstructuration), ajoutez `chatOpen,` et `onToggleChat,`.

- [ ] **Step 2: `conference-controls.tsx` — ajouter l'icône `ChatIcon`**

Après `PhoneIcon` (ligne ~51), ajoutez :
```tsx
function ChatIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  );
}
```

- [ ] **Step 3: `conference-controls.tsx` — insérer le bouton 💬 dans le cluster central**

Dans le cluster « Center: Action buttons » (le `<div className="flex items-center gap-2">`, lignes ~114-173), juste **avant** le séparateur qui précède le bouton « Hang up » (ligne ~162 `<div className="w-px h-6 bg-border mx-1" />`), insérez :
```tsx
          {/* Chat toggle */}
          {onToggleChat && (
            <button
              type="button"
              onClick={onToggleChat}
              className={`
                w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer
                ${chatOpen
                  ? 'bg-[var(--accent-500)] text-white'
                  : 'bg-[var(--accent-500)]/20 text-[var(--accent-300)] hover:bg-[var(--accent-500)]/30'
                }
              `}
              title="Messages"
              aria-pressed={chatOpen}
            >
              <ChatIcon />
            </button>
          )}
```

- [ ] **Step 4: `conference-controls.tsx` — reskin tokens**

- Bouton prejoin (ligne ~79) : `bg-brand-500 ... hover:bg-brand-600 ... shadow-brand-500/20` → `bg-[var(--accent-500)] ... hover:bg-[var(--accent-600)] ... shadow-[var(--accent-500)]/20`.
- Barre de contrôle (ligne ~104) : `bg-[#1a1528]/90 ... border border-border/50` → `bg-[var(--brand-800)]/90 ... border border-white/10`.
- Indicateur « En conversation avec » (ligne ~96) : `bg-success` → `bg-[var(--success-500)]`.
- Mute toggle (lignes ~119-125) : `bg-destructive/20 text-destructive ... ring-destructive/30` → `bg-[var(--error-500)]/20 text-[var(--error-300,#FCA5A5)]` n'existe pas → utilisez `text-[var(--error-700)]` sur fond clair ? Non, fond sombre : garder `bg-[var(--error-500)]/25 text-white ring-1 ring-[var(--error-500)]/40` ; `bg-white/10 text-white hover:bg-white/15` inchangé.
- Séparateurs (lignes ~132, ~162) : `bg-border` → `bg-white/15`.
- Toggle mode conférence (lignes ~140-145) : `bg-[#251e3a] text-foreground dark:text-white/90 hover:bg-[#332b4d]` → `bg-[var(--brand-700)] text-white/90 hover:bg-[var(--brand-600)]` ; `bg-primary/15 text-primary hover:bg-primary/25 ring-1 ring-primary/20` → `bg-[var(--accent-500)]/15 text-[var(--accent-300)] hover:bg-[var(--accent-500)]/25 ring-1 ring-[var(--accent-500)]/20`.
- Hangup (ligne ~168) : `bg-destructive ... hover:bg-destructive/90 ... shadow-destructive/20` → `bg-[var(--error-500)] ... hover:bg-[var(--error-700)] ... shadow-[var(--error-500)]/20`.
- Boutons de vue droite (grid/transcription/fullscreen) : `bg-white/10 text-white` (actif) et `text-white/40 hover:bg-white/5 hover:text-white/70` inchangés (déjà neutres sur sombre).

- [ ] **Step 5: `meeting-conference.tsx` — ajouter les props passe-plat**

Dans `MeetingConferenceProps`, ajoutez après `forceSingleMode?: boolean;` :
```tsx
  chatOpen?: boolean;
  onToggleChat?: () => void;
```
Dans la déstructuration de la fonction, ajoutez `chatOpen,` et `onToggleChat,` (avec `forceSingleMode = false,`).
Dans le rendu de `<ConferenceControls ... />` (lignes ~313-331), ajoutez les deux props :
```tsx
              chatOpen={chatOpen}
              onToggleChat={onToggleChat}
```

- [ ] **Step 6: `meeting-conference.tsx` — reskin scène (tokens uniquement, logique inchangée)**

- Conteneur racine (ligne ~144) : `bg-[#0f0d1a]` → `bg-gradient-to-br from-[var(--brand-800)] to-[var(--brand-900)]`.
- Pill « En direct » (lignes ~153-155) : `bg-success/10` / `text-success` → `bg-[var(--success-500)]/15` / `text-[var(--success-300,#6EE7B7)]` indisponible → utilisez `text-white` + dot `bg-[var(--success-500)]`. Concrètement : `bg-[var(--success-500)]/15` ; le dot `bg-success` → `bg-[var(--success-500)]` ; le texte `text-success` → `text-white`.
- Pill voix « Dites un prénom… » (lignes ~158-163) : `bg-brand-500/10` → `bg-[var(--accent-500)]/15` ; `text-brand-400` → `text-[var(--accent-300)]` (icône + texte).
- Speaker view fond (ligne ~227) : `bg-[#1a1528]/50` → `bg-white/4`.
- Grand avatar speaker (lignes ~234-239) : `ring-success/50 scale-105 bg-[#332b4d]` → `ring-[var(--accent-400)]/60 scale-105 bg-[var(--brand-600)]` ; `bg-[#251e3a]` → `bg-[var(--brand-700)]`.
- Onde (ligne ~263) : `bg-success/80` → `bg-[var(--accent-300)]`.
- Avertissement coût (ligne ~345) : `bg-warning/10 border border-warning/20 text-warning` → `bg-[var(--warning-500)]/15 border border-[var(--warning-500)]/25 text-[var(--warning-200,#FDE68A)]` indisponible → utilisez `text-white`.

> Note : la duplication chrono (topbar du shell + timer interne des contrôles) est acceptée — elle préserve la logique de connexion intacte.

- [ ] **Step 7: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add apps/webapp/src/features/meeting/components/conference-controls.tsx apps/webapp/src/features/meeting/components/meeting-conference.tsx
git commit -m "$(cat <<'EOF'
refactor(meeting): reskin conference scene + add chat toggle pass-through props

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: `MeetingRoomShell` (intégration — état IN_PROGRESS)

**Files:**
- Create: `apps/webapp/src/features/meeting/components/meeting-room-shell.tsx`

Composant d'**intégration** : possède tout l'état du chat (voir bloc « État possédé par MeetingRoomShell »), reprend `sendMessage` **verbatim** de `meeting-room.tsx:233-281`, et compose `MeetingConference` (audio) + `MeetingChatPanel` (texte plein écran OU drawer audio). Dépend de Tasks 2 et 6.

- [ ] **Step 1: Create `meeting-room-shell.tsx`**

```tsx
import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components/keenicons';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { DisabledWithTooltip } from '@/components/ui/disabled-with-tooltip';
import { cn } from '@/lib/utils';
import { streamAiResponse } from '@/lib/sse-client';
import { MeetingConference } from './meeting-conference';
import { MeetingChatPanel } from './meeting-chat-panel';
import { ParticipantAvatar } from './participant-avatar';
import type { ChatMessage, MeetingDetail, MeetingParticipant } from '../types/meeting.types';

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function useChronometer(startedAt: string | null, active: boolean) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!active || !startedAt) return;
    const start = new Date(startedAt).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startedAt, active]);
  return elapsed;
}

interface MeetingRoomShellProps {
  meeting: MeetingDetail;
  onComplete: () => void;
  actionLoading: boolean;
}

export function MeetingRoomShell({ meeting, onComplete, actionLoading }: MeetingRoomShellProps) {
  const [mode, setMode] = useState<'TEXT' | 'AUDIO'>(meeting.mode);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [showAudioWarning, setShowAudioWarning] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    meeting.messages.map((m) => ({
      id: m.id,
      role: m.role === 'USER' ? 'user' : 'assistant',
      content: m.content,
      timestamp: new Date(m.createdAt),
      participantName: m.participant?.name,
    })),
  );
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<MeetingParticipant | null>(
    meeting.participants[0] ?? null,
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const elapsed = useChronometer(meeting.startedAt, true);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // sendMessage — repris verbatim de l'ancien meeting-room.tsx:233-281.
  const sendMessage = useCallback(async () => {
    if (!input.trim() || streaming) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setStreaming(true);

    const assistantId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        participantName: selectedParticipant?.name,
      },
    ]);

    await streamAiResponse(`/meetings/${meeting.id}/messages`, {
      content: userMsg.content,
      participantId: selectedParticipant?.id,
    }, {
      onToken: (token) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + token } : m)),
        );
      },
      onError: (err) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: `Erreur: ${err}` } : m)),
        );
      },
    });

    setStreaming(false);
    inputRef.current?.focus();
  }, [input, streaming, selectedParticipant, meeting.id]);

  return (
    <div className="px-6 pb-6 space-y-3">
      {/* Topbar salle */}
      <div className="flex items-center justify-between gap-3 flex-wrap rounded-xl bg-[var(--brand-700)] px-4 py-2.5">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-display text-sm font-bold text-white truncate">{meeting.title}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--error-500)]/20 px-2.5 py-0.5 text-[11px] font-bold text-[#FCA5A5]">
            <span className="size-1.5 rounded-full bg-[var(--error-500)] animate-pulse" />
            EN DIRECT
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          {/* Bascule Texte / Audio */}
          <div role="group" aria-label="Mode de réunion" className="flex items-center rounded-lg border border-white/15 overflow-hidden">
            <button
              type="button"
              aria-pressed={mode === 'TEXT'}
              onClick={() => setMode('TEXT')}
              className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold leading-none transition-colors cursor-pointer',
                mode === 'TEXT' ? 'bg-[var(--accent-500)] text-white' : 'text-[var(--brand-100)] hover:bg-white/10')}
            >
              <KeenIcon icon="message-text" style="duotone" className="text-sm leading-none" />
              Texte
            </button>
            <button
              type="button"
              aria-pressed={mode === 'AUDIO'}
              onClick={() => { if (mode !== 'AUDIO') setShowAudioWarning(true); }}
              className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold leading-none transition-colors cursor-pointer',
                mode === 'AUDIO' ? 'bg-[var(--accent-500)] text-white' : 'text-[var(--brand-100)] hover:bg-white/10')}
            >
              <KeenIcon icon="speaker" style="duotone" className="text-sm leading-none" />
              Audio
            </button>
          </div>
          {/* Chrono */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-white tabular-nums">
            <KeenIcon icon="time" style="duotone" className="text-xs leading-none" />
            {formatElapsed(elapsed)}
          </span>
        </div>
      </div>

      {/* AlertDialog crédits audio */}
      <AlertDialog open={showAudioWarning} onOpenChange={setShowAudioWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <KeenIcon icon="speaker" style="duotone" className="size-5 text-[var(--warning-500)]" />
              Mode audio
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">
                Le mode audio utilise la synthèse vocale en temps réel pour chaque participant.
                Cette fonctionnalité <span className="font-semibold text-foreground">consomme significativement plus de crédits</span> que le mode texte.
              </span>
              <span className="block text-xs text-[var(--neutral-500)]">
                Chaque participant actif génère un flux audio continu tant que la conférence est en cours.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Rester en texte</AlertDialogCancel>
            <AlertDialogAction onClick={() => setMode('AUDIO')}>Activer l'audio</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {mode === 'AUDIO' ? (
        <div className="flex gap-4">
          <div className="flex-1 min-w-0">
            <MeetingConference
              meetingId={meeting.id}
              participants={meeting.participants}
              meetingTitle={meeting.title}
              startedAt={meeting.startedAt}
              onEnd={onComplete}
              forceSingleMode
              chatOpen={chatDrawerOpen}
              onToggleChat={() => setChatDrawerOpen((v) => !v)}
            />
          </div>
          {chatDrawerOpen && (
            <div className="fixed inset-0 z-40 sm:static sm:z-auto sm:w-[300px] sm:shrink-0">
              <div className="absolute inset-0 bg-black/50 sm:hidden" onClick={() => setChatDrawerOpen(false)} />
              <div className="absolute inset-y-0 right-0 w-[88%] max-w-[340px] bg-[var(--brand-900)] p-3 flex flex-col sm:static sm:w-full sm:max-w-none sm:bg-transparent sm:p-0 sm:h-[calc(100vh-180px)]">
                <div className="flex items-center justify-between mb-2 sm:hidden">
                  <span className="text-sm font-semibold text-white">Messages</span>
                  <button type="button" onClick={() => setChatDrawerOpen(false)} className="text-white/70 hover:text-white">
                    <KeenIcon icon="cross" style="outline" className="size-4" />
                  </button>
                </div>
                <div className="flex-1 min-h-0">
                  <MeetingChatPanel
                    variant="drawer"
                    participants={meeting.participants}
                    messages={messages}
                    input={input}
                    streaming={streaming}
                    selectedParticipant={selectedParticipant}
                    onInputChange={setInput}
                    onSelectParticipant={setSelectedParticipant}
                    onSend={sendMessage}
                    scrollRef={scrollRef}
                    inputRef={inputRef}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5">
          <div className="h-[calc(100vh-220px)]">
            <MeetingChatPanel
              variant="full"
              participants={meeting.participants}
              messages={messages}
              input={input}
              streaming={streaming}
              selectedParticipant={selectedParticipant}
              onInputChange={setInput}
              onSelectParticipant={setSelectedParticipant}
              onSend={sendMessage}
              scrollRef={scrollRef}
              inputRef={inputRef}
            />
          </div>

          {/* Sidebar : participants + terminer */}
          <div className="space-y-3">
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-[var(--neutral-500)]">
                  Donner la parole
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-1 space-y-2">
                <p className="text-[10px] text-[var(--neutral-500)] mb-1">
                  Cliquez sur un participant pour lui adresser la parole.
                </p>
                {meeting.participants.map((p) => {
                  const active = selectedParticipant?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedParticipant(p);
                        inputRef.current?.focus();
                      }}
                      className={cn('flex items-center gap-2.5 w-full p-2 rounded-lg transition-colors cursor-pointer text-left border',
                        active ? 'bg-[var(--accent-100)] border-[var(--accent-200)]' : 'border-transparent hover:bg-[var(--neutral-50)]')}
                    >
                      <ParticipantAvatar participant={p} />
                      <div className="min-w-0 flex-1">
                        <p className={cn('text-sm font-medium truncate', active && 'text-[var(--accent-700)]')}>{p.name}</p>
                        <p className="text-[10px] text-[var(--neutral-500)] truncate">{p.role}</p>
                      </div>
                      {active && (
                        <span className="flex items-center gap-1">
                          <span className="size-1.5 rounded-full bg-[var(--success-500)] animate-pulse" />
                          <span className="text-[9px] text-[var(--success-700)] font-medium">Actif</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            <DisabledWithTooltip disabled={messages.length === 0} reason="Échangez d'abord avec les participants">
              <Button
                variant="outline"
                size="sm"
                onClick={onComplete}
                disabled={actionLoading || messages.length === 0}
                className="w-full"
              >
                <KeenIcon icon="check-circle" style="duotone" className="text-xs" />
                {actionLoading ? 'Clôture…' : 'Clôturer la réunion'}
              </Button>
            </DisabledWithTooltip>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: PASS. (Si `useChronometer`/`formatElapsed` déclenchent un warning « unused » avant intégration, ils sont bien utilisés ici — ignorer.)

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/features/meeting/components/meeting-room-shell.tsx
git commit -m "$(cat <<'EOF'
feat(meeting): add MeetingRoomShell — owns chat state, composes audio room + chat panel

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Réécrire `meeting-room.tsx` en routeur d'état mince

**Files:**
- Modify (rewrite): `apps/webapp/src/features/meeting/pages/meeting-room.tsx`

Remplace tout le contenu actuel (933 lignes) par un routeur mince. Toute la logique de chat/mode/audio a migré dans `MeetingRoomShell` (Task 7) ; `ChatBubble`/`ParticipantAvatar`/`useChronometer` ont migré dans leurs composants. Dépend de Tasks 3, 4, 7.

- [ ] **Step 1: Rewrite `meeting-room.tsx`**

```tsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components/keenicons';
import { Skeleton } from '@/components/ui/skeleton';
import { meetingApi } from '../api/meeting.api';
import { MeetingBriefing } from '../components/meeting-briefing';
import { MeetingRoomShell } from '../components/meeting-room-shell';
import { MeetingCompleted } from '../components/meeting-completed';
import type { MeetingDetail } from '../types/meeting.types';

export default function MeetingRoomPage() {
  const { meetingId } = useParams<{ meetingId: string }>();
  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadMeeting = useCallback(async () => {
    if (!meetingId) return;
    try {
      const data = await meetingApi.getMeeting(meetingId);
      setMeeting(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [meetingId]);

  useEffect(() => { loadMeeting(); }, [loadMeeting]);

  const handleStart = useCallback(async () => {
    if (!meetingId) return;
    setActionLoading(true);
    try { await meetingApi.startMeeting(meetingId); await loadMeeting(); }
    catch (err: any) { setError(err.message); }
    finally { setActionLoading(false); }
  }, [meetingId, loadMeeting]);

  const handleComplete = useCallback(async () => {
    if (!meetingId) return;
    setActionLoading(true);
    try { await meetingApi.completeMeeting(meetingId); await loadMeeting(); }
    catch (err: any) { setError(err.message); }
    finally { setActionLoading(false); }
  }, [meetingId, loadMeeting]);

  if (loading) {
    return (
      <div>
        <div className="px-6 pt-6"><Skeleton className="h-10 w-64 mb-5" /></div>
        <div className="px-6">
          <Skeleton className="h-48 rounded-lg mb-5" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div>
        <PageHeader
          breadcrumbs={[
            { label: 'Tableau de bord', to: '/dashboard' },
            { label: 'Simulations', to: '/simulations' },
            { label: 'Réunion' },
          ]}
          title="Réunion"
        />
        <div className="px-6 pb-6">
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-[var(--error-700)] text-sm">{error || 'Réunion introuvable.'}</p>
              <Button variant="link" asChild><Link to="/simulations">Retour aux simulations</Link></Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { label: 'Tableau de bord', to: '/dashboard' },
    { label: 'Simulations', to: '/simulations' },
    { label: 'Réunions', to: `/simulations/${meeting.simulationId}/meetings` },
    { label: meeting.title },
  ];

  const backAction = (
    <Button variant="outline" size="sm" asChild>
      <Link to={`/simulations/${meeting.simulationId}/meetings`}>
        <KeenIcon icon="arrow-left" style="duotone" className="text-xs" />
        Réunions
      </Link>
    </Button>
  );

  if (meeting.status === 'SCHEDULED') {
    return (
      <div>
        <PageHeader breadcrumbs={breadcrumbs} title={meeting.title} subtitle="Briefing avant le démarrage" actions={backAction} />
        <div className="px-6 pb-6">
          <MeetingBriefing meeting={meeting} onStart={handleStart} actionLoading={actionLoading} />
        </div>
      </div>
    );
  }

  if (meeting.status === 'IN_PROGRESS') {
    return (
      <div>
        <PageHeader breadcrumbs={breadcrumbs} title={meeting.title} actions={backAction} hideContentMode />
        <MeetingRoomShell meeting={meeting} onComplete={handleComplete} actionLoading={actionLoading} />
      </div>
    );
  }

  if (meeting.status === 'COMPLETED') {
    return (
      <div>
        <PageHeader breadcrumbs={breadcrumbs} title="Compte-rendu" subtitle={meeting.title} actions={backAction} />
        <div className="px-6 pb-6">
          <MeetingCompleted meeting={meeting} />
        </div>
      </div>
    );
  }

  // CANCELLED
  return (
    <div>
      <PageHeader breadcrumbs={breadcrumbs} title={meeting.title} actions={backAction} />
      <div className="px-6 pb-6">
        <Card>
          <CardContent className="py-10 text-center space-y-3">
            <div className="size-12 mx-auto rounded-xl bg-[var(--error-50)] flex items-center justify-center">
              <KeenIcon icon="cross-circle" style="duotone" className="size-6 text-[var(--error-500)]" />
            </div>
            <p className="text-sm text-[var(--neutral-600)]">Cette réunion a été annulée.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: PASS. (Vérifie aussi que les anciens imports retirés — `Toolbar`, `Badge`, `Sheet`, `ScrollArea`, `streamAiResponse`, `MeetingConference`, etc. — ne laissent pas de référence morte.)

- [ ] **Step 3: Commit**

```bash
git add apps/webapp/src/features/meeting/pages/meeting-room.tsx
git commit -m "$(cat <<'EOF'
refactor(meeting): rewrite meeting-room as thin state router

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Reskin `meetings-list.tsx`

**Files:**
- Modify: `apps/webapp/src/features/meeting/pages/meetings-list.tsx`

Reskin sans refonte : `Toolbar` → `PageHeader`, stagger framer-motion, cartes tonées Simex, accents complets, CTA contextuels. Logique de filtre/chargement **inchangée**.

- [ ] **Step 1: Remplacer les imports en tête (lignes 1-12)**

```tsx
import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useParams } from 'react-router';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components/keenicons';
import { EmptyState } from '@/components/ui/empty-state';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { meetingApi } from '../api/meeting.api';
import type { Meeting } from '../types/meeting.types';
```

- [ ] **Step 2: Mettre à jour les constantes de labels (lignes 14-35)**

```tsx
const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Planifiée',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminée',
  CANCELLED: 'Annulée',
};

const STATUS_PILL: Record<string, string> = {
  SCHEDULED: 'bg-[var(--neutral-100)] text-[var(--neutral-600)]',
  IN_PROGRESS: 'bg-[var(--accent-100)] text-[var(--accent-700)]',
  COMPLETED: 'bg-[var(--success-50)] text-[var(--success-700)]',
  CANCELLED: 'bg-[var(--error-50)] text-[var(--error-700)]',
};

const TYPE_LABELS: Record<string, string> = {
  KICKOFF: 'Lancement',
  STANDUP: 'Stand-up',
  STEERING: 'Pilotage',
  RETROSPECTIVE: 'Rétrospective',
  CRISIS: 'Crise',
  CUSTOM: 'Personnalisée',
};
```

- [ ] **Step 3: Remplacer le bloc `if (!simId)` (lignes 72-92)**

```tsx
  if (!simId) {
    return (
      <div>
        <PageHeader
          breadcrumbs={[{ label: 'Tableau de bord', to: '/dashboard' }, { label: 'Réunions' }]}
          title="Réunions"
          subtitle="Sélectionnez une simulation pour voir ses réunions."
        />
        <div className="px-6 pb-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
              <p className="text-[var(--neutral-500)] text-sm">Aucune simulation sélectionnée.</p>
              <Button variant="link" asChild><Link to="/simulations">Voir les simulations</Link></Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
```

- [ ] **Step 4: Remplacer le `return` principal — header + wrapper + filtres + grille (lignes 94-256)**

```tsx
  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: 'Tableau de bord', to: '/dashboard' },
          { label: 'Simulations', to: '/simulations' },
          { label: 'Simulation', to: `/simulations/${simId}` },
          { label: 'Réunions' },
        ]}
        title="Réunions"
        subtitle={`${meetings.length} réunion${meetings.length > 1 ? 's' : ''}${filteredMeetings.length !== meetings.length ? ` · ${filteredMeetings.length} affichée${filteredMeetings.length > 1 ? 's' : ''}` : ''}`}
      />

      <div className="px-6 pb-6 space-y-5">
        {/* Filtres */}
        {meetings.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={filterType || 'ALL'} onValueChange={(v) => setFilterType(v === 'ALL' ? '' : v)}>
              <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Tous les types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous les types</SelectItem>
                {Object.entries(TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus || 'ALL'} onValueChange={(v) => setFilterStatus(v === 'ALL' ? '' : v)}>
              <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Tous les statuts" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous les statuts</SelectItem>
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availablePhases.length > 1 && (
              <Select value={filterPhase || 'ALL'} onValueChange={(v) => setFilterPhase(v === 'ALL' ? '' : v)}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Toutes les phases" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Toutes les phases</SelectItem>
                  {availablePhases.map((phase) => (
                    <SelectItem key={phase} value={String(phase)}>Phase {phase}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {(filterType || filterStatus || filterPhase) && (
              <Button variant="ghost" size="sm" onClick={() => { setFilterType(''); setFilterStatus(''); setFilterPhase(''); }}>
                Réinitialiser
              </Button>
            )}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <Skeleton className="h-5 w-40" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-2/3 mb-3" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card><CardContent className="py-8 text-center"><p className="text-[var(--error-700)] text-sm">{error}</p></CardContent></Card>
        ) : meetings.length === 0 ? (
          <Card>
            <CardContent>
              <EmptyState
                icon="message-text"
                title="Aucune réunion"
                description="Les réunions sont planifiées pour chaque phase. Avancez dans la simulation pour les voir apparaître."
              />
            </CardContent>
          </Card>
        ) : (
          <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4" variants={staggerContainer} initial="hidden" animate="show">
            {filteredMeetings.map((meeting) => (
              <motion.div key={meeting.id} variants={staggerItem}>
                <Link to={`/meetings/${meeting.id}`} className="block h-full">
                  <Card className="hover:shadow-md transition-shadow h-full cursor-pointer">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="font-display text-base font-bold text-[var(--brand-700)]">{meeting.title}</h3>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="inline-flex items-center rounded-full bg-[var(--brand-50)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--brand-700)]">
                            {TYPE_LABELS[meeting.type] ?? meeting.type}
                          </span>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_PILL[meeting.status]}`}>
                            {STATUS_LABELS[meeting.status]}
                          </span>
                        </div>
                      </div>

                      {meeting.description && (
                        <p className="text-sm text-[var(--neutral-500)] line-clamp-2 mb-3">{meeting.description}</p>
                      )}

                      <div className="flex items-center justify-between text-sm text-[var(--neutral-500)]">
                        <div className="flex items-center gap-3">
                          <span>{meeting.participants.length} participant{meeting.participants.length > 1 ? 's' : ''}</span>
                          {meeting._count?.messages !== undefined && (
                            <span>{meeting._count.messages} message{meeting._count.messages > 1 ? 's' : ''}</span>
                          )}
                          <span>{meeting.durationMinutes} min</span>
                        </div>
                        {meeting.status !== 'CANCELLED' && (
                          <span className="text-[var(--accent-600)] font-semibold inline-flex items-center gap-1">
                            {meeting.status === 'SCHEDULED'
                              ? 'Démarrer'
                              : meeting.status === 'IN_PROGRESS'
                                ? 'Reprendre'
                                : 'Voir le compte-rendu'}
                            <KeenIcon icon="arrow-right" style="duotone" className="size-3" />
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
```

> Note : `STATUS_VARIANT` n'est plus utilisé — supprimez-le (lignes 21-26 de l'original) s'il subsiste après l'édition.

- [ ] **Step 5: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: PASS (aucun import/const mort : `Toolbar`, `Badge`, `STATUS_VARIANT` retirés).

- [ ] **Step 6: Commit**

```bash
git add apps/webapp/src/features/meeting/pages/meetings-list.tsx
git commit -m "$(cat <<'EOF'
refactor(meeting): reskin meetings list (PageHeader, Simex pills, stagger, accents)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: Routes — rediriger `/live` + `/summary`, supprimer les pages orphelines

**Files:**
- Modify: `apps/webapp/src/features/meeting/config/meeting.routes.tsx`
- Delete: `apps/webapp/src/features/meeting/pages/meeting-live.tsx`
- Delete: `apps/webapp/src/features/meeting/pages/meeting-summary.tsx`

`meeting-live.tsx` et `meeting-summary.tsx` ne sont référencés QUE dans `meeting.routes.tsx` (vérifié). Même pattern de redirection que `DashboardRedirect` du Cockpit (lecture de `window.location.pathname` + `<Navigate replace />`).

- [ ] **Step 1: Rewrite `meeting.routes.tsx`**

```tsx
import { lazy, Suspense } from 'react';
import { Route, Navigate } from 'react-router';

const MeetingsListPage = lazy(() => import('../pages/meetings-list'));
const MeetingRoomPage = lazy(() => import('../pages/meeting-room'));

// Les anciennes routes /live et /summary sont fusionnées dans /meetings/:meetingId.
function MeetingRedirect() {
  const m = window.location.pathname.match(/^\/meetings\/([^/]+)\/(?:live|summary)\/?$/);
  const id = m?.[1];
  if (!id) return <Navigate to="/meetings" replace />;
  return <Navigate to={`/meetings/${id}`} replace />;
}

export const meetingRoutes = (
  <>
    <Route path="/meetings" element={<Suspense><MeetingsListPage /></Suspense>} />
    <Route path="/simulations/:simId/meetings" element={<Suspense><MeetingsListPage /></Suspense>} />
    <Route path="/meetings/:meetingId" element={<Suspense><MeetingRoomPage /></Suspense>} />
    <Route path="/meetings/:meetingId/live" element={<MeetingRedirect />} />
    <Route path="/meetings/:meetingId/summary" element={<MeetingRedirect />} />
  </>
);
```

- [ ] **Step 2: Supprimer les fichiers orphelins**

```bash
git rm apps/webapp/src/features/meeting/pages/meeting-live.tsx apps/webapp/src/features/meeting/pages/meeting-summary.tsx
```

- [ ] **Step 3: Vérifier l'absence de référence résiduelle**

Run: `grep -rn "meeting-live\|meeting-summary\|MeetingLivePage\|MeetingSummaryPage" apps/webapp/src`
Expected: aucun résultat.

- [ ] **Step 4: Typecheck**

Run: `pnpm --filter @sim360/webapp typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/webapp/src/features/meeting/config/meeting.routes.tsx
git commit -m "$(cat <<'EOF'
refactor(meeting): redirect legacy /live and /summary routes; remove orphan pages

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 11: Vérification navigateur (Playwright)

**Files:** aucun (vérification seule).

Pas de runner de tests : on observe l'app réelle. Login via `POST http://localhost:3001/api/v1/auth/login {email:'admin@sim360.dev', password:'Admin123!'}` → `{tokens:{accessToken,refreshToken}}` ; injecter `localStorage` (`sim360_access_token`, `sim360_refresh_token`, `onboarding_tour_completed='true'`) via `addInitScript`. Playwright CJS : `node_modules/.pnpm/playwright@1.58.2/node_modules/playwright/index.js`.

- [ ] **Step 1: Démarrer les serveurs si nécessaire**

```bash
# API (port 3001) et webapp (port 5173) doivent tourner.
# Si besoin : pnpm --filter @sim360/core build && pnpm --filter @sim360/api dev  (séparé)
#             pnpm --filter @sim360/webapp dev  (séparé)
curl -s http://localhost:5173 >/dev/null && echo "webapp up" || echo "webapp DOWN"
curl -s http://localhost:3001/health >/dev/null && echo "api up" || echo "api DOWN"
```

- [ ] **Step 2: Smoke flux réunion + redirections + responsive**

Écrire `/tmp/meetings-verify.mjs` et l'exécuter avec `node`. Le script doit :
1. Se connecter, injecter les tokens.
2. Aller sur `/simulations/:simId/meetings` (récupérer un `simId` ayant des réunions via l'API `GET /api/v1/simulations` puis `GET /api/v1/simulations/:id/meetings`, ou via une simulation seedée). Vérifier : `PageHeader` « Réunions », filtres, cartes (attendre `waitForSelector('a[href^="/meetings/"]')` — rendu paresseux), CTA contextuels.
3. Ouvrir une réunion **SCHEDULED** → vérifier briefing (objectifs numérotés, participants, bouton « Démarrer la réunion »).
4. Démarrer → salle en cours **mode Texte** : panneau chat + sidebar « Donner la parole » ; envoyer un message → bulle accent + réponse en streaming.
5. Bascule **Audio** → `AlertDialog` crédits → « Activer l'audio » → scène audio premium (tuiles participants, contrôles mic/💬/raccrocher). Cliquer 💬 → panneau de messages coulissant visible.
6. Réunion **COMPLETED** → compte-rendu enrichi (Synthèse, Décisions clés, Actions à suivre, Impact KPI, Conversation repliable).
7. `/meetings/:id/live` et `/meetings/:id/summary` → l'URL finale est `/meetings/:id`.
8. Viewport mobile (375×812) : liste 1 colonne, briefing empilé, drawer chat en plein écran.
9. Capturer `page.on('pageerror')` et `console` type error → **0 erreur**.
10. Screenshots dans `/tmp/meetings-verify/` pour : liste, briefing, salle texte, salle audio + drawer, compte-rendu, mobile.

> La logique WebRTC ne peut pas être pleinement testée sans backend audio live : se contenter de vérifier que la scène audio **monte sans crash** (tuiles + contrôles présents) et que la bascule + le drawer 💬 fonctionnent. Le bouton « Rejoindre la conférence » peut rester en pré-join (pas de session realtime réelle) — c'est attendu.

- [ ] **Step 3: Confirmer le résultat**

Inspecter les screenshots + logs. Si une étape échoue, dispatcher un subagent de correction ciblé. Sinon, la vérification est concluante.

---

## Self-Review (auteur du plan)

**1. Couverture du spec :**
- meetings-list reskin → Task 9 ✓
- meeting-room décomposé (briefing/en-cours/compte-rendu) → Tasks 3, 7, 4 + routeur Task 8 ✓
- Salle audio premium + 💬 drawer → Tasks 6 (controls/scène) + 7 (shell drawer) ✓
- MeetingChatPanel full/drawer → Task 2 ✓
- ChatBubble / ParticipantAvatar extraits → Task 1 ✓
- COMPLETED enrichi (keyDecisions, actionItems, kpiImpact, transcript) → Task 4 ✓
- live/summary supprimés + redirigés → Task 10 ✓
- Reskin participant-tile / conference-controls / meeting-conference / transcription-panel → Tasks 5, 6 ✓
- Logique realtime/SSE préservée → sendMessage verbatim (Task 7), hooks intouchés (contrainte transverse) ✓
- Animations (stagger liste, drawer, bulles) → Task 9 stagger ; pulses CSS existants conservés ✓
- Responsive + a11y (aria-pressed bascule, « parle » en texte, AlertDialog) → Tasks 7, 11 ✓

**2. Placeholders :** aucun « TBD/TODO ». Chaque étape de code montre le code ou un mapping find→replace concret.

**3. Cohérence des types :** `MeetingChatPanelProps` (Task 2) = props passées par le shell (Task 7) ✓ ; `chatOpen?`/`onToggleChat?` ajoutés en Task 6 = utilisés en Task 7 ✓ ; `MeetingDetail` passé du routeur (Task 8) aux composants (Tasks 3,4,7) ✓ ; `MeetingBriefing`/`MeetingCompleted`/`MeetingRoomShell` signatures identiques entre définition et usage ✓.
