import type { DeliverableTemplateData } from './types';

export const monitoringTemplates: DeliverableTemplateData[] = [
  // ─── 01. Suivi Budgetaire ──────────────────────────────────
  {
    id: 'seed-tpl-budget-tracking',
    title: 'Suivi Budgétaire',
    type: 'budget-tracking',
    phase: 'MONITORING',
    description:
      "Tableau de suivi financier du projet intégrant les indicateurs EVM (Earned Value Management). Permet de piloter les coûts, détecter les écarts et prévoir le budget a terminaison.",
    pmiProcess: '7.4',
    difficulty: 'STANDARD',
    content: `# Suivi Budgétaire

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Code** | {{projectCode}} |
| **Chef de projet** | {{userName}} |
| **Période** | {{currentDate}} |

---

## Historique des versions

| Version | Auteur | Description | Date |
|---|---|---|---|
| 1.0 | {{userName}} | Création initiale | {{currentDate}} |

---

## 1. Synthèse financière

| Indicateur | Valeur |
|---|---|
| **Budget initial (BAC)** | {{initialBudget}} EUR |
| **Budget révisé** | [À compléter] EUR |
| **Dépenses à date (AC)** | [À compléter] EUR |
| **Valeur acquise (EV)** | [À compléter] EUR |
| **% consommé** | [À compléter]% |
| **% avancement physique** | [À compléter]% |

**Commentaire général** : [Synthétisez la situation financière du projet en quelques lignes : tendance, alertes, actions en cours.]

## 2. Détail par poste budgétaire

### 2.1 Ressources humaines

| Poste | Budget prévu | Engage | Consommé | Reste à dépenser | Écart |
|---|---|---|---|---|---|
| Chef de projet | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| Équipe interne | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| **Sous-total RH** | **[À compléter]** | **[À compléter]** | **[À compléter]** | **[À compléter]** | **[À compléter]** |

### 2.2 Prestataires externes

| Prestataire | Budget prévu | Engage | Consommé | Reste à dépenser | Écart |
|---|---|---|---|---|---|
| [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| **Sous-total Prestataires** | **[À compléter]** | **[À compléter]** | **[À compléter]** | **[À compléter]** | **[À compléter]** |

### 2.3 Matériel et infrastructure

| Poste | Budget prévu | Engage | Consommé | Reste à dépenser | Écart |
|---|---|---|---|---|---|
| [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| **Sous-total Matériel** | **[À compléter]** | **[À compléter]** | **[À compléter]** | **[À compléter]** | **[À compléter]** |

### 2.4 Licences et logiciels

| Poste | Budget prévu | Engage | Consommé | Reste à dépenser | Écart |
|---|---|---|---|---|---|
| [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| **Sous-total Licences** | **[À compléter]** | **[À compléter]** | **[À compléter]** | **[À compléter]** | **[À compléter]** |

### 2.5 Récapitulatif

| Poste | Budget prévu | Consommé | Reste | Écart |
|---|---|---|---|---|
| Ressources humaines | [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| Prestataires | [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| Matériel | [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| Licences | [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| **TOTAL** | **{{initialBudget}} EUR** | **[À compléter]** | **[À compléter]** | **[À compléter]** |

## 3. Indicateurs EVM (Earned Value Management)

| Indicateur | Formule | Valeur | Interprétation |
|---|---|---|---|
| **BAC** (Budget at Completion) | Budget initial | {{initialBudget}} EUR | Budget total prévu |
| **PV** (Planned Value) | Valeur planifiée à date | [À compléter] EUR | Travail prévu à cette date |
| **EV** (Earned Value) | Valeur acquise à date | [À compléter] EUR | Travail réellement accompli |
| **AC** (Actual Cost) | Coût réel à date | [À compléter] EUR | Dépenses réelles |
| **SV** (Schedule Variance) | EV - PV | [À compléter] EUR | > 0 = avance, < 0 = retard |
| **CV** (Cost Variance) | EV - AC | [À compléter] EUR | > 0 = économie, < 0 = dépassement |
| **SPI** (Schedule Performance Index) | EV / PV | [À compléter] | > 1 = avance, < 1 = retard |
| **CPI** (Cost Performance Index) | EV / AC | [À compléter] | > 1 = économie, < 1 = dépassement |
| **EAC** (Estimate at Completion) | BAC / CPI | [À compléter] EUR | Prévision budget final |
| **ETC** (Estimate to Complete) | EAC - AC | [À compléter] EUR | Reste à dépenser estimé |
| **VAC** (Variance at Completion) | BAC - EAC | [À compléter] EUR | Écart prévu à terminaison |

## 4. Courbe en S

[Insérez ou décrivez la courbe en S avec les 3 courbes : PV (valeur planifiée), EV (valeur acquise) et AC (coût réel). Indiquez la date de référence et les tendances observées.]

| Mois | PV cumulé | EV cumulé | AC cumulé |
|---|---|---|---|
| M1 | [À compléter] | [À compléter] | [À compléter] |
| M2 | [À compléter] | [À compléter] | [À compléter] |
| M3 | [À compléter] | [À compléter] | [À compléter] |
| M4 | [À compléter] | [À compléter] | [À compléter] |
| M5 | [À compléter] | [À compléter] | [À compléter] |
| M6 | [À compléter] | [À compléter] | [À compléter] |

## 5. Alertes et actions correctives

| # | Alerte | Sévérité | Impact budget | Action corrective | Responsable | Échéance |
|---|---|---|---|---|---|---|
| A01 | [À compléter] | Critique/Majeure/Mineure | [À compléter] EUR | [À compléter] | [À compléter] | [À compléter] |
| A02 | [À compléter] | [À compléter] | [À compléter] EUR | [À compléter] | [À compléter] | [À compléter] |

## 6. Prévisions et recommandations

[Analysez la tendance financière et formulez des recommandations : ajustements budgétaires, re-estimations, demandes de budget supplémentaire, économies possibles.]

- **Tendance générale** : [À compléter]
- **Recommandation 1** : [À compléter]
- **Recommandation 2** : [À compléter]
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'financial-summary',
          name: 'Synthèse financière',
          weight: 15,
          criteria: [
            { label: 'Vue d\'ensemble claire', description: 'Les chiffres clés (budget, dépenses, reste) sont présentés de manière synthétique', maxPoints: 8 },
            { label: 'Commentaire pertinent', description: 'Le commentaire général resume la situation avec les tendances et alertes', maxPoints: 7 },
          ],
        },
        {
          id: 'budget-breakdown',
          name: 'Détail par poste',
          weight: 20,
          criteria: [
            { label: 'Postes couverts', description: 'Les 4 postes (RH, prestataires, matériel, licences) sont détaillés', maxPoints: 10 },
            { label: 'Chiffres cohérents', description: 'Les montants sont cohérents entre les sous-totaux et le total', maxPoints: 10 },
          ],
        },
        {
          id: 'evm-indicators',
          name: 'Indicateurs EVM',
          weight: 30,
          criteria: [
            { label: 'Indicateurs complets', description: 'Les 11 indicateurs EVM sont calculés (BAC, PV, EV, AC, SV, CV, SPI, CPI, EAC, ETC, VAC)', maxPoints: 15 },
            { label: 'Calculs corrects', description: 'Les formules sont correctement appliquées et les valeurs cohérentes', maxPoints: 10 },
            { label: 'Interprétation', description: 'Chaque indicateur a une interprétation pertinente', maxPoints: 5 },
          ],
        },
        {
          id: 's-curve',
          name: 'Courbe en S',
          weight: 15,
          criteria: [
            { label: 'Données temporelles', description: 'Les valeurs PV, EV, AC sont fournies mois par mois', maxPoints: 8 },
            { label: 'Analyse de tendance', description: 'L\'évolution temporelle est commentée avec les écarts visibles', maxPoints: 7 },
          ],
        },
        {
          id: 'alerts-recommendations',
          name: 'Alertes et recommandations',
          weight: 20,
          criteria: [
            { label: 'Alertes identifiées', description: 'Les écarts significatifs sont signalés avec sévérité et impact chiffre', maxPoints: 10 },
            { label: 'Actions correctives', description: 'Des actions concrètes sont proposées avec responsable et échéance', maxPoints: 5 },
            { label: 'Recommandations', description: 'Les prévisions et recommandations sont argumentées et réalisables', maxPoints: 5 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['7.4.3.1 Work Performance Information', '7.4.3.2 Cost Forecasts', '7.4.3.3 Change Requests'],
    },
    referenceExample: `# Suivi Budgétaire — Projet SAP30/CMRL (Mois 4)

## Synthèse financière
Budget initial : 515 000 EUR. Dépenses à date : 245 000 EUR (47,6%). Avancement physique : 55%. Le projet est en avance sur le budget grâce à la négociation des tarifs prestataires.

## Indicateurs EVM
| Indicateur | Valeur | Interprétation |
|---|---|---|
| BAC | 515 000 EUR | Budget approuvé |
| PV | 280 000 EUR | Travail planifié à M4 |
| EV | 283 250 EUR | 55% x 515K |
| AC | 245 000 EUR | Coût réel |
| SV | +3 250 EUR | Légèrement en avance |
| CV | +38 250 EUR | Économie significative |
| SPI | 1.01 | En ligne |
| CPI | 1.16 | Très bon (économie 16%) |
| EAC | 443 965 EUR | Prévision finale favorable |

## Alertes
| Alerte | Sévérité | Action |
|---|---|---|
| Risque dépassement poste formation | Majeure | Re-négocier le contrat formateur — Resp: RH — Échéance: 15/06 |
`,
  },

  // ─── 02. Tableau de Bord Projet ────────────────────────────
  {
    id: 'seed-tpl-dashboard-report',
    title: 'Tableau de Bord Projet',
    type: 'dashboard-report',
    phase: 'MONITORING',
    description:
      "Dashboard de synthèse du projet présentant les indicateurs globaux (scope, coût, délai, qualité), l'avancement par phase, les risques et actions prioritaires.",
    pmiProcess: '4.5',
    difficulty: 'STANDARD',
    content: `# Tableau de Bord Projet

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Code** | {{projectCode}} |
| **Chef de projet** | {{userName}} |
| **Période de reporting** | {{currentDate}} |

---

## Historique des versions

| Version | Auteur | Description | Date |
|---|---|---|---|
| 1.0 | {{userName}} | Création initiale | {{currentDate}} |

---

## 1. Indicateurs globaux

| Dimension | Statut (RAG) | Tendance | Commentaire |
|---|---|---|---|
| **Périmètre (Scope)** | 🟢 Vert / 🟠 Orange / 🔴 Rouge | ↗ ↘ → | [À compléter] |
| **Coûts (Cost)** | 🟢 Vert / 🟠 Orange / 🔴 Rouge | ↗ ↘ → | [À compléter] |
| **Délais (Schedule)** | 🟢 Vert / 🟠 Orange / 🔴 Rouge | ↗ ↘ → | [À compléter] |
| **Qualité (Quality)** | 🟢 Vert / 🟠 Orange / 🔴 Rouge | ↗ ↘ → | [À compléter] |

### Légende RAG
- **Vert** : Conforme au plan, aucun écart significatif
- **Orange** : Écart modéré, actions correctives en cours
- **Rouge** : Écart critique, escalade nécessaire

## 2. Avancement par phase

| Phase | % Avancement | Statut | Date début | Date fin prévue | Date fin réelle |
|---|---|---|---|---|---|
| Initiation | [À compléter]% | Terminé/En cours/À venir | [À compléter] | [À compléter] | [À compléter] |
| Planification | [À compléter]% | [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| Exécution | [À compléter]% | [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| Contrôle | [À compléter]% | [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| Clôture | [À compléter]% | [À compléter] | [À compléter] | [À compléter] | [À compléter] |

**Avancement global** : [À compléter]%

## 3. Synthèse budgétaire

| Indicateur | Valeur |
|---|---|
| Budget total | {{initialBudget}} EUR |
| Dépenses à date | [À compléter] EUR |
| Reste à dépenser | [À compléter] EUR |
| CPI | [À compléter] |
| Prévision à terminaison (EAC) | [À compléter] EUR |

## 4. Top 5 des risques

| # | Risque | Probabilité | Impact | Criticité | Responsable | Action en cours |
|---|---|---|---|---|---|---|
| 1 | [À compléter] | Élevée/Moyenne/Faible | Élevé/Moyen/Faible | [P x I] | [À compléter] | [À compléter] |
| 2 | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| 3 | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| 4 | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| 5 | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] |

## 5. Top 5 des actions

| # | Action | Priorité | Responsable | Échéance | Statut |
|---|---|---|---|---|---|
| 1 | [À compléter] | Haute/Moyenne/Basse | [À compléter] | [À compléter] | En cours/En retard/Terminé |
| 2 | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| 3 | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| 4 | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| 5 | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] |

## 6. Prochains jalons

| Jalon | Date prévue | Responsable | Statut |
|---|---|---|---|
| [À compléter] | [À compléter] | [À compléter] | En temps/A risque/En retard |
| [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| [À compléter] | [À compléter] | [À compléter] | [À compléter] |

## 7. Points d'attention

[Listez les sujets nécessitant une attention particulière ou une décision du management.]

- [À compléter]
- [À compléter]
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'global-indicators',
          name: 'Indicateurs globaux',
          weight: 25,
          criteria: [
            { label: 'RAG complet', description: 'Les 4 dimensions (scope, coût, délai, qualité) ont un statut RAG attribué', maxPoints: 10 },
            { label: 'Commentaires pertinents', description: 'Chaque dimension a un commentaire explicatif cohérent avec le statut', maxPoints: 10 },
            { label: 'Tendances', description: 'Les tendances sont indiquées et reflètent la réalité du projet', maxPoints: 5 },
          ],
        },
        {
          id: 'phase-progress',
          name: 'Avancement par phase',
          weight: 20,
          criteria: [
            { label: 'Phases détaillées', description: 'Les 5 phases sont présentées avec pourcentage et dates', maxPoints: 10 },
            { label: 'Cohérence', description: 'L\'avancement global est cohérent avec les phases individuelles', maxPoints: 10 },
          ],
        },
        {
          id: 'risks-actions',
          name: 'Risques et actions',
          weight: 25,
          criteria: [
            { label: 'Top 5 risques', description: '5 risques sont identifiés avec probabilité, impact, criticité et responsable', maxPoints: 15 },
            { label: 'Top 5 actions', description: '5 actions sont listées avec priorité, responsable, échéance et statut', maxPoints: 10 },
          ],
        },
        {
          id: 'milestones',
          name: 'Jalons et budget',
          weight: 20,
          criteria: [
            { label: 'Jalons identifiés', description: 'Au moins 3 prochains jalons avec dates et responsables', maxPoints: 10 },
            { label: 'Synthèse budgétaire', description: 'Les indicateurs financiers clés sont présents et cohérents', maxPoints: 10 },
          ],
        },
        {
          id: 'attention-points',
          name: 'Points d\'attention',
          weight: 10,
          criteria: [
            { label: 'Sujets identifiés', description: 'Les points nécessitant une décision ou une attention sont clairement formulés', maxPoints: 10 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['4.5.3.1 Work Performance Reports', '4.5.3.2 Change Requests', '4.5.3.4 Project Management Plan Updates'],
    },
    referenceExample: `# Tableau de Bord — SAP30/CMRL (Semaine 18)

## Indicateurs globaux
| Dimension | Statut | Tendance | Commentaire |
|---|---|---|---|
| Périmètre | Vert | → | Périmètre stable, aucune demande de changement |
| Coûts | Vert | ↗ | CPI 1.16, économie de 38K EUR |
| Délais | Orange | ↘ | Retard 5 jours sur migration MM, rattrapage en cours |
| Qualité | Vert | → | 0 défaut bloquant en recette |

## Top 5 Risques
| # | Risque | P | I | C | Action |
|---|---|---|---|---|---|
| 1 | Résistance utilisateurs Finance | 4 | 4 | 16 | Champions internes désignés |
| 2 | Retard migration données | 4 | 3 | 12 | Migration incrémentale |
| 3 | Indisponibilité expert SAP | 3 | 4 | 12 | Backup formé |

## Prochains jalons
| Jalon | Date | Statut |
|---|---|---|
| Fin migration SD | 15/06 | En temps |
| Début recette intégrée | 01/07 | En temps |
| Formation vague 1 | 15/07 | A risque |
`,
  },

  // ─── 03. Rapport Flash ─────────────────────────────────────
  {
    id: 'seed-tpl-flash-report',
    title: 'Rapport Flash',
    type: 'flash-report',
    phase: 'MONITORING',
    description:
      "Rapport de synthèse rapide (1 page) pour communiquer le statut du projet. Présente le statut global, les faits marquants, les vigilances et les décisions attendues.",
    pmiProcess: '4.5',
    difficulty: 'DISCOVERY',
    content: `# Rapport Flash — {{projectName}}

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Chef de projet** | {{userName}} |
| **Date** | {{currentDate}} |
| **Statut global** | 🟢 Vert / 🟠 Orange / 🔴 Rouge |

---

## 1. Statut global

**État du projet** : [Vert / Orange / Rouge]

[Expliquez en 2-3 phrases la situation globale du projet.]

| Dimension | Statut |
|---|---|
| Périmètre | 🟢 / 🟠 / 🔴 |
| Budget | 🟢 / 🟠 / 🔴 |
| Délais | 🟢 / 🟠 / 🔴 |
| Qualité | 🟢 / 🟠 / 🔴 |

## 2. Faits marquants de la période

[Listez les 3 à 5 faits marquants de la période écoulée.]

- [À compléter]
- [À compléter]
- [À compléter]

## 3. Points de vigilance

[Identifiez les sujets à surveiller dans les prochaines semaines.]

| Point de vigilance | Impact potentiel | Action envisagée |
|---|---|---|
| [À compléter] | [À compléter] | [À compléter] |
| [À compléter] | [À compléter] | [À compléter] |

## 4. Décisions attendues

[Listez les décisions que le management doit prendre.]

| Décision à prendre | Demandeur | Échéance souhaitée | Impact si non décidée |
|---|---|---|---|
| [À compléter] | [À compléter] | [À compléter] | [À compléter] |

## 5. Prochaines étapes

[Listez les activités clés des 2 prochaines semaines.]

- [ ] [À compléter] — Responsable : [Nom] — Échéance : [Date]
- [ ] [À compléter] — Responsable : [Nom] — Échéance : [Date]
- [ ] [À compléter] — Responsable : [Nom] — Échéance : [Date]
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'global-status',
          name: 'Statut global',
          weight: 25,
          criteria: [
            { label: 'Statut RAG clair', description: 'Le statut global et par dimension est clairement attribué (Vert/Orange/Rouge)', maxPoints: 10 },
            { label: 'Synthèse cohérente', description: 'L\'explication du statut est concise et cohérente avec les indicateurs', maxPoints: 15 },
          ],
        },
        {
          id: 'highlights',
          name: 'Faits marquants',
          weight: 25,
          criteria: [
            { label: 'Faits pertinents', description: 'Les faits marquants sont factuels et significatifs pour la période', maxPoints: 15 },
            { label: 'Concision', description: 'Chaque fait est exprimé de manière concise et claire', maxPoints: 10 },
          ],
        },
        {
          id: 'vigilance',
          name: 'Points de vigilance',
          weight: 20,
          criteria: [
            { label: 'Anticipation', description: 'Les points de vigilance sont anticipés avec impact potentiel identifié', maxPoints: 10 },
            { label: 'Actions envisagées', description: 'Des actions préventives sont proposées pour chaque point', maxPoints: 10 },
          ],
        },
        {
          id: 'decisions-next-steps',
          name: 'Décisions et prochaines étapes',
          weight: 30,
          criteria: [
            { label: 'Décisions formalisées', description: 'Les décisions attendues sont claires avec échéance et impact si non décidées', maxPoints: 15 },
            { label: 'Prochaines étapes', description: 'Les prochaines étapes sont concrètes avec responsables et échéances', maxPoints: 15 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['4.5.3.1 Work Performance Reports'],
    },
    referenceExample: `# Rapport Flash — SAP30/CMRL (12/05)

**Statut global** : Orange

Le projet avance conformément au plan sur le périmètre et le budget. Un retard de 5 jours est constaté sur le module MM (migration données fournisseurs). Plan de rattrapage en cours.

## Faits marquants
- Migration FI/CO terminée avec succès le 08/05 (recette OK)
- Formation vague 1 planifiée (25 utilisateurs, début 20/05)
- Retard migration MM : complexité données fournisseurs sous-estimée

## Points de vigilance
| Point | Impact | Action |
|---|---|---|
| Retard MM | Décalage recette intégrée de 1 semaine | Renfort équipe technique (2 ETP) |
| Disponibilité salle formation | Risque report formation | Réservation salles alternatives |

## Décisions attendues
| Décision | Échéance | Impact si non décidée |
|---|---|---|
| Validation budget renfort MM (+15K) | 15/05 | Retard supplémentaire de 2 semaines |
`,
  },

  // ─── 04. Support Comite de Projet ──────────────────────────
  {
    id: 'seed-tpl-project-committee',
    title: 'Support Comité de Projet',
    type: 'project-committee',
    phase: 'MONITORING',
    description:
      "Support de présentation pour le comité de projet. Couvre l'avancement détaillé, la charge équipe, les problèmes opérationnels, le planning actualisé et les actions à valider.",
    pmiProcess: '10.2',
    difficulty: 'STANDARD',
    content: `# Comité de Projet — {{projectName}}

**Date** : {{currentDate}}
**Chef de projet** : {{userName}}
**Participants** : [À compléter]

---

## Ordre du jour

1. Avancement détaillé
2. Charge équipe
3. Problèmes opérationnels
4. Planning actualisé
5. Actions à valider
6. Prochaine réunion

---

## 1. Avancement détaillé

### 1.1 Avancement global

| Phase | % Prévu | % Réel | Écart | Commentaire |
|---|---|---|---|---|
| Initiation | [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| Planification | [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| Exécution | [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| Contrôle | [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| Clôture | [À compléter] | [À compléter] | [À compléter] | [À compléter] |

### 1.2 Avancement par lot de travail

| Lot | Responsable | % Avancement | Statut | Commentaire |
|---|---|---|---|---|
| [À compléter] | [À compléter] | [À compléter]% | En cours/Terminé/En retard | [À compléter] |
| [À compléter] | [À compléter] | [À compléter]% | [À compléter] | [À compléter] |
| [À compléter] | [À compléter] | [À compléter]% | [À compléter] | [À compléter] |

### 1.3 Livrables de la période

| Livrable | Responsable | Date prévue | Date réelle | Statut | Commentaire |
|---|---|---|---|---|---|
| [À compléter] | [À compléter] | [À compléter] | [À compléter] | Livre/En cours/En retard | [À compléter] |
| [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] |

## 2. Charge équipe

| Membre | Rôle | Charge prévue | Charge réelle | Disponibilité | Commentaire |
|---|---|---|---|---|---|
{{teamMembers}}
| [À compléter] | [À compléter] | [À compléter] j/h | [À compléter] j/h | [À compléter]% | [À compléter] |

### Alertes charge
[Signalez les situations de surcharge ou de sous-charge et les actions envisagées.]

- [À compléter]

## 3. Problèmes opérationnels

| # | Problème | Date détection | Impact | Priorité | Action corrective | Responsable | Statut |
|---|---|---|---|---|---|---|---|
| P01 | [À compléter] | [À compléter] | [À compléter] | Haute/Moyenne/Basse | [À compléter] | [À compléter] | Ouvert/En cours/Résolu |
| P02 | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] |

## 4. Planning actualisé

### 4.1 Jalons

| Jalon | Date initiale | Date actuelle | Écart | Statut |
|---|---|---|---|---|
| [À compléter] | [À compléter] | [À compléter] | [À compléter] j | En temps/A risque/En retard |
| [À compléter] | [À compléter] | [À compléter] | [À compléter] j | [À compléter] |
| [À compléter] | [À compléter] | [À compléter] | [À compléter] j | [À compléter] |

### 4.2 Chemin critique

[Identifiez les tâches sur le chemin critique et les marges disponibles.]

| Tâche critique | Durée | Marge | Risque |
|---|---|---|---|
| [À compléter] | [À compléter] j | [À compléter] j | [À compléter] |

## 5. Actions à valider

| # | Action proposée | Justification | Impact (coût/délai) | Décision attendue |
|---|---|---|---|---|
| 1 | [À compléter] | [À compléter] | [À compléter] | Approuver/Rejeter/Reporter |
| 2 | [À compléter] | [À compléter] | [À compléter] | [À compléter] |

## 6. Prochaine réunion

- **Date** : [À compléter]
- **Ordre du jour prévisionnel** : [À compléter]
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'detailed-progress',
          name: 'Avancement détaillé',
          weight: 25,
          criteria: [
            { label: 'Avancement par phase', description: 'Chaque phase a un pourcentage prévu vs réel avec écart commenté', maxPoints: 10 },
            { label: 'Lots de travail', description: 'Les lots sont détaillés avec responsable, avancement et statut', maxPoints: 8 },
            { label: 'Livrables', description: 'Les livrables de la période sont listes avec dates et statut', maxPoints: 7 },
          ],
        },
        {
          id: 'team-workload',
          name: 'Charge équipe',
          weight: 20,
          criteria: [
            { label: 'Charge détaillée', description: 'Chaque membre a sa charge prévue/réelle et sa disponibilité', maxPoints: 10 },
            { label: 'Alertes charge', description: 'Les situations de surcharge/sous-charge sont signalées avec actions', maxPoints: 10 },
          ],
        },
        {
          id: 'operational-issues',
          name: 'Problèmes opérationnels',
          weight: 20,
          criteria: [
            { label: 'Problèmes identifiés', description: 'Les problèmes sont décrits avec impact, priorité et date de détection', maxPoints: 10 },
            { label: 'Actions correctives', description: 'Chaque problème a une action corrective avec responsable et statut', maxPoints: 10 },
          ],
        },
        {
          id: 'updated-planning',
          name: 'Planning actualisé',
          weight: 20,
          criteria: [
            { label: 'Jalons à jour', description: 'Les jalons montrent les écarts entre dates initiales et actuelles', maxPoints: 10 },
            { label: 'Chemin critique', description: 'Le chemin critique est identifié avec les marges', maxPoints: 10 },
          ],
        },
        {
          id: 'actions-to-validate',
          name: 'Actions à valider',
          weight: 15,
          criteria: [
            { label: 'Actions formalisées', description: 'Les actions sont justifiées avec impact coût/délai et décision attendue', maxPoints: 15 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['10.2.3.1 Project Communications', '4.5.3.1 Work Performance Reports'],
    },
    referenceExample: `# Comité de Projet — SAP30/CMRL (22/05)

## Avancement
| Phase | % Prévu | % Réel | Écart |
|---|---|---|---|
| Exécution | 60% | 55% | -5% |

## Charge équipe
| Membre | Charge prévue | Charge réelle | Alerte |
|---|---|---|---|
| Expert SAP | 20 j/h | 25 j/h | Surcharge — renfort demande |
| Équipe technique | 40 j/h | 38 j/h | OK |

## Problèmes
| # | Problème | Action | Responsable |
|---|---|---|---|
| P01 | Retard migration MM | Renfort 2 ETP | DSI |
| P02 | Bug interface SD/MM | Correctif en cours | Architecte |

## Actions à valider
| Action | Impact | Décision |
|---|---|---|
| Budget renfort MM (+15K) | +15K EUR / rattrapage 5j retard | À approuver |
`,
  },

  // ─── 05. Support Comite de Pilotage ────────────────────────
  {
    id: 'seed-tpl-steering-committee',
    title: 'Support Comité de Pilotage',
    type: 'steering-committee',
    phase: 'MONITORING',
    description:
      "Support de présentation pour le comité de pilotage (COPIL). Présente la synthèse executive, l'avancement physique et financier, les risques critiques, les demandes d'arbitrage et les prochains jalons.",
    pmiProcess: '10.2',
    difficulty: 'ADVANCED',
    content: `# Comité de Pilotage — {{projectName}}

**Date** : {{currentDate}}
**Chef de projet** : {{userName}}
**Sponsor** : {{sponsorName}}
**Participants** : [À compléter]

---

## Ordre du jour

1. Synthèse executive
2. Avancement (physique + financier)
3. Risques critiques
4. Demandes d'arbitrage
5. Budget
6. Prochains jalons
7. Prochaine réunion

---

## 1. Synthèse executive

[En 5 à 10 lignes, résumez la situation du projet : statut global, principaux accomplissements de la période, problèmes majeurs et perspectives. Cette section doit permettre à un décideur de comprendre la situation en moins de 2 minutes.]

**Statut global** : 🟢 Vert / 🟠 Orange / 🔴 Rouge

| Dimension | Statut | Évolution |
|---|---|---|
| Périmètre | 🟢 / 🟠 / 🔴 | ↗ ↘ → |
| Coûts | 🟢 / 🟠 / 🔴 | ↗ ↘ → |
| Délais | 🟢 / 🟠 / 🔴 | ↗ ↘ → |
| Qualité | 🟢 / 🟠 / 🔴 | ↗ ↘ → |
| Ressources | 🟢 / 🟠 / 🔴 | ↗ ↘ → |

## 2. Avancement

### 2.1 Avancement physique

| Phase | % Prévu | % Réalisé | Écart | Commentaire |
|---|---|---|---|---|
| Initiation | [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| Planification | [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| Exécution | [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| Contrôle | [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| Clôture | [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| **Global** | **[À compléter]** | **[À compléter]** | **[À compléter]** | |

**Faits marquants de la période** :
- [À compléter]
- [À compléter]
- [À compléter]

### 2.2 Avancement financier

| Indicateur | Valeur | Commentaire |
|---|---|---|
| Budget approuvé (BAC) | {{initialBudget}} EUR | |
| Dépenses à date (AC) | [À compléter] EUR | [À compléter]% consommé |
| Valeur acquise (EV) | [À compléter] EUR | |
| CPI | [À compléter] | > 1 = économie |
| SPI | [À compléter] | > 1 = avance |
| Prévision à terminaison (EAC) | [À compléter] EUR | |
| Écart à terminaison (VAC) | [À compléter] EUR | |

## 3. Risques critiques

[Présentez uniquement les risques de criticité élevée (>= 12) nécessitant l'attention du COPIL.]

| # | Risque | P | I | C | Tendance | Action en cours | Responsable |
|---|---|---|---|---|---|---|---|
| 1 | [À compléter] | [1-5] | [1-5] | [Auto] | ↗ ↘ → | [À compléter] | [À compléter] |
| 2 | [À compléter] | [1-5] | [1-5] | [Auto] | ↗ ↘ → | [À compléter] | [À compléter] |
| 3 | [À compléter] | [1-5] | [1-5] | [Auto] | ↗ ↘ → | [À compléter] | [À compléter] |

## 4. Demandes d'arbitrage

[Présentez les sujets nécessitant une décision du COPIL. Chaque demande doit être argumentée avec les options et impacts.]

### Arbitrage 1 : [Titre]

- **Contexte** : [À compléter]
- **Options** :
  - Option A : [À compléter] — Impact : [coût/délai]
  - Option B : [À compléter] — Impact : [coût/délai]
- **Recommandation** : [À compléter]
- **Décision attendue** : [À compléter]

### Arbitrage 2 : [Titre]

- **Contexte** : [À compléter]
- **Options** :
  - Option A : [À compléter] — Impact : [coût/délai]
  - Option B : [À compléter] — Impact : [coût/délai]
- **Recommandation** : [À compléter]
- **Décision attendue** : [À compléter]

## 5. Budget

| Poste | Budget initial | Budget révisé | Consommé | Reste | Écart |
|---|---|---|---|---|---|
| Ressources internes | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| Prestataires | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| Matériel / Licences | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| Provisions risques | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| **TOTAL** | **{{initialBudget}} EUR** | **[À compléter]** | **[À compléter]** | **[À compléter]** | **[À compléter]** |

## 6. Prochains jalons

| Jalon | Date prévue | Confiance | Risque principal |
|---|---|---|---|
| [À compléter] | [À compléter] | Haute/Moyenne/Faible | [À compléter] |
| [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| [À compléter] | [À compléter] | [À compléter] | [À compléter] |

## 7. Prochaine réunion

- **Date** : [À compléter]
- **Ordre du jour prévisionnel** : [À compléter]

---

## Décisions prises en séance

| # | Décision | Responsable | Échéance |
|---|---|---|---|
| D01 | [À remplir en séance] | [À compléter] | [À compléter] |
| D02 | [À remplir en séance] | [À compléter] | [À compléter] |
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'executive-summary',
          name: 'Synthèse executive',
          weight: 20,
          criteria: [
            { label: 'Synthèse impactante', description: 'La situation est résumée de manière claire et synthétique en moins de 10 lignes', maxPoints: 10 },
            { label: 'Statut RAG complet', description: 'Les 5 dimensions (scope, coût, délai, qualité, ressources) ont un statut et une évolution', maxPoints: 10 },
          ],
        },
        {
          id: 'progress',
          name: 'Avancement physique et financier',
          weight: 25,
          criteria: [
            { label: 'Avancement physique', description: 'L\'avancement par phase est détaillé avec écarts commentés', maxPoints: 10 },
            { label: 'Indicateurs EVM', description: 'Les indicateurs financiers (CPI, SPI, EAC, VAC) sont présents et corrects', maxPoints: 10 },
            { label: 'Faits marquants', description: 'Les réalisations de la période sont factuelles et significatives', maxPoints: 5 },
          ],
        },
        {
          id: 'critical-risks',
          name: 'Risques critiques',
          weight: 15,
          criteria: [
            { label: 'Risques critiques', description: 'Seuls les risques de criticité >= 12 sont présentés avec actions et responsables', maxPoints: 10 },
            { label: 'Tendances', description: 'L\'évolution des risques est indiquée', maxPoints: 5 },
          ],
        },
        {
          id: 'arbitration',
          name: 'Demandes d\'arbitrage',
          weight: 25,
          criteria: [
            { label: 'Arbitrages structures', description: 'Chaque demande a un contexte, des options avec impact et une recommandation', maxPoints: 15 },
            { label: 'Arguments factuels', description: 'Les arguments sont chiffrés et objectifs pour faciliter la décision', maxPoints: 10 },
          ],
        },
        {
          id: 'budget-milestones',
          name: 'Budget et jalons',
          weight: 15,
          criteria: [
            { label: 'Budget détaillé', description: 'Le budget est ventilé par poste avec initial/révisé/consommé/écart', maxPoints: 8 },
            { label: 'Jalons avec confiance', description: 'Les prochains jalons ont un niveau de confiance et les risques associés', maxPoints: 7 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['10.2.3.1 Project Communications', '4.5.3.1 Work Performance Reports', '4.5.3.2 Change Requests'],
    },
    referenceExample: `# COPIL — SAP30/CMRL (01/06)

## Synthèse executive
Le projet SAP30 est globalement en bonne voie (statut Orange). L'avancement physique est à 55% pour 52% prévu. Le budget est maîtrise (CPI 1.16). Un retard de 5 jours est constaté sur le module MM, nécessitant un renfort budgétaire de 15K EUR. Deux arbitrages sont présentés au COPIL.

## Avancement financier
| Indicateur | Valeur |
|---|---|
| BAC | 515 000 EUR |
| AC | 245 000 EUR |
| EV | 283 250 EUR |
| CPI | 1.16 |
| SPI | 1.01 |
| EAC | 443 965 EUR |

## Arbitrage 1 : Budget renfort MM
- **Contexte** : Retard migration MM de 5 jours, complexité données sous-estimée
- **Option A** : Renfort 2 ETP pendant 3 semaines (+15K EUR) — Rattrapage en 10 jours
- **Option B** : Statu quo — Retard supplémentaire de 2 semaines, impact recette
- **Recommandation** : Option A (coût marginal vs impact planning)
`,
  },
];
