import type { DeliverableTemplateData } from './types';

export const closureTemplates: DeliverableTemplateData[] = [
  // ─── 01. PV de Reception des Livrables ─────────────────────
  {
    id: 'seed-tpl-acceptance-report',
    title: 'PV de Reception des Livrables',
    type: 'acceptance-report',
    phase: 'CLOSURE',
    description:
      "Proces-verbal de reception formelle des livrables du projet. Documente la verification de conformite, les reserves eventuelles et les approbations des parties prenantes.",
    pmiProcess: '5.5',
    difficulty: 'STANDARD',
    content: `# PV de Reception des Livrables

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Code** | {{projectCode}} |
| **Chef de projet** | {{userName}} |
| **Date de reception** | {{currentDate}} |

---

## Historique des versions

| Version | Auteur | Description | Date |
|---|---|---|---|
| 1.0 | {{userName}} | Creation initiale | {{currentDate}} |

---

## 1. Objet du document

Ce document constitue le proces-verbal de reception des livrables du projet {{projectName}}. Il formalise la verification de conformite des livrables par rapport aux specifications definies et acte la decision de reception.

## 2. Description des livrables

| # | Livrable | Description | Specification de reference | Date de livraison |
|---|---|---|---|---|
| L01 | [A completer] | [A completer] | [Ref. spec ou CDC] | [A completer] |
| L02 | [A completer] | [A completer] | [A completer] | [A completer] |
| L03 | [A completer] | [A completer] | [A completer] | [A completer] |
| L04 | [A completer] | [A completer] | [A completer] | [A completer] |

## 3. Verification de conformite

### 3.1 Criteres de verification

[Listez les criteres de verification appliques a chaque livrable.]

| # | Critere | Methode de verification | Resultat attendu |
|---|---|---|---|
| C01 | Conformite fonctionnelle | [Test/Revue/Inspection] | [A completer] |
| C02 | Conformite technique | [A completer] | [A completer] |
| C03 | Performance | [A completer] | [A completer] |
| C04 | Documentation | [A completer] | [A completer] |
| C05 | Qualite | [A completer] | [A completer] |

### 3.2 Resultats de verification par livrable

| Livrable | Critere | Resultat | Conforme | Commentaire |
|---|---|---|---|---|
| L01 | C01 | [A completer] | Oui/Non | [A completer] |
| L01 | C02 | [A completer] | Oui/Non | [A completer] |
| L02 | C01 | [A completer] | Oui/Non | [A completer] |
| L02 | C02 | [A completer] | Oui/Non | [A completer] |
| [A completer] | [A completer] | [A completer] | [A completer] | [A completer] |

## 4. Decision de reception

### 4.1 Synthese par livrable

| Livrable | Decision | Commentaire |
|---|---|---|
| L01 | Conforme / Conforme avec reserves / Non conforme | [A completer] |
| L02 | Conforme / Conforme avec reserves / Non conforme | [A completer] |
| L03 | Conforme / Conforme avec reserves / Non conforme | [A completer] |
| L04 | Conforme / Conforme avec reserves / Non conforme | [A completer] |

### 4.2 Decision globale

**Decision** : [Reception prononcee / Reception avec reserves / Reception refusee]

[Justifiez la decision globale en quelques lignes.]

## 5. Reserves et corrections

[Si la reception est prononcee avec reserves, detaillez chaque reserve et les corrections attendues.]

| # | Reserve | Livrable concerne | Correction attendue | Responsable | Echeance | Statut |
|---|---|---|---|---|---|---|
| RES01 | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] | Ouverte/En cours/Levee |
| RES02 | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] |

**Conditions de levee des reserves** : [Decrivez le processus de verification de la levee des reserves.]

## 6. Transfert et garantie

| Element | Detail |
|---|---|
| **Date de transfert** | [A completer] |
| **Periode de garantie** | [A completer] mois |
| **Fin de garantie** | [A completer] |
| **Support post-livraison** | [A completer] |

## 7. Signatures

### Maitre d'oeuvre (equipe projet)

| Fonction | Nom | Date | Signature |
|---|---|---|---|
| Chef de projet | {{userName}} | | |
| Responsable technique | [A completer] | | |

### Maitre d'ouvrage (client / sponsor)

| Fonction | Nom | Date | Signature |
|---|---|---|---|
| Sponsor | {{sponsorName}} | | |
| Responsable metier | [A completer] | | |
| Representant utilisateurs | [A completer] | | |

---

**Le present proces-verbal est etabli en [X] exemplaires.**
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'deliverables-description',
          name: 'Description des livrables',
          weight: 20,
          criteria: [
            { label: 'Livrables listes', description: 'Tous les livrables du projet sont identifies avec description et reference', maxPoints: 10 },
            { label: 'Specifications', description: 'Chaque livrable reference la specification ou le cahier des charges associe', maxPoints: 10 },
          ],
        },
        {
          id: 'conformity-check',
          name: 'Verification de conformite',
          weight: 25,
          criteria: [
            { label: 'Criteres definis', description: 'Les criteres de verification sont listes avec methode et resultat attendu', maxPoints: 10 },
            { label: 'Resultats detailles', description: 'Chaque livrable est evalue critere par critere avec resultat et commentaire', maxPoints: 15 },
          ],
        },
        {
          id: 'acceptance-decision',
          name: 'Decision de reception',
          weight: 25,
          criteria: [
            { label: 'Decision par livrable', description: 'Chaque livrable a une decision claire (conforme/conforme avec reserves/non conforme)', maxPoints: 10 },
            { label: 'Decision globale justifiee', description: 'La decision globale est formalisee et justifiee', maxPoints: 15 },
          ],
        },
        {
          id: 'reserves-corrections',
          name: 'Reserves et corrections',
          weight: 15,
          criteria: [
            { label: 'Reserves detaillees', description: 'Chaque reserve est decrite avec correction attendue, responsable et echeance', maxPoints: 10 },
            { label: 'Conditions levee', description: 'Le processus de levee des reserves est defini', maxPoints: 5 },
          ],
        },
        {
          id: 'signatures',
          name: 'Signatures et formalisme',
          weight: 15,
          criteria: [
            { label: 'Signataires identifies', description: 'Les signataires MOE et MOA sont identifies avec leur fonction', maxPoints: 8 },
            { label: 'Transfert et garantie', description: 'Les conditions de transfert et la periode de garantie sont definies', maxPoints: 7 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['5.5.3.1 Accepted Deliverables', '5.5.3.2 Work Performance Information', '5.5.3.4 Change Requests'],
    },
    referenceExample: `# PV de Reception — SAP30/CMRL

## Livrables
| # | Livrable | Decision |
|---|---|---|
| L01 | Modules FI/CO migres | Conforme |
| L02 | Modules SD/MM/PP migres | Conforme avec reserves |
| L03 | Documentation utilisateur | Conforme |
| L04 | Formation 85 utilisateurs | Conforme |

## Decision globale
Reception prononcee avec reserves. Les modules FI/CO sont pleinement operationnels. Le module MM presente 2 anomalies mineures sur les interfaces fournisseurs (reserves RES01, RES02).

## Reserves
| # | Reserve | Correction | Echeance |
|---|---|---|---|
| RES01 | Interface MM : arrondi devise USD | Correctif parametre SAP | 15/01 |
| RES02 | Rapport stock MM : donnees historiques incompletes | Reprise donnees Q4 | 31/01 |

## Signatures
- MOE : Mme Martin (Chef de projet) — Date : 20/12
- MOA : M. Dupont (DG/Sponsor) — Date : 20/12
`,
  },

  // ─── 02. Bilan de Projet ───────────────────────────────────
  {
    id: 'seed-tpl-lessons-learned',
    title: 'Bilan de Projet',
    type: 'lessons-learned',
    phase: 'CLOSURE',
    description:
      "Document de cloture qui synthetise les resultats du projet, analyse les ecarts, capitalise les retours d'experience et formule des recommandations pour les projets futurs.",
    pmiProcess: '4.7',
    difficulty: 'ADVANCED',
    content: `# Bilan de Projet

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Code** | {{projectCode}} |
| **Chef de projet** | {{userName}} |
| **Sponsor** | {{sponsorName}} |
| **Date** | {{currentDate}} |

---

## Historique des versions

| Version | Auteur | Description | Date |
|---|---|---|---|
| 1.0 | {{userName}} | Creation initiale | {{currentDate}} |

---

## 1. Synthese du projet

### 1.1 Rappel du contexte

[Rappelez brievement le contexte du projet, les raisons de son lancement et les objectifs initiaux.]

> {{projectDescription}}

### 1.2 Objectifs vs Realisation

| Objectif initial | KPI cible | Resultat obtenu | Atteint |
|---|---|---|---|
| [A completer] | [A completer] | [A completer] | Oui/Partiel/Non |
| [A completer] | [A completer] | [A completer] | [A completer] |
| [A completer] | [A completer] | [A completer] | [A completer] |
| [A completer] | [A completer] | [A completer] | [A completer] |

**Taux d'atteinte global** : [A completer]%

### 1.3 Chronologie du projet

| Jalon | Date prevue | Date reelle | Ecart |
|---|---|---|---|
| Lancement | [A completer] | [A completer] | [A completer] |
| Fin planification | [A completer] | [A completer] | [A completer] |
| Fin execution | [A completer] | [A completer] | [A completer] |
| Go-live / Livraison | [A completer] | [A completer] | [A completer] |
| Cloture | [A completer] | [A completer] | [A completer] |

## 2. Analyse des ecarts

### 2.1 Ecart budgetaire

| Poste | Budget initial | Budget final | Ecart | Ecart % | Explication |
|---|---|---|---|---|---|
| Ressources internes | [A completer] | [A completer] | [A completer] | [A completer]% | [A completer] |
| Prestataires | [A completer] | [A completer] | [A completer] | [A completer]% | [A completer] |
| Materiel / Licences | [A completer] | [A completer] | [A completer] | [A completer]% | [A completer] |
| Imprevus | [A completer] | [A completer] | [A completer] | [A completer]% | [A completer] |
| **TOTAL** | **{{initialBudget}} EUR** | **[A completer]** | **[A completer]** | **[A completer]%** | |

### 2.2 Ecart de delais

| Phase | Duree prevue | Duree reelle | Ecart | Cause principale |
|---|---|---|---|---|
| Initiation | [A completer] sem. | [A completer] sem. | [A completer] | [A completer] |
| Planification | [A completer] sem. | [A completer] sem. | [A completer] | [A completer] |
| Execution | [A completer] sem. | [A completer] sem. | [A completer] | [A completer] |
| Controle | [A completer] sem. | [A completer] sem. | [A completer] | [A completer] |
| Cloture | [A completer] sem. | [A completer] sem. | [A completer] | [A completer] |
| **TOTAL** | **[A completer] sem.** | **[A completer] sem.** | **[A completer]** | |

### 2.3 Ecart de perimetre

[Listez les changements de perimetre intervenus pendant le projet.]

| # | Changement | Date | Impact budget | Impact delai | Justification |
|---|---|---|---|---|---|
| CH01 | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] |
| CH02 | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] |

