# ProjectSim360 — Refonte UX Complete

> **Version** : 1.0
> **Date** : 2026-03-09
> **Objectif** : Transformer l'experience utilisateur en une plateforme fluide, intuitive et guidee — digne d'une licorne.

---

## Table des matieres

1. [Diagnostic UX actuel](#1-diagnostic-ux-actuel)
2. [Principe fondateur : Menu contextuel](#2-principe-fondateur--menu-contextuel)
3. [Architecture du menu dynamique](#3-architecture-du-menu-dynamique)
4. [Command Center — Nouveau dashboard](#4-command-center--nouveau-dashboard)
5. [Progressive Disclosure — Rendre visible l'invisible](#5-progressive-disclosure--rendre-visible-linvisible)
6. [Refonte des empty states](#6-refonte-des-empty-states)
7. [Workflow steppers — Guidage des flux multi-etapes](#7-workflow-steppers--guidage-des-flux-multi-etapes)
8. [Breadcrumbs et navigation retour](#8-breadcrumbs-et-navigation-retour)
9. [Tooltips et aide contextuelle](#9-tooltips-et-aide-contextuelle)
10. [Onboarding tour pour nouveaux utilisateurs](#10-onboarding-tour-pour-nouveaux-utilisateurs)
11. [Micro-interactions et feedback](#11-micro-interactions-et-feedback)
12. [Plan d'implementation](#12-plan-dimplementation)
13. [Inventaire des modifications par fichier](#13-inventaire-des-modifications-par-fichier)

---

## 1. Diagnostic UX actuel

### 1.1 Chiffres cles

| Metrique | Valeur |
|----------|--------|
| Routes totales | 51 |
| Routes dans le menu sidebar | 19 |
| Routes **cachees** (pas de lien menu) | **32** (63%) |
| Empty states sans CTA | **42 sur 50** (84%) |
| Boutons disabled sans tooltip | **44 sur 44** (100%) |
| Pages avec breadcrumbs | **0** |
| Pages avec stepper de workflow | **0** (hors onboarding) |

### 1.2 Les 5 problemes fondamentaux

**P1 — Menu statique deconnecte du contexte**
Le menu sidebar est identique que l'utilisateur soit sur le dashboard global, dans une simulation active, ou en train de recruter. Les items "Emails", "Reunions", "Livrables" apparaissent alors qu'ils n'ont de sens que dans le contexte d'une simulation. L'utilisateur voit des menus qui menent vers des pages vides ou sans contexte.

**P2 — Actions fantomes**
Des fonctionnalites entieres n'apparaissent que quand une condition est remplie (status, count, data). L'utilisateur ne sait pas qu'elles existent. Exemples :
- Le lien de partage de campagne n'apparait qu'apres publication
- La shortlist n'apparait que si des candidats ont termine
- L'historique KPI n'apparait que si >5 events
- Le formulaire de reponse email disparait apres reponse sans explication

**P3 — Aucun fil conducteur**
L'utilisateur arrive sur un dashboard generique et ne sait pas quoi faire. Il n'y a pas de checklist, pas de progression globale, pas de "prochaine etape recommandee".

**P4 — Empty states passifs**
Sur 50 empty states identifies, 42 affichent un message generique ("Aucun X") sans CTA, sans explication du contexte, et sans indication de ce qui doit se passer pour debloquer le contenu.

**P5 — Zero guidage contextuel**
Aucun breadcrumb, aucun tooltip sur les boutons disabled, aucune aide "?", aucun stepper de workflow pour les flux multi-etapes.

---

## 2. Principe fondateur : Menu contextuel

### 2.1 Regle d'or

> **Un menu ne doit montrer que les actions realisables dans le contexte actuel.**

L'utilisateur ne doit jamais cliquer sur un menu pour arriver sur une page vide ou inaccessible. Si une action n'est pas pertinente dans le contexte courant, elle ne doit pas etre visible.

### 2.2 Les 4 contextes de l'application

| Contexte | Detection (URL) | Description |
|----------|-----------------|-------------|
| **Global** | `/dashboard`, `/simulations`, `/projects`, `/reports`, `/settings`, `/profile/*` | Navigation libre, vue d'ensemble |
| **Simulation active** | `/simulations/:id/*` | L'utilisateur est "dans" une simulation en cours |
| **Recrutement** | `/recruitment/*` | L'utilisateur gere des campagnes de recrutement |
| **Administration** | `/admin/*` | L'utilisateur administre la plateforme |

### 2.3 Comportement du menu par contexte

#### Contexte GLOBAL (hors simulation)
```
Dashboard
Simulations
  ├ Mes simulations
  ├ Nouvelle simulation
  └ Mes projets
Rapports
Valorisation
  └ Mes badges
─── [si role MANAGER+] ──────────────
Recrutement
  ├ Campagnes
  └ Nouvelle campagne
─── [si role ADMIN+] ──────────────
Administration
  ├ Templates livrables
  └ Documents reference
─── Compte ──────────────
Mon Profil
Parametres
```

**Items RETIRES du contexte global** (par rapport a aujourd'hui) :
- ~~Reunions~~ → n'a de sens que dans une simulation
- ~~Emails~~ → n'a de sens que dans une simulation
- ~~Utilisation IA~~ → deplace dans Administration

#### Contexte SIMULATION ACTIVE (`/simulations/:id/*`)

Quand l'utilisateur entre dans une simulation, le menu se transforme completement :

```
← Retour aux simulations          [lien de sortie, toujours visible]
─────────────────────────
📊 Tableau de bord                 /simulations/:id
📋 Decisions                       /simulations/:id  (onglet decisions)
⚡ Evenements                      /simulations/:id  (onglet events)
👥 Reunions                        /simulations/:id  (onglet meetings)
📧 Emails                          /simulations/:id/emails
📄 Livrables                       /simulations/:id/deliverables
🤖 Agent PMO                       /simulations/:id/pmo
📖 Intranet                        /simulations/:id/intranet
📈 Historique KPI                   /simulations/:id/kpis
🕐 Timeline                        /simulations/:id/timeline
─── [si simulation terminee] ──────
🎓 Debriefing                      /simulations/:id/debriefing
💼 Portfolio                        /simulations/:id/portfolio
📝 Suggestions CV                   /simulations/:id/cv-suggestions
```

**Avantages** :
- L'utilisateur voit TOUT ce qu'il peut faire dans sa simulation
- Les items PMO, Emails, Livrables sont maintenant decouverts naturellement
- Le lien "Retour" lui permet de quitter le contexte simulation
- La section "post-simulation" (debriefing, portfolio, CV) apparait dynamiquement

#### Contexte RECRUTEMENT (`/recruitment/*`)
Le menu global reste visible. Le detail d'une campagne utilise des onglets internes (Dashboard, Candidats, Parametres, Shortlist), pas le menu sidebar.

#### Contexte ADMINISTRATION (`/admin/*`)
Le menu global reste visible. Aucun changement.

---

## 3. Architecture du menu dynamique

### 3.1 Nouveau hook : `useContextualMenu`

**Fichier** : `apps/webapp/src/hooks/use-contextual-menu.ts`

```typescript
// Logique :
// 1. Detecter si l'URL contient /simulations/:id/
// 2. Si oui → retourner le menu SIMULATION
// 3. Si non → retourner le menu GLOBAL (filtre par role)
// 4. Dans le menu simulation, marquer les items post-sim
//    comme disabled si simulation.status !== 'COMPLETED'
```

**Input** : `pathname` (de useLocation), `userRole`, `simulationStatus` (optionnel)
**Output** : `MenuConfig` contextuel

### 3.2 Nouveau fichier : `simulation-context-menu.ts`

**Fichier** : `apps/webapp/src/config/simulation-context-menu.ts`

Definition du menu specifique au contexte simulation :

```typescript
export const SIMULATION_MENU: MenuConfig = [
  {
    title: 'Retour aux simulations',
    icon: 'arrow-left',
    path: '/simulations',
    isBackLink: true,  // nouveau flag pour le styling
  },
  { heading: 'Simulation' },
  { title: 'Tableau de bord', icon: 'chart-simple', path: '/simulations/:id' },
  { title: 'Decisions', icon: 'question-2', path: '/simulations/:id', badge: ':pendingDecisions' },
  { title: 'Evenements', icon: 'flash', path: '/simulations/:id', badge: ':pendingEvents' },
  { title: 'Reunions', icon: 'message-text', path: '/simulations/:id', badge: ':pendingMeetings' },
  { title: 'Emails', icon: 'sms', path: '/simulations/:id/emails', badge: ':unreadEmails' },
  { title: 'Livrables', icon: 'document', path: '/simulations/:id/deliverables', badge: ':pendingDeliverables' },
  { title: 'Agent PMO', icon: 'robot', path: '/simulations/:id/pmo' },
  { title: 'Intranet', icon: 'book-open', path: '/simulations/:id/intranet' },
  { title: 'Historique KPI', icon: 'graph-up', path: '/simulations/:id/kpis' },
  { title: 'Timeline', icon: 'time', path: '/simulations/:id/timeline' },
  { heading: 'Valorisation', showWhen: 'completed' },
  { title: 'Debriefing', icon: 'teacher', path: '/simulations/:id/debriefing', showWhen: 'completed' },
  { title: 'Portfolio', icon: 'briefcase', path: '/simulations/:id/portfolio', showWhen: 'completed' },
  { title: 'Suggestions CV', icon: 'document-2', path: '/simulations/:id/cv-suggestions', showWhen: 'completed' },
];
```

### 3.3 Badges de compteur dans le menu

Chaque item de menu simulation affiche un badge avec le nombre d'actions en attente :
- Decisions : nombre de decisions PENDING
- Evenements : nombre d'events PENDING
- Reunions : nombre de reunions SCHEDULED pour la phase actuelle
- Emails : nombre d'emails UNREAD
- Livrables : nombre de livrables DRAFT ou a reviser

**Source des donnees** : un hook `useSimulationContext(simId)` qui charge les compteurs en un seul appel API leger :
```
GET /api/v1/simulations/:id/counts
→ { pendingDecisions, pendingEvents, pendingMeetings, unreadEmails, pendingDeliverables }
```

### 3.4 Modifications du sidebar

**Fichier** : `apps/webapp/src/components/layouts/layout-6/components/sidebar-menu-primary.tsx`

- Remplacer `useFilteredMenu(MENU_SIDEBAR_COMPACT)` par `useContextualMenu()`
- Ajouter le rendu du `isBackLink` (style different : fleche + texte + separateur)
- Ajouter le rendu des badges de compteur
- Ajouter le rendu conditionnel `showWhen: 'completed'`

### 3.5 Header de contexte simulation

Quand l'utilisateur est dans une simulation, ajouter un bandeau sous le header :

```
┌──────────────────────────────────────────────────────┐
│ 📊 Projet Alpha — Phase 3: Execution   [KPI mini]   │
│ Budget: ██████░░ 72%  Delai: █████░░░ 65%           │
└──────────────────────────────────────────────────────┘
```

Ce bandeau :
- Rappelle dans quel projet/simulation l'utilisateur se trouve
- Affiche la phase actuelle
- Montre les KPIs en mini-barre (toujours visible)
- Permet de cliquer pour revenir au tableau de bord simulation

**Fichier** : `apps/webapp/src/components/layouts/layout-6/components/simulation-context-bar.tsx` (nouveau)

---

## 4. Command Center — Nouveau dashboard

### 4.1 Probleme actuel

Le dashboard actuel montre :
- Une carte bienvenue (statique)
- 4 statistiques (en cours, terminees, total, score moyen)
- Simulations actives (liste)
- Prochaines actions (decisions, events, meetings)
- Evolution du score (graphique)
- Activite recente (timeline)

**Probleme** : Aucune guidance. L'utilisateur voit des chiffres mais ne sait pas quoi faire.

### 4.2 Nouveau layout Command Center

```
┌─────────────────────────────────────────────────────────────┐
│ Bonjour Marie ! Voici votre tableau de bord.                │
│                                                              │
│ ┌─────────── GETTING STARTED ───────────┐  ┌── STATS ─────┐ │
│ │ ✅ Creer votre profil               │  │ En cours: 2  │ │
│ │ ✅ Lancer votre premiere simulation  │  │ Terminees: 5 │ │
│ │ 🔲 Soumettre un premier livrable    │  │ Score: 74%   │ │
│ │ 🔲 Consulter votre debriefing       │  └──────────────┘ │
│ │ 🔲 Partager votre portfolio          │                   │
│ │ ━━━━━━━━━━━━━ 40% ━━━━━━━━━━━       │                   │
│ └──────────────────────────────────────┘                   │
│                                                              │
│ ┌────── PROCHAINE ETAPE RECOMMANDEE ──────────────────────┐ │
│ │ 🎯 Vous avez 2 decisions en attente dans "Projet Alpha" │ │
│ │    [Prendre les decisions →]                             │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌── SIMULATIONS ACTIVES ──┐  ┌── ACTIONS EN ATTENTE ──────┐ │
│ │ Projet Alpha  Phase 3   │  │ 📋 2 decisions             │ │
│ │ KPIs: ████ ████ ███     │  │ ⚡ 1 evenement             │ │
│ │ [Reprendre →]           │  │ 👥 1 reunion               │ │
│ │                         │  │ 📧 3 emails non lus        │ │
│ │ Projet Beta   Phase 1   │  │ 📄 1 livrable a reviser    │ │
│ │ KPIs: █████ ████ ████   │  │                             │ │
│ │ [Reprendre →]           │  │ [Voir tout →]               │ │
│ └─────────────────────────┘  └─────────────────────────────┘ │
│                                                              │
│ ┌── EVOLUTION ────────────┐  ┌── ACTIVITE RECENTE ────────┐ │
│ │ [graphique scores]      │  │ il y a 2h — Decision prise │ │
│ │                         │  │ il y a 5h — Livrable soumis│ │
│ └─────────────────────────┘  └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Composant "Getting Started"

**Affiche seulement pour les utilisateurs qui n'ont pas complete toutes les etapes.**
Disparait definitivement une fois les 5 etapes faites (stocke en localStorage + backend).

Etapes :
1. **Creer votre profil** → lien `/onboarding` — complete si `user.profileCompleted`
2. **Lancer votre premiere simulation** → lien `/simulations/new` — complete si au moins 1 simulation
3. **Soumettre un premier livrable** → complete si au moins 1 livrable SUBMITTED
4. **Consulter votre debriefing** → complete si au moins 1 simulation COMPLETED + page debriefing visitee
5. **Partager votre portfolio** → complete si au moins 1 badge partage

**Fichier** : `apps/webapp/src/features/dashboard/components/getting-started-card.tsx` (nouveau)

### 4.4 Composant "Prochaine etape recommandee"

Un algorithme simple de priorite :
1. Si des decisions PENDING → "Vous avez X decisions en attente"
2. Si des events PENDING → "Un evenement aleatoire necessite votre attention"
3. Si des reunions SCHEDULED → "Une reunion est planifiee"
4. Si des livrables DRAFT depuis >24h → "Votre livrable attend d'etre soumis"
5. Si des emails UNREAD → "Vous avez X emails non lus"
6. Si simulation COMPLETED sans debriefing consulte → "Consultez votre debriefing"
7. Sinon → "Tout est a jour ! Lancez une nouvelle simulation."

**Fichier** : `apps/webapp/src/features/dashboard/components/next-step-card.tsx` (nouveau)

### 4.5 Endpoint API pour le dashboard enrichi

```
GET /api/v1/dashboard/summary
```

Retourne :
```json
{
  "user": { "firstName": "Marie", "profileCompleted": true },
  "stats": {
    "activeSimulations": 2,
    "completedSimulations": 5,
    "totalSimulations": 7,
    "averageScore": 74
  },
  "gettingStarted": {
    "profileCompleted": true,
    "firstSimulationLaunched": true,
    "firstDeliverableSubmitted": false,
    "firstDebriefingViewed": false,
    "firstPortfolioShared": false,
    "completionPercent": 40
  },
  "nextStep": {
    "type": "pending_decisions",
    "count": 2,
    "simulationId": "...",
    "simulationName": "Projet Alpha",
    "link": "/simulations/.../decisions/..."
  },
  "activeSimulations": [
    {
      "id": "...",
      "projectName": "Projet Alpha",
      "currentPhase": 3,
      "phaseName": "Execution",
      "kpis": { "budget": 72, "schedule": 65, "quality": 80, "morale": 60, "risk": 45 }
    }
  ],
  "pendingActions": {
    "decisions": 2,
    "events": 1,
    "meetings": 1,
    "emails": 3,
    "deliverables": 1
  },
  "recentActivity": [ ... ],
  "scoreEvolution": [ ... ]
}
```

---

## 5. Progressive Disclosure — Rendre visible l'invisible

### 5.1 Regle

> **Un bouton qui ne peut pas etre utilise doit etre VISIBLE mais DISABLED avec un TOOLTIP expliquant pourquoi.**

Au lieu de cacher les boutons, on les affiche en grise avec une explication.

### 5.2 Inventaire des actions a transformer

#### Campagne de recrutement (`campaign-detail.tsx`)

| Action actuelle | Etat actuel | Nouvel etat |
|-----------------|-------------|-------------|
| Lien de partage | Cache si status !== ACTIVE | **Visible en DRAFT** avec message : "Publiez la campagne pour obtenir le lien de partage" |
| Bouton "Fermer" | Cache si status !== ACTIVE | **Visible en DRAFT** disabled + tooltip "Disponible apres publication" |
| Bouton "Archiver" | Cache si status !== CLOSED | **Visible en ACTIVE/DRAFT** disabled + tooltip "Fermez d'abord la campagne" |
| Onglet Shortlist | Cache si 0 candidats completed | **Visible** disabled + tooltip "En attente de candidats termines" |
| Bouton "Generer shortlist" | Cache si 0 completed | **Visible** disabled + tooltip "Au moins 1 candidat doit avoir termine" |
| Tri par competence | Cache si 0 candidats | **Visible** disabled + tooltip "Disponible avec des candidats" |

#### Simulation (`simulation-detail.tsx`)

| Action | Etat actuel | Nouvel etat |
|--------|-------------|-------------|
| "Historique KPIs" | Cache si <5 events | **Toujours visible** |
| "Phase suivante" | Cache si pas IN_PROGRESS | **Visible** disabled + tooltip "Terminez les actions en attente" |
| Bouton Pause | Cache si pas active | **Visible** disabled + tooltip selon etat |

#### Livrables (`deliverable-editor-page.tsx`, `deliverable-evaluation-page.tsx`)

| Action | Etat actuel | Nouvel etat |
|--------|-------------|-------------|
| "Soumettre" | Disabled si vide, aucun feedback | Disabled + tooltip "Redigez du contenu pour soumettre" |
| "Reviser" | Disabled si max revisions, aucun tooltip | Disabled + tooltip "Nombre maximum de revisions atteint (X/X)" |
| Mode lecture seule | Formulaire grise sans explication | Message alerte info : "Ce livrable est en attente d'evaluation. Vous ne pouvez plus le modifier." |

#### Emails simules (`email-inbox-page.tsx`)

| Action | Etat actuel | Nouvel etat |
|--------|-------------|-------------|
| Formulaire reponse | Cache si RESPONDED/ARCHIVED | **Visible** avec message : "Vous avez deja repondu a cet email" (si RESPONDED) ou "Cet email est archive" (si ARCHIVED) |
| Scoring reponse | Cache si pas encore evalue | Message "Evaluation IA en cours..." ou resultat |

#### Meetings (`meeting-live.tsx`, `meeting-room.tsx`)

| Action | Etat actuel | Nouvel etat |
|--------|-------------|-------------|
| "Resumer" | Disabled sans tooltip si 0 messages | Disabled + tooltip "Echangez d'abord avec les participants" |
| Envoyer message | Disabled sans tooltip si vide | Placeholder ameliore : "Tapez votre message..." + tooltip si vide |

### 5.3 Implementation technique

Creer un composant reutilisable `DisabledWithTooltip` :

```typescript
// apps/webapp/src/components/ui/disabled-with-tooltip.tsx
interface Props {
  disabled: boolean;
  reason?: string;     // Raison du disabled
  children: ReactNode; // Le bouton wrappé
}

// Quand disabled=true ET reason fourni :
// → Wrap le children dans un <Tooltip> qui affiche la raison
// → Ajoute pointer-events-none + opacity-50 sur le children
```

---

## 6. Refonte des empty states

### 6.1 Regle

> **Un empty state doit repondre a 3 questions : Pourquoi c'est vide ? Quand ca se remplira ? Que faire maintenant ?**

### 6.2 Inventaire complet des empty states a refondre

#### Dashboard

| Emplacement | Message actuel | Nouveau message |
|-------------|----------------|-----------------|
| Simulations actives | "Aucune simulation en cours" | "Vous n'avez pas de simulation en cours. Lancez-en une pour commencer votre apprentissage !" + CTA "Nouvelle simulation →" |
| Actions en attente | "Aucune action en attente" | "Aucune action en attente — vous etes a jour ! Les decisions, evenements et reunions apparaitront ici quand votre simulation avancera." |
| Activite recente | "Aucune activite recente" | "Votre historique d'activite apparaitra ici des que vous interagirez avec une simulation." |

#### Simulations

| Emplacement | Message actuel | Nouveau message |
|-------------|----------------|-----------------|
| Liste simulations | "Aucune simulation trouvee." | "Aucune simulation pour le moment. Choisissez un scenario et plongez dans l'experience !" + CTA "Creer ma premiere simulation →" |
| Decisions en attente | "Aucune decision en attente." | "Aucune decision pour cette phase. Les decisions apparaitront au fil de la progression." |
| Evenements en attente | "Aucun evenement en attente." | "Aucun evenement aleatoire pour le moment. Ils peuvent survenir a tout moment !" |
| Reunions phase | "Aucune reunion pour cette phase." | "Aucune reunion planifiee pour cette phase. Passez a la phase suivante pour debloquer de nouvelles reunions." |
| Timeline | "Aucun evenement dans l'historique." | "L'historique se construit au fur et a mesure de vos actions." |

#### Projets

| Emplacement | Message actuel | Nouveau message |
|-------------|----------------|-----------------|
| Liste projets | "Aucun projet. Lancez une simulation..." | OK mais ameliorer CTA : "Creer ma premiere simulation →" (bouton primaire) |
| Membres equipe | "Aucun membre" | "L'equipe sera constituee au lancement de la simulation." |
| Livrables projet | "Aucun livrable" | "Les livrables seront disponibles au fur et a mesure des phases." |

#### Livrables

| Emplacement | Message actuel | Nouveau message |
|-------------|----------------|-----------------|
| Liste livrables | "Aucun livrable pour cette simulation." | "Les livrables apparaissent a chaque nouvelle phase. Avancez dans la simulation pour les debloquer." |
| Reference | "Aucun exemple de reference disponible." | "Pas d'exemple de reference pour ce type de livrable. Appuyez-vous sur les criteres d'evaluation ci-dessous." |

#### Emails

| Emplacement | Message actuel | Nouveau message |
|-------------|----------------|-----------------|
| Pas de simulation | "Aucune simulation active. Lancez une simulation pour recevoir des emails." | OK + ajouter CTA "Lancer une simulation →" |
| Dossier vide | "Aucun email dans ce dossier." | Selon le dossier : Inbox: "Aucun email. Les emails arrivent au fil de la simulation." / Repondus: "Vous n'avez repondu a aucun email." / Archives: "Aucun email archive." |

#### Reunions

| Emplacement | Message actuel | Nouveau message |
|-------------|----------------|-----------------|
| Liste reunions | "Aucune reunion pour cette simulation." | "Les reunions sont planifiees pour chaque phase. Avancez dans la simulation pour les voir apparaitre." |

#### Recrutement

| Emplacement | Message actuel | Nouveau message |
|-------------|----------------|-----------------|
| Liste campagnes | "Aucune campagne trouvee." | "Creez votre premiere campagne pour evaluer des candidats par simulation." + CTA "Nouvelle campagne →" |
| Candidats | "Aucun candidat pour le moment." | Si DRAFT: "Publiez la campagne et partagez le lien pour recevoir des candidatures." + CTA "Publier →" / Si ACTIVE: "Les candidats apparaitront ici quand ils rejoindront la campagne. Partagez le lien !" |
| Guide entretien | "Aucune question generee..." | "Le guide d'entretien sera disponible une fois que le candidat aura termine sa simulation." |

#### Valorisation

| Emplacement | Message actuel | Nouveau message |
|-------------|----------------|-----------------|
| Badges | (non specifie) | "Vous n'avez pas encore de badges. Terminez des simulations pour debloquer vos premiers badges de competence !" + CTA "Voir mes simulations →" |
| Portfolio | "Aucun livrable dans ce portfolio." | "Votre portfolio se construit automatiquement avec vos meilleurs livrables. Soumettez et faites evaluer vos livrables pour les voir apparaitre ici." |

#### Administration

| Emplacement | Message actuel | Nouveau message |
|-------------|----------------|-----------------|
| Templates | "Aucun template trouve." | "Aucun template ne correspond a vos filtres. Essayez de modifier les filtres ou creez un nouveau template." + CTA "Nouveau template →" |
| Documents | "Aucun document trouve." | Idem avec "Nouveau document →" |

### 6.3 Composant Empty State standardise

```typescript
// apps/webapp/src/components/ui/empty-state.tsx
interface EmptyStateProps {
  icon: string;           // KeenIcon name
  title: string;          // "Aucune simulation"
  description: string;    // "Les simulations apparaitront..."
  action?: {
    label: string;        // "Nouvelle simulation"
    href?: string;        // "/simulations/new"
    onClick?: () => void;
  };
}
```

---

## 7. Workflow steppers — Guidage des flux multi-etapes

### 7.1 Regle

> **Tout processus multi-etapes doit afficher un stepper montrant l'etape actuelle, les etapes passees, et les etapes a venir.**

### 7.2 Flux necessitant un stepper

#### Flux campagne de recrutement

Ajouter un **stepper horizontal** sur `campaign-detail.tsx` :

```
[1. Creer] → [2. Generer scenario] → [3. Publier] → [4. Recruter] → [5. Analyser] → [6. Cloturer]
   ✅              ✅                    🔵             ⬜              ⬜              ⬜
```

- Etape 1 : Complete quand campagne creee (status DRAFT)
- Etape 2 : Complete quand `generatedScenarioId` non null
- Etape 3 : Complete quand status ACTIVE
- Etape 4 : En cours quand il y a des candidats
- Etape 5 : Disponible quand au moins 1 candidat COMPLETED
- Etape 6 : Complete quand status CLOSED

**Fichier** : `apps/webapp/src/features/recruitment/components/campaign-workflow-stepper.tsx` (nouveau)

#### Flux simulation

Ajouter un **stepper de phases** ameliore dans le header de contexte simulation :

```
[Initiation] → [Planning] → [Execution] → [Monitoring] → [Cloture]
     ✅            ✅           🔵              ⬜            ⬜
```

Deja partiellement present dans `simulation-detail.tsx` mais sous forme de dots. Le rendre plus explicite avec des labels et un vrai composant stepper.

#### Flux livrable

Ajouter un **stepper de statut** dans `deliverable-editor-page.tsx` et `deliverable-evaluation-page.tsx` :

```
[Brouillon] → [Soumis] → [Evalue] → [Revise?] → [Valide]
    ✅          🔵         ⬜          ⬜          ⬜
```

**Fichier** : `apps/webapp/src/features/deliverables/components/deliverable-workflow-stepper.tsx` (nouveau)

### 7.3 Composant Stepper reutilisable

```typescript
// apps/webapp/src/components/ui/workflow-stepper.tsx
interface WorkflowStep {
  label: string;
  status: 'completed' | 'active' | 'upcoming' | 'disabled';
  description?: string;  // Tooltip au survol
  onClick?: () => void;  // Navigation si cliquable
}

interface WorkflowStepperProps {
  steps: WorkflowStep[];
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md';
}
```

---

## 8. Breadcrumbs et navigation retour

### 8.1 Regle

> **Chaque page profonde doit afficher un breadcrumb ET un bouton retour.**

### 8.2 Pages necessitant des breadcrumbs

| Page | Breadcrumb attendu |
|------|--------------------|
| `/simulations/:id` | Simulations > Projet Alpha |
| `/simulations/:id/pmo` | Simulations > Projet Alpha > Agent PMO |
| `/simulations/:id/deliverables` | Simulations > Projet Alpha > Livrables |
| `/simulations/:id/deliverables/:id/edit` | Simulations > Projet Alpha > Livrables > Redaction |
| `/simulations/:id/deliverables/:id/evaluation` | Simulations > Projet Alpha > Livrables > Evaluation |
| `/simulations/:id/emails` | Simulations > Projet Alpha > Emails |
| `/simulations/:id/emails/:id` | Simulations > Projet Alpha > Emails > Detail |
| `/simulations/:id/kpis` | Simulations > Projet Alpha > Historique KPI |
| `/simulations/:id/debriefing` | Simulations > Projet Alpha > Debriefing |
| `/simulations/:id/portfolio` | Simulations > Projet Alpha > Portfolio |
| `/projects/:id` | Projets > Projet Alpha |
| `/projects/:id/team` | Projets > Projet Alpha > Equipe |
| `/meetings/:id` | Reunions > Reunion Kickoff |
| `/meetings/:id/live` | Reunions > Reunion Kickoff > En direct |
| `/meetings/:id/summary` | Reunions > Reunion Kickoff > Resume |
| `/recruitment/campaigns/:id` | Recrutement > Campagne Chef de Projet |
| `/recruitment/campaigns/:id/candidates/:id` | Recrutement > Campagne > Rapport candidat |
| `/recruitment/campaigns/:id/shortlist` | Recrutement > Campagne > Shortlist |
| `/recruitment/campaigns/:id/compare` | Recrutement > Campagne > Comparaison |
| `/recruitment/campaigns/:id/candidates/:id/interview` | Recrutement > Campagne > Guide entretien |

### 8.3 Implementation

Le composant `ToolbarBreadcrumbs` existe deja dans `layout-6/components/toolbar.tsx` mais il se base uniquement sur le menu pour generer le chemin. Les routes parametrees n'ont pas de correspondance menu → breadcrumb vide.

**Solution** : enrichir `ToolbarBreadcrumbs` avec un systeme de **route metadata** :

```typescript
// apps/webapp/src/config/breadcrumbs.config.ts
export const BREADCRUMB_CONFIG: Record<string, BreadcrumbDef> = {
  '/simulations/:id': {
    parents: [{ label: 'Simulations', path: '/simulations' }],
    labelResolver: (params) => `Projet ${params.projectName}`,
  },
  '/simulations/:id/pmo': {
    parents: [
      { label: 'Simulations', path: '/simulations' },
      { label: ':projectName', path: '/simulations/:id' },
    ],
    label: 'Agent PMO',
  },
  // ... etc
};
```

---

## 9. Tooltips et aide contextuelle

### 9.1 Regle

> **Chaque element interactif dont le role n'est pas evident doit avoir un tooltip ou une aide contextuelle.**

### 9.2 Zones d'aide a ajouter

#### KPIs simulation
Les 5 jauges KPI (Budget, Delai, Qualite, Moral, Risque) doivent avoir un tooltip au survol :
- Budget : "Pourcentage du budget restant. En dessous de 40%, le projet est en danger financier."
- Delai : "Respect du calendrier. En dessous de 40%, le projet risque de depasser les echeances."
- Qualite : "Indice de qualite des livrables et du travail produit."
- Moral : "Moral de l'equipe. Un moral bas reduit la productivite."
- Risque : "Exposition aux risques. Plus c'est bas, plus la situation est critique."

#### Campagne recrutement
- Score match candidat : "Pourcentage d'adequation entre les competences du candidat et les exigences du poste."
- Poids competence (1-10) : "1 = peu important, 10 = critique pour le poste."
- Culture AGILE/STRICT/COLLAB : Tooltip avec description de l'impact sur la simulation.

#### Livrables
- Grade (A/B/C/D/F) : Tooltip avec la plage de score correspondante.
- "Alignement PMI" : "Mesure la conformite de votre livrable aux standards PMI (Project Management Institute)."

### 9.3 Bouton d'aide "?" dans la toolbar

Ajouter un bouton `?` dans le `ToolbarActions` de chaque page qui ouvre un panneau lateral avec :
- Un paragraphe "Comment ca marche"
- Les raccourcis clavier disponibles
- Un lien vers la documentation

**Fichier** : `apps/webapp/src/components/ui/contextual-help.tsx` (nouveau)

---

## 10. Onboarding tour pour nouveaux utilisateurs

### 10.1 Tour de bienvenue

Au premier login (apres le wizard de profil), afficher un tour guide en 5 etapes :

1. **"Voici votre tableau de bord"** → Highlight du dashboard
   "C'est votre QG. Retrouvez vos simulations en cours, vos actions en attente et votre progression."

2. **"Lancez votre premiere simulation"** → Highlight du menu Simulations
   "Choisissez un scenario et immergez-vous dans un projet fictif. Vous prendrez des decisions, participerez a des reunions et redigerez des livrables."

3. **"L'Agent PMO vous accompagne"** → Highlight du contexte
   "Une fois dans une simulation, votre agent PMO IA est disponible pour vous guider et repondre a vos questions."

4. **"Suivez votre progression"** → Highlight des KPIs
   "Vos decisions impactent les indicateurs du projet en temps reel. Gardez un oeil sur le budget, les delais et la qualite."

5. **"Valorisez vos competences"** → Highlight de Valorisation
   "Apres chaque simulation, consultez votre debriefing, exportez votre portfolio et partagez vos badges."

### 10.2 Implementation technique

Utiliser un systeme de tour guide leger (pas de librairie externe) :

```typescript
// apps/webapp/src/components/ui/guided-tour.tsx
// - Overlay semi-transparent
// - Spotlight sur l'element cible (via ref ou selector CSS)
// - Card avec titre, description, etape X/Y, boutons Suivant/Passer
// - Stockage de l'etat "tour vu" en localStorage + API (user preferences)
```

**Declenchement** : `!localStorage.getItem('onboarding_tour_completed')` au premier affichage du dashboard.

---

## 11. Micro-interactions et feedback

### 11.1 Toasts manquants

Ajouter des toasts `sonner` pour CHAQUE mutation reussie :

| Action | Toast |
|--------|-------|
| Soumettre un livrable | "Livrable soumis avec succes ! L'evaluation IA est en cours." |
| Repondre a un email | "Reponse envoyee. L'evaluation arrivera sous peu." |
| Prendre une decision | "Decision enregistree. Les KPIs ont ete mis a jour." |
| Reagir a un evenement | "Reaction enregistree." |
| Passer a la phase suivante | "Phase suivante demarree ! De nouvelles actions sont disponibles." |
| Publier une campagne | "Campagne publiee ! Partagez le lien avec vos candidats." |
| Fermer une campagne | "Campagne cloturee." |
| Archiver une campagne | "Campagne archivee." |
| Generer un scenario | "Scenario genere avec succes !" |
| Generer la shortlist | "Shortlist generee." |
| Generer le guide entretien | "Guide d'entretien personnalise genere." |

### 11.2 Indicateurs de chargement

Remplacer les spinners generiques par des **skeleton loaders** sur les pages principales :
- Dashboard : skeleton cards pour stats, skeleton lignes pour listes
- Simulation detail : skeleton pour KPIs, decisions, reunions
- Campagne detail : skeleton pour dashboard stats, table candidats
- Liste simulations : skeleton cards
- Chat PMO : skeleton bulles de messages

### 11.3 Animations de transition

Les transitions entre pages doivent etre fluides (deja partiellement en place via Framer Motion). S'assurer que :
- Entree de page : fade-in + slide-up leger (200ms)
- Changement d'onglet : crossfade (150ms)
- Ouverture de dialog : scale-in (200ms)
- Toast : slide-in depuis le coin

---

## 12. Plan d'implementation

### Phase 1 — Menu contextuel (3-4 jours)

| # | Tache | Fichiers |
|---|-------|----------|
| 1.1 | Creer le hook `useContextualMenu` | `hooks/use-contextual-menu.ts` (nouveau) |
| 1.2 | Creer la config `SIMULATION_MENU` | `config/simulation-context-menu.ts` (nouveau) |
| 1.3 | Refactorer le menu global (retirer Emails, Reunions du global) | `config/menu.config.ts` |
| 1.4 | Modifier `sidebar-menu-primary.tsx` pour utiliser le nouveau hook | `layout-6/components/sidebar-menu-primary.tsx` |
| 1.5 | Creer le composant `SimulationContextBar` | `layout-6/components/simulation-context-bar.tsx` (nouveau) |
| 1.6 | Creer l'endpoint API `GET /simulations/:id/counts` | `apps/api/modules/simulations/` |
| 1.7 | Creer le hook `useSimulationContext` | `features/simulation/hooks/use-simulation-context.ts` (nouveau) |
| 1.8 | Ajouter les badges compteur dans le menu simulation | `sidebar-menu-primary.tsx` |

### Phase 2 — Progressive Disclosure (2-3 jours)

| # | Tache | Fichiers |
|---|-------|----------|
| 2.1 | Creer le composant `DisabledWithTooltip` | `components/ui/disabled-with-tooltip.tsx` (nouveau) |
| 2.2 | Refondre `campaign-detail.tsx` — boutons visible+disabled | `recruitment/pages/campaign-detail.tsx` |
| 2.3 | Refondre `simulation-detail.tsx` — actions visible+disabled | `simulation/pages/simulation-detail.tsx` |
| 2.4 | Refondre `deliverable-editor-page.tsx` — feedback soumettre/readonly | `deliverables/pages/deliverable-editor-page.tsx` |
| 2.5 | Refondre `deliverable-evaluation-page.tsx` — tooltip revision | `deliverables/pages/deliverable-evaluation-page.tsx` |
| 2.6 | Refondre `email-inbox-page.tsx` — feedback reponse/archive | `simulated-emails/pages/email-inbox-page.tsx` |
| 2.7 | Refondre `meeting-live.tsx` + `meeting-room.tsx` — tooltip resume | `meeting/pages/` |

### Phase 3 — Empty States (1-2 jours)

| # | Tache | Fichiers |
|---|-------|----------|
| 3.1 | Creer le composant `EmptyState` standardise | `components/ui/empty-state.tsx` (nouveau) |
| 3.2 | Refondre tous les empty states (42 occurrences) | Voir inventaire section 6.2 |

### Phase 4 — Command Center Dashboard (2-3 jours)

| # | Tache | Fichiers |
|---|-------|----------|
| 4.1 | Creer l'endpoint `GET /dashboard/summary` | `apps/api/modules/dashboard/` |
| 4.2 | Creer `GettingStartedCard` | `dashboard/components/getting-started-card.tsx` (nouveau) |
| 4.3 | Creer `NextStepCard` | `dashboard/components/next-step-card.tsx` (nouveau) |
| 4.4 | Refondre `dashboard.tsx` avec le nouveau layout | `dashboard/pages/dashboard.tsx` |

### Phase 5 — Steppers et Breadcrumbs (2 jours)

| # | Tache | Fichiers |
|---|-------|----------|
| 5.1 | Creer le composant `WorkflowStepper` | `components/ui/workflow-stepper.tsx` (nouveau) |
| 5.2 | Ajouter le stepper campagne | `recruitment/components/campaign-workflow-stepper.tsx` (nouveau) |
| 5.3 | Ajouter le stepper livrable | `deliverables/components/deliverable-workflow-stepper.tsx` (nouveau) |
| 5.4 | Creer `breadcrumbs.config.ts` | `config/breadcrumbs.config.ts` (nouveau) |
| 5.5 | Enrichir `ToolbarBreadcrumbs` avec route metadata | `layout-6/components/toolbar.tsx` |

### Phase 6 — Tooltips, Aide et Tour (2 jours)

| # | Tache | Fichiers |
|---|-------|----------|
| 6.1 | Ajouter les tooltips KPIs simulation | `simulation/components/kpi-gauge.tsx` ou equivalent |
| 6.2 | Ajouter les tooltips recrutement (match, poids, culture) | `recruitment/pages/` |
| 6.3 | Creer `ContextualHelp` | `components/ui/contextual-help.tsx` (nouveau) |
| 6.4 | Creer `GuidedTour` | `components/ui/guided-tour.tsx` (nouveau) |
| 6.5 | Integrer le tour au dashboard | `dashboard/pages/dashboard.tsx` |

### Phase 7 — Polish (1-2 jours)

| # | Tache | Fichiers |
|---|-------|----------|
| 7.1 | Ajouter les toasts manquants (11 mutations) | Pages concernees |
| 7.2 | Remplacer spinners par skeleton loaders | Pages principales |
| 7.3 | Verifier les animations de transition | Layout + pages |

---

## 13. Inventaire des modifications par fichier

### Fichiers NOUVEAUX a creer (14)

| Fichier | Contenu |
|---------|---------|
| `hooks/use-contextual-menu.ts` | Hook menu dynamique |
| `config/simulation-context-menu.ts` | Config menu simulation |
| `config/breadcrumbs.config.ts` | Config breadcrumbs par route |
| `components/ui/empty-state.tsx` | Composant empty state standardise |
| `components/ui/disabled-with-tooltip.tsx` | Wrapper bouton disabled+tooltip |
| `components/ui/workflow-stepper.tsx` | Composant stepper reutilisable |
| `components/ui/contextual-help.tsx` | Panneau aide contextuelle |
| `components/ui/guided-tour.tsx` | Tour guide onboarding |
| `layout-6/components/simulation-context-bar.tsx` | Bandeau contexte simulation |
| `dashboard/components/getting-started-card.tsx` | Checklist getting started |
| `dashboard/components/next-step-card.tsx` | Prochaine etape recommandee |
| `recruitment/components/campaign-workflow-stepper.tsx` | Stepper campagne |
| `deliverables/components/deliverable-workflow-stepper.tsx` | Stepper livrable |
| `simulation/hooks/use-simulation-context.ts` | Hook contexte simulation |

### Fichiers MODIFIES (20+)

| Fichier | Modifications |
|---------|---------------|
| `config/menu.config.ts` | Retirer Emails, Reunions du menu global |
| `hooks/use-filtered-menu.ts` | Adapter pour cohabiter avec le contextuel |
| `layout-6/components/sidebar-menu-primary.tsx` | Utiliser useContextualMenu, badges, back link |
| `layout-6/components/toolbar.tsx` | Enrichir breadcrumbs avec route metadata |
| `layout-6/components/main.tsx` | Integrer SimulationContextBar |
| `dashboard/pages/dashboard.tsx` | Nouveau layout Command Center |
| `simulation/pages/simulation-detail.tsx` | Actions disabled+tooltip, stepper phases |
| `deliverables/pages/deliverables-list-page.tsx` | Empty states |
| `deliverables/pages/deliverable-editor-page.tsx` | Feedback readonly, tooltip soumettre, stepper |
| `deliverables/pages/deliverable-evaluation-page.tsx` | Tooltip revision, stepper |
| `recruitment/pages/campaign-detail.tsx` | Stepper workflow, boutons disabled+tooltip |
| `recruitment/pages/campaigns-list.tsx` | Empty state |
| `simulated-emails/pages/email-inbox-page.tsx` | Feedback reponse, empty states |
| `meeting/pages/meeting-live.tsx` | Tooltip resume |
| `meeting/pages/meeting-room.tsx` | Tooltip resume |
| `meeting/pages/meetings-list.tsx` | Empty state |
| `pmo/pages/pmo-chat-page.tsx` | Empty state |
| `valorization/pages/badges-page.tsx` | Empty state |
| `valorization/pages/portfolio-page.tsx` | Empty state |
| `admin-reference/pages/deliverable-templates-page.tsx` | Empty state |
| `admin-reference/pages/reference-documents-page.tsx` | Empty state |

### Fichiers backend

| Fichier | Modifications |
|---------|---------------|
| `apps/api/modules/simulations/simulations.controller.ts` | Ajouter endpoint GET /:id/counts |
| `apps/api/modules/simulations/services/simulations.service.ts` | Methode getSimulationCounts |
| `apps/api/modules/dashboard/dashboard.controller.ts` | Ajouter endpoint GET /summary |
| `apps/api/modules/dashboard/dashboard.service.ts` | Methode getDashboardSummary |

---

> **Estimation totale** : 13-18 jours de developpement
> **Impact** : Transformation de l'experience utilisateur avec decouverte naturelle des fonctionnalites, guidage permanent, et zero impasse.
