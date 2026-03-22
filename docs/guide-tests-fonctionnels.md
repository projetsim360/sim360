# Guide de tests fonctionnels — ProjectSim360

> Ce guide couvre toutes les fonctionnalites implementees dans les 4 phases du plan d'implementation.
> Date de creation : 2026-03-22

---

## Prerequis

### Infrastructure
```bash
docker compose up -d          # PostgreSQL, Redis, MailHog, pgAdmin
pnpm db:push                  # Sync schema
pnpm db:seed                  # Seed avec 3 scenarios (2 Greenfield + 1 Brownfield)
pnpm --filter @sim360/core build
pnpm --filter @sim360/api dev
pnpm --filter @sim360/webapp dev
```

### Comptes de test
| Email | Mot de passe | Role | Notes |
|-------|-------------|------|-------|
| `admin@sim360.dev` | `Admin123!` | SUPER_ADMIN | Acces complet |
| `user@sim360.dev` | `User123!` | MEMBER | Apprenant standard (2FA active) |
| `recruiter@sim360.dev` | `Recruiter123!` | MANAGER | Recruteur |

### URLs
| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API | http://localhost:3001 |
| Swagger | http://localhost:3001/api/docs |
| MailHog | http://localhost:8025 |
| pgAdmin | http://localhost:5050 |
| Prisma Studio | `pnpm db:studio` |

### Obtenir un token JWT (pour les tests curl)
```bash
TOKEN=$(printf '{"email":"admin@sim360.dev","password":"Admin123!"}' | \
  curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H 'Content-Type: application/json' -d @- | \
  python3 -c "import sys,json; print(json.load(sys.stdin).get('tokens',{}).get('accessToken',''))")
echo $TOKEN
```

---

## Phase 1 — Fondations

### 1.1 Scenario Brownfield (Reprise de projet)

#### Frontend
| # | Action | Resultat attendu | URL |
|---|--------|------------------|-----|
| 1 | Naviguer vers "Nouvelle simulation" | Page avec onglets Catalogue / Generer | `/simulations/new` |
| 2 | Voir le scenario "Reprise d'un projet ERP en difficulte" | Badge "Reprise" amber visible sur la card | `/simulations/new` |
| 3 | Cliquer sur le scenario Brownfield | Modal s'ouvre avec detail complet | — |
| 4 | Verifier le panneau "Contexte de reprise" dans la modal | 4 stats (15j retard, 65% budget, 4 risques, Moral bas) + notes du precedent CP + liste risques | — |
| 5 | Verifier les phases | Phases 1-2 barrees ("Termine"), phase 3 surlignee ("Depart") | — |
| 6 | Cliquer "Lancer la simulation" | Redirection vers `/simulations/{id}`, statut ONBOARDING | — |
| 7 | Verifier les KPIs de depart | Budget ~35%, Delai ~85%, Risque eleve (degredes par brownfield context) | `/simulations/{id}` |

#### API
```bash
# Lister les scenarios Brownfield uniquement
curl -s "http://localhost:3001/api/v1/scenarios?scenarioType=BROWNFIELD" \
  -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d), 'scenarios Brownfield')"

# Creer une simulation Brownfield (depart phase 2)
curl -s -X POST http://localhost:3001/api/v1/simulations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"scenarioId":"seed-scenario-brownfield-erp","startingPhaseOrder":2}' | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print('Status:', d.get('status'), '| Phase:', d.get('currentPhaseOrder'))"
# Attendu: Status: ONBOARDING | Phase: 2

# Verifier les phases completees historiques
curl -s "http://localhost:3001/api/v1/simulations/{SIM_ID}" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); [print(f\"Phase {p['order']}: {p['status']}\") for p in d.get('phases',[])]"
# Attendu: Phase 0: COMPLETED, Phase 1: COMPLETED, Phase 2: ACTIVE, Phase 3: LOCKED, Phase 4: LOCKED
```

---

### 1.2 Livrables Metiers (Delegation & Approbation)

