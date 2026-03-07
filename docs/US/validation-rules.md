# Regles de Validation — User Stories & Epics

> Ce document definit les criteres de validation pour chaque US et chaque epic.
> Aucune US ne peut etre consideree "done" sans avoir passe TOUTES les verifications listees.

---

## Processus de validation d'une US

### Etape 1 : Checklist technique
- [ ] Le code compile sans erreur (`pnpm build` passe)
- [ ] Le lint passe (`pnpm lint`)
- [ ] Les types sont corrects (`pnpm typecheck`)
- [ ] Les tests unitaires passent (`pnpm test`)

### Etape 2 : Test end-to-end (E2E)
- [ ] Le serveur API demarre et repond (`GET /health` → 200)
- [ ] L'endpoint backend repond correctement (test curl ou via Swagger)
- [ ] La page frontend s'affiche sans erreur console
- [ ] Le parcours utilisateur complet fonctionne (creation → lecture → modification → suppression si applicable)

### Etape 3 : Criteres d'acceptation
- [ ] Chaque critere d'acceptation de la US est verifie individuellement
- [ ] Les cas limites sont testes (champs vides, donnees invalides, acces non autorise)

### Etape 4 : Integration
- [ ] La fonctionnalite fonctionne avec les modules dependants existants
- [ ] Les donnees sont correctement isolees par tenant
- [ ] Les evenements domaine sont emis si applicable

---

## Validation par Epic

### EPIC 1 — Administration du Referentiel

**Pre-requis** : Docker up, DB migree, core build

| US | Tests de validation E2E |
|----|------------------------|
| US-1.1 | `POST /api/v1/admin/deliverable-templates` cree un template avec tous les champs (type, phase, titre, description, contenu Markdown, criteres JSON, processus PMI, difficulte). Verifier en DB. Verifier que la page admin affiche le formulaire et sauvegarde. |
| US-1.2 | `PUT /api/v1/admin/deliverable-templates/:id` met a jour un template. Le numero de version s'incremente. L'ancienne version reste accessible via `GET .../:id/versions`. |
| US-1.3 | `PATCH /api/v1/admin/deliverable-templates/:id` toggle actif/inactif. Un template inactif n'apparait pas dans les listes pour les simulations. Les simulations en cours ne sont pas impactees. |
| US-1.4 | `GET /api/v1/admin/deliverable-templates?phase=Planning&type=wbs&difficulty=standard` retourne les templates filtres. Le tableau frontend affiche les filtres et le tri fonctionne. |
| US-1.5 | `PUT /api/v1/admin/deliverable-templates/:id` avec champ `referenceExample` (Markdown). Verifier que l'exemple n'est PAS retourne quand un apprenant demande le template (endpoint apprenant). |
| US-1.6 | `POST /api/v1/admin/reference-documents` cree un document avec categorie, phase, processus PMI, contenu Markdown. Verifier les 4 categories (template, standard, best-practice, glossary). |
| US-1.7 | `PUT /api/v1/admin/reference-documents/:id` met a jour et incremente la version. Historique consultable. |
| US-1.8 | `GET /api/v1/admin/reference-documents?category=glossary&phase=Planning` retourne les documents filtres. Recherche textuelle sur le titre. |
| US-1.9 | Creer 3+ entrees glossary. Verifier que l'endpoint `GET /api/v1/reference-documents/glossary` les retourne (endpoint public pour le frontend tooltip). |

**Validation Epic 1 complete** :
- [ ] 9 US validees individuellement
- [ ] Un admin peut gerer templates ET documents via l'interface
- [ ] Un utilisateur non-admin recoit 403 sur les endpoints admin
- [ ] Les donnees sont isolees par tenant (un admin du tenant A ne voit pas les donnees du tenant B)

---

### EPIC 2 — Profiling et Analyse de l'Apprenant

**Pre-requis** : EPIC 1 (optionnel mais recommande)

