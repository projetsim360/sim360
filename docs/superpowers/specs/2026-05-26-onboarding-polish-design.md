# Spec design — Onboarding itération 2 (redesigns d'étapes + animations)

- **Date** : 2026-05-26
- **Périmètre** : étapes Mise en situation, Diagnostic, Parcours de `/onboarding` ; redondance Domaine/Secteur ; système d'animations ; barres de progression animées **app-wide**
- **Branche** : `feat/onboarding-redesign`
- **Statut** : design validé via le compagnon visuel, prêt pour le plan d'implémentation
- **Spec précédent** : `docs/superpowers/specs/2026-05-26-onboarding-redesign-design.md` (itération 1 — shell rail, parcours 3 temps, aperçu vivant). Cette itération 2 affine les étapes restantes et ajoute le mouvement.

## Contexte & intention

L'itération 1 a posé le shell (rail marque, parcours en 3 temps, aperçu vivant, étape Profil). Restent trois étapes au visuel encore « plat » (Mise en situation, Diagnostic, Parcours), une redondance perçue entre le « Domaine » demandé au Profil et le « Secteur » demandé au Parcours, et un manque général de mouvement. Objectif : rendre ces trois étapes aussi soignées que le Profil, lever la redondance, et introduire des animations cohérentes (dont des barres de progression animées dans **toute** l'application).

## Décisions de design (validées via le compagnon visuel)

1. **Redondance Domaine/Secteur — pré-remplir + reformuler** : au Parcours, le secteur arrive **pré-sélectionné** depuis `selectedSector ?? suggestedSector ?? questionnaireData.targetDomain` (valeurs identiques entre DOMAINS et SECTORS). Reformulation : « Secteur de votre simulation » + note « Basé sur votre domaine et l'analyse IA — modifiable ». La grille de cartes secteur actuelle est **conservée** (appréciée). Aucun changement back.
2. **Mise en situation (intro) redesignée** : annonce claire de ce qui est évalué (3 cartes catégories) + bandeau « comment ça marche ». Les 3 scénarios (questions) restent inchangés.
3. **Diagnostic (résultat) redesigné** : « verdict » héros (type de profil mis en avant + message IA + difficulté suggérée), puis visualisation d'écart de compétences (niveau actuel → cible). État de chargement : animation « IA en réflexion » au lieu du skeleton statique.
4. **Parcours redesigné en « rampe de lancement »** : bandeau récap du parcours, secteur reformulé + pré-sélectionné (grille conservée), projet personnalisé présenté comme alternative, CTA de lancement renforcé.
5. **Animations** (4 familles) : (a) **entrées échelonnées** (stagger) des cartes/sections à l'arrivée sur une étape ; (b) **micro-interactions** sur les cartes (survol = légère élévation, sélection = léger scale) ; (c) **états de succès animés** (check qui se dessine, barres qui se remplissent) ; (d) **« Analyse IA » vivante** (diagnostic en chargement). Toutes respectent `prefers-reduced-motion`.
6. **Barres de progression animées — app-wide** : le composant partagé `Progress` anime le remplissage depuis 0 au montage, partout dans l'application (pas seulement l'onboarding).

## Détail par unité

### 1. `components/ui/progress.tsx` (MODIFY — app-wide)

- L'indicateur démarre à 0 et transitionne vers `value` après montage (via état interne + `requestAnimationFrame`), de sorte que **chaque** `Progress` de l'app anime son remplissage à l'apparition.
- Transition appliquée sur le `transform` (durée ~700ms, easing sortant). `motion-reduce:transition-none` pour respecter `prefers-reduced-motion` (rendu instantané).
- Aucune signature/prop modifiée : transparent pour tous les appelants existants (aptitude, diagnostic, dashboard, etc.).
- `ProgressCircle`/`ProgressRadial` : hors périmètre (déjà `transition-all`), ne pas toucher.

### 2. `lib/motion.ts` (NEW — presets réutilisables)

