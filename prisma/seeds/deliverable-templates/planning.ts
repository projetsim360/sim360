import type { DeliverableTemplateData } from './types';

export const planningTemplates: DeliverableTemplateData[] = [
  // ─── 01. Plan de Management de Projet ─────────────────────
  {
    id: 'seed-tpl-project-management-plan',
    title: 'Plan de Management de Projet',
    type: 'project-management-plan',
    phase: 'PLANNING',
    description:
      "Document central décrivant la stratégie globale de gestion du projet. Intégré les plans subsidiaires et définit les processus de pilotage.",
    pmiProcess: '4.2',
    difficulty: 'ADVANCED',
    content: `# Plan de Management de Projet

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Code** | {{projectCode}} |
| **Chef de projet** | {{userName}} |
| **Date** | {{currentDate}} |
| **Secteur** | {{sector}} |

---

## Historique des versions

| Version | Auteur | Description | Date |
|---|---|---|---|
| 1.0 | {{userName}} | Création initiale | {{currentDate}} |

---

## 1. Introduction

### 1.1 Objet du document
Ce document constitue le plan de management du projet "{{projectName}}". Il définit la stratégie globale de gestion et les processus de pilotage.

### 1.2 Contexte du projet
> {{projectDescription}}

### 1.3 Références
- Charte de projet approuvée
- Registre des parties prenantes
- Contrat client : {{clientName}}

## 2. Périmètre du projet

### 2.1 Énoncé du périmètre
[Décrivez le périmètre inclus et exclu du projet.]

### 2.2 Livrables principaux
| # | Livrable | Phase | Date prévue |
|---|---|---|---|
| 1 | [À compléter] | Initiation | [À compléter] |
| 2 | [À compléter] | Planification | [À compléter] |
| 3 | [À compléter] | Exécution | [À compléter] |

### 2.3 Exclusions
[Listez ce qui est explicitement hors périmètre.]

## 3. Organisation du projet

### 3.1 Structure organisationnelle
[Décrivez l'organigramme du projet et les rôles clés.]

### 3.2 Équipe projet
{{teamMembers}}

### 3.3 Matrice RACI résumée
| Activité | Chef de projet | Sponsor | Équipe | Client |
|---|---|---|---|---|
| Validation périmètre | R | A | C | I |
| Planification | R/A | I | C | I |
| Exécution | R | I | A | I |
| Reporting | R/A | I | C | I |

## 4. Plans subsidiaires

### 4.1 Gestion du périmètre
[Processus de gestion des changements de périmètre.]

### 4.2 Gestion de l'échéancier
- Délai global : {{deadlineDays}} jours
- Méthode de planification : [Chemin critique / Agile]
- Fréquence de mise à jour : [Hebdomadaire]

### 4.3 Gestion des coûts
- Budget initial : {{initialBudget}}
- Méthode de suivi : Earned Value Management (EVM)
- Seuils d'alerte : CPI/SPI < 0.9

### 4.4 Gestion de la qualité
[Processus d'assurance et de contrôle qualité.]

### 4.5 Gestion des ressources
[Stratégie d'allocation et de gestion des ressources.]

### 4.6 Gestion de la communication
[Plan de communication synthétique.]

### 4.7 Gestion des risques
[Stratégie de gestion des risques.]

### 4.8 Gestion des approvisionnements
[Stratégie d'achat si applicable.]

## 5. Processus de pilotage

### 5.1 Suivi et contrôle
| Activité | Fréquence | Responsable | Participants |
|---|---|---|---|
| Comité de pilotage | [À compléter] | {{sponsorName}} | Direction |
| Revue de projet | [À compléter] | {{userName}} | Équipe |
| Point d'avancement | [À compléter] | {{userName}} | Équipe |

### 5.2 Gestion des changements
[Processus de demande, évaluation et approbation des changements.]

### 5.3 Critères de succès
[Définissez les KPIs et critères de succès du projet.]

## 6. Approbation

| Nom | Rôle | Signature | Date |
|---|---|---|---|
| {{userName}} | Chef de projet | | {{currentDate}} |
| {{sponsorName}} | Sponsor | | |
| {{clientName}} | Client | | |
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'completeness',
          name: 'Complétude',
          weight: 30,
          criteria: [
            { label: 'Plans subsidiaires', description: 'Tous les plans subsidiaires sont identifiés et décrits', maxPoints: 15 },
            { label: 'Processus de pilotage', description: 'Les processus de suivi et contrôle sont définis', maxPoints: 15 },
          ],
        },
        {
          id: 'coherence',
          name: 'Cohérence',
          weight: 25,
          criteria: [
            { label: 'Alignement objectifs', description: 'Le plan est aligné avec la charte et les objectifs', maxPoints: 15 },
            { label: 'Intégration', description: 'Les plans subsidiaires sont cohérents entre eux', maxPoints: 10 },
          ],
        },
        {
          id: 'quality',
          name: 'Qualité rédactionnelle',
          weight: 20,
          criteria: [
            { label: 'Clarté', description: 'Le document est clair et compréhensible', maxPoints: 10 },
            { label: 'Professionnalisme', description: 'Le ton et le format sont professionnels', maxPoints: 10 },
          ],
        },
        {
          id: 'applicability',
          name: 'Applicabilité',
          weight: 25,
          criteria: [
            { label: 'Réalisme', description: 'Les processus sont réalistes et applicables', maxPoints: 15 },
            { label: 'Mesurabilité', description: 'Les indicateurs sont mesurables', maxPoints: 10 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['Plan de management de projet', 'Plans subsidiaires'],
    },
    referenceExample: `# Plan de Management de Projet — Exemple

## Périmètre : Migration ERP SAP pour TechCorp
- 3 modules : Finance, RH, Supply Chain
- Exclusions : personnalisations legacy, formation utilisateurs finaux (sous-traite)

## Organisation : Équipe de 8 personnes, structure matricielle
## Budget : 450 000 EUR, suivi EVM mensuel, seuil alerte CPI < 0.9
## Échéancier : 180 jours, jalons mensuels, chemin critique sur intégration
## Qualité : Revues de code hebdomadaires, tests de non-régression automatisés
## Risques : Revue bi-mensuelle, 5 risques critiques identifiés
## Communication : COPIL mensuel, daily standup, newsletter bi-mensuelle
`,
  },

  // ─── 02. Structure de Decoupage du Travail (WBS) ──────────
  {
    id: 'seed-tpl-wbs',
    title: 'Structure de Découpage du Travail (WBS)',
    type: 'wbs',
    phase: 'PLANNING',
    description:
      "Décomposition hiérarchique du travail du projet en lots et tâches élémentaires. Base de l'estimation et de la planification.",
    pmiProcess: '5.4',
    difficulty: 'STANDARD',
    content: `# Structure de Découpage du Travail (WBS)

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Code** | {{projectCode}} |
| **Chef de projet** | {{userName}} |
| **Date** | {{currentDate}} |

---

## 1. Règles de décomposition

- Règle des 100% : chaque niveau couvre 100% du travail du niveau supérieur
- Profondeur maximale : 4 niveaux
- Lots de travail : durée maximale de 2 semaines

## 2. WBS hiérarchique

### Niveau 0 : {{projectName}}

#### 1. Phase Initiation
- 1.1 Étude d'opportunité
- 1.2 Charte de projet
- 1.3 Registre des parties prenantes
- 1.4 Réunion de lancement

#### 2. Phase Planification
- 2.1 Plan de management
- 2.2 WBS et dictionnaire
- 2.3 Échéancier
- 2.4 Budget
- 2.5 Plan de communication
- 2.6 Plan de gestion des risques

#### 3. Phase Exécution
- 3.1 [À compléter — lot technique 1]
  - 3.1.1 [Tâche]
  - 3.1.2 [Tâche]
- 3.2 [À compléter — lot technique 2]
  - 3.2.1 [Tâche]
  - 3.2.2 [Tâche]
- 3.3 [À compléter — lot technique 3]

#### 4. Phase Suivi & Contrôle
- 4.1 Rapports d'avancement
- 4.2 Suivi budgétaire
- 4.3 Gestion des changements

#### 5. Phase Clôture
- 5.1 PV de réception
- 5.2 Bilan projet
- 5.3 Retour d'expérience

## 3. Dictionnaire du WBS

| Code WBS | Lot de travail | Description | Responsable | Estimation (j/h) | Livrable |
|---|---|---|---|---|---|
| 1.1 | Étude d'opportunité | Analyse de faisabilité et justification | {{userName}} | [À compléter] | Business case |
| 1.2 | Charte de projet | Document fondateur | {{userName}} | [À compléter] | Charte signée |
| 3.1 | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] |

## 4. Approbation

| Nom | Rôle | Date |
|---|---|---|
| {{userName}} | Chef de projet | {{currentDate}} |
| {{sponsorName}} | Sponsor | |
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'structure',
          name: 'Structure hiérarchique',
          weight: 35,
          criteria: [
            { label: 'Règle des 100%', description: 'Chaque niveau couvre 100% du travail', maxPoints: 15 },
            { label: 'Granularité', description: 'Décomposition suffisante en lots de travail', maxPoints: 10 },
            { label: 'Cohérence des niveaux', description: 'Les niveaux sont homogènes', maxPoints: 10 },
          ],
        },
        {
          id: 'dictionary',
          name: 'Dictionnaire WBS',
          weight: 30,
          criteria: [
            { label: 'Description des lots', description: 'Chaque lot est clairement décrit', maxPoints: 15 },
            { label: 'Estimations', description: 'Estimations de charge présentés', maxPoints: 15 },
          ],
        },
        {
          id: 'coverage',
          name: 'Couverture',
          weight: 35,
          criteria: [
            { label: 'Phases couvertes', description: 'Toutes les phases du projet sont présentés', maxPoints: 20 },
            { label: 'Livrables identifiés', description: 'Chaque lot produit un livrable identifié', maxPoints: 15 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['WBS', 'Dictionnaire du WBS'],
    },
    referenceExample: `# WBS — Exemple Migration ERP
## 1. Initiation (4 lots, 15 j/h)
## 2. Planification (6 lots, 25 j/h)
## 3. Exécution
  3.1 Module Finance (3 sous-lots, 80 j/h)
  3.2 Module RH (3 sous-lots, 60 j/h)
  3.3 Module Supply Chain (4 sous-lots, 90 j/h)
  3.4 Intégration (2 sous-lots, 40 j/h)
## 4. Suivi (3 lots, 20 j/h)
## 5. Clôture (3 lots, 10 j/h)
Total : 340 j/h, 22 lots de travail
`,
  },

  // ─── 03. Echeancier / Planning ────────────────────────────
  {
    id: 'seed-tpl-schedule',
    title: 'Échéancier du Projet',
    type: 'schedule',
    phase: 'PLANNING',
    description:
      "Chronogramme détaillé avec jalons, dépendances et chemin critique. Outil central de pilotage temporel du projet.",
    pmiProcess: '6.5',
    difficulty: 'STANDARD',
    content: `# Échéancier du Projet

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Code** | {{projectCode}} |
| **Chef de projet** | {{userName}} |
| **Date de début** | {{currentDate}} |
| **Durée prévue** | {{deadlineDays}} jours |

---

## 1. Jalons du projet

| # | Jalon | Date prévue | Critère de validation |
|---|---|---|---|
| J1 | Lancement officiel | [À compléter] | Charte approuvée |
| J2 | Fin planification | [À compléter] | Plans valides |
| J3 | Livraison intermédiaire | [À compléter] | [À compléter] |
| J4 | Recette finale | [À compléter] | PV signe |
| J5 | Clôture projet | [À compléter] | Bilan approuvé |

## 2. Planning détaillé

### Phase 1 : Initiation (Semaines 1-2)
| Tâche | Durée | Début | Fin | Prédécesseur | Responsable |
|---|---|---|---|---|---|
| Étude d'opportunité | 3j | [À compléter] | [À compléter] | - | {{userName}} |
| Charte de projet | 2j | [À compléter] | [À compléter] | 1 | {{userName}} |
| Réunion lancement | 1j | [À compléter] | [À compléter] | 2 | {{userName}} |

### Phase 2 : Planification (Semaines 3-5)
| Tâche | Durée | Début | Fin | Prédécesseur | Responsable |
|---|---|---|---|---|---|
| WBS | 3j | [À compléter] | [À compléter] | J1 | {{userName}} |
| Estimation coûts | 2j | [À compléter] | [À compléter] | WBS | {{userName}} |
| Plan risques | 2j | [À compléter] | [À compléter] | WBS | [À compléter] |

### Phase 3 : Exécution (Semaines 6-N)
| Tâche | Durée | Début | Fin | Prédécesseur | Responsable |
|---|---|---|---|---|---|
| [À compléter] | [À compléter] | [À compléter] | [À compléter] | J2 | [À compléter] |

### Phase 4 : Suivi & Contrôle (continu)
| Tâche | Fréquence | Responsable |
|---|---|---|
| Rapport avancement | Hebdomadaire | {{userName}} |
| Revue risques | Bi-mensuelle | {{userName}} |

### Phase 5 : Clôture (2 dernières semaines)
| Tâche | Durée | Début | Fin | Prédécesseur | Responsable |
|---|---|---|---|---|---|
| PV réception | 2j | [À compléter] | [À compléter] | Phase 3 | {{userName}} |
| Bilan projet | 3j | [À compléter] | [À compléter] | PV | {{userName}} |

## 3. Chemin critique

[Identifiez la séquence de tâches déterminant la durée minimale du projet.]

- Tâche A → Tâche B → Tâche C → ... → Livraison
- Marge totale du projet : [À compléter] jours

## 4. Hypothèses et contraintes

| Type | Description |
|---|---|
| Hypothèse | [À compléter] |
| Contrainte | Délai imposé : {{deadlineDays}} jours |
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'structure',
          name: 'Structure du planning',
          weight: 30,
          criteria: [
            { label: 'Phases identifiées', description: 'Toutes les phases sont présentés', maxPoints: 15 },
            { label: 'Jalons définis', description: 'Les jalons clés sont identifiés', maxPoints: 15 },
          ],
        },
        {
          id: 'dependencies',
          name: 'Dépendances et chemin critique',
          weight: 30,
          criteria: [
            { label: 'Dépendances', description: 'Les dépendances entre tâches sont identifiées', maxPoints: 15 },
            { label: 'Chemin critique', description: 'Le chemin critique est identifié', maxPoints: 15 },
          ],
        },
        {
          id: 'detail',
          name: 'Niveau de détail',
          weight: 40,
          criteria: [
            { label: 'Tâches détaillées', description: 'Les tâches sont suffisamment décomposées', maxPoints: 20 },
            { label: 'Responsables', description: 'Chaque tâche a un responsable', maxPoints: 10 },
            { label: 'Estimations', description: 'Durées estimées de façon réaliste', maxPoints: 10 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['Échéancier du projet', 'Diagramme de Gantt', 'Chemin critique'],
    },
    referenceExample: `# Échéancier — Exemple
5 jalons, 35 tâches, chemin critique : Specs → Dev module Finance → Intégration → Tests → Recette
Durée totale : 180 jours, marge 12 jours
`,
  },

  // ─── 04. Estimation des Couts ─────────────────────────────
  {
    id: 'seed-tpl-cost-estimate',
    title: 'Estimation des Coûts',
    type: 'cost-estimate',
    phase: 'PLANNING',
    description:
      "Budget détaillé du projet avec estimations par lot de travail, provisions pour risques et analyse de sensibilité.",
    pmiProcess: '7.2',
    difficulty: 'STANDARD',
    content: `# Estimation des Coûts

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Code** | {{projectCode}} |
| **Chef de projet** | {{userName}} |
| **Budget initial** | {{initialBudget}} |
| **Date** | {{currentDate}} |

---

## 1. Méthode d'estimation

[Décrivez la méthode utilisée : analogique, paramétrique, bottom-up, 3 points.]

## 2. Budget par phase

| Phase | Coût estimé | % du budget |
|---|---|---|
| Initiation | [À compléter] | [À compléter] |
| Planification | [À compléter] | [À compléter] |
| Exécution | [À compléter] | [À compléter] |
| Suivi & Contrôle | [À compléter] | [À compléter] |
| Clôture | [À compléter] | [À compléter] |
| **Total** | {{initialBudget}} | 100% |

## 3. Budget détaillé par lot de travail

| Code WBS | Lot | Ressources | J/H | Coût unitaire | Total |
|---|---|---|---|---|---|
| [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] |

## 4. Provisions

| Type | Montant | Justification |
|---|---|---|
| Provision pour aléas | [À compléter] | Risques identifiés |
| Réserve de management | [À compléter] | Risques non identifiés |

## 5. Hypothèses de coût

[Listez les hypothèses sur lesquelles reposent vos estimations.]

## 6. Approbation

| Nom | Rôle | Date |
|---|---|---|
| {{userName}} | Chef de projet | {{currentDate}} |
| {{sponsorName}} | Sponsor | |
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'methodology',
          name: 'Méthodologie',
          weight: 25,
          criteria: [
            { label: 'Méthode justifiée', description: "La méthode d'estimation est expliquée", maxPoints: 15 },
            { label: 'Hypothèses', description: 'Les hypothèses sont documentées', maxPoints: 10 },
          ],
        },
        {
          id: 'detail',
          name: 'Détail des estimations',
          weight: 40,
          criteria: [
            { label: 'Décomposition', description: 'Le budget est décomposé par phase et lot', maxPoints: 20 },
            { label: 'Cohérence WBS', description: 'Les coûts sont alignés avec le WBS', maxPoints: 20 },
          ],
        },
        {
          id: 'provisions',
          name: 'Provisions et risques',
          weight: 35,
          criteria: [
            { label: 'Provisions', description: 'Des provisions pour aléas sont prévues', maxPoints: 20 },
            { label: 'Réalisme', description: 'Les estimations sont réalistes et justifiées', maxPoints: 15 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['Estimations des coûts', 'Base de référence des coûts'],
    },
    referenceExample: `# Estimation — Exemple
Méthode bottom-up, 22 lots estimés. Budget : 450k EUR
Provisions aléas : 10% (45k), réserve management : 5% (22.5k)
Budget total autorisé : 517.5k EUR
`,
  },

  // ─── 05. Matrice RACI ─────────────────────────────────────
  {
    id: 'seed-tpl-raci-matrix',
    title: 'Matrice RACI',
    type: 'raci-matrix',
    phase: 'PLANNING',
    description:
      "Matrice d'attribution des responsabilités définissant qui est Responsible, Accountable, Consulted et Informed pour chaque activité.",
    pmiProcess: '9.1',
    difficulty: 'DISCOVERY',
    content: `# Matrice RACI

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Code** | {{projectCode}} |
| **Chef de projet** | {{userName}} |
| **Date** | {{currentDate}} |

---

## Légende

- **R** = Responsible (Réalise le travail)
- **A** = Accountable (Approuvé / rend des comptes — un seul par ligne)
- **C** = Consulted (Consulte avant décision)
- **I** = Informed (Informé après décision)

## Matrice RACI

| Activité / Livrable | {{userName}} | {{sponsorName}} | {{clientName}} | [Membre 1] | [Membre 2] |
|---|---|---|---|---|---|
| Charte de projet | R | A | C | I | I |
| Plan de management | R/A | I | C | C | I |
| WBS | R | A | I | C | C |
| Échéancier | R | I | I | C | C |
| Budget | R | A | I | I | I |
| Exécution technique | I | I | I | R | R |
| Tests | C | I | I | R | A |
| Rapports avancement | R/A | I | I | C | C |
| Gestion des risques | R | A | C | C | I |
| Gestion des changements | R | A | C | I | I |
| PV de réception | R | A | A | I | I |
| Bilan de clôture | R/A | I | I | C | C |

## Règles de validation

- Chaque ligne a exactement un A
- Au moins un R par ligne
- Éviter les surcharges (pas plus de 5 R par personne)

## Notes

[Ajoutez des précisions si nécessaire.]
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'completeness',
          name: 'Complétude',
          weight: 35,
          criteria: [
            { label: 'Activités couvertes', description: 'Les activités principales sont toutes listées', maxPoints: 20 },
            { label: 'Acteurs identifiés', description: 'Tous les rôles sont présents', maxPoints: 15 },
          ],
        },
        {
          id: 'correctness',
          name: 'Respect des règles RACI',
          weight: 40,
          criteria: [
            { label: 'Un seul A', description: 'Chaque ligne a exactement un Accountable', maxPoints: 20 },
            { label: 'Au moins un R', description: 'Chaque ligne a au moins un Responsible', maxPoints: 10 },
            { label: 'Pas de surcharge', description: 'Aucun acteur n\'est surcharge', maxPoints: 10 },
          ],
        },
        {
          id: 'clarity',
          name: 'Clarté',
          weight: 25,
          criteria: [
            { label: 'Légende', description: 'La légende RACI est présentée', maxPoints: 10 },
            { label: 'Lisibilité', description: 'La matrice est facile à lire', maxPoints: 15 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['Matrice RACI', "Plan de gestion des ressources"],
    },
    referenceExample: `# RACI — Exemple
12 activités, 6 acteurs. Chaque ligne a 1 A, règles respectées.
Chef de projet : 8R, 2A. Dev senior : 3R, 1A. Sponsor : 4A, 2C.
`,
  },

  // ─── 06. Plan de Communication ────────────────────────────
  {
    id: 'seed-tpl-communication-plan',
    title: 'Plan de Communication',
    type: 'communication-plan',
    phase: 'PLANNING',
    description:
      "Stratégie de communication du projet définissant les canaux, fréquences et messages pour chaque partie prenante.",
    pmiProcess: '10.1',
    difficulty: 'STANDARD',
    content: `# Plan de Communication

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Code** | {{projectCode}} |
| **Chef de projet** | {{userName}} |
| **Date** | {{currentDate}} |

---

## 1. Objectifs de communication

[Définissez les objectifs globaux de la communication projet.]

## 2. Parties prenantes et besoins

| Partie prenante | Niveau d'intérêt | Niveau de pouvoir | Besoin d'information |
|---|---|---|---|
| {{sponsorName}} (Sponsor) | Élevé | Élevé | Avancement, décisions, risques |
| {{clientName}} (Client) | Élevé | Moyen | Livrables, jalons |
| Équipe projet | Élevé | Moyen | Tâches, planning, décisions |
| [À compléter] | [À compléter] | [À compléter] | [À compléter] |

## 3. Matrice de communication

| Communication | Public cible | Fréquence | Canal | Responsable | Contenu |
|---|---|---|---|---|---|
| COPIL | Sponsor, Direction | Mensuel | Réunion | {{userName}} | Dashboard KPIs, risques |
| Point équipe | Équipe projet | Hebdomadaire | Réunion | {{userName}} | Avancement, blocages |
| Rapport avancement | Sponsor, Client | Bi-mensuel | Email + doc | {{userName}} | KPIs, jalons, alertes |
| Newsletter projet | Toutes PP | Mensuel | Email | {{userName}} | Faits marquants |
| Alertes | Sponsor | Ad hoc | Email/Tel | {{userName}} | Risques critiques |

## 4. Modèles de communication

[Listez les templates de communication utilisés.]

## 5. Outils

| Outil | Usage |
|---|---|
| [À compléter] | Gestion de projet |
| [À compléter] | Communication équipe |
| [À compléter] | Partage de documents |

## 6. Escalade

[Définissez le processus d'escalade pour les problèmes de communication.]
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'stakeholders',
          name: 'Parties prenantes',
          weight: 30,
          criteria: [
            { label: 'Identification', description: 'Les parties prenantes sont identifiées avec leur niveau', maxPoints: 15 },
            { label: 'Besoins', description: 'Les besoins de chaque PP sont définis', maxPoints: 15 },
          ],
        },
        {
          id: 'matrix',
          name: 'Matrice de communication',
          weight: 40,
          criteria: [
            { label: 'Complétude', description: 'Toutes les communications sont listées', maxPoints: 20 },
            { label: 'Fréquences', description: 'Les fréquences sont adaptées aux besoins', maxPoints: 10 },
            { label: 'Canaux', description: 'Les canaux sont varies et adaptés', maxPoints: 10 },
          ],
        },
        {
          id: 'practicality',
          name: 'Aspect pratique',
          weight: 30,
          criteria: [
            { label: 'Outils', description: 'Les outils de communication sont identifiés', maxPoints: 15 },
            { label: 'Escalade', description: 'Le processus d\'escalade est défini', maxPoints: 15 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['Plan de gestion de la communication'],
    },
    referenceExample: `# Plan de Communication — Exemple
5 types de communication, 4 parties prenantes cibles.
COPIL mensuel, points hebdomadaires, newsletter mensuelle, alertes ad hoc.
Outils : MS Teams, Confluence, Jira, email.
`,
  },

  // ─── 07. Plan de Gestion des Risques ──────────────────────
  {
    id: 'seed-tpl-risk-management-plan',
    title: 'Plan de Gestion des Risques',
    type: 'risk-management-plan',
    phase: 'PLANNING',
    description:
      "Stratégie globale de gestion des risques : processus d'identification, analyse, réponse et suivi des risques.",
    pmiProcess: '11.1',
    difficulty: 'ADVANCED',
    content: `# Plan de Gestion des Risques

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Code** | {{projectCode}} |
| **Chef de projet** | {{userName}} |
| **Date** | {{currentDate}} |

---

## 1. Approche de gestion des risques

[Décrivez l'approche globale : proactive, iterative, quantitative/qualitative.]

## 2. Rôles et responsabilités

| Rôle | Responsable | Activités |
|---|---|---|
| Risk Manager | {{userName}} | Coordination globale |
| Risk Owner | [Variable] | Suivi des risques assignés |
| Sponsor | {{sponsorName}} | Validation des stratégies |

## 3. Catégorisation des risques (RBS)

- **Technique** : Technologie, architecture, performance
- **Externe** : Marche, réglementation, fournisseurs
- **Organisationnel** : Ressources, priorités, budget
- **Gestion de projet** : Planning, périmètre, communication

## 4. Échelle de probabilité et impact

### Probabilité
| Niveau | Valeur | Description |
|---|---|---|
| Très faible | 0.1 | < 10% de chance |
| Faible | 0.3 | 10-30% |
| Moyen | 0.5 | 30-50% |
| Élevé | 0.7 | 50-70% |
| Très élevé | 0.9 | > 70% |

### Impact (sur coût/délai)
| Niveau | Valeur | Description |
|---|---|---|
| Négligeable | 0.05 | < 1% du budget/délai |
| Mineur | 0.1 | 1-5% |
| Modéré | 0.2 | 5-10% |
| Majeur | 0.4 | 10-20% |
| Critique | 0.8 | > 20% |

## 5. Seuils de tolérances

- Risque critique (score > 0.5) : escalade immédiate au sponsor
- Risque majeur (score 0.3-0.5) : plan de réponse obligatoire
- Risque modéré (score 0.1-0.3) : surveillance active
- Risque faible (score < 0.1) : acceptation

## 6. Fréquence de revue

| Activité | Fréquence |
|---|---|
| Revue complète des risques | Bi-mensuelle |
| Mise à jour du registre | Hebdomadaire |
| Rapport risques au COPIL | Mensuel |

## 7. Budget risque

- Provision pour aléas : [À compléter] % du budget
- Réserve de management : [À compléter] % du budget
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'process',
          name: 'Processus de gestion',
          weight: 30,
          criteria: [
            { label: 'Approche', description: "L'approche est définie et justifiée", maxPoints: 15 },
            { label: 'Rôles', description: 'Les rôles sont clairement attribués', maxPoints: 15 },
          ],
        },
        {
          id: 'scales',
          name: 'Échelles et seuils',
          weight: 35,
          criteria: [
            { label: 'Probabilité', description: "L'échelle de probabilité est définie", maxPoints: 15 },
            { label: 'Impact', description: "L'échelle d'impact est définie", maxPoints: 10 },
            { label: 'Seuils', description: 'Les seuils de tolérance sont définis', maxPoints: 10 },
          ],
        },
        {
          id: 'operational',
          name: 'Aspect opérationnel',
          weight: 35,
          criteria: [
            { label: 'Catégorisation', description: 'Les catégories de risques sont définies (RBS)', maxPoints: 15 },
            { label: 'Fréquence', description: 'Les fréquences de revue sont définies', maxPoints: 10 },
            { label: 'Budget', description: 'Le budget risque est prévu', maxPoints: 10 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['Plan de gestion des risques'],
    },
    referenceExample: `# Plan Risques — Exemple
Approche proactive, revue bi-mensuelle, 4 catégories RBS.
Échelle 5 niveaux (probabilité et impact). Seuil escalade : score > 0.5.
Provision aléas 10%, réserve management 5%.
`,
  },

  // ─── 08. Plan d'Approvisionnement ─────────────────────────
  {
    id: 'seed-tpl-procurement-plan',
    title: "Plan d'Approvisionnement",
    type: 'procurement-plan',
    phase: 'PLANNING',
    description:
      "Plan des achats et sous-traitances du projet. Définit la stratégie d'approvisionnement, les critères de sélection et le calendrier.",
    pmiProcess: '12.1',
    difficulty: 'ADVANCED',
    content: `# Plan d'Approvisionnement

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Code** | {{projectCode}} |
| **Chef de projet** | {{userName}} |
| **Date** | {{currentDate}} |

---

## 1. Besoins d'approvisionnement

| # | Besoin | Type | Estimation | Priorité |
|---|---|---|---|---|
| 1 | [À compléter] | Achat / Sous-traitance | [À compléter] | [À compléter] |
| 2 | [À compléter] | Achat / Sous-traitance | [À compléter] | [À compléter] |

## 2. Stratégie d'approvisionnement

[Décrivez la stratégie : faire vs acheter, type de contrat, processus de sélection.]

### 2.1 Analyse Make or Buy
| Besoin | Faire en interne | Acheter / Sous-traiter | Décision |
|---|---|---|---|
| [À compléter] | [Avantages/Inconvénients] | [Avantages/Inconvénients] | [À compléter] |

## 3. Critères de sélection des fournisseurs

| Critère | Poids |
|---|---|
| Compétence technique | [À compléter]% |
| Prix | [À compléter]% |
| Délais | [À compléter]% |
| Références | [À compléter]% |

## 4. Calendrier d'approvisionnement

| Besoin | Publication AO | Réception offres | Sélection | Contrat |
|---|---|---|---|---|
| [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] |

## 5. Types de contrats

[Définissez le type de contrat pour chaque approvisionnement : forfait, régie, etc.]
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'needs',
          name: 'Identification des besoins',
          weight: 30,
          criteria: [
            { label: 'Besoins identifiés', description: 'Les besoins sont clairement listes', maxPoints: 15 },
            { label: 'Make or Buy', description: "L'analyse make/buy est réalisée", maxPoints: 15 },
          ],
        },
        {
          id: 'strategy',
          name: 'Stratégie',
          weight: 35,
          criteria: [
            { label: 'Critères sélection', description: 'Les critères sont pondérés', maxPoints: 15 },
            { label: 'Types contrats', description: 'Les types de contrats sont définis', maxPoints: 20 },
          ],
        },
        {
          id: 'planning',
          name: 'Planification',
          weight: 35,
          criteria: [
            { label: 'Calendrier', description: 'Le calendrier est détaillé', maxPoints: 20 },
            { label: 'Cohérence', description: 'Cohérent avec le planning projet', maxPoints: 15 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ["Plan de gestion des approvisionnements"],
    },
    referenceExample: `# Approvisionnement — Exemple
3 besoins identifiés, analyse make/buy réalisée. 2 sous-traitances, 1 achat.
Critères : technique 40%, prix 30%, délais 20%, références 10%.
Contrats : 1 forfait, 1 régie plafonnée.
`,
  },

  // ─── 09. Plan de Gestion de la Qualite ────────────────────
  {
    id: 'seed-tpl-quality-plan',
    title: 'Plan de Gestion de la Qualité',
    type: 'quality-plan',
    phase: 'PLANNING',
    description:
      "Stratégie d'assurance et de contrôle qualité du projet. Définit les normes, métriques et processus de validation.",
    pmiProcess: '8.1',
    difficulty: 'STANDARD',
    content: `# Plan de Gestion de la Qualité

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Code** | {{projectCode}} |
| **Chef de projet** | {{userName}} |
| **Date** | {{currentDate}} |

---

## 1. Politique qualité

[Définissez la politique qualité applicable au projet.]

## 2. Normes et standards applicables

| Norme | Description | Applicabilité |
|---|---|---|
| [À compléter] | [À compléter] | [À compléter] |

## 3. Métriques qualité

| Métrique | Cible | Méthode de mesure | Fréquence |
|---|---|---|---|
| Taux de conformité des livrables | > 90% | Revue par les pairs | Par livrable |
| Nombre de défauts | < [À compléter] | Tests | Continue |
| Satisfaction client | > 4/5 | Enquête | Fin de phase |

## 4. Assurance qualité (QA)

[Activités préventives pour garantir la qualité.]

| Activité QA | Fréquence | Responsable |
|---|---|---|
| Revue de livrables | Par livrable | [À compléter] |
| Audit de processus | Trimestriel | [À compléter] |

## 5. Contrôle qualité (QC)

[Activités de vérification et validation.]

| Activité QC | Critère d'acceptation | Responsable |
|---|---|---|
| [À compléter] | [À compléter] | [À compléter] |

## 6. Amélioration continue

[Processus de retour d'expérience et amélioration.]
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'standards',
          name: 'Normes et métriques',
          weight: 30,
          criteria: [
            { label: 'Normes', description: 'Les normes applicables sont identifiées', maxPoints: 15 },
            { label: 'Métriques', description: 'Les métriques qualité sont définies avec cibles', maxPoints: 15 },
          ],
        },
        {
          id: 'qa',
          name: 'Assurance qualité',
          weight: 35,
          criteria: [
            { label: 'Activités QA', description: 'Les activités préventives sont planifiées', maxPoints: 20 },
            { label: 'Responsabilités', description: 'Les responsables QA sont désignés', maxPoints: 15 },
          ],
        },
        {
          id: 'qc',
          name: 'Contrôle qualité',
          weight: 35,
          criteria: [
            { label: 'Activités QC', description: 'Les activités de vérification sont définies', maxPoints: 20 },
            { label: 'Critères acceptation', description: "Les critères d'acceptation sont clairs", maxPoints: 15 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['Plan de gestion de la qualité', 'Métriques qualité'],
    },
    referenceExample: `# Qualité — Exemple
Normes : ISO 9001, IEEE 830. 3 métriques cibles.
QA : revues par pairs, audits trimestriels.
QC : tests unitaires (couverture 80%), tests intégration, recette utilisateur.
`,
  },

  // ─── 10. Plan de Gestion des Ressources ───────────────────
  {
    id: 'seed-tpl-resource-plan',
    title: 'Plan de Gestion des Ressources',
    type: 'resource-plan',
    phase: 'PLANNING',
    description:
      "Planification des ressources humaines et matérielles. Définit les besoins, la disponibilité et la stratégie d'acquisition.",
    pmiProcess: '9.1',
    difficulty: 'STANDARD',
    content: `# Plan de Gestion des Ressources

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Code** | {{projectCode}} |
| **Chef de projet** | {{userName}} |
| **Date** | {{currentDate}} |

---

## 1. Équipe projet

{{teamMembers}}

## 2. Besoins en ressources par phase

| Phase | Ressources nécessaires | Compétences clés |
|---|---|---|
| Initiation | {{userName}} | Cadrage, communication |
| Planification | Équipe complète | Planification, estimation |
| Exécution | [À compléter] | [À compléter] |
| Suivi | {{userName}} | Reporting, analyse |
| Clôture | Équipe réduite | Bilan, transfert |

## 3. Matrice des compétences

| Compétence | Niveau requis | Ressource assignée | Écart |
|---|---|---|---|
| [À compléter] | [À compléter] | [À compléter] | [À compléter] |

## 4. Plan de formation

| Formation | Public | Date | Durée |
|---|---|---|---|
| [À compléter] | [À compléter] | [À compléter] | [À compléter] |

## 5. Calendrier des ressources

[Décrivez la disponibilité des ressources par période.]

## 6. Gestion des conflits de ressources

[Processus de résolution des conflits d'allocation.]
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'identification',
          name: 'Identification des besoins',
          weight: 35,
          criteria: [
            { label: 'Équipe', description: "L'équipe est identifiée avec rôles et compétences", maxPoints: 20 },
            { label: 'Besoins par phase', description: 'Les besoins sont détaillés par phase', maxPoints: 15 },
          ],
        },
        {
          id: 'skills',
          name: 'Compétences',
          weight: 30,
          criteria: [
            { label: 'Matrice compétences', description: 'Les écarts de compétences sont identifiés', maxPoints: 15 },
            { label: 'Formation', description: 'Un plan de formation est prévu', maxPoints: 15 },
          ],
        },
        {
          id: 'planning',
          name: 'Planification',
          weight: 35,
          criteria: [
            { label: 'Calendrier', description: 'La disponibilité est planifiée', maxPoints: 20 },
            { label: 'Conflits', description: 'La gestion des conflits est prévue', maxPoints: 15 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['Plan de gestion des ressources', "Calendrier des ressources"],
    },
    referenceExample: `# Ressources — Exemple
8 membres, 12 compétences mappées, 2 formations planifiées.
Pics de charge : sem 8-12 (exécution). Conflit identifié : dev senior partage avec autre projet.
`,
  },

  // ─── 11. Ligne de Base du Perimetre ───────────────────────
  {
    id: 'seed-tpl-scope-baseline',
    title: 'Ligne de Base du Périmètre',
    type: 'scope-baseline',
    phase: 'PLANNING',
    description:
      "Référence approuvée du périmètre du projet. Comprend l'énoncé du périmètre, le WBS et le dictionnaire WBS valides.",
    pmiProcess: '5.4',
    difficulty: 'STANDARD',
    content: `# Ligne de Base du Périmètre

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Code** | {{projectCode}} |
| **Chef de projet** | {{userName}} |
| **Date d'approbation** | {{currentDate}} |

---

## 1. Énoncé du périmètre

### 1.1 Description du projet
> {{projectDescription}}

### 1.2 Objectifs du projet
[Listez les objectifs SMART du projet.]

### 1.3 Livrables
| # | Livrable | Description | Critère d'acceptation |
|---|---|---|---|
| 1 | [À compléter] | [À compléter] | [À compléter] |

### 1.4 Exclusions
[Ce qui est explicitement hors périmètre.]

### 1.5 Contraintes
| Contrainte | Description |
|---|---|
| Budget | {{initialBudget}} |
| Délai | {{deadlineDays}} jours |
| [À compléter] | [À compléter] |

### 1.6 Hypothèses
[Listez les hypothèses de périmètre.]

## 2. WBS de référence

[Insérez ou référencez le WBS approuvé.]

## 3. Approbation

| Nom | Rôle | Signature | Date |
|---|---|---|---|
| {{userName}} | Chef de projet | | {{currentDate}} |
| {{sponsorName}} | Sponsor | | |
| {{clientName}} | Client | | |
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'scope',
          name: 'Énoncé du périmètre',
          weight: 40,
          criteria: [
            { label: 'Objectifs SMART', description: 'Les objectifs sont SMART', maxPoints: 15 },
            { label: 'Livrables', description: 'Les livrables et critères sont définis', maxPoints: 15 },
            { label: 'Exclusions', description: 'Les exclusions sont claires', maxPoints: 10 },
          ],
        },
        {
          id: 'constraints',
          name: 'Contraintes et hypothèses',
          weight: 30,
          criteria: [
            { label: 'Contraintes', description: 'Les contraintes sont identifiées', maxPoints: 15 },
            { label: 'Hypothèses', description: 'Les hypothèses sont documentées', maxPoints: 15 },
          ],
        },
        {
          id: 'approval',
          name: 'Validation',
          weight: 30,
          criteria: [
            { label: 'WBS référence', description: 'Le WBS est inclus ou référencé', maxPoints: 15 },
            { label: 'Approbation', description: 'Les approbations sont prévues', maxPoints: 15 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['Ligne de base du périmètre', 'Énoncé du périmètre'],
    },
    referenceExample: `# Scope Baseline — Exemple
5 objectifs SMART, 8 livrables avec critères d'acceptation.
3 exclusions, 4 contraintes, 5 hypothèses.
Approuvé par CP, Sponsor et Client.
`,
  },

  // ─── 12. Plan de Gestion des Changements ──────────────────
  {
    id: 'seed-tpl-change-management-plan',
    title: 'Plan de Gestion des Changements',
    type: 'change-management-plan',
    phase: 'PLANNING',
    description:
      "Processus de gestion des demandes de changement. Définit les étapes d'évaluation, validation et implémentation.",
    pmiProcess: '4.6',
    difficulty: 'STANDARD',
    content: `# Plan de Gestion des Changements

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Code** | {{projectCode}} |
| **Chef de projet** | {{userName}} |
| **Date** | {{currentDate}} |

---

## 1. Processus de gestion des changements

### 1.1 Flux de traitement
1. **Soumission** : Toute partie prenante peut soumettre une demande
2. **Analyse d'impact** : Le chef de projet analyse l'impact sur coût/délai/périmètre
3. **Évaluation** : Le comité de changement évalué la demande
4. **Décision** : Approuver, rejeter ou reporter
5. **Implémentation** : Si approuvée, planifier et exécuter
6. **Vérification** : Vérifier la bonne mise en œuvre

### 1.2 Comité de changement (CCB)

| Membre | Rôle | Pouvoir de décision |
|---|---|---|
| {{userName}} | Chef de projet | Recommandation |
| {{sponsorName}} | Sponsor | Approbation (impact > seuil) |
| {{clientName}} | Client | Validation périmètre |

### 1.3 Seuils de décision

| Impact | Décideur |
|---|---|
| < 5% du budget et < 1 semaine délai | Chef de projet |
| 5-15% du budget ou 1-3 semaines délai | Sponsor |
| > 15% du budget ou > 3 semaines délai | COPIL |

## 2. Formulaire de demande de changement

| Champ | Description |
|---|---|
| ID | Numéro unique (CR-XXX) |
| Date | Date de soumission |
| Demandeur | Nom et rôle |
| Description | Description détaillée du changement |
| Justification | Raison de la demande |
| Impact coût | Estimation financière |
| Impact délai | Impact sur le planning |
| Impact périmètre | Modification du périmètre |
| Priorité | Critique / Haute / Moyenne / Basse |
| Décision | Approuvé / Rejeté / Reporté |

## 3. Registre des changements

| ID | Date | Description | Impact | Statut | Décision |
|---|---|---|---|---|---|
| CR-001 | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] |

## 4. Indicateurs

- Nombre de demandes par période
- Taux d'approbation
- Délai moyen de traitement
- Impact cumulé sur budget/délai
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'process',
          name: 'Processus',
          weight: 35,
          criteria: [
            { label: 'Flux', description: 'Le flux de traitement est complet', maxPoints: 15 },
            { label: 'CCB', description: 'Le comité est défini avec pouvoirs', maxPoints: 10 },
            { label: 'Seuils', description: 'Les seuils de décision sont clairs', maxPoints: 10 },
          ],
        },
        {
          id: 'form',
          name: 'Formulaire et registre',
          weight: 35,
          criteria: [
            { label: 'Formulaire', description: 'Le formulaire est complet', maxPoints: 15 },
            { label: 'Registre', description: 'Le registre est structure', maxPoints: 10 },
            { label: 'Traçabilité', description: 'La traçabilité est assurée', maxPoints: 10 },
          ],
        },
        {
          id: 'indicators',
          name: 'Indicateurs',
          weight: 30,
          criteria: [
            { label: 'KPIs', description: 'Les indicateurs de suivi sont définis', maxPoints: 15 },
            { label: 'Pertinence', description: 'Les indicateurs sont pertinents', maxPoints: 15 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['Plan de gestion des changements', 'Registre des changements'],
    },
    referenceExample: `# Changements — Exemple
Flux en 6 étapes, CCB de 3 membres. Seuils : <5% CP, 5-15% Sponsor, >15% COPIL.
Formulaire 10 champs, registre avec traçabilité. 4 KPIs de suivi.
`,
  },

  // ─── 13. Cahier des Charges Technique ─────────────────────
  {
    id: 'seed-tpl-technical-specs',
    title: 'Cahier des Charges Technique',
    type: 'technical-specs',
    phase: 'PLANNING',
    description:
      "Spécifications techniques détaillées du projet. Définit les exigences fonctionnelles, non-fonctionnelles et les contraintes techniques.",
    pmiProcess: '5.3',
    difficulty: 'ADVANCED',
    content: `# Cahier des Charges Technique

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Code** | {{projectCode}} |
| **Chef de projet** | {{userName}} |
| **Client** | {{clientName}} |
| **Date** | {{currentDate}} |
| **Secteur** | {{sector}} |

---

## 1. Contexte et objectifs

### 1.1 Contexte
> {{projectDescription}}

### 1.2 Objectifs techniques
[Définissez les objectifs techniques du projet.]

## 2. Exigences fonctionnelles

| ID | Exigence | Priorité | Critère d'acceptation |
|---|---|---|---|
| EF-001 | [À compléter] | Obligatoire | [À compléter] |
| EF-002 | [À compléter] | Souhaitable | [À compléter] |

## 3. Exigences non-fonctionnelles

### 3.1 Performance
| Métrique | Cible |
|---|---|
| [À compléter] | [À compléter] |

### 3.2 Sécurité
[Exigences de sécurité.]

### 3.3 Disponibilité
[Exigences de disponibilité et SLA.]

### 3.4 Évolutivité
[Exigences de scalabilité et maintenabilité.]

## 4. Architecture technique

[Décrivez l'architecture cible : composants, flux, technologies.]

## 5. Contraintes techniques

| Contrainte | Description | Impact |
|---|---|---|
| [À compléter] | [À compléter] | [À compléter] |

## 6. Interfaces

[Décrivez les interfaces avec les systèmes existants.]

## 7. Plan de tests

| Type de test | Périmètre | Critère de succès |
|---|---|---|
| Unitaire | [À compléter] | [À compléter] |
| Intégration | [À compléter] | [À compléter] |
| Acceptation | [À compléter] | [À compléter] |

## 8. Approbation

| Nom | Rôle | Date |
|---|---|---|
| {{userName}} | Chef de projet | {{currentDate}} |
| {{clientName}} | Client | |
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'functional',
          name: 'Exigences fonctionnelles',
          weight: 30,
          criteria: [
            { label: 'Complétude', description: 'Les exigences sont complètes et priorisées', maxPoints: 15 },
            { label: 'Critères acceptation', description: 'Chaque exigence a un critère', maxPoints: 15 },
          ],
        },
        {
          id: 'nonfunctional',
          name: 'Exigences non-fonctionnelles',
          weight: 25,
          criteria: [
            { label: 'Performance', description: 'Les métriques de performance sont définies', maxPoints: 10 },
            { label: 'Sécurité/Dispo', description: 'Sécurité et disponibilité sont adressées', maxPoints: 15 },
          ],
        },
        {
          id: 'architecture',
          name: 'Architecture',
          weight: 25,
          criteria: [
            { label: 'Architecture', description: "L'architecture est décrite", maxPoints: 15 },
            { label: 'Interfaces', description: 'Les interfaces sont identifiées', maxPoints: 10 },
          ],
        },
        {
          id: 'testing',
          name: 'Plan de tests',
          weight: 20,
          criteria: [
            { label: 'Stratégie tests', description: 'Le plan de tests est défini', maxPoints: 10 },
            { label: 'Critères succès', description: 'Les critères de succès sont clairs', maxPoints: 10 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['Énoncé du périmètre du projet', 'Documentation des exigences'],
    },
    referenceExample: `# Specs Techniques — Exemple
15 exigences fonctionnelles (8 obligatoires, 7 souhaitables).
NFR : temps réponse < 200ms, SLA 99.9%, chiffrement AES-256.
Architecture microservices, 3 interfaces externes.
Tests : unitaires (80% couverture), intégration, performance, acceptation.
`,
  },
];