#### Frontend
| # | Action | Resultat attendu | URL |
|---|--------|------------------|-----|
| 1 | Ouvrir les livrables d'une simulation en cours | Liste avec onglets "Tous / Mes livrables / Delegues / En approbation" | `/simulations/{id}/deliverables` |
| 2 | Cliquer "Assigner a un expert" sur un livrable DRAFT | Dialog avec liste des membres d'equipe (avatar, nom, role, expertise, personnalite) | — |
| 3 | Selectionner un expert + ajouter des instructions | Le livrable passe en status DELEGATED, contenu genere par l'IA avec le persona de l'expert | — |
| 4 | Verifier le contenu genere | Le contenu Markdown reflette le style de l'expert (cooperatif = detaille, resistant = succinct) | — |
| 5 | Demander une revision | Bouton "Demander revision" + feedback → l'IA regenere en tenant compte du feedback | — |
| 6 | Soumettre pour evaluation IA | Score + grade + feedback detaille | — |
| 7 | Definir chaine d'approbation | Selectionner Sponsor + Client comme reviewers | — |
| 8 | Soumettre pour approbation | Status passe en PENDING_APPROVAL, IA reviewer evalue sequentiellement | — |
| 9 | Verifier la timeline d'approbation | Dots vert/rouge/gris avec commentaires des reviewers | — |
| 10 | Resultat final | VALIDATED (tous approuves) ou REJECTED (au moins un rejet avec motif) | — |

#### API
```bash
# Assigner un livrable a un expert
curl -s -X POST "http://localhost:3001/api/v1/simulations/{SIM_ID}/deliverables/{DEL_ID}/assign" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"teamMemberId":"{MEMBER_ID}","instructions":"Inclure les risques identifies"}' | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print('Type:', d.get('delegationType'), '| Assigne a:', d.get('assignedToRole'))"

# Definir chaine d'approbation
curl -s -X POST "http://localhost:3001/api/v1/simulations/{SIM_ID}/deliverables/{DEL_ID}/approval-chain" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"chain":[{"role":"SPONSOR","memberId":"{MEMBER_ID}"}]}'

# Soumettre pour approbation
curl -s -X POST "http://localhost:3001/api/v1/simulations/{SIM_ID}/deliverables/{DEL_ID}/submit-approval" \
  -H "Authorization: Bearer $TOKEN"

# Verifier le statut d'approbation
curl -s "http://localhost:3001/api/v1/simulations/{SIM_ID}/deliverables/{DEL_ID}/approval-status" \
  -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json; print(json.dumps(json.load(sys.stdin), indent=2, ensure_ascii=False))"
```

---

### 1.3 Reunion de Passation (Onboarding)

#### Frontend
| # | Action | Resultat attendu | URL |
|---|--------|------------------|-----|
| 1 | Lancer une nouvelle simulation | Statut ONBOARDING, HandoverBanner affiche avec 3 etapes (HR → PMO → Projet) | `/simulations/{id}` |
| 2 | Verifier le blocage | Boutons Emails/Livrables masques, KPIs/decisions/timeline masques, seul le banner est visible | — |
| 3 | Cliquer "Commencer l'accueil RH" | Redirection vers le meeting HANDOVER_HR avec Claire Dumont (DRH) + Maxime Roche (Office Manager) | `/meetings/{id}` |
| 4 | Verifier la personnalite du RH | L'agent presente la culture d'entreprise adaptee au secteur du scenario | — |
| 5 | Demarrer et discuter | Poser des questions sur la culture, les outils, les horaires → reponses coherentes | — |
| 6 | Completer le meeting RH | Retour sur simulation, etape RH cochee vert, etape PMO active | `/simulations/{id}` |
| 7 | Cliquer "Commencer la passation PMO" | Meeting avec Alexandre Bertrand (PMO), objectifs PMBOK | `/meetings/{id}` |
| 8 | Verifier le briefing PMO Brownfield | Le PMO mentionne les retards, risques actifs, budget consomme, actions urgentes | — |
| 9 | Completer le meeting PMO | Retour sur simulation, banner affiche "Passation terminee" avec bouton "Commencer le projet" | — |
| 10 | Cliquer "Commencer le projet" | Transition ONBOARDING → IN_PROGRESS, KPIs/decisions/timeline apparaissent | — |

