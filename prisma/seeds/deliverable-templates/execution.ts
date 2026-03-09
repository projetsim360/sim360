import type { DeliverableTemplateData } from './types';

export const executionTemplates: DeliverableTemplateData[] = [
  // ─── 01. Suivi des Actions ──────────────────────────────────
  {
    id: 'seed-tpl-action-tracker',
    title: 'Suivi des Actions',
    type: 'action-tracker',
    phase: 'EXECUTION',
    description:
      "Tableau de suivi des actions identifiees lors des reunions et des revues de projet. Permet de tracer chaque action, son responsable, sa priorite et son statut.",
    pmiProcess: '4.3',
    difficulty: 'DISCOVERY',
    content: `# Suivi des Actions

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Code** | {{projectCode}} |
| **Chef de projet** | {{userName}} |
| **Date de mise a jour** | {{currentDate}} |

---

## Historique des versions

| Version | Auteur | Description | Date |
|---|---|---|---|
| 1.0 | {{userName}} | Creation initiale | {{currentDate}} |

---

## 1. Registre des actions

| ID | Action | Responsable | Priorite | Date creation | Echeance | Statut | Commentaire |
|---|---|---|---|---|---|---|---|
| A01 | [Decrire l'action a realiser] | [Nom du responsable] | Haute/Moyenne/Basse | {{currentDate}} | [JJ/MM/AAAA] | A faire | [A completer] |
| A02 | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] | A faire | [A completer] |
| A03 | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] | A faire | [A completer] |
| A04 | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] | A faire | [A completer] |
| A05 | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] | A faire | [A completer] |

### Legende des statuts
- **A faire** : Action identifiee, non demarree
- **En cours** : Action en cours de realisation
- **Terminee** : Action realisee et validee
- **En retard** : Echeance depassee, action non terminee
- **Annulee** : Action annulee (justification requise)

### Legende des priorites
- **Haute** : Impact direct sur le chemin critique ou les livrables majeurs
- **Moyenne** : Impact sur la qualite ou l'efficacite du projet
- **Basse** : Amelioration ou optimisation sans impact immediat

## 2. Synthese des actions

| Statut | Nombre | Pourcentage |
|---|---|---|
| A faire | [X] | [X]% |
| En cours | [X] | [X]% |
| Terminee | [X] | [X]% |
| En retard | [X] | [X]% |
| Annulee | [X] | [X]% |
| **Total** | **[X]** | **100%** |

## 3. Actions en retard (alertes)

[Listez les actions en retard avec la justification du retard et le nouveau delai prevu.]

| ID | Action | Responsable | Echeance initiale | Retard (jours) | Justification | Nouvelle echeance |
|---|---|---|---|---|---|---|
| [A completer] | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] |
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'completeness',
          name: 'Completude du registre',
          weight: 30,
          criteria: [
            { label: 'Actions identifiees', description: 'Au moins 5 actions sont identifiees avec une description claire et precise', maxPoints: 15 },
            { label: 'Champs renseignes', description: 'Chaque action a tous les champs remplis (responsable, priorite, dates, statut)', maxPoints: 15 },
          ],
        },
        {
          id: 'prioritization',
          name: 'Priorisation et coherence',
          weight: 25,
          criteria: [
            { label: 'Priorites justifiees', description: 'Les priorites sont coherentes avec l\'impact sur le projet', maxPoints: 15 },
            { label: 'Echeances realistes', description: 'Les echeances sont realistes et coherentes avec le planning du projet', maxPoints: 10 },
          ],
        },
        {
          id: 'tracking',
          name: 'Suivi et synthese',
          weight: 25,
          criteria: [
            { label: 'Synthese a jour', description: 'Le tableau de synthese est rempli et les pourcentages sont corrects', maxPoints: 15 },
            { label: 'Alertes retard', description: 'Les actions en retard sont identifiees avec justification et nouveau delai', maxPoints: 10 },
          ],
        },
        {
          id: 'quality',
          name: 'Qualite de redaction',
          weight: 20,
          criteria: [
            { label: 'Descriptions actionnables', description: 'Les descriptions d\'actions sont claires, precises et actionnables (verbe d\'action)', maxPoints: 10 },
            { label: 'Commentaires pertinents', description: 'Les commentaires apportent de la valeur ajoutee (contexte, blocages, dependances)', maxPoints: 10 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['4.3.3.1 Deliverables', '4.3.3.2 Work Performance Data'],
    },
    referenceExample: `# Suivi des Actions — SAP30/CMRL

| ID | Action | Responsable | Priorite | Creation | Echeance | Statut | Commentaire |
|---|---|---|---|---|---|---|---|
| A01 | Commander licences SAP S/4HANA | DSI | Haute | 15/01 | 31/01 | Terminee | PO emis le 20/01, livraison confirmee |
| A02 | Planifier formation key users FI/CO | RH | Haute | 15/01 | 15/02 | En cours | 12 users identifies, salle reservee |
| A03 | Realiser PoC interface legacy | Architecte | Haute | 20/01 | 28/02 | En cours | Environnement de test pret |
| A04 | Definir strategie migration donnees | DBA | Moyenne | 22/01 | 15/02 | A faire | Reunion prevue le 01/02 |
| A05 | Mettre a jour documentation securite | RSSI | Basse | 25/01 | 31/03 | A faire | Attente normes internes |
`,
  },

  // ─── 02. Suivi des Livrables ────────────────────────────────
  {
    id: 'seed-tpl-deliverable-tracker',
    title: 'Suivi des Livrables',
    type: 'deliverable-tracker',
    phase: 'EXECUTION',
    description:
      "Tableau de suivi de l'avancement des livrables du projet. Permet de tracer la production, la qualite et le respect des echeances de chaque livrable.",
    pmiProcess: '4.3',
    difficulty: 'DISCOVERY',
    content: `# Suivi des Livrables

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Code** | {{projectCode}} |
| **Chef de projet** | {{userName}} |
| **Date de mise a jour** | {{currentDate}} |

---

## Historique des versions

| Version | Auteur | Description | Date |
|---|---|---|---|
| 1.0 | {{userName}} | Creation initiale | {{currentDate}} |

---

## 1. Registre des livrables

| ID | Livrable | Phase | Responsable | Date prevue | Date reelle | Statut | Qualite |
|---|---|---|---|---|---|---|---|
| L01 | [Nom du livrable] | Initiation | [Responsable] | [JJ/MM/AAAA] | [JJ/MM/AAAA ou -] | A produire | Non evalue |
| L02 | [A completer] | Planification | [A completer] | [A completer] | [A completer] | A produire | Non evalue |
| L03 | [A completer] | Execution | [A completer] | [A completer] | [A completer] | A produire | Non evalue |
| L04 | [A completer] | Execution | [A completer] | [A completer] | [A completer] | A produire | Non evalue |
| L05 | [A completer] | Cloture | [A completer] | [A completer] | [A completer] | A produire | Non evalue |

### Legende des statuts
- **A produire** : Livrable planifie, non demarre
- **En cours** : Livrable en cours de production
- **En revue** : Livrable soumis pour revue/validation
- **Valide** : Livrable approuve par le destinataire
- **Rejete** : Livrable rejete, necessitant des corrections
- **En retard** : Echeance depassee

### Legende qualite
- **Non evalue** : Livrable non encore soumis
- **Conforme** : Repond aux criteres d'acceptation
- **A ameliorer** : Ecarts mineurs identifies
- **Non conforme** : Ecarts majeurs, reprise necessaire

## 2. Synthese d'avancement

| Phase | Total livrables | Valides | En cours | En retard | Taux de completion |
|---|---|---|---|---|---|
| Initiation | [X] | [X] | [X] | [X] | [X]% |
| Planification | [X] | [X] | [X] | [X] | [X]% |
| Execution | [X] | [X] | [X] | [X] | [X]% |
| Cloture | [X] | [X] | [X] | [X] | [X]% |
| **Total** | **[X]** | **[X]** | **[X]** | **[X]** | **[X]%** |

## 3. Livrables critiques et alertes

[Identifiez les livrables en retard ou rejetes et les actions correctives prevues.]

| ID | Livrable | Probleme | Impact | Action corrective | Responsable | Delai |
|---|---|---|---|---|---|---|
| [A completer] | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] |
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'completeness',
          name: 'Completude du registre',
          weight: 30,
          criteria: [
            { label: 'Livrables identifies', description: 'Tous les livrables du projet sont listes avec leur phase associee', maxPoints: 15 },
            { label: 'Champs renseignes', description: 'Chaque livrable a un responsable, des dates prevues et un statut', maxPoints: 15 },
          ],
        },
        {
          id: 'tracking',
          name: 'Suivi et qualite',
          weight: 30,
          criteria: [
            { label: 'Statuts a jour', description: 'Les statuts refletent l\'etat reel d\'avancement des livrables', maxPoints: 15 },
            { label: 'Evaluation qualite', description: 'La qualite de chaque livrable soumis est evaluee', maxPoints: 15 },
          ],
        },
        {
          id: 'synthesis',
          name: 'Synthese et alertes',
          weight: 25,
          criteria: [
            { label: 'Tableau de synthese', description: 'La synthese par phase est complete avec les taux de completion', maxPoints: 15 },
            { label: 'Alertes documentees', description: 'Les livrables en retard ou rejetes sont documentes avec actions correctives', maxPoints: 10 },
          ],
        },
        {
          id: 'coherence',
          name: 'Coherence globale',
          weight: 15,
          criteria: [
            { label: 'Alignement planning', description: 'Les dates prevues sont coherentes avec le planning du projet', maxPoints: 8 },
            { label: 'Couverture des phases', description: 'Toutes les phases du projet ont au moins un livrable associe', maxPoints: 7 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['4.3.3.1 Deliverables', '4.3.3.2 Work Performance Data'],
    },
    referenceExample: `# Suivi des Livrables — SAP30/CMRL

| ID | Livrable | Phase | Responsable | Prevue | Reelle | Statut | Qualite |
|---|---|---|---|---|---|---|---|
| L01 | Etude d'opportunite | Initiation | Chef de projet | 15/01 | 14/01 | Valide | Conforme |
| L02 | Charte projet | Initiation | Chef de projet | 31/01 | 30/01 | Valide | Conforme |
| L03 | Cahier des charges fonctionnel | Planification | Analyste metier | 28/02 | 05/03 | Valide | A ameliorer |
| L04 | Specifications techniques | Planification | Architecte | 15/03 | - | En cours | Non evalue |
| L05 | Module FI migre | Execution | Consultant SAP | 30/06 | - | A produire | Non evalue |
| L06 | Module CO migre | Execution | Consultant SAP | 15/07 | - | A produire | Non evalue |
| L07 | PV de recette | Cloture | Chef de projet | 15/12 | - | A produire | Non evalue |
`,
  },

  // ─── 03. Compte-Rendu de Reunion ────────────────────────────
  {
    id: 'seed-tpl-meeting-minutes',
    title: 'Compte-Rendu de Reunion',
    type: 'meeting-minutes',
    phase: 'EXECUTION',
    description:
      "Document officiel de suivi des reunions de projet. Consigne les participants, les echanges, les decisions prises et les actions a mener.",
    pmiProcess: '10.2',
    difficulty: 'DISCOVERY',
    content: `# Compte-Rendu de Reunion

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Code** | {{projectCode}} |
| **Date** | {{currentDate}} |
| **Lieu** | [Salle / Visioconference] |
| **Animateur** | {{userName}} |
| **Redacteur** | {{userName}} |

---

## 1. Participants

| Nom | Fonction | Present | Excuse |
|---|---|---|---|
| {{userName}} | Chef de projet | X | |
| {{sponsorName}} | Sponsor | [X ou -] | [X ou -] |
| [A completer] | [A completer] | [X ou -] | [X ou -] |
| [A completer] | [A completer] | [X ou -] | [X ou -] |

## 2. Objectif de la reunion

[Decrivez en une ou deux phrases l'objectif principal de cette reunion.]

## 3. Ordre du jour

| # | Sujet | Duree prevue | Presentateur |
|---|---|---|---|
| 1 | [A completer] | [X] min | [Nom] |
| 2 | [A completer] | [X] min | [Nom] |
| 3 | [A completer] | [X] min | [Nom] |
| 4 | Questions diverses | [X] min | Tous |

## 4. Echanges par sujet

### Sujet 1 : [Titre]
[Resumez les points discutes, les arguments avances et les conclusions. Mentionnez les intervenants principaux.]

### Sujet 2 : [Titre]
[Resumez les points discutes, les arguments avances et les conclusions.]

### Sujet 3 : [Titre]
[Resumez les points discutes, les arguments avances et les conclusions.]

## 5. Decisions prises

| # | Decision | Proposee par | Validee par |
|---|---|---|---|
| D1 | [A completer] | [Nom] | [Nom(s)] |
| D2 | [A completer] | [Nom] | [Nom(s)] |

## 6. Actions a mener

| # | Action | Responsable | Echeance | Priorite |
|---|---|---|---|---|
| A1 | [A completer] | [Nom] | [JJ/MM/AAAA] | Haute/Moyenne/Basse |
| A2 | [A completer] | [Nom] | [JJ/MM/AAAA] | [A completer] |
| A3 | [A completer] | [Nom] | [JJ/MM/AAAA] | [A completer] |

## 7. Prochaine reunion

| Champ | Valeur |
|---|---|
| **Date** | [JJ/MM/AAAA] |
| **Heure** | [HH:MM] |
| **Lieu** | [A confirmer] |
| **Ordre du jour previsionnel** | [A completer] |
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'participants-objective',
          name: 'Participants et objectif',
          weight: 15,
          criteria: [
            { label: 'Liste complete', description: 'Tous les participants et excuses sont listes avec leur fonction', maxPoints: 8 },
            { label: 'Objectif clair', description: 'L\'objectif de la reunion est clairement enonce', maxPoints: 7 },
          ],
        },
        {
          id: 'discussions',
          name: 'Echanges et sujets',
          weight: 30,
          criteria: [
            { label: 'Ordre du jour suivi', description: 'Chaque sujet de l\'ordre du jour est traite dans les echanges', maxPoints: 10 },
            { label: 'Synthese fidele', description: 'Les echanges sont resumes de maniere neutre et complete', maxPoints: 10 },
            { label: 'Intervenants cites', description: 'Les intervenants principaux sont mentionnes pour chaque sujet', maxPoints: 10 },
          ],
        },
        {
          id: 'decisions',
          name: 'Decisions',
          weight: 25,
          criteria: [
            { label: 'Decisions claires', description: 'Les decisions sont formulees sans ambiguite', maxPoints: 15 },
            { label: 'Validation tracee', description: 'Chaque decision indique qui l\'a proposee et validee', maxPoints: 10 },
          ],
        },
        {
          id: 'actions-next',
          name: 'Actions et suite',
          weight: 30,
          criteria: [
            { label: 'Actions concretes', description: 'Les actions sont precises avec responsable et echeance', maxPoints: 15 },
            { label: 'Prochaine reunion', description: 'La date, le lieu et l\'ordre du jour de la prochaine reunion sont prevus', maxPoints: 15 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['10.2.3.1 Project Communications', '10.2.3.2 Project Management Plan Updates'],
    },
    referenceExample: `# Compte-Rendu — Comite Projet SAP30/CMRL — 15/02

## Participants
| Nom | Fonction | Present |
|---|---|---|
| Mme Martin | Chef de projet | X |
| M. Leroy | DSI | X |
| Mme Duval | Consultante SAP | X |
| M. Petit | DBA | Excuse |

## Objectif
Valider l'avancement de la phase de specification et arbitrer les choix d'interfaces.

## Echanges
### Migration module FI
Mme Duval presente l'avancement : 80% des specifications validees. Point de blocage sur l'interface avec le systeme de paie — 2 options techniques identifiees (API REST vs batch nocturne).

### Planning formation
M. Leroy confirme la disponibilite de la salle de formation du 01/03 au 15/03. 12 key users inscrits.

## Decisions
| # | Decision | Validee par |
|---|---|---|
| D1 | Interface paie via API REST (temps reel) | DSI + Chef de projet |
| D2 | Formation en 2 groupes de 6 utilisateurs | Chef de projet |

## Actions
| # | Action | Responsable | Echeance |
|---|---|---|---|
| A1 | Finaliser specifications interface paie | Mme Duval | 22/02 |
| A2 | Envoyer convocations formation | RH | 20/02 |
`,
  },

  // ─── 04. Minutes du Comite de Pilotage ──────────────────────
  {
    id: 'seed-tpl-steering-minutes',
    title: 'Minutes du Comite de Pilotage',
    type: 'steering-minutes',
    phase: 'EXECUTION',
    description:
      "Compte-rendu formel du comite de pilotage (COPIL). Presente la synthese de l'avancement, les previsions, les problemes, les risques, le budget (EVM) et les decisions strategiques.",
    pmiProcess: '10.2',
    difficulty: 'STANDARD',
    content: `# Minutes du Comite de Pilotage (COPIL)

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Code** | {{projectCode}} |
| **COPIL n°** | [Numero] |
| **Date** | {{currentDate}} |
| **Prochain COPIL** | [JJ/MM/AAAA] |

---

## Historique des versions

| Version | Auteur | Description | Date |
|---|---|---|---|
| 1.0 | {{userName}} | Creation initiale | {{currentDate}} |

---

## 1. Note de synthese

[Resumez en quelques lignes la situation globale du projet : avancement, tendance, points d'attention majeurs. Utilisez un code couleur : VERT (conforme), ORANGE (vigilance), ROUGE (alerte).]

**Statut global** : [VERT / ORANGE / ROUGE]

| Dimension | Statut | Commentaire |
|---|---|---|
| Perimetre | [VERT/ORANGE/ROUGE] | [A completer] |
| Delais | [VERT/ORANGE/ROUGE] | [A completer] |
| Budget | [VERT/ORANGE/ROUGE] | [A completer] |
| Qualite | [VERT/ORANGE/ROUGE] | [A completer] |
| Ressources | [VERT/ORANGE/ROUGE] | [A completer] |

## 2. Avancement du projet

### 2.1 Progression par phase

| Phase | Avancement | Commentaire |
|---|---|---|
| Initiation | [X]% | [A completer] |
| Planification | [X]% | [A completer] |
| Execution | [X]% | [A completer] |
| Cloture | [X]% | [A completer] |

### 2.2 Jalons

| Jalon | Date prevue | Date reelle/previsionnelle | Statut |
|---|---|---|---|
| [A completer] | [JJ/MM/AAAA] | [JJ/MM/AAAA] | Atteint/En cours/En retard |
| [A completer] | [JJ/MM/AAAA] | [JJ/MM/AAAA] | [A completer] |

## 3. Previsions

[Presentez les previsions pour la prochaine periode : activites planifiees, livrables attendus, jalons a venir.]

| Activite | Responsable | Date prevue | Dependances |
|---|---|---|---|
| [A completer] | [A completer] | [A completer] | [A completer] |

## 4. Problemes et points de blocage

| # | Probleme | Impact | Severite | Action en cours | Responsable | Echeance |
|---|---|---|---|---|---|---|
| P1 | [A completer] | [A completer] | Critique/Majeur/Mineur | [A completer] | [A completer] | [A completer] |
| P2 | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] |

## 5. Risques

| ID | Risque | Probabilite | Impact | Criticite | Action d'attenuation | Responsable |
|---|---|---|---|---|---|---|
| R01 | [A completer] | [1-5] | [1-5] | [P x I] | [A completer] | [A completer] |
| R02 | [A completer] | [1-5] | [1-5] | [P x I] | [A completer] | [A completer] |

## 6. Suivi budgetaire (Earned Value Management)

| Indicateur | Valeur | Commentaire |
|---|---|---|
| **Budget total (BAC)** | {{initialBudget}} EUR | Budget a l'achevement |
| **Valeur planifiee (PV)** | [X] EUR | Travail planifie a ce jour |
| **Valeur acquise (EV)** | [X] EUR | Travail effectivement realise |
| **Cout reel (AC)** | [X] EUR | Depenses reelles a ce jour |
| **Ecart cout (CV = EV - AC)** | [X] EUR | Positif = sous le budget |
| **Ecart delai (SV = EV - PV)** | [X] EUR | Positif = en avance |
| **Indice performance cout (CPI)** | [X] | > 1 = sous le budget |
| **Indice performance delai (SPI)** | [X] | > 1 = en avance |
| **Estimation a l'achevement (EAC)** | [X] EUR | Cout total prevu |

## 7. Decisions du COPIL

| # | Decision | Impact | Proposee par | Validee par |
|---|---|---|---|---|
| D1 | [A completer] | [A completer] | [Nom] | COPIL |
| D2 | [A completer] | [A completer] | [Nom] | COPIL |

## 8. Prochaine reunion

| Champ | Valeur |
|---|---|
| **Date** | [JJ/MM/AAAA] |
| **Ordre du jour previsionnel** | [A completer] |
| **Documents a preparer** | [A completer] |
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'executive-summary',
          name: 'Note de synthese',
          weight: 15,
          criteria: [
            { label: 'Synthese claire', description: 'La situation globale est resumee avec un code couleur par dimension', maxPoints: 10 },
            { label: 'Tendance identifiee', description: 'La tendance (amelioration / degradation / stable) est visible', maxPoints: 5 },
          ],
        },
        {
          id: 'progress',
          name: 'Avancement et previsions',
          weight: 20,
          criteria: [
            { label: 'Progression chiffree', description: 'L\'avancement par phase est quantifie en pourcentage', maxPoints: 10 },
            { label: 'Jalons traces', description: 'Les jalons sont listes avec dates prevues vs reelles', maxPoints: 5 },
            { label: 'Previsions detaillees', description: 'Les activites de la prochaine periode sont identifiees', maxPoints: 5 },
          ],
        },
        {
          id: 'issues-risks',
          name: 'Problemes et risques',
          weight: 20,
          criteria: [
            { label: 'Problemes documentes', description: 'Les points de blocage sont decrits avec impact, severite et actions', maxPoints: 10 },
            { label: 'Risques a jour', description: 'Les risques sont actualises avec probabilite, impact et actions d\'attenuation', maxPoints: 10 },
          ],
        },
        {
          id: 'budget-evm',
          name: 'Suivi budgetaire (EVM)',
          weight: 25,
          criteria: [
            { label: 'Indicateurs EVM', description: 'Les indicateurs PV, EV, AC, CV, SV, CPI, SPI sont calcules', maxPoints: 15 },
            { label: 'Interpretation', description: 'Les indicateurs sont interpretes avec commentaires (tendance, previsions)', maxPoints: 10 },
          ],
        },
        {
          id: 'decisions',
          name: 'Decisions et suite',
          weight: 20,
          criteria: [
            { label: 'Decisions formalisees', description: 'Les decisions sont claires avec impact et validation du COPIL', maxPoints: 10 },
            { label: 'Prochaine reunion', description: 'La date et l\'ordre du jour du prochain COPIL sont definis', maxPoints: 10 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['10.2.3.1 Project Communications', '4.5.3.1 Work Performance Reports'],
    },
    referenceExample: `# COPIL n°3 — SAP30/CMRL — 15/03

## Note de synthese
Le projet est globalement conforme au planning. Le module FI est migre a 90%. Un point de vigilance sur le budget prestataires (+8% par rapport au previsionnel). Le risque de resistance au changement est en hausse suite au sondage interne.

**Statut global** : ORANGE

| Dimension | Statut |
|---|---|
| Perimetre | VERT |
| Delais | VERT |
| Budget | ORANGE (+8%) |
| Qualite | VERT |

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

*CPI < 1 : depassement budgetaire de 7%. Actions correctives en cours (renegociation contrat prestataire).*

## Decisions
| # | Decision |
|---|---|
| D1 | Renforcer la conduite du changement : 2 ateliers supplementaires |
| D2 | Renegocier le contrat prestataire pour plafonner les depassements |
`,
  },

  // ─── 05. Registre des Demandes de Changement ────────────────
  {
    id: 'seed-tpl-change-request',
    title: 'Registre des Demandes de Changement',
    type: 'change-request',
    phase: 'EXECUTION',
    description:
      "Registre centralise de toutes les demandes de changement du projet. Documente la justification, l'analyse d'impact (cout, delai, perimetre) et la decision pour chaque demande.",
    pmiProcess: '4.6',
    difficulty: 'STANDARD',
    content: `# Registre des Demandes de Changement

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Code** | {{projectCode}} |
| **Chef de projet** | {{userName}} |
| **Date de mise a jour** | {{currentDate}} |

---

## Historique des versions

| Version | Auteur | Description | Date |
|---|---|---|---|
| 1.0 | {{userName}} | Creation initiale | {{currentDate}} |

---

## 1. Registre des changements

| ID | Demandeur | Date | Description | Justification | Impact Cout | Impact Delai | Impact Perimetre | Priorite | Decision | Statut |
|---|---|---|---|---|---|---|---|---|---|---|
| CR01 | [Nom] | {{currentDate}} | [Decrire le changement demande] | [Pourquoi ce changement est necessaire] | [+X EUR / Neutre] | [+X jours / Neutre] | [Extension / Reduction / Neutre] | Haute/Moyenne/Basse | En attente | Soumise |
| CR02 | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] | En attente | Soumise |
| CR03 | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] | En attente | Soumise |

### Legende des decisions
- **En attente** : Demande en cours d'analyse
- **Approuvee** : Changement approuve par le COPIL/sponsor
- **Rejetee** : Changement rejete (justification requise)
- **Differee** : Reportee a une phase ulterieure
- **Annulee** : Demande annulee par le demandeur

### Legende des statuts
- **Soumise** : Demande deposee, en attente d'analyse
- **En analyse** : Analyse d'impact en cours
- **Decidee** : Decision prise (approuvee, rejetee ou differee)
- **Implementee** : Changement approuve et mis en oeuvre
- **Cloturee** : Changement verifie et cloture

## 2. Analyse d'impact detaillee

### CR01 — [Titre du changement]

**Demandeur** : [Nom] — **Date** : {{currentDate}}

**Description** : [Description detaillee du changement]

**Justification** : [Pourquoi ce changement est necessaire, risques si non traite]

| Dimension | Impact | Detail |
|---|---|---|
| Cout | [+X EUR / Neutre] | [Detailler les couts supplementaires] |
| Delai | [+X jours / Neutre] | [Impact sur le planning et les jalons] |
| Perimetre | [Extension / Reduction / Neutre] | [Ce qui est ajoute/retire du perimetre] |
| Qualite | [Positif / Neutre / Negatif] | [Impact sur la qualite des livrables] |
| Risques | [Nouveaux risques identifies] | [Decrire les risques induits] |

**Recommandation** : [Approuver / Rejeter / Differer — avec justification]

## 3. Synthese des changements

| Statut | Nombre | Impact cout cumule | Impact delai cumule |
|---|---|---|---|
| Approuvees | [X] | [+X EUR] | [+X jours] |
| Rejetees | [X] | - | - |
| En attente | [X] | [X EUR potentiel] | [X jours potentiel] |
| **Total** | **[X]** | **[X EUR]** | **[X jours]** |
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'completeness',
          name: 'Completude du registre',
          weight: 25,
          criteria: [
            { label: 'Demandes documentees', description: 'Chaque demande a un ID, demandeur, date, description et justification', maxPoints: 15 },
            { label: 'Statuts traces', description: 'Chaque demande a un statut et une decision clairement indiques', maxPoints: 10 },
          ],
        },
        {
          id: 'impact-analysis',
          name: 'Analyse d\'impact',
          weight: 35,
          criteria: [
            { label: 'Triple contrainte', description: 'L\'impact sur cout, delai et perimetre est evalue pour chaque demande', maxPoints: 15 },
            { label: 'Analyse detaillee', description: 'Au moins une demande a une analyse d\'impact approfondie avec recommandation', maxPoints: 10 },
            { label: 'Risques induits', description: 'Les nouveaux risques lies au changement sont identifies', maxPoints: 10 },
          ],
        },
        {
          id: 'decision-process',
          name: 'Processus de decision',
          weight: 25,
          criteria: [
            { label: 'Priorites coherentes', description: 'Les priorites sont justifiees par rapport a l\'impact', maxPoints: 10 },
            { label: 'Decisions tracees', description: 'Les decisions sont documentees avec le decideur et la justification', maxPoints: 15 },
          ],
        },
        {
          id: 'synthesis',
          name: 'Synthese',
          weight: 15,
          criteria: [
            { label: 'Cumul des impacts', description: 'L\'impact cumule des changements approuves est calcule (cout + delai)', maxPoints: 15 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['4.6.3.1 Approved Change Requests', '4.6.3.2 Change Log'],
    },
    referenceExample: `# Registre des Changements — SAP30/CMRL

| ID | Demandeur | Description | Impact Cout | Impact Delai | Decision | Statut |
|---|---|---|---|---|---|---|
| CR01 | DG | Ajout module QM (Qualite) | +45 000 EUR | +15 jours | Approuvee | Implementee |
| CR02 | Finance | Report migration donnees historiques > 5 ans | -15 000 EUR | -5 jours | Approuvee | Implementee |
| CR03 | DSI | Migration serveur on-premise → Cloud | +80 000 EUR | +30 jours | Rejetee | Cloturee |
| CR04 | RH | Ajout 10 utilisateurs supplementaires a former | +8 000 EUR | +3 jours | Approuvee | En cours |

**Impact cumule approuve** : +38 000 EUR, +13 jours
**Nouveau budget** : 553 000 EUR — **Nouveau delai** : +13 jours
`,
  },

  // ─── 06. Strategie de Tests ─────────────────────────────────
  {
    id: 'seed-tpl-test-strategy',
    title: 'Strategie de Tests',
    type: 'test-strategy',
    phase: 'EXECUTION',
    description:
      "Document definissant la strategie de tests du projet basee sur la methodologie AMDEC. Couvre les objectifs, l'analyse des risques, la repartition des tests par niveau et les plans de tests.",
    pmiProcess: '8.3',
    difficulty: 'ADVANCED',
    content: `# Strategie de Tests

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Code** | {{projectCode}} |
| **Chef de projet** | {{userName}} |
| **Responsable tests** | [A completer] |
| **Date** | {{currentDate}} |

---

## Historique des versions

| Version | Auteur | Description | Date |
|---|---|---|---|
| 1.0 | {{userName}} | Creation initiale | {{currentDate}} |

---

## 1. Objectifs de la strategie de tests

[Definissez les objectifs generaux de la demarche de tests : assurer la qualite, detecter les defauts, valider la conformite aux exigences.]

- Garantir la conformite fonctionnelle des livrables aux specifications
- Detecter et corriger les defauts avant la mise en production
- Valider les performances et la securite du systeme
- Fournir une couverture de tests tracable aux exigences

## 2. Generalites

### 2.1 Perimetre des tests

| Element | En perimetre | Hors perimetre |
|---|---|---|
| [A completer] | X | |
| [A completer] | | X |

### 2.2 Environnements de test

| Environnement | Usage | Responsable | Disponibilite |
|---|---|---|---|
| Developpement | Tests unitaires | Equipe dev | Continu |
| Integration | Tests d'integration | Equipe test | [A completer] |
| Recette | Tests de validation | Utilisateurs cles | [A completer] |
| Pre-production | Tests de performance | Equipe infra | [A completer] |

### 2.3 Outils de test

| Outil | Usage | Licence |
|---|---|---|
| [A completer] | [A completer] | [A completer] |

## 3. Methodologie AMDEC (Analyse des Modes de Defaillance, de leurs Effets et de leur Criticite)

### 3.1 Principes

L'analyse AMDEC permet de prioriser les tests en fonction de la criticite des defaillances potentielles. Chaque exigence ou composant est evalue selon trois criteres :
- **Gravite (G)** : Impact de la defaillance (1-5)
- **Occurrence (O)** : Probabilite d'apparition (1-5)
- **Detection (D)** : Capacite a detecter le defaut avant livraison (1-5, 5 = non detectable)
- **Criticite (C = G x O x D)** : Score de priorisation

### 3.2 Echelle de cotation

| Score | Gravite | Occurrence | Detection |
|---|---|---|---|
| 1 | Negligeable | Tres improbable | Detection certaine |
| 2 | Mineure | Improbable | Detection probable |
| 3 | Significative | Occasionnelle | Detection possible |
| 4 | Grave | Probable | Detection difficile |
| 5 | Catastrophique | Tres probable | Non detectable |

## 4. Analyse des risques de test

| Composant / Exigence | Mode de defaillance | Gravite (G) | Occurrence (O) | Detection (D) | Criticite (C) | Niveau de test | Action |
|---|---|---|---|---|---|---|---|
| [A completer] | [A completer] | [1-5] | [1-5] | [1-5] | [G x O x D] | [Unitaire/Integration/Systeme/Recette] | [A completer] |
| [A completer] | [A completer] | [1-5] | [1-5] | [1-5] | [G x O x D] | [A completer] | [A completer] |

### Seuils de criticite
- **C >= 60** : Tests exhaustifs obligatoires + revue de code
- **30 <= C < 60** : Tests complets avec scenarios negatifs
- **C < 30** : Tests standards

## 5. Repartition des tests par niveau

| Niveau | Objectif | Responsable | Couverture cible | Outils |
|---|---|---|---|---|
| Tests unitaires | Valider chaque composant isolement | Developpeurs | > 80% du code | [A completer] |
| Tests d'integration | Valider les interfaces entre composants | Equipe test | 100% des interfaces | [A completer] |
| Tests systeme | Valider le systeme complet | Equipe test | 100% des exigences | [A completer] |
| Tests de recette | Validation utilisateur (UAT) | Utilisateurs cles | 100% des cas d'usage | Manuel |
| Tests de performance | Valider les temps de reponse et la charge | Equipe infra | Scenarios critiques | [A completer] |
| Tests de securite | Valider la protection des donnees | RSSI | OWASP Top 10 | [A completer] |

## 6. Plans de tests

### 6.1 Planning des campagnes

| Campagne | Niveau | Date debut | Date fin | Prerequis |
|---|---|---|---|---|
| Campagne 1 | Unitaires + Integration | [A completer] | [A completer] | Code developpe |
| Campagne 2 | Systeme | [A completer] | [A completer] | Campagne 1 OK |
| Campagne 3 | Recette (UAT) | [A completer] | [A completer] | Campagne 2 OK |
| Campagne 4 | Performance + Securite | [A completer] | [A completer] | Campagne 2 OK |

### 6.2 Criteres d'entree et de sortie

| Campagne | Criteres d'entree | Criteres de sortie |
|---|---|---|
| Unitaires | Code compile, build OK | > 80% de couverture, 0 bloquant |
| Integration | Tests unitaires OK | 100% interfaces testees, 0 bloquant |
| Systeme | Tests integration OK | 100% exigences couvertes, 0 bloquant/majeur |
| Recette | Tests systeme OK | 95% cas OK, 0 bloquant, PV signe |

## 7. Approbations

| Fonction | Nom | Date | Signature |
|---|---|---|---|
| Chef de projet | {{userName}} | | |
| Responsable tests | [A completer] | | |
| Sponsor | {{sponsorName}} | | |
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'objectives-scope',
          name: 'Objectifs et generalites',
          weight: 15,
          criteria: [
            { label: 'Objectifs clairs', description: 'Les objectifs de la strategie de tests sont definis et alignes avec le projet', maxPoints: 8 },
            { label: 'Perimetre et environnements', description: 'Le perimetre et les environnements de test sont documentes', maxPoints: 7 },
          ],
        },
        {
          id: 'amdec',
          name: 'Methodologie AMDEC',
          weight: 25,
          criteria: [
            { label: 'Echelle de cotation', description: 'Les echelles G, O, D sont definies avec des criteres clairs', maxPoints: 10 },
            { label: 'Analyse de risques', description: 'Au moins 5 composants analyses avec G, O, D et criticite calculee', maxPoints: 15 },
          ],
        },
        {
          id: 'test-levels',
          name: 'Repartition par niveau',
          weight: 20,
          criteria: [
            { label: 'Niveaux couverts', description: 'Au moins 4 niveaux de tests sont decrits (unitaire, integration, systeme, recette)', maxPoints: 10 },
            { label: 'Couverture et outils', description: 'Chaque niveau a une couverture cible et des outils identifies', maxPoints: 10 },
          ],
        },
        {
          id: 'test-plans',
          name: 'Plans de tests',
          weight: 25,
          criteria: [
            { label: 'Campagnes planifiees', description: 'Les campagnes sont planifiees avec dates, prerequis et dependances', maxPoints: 10 },
            { label: 'Criteres entree/sortie', description: 'Chaque campagne a des criteres d\'entree et de sortie explicites', maxPoints: 15 },
          ],
        },
        {
          id: 'approvals',
          name: 'Approbations',
          weight: 15,
          criteria: [
            { label: 'Signataires identifies', description: 'Les approbateurs sont identifies (chef de projet, responsable tests, sponsor)', maxPoints: 15 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['8.3.3.1 Quality Reports', '8.3.3.2 Test Documents'],
    },
    referenceExample: `# Strategie de Tests — SAP30/CMRL

## Methodologie AMDEC
| Composant | Mode de defaillance | G | O | D | C | Niveau |
|---|---|---|---|---|---|---|
| Interface paie | Erreur calcul salaires | 5 | 3 | 2 | 30 | Integration + Systeme |
| Migration donnees FI | Perte ecritures comptables | 5 | 2 | 3 | 30 | Integration + Recette |
| Module SD | Erreur prix de vente | 4 | 3 | 2 | 24 | Unitaire + Systeme |
| Workflow approbation | Blocage circuit validation | 3 | 4 | 3 | 36 | Systeme |
| Reporting CO | Erreur consolidation | 4 | 2 | 4 | 32 | Systeme + Recette |

## Planning
| Campagne | Niveau | Dates | Critere de sortie |
|---|---|---|---|
| C1 | Unitaires | 01/07 – 15/07 | 85% couverture, 0 bloquant |
| C2 | Integration | 16/07 – 31/07 | 100% interfaces, 0 bloquant |
| C3 | Systeme | 01/08 – 31/08 | 100% exigences, 0 bloquant/majeur |
| C4 | Recette UAT | 01/09 – 30/09 | 95% cas OK, PV signe |
| C5 | Performance | 01/10 – 15/10 | Temps reponse < 3s, 100 users simultanes |
`,
  },

  // ─── 07. Cahier de Recette ──────────────────────────────────
  {
    id: 'seed-tpl-acceptance-test',
    title: 'Cahier de Recette',
    type: 'acceptance-test',
    phase: 'EXECUTION',
    description:
      "Document de recette formalisant les tests d'acceptation utilisateur (UAT). Contient les cas de tests, les resultats d'execution et les criteres d'acceptation (seuil 95%).",
    pmiProcess: '8.3',
    difficulty: 'ADVANCED',
    content: `# Cahier de Recette

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Code** | {{projectCode}} |
| **Chef de projet** | {{userName}} |
| **Responsable recette** | [A completer] |
| **Date** | {{currentDate}} |
| **Version** | 1.0 |

---

## Historique des versions

| Version | Auteur | Description | Date |
|---|---|---|---|
| 1.0 | {{userName}} | Creation initiale | {{currentDate}} |

---

## 1. Introduction

### 1.1 Objectif du document
Ce cahier de recette a pour objectif de formaliser les tests d'acceptation utilisateur (UAT) du projet {{projectName}}. Il definit les cas de tests, les criteres d'acceptation et les resultats attendus pour valider la conformite des livrables.

### 1.2 Criteres d'acceptation globaux
- **Seuil de reussite** : 95% des cas de tests doivent etre valides (statut "OK")
- **Anomalies bloquantes** : 0 anomalie bloquante ou critique non resolue
- **Anomalies majeures** : Toutes les anomalies majeures doivent avoir un plan de correction

### 1.3 Perimetre de la recette

| Module / Fonctionnalite | En perimetre | Responsable validation |
|---|---|---|
| [A completer] | X | [Nom] |
| [A completer] | X | [Nom] |
| [A completer] | Hors perimetre | - |

## 2. Generalites

### 2.1 Participants a la recette

| Nom | Role | Module | Disponibilite |
|---|---|---|---|
| [A completer] | Valideur | [Module] | [Dates] |
| [A completer] | Valideur | [Module] | [Dates] |
| {{userName}} | Chef de projet | Tous | [Dates] |

### 2.2 Environnement de recette

| Element | Detail |
|---|---|
| Environnement | [Recette / Pre-production] |
| URL d'acces | [A completer] |
| Donnees de test | [Jeu de donnees representatif] |
| Identifiants | [Fournis par l'equipe projet] |

### 2.3 Planning de recette

| Phase | Date debut | Date fin | Activite |
|---|---|---|---|
| Preparation | [A completer] | [A completer] | Mise en place environnement, donnees |
| Execution cycle 1 | [A completer] | [A completer] | Tests fonctionnels principaux |
| Corrections | [A completer] | [A completer] | Correction des anomalies |
| Execution cycle 2 | [A completer] | [A completer] | Re-tests et tests complementaires |
| Bilan | [A completer] | [A completer] | Synthese et PV de recette |

## 3. Plan de tests

### 3.1 Cas de tests

| ID | Module | Scenario | Prerequis | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| TC01 | [Module] | [Description du scenario de test] | [Conditions prealables] | 1. [Etape 1] 2. [Etape 2] 3. [Etape 3] | [Resultat attendu] | Haute |
| TC02 | [Module] | [A completer] | [A completer] | [A completer] | [A completer] | Haute |
| TC03 | [Module] | [A completer] | [A completer] | [A completer] | [A completer] | Moyenne |
| TC04 | [Module] | [A completer] | [A completer] | [A completer] | [A completer] | Moyenne |
| TC05 | [Module] | [A completer] | [A completer] | [A completer] | [A completer] | Basse |

### 3.2 Cas limites et tests negatifs

| ID | Scenario | Action | Resultat attendu |
|---|---|---|---|
| TN01 | [Scenario limite] | [Action anormale ou aux limites] | [Message d'erreur ou comportement attendu] |
| TN02 | [A completer] | [A completer] | [A completer] |

## 4. Execution des tests

### 4.1 Resultats cycle 1

| ID | Testeur | Date | Statut | Anomalie | Commentaire |
|---|---|---|---|---|---|
| TC01 | [Nom] | [JJ/MM/AAAA] | OK / KO / Bloque | [ID anomalie ou -] | [A completer] |
| TC02 | [Nom] | [JJ/MM/AAAA] | [A completer] | [A completer] | [A completer] |
| TC03 | [Nom] | [JJ/MM/AAAA] | [A completer] | [A completer] | [A completer] |
| TC04 | [Nom] | [JJ/MM/AAAA] | [A completer] | [A completer] | [A completer] |
| TC05 | [Nom] | [JJ/MM/AAAA] | [A completer] | [A completer] | [A completer] |

### 4.2 Registre des anomalies

| ID | Severite | Description | Module | Statut | Date detection | Date correction |
|---|---|---|---|---|---|---|
| BUG01 | Bloquante/Critique/Majeure/Mineure | [A completer] | [Module] | Ouverte/Corrigee/Fermee | [JJ/MM/AAAA] | [JJ/MM/AAAA ou -] |
| BUG02 | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] |

## 5. Resultats

### 5.1 Synthese des tests

| Indicateur | Cycle 1 | Cycle 2 | Cible |
|---|---|---|---|
| Cas de tests executes | [X] / [Total] | [X] / [Total] | 100% |
| Cas de tests OK | [X] ([X]%) | [X] ([X]%) | >= 95% |
| Cas de tests KO | [X] ([X]%) | [X] ([X]%) | < 5% |
| Anomalies bloquantes ouvertes | [X] | [X] | 0 |
| Anomalies critiques ouvertes | [X] | [X] | 0 |
| Anomalies majeures ouvertes | [X] | [X] | Plan de correction |

### 5.2 Decision de recette

[Sur la base des resultats, indiquez la decision : ACCEPTE / ACCEPTE AVEC RESERVES / REFUSE]

**Decision** : [ACCEPTE / ACCEPTE AVEC RESERVES / REFUSE]

**Justification** : [A completer]

**Reserves eventuelles** :
- [A completer]

## 6. Approbations

| Fonction | Nom | Date | Decision | Signature |
|---|---|---|---|---|
| Responsable recette | [A completer] | | [Accepte/Refuse] | |
| Chef de projet | {{userName}} | | [Accepte/Refuse] | |
| Sponsor | {{sponsorName}} | | [Accepte/Refuse] | |
| [Representant metier] | [A completer] | | [Accepte/Refuse] | |

## 7. Commentaires et observations

[Espace libre pour les observations complementaires, les recommandations post-recette ou les conditions de mise en production.]

- [A completer]
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'introduction',
          name: 'Introduction et generalites',
          weight: 15,
          criteria: [
            { label: 'Objectif et criteres', description: 'L\'objectif du document et le seuil d\'acceptation (95%) sont clairement enonces', maxPoints: 8 },
            { label: 'Perimetre et participants', description: 'Le perimetre, les participants et l\'environnement de recette sont documentes', maxPoints: 7 },
          ],
        },
        {
          id: 'test-plan',
          name: 'Plan de tests',
          weight: 30,
          criteria: [
            { label: 'Cas de tests complets', description: 'Au moins 5 cas de tests avec prerequis, etapes detaillees et resultat attendu', maxPoints: 15 },
            { label: 'Tests negatifs', description: 'Au moins 2 cas limites ou tests negatifs sont prevus', maxPoints: 8 },
            { label: 'Priorites', description: 'Les cas de tests sont priorises (haute, moyenne, basse)', maxPoints: 7 },
          ],
        },
        {
          id: 'execution',
          name: 'Execution et anomalies',
          weight: 25,
          criteria: [
            { label: 'Resultats traces', description: 'Chaque cas de test a un resultat (OK/KO/Bloque) avec testeur et date', maxPoints: 10 },
            { label: 'Anomalies documentees', description: 'Les anomalies sont enregistrees avec severite, description et statut', maxPoints: 15 },
          ],
        },
        {
          id: 'results',
          name: 'Resultats et decision',
          weight: 20,
          criteria: [
            { label: 'Synthese quantifiee', description: 'La synthese indique les taux de reussite et le respect du seuil de 95%', maxPoints: 10 },
            { label: 'Decision argumentee', description: 'La decision (Accepte/Refuse/Reserves) est justifiee par les resultats', maxPoints: 10 },
          ],
        },
        {
          id: 'approvals',
          name: 'Approbations',
          weight: 10,
          criteria: [
            { label: 'Signataires identifies', description: 'Les approbateurs sont identifies avec leur decision (responsable recette, chef de projet, sponsor)', maxPoints: 10 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['8.3.3.1 Quality Reports', '5.5.3.1 Verified Deliverables', '5.5.3.2 Work Performance Information'],
    },
    referenceExample: `# Cahier de Recette — SAP30/CMRL

## Criteres d'acceptation
Seuil de reussite : 95% des cas de tests OK. 0 anomalie bloquante/critique ouverte.

## Cas de tests (extrait)
| ID | Module | Scenario | Resultat attendu | Statut |
|---|---|---|---|---|
| TC01 | FI | Saisie ecriture comptable standard | Ecriture enregistree, journal mis a jour | OK |
| TC02 | FI | Cloture mensuelle | Balances generees, ecarts < 0.01 EUR | OK |
| TC03 | CO | Imputation centre de cout | Ventilation correcte 100% | OK |
| TC04 | SD | Creation commande client | Commande enregistree, stock reserve | KO (BUG03) |
| TC05 | MM | Reception marchandise | Stock mis a jour, mouvement enregistre | OK |
| TC06 | PP | Lancement ordre de fabrication | OF cree, composants reserves | OK |

## Synthese
| Indicateur | Cycle 1 | Cycle 2 | Cible |
|---|---|---|---|
| Tests executes | 45/50 | 50/50 | 100% |
| Tests OK | 41 (91%) | 48 (96%) | >= 95% |
| Bloquantes ouvertes | 1 | 0 | 0 |

**Decision** : ACCEPTE — Taux de reussite cycle 2 : 96% (> 95%). 0 anomalie bloquante.
`,
  },
];