Petites variantes Framer Motion partagées, pour cohérence :
- `staggerContainer` : `{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } } }`.
- `staggerItem` : `{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16,1,0.3,1] } } }`.
- `cardHover` : presets pour `whileHover={{ y: -2 }}` / `whileTap={{ scale: 0.98 }}` (exportés comme constantes).
- Les composants qui les utilisent passent `initial="hidden" animate="show"` sur un conteneur `motion.div` + `variants={staggerItem}` sur chaque enfant `motion.*`.
- Respect de `prefers-reduced-motion` : via `useReducedMotion()` de framer-motion, les consommateurs passent `initial={reduce ? false : 'hidden'}` (les variantes restent inertes si réduit).

### 3. `pages/aptitude-test-step.tsx` (REDESIGN intro)

- **Écran intro** (`!isStarted`) : remplacer la carte centrée unique par :
  - Label « Ce que nous allons évaluer ».
  - **3 cartes catégories** (Priorisation / Communication / Gestion budgétaire) — icône `KeenIcon` (`sort`, `people`, `chart-simple`), titre, mini-description, numéro discret. Conteneur en `staggerContainer`, chaque carte en `staggerItem` + `whileHover` (élévation).
  - **Bandeau « comment ça marche »** : « 3 scénarios · environ 5 min · aucune mauvaise réponse » (icônes + texte).
  - Boutons Retour / Commencer (inchangés fonctionnellement).
- **Écrans en cours et résultats** : inchangés fonctionnellement ; le compteur « Scénario X sur N » et les cartes d'option restent. (Les `Progress` y bénéficient de l'animation app-wide.)
- Les libellés de catégories et le contenu des scénarios sont déjà accentués (itération précédente).

### 4. `pages/diagnostic-step.tsx` (REDESIGN résultat + chargement)

