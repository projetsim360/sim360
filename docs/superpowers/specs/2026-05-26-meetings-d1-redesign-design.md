# Redesign premium Réunions IA — D1 (liste + salle de réunion) — Design

> Branche : `feat/onboarding-redesign`. Sous-projet **D — Réunions IA**, tranche **D1**. Palette Simex (Deep Blue `--brand-700` + Warm Orange `--accent-500`). Réutilise les primitives déjà créées (`PageHeader`, palette, `lib/motion`, langage de la bande PMO sombre du Cockpit).

## Objectif

Refondre de façon premium le parcours réunion : la **liste des réunions** et la **salle de réunion** (`meeting-room`, machine à états briefing → en cours → compte-rendu). La salle « en cours » devient une **salle audio premium immersive** (scène sombre, speaker actif, tuiles participants, contrôles) **avec messagerie intégrée** (panneau de chat coulissant), plus un mode texte plein écran. Le fichier de 933 lignes est **décomposé en composants**. L'îlot orphelin `meeting-live` + `meeting-summary` est **supprimé** (contenu riche remonté dans le compte-rendu, routes redirigées).

## Périmètre D1

**Pages traitées :**
- `meetings-list.tsx` — reskin (PageHeader, palette, accents, stagger).
- `meeting-room.tsx` — réécrit/décomposé : briefing, salle en cours (audio premium + chat), compte-rendu enrichi.
- `meeting-live.tsx` — **supprimé** (route `/meetings/:id/live` → redirige vers `/meetings/:id`).
- `meeting-summary.tsx` — **supprimé** (route `/meetings/:id/summary` → redirige vers `/meetings/:id`).

**Hors scope D1 (tranches ultérieures si besoin) :** la logique interne temps-réel/WebRTC du hook `use-realtime-connections.ts` et `use-voice-switcher.ts` — **inchangée**. On reskin la présentation de la conférence, pas le transport audio.

## Décisions validées

1. **meetings-list** : reskin sans refonte structurelle (filtres conservés).
2. **meeting-room** : machine à états décomposée en composants ; chaque état (briefing / en cours / compte-rendu) dans son propre composant.
3. **Salle en cours = salle audio premium** (layout validé) : scène sombre brand, speaker actif animé (anneau accent + onde), tuiles participants, barre de contrôles centrale (micro / message / raccrocher) ; **panneau de messages coulissant** activé par le bouton 💬 — on écrit pendant l'audio. Bascule **Texte / Audio** en topbar : mode Texte = chat plein écran (maquette A : chat large + sidebar participants/objectifs).
4. **Compte-rendu (COMPLETED)** enrichi des champs riches déjà disponibles dans `meeting.summary` (`keyDecisions`, `actionItems`, `kpiImpact`) — pas de nouveau fetch.
5. **Îlot live/summary supprimé**, routes redirigées vers `/meetings/:id`.
6. La **logique** (SSE streaming texte via `streamAiResponse`, WebRTC via `MeetingConference`/`useRealtimeConnections`, handlers start/complete, chronomètre) est **préservée** — on déplace et reskin, on ne réécrit pas le transport.

## Architecture des fichiers

`meeting-room.tsx` (933 lignes, 4 états inline) est décomposé. Le fichier page devient un **routeur d'état** mince ; chaque état + zone est un composant focalisé.

