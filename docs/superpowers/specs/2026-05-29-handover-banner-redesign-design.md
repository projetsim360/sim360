# Redesign HandoverBanner — Spec

**Date** : 2026-05-29
**Branche** : `feat/onboarding-redesign`
**Statut** : validé pour implémentation
**Composant cible** : `apps/webapp/src/features/simulation/components/handover-banner.tsx`
**Intégration** : rendu par `SimulationDetailPage` quand `sim.status === 'ONBOARDING'` (ligne 196-198).

---

## 1. Intention

Transformer le stepper de prise de poste, fonctionnel mais visuellement plat et hors-charte, en un **bandeau premium immersif** qui pose le ton de l'expérience Simex pro dès l'arrivée sur le cockpit en mode ONBOARDING. L'apprenant doit ressentir « ma mission démarre » plutôt que « je remplis un formulaire ».

**Ce que ça doit résoudre :**

- Couleurs hors palette Simex (`blue-500`, `green-500`, `from-brand-500 via-blue-500 to-success`) → palette tokenisée (`--brand-*`, `--accent-*`, `--success-*`).
- Accents français oubliés (« Demarrage », « integration », « completez », « terminee »).
- Largeur fixe `w-32` par étape qui casse en dessous de 640 px → responsive avec **timeline verticale en mobile**.
- Mix d'icônes (KeenIcon + SVG inline pour ✓ et éclair) → KeenIcon partout.
- Aucune animation (le reste du cockpit en a) → entrée fade+slide, beams sur grille, ring pulsant.
- Étape passée non cliquable → **revoir le compte-rendu** depuis le badge ↻.

**Hors scope (intentionnellement) :**