- **État de chargement** (`isProfileLoading || isAnalyzing`) : remplacer le skeleton statique par une carte « IA en réflexion » — avatar/halo pulsant (réutiliser le motif du point pulsant : `animate-pulse` + halo), libellé « Analyse de votre profil… », et 2-3 lignes squelette qui se révèlent (shimmer léger). Respecte reduced-motion (pulsation désactivée → état statique).
- **État résultat** :
  - **Verdict héros** : carte pleine largeur, fond dégradé marque (`--brand-700 → --brand-500`), texte clair. Contient : label « Profil détecté par l'IA », **type de profil** en grand (`PROFILE_TYPE_LABELS[profileType]`, Montserrat), le `personalizedMessage`, et une pastille accent « Difficulté suggérée : {suggestedDifficulty} ». Apparition en fondu + léger scale (`staggerItem`/pop).
  - **Compétences à développer** : pour chaque `skill` (name, currentLevel, targetLevel, gap), une **piste** : libellé + « {currentLevel} → {targetLevel} », et une barre à deux segments — segment « niveau actuel » (`--brand-600`, largeur = niveau actuel en %) + segment « écart à combler » (hachuré `--accent-200/100`, du niveau actuel au niveau cible). Mapping niveaux→% : `none:0, basic:33, intermediate:66, advanced:100`. Le remplissage **s'anime** (largeur de 0 → cible, stagger entre compétences). Légende (Niveau actuel / Écart à combler).
    - Ce segment-barre est un composant dédié `components/skill-delta-bar.tsx` (props : `currentLevel: SkillLevel`, `targetLevel: SkillLevel`, `index?: number` pour le délai de stagger), réutilisable et testable isolément.
  - **Personnaliser** : conserver le mode édition existant (`SkillEditor`) — bouton « Personnaliser » ; logique inchangée. (En mode personnalisation, on peut garder l'affichage liste actuel ou les pistes — au plus simple, garder le `SkillEditor` tel quel.)
  - Boutons Retour / « Accepter et continuer » inchangés.
- Tokens marque (déjà partiellement fait en itération 1). Le héros utilise le dégradé marque ; l'accent reste pour la pastille difficulté + CTA.

### 5. `pages/choose-path-step.tsx` (REDESIGN « rampe de lancement ») + `components/sector-selector.tsx`

- **Pré-remplissage** : `selectedSector` initial = `profile.selectedSector ?? profile.suggestedSector ?? profile.questionnaireData?.targetDomain ?? ''`. (Aujourd'hui : `selectedSector ?? suggestedSector`. Ajouter le `targetDomain` en dernier recours.) `useProfile` renvoie la ligne complète, donc `questionnaireData.targetDomain` est disponible.
- **Bandeau récap** en tête : chips lecture seule reliant le parcours — « Profil : {PROFILE_TYPE_LABELS[profileType]} », « Difficulté : {suggestedDifficulty} », « {n} compétences ciblées ». (Données issues de `profile.diagnosticData`/`skills`. N'afficher que les chips dont la donnée existe.)
- **Section secteur reformulée** : titre « Secteur de votre simulation » + note « Basé sur votre domaine et l'analyse IA — modifiable ». La grille `SectorSelector` est **conservée**. `SectorSelector` : aligner légèrement (entrées échelonnées sur les cartes + `whileHover` élévation), garder le badge « Suggéré par l'IA » (orthographe → « Suggéré par l'IA » avec accent) et la sélection accent. Pas de refonte de la grille.
- **Projet personnalisé** : présenté comme **alternative** après un séparateur « ou » — carte/bandeau en pointillé « Proposer un projet personnalisé » + bouton ouvrant le `Dialog` existant (logique inchangée). La preview de projet soumis reste.
- **CTA de lancement renforcé** : « Lancer ma simulation » (taille/poids accrus), logique `useCompleteOnboarding` → `navigate('/simulations')` inchangée. Garder le message d'aide si aucun secteur/projet.
- **Indicateur de difficulté** : intégré au bandeau récap (plus de carte « Difficulté suggérée » séparée).

### 6. `pages/profil-step.tsx` (animation seulement)

- Appliquer `staggerContainer`/`staggerItem` aux groupes (bandeau import, blocs de questions) et `whileHover`/`whileTap` aux `OptionCard`. Aucun changement de logique/structure de formulaire.

### 7. Aperçu vivant & succès (transverse)

- Les « done » de l'aperçu vivant (check vert) peuvent bénéficier d'un léger pop à l'apparition (optionnel, via `staggerItem`). Les badges catégories qui se cochent (Mise en situation) idem. Garder sobre.

## États à couvrir

- **Mise en situation** : intro redesignée (stagger) → scénarios (inchangés) → résultats (inchangés). Reduced-motion : pas de stagger/hover.
- **Diagnostic** : chargement animé (IA en réflexion) → résultat (héros + pistes animées) ; mode personnalisation (SkillEditor) ; reduced-motion : barres/halo statiques.
- **Parcours** : récap (chips présentes selon données) ; secteur pré-sélectionné (badge Suggéré) ; projet personnalisé (dialog) ; preview projet soumis ; CTA désactivé si rien de sélectionné.
- **Progress (app-wide)** : remplissage animé au montage ; instantané sous reduced-motion.

## Tokens & contraintes

- Palette `--brand-*` / `--accent-*` (action/sélection), `--success-500`, neutres. Montserrat titres / Inter corps.
- Composants du design system uniquement (Radix + CVA, `KeenIcon`, Tailwind v4). Framer Motion pour le mouvement (déjà présent). Pas de CSS inline (sauf dégradés/hachures via classes arbitraires ou style ponctuel déjà toléré), pas de nouvelle lib.
- Responsive **obligatoire** (les redesigns s'adaptent : cartes catégories/secteur passent en colonnes sur mobile ; le héros et le récap se replient). Cibles tactiles ≥ 44px. Contraste AA.
- UI en français avec accents complets ; code/commits en anglais.
- Toutes les animations respectent `prefers-reduced-motion`.

## Hors périmètre

- Backend / endpoints / prompts IA / schéma Prisma : inchangés.
- Logique de profilage, mutations, scoring, complétion d'onboarding : inchangées.
- Les 3 scénarios du test d'aptitude (questions/options) : inchangés.
- Le shell (rail/topbar/stepper/aperçu vivant) et l'étape Profil (structure) : inchangés (Profil reçoit seulement la couche d'animation).
- Sweep d'animation explicite sur toutes les autres pages de l'app : hors périmètre. Seul `Progress` devient animé app-wide (effet automatique sur les pages existantes) ; `lib/motion.ts` est disponible pour réutilisation future sans l'imposer ailleurs maintenant.
- Tests automatisés frontend : pas de runner ; vérification par typecheck + navigateur (voir mémoire `frontend-verification`).
