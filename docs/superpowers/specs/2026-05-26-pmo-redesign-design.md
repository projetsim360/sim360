# Spec design — Redesign de l'agent PMO

- **Date** : 2026-05-26
- **Périmètre** : panel global de l'agent PMO dans le `SimexShell` (onglets Chat + Contexte)
- **Statut** : design validé, prêt pour le plan d'implémentation

## Contexte & intention

Le panel PMO est fonctionnel (vrai streaming, contexte riche, sélecteur de simulation) mais l'expérience de première interaction intimide : message d'accueil en mur de texte + champ vide, sans rampe d'accès. Le rapport de test l'a confirmé (« le chat ne fonctionne pas très bien », « je ne sais pas par où passer »). Le langage visuel n'est pas non plus tout à fait aligné sur la marque (onglet actif bleu vs accent orange).

**Objectif** : rendre le PMO immédiatement utilisable et lisible (meilleure UX + hiérarchie visuelle), sans refonte du back ni du flux de données. Le socle (composants `PmoChat`, `PmoContextPanel`, streaming, résolution de simulation active) reste en place.

## Décisions de design (validées via le visual companion)

1. **Amorce du Chat — direction A** : carte de bienvenue structurée + actions guidées.
2. **KPIs du Contexte — direction A** : tuiles 2 colonnes (gros chiffre + barre de progression).
3. **Sélecteur de simulation — position B** : intégré au header (pastille à droite du titre), plus de ligne dédiée.

## Détail par composant

### 1. `apps/webapp/src/components/layouts/simex-shell/components/pmo-panel.tsx`

- **Sélecteur déplacé dans le header (position B)** : supprimer la ligne dédiée `sel-wrap` sous les onglets. Afficher une pastille déroulante compacte à droite du titre « Agent PMO » (avant le bouton fermer). Le libellé de la pastille = `project.name` (ou `scenario.title` à défaut), **tronqué par ellipsis** (largeur max ~140px) ; le nom complet + statut apparaissent dans l'info-bulle (`title`) et dans chaque option du menu déroulant. Ne s'affiche que si > 1 simulation active (sinon rien, comme aujourd'hui).
- **Couleur des onglets** : l'onglet actif passe du bleu générique `info-50` au **bleu marque** `bg-brand-50` / `text-brand-700` (alignement sur le token de marque). Le orange (`accent-500`) reste réservé aux actions primaires (bouton envoi).
- **Header informatif** : le sous-titre affiche la phase réelle quand une simulation est active (ex. « Phase X · Nom de phase »), au lieu de « contexte chargé ». Quand aucune simulation : « Aucune simulation active » (déjà en place). La phase vient de `context.simulation.currentPhaseOrder` / `context.currentPhase.name`.
- **Logique de sélection inchangée** : `activeSimulations` (IN_PROGRESS + ACTIVE + ONBOARDING), résolution auto + override par le sélecteur, empty-state si aucune.

### 2. `apps/webapp/src/features/pmo/components/pmo-chat.tsx` — amorce (direction A)

État « démarrage de conversation » (quand l'historique est vide, après init) :

- **Carte de bienvenue** : avatar, salutation (« Bonjour {prénom} »), une phrase de rôle, bandeau contexte projet (`scenarioInfo` : nom · secteur), objectifs en badges marque. (S'appuie sur `scenarioInfo` déjà passé en prop ; aujourd'hui partiellement rendu — le faire émerger systématiquement en tête.)
- **Section « Pour démarrer »** : 3-4 quick-reply chips cliquables, chacun avec une icône colorée (état projet / livrable / décision / risques). Au clic, le chip **pré-remplit et envoie** le message correspondant (réutilise `handleSend`).
- Les quick-replies disparaissent dès qu'un échange a eu lieu (uniquement en tête de conversation).
- **Input** : placeholder corrigé « Posez votre question à l'agent PMO… » (accent).
- Conserver : streaming, bulles, markdown, blocs de code, vocal.

Les libellés/amorces des chips sont génériques et contextualisés (pas de dépendance à de nouvelles données back).

### 3. `apps/webapp/src/features/pmo/components/pmo-context-panel.tsx` — hiérarchie (direction A)

- **KPIs en tuiles** : grille 2 colonnes. Chaque tuile = libellé (xs) + valeur en gros (couleur selon seuil existant `kpiColor`) + mini barre de progression. Le risque sur pleine largeur. Remplace la liste plate actuelle.
- **Carte Phase** : corriger l'icône qui ne se rend pas (zone blanche) — vérifier le rendu de l'icône dans le bloc `bg-brand-500`.
- **Hiérarchie** : Phase → KPIs (bloc dominant) → Livrables en attente → Livrables soumis → Décisions → Adaptation (secondaire). Conserver les sections existantes et leur logique ; ajuster seulement le poids visuel.
- **Orthographe FR** : `KPI_CONFIG` — « Delais » → « Délais », « Qualite » → « Qualité ».

### 4. `apps/webapp/src/features/pmo/components/pmo-message-bubble.tsx`

- Aucun changement structurel requis. (Optionnel : vérifier l'ancrage de l'avatar bot en tête de conversation.)

## États à couvrir

- **Aucune simulation active** : empty-state existant (inchangé).
- **Conversation vide / au démarrage** : carte de bienvenue + quick-replies (nouveau).
- **Conversation en cours** : bulles + input, pas de quick-replies ni carte de bienvenue.
- **Chargement** : spinner existant (historique/contexte).
- **Streaming** : bulle de streaming avec curseur (existant).
- **> 1 simulation active** : pastille sélecteur dans le header ; sinon masquée.

## Hors périmètre

- Backend / endpoints / prompts IA : inchangés.
- Flux de données, résolution de simulation, streaming : inchangés.
- Badge de compteur d'actions et tooltip d'accueil de l'ancien `PmoFab` : non réintroduits (décision antérieure).
- Suppression du fichier `pmo-fab.tsx` (déjà démonté) : hors périmètre.

## Tokens & contraintes

- Palette : `--brand-*` (Deep Blue), `--accent-*` (Warm Orange), `primary = accent-500`.
- Composants UI du design system uniquement (Radix + CVA), `KeenIcon`, Tailwind v4. Pas de CSS inline, pas de nouvelle lib.
- Responsive : le panel fonctionne en overlay mobile et panneau latéral desktop (comportement existant conservé).
