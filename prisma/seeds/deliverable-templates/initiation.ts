import type { DeliverableTemplateData } from './types';

export const initiationTemplates: DeliverableTemplateData[] = [
  // ─── 01. Etude d'Opportunite / Business Case ─────────────
  {
    id: 'seed-tpl-business-case',
    title: "Etude d'Opportunite",
    type: 'business-case',
    phase: 'INITIATION',
    description:
      "Document de justification du projet. Presente le probleme, analyse les options et recommande une solution aux decideurs.",
    pmiProcess: '1.2',
    difficulty: 'STANDARD',
    content: `# Etude d'Opportunite

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
| 1.0 | {{userName}} | Creation initiale | {{currentDate}} |

---

## 1. Sommaire executif

[Synthetisez en quelques paragraphes l'ensemble de l'etude : le probleme identifie, la solution recommandee, les couts estimes, les benefices attendus et la recommandation finale. Cette section est a rediger en dernier.]

## 2. Etat du probleme ou de l'opportunite

### 2.1 Enonce du probleme
[Decrivez brievement le probleme ou l'opportunite en lien avec la strategie de l'organisation.]

### 2.2 Analyse detaillee
[Detaillez l'impact quantifie du probleme : couts actuels, pertes, inefficacites. Listez les objectifs SMART que le projet devrait atteindre.]

**Contexte du projet :**
> {{projectDescription}}

**Objectifs identifies :**
- [ ] Objectif 1 : [A completer]
- [ ] Objectif 2 : [A completer]
- [ ] Objectif 3 : [A completer]

## 3. Analyse des options

[Pour chaque option (y compris "ne rien faire"), decrivez les avantages, couts et risques.]

| Option | Description | Avantages | Couts estimes | Risques |
|---|---|---|---|---|
| Option 0 : Ne rien faire | Maintien du statu quo | Aucun investissement | [Couts indirects] | [Risques] |
| Option 1 | [A completer] | [A completer] | [A completer] | [A completer] |
| Option 2 | [A completer] | [A completer] | [A completer] | [A completer] |

## 4. Recommandation

[Indiquez l'option recommandee avec une justification cout-benefice.]

## 5. Livrables attendus

[Listez les livrables principaux et leur alignement avec les objectifs.]

| Livrable | Objectif associe | Critere d'acceptation |
|---|---|---|
| [A completer] | [A completer] | [A completer] |

## 6. Ressources et parties prenantes

### 6.1 Budget previsionnel
- **Budget initial estime** : {{initialBudget}} EUR
- **Repartition** : [A detailler]

### 6.2 Equipe projet
{{teamMembers}}

### 6.3 Parties prenantes cles
| Partie prenante | Role | Interet | Influence |
|---|---|---|---|
| {{sponsorName}} | Sponsor | Eleve | Eleve |
| [A completer] | [A completer] | [A completer] | [A completer] |

## 7. Evaluation des risques

| Risque | Probabilite | Impact | Mesure d'attenuation |
|---|---|---|---|
| [A completer] | Faible/Moyen/Eleve | Faible/Moyen/Eleve | [A completer] |

## 8. Impact en cas de refus

[Decrivez les consequences du maintien du statu quo si le projet n'est pas approuve.]

## 9. Criteres de reussite et KPI

| KPI | Cible | Methode de mesure |
|---|---|---|
| Respect du budget | < {{initialBudget}} EUR | Suivi mensuel |
| Respect des delais | < {{deadlineDays}} jours | Jalons |
| ROI | > [X]% | Calcul a 12 mois |
| Satisfaction utilisateurs | > [X]/10 | Enquete |
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'executive-summary',
          name: 'Sommaire executif',
          weight: 15,
          criteria: [
            { label: 'Synthese claire', description: 'Le sommaire resume efficacement le probleme, la solution et la recommandation', maxPoints: 10 },
            { label: 'Chiffres cles', description: 'Les couts, benefices et ROI sont mentionnes', maxPoints: 5 },
          ],
        },
        {
          id: 'problem-analysis',
          name: 'Analyse du probleme',
          weight: 20,
          criteria: [
            { label: 'Probleme clairement enonce', description: "Le probleme est decrit avec precision et lie a la strategie de l'organisation", maxPoints: 10 },
            { label: 'Impact quantifie', description: 'Les couts, pertes ou inefficacites sont chiffres', maxPoints: 5 },
            { label: 'Objectifs SMART', description: 'Les objectifs sont Specifiques, Mesurables, Atteignables, Realistes, Temporels', maxPoints: 5 },
          ],
        },
        {
          id: 'options-analysis',
          name: 'Analyse des options',
          weight: 20,
          criteria: [
            { label: 'Options multiples', description: 'Au moins 3 options sont presentees (dont statu quo)', maxPoints: 8 },
            { label: 'Analyse equilibree', description: 'Chaque option a des avantages, couts et risques identifies', maxPoints: 7 },
            { label: 'Justification', description: "La recommandation est justifiee par rapport aux autres options", maxPoints: 5 },
          ],
        },
        {
          id: 'deliverables-resources',
          name: 'Livrables et ressources',
          weight: 20,
          criteria: [
            { label: 'Livrables identifies', description: 'Les livrables sont listes avec criteres d\'acceptation', maxPoints: 7 },
            { label: 'Budget detaille', description: 'Le budget est reparti par poste', maxPoints: 7 },
            { label: 'Parties prenantes', description: 'Les parties prenantes cles sont identifiees avec interet/influence', maxPoints: 6 },
          ],
        },
        {
          id: 'risks-kpis',
          name: 'Risques et KPI',
          weight: 25,
          criteria: [
            { label: 'Risques identifies', description: 'Au moins 3 risques avec probabilite, impact et mesures', maxPoints: 10 },
            { label: 'Impact refus', description: 'Les consequences du statu quo sont clairement decrites', maxPoints: 5 },
            { label: 'KPI mesurables', description: 'Criteres de reussite chiffres avec methode de mesure', maxPoints: 10 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['1.2 Business Case', '1.2.1 Business Needs', '1.2.2 Analysis of the Situation'],
    },
    referenceExample: `# Etude d'Opportunite — Projet SAP30/CMRL

## 1. Sommaire executif
Le centre de production automobile CMRL utilise actuellement un ERP obsolete (SAP R/3 4.6C) dont le support editeur cesse en decembre. La migration vers SAP S/4HANA permettra de moderniser les processus metier, reduire les couts de maintenance de 35% et ameliorer la productivite de 20%. L'investissement total de 515K EUR sera rentabilise en 18 mois avec un ROI projete de 145%.

## 2. Etat du probleme
**Probleme** : Le systeme ERP actuel ne repond plus aux exigences reglementaires et operationnelles. Les processus manuels de consolidation representent 120h/mois de travail improductif.

**Objectifs SMART** :
- Migrer 100% des modules (FI/CO/SD/MM/PP) avant le 31/12
- Reduire les couts de maintenance IT de 35% (de 310K a 200K/an)
- Eliminer les 120h/mois de traitements manuels
- Former 85 utilisateurs cles en 3 mois

## 3. Analyse des options
| Option | Couts | ROI 3 ans |
|---|---|---|
| Ne rien faire | 930K (maintenance) | -100% |
| Migration SAP S/4HANA | 515K | +145% |
| ERP alternatif (Oracle) | 720K | +85% |

## 4. Recommandation
Migration SAP S/4HANA : meilleur ROI, competences internes existantes, continuite fonctionnelle.
`,
  },

  // ─── 02. Charte Projet ────────────────────────────────────
  {
    id: 'seed-tpl-charter',
    title: 'Charte Projet',
    type: 'charter',
    phase: 'INITIATION',
    description:
      "Document fondateur qui autorise formellement le projet. Definit le perimetre, les objectifs, les contraintes et l'autorite du chef de projet.",
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
| 1.0 | {{userName}} | Creation initiale | {{currentDate}} |

---

## 1. Presentation et motivation du projet

[Decrivez le contexte du projet, les raisons de son lancement et le lien avec la strategie de l'organisation. Faites reference a l'etude d'opportunite approuvee.]

> {{projectDescription}}

## 2. Objectifs et indicateurs cles de performance

[Definissez les objectifs SMART du projet avec des KPI mesurables.]

| Objectif | KPI | Cible |
|---|---|---|
| Respecter le budget | Ecart budgetaire | < 10% de {{initialBudget}} EUR |
| Respecter les delais | Ecart calendaire | < {{deadlineDays}} jours |
| [A completer] | [A completer] | [A completer] |

## 3. Perimetre du projet

### 3.1 En perimetre
[Listez precisement ce qui est inclus dans le projet.]
- [A completer]
- [A completer]

### 3.2 Hors perimetre
[Listez explicitement ce qui est exclu.]
- [A completer]
- [A completer]

## 4. Hypotheses et contraintes

### 4.1 Hypotheses
[Conditions supposees vraies pour la planification.]
- [A completer]

### 4.2 Contraintes
[Limites imposees : temps, budget, reglementation, ressources.]
- Budget : {{initialBudget}} EUR
- Delai : {{deadlineDays}} jours
- [A completer]

## 5. Livrables et reception

| Livrable | Destinataire | Critere d'acceptation |
|---|---|---|
| [A completer] | [A completer] | [A completer] |

## 6. Estimation des ressources financieres

| Poste | Montant estime |
|---|---|
| Ressources internes | [A completer] |
| Prestataires externes | [A completer] |
| Materiel / Licences | [A completer] |
| **Total** | **{{initialBudget}} EUR** |

## 7. Echeancier

| Jalon | Lot de travail | Date prevue | Description |
|---|---|---|---|
| M1 | Lancement | [A completer] | Kick-off du projet |
| M2 | [A completer] | [A completer] | [A completer] |
| M3 | [A completer] | [A completer] | [A completer] |
| Mfinal | Cloture | [A completer] | Recette et mise en production |

## 8. Risques majeurs

| Risque | Impact | Mesure d'attenuation |
|---|---|---|
| [A completer] | Eleve | [A completer] |
| [A completer] | Moyen | [A completer] |

## 9. Chef de projet

**Nom** : {{userName}}

**Niveau d'autorite** :
- [ ] Gestion du budget dans la limite de [X] EUR
- [ ] Constitution de l'equipe projet
- [ ] Arbitrages operationnels
- [ ] Escalade vers le sponsor pour les decisions strategiques

## 10. Parties prenantes

### 10.1 Equipe projet
{{teamMembers}}

### 10.2 Parties prenantes externes
| Nom | Role / Service | Interet | Influence |
|---|---|---|---|
| {{sponsorName}} | Sponsor | Eleve | Eleve |
| [A completer] | [A completer] | [A completer] | [A completer] |

## 11. Approbations

| Fonction | Nom | Date | Signature |
|---|---|---|---|
| Sponsor | {{sponsorName}} | | |
| Chef de projet | {{userName}} | | |
| [A completer] | [A completer] | | |
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'context-motivation',
          name: 'Presentation et motivation',
          weight: 15,
          criteria: [
            { label: 'Contexte clair', description: 'Le contexte est decrit avec precision et reference les documents anterieurs', maxPoints: 8 },
            { label: 'Lien strategique', description: "Le lien avec la strategie de l'organisation est explicite", maxPoints: 7 },
          ],
        },
        {
          id: 'objectives-kpis',
          name: 'Objectifs et KPI',
          weight: 20,
          criteria: [
            { label: 'Objectifs SMART', description: 'Les objectifs sont Specifiques, Mesurables, Atteignables, Realistes, Temporels', maxPoints: 10 },
            { label: 'KPI mesurables', description: 'Chaque objectif a un KPI et une cible chiffree', maxPoints: 10 },
          ],
        },
        {
          id: 'scope',
          name: 'Perimetre',
          weight: 20,
          criteria: [
            { label: 'Perimetre inclus', description: 'Le perimetre est clairement defini avec les livrables principaux', maxPoints: 10 },
            { label: 'Hors perimetre', description: 'Les exclusions sont explicites pour eviter toute ambiguite', maxPoints: 5 },
            { label: 'Hypotheses et contraintes', description: 'Les hypotheses et contraintes sont listees et realistes', maxPoints: 5 },
          ],
        },
        {
          id: 'planning-resources',
          name: 'Echeancier et ressources',
          weight: 20,
          criteria: [
            { label: 'Jalons identifies', description: 'Au moins 4 jalons avec dates et descriptions', maxPoints: 7 },
            { label: 'Budget reparti', description: 'Le budget est ventile par poste', maxPoints: 7 },
            { label: 'Livrables avec criteres', description: "Chaque livrable a un destinataire et un critere d'acceptation", maxPoints: 6 },
          ],
        },
        {
          id: 'governance',
          name: 'Gouvernance et risques',
          weight: 25,
          criteria: [
            { label: 'Equipe et roles', description: 'L\'equipe projet est listee avec roles et responsabilites', maxPoints: 8 },
            { label: 'Parties prenantes', description: 'Matrice interet/influence des parties prenantes', maxPoints: 7 },
            { label: 'Risques majeurs', description: 'Au moins 3 risques avec impact et mesures d\'attenuation', maxPoints: 5 },
            { label: 'Approbations', description: 'La section approbations est complete avec les bons signataires', maxPoints: 5 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['4.1.3.1 Project Charter'],
    },
    referenceExample: `# Charte Projet — SAP30/CMRL

## 1. Presentation
Le projet SAP30 vise a migrer le systeme ERP du centre CMRL de SAP R/3 vers SAP S/4HANA. Cette migration est justifiee par la fin du support editeur et la necessite de moderniser les processus metier (cf. Etude d'Opportunite v2.0 approuvee le 15/01).

## 2. Objectifs et KPI
| Objectif | KPI | Cible |
|---|---|---|
| Migrer les modules | Taux de couverture fonctionnelle | 100% des 5 modules |
| Respecter le budget | Ecart budgetaire | < 5% de 515K EUR |
| Tenir les delais | Date de go-live | 31/12 au plus tard |
| Satisfaire les utilisateurs | Score NPS | > 7/10 |

## 3. Perimetre
**Inclus** : Migration FI, CO, SD, MM, PP ; formation 85 utilisateurs ; recette integree
**Exclus** : Migration des donnees historiques > 3 ans ; developpements specifiques BI
`,
  },

  // ─── 03. Registre des Parties Prenantes ───────────────────
  {
    id: 'seed-tpl-stakeholder-register',
    title: 'Registre des Parties Prenantes',
    type: 'stakeholder-register',
    phase: 'INITIATION',
    description:
      "Identifie et analyse toutes les parties prenantes du projet avec leur niveau d'interet, d'influence et la strategie d'engagement associee.",
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

| # | Nom | Role / Fonction | Organisation | Contact |
|---|---|---|---|---|
| 1 | {{sponsorName}} | Sponsor | {{clientName}} | [Email] |
| 2 | {{userName}} | Chef de projet | {{clientName}} | [Email] |
{{teamMembers}}
| [N] | [A completer] | [A completer] | [A completer] | [A completer] |

## 2. Matrice Interet / Influence

| Partie prenante | Interet (1-5) | Influence (1-5) | Quadrant | Strategie d'engagement |
|---|---|---|---|---|
| {{sponsorName}} | 5 | 5 | Acteur-cle | Gerer de pres, impliquer dans les decisions |
| {{userName}} | 5 | 4 | Acteur du projet | Communication reguliere, reporting |
| [A completer] | [1-5] | [1-5] | [A determiner] | [A completer] |

### Legende des quadrants
- **Acteur-cle** (Interet eleve, Influence elevee) : Gerer de pres
- **Acteur du projet** (Interet eleve, Influence faible) : Tenir informe
- **Acteur attentif** (Interet faible, Influence elevee) : Satisfaire
- **Acteur passif** (Interet faible, Influence faible) : Surveiller

## 3. Plan d'engagement par partie prenante

| Partie prenante | Niveau actuel | Niveau souhaite | Actions d'engagement | Frequence |
|---|---|---|---|---|
| {{sponsorName}} | Soutien | Leader | Comite de pilotage | Bi-mensuel |
| [A completer] | Neutre/Resistant/Soutien | [A completer] | [A completer] | [A completer] |

## 4. Besoins en communication

| Partie prenante | Information attendue | Format | Frequence | Responsable |
|---|---|---|---|---|
| {{sponsorName}} | Avancement global, budget, risques | Rapport + reunion | Bi-mensuel | Chef de projet |
| [A completer] | [A completer] | [A completer] | [A completer] | [A completer] |
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'identification',
          name: 'Identification',
          weight: 30,
          criteria: [
            { label: 'Completude', description: 'Toutes les parties prenantes cles sont identifiees (sponsor, equipe, clients, fournisseurs)', maxPoints: 15 },
            { label: 'Informations completes', description: 'Chaque partie prenante a un nom, role, organisation et contact', maxPoints: 15 },
          ],
        },
        {
          id: 'analysis',
          name: 'Analyse interet/influence',
          weight: 30,
          criteria: [
            { label: 'Notation coherente', description: 'Les scores interet/influence sont realistes et justifies', maxPoints: 15 },
            { label: 'Classification correcte', description: 'Le quadrant est correctement attribue selon les scores', maxPoints: 15 },
          ],
        },
        {
          id: 'engagement',
          name: 'Plan d\'engagement',
          weight: 25,
          criteria: [
            { label: 'Strategies adaptees', description: 'Chaque quadrant a une strategie d\'engagement coherente', maxPoints: 15 },
            { label: 'Actions concretes', description: 'Les actions sont specifiques et planifiees dans le temps', maxPoints: 10 },
          ],
        },
        {
          id: 'communication',
          name: 'Besoins en communication',
          weight: 15,
          criteria: [
            { label: 'Besoins identifies', description: 'Chaque partie prenante a des besoins de communication definis', maxPoints: 15 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['13.1.3.1 Stakeholder Register'],
    },
    referenceExample: `# Registre Parties Prenantes — SAP30/CMRL

## Identification
| # | Nom | Role | Interet | Influence | Strategie |
|---|---|---|---|---|---|
| 1 | M. Dupont | Sponsor / DG | 5 | 5 | COPIL bi-mensuel, alertes immediates |
| 2 | Mme Martin | Chef de projet | 5 | 4 | Reporting quotidien |
| 3 | M. Leroy | DSI | 4 | 5 | Comite technique hebdo |
| 4 | Equipe Finance | Utilisateurs FI/CO | 4 | 2 | Formation + support |
| 5 | Fournisseur SAP | Editeur | 3 | 3 | Reunions mensuelles |
`,
  },

  // ─── 04. Registre des Risques ─────────────────────────────
  {
    id: 'seed-tpl-risk-register',
    title: 'Registre des Risques',
    type: 'risk-register',
    phase: 'INITIATION',
    description:
      "Document vivant qui identifie, analyse et suit les risques du projet avec leurs mesures preventives et correctives.",
    pmiProcess: '11.2',
    difficulty: 'STANDARD',
    content: `# Registre des Risques

| Champ | Valeur |
|---|---|
| **Projet** | {{projectName}} |
| **Chef de projet** | {{userName}} |
| **Date de mise a jour** | {{currentDate}} |

---

## 1. Identification des risques

| ID | Categorie | Description du risque | Cause(s) | Consequence(s) |
|---|---|---|---|---|
| R01 | [Technique/Humain/Financier/Planning/Externe] | [A completer] | [A completer] | [A completer] |
| R02 | [A completer] | [A completer] | [A completer] | [A completer] |
| R03 | [A completer] | [A completer] | [A completer] | [A completer] |

## 2. Analyse qualitative

| ID | Probabilite (1-5) | Impact (1-5) | Criticite (P x I) | Priorite |
|---|---|---|---|---|
| R01 | [1-5] | [1-5] | [Auto] | Critique/Majeur/Modere/Mineur |
| R02 | [1-5] | [1-5] | [Auto] | [A determiner] |
| R03 | [1-5] | [1-5] | [Auto] | [A determiner] |

### Matrice de criticite
|  | Impact 1 | Impact 2 | Impact 3 | Impact 4 | Impact 5 |
|---|---|---|---|---|---|
| **Proba 5** | 5 | 10 | 15 | 20 | **25** |
| **Proba 4** | 4 | 8 | 12 | **16** | **20** |
| **Proba 3** | 3 | 6 | **9** | **12** | **15** |
| **Proba 2** | 2 | 4 | 6 | 8 | **10** |
| **Proba 1** | 1 | 2 | 3 | 4 | 5 |

*Legende : **Gras** = risque critique (>= 9)*

## 3. Plan de reponse aux risques

| ID | Strategie | Actions preventives | Actions correctives | Responsable | Echeance |
|---|---|---|---|---|---|
| R01 | Attenuer/Eviter/Transferer/Accepter | [A completer] | [A completer] | [A completer] | [A completer] |
| R02 | [A completer] | [A completer] | [A completer] | [A completer] | [A completer] |

## 4. Suivi des risques

| ID | Statut | Date derniere revue | Evolution | Commentaire |
|---|---|---|---|---|
| R01 | Ouvert/En cours/Clos | {{currentDate}} | Stable/En hausse/En baisse | [A completer] |
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'identification',
          name: 'Identification des risques',
          weight: 25,
          criteria: [
            { label: 'Nombre suffisant', description: 'Au moins 5 risques identifies couvrant differentes categories', maxPoints: 10 },
            { label: 'Description precise', description: 'Chaque risque a une cause et une consequence clairement definies', maxPoints: 15 },
          ],
        },
        {
          id: 'analysis',
          name: 'Analyse qualitative',
          weight: 25,
          criteria: [
            { label: 'Notation coherente', description: 'Les scores de probabilite et impact sont realistes', maxPoints: 10 },
            { label: 'Priorisation correcte', description: 'La criticite est correctement calculee et la priorite attribuee', maxPoints: 15 },
          ],
        },
        {
          id: 'response',
          name: 'Plan de reponse',
          weight: 35,
          criteria: [
            { label: 'Strategie appropriee', description: 'La strategie (Attenuer/Eviter/Transferer/Accepter) est pertinente pour chaque risque', maxPoints: 10 },
            { label: 'Actions concretes', description: 'Actions preventives et correctives sont specifiques et realisables', maxPoints: 15 },
            { label: 'Responsables designes', description: 'Chaque action a un responsable et une echeance', maxPoints: 10 },
          ],
        },
        {
          id: 'tracking',
          name: 'Suivi',
          weight: 15,
          criteria: [
            { label: 'Tableau de suivi', description: 'Le suivi est structure avec statut, date et evolution', maxPoints: 15 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['11.2.3.1 Risk Register', '11.3.3.1 Risk Analysis Results'],
    },
    referenceExample: `# Registre des Risques — SAP30/CMRL

| ID | Risque | P | I | C | Strategie | Action preventive | Responsable |
|---|---|---|---|---|---|---|---|
| R01 | Resistance au changement des utilisateurs Finance | 4 | 4 | 16 | Attenuer | Programme de conduite du changement + champions internes | RH + Chef de projet |
| R02 | Depassement budget prestataires | 3 | 5 | 15 | Transferer | Contrat forfaitaire avec penalites | Achats |
| R03 | Indisponibilite expert SAP interne | 3 | 4 | 12 | Attenuer | Backup identifie + documentation croisee | DSI |
| R04 | Retard migration donnees | 4 | 3 | 12 | Eviter | Migration incrementale avec checkpoints | Equipe technique |
| R05 | Incompatibilite interfaces legacy | 2 | 5 | 10 | Attenuer | PoC interfaces en phase de planification | Architecte |
`,
  },

  // ─── 05. Support Reunion de Lancement (Kick-off) ──────────
  {
    id: 'seed-tpl-kickoff',
    title: 'Support Reunion de Lancement',
    type: 'kickoff-presentation',
    phase: 'INITIATION',
    description:
      "Presentation du kick-off projet. Communique le contexte, l'equipe, la gouvernance et le planning initial a toutes les parties prenantes.",
    pmiProcess: '4.1',
    difficulty: 'ADVANCED',
    content: `# Reunion de Lancement — {{projectName}}

**Date** : {{currentDate}}
**Chef de projet** : {{userName}}

---

## Ordre du jour

1. Contexte et benefices attendus
2. Objectifs et KPI
3. Equipe projet et parties prenantes
4. Matrice RACI
5. Phases du projet et macro-planning
6. Analyse des risques
7. Budget
8. Gouvernance (comites)
9. Questions / Prochaines etapes

---

## 1. Contexte du projet

[Decrivez le probleme, les raisons du projet, et les conditions d'approbation (budget, delai, livrables).]

> {{projectDescription}}

## 2. Benefices attendus

[Listez les benefices quantifies (references a l'etude d'opportunite).]
- [A completer]
- [A completer]

## 3. Objectifs et KPI

| KPI | Cible |
|---|---|
| Budget | < {{initialBudget}} EUR |
| Delai | < {{deadlineDays}} jours |
| [A completer] | [A completer] |

## 4. Equipe projet

{{teamMembers}}

**Sponsor** : {{sponsorName}}

## 5. Phases et macro-planning

| Phase | Description | Date debut | Date fin |
|---|---|---|---|
| Initiation | Cadrage et lancement | [A completer] | [A completer] |
| Planification | Specification et planification detaillee | [A completer] | [A completer] |
| Execution | Realisation et deploiement | [A completer] | [A completer] |
| Controle | Suivi et ajustements | [A completer] | [A completer] |
| Cloture | Recette et bilan | [A completer] | [A completer] |

## 6. Risques majeurs

| Risque | Severite | Probabilite | Action preventive |
|---|---|---|---|
| [A completer] | Elevee/Moyenne/Faible | Elevee/Moyenne/Faible | [A completer] |

## 7. Budget

| Poste | BUILD | RUN / an |
|---|---|---|
| Ressources internes | [A completer] | [A completer] |
| Prestataires | [A completer] | [A completer] |
| Materiel / Licences | [A completer] | [A completer] |
| **Total** | **[A completer]** | **[A completer]** |

## 8. Gouvernance

### Comite de pilotage (COPIL)
- **Mission** : Decisions strategiques, arbitrages budget/perimetre
- **Frequence** : [Bi-mensuel/Mensuel]
- **Participants** : Sponsor, Chef de projet, [A completer]

### Comite de projet
- **Mission** : Suivi operationnel, coordination des equipes
- **Frequence** : [Hebdomadaire]
- **Participants** : Chef de projet, coordinateurs, [A completer]

## 9. Prochaines etapes

- [ ] [Action 1] — Responsable : [Nom] — Echeance : [Date]
- [ ] [Action 2] — Responsable : [Nom] — Echeance : [Date]
`,
    evaluationCriteria: {
      sections: [
        {
          id: 'context-objectives',
          name: 'Contexte et objectifs',
          weight: 20,
          criteria: [
            { label: 'Contexte complet', description: 'Le probleme, les raisons et les conditions d\'approbation sont presentes', maxPoints: 10 },
            { label: 'KPI chiffres', description: 'Au moins 4 KPI avec cibles mesurables', maxPoints: 10 },
          ],
        },
        {
          id: 'team-governance',
          name: 'Equipe et gouvernance',
          weight: 25,
          criteria: [
            { label: 'Equipe complete', description: 'Tous les membres et le sponsor sont identifies avec leurs roles', maxPoints: 10 },
            { label: 'Comites definis', description: 'Au moins 2 comites avec mission, frequence et participants', maxPoints: 15 },
          ],
        },
        {
          id: 'planning',
          name: 'Planning et phases',
          weight: 20,
          criteria: [
            { label: 'Phases identifiees', description: 'Les 5 phases sont presentes avec dates estimees', maxPoints: 10 },
            { label: 'Budget ventile', description: 'Budget BUILD vs RUN avec totaux', maxPoints: 10 },
          ],
        },
        {
          id: 'risks',
          name: 'Risques',
          weight: 20,
          criteria: [
            { label: 'Risques identifies', description: 'Au moins 3 risques avec severite, probabilite et actions', maxPoints: 20 },
          ],
        },
        {
          id: 'next-steps',
          name: 'Prochaines etapes',
          weight: 15,
          criteria: [
            { label: 'Actions concretes', description: 'Actions de suivi avec responsables et echeances', maxPoints: 15 },
          ],
        },
      ],
      passingScore: 60,
      maxScore: 100,
      pmiOutputs: ['4.1.3.1 Project Charter (communicated)', '10.2.3.1 Project Communications'],
    },
    referenceExample: `# Kick-off — SAP30/CMRL

## Contexte
Migration ERP obsolete → SAP S/4HANA. Fin support editeur en decembre. 515K EUR approuves.

## KPI
| KPI | Cible |
|---|---|
| Budget | < 515K EUR (< 5% ecart) |
| Go-live | 31/12 |
| Couverture modules | 100% (FI/CO/SD/MM/PP) |
| NPS utilisateurs | > 7/10 |

## Gouvernance
- COPIL bi-mensuel (DG + DSI + Chef de projet)
- Comite projet hebdo (Chef de projet + coordinateurs domaines)
- Comite technique hebdo (DSI + architecte + expert SAP)
`,
  },
];