- Aucun changement backend (API `getHandoverStatus`, `completeHandover` inchangés).
- Aucun changement de la séquence 3 étapes (`HR → PMO → DONE`).
- Aucun changement de la `simulation-detail.tsx` au-delà du rendu de `<HandoverBanner>` (l'API du composant reste compatible : `simulationId` + `onHandoverComplete?`).

---

## 2. Sources de données

| Donnée | Origine | Fallback |
|---|---|---|
| `firstName` (salutation) | `useAuth().user?.firstName` | « apprenant » |
| `companyName` (sous-titre) | `sim.project?.client` → `sim.project?.name` | « votre projet » |
| `currentStep`, `isComplete`, `hrMeeting`, `pmoMeeting` | `simulationApi.getHandoverStatus(simulationId)` | rien (composant retourne `null` si `!hasHandover`) |
| `stepIndex` (pour pill et progress) | dérivé de `currentStep` | — |

`HandoverBanner` accepte un nouveau prop optionnel `sim?: Pick<Simulation, 'project'>` injecté par `SimulationDetailPage` pour éviter un second fetch ; si non fourni, le sous-titre tombe sur le fallback.

---

## 3. Direction visuelle

### 3.1 Fond du bandeau

- **Dégradé brand sombre** : `linear-gradient(135deg, var(--brand-900) 0%, var(--brand-800) 50%, var(--brand-700) 110%)`.
- **Halo accent** en haut à droite : cercle radial `rgba(238,122,58,0.42)` qui s'évanouit (200×200 px, `top:-50px;right:-50px`).
- **Grille blanche translucide** par-dessus, fournie par le composant existant `GridBackground` :
  - `gridSize="12:8"`, `borderColor="border-white/10"`, `borderStyle="solid"`, `background="bg-transparent"` (on garde notre dégradé en parent).
  - `beams={ count: 3, colors: ['bg-[var(--accent-500)]', 'bg-[var(--accent-300)]', 'bg-white'], shadow: 'shadow-md shadow-[var(--accent-500)]/50 rounded-full', speed: 5 }`.
- **Coupure motion** : `useReducedMotion()` désactive les beams (les lignes statiques restent).

### 3.2 Header bandeau

Disposition `flex justify-between items-start` :

- **Gauche** : titre `font-display font-bold text-[17px] text-white` = « Bienvenue, {firstName} » + sous-titre `text-xs text-white/70` = « Vos premiers pas chez {companyName}. ».
- **Droite** (alignée colonne) :
  - Pill `bg-white/12 border border-white/22 backdrop-blur-sm rounded-full px-3 py-1 text-[11px] font-semibold text-white` = « Étape {n} / 3 ».
  - Caption `text-[10px] text-white/55` = « ≈ {remainingMin} min restantes ».

Quand `isComplete === true`, le titre devient « C'est parti, {firstName} ! » et le sous-titre « Votre prise de poste est validée — lancez le projet. ». La pill affiche « Prêt ».

### 3.3 Stepper desktop

3 cellules `flex justify-center` séparées par des connecteurs.

| Élément | DONE | ACTIVE | FUTURE |
|---|---|---|---|
| Cercle | 40 px, `bg-white text-[var(--success-500)]`, icône `<KeenIcon icon="check" style="solid">` | 48 px, `bg-[var(--accent-500)] text-white`, icône step + `ring-[var(--accent-500)]/35` animé pulse | 40 px, `bg-white/8 border border-dashed border-white/30 text-white/55`, icône step |
| Badge ↻ | petit cercle 14 px `bg-[var(--success-500)]` au coin haut-droit avec `<KeenIcon icon="arrows-circle">` | — | — |
| Cliquable | oui → `Link to={/meetings/{hrMeeting.id ou pmoMeeting.id}}`, focus ring + cursor-pointer | non | non |
| Label | `text-[11px] font-bold text-white` | `text-[11px] font-bold text-white` | `text-[11px] font-bold text-white/55` |
| Meta | `text-[10px] text-white/60` = « Terminé · revoir » | `text-white/78` = « En cours · ~{Xmin} » | `text-white/40` = « À venir · ~{Xmin} » |
| Connecteur (à droite) | barre 2 px `bg-white/85` (état atteint) | — | barre 2 px `bg-white/18` (non atteint) |

Icônes KeenIcon par étape : `people` (HR), `notepad` (PMO), `rocket` (DONE).

### 3.4 CTA

Bouton `Button variant="primary" size="lg"` accent (`bg-[var(--accent-500)] hover:bg-[var(--accent-600)] text-white shadow-[0_8px_20px_rgba(238,122,58,0.40)]`), centré, sous le stepper.

Label contextuel :

| `currentStep` | Label |
|---|---|
| `HR` (et `hrMeeting` présent) | « Commencer l'accueil RH » avec `<KeenIcon icon="people">` |
| `PMO` (et `pmoMeeting` présent) | « Commencer la passation PMO » avec `<KeenIcon icon="notepad">` |
| `DONE` ou `isComplete` | « Commencer le projet » avec `<KeenIcon icon="rocket">`, déclenche `handleCompleteHandover()` (loading state inchangé) |

Cas `HR`/`PMO` : `<Button asChild><Link to={/meetings/...}>…</Link></Button>`.

### 3.5 Durées

Hardcodées en constante locale :

```ts
const STEP_DURATIONS_MIN = { HR: 10, PMO: 15, DONE: 2 } as const;
```

`remainingMin` = somme des durées des étapes ≥ `currentStepIndex` (inclus). Pas d'estimation backend.

---

## 4. Layout mobile (< 640 px)

Le bandeau bascule en **timeline verticale** :

- Header : titre + sous-titre empilés à gauche, pill « 2 / 3 » seule à droite (pas de caption « min restantes » faute de place).
- Stepper : chaque étape devient une **ligne** :

```
●──┐
│  Accueil RH                  (font-bold text-[11px] text-white)
│  Terminé · revoir →          (text-[10px] text-white/60)
●──┐
│  Passation PMO               (en cours, cercle pulsant)
│  En cours · ~15 min
●
   Démarrage                   (cercle dashed)
   À venir · ~2 min
```

- Le cercle est à gauche (32 px DONE/FUTURE, 36 px ACTIVE), suivi d'un connecteur vertical 2 px qui prend la couleur de l'état atteint.
- Le badge ↻ devient un petit caret « → » à la fin du label « Terminé · revoir → » pour économiser la place.
- Le CTA passe à `w-full` en bas.

Breakpoint : `sm:flex-row` desktop / `flex-col` mobile via Tailwind. Pas de `useMediaQuery` JS.

---

## 5. Animations

Toutes désactivées si `useReducedMotion()` est vrai.

| Élément | Animation |
|---|---|
| Bandeau (à l'entrée) | `motion.div` avec `initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} transition={{duration:0.4, ease:'easeOut'}}` |
| Étapes (stagger) | `staggerContainer` + `staggerItem` (déjà exportés depuis `@/lib/motion`) pour les 3 étapes avec délai 0.08 s |
| Cercle ACTIVE | `animation: pulse-ring 2s ease-in-out infinite` — keyframe définie via une balise `<style>` colocalisée dans `handover-banner.tsx` (scope contenu, pas d'extension de `tailwind.config`). |
| Beams sur grille | gérés par `GridBackground` (déjà animés via framer-motion à l'intérieur du composant) |

---

## 6. États

| État | Rendu |
|---|---|
| `loading` (fetch en vol) | `<Skeleton className="h-44 w-full rounded-xl mb-5" />` (desktop) / `h-72` (mobile) |
| `!status.hasHandover` | composant retourne `null` (comportement actuel conservé) |
| `currentStep === 'HR'` | étape 1 active, 2-3 future, CTA « Commencer l'accueil RH » |
| `currentStep === 'PMO'` | étape 1 done, 2 active, 3 future, CTA « Commencer la passation PMO » |
| `currentStep === 'DONE'` ou `isComplete` | étapes 1-2 done, étape 3 active (ou done si `isComplete`), CTA « Commencer le projet » |
| `completing` (clic CTA DONE) | bouton `disabled`, label « Démarrage en cours… » + spinner |

---

## 7. Accessibilité

- Le bandeau est un `<section aria-labelledby="handover-title">` avec le titre `<h2 id="handover-title">` (visuellement = « Bienvenue, {firstName} »).
- Stepper : `<ol role="list">` avec chaque étape `<li>`. Étape active porte `aria-current="step"`.
- Pill compteur : `<div role="progressbar" aria-valuemin={0} aria-valuemax={3} aria-valuenow={stepIndex + 1} aria-label="Progression de la prise de poste">`.
- Étapes complétées cliquables : `<Link>` avec `aria-label="Revoir le compte-rendu de l'accueil RH"`.
- Contraste : texte blanc sur dégradé brand-900 → ≥ 7:1 (largement OK). Texte `white/55` sur fond brand-700 ≈ 4.6:1 (OK pour label muted).
- Focus visible : tous les éléments interactifs gardent l'outline focus du design system.

---

## 8. Structure de fichiers

**Aucun nouveau fichier obligatoire** — le redesign tient dans `handover-banner.tsx` enrichi. Mais on extrait deux unités internes au même fichier pour la lisibilité :

```tsx
// handover-banner.tsx
function HandoverStepCircle({ state, icon, isClickable, ariaLabel }: ...) { ... }
function HandoverStep({ step, state, durationMin, meeting }: ...) { ... }
export function HandoverBanner({ simulationId, sim, onHandoverComplete }: ...) { ... }
```

Si le fichier dépasse 250 lignes après implémentation, on extrait `HandoverStep` et `HandoverStepCircle` dans `apps/webapp/src/features/simulation/components/handover-step.tsx`. Décision à prendre **pendant** l'implémentation, pas avant.

---

## 9. API du composant

```tsx
interface HandoverBannerProps {
  simulationId: string;
  sim?: Pick<Simulation, 'project'>;  // ← nouveau, optionnel
  onHandoverComplete?: () => void;
}
```

Rétro-compatible : un appelant qui ne passe pas `sim` voit juste le sous-titre fallback. Aucun changement requis dans `SimulationDetailPage` pour que le redesign visuel fonctionne — l'enrichissement (`sim={sim}`) sera ajouté en même temps que l'implémentation du composant.

---

## 10. Critères d'acceptation

1. `pnpm --filter @sim360/webapp typecheck` reste vert.
2. Sur `/simulations/:id` avec `sim.status === 'ONBOARDING'` :
   - Le bandeau s'affiche avec fond dégradé brand + grille blanche + beams accents animés.
   - La salutation lit le `firstName` de l'utilisateur connecté.
   - La pill affiche « Étape 1/3 », « 2/3 » ou « 3/3 » correctement selon `currentStep`.
   - Cliquer le cercle « Accueil RH » quand il est `DONE` ouvre `/meetings/{hrMeeting.id}`.
   - Le CTA navigue vers la bonne réunion ou déclenche `completeHandover()`.
3. À 375 px de viewport (iPhone SE), le bandeau passe en timeline verticale, lisible, sans overflow horizontal.
4. `prefers-reduced-motion: reduce` désactive beams + pulse-ring + stagger.
5. Aucun mot français du composant ne manque d'accent (recherche `grep -E "(demarrer|integration|completez|terminee)"` doit ne rien remonter dans le fichier).
6. Vérification Playwright sur la sim `cmprax91h000o02kv3i9mdltm` (ou autre ONBOARDING) en desktop + mobile : capture d'écran prouve le rendu, console sans erreur.

---

## 11. Risques & mitigations

| Risque | Mitigation |
|---|---|
| `GridBackground` injecte sa propre `bg-slate-900` par défaut | Passer explicitement `colors={{ background: 'bg-transparent' }}` et laisser le dégradé sur le parent. |
| Beams accent sur fond sombre peuvent vibrer / fatiguer | Speed 5 s, max 3 beams (count: 3), `useReducedMotion` coupe tout. À ré-évaluer à la verif Playwright si trop chargé. |
| Halo accent + beams + grille = trop bruyant | Tester intensité grille à 0.07 ; si trop visible, redescendre à 0.05. Ajustement décidé à la verif. |
| Pull manuel des durées (hardcodé) | Acceptable : pas de signal produit que les durées doivent venir du backend. Constante locale documentée. |
| Étape « DONE » cliquable au mauvais moment | Cliquable seulement si `state === 'done' && meeting != null`. Tri-state strict. |

---

## 12. Vérification

Pas de runner de tests front (mémoire `frontend-verification`) :

- `pnpm --filter @sim360/webapp typecheck` après chaque modif majeure.
- Playwright en fin de tâche d'implémentation pour capturer desktop (1280×980) + mobile (375×812) sur une sim ONBOARDING, vérifier 0 erreur console, salutation perso présente, beams animés (capturer 2 frames à 1 s d'intervalle pour preuve d'animation).
- Couper `prefers-reduced-motion` via `chromium.launch({ reducedMotion: 'reduce' })` pour valider que tout l'agitation s'éteint.
