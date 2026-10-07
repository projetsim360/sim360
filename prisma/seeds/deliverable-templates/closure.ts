import type { DeliverableTemplateData } from './types';

export const closureTemplates: DeliverableTemplateData[] = [
  // ─── 01. PV de Reception des Livrables ─────────────────────
  {
    id: 'seed-tpl-acceptance-report',
    title: 'PV de Réception des Livrables',
    type: 'acceptance-report',
    phase: 'CLOSURE',
    description:
      "Procès-verbal de réception formelle des livrables du projet. Documente la vérification de conformité, les réserves éventuelles et les approbations des parties prenantes.",
    pmiProcess: '5.5',
    difficulty: 'STANDARD',
    content: `# PV de Réception des Livrables

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Code** | {{projectCode}} |
| **Chef de projet** | {{userName}} |
| **Date de réception** | {{currentDate}} |

---

## Historique des versions

| Version | Auteur | Description | Date |
|---|---|---|---|
| 1.0 | {{userName}} | Création initiale | {{currentDate}} |

---

## 1. Objet du document

Ce document constitue le procès-verbal de réception des livrables du projet {{projectName}}. Il formalise la vérification de conformité des livrables par rapport aux spécifications définies et acte la décision de réception.

## 2. Description des livrables

| # | Livrable | Description | Spécification de référence | Date de livraison |
|---|---|---|---|---|
| L01 | [À compléter] | [À compléter] | [Ref. spec ou CDC] | [À compléter] |
| L02 | [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| L03 | [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| L04 | [À compléter] | [À compléter] | [À compléter] | [À compléter] |

## 3. Vérification de conformité

### 3.1 Critères de vérification

[Listez les critères de vérification appliqués à chaque livrable.]

| # | Critère | Méthode de vérification | Résultat attendu |
|---|---|---|---|
| C01 | Conformité fonctionnelle | [Test/Revue/Inspection] | [À compléter] |
| C02 | Conformité technique | [À compléter] | [À compléter] |
| C03 | Performance | [À compléter] | [À compléter] |
| C04 | Documentation | [À compléter] | [À compléter] |
| C05 | Qualité | [À compléter] | [À compléter] |

### 3.2 Résultats de vérification par livrable

| Livrable | Critère | Résultat | Conforme | Commentaire |
|---|---|---|---|---|
| L01 | C01 | [À compléter] | Oui/Non | [À compléter] |
| L01 | C02 | [À compléter] | Oui/Non | [À compléter] |
| L02 | C01 | [À compléter] | Oui/Non | [À compléter] |
| L02 | C02 | [À compléter] | Oui/Non | [À compléter] |
| [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] |

## 4. Décision de réception

### 4.1 Synthèse par livrable

| Livrable | Décision | Commentaire |
|---|---|---|
| L01 | Conforme / Conforme avec réserves / Non conforme | [À compléter] |
| L02 | Conforme / Conforme avec réserves / Non conforme | [À compléter] |
| L03 | Conforme / Conforme avec réserves / Non conforme | [À compléter] |
| L04 | Conforme / Conforme avec réserves / Non conforme | [À compléter] |

### 4.2 Décision globale

**Décision** : [Réception prononcée / Réception avec réserves / Réception refusée]

[Justifiez la décision globale en quelques lignes.]

## 5. Réserves et corrections

[Si la réception est prononcée avec réserves, détaillez chaque réserve et les corrections attendues.]

| # | Réserve | Livrable concerné | Correction attendue | Responsable | Échéance | Statut |
|---|---|---|---|---|---|---|
| RES01 | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] | Ouverte/En cours/Levée |
| RES02 | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] |

**Conditions de levée des réserves** : [Décrivez le processus de vérification de la levée des réserves.]

## 6. Transfert et garantie

| Élément | Détail |
|---|---|
| **Date de transfert** | [À compléter] |
| **Période de garantie** | [À compléter] mois |
| **Fin de garantie** | [À compléter] |
| **Support post-livraison** | [À compléter] |

## 7. Signatures

### Maître d'œuvre (équipe projet)

| Fonction | Nom | Date | Signature |
|---|---|---|---|
| Chef de projet | {{userName}} | | |
| Responsable technique | [À compléter] | | |

### Maître d'ouvrage (client / sponsor)

| Fonction | Nom | Date | Signature |
|---|---|---|---|
| Sponsor | {{sponsorName}} | | |
| Responsable métier | [À compléter] | | |
| Représentant utilisateurs | [À compléter] | | |

---

**Le présent procès-verbal est établi en [X] exemplaires.**
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'deliverables-description',
          name: 'Description des livrables',
          weight: 20,
          criteria: [
            { label: 'Livrables listes', description: 'Tous les livrables du projet sont identifiés avec description et référence', maxPoints: 10 },
            { label: 'Spécifications', description: 'Chaque livrable référence la spécification ou le cahier des charges associé', maxPoints: 10 },
          ],
        },
        {
          id: 'conformity-check',
          name: 'Vérification de conformité',
          weight: 25,
          criteria: [
            { label: 'Critères définis', description: 'Les critères de vérification sont listes avec méthode et résultat attendu', maxPoints: 10 },
            { label: 'Résultats détaillés', description: 'Chaque livrable est évalué critère par critère avec résultat et commentaire', maxPoints: 15 },
          ],
        },
        {
          id: 'acceptance-decision',
          name: 'Décision de réception',
          weight: 25,
          criteria: [
            { label: 'Décision par livrable', description: 'Chaque livrable a une décision claire (conforme/conforme avec réserves/non conforme)', maxPoints: 10 },
            { label: 'Décision globale justifiée', description: 'La décision globale est formalisée et justifiée', maxPoints: 15 },
          ],
        },
        {
          id: 'réserves-corrections',
          name: 'Réserves et corrections',
          weight: 15,
          criteria: [
            { label: 'Réserves détaillées', description: 'Chaque réserve est décrite avec correction attendue, responsable et échéance', maxPoints: 10 },
            { label: 'Conditions levée', description: 'Le processus de levée des réserves est défini', maxPoints: 5 },
          ],
        },
        {
          id: 'signatures',
          name: 'Signatures et formalisme',
          weight: 15,
          criteria: [
            { label: 'Signataires identifiés', description: 'Les signataires MOE et MOA sont identifiés avec leur fonction', maxPoints: 8 },
            { label: 'Transfert et garantie', description: 'Les conditions de transfert et la période de garantie sont définies', maxPoints: 7 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['5.5.3.1 Accepted Deliverables', '5.5.3.2 Work Performance Information', '5.5.3.4 Change Requests'],
    },
    referenceExample: `# PV de Réception — SAP30/CMRL

## Livrables
| # | Livrable | Décision |
|---|---|---|
| L01 | Modules FI/CO migrés | Conforme |
| L02 | Modules SD/MM/PP migrés | Conforme avec réserves |
| L03 | Documentation utilisateur | Conforme |
| L04 | Formation 85 utilisateurs | Conforme |

## Décision globale
Réception prononcée avec réserves. Les modules FI/CO sont pleinement opérationnels. Le module MM présente 2 anomalies mineures sur les interfaces fournisseurs (réserves RES01, RES02).

## Réserves
| # | Réserve | Correction | Échéance |
|---|---|---|---|
| RES01 | Interface MM : arrondi devise USD | Correctif paramètre SAP | 15/01 |
| RES02 | Rapport stock MM : données historiques incomplètes | Reprise données Q4 | 31/01 |

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
      "Document de clôture qui synthetise les résultats du projet, analyse les écarts, capitalise les retours d'expérience et formule des recommandations pour les projets futurs.",
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
| 1.0 | {{userName}} | Création initiale | {{currentDate}} |

---

## 1. Synthèse du projet

### 1.1 Rappel du contexte

[Rappelez brièvement le contexte du projet, les raisons de son lancement et les objectifs initiaux.]

> {{projectDescription}}

### 1.2 Objectifs vs Réalisation

| Objectif initial | KPI cible | Résultat obtenu | Atteint |
|---|---|---|---|
| [À compléter] | [À compléter] | [À compléter] | Oui/Partiel/Non |
| [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| [À compléter] | [À compléter] | [À compléter] | [À compléter] |

**Taux d'atteinte global** : [À compléter]%

### 1.3 Chronologie du projet

| Jalon | Date prévue | Date réelle | Écart |
|---|---|---|---|
| Lancement | [À compléter] | [À compléter] | [À compléter] |
| Fin planification | [À compléter] | [À compléter] | [À compléter] |
| Fin exécution | [À compléter] | [À compléter] | [À compléter] |
| Go-live / Livraison | [À compléter] | [À compléter] | [À compléter] |
| Clôture | [À compléter] | [À compléter] | [À compléter] |

## 2. Analyse des écarts

### 2.1 Écart budgétaire

| Poste | Budget initial | Budget final | Écart | Écart % | Explication |
|---|---|---|---|---|---|
| Ressources internes | [À compléter] | [À compléter] | [À compléter] | [À compléter]% | [À compléter] |
| Prestataires | [À compléter] | [À compléter] | [À compléter] | [À compléter]% | [À compléter] |
| Matériel / Licences | [À compléter] | [À compléter] | [À compléter] | [À compléter]% | [À compléter] |
| Imprévus | [À compléter] | [À compléter] | [À compléter] | [À compléter]% | [À compléter] |
| **TOTAL** | **{{initialBudget}} EUR** | **[À compléter]** | **[À compléter]** | **[À compléter]%** | |

### 2.2 Écart de délais

| Phase | Durée prévue | Durée réelle | Écart | Cause principale |
|---|---|---|---|---|
| Initiation | [À compléter] sem. | [À compléter] sem. | [À compléter] | [À compléter] |
| Planification | [À compléter] sem. | [À compléter] sem. | [À compléter] | [À compléter] |
| Exécution | [À compléter] sem. | [À compléter] sem. | [À compléter] | [À compléter] |
| Contrôle | [À compléter] sem. | [À compléter] sem. | [À compléter] | [À compléter] |
| Clôture | [À compléter] sem. | [À compléter] sem. | [À compléter] | [À compléter] |
| **TOTAL** | **[À compléter] sem.** | **[À compléter] sem.** | **[À compléter]** | |

### 2.3 Écart de périmètre

[Listez les changements de périmètre intervenus pendant le projet.]

| # | Changement | Date | Impact budget | Impact délai | Justification |
|---|---|---|---|---|---|
| CH01 | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| CH02 | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] |

### 2.4 Écart de qualité

| Critère qualité | Cible | Résultat | Commentaire |
|---|---|---|---|
| Taux de défauts | [À compléter] | [À compléter] | [À compléter] |
| Satisfaction utilisateurs | [À compléter] | [À compléter] | [À compléter] |
| Couverture de tests | [À compléter] | [À compléter] | [À compléter] |
| Conformité aux normes | [À compléter] | [À compléter] | [À compléter] |

## 3. Points forts du projet

[Identifiez les éléments qui ont bien fonctionné et qui méritent d'être reproduits.]

| # | Point fort | Impact | Recommandation pour les futurs projets |
|---|---|---|---|
| 1 | [À compléter] | [À compléter] | [À compléter] |
| 2 | [À compléter] | [À compléter] | [À compléter] |
| 3 | [À compléter] | [À compléter] | [À compléter] |
| 4 | [À compléter] | [À compléter] | [À compléter] |
| 5 | [À compléter] | [À compléter] | [À compléter] |

## 4. Points d'amélioration

[Identifiez les éléments qui n'ont pas bien fonctionné et les leçons apprises.]

| # | Point d'amélioration | Impact subi | Cause racine | Action corrective recommandée |
|---|---|---|---|---|
| 1 | [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| 2 | [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| 3 | [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| 4 | [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| 5 | [À compléter] | [À compléter] | [À compléter] | [À compléter] |

## 5. Recommandations

[Formulez des recommandations concrètes pour les projets futurs.]

### 5.1 Recommandations organisationnelles
- [À compléter]
- [À compléter]

### 5.2 Recommandations méthodologiques
- [À compléter]
- [À compléter]

### 5.3 Recommandations techniques
- [À compléter]
- [À compléter]

## 6. Retour d'expérience par phase

### 6.1 Initiation
- **Ce qui a bien fonctionné** : [À compléter]
- **Ce qui peut être amélioré** : [À compléter]
- **Leçon apprise** : [À compléter]

### 6.2 Planification
- **Ce qui a bien fonctionné** : [À compléter]
- **Ce qui peut être amélioré** : [À compléter]
- **Leçon apprise** : [À compléter]

### 6.3 Exécution
- **Ce qui a bien fonctionné** : [À compléter]
- **Ce qui peut être amélioré** : [À compléter]
- **Leçon apprise** : [À compléter]

### 6.4 Contrôle
- **Ce qui a bien fonctionné** : [À compléter]
- **Ce qui peut être amélioré** : [À compléter]
- **Leçon apprise** : [À compléter]

### 6.5 Clôture
- **Ce qui a bien fonctionné** : [À compléter]
- **Ce qui peut être amélioré** : [À compléter]
- **Leçon apprise** : [À compléter]

## 7. Archivage

| Document | Emplacement | Responsable |
|---|---|---|
| Charte projet | [À compléter] | {{userName}} |
| Plan de projet | [À compléter] | {{userName}} |
| Registre des risques | [À compléter] | {{userName}} |
| PV de réception | [À compléter] | {{userName}} |
| Suivi budgétaire final | [À compléter] | {{userName}} |
| Comptes-rendus de réunion | [À compléter] | {{userName}} |
| Documentation technique | [À compléter] | [À compléter] |
| Documentation utilisateur | [À compléter] | [À compléter] |
| Present bilan de projet | [À compléter] | {{userName}} |

## 8. Remerciements

[Remerciez les équipes et parties prenantes qui ont contribué au succès du projet.]

### Équipe projet
{{teamMembers}}

### Parties prenantes clés
- {{sponsorName}} — Sponsor
- [À compléter]
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'project-summary',
          name: 'Synthèse du projet',
          weight: 20,
          criteria: [
            { label: 'Objectifs vs réalisation', description: 'Chaque objectif initial est comparé au résultat obtenu avec un taux d\'atteinte', maxPoints: 10 },
            { label: 'Chronologie', description: 'Les jalons sont présentés avec dates prévues et réelles', maxPoints: 10 },
          ],
        },
        {
          id: 'gap-analysis',
          name: 'Analyse des écarts',
          weight: 30,
          criteria: [
            { label: 'Écart budgétaire', description: 'L\'écart budget est détaillé par poste avec explication des causes', maxPoints: 8 },
            { label: 'Écart de délais', description: 'L\'écart de délais est analyse par phase avec causes principales', maxPoints: 8 },
            { label: 'Écart périmètre', description: 'Les changements de périmètre sont documentés avec impact budget/délai', maxPoints: 7 },
            { label: 'Écart qualité', description: 'Les critères qualité sont évalués avec cible vs résultat', maxPoints: 7 },
          ],
        },
        {
          id: 'strengths-improvements',
          name: 'Points forts et améliorations',
          weight: 20,
          criteria: [
            { label: 'Points forts', description: 'Au moins 3 points forts identifiés avec impact et recommandation de reproduction', maxPoints: 10 },
            { label: 'Points d\'amélioration', description: 'Au moins 3 points d\'amélioration avec cause racine et action corrective', maxPoints: 10 },
          ],
        },
        {
          id: 'recommendations',
          name: 'Recommandations',
          weight: 15,
          criteria: [
            { label: 'Recommandations concrètes', description: 'Les recommandations couvrent les dimensions organisationnelle, méthodologique et technique', maxPoints: 8 },
            { label: 'REX par phase', description: 'Chaque phase a un retour d\'expérience structure (bien/améliorer/leçon)', maxPoints: 7 },
          ],
        },
        {
          id: 'archiving',
          name: 'Archivage',
          weight: 15,
          criteria: [
            { label: 'Documents archives', description: 'La liste des documents est complète avec emplacement et responsable', maxPoints: 10 },
            { label: 'Exhaustivité', description: 'Tous les types de documents projet sont couverts (gouvernance, technique, financier)', maxPoints: 5 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['4.7.3.1 Final Product/Service/Result Transition', '4.7.3.2 Final Report', '4.7.3.3 Organizational Process Assets Updates'],
    },
    referenceExample: `# Bilan de Projet — SAP30/CMRL

## Synthèse
Le projet SAP30 a été livré avec succès le 20/12. Les 5 modules (FI/CO/SD/MM/PP) ont été migrés et 85 utilisateurs formés. Le budget final est de 498K EUR (économie de 17K EUR, soit -3,3%). Le délai a été respecte malgré un retard de 5 jours rattrape sur le module MM.

## Objectifs vs Réalisation
| Objectif | Cible | Résultat | Atteint |
|---|---|---|---|
| Migration modules | 100% (5/5) | 100% (5/5) | Oui |
| Budget | < 515K EUR | 498K EUR (-3,3%) | Oui |
| Délai | 31/12 | 20/12 (-11 jours) | Oui |
| NPS utilisateurs | > 7/10 | 7.8/10 | Oui |
| Réduction maintenance | -35% | -38% | Oui |

## Points forts
| Point fort | Recommandation |
|---|---|
| Migration incrémentale module par module | Reproduire sur tous les projets ERP |
| Champions internes pour conduite du changement | Systématiser l'identification de champions par métier |
| Contrat forfaitaire prestataires | Privilégier le forfait pour les prestations bien cadrées |

## Points d'amélioration
| Point | Cause racine | Action recommandée |
|---|---|---|
| Sous-estimation migration données MM | Manque d'analyse de complexité amont | Audit données systématique en phase de planification |
| Communication tardive avec les utilisateurs | Planning formation boucle trop tard | Planifier la communication des le kick-off |

## REX Exécution
- **Bien** : Méthode agile pour les lots de migration, daily standup efficaces
- **Améliorer** : Documentation technique rédigée en retard, dette technique accumulée
- **Leçon** : Prévoir 20% du temps d'exécution pour la documentation
`,
  },
];