```
features/meeting/
├── pages/
│   ├── meetings-list.tsx              (reskin)
│   ├── meeting-room.tsx               (réécrit = state router mince : loading/error/briefing/live/completed)
│   ├── meeting-live.tsx               (SUPPRIMÉ)
│   └── meeting-summary.tsx            (SUPPRIMÉ)
├── config/meeting.routes.tsx          (redirections /live + /summary → /meetings/:id)
└── components/                        (NOUVEAUX, + existants conservés)
    ├── meeting-briefing.tsx           (NOUVEAU — état SCHEDULED : briefing + participants + CTA Démarrer)
    ├── meeting-room-shell.tsx         (NOUVEAU — état IN_PROGRESS : topbar salle + bascule mode + chrono + rend audio OU texte)
    ├── meeting-chat-panel.tsx         (NOUVEAU — panneau de messages : liste bulles + composer + sélecteur « Parler à ». Sert en mode Texte plein écran ET en panneau coulissant audio)
    ├── meeting-completed.tsx          (NOUVEAU — compte-rendu enrichi : entête + résumé + décisions clés + action items + impact KPI + transcript repliable)
    ├── chat-bubble.tsx                (NOUVEAU — bulle de message, extraite du ChatBubble inline)
    ├── participant-avatar.tsx         (NOUVEAU — avatar participant, extrait du ParticipantAvatar inline)
    ├── meeting-conference.tsx         (EXISTANT — reskin présentation, garde la logique realtime)
    ├── participant-tile.tsx           (EXISTANT — reskin palette)
    ├── conference-controls.tsx        (EXISTANT — reskin palette + ajout bouton 💬 Message)
    ├── transcription-panel.tsx        (EXISTANT — reskin léger)
    └── audio-meeting.tsx              (EXISTANT — non touché si non utilisé par le flux ; vérifier)
```

> **Note de décomposition (tranchée)** : on **ne crée pas** de `meeting-audio-stage`. La scène audio premium = **reskin de `MeetingConference` en place** (la logique WebRTC de `use-realtime-connections` reste intacte), utilisé directement par `meeting-room-shell`. Le panneau de messages coulissant en mode audio est rendu par `meeting-room-shell` à côté de `MeetingConference` (pas dans le composant conférence). Zéro duplication de la logique realtime.

## Données (aucun changement backend)

Types existants suffisent :
- `Meeting` : `title, description, type, objectives[], durationMinutes, mode('TEXT'|'AUDIO'), status, startedAt, completedAt, participants[], summary: MeetingSummaryRecord|null, _count.messages`.
- `MeetingDetail extends Meeting` : `messages: MeetingMessage[]`.
- `MeetingParticipant` : `id, name, role, personality, cooperationLevel, avatar`.
- `MeetingSummaryRecord` : `summary, keyDecisions[], actionItems[{task,assignee,deadline?}]|null, kpiImpact: Record<string,number>|null`.
- `ChatMessage` (UI) : `id, role('user'|'assistant'), content, timestamp, participantName?`.

API (`meetingApi`) inchangée : `listBySimulation`, `getMeeting`, `startMeeting`, `completeMeeting`, `getSummary`, `createRealtimeSession(s)`. SSE : `streamAiResponse('/meetings/:id/messages', ...)`.

## Composants — directives

### Page 1 — `meetings-list.tsx` (reskin)

- `Toolbar` (layout-6) → `PageHeader` (breadcrumbs `[Tableau de bord → Simulations → {simId} → Réunions]` si simId, sinon `[Tableau de bord → Réunions]` ; title « Réunions » ; subtitle « {n} réunion(s) »). Bouton « Retour » → breadcrumb.
- Filtres (type / statut / phase) conservés, `Select` au style courant.
- Cartes réunion reskinnées : `font-display` titre, badges type + statut tonés Simex (`SCHEDULED` neutre, `IN_PROGRESS` accent, `COMPLETED` success, `CANCELLED` error), méta (participants / messages / durée), CTA contextuel (« Démarrer » / « Reprendre » / « Voir le compte-rendu »). Stagger d'entrée (`staggerContainer`/`staggerItem`).
- Accents complets : « Planifiée », « Terminée », « Annulée », « Personnalisée », « Rétrospective », « Réinitialiser », « Sélectionnez une simulation ».
- États loading (skeletons) / error / empty conservés, palette Simex.

### Page 2 — `meeting-room.tsx` (state router mince)

