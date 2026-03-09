import type { DeliverableTemplateData } from './types';

export const monitoringTemplates: DeliverableTemplateData[] = [
  // ─── 01. Suivi Budgetaire ──────────────────────────────────
  {
    id: 'seed-tpl-budget-tracking',
    title: 'Suivi Budgetaire',
    type: 'budget-tracking',
    phase: 'MONITORING',
    description:
      "Tableau de suivi financier du projet integrant les indicateurs EVM (Earned Value Management). Permet de piloter les couts, detecter les ecarts et prevoir le budget a terminaison.",
    pmiProcess: '7.4',
    difficulty: 'STANDARD',
    content: `# Suivi Budgetaire

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Code** | {{projectCode}} |
| **Chef de projet** | {{userName}} |
| **Periode** | {{currentDate}} |

---

## Historique des versions

| Version | Auteur | Description | Date |
|---|---|---|---|
| 1.0 | {{userName}} | Creation initiale | {{currentDate}} |

---

## 1. Synthese financiere

| Indicateur | Valeur |
|---|---|
| **Budget initial (BAC)** | {{initialBudget}} EUR |
| **Budget revise** | [A completer] EUR |
| **Depenses a date (AC)** | [A completer] EUR |
| **Valeur acquise (EV)** | [A completer] EUR |
| **% consomme** | [A completer]% |
| **% avancement physique** | [A completer]% |

**Commentaire general** : [Synthetisez la situation financiere du projet en quelques lignes : tendance, alertes, actions en cours.]

## 2. Detail par poste budgetaire

### 2.1 Ressources humaines

| Poste | Budget prevu | Engage | Consomme | Reste a depenser | Ecart |
|---|---|---|---|---|---|
| Chef de projet | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] |
| Equipe interne | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] |
| **Sous-total RH** | **[A completer]** | **[A completer]** | **[A completer]** | **[A completer]** | **[A completer]** |

### 2.2 Prestataires externes

| Prestataire | Budget prevu | Engage | Consomme | Reste a depenser | Ecart |
|---|---|---|---|---|---|
| [A completer] | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] |
| **Sous-total Prestataires** | **[A completer]** | **[A completer]** | **[A completer]** | **[A completer]** | **[A completer]** |

### 2.3 Materiel et infrastructure

| Poste | Budget prevu | Engage | Consomme | Reste a depenser | Ecart |
|---|---|---|---|---|---|
| [A completer] | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] |
| **Sous-total Materiel** | **[A completer]** | **[A completer]** | **[A completer]** | **[A completer]** | **[A completer]** |

### 2.4 Licences et logiciels

| Poste | Budget prevu | Engage | Consomme | Reste a depenser | Ecart |
|---|---|---|---|---|---|
| [A completer] | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] |
| **Sous-total Licences** | **[A completer]** | **[A completer]** | **[A completer]** | **[A completer]** | **[A completer]** |

### 2.5 Recapitulatif

| Poste | Budget prevu | Consomme | Reste | Ecart |
|---|---|---|---|---|
| Ressources humaines | [A completer] | [A completer] | [A completer] | [A completer] |
| Prestataires | [A completer] | [A completer] | [A completer] | [A completer] |
| Materiel | [A completer] | [A completer] | [A completer] | [A completer] |
| Licences | [A completer] | [A completer] | [A completer] | [A completer] |
| **TOTAL** | **{{initialBudget}} EUR** | **[A completer]** | **[A completer]** | **[A completer]** |

## 3. Indicateurs EVM (Earned Value Management)

| Indicateur | Formule | Valeur | Interpretation |
|---|---|---|---|
| **BAC** (Budget at Completion) | Budget initial | {{initialBudget}} EUR | Budget total prevu |
| **PV** (Planned Value) | Valeur planifiee a date | [A completer] EUR | Travail prevu a cette date |
| **EV** (Earned Value) | Valeur acquise a date | [A completer] EUR | Travail reellement accompli |
| **AC** (Actual Cost) | Cout reel a date | [A completer] EUR | Depenses reelles |
| **SV** (Schedule Variance) | EV - PV | [A completer] EUR | > 0 = avance, < 0 = retard |
| **CV** (Cost Variance) | EV - AC | [A completer] EUR | > 0 = economie, < 0 = depassement |
| **SPI** (Schedule Performance Index) | EV / PV | [A completer] | > 1 = avance, < 1 = retard |
| **CPI** (Cost Performance Index) | EV / AC | [A completer] | > 1 = economie, < 1 = depassement |
| **EAC** (Estimate at Completion) | BAC / CPI | [A completer] EUR | Prevision budget final |
| **ETC** (Estimate to Complete) | EAC - AC | [A completer] EUR | Reste a depenser estime |
| **VAC** (Variance at Completion) | BAC - EAC | [A completer] EUR | Ecart prevu a terminaison |

## 4. Courbe en S

[Inserez ou decrivez la courbe en S avec les 3 courbes : PV (valeur planifiee), EV (valeur acquise) et AC (cout reel). Indiquez la date de reference et les tendances observees.]

| Mois | PV cumule | EV cumule | AC cumule |
|---|---|---|---|
| M1 | [A completer] | [A completer] | [A completer] |
| M2 | [A completer] | [A completer] | [A completer] |
| M3 | [A completer] | [A completer] | [A completer] |
| M4 | [A completer] | [A completer] | [A completer] |
| M5 | [A completer] | [A completer] | [A completer] |
| M6 | [A completer] | [A completer] | [A completer] |

## 5. Alertes et actions correctives

| # | Alerte | Severite | Impact budget | Action corrective | Responsable | Echeance |
|---|---|---|---|---|---|---|
| A01 | [A completer] | Critique/Majeure/Mineure | [A completer] EUR | [A completer] | [A completer] | [A completer] |
| A02 | [A completer] | [A completer] | [A completer] EUR | [A completer] | [A completer] | [A completer] |

## 6. Previsions et recommandations

[Analysez la tendance financiere et formulez des recommandations : ajustements budgetaires, re-estimations, demandes de budget supplementaire, economies possibles.]

- **Tendance generale** : [A completer]
- **Recommandation 1** : [A completer]
- **Recommandation 2** : [A completer]
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'financial-summary',
          name: 'Synthese financiere',
          weight: 15,
          criteria: [
            { label: 'Vue d\'ensemble claire', description: 'Les chiffres cles (budget, depenses, reste) sont presentes de maniere synthetique', maxPoints: 8 },
            { label: 'Commentaire pertinent', description: 'Le commentaire general resume la situation avec les tendances et alertes', maxPoints: 7 },
          ],
        },
        {
          id: 'budget-breakdown',
          name: 'Detail par poste',
          weight: 20,
          criteria: [
            { label: 'Postes couverts', description: 'Les 4 postes (RH, prestataires, materiel, licences) sont detailles', maxPoints: 10 },
            { label: 'Chiffres coherents', description: 'Les montants sont coherents entre les sous-totaux et le total', maxPoints: 10 },
          ],
        },
        {
          id: 'evm-indicators',
          name: 'Indicateurs EVM',
          weight: 30,
          criteria: [
            { label: 'Indicateurs complets', description: 'Les 11 indicateurs EVM sont calcules (BAC, PV, EV, AC, SV, CV, SPI, CPI, EAC, ETC, VAC)', maxPoints: 15 },
            { label: 'Calculs corrects', description: 'Les formules sont correctement appliquees et les valeurs coherentes', maxPoints: 10 },
            { label: 'Interpretation', description: 'Chaque indicateur a une interpretation pertinente', maxPoints: 5 },
          ],
        },
        {
          id: 's-curve',
          name: 'Courbe en S',
          weight: 15,
          criteria: [
            { label: 'Donnees temporelles', description: 'Les valeurs PV, EV, AC sont fournies mois par mois', maxPoints: 8 },
            { label: 'Analyse de tendance', description: 'L\'evolution temporelle est commentee avec les ecarts visibles', maxPoints: 7 },
          ],
        },
        {
          id: 'alerts-recommendations',
          name: 'Alertes et recommandations',
          weight: 20,
          criteria: [
            { label: 'Alertes identifiees', description: 'Les ecarts significatifs sont signales avec severite et impact chiffre', maxPoints: 10 },
            { label: 'Actions correctives', description: 'Des actions concretes sont proposees avec responsable et echeance', maxPoints: 5 },
            { label: 'Recommandations', description: 'Les previsions et recommandations sont argumentees et realisables', maxPoints: 5 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['7.4.3.1 Work Performance Information', '7.4.3.2 Cost Forecasts', '7.4.3.3 Change Requests'],
    },
    referenceExample: `# Suivi Budgetaire — Projet SAP30/CMRL (Mois 4)

## Synthese financiere
Budget initial : 515 000 EUR. Depenses a date : 245 000 EUR (47,6%). Avancement physique : 55%. Le projet est en avance sur le budget grace a la negociation des tarifs prestataires.

## Indicateurs EVM
| Indicateur | Valeur | Interpretation |
|---|---|---|
| BAC | 515 000 EUR | Budget approuve |
| PV | 280 000 EUR | Travail planifie a M4 |
| EV | 283 250 EUR | 55% x 515K |
| AC | 245 000 EUR | Cout reel |
| SV | +3 250 EUR | Legerement en avance |
| CV | +38 250 EUR | Economie significative |
| SPI | 1.01 | En ligne |
| CPI | 1.16 | Tres bon (economie 16%) |
| EAC | 443 965 EUR | Prevision finale favorable |

## Alertes
| Alerte | Severite | Action |
|---|---|---|
| Risque depassement poste formation | Majeure | Re-negocier le contrat formateur — Resp: RH — Echeance: 15/06 |
`,
  },

  // ─── 02. Tableau de Bord Projet ────────────────────────────
  {
    id: 'seed-tpl-dashboard-report',
    title: 'Tableau de Bord Projet',
    type: 'dashboard-report',
    phase: 'MONITORING',
    description:
      "Dashboard de synthese du projet presentant les indicateurs globaux (scope, cout, delai, qualite), l'avancement par phase, les risques et actions prioritaires.",
    pmiProcess: '4.5',
    difficulty: 'STANDARD',
    content: `# Tableau de Bord Projet

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Code** | {{projectCode}} |
| **Chef de projet** | {{userName}} |
| **Periode de reporting** | {{currentDate}} |

---

## Historique des versions

| Version | Auteur | Description | Date |
|---|---|---|---|
| 1.0 | {{userName}} | Creation initiale | {{currentDate}} |

---

## 1. Indicateurs globaux

| Dimension | Statut (RAG) | Tendance | Commentaire |
|---|---|---|---|
| **Perimetre (Scope)** | 🟢 Vert / 🟠 Orange / 🔴 Rouge | ↗ ↘ → | [A completer] |
| **Couts (Cost)** | 🟢 Vert / 🟠 Orange / 🔴 Rouge | ↗ ↘ → | [A completer] |
| **Delais (Schedule)** | 🟢 Vert / 🟠 Orange / 🔴 Rouge | ↗ ↘ → | [A completer] |
| **Qualite (Quality)** | 🟢 Vert / 🟠 Orange / 🔴 Rouge | ↗ ↘ → | [A completer] |

### Legende RAG
- **Vert** : Conforme au plan, aucun ecart significatif
- **Orange** : Ecart modere, actions correctives en cours
- **Rouge** : Ecart critique, escalade necessaire

## 2. Avancement par phase

| Phase | % Avancement | Statut | Date debut | Date fin prevue | Date fin reelle |
|---|---|---|---|---|---|
| Initiation | [A completer]% | Termine/En cours/A venir | [A completer] | [A completer] | [A completer] |
| Planification | [A completer]% | [A completer] | [A completer] | [A completer] | [A completer] |
| Execution | [A completer]% | [A completer] | [A completer] | [A completer] | [A completer] |
| Controle | [A completer]% | [A completer] | [A completer] | [A completer] | [A completer] |
| Cloture | [A completer]% | [A completer] | [A completer] | [A completer] | [A completer] |

**Avancement global** : [A completer]%

## 3. Synthese budgetaire

| Indicateur | Valeur |
|---|---|
| Budget total | {{initialBudget}} EUR |
| Depenses a date | [A completer] EUR |
| Reste a depenser | [A completer] EUR |
| CPI | [A completer] |
| Prevision a terminaison (EAC) | [A completer] EUR |

## 4. Top 5 des risques

| # | Risque | Probabilite | Impact | Criticite | Responsable | Action en cours |
|---|---|---|---|---|---|---|
| 1 | [A completer] | Elevee/Moyenne/Faible | Eleve/Moyen/Faible | [P x I] | [A completer] | [A completer] |
| 2 | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] |
| 3 | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] |
| 4 | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] |
| 5 | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] |

