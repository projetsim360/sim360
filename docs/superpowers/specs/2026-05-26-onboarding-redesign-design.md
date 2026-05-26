# Spec design — Redesign de l'onboarding

- **Date** : 2026-05-26
- **Périmètre** : page `/onboarding` (wizard de profilage) du webapp Simex pro — shell, stepper, étapes, aperçu vivant, responsive
- **Statut** : design validé via le compagnon visuel, prêt pour le plan d'implémentation

## Contexte & intention

L'onboarding actuel est un wizard 5 étapes (Import CV → Questionnaire → Test d'aptitude conditionnel → Diagnostic → Choix du parcours). Il est fonctionnel mais générique : header centré quelconque, stepper plat, fond `bg-muted/40`, et surtout un usage de `primary` (= `accent-500` orange) partout (logo, étape active, barre de progression) qui casse la discipline de marque établie sur le redesign PMO — **bleu profond `--brand-*` pour la structure et la navigation, orange `--accent-*` réservé aux actions primaires**. Une sidebar « Résumé du profil » répète passivement la progression du stepper.

**Objectif** : un onboarding **très soigné, interactif, aéré et fluide**, aligné sur la marque, avec une narration claire et un aperçu du profil qui se construit en direct. Le câblage data (mutations, hooks API) reste inchangé ; on retravaille le découpage, le shell, la présentation des étapes et on transforme la sidebar en aperçu vivant.

## Décisions de design (validées via le compagnon visuel)

1. **Découpage — option A « Parcours en 3 temps »** : on fusionne « Import » + « Questionnaire » en une seule étape **Profil**. Le parcours logique passe de 5 à **4 étapes** (3 actives par défaut, 4 pour un débutant) :
   `Profil → (Mise en situation, si débutant) → Diagnostic → Parcours`.