#### API
```bash
# Verifier le statut de passation
curl -s "http://localhost:3001/api/v1/simulations/{SIM_ID}/handover" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print('Step:', d['currentStep'], '| Complete:', d['isComplete'])"

# Finaliser la passation
curl -s -X POST "http://localhost:3001/api/v1/simulations/{SIM_ID}/handover/complete" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Phase 2 — IA & Scenarios

### 2.1 Generation IA de scenario

#### Frontend
| # | Action | Resultat attendu | URL |
|---|--------|------------------|-----|
| 1 | Onglet "Generer avec l'IA" | Formulaire avec secteur, difficulte, type, profil, description, objectifs, contraintes | `/simulations/new` |
| 2 | Remplir : secteur IT, difficulte Avance, nom "Migration Cloud" | Champs remplis | — |
| 3 | Cocher "Utiliser mon profil" | Le scenario sera calibre selon le profil utilisateur | — |
| 4 | Cliquer "Generer le scenario" | Spinner pendant ~15-30s, puis modal s'ouvre avec le scenario genere | — |
| 5 | Verifier le scenario genere | Titre coherent, 5 phases, equipe de 5-7 membres, objectifs, competences | — |
| 6 | Badge "Genere par l'IA" | Visible dans la modal + info bleue "adapte a votre profil" | — |
| 7 | Cliquer "Lancer la simulation" | Simulation creee et redirection | — |

#### API
```bash
# Generer un scenario
printf '{"sector":"IT","difficulty":"BEGINNER","scenarioType":"GREENFIELD","projectName":"App mobile"}' | \
  curl -s -X POST http://localhost:3001/api/v1/scenarios/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" -d @- | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print('ID:', d.get('id'), '| Title:', d.get('title'), '| Phases:', len(d.get('phases',[])))"
# Attendu: ID: xxx | Title: xxx | Phases: 5

# Scenarios recommandes
curl -s "http://localhost:3001/api/v1/scenarios/recommended?limit=3" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d), 'scenarios recommandes')"
```

### 2.2 Greenfield mandat brut

#### Frontend / API
| # | Action | Resultat attendu |
|---|--------|------------------|
| 1 | Generer un scenario Greenfield sans template pre-rempli | Scenario cree avec equipe generee par l'IA |
| 2 | Lancer la simulation | Un livrable "Charte de projet" cree automatiquement en DRAFT |
| 3 | Suggerer des parties prenantes | Appel IA retourne 5-7 suggestions avec rationale |
| 4 | Appliquer les parties prenantes | Membres crees dans le projet |

```bash
# Suggerer des parties prenantes
curl -s -X POST "http://localhost:3001/api/v1/simulations/{SIM_ID}/stakeholders/suggest" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"charterContent":"Projet de migration cloud pour 500 utilisateurs"}' | \
  python3 -c "import sys,json; d=json.load(sys.stdin); [print(f\"  {s['name']} - {s['role']} ({s['expertise']})\") for s in d]"