## 5. Top 5 des actions

| # | Action | Priorite | Responsable | Echeance | Statut |
|---|---|---|---|---|---|
| 1 | [A completer] | Haute/Moyenne/Basse | [A completer] | [A completer] | En cours/En retard/Termine |
| 2 | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] |
| 3 | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] |
| 4 | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] |
| 5 | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] |

## 6. Prochains jalons

| Jalon | Date prevue | Responsable | Statut |
|---|---|---|---|
| [A completer] | [A completer] | [A completer] | En temps/A risque/En retard |
| [A completer] | [A completer] | [A completer] | [A completer] |
| [A completer] | [A completer] | [A completer] | [A completer] |

## 7. Points d'attention

[Listez les sujets necessitant une attention particuliere ou une decision du management.]

- [A completer]
- [A completer]
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'global-indicators',
          name: 'Indicateurs globaux',
          weight: 25,
          criteria: [
            { label: 'RAG complet', description: 'Les 4 dimensions (scope, cout, delai, qualite) ont un statut RAG attribue', maxPoints: 10 },
            { label: 'Commentaires pertinents', description: 'Chaque dimension a un commentaire explicatif coherent avec le statut', maxPoints: 10 },
            { label: 'Tendances', description: 'Les tendances sont indiquees et refletent la realite du projet', maxPoints: 5 },
          ],
        },
        {
          id: 'phase-progress',
          name: 'Avancement par phase',
          weight: 20,
          criteria: [
            { label: 'Phases detaillees', description: 'Les 5 phases sont presentees avec pourcentage et dates', maxPoints: 10 },
            { label: 'Coherence', description: 'L\'avancement global est coherent avec les phases individuelles', maxPoints: 10 },
          ],
        },
        {
          id: 'risks-actions',
          name: 'Risques et actions',
          weight: 25,
          criteria: [
            { label: 'Top 5 risques', description: '5 risques sont identifies avec probabilite, impact, criticite et responsable', maxPoints: 15 },
            { label: 'Top 5 actions', description: '5 actions sont listees avec priorite, responsable, echeance et statut', maxPoints: 10 },
          ],
        },
        {
          id: 'milestones',
          name: 'Jalons et budget',
          weight: 20,
          criteria: [
            { label: 'Jalons identifies', description: 'Au moins 3 prochains jalons avec dates et responsables', maxPoints: 10 },
            { label: 'Synthese budgetaire', description: 'Les indicateurs financiers cles sont presents et coherents', maxPoints: 10 },
          ],
        },
        {
          id: 'attention-points',
          name: 'Points d\'attention',
          weight: 10,
          criteria: [
            { label: 'Sujets identifies', description: 'Les points necessitant une decision ou une attention sont clairement formules', maxPoints: 10 },
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
| Perimetre | Vert | → | Perimetre stable, aucune demande de changement |
| Couts | Vert | ↗ | CPI 1.16, economie de 38K EUR |
| Delais | Orange | ↘ | Retard 5 jours sur migration MM, rattrapage en cours |
| Qualite | Vert | → | 0 defaut bloquant en recette |

## Top 5 Risques
| # | Risque | P | I | C | Action |
|---|---|---|---|---|---|
| 1 | Resistance utilisateurs Finance | 4 | 4 | 16 | Champions internes designes |
| 2 | Retard migration donnees | 4 | 3 | 12 | Migration incrementale |
| 3 | Indisponibilite expert SAP | 3 | 4 | 12 | Backup forme |

## Prochains jalons
| Jalon | Date | Statut |
|---|---|---|
| Fin migration SD | 15/06 | En temps |
| Debut recette integree | 01/07 | En temps |
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
      "Rapport de synthese rapide (1 page) pour communiquer le statut du projet. Presente le statut global, les faits marquants, les vigilances et les decisions attendues.",
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

**Etat du projet** : [Vert / Orange / Rouge]

[Expliquez en 2-3 phrases la situation globale du projet.]

| Dimension | Statut |
|---|---|
| Perimetre | 🟢 / 🟠 / 🔴 |
| Budget | 🟢 / 🟠 / 🔴 |
| Delais | 🟢 / 🟠 / 🔴 |
| Qualite | 🟢 / 🟠 / 🔴 |

## 2. Faits marquants de la periode

[Listez les 3 a 5 faits marquants de la periode ecoulee.]

- [A completer]
- [A completer]
- [A completer]

## 3. Points de vigilance

[Identifiez les sujets a surveiller dans les prochaines semaines.]

| Point de vigilance | Impact potentiel | Action envisagee |
|---|---|---|
| [A completer] | [A completer] | [A completer] |
| [A completer] | [A completer] | [A completer] |

## 4. Decisions attendues

[Listez les decisions que le management doit prendre.]

| Decision a prendre | Demandeur | Echeance souhaitee | Impact si non decidee |
|---|---|---|---|
| [A completer] | [A completer] | [A completer] | [A completer] |

## 5. Prochaines etapes

[Listez les activites cles des 2 prochaines semaines.]

- [ ] [A completer] — Responsable : [Nom] — Echeance : [Date]
- [ ] [A completer] — Responsable : [Nom] — Echeance : [Date]
- [ ] [A completer] — Responsable : [Nom] — Echeance : [Date]
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'global-status',
          name: 'Statut global',
          weight: 25,
          criteria: [
            { label: 'Statut RAG clair', description: 'Le statut global et par dimension est clairement attribue (Vert/Orange/Rouge)', maxPoints: 10 },
            { label: 'Synthese coherente', description: 'L\'explication du statut est concise et coherente avec les indicateurs', maxPoints: 15 },
          ],
        },
        {
          id: 'highlights',
          name: 'Faits marquants',
          weight: 25,
          criteria: [
            { label: 'Faits pertinents', description: 'Les faits marquants sont factuels et significatifs pour la periode', maxPoints: 15 },
            { label: 'Concision', description: 'Chaque fait est exprime de maniere concise et claire', maxPoints: 10 },
          ],
        },
        {
          id: 'vigilance',
          name: 'Points de vigilance',
          weight: 20,
          criteria: [
            { label: 'Anticipation', description: 'Les points de vigilance sont anticipes avec impact potentiel identifie', maxPoints: 10 },
            { label: 'Actions envisagees', description: 'Des actions preventives sont proposees pour chaque point', maxPoints: 10 },
          ],
        },
        {
          id: 'decisions-next-steps',
          name: 'Decisions et prochaines etapes',
          weight: 30,
          criteria: [
            { label: 'Decisions formalisees', description: 'Les decisions attendues sont claires avec echeance et impact si non decidees', maxPoints: 15 },
            { label: 'Prochaines etapes', description: 'Les prochaines etapes sont concretes avec responsables et echeances', maxPoints: 15 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['4.5.3.1 Work Performance Reports'],
    },
    referenceExample: `# Rapport Flash — SAP30/CMRL (12/05)

**Statut global** : Orange

Le projet avance conformement au plan sur le perimetre et le budget. Un retard de 5 jours est constate sur le module MM (migration donnees fournisseurs). Plan de rattrapage en cours.

## Faits marquants
- Migration FI/CO terminee avec succes le 08/05 (recette OK)
- Formation vague 1 planifiee (25 utilisateurs, debut 20/05)
- Retard migration MM : complexite donnees fournisseurs sous-estimee

## Points de vigilance
| Point | Impact | Action |
|---|---|---|
| Retard MM | Decalage recette integree de 1 semaine | Renfort equipe technique (2 ETP) |
| Disponibilite salle formation | Risque report formation | Reservation salles alternatives |

## Decisions attendues
| Decision | Echeance | Impact si non decidee |
|---|---|---|
| Validation budget renfort MM (+15K) | 15/05 | Retard supplementaire de 2 semaines |
`,
  },

  // ─── 04. Support Comite de Projet ──────────────────────────
  {
    id: 'seed-tpl-project-committee',
    title: 'Support Comite de Projet',
    type: 'project-committee',
    phase: 'MONITORING',
    description:
      "Support de presentation pour le comite de projet. Couvre l'avancement detaille, la charge equipe, les problemes operationnels, le planning actualise et les actions a valider.",
    pmiProcess: '10.2',
    difficulty: 'STANDARD',
    content: `# Comite de Projet — {{projectName}}

**Date** : {{currentDate}}
**Chef de projet** : {{userName}}
**Participants** : [A completer]

---

## Ordre du jour

1. Avancement detaille
2. Charge equipe
3. Problemes operationnels
4. Planning actualise
5. Actions a valider
6. Prochaine reunion

---

## 1. Avancement detaille

### 1.1 Avancement global

| Phase | % Prevu | % Reel | Ecart | Commentaire |
|---|---|---|---|---|
| Initiation | [A completer] | [A completer] | [A completer] | [A completer] |
| Planification | [A completer] | [A completer] | [A completer] | [A completer] |
| Execution | [A completer] | [A completer] | [A completer] | [A completer] |
| Controle | [A completer] | [A completer] | [A completer] | [A completer] |
| Cloture | [A completer] | [A completer] | [A completer] | [A completer] |

### 1.2 Avancement par lot de travail

| Lot | Responsable | % Avancement | Statut | Commentaire |
|---|---|---|---|---|
| [A completer] | [A completer] | [A completer]% | En cours/Termine/En retard | [A completer] |
| [A completer] | [A completer] | [A completer]% | [A completer] | [A completer] |
| [A completer] | [A completer] | [A completer]% | [A completer] | [A completer] |

### 1.3 Livrables de la periode

| Livrable | Responsable | Date prevue | Date reelle | Statut | Commentaire |
|---|---|---|---|---|---|
| [A completer] | [A completer] | [A completer] | [A completer] | Livre/En cours/En retard | [A completer] |
| [A completer] | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] |

## 2. Charge equipe

| Membre | Role | Charge prevue | Charge reelle | Disponibilite | Commentaire |
|---|---|---|---|---|---|
{{teamMembers}}
| [A completer] | [A completer] | [A completer] j/h | [A completer] j/h | [A completer]% | [A completer] |

### Alertes charge
[Signalez les situations de surcharge ou de sous-charge et les actions envisagees.]

- [A completer]

## 3. Problemes operationnels

| # | Probleme | Date detection | Impact | Priorite | Action corrective | Responsable | Statut |
|---|---|---|---|---|---|---|---|
| P01 | [A completer] | [A completer] | [A completer] | Haute/Moyenne/Basse | [A completer] | [A completer] | Ouvert/En cours/Resolu |
| P02 | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] |

## 4. Planning actualise

### 4.1 Jalons

| Jalon | Date initiale | Date actuelle | Ecart | Statut |
|---|---|---|---|---|
| [A completer] | [A completer] | [A completer] | [A completer] j | En temps/A risque/En retard |
| [A completer] | [A completer] | [A completer] | [A completer] j | [A completer] |
| [A completer] | [A completer] | [A completer] | [A completer] j | [A completer] |

### 4.2 Chemin critique

[Identifiez les taches sur le chemin critique et les marges disponibles.]

| Tache critique | Duree | Marge | Risque |
|---|---|---|---|
| [A completer] | [A completer] j | [A completer] j | [A completer] |

## 5. Actions a valider

| # | Action proposee | Justification | Impact (cout/delai) | Decision attendue |
|---|---|---|---|---|
| 1 | [A completer] | [A completer] | [A completer] | Approuver/Rejeter/Reporter |
| 2 | [A completer] | [A completer] | [A completer] | [A completer] |

## 6. Prochaine reunion

- **Date** : [A completer]
- **Ordre du jour previsionnel** : [A completer]
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'detailed-progress',
          name: 'Avancement detaille',
          weight: 25,
          criteria: [
            { label: 'Avancement par phase', description: 'Chaque phase a un pourcentage prevu vs reel avec ecart commente', maxPoints: 10 },
            { label: 'Lots de travail', description: 'Les lots sont detailles avec responsable, avancement et statut', maxPoints: 8 },
            { label: 'Livrables', description: 'Les livrables de la periode sont listes avec dates et statut', maxPoints: 7 },
          ],
        },
        {
          id: 'team-workload',
          name: 'Charge equipe',
          weight: 20,
          criteria: [
            { label: 'Charge detaillee', description: 'Chaque membre a sa charge prevue/reelle et sa disponibilite', maxPoints: 10 },
            { label: 'Alertes charge', description: 'Les situations de surcharge/sous-charge sont signalees avec actions', maxPoints: 10 },
          ],
        },
        {
          id: 'operational-issues',
          name: 'Problemes operationnels',
          weight: 20,
          criteria: [
            { label: 'Problemes identifies', description: 'Les problemes sont decrits avec impact, priorite et date de detection', maxPoints: 10 },
            { label: 'Actions correctives', description: 'Chaque probleme a une action corrective avec responsable et statut', maxPoints: 10 },
          ],
        },
        {
          id: 'updated-planning',
          name: 'Planning actualise',
          weight: 20,
          criteria: [
            { label: 'Jalons a jour', description: 'Les jalons montrent les ecarts entre dates initiales et actuelles', maxPoints: 10 },
            { label: 'Chemin critique', description: 'Le chemin critique est identifie avec les marges', maxPoints: 10 },
          ],
        },
        {
          id: 'actions-to-validate',
          name: 'Actions a valider',
          weight: 15,
          criteria: [
            { label: 'Actions formalisees', description: 'Les actions sont justifiees avec impact cout/delai et decision attendue', maxPoints: 15 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['10.2.3.1 Project Communications', '4.5.3.1 Work Performance Reports'],
    },
    referenceExample: `# Comite de Projet — SAP30/CMRL (22/05)

## Avancement
| Phase | % Prevu | % Reel | Ecart |
|---|---|---|---|
| Execution | 60% | 55% | -5% |

## Charge equipe
| Membre | Charge prevue | Charge reelle | Alerte |
|---|---|---|---|
| Expert SAP | 20 j/h | 25 j/h | Surcharge — renfort demande |
| Equipe technique | 40 j/h | 38 j/h | OK |

## Problemes
| # | Probleme | Action | Responsable |
|---|---|---|---|
| P01 | Retard migration MM | Renfort 2 ETP | DSI |
| P02 | Bug interface SD/MM | Correctif en cours | Architecte |

## Actions a valider
| Action | Impact | Decision |
|---|---|---|
| Budget renfort MM (+15K) | +15K EUR / rattrapage 5j retard | A approuver |
`,
  },

  // ─── 05. Support Comite de Pilotage ────────────────────────
  {
    id: 'seed-tpl-steering-committee',
    title: 'Support Comite de Pilotage',
    type: 'steering-committee',
    phase: 'MONITORING',
    description:
      "Support de presentation pour le comite de pilotage (COPIL). Presente la synthese executive, l'avancement physique et financier, les risques critiques, les demandes d'arbitrage et les prochains jalons.",
    pmiProcess: '10.2',
    difficulty: 'ADVANCED',
    content: `# Comite de Pilotage — {{projectName}}

**Date** : {{currentDate}}
**Chef de projet** : {{userName}}
**Sponsor** : {{sponsorName}}
**Participants** : [A completer]

---

## Ordre du jour

1. Synthese executive
2. Avancement (physique + financier)
3. Risques critiques
4. Demandes d'arbitrage
5. Budget
6. Prochains jalons
7. Prochaine reunion

---

## 1. Synthese executive

[En 5 a 10 lignes, resumez la situation du projet : statut global, principaux accomplissements de la periode, problemes majeurs et perspectives. Cette section doit permettre a un decideur de comprendre la situation en moins de 2 minutes.]

**Statut global** : 🟢 Vert / 🟠 Orange / 🔴 Rouge

| Dimension | Statut | Evolution |
|---|---|---|
| Perimetre | 🟢 / 🟠 / 🔴 | ↗ ↘ → |
| Couts | 🟢 / 🟠 / 🔴 | ↗ ↘ → |
| Delais | 🟢 / 🟠 / 🔴 | ↗ ↘ → |
| Qualite | 🟢 / 🟠 / 🔴 | ↗ ↘ → |
| Ressources | 🟢 / 🟠 / 🔴 | ↗ ↘ → |

## 2. Avancement

### 2.1 Avancement physique

| Phase | % Prevu | % Realise | Ecart | Commentaire |
|---|---|---|---|---|
| Initiation | [A completer] | [A completer] | [A completer] | [A completer] |
| Planification | [A completer] | [A completer] | [A completer] | [A completer] |
| Execution | [A completer] | [A completer] | [A completer] | [A completer] |
| Controle | [A completer] | [A completer] | [A completer] | [A completer] |
| Cloture | [A completer] | [A completer] | [A completer] | [A completer] |
| **Global** | **[A completer]** | **[A completer]** | **[A completer]** | |

**Faits marquants de la periode** :
- [A completer]
- [A completer]
- [A completer]

### 2.2 Avancement financier

| Indicateur | Valeur | Commentaire |
|---|---|---|
| Budget approuve (BAC) | {{initialBudget}} EUR | |
| Depenses a date (AC) | [A completer] EUR | [A completer]% consomme |
| Valeur acquise (EV) | [A completer] EUR | |
| CPI | [A completer] | > 1 = economie |
| SPI | [A completer] | > 1 = avance |
| Prevision a terminaison (EAC) | [A completer] EUR | |
| Ecart a terminaison (VAC) | [A completer] EUR | |

## 3. Risques critiques

[Presentez uniquement les risques de criticite elevee (>= 12) necessitant l'attention du COPIL.]

| # | Risque | P | I | C | Tendance | Action en cours | Responsable |
|---|---|---|---|---|---|---|---|
| 1 | [A completer] | [1-5] | [1-5] | [Auto] | ↗ ↘ → | [A completer] | [A completer] |
| 2 | [A completer] | [1-5] | [1-5] | [Auto] | ↗ ↘ → | [A completer] | [A completer] |
| 3 | [A completer] | [1-5] | [1-5] | [Auto] | ↗ ↘ → | [A completer] | [A completer] |

## 4. Demandes d'arbitrage

[Presentez les sujets necessitant une decision du COPIL. Chaque demande doit etre argumentee avec les options et impacts.]

### Arbitrage 1 : [Titre]

- **Contexte** : [A completer]
- **Options** :
  - Option A : [A completer] — Impact : [cout/delai]
  - Option B : [A completer] — Impact : [cout/delai]
- **Recommandation** : [A completer]
- **Decision attendue** : [A completer]

### Arbitrage 2 : [Titre]

- **Contexte** : [A completer]
- **Options** :
  - Option A : [A completer] — Impact : [cout/delai]
  - Option B : [A completer] — Impact : [cout/delai]
- **Recommandation** : [A completer]
- **Decision attendue** : [A completer]

## 5. Budget

| Poste | Budget initial | Budget revise | Consomme | Reste | Ecart |
|---|---|---|---|---|---|
| Ressources internes | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] |
| Prestataires | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] |
| Materiel / Licences | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] |
| Provisions risques | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] |
| **TOTAL** | **{{initialBudget}} EUR** | **[A completer]** | **[A completer]** | **[A completer]** | **[A completer]** |