Structure :
```
loadMeeting() → meeting | loading | error
switch(meeting.status):
  SCHEDULED  → <MeetingBriefing meeting onStart={handleStart} actionLoading />
  IN_PROGRESS→ <MeetingRoomShell meeting onComplete={handleComplete} />
  COMPLETED  → <MeetingCompleted meeting />
  CANCELLED  → carte « Réunion annulée » + retour
```
Wrap commun : `PageHeader` (breadcrumbs vers la simulation), gestion loading/error (carte Simex + Réessayer). Conserve `useChronometer`, `handleStart`, `handleComplete` (déplacés/passés en props).

### `MeetingBriefing` (état SCHEDULED)

- Layout 2/1 : colonne gauche briefing (description, objectifs numérotés pastilles accent, méta durée/participants en pills), colonne droite « Participants » (liste avec `ParticipantAvatar` + nom + rôle).
- CTA central « Démarrer la réunion » (Button primary accent, icône rocket), désactivé pendant `actionLoading`.
- Palette Simex, `font-display` sur titres de carte.

### `MeetingRoomShell` (état IN_PROGRESS)

- **Topbar salle** (sombre brand-700, rounded-t) : titre réunion + pill « ● EN DIRECT » (rouge translucide) + chrono tabulaire + **bascule segmentée Texte / Audio** (accent sur l'actif) + bouton retour.
- État `mode: 'TEXT' | 'AUDIO'` (initialisé sur `meeting.mode`). Passage TEXT→AUDIO déclenche l'`AlertDialog` d'avertissement crédits existant (conservé, reskin).
- **Mode AUDIO** → `<MeetingConference>` reskinné (scène sombre, speaker actif anneau accent + onde, tuiles participants, `ConferenceControls` avec micro / **💬 message** / raccrocher). Le bouton 💬 ouvre `<MeetingChatPanel variant="drawer">` en colonne droite (la scène se compacte).
- **Mode TEXT** → layout maquette A : `<MeetingChatPanel variant="full">` (chat large) + sidebar droite (participants + objectifs en direct).
- Bouton « Terminer la réunion » accessible (dans la topbar ou les contrôles) → `handleComplete`.

### `MeetingChatPanel` (réutilisable : `variant: 'full' | 'drawer'`)

- Liste de bulles (`<ChatBubble>`), scroll auto en bas, empty-state « Démarrez la conversation ».
- Composer : sélecteur « Parler à » (chips participants, accent sur le sélectionné) + champ + bouton envoyer accent. SSE via `streamAiResponse` (logique existante préservée).
- `variant='full'` : pleine largeur, fond clair. `variant='drawer'` : largeur ~200-260px, fond translucide sombre (sur la scène audio), texte clair.

### `ChatBubble`

- Bulle IA : fond `--brand-50`, bordure `--brand-100`, texte `--brand-700`, nom participant au-dessus, `MarkdownContent` pour le contenu assistant.
- Bulle utilisateur : fond `--accent-500`, texte blanc, alignée à droite.
- Avatar via `ParticipantAvatar`.

### `MeetingCompleted` (état COMPLETED — enrichi)

- Entête : titre, badge « Terminée » success, méta (heure début, durée réelle).
- **Carte Résumé** (si `meeting.summary`) : `summary.summary` (texte), **Décisions clés** (`keyDecisions[]`, liste à puces accent), **Actions à suivre** (`actionItems[]` → task + assignee + deadline, en lignes), **Impact KPI** (`kpiImpact` → pills par KPI avec signe +/− toné success/error).
- **Transcript repliable** : `messages[]` via `<ChatBubble>` (réutilise le composant), dans un bloc collapsible (réutiliser le `Sheet`/drawer existant OU un simple `<details>`/accordéon — au choix du plan).
- CTA retour à la simulation.
- Palette Simex.

### Composants existants — reskin

- `participant-tile.tsx` : couleurs ad-hoc (`bg-blue-500`…) → conserver des couleurs d'avatar distinctes mais cohérentes (palette d'avatars fixe brand/accent/neutral comme `AVATAR_BG` du Cockpit) ; anneau « parle » → `--accent-500` ; dot statut tokenisé.
- `conference-controls.tsx` : boutons reskinnés (cercles translucides sur sombre) ; **ajout du bouton 💬 Message** (toggle du panneau chat) ; bouton raccrocher rouge.
- `meeting-conference.tsx` : reskin de la scène (fond brand sombre dégradé, topbar, zone speaker, strip). Logique realtime inchangée.
- `transcription-panel.tsx` : reskin léger palette.