# Appliquer
curl -s -X POST "http://localhost:3001/api/v1/simulations/{SIM_ID}/stakeholders/apply" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"stakeholders":[{"name":"Sophie Martin","role":"Architecte Cloud","expertise":"SENIOR","personality":"COOPERATIVE"}]}'
```

### 2.3 Email de bienvenue PMBOK

| # | Action | Resultat attendu |
|---|--------|------------------|
| 1 | Lancer une simulation | Email de bienvenue auto-genere dans la boite simulee |
| 2 | Ouvrir l'email | Contenu enrichi avec 7 sections : Bienvenue, Methodologie PMBOK, Gouvernance, Procedures, Outils, Contacts, Prochaines etapes |
| 3 | Si Brownfield | Section supplementaire "Etat actuel du projet" avec retards, budget, risques |

```bash
# Verifier les emails de la simulation
curl -s "http://localhost:3001/api/v1/simulations/{SIM_ID}/emails" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); [print(f\"  [{e['priority']}] {e['senderName']}: {e['subject']}\") for e in d.get('data',d)]"
```

---

## Phase 3 — Premium & Export

### 3.1 Module Mentorat

#### Frontend
| # | Action | Resultat attendu | URL |
|---|--------|------------------|-----|
| 1 | Promouvoir un user en MENTOR | Via Prisma Studio : table users → role = MENTOR | `pnpm db:studio` |
| 2 | Se connecter avec le compte MENTOR | Menu "Mentorat" visible dans la sidebar | — |
| 3 | Naviguer vers "/mentoring" | Dashboard avec 3 stats (reviews en attente, sessions actives, sessions terminees) | `/mentoring` |
| 4 | Voir les evaluations en attente | Liste des evaluations sans review mentor | — |
| 5 | Creer une review | Formulaire : score humain (0-100), leadership, diplomatie, posture, feedback, recommandations | — |

#### API
```bash
# Creer une review mentor
printf '{"evaluationId":"{EVAL_ID}","humanScore":85,"leadershipScore":75,"diplomacyScore":80,"postureScore":70,"feedback":"Bon travail, posture a ameliorer","recommendations":"Travailler la communication en reunion de crise"}' | \
  curl -s -X POST http://localhost:3001/api/v1/mentoring/reviews \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" -d @-

# Creer une session de mentorat
printf '{"simulationId":"{SIM_ID}","learnerId":"{USER_ID}","type":"DEBRIEFING"}' | \
  curl -s -X POST http://localhost:3001/api/v1/mentoring/sessions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" -d @-

# Lister mes sessions
curl -s http://localhost:3001/api/v1/mentoring/sessions \
  -H "Authorization: Bearer $TOKEN"

# Envoyer un message dans une session
printf '{"content":"Comment avez-vous gere le conflit avec le Sponsor ?"}' | \
  curl -s -X POST "http://localhost:3001/api/v1/mentoring/sessions/{SESSION_ID}/messages" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" -d @-
```

### 3.2 Portfolio PDF/ZIP Export

| # | Action | Resultat attendu | URL |
|---|--------|------------------|-----|
| 1 | Ouvrir le portfolio d'une simulation | Page avec livrables, scores, slider filtre | `/simulations/{id}/portfolio` |
| 2 | Cliquer "Exporter PDF" | Telechargement d'un fichier HTML avec resume (plan STARTER+ requis) | — |
| 3 | Cliquer "Exporter ZIP" | Telechargement ZIP avec resume + livrables en Markdown (plan PRO+ requis) | — |
| 4 | Filtrer par score minimum | Slider pour filtrer les livrables >= score choisi | — |

```bash
# Exporter PDF
curl -s "http://localhost:3001/api/v1/simulations/{SIM_ID}/portfolio/export/pdf" \
  -H "Authorization: Bearer $TOKEN" -o portfolio.html
# Attendu: fichier HTML avec styles inline, stats, livrables

# Exporter ZIP
curl -s "http://localhost:3001/api/v1/simulations/{SIM_ID}/portfolio/export/zip" \
  -H "Authorization: Bearer $TOKEN" -o portfolio.zip
# Attendu: archive ZIP avec portfolio-summary.html + livrables/*.md

# Meilleurs livrables (score >= 80)
curl -s "http://localhost:3001/api/v1/simulations/{SIM_ID}/portfolio/best?minScore=80" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(d['totalFiltered'], 'livrables >= ', d['minScore'])"
```

### 3.3 Feature Gating par Plan

| # | Test | Resultat attendu |
|---|------|------------------|
| 1 | Tenant plan FREE → appeler `/portfolio/export/pdf` | `403 Forbidden` : "necessite le plan STARTER ou superieur" |
| 2 | Tenant plan FREE → appeler `/portfolio/export/zip` | `403 Forbidden` : "necessite le plan PRO ou superieur" |
| 3 | Tenant plan ENTERPRISE → memes appels | `200 OK` : fichiers telecharges |
| 4 | Frontend : composant PremiumGate | Overlay flou avec badge plan + bouton "Mettre a niveau" |

```bash
# Modifier le plan du tenant pour tester (via Prisma Studio ou SQL)
# UPDATE tenants SET plan = 'FREE' WHERE slug = 'sim360-dev';
# Puis retester les exports → 403
# UPDATE tenants SET plan = 'ENTERPRISE' WHERE slug = 'sim360-dev';
# Puis retester → 200
```

---

## Phase 4 — Polish

### 4.1 Voice Q&A dans le chat PMO

| # | Action | Resultat attendu | URL |
|---|--------|------------------|-----|
| 1 | Ouvrir le chat PMO (FAB en bas a droite) | Chat avec bouton micro a cote du champ de saisie | `/simulations/{id}` |
| 2 | Cliquer le bouton micro | Le bouton pulse en rouge, enregistrement en cours | — |
| 3 | Parler pendant 3-5 secondes | Audio capture via navigator.mediaDevices | — |
| 4 | Cliquer pour arreter | Spinner "transcription en cours", puis texte injecte dans le champ de saisie | — |
| 5 | Verifier le texte transcrit | Texte en francais coherent avec ce qui a ete dit | — |
| 6 | Envoyer le message | Le PMO repond normalement | — |

> **Note** : Necessite `OPENAI_API_KEY` dans `.env` pour l'API Whisper.

```bash
# Test API transcription (avec un fichier audio)
curl -s -X POST "http://localhost:3001/api/v1/simulations/{SIM_ID}/pmo/transcribe" \
  -H "Authorization: Bearer $TOKEN" \
  -F "audio=@test-audio.webm"
# Attendu: { "text": "texte transcrit" }
```

### 4.2 Agent RH d'accueil

| # | Action | Resultat attendu |
|---|--------|------------------|
| 1 | Lancer une simulation → meeting HANDOVER_HR | 2 participants : Claire Dumont (DRH) + Maxime Roche (Office Manager) |
| 2 | Verifier la personnalite du DRH | Adapte au secteur du scenario (IT → agile/teletravail, Finance → compliance/dress code) |
| 3 | Poser des questions logistiques | Maxime Roche repond sur badge, outils IT, poste de travail |
| 4 | Meeting HANDOVER_PMO Brownfield | Alexandre Bertrand mentionne les retards, risques, budget, est direct et transparent |

---

## Tests UX / Frontend

### Pages refondues

| Page | URL | Points a verifier |
|------|-----|-------------------|
| **Liste simulations** | `/simulations` | Mini-jauges circulaires KPI, date relative, badges secteur/difficulte, hover border brand, decisions en attente |
| **Nouvelle simulation** | `/simulations/new` | Onglets Catalogue/Generer, cards avec hover, modal detail au clic, recommandations en haut, pas d'emojis |
| **Detail simulation** | `/simulations/{id}` | Banner ONBOARDING si passation, blocage contenu pendant onboarding, badge Brownfield, panneau contexte historique |
| **Meeting room** | `/meetings/{id}` | Icones corrigees (rocket/speaker/focus), objectifs numeros (pas de checks verts au briefing), cercles vides pendant le meeting |
| **Passation** | Banner dans simulation-detail | Stepper 3 etapes avec cercles vert/brand/gris, connecteurs, bouton CTA centre, pas d'ombres |

### Checklist UX globale

- [ ] Aucun emoji utilise comme icone (SVG/KeenIcon partout)
- [ ] Tous les elements cliquables ont `cursor-pointer`
- [ ] Hover feedback visible sur toutes les cards
- [ ] Pas de scroll surprise — les modals s'ouvrent en overlay
- [ ] Icones centrees verticalement dans les boutons (`leading-none`)
- [ ] Palette coherente : `brand-500` pour positif, `amber-500` pour alerte, `destructive` pour critique
- [ ] Pas d'ombres (`shadow-*`) sur les cards et boutons (choix design du projet)

---

## Matrice des endpoints par phase

### Nouveaux endpoints (Phase 1-4)

| Methode | Endpoint | Phase | Description |
|---------|----------|-------|-------------|
| GET | `/scenarios?scenarioType=BROWNFIELD` | 1.1 | Filtrer par type |
| GET | `/scenarios/recommended` | 2.1 | Recommandations par profil |
| POST | `/scenarios/generate` | 2.1 | Generation IA |
| POST | `/simulations` (+ `startingPhaseOrder`) | 1.1 | Depart Brownfield |
| POST | `/simulations/{id}/stakeholders/suggest` | 2.2 | Suggestion IA parties prenantes |
| POST | `/simulations/{id}/stakeholders/apply` | 2.2 | Appliquer les stakeholders |
| GET | `/simulations/{id}/handover` | 1.3 | Statut passation |
| POST | `/simulations/{id}/handover/complete` | 1.3 | Finaliser passation |
| POST | `/simulations/{id}/deliverables/{id}/assign` | 1.2 | Delegation expert |
| POST | `/simulations/{id}/deliverables/{id}/request-revision` | 1.2 | Revision delegue |
| POST | `/simulations/{id}/deliverables/{id}/approval-chain` | 1.2 | Chaine approbation |
| POST | `/simulations/{id}/deliverables/{id}/submit-approval` | 1.2 | Soumettre approbation |
| GET | `/simulations/{id}/deliverables/{id}/approval-status` | 1.2 | Statut approbation |
| POST | `/simulations/{id}/pmo/transcribe` | 4.1 | Voice Q&A Whisper |
| GET | `/simulations/{id}/portfolio/export/pdf` | 3.2 | Export PDF (STARTER+) |
| GET | `/simulations/{id}/portfolio/export/zip` | 3.2 | Export ZIP (PRO+) |
| GET | `/simulations/{id}/portfolio/best` | 3.2 | Meilleurs livrables |
| POST | `/mentoring/reviews` | 3.1 | Creer review mentor |
| GET | `/mentoring/reviews/pending` | 3.1 | Reviews en attente |
| GET | `/mentoring/reviews/{evaluationId}` | 3.1 | Lire review |
| PUT | `/mentoring/reviews/{id}` | 3.1 | Modifier review |
| POST | `/mentoring/sessions` | 3.1 | Creer session |
| GET | `/mentoring/sessions` | 3.1 | Lister sessions |
| GET | `/mentoring/sessions/{id}` | 3.1 | Detail session |
| POST | `/mentoring/sessions/{id}/messages` | 3.1 | Envoyer message |
| PATCH | `/mentoring/sessions/{id}/complete` | 3.1 | Completer session |

---

## Scenario de test E2E complet

### Parcours 1 : Apprenant Greenfield (nouveau projet)

```
1. Login → admin@sim360.dev
2. /simulations/new → Onglet "Generer avec l'IA"
3. Generer : secteur IT, difficulte Debutant, Greenfield, "App mobile de livraison"
4. Modal s'ouvre → verifier 5 phases, equipe, objectifs
5. Lancer → simulation creee en ONBOARDING
6. Passation : Meeting RH (Claire Dumont) → discuter → completer
7. Passation : Meeting PMO (Alexandre Bertrand) → discuter → completer
8. Cliquer "Commencer le projet" → IN_PROGRESS
9. Verifier les KPIs, decisions disponibles, livrables
10. Ouvrir le chat PMO → utiliser le micro pour poser une question vocale
11. Rédiger un livrable "Charte de projet"
12. Soumettre pour evaluation IA → verifier score
13. Voir le "Jumeau Parfait" (reference)
14. Deleguer un livrable metier a un expert IA
15. Definir chaine d'approbation → Soumettre
16. Avancer de phase
17. Terminer la simulation
18. Consulter le debriefing → portfolio → exporter PDF
```

### Parcours 2 : Apprenant Brownfield (reprise projet)

```
1. Login → admin@sim360.dev
2. /simulations/new → Catalogue → "Reprise ERP en difficulte"
3. Modal : verifier contexte brownfield (15j retard, 4 risques, 65% budget)
4. Lancer → ONBOARDING, depart phase 2
5. Passation RH → le DRH presente la culture Finance
6. Passation PMO → le PMO est DIRECT sur les problemes
7. Commencer le projet → KPIs degredes visibles
8. Decision "Gestion integrateur defaillant" → choisir une option
9. Reunion de crise avec le Sponsor
10. Verifier l'email PMBOK dans la boite simulee
11. Avancer vers phase 3 (Suivi)
12. Terminer et consulter le bilan
```

### Parcours 3 : Mentor (reevaluation)

```
1. Promouvoir un user en MENTOR (Prisma Studio)
2. Login avec le compte MENTOR
3. /mentoring → voir les evaluations en attente
4. Creer une review : score humain, leadership, feedback
5. Creer une session de mentorat DEBRIEFING
6. Echanger des messages avec l'apprenant
7. Completer la session
```