## 6. Prochains jalons

| Jalon | Date prevue | Confiance | Risque principal |
|---|---|---|---|
| [A completer] | [A completer] | Haute/Moyenne/Faible | [A completer] |
| [A completer] | [A completer] | [A completer] | [A completer] |
| [A completer] | [A completer] | [A completer] | [A completer] |

## 7. Prochaine reunion

- **Date** : [A completer]
- **Ordre du jour previsionnel** : [A completer]

---

## Decisions prises en seance

| # | Decision | Responsable | Echeance |
|---|---|---|---|
| D01 | [A remplir en seance] | [A completer] | [A completer] |
| D02 | [A remplir en seance] | [A completer] | [A completer] |
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'executive-summary',
          name: 'Synthese executive',
          weight: 20,
          criteria: [
            { label: 'Synthese impactante', description: 'La situation est resumee de maniere claire et synthetique en moins de 10 lignes', maxPoints: 10 },
            { label: 'Statut RAG complet', description: 'Les 5 dimensions (scope, cout, delai, qualite, ressources) ont un statut et une evolution', maxPoints: 10 },
          ],
        },
        {
          id: 'progress',
          name: 'Avancement physique et financier',
          weight: 25,
          criteria: [
            { label: 'Avancement physique', description: 'L\'avancement par phase est detaille avec ecarts commentes', maxPoints: 10 },
            { label: 'Indicateurs EVM', description: 'Les indicateurs financiers (CPI, SPI, EAC, VAC) sont presents et corrects', maxPoints: 10 },
            { label: 'Faits marquants', description: 'Les realisations de la periode sont factuelles et significatives', maxPoints: 5 },
          ],
        },
        {
          id: 'critical-risks',
          name: 'Risques critiques',
          weight: 15,
          criteria: [
            { label: 'Risques critiques', description: 'Seuls les risques de criticite >= 12 sont presentes avec actions et responsables', maxPoints: 10 },
            { label: 'Tendances', description: 'L\'evolution des risques est indiquee', maxPoints: 5 },
          ],
        },
        {
          id: 'arbitration',
          name: 'Demandes d\'arbitrage',
          weight: 25,
          criteria: [
            { label: 'Arbitrages structures', description: 'Chaque demande a un contexte, des options avec impact et une recommandation', maxPoints: 15 },
            { label: 'Arguments factuels', description: 'Les arguments sont chiffres et objectifs pour faciliter la decision', maxPoints: 10 },
          ],
        },
        {
          id: 'budget-milestones',
          name: 'Budget et jalons',
          weight: 15,
          criteria: [
            { label: 'Budget detaille', description: 'Le budget est ventile par poste avec initial/revise/consomme/ecart', maxPoints: 8 },
            { label: 'Jalons avec confiance', description: 'Les prochains jalons ont un niveau de confiance et les risques associes', maxPoints: 7 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['10.2.3.1 Project Communications', '4.5.3.1 Work Performance Reports', '4.5.3.2 Change Requests'],
    },
    referenceExample: `# COPIL — SAP30/CMRL (01/06)

## Synthese executive
Le projet SAP30 est globalement en bonne voie (statut Orange). L'avancement physique est a 55% pour 52% prevu. Le budget est maitrise (CPI 1.16). Un retard de 5 jours est constate sur le module MM, necessitant un renfort budgetaire de 15K EUR. Deux arbitrages sont presentes au COPIL.

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
- **Contexte** : Retard migration MM de 5 jours, complexite donnees sous-estimee
- **Option A** : Renfort 2 ETP pendant 3 semaines (+15K EUR) — Rattrapage en 10 jours
- **Option B** : Statu quo — Retard supplementaire de 2 semaines, impact recette
- **Recommandation** : Option A (cout marginal vs impact planning)
`,
  },
];
