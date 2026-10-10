import type { DeliverableTemplateData } from './types';

export const initiationTemplates: DeliverableTemplateData[] = [
  // ─── 01. Etude d'Opportunite / Business Case ─────────────
  {
    id: 'seed-tpl-business-case',
    title: "Étude d'Opportunité",
    type: 'business-case',
    phase: 'INITIATION',
    description:
      "Document de justification du projet. Présente le problème, analyse les options et recommande une solution aux décideurs.",
    pmiProcess: '1.2',
    difficulty: 'STANDARD',
    content: `# Étude d'Opportunité

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Code** | {{projectCode}} |
| **Secteur** | {{sector}} |
| **Date** | {{currentDate}} |

---

## Historique des versions

| Version | Auteur | Description | Date |
|---|---|---|---|
| 1.0 | {{userName}} | Création initiale | {{currentDate}} |

---

## 1. Sommaire exécutif

[Synthétisez en quelques paragraphes l'ensemble de l'étude : le problème identifié, la solution recommandée, les coûts estimés, les bénéfices attendus et la recommandation finale. Cette section est à rédiger en dernier.]

## 2. État du problème ou de l'opportunité

### 2.1 Énoncé du problème
[Décrivez brièvement le problème ou l'opportunité en lien avec la stratégie de l'organisation.]

### 2.2 Analyse détaillée
[Détaillez l'impact quantifié du problème : coûts actuels, pertes, inefficacités. Listez les objectifs SMART que le projet devrait atteindre.]

**Contexte du projet :**
> {{projectDescription}}

**Objectifs identifiés :**
- [ ] Objectif 1 : [À compléter]
- [ ] Objectif 2 : [À compléter]
- [ ] Objectif 3 : [À compléter]

## 3. Analyse des options

[Pour chaque option (y compris "ne rien faire"), décrivez les avantages, coûts et risques.]

| Option | Description | Avantages | Coûts estimés | Risques |
|---|---|---|---|---|
| Option 0 : Ne rien faire | Maintien du statu quo | Aucun investissement | [Coûts indirects] | [Risques] |
| Option 1 | [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| Option 2 | [À compléter] | [À compléter] | [À compléter] | [À compléter] |

## 4. Recommandation

[Indiquez l'option recommandée avec une justification coût-bénéfice.]

## 5. Livrables attendus

[Listez les livrables principaux et leur alignement avec les objectifs.]

| Livrable | Objectif associé | Critère d'acceptation |
|---|---|---|
| [À compléter] | [À compléter] | [À compléter] |

## 6. Ressources et parties prenantes

### 6.1 Budget prévisionnel
- **Budget initial estimé** : {{initialBudget}} EUR
- **Répartition** : [À détailler]

### 6.2 Équipe projet
{{teamMembers}}

### 6.3 Parties prenantes clés
| Partie prenante | Rôle | Intérêt | Influence |
|---|---|---|---|
| {{sponsorName}} | Sponsor | Élevé | Élevé |
| [À compléter] | [À compléter] | [À compléter] | [À compléter] |

## 7. Évaluation des risques

| Risque | Probabilité | Impact | Mesure d'atténuation |
|---|---|---|---|
| [À compléter] | Faible/Moyen/Élevé | Faible/Moyen/Élevé | [À compléter] |

## 8. Impact en cas de refus

[Décrivez les conséquences du maintien du statu quo si le projet n'est pas approuvé.]

## 9. Critères de réussite et KPI

| KPI | Cible | Méthode de mesure |
|---|---|---|
| Respect du budget | < {{initialBudget}} EUR | Suivi mensuel |
| Respect des délais | < {{deadlineDays}} jours | Jalons |
| ROI | > [X]% | Calcul à 12 mois |
| Satisfaction utilisateurs | > [X]/10 | Enquête |
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'executive-summary',
          name: 'Sommaire exécutif',
          weight: 15,
          criteria: [
            { label: 'Synthèse claire', description: 'Le sommaire résume efficacement le problème, la solution et la recommandation', maxPoints: 10 },
            { label: 'Chiffres clés', description: 'Les coûts, bénéfices et ROI sont mentionnés', maxPoints: 5 },
          ],
        },
        {
          id: 'problem-analysis',
          name: 'Analyse du problème',
          weight: 20,
          criteria: [
            { label: 'Problème clairement énoncé', description: "Le problème est décrit avec précision et lie à la stratégie de l'organisation", maxPoints: 10 },
            { label: 'Impact quantifié', description: 'Les coûts, pertes ou inefficacités sont chiffrés', maxPoints: 5 },
            { label: 'Objectifs SMART', description: 'Les objectifs sont Spécifiques, Mesurables, Atteignables, Réalistes, Temporels', maxPoints: 5 },
          ],
        },
        {
          id: 'options-analysis',
          name: 'Analyse des options',
          weight: 20,
          criteria: [
            { label: 'Options multiples', description: 'Au moins 3 options sont présentées (dont statu quo)', maxPoints: 8 },
            { label: 'Analyse équilibrée', description: 'Chaque option a des avantages, coûts et risques identifiés', maxPoints: 7 },
            { label: 'Justification', description: "La recommandation est justifiée par rapport aux autres options", maxPoints: 5 },
          ],
        },
        {
          id: 'deliverables-resources',
          name: 'Livrables et ressources',
          weight: 20,
          criteria: [
            { label: 'Livrables identifiés', description: 'Les livrables sont listes avec critères d\'acceptation', maxPoints: 7 },
            { label: 'Budget détaillé', description: 'Le budget est réparti par poste', maxPoints: 7 },
            { label: 'Parties prenantes', description: 'Les parties prenantes clés sont identifiées avec intérêt/influence', maxPoints: 6 },
          ],
        },
        {
          id: 'risks-kpis',
          name: 'Risques et KPI',
          weight: 25,
          criteria: [
            { label: 'Risques identifiés', description: 'Au moins 3 risques avec probabilité, impact et mesures', maxPoints: 10 },
            { label: 'Impact refus', description: 'Les conséquences du statu quo sont clairement décrites', maxPoints: 5 },
            { label: 'KPI mesurables', description: 'Critères de réussite chiffres avec méthode de mesure', maxPoints: 10 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['1.2 Business Case', '1.2.1 Business Needs', '1.2.2 Analysis of the Situation'],
    },
    referenceExample: `# Étude d'Opportunité — Projet SAP30/CMRL

## 1. Sommaire exécutif
Le centre de production automobile CMRL utilise actuellement un ERP obsolète (SAP R/3 4.6C) dont le support éditeur cesse en décembre. La migration vers SAP S/4HANA permettra de moderniser les processus métier, réduire les coûts de maintenance de 35% et améliorer la productivité de 20%. L'investissement total de 515K EUR sera rentabilisé en 18 mois avec un ROI projeté de 145%.

## 2. État du problème
**Problème** : Le système ERP actuel ne répond plus aux exigences réglementaires et opérationnelles. Les processus manuels de consolidation représentent 120h/mois de travail improductif.

**Objectifs SMART** :
- Migrer 100% des modules (FI/CO/SD/MM/PP) avant le 31/12
- Réduire les coûts de maintenance IT de 35% (de 310K a 200K/an)
- Éliminer les 120h/mois de traitements manuels
- Former 85 utilisateurs clés en 3 mois

## 3. Analyse des options
| Option | Coûts | ROI 3 ans |
|---|---|---|
| Ne rien faire | 930K (maintenance) | -100% |
| Migration SAP S/4HANA | 515K | +145% |
| ERP alternatif (Oracle) | 720K | +85% |

## 4. Recommandation
Migration SAP S/4HANA : meilleur ROI, compétences internes existantes, continuité fonctionnelle.
`,
  },

  // ─── 02. Charte Projet ────────────────────────────────────
  {
    id: 'seed-tpl-charter',
    title: 'Charte Projet',
    type: 'charter',
    phase: 'INITIATION',
    description:
      "Document fondateur qui autorisé formellement le projet. Définit le périmètre, les objectifs, les contraintes et l'autorité du chef de projet.",
    pmiProcess: '4.1',
    difficulty: 'STANDARD',
    content: `# Charte Projet

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Code** | {{projectCode}} |
| **Chef de projet** | {{userName}} |
| **Organisation** | {{clientName}} |
| **Date** | {{currentDate}} |

---

## Historique des versions

| Version | Auteur | Description | Date |
|---|---|---|---|
| 1.0 | {{userName}} | Création initiale | {{currentDate}} |

---

## 1. Présentation et motivation du projet

[Décrivez le contexte du projet, les raisons de son lancement et le lien avec la stratégie de l'organisation. Faites référence à l'étude d'opportunité approuvée.]

> {{projectDescription}}

## 2. Objectifs et indicateurs clés de performance

[Définissez les objectifs SMART du projet avec des KPI mesurables.]

| Objectif | KPI | Cible |
|---|---|---|
| Respecter le budget | Écart budgétaire | < 10% de {{initialBudget}} EUR |
| Respecter les délais | Écart calendaire | < {{deadlineDays}} jours |
| [À compléter] | [À compléter] | [À compléter] |

## 3. Périmètre du projet

### 3.1 En périmètre
[Listez précisément ce qui est inclus dans le projet.]
- [À compléter]
- [À compléter]

### 3.2 Hors périmètre
[Listez explicitement ce qui est exclu.]
- [À compléter]
- [À compléter]

## 4. Hypothèses et contraintes

### 4.1 Hypothèses
[Conditions supposées vraies pour la planification.]
- [À compléter]

### 4.2 Contraintes
[Limites imposées : temps, budget, réglementation, ressources.]
- Budget : {{initialBudget}} EUR
- Délai : {{deadlineDays}} jours
- [À compléter]

## 5. Livrables et réception

| Livrable | Destinataire | Critère d'acceptation |
|---|---|---|
| [À compléter] | [À compléter] | [À compléter] |

## 6. Estimation des ressources financières

| Poste | Montant estimé |
|---|---|
| Ressources internes | [À compléter] |
| Prestataires externes | [À compléter] |
| Matériel / Licences | [À compléter] |
| **Total** | **{{initialBudget}} EUR** |

## 7. Échéancier

| Jalon | Lot de travail | Date prévue | Description |
|---|---|---|---|
| M1 | Lancement | [À compléter] | Kick-off du projet |
| M2 | [À compléter] | [À compléter] | [À compléter] |
| M3 | [À compléter] | [À compléter] | [À compléter] |
| Mfinal | Clôture | [À compléter] | Recette et mise en production |

## 8. Risques majeurs

| Risque | Impact | Mesure d'atténuation |
|---|---|---|
| [À compléter] | Élevé | [À compléter] |
| [À compléter] | Moyen | [À compléter] |

## 9. Chef de projet

**Nom** : {{userName}}

**Niveau d'autorité** :
- [ ] Gestion du budget dans la limite de [X] EUR
- [ ] Constitution de l'équipe projet
- [ ] Arbitrages opérationnels
- [ ] Escalade vers le sponsor pour les décisions stratégiques

## 10. Parties prenantes

### 10.1 Équipe projet
{{teamMembers}}

### 10.2 Parties prenantes externes
| Nom | Rôle / Service | Intérêt | Influence |
|---|---|---|---|
| {{sponsorName}} | Sponsor | Élevé | Élevé |
| [À compléter] | [À compléter] | [À compléter] | [À compléter] |

## 11. Approbations

| Fonction | Nom | Date | Signature |
|---|---|---|---|
| Sponsor | {{sponsorName}} | | |
| Chef de projet | {{userName}} | | |
| [À compléter] | [À compléter] | | |
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'context-motivation',
          name: 'Présentation et motivation',
          weight: 15,
          criteria: [
            { label: 'Contexte clair', description: 'Le contexte est décrit avec précision et référence les documents antérieurs', maxPoints: 8 },
            { label: 'Lien stratégique', description: "Le lien avec la stratégie de l'organisation est explicite", maxPoints: 7 },
          ],
        },
        {
          id: 'objectives-kpis',
          name: 'Objectifs et KPI',
          weight: 20,
          criteria: [
            { label: 'Objectifs SMART', description: 'Les objectifs sont Spécifiques, Mesurables, Atteignables, Réalistes, Temporels', maxPoints: 10 },
            { label: 'KPI mesurables', description: 'Chaque objectif a un KPI et une cible chiffrée', maxPoints: 10 },
          ],
        },
        {
          id: 'scope',
          name: 'Périmètre',
          weight: 20,
          criteria: [
            { label: 'Périmètre inclus', description: 'Le périmètre est clairement défini avec les livrables principaux', maxPoints: 10 },
            { label: 'Hors périmètre', description: 'Les exclusions sont explicites pour éviter toute ambiguïté', maxPoints: 5 },
            { label: 'Hypothèses et contraintes', description: 'Les hypothèses et contraintes sont listées et réalistes', maxPoints: 5 },
          ],
        },
        {
          id: 'planning-resources',
          name: 'Échéancier et ressources',
          weight: 20,
          criteria: [
            { label: 'Jalons identifiés', description: 'Au moins 4 jalons avec dates et descriptions', maxPoints: 7 },
            { label: 'Budget réparti', description: 'Le budget est ventilé par poste', maxPoints: 7 },
            { label: 'Livrables avec critères', description: "Chaque livrable a un destinataire et un critère d'acceptation", maxPoints: 6 },
          ],
        },
        {
          id: 'governance',
          name: 'Gouvernance et risques',
          weight: 25,
          criteria: [
            { label: 'Équipe et rôles', description: 'L\'équipe projet est listée avec rôles et responsabilités', maxPoints: 8 },
            { label: 'Parties prenantes', description: 'Matrice intérêt/influence des parties prenantes', maxPoints: 7 },
            { label: 'Risques majeurs', description: 'Au moins 3 risques avec impact et mesures d\'atténuation', maxPoints: 5 },
            { label: 'Approbations', description: 'La section approbations est complète avec les bons signataires', maxPoints: 5 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['4.1.3.1 Project Charter'],
    },
    referenceExample: `# Charte Projet — SAP30/CMRL

## 1. Présentation
Le projet SAP30 vise à migrer le système ERP du centre CMRL de SAP R/3 vers SAP S/4HANA. Cette migration est justifiée par la fin du support éditeur et la nécessite de moderniser les processus métier (cf. Étude d'Opportunité v2.0 approuvée le 15/01).

## 2. Objectifs et KPI
| Objectif | KPI | Cible |
|---|---|---|
| Migrer les modules | Taux de couverture fonctionnelle | 100% des 5 modules |
| Respecter le budget | Écart budgétaire | < 5% de 515K EUR |
| Tenir les délais | Date de go-live | 31/12 au plus tard |
| Satisfaire les utilisateurs | Score NPS | > 7/10 |

## 3. Périmètre
**Inclus** : Migration FI, CO, SD, MM, PP ; formation 85 utilisateurs ; recette intégrée
**Exclus** : Migration des données historiques > 3 ans ; développements spécifiques BI
`,
  },

  // ─── 03. Registre des Parties Prenantes ───────────────────
  {
    id: 'seed-tpl-stakeholder-register',
    title: 'Registre des Parties Prenantes',
    type: 'stakeholder-register',
    phase: 'INITIATION',
    description:
      "Identifié et analyse toutes les parties prenantes du projet avec leur niveau d'intérêt, d'influence et la stratégie d'engagement associée.",
    pmiProcess: '13.1',
    difficulty: 'DISCOVERY',
    content: `# Registre des Parties Prenantes

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Chef de projet** | {{userName}} |
| **Date** | {{currentDate}} |

---

## 1. Identification des parties prenantes

| # | Nom | Rôle / Fonction | Organisation | Contact |
|---|---|---|---|---|
| 1 | {{sponsorName}} | Sponsor | {{clientName}} | [Email] |
| 2 | {{userName}} | Chef de projet | {{clientName}} | [Email] |
{{teamMembers}}
| [N] | [À compléter] | [À compléter] | [À compléter] | [À compléter] |

## 2. Matrice Intérêt / Influence

| Partie prenante | Intérêt (1-5) | Influence (1-5) | Quadrant | Stratégie d'engagement |
|---|---|---|---|---|
| {{sponsorName}} | 5 | 5 | Acteur-clé | Gérer de près, impliquer dans les décisions |
| {{userName}} | 5 | 4 | Acteur du projet | Communication régulière, reporting |
| [À compléter] | [1-5] | [1-5] | [À déterminer] | [À compléter] |

### Légende des quadrants
- **Acteur-clé** (Intérêt élevé, Influence élevée) : Gérer de près
- **Acteur du projet** (Intérêt élevé, Influence faible) : Tenir informé
- **Acteur attentif** (Intérêt faible, Influence élevée) : Satisfaire
- **Acteur passif** (Intérêt faible, Influence faible) : Surveiller

## 3. Plan d'engagement par partie prenante

| Partie prenante | Niveau actuel | Niveau souhaite | Actions d'engagement | Fréquence |
|---|---|---|---|---|
| {{sponsorName}} | Soutien | Leader | Comité de pilotage | Bi-mensuel |
| [À compléter] | Neutre/Resistant/Soutien | [À compléter] | [À compléter] | [À compléter] |

## 4. Besoins en communication

| Partie prenante | Information attendue | Format | Fréquence | Responsable |
|---|---|---|---|---|
| {{sponsorName}} | Avancement global, budget, risques | Rapport + réunion | Bi-mensuel | Chef de projet |
| [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] |
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'identification',
          name: 'Identification',
          weight: 30,
          criteria: [
            { label: 'Complétude', description: 'Toutes les parties prenantes clés sont identifiées (sponsor, équipe, clients, fournisseurs)', maxPoints: 15 },
            { label: 'Informations complètes', description: 'Chaque partie prenante a un nom, rôle, organisation et contact', maxPoints: 15 },
          ],
        },
        {
          id: 'analysis',
          name: 'Analyse intérêt/influence',
          weight: 30,
          criteria: [
            { label: 'Notation cohérente', description: 'Les scores intérêt/influence sont réalistes et justifiés', maxPoints: 15 },
            { label: 'Classification correcte', description: 'Le quadrant est correctement attribué selon les scores', maxPoints: 15 },
          ],
        },
        {
          id: 'engagement',
          name: 'Plan d\'engagement',
          weight: 25,
          criteria: [
            { label: 'Stratégies adaptées', description: 'Chaque quadrant a une stratégie d\'engagement cohérente', maxPoints: 15 },
            { label: 'Actions concrètes', description: 'Les actions sont spécifiques et planifiées dans le temps', maxPoints: 10 },
          ],
        },
        {
          id: 'communication',
          name: 'Besoins en communication',
          weight: 15,
          criteria: [
            { label: 'Besoins identifiés', description: 'Chaque partie prenante a des besoins de communication définis', maxPoints: 15 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['13.1.3.1 Stakeholder Register'],
    },
    referenceExample: `# Registre Parties Prenantes — SAP30/CMRL

## Identification
| # | Nom | Rôle | Intérêt | Influence | Stratégie |
|---|---|---|---|---|---|
| 1 | M. Dupont | Sponsor / DG | 5 | 5 | COPIL bi-mensuel, alertes immédiates |
| 2 | Mme Martin | Chef de projet | 5 | 4 | Reporting quotidien |
| 3 | M. Leroy | DSI | 4 | 5 | Comité technique hebdo |
| 4 | Équipe Finance | Utilisateurs FI/CO | 4 | 2 | Formation + support |
| 5 | Fournisseur SAP | Éditeur | 3 | 3 | Réunions mensuelles |
`,
  },

  // ─── 04. Registre des Risques ─────────────────────────────
  {
    id: 'seed-tpl-risk-register',
    title: 'Registre des Risques',
    type: 'risk-register',
    phase: 'INITIATION',
    description:
      "Document vivant qui identifie, analyse et suit les risques du projet avec leurs mesures préventives et correctives.",
    pmiProcess: '11.2',
    difficulty: 'STANDARD',
    content: `# Registre des Risques

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Chef de projet** | {{userName}} |
| **Date de mise à jour** | {{currentDate}} |

---

## 1. Identification des risques

| ID | Catégorie | Description du risque | Cause(s) | Conséquence(s) |
|---|---|---|---|---|
| R01 | [Technique/Humain/Financier/Planning/Externe] | [À compléter] | [À compléter] | [À compléter] |
| R02 | [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| R03 | [À compléter] | [À compléter] | [À compléter] | [À compléter] |

## 2. Analyse qualitative

| ID | Probabilité (1-5) | Impact (1-5) | Criticité (P x I) | Priorité |
|---|---|---|---|---|
| R01 | [1-5] | [1-5] | [Auto] | Critique/Majeur/Modéré/Mineur |
| R02 | [1-5] | [1-5] | [Auto] | [À déterminer] |
| R03 | [1-5] | [1-5] | [Auto] | [À déterminer] |

### Matrice de criticité
|  | Impact 1 | Impact 2 | Impact 3 | Impact 4 | Impact 5 |
|---|---|---|---|---|---|
| **Proba 5** | 5 | 10 | 15 | 20 | **25** |
| **Proba 4** | 4 | 8 | 12 | **16** | **20** |
| **Proba 3** | 3 | 6 | **9** | **12** | **15** |
| **Proba 2** | 2 | 4 | 6 | 8 | **10** |
| **Proba 1** | 1 | 2 | 3 | 4 | 5 |

*Légende : **Gras** = risque critique (>= 9)*

## 3. Plan de réponse aux risques

| ID | Stratégie | Actions préventives | Actions correctives | Responsable | Échéance |
|---|---|---|---|---|---|
| R01 | Atténuer/Éviter/Transférer/Accepter | [À compléter] | [À compléter] | [À compléter] | [À compléter] |
| R02 | [À compléter] | [À compléter] | [À compléter] | [À compléter] | [À compléter] |

## 4. Suivi des risques

| ID | Statut | Date dernière revue | Évolution | Commentaire |
|---|---|---|---|---|
| R01 | Ouvert/En cours/Clos | {{currentDate}} | Stable/En hausse/En baisse | [À compléter] |
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'identification',
          name: 'Identification des risques',
          weight: 25,
          criteria: [
            { label: 'Nombre suffisant', description: 'Au moins 5 risques identifiés couvrant différentes catégories', maxPoints: 10 },
            { label: 'Description précise', description: 'Chaque risque a une cause et une conséquence clairement définies', maxPoints: 15 },
          ],
        },
        {
          id: 'analysis',
          name: 'Analyse qualitative',
          weight: 25,
          criteria: [
            { label: 'Notation cohérente', description: 'Les scores de probabilité et impact sont réalistes', maxPoints: 10 },
            { label: 'Priorisation correcte', description: 'La criticité est correctement calculée et la priorité attribuée', maxPoints: 15 },
          ],
        },
        {
          id: 'response',
          name: 'Plan de réponse',
          weight: 35,
          criteria: [
            { label: 'Stratégie appropriée', description: 'La stratégie (Atténuer/Éviter/Transférer/Accepter) est pertinente pour chaque risque', maxPoints: 10 },
            { label: 'Actions concrètes', description: 'Actions préventives et correctives sont spécifiques et réalisables', maxPoints: 15 },
            { label: 'Responsables désignés', description: 'Chaque action a un responsable et une échéance', maxPoints: 10 },
          ],
        },
        {
          id: 'tracking',
          name: 'Suivi',
          weight: 15,
          criteria: [
            { label: 'Tableau de suivi', description: 'Le suivi est structure avec statut, date et évolution', maxPoints: 15 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['11.2.3.1 Risk Register', '11.3.3.1 Risk Analysis Results'],
    },
    referenceExample: `# Registre des Risques — SAP30/CMRL

| ID | Risque | P | I | C | Stratégie | Action préventive | Responsable |
|---|---|---|---|---|---|---|---|
| R01 | Résistance au changement des utilisateurs Finance | 4 | 4 | 16 | Atténuer | Programme de conduite du changement + champions internes | RH + Chef de projet |
| R02 | Dépassement budget prestataires | 3 | 5 | 15 | Transférer | Contrat forfaitaire avec pénalités | Achats |
| R03 | Indisponibilité expert SAP interne | 3 | 4 | 12 | Atténuer | Backup identifié + documentation croisée | DSI |
| R04 | Retard migration données | 4 | 3 | 12 | Éviter | Migration incrémentale avec checkpoints | Équipe technique |
| R05 | Incompatibilité interfaces legacy | 2 | 5 | 10 | Atténuer | PoC interfaces en phase de planification | Architecte |
`,
  },

  // ─── 05. Support Reunion de Lancement (Kick-off) ──────────
  {
    id: 'seed-tpl-kickoff',
    title: 'Support Réunion de Lancement',
    type: 'kickoff-presentation',
    phase: 'INITIATION',
    description:
      "Présentation du kick-off projet. Communique le contexte, l'équipe, la gouvernance et le planning initial a toutes les parties prenantes.",
    pmiProcess: '4.1',
    difficulty: 'ADVANCED',
    content: `# Réunion de Lancement — {{projectName}}

**Date** : {{currentDate}}
**Chef de projet** : {{userName}}

---

## Ordre du jour

1. Contexte et bénéfices attendus
2. Objectifs et KPI
3. Équipe projet et parties prenantes
4. Matrice RACI
5. Phases du projet et macro-planning
6. Analyse des risques
7. Budget
8. Gouvernance (comités)
9. Questions / Prochaines étapes

---

## 1. Contexte du projet

[Décrivez le problème, les raisons du projet, et les conditions d'approbation (budget, délai, livrables).]

> {{projectDescription}}

## 2. Bénéfices attendus

[Listez les bénéfices quantifiés (références à l'étude d'opportunité).]
- [À compléter]
- [À compléter]

## 3. Objectifs et KPI

| KPI | Cible |
|---|---|
| Budget | < {{initialBudget}} EUR |
| Délai | < {{deadlineDays}} jours |
| [À compléter] | [À compléter] |

## 4. Équipe projet

{{teamMembers}}

**Sponsor** : {{sponsorName}}

## 5. Phases et macro-planning

| Phase | Description | Date début | Date fin |
|---|---|---|---|
| Initiation | Cadrage et lancement | [À compléter] | [À compléter] |
| Planification | Spécification et planification détaillée | [À compléter] | [À compléter] |
| Exécution | Réalisation et déploiement | [À compléter] | [À compléter] |
| Contrôle | Suivi et ajustements | [À compléter] | [À compléter] |
| Clôture | Recette et bilan | [À compléter] | [À compléter] |

## 6. Risques majeurs

| Risque | Sévérité | Probabilité | Action préventive |
|---|---|---|---|
| [À compléter] | Élevée/Moyenne/Faible | Élevée/Moyenne/Faible | [À compléter] |

## 7. Budget

| Poste | BUILD | RUN / an |
|---|---|---|
| Ressources internes | [À compléter] | [À compléter] |
| Prestataires | [À compléter] | [À compléter] |
| Matériel / Licences | [À compléter] | [À compléter] |
| **Total** | **[À compléter]** | **[À compléter]** |

## 8. Gouvernance

### Comité de pilotage (COPIL)
- **Mission** : Décisions stratégiques, arbitrages budget/périmètre
- **Fréquence** : [Bi-mensuel/Mensuel]
- **Participants** : Sponsor, Chef de projet, [À compléter]

### Comité de projet
- **Mission** : Suivi opérationnel, coordination des équipes
- **Fréquence** : [Hebdomadaire]
- **Participants** : Chef de projet, coordinateurs, [À compléter]

## 9. Prochaines étapes

- [ ] [Action 1] — Responsable : [Nom] — Échéance : [Date]
- [ ] [Action 2] — Responsable : [Nom] — Échéance : [Date]
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'context-objectives',
          name: 'Contexte et objectifs',
          weight: 20,
          criteria: [
            { label: 'Contexte complet', description: 'Le problème, les raisons et les conditions d\'approbation sont présentés', maxPoints: 10 },
            { label: 'KPI chiffres', description: 'Au moins 4 KPI avec cibles mesurables', maxPoints: 10 },
          ],
        },
        {
          id: 'team-governance',
          name: 'Équipe et gouvernance',
          weight: 25,
          criteria: [
            { label: 'Équipe complète', description: 'Tous les membres et le sponsor sont identifiés avec leurs rôles', maxPoints: 10 },
            { label: 'Comités définis', description: 'Au moins 2 comités avec mission, fréquence et participants', maxPoints: 15 },
          ],
        },
        {
          id: 'planning',
          name: 'Planning et phases',
          weight: 20,
          criteria: [
            { label: 'Phases identifiées', description: 'Les 5 phases sont présentés avec dates estimées', maxPoints: 10 },
            { label: 'Budget ventilé', description: 'Budget BUILD vs RUN avec totaux', maxPoints: 10 },
          ],
        },
        {
          id: 'risks',
          name: 'Risques',
          weight: 20,
          criteria: [
            { label: 'Risques identifiés', description: 'Au moins 3 risques avec sévérité, probabilité et actions', maxPoints: 20 },
          ],
        },
        {
          id: 'next-steps',
          name: 'Prochaines étapes',
          weight: 15,
          criteria: [
            { label: 'Actions concrètes', description: 'Actions de suivi avec responsables et échéances', maxPoints: 15 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['4.1.3.1 Project Charter (communicated)', '10.2.3.1 Project Communications'],
    },
    referenceExample: `# Kick-off — SAP30/CMRL

## Contexte
Migration ERP obsolète → SAP S/4HANA. Fin support éditeur en décembre. 515K EUR approuvés.

## KPI
| KPI | Cible |
|---|---|
| Budget | < 515K EUR (< 5% écart) |
| Go-live | 31/12 |
| Couverture modules | 100% (FI/CO/SD/MM/PP) |
| NPS utilisateurs | > 7/10 |

## Gouvernance
- COPIL bi-mensuel (DG + DSI + Chef de projet)
- Comité projet hebdo (Chef de projet + coordinateurs domaines)
- Comité technique hebdo (DSI + architecte + expert SAP)
`,
  },
];