### 2.4 Ecart de qualite

| Critere qualite | Cible | Resultat | Commentaire |
|---|---|---|---|
| Taux de defauts | [A completer] | [A completer] | [A completer] |
| Satisfaction utilisateurs | [A completer] | [A completer] | [A completer] |
| Couverture de tests | [A completer] | [A completer] | [A completer] |
| Conformite aux normes | [A completer] | [A completer] | [A completer] |

## 3. Points forts du projet

[Identifiez les elements qui ont bien fonctionne et qui meritent d'etre reproduits.]

| # | Point fort | Impact | Recommandation pour les futurs projets |
|---|---|---|---|
| 1 | [A completer] | [A completer] | [A completer] |
| 2 | [A completer] | [A completer] | [A completer] |
| 3 | [A completer] | [A completer] | [A completer] |
| 4 | [A completer] | [A completer] | [A completer] |
| 5 | [A completer] | [A completer] | [A completer] |

## 4. Points d'amelioration

[Identifiez les elements qui n'ont pas bien fonctionne et les lecons apprises.]

| # | Point d'amelioration | Impact subi | Cause racine | Action corrective recommandee |
|---|---|---|---|---|
| 1 | [A completer] | [A completer] | [A completer] | [A completer] |
| 2 | [A completer] | [A completer] | [A completer] | [A completer] |
| 3 | [A completer] | [A completer] | [A completer] | [A completer] |
| 4 | [A completer] | [A completer] | [A completer] | [A completer] |
| 5 | [A completer] | [A completer] | [A completer] | [A completer] |

## 5. Recommandations

[Formulez des recommandations concretes pour les projets futurs.]

### 5.1 Recommandations organisationnelles
- [A completer]
- [A completer]

### 5.2 Recommandations methodologiques
- [A completer]
- [A completer]

### 5.3 Recommandations techniques
- [A completer]
- [A completer]

## 6. Retour d'experience par phase

### 6.1 Initiation
- **Ce qui a bien fonctionne** : [A completer]
- **Ce qui peut etre ameliore** : [A completer]
- **Lecon apprise** : [A completer]

### 6.2 Planification
- **Ce qui a bien fonctionne** : [A completer]
- **Ce qui peut etre ameliore** : [A completer]
- **Lecon apprise** : [A completer]

### 6.3 Execution
- **Ce qui a bien fonctionne** : [A completer]
- **Ce qui peut etre ameliore** : [A completer]
- **Lecon apprise** : [A completer]

### 6.4 Controle
- **Ce qui a bien fonctionne** : [A completer]
- **Ce qui peut etre ameliore** : [A completer]
- **Lecon apprise** : [A completer]

### 6.5 Cloture
- **Ce qui a bien fonctionne** : [A completer]
- **Ce qui peut etre ameliore** : [A completer]
- **Lecon apprise** : [A completer]

## 7. Archivage

| Document | Emplacement | Responsable |
|---|---|---|
| Charte projet | [A completer] | {{userName}} |
| Plan de projet | [A completer] | {{userName}} |
| Registre des risques | [A completer] | {{userName}} |
| PV de reception | [A completer] | {{userName}} |
| Suivi budgetaire final | [A completer] | {{userName}} |
| Comptes-rendus de reunion | [A completer] | {{userName}} |
| Documentation technique | [A completer] | [A completer] |
| Documentation utilisateur | [A completer] | [A completer] |
| Present bilan de projet | [A completer] | {{userName}} |

## 8. Remerciements

[Remerciez les equipes et parties prenantes qui ont contribue au succes du projet.]

### Equipe projet
{{teamMembers}}

### Parties prenantes cles
- {{sponsorName}} — Sponsor
- [A completer]
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'project-summary',
          name: 'Synthese du projet',
          weight: 20,
          criteria: [
            { label: 'Objectifs vs realisation', description: 'Chaque objectif initial est compare au resultat obtenu avec un taux d\'atteinte', maxPoints: 10 },
            { label: 'Chronologie', description: 'Les jalons sont presentes avec dates prevues et reelles', maxPoints: 10 },
          ],
        },
        {
          id: 'gap-analysis',
          name: 'Analyse des ecarts',
          weight: 30,
          criteria: [
            { label: 'Ecart budgetaire', description: 'L\'ecart budget est detaille par poste avec explication des causes', maxPoints: 8 },
            { label: 'Ecart de delais', description: 'L\'ecart de delais est analyse par phase avec causes principales', maxPoints: 8 },
            { label: 'Ecart perimetre', description: 'Les changements de perimetre sont documentes avec impact budget/delai', maxPoints: 7 },
            { label: 'Ecart qualite', description: 'Les criteres qualite sont evalues avec cible vs resultat', maxPoints: 7 },
          ],
        },
        {
          id: 'strengths-improvements',
          name: 'Points forts et ameliorations',
          weight: 20,
          criteria: [
            { label: 'Points forts', description: 'Au moins 3 points forts identifies avec impact et recommandation de reproduction', maxPoints: 10 },
            { label: 'Points d\'amelioration', description: 'Au moins 3 points d\'amelioration avec cause racine et action corrective', maxPoints: 10 },
          ],
        },
        {
          id: 'recommendations',
          name: 'Recommandations',
          weight: 15,
          criteria: [
            { label: 'Recommandations concretes', description: 'Les recommandations couvrent les dimensions organisationnelle, methodologique et technique', maxPoints: 8 },
            { label: 'REX par phase', description: 'Chaque phase a un retour d\'experience structure (bien/ameliorer/lecon)', maxPoints: 7 },
          ],
        },
        {
          id: 'archiving',
          name: 'Archivage',
          weight: 15,
          criteria: [
            { label: 'Documents archives', description: 'La liste des documents est complete avec emplacement et responsable', maxPoints: 10 },
            { label: 'Exhaustivite', description: 'Tous les types de documents projet sont couverts (gouvernance, technique, financier)', maxPoints: 5 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['4.7.3.1 Final Product/Service/Result Transition', '4.7.3.2 Final Report', '4.7.3.3 Organizational Process Assets Updates'],
    },
    referenceExample: `# Bilan de Projet — SAP30/CMRL

## Synthese
Le projet SAP30 a ete livre avec succes le 20/12. Les 5 modules (FI/CO/SD/MM/PP) ont ete migres et 85 utilisateurs formes. Le budget final est de 498K EUR (economie de 17K EUR, soit -3,3%). Le delai a ete respecte malgre un retard de 5 jours rattrape sur le module MM.

## Objectifs vs Realisation
| Objectif | Cible | Resultat | Atteint |
|---|---|---|---|
| Migration modules | 100% (5/5) | 100% (5/5) | Oui |
| Budget | < 515K EUR | 498K EUR (-3,3%) | Oui |
| Delai | 31/12 | 20/12 (-11 jours) | Oui |
| NPS utilisateurs | > 7/10 | 7.8/10 | Oui |
| Reduction maintenance | -35% | -38% | Oui |

## Points forts
| Point fort | Recommandation |
|---|---|
| Migration incrementale module par module | Reproduire sur tous les projets ERP |
| Champions internes pour conduite du changement | Systematiser l'identification de champions par metier |
| Contrat forfaitaire prestataires | Privilegier le forfait pour les prestations bien cadrees |

## Points d'amelioration
| Point | Cause racine | Action recommandee |
|---|---|---|
| Sous-estimation migration donnees MM | Manque d'analyse de complexite amont | Audit donnees systematique en phase de planification |
| Communication tardive avec les utilisateurs | Planning formation boucle trop tard | Planifier la communication des le kick-off |

## REX Execution
- **Bien** : Methode agile pour les lots de migration, daily standup efficaces
- **Ameliorer** : Documentation technique redigee en retard, dette technique accumulee
- **Lecon** : Prevoir 20% du temps d'execution pour la documentation
`,
  },
];