## Routes

`config/meeting.routes.tsx` :
- Garder `/meetings`, `/simulations/:simId/meetings`, `/meetings/:meetingId`.
- `/meetings/:meetingId/live` → `<Navigate to="/meetings/:meetingId" replace />` (via composant lisant l'URL, comme le redirect Cockpit).
- `/meetings/:meetingId/summary` → idem redirect vers `/meetings/:meetingId`.
- Retirer les lazy imports de `MeetingLivePage` / `MeetingSummaryPage`.

## Animations
- Liste : stagger cartes.
- Briefing : fade-in léger.
- Scène audio : anneau « parle » (pulse) + onde sonore (déjà animée / CSS) ; respect `prefers-reduced-motion` (pas de pulse si reduce).
- Panneau chat coulissant : transition d'ouverture (translate/opacity), `motion-reduce` désactive.
- Bulles chat : apparition douce.

## Responsive (mobile-first)
- Liste : grille 1/2 colonnes.
- Briefing : 2/1 → empilé < lg.
- Salle audio : scène pleine largeur ; en mode drawer chat, sur mobile le panneau passe en **plein écran superposé** (pas côte à côte) ; tuiles participants wrap.
- Mode texte : sidebar passe sous le chat < lg (ou repliable).
- Contrôles : barre centrée, cibles ≥ 44px.

## Accessibilité
- Bascule Texte/Audio : `role=group`, boutons avec `aria-pressed`.
- Statut « parle » doublé par le texte « parle » sous le nom (pas seulement l'anneau).
- AlertDialog crédits audio conservé (consentement avant audio).
- Contrastes sur fond sombre vérifiés (`--brand-200`/`--accent-300` sur brand-700/900).
- Chrono `tabular-nums` ; champ chat focus visible.

## Vérification (pas de runner de tests front ni API)
- `pnpm --filter @sim360/webapp typecheck` vert.
- Navigateur (Playwright + token user `admin@sim360.dev`) :
  - `/simulations/:simId/meetings` → liste reskinnée, filtres, cartes, CTA contextuels.
  - Ouvrir une réunion SCHEDULED → briefing (objectifs, participants, Démarrer).
  - Démarrer → salle en cours : mode texte (chat + sidebar) ; bascule Audio → AlertDialog crédits → scène audio premium (speaker, tuiles, contrôles) ; bouton 💬 → panneau de messages coulissant.
  - Réunion COMPLETED → compte-rendu enrichi (résumé, décisions clés, action items, impact KPI, transcript repliable).
  - `/meetings/:id/live` et `/meetings/:id/summary` → redirigent vers `/meetings/:id`.
  - Responsive mobile + `prefers-reduced-motion` ; pas d'erreur console.
- La logique realtime (WebRTC) ne peut pas être pleinement testée sans backend audio live ; vérifier que le mode audio **monte sans crash** (scène rendue, contrôles présents) et que la bascule fonctionne.

## Hors scope (rappel)
- Pas de modification du transport temps-réel (`use-realtime-connections`, `use-voice-switcher`) ni du protocole WebRTC/SSE.
- Pas de changement backend (API meetings inchangée).
- Pas de nouveau composant UI partagé dans `components/ui/`.
- Sous-projets B (Décisions), C (Événements), E (Projet) : ultérieurs.
