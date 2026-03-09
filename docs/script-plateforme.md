# ProjectSim360 — Script Fonctionnel Complet

> Guide chronologique de la plateforme par profil utilisateur.
> Base sur les 10 EPICs (86 User Stories) et les scenarios de tests fonctionnels.

---

## Table des matieres

1. [Vue d'ensemble](#1-vue-densemble)
2. [Profil Administrateur (SUPER_ADMIN)](#2-profil-administrateur)
3. [Profil Apprenant (USER)](#3-profil-apprenant)
4. [Profil Recruteur (MANAGER)](#4-profil-recruteur)
5. [Interactions inter-profils](#5-interactions-inter-profils)
6. [Flux transverses](#6-flux-transverses)

---

## 1. Vue d'ensemble

### Qu'est-ce que ProjectSim360 ?

ProjectSim360 est une plateforme SaaS de **simulation de gestion de projet**. Elle plonge les utilisateurs dans des scenarios realistes ou ils doivent prendre des decisions, participer a des reunions virtuelles avec des participants IA, rediger des livrables professionnels, et gerer un projet de bout en bout. Un moteur IA evalue chaque action et fournit un retour pedagogique.

### Les 3 profils utilisateurs

| Profil | Role technique | Mission |
|--------|---------------|---------|
| **Administrateur** | SUPER_ADMIN | Configure le referentiel (templates, documents, glossaire) |
| **Apprenant** | USER | Vit la simulation, prend des decisions, produit des livrables |
| **Recruteur** | MANAGER | Cree des campagnes de recrutement, analyse les candidats via simulation |

### Les 5 phases d'une simulation (cycle PMI)

```
INITIATION → PLANNING → EXECUTION → MONITORING → CLOSURE
```

Chaque phase contient : des decisions a prendre, des reunions virtuelles, des livrables a produire, des evenements aleatoires a gerer, et des emails simules.

---

## 2. Profil Administrateur

> **EPIC 1 — Referentiel Administrateur** (9 US, toutes implementees)

L'administrateur prepare l'environnement avant que les apprenants ne commencent. Son travail est prerequis a tout le reste.

### 2.1. Connexion et acces

- Connexion via `/auth/sign-in` avec un compte SUPER_ADMIN
- Acces au menu **"Administration"** dans la sidebar
- Deux sous-menus : **Templates de livrables** et **Documents de reference**

### 2.2. Gestion des templates de livrables

> Routes : `/admin/deliverable-templates` et `/admin/deliverable-templates/new`

Les templates sont les modeles de documents que les apprenants devront remplir pendant la simulation (Charte de projet, WBS, Registre des risques, etc.).

**Fonctionnalites chronologiques :**

1. **Consulter la liste** — Tableau avec colonnes : Titre, Phase (badge colore), Difficulte (badge), Processus PMI, Statut (actif/inactif), Date
2. **Filtrer** — Par phase (INITIATION, PLANNING, EXECUTION, MONITORING, CLOSURE) et par difficulte (DISCOVERY, STANDARD, ADVANCED)
3. **Creer un template** — Formulaire Dialog avec :
   - Titre, phase, difficulte, processus PMI (ex: "4.1 - Elaborer la charte")
   - Contenu en **Markdown** avec des `{{placeholders}}` (projectName, userName, teamMembers, etc.)
   - Criteres d'evaluation (JSON) : sections avec poids, criteres avec maxPoints, passingScore
   - Exemple de reference (Markdown du livrable "parfait")
4. **Activer/Desactiver** — Toggle dans la liste, le template devient invisible pour les apprenants
5. **Versionner** — Chaque modification incremente la version, historique conserve

**Les 32 templates couvrent :**
- INITIATION (5) : Charte, Registre parties prenantes, Analyse faisabilite, Business case, Kick-off
- PLANNING (13) : Plan de management, WBS, Echeancier, Estimation couts, RACI, Communication, Risques, Approvisionnement, Qualite, Ressources, Reference perimetre, Gestion changements, Specs techniques
- EXECUTION (7) : Rapport avancement, Registre problemes, Journal changements, Rapport qualite, Gestion fournisseurs, Rapport equipe, Registre risques
- MONITORING (5) : Tableau de bord KPI, Rapport audit, Suivi budget, Suivi planning, Analyse ecarts
- CLOSURE (2) : Rapport cloture, Lecons apprises

### 2.3. Gestion des documents de reference

> Route : `/admin/reference-documents`

Les documents de reference sont des ressources pedagogiques (guides PMI, normes, tutoriels) que le PMO IA peut citer pour aider l'apprenant.

**Fonctionnalites :**

1. **Consulter la liste** — Titre, categorie (badge), format, taille, statut, date
2. **Creer un document** — Upload de fichier (PDF, DOCX) ou saisie de contenu texte, avec categorie et metadata
3. **Categoriser** — Par type : Guide PMI, Norme, Tutoriel, Template, Autre
4. **Activer/Desactiver** — Controle la visibilite dans le PMO
5. **Versionner** — Historique des modifications

### 2.4. Glossaire PMI

> Route : `/admin/glossary` (lecture seule pour les apprenants)

- Liste des termes PMI avec definition en francais
- Utilise par le systeme d'adaptation (EPIC 6) pour afficher des tooltips au survol

**Difference cle :**
- **Template de livrable** = modele a remplir par l'apprenant (action)
- **Document de reference** = ressource a consulter (lecture)

---

## 3. Profil Apprenant

> **EPICs 2, 3, 4, 5, 6, 7** — Le coeur de la plateforme

### 3.1. Inscription et Onboarding (EPIC 2)

> Route : `/onboarding` (wizard 5 etapes)

L'onboarding determine le **profil d'experience** de l'apprenant, ce qui adapte toute la simulation.

**Etape 1 — Upload CV** (optionnel)
- Upload d'un PDF
- Extraction automatique par IA : competences, experience, formations
- Alternative : saisie manuelle ou connexion LinkedIn

**Etape 2 — Questionnaire**
- Questions sur l'experience en gestion de projet
- Niveau d'experience : aucun, debutant, intermediaire, avance, expert
- Outils maitrises, certifications

**Etape 3 — Test d'aptitude**
- 3 mini-scenarios de gestion de projet
- Choix multiples avec justification
- Chaque reponse est evaluee par l'IA

**Etape 4 — Diagnostic IA**
- L'IA analyse les 3 etapes precedentes et genere un profil :
  - `ZERO_EXPERIENCE` — Aucune experience PM
  - `JUNIOR` — Quelques notions, peu de pratique
  - `INTERMEDIATE` — Experience moderee
  - `SENIOR` — Experience confirmee
  - `EXPERT` — Maitrise avancee
- Affiche forces, lacunes, et recommandations

**Etape 5 — Ajustements**
- L'apprenant peut ajouter/retirer des competences
- Choix du secteur de preference : IT, BTP, Hyper-croissance
- Possibilite de definir un projet custom

**Resultat** : Un `profileType` est attribue, qui influence tout le reste de l'experience.

### 3.2. Creation d'une simulation

> Route : `/simulations/new`

1. Choisir un scenario parmi les disponibles (ex: "Refonte e-commerce", "Construction batiment", "Lancement startup")
2. Le systeme genere automatiquement :
   - Un **Projet** avec budget, equipe, deadline
   - Les **5 phases** avec leurs decisions, reunions, livrables
   - Les **KPIs initiaux** : Budget 100%, Delais 100%, Qualite 100%, Moral 100%
3. Redirection vers `/simulations/:id` — le tableau de bord de la simulation

### 3.3. Tableau de bord simulation

> Route : `/simulations/:id`

Vue centrale avec :
- **KPIs en temps reel** : Budget (%), Delais (%), Qualite (%), Moral equipe (%)
- **Budget en EUR** : Montant utilise / Budget initial (synchronise avec le KPI Budget)
- **Phase en cours** avec progression
- **Actions disponibles** : Decisions a prendre, Reunions planifiees, Livrables a rediger
- **Timeline** des evenements passes

### 3.4. Agent PMO — Assistant IA (EPIC 3)

> Route : panneau lateral dans `/simulations/:id`

L'Agent PMO est un chatbot IA qui accompagne l'apprenant tout au long de la simulation.

**Fonctionnalites :**

1. **Chat en temps reel** (SSE streaming)
   - Messages de l'apprenant → reponse IA en streaming
   - Contexte riche : le PMO connait l'etat du projet, les KPIs, les decisions prises, les livrables

2. **Fournir des templates**
   - L'apprenant demande : "Donne-moi le template de la charte"
   - Le PMO retourne le template en bloc code Markdown avec bouton "Copier"

3. **Panneau contextuel** (sidebar droite)
   - KPIs actuels
   - Livrables en cours avec statut
   - Decisions recentes
   - Deadlines a venir

4. **Historique pagine**
   - Conversations precedentes consultables
   - Pagination pour ne pas surcharger

5. **Messages proactifs**
   - Le PMO envoie des messages automatiques a des moments cles :
     - Debut de phase : briefing sur les objectifs
     - Avant deadline : rappel
     - Apres decision : feedback

### 3.5. Adaptation par profil (EPIC 6)

Le comportement du PMO et de la plateforme s'adapte au `profileType` :

| Aspect | ZERO_EXPERIENCE | JUNIOR | INTERMEDIATE | SENIOR | EXPERT |
|--------|----------------|--------|-------------|--------|--------|
| **Ton PMO** | Coach patient, explique le "pourquoi" | Mentor guide | Collegue | Pair | Challenger |
| **Glossaire PMI** | Tooltips systematiques | Tooltips frequents | Tooltips occasionnels | Pas de tooltips | Termes avances |
| **Rollback decisions** | 5 rollbacks | 3 rollbacks | 2 rollbacks | 1 rollback | 0 rollback |
| **Reunions IA** | Questions pedagogiques | Validation | Discussion | Debate | Challenge |
| **Feedback livrables** | Ultra-detaille | Detaille | Standard | Concis | Critique |
| **Revisions max** | 5/livrable | 4/livrable | 3/livrable | 2/livrable | 1/livrable |

### 3.6. Prise de decisions

> Route : `/simulations/:id/decisions/:decisionId`

A chaque phase, des decisions strategiques se presentent :

1. **Presentation du contexte** — Situation, enjeux, contraintes
2. **Options disponibles** — 2 a 4 choix avec description
3. **Prise de decision** — Selection + justification optionnelle
4. **Impact immediat** — Les KPIs sont mis a jour en temps reel :
   - Budget +/- X%
   - Delais +/- X%
   - Qualite +/- X%
   - Moral +/- X%
5. **Feedback IA** — Analyse de la decision : pertinence, risques, alternatives
6. **Rollback** (si disponible) — Annuler la decision, restaurer les KPIs precedents (compteur limite par profil)

### 3.7. Evenements aleatoires

> Route : `/simulations/:id/events/:eventId`

Des evenements imprevus surviennent pendant la simulation :

- Depart d'un membre cle de l'equipe
- Changement de perimetre par le client
- Probleme technique majeur
- Budget coupe de 15%

**Processus :**
1. Notification de l'evenement
2. Choix d'une reponse parmi les options
3. Impact sur les KPIs
4. Feedback IA sur la reaction

### 3.8. Reunions virtuelles (EPIC 3 + Meetings)

> Route : `/simulations/:id/meetings/:meetingId`

Reunions avec des participants IA (avatars avec roles : Sponsor, Client, DBA, Architecte, etc.).

**Deroulement :**
1. **Briefing** — Ordre du jour, objectifs de la reunion
2. **Discussion** — Chat textuel avec les participants IA
   - Chaque participant a une personnalite et un role
   - Ils posent des questions, font des objections, proposent des solutions
   - Le niveau de difficulte s'adapte au profil
3. **Decisions en reunion** — Certaines decisions se prennent pendant la reunion
4. **Cloture** — Resume automatique genere par l'IA

### 3.9. Livrables (EPIC 4)

> Routes : `/simulations/:id/deliverables` et `/simulations/:id/deliverables/:id/edit`

Les livrables sont les documents que l'apprenant doit produire a chaque phase.

**Cycle de vie d'un livrable :**

```
DRAFT → SUBMITTED → EVALUATED → (REVISION_NEEDED | APPROVED)
         ↑                              |
         └──────────────────────────────┘
```

**Fonctionnalites detaillees :**

1. **Liste des livrables** — Tableau avec statut (badge colore), phase, date limite, score
2. **Editeur Markdown** — Vue split Editeur / Apercu
   - Template pre-rempli avec `{{placeholders}}` resolus (nom du projet, equipe, dates)
   - Auto-save periodique
   - Bouton "Copier le template" depuis le PMO
3. **Soumission** — Envoie le contenu pour evaluation IA
4. **Evaluation IA** — Analyse automatique qui retourne :
   - **Score global** (ex: 72/100) avec grade (A, B, C, D, F)
   - **Forces** — Ce qui est bien fait (liste)
   - **Lacunes** — Ce qui manque ou est insuffisant (liste)
   - **Suggestions** — Recommandations d'amelioration
   - **Score par section** — Selon les criteres du template (structure, contenu, conformite PMI)
5. **Exemple de reference** — L'apprenant peut consulter le "livrable parfait" pour comparer
6. **Alignement PMI** — Correspondance avec les processus PMI (ex: 4.1, 5.4)
7. **Revision** — Modifier et resoumettre (limite selon profil : 1 a 5 revisions)
8. **Compte-rendu de reunion** — Apres chaque reunion, l'apprenant redige un CR
   - Comparaison cote a cote : CR apprenant (bleu) vs CR IA (vert)
   - Score de completude

### 3.10. Immersion narrative — Emails simules (EPIC 5)

> Route : `/simulations/:id/emails`

Une boite de reception simulee avec des emails narratifs qui renforcent l'immersion.

**Types d'emails :**
- **Email de bienvenue** — Introduction au projet, presentation de l'equipe
- **Notifications de phase** — "La phase de Planning commence"
- **Alertes urgentes** — "Le client demande une reunion d'urgence"
- **Demandes de changement** — "Le sponsor veut ajouter une fonctionnalite"
- **Rapports d'equipe** — "L'equipe technique rencontre un blocage"

**Fonctionnalites :**
1. Inbox avec liste des emails (lu/non lu)
2. Detail de l'email avec expediteur, objet, contenu
3. Possibilite de **repondre** a certains emails (impact sur KPIs)
4. Systeme de **priorites** : certains emails sont urgents
5. Gestion de plusieurs emails simultanees

### 3.11. Progression et KPIs

Les KPIs evoluent en temps reel via Socket.io :
- **Budget** — % du budget restant → synchronise avec le montant EUR (`currentBudget = initialBudget * budget% / 100`)
- **Delais** — % de respect du planning
- **Qualite** — % de qualite des livrables et decisions
- **Moral equipe** — % de satisfaction de l'equipe

Chaque action impacte les KPIs : decisions, reponses aux evenements, qualite des livrables, reunions.

### 3.12. Valorisation (EPIC 7)

> Routes : `/simulations/:id/debriefing`, `/profile/portfolio`, `/profile/badges`

Apres la cloture de la simulation :

**Debriefing IA :**
1. **Score global** avec grand cercle de progression
2. **Radar chart** — 5 dimensions evaluees :
   - Hard Skills (maitrise PMI, planification, budget)
   - Soft Skills (communication, stress, negociation)
   - Fiabilite (respect engagements, coherence)
   - Adaptabilite (reaction changements, imprevus)
   - Leadership (prise de decision, gestion equipe)
3. **Analyse detaillee** — Texte IA de 300-500 mots avec exemples concrets
4. **Points forts** (3) et **Points d'amelioration** (3)

**Portfolio :**
- Document PDF telechargeble
- Contient : tous les livrables soumis, scores, KPIs finaux, radar, lecons apprises
- Section "Lecons apprises" redigee par l'apprenant

**Badges de competences :**
- Attribues automatiquement selon les performances
- Ex: "Expert Budget", "Communicateur", "Gestionnaire de crise"
- Visibles sur le profil

**Suggestions CV :**
- L'IA genere des suggestions pour enrichir le CV
- Adapte au profil : "Votre premier CV" pour ZERO_EXPERIENCE, "Enrichissement" pour les autres

**Partage :**
- Lien public vers le debriefing (lecture seule)
- Bouton "Partager sur LinkedIn"
- Page publique accessible sans authentification

---

## 4. Profil Recruteur

> **EPICs 8, 9, 10** — Recrutement par la simulation

### 4.1. Connexion et acces

- Connexion via `/auth/sign-in` avec un compte MANAGER
- Menu **"Recrutement"** dans la sidebar
- Acces au dashboard de recrutement

### 4.2. Creation d'une campagne (EPIC 8)

> Route : `/recruitment/campaigns/new` (wizard 5 etapes)

**Etape 1 — Informations generales**
- Titre de la campagne (ex: "Chef de Projet IT Senior")
- Poste cible (`jobTitle`)
- Description du poste

**Etape 2 — Competences requises**
- Selection de 3 a 10 competences
- Poids par competence (total = 100%)
- Ex: Gestion de projet 30%, Communication 20%, Budget 20%, Risques 15%, Leadership 15%

**Etape 3 — Culture d'entreprise**
- Choix parmi : AGILE, WATERFALL, HYBRID, STARTUP
- Influence le ton du PMO et les scenarios

**Etape 4 — Configuration**
- Nombre max de candidats
- Duree de la campagne
- Upload de documents complementaires (PDF)

**Etape 5 — Generation du scenario**
- L'IA genere un scenario de simulation adapte au poste
- Base sur les competences requises et la culture
- Le recruteur peut ajuster avant validation

### 4.3. Publication et partage

1. **Publier la campagne** — Passe de DRAFT a ACTIVE
2. **Lien de recrutement** — URL unique generee : `/recruitment/join/:slug`
3. **Partage** — Copier le lien pour l'envoyer aux candidats
4. **Page publique** — Les candidats voient :
   - Nom de l'entreprise
   - Titre du poste
   - Description du processus
   - 3 cards : Decisions strategiques, Reunions virtuelles, Livrables professionnels
   - Duree estimee : ~1 heure
   - Bouton "Commencer l'evaluation"

### 4.4. Monitoring en temps reel

> Route : `/recruitment/campaigns/:id` (onglets Dashboard, Candidats)

**Dashboard KPI (6 cards) :**
| Card | Description |
|------|------------|
| Total | Nombre total de candidats inscrits |
| En attente | Candidats PENDING (inscrits, pas commence) |
| En cours | Candidats IN_PROGRESS (simulation en cours) |
| Termines | Candidats COMPLETED |
| Abandonnes | Candidats DROPPED (avec phase d'abandon) |
| Score moyen | Moyenne des scores des candidats termines |

**Tableau des candidats :**
- Colonnes : Nom, Email, Statut (badge), Phase en cours, Score, Match (%), Date debut/fin
- Lignes cliquables vers le rapport 360
- Tri par competence : Score global, Hard Skills, Soft Skills, Fiabilite, Adaptabilite, Leadership
- Barre de progression globale

**Liste des campagnes :**
- Tableau avec : Titre, Poste, Statut (DRAFT/ACTIVE/CLOSED/ARCHIVED), Candidats (count), Termines, Score moyen, Date
- Filtres par statut

### 4.5. Cote candidat (EPIC 9)

Le candidat suit un parcours simplifie :

1. **Page publique** — Ouvre le lien `/recruitment/join/:slug`
2. **Inscription/Connexion** — Cree un compte ou se connecte
3. **Profiling accelere** — 5 questions maximum (pas l'onboarding complet)
4. **Simulation calibree** — ~1 heure, scenario genere par le recruteur
5. **Ecran final** — Score global, remerciement, option debriefing simplifie

**Cas limites :**
- Campagne fermee → Message "Cette campagne est terminee"
- Campagne complete → Message "Nombre maximum de candidats atteint"

### 4.6. Analyse et decision (EPIC 10)

> Routes : rapport, shortlist, comparaison, guide entretien

**Rapport 360 d'un candidat :**
- Score global (cercle : ex 78/100)
- 5 dimensions avec score individuel (Hard Skills, Soft Skills, Fiabilite, Adaptabilite, Leadership)
- Radar chart
- 3 points forts + 3 points faibles
- Pourcentage de match avec le poste
- Analyse IA detaillee (300-500 mots) avec exemples tires de la simulation

**Shortlist automatique :**
- L'IA classe les candidats par score decroissant
- Header : "Sur X candidats, voici les Y que nous recommandons"
- Chaque candidat : position, nom, score, justification IA courte

**Comparaison cote a cote :**
- Selectionner 2 candidats
- Vue split : Candidat A (gauche) | Candidat B (droite)
- Radar charts superposes
- Barres de comparaison par competence
- Analyse IA des differences + recommandation

**Guide d'entretien IA :**
- 5 a 10 questions personnalisees basees sur la simulation
- Chaque question avec :
  - La question elle-meme (contextualisee)
  - Le contexte (situation de la simulation)
  - L'insight attendu (ce qu'on cherche a evaluer)
- Bouton "Imprimer"

**Adequation poste vs candidat (Gap Analysis) :**
- Match global (%) avec grand cercle
- Tableau par competence : niveau requis vs niveau demontre vs ecart
- Barres de progression duales (bleue = requis, verte/rouge = demontre)
- Code couleur : vert si >= requis, rouge si < requis

**Partage du rapport :**
- Generation d'un lien securise avec duree limitee (24h, 7j, 30j)
- Acces en lecture seule

### 4.7. Cycle de vie d'une campagne

```
DRAFT → ACTIVE → CLOSED → ARCHIVED
  |        |        |
  |        |        └─ Lien public : "Campagne terminee"
  |        └─ Candidats peuvent s'inscrire
  └─ Configuration en cours
```

---

## 5. Interactions inter-profils

### Admin → Apprenant
- L'admin cree les **templates** → l'apprenant les remplit
- L'admin publie les **documents de reference** → le PMO les cite
- L'admin maintient le **glossaire** → les tooltips s'affichent pour l'apprenant

### Recruteur → Candidat (Apprenant)
- Le recruteur cree une **campagne** → le candidat recoit le lien
- Le recruteur configure les **competences evaluees** → la simulation est calibree
- Le recruteur genere le **scenario IA** → le candidat le vit
- Le candidat termine → le recruteur analyse le **rapport 360**

### Systeme IA — Role transversal
L'IA intervient a tous les niveaux :
| Fonction | Description |
|----------|------------|
| **PMO Chat** | Accompagnement en temps reel pendant la simulation |
| **Evaluation livrables** | Notation automatique avec feedback detaille |
| **Participants reunions** | Avatars IA avec personnalites distinctes |
| **Feedback decisions** | Analyse de pertinence apres chaque decision |
| **Evenements aleatoires** | Generation d'evenements contextuels |
| **Debriefing** | Rapport complet post-simulation |
| **Generation scenario** | Creation de scenarios pour le recrutement |
| **Rapport 360** | Analyse multi-dimensionnelle du candidat |
| **Guide entretien** | Questions personnalisees pour le recruteur |
| **Profiling** | Diagnostic du niveau d'experience |

---

## 6. Flux transverses

### 6.1. Parcours complet Apprenant (EPICs 2→3→4→5→6→7)

```
Inscription → Onboarding (CV, questionnaire, test, diagnostic, ajustements)
    ↓
Creation simulation → Choix scenario → Generation projet
    ↓
Phase INITIATION
  ├─ Email de bienvenue
  ├─ Chat PMO (briefing, templates)
  ├─ Decisions de phase
  ├─ Reunion kick-off
  └─ Livrables : Charte, Registre parties prenantes
    ↓
Phase PLANNING
  ├─ Nouveaux emails
  ├─ Decisions (possibilite rollback)
  ├─ Reunions avec questions adaptees au profil
  ├─ Livrables : WBS, Plan risques, Echeancier, RACI, etc.
  └─ CR de reunion (comparaison avec IA)
    ↓
Phase EXECUTION
  ├─ Evenements aleatoires (depart equipe, changement perimetre)
  ├─ Emails urgents avec priorites
  ├─ Decisions sous pression
  ├─ Demandes de changement
  └─ Livrables : Rapports avancement, Journal changements
    ↓
Phase MONITORING
  ├─ Suivi KPIs detaille
  ├─ Audits
  ├─ Ajustements de trajectoire
  └─ Livrables : Tableau de bord, Analyse ecarts
    ↓
Phase CLOSURE
  ├─ Presentation finale
  ├─ Lecons apprises
  └─ Livrables : Rapport cloture, Lessons learned
    ↓
Valorisation
  ├─ Debriefing IA (score, radar, analyse)
  ├─ Portfolio PDF
  ├─ Badges competences
  ├─ Suggestions CV
  └─ Partage LinkedIn
```

### 6.2. Parcours complet Recruteur + Candidat (EPICs 8→9→10)

```
[RECRUTEUR] Creation campagne (wizard 5 etapes)
    ↓
[RECRUTEUR] Generation scenario IA → Publication → Copie lien
    ↓
[CANDIDAT] Ouvre lien public → Inscription → Profiling accelere
    ↓
[CANDIDAT] Simulation calibree (~1h) → Score final
    ↓
[RECRUTEUR] Dashboard : suivi temps reel des candidats
    ↓
[RECRUTEUR] Rapport 360 par candidat (radar, forces/faiblesses, match)
    ↓
[RECRUTEUR] Shortlist IA → Tri par competence
    ↓
[RECRUTEUR] Comparaison 2 candidats cote a cote
    ↓
[RECRUTEUR] Guide d'entretien personnalise
    ↓
[RECRUTEUR] Partage rapport → Cloture campagne
```

### 6.3. Moteur de KPIs — Comment ca fonctionne

Les KPIs sont le fil conducteur de toute la simulation :

1. **Initialisation** — Budget 100%, Delais 100%, Qualite 100%, Moral 100%
2. **3 points de mutation** :
   - `makeDecision` — Chaque decision modifie les KPIs (+/- X%)
   - `respondToEvent` — Chaque reponse a un evenement modifie les KPIs
   - `rollbackDecision` — Annuler restaure les KPIs precedents
3. **Synchronisation** — Le budget EUR est recalcule : `currentBudget = initialBudget * (budget% / 100)`
4. **Temps reel** — Les KPIs sont emis via Socket.io, le frontend se met a jour instantanement
5. **Snapshots** — Un historique des KPIs est conserve pour le debriefing

---

> **Total : 10 EPICs, 86 User Stories, 64 cas de test, 2 scenarios transverses, 3 profils utilisateurs, 32 templates de livrables, 5 phases PMI.**
