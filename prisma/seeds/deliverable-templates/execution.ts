import type { DeliverableTemplateData } from './types';

export const executionTemplates: DeliverableTemplateData[] = [
  // ─── 01. Suivi des Actions ──────────────────────────────────
  {
    id: 'seed-tpl-action-tracker',
    title: 'Suivi des Actions',
    type: 'action-tracker',
    phase: 'EXECUTION',
    description:
      "Tableau de suivi des actions identifiées lors des réunions et des revues de projet. Permet de tracer chaque action, son responsable, sa priorité et son statut.",
    pmiProcess: '4.3',
    difficulty: 'DISCOVERY',
    content: `# Suivi des Actions

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Code** | {{projectCode}} |
| **Chef de projet** | {{userName}} |
| **Date de mise à jour** | {{currentDate}} |

---

## Historique des versions

| Version | Auteur | Description | Date |
|---|---|---|---|
| 1.0 | {{userName}} | Création initiale | {{currentDate}} |

---

## 1. Registre des actions

| ID | Action | Responsable | Priorité | Date création | Échéance | Statut | Commentaire |
|---|---|---|---|---|---|---|---|
| A01 | [Décrire l'action à réaliser] | [Nom du responsable] | Haute/Moyenne/Basse | {{currentDate}} | [JJ/MM/AAAA] | À faire | [À compléter] |
| A02 | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] | À faire | [À compléter] |
| A03 | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] | À faire | [À compléter] |
| A04 | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] | À faire | [À compléter] |
| A05 | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] | À faire | [À compléter] |

### Légende des statuts
- **À faire** : Action identifiée, non démarrée
- **En cours** : Action en cours de réalisation
- **Terminée** : Action réalisée et validée
- **En retard** : Échéance dépassée, action non terminée
- **Annulée** : Action annulée (justification requise)

### Légende des priorités
- **Haute** : Impact direct sur le chemin critique ou les livrables majeurs
- **Moyenne** : Impact sur la qualité ou l'efficacité du projet
- **Basse** : Amélioration ou optimisation sans impact immédiat

## 2. Synthèse des actions

| Statut | Nombre | Pourcentage |
|---|---|---|
| À faire | [X] | [X]% |
| En cours | [X] | [X]% |
| Terminée | [X] | [X]% |
| En retard | [X] | [X]% |
| Annulée | [X] | [X]% |
| **Total** | **[X]** | **100%** |

## 3. Actions en retard (alertes)

[Listez les actions en retard avec la justification du retard et le nouveau délai prévu.]

| ID | Action | Responsable | Échéance initiale | Retard (jours) | Justification | Nouvelle échéance |
|---|---|---|---|---|---|---|
| [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] |
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'completeness',
          name: 'Complétude du registre',
          weight: 30,
          criteria: [
            { label: 'Actions identifiées', description: 'Au moins 5 actions sont identifiées avec une description claire et précise', maxPoints: 15 },
            { label: 'Champs renseignés', description: 'Chaque action a tous les champs remplis (responsable, priorité, dates, statut)', maxPoints: 15 },
          ],
        },
        {
          id: 'prioritization',
          name: 'Priorisation et cohérence',
          weight: 25,
          criteria: [
            { label: 'Priorités justifiées', description: 'Les priorités sont cohérentes avec l\'impact sur le projet', maxPoints: 15 },
            { label: 'Échéances réalistes', description: 'Les échéances sont réalistes et cohérentes avec le planning du projet', maxPoints: 10 },
          ],
        },
        {
          id: 'tracking',
          name: 'Suivi et synthèse',
          weight: 25,
          criteria: [
            { label: 'Synthèse à jour', description: 'Le tableau de synthèse est rempli et les pourcentages sont corrects', maxPoints: 15 },
            { label: 'Alertes retard', description: 'Les actions en retard sont identifiées avec justification et nouveau délai', maxPoints: 10 },
          ],
        },
        {
          id: 'quality',
          name: 'Qualité de rédaction',
          weight: 20,
          criteria: [
            { label: 'Descriptions actionnables', description: 'Les descriptions d\'actions sont claires, précises et actionnables (verbe d\'action)', maxPoints: 10 },
            { label: 'Commentaires pertinents', description: 'Les commentaires apportent de la valeur ajoutée (contexte, blocages, dépendances)', maxPoints: 10 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['4.3.3.1 Deliverables', '4.3.3.2 Work Performance Data'],
    },
    referenceExample: `# Suivi des Actions — SAP30/CMRL

| ID | Action | Responsable | Priorité | Création | Échéance | Statut | Commentaire |
|---|---|---|---|---|---|---|---|
| A01 | Commander licences SAP S/4HANA | DSI | Haute | 15/01 | 31/01 | Terminée | PO émis le 20/01, livraison confirmée |
| A02 | Planifier formation key users FI/CO | RH | Haute | 15/01 | 15/02 | En cours | 12 users identifiés, salle réservée |
| A03 | Réaliser PoC interface legacy | Architecte | Haute | 20/01 | 28/02 | En cours | Environnement de test prêt |
| A04 | Définir stratégie migration données | DBA | Moyenne | 22/01 | 15/02 | À faire | Réunion prévue le 01/02 |
| A05 | Mettre à jour documentation sécurité | RSSI | Basse | 25/01 | 31/03 | À faire | Attente normes internes |
`,
  },

  // ─── 02. Suivi des Livrables ────────────────────────────────
  {
    id: 'seed-tpl-deliverable-tracker',
    title: 'Suivi des Livrables',
    type: 'deliverable-tracker',
    phase: 'EXECUTION',
    description:
      "Tableau de suivi de l'avancement des livrables du projet. Permet de tracer la production, la qualité et le respect des échéances de chaque livrable.",
    pmiProcess: '4.3',
    difficulty: 'DISCOVERY',
    content: `# Suivi des Livrables

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Code** | {{projectCode}} |
| **Chef de projet** | {{userName}} |
| **Date de mise à jour** | {{currentDate}} |

---

## Historique des versions

| Version | Auteur | Description | Date |
|---|---|---|---|
| 1.0 | {{userName}} | Création initiale | {{currentDate}} |

---

## 1. Registre des livrables

| ID | Livrable | Phase | Responsable | Date prévue | Date réelle | Statut | Qualité |
|---|---|---|---|---|---|---|---|
| L01 | [Nom du livrable] | Initiation | [Responsable] | [JJ/MM/AAAA] | [JJ/MM/AAAA ou -] | À produire | Non évalué |
| L02 | [À compléter] | Planification | [À compléter] | [À compléter] | [À compléter] | À produire | Non évalué |
| L03 | [À compléter] | Exécution | [À compléter] | [À compléter] | [À compléter] | À produire | Non évalué |
| L04 | [À compléter] | Exécution | [À compléter] | [À compléter] | [À compléter] | À produire | Non évalué |
| L05 | [À compléter] | Clôture | [À compléter] | [À compléter] | [À compléter] | À produire | Non évalué |

### Légende des statuts
- **À produire** : Livrable planifié, non démarre
- **En cours** : Livrable en cours de production
- **En revue** : Livrable soumis pour revue/validation
- **Validé** : Livrable approuvé par le destinataire
- **Rejeté** : Livrable rejeté, nécessitant des corrections
- **En retard** : Échéance dépassée

### Légende qualité
- **Non évalué** : Livrable non encore soumis
- **Conforme** : Répond aux critères d'acceptation
- **À améliorer** : Écarts mineurs identifiés
- **Non conforme** : Écarts majeurs, reprise nécessaire

## 2. Synthèse d'avancement

| Phase | Total livrables | Valides | En cours | En retard | Taux de complétion |
|---|---|---|---|---|---|
| Initiation | [X] | [X] | [X] | [X] | [X]% |
| Planification | [X] | [X] | [X] | [X] | [X]% |
| Exécution | [X] | [X] | [X] | [X] | [X]% |
| Clôture | [X] | [X] | [X] | [X] | [X]% |
| **Total** | **[X]** | **[X]** | **[X]** | **[X]** | **[X]%** |

## 3. Livrables critiques et alertes

[Identifiez les livrables en retard ou rejetés et les actions correctives prévues.]

| ID | Livrable | Problème | Impact | Action corrective | Responsable | Délai |
|---|---|---|---|---|---|---|
| [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] |
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'completeness',
          name: 'Complétude du registre',
          weight: 30,
          criteria: [
            { label: 'Livrables identifiés', description: 'Tous les livrables du projet sont listes avec leur phase associée', maxPoints: 15 },
            { label: 'Champs renseignés', description: 'Chaque livrable a un responsable, des dates prévues et un statut', maxPoints: 15 },
          ],
        },
        {
          id: 'tracking',
          name: 'Suivi et qualité',
          weight: 30,
          criteria: [
            { label: 'Statuts à jour', description: 'Les statuts reflètent l\'état réel d\'avancement des livrables', maxPoints: 15 },
            { label: 'Évaluation qualité', description: 'La qualité de chaque livrable soumis est évaluée', maxPoints: 15 },
          ],
        },
        {
          id: 'synthesis',
          name: 'Synthèse et alertes',
          weight: 25,
          criteria: [
            { label: 'Tableau de synthèse', description: 'La synthèse par phase est complète avec les taux de complétion', maxPoints: 15 },
            { label: 'Alertes documentées', description: 'Les livrables en retard ou rejetés sont documentés avec actions correctives', maxPoints: 10 },
          ],
        },
        {
          id: 'coherence',
          name: 'Cohérence globale',
          weight: 15,
          criteria: [
            { label: 'Alignement planning', description: 'Les dates prévues sont cohérentes avec le planning du projet', maxPoints: 8 },
            { label: 'Couverture des phases', description: 'Toutes les phases du projet ont au moins un livrable associé', maxPoints: 7 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['4.3.3.1 Deliverables', '4.3.3.2 Work Performance Data'],
    },
    referenceExample: `# Suivi des Livrables — SAP30/CMRL

| ID | Livrable | Phase | Responsable | Prévue | Réelle | Statut | Qualité |
|---|---|---|---|---|---|---|---|
| L01 | Étude d'opportunité | Initiation | Chef de projet | 15/01 | 14/01 | Validé | Conforme |
| L02 | Charte projet | Initiation | Chef de projet | 31/01 | 30/01 | Validé | Conforme |
| L03 | Cahier des charges fonctionnel | Planification | Analyste métier | 28/02 | 05/03 | Validé | À améliorer |
| L04 | Spécifications techniques | Planification | Architecte | 15/03 | - | En cours | Non évalué |
| L05 | Module FI migré | Exécution | Consultant SAP | 30/06 | - | À produire | Non évalué |
| L06 | Module CO migré | Exécution | Consultant SAP | 15/07 | - | À produire | Non évalué |
| L07 | PV de recette | Clôture | Chef de projet | 15/12 | - | À produire | Non évalué |
`,
  },

  // ─── 03. Compte-Rendu de Reunion ────────────────────────────
  {
    id: 'seed-tpl-meeting-minutes',
    title: 'Compte-Rendu de Réunion',
    type: 'meeting-minutes',
    phase: 'EXECUTION',
    description:
      "Document officiel de suivi des réunions de projet. Consigne les participants, les échanges, les décisions prises et les actions à mener.",
    pmiProcess: '10.2',
    difficulty: 'DISCOVERY',
    content: `# Compte-Rendu de Réunion

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Code** | {{projectCode}} |
| **Date** | {{currentDate}} |
| **Lieu** | [Salle / Visioconférence] |
| **Animateur** | {{userName}} |
| **Rédacteur** | {{userName}} |

---

## 1. Participants

| Nom | Fonction | Present | Excuse |
|---|---|---|---|
| {{userName}} | Chef de projet | X | |
| {{sponsorName}} | Sponsor | [X ou -] | [X ou -] |
| [À compléter] | [À compléter] | [X ou -] | [X ou -] |
| [À compléter] | [À compléter] | [X ou -] | [X ou -] |

## 2. Objectif de la réunion

[Décrivez en une ou deux phrases l'objectif principal de cette réunion.]

## 3. Ordre du jour

| # | Sujet | Durée prévue | Présentateur |
|---|---|---|---|
| 1 | [À compléter] | [X] min | [Nom] |
| 2 | [À compléter] | [X] min | [Nom] |
| 3 | [À compléter] | [X] min | [Nom] |
| 4 | Questions diverses | [X] min | Tous |

## 4. Échanges par sujet

### Sujet 1 : [Titre]
[Résumez les points discutés, les arguments avances et les conclusions. Mentionnez les intervenants principaux.]

### Sujet 2 : [Titre]
[Résumez les points discutés, les arguments avances et les conclusions.]

### Sujet 3 : [Titre]
[Résumez les points discutés, les arguments avances et les conclusions.]

## 5. Décisions prises

| # | Décision | Proposée par | Validée par |
|---|---|---|---|
| D1 | [À compléter] | [Nom] | [Nom(s)] |
| D2 | [À compléter] | [Nom] | [Nom(s)] |

## 6. Actions à mener

| # | Action | Responsable | Échéance | Priorité |
|---|---|---|---|---|
| A1 | [À compléter] | [Nom] | [JJ/MM/AAAA] | Haute/Moyenne/Basse |
| A2 | [À compléter] | [Nom] | [JJ/MM/AAAA] | [À compléter] |
| A3 | [À compléter] | [Nom] | [JJ/MM/AAAA] | [À compléter] |

## 7. Prochaine réunion

| Champ | Valeur |
|---|---|
| **Date** | [JJ/MM/AAAA] |
| **Heure** | [HH:MM] |
| **Lieu** | [À confirmer] |
| **Ordre du jour prévisionnel** | [À compléter] |
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'participants-objective',
          name: 'Participants et objectif',
          weight: 15,
          criteria: [
            { label: 'Liste complète', description: 'Tous les participants et excuses sont listés avec leur fonction', maxPoints: 8 },
            { label: 'Objectif clair', description: 'L\'objectif de la réunion est clairement énoncé', maxPoints: 7 },
          ],
        },
        {
          id: 'discussions',
          name: 'Échanges et sujets',
          weight: 30,
          criteria: [
            { label: 'Ordre du jour suivi', description: 'Chaque sujet de l\'ordre du jour est traite dans les échanges', maxPoints: 10 },
            { label: 'Synthèse fidèle', description: 'Les échanges sont résumés de manière neutre et complète', maxPoints: 10 },
            { label: 'Intervenants cites', description: 'Les intervenants principaux sont mentionnés pour chaque sujet', maxPoints: 10 },
          ],
        },
        {
          id: 'decisions',
          name: 'Décisions',
          weight: 25,
          criteria: [
            { label: 'Décisions claires', description: 'Les décisions sont formulées sans ambiguïté', maxPoints: 15 },
            { label: 'Validation tracée', description: 'Chaque décision indique qui l\'a proposée et validée', maxPoints: 10 },
          ],
        },
        {
          id: 'actions-next',
          name: 'Actions et suite',
          weight: 30,
          criteria: [
            { label: 'Actions concrètes', description: 'Les actions sont précises avec responsable et échéance', maxPoints: 15 },
            { label: 'Prochaine réunion', description: 'La date, le lieu et l\'ordre du jour de la prochaine réunion sont prévus', maxPoints: 15 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['10.2.3.1 Project Communications', '10.2.3.2 Project Management Plan Updates'],
    },
    referenceExample: `# Compte-Rendu — Comité Projet SAP30/CMRL — 15/02

## Participants
| Nom | Fonction | Present |
|---|---|---|
| Mme Martin | Chef de projet | X |
| M. Leroy | DSI | X |
| Mme Duval | Consultante SAP | X |
| M. Petit | DBA | Excuse |

## Objectif
Valider l'avancement de la phase de spécification et arbitrer les choix d'interfaces.

## Échanges
### Migration module FI
Mme Duval présente l'avancement : 80% des spécifications validées. Point de blocage sur l'interface avec le système de paie — 2 options techniques identifiées (API REST vs batch nocturne).

### Planning formation
M. Leroy confirme la disponibilité de la salle de formation du 01/03 au 15/03. 12 key users inscrits.

## Décisions
| # | Décision | Validée par |
|---|---|---|
| D1 | Interface paie via API REST (temps réel) | DSI + Chef de projet |
| D2 | Formation en 2 groupes de 6 utilisateurs | Chef de projet |

## Actions
| # | Action | Responsable | Échéance |
|---|---|---|---|
| A1 | Finaliser spécifications interface paie | Mme Duval | 22/02 |
| A2 | Envoyer convocations formation | RH | 20/02 |
`,
  },

  // ─── 04. Minutes du Comite de Pilotage ──────────────────────
  {
    id: 'seed-tpl-steering-minutes',
    title: 'Minutes du Comité de Pilotage',
    type: 'steering-minutes',
    phase: 'EXECUTION',
    description:
      "Compte-rendu formel du comité de pilotage (COPIL). Présente la synthèse de l'avancement, les prévisions, les problèmes, les risques, le budget (EVM) et les décisions stratégiques.",
    pmiProcess: '10.2',
    difficulty: 'STANDARD',
    content: `# Minutes du Comité de Pilotage (COPIL)

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Code** | {{projectCode}} |
| **COPIL n°** | [Numéro] |
| **Date** | {{currentDate}} |
| **Prochain COPIL** | [JJ/MM/AAAA] |

---

## Historique des versions

| Version | Auteur | Description | Date |
|---|---|---|---|
| 1.0 | {{userName}} | Création initiale | {{currentDate}} |

---

## 1. Note de synthèse

[Résumez en quelques lignes la situation globale du projet : avancement, tendance, points d'attention majeurs. Utilisez un code couleur : VERT (conforme), ORANGE (vigilance), ROUGE (alerte).]

**Statut global** : [VERT / ORANGE / ROUGE]

| Dimension | Statut | Commentaire |
|---|---|---|
| Périmètre | [VERT/ORANGE/ROUGE] | [À compléter] |
| Délais | [VERT/ORANGE/ROUGE] | [À compléter] |
| Budget | [VERT/ORANGE/ROUGE] | [À compléter] |
| Qualité | [VERT/ORANGE/ROUGE] | [À compléter] |
| Ressources | [VERT/ORANGE/ROUGE] | [À compléter] |

## 2. Avancement du projet

### 2.1 Progression par phase

| Phase | Avancement | Commentaire |
|---|---|---|
| Initiation | [X]% | [À compléter] |
| Planification | [X]% | [À compléter] |
| Exécution | [X]% | [À compléter] |
| Clôture | [X]% | [À compléter] |

### 2.2 Jalons

| Jalon | Date prévue | Date réelle/prévisionnelle | Statut |
|---|---|---|---|
| [À compléter] | [JJ/MM/AAAA] | [JJ/MM/AAAA] | Atteint/En cours/En retard |
| [À compléter] | [JJ/MM/AAAA] | [JJ/MM/AAAA] | [À compléter] |

## 3. Prévisions

[Présentez les prévisions pour la prochaine période : activités planifiées, livrables attendus, jalons à venir.]

| Activité | Responsable | Date prévue | Dépendances |
|---|---|---|---|
| [À compléter] | [À compléter] | [À compléter] | [À compléter] |

## 4. Problèmes et points de blocage

| # | Problème | Impact | Sévérité | Action en cours | Responsable | Échéance |
|---|---|---|---|---|---|---|
| P1 | [À compléter] | [À compléter] | Critique/Majeur/Mineur | [À compléter] | [À compléter] | [À compléter] |
| P2 | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] |

## 5. Risques

| ID | Risque | Probabilité | Impact | Criticité | Action d'atténuation | Responsable |
|---|---|---|---|---|---|---|
| R01 | [À compléter] | [1-5] | [1-5] | [P x I] | [À compléter] | [À compléter] |
| R02 | [À compléter] | [1-5] | [1-5] | [P x I] | [À compléter] | [À compléter] |

## 6. Suivi budgétaire (Earned Value Management)

| Indicateur | Valeur | Commentaire |
|---|---|---|
| **Budget total (BAC)** | {{initialBudget}} EUR | Budget à l'achèvement |
| **Valeur planifiée (PV)** | [X] EUR | Travail planifié à ce jour |
| **Valeur acquise (EV)** | [X] EUR | Travail effectivement réalisé |
| **Coût réel (AC)** | [X] EUR | Dépenses réelles à ce jour |
| **Écart coût (CV = EV - AC)** | [X] EUR | Positif = sous le budget |
| **Écart délai (SV = EV - PV)** | [X] EUR | Positif = en avance |
| **Indice performance coût (CPI)** | [X] | > 1 = sous le budget |
| **Indice performance délai (SPI)** | [X] | > 1 = en avance |
| **Estimation à l'achèvement (EAC)** | [X] EUR | Coût total prévu |

## 7. Décisions du COPIL

| # | Décision | Impact | Proposée par | Validée par |
|---|---|---|---|---|
| D1 | [À compléter] | [À compléter] | [Nom] | COPIL |
| D2 | [À compléter] | [À compléter] | [Nom] | COPIL |

## 8. Prochaine réunion

| Champ | Valeur |
|---|---|
| **Date** | [JJ/MM/AAAA] |
| **Ordre du jour prévisionnel** | [À compléter] |
| **Documents à préparer** | [À compléter] |
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'executive-summary',
          name: 'Note de synthèse',
          weight: 15,
          criteria: [
            { label: 'Synthèse claire', description: 'La situation globale est résumée avec un code couleur par dimension', maxPoints: 10 },
            { label: 'Tendance identifiée', description: 'La tendance (amélioration / dégradation / stable) est visible', maxPoints: 5 },
          ],
        },
        {
          id: 'progress',
          name: 'Avancement et prévisions',
          weight: 20,
          criteria: [
            { label: 'Progression chiffrée', description: 'L\'avancement par phase est quantifié en pourcentage', maxPoints: 10 },
            { label: 'Jalons tracés', description: 'Les jalons sont listes avec dates prévues vs réelles', maxPoints: 5 },
            { label: 'Prévisions détaillées', description: 'Les activités de la prochaine période sont identifiées', maxPoints: 5 },
          ],
        },
        {
          id: 'issues-risks',
          name: 'Problèmes et risques',
          weight: 20,
          criteria: [
            { label: 'Problèmes documentés', description: 'Les points de blocage sont décrits avec impact, sévérité et actions', maxPoints: 10 },
            { label: 'Risques à jour', description: 'Les risques sont actualisés avec probabilité, impact et actions d\'atténuation', maxPoints: 10 },
          ],
        },
        {
          id: 'budget-evm',
          name: 'Suivi budgétaire (EVM)',
          weight: 25,
          criteria: [
            { label: 'Indicateurs EVM', description: 'Les indicateurs PV, EV, AC, CV, SV, CPI, SPI sont calculés', maxPoints: 15 },
            { label: 'Interprétation', description: 'Les indicateurs sont interprétés avec commentaires (tendance, prévisions)', maxPoints: 10 },
          ],
        },
        {
          id: 'decisions',
          name: 'Décisions et suite',
          weight: 20,
          criteria: [
            { label: 'Décisions formalisées', description: 'Les décisions sont claires avec impact et validation du COPIL', maxPoints: 10 },
            { label: 'Prochaine réunion', description: 'La date et l\'ordre du jour du prochain COPIL sont définis', maxPoints: 10 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['10.2.3.1 Project Communications', '4.5.3.1 Work Performance Reports'],
    },
    referenceExample: `# COPIL n°3 — SAP30/CMRL — 15/03

## Note de synthèse
Le projet est globalement conforme au planning. Le module FI est migré à 90%. Un point de vigilance sur le budget prestataires (+8% par rapport au prévisionnel). Le risque de résistance au changement est en hausse suite au sondage interne.

**Statut global** : ORANGE

| Dimension | Statut |
|---|---|
| Périmètre | VERT |
| Délais | VERT |
| Budget | ORANGE (+8%) |
| Qualité | VERT |

## EVM
| Indicateur | Valeur |
|---|---|
| BAC | 515 000 EUR |
| PV | 205 000 EUR |
| EV | 195 000 EUR |
| AC | 210 000 EUR |
| CPI | 0.93 |
| SPI | 0.95 |
| EAC | 554 000 EUR |

*CPI < 1 : dépassement budgétaire de 7%. Actions correctives en cours (renégociation contrat prestataire).*

## Décisions
| # | Décision |
|---|---|
| D1 | Renforcer la conduite du changement : 2 ateliers supplémentaires |
| D2 | Renégocier le contrat prestataire pour plafonner les dépassements |
`,
  },

  // ─── 05. Registre des Demandes de Changement ────────────────
  {
    id: 'seed-tpl-change-request',
    title: 'Registre des Demandes de Changement',
    type: 'change-request',
    phase: 'EXECUTION',
    description:
      "Registre centralisé de toutes les demandes de changement du projet. Documente la justification, l'analyse d'impact (coût, délai, périmètre) et la décision pour chaque demande.",
    pmiProcess: '4.6',
    difficulty: 'STANDARD',
    content: `# Registre des Demandes de Changement

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Code** | {{projectCode}} |
| **Chef de projet** | {{userName}} |
| **Date de mise à jour** | {{currentDate}} |

---

## Historique des versions

| Version | Auteur | Description | Date |
|---|---|---|---|
| 1.0 | {{userName}} | Création initiale | {{currentDate}} |

---

## 1. Registre des changements

| ID | Demandeur | Date | Description | Justification | Impact Coût | Impact Délai | Impact Périmètre | Priorité | Décision | Statut |
|---|---|---|---|---|---|---|---|---|---|---|
| CR01 | [Nom] | {{currentDate}} | [Décrire le changement demande] | [Pourquoi ce changement est nécessaire] | [+X EUR / Neutre] | [+X jours / Neutre] | [Extension / Réduction / Neutre] | Haute/Moyenne/Basse | En attente | Soumise |
| CR02 | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] | En attente | Soumise |
| CR03 | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] | En attente | Soumise |

### Légende des décisions
- **En attente** : Demande en cours d'analyse
- **Approuvée** : Changement approuvé par le COPIL/sponsor
- **Rejetée** : Changement rejeté (justification requise)
- **Différée** : Reportée à une phase ultérieure
- **Annulée** : Demande annulée par le demandeur

### Légende des statuts
- **Soumise** : Demande déposée, en attente d'analyse
- **En analyse** : Analyse d'impact en cours
- **Décidée** : Décision prise (approuvée, rejetée ou différée)
- **Implémentée** : Changement approuvé et mis en œuvre
- **Clôturée** : Changement vérifié et clôture

## 2. Analyse d'impact détaillée

### CR01 — [Titre du changement]

**Demandeur** : [Nom] — **Date** : {{currentDate}}

**Description** : [Description détaillée du changement]

**Justification** : [Pourquoi ce changement est nécessaire, risques si non traite]

| Dimension | Impact | Détail |
|---|---|---|
| Coût | [+X EUR / Neutre] | [Détailler les coûts supplémentaires] |
| Délai | [+X jours / Neutre] | [Impact sur le planning et les jalons] |
| Périmètre | [Extension / Réduction / Neutre] | [Ce qui est ajouté/retiré du périmètre] |
| Qualité | [Positif / Neutre / Négatif] | [Impact sur la qualité des livrables] |
| Risques | [Nouveaux risques identifiés] | [Décrire les risques induits] |

**Recommandation** : [Approuver / Rejeter / Différer — avec justification]

## 3. Synthèse des changements

| Statut | Nombre | Impact coût cumulé | Impact délai cumulé |
|---|---|---|---|
| Approuvées | [X] | [+X EUR] | [+X jours] |
| Rejetées | [X] | - | - |
| En attente | [X] | [X EUR potentiel] | [X jours potentiel] |
| **Total** | **[X]** | **[X EUR]** | **[X jours]** |
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'completeness',
          name: 'Complétude du registre',
          weight: 25,
          criteria: [
            { label: 'Demandes documentées', description: 'Chaque demande a un ID, demandeur, date, description et justification', maxPoints: 15 },
            { label: 'Statuts tracés', description: 'Chaque demande a un statut et une décision clairement indiqués', maxPoints: 10 },
          ],
        },
        {
          id: 'impact-analysis',
          name: 'Analyse d\'impact',
          weight: 35,
          criteria: [
            { label: 'Triple contrainte', description: 'L\'impact sur coût, délai et périmètre est évalué pour chaque demande', maxPoints: 15 },
            { label: 'Analyse détaillée', description: 'Au moins une demande a une analyse d\'impact approfondie avec recommandation', maxPoints: 10 },
            { label: 'Risques induits', description: 'Les nouveaux risques liés au changement sont identifiés', maxPoints: 10 },
          ],
        },
        {
          id: 'decision-process',
          name: 'Processus de décision',
          weight: 25,
          criteria: [
            { label: 'Priorités cohérentes', description: 'Les priorités sont justifiées par rapport a l\'impact', maxPoints: 10 },
            { label: 'Décisions tracées', description: 'Les décisions sont documentées avec le décideur et la justification', maxPoints: 15 },
          ],
        },
        {
          id: 'synthesis',
          name: 'Synthèse',
          weight: 15,
          criteria: [
            { label: 'Cumul des impacts', description: 'L\'impact cumulé des changements approuvés est calculé (coût + délai)', maxPoints: 15 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['4.6.3.1 Approved Change Requests', '4.6.3.2 Change Log'],
    },
    referenceExample: `# Registre des Changements — SAP30/CMRL

| ID | Demandeur | Description | Impact Coût | Impact Délai | Décision | Statut |
|---|---|---|---|---|---|---|
| CR01 | DG | Ajout module QM (Qualité) | +45 000 EUR | +15 jours | Approuvée | Implémentée |
| CR02 | Finance | Report migration données historiques > 5 ans | -15 000 EUR | -5 jours | Approuvée | Implémentée |
| CR03 | DSI | Migration serveur on-premise → Cloud | +80 000 EUR | +30 jours | Rejetée | Clôturée |
| CR04 | RH | Ajout 10 utilisateurs supplémentaires à former | +8 000 EUR | +3 jours | Approuvée | En cours |

**Impact cumulé approuvé** : +38 000 EUR, +13 jours
**Nouveau budget** : 553 000 EUR — **Nouveau délai** : +13 jours
`,
  },

  // ─── 06. Strategie de Tests ─────────────────────────────────
  {
    id: 'seed-tpl-test-strategy',
    title: 'Stratégie de Tests',
    type: 'test-strategy',
    phase: 'EXECUTION',
    description:
      "Document définissant la stratégie de tests du projet basée sur la méthodologie AMDEC. Couvre les objectifs, l'analyse des risques, la répartition des tests par niveau et les plans de tests.",
    pmiProcess: '8.3',
    difficulty: 'ADVANCED',
    content: `# Stratégie de Tests

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Code** | {{projectCode}} |
| **Chef de projet** | {{userName}} |
| **Responsable tests** | [À compléter] |
| **Date** | {{currentDate}} |

---

## Historique des versions

| Version | Auteur | Description | Date |
|---|---|---|---|
| 1.0 | {{userName}} | Création initiale | {{currentDate}} |

---

## 1. Objectifs de la stratégie de tests

[Définissez les objectifs généraux de la démarche de tests : assurer la qualité, détecter les défauts, valider la conformité aux exigences.]

- Garantir la conformité fonctionnelle des livrables aux spécifications
- Détecter et corriger les défauts avant la mise en production
- Valider les performances et la sécurité du système
- Fournir une couverture de tests traçable aux exigences

## 2. Généralités

### 2.1 Périmètre des tests

| Élément | En périmètre | Hors périmètre |
|---|---|---|
| [À compléter] | X | |
| [À compléter] | | X |

### 2.2 Environnements de test

| Environnement | Usage | Responsable | Disponibilité |
|---|---|---|---|
| Développement | Tests unitaires | Équipe dev | Continu |
| Intégration | Tests d'intégration | Équipe test | [À compléter] |
| Recette | Tests de validation | Utilisateurs clés | [À compléter] |
| Pre-production | Tests de performance | Équipe infra | [À compléter] |

### 2.3 Outils de test

| Outil | Usage | Licence |
|---|---|---|
| [À compléter] | [À compléter] | [À compléter] |

## 3. Méthodologie AMDEC (Analyse des Modes de Défaillance, de leurs Effets et de leur Criticité)

### 3.1 Principes

L'analyse AMDEC permet de prioriser les tests en fonction de la criticité des défaillances potentielles. Chaque exigence ou composant est évalué selon trois critères :
- **Gravité (G)** : Impact de la défaillance (1-5)
- **Occurrence (O)** : Probabilité d'apparition (1-5)
- **Détection (D)** : Capacité à détecter le défaut avant livraison (1-5, 5 = non détectable)
- **Criticité (C = G x O x D)** : Score de priorisation

### 3.2 Échelle de cotation

| Score | Gravité | Occurrence | Détection |
|---|---|---|---|
| 1 | Négligeable | Très improbable | Détection certaine |
| 2 | Mineure | Improbable | Détection probable |
| 3 | Significative | Occasionnelle | Détection possible |
| 4 | Grave | Probable | Détection difficile |
| 5 | Catastrophique | Très probable | Non détectable |

## 4. Analyse des risques de test

| Composant / Exigence | Mode de défaillance | Gravité (G) | Occurrence (O) | Détection (D) | Criticité (C) | Niveau de test | Action |
|---|---|---|---|---|---|---|---|
| [À compléter] | [À compléter] | [1-5] | [1-5] | [1-5] | [G x O x D] | [Unitaire/Intégration/Système/Recette] | [À compléter] |
| [À compléter] | [À compléter] | [1-5] | [1-5] | [1-5] | [G x O x D] | [À compléter] | [À compléter] |

### Seuils de criticité
- **C >= 60** : Tests exhaustifs obligatoires + revue de code
- **30 <= C < 60** : Tests complets avec scenarios négatifs
- **C < 30** : Tests standards

## 5. Répartition des tests par niveau

| Niveau | Objectif | Responsable | Couverture cible | Outils |
|---|---|---|---|---|
| Tests unitaires | Valider chaque composant isolement | Développeurs | > 80% du code | [À compléter] |
| Tests d'intégration | Valider les interfaces entre composants | Équipe test | 100% des interfaces | [À compléter] |
| Tests système | Valider le système complet | Équipe test | 100% des exigences | [À compléter] |
| Tests de recette | Validation utilisateur (UAT) | Utilisateurs clés | 100% des cas d'usage | Manuel |
| Tests de performance | Valider les temps de réponse et la charge | Équipe infra | Scenarios critiques | [À compléter] |
| Tests de sécurité | Valider la protection des données | RSSI | OWASP Top 10 | [À compléter] |

## 6. Plans de tests

### 6.1 Planning des campagnes

| Campagne | Niveau | Date début | Date fin | Prérequis |
|---|---|---|---|---|
| Campagne 1 | Unitaires + Intégration | [À compléter] | [À compléter] | Code développé |
| Campagne 2 | Système | [À compléter] | [À compléter] | Campagne 1 OK |
| Campagne 3 | Recette (UAT) | [À compléter] | [À compléter] | Campagne 2 OK |
| Campagne 4 | Performance + Sécurité | [À compléter] | [À compléter] | Campagne 2 OK |

### 6.2 Critères d'entrée et de sortie

| Campagne | Critères d'entrée | Critères de sortie |
|---|---|---|
| Unitaires | Code compile, build OK | > 80% de couverture, 0 bloquant |
| Intégration | Tests unitaires OK | 100% interfaces testées, 0 bloquant |
| Système | Tests intégration OK | 100% exigences couvertes, 0 bloquant/majeur |
| Recette | Tests système OK | 95% cas OK, 0 bloquant, PV signe |

## 7. Approbations

| Fonction | Nom | Date | Signature |
|---|---|---|---|
| Chef de projet | {{userName}} | | |
| Responsable tests | [À compléter] | | |
| Sponsor | {{sponsorName}} | | |
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'objectives-scope',
          name: 'Objectifs et généralités',
          weight: 15,
          criteria: [
            { label: 'Objectifs clairs', description: 'Les objectifs de la stratégie de tests sont définis et alignés avec le projet', maxPoints: 8 },
            { label: 'Périmètre et environnements', description: 'Le périmètre et les environnements de test sont documentés', maxPoints: 7 },
          ],
        },
        {
          id: 'amdec',
          name: 'Méthodologie AMDEC',
          weight: 25,
          criteria: [
            { label: 'Échelle de cotation', description: 'Les échelles G, O, D sont définies avec des critères clairs', maxPoints: 10 },
            { label: 'Analyse de risques', description: 'Au moins 5 composants analyses avec G, O, D et criticité calculée', maxPoints: 15 },
          ],
        },
        {
          id: 'test-levels',
          name: 'Répartition par niveau',
          weight: 20,
          criteria: [
            { label: 'Niveaux couverts', description: 'Au moins 4 niveaux de tests sont décrits (unitaire, intégration, système, recette)', maxPoints: 10 },
            { label: 'Couverture et outils', description: 'Chaque niveau a une couverture cible et des outils identifiés', maxPoints: 10 },
          ],
        },
        {
          id: 'test-plans',
          name: 'Plans de tests',
          weight: 25,
          criteria: [
            { label: 'Campagnes planifiées', description: 'Les campagnes sont planifiées avec dates, prérequis et dépendances', maxPoints: 10 },
            { label: 'Critères entrée/sortie', description: 'Chaque campagne a des critères d\'entrée et de sortie explicites', maxPoints: 15 },
          ],
        },
        {
          id: 'approvals',
          name: 'Approbations',
          weight: 15,
          criteria: [
            { label: 'Signataires identifiés', description: 'Les approbateurs sont identifiés (chef de projet, responsable tests, sponsor)', maxPoints: 15 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['8.3.3.1 Quality Reports', '8.3.3.2 Test Documents'],
    },
    referenceExample: `# Stratégie de Tests — SAP30/CMRL

## Méthodologie AMDEC
| Composant | Mode de défaillance | G | O | D | C | Niveau |
|---|---|---|---|---|---|---|
| Interface paie | Erreur calcul salaires | 5 | 3 | 2 | 30 | Intégration + Système |
| Migration données FI | Perte écritures comptables | 5 | 2 | 3 | 30 | Intégration + Recette |
| Module SD | Erreur prix de vente | 4 | 3 | 2 | 24 | Unitaire + Système |
| Workflow approbation | Blocage circuit validation | 3 | 4 | 3 | 36 | Système |
| Reporting CO | Erreur consolidation | 4 | 2 | 4 | 32 | Système + Recette |

## Planning
| Campagne | Niveau | Dates | Critère de sortie |
|---|---|---|---|
| C1 | Unitaires | 01/07 – 15/07 | 85% couverture, 0 bloquant |
| C2 | Intégration | 16/07 – 31/07 | 100% interfaces, 0 bloquant |
| C3 | Système | 01/08 – 31/08 | 100% exigences, 0 bloquant/majeur |
| C4 | Recette UAT | 01/09 – 30/09 | 95% cas OK, PV signe |
| C5 | Performance | 01/10 – 15/10 | Temps réponse < 3s, 100 users simultanés |
`,
  },

  // ─── 07. Cahier de Recette ──────────────────────────────────
  {
    id: 'seed-tpl-acceptance-test',
    title: 'Cahier de Recette',
    type: 'acceptance-test',
    phase: 'EXECUTION',
    description:
      "Document de recette formalisant les tests d'acceptation utilisateur (UAT). Contient les cas de tests, les résultats d'exécution et les critères d'acceptation (seuil 95%).",
    pmiProcess: '8.3',
    difficulty: 'ADVANCED',
    content: `# Cahier de Recette

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Code** | {{projectCode}} |
| **Chef de projet** | {{userName}} |
| **Responsable recette** | [À compléter] |
| **Date** | {{currentDate}} |
| **Version** | 1.0 |

---

## Historique des versions

| Version | Auteur | Description | Date |
|---|---|---|---|
| 1.0 | {{userName}} | Création initiale | {{currentDate}} |

---

## 1. Introduction

### 1.1 Objectif du document
Ce cahier de recette a pour objectif de formaliser les tests d'acceptation utilisateur (UAT) du projet {{projectName}}. Il définit les cas de tests, les critères d'acceptation et les résultats attendus pour valider la conformité des livrables.

### 1.2 Critères d'acceptation globaux
- **Seuil de réussite** : 95% des cas de tests doivent être valides (statut "OK")
- **Anomalies bloquantes** : 0 anomalie bloquante ou critique non résolue
- **Anomalies majeures** : Toutes les anomalies majeures doivent avoir un plan de correction

### 1.3 Périmètre de la recette

| Module / Fonctionnalité | En périmètre | Responsable validation |
|---|---|---|
| [À compléter] | X | [Nom] |
| [À compléter] | X | [Nom] |
| [À compléter] | Hors périmètre | - |

## 2. Généralités

### 2.1 Participants à la recette

| Nom | Rôle | Module | Disponibilité |
|---|---|---|---|
| [À compléter] | Valideur | [Module] | [Dates] |
| [À compléter] | Valideur | [Module] | [Dates] |
| {{userName}} | Chef de projet | Tous | [Dates] |

### 2.2 Environnement de recette

| Élément | Détail |
|---|---|
| Environnement | [Recette / Pre-production] |
| URL d'accès | [À compléter] |
| Données de test | [Jeu de données représentatif] |
| Identifiants | [Fournis par l'équipe projet] |

### 2.3 Planning de recette

| Phase | Date début | Date fin | Activité |
|---|---|---|---|
| Préparation | [À compléter] | [À compléter] | Mise en place environnement, données |
| Exécution cycle 1 | [À compléter] | [À compléter] | Tests fonctionnels principaux |
| Corrections | [À compléter] | [À compléter] | Correction des anomalies |
| Exécution cycle 2 | [À compléter] | [À compléter] | Re-tests et tests complémentaires |
| Bilan | [À compléter] | [À compléter] | Synthèse et PV de recette |

## 3. Plan de tests

### 3.1 Cas de tests

| ID | Module | Scénario | Prérequis | Étapes | Résultat attendu | Priorité |
|---|---|---|---|---|---|---|
| TC01 | [Module] | [Description du scenario de test] | [Conditions préalables] | 1. [Étape 1] 2. [Étape 2] 3. [Étape 3] | [Résultat attendu] | Haute |
| TC02 | [Module] | [À compléter] | [À compléter] | [À compléter] | [À compléter] | Haute |
| TC03 | [Module] | [À compléter] | [À compléter] | [À compléter] | [À compléter] | Moyenne |
| TC04 | [Module] | [À compléter] | [À compléter] | [À compléter] | [À compléter] | Moyenne |
| TC05 | [Module] | [À compléter] | [À compléter] | [À compléter] | [À compléter] | Basse |

### 3.2 Cas limites et tests négatifs

| ID | Scénario | Action | Résultat attendu |
|---|---|---|---|
| TN01 | [Scénario limité] | [Action anormale ou aux limites] | [Message d'erreur ou comportement attendu] |
| TN02 | [À compléter] | [À compléter] | [À compléter] |

## 4. Exécution des tests

### 4.1 Résultats cycle 1

| ID | Testeur | Date | Statut | Anomalie | Commentaire |
|---|---|---|---|---|---|
| TC01 | [Nom] | [JJ/MM/AAAA] | OK / KO / Bloque | [ID anomalie ou -] | [À compléter] |
| TC02 | [Nom] | [JJ/MM/AAAA] | [À compléter] | [À compléter] | [À compléter] |
| TC03 | [Nom] | [JJ/MM/AAAA] | [À compléter] | [À compléter] | [À compléter] |
| TC04 | [Nom] | [JJ/MM/AAAA] | [À compléter] | [À compléter] | [À compléter] |
| TC05 | [Nom] | [JJ/MM/AAAA] | [À compléter] | [À compléter] | [À compléter] |

### 4.2 Registre des anomalies

| ID | Sévérité | Description | Module | Statut | Date détection | Date correction |
|---|---|---|---|---|---|---|
| BUG01 | Bloquante/Critique/Majeure/Mineure | [À compléter] | [Module] | Ouverte/Corrigée/Fermée | [JJ/MM/AAAA] | [JJ/MM/AAAA ou -] |
| BUG02 | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] |

## 5. Résultats

### 5.1 Synthèse des tests

| Indicateur | Cycle 1 | Cycle 2 | Cible |
|---|---|---|---|
| Cas de tests exécutés | [X] / [Total] | [X] / [Total] | 100% |
| Cas de tests OK | [X] ([X]%) | [X] ([X]%) | >= 95% |
| Cas de tests KO | [X] ([X]%) | [X] ([X]%) | < 5% |
| Anomalies bloquantes ouvertes | [X] | [X] | 0 |
| Anomalies critiques ouvertes | [X] | [X] | 0 |
| Anomalies majeures ouvertes | [X] | [X] | Plan de correction |

### 5.2 Décision de recette

[Sur la base des résultats, indiquez la décision : ACCEPTE / ACCEPTE AVEC RESERVES / REFUSE]

**Décision** : [ACCEPTE / ACCEPTE AVEC RESERVES / REFUSE]

**Justification** : [À compléter]

**Réserves éventuelles** :
- [À compléter]

## 6. Approbations

| Fonction | Nom | Date | Décision | Signature |
|---|---|---|---|---|
| Responsable recette | [À compléter] | | [Accepté/Refuse] | |
| Chef de projet | {{userName}} | | [Accepté/Refuse] | |
| Sponsor | {{sponsorName}} | | [Accepté/Refuse] | |
| [Représentant métier] | [À compléter] | | [Accepté/Refuse] | |

## 7. Commentaires et observations

[Espace libre pour les observations complémentaires, les recommandations post-recette ou les conditions de mise en production.]

- [À compléter]
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'introduction',
          name: 'Introduction et généralités',
          weight: 15,
          criteria: [
            { label: 'Objectif et critères', description: 'L\'objectif du document et le seuil d\'acceptation (95%) sont clairement énoncés', maxPoints: 8 },
            { label: 'Périmètre et participants', description: 'Le périmètre, les participants et l\'environnement de recette sont documentés', maxPoints: 7 },
          ],
        },
        {
          id: 'test-plan',
          name: 'Plan de tests',
          weight: 30,
          criteria: [
            { label: 'Cas de tests complets', description: 'Au moins 5 cas de tests avec prérequis, étapes détaillées et résultat attendu', maxPoints: 15 },
            { label: 'Tests négatifs', description: 'Au moins 2 cas limites ou tests négatifs sont prévus', maxPoints: 8 },
            { label: 'Priorités', description: 'Les cas de tests sont priorisés (haute, moyenne, basse)', maxPoints: 7 },
          ],
        },
        {
          id: 'execution',
          name: 'Exécution et anomalies',
          weight: 25,
          criteria: [
            { label: 'Résultats tracés', description: 'Chaque cas de test a un résultat (OK/KO/Bloque) avec testeur et date', maxPoints: 10 },
            { label: 'Anomalies documentées', description: 'Les anomalies sont enregistrées avec sévérité, description et statut', maxPoints: 15 },
          ],
        },
        {
          id: 'results',
          name: 'Résultats et décision',
          weight: 20,
          criteria: [
            { label: 'Synthèse quantifiée', description: 'La synthèse indique les taux de réussite et le respect du seuil de 95%', maxPoints: 10 },
            { label: 'Décision argumentée', description: 'La décision (Accepté/Refuse/Réserves) est justifiée par les résultats', maxPoints: 10 },
          ],
        },
        {
          id: 'approvals',
          name: 'Approbations',
          weight: 10,
          criteria: [
            { label: 'Signataires identifiés', description: 'Les approbateurs sont identifiés avec leur décision (responsable recette, chef de projet, sponsor)', maxPoints: 10 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['8.3.3.1 Quality Reports', '5.5.3.1 Verified Deliverables', '5.5.3.2 Work Performance Information'],
    },
    referenceExample: `# Cahier de Recette — SAP30/CMRL

## Critères d'acceptation
Seuil de réussite : 95% des cas de tests OK. 0 anomalie bloquante/critique ouverte.

## Cas de tests (extrait)
| ID | Module | Scénario | Résultat attendu | Statut |
|---|---|---|---|---|
| TC01 | FI | Saisie écriture comptable standard | Écriture enregistrée, journal mis à jour | OK |
| TC02 | FI | Clôture mensuelle | Balances générées, écarts < 0.01 EUR | OK |
| TC03 | CO | Imputation centre de coût | Ventilation correcte 100% | OK |
| TC04 | SD | Création commande client | Commande enregistrée, stock réservé | KO (BUG03) |
| TC05 | MM | Réception marchandise | Stock mis à jour, mouvement enregistré | OK |
| TC06 | PP | Lancement ordre de fabrication | OF créé, composants réserves | OK |

## Synthèse
| Indicateur | Cycle 1 | Cycle 2 | Cible |
|---|---|---|---|
| Tests exécutés | 45/50 | 50/50 | 100% |
| Tests OK | 41 (91%) | 48 (96%) | >= 95% |
| Bloquantes ouvertes | 1 | 0 | 0 |

**Décision** : ACCEPTE — Taux de réussite cycle 2 : 96% (> 95%). 0 anomalie bloquante.
`,
  },
];
