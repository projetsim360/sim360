import type { DeliverableTemplateData } from './types';

export const planningTemplates: DeliverableTemplateData[] = [
  // ─── 01. Plan de Management de Projet ─────────────────────
  {
    id: 'seed-tpl-project-management-plan',
    title: 'Plan de Management de Projet',
    type: 'project-management-plan',
    phase: 'PLANNING',
    description:
      "Document central decrivant la strategie globale de gestion du projet. Integre les plans subsidiaires et definit les processus de pilotage.",
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
| 1.0 | {{userName}} | Creation initiale | {{currentDate}} |

---

## 1. Introduction

### 1.1 Objet du document
Ce document constitue le plan de management du projet "{{projectName}}". Il definit la strategie globale de gestion et les processus de pilotage.

### 1.2 Contexte du projet
> {{projectDescription}}

### 1.3 References
- Charte de projet approuvee
- Registre des parties prenantes
- Contrat client : {{clientName}}

## 2. Perimetre du projet

### 2.1 Enonce du perimetre
[Decrivez le perimetre inclus et exclu du projet.]

### 2.2 Livrables principaux
| # | Livrable | Phase | Date prevue |
|---|---|---|---|
| 1 | [A completer] | Initiation | [A completer] |
| 2 | [A completer] | Planification | [A completer] |
| 3 | [A completer] | Execution | [A completer] |

### 2.3 Exclusions
[Listez ce qui est explicitement hors perimetre.]

## 3. Organisation du projet

### 3.1 Structure organisationnelle
[Decrivez l'organigramme du projet et les roles cles.]

### 3.2 Equipe projet
{{teamMembers}}

### 3.3 Matrice RACI resumee
| Activite | Chef de projet | Sponsor | Equipe | Client |
|---|---|---|---|---|
| Validation perimetre | R | A | C | I |
| Planification | R/A | I | C | I |
| Execution | R | I | A | I |
| Reporting | R/A | I | C | I |

## 4. Plans subsidiaires

### 4.1 Gestion du perimetre
[Processus de gestion des changements de perimetre.]

### 4.2 Gestion de l'echeancier
- Delai global : {{deadlineDays}} jours
- Methode de planification : [Chemin critique / Agile]
- Frequence de mise a jour : [Hebdomadaire]

### 4.3 Gestion des couts
- Budget initial : {{initialBudget}}
- Methode de suivi : Earned Value Management (EVM)
- Seuils d'alerte : CPI/SPI < 0.9

### 4.4 Gestion de la qualite
[Processus d'assurance et de controle qualite.]

### 4.5 Gestion des ressources
[Strategie d'allocation et de gestion des ressources.]

### 4.6 Gestion de la communication
[Plan de communication synthetique.]

### 4.7 Gestion des risques
[Strategie de gestion des risques.]

### 4.8 Gestion des approvisionnements
[Strategie d'achat si applicable.]

## 5. Processus de pilotage

### 5.1 Suivi et controle
| Activite | Frequence | Responsable | Participants |
|---|---|---|---|
| Comite de pilotage | [A completer] | {{sponsorName}} | Direction |
| Revue de projet | [A completer] | {{userName}} | Equipe |
| Point d'avancement | [A completer] | {{userName}} | Equipe |

### 5.2 Gestion des changements
[Processus de demande, evaluation et approbation des changements.]

### 5.3 Criteres de succes
[Definissez les KPIs et criteres de succes du projet.]

## 6. Approbation

| Nom | Role | Signature | Date |
|---|---|---|---|
| {{userName}} | Chef de projet | | {{currentDate}} |
| {{sponsorName}} | Sponsor | | |
| {{clientName}} | Client | | |
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'completeness',
          name: 'Completude',
          weight: 30,
          criteria: [
            { label: 'Plans subsidiaires', description: 'Tous les plans subsidiaires sont identifies et decrits', maxPoints: 15 },
            { label: 'Processus de pilotage', description: 'Les processus de suivi et controle sont definis', maxPoints: 15 },
          ],
        },
        {
          id: 'coherence',
          name: 'Coherence',
          weight: 25,
          criteria: [
            { label: 'Alignement objectifs', description: 'Le plan est aligne avec la charte et les objectifs', maxPoints: 15 },
            { label: 'Integration', description: 'Les plans subsidiaires sont coherents entre eux', maxPoints: 10 },
          ],
        },
        {
          id: 'quality',
          name: 'Qualite redactionnelle',
          weight: 20,
          criteria: [
            { label: 'Clarte', description: 'Le document est clair et comprehensible', maxPoints: 10 },
            { label: 'Professionnalisme', description: 'Le ton et le format sont professionnels', maxPoints: 10 },
          ],
        },
        {
          id: 'applicability',
          name: 'Applicabilite',
          weight: 25,
          criteria: [
            { label: 'Realisme', description: 'Les processus sont realistes et applicables', maxPoints: 15 },
            { label: 'Mesurabilite', description: 'Les indicateurs sont mesurables', maxPoints: 10 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['Plan de management de projet', 'Plans subsidiaires'],
    },
    referenceExample: `# Plan de Management de Projet — Exemple

## Perimetre : Migration ERP SAP pour TechCorp
- 3 modules : Finance, RH, Supply Chain
- Exclusions : personnalisations legacy, formation utilisateurs finaux (sous-traite)

## Organisation : Equipe de 8 personnes, structure matricielle
## Budget : 450 000 EUR, suivi EVM mensuel, seuil alerte CPI < 0.9
## Echeancier : 180 jours, jalons mensuels, chemin critique sur integration
## Qualite : Revues de code hebdomadaires, tests de non-regression automatises
## Risques : Revue bi-mensuelle, 5 risques critiques identifies
## Communication : COPIL mensuel, daily standup, newsletter bi-mensuelle
`,
  },

  // ─── 02. Structure de Decoupage du Travail (WBS) ──────────
  {
    id: 'seed-tpl-wbs',
    title: 'Structure de Decoupage du Travail (WBS)',
    type: 'wbs',
    phase: 'PLANNING',
    description:
      "Decomposition hierarchique du travail du projet en lots et taches elementaires. Base de l'estimation et de la planification.",
    pmiProcess: '5.4',
    difficulty: 'STANDARD',
    content: `# Structure de Decoupage du Travail (WBS)

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Code** | {{projectCode}} |
| **Chef de projet** | {{userName}} |
| **Date** | {{currentDate}} |

---

## 1. Regles de decomposition

- Regle des 100% : chaque niveau couvre 100% du travail du niveau superieur
- Profondeur maximale : 4 niveaux
- Lots de travail : duree maximale de 2 semaines

## 2. WBS hierarchique

### Niveau 0 : {{projectName}}

#### 1. Phase Initiation
- 1.1 Etude d'opportunite
- 1.2 Charte de projet
- 1.3 Registre des parties prenantes
- 1.4 Reunion de lancement

#### 2. Phase Planification
- 2.1 Plan de management
- 2.2 WBS et dictionnaire
- 2.3 Echeancier
- 2.4 Budget
- 2.5 Plan de communication
- 2.6 Plan de gestion des risques

#### 3. Phase Execution
- 3.1 [A completer — lot technique 1]
  - 3.1.1 [Tache]
  - 3.1.2 [Tache]
- 3.2 [A completer — lot technique 2]
  - 3.2.1 [Tache]
  - 3.2.2 [Tache]
- 3.3 [A completer — lot technique 3]

#### 4. Phase Suivi & Controle
- 4.1 Rapports d'avancement
- 4.2 Suivi budgetaire
- 4.3 Gestion des changements

#### 5. Phase Cloture
- 5.1 PV de reception
- 5.2 Bilan projet
- 5.3 Retour d'experience

## 3. Dictionnaire du WBS

| Code WBS | Lot de travail | Description | Responsable | Estimation (j/h) | Livrable |
|---|---|---|---|---|---|
| 1.1 | Etude d'opportunite | Analyse de faisabilite et justification | {{userName}} | [A completer] | Business case |
| 1.2 | Charte de projet | Document fondateur | {{userName}} | [A completer] | Charte signee |
| 3.1 | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] |

## 4. Approbation

| Nom | Role | Date |
|---|---|---|
| {{userName}} | Chef de projet | {{currentDate}} |
| {{sponsorName}} | Sponsor | |
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'structure',
          name: 'Structure hierarchique',
          weight: 35,
          criteria: [
            { label: 'Regle des 100%', description: 'Chaque niveau couvre 100% du travail', maxPoints: 15 },
            { label: 'Granularite', description: 'Decomposition suffisante en lots de travail', maxPoints: 10 },
            { label: 'Coherence des niveaux', description: 'Les niveaux sont homogenes', maxPoints: 10 },
          ],
        },
        {
          id: 'dictionary',
          name: 'Dictionnaire WBS',
          weight: 30,
          criteria: [
            { label: 'Description des lots', description: 'Chaque lot est clairement decrit', maxPoints: 15 },
            { label: 'Estimations', description: 'Estimations de charge presentes', maxPoints: 15 },
          ],
        },
        {
          id: 'coverage',
          name: 'Couverture',
          weight: 35,
          criteria: [
            { label: 'Phases couvertes', description: 'Toutes les phases du projet sont presentes', maxPoints: 20 },
            { label: 'Livrables identifies', description: 'Chaque lot produit un livrable identifie', maxPoints: 15 },
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
## 3. Execution
  3.1 Module Finance (3 sous-lots, 80 j/h)
  3.2 Module RH (3 sous-lots, 60 j/h)
  3.3 Module Supply Chain (4 sous-lots, 90 j/h)
  3.4 Integration (2 sous-lots, 40 j/h)
## 4. Suivi (3 lots, 20 j/h)
## 5. Cloture (3 lots, 10 j/h)
Total : 340 j/h, 22 lots de travail
`,
  },

  // ─── 03. Echeancier / Planning ────────────────────────────
  {
    id: 'seed-tpl-schedule',
    title: 'Echeancier du Projet',
    type: 'schedule',
    phase: 'PLANNING',
    description:
      "Chronogramme detaille avec jalons, dependances et chemin critique. Outil central de pilotage temporel du projet.",
    pmiProcess: '6.5',
    difficulty: 'STANDARD',
    content: `# Echeancier du Projet

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Code** | {{projectCode}} |
| **Chef de projet** | {{userName}} |
| **Date de debut** | {{currentDate}} |
| **Duree prevue** | {{deadlineDays}} jours |

---

## 1. Jalons du projet

| # | Jalon | Date prevue | Critere de validation |
|---|---|---|---|
| J1 | Lancement officiel | [A completer] | Charte approuvee |
| J2 | Fin planification | [A completer] | Plans valides |
| J3 | Livraison intermediaire | [A completer] | [A completer] |
| J4 | Recette finale | [A completer] | PV signe |
| J5 | Cloture projet | [A completer] | Bilan approuve |

## 2. Planning detaille

### Phase 1 : Initiation (Semaines 1-2)
| Tache | Duree | Debut | Fin | Predecesseur | Responsable |
|---|---|---|---|---|---|
| Etude d'opportunite | 3j | [A completer] | [A completer] | - | {{userName}} |
| Charte de projet | 2j | [A completer] | [A completer] | 1 | {{userName}} |
| Reunion lancement | 1j | [A completer] | [A completer] | 2 | {{userName}} |

### Phase 2 : Planification (Semaines 3-5)
| Tache | Duree | Debut | Fin | Predecesseur | Responsable |
|---|---|---|---|---|---|
| WBS | 3j | [A completer] | [A completer] | J1 | {{userName}} |
| Estimation couts | 2j | [A completer] | [A completer] | WBS | {{userName}} |
| Plan risques | 2j | [A completer] | [A completer] | WBS | [A completer] |

### Phase 3 : Execution (Semaines 6-N)
| Tache | Duree | Debut | Fin | Predecesseur | Responsable |
|---|---|---|---|---|---|
| [A completer] | [A completer] | [A completer] | [A completer] | J2 | [A completer] |

### Phase 4 : Suivi & Controle (continu)
| Tache | Frequence | Responsable |
|---|---|---|
| Rapport avancement | Hebdomadaire | {{userName}} |
| Revue risques | Bi-mensuelle | {{userName}} |

### Phase 5 : Cloture (2 dernieres semaines)
| Tache | Duree | Debut | Fin | Predecesseur | Responsable |
|---|---|---|---|---|---|
| PV reception | 2j | [A completer] | [A completer] | Phase 3 | {{userName}} |
| Bilan projet | 3j | [A completer] | [A completer] | PV | {{userName}} |

## 3. Chemin critique

[Identifiez la sequence de taches determinant la duree minimale du projet.]

- Tache A → Tache B → Tache C → ... → Livraison
- Marge totale du projet : [A completer] jours

## 4. Hypotheses et contraintes

| Type | Description |
|---|---|
| Hypothese | [A completer] |
| Contrainte | Delai impose : {{deadlineDays}} jours |
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'structure',
          name: 'Structure du planning',
          weight: 30,
          criteria: [
            { label: 'Phases identifiees', description: 'Toutes les phases sont presentes', maxPoints: 15 },
            { label: 'Jalons definis', description: 'Les jalons cles sont identifies', maxPoints: 15 },
          ],
        },
        {
          id: 'dependencies',
          name: 'Dependances et chemin critique',
          weight: 30,
          criteria: [
            { label: 'Dependances', description: 'Les dependances entre taches sont identifiees', maxPoints: 15 },
            { label: 'Chemin critique', description: 'Le chemin critique est identifie', maxPoints: 15 },
          ],
        },
        {
          id: 'detail',
          name: 'Niveau de detail',
          weight: 40,
          criteria: [
            { label: 'Taches detaillees', description: 'Les taches sont suffisamment decomposees', maxPoints: 20 },
            { label: 'Responsables', description: 'Chaque tache a un responsable', maxPoints: 10 },
            { label: 'Estimations', description: 'Durees estimees de facon realiste', maxPoints: 10 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['Echeancier du projet', 'Diagramme de Gantt', 'Chemin critique'],
    },
    referenceExample: `# Echeancier — Exemple
5 jalons, 35 taches, chemin critique : Specs → Dev module Finance → Integration → Tests → Recette
Duree totale : 180 jours, marge 12 jours
`,
  },

  // ─── 04. Estimation des Couts ─────────────────────────────
  {
    id: 'seed-tpl-cost-estimate',
    title: 'Estimation des Couts',
    type: 'cost-estimate',
    phase: 'PLANNING',
    description:
      "Budget detaille du projet avec estimations par lot de travail, provisions pour risques et analyse de sensibilite.",
    pmiProcess: '7.2',
    difficulty: 'STANDARD',
    content: `# Estimation des Couts

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Code** | {{projectCode}} |
| **Chef de projet** | {{userName}} |
| **Budget initial** | {{initialBudget}} |
| **Date** | {{currentDate}} |

---

## 1. Methode d'estimation

[Decrivez la methode utilisee : analogique, parametrique, bottom-up, 3 points.]

## 2. Budget par phase

| Phase | Cout estime | % du budget |
|---|---|---|
| Initiation | [A completer] | [A completer] |
| Planification | [A completer] | [A completer] |
| Execution | [A completer] | [A completer] |
| Suivi & Controle | [A completer] | [A completer] |
| Cloture | [A completer] | [A completer] |
| **Total** | {{initialBudget}} | 100% |

## 3. Budget detaille par lot de travail

| Code WBS | Lot | Ressources | J/H | Cout unitaire | Total |
|---|---|---|---|---|---|
| [A completer] | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] |

## 4. Provisions

| Type | Montant | Justification |
|---|---|---|
| Provision pour aleas | [A completer] | Risques identifies |
| Reserve de management | [A completer] | Risques non identifies |

## 5. Hypotheses de cout

[Listez les hypotheses sur lesquelles reposent vos estimations.]

## 6. Approbation

| Nom | Role | Date |
|---|---|---|
| {{userName}} | Chef de projet | {{currentDate}} |
| {{sponsorName}} | Sponsor | |
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'methodology',
          name: 'Methodologie',
          weight: 25,
          criteria: [
            { label: 'Methode justifiee', description: "La methode d'estimation est expliquee", maxPoints: 15 },
            { label: 'Hypotheses', description: 'Les hypotheses sont documentees', maxPoints: 10 },
          ],
        },
        {
          id: 'detail',
          name: 'Detail des estimations',
          weight: 40,
          criteria: [
            { label: 'Decomposition', description: 'Le budget est decompose par phase et lot', maxPoints: 20 },
            { label: 'Coherence WBS', description: 'Les couts sont alignes avec le WBS', maxPoints: 20 },
          ],
        },
        {
          id: 'provisions',
          name: 'Provisions et risques',
          weight: 35,
          criteria: [
            { label: 'Provisions', description: 'Des provisions pour aleas sont prevues', maxPoints: 20 },
            { label: 'Realisme', description: 'Les estimations sont realistes et justifiees', maxPoints: 15 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['Estimations des couts', 'Base de reference des couts'],
    },
    referenceExample: `# Estimation — Exemple
Methode bottom-up, 22 lots estimes. Budget : 450k EUR
Provisions aleas : 10% (45k), reserve management : 5% (22.5k)
Budget total autorise : 517.5k EUR
`,
  },

  // ─── 05. Matrice RACI ─────────────────────────────────────
  {
    id: 'seed-tpl-raci-matrix',
    title: 'Matrice RACI',
    type: 'raci-matrix',
    phase: 'PLANNING',
    description:
      "Matrice d'attribution des responsabilites definissant qui est Responsible, Accountable, Consulted et Informed pour chaque activite.",
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

## Legende

- **R** = Responsible (Realise le travail)
- **A** = Accountable (Approuve / rend des comptes — un seul par ligne)
- **C** = Consulted (Consulte avant decision)
- **I** = Informed (Informe apres decision)

## Matrice RACI

| Activite / Livrable | {{userName}} | {{sponsorName}} | {{clientName}} | [Membre 1] | [Membre 2] |
|---|---|---|---|---|---|
| Charte de projet | R | A | C | I | I |
| Plan de management | R/A | I | C | C | I |
| WBS | R | A | I | C | C |
| Echeancier | R | I | I | C | C |
| Budget | R | A | I | I | I |
| Execution technique | I | I | I | R | R |
| Tests | C | I | I | R | A |
| Rapports avancement | R/A | I | I | C | C |
| Gestion des risques | R | A | C | C | I |
| Gestion des changements | R | A | C | I | I |
| PV de reception | R | A | A | I | I |
| Bilan de cloture | R/A | I | I | C | C |

## Regles de validation

- Chaque ligne a exactement un A
- Au moins un R par ligne
- Eviter les surcharges (pas plus de 5 R par personne)

## Notes

[Ajoutez des precisions si necessaire.]
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'completeness',
          name: 'Completude',
          weight: 35,
          criteria: [
            { label: 'Activites couvertes', description: 'Les activites principales sont toutes listees', maxPoints: 20 },
            { label: 'Acteurs identifies', description: 'Tous les roles sont presents', maxPoints: 15 },
          ],
        },
        {
          id: 'correctness',
          name: 'Respect des regles RACI',
          weight: 40,
          criteria: [
            { label: 'Un seul A', description: 'Chaque ligne a exactement un Accountable', maxPoints: 20 },
            { label: 'Au moins un R', description: 'Chaque ligne a au moins un Responsible', maxPoints: 10 },
            { label: 'Pas de surcharge', description: 'Aucun acteur n\'est surcharge', maxPoints: 10 },
          ],
        },
        {
          id: 'clarity',
          name: 'Clarte',
          weight: 25,
          criteria: [
            { label: 'Legende', description: 'La legende RACI est presente', maxPoints: 10 },
            { label: 'Lisibilite', description: 'La matrice est facile a lire', maxPoints: 15 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['Matrice RACI', "Plan de gestion des ressources"],
    },
    referenceExample: `# RACI — Exemple
12 activites, 6 acteurs. Chaque ligne a 1 A, regles respectees.
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
      "Strategie de communication du projet definissant les canaux, frequences et messages pour chaque partie prenante.",
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

[Definissez les objectifs globaux de la communication projet.]

## 2. Parties prenantes et besoins

| Partie prenante | Niveau d'interet | Niveau de pouvoir | Besoin d'information |
|---|---|---|---|
| {{sponsorName}} (Sponsor) | Eleve | Eleve | Avancement, decisions, risques |
| {{clientName}} (Client) | Eleve | Moyen | Livrables, jalons |
| Equipe projet | Eleve | Moyen | Taches, planning, decisions |
| [A completer] | [A completer] | [A completer] | [A completer] |

## 3. Matrice de communication

| Communication | Public cible | Frequence | Canal | Responsable | Contenu |
|---|---|---|---|---|---|
| COPIL | Sponsor, Direction | Mensuel | Reunion | {{userName}} | Dashboard KPIs, risques |
| Point equipe | Equipe projet | Hebdomadaire | Reunion | {{userName}} | Avancement, blocages |
| Rapport avancement | Sponsor, Client | Bi-mensuel | Email + doc | {{userName}} | KPIs, jalons, alertes |
| Newsletter projet | Toutes PP | Mensuel | Email | {{userName}} | Faits marquants |
| Alertes | Sponsor | Ad hoc | Email/Tel | {{userName}} | Risques critiques |

## 4. Modeles de communication

[Listez les templates de communication utilises.]

## 5. Outils

| Outil | Usage |
|---|---|
| [A completer] | Gestion de projet |
| [A completer] | Communication equipe |
| [A completer] | Partage de documents |

## 6. Escalade

[Definissez le processus d'escalade pour les problemes de communication.]
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'stakeholders',
          name: 'Parties prenantes',
          weight: 30,
          criteria: [
            { label: 'Identification', description: 'Les parties prenantes sont identifiees avec leur niveau', maxPoints: 15 },
            { label: 'Besoins', description: 'Les besoins de chaque PP sont definis', maxPoints: 15 },
          ],
        },
        {
          id: 'matrix',
          name: 'Matrice de communication',
          weight: 40,
          criteria: [
            { label: 'Completude', description: 'Toutes les communications sont listees', maxPoints: 20 },
            { label: 'Frequences', description: 'Les frequences sont adaptees aux besoins', maxPoints: 10 },
            { label: 'Canaux', description: 'Les canaux sont varies et adaptes', maxPoints: 10 },
          ],
        },
        {
          id: 'practicality',
          name: 'Aspect pratique',
          weight: 30,
          criteria: [
            { label: 'Outils', description: 'Les outils de communication sont identifies', maxPoints: 15 },
            { label: 'Escalade', description: 'Le processus d\'escalade est defini', maxPoints: 15 },
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
      "Strategie globale de gestion des risques : processus d'identification, analyse, reponse et suivi des risques.",
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

[Decrivez l'approche globale : proactive, iterative, quantitative/qualitative.]

## 2. Roles et responsabilites

| Role | Responsable | Activites |
|---|---|---|
| Risk Manager | {{userName}} | Coordination globale |
| Risk Owner | [Variable] | Suivi des risques assignes |
| Sponsor | {{sponsorName}} | Validation des strategies |

## 3. Categorisation des risques (RBS)

- **Technique** : Technologie, architecture, performance
- **Externe** : Marche, reglementation, fournisseurs
- **Organisationnel** : Ressources, priorites, budget
- **Gestion de projet** : Planning, perimetre, communication

## 4. Echelle de probabilite et impact

### Probabilite
| Niveau | Valeur | Description |
|---|---|---|
| Tres faible | 0.1 | < 10% de chance |
| Faible | 0.3 | 10-30% |
| Moyen | 0.5 | 30-50% |
| Eleve | 0.7 | 50-70% |
| Tres eleve | 0.9 | > 70% |

### Impact (sur cout/delai)
| Niveau | Valeur | Description |
|---|---|---|
| Negligeable | 0.05 | < 1% du budget/delai |
| Mineur | 0.1 | 1-5% |
| Modere | 0.2 | 5-10% |
| Majeur | 0.4 | 10-20% |
| Critique | 0.8 | > 20% |

## 5. Seuils de tolerances

- Risque critique (score > 0.5) : escalade immediate au sponsor
- Risque majeur (score 0.3-0.5) : plan de reponse obligatoire
- Risque modere (score 0.1-0.3) : surveillance active
- Risque faible (score < 0.1) : acceptation

## 6. Frequence de revue

| Activite | Frequence |
|---|---|
| Revue complete des risques | Bi-mensuelle |
| Mise a jour du registre | Hebdomadaire |
| Rapport risques au COPIL | Mensuel |

## 7. Budget risque

- Provision pour aleas : [A completer] % du budget
- Reserve de management : [A completer] % du budget
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'process',
          name: 'Processus de gestion',
          weight: 30,
          criteria: [
            { label: 'Approche', description: "L'approche est definie et justifiee", maxPoints: 15 },
            { label: 'Roles', description: 'Les roles sont clairement attribues', maxPoints: 15 },
          ],
        },
        {
          id: 'scales',
          name: 'Echelles et seuils',
          weight: 35,
          criteria: [
            { label: 'Probabilite', description: "L'echelle de probabilite est definie", maxPoints: 15 },
            { label: 'Impact', description: "L'echelle d'impact est definie", maxPoints: 10 },
            { label: 'Seuils', description: 'Les seuils de tolerance sont definis', maxPoints: 10 },
          ],
        },
        {
          id: 'operational',
          name: 'Aspect operationnel',
          weight: 35,
          criteria: [
            { label: 'Categorisation', description: 'Les categories de risques sont definies (RBS)', maxPoints: 15 },
            { label: 'Frequence', description: 'Les frequences de revue sont definies', maxPoints: 10 },
            { label: 'Budget', description: 'Le budget risque est prevu', maxPoints: 10 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['Plan de gestion des risques'],
    },
    referenceExample: `# Plan Risques — Exemple
Approche proactive, revue bi-mensuelle, 4 categories RBS.
Echelle 5 niveaux (probabilite et impact). Seuil escalade : score > 0.5.
Provision aleas 10%, reserve management 5%.
`,
  },

  // ─── 08. Plan d'Approvisionnement ─────────────────────────
  {
    id: 'seed-tpl-procurement-plan',
    title: "Plan d'Approvisionnement",
    type: 'procurement-plan',
    phase: 'PLANNING',
    description:
      "Plan des achats et sous-traitances du projet. Definit la strategie d'approvisionnement, les criteres de selection et le calendrier.",
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

| # | Besoin | Type | Estimation | Priorite |
|---|---|---|---|---|
| 1 | [A completer] | Achat / Sous-traitance | [A completer] | [A completer] |
| 2 | [A completer] | Achat / Sous-traitance | [A completer] | [A completer] |

## 2. Strategie d'approvisionnement

[Decrivez la strategie : faire vs acheter, type de contrat, processus de selection.]

### 2.1 Analyse Make or Buy
| Besoin | Faire en interne | Acheter / Sous-traiter | Decision |
|---|---|---|---|
| [A completer] | [Avantages/Inconvenients] | [Avantages/Inconvenients] | [A completer] |

## 3. Criteres de selection des fournisseurs

| Critere | Poids |
|---|---|
| Competence technique | [A completer]% |
| Prix | [A completer]% |
| Delais | [A completer]% |
| References | [A completer]% |

## 4. Calendrier d'approvisionnement

| Besoin | Publication AO | Reception offres | Selection | Contrat |
|---|---|---|---|---|
| [A completer] | [A completer] | [A completer] | [A completer] | [A completer] |

## 5. Types de contrats

[Definissez le type de contrat pour chaque approvisionnement : forfait, regie, etc.]
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'needs',
          name: 'Identification des besoins',
          weight: 30,
          criteria: [
            { label: 'Besoins identifies', description: 'Les besoins sont clairement listes', maxPoints: 15 },
            { label: 'Make or Buy', description: "L'analyse make/buy est realisee", maxPoints: 15 },
          ],
        },
        {
          id: 'strategy',
          name: 'Strategie',
          weight: 35,
          criteria: [
            { label: 'Criteres selection', description: 'Les criteres sont ponderes', maxPoints: 15 },
            { label: 'Types contrats', description: 'Les types de contrats sont definis', maxPoints: 20 },
          ],
        },
        {
          id: 'planning',
          name: 'Planification',
          weight: 35,
          criteria: [
            { label: 'Calendrier', description: 'Le calendrier est detaille', maxPoints: 20 },
            { label: 'Coherence', description: 'Coherent avec le planning projet', maxPoints: 15 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ["Plan de gestion des approvisionnements"],
    },
    referenceExample: `# Approvisionnement — Exemple
3 besoins identifies, analyse make/buy realisee. 2 sous-traitances, 1 achat.
Criteres : technique 40%, prix 30%, delais 20%, references 10%.
Contrats : 1 forfait, 1 regie plafonnee.
`,
  },

  // ─── 09. Plan de Gestion de la Qualite ────────────────────
  {
    id: 'seed-tpl-quality-plan',
    title: 'Plan de Gestion de la Qualite',
    type: 'quality-plan',
    phase: 'PLANNING',
    description:
      "Strategie d'assurance et de controle qualite du projet. Definit les normes, metriques et processus de validation.",
    pmiProcess: '8.1',
    difficulty: 'STANDARD',
    content: `# Plan de Gestion de la Qualite

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Code** | {{projectCode}} |
| **Chef de projet** | {{userName}} |
| **Date** | {{currentDate}} |

---

## 1. Politique qualite

[Definissez la politique qualite applicable au projet.]

## 2. Normes et standards applicables

| Norme | Description | Applicabilite |
|---|---|---|
| [A completer] | [A completer] | [A completer] |

## 3. Metriques qualite

| Metrique | Cible | Methode de mesure | Frequence |
|---|---|---|---|
| Taux de conformite des livrables | > 90% | Revue par les pairs | Par livrable |
| Nombre de defauts | < [A completer] | Tests | Continue |
| Satisfaction client | > 4/5 | Enquete | Fin de phase |

## 4. Assurance qualite (QA)

[Activites preventives pour garantir la qualite.]

| Activite QA | Frequence | Responsable |
|---|---|---|
| Revue de livrables | Par livrable | [A completer] |
| Audit de processus | Trimestriel | [A completer] |

## 5. Controle qualite (QC)

[Activites de verification et validation.]

| Activite QC | Critere d'acceptation | Responsable |
|---|---|---|
| [A completer] | [A completer] | [A completer] |

## 6. Amelioration continue

[Processus de retour d'experience et amelioration.]
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'standards',
          name: 'Normes et metriques',
          weight: 30,
          criteria: [
            { label: 'Normes', description: 'Les normes applicables sont identifiees', maxPoints: 15 },
            { label: 'Metriques', description: 'Les metriques qualite sont definies avec cibles', maxPoints: 15 },
          ],
        },
        {
          id: 'qa',
          name: 'Assurance qualite',
          weight: 35,
          criteria: [
            { label: 'Activites QA', description: 'Les activites preventives sont planifiees', maxPoints: 20 },
            { label: 'Responsabilites', description: 'Les responsables QA sont designes', maxPoints: 15 },
          ],
        },
        {
          id: 'qc',
          name: 'Controle qualite',
          weight: 35,
          criteria: [
            { label: 'Activites QC', description: 'Les activites de verification sont definies', maxPoints: 20 },
            { label: 'Criteres acceptation', description: "Les criteres d'acceptation sont clairs", maxPoints: 15 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['Plan de gestion de la qualite', 'Metriques qualite'],
    },
    referenceExample: `# Qualite — Exemple
Normes : ISO 9001, IEEE 830. 3 metriques cibles.
QA : revues par pairs, audits trimestriels.
QC : tests unitaires (couverture 80%), tests integration, recette utilisateur.
`,
  },

  // ─── 10. Plan de Gestion des Ressources ───────────────────
  {
    id: 'seed-tpl-resource-plan',
    title: 'Plan de Gestion des Ressources',
    type: 'resource-plan',
    phase: 'PLANNING',
    description:
      "Planification des ressources humaines et materielles. Definit les besoins, la disponibilite et la strategie d'acquisition.",
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

## 1. Equipe projet

{{teamMembers}}

## 2. Besoins en ressources par phase

| Phase | Ressources necessaires | Competences cles |
|---|---|---|
| Initiation | {{userName}} | Cadrage, communication |
| Planification | Equipe complete | Planification, estimation |
| Execution | [A completer] | [A completer] |
| Suivi | {{userName}} | Reporting, analyse |
| Cloture | Equipe reduite | Bilan, transfert |

## 3. Matrice des competences

| Competence | Niveau requis | Ressource assignee | Ecart |
|---|---|---|---|
| [A completer] | [A completer] | [A completer] | [A completer] |

## 4. Plan de formation

| Formation | Public | Date | Duree |
|---|---|---|---|
| [A completer] | [A completer] | [A completer] | [A completer] |

## 5. Calendrier des ressources

[Decrivez la disponibilite des ressources par periode.]

## 6. Gestion des conflits de ressources

[Processus de resolution des conflits d'allocation.]
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'identification',
          name: 'Identification des besoins',
          weight: 35,
          criteria: [
            { label: 'Equipe', description: "L'equipe est identifiee avec roles et competences", maxPoints: 20 },
            { label: 'Besoins par phase', description: 'Les besoins sont detailles par phase', maxPoints: 15 },
          ],
        },
        {
          id: 'skills',
          name: 'Competences',
          weight: 30,
          criteria: [
            { label: 'Matrice competences', description: 'Les ecarts de competences sont identifies', maxPoints: 15 },
            { label: 'Formation', description: 'Un plan de formation est prevu', maxPoints: 15 },
          ],
        },
        {
          id: 'planning',
          name: 'Planification',
          weight: 35,
          criteria: [
            { label: 'Calendrier', description: 'La disponibilite est planifiee', maxPoints: 20 },
            { label: 'Conflits', description: 'La gestion des conflits est prevue', maxPoints: 15 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['Plan de gestion des ressources', "Calendrier des ressources"],
    },
    referenceExample: `# Ressources — Exemple
8 membres, 12 competences mappees, 2 formations planifiees.
Pics de charge : sem 8-12 (execution). Conflit identifie : dev senior partage avec autre projet.
`,
  },

  // ─── 11. Ligne de Base du Perimetre ───────────────────────
  {
    id: 'seed-tpl-scope-baseline',
    title: 'Ligne de Base du Perimetre',
    type: 'scope-baseline',
    phase: 'PLANNING',
    description:
      "Reference approuvee du perimetre du projet. Comprend l'enonce du perimetre, le WBS et le dictionnaire WBS valides.",
    pmiProcess: '5.4',
    difficulty: 'STANDARD',
    content: `# Ligne de Base du Perimetre

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Code** | {{projectCode}} |
| **Chef de projet** | {{userName}} |
| **Date d'approbation** | {{currentDate}} |

---

## 1. Enonce du perimetre

### 1.1 Description du projet
> {{projectDescription}}

### 1.2 Objectifs du projet
[Listez les objectifs SMART du projet.]

### 1.3 Livrables
| # | Livrable | Description | Critere d'acceptation |
|---|---|---|---|
| 1 | [A completer] | [A completer] | [A completer] |

### 1.4 Exclusions
[Ce qui est explicitement hors perimetre.]

### 1.5 Contraintes
| Contrainte | Description |
|---|---|
| Budget | {{initialBudget}} |
| Delai | {{deadlineDays}} jours |
| [A completer] | [A completer] |

### 1.6 Hypotheses
[Listez les hypotheses de perimetre.]

## 2. WBS de reference

[Inserez ou referencez le WBS approuve.]

## 3. Approbation

| Nom | Role | Signature | Date |
|---|---|---|---|
| {{userName}} | Chef de projet | | {{currentDate}} |
| {{sponsorName}} | Sponsor | | |
| {{clientName}} | Client | | |
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'scope',
          name: 'Enonce du perimetre',
          weight: 40,
          criteria: [
            { label: 'Objectifs SMART', description: 'Les objectifs sont SMART', maxPoints: 15 },
            { label: 'Livrables', description: 'Les livrables et criteres sont definis', maxPoints: 15 },
            { label: 'Exclusions', description: 'Les exclusions sont claires', maxPoints: 10 },
          ],
        },
        {
          id: 'constraints',
          name: 'Contraintes et hypotheses',
          weight: 30,
          criteria: [
            { label: 'Contraintes', description: 'Les contraintes sont identifiees', maxPoints: 15 },
            { label: 'Hypotheses', description: 'Les hypotheses sont documentees', maxPoints: 15 },
          ],
        },
        {
          id: 'approval',
          name: 'Validation',
          weight: 30,
          criteria: [
            { label: 'WBS reference', description: 'Le WBS est inclus ou reference', maxPoints: 15 },
            { label: 'Approbation', description: 'Les approbations sont prevues', maxPoints: 15 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['Ligne de base du perimetre', 'Enonce du perimetre'],
    },
    referenceExample: `# Scope Baseline — Exemple
5 objectifs SMART, 8 livrables avec criteres d'acceptation.
3 exclusions, 4 contraintes, 5 hypotheses.
Approuve par CP, Sponsor et Client.
`,
  },

  // ─── 12. Plan de Gestion des Changements ──────────────────
  {
    id: 'seed-tpl-change-management-plan',
    title: 'Plan de Gestion des Changements',
    type: 'change-management-plan',
    phase: 'PLANNING',
    description:
      "Processus de gestion des demandes de changement. Definit les etapes d'evaluation, validation et implementation.",
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
2. **Analyse d'impact** : Le chef de projet analyse l'impact sur cout/delai/perimetre
3. **Evaluation** : Le comite de changement evalue la demande
4. **Decision** : Approuver, rejeter ou reporter
5. **Implementation** : Si approuvee, planifier et executer
6. **Verification** : Verifier la bonne mise en oeuvre

### 1.2 Comite de changement (CCB)

| Membre | Role | Pouvoir de decision |
|---|---|---|
| {{userName}} | Chef de projet | Recommandation |
| {{sponsorName}} | Sponsor | Approbation (impact > seuil) |
| {{clientName}} | Client | Validation perimetre |

### 1.3 Seuils de decision

| Impact | Decideur |
|---|---|
| < 5% du budget et < 1 semaine delai | Chef de projet |
| 5-15% du budget ou 1-3 semaines delai | Sponsor |
| > 15% du budget ou > 3 semaines delai | COPIL |

## 2. Formulaire de demande de changement

| Champ | Description |
|---|---|
| ID | Numero unique (CR-XXX) |
| Date | Date de soumission |
| Demandeur | Nom et role |
| Description | Description detaillee du changement |
| Justification | Raison de la demande |
| Impact cout | Estimation financiere |
| Impact delai | Impact sur le planning |
| Impact perimetre | Modification du perimetre |
| Priorite | Critique / Haute / Moyenne / Basse |
| Decision | Approuve / Rejete / Reporte |

## 3. Registre des changements

| ID | Date | Description | Impact | Statut | Decision |
|---|---|---|---|---|---|
| CR-001 | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] |

## 4. Indicateurs

- Nombre de demandes par periode
- Taux d'approbation
- Delai moyen de traitement
- Impact cumule sur budget/delai
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'process',
          name: 'Processus',
          weight: 35,
          criteria: [
            { label: 'Flux', description: 'Le flux de traitement est complet', maxPoints: 15 },
            { label: 'CCB', description: 'Le comite est defini avec pouvoirs', maxPoints: 10 },
            { label: 'Seuils', description: 'Les seuils de decision sont clairs', maxPoints: 10 },
          ],
        },
        {
          id: 'form',
          name: 'Formulaire et registre',
          weight: 35,
          criteria: [
            { label: 'Formulaire', description: 'Le formulaire est complet', maxPoints: 15 },
            { label: 'Registre', description: 'Le registre est structure', maxPoints: 10 },
            { label: 'Traçabilite', description: 'La traçabilite est assuree', maxPoints: 10 },
          ],
        },
        {
          id: 'indicators',
          name: 'Indicateurs',
          weight: 30,
          criteria: [
            { label: 'KPIs', description: 'Les indicateurs de suivi sont definis', maxPoints: 15 },
            { label: 'Pertinence', description: 'Les indicateurs sont pertinents', maxPoints: 15 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['Plan de gestion des changements', 'Registre des changements'],
    },
    referenceExample: `# Changements — Exemple
Flux en 6 etapes, CCB de 3 membres. Seuils : <5% CP, 5-15% Sponsor, >15% COPIL.
Formulaire 10 champs, registre avec traçabilite. 4 KPIs de suivi.
`,
  },

  // ─── 13. Cahier des Charges Technique ─────────────────────
  {
    id: 'seed-tpl-technical-specs',
    title: 'Cahier des Charges Technique',
    type: 'technical-specs',
    phase: 'PLANNING',
    description:
      "Specifications techniques detaillees du projet. Definit les exigences fonctionnelles, non-fonctionnelles et les contraintes techniques.",
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
[Definissez les objectifs techniques du projet.]

## 2. Exigences fonctionnelles

| ID | Exigence | Priorite | Critere d'acceptation |
|---|---|---|---|
| EF-001 | [A completer] | Obligatoire | [A completer] |
| EF-002 | [A completer] | Souhaitable | [A completer] |

## 3. Exigences non-fonctionnelles

### 3.1 Performance
| Metrique | Cible |
|---|---|
| [A completer] | [A completer] |

### 3.2 Securite
[Exigences de securite.]

### 3.3 Disponibilite
[Exigences de disponibilite et SLA.]

### 3.4 Evolutivite
[Exigences de scalabilite et maintenabilite.]

## 4. Architecture technique

[Decrivez l'architecture cible : composants, flux, technologies.]

## 5. Contraintes techniques

| Contrainte | Description | Impact |
|---|---|---|
| [A completer] | [A completer] | [A completer] |

## 6. Interfaces

[Decrivez les interfaces avec les systemes existants.]

## 7. Plan de tests

| Type de test | Perimetre | Critere de succes |
|---|---|---|
| Unitaire | [A completer] | [A completer] |
| Integration | [A completer] | [A completer] |
| Acceptation | [A completer] | [A completer] |

## 8. Approbation

| Nom | Role | Date |
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
            { label: 'Completude', description: 'Les exigences sont completes et priorisees', maxPoints: 15 },
            { label: 'Criteres acceptation', description: 'Chaque exigence a un critere', maxPoints: 15 },
          ],
        },
        {
          id: 'nonfunctional',
          name: 'Exigences non-fonctionnelles',
          weight: 25,
          criteria: [
            { label: 'Performance', description: 'Les metriques de performance sont definies', maxPoints: 10 },
            { label: 'Securite/Dispo', description: 'Securite et disponibilite sont adressees', maxPoints: 15 },
          ],
        },
        {
          id: 'architecture',
          name: 'Architecture',
          weight: 25,
          criteria: [
            { label: 'Architecture', description: "L'architecture est decrite", maxPoints: 15 },
            { label: 'Interfaces', description: 'Les interfaces sont identifiees', maxPoints: 10 },
          ],
        },
        {
          id: 'testing',
          name: 'Plan de tests',
          weight: 20,
          criteria: [
            { label: 'Strategie tests', description: 'Le plan de tests est defini', maxPoints: 10 },
            { label: 'Criteres succes', description: 'Les criteres de succes sont clairs', maxPoints: 10 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['Enonce du perimetre du projet', 'Documentation des exigences'],
    },
    referenceExample: `# Specs Techniques — Exemple
15 exigences fonctionnelles (8 obligatoires, 7 souhaitables).
NFR : temps reponse < 200ms, SLA 99.9%, chiffrement AES-256.
Architecture microservices, 3 interfaces externes.
Tests : unitaires (80% couverture), integration, performance, acceptation.
`,
  },
];
