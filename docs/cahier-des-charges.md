# ProjectSim360 — Cahier des Charges Detaille

> **Version** : 1.0
> **Date** : 2026-03-06
> **Statut** : Draft
> **Sources** : Parcours_Utilisateur_PM.pdf, Parcours_Utilisateur_Business.pdf, Ricardo Vargas Process Groups Flow (PMI), Notes vocales 2026-02-23, spec-fonctionnelle.md

---

## Table des matieres

1. [Vue d'ensemble](#1-vue-densemble)
2. [Referentiel PMI — Process Groups](#2-referentiel-pmi--process-groups)
3. [Parcours Apprenant (PM)](#3-parcours-apprenant-pm)
4. [Parcours Recrutement (Business)](#4-parcours-recrutement-business)
5. [Agent PMO — Moteur IA Central](#5-agent-pmo--moteur-ia-central)
6. [Systeme de Livrables](#6-systeme-de-livrables)
7. [Systeme de Valorisation](#7-systeme-de-valorisation)
8. [Administration du Referentiel](#8-administration-du-referentiel)
9. [Modele de Donnees](#9-modele-de-donnees)
10. [API Endpoints](#10-api-endpoints)
11. [Pages Frontend](#11-pages-frontend)
12. [Plan d'Implementation](#12-plan-dimplementation)

---

## 1. Vue d'ensemble

### 1.1 Contexte

ProjectSim360 dispose deja d'un socle fonctionnel : authentification, moteur de scenarios, reunions virtuelles (texte + audio), decisions, evenements aleatoires, KPIs et dashboards. Ce cahier des charges couvre les **nouvelles fonctionnalites** a developper pour enrichir le parcours utilisateur et ouvrir la plateforme aux entreprises.

### 1.2 Deux parcours distincts

| Parcours | Cible | Objectif |
|----------|-------|----------|
| **Apprenant (PM)** | Individu (etudiant, professionnel en reconversion, chef de projet) | Apprendre et pratiquer la gestion de projet via des simulations immersives |
| **Recrutement (Business)** | Entreprise (RH, recruteur, manager) | Evaluer les competences reelles des candidats en gestion de projet |

### 1.3 Principes fondamentaux

1. **L'apprenant produit, l'IA evalue** — L'IA ne genere jamais les livrables a la place de l'utilisateur. Elle guide, evalue et fournit des exemples de reference apres soumission.
2. **Alignement PMI** — La simulation suit les 5 Process Groups du PMI (Initiating, Planning, Executing, Monitoring & Controlling, Closing) avec les processus, outils et livrables associes.
3. **Personnalisation adaptative** — Le parcours s'adapte au profil de l'utilisateur (debutant, reconversion, renforcement, zero experience).
4. **Immersion narrative** — L'utilisateur ne remplit pas des formulaires, il vit une experience dans une entreprise fictive avec une culture, un ton et des personnalites.

---

## 2. Referentiel PMI — Process Groups

> Base sur le flow de Ricardo Vargas (PMI Process Groups: A Practice Guide, 2022).

Ce referentiel structure la simulation. Chaque processus peut devenir une activite, un livrable ou une decision dans la simulation.

### 2.1 Initiating (Demarrage)

| ID | Processus | Domaine | Livrables attendus de l'apprenant |
|----|-----------|---------|----------------------------------|
| 4.1 | Develop Project Charter | Integration | Charte de projet |
| 4.2 | Identify Stakeholders | Stakeholder | Registre des parties prenantes |

**Interactions simulees** :
- Reunion avec le Sponsor du projet pour clarifier les objectifs
- Si l'apprenant ne pose pas les bonnes questions, les objectifs restent flous et causeront des problemes dans les phases suivantes

### 2.2 Planning (Planification)

| ID | Processus | Domaine | Livrables attendus de l'apprenant |
|----|-----------|---------|----------------------------------|
| 5.1 | Develop Project Management Plan | Integration | Plan de management de projet |
| 5.2 | Plan Scope Management | Scope | Plan de gestion du perimetre |
| 5.3 | Collect Requirements | Scope | Documentation des exigences |
| 5.4 | Define Scope | Scope | Enonce du perimetre |
| 5.5 | Create WBS | Scope | Structure de decoupage (WBS) |
| 5.6 | Plan Schedule Management | Schedule | Plan de gestion de l'echeancier |
| 5.7 | Define Activities | Schedule | Liste des activites |
| 5.8 | Sequence Activities | Schedule | Diagramme de reseau |
| 5.9 | Estimate Activity Durations | Schedule | Estimations de duree |
| 5.10 | Develop Schedule | Schedule | Echeancier du projet (Gantt) |
| 5.11 | Plan Cost Management | Cost | Plan de gestion des couts |
| 5.12 | Estimate Costs | Cost | Estimations des couts |
| 5.13 | Determine Budget | Cost | Reference de base des couts |
| 5.14 | Plan Quality Management | Quality | Plan de gestion de la qualite |
| 5.15 | Plan Resource Management | Resource | Plan de gestion des ressources |
| 5.16 | Estimate Activity Resources | Resource | Besoins en ressources |
| 5.17 | Plan Communications Management | Communications | Plan de communication |
| 5.18 | Plan Risk Management | Risk | Plan de gestion des risques |
| 5.19 | Identify Risks | Risk | Registre des risques |
| 5.20 | Perform Qualitative Risk Analysis | Risk | Registre des risques mis a jour |
| 5.21 | Perform Quantitative Risk Analysis | Risk | Analyse quantitative |
| 5.22 | Plan Risk Responses | Risk | Strategies de reponse aux risques |
| 5.23 | Plan Procurement Management | Procurement | Plan des approvisionnements |
| 5.24 | Plan Stakeholder Engagement | Stakeholder | Plan d'engagement des parties prenantes |

**Interactions simulees** :
- Acces a un espace de travail de planification (Gantt/Kanban)
- Soumission du plan au PMO pour validation
- Le PMO fait un retour critique : *"Ton planning est trop optimiste, tu n'as pas prevu de marge pour les tests. Recommence."*

**Note d'implementation** : En fonction du niveau de difficulte et du profil, la simulation n'activera qu'un sous-ensemble de ces processus. Un debutant ne fera pas l'analyse quantitative des risques (5.21).

### 2.3 Executing (Execution)

| ID | Processus | Domaine | Activites simulees |
|----|-----------|---------|-------------------|
| 6.1 | Direct and Manage Project Work | Integration | Pilotage quotidien du projet |
| 6.2 | Manage Project Knowledge | Integration | Capitalisation des connaissances |
| 6.3 | Manage Quality | Quality | Controle qualite des livrables |
| 6.4 | Acquire Resources | Resource | Constitution de l'equipe |
| 6.5 | Develop Team | Resource | Developpement de l'equipe |
| 6.6 | Manage Team | Resource | Gestion des conflits d'equipe |
| 6.7 | Manage Communications | Communications | Comptes-rendus, emails, reporting |
| 6.8 | Implement Risk Responses | Risk | Application des reponses aux risques |
| 6.9 | Conduct Procurements | Procurement | Gestion des sous-traitants |
| 6.10 | Manage Stakeholder Engagement | Stakeholder | Relations parties prenantes |

**Interactions simulees ("Chaos Engine")** :
- Evenements aleatoires adaptes au profil de l'utilisateur (si l'IA detecte qu'il est timide, elle cree un conflit entre deux membres d'equipe pour le forcer a arbitrer)
- Reunions de crise (mode audio) : l'apprenant doit convaincre les participants, l'IA analyse ses arguments et son ton
- Gestion d'emails simules : priorisation entre repondre a un client mecontent et valider une facture

### 2.4 Monitoring & Controlling (Suivi et Controle)

| ID | Processus | Domaine | Activites simulees |
|----|-----------|---------|-------------------|
| 7.1 | Monitor and Control Project Work | Integration | Tableau de bord de suivi |
| 7.2 | Perform Integrated Change Control | Integration | Gestion des demandes de changement |
| 7.3 | Validate Scope | Scope | Validation des livrables avec le client |
| 7.4 | Control Scope | Scope | Controle du perimetre |
| 7.5 | Control Schedule | Schedule | Controle de l'echeancier |
| 7.6 | Control Costs | Cost | Controle des couts |
| 7.7 | Control Quality | Quality | Controle qualite |
| 7.8 | Control Resources | Resource | Controle des ressources |
| 7.9 | Monitor Communications | Communications | Suivi des communications |
| 7.10 | Monitor Risks | Risk | Suivi des risques |
| 7.11 | Control Procurements | Procurement | Controle des achats |
| 7.12 | Monitor Stakeholder Engagement | Stakeholder | Suivi de l'engagement |

### 2.5 Closing (Cloture)

| ID | Processus | Domaine | Livrables attendus de l'apprenant |
|----|-----------|---------|----------------------------------|
| 8.1 | Close Project or Phase | Integration | Bilan de projet, Lecons apprises, PV de reception |

**Interactions simulees** :
- **Soutenance finale** : Presentation des resultats devant un "Comite de Direction" (agents IA)
- **Lecons apprises** : L'apprenant documente ce qu'il a appris pour clore le dossier

---

## 3. Parcours Apprenant (PM)

### 3.1 Etape 1 — Phase d'Analyse "Cameleon" (Profiling)

**Objectif** : Comprendre qui est l'utilisateur et ce qu'il veut devenir.

#### 3.1.1 Ingestion de donnees

L'utilisateur a trois options pour fournir ses informations :

| Methode | Donnees extraites | Implementation |
|---------|-------------------|----------------|
| **Connexion LinkedIn** | Historique professionnel, soft skills validees, reseau | API LinkedIn OAuth + scraping du profil public |
| **Upload de CV (PDF)** | Details techniques, projets passes non detailles sur LinkedIn | Parsing PDF via IA (extraction structuree) |
| **Questionnaire d'intention** | Objectif de carriere, motivation, domaine cible | Formulaire interactif guide par l'IA |

#### 3.1.2 Diagnostic IA — Gap Analysis

Le systeme genere un rapport d'ecart :

```typescript
interface GapAnalysis {
  profileType: 'zero-experience' | 'beginner' | 'reconversion' | 'reinforcement';
  currentSkills: { skill: string; level: 'none' | 'basic' | 'intermediate' | 'advanced' }[];
  targetSkills: { skill: string; requiredLevel: string; gap: string }[];
  suggestedSector: string;       // BTP, IT, Sante, Evenementiel...
  suggestedDifficulty: 'discovery' | 'standard' | 'advanced';
  personalizedMessage: string;   // Ex: "Votre profil montre une forte expertise en Marketing, mais pour devenir Chef de Projet BTP, vous devez maitriser la gestion des sous-traitants."
}
```

#### 3.1.3 Libre choix ou suggestion

L'utilisateur peut :
- **Accepter** la suggestion de l'IA (secteur + difficulte)
- **Choisir manuellement** une categorie (BTP, IT, Sante, etc.)
- **Importer un projet reel** : il fournit les details d'un vrai projet qu'il connait, et l'IA genere une simulation basee sur ce cas

#### 3.1.4 Cas special — Zero Experience

Si l'utilisateur n'a ni LinkedIn, ni CV, ou declare "Zero Experience" :

1. **Test d'aptitude naturelle** : Un mini-cas pratique de 5 minutes (ex: "Organiser un anniversaire avec des contraintes"). L'IA mesure le sens logique et l'organisation naturelle.
2. **Parcours guide** : Le systeme propose un secteur accessible (ex: petit projet evenementiel ou numerique simple) pour la premiere immersion.

### 3.2 Etape 2 — Immersion Narrative (Embarquement)

**Objectif** : Plonger l'utilisateur dans une histoire, pas dans un tableau de bord.

#### 3.2.1 Welcome Pack Virtuel

A l'entree dans la simulation, l'utilisateur recoit :
- Un **email de bienvenue** sur une boite mail simulee
- Son **nom de poste** (ex: "Chef de Projet Junior SI")
- L'acces a l'**intranet** de l'entreprise fictive
- Le **contexte** de l'entreprise : secteur, taille, culture

#### 3.2.2 Rencontre avec le PMO (Agent Mentor)

Le PMO (agent IA) se presente via un appel audio ou un chat :

> *"Ici, on ne rigole pas avec le budget. Voici nos modeles de documents. On utilise les standards du PMI. Tu as 24h pour me soumettre la Charte de Projet. Bonne chance."*

Le **ton du PMO** varie selon la culture d'entreprise generee :
- **Exigeante et hierarchique** : PMO severe, formel, sans marge d'erreur
- **Agile et chaotique** : PMO decontracte mais imprevus constants
- **Start-up decontractee** : PMO amical mais attentes elevees

#### 3.2.3 Culture d'entreprise

L'IA definit un "temperament" d'entreprise qui impacte :
- Le ton des communications (formel vs decontracte)
- La tolerance aux erreurs (stricte vs permissive)
- La frequence des imprevus (stable vs chaotique)
- Les attentes en termes de livrables (exhaustif vs pragmatique)

### 3.3 Etape 3 — Cycle de Vie du Projet (Action et Validation)

Le parcours suit les 5 Process Groups du PMI de maniere dynamique.

#### 3.3.1 Phase d'Initialisation ("L'Enquete")

L'utilisateur ne remplit pas juste un formulaire. Il doit **provoquer des rencontres** :

| Action | Description | Impact |
|--------|-------------|--------|
| Appeler le Sponsor | Reunion IA pour clarifier les objectifs | Si mauvaises questions → objectifs flous → problemes en planification |
| Identifier les parties prenantes | Decouverte progressive via emails et reunions | Parties prenantes oubliees = conflits plus tard |
| Rediger la Charte de Projet | L'apprenant produit le document | Soumission au PMO pour evaluation |

**Livrables a produire** :
- Charte de Projet
- Registre des Parties Prenantes

#### 3.3.2 Phase de Planification ("La Strategie")

| Action | Description |
|--------|-------------|
| Acces au workspace de planification | Outil Gantt/Kanban integre |
| Construction du WBS | Decomposition du travail |
| Estimation des couts et delais | L'apprenant propose ses estimations |
| Planification des risques | Identification et strategies de reponse |
| Soumission au PMO | Validation avec feedback critique |

Le PMO fait un retour sur chaque element : *"Ton planning est trop optimiste, tu n'as pas prevu de marge pour les tests. Recommence."*

**Livrables a produire** :
- WBS (Structure de Decoupage du Travail)
- Echeancier (Gantt)
- Budget previsionnel
- Plan de gestion des risques
- Plan de communication

#### 3.3.3 Phase d'Execution & Controle ("Le Chaos Engine")

C'est ici que l'experience se forge :

| Mecanisme | Description |
|-----------|-------------|
| **Evenements aleatoires** | L'IA declenche des crises basees sur le profil de l'utilisateur. Si timide → conflit d'equipe a arbitrer. |
| **Reunions de crise** | Mode audio obligatoire. L'IA analyse arguments et ton de voix. |
| **Gestion d'emails** | Pluie d'emails simules. Priorisation : repondre au client en colere ou valider une facture ? |
| **Suivi d'avancement** | Rapports d'etat a rediger et soumettre |
| **Demandes de changement** | Le client demande des modifications — l'apprenant doit evaluer l'impact |

**Livrables a produire** :
- Comptes-rendus de reunion
- Rapports d'avancement
- Rapports d'etat
- Demandes de changement (evaluation d'impact)

#### 3.3.4 Phase de Cloture

| Action | Description |
|--------|-------------|
| **Soutenance finale** | Presentation des resultats devant le "Comite de Direction" (agents IA) |
| **Lecons apprises** | Documentation de ce que l'apprenant a appris |
| **Bilan de projet** | Synthese finale soumise au PMO |

**Livrables a produire** :
- Bilan de projet
- Lecons apprises
- PV de reception

### 3.4 Adaptation selon le profil

| Element | Zero Experience | Debutant | Reconversion | Renforcement |
|---------|----------------|----------|--------------|--------------|
| Nombre de processus PMI actifs | 8-10 | 12-15 | 15-20 | 20-25 |
| Tolerance aux erreurs | Elevee (droit a l'erreur) | Moyenne | Faible | Tres faible |
| Interventions du Mentor | Frequentes, proactives | Regulieres | A la demande | Rares |
| Ton du PMO | Patient, pedagogique | Bienveillant | Professionnel | Exigeant |
| Bulles d'aide contextuelles | Oui (termes PMI expliques) | Oui | Non | Non |
| Possibilite de revenir en arriere | Oui | Limitee | Non | Non |
| Duree estimee | 2-3h | 3-4h | 4-5h | 4-6h |

#### 3.4.1 PMO en mode "Coach Patient" (Zero Experience)

Pour le profil zero experience, le PMO change de posture :

- **L'explication du "Pourquoi"** : Le PMO ne dit pas "Fais une Charte de Projet", il explique : *"Dans le monde reel, si on ne definit pas les regles au debut, le client changera d'avis tous les jours. Voici pourquoi nous allons rediger ce document ensemble."*
- **Tutorat contextuel** : Des bulles d'aide intelligentes apparaissent sur l'interface. Si l'utilisateur bloque sur "WBS" ou "Parties prenantes", l'IA explique avec des mots simples et des exemples concrets du quotidien.
- **Droit a l'erreur sans echec** : L'IA autorise plus d'erreurs. Si decision catastrophique, le Mentor intervient : *"Attention, tu viens de depenser 50% de ton budget sur une tache secondaire. Veux-tu revenir en arriere ou assumer les consequences ?"*
- **Avatars pedagogiques** : Les participants IA posent des questions qui guident l'utilisateur : *"Chef, vous ne m'avez pas donne de date limite pour ce rapport, est-ce que c'est normal ?"*

---

## 4. Parcours Recrutement (Business)

### 4.1 Etape 1 — Configuration du "Jumeau Numerique" du Poste

L'entreprise ne choisit pas un test generique, elle cree un miroir de son besoin reel.

#### 4.1.1 Definition du Context-Job

| Champ | Description | Obligatoire |
|-------|-------------|-------------|
| Fiche de poste | Upload PDF ou saisie manuelle | Oui |
| Secteur d'activite | Domaine de l'entreprise | Oui |
| Taille de l'entreprise | Startup / PME / Grand Groupe | Oui |
| Documents internes (anonymises) | Vieux CR, planning reel, organigramme | Non |
| Competences recherchees | Liste avec poids/priorite | Oui |
| Niveau d'experience minimum | Junior / Confirme / Senior | Oui |
| Types de projets geres | IT, Construction, Marketing, etc. | Oui |

#### 4.1.2 Modelisation de la culture

Le recruteur definit le "temperament" de l'entreprise :

| Culture | Impact sur la simulation |
|---------|------------------------|
| **Exigeante et hierarchique** | PMO severe, processus rigides, tolerance zero |
| **Agile et chaotique** | Imprevus constants, pivots frequents, adaptation requise |
| **Collaborative et humaine** | Focus sur la gestion d'equipe et la communication |

#### 4.1.3 Generation du scenario ("Ghost-Writer")

L'IA genere instantanement une simulation sur-mesure appelee **"Le Test de Verite"**. Aucun candidat ne peut s'y preparer a l'avance car le scenario est unique a l'entreprise.

### 4.2 Etape 2 — Deploiement du Flux de Candidature

#### 4.2.1 Le "Lien Magique" de Simulation

L'entreprise recoit un lien unique a integrer dans :
- Son offre d'emploi
- Un email aux candidats selectionnes
- Son ATS (Applicant Tracking System)

Format : `https://app.projectsim360.com/recruitment/join/{campaignSlug}`

#### 4.2.2 Experience candidat

Le candidat clique sur le lien et vit un **"Entretien d'embauche de 48h compresse en 1h"** :

1. Creation de compte (ou connexion existante)
2. Profiling rapide (LinkedIn ou questionnaire court)
3. Lancement de la simulation adaptee (profil candidat + exigences recruteur)
4. Realisation de la simulation
5. Score calcule et transmis au recruteur

#### 4.2.3 Monitoring en temps reel (cote recruteur)

Le recruteur dispose d'un dashboard pour voir :
- Qui a commence la simulation
- Qui a abandonne (et a quel moment)
- Qui progresse avec brio
- Taux de completion global

### 4.3 Etape 3 — Analyse Cognitive et Comportementale ("Score Licorne")

#### 4.3.1 Rapport d'aptitude 360 degres

Pour chaque candidat, l'IA genere un rapport detaille :

| Dimension | Ce qui est mesure | Source |
|-----------|-------------------|--------|
| **Hard Skills** | Maitrise reelle du standard PMI (qualite des livrables produits) | Evaluation des livrables soumis |
| **Soft Skills** | Gestion du stress, negociation, clarte de communication | Analyse vocale/textuelle des reunions |
| **Indice de Fiabilite** | Correlation entre les promesses en reunion et les actions dans le planning | Croisement decisions / livrables |
| **Adaptabilite** | Reaction face aux imprevus et changements | Evenements aleatoires + demandes de changement |
| **Leadership** | Capacite a diriger l'equipe et a arbitrer les conflits | Reunions de crise + gestion d'equipe |

```typescript
interface CandidateReport360 {
  candidateId: string;
  campaignId: string;
  globalScore: number;                    // 0-100
  hardSkills: {
    pmiProcessMastery: number;            // Maitrise des processus PMI
    deliverableQuality: number;           // Qualite des livrables produits
    planningAccuracy: number;             // Precision de la planification
    budgetManagement: number;             // Gestion budgetaire
  };
  softSkills: {
    communication: number;                // Clarte, ton, argumentation
    stressManagement: number;             // Reaction sous pression
    negotiation: number;                  // Capacite a negocier
    conflictResolution: number;           // Gestion des conflits
  };
  reliabilityIndex: number;              // Promesses vs actions
  adaptabilityScore: number;             // Reaction aux imprevus
  leadershipScore: number;               // Capacite de leadership
  strengths: string[];
  weaknesses: string[];
  aiJustification: string;               // Analyse detaillee en prose
  comparisonWithIdeal: {                 // Ecart avec le profil ideal
    matchPercentage: number;
    gaps: string[];
  };
}
```

#### 4.3.2 Ranking automatise

L'IA classe les candidats non pas sur leur CV, mais sur leur **"Performance de Terrain Simulee"** :

- Classement global avec score composite
- Filtrage par competence specifique
- Suggestion de short-list avec justification IA

### 4.4 Etape 4 — Aide a la Decision et Finalisation

#### 4.4.1 Comparaison de profils

Le recruteur peut comparer deux finalistes cote a cote :

> *"Le Candidat A est meilleur pour stabiliser un budget en derive, le Candidat B est meilleur pour motiver une equipe demotivee."*

#### 4.4.2 Guide d'entretien final

L'IA genere des questions d'entretien basees sur les erreurs faites par le candidat pendant la simulation :

> *"Pendant le test, le candidat a ignore le risque financier au profit du delai, interrogez-le sur sa vision de la rentabilite."*

#### 4.4.3 Onboarding prepare

Une fois recrute, le rapport de simulation est transmis au futur manager pour savoir exactement sur quels points coacher la nouvelle recrue des son arrivee.

---

## 5. Agent PMO — Moteur IA Central

### 5.1 Definition

Le PMO (Project Management Office) est un **agent IA** qui joue le role de superviseur, mentor et evaluateur tout au long de la simulation. C'est l'interlocuteur principal de l'apprenant.

### 5.2 Responsabilites

| Responsabilite | Description | Declencheur |
|----------------|-------------|-------------|
| Accueil et orientation | Presente l'entreprise, le projet, la methodologie | Debut de simulation |
| Distribution des templates | Fournit les modeles de documents pour chaque livrable | Debut de chaque phase |
| Evaluation des livrables | Note et commente les livrables soumis | Soumission d'un livrable |
| Fourniture d'exemples | Genere un livrable de reference pour comparaison | Apres evaluation |
| Suivi de progression | Rappelle livrables en attente, echeances, prochaines etapes | Continu |
| Conseil methodologique | Repond aux questions sur la methode de gestion de projet | A la demande |
| Feedback en temps reel | Alerte en cas de decision a risque | Decision critique |
| Adaptation du ton | Ajuste son ton selon le profil et la culture d'entreprise | Continu |

### 5.3 Modes de fonctionnement selon le profil

| Profil | Mode du PMO | Comportement |
|--------|-------------|--------------|
| Zero Experience | **Coach Patient** | Explique le "pourquoi", co-redige les premiers livrables, tolere les erreurs |
| Debutant | **Mentor Bienveillant** | Guide avec des indices, feedback constructif, quelques tolerances |
| Reconversion | **Superviseur Professionnel** | Feedback direct, attend de l'autonomie, pas de guidage |
| Renforcement | **Examinateur Exigeant** | Feedback sec, note severement, simule un PMO reel |

### 5.4 Implementation technique

```typescript
// apps/api/src/modules/ai/services/pmo-ai.service.ts

interface PmoContext {
  simulation: Simulation;
  currentPhase: Phase;
  userProfile: {
    profileType: 'zero-experience' | 'beginner' | 'reconversion' | 'reinforcement';
    gapAnalysis: GapAnalysis;
  };
  companyCulture: {
    temperament: 'strict' | 'agile' | 'collaborative';
    tone: 'formal' | 'casual' | 'friendly';
  };
  submittedDeliverables: Deliverable[];
  pendingDeliverables: DeliverableTemplate[];
  referenceDocuments: ReferenceDocument[];
  conversationHistory: Message[];
  simulationState: {
    kpis: KPIs;
    decisions: Decision[];
    events: Event[];
    meetings: Meeting[];
  };
}

// Le prompt systeme du PMO est construit dynamiquement a partir de ce contexte
```

### 5.5 Base de connaissances du PMO

Le PMO s'appuie sur des **documents de reference** geres par les admins :

| Type | Contenu | Utilisation |
|------|---------|-------------|
| **Templates** | Modeles vierges de livrables (charte, WBS, registre des risques...) | Fournis a l'apprenant comme point de depart |
| **Standards** | Criteres d'evaluation par type de livrable | Utilises pour noter les livrables soumis |
| **Bonnes pratiques** | Guide methodologique par phase PMI | Injectes dans le prompt du PMO pour ses conseils |
| **Exemples de reference** | Livrables "parfaits" pre-rediges | Montres a l'apprenant apres evaluation |

---

## 6. Systeme de Livrables

### 6.1 Cycle de vie d'un livrable

```
[PMO demande un livrable]
        |
        v
[Apprenant redige et soumet]
        |
        v
[IA evalue le livrable]
        |
        v
[Feedback + exemple de reference]
        |
        v
[Apprenant peut reviser et resoumettre]  (optionnel, selon le profil)
        |
        v
[Livrable valide → passage a la suite]
```

### 6.2 Matrice des livrables par phase

| Phase | Livrable | Type | Template requis | Evaluation PMO |
|-------|----------|------|-----------------|----------------|
| **Initiating** | Charte de Projet | `project-charter` | Oui | Score + feedback + reference |
| **Initiating** | Registre des Parties Prenantes | `stakeholder-register` | Oui | Score + feedback + reference |
| **Planning** | WBS | `wbs` | Oui | Score + feedback + reference |
| **Planning** | Echeancier (Gantt) | `schedule` | Outil integre | Validation PMO |
| **Planning** | Budget previsionnel | `budget` | Oui | Score + feedback + reference |
| **Planning** | Plan de gestion des risques | `risk-plan` | Oui | Score + feedback + reference |
| **Planning** | Registre des risques | `risk-register` | Oui | Score + feedback + reference |
| **Planning** | Plan de communication | `communication-plan` | Oui | Score + feedback + reference |
| **Executing** | Compte-rendu de reunion | `meeting-minutes` | Oui | Comparaison avec CR genere par l'IA |
| **Executing** | Rapport d'avancement | `progress-report` | Oui | Score + feedback + reference |
| **Monitoring** | Rapport d'etat | `status-report` | Oui | Score + feedback + reference |
| **Monitoring** | Demande de changement | `change-request` | Oui | Evaluation de l'analyse d'impact |
| **Closing** | Bilan de projet | `project-closure` | Oui | Score + feedback + reference |
| **Closing** | Lecons apprises | `lessons-learned` | Oui | Score + feedback + reference |
| **Closing** | PV de reception | `acceptance-record` | Oui | Score + feedback + reference |

### 6.3 Evaluation d'un livrable

```typescript
interface DeliverableEvaluation {
  score: number;                           // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  strengths: string[];                     // Points positifs
  weaknesses: string[];                    // Points a ameliorer
  missingElements: string[];               // Elements absents
  incorrectElements: string[];             // Erreurs factuelles
  referenceExample: string;                // Livrable de reference genere par l'IA
  recommendations: string[];               // Conseils pour ameliorer
  pmiAlignment: {                          // Alignement avec le standard PMI
    processId: string;                     // Ex: "4.1"
    expectedOutputs: string[];             // Sorties attendues selon le PMI
    coveredOutputs: string[];              // Sorties couvertes par le livrable
    missingOutputs: string[];              // Sorties manquantes
  };
  canRevise: boolean;                      // L'apprenant peut-il resoumettre ?
  maxRevisions: number;                    // Nombre max de re-soumissions
}
```

---

## 7. Systeme de Valorisation

### 7.1 Debriefing IA (fin de simulation)

Le PMO fait un bilan sans filtre :

> *"Tu es excellent en planification, mais tu perds tes moyens en reunion de crise. Travaille ton assurance."*

Le debriefing inclut :
- Score global et scores par competence
- Points forts demontres
- Axes d'amelioration prioritaires
- Comparaison avec le profil ideal
- Recommandations de formation

### 7.2 Portfolio de livrables

L'utilisateur peut telecharger un **pack** contenant tous les documents qu'il a lui-meme produits, estampilles **"Valide par ProjectSim360 (Standard PMI)"**.

Ce portfolio sert de preuve de travail pour les recruteurs et les formateurs.

```typescript
interface PortfolioExport {
  format: 'pdf' | 'zip';
  simulationId: string;
  documents: {
    type: DeliverableType;
    title: string;
    content: string;
    score: number;
    grade: string;
    phase: string;
  }[];
  certificate: {
    userName: string;
    simulationTitle: string;
    completedAt: Date;
    globalScore: number;
    competencies: { name: string; level: string; score: number }[];
  };
}
```

### 7.3 Badge de "Competence Verifiee"

Une attestation qui detaille precisement les situations gerees :

> "A gere avec succes un conflit fournisseur et un depassement budgetaire de 15%"

Le badge inclut :
- Competences validees avec contexte
- Score obtenu
- Duree de la simulation
- Difficulte du scenario

### 7.4 Optimisation CV post-simulation

L'IA suggere des modifications a apporter au vrai CV/LinkedIn de l'utilisateur pour refleter l'experience vecue en simulation.

**Pour les profils zero experience** : C'est l'etape la plus importante. L'IA dit : *"Tu n'avais pas d'experience, mais tu viens de gerer un projet de 3 mois simule en 4 heures. Tu as produit ces 5 documents. Voici comment nous allons les presenter sur ton CV."*

---

## 8. Administration du Referentiel

### 8.1 Gestion des documents de reference

Les admins peuvent gerer :

| Element | Description | Versionne |
|---------|-------------|-----------|
| Templates de livrables | Modeles vierges par type de livrable et par phase | Oui |
| Standards d'evaluation | Criteres de notation pour chaque type de livrable | Oui |
| Bonnes pratiques | Guides methodologiques par phase PMI | Oui |
| Exemples de reference | Livrables "parfaits" pour comparaison | Oui |
| Glossaire PMI | Definitions des termes pour les bulles d'aide | Oui |

### 8.2 Mise a jour continue

- Les modifications sont **immediatement disponibles** pour les nouvelles simulations
- Les simulations en cours ne sont pas impactees (snapshot au lancement)
- L'historique des versions est conserve

---

## 9. Modele de Donnees

### 9.1 Nouvelles tables Prisma

```prisma
// ==========================================
// PROFILING & GAP ANALYSIS
// ==========================================

model UserProfile {
  id              String   @id @default(uuid())
  userId          String   @unique
  linkedinData    Json?    // Donnees brutes LinkedIn
  cvData          Json?    // Donnees extraites du CV
  questionnaireData Json?  // Reponses au questionnaire
  profileType     String   @default("beginner") // 'zero-experience' | 'beginner' | 'reconversion' | 'reinforcement'
  gapAnalysis     Json?    // Resultat du diagnostic IA
  suggestedSector String?
  suggestedDifficulty String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  tenantId        String
}

// ==========================================
// LIVRABLES
// ==========================================

model DeliverableTemplate {
  id           String   @id @default(uuid())
  type         String   // 'project-charter' | 'wbs' | 'risk-register' | ...
  phase        String   // 'initiating' | 'planning' | 'executing' | 'monitoring' | 'closing'
  title        String
  description  String   @db.Text
  template     String   @db.Text    // Modele vierge (Markdown ou HTML)
  evaluationCriteria Json           // Criteres de notation
  referenceExample   String? @db.Text // Exemple de reference
  pmiProcessId String?              // Ex: "4.1", "5.5"
  difficulty   String   @default("standard") // 'discovery' | 'standard' | 'advanced'
  isActive     Boolean  @default(true)
  version      Int      @default(1)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  createdById  String
  tenantId     String
}

model Deliverable {
  id               String    @id @default(uuid())
  simulationId     String
  phaseId          String
  templateId       String?   // Lien vers le template utilise
  type             String    // 'project-charter' | 'meeting-minutes' | ...
  title            String
  content          String    @db.Text
  score            Float?
  grade            String?   // 'A' | 'B' | 'C' | 'D' | 'F'
  evaluation       Json?     // DeliverableEvaluation complet
  referenceExample String?   @db.Text
  status           String    @default("submitted") // 'draft' | 'submitted' | 'evaluated' | 'revised' | 'validated'
  revisionNumber   Int       @default(1)
  maxRevisions     Int       @default(3)
  submittedAt      DateTime  @default(now())
  evaluatedAt      DateTime?
  tenantId         String

  simulation       Simulation @relation(fields: [simulationId], references: [id])
}

// ==========================================
// DOCUMENTS DE REFERENCE (ADMIN)
// ==========================================

model ReferenceDocument {
  id          String   @id @default(uuid())
  title       String
  category    String   // 'template' | 'standard' | 'best-practice' | 'glossary'
  phase       String?  // Phase concernee (null = toutes phases)
  pmiProcessId String? // Processus PMI associe
  content     String   @db.Text
  version     Int      @default(1)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdById String
  tenantId    String
}

// ==========================================
// RECRUTEMENT
// ==========================================

model RecruitmentCampaign {
  id                 String   @id @default(uuid())
  title              String
  slug               String   @unique  // Pour le lien de recrutement
  companyInfo        Json     // { name, sector, size, description, culture }
  jobDescription     String?  @db.Text
  targetProfile      Json     // { minExperience, requiredSkills, projectTypes }
  evaluationCriteria Json     // { criteria: [], weights: {} }
  cultureModel       String   @default("collaborative") // 'strict' | 'agile' | 'collaborative'
  generatedScenarioId String? // Scenario genere automatiquement
  status             String   @default("active") // 'draft' | 'active' | 'closed' | 'archived'
  maxCandidates      Int?     // Limite optionnelle
  createdAt          DateTime @default(now())
  closedAt           DateTime?
  createdById        String
  tenantId           String

  candidates         CandidateResult[]
}

model CandidateResult {
  id                String    @id @default(uuid())
  campaignId        String
  userId            String
  simulationId      String
  status            String    @default("pending") // 'pending' | 'in-progress' | 'completed' | 'abandoned'
  startedAt         DateTime?
  completedAt       DateTime?
  abandonedAt       DateTime?
  abandonPhase      String?   // Phase ou le candidat a abandonne
  globalScore       Float?
  report360         Json?     // CandidateReport360 complet
  hardSkills        Json?
  softSkills        Json?
  reliabilityIndex  Float?
  adaptabilityScore Float?
  leadershipScore   Float?
  strengths         Json?
  weaknesses        Json?
  aiJustification   String?   @db.Text
  interviewGuide    Json?     // Questions d'entretien generees
  tenantId          String

  campaign          RecruitmentCampaign @relation(fields: [campaignId], references: [id])
}

// ==========================================
// BOITE MAIL SIMULEE
// ==========================================

model SimulatedEmail {
  id            String   @id @default(uuid())
  simulationId  String
  from          String   // Nom de l'expediteur fictif
  fromRole      String   // 'sponsor' | 'client' | 'team-member' | 'pmo' | 'supplier'
  subject       String
  body          String   @db.Text
  priority      String   @default("normal") // 'urgent' | 'high' | 'normal' | 'low'
  isRead        Boolean  @default(false)
  userResponse  String?  @db.Text
  responseScore Float?
  sentAt        DateTime @default(now())
  readAt        DateTime?
  respondedAt   DateTime?
  tenantId      String
}

// ==========================================
// VALORISATION
// ==========================================

model CompetencyBadge {
  id               String   @id @default(uuid())
  userId           String
  simulationId     String
  title            String   // Ex: "Gestion de conflit fournisseur"
  description      String   @db.Text // Ex: "A gere avec succes un conflit fournisseur et un depassement budgetaire de 15%"
  competencies     Json     // [{ name, level, score }]
  scenarioDifficulty String
  simulationDuration Int    // En minutes
  globalScore      Float
  issuedAt         DateTime @default(now())
  tenantId         String
}
```

---

## 10. API Endpoints

### 10.1 Profiling

```
POST   /api/v1/profile/import-linkedin
  Body: { linkedinUrl?: string, linkedinData?: object }
  Response: { profile: UserProfile }

POST   /api/v1/profile/upload-cv
  Body: FormData (fichier PDF)
  Response: { extractedData: CvData }

POST   /api/v1/profile/questionnaire
  Body: { answers: QuestionnaireAnswer[] }
  Response: { profile: UserProfile }

POST   /api/v1/profile/analyze
  Response: { gapAnalysis: GapAnalysis, suggestedScenarios: Scenario[] }

POST   /api/v1/profile/aptitude-test
  Body: { responses: AptitudeTestResponse[] }
  Response: { naturalSkills: NaturalSkillAssessment }
```

### 10.2 PMO (Agent IA)

```
POST   /api/v1/simulations/:id/pmo/chat
  Body: { message: string }
  Response: SSE stream (reponse du PMO en streaming)

GET    /api/v1/simulations/:id/pmo/context
  Response: { currentPhase, pendingDeliverables, nextActions, tips }

POST   /api/v1/simulations/:id/pmo/request-template
  Body: { deliverableType: string }
  Response: { template: DeliverableTemplate }
```

### 10.3 Livrables

```
GET    /api/v1/simulations/:id/deliverables
  Query: { phase?, status?, type? }
  Response: { deliverables: Deliverable[] }

POST   /api/v1/simulations/:id/deliverables
  Body: { phaseId: string, type: string, title: string, content: string }
  Response: { deliverable: Deliverable }

PUT    /api/v1/simulations/:id/deliverables/:deliverableId
  Body: { content: string }
  Response: { deliverable: Deliverable }

POST   /api/v1/simulations/:id/deliverables/:deliverableId/evaluate
  Response: SSE stream (evaluation en streaming)

POST   /api/v1/simulations/:id/deliverables/:deliverableId/revise
  Body: { content: string }
  Response: { deliverable: Deliverable }
```

### 10.4 Emails simules

```
GET    /api/v1/simulations/:id/emails
  Query: { isRead?, priority?, from? }
  Response: { emails: SimulatedEmail[] }

GET    /api/v1/simulations/:id/emails/:emailId
  Response: { email: SimulatedEmail }

POST   /api/v1/simulations/:id/emails/:emailId/respond
  Body: { response: string }
  Response: { score: number, feedback: string }
```

### 10.5 Recrutement

```
POST   /api/v1/recruitment/campaigns
  Body: { title, companyInfo, jobDescription?, targetProfile, evaluationCriteria, cultureModel }
  Response: { campaign: RecruitmentCampaign, recruitmentLink: string }

GET    /api/v1/recruitment/campaigns
  Query: { status? }
  Response: { campaigns: RecruitmentCampaign[] }

GET    /api/v1/recruitment/campaigns/:id
  Response: { campaign, stats: { total, completed, inProgress, abandoned } }

PUT    /api/v1/recruitment/campaigns/:id
  Body: { status?, targetProfile?, evaluationCriteria? }
  Response: { campaign: RecruitmentCampaign }

GET    /api/v1/recruitment/campaigns/:id/candidates
  Query: { status?, sortBy?, order? }
  Response: { candidates: CandidateResult[] }

GET    /api/v1/recruitment/campaigns/:id/candidates/:candidateId
  Response: { candidate: CandidateResult, report360: CandidateReport360 }

GET    /api/v1/recruitment/campaigns/:id/shortlist
  Query: { maxCandidates?: number }
  Response: { shortlist: CandidateResult[], aiAnalysis: string }

GET    /api/v1/recruitment/campaigns/:id/compare
  Query: { candidateIds: string[] }
  Response: { comparison: CandidateComparison }

GET    /api/v1/recruitment/campaigns/:id/candidates/:candidateId/interview-guide
  Response: { questions: InterviewQuestion[] }

// Point d'entree candidat (public)
GET    /api/v1/recruitment/join/:slug
  Response: { campaign: PublicCampaignInfo }

POST   /api/v1/recruitment/join/:slug/start
  Response: { simulationId: string, redirectUrl: string }
```

### 10.6 Valorisation

```
GET    /api/v1/simulations/:id/debriefing
  Response: { debriefing: Debriefing }

GET    /api/v1/simulations/:id/portfolio
  Query: { format: 'pdf' | 'zip' }
  Response: Fichier telecharge

GET    /api/v1/users/me/badges
  Response: { badges: CompetencyBadge[] }

GET    /api/v1/simulations/:id/cv-suggestions
  Response: { suggestions: CvSuggestion[] }
```

### 10.7 Administration du referentiel

```
GET    /api/v1/admin/deliverable-templates
  Query: { phase?, type?, difficulty?, isActive? }
  Response: { templates: DeliverableTemplate[] }

POST   /api/v1/admin/deliverable-templates
  Body: { type, phase, title, description, template, evaluationCriteria, referenceExample?, pmiProcessId?, difficulty? }
  Response: { template: DeliverableTemplate }

PUT    /api/v1/admin/deliverable-templates/:id
  Body: Partial<DeliverableTemplate>
  Response: { template: DeliverableTemplate }

DELETE /api/v1/admin/deliverable-templates/:id
  Response: { success: true }

GET    /api/v1/admin/reference-documents
  Query: { category?, phase?, isActive? }
  Response: { documents: ReferenceDocument[] }

POST   /api/v1/admin/reference-documents
  Body: { title, category, phase?, pmiProcessId?, content }
  Response: { document: ReferenceDocument }

PUT    /api/v1/admin/reference-documents/:id
  Body: Partial<ReferenceDocument>
  Response: { document: ReferenceDocument }

DELETE /api/v1/admin/reference-documents/:id
  Response: { success: true }
```

---

## 11. Pages Frontend

### 11.1 Parcours Apprenant

| Page | Route | Description |
|------|-------|-------------|
| Import LinkedIn | `/onboarding/profile-import` | Connexion OAuth LinkedIn ou upload CV |
| Questionnaire d'intention | `/onboarding/questionnaire` | Questions guidees par l'IA |
| Test d'aptitude (zero exp.) | `/onboarding/aptitude-test` | Mini-cas pratique de 5 min |
| Diagnostic / Gap Analysis | `/onboarding/diagnostic` | Resultats de l'analyse + choix du parcours |
| Choix du secteur / cas reel | `/onboarding/choose-path` | Accepter la suggestion ou personnaliser |
| Welcome Pack | `/simulation/:id/welcome` | Email de bienvenue + contexte entreprise |
| Intranet entreprise | `/simulation/:id/intranet` | Hub central de la simulation |
| Chat PMO | `/simulation/:id/pmo` | Conversation avec l'agent PMO |
| Boite mail simulee | `/simulation/:id/emails` | Liste des emails recus |
| Lecture email | `/simulation/:id/emails/:emailId` | Detail + reponse |
| Workspace planification | `/simulation/:id/planning` | Outil Gantt/Kanban integre |
| Redaction de livrable | `/simulation/:id/deliverables/new` | Editeur riche (Markdown) |
| Evaluation de livrable | `/simulation/:id/deliverables/:id/review` | Feedback PMO + exemple de reference |
| Liste des livrables | `/simulation/:id/deliverables` | Tous les livrables soumis |
| Soutenance finale | `/simulation/:id/closing/presentation` | Presentation devant le comite |
| Debriefing | `/simulation/:id/debriefing` | Bilan complet de fin de simulation |
| Portfolio | `/simulation/:id/portfolio` | Telechargement du pack de livrables |
| Badges | `/profile/badges` | Liste des badges obtenus |
| Suggestions CV | `/simulation/:id/cv-suggestions` | Recommandations pour le CV |

### 11.2 Parcours Recrutement

| Page | Route | Description |
|------|-------|-------------|
| Creation de campagne | `/recruitment/campaigns/new` | Formulaire de configuration |
| Liste des campagnes | `/recruitment/campaigns` | Vue d'ensemble des campagnes |
| Dashboard campagne | `/recruitment/campaigns/:id` | Stats + monitoring temps reel |
| Liste des candidats | `/recruitment/campaigns/:id/candidates` | Classement et filtres |
| Profil candidat | `/recruitment/campaigns/:id/candidates/:candidateId` | Rapport 360 detaille |
| Comparaison | `/recruitment/campaigns/:id/compare` | Comparaison cote a cote |
| Short-list IA | `/recruitment/campaigns/:id/shortlist` | Suggestions de l'IA |
| Guide d'entretien | `/recruitment/campaigns/:id/candidates/:candidateId/interview` | Questions generees |
| Lien candidat (public) | `/recruitment/join/:slug` | Page d'accueil pour le candidat |

### 11.3 Administration

| Page | Route | Description |
|------|-------|-------------|
| Templates de livrables | `/admin/deliverable-templates` | CRUD des modeles |
| Documents de reference | `/admin/reference-documents` | CRUD des documents |
| Glossaire PMI | `/admin/glossary` | Gestion des termes et definitions |

---

## 12. Plan d'Implementation

### Phase 1 — Fondations (Priorite haute)

| Fonctionnalite | Backend | Frontend | Dependances |
|----------------|---------|----------|-------------|
| Modele de donnees (migration Prisma) | Schema + migration | — | Aucune |
| Module Livrables (CRUD + soumission) | DeliverableModule | Pages de redaction/liste | Schema Prisma |
| Templates de livrables (admin) | DeliverableTemplateModule | Page CRUD admin | Schema Prisma |
| Documents de reference (admin) | ReferenceDocumentModule | Page CRUD admin | Schema Prisma |
| Agent PMO (chat IA) | PmoAiService | Page chat PMO | Documents de reference |
| Evaluation des livrables (IA) | DeliverableEvaluationService | Page review | PmoAiService |

### Phase 2 — Personnalisation du parcours

| Fonctionnalite | Backend | Frontend | Dependances |
|----------------|---------|----------|-------------|
| Upload et parsing CV | ProfileModule | Page upload | IA (extraction) |
| Questionnaire d'intention | ProfileModule | Page questionnaire | — |
| Diagnostic / Gap Analysis | ProfileAnalysisService (IA) | Page diagnostic | ProfileModule |
| Test d'aptitude (zero exp.) | AptitudeTestService | Page test | — |
| Generation scenario personnalise | ScenarioGeneratorService (IA) | Page choix parcours | Gap Analysis |
| Welcome Pack + immersion | SimulationBootstrapService | Pages welcome/intranet | Scenario genere |

### Phase 3 — Enrichissement de l'experience

| Fonctionnalite | Backend | Frontend | Dependances |
|----------------|---------|----------|-------------|
| Boite mail simulee | SimulatedEmailModule | Pages emails | Simulation active |
| Workspace planification (Gantt/Kanban) | PlanningModule | Page planning | Phase 1 |
| Soutenance finale | PresentationModule | Page soutenance | Agent PMO |
| Systeme de valorisation (debriefing, badges, portfolio) | ValorizationModule | Pages debriefing/badges/portfolio | Simulation terminee |
| Suggestions CV | CvSuggestionService (IA) | Page suggestions | Valorisation |

### Phase 4 — Module Recrutement

| Fonctionnalite | Backend | Frontend | Dependances |
|----------------|---------|----------|-------------|
| CRUD Campagnes | RecruitmentModule | Pages creation/liste/dashboard | Schema Prisma |
| Generation scenario recrutement | RecruitmentScenarioService (IA) | — | Moteur de scenarios |
| Lien candidat + onboarding | RecruitmentJoinService | Page publique candidat | Campagnes |
| Monitoring temps reel | WebSocket events | Dashboard campagne | Socket.io |
| Rapport 360 candidat | CandidateReportService (IA) | Page profil candidat | Simulation terminee |
| Ranking + Short-list IA | RankingService (IA) | Pages classement/shortlist | Rapports 360 |
| Comparaison de profils | ComparisonService (IA) | Page comparaison | Rapports 360 |
| Guide d'entretien | InterviewGuideService (IA) | Page guide | Rapports 360 |

### Modules NestJS a creer

| Module | Emplacement | Services |
|--------|-------------|----------|
| `ProfileModule` | `apps/api/src/modules/profile/` | ProfileService, ProfileAnalysisService |
| `DeliverableModule` | `apps/api/src/modules/deliverables/` | DeliverableService, DeliverableEvaluationService |
| `RecruitmentModule` | `apps/api/src/modules/recruitment/` | RecruitmentService, CandidateService, RankingService |
| `ReferenceDocumentModule` | `apps/api/src/modules/reference-documents/` | ReferenceDocumentService |
| `SimulatedEmailModule` | `apps/api/src/modules/simulated-emails/` | SimulatedEmailService |
| `ValorizationModule` | `apps/api/src/modules/valorization/` | PortfolioService, BadgeService, CvSuggestionService |
| `PmoAiService` | `apps/api/src/modules/ai/services/` | (ajout au AiModule existant) |
| `DeliverableAiService` | `apps/api/src/modules/ai/services/` | (ajout au AiModule existant) |
| `RecruitmentAiService` | `apps/api/src/modules/ai/services/` | (ajout au AiModule existant) |