| US | Tests de validation E2E |
|----|------------------------|
| US-2.1 | OAuth LinkedIn : redirection, callback, extraction des donnees, stockage dans `UserProfile.linkedinData`. Tester avec un profil prive (gestion d'erreur). |
| US-2.2 | Upload PDF via `POST /api/v1/profile/upload-cv`. L'IA extrait experiences/competences. Le feedback visuel affiche le nombre d'items detectes. Tester avec PDF > 5 Mo (rejet). |
| US-2.3 | `POST /api/v1/profile/questionnaire` sauvegarde les reponses. Les 4 questions sont presentes. Verifier le stockage dans `questionnaireData`. |
| US-2.4 | `POST /api/v1/profile/aptitude-test` — le mini-scenario est presente, les reponses sont evaluees par l'IA, le resultat est stocke dans le profil. |
| US-2.5 | `POST /api/v1/profile/analyze` retourne un diagnostic : profileType (zero-experience/beginner/reconversion/reinforcement), liste de competences avec niveaux, message personnalise, suggestion de secteur. |
| US-2.6 | La page frontend affiche les competences suggerees avec checkboxes. L'utilisateur peut modifier la selection et sauvegarder. |
| US-2.7 | Dropdown secteurs d'activite avec pre-selection IA. Le choix est sauvegarde et sera utilise pour la generation de scenario. |
| US-2.8 | Formulaire projet reel → l'IA genere un scenario base sur les infos saisies. Le scenario est previsualise avant validation. |

**Validation Epic 2 complete** :
- [ ] 8 US validees individuellement
- [ ] Parcours complet d'onboarding fonctionnel : import → questionnaire → diagnostic → choix
- [ ] Un utilisateur sans CV ni LinkedIn peut completer le profiling via questionnaire seul
- [ ] Le profileType est correctement determine et stocke

---

### EPIC 3 — Agent PMO (Mentor IA)

**Pre-requis** : EPIC 1 (templates + docs de reference)

| US | Tests de validation E2E |
|----|------------------------|
| US-3.1 | `POST /api/v1/simulations/:id/pmo/chat` en SSE streaming. Le message apparait en temps reel dans le frontend. L'historique est persistant (recharger la page → historique visible). |
| US-3.2 | Envoyer un message au PMO apres avoir soumis un livrable. Le PMO doit mentionner le livrable et son score. Changer de phase → le PMO connait la nouvelle phase. |
| US-3.3 | Le PMO liste les livrables en attente quand on le demande. Si un livrable est en retard, le PMO le rappelle proactivement. |
| US-3.4 | Ecrire "donne-moi le template de la charte de projet" → le PMO retourne le template. Le template est affichable et telechargeable dans le chat. |
| US-3.5 | Au lancement d'une simulation, l'agent RH presente l'entreprise automatiquement. Verifier le ton adapte a la culture (3 variantes). |
| US-3.6 | Apres l'accueil RH, le PMO presente le projet et les phases. Verifier que l'explication est coherente avec le scenario. |
| US-3.7 | Demander la liste des livrables attendus → liste structuree par phase avec echeances. Accessible via panneau lateral. |

**Validation Epic 3 complete** :
- [ ] 7 US validees individuellement
- [ ] Le PMO connait le contexte complet de la simulation a tout moment
- [ ] Le streaming fonctionne sans coupure
- [ ] L'historique de conversation est persistant entre sessions

---

### EPIC 4 — Systeme de Livrables

**Pre-requis** : EPIC 1 (templates), EPIC 3 (PMO pour evaluation)

| US | Tests de validation E2E |
|----|------------------------|
| US-4.1 | L'editeur Markdown s'ouvre, le preview est en temps reel, le brouillon se sauvegarde toutes les 30s (verifier en DB), l'indicateur de sauvegarde est visible. |
| US-4.2 | Cliquer "Soumettre" → confirmation → statut passe a "submitted" → evaluation IA se declenche → indicateur de chargement → resultat affiche. |
| US-4.3 | La liste affiche tous les livrables avec statut, score, filtre par phase/statut. Le badge "3/7 livrables valides" est correct. |
| US-4.4 | Pendant la redaction, le template est visible en panneau lateral (lecture seule). Le bouton copier fonctionne. |
| US-4.5 | L'evaluation affiche : score 0-100, note lettre, points positifs, points a ameliorer, elements manquants, recommandations. |
| US-4.6 | Apres evaluation, l'exemple de reference est visible en vue comparaison. Verifier qu'il n'est PAS visible avant soumission. |
| US-4.7 | L'evaluation montre les outputs PMI couverts vs attendus. Le lien avec le processus PMI est correct. |
| US-4.8 | Apres evaluation, le bouton "Reviser" est disponible. Le livrable repasse en edition. Le numero de revision s'incremente. Max revisions respecte (selon profil). |
| US-4.9 | Apres cloture d'une reunion → notification → redirection vers l'editeur pre-rempli (date, participants, sujet). Le CR auto-genere n'est PAS visible. |
| US-4.10 | Apres soumission du CR → vue comparaison cote a cote. Les differences sont mises en evidence. |

**Validation Epic 4 complete** :
- [ ] 10 US validees individuellement
- [ ] Cycle complet : rediger → sauvegarder → soumettre → recevoir evaluation → reviser → resoumettre
- [ ] Les scores sont coherents (un livrable vide obtient un score faible)
- [ ] La comparaison avec le reference fonctionne

---

### EPIC 5 — Immersion Narrative

**Pre-requis** : EPIC 3 (PMO), moteur de simulation

| US | Tests de validation E2E |
|----|------------------------|
| US-5.1 | Au lancement, la boite mail simulee contient un email de bienvenue du DRH. Le ton correspond a la culture. |
| US-5.2 | Le bandeau "Intranet" affiche nom d'entreprise, secteur, poste. Visible en permanence. |
| US-5.3 | Lancer 3 simulations avec cultures differentes → verifier que le ton du PMO et la severite changent. |
| US-5.4 | Des emails arrivent a des moments cles (debut de phase, apres evenement). Expediteurs varies (client, fournisseur, equipe). Priorites differentes. |
| US-5.5 | Lire un email → repondre → l'IA evalue la reponse. Le score est stocke. |
| US-5.6 | Plusieurs emails arrivent simultanement. L'ordre de traitement impacte les KPIs (verifier avant/apres). |
| US-5.7 | Reunion avec le Sponsor en phase d'initialisation. Si mauvaises questions → objectifs flous → impact sur KPIs en planning. |
| US-5.8 | Le client envoie une demande de changement. L'apprenant peut accepter/refuser. Impact mesurable sur les KPIs. |

**Validation Epic 5 complete** :
- [ ] 8 US validees individuellement
- [ ] La boite mail fonctionne comme un systeme d'emails realiste
- [ ] Les interactions ont un impact mesurable sur les KPIs
- [ ] L'immersion est coherente (pas de rupture de contexte)

---

### EPIC 6 — Adaptation par Profil

**Pre-requis** : EPIC 2 (profiling), EPIC 3 (PMO), EPIC 4 (livrables)

| US | Tests de validation E2E |
|----|------------------------|
| US-6.1 | En mode zero-exp : le PMO explique le "pourquoi" avant chaque livrable. En mode reinforcement : pas d'explication. |
| US-6.2 | Termes PMI detectes dans l'interface → tooltip au survol avec definition + exemple. Desactivable dans preferences. |
| US-6.3 | Zero-exp : apres une mauvaise decision, le Mentor propose un rollback (max 3). Reinforcement : pas de rollback. |
| US-6.4 | Zero-exp : les avatars posent des questions-guides. Profils avances : pas de questions pedagogiques. |
| US-6.5 | Zero-exp : 8-10 processus PMI actifs. Reinforcement : 20-25. Les processus inactifs sont masques. |
| US-6.6 | Tester les 4 tons PMO (patient, bienveillant, professionnel, exigeant) avec 4 profils differents. |
| US-6.7 | Zero-exp : 5 revisions max. Reinforcement : 1 revision max. Verifier que la limite est appliquee. |
| US-6.8 | Zero-exp : PMO intervient proactivement a chaque etape. Reinforcement : PMO silencieux sauf si sollicite. |

**Validation Epic 6 complete** :
- [ ] 8 US validees individuellement
- [ ] L'experience est significativement differente entre un profil zero-exp et reinforcement
- [ ] Les parametres sont coherents avec le profileType

---

### EPIC 7 — Valorisation et Certification

**Pre-requis** : EPIC 4 (livrables produits), EPIC 3 (PMO debriefing)

| US | Tests de validation E2E |
|----|------------------------|
| US-7.1 | `GET /simulations/:id/debriefing` retourne score global, scores par competence, points forts, axes amelioration. Le ton est direct. |
| US-7.2 | Le graphique radar affiche 6 axes avec scores. Visuellement correct. |
| US-7.3 | `GET /simulations/:id/portfolio?format=pdf` genere un PDF avec page de garde, sommaire, livrables + scores. Estampille "Valide par ProjectSim360". |
| US-7.4 | `GET /simulations/:id/portfolio?format=zip` genere un ZIP avec fichiers individuels + synthese. Noms explicites. |
| US-7.5 | Badge genere automatiquement a la completion. Texte specifique au vecu. Competences validees listees. |
| US-7.6 | Page `/profile/badges` affiche tous les badges avec details. Visuels attractifs. |
| US-7.7 | Bouton "Partager sur LinkedIn". Lien public `/badges/:id/verify` fonctionne (page publique). |
| US-7.8 | `GET /simulations/:id/cv-suggestions` retourne des suggestions concretes de lignes CV. Copiables. |
| US-7.9 | Pour un profil zero-exp : l'IA genere un brouillon de section CV. Message encourageant. |
| US-7.10 | Reunion "Comite de Direction" avec 3-4 agents IA. L'apprenant presente, le comite questionne. Evaluation de la soutenance. |
| US-7.11 | Formulaire lecons apprises : 3 questions. Evalue par le PMO comme un livrable. |

**Validation Epic 7 complete** :
- [ ] 11 US validees individuellement
- [ ] Le debriefing est coherent avec le parcours vecu
- [ ] Les exports PDF/ZIP sont valides et lisibles
- [ ] Les badges sont partageables

---

### EPIC 8 — Recrutement — Cote Recruteur

**Pre-requis** : Moteur de simulation, EPIC 2 (profiling)

| US | Tests de validation E2E |
|----|------------------------|
| US-8.1 | Inscription avec role RECRUITER. Tenant dedie. Acces aux fonctionnalites recrutement. |
| US-8.2 | `POST /recruitment/campaigns` cree une campagne avec tous les champs. Sauvegarde brouillon. |
| US-8.3 | Choix du temperament (3 options). Impact visible dans la simulation generee. |
| US-8.4 | Upload de fichiers PDF/DOCX (max 10 Mo, max 5). Verifier limite et warning anonymisation. |
| US-8.5 | Publication → scenario unique genere. Previsualisation disponible. |
| US-8.6 | Lien unique genere (`/recruitment/join/:slug`). Bouton copier. QR Code. |
| US-8.7 | `maxCandidates` respecte. Le lien affiche "Campagne complete" au quota. Notification a 80%. |
| US-8.8 | Fermer campagne → statut "closed" → lien affiche "terminee" → simulations en cours continuent. |
| US-8.9 | Dashboard temps reel : compteurs corrects, taux de completion, graphique evolution. WebSocket. |
| US-8.10 | Liste candidats avec tous les champs (nom, email, statut, phase, dates, score). Tri. Phase d'abandon. |
| US-8.11 | Liste campagnes avec statistiques. Filtres par statut. Actions fonctionnelles. |

**Validation Epic 8 complete** :
- [ ] 11 US validees individuellement
- [ ] Un recruteur peut creer, configurer, publier et monitorer une campagne complet
- [ ] Le lien de recrutement est fonctionnel et securise

---

### EPIC 9 — Recrutement — Cote Candidat

**Pre-requis** : EPIC 8 (campagne existante), EPIC 2 (profiling), moteur de simulation

| US | Tests de validation E2E |
|----|------------------------|
| US-9.1 | `GET /recruitment/join/:slug` affiche la page d'accueil (nom entreprise, description processus, duree, bouton commencer). Page publique sans auth. |
| US-9.2 | Inscription simplifiee → association automatique avec la campagne (via slug). Redirection vers profiling. |
| US-9.3 | Profiling accelere (LinkedIn OU 5 questions max). Pas de Gap Analysis visible pour le candidat. |
| US-9.4 | La simulation combine profil candidat + fiche de poste + culture. Duree ~1h. Meme moteur que le parcours apprenant. |
| US-9.5 | Ecran de fin : score global, message de remerciement, bouton debriefing, bouton compte complet. |

**Validation Epic 9 complete** :
- [ ] 5 US validees individuellement
- [ ] Un candidat peut completer le parcours complet (landing → inscription → profiling → simulation → resultats)
- [ ] Les resultats sont transmis au recruteur (visibles dans EPIC 8 monitoring)

---

### EPIC 10 — Recrutement — Analyse et Decision

**Pre-requis** : EPIC 8 + 9 (campagne avec candidats termines)

| US | Tests de validation E2E |
|----|------------------------|
| US-10.1 | `GET /recruitment/campaigns/:id/candidates/:candidateId` retourne le rapport 360 complet (hard skills, soft skills, fiabilite, adaptabilite, leadership). |
| US-10.2 | Vue synthetique : score global en gros, radar par dimension, 3 points forts + 3 faiblesses. |
| US-10.3 | Justification IA : texte 300-500 mots, exemples concrets tires de la simulation. |
| US-10.4 | `GET /recruitment/campaigns/:id/candidates` triable par score global ou competence. Filtres statut/score min. |
| US-10.5 | `GET /recruitment/campaigns/:id/shortlist?n=10` retourne N meilleurs avec justification. Vue dediee. |
| US-10.6 | Filtre par competence → classement re-trie dynamiquement. |
| US-10.7 | `GET /recruitment/campaigns/:id/compare?ids=A,B` retourne comparaison. Vue split screen. Differences cles soulignees. |
| US-10.8 | `GET /recruitment/campaigns/:id/candidates/:candidateId/interview-guide` retourne 5-10 questions personnalisees. Format exportable. |
| US-10.9 | Export PDF du rapport 360. Lien de partage securise avec expiration configurable. |
| US-10.10 | Pourcentage de match global. Ecarts par competence. Graphique superpose profil ideal vs profil candidat. |

**Validation Epic 10 complete** :
- [ ] 10 US validees individuellement
- [ ] Un recruteur peut analyser, comparer et selectionner des candidats de bout en bout
- [ ] Les rapports sont coherents avec les performances reelles en simulation