2. **Test d'aptitude conditionnel conservé** : il n'apparaît que si `questionnaireData.experienceLevel === 'none'`.
3. **Shell — option A « Rail marque + contenu centré »** : volet latéral bleu profond persistant (wordmark + stepper vertical + aperçu vivant) à gauche, contenu d'étape aéré à droite.
4. **Aperçu vivant** : la sidebar « Résumé du profil » est remplacée par un panneau qui change de contenu à chaque étape (jamais figé).
5. **Mobile** : le rail se replie en barre supérieure (wordmark + mini-stepper horizontal) ; l'aperçu vivant devient un accordéon repliable « Votre profil » sous l'en-tête.
6. **Compteur d'étapes dynamique** : le rail affiche toujours l'entrée « Mise en situation » mais en **pointillé « si débutant »** (largeur stable, non numérotée tant qu'inactive) ; le compteur affiche « Étape X sur 3 » par défaut et bascule en « sur 4 » dès que l'utilisateur choisit « Aucune expérience ». La numérotation des étapes suivantes se recalcule (révélation fluide).

## Architecture des composants

```
apps/webapp/src/features/profile/
  config/
    onboarding.config.ts        (NEW) — STEP_META + mapping d'icônes
  hooks/
    use-onboarding.ts           (MODIFY) — nouveau découpage, compteur dynamique, état live
  pages/
    onboarding-page.tsx         (REWRITE) — orchestrateur shell (rail/topbar + header contenu + body + aperçu vivant), détient l'état live
    profil-step.tsx             (NEW) — étape fusionnée import + questionnaire (body uniquement)
    aptitude-test-step.tsx      (RESTYLE) — body uniquement, tokens marque
    diagnostic-step.tsx         (RESTYLE) — body uniquement, tokens marque
    choose-path-step.tsx        (RESTYLE) — body uniquement, tokens marque
    profile-import-step.tsx     (DELETE) — logique absorbée par profile-import-panel
    questionnaire-step.tsx      (DELETE) — logique absorbée par profil-step
  components/
    onboarding-rail.tsx         (NEW) — rail desktop : wordmark + stepper vertical + aperçu vivant
    onboarding-topbar.tsx       (NEW) — barre mobile : wordmark + mini-stepper + accordéon aperçu
    onboarding-stepper.tsx      (REWORK) — orientation vertical|horizontal + entrée conditionnelle + numérotation dynamique
    onboarding-live-preview.tsx (NEW) — aperçu vivant, contenu par étape (variant rail|accordion)
    profile-import-panel.tsx    (NEW) — bandeau d'import optionnel (CV + LinkedIn + dialog), extrait de profile-import-step
    profile-summary-card.tsx    (DELETE) — remplacée par onboarding-live-preview
```

Routing inchangé (`app-routing-setup.tsx` : route `/onboarding` protégée, sans layout). Le shell de l'onboarding est plein écran et autonome (ne passe pas par le SimexShell).

## Détail par composant

### 1. `hooks/use-onboarding.ts` (MODIFY)

- `OnboardingStep = 'profil' | 'aptitude-test' | 'diagnostic' | 'choose-path'`.
- `STEP_ORDER = ['profil', 'aptitude-test', 'diagnostic', 'choose-path']`.
- `needsAptitudeTest = questionnaireData?.experienceLevel === 'none'` (inchangé dans son principe).
- `steps` = `STEP_ORDER` filtré (retire `aptitude-test` si `!needsAptitudeTest`) → **étapes actives** (3 ou 4).
- `totalSteps` = `steps.length` (3 ou 4) ; `currentStepIndex` = index dans `steps`.
- `progress` inchangé (basé sur `currentStepIndex / (totalSteps - 1)`).
- Conserver : `goToNext`, `goToBack`, `goToStep`, `markCompleted`, `isStepCompleted`, `questionnaireData`, `setQuestionnaireData`.
- **Numérotation pour le rail** : exposer une liste ordonnée complète (toutes les entrées `STEP_ORDER`) avec, pour chacune, `{ key, isConditional, isActive, displayNumber | null }`. `displayNumber` = position (1-based) dans `steps` actives ; `null` pour l'entrée conditionnelle inactive. Le rail consomme cette liste ; les composants ne recalculent pas la numérotation.

### 2. `config/onboarding.config.ts` (NEW)

Source unique pour l'en-tête de contenu et les libellés, consommée par le shell et le stepper.

```ts
export const STEP_META: Record<OnboardingStep, {
  shortLabel: string;      // libellé court (rail/stepper) : 'Profil', 'Mise en situation', 'Diagnostic', 'Parcours'
  railSubtitle: string;    // sous-titre rail : 'Import + questionnaire', '3 scénarios', 'Analyse IA', 'Secteur + lancement'
  title: string;           // h1 du contenu : 'Parlez-nous de vous', etc.
  lead: string;            // paragraphe d'intro du contenu
  icon: string;            // KeenIcon de l'étape (voir mapping)
}>;
```

Valeurs :
- `profil` — short « Profil », sub « Import + questionnaire », title « Parlez-nous de vous », lead « Quelques informations pour personnaliser votre simulation. Importez votre CV pour gagner du temps, ou répondez directement. », icon `profile-circle`.
- `aptitude-test` — short « Mise en situation », sub « 3 scénarios », title « Mise en situation », lead « Trois situations concrètes de gestion de projet. Il n'y a pas de mauvaise réponse. », icon `notepad`.
- `diagnostic` — short « Diagnostic », sub « Analyse IA », title « Votre diagnostic », lead « Voici ce que notre IA a compris de votre profil. », icon `shield-tick`.
- `choose-path` — short « Parcours », sub « Secteur + lancement », title « Choisissez votre parcours », lead « Le secteur dans lequel vous allez piloter votre première simulation. », icon `route`.

### 3. `pages/onboarding-page.tsx` (REWRITE — orchestrateur)

- Layout responsive : `flex` desktop (rail 300px + contenu `flex-1`), pile verticale mobile (topbar + contenu). Fond `bg-[var(--neutral-0)]` ; le contenu défile, le rail est `sticky`/pleine hauteur.
- Détient l'**état live** : `const [live, setLive] = useState<OnboardingLiveState>({})` (voir §6). Le passe à `onboarding-live-preview` ; passe `setLive` aux étapes qui en ont besoin (`profil`, `aptitude-test`).
- Rend l'**en-tête de contenu** depuis `STEP_META[currentStep]` : pastille `Étape {currentNumber} sur {totalSteps}` (token `--accent-700`), `h1` (Montserrat, `--brand-700`), `lead` (`--neutral-500`). Les bodies d'étape ne répètent pas le titre.
- Conserve l'animation de transition entre étapes (Framer Motion `AnimatePresence mode="wait"`, slide + fade ~250ms, easing `--ease-out`). Respecte `prefers-reduced-motion` (désactive le slide).
- `renderStepBody()` : `profil` → `<ProfilStep/>`, `aptitude-test` → `<AptitudeTestStep/>`, `diagnostic` → `<DiagnosticStep/>`, `choose-path` → `<ChoosePathStep/>`. Les callbacks `onNext/onBack/markCompleted` restent comme aujourd'hui.
- Desktop : `<OnboardingRail/>`. Mobile (`lg:hidden`) : `<OnboardingTopbar/>`.

### 4. `components/onboarding-rail.tsx` (NEW — desktop)

- Conteneur `w-[300px] shrink-0` fond `linear-gradient(165deg, var(--brand-700), var(--brand-900))`, texte clair, `flex flex-col`, `p-6`.
- **Wordmark** : tuile `--accent-500` « S » + « Simex pro » (Montserrat 800).
- **Stepper vertical** : `<OnboardingStepper orientation="vertical" />`.
- **Aperçu vivant** en bas (`mt-auto`) : `<OnboardingLivePreview variant="rail" />`.

### 5. `components/onboarding-topbar.tsx` (NEW — mobile)

- Barre `--brand-700→900`, `p-4`, `sticky top-0 z-20` : ligne wordmark + « Étape X sur N » ; dessous mini-stepper `<OnboardingStepper orientation="horizontal" />`.
- Sous la barre : accordéon `<OnboardingLivePreview variant="accordion" />` (replié par défaut, en-tête « Votre profil · {n}/{total} renseigné », chevron ; ouvre/ferme avec `Collapsible`).

### 6. `components/onboarding-live-preview.tsx` (NEW — aperçu vivant)

Props : `{ profile, currentStep, live, variant: 'rail' | 'accordion' }`.

- `variant="rail"` : carte translucide sur fond sombre (`bg-white/6`, `border-white/12`, `rounded-xl`), titre en `--brand-300`, items clairs.
- `variant="accordion"` : carte claire (`bg-card`) pour le mobile.
- **Contenu par étape** (cartographie) — chaque ligne = pastille d'état (✓ vert `--success-500` / point orange `--accent-500` « en cours » / vide `--neutral`) + libellé :
  - **profil** — titre « Votre profil se construit ». Lignes : CV/LinkedIn (✓ si `profile.cvData`/`linkedinData`, avec « N compétences » si dispo) ; Objectif (depuis `live.questionnaire.objective`) ; Domaine (`live.questionnaire.targetDomain`) ; Expérience (`live.questionnaire.experienceLevel`). État ✓ dès que la valeur est renseignée (live), sinon grisé.
  - **aptitude-test** — titre « Mise en situation ». « Scénario {live.aptitudeProgress.current} / {total} » + badges catégories (Priorisation / Communication / Budget) marqués ✓ au fur et à mesure.
  - **diagnostic** — titre « Analyse IA ». Lignes : « Profil : {PROFILE_TYPE_LABELS[profile.profileType]} » ; « {n} compétences à renforcer » (depuis `profile.skills`) ; « Secteur suggéré : {…} ». Pendant l'analyse : un item « Analyse en cours… » (point orange).
  - **choose-path** — titre « Prêt à démarrer ». Lignes : « Secteur : {label} » (`selectedSector`/custom) ; « Difficulté : {suggestedDifficulty} » ; « Lancement » (point orange).
- Le composant calcule lui-même `done/total` pour l'en-tête mobile.

`OnboardingLiveState` (dans `use-onboarding.ts` ou la config) :
```ts
interface OnboardingLiveState {
  questionnaire?: Partial<QuestionnaireData>;
  aptitudeProgress?: { current: number; total: number; answeredCategories: string[] };
}
```

### 7. `components/onboarding-stepper.tsx` (REWORK)

- Props : `{ items, orientation, onStepClick }` où `items` vient du hook (`{ key, shortLabel, isConditional, isActive, displayNumber, isCurrent, isCompleted }`).
- **Pastille** : terminée = `--success-500` + check ; courante = `--accent-500` + halo `box-shadow 0 0 0 5px rgba(238,122,58,.22)` ; à venir (active) = contour `--brand` clair sur fond translucide (rail) ; **conditionnelle inactive** = pastille en **pointillé `--accent-300`** avec ★ et pill « si débutant », non cliquable.
- `orientation="vertical"` : colonne, connecteurs verticaux ; terminé = trait `--success-500`.
- `orientation="horizontal"` : mini pastilles + barres (mobile), pas de libellés (place).
- Clic autorisé uniquement sur les étapes actives terminées/courantes (comportement actuel de `goToStep`).
- Accessibilité conservée : `nav[aria-label]`, `role="button"`, `aria-current="step"`, focus visible, navigation clavier.

### 8. `pages/profil-step.tsx` (NEW — étape fusionnée)

Body de l'étape 1 (pas de h1, fourni par le shell).

- En tête de body : `<ProfileImportPanel/>` — bandeau d'import **optionnel** (voir §9).
- Puis le **questionnaire** (react-hook-form + zod, schéma identique à l'actuel) avec une présentation **en cartes sélectionnables** :
  - **Objectif** (`objective`) : 3 cartes (Renforcer / Reconversion / Découverte), icône + libellé, sélection = bordure/fond `--accent` (`RadioGroup` accessible sous-jacent).
  - **Expérience** (`experienceLevel`) : 3 cartes (Aucune / Débutant (< 2 ans) / Confirmé (2 ans +)).
  - **Domaine** (`targetDomain`) : `Select` (liste `DOMAINS`).
  - **Motivation** (`mainMotivation`) : `Textarea`.
- Sur changement de champ : `onLiveChange({ questionnaire: form.watch() })` (alimente l'aperçu vivant en direct).
- Bouton primaire « Continuer » : `useSubmitQuestionnaire` → `setQuestionnaireData` → `markCompleted('profil')` → `goToNext`. Lien discret « Passer l'import » non nécessaire (l'import est optionnel et inline) ; conserver un secondaire si utile.
- Les cartes Objectif/Expérience utilisent `RadioGroup`/`RadioGroupItem` (a11y) stylés en cartes — pas de `div` cliquable seule.

### 9. `components/profile-import-panel.tsx` (NEW — extrait/redesign de profile-import-step)

- Présentation **bandeau optionnel** : conteneur `bg-[var(--brand-50)]` `border-[var(--brand-100)]` `rounded-xl`, icône `file-up`, titre « Accélérez le profilage » + badge « Optionnel », sous-texte, et deux actions compactes : « LinkedIn » (`linkedin`, ouvre le `Dialog` existant) et « CV (PDF) » (`file-up`, déclenche l'input fichier + drag&drop).
- Conserve **toute la logique existante** : `useUploadCv`, `useImportLinkedin`, validation PDF (type + 5 Mo), dialog LinkedIn + validation d'URL, toasts, états de chargement (spinner + progress), badges « importé ».
- Sur import réussi, le résultat est reflété par l'aperçu vivant (via `profile` rafraîchi) — pas de carte « données extraites » séparée (l'info vit dans l'aperçu).

### 10. `pages/aptitude-test-step.tsx` / `diagnostic-step.tsx` / `choose-path-step.tsx` (RESTYLE)

- Retirer le `h2`/titre centré propre à chaque étape (fourni par le shell) et le wrapper de header centré.
- Aligner sur les tokens de marque : remplacer les `primary` structurels par `--brand-*` (cartes, barres, halos) ; garder `--accent-*` uniquement pour les boutons primaires et l'état sélectionné. Exemple `diagnostic` : `bg-primary/5 border-primary/10` → `bg-[var(--brand-50)] border-[var(--brand-100)]` ; `aptitude` cartes d'option sélectionnées déjà en `primary` → `--accent` (cohérent avec l'état actif).
- Conserver intégralement la logique (sous-états intro/in-progress/résultats de l'aptitude ; loading/skeleton du diagnostic ; sélection secteur + dialog projet custom + `useCompleteOnboarding` → `navigate('/simulations')`).
- `aptitude-test` : reporter la progression via `onLiveChange({ aptitudeProgress: { current, total, answeredCategories } })`.
- Les boutons de navigation bas de page (Retour / Continuer) restent dans les bodies, alignés `--accent` pour le primaire.

## Mapping emoji → KeenIcon (icônes vérifiées présentes dans `icons.ts`)

Les emojis des maquettes ne sont que des repères. En implémentation, utiliser `KeenIcon` :
- Objectif **Renforcer** → `rocket`
- Objectif **Reconversion** → `arrows-circle`
- Objectif **Découverte** → `route`
- Expérience **Aucune** → `book-open`
- Expérience **Débutant** → `graph-up`
- Expérience **Confirmé** → `award`
- Import **CV** → `file-up` · Import **LinkedIn** → `linkedin`
- Aperçu vivant « Votre profil » → `profile-circle`
- Domaine → `element-11` · Diagnostic → `shield-tick` · Parcours → `route`

(Si un nom évolue, vérifier dans `apps/webapp/src/components/keenicons/icons.ts` avant usage.)

## États à couvrir

- **Étape Profil** : import vide / en cours / importé (CV et/ou LinkedIn) ; questionnaire partiel/complet ; erreurs de validation (zod) ; aperçu vivant qui se coche en direct.
- **Mise en situation** : intro → scénario en cours (1..3) → résultats ; visible uniquement si débutant ; aperçu = progression.
- **Diagnostic** : chargement (skeleton) → diagnostic ; mode personnalisation des compétences (existant).
- **Parcours** : aucun secteur choisi (CTA désactivé + aide) → secteur choisi / projet custom soumis → finalisation (`isPending`).
- **Compteur** : « sur 3 » → « sur 4 » au choix « Aucune expérience » (révélation de l'entrée conditionnelle, renumérotation fluide).
- **Responsive** : desktop (rail) ↔ mobile (topbar + accordéon) ; `prefers-reduced-motion`.
- **Navigation** : retour/avance, clic sur étape terminée, pas de saut vers une étape non atteinte.

## Tokens & contraintes

- Palette : `--brand-*` (Deep Blue) pour structure/navigation/rail ; `--accent-*` (Warm Orange) réservé aux actions primaires + état sélectionné/courant ; `--success-500` pour terminé ; neutres `--neutral-*`.
- Typo : `--font-display` (Montserrat) pour titres/wordmark, `--font-body` (Inter) pour le corps.
- Composants du design system uniquement (Radix + CVA, `KeenIcon`, Tailwind v4) ; pas de CSS inline (sauf gradients/halos via classes arbitraires Tailwind `bg-[...]`), pas de nouvelle lib. Animations via Framer Motion (déjà présent).
- Responsive **obligatoire**, mobile-first. Cibles tactiles ≥ 44px. Contraste AA.
- UI en français avec accents complets ; code/commits en anglais.

## Hors périmètre

- Backend / endpoints / prompts IA / schéma Prisma : inchangés.
- Logique de profilage, mutations, calcul des scores et du diagnostic : inchangés.
- Le SimexShell et les autres pages : inchangés (l'onboarding reste un shell autonome plein écran).
- Tests automatisés frontend : le webapp n'a pas de runner de tests front ; vérification par typecheck + navigateur (Playwright).
