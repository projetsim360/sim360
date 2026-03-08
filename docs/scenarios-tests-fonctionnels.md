# ProjectSim360 — Scenarios de Tests Fonctionnels E2E

> **Version** : 2.0
> **Date** : 2026-03-07
> **Couverture** : 10 EPICs, 86 User Stories, 64 Test Cases + 2 Scenarios Transverses
>
> **Comptes de test** :
> | Role | Email | Mot de passe | Role Prisma |
> |------|-------|-------------|-------------|
> | Admin | `admin@sim360.dev` | `Admin123!` | SUPER_ADMIN |
> | Apprenant | `user@sim360.dev` | `User123!` | USER |
> | Recruteur | `recruiter@sim360.dev` | `Recruiter123!` | MANAGER |
>
> **URLs** :
> - Webapp : `http://localhost:5173`
> - API : `http://localhost:3001/api/v1`
> - Swagger : `http://localhost:3001/api/docs`
> - Prisma Studio : `npx prisma studio` (port 5555)
>
> **Authentification API** :
> ```
> POST /api/v1/auth/login
> Body: { "email": "admin@sim360.dev", "password": "Admin123!" }
> Response: { "tokens": { "accessToken": "eyJ..." }, "user": { ... } }
> Header pour les appels suivants: Authorization: Bearer <accessToken>
> ```

---

## Conventions du document

| Symbole | Signification |
|---------|--------------|
| `[UI]` | Action ou verification dans le navigateur |
| `[API]` | Appel API direct (curl/Postman/Swagger) |
| `[DB]` | Verification en base via Prisma Studio |
| `[BOUTON]` | Bouton a cliquer dans l'interface |
| `[CHAMP]` | Champ de formulaire a remplir |
| `[ERREUR]` | Message d'erreur attendu |

---

## EPIC 1 — Administration du Referentiel

---

### TC-1.1 — Creer un template de livrable

| Champ | Detail |
|-------|--------|
| **US** | US-1.1 (P0) |
| **Role** | Admin (`admin@sim360.dev`) |
| **Route UI** | `/admin/deliverable-templates` |
| **Endpoint API** | `POST /api/v1/admin/deliverable-templates` |

#### Donnees de test

```json
{
  "title": "Charte de projet - Test",
  "type": "project-charter",
  "phase": "INITIATION",
  "difficulty": "STANDARD",
  "content": "# Charte de Projet\n\n## 1. Objectifs du projet\n[Decrire les objectifs SMART]\n\n## 2. Perimetre\n[Definir ce qui est inclus et exclu]\n\n## 3. Parties prenantes\n| Nom | Role | Responsabilite |\n|-----|------|----------------|\n\n## 4. Budget previsionnel\n[Estimation initiale]\n\n## 5. Jalons principaux\n[Liste des jalons avec dates]",
  "evaluationCriteria": {
    "criteria": [
      "Objectifs SMART clairement definis",
      "Perimetre explicite (inclusions et exclusions)",
      "Parties prenantes identifiees avec roles",
      "Budget previsionnel realiste",
      "Jalons principaux dates"
    ]
  },
  "pmiProcess": "4.1",
  "referenceExample": "# Exemple : Charte du projet Alpha\n\n## Objectifs\n- Migrer 100% des services vers le cloud avant le 30/06\n- Reduire les couts d'hebergement de 30%\n\n## Perimetre\nInclus : serveurs web, bases de donnees, CI/CD\nExclus : postes de travail, telephonie"
}
```

#### Etapes detaillees

1. `[UI]` Se connecter avec `admin@sim360.dev` / `Admin123!`
2. `[UI]` Dans le menu lateral gauche, cliquer sur **"Administration" > "Templates livrables"**
3. `[UI]` La page `/admin/deliverable-templates` s'affiche avec la liste des templates existants (8 du seed)
4. `[BOUTON]` Cliquer sur **"Nouveau template"** (en haut a droite, icone `+`)
5. `[UI]` Un formulaire/dialogue s'ouvre
6. `[CHAMP]` Titre : saisir `Charte de projet - Test`
7. `[CHAMP]` Type : selectionner `project-charter` dans le dropdown
8. `[CHAMP]` Phase PMI : selectionner `INITIATION`
9. `[CHAMP]` Difficulte : selectionner `STANDARD`
10. `[CHAMP]` Processus PMI : saisir `4.1`
11. `[CHAMP]` Contenu : coller le Markdown du champ `content` ci-dessus
12. `[CHAMP]` Criteres d'evaluation : ajouter les 5 criteres un par un
13. `[CHAMP]` Exemple de reference : coller le contenu `referenceExample`
14. `[BOUTON]` Cliquer sur **"Creer"** ou **"Sauvegarder"**

#### Resultat attendu

- [ ] `[UI]` Toast de succes : "Template cree avec succes"
- [ ] `[UI]` Le template "Charte de projet - Test" apparait dans la liste
- [ ] `[UI]` Le badge de phase affiche "INITIATION" en couleur
- [ ] `[UI]` Le badge de difficulte affiche "STANDARD"

#### Verification API

```
GET /api/v1/admin/deliverable-templates
Authorization: Bearer <token_admin>

Reponse attendue (extrait) :
{
  "data": [
    {
      "id": "uuid-genere",
      "title": "Charte de projet - Test",
      "type": "project-charter",
      "phase": "INITIATION",
      "difficulty": "STANDARD",
      "pmiProcess": "4.1",
      "isActive": true,
      "version": 1,
      "content": "# Charte de Projet...",
      "evaluationCriteria": { "criteria": [...] },
      "createdAt": "2026-03-07T...",
      "updatedAt": "2026-03-07T..."
    }
  ]
}
```

#### Tests d'erreur

| Action | Erreur attendue |
|--------|----------------|
| Soumettre sans titre | `[ERREUR]` "title should not be empty" / champ en rouge |
| Soumettre sans contenu | `[ERREUR]` "content should not be empty" / champ en rouge |
| Soumettre sans phase | `[ERREUR]` "phase must be a valid enum value" |
| Titre > 200 caracteres | `[ERREUR]` "title must be shorter than or equal to 200 characters" |
| Utilisateur non-admin (user@sim360.dev) | `[API]` HTTP 403 Forbidden |

---

### TC-1.2 — Modifier un template avec versioning automatique

| Champ | Detail |
|-------|--------|
| **US** | US-1.2 (P0) |
| **Role** | Admin |
| **Precondition** | TC-1.1 execute — template "Charte de projet - Test" existant |
| **Endpoint API** | `PUT /api/v1/admin/deliverable-templates/:id` |

#### Donnees de modification

```json
{
  "content": "# Charte de Projet\n\n## 1. Objectifs du projet\n[Decrire les objectifs SMART]\n\n## 2. Perimetre\n[Definir ce qui est inclus et exclu]\n\n## 3. Parties prenantes\n| Nom | Role | Responsabilite |\n|-----|------|----------------|\n\n## 4. Budget previsionnel\n[Estimation initiale]\n\n## 5. Jalons principaux\n[Liste des jalons avec dates]\n\n## 6. Risques majeurs identifies\n[NOUVEAU — Section ajoutee en v2]"
}
```

#### Etapes detaillees

1. `[UI]` Sur `/admin/deliverable-templates`, cliquer sur la ligne **"Charte de projet - Test"**
2. `[UI]` Le formulaire d'edition s'ouvre avec les donnees actuelles
3. `[CHAMP]` Dans le champ "Contenu", ajouter la section `## 6. Risques majeurs identifies`
4. `[BOUTON]` Cliquer sur **"Sauvegarder"**

#### Resultat attendu

- [ ] `[UI]` Toast : "Template mis a jour"
- [ ] `[UI]` Le contenu est mis a jour dans la liste
- [ ] `[DB]` Le champ `version` passe de `1` a `2`

#### Verification API — Historique des versions

```
GET /api/v1/admin/deliverable-templates/<id>/versions
Authorization: Bearer <token_admin>

Reponse attendue :
[
  {
    "version": 1,
    "content": "# Charte de Projet... (sans section Risques)",
    "createdAt": "2026-03-07T14:00:00Z"
  },
  {
    "version": 2,
    "content": "# Charte de Projet... (avec section Risques)",
    "createdAt": "2026-03-07T14:05:00Z"
  }
]
```

---

### TC-1.3 — Desactiver un template sans le supprimer

| Champ | Detail |
|-------|--------|
| **US** | US-1.3 (P0) |
| **Role** | Admin |
| **Precondition** | Template actif existant |
| **Endpoint API** | `PATCH /api/v1/admin/deliverable-templates/:id/toggle` |

#### Etapes detaillees

1. `[UI]` Sur `/admin/deliverable-templates`, reperer un template avec le badge vert "Actif"
2. `[BOUTON]` Cliquer sur le bouton **toggle** (switch ou bouton "Desactiver") de ce template
3. `[UI]` Confirmer si un dialogue de confirmation apparait

#### Resultat attendu

- [ ] `[UI]` Le badge passe de "Actif" (vert) a "Inactif" (gris/rouge)
- [ ] `[UI]` Le template reste visible dans la liste admin
- [ ] `[API]` `PATCH /admin/deliverable-templates/:id/toggle` retourne `{ "isActive": false }`
- [ ] `[DB]` Le champ `isActive` est `false` dans la table `deliverable_templates`

#### Re-activation

1. `[BOUTON]` Cliquer a nouveau sur le toggle
2. `[UI]` Le badge repasse a "Actif" (vert)
3. `[API]` Retourne `{ "isActive": true }`

---

### TC-1.4 — Filtrer et trier les templates

| Champ | Detail |
|-------|--------|
| **US** | US-1.4 (P1) |
| **Role** | Admin |
| **Precondition** | Au moins 6 templates existent (seed) |
| **Endpoint API** | `GET /api/v1/admin/deliverable-templates?phase=INITIATION&sortBy=title&sortOrder=asc` |

#### Etapes detaillees

1. `[UI]` Sur `/admin/deliverable-templates`, observer la liste complete (8+ templates)
2. `[UI]` Localiser le filtre **"Phase"** (dropdown)
3. `[BOUTON]` Selectionner **"INITIATION"** dans le dropdown
4. `[UI]` La liste se reduit aux templates de la phase Initiation uniquement
5. `[BOUTON]` Cliquer sur l'en-tete de colonne **"Titre"** pour trier A→Z
6. `[BOUTON]` Cliquer a nouveau pour trier Z→A
7. `[BOUTON]` Retirer le filtre de phase, selectionner **"Difficulte" = "ADVANCED"**

#### Resultat attendu

- [ ] `[UI]` Filtre par phase : seuls les templates INITIATION s'affichent
- [ ] `[UI]` Tri par titre : l'ordre alphabetique change a chaque clic
- [ ] `[UI]` Filtre par difficulte : seuls les templates ADVANCED s'affichent
- [ ] `[UI]` Le compteur de resultats se met a jour (ex: "3 templates")

#### Verification API

```
GET /api/v1/admin/deliverable-templates?phase=INITIATION&page=1&limit=20
→ Ne retourne que les templates avec phase=INITIATION

GET /api/v1/admin/deliverable-templates?difficulty=ADVANCED&sortBy=title&sortOrder=desc
→ Retourne les templates ADVANCED tries par titre decroissant
```

---

### TC-1.5 — Ajouter un exemple de reference a un template

| Champ | Detail |
|-------|--------|
| **US** | US-1.5 (P0) |
| **Role** | Admin |
| **Precondition** | Template existant sans exemple de reference |
| **Endpoint API** | `PUT /api/v1/admin/deliverable-templates/:id` |

#### Donnees de test

```json
{
  "referenceExample": "# Exemple de WBS — Projet Migration Cloud\n\n## 1. Gestion de projet\n  1.1 Charte de projet\n  1.2 Plan de projet\n\n## 2. Analyse\n  2.1 Audit infrastructure\n  2.2 Cartographie des dependances\n\n## 3. Migration\n  3.1 Environnement de test\n  3.2 Migration donnees\n  3.3 Migration applications\n\n## 4. Validation\n  4.1 Tests de non-regression\n  4.2 Tests de performance"
}
```

#### Etapes detaillees

1. `[UI]` Ouvrir un template en edition (ex: template WBS)
2. `[CHAMP]` Dans la section "Exemple de reference", coller le contenu Markdown ci-dessus
3. `[BOUTON]` Cliquer sur **"Sauvegarder"**

#### Resultat attendu

- [ ] `[UI]` Toast de succes
- [ ] `[API]` `GET /admin/deliverable-templates/:id` retourne le champ `referenceExample` rempli
- [ ] `[UI]` L'exemple sera visible par l'apprenant apres evaluation (cf. TC-4.6)

---

### TC-1.6 — Creer un document de reference

| Champ | Detail |
|-------|--------|
| **US** | US-1.6 (P0) |
| **Role** | Admin |
| **Route UI** | `/admin/reference-documents` |
| **Endpoint API** | `POST /api/v1/admin/reference-documents` |

#### Donnees de test

```json
{
  "title": "Guide de gestion des risques PMI",
  "category": "BEST_PRACTICE",
  "phase": "PLANNING",
  "content": "# Gestion des Risques selon le PMI\n\n## 1. Identifier les risques\nUtiliser le brainstorming, les checklist, l'analyse SWOT.\n\n## 2. Analyse qualitative\nMatrice probabilite x impact (echelle 1-5).\n\n## 3. Analyse quantitative\nSimulation Monte Carlo pour les risques majeurs.\n\n## 4. Plan de reponse\n- Eviter\n- Transferer\n- Attenuer\n- Accepter\n\n## 5. Surveillance\nRevue des risques a chaque comite de pilotage."
}
```

#### Etapes detaillees

1. `[UI]` Menu lateral > **"Administration" > "Documents reference"**
2. `[UI]` La page `/admin/reference-documents` s'affiche (6 documents du seed)
3. `[BOUTON]` Cliquer sur **"Nouveau document"**
4. `[CHAMP]` Titre : `Guide de gestion des risques PMI`
5. `[CHAMP]` Categorie : selectionner `BEST_PRACTICE`
6. `[CHAMP]` Phase : selectionner `PLANNING`
7. `[CHAMP]` Contenu : coller le Markdown ci-dessus
8. `[BOUTON]` Cliquer sur **"Creer"**

#### Resultat attendu

- [ ] `[UI]` Toast : "Document cree avec succes"
- [ ] `[UI]` Le document apparait dans la liste avec badge "BEST_PRACTICE"
- [ ] `[API]` `GET /admin/reference-documents` contient le nouveau document
- [ ] `[DB]` Table `reference_documents` : nouvelle ligne avec `version: 1`

#### Verification API

```
POST /api/v1/admin/reference-documents
Authorization: Bearer <token_admin>
Content-Type: application/json

Body: (donnees ci-dessus)

Reponse 201 Created :
{
  "id": "uuid-genere",
  "title": "Guide de gestion des risques PMI",
  "category": "BEST_PRACTICE",
  "phase": "PLANNING",
  "version": 1,
  "isActive": true,
  "createdAt": "..."
}
```

#### Tests d'erreur

| Action | Erreur attendue |
|--------|----------------|
| Categorie invalide (ex: "RANDOM") | `[API]` 400 : "category must be a valid enum value" |
| Phase invalide | `[API]` 400 : "phase must be a valid enum value" |
| Sans titre | `[API]` 400 : "title should not be empty" |
| Utilisateur USER (non admin) | `[API]` 403 Forbidden |

---

### TC-1.7 — Modifier un document avec versioning

| Champ | Detail |
|-------|--------|
| **US** | US-1.7 (P1) |
| **Role** | Admin |
| **Precondition** | Document existant (TC-1.6 ou seed) |
| **Endpoint API** | `PUT /api/v1/admin/reference-documents/:id` |

#### Etapes detaillees

1. `[UI]` Sur `/admin/reference-documents`, cliquer sur un document existant
2. `[CHAMP]` Modifier le contenu : ajouter un paragraphe
3. `[BOUTON]` Cliquer sur **"Sauvegarder"**

#### Resultat attendu

- [ ] `[UI]` Toast de succes
- [ ] `[API]` `GET /admin/reference-documents/:id/versions` retourne 2+ versions
- [ ] `[DB]` Le champ `version` est incremente

---

### TC-1.8 — Filtrer les documents de reference

| Champ | Detail |
|-------|--------|
| **US** | US-1.8 (P1) |
| **Role** | Admin |
| **Endpoint API** | `GET /api/v1/admin/reference-documents?category=GLOSSARY&phase=INITIATION` |

#### Etapes detaillees

1. `[UI]` Sur `/admin/reference-documents`
2. `[BOUTON]` Filtre "Categorie" > selectionner **"GLOSSARY"**
3. `[UI]` Verifier que seuls les glossaires s'affichent
4. `[BOUTON]` Ajouter filtre "Phase" > selectionner **"INITIATION"**
5. `[UI]` Verifier la combinaison des filtres

#### Resultat attendu

- [ ] `[UI]` Les filtres reduisent la liste
- [ ] `[UI]` Les filtres sont cumulatifs
- [ ] `[API]` Les query params `category` et `phase` fonctionnent ensemble

---

### TC-1.9 — Consulter le glossaire PMI

| Champ | Detail |
|-------|--------|
| **US** | US-1.9 (P1) |
| **Role** | Tout utilisateur (endpoint public) |
| **Endpoint API** | `GET /api/v1/reference-documents/glossary` |

#### Etapes detaillees

1. `[API]` Appeler `GET /api/v1/reference-documents/glossary` (sans token — endpoint public)

#### Resultat attendu

```
GET /api/v1/reference-documents/glossary

Reponse 200 :
[
  {
    "id": "...",
    "title": "Glossaire PMI",
    "category": "GLOSSARY",
    "content": "...(termes, definitions, exemples)...",
    "isActive": true
  }
]
```

- [ ] `[API]` Accessible sans authentification
- [ ] `[API]` Contient les termes PMI avec definitions et exemples

---

## EPIC 2 — Profiling et Analyse de l'Apprenant

---

### TC-2.1 — Connecter un profil LinkedIn

| Champ | Detail |
|-------|--------|
| **US** | US-2.1 (P1) |
| **Role** | Apprenant (`user@sim360.dev`) |
| **Route UI** | `/onboarding` |
| **Endpoint API** | `POST /api/v1/profile/import-linkedin` |

#### Donnees de test

```json
{
  "linkedinUrl": "https://www.linkedin.com/in/jean-dupont-pm",
  "linkedinData": {
    "name": "Jean Dupont",
    "headline": "Chef de projet IT | PMP Certified",
    "experience": [
      {
        "title": "Chef de projet",
        "company": "TechCorp",
        "duration": "3 ans"
      }
    ],
    "skills": ["Gestion de projet", "Agile", "JIRA", "MS Project"]
  }
}
```

#### Etapes detaillees

1. `[UI]` Se connecter avec `user@sim360.dev` / `User123!`
2. `[UI]` Naviguer vers `/onboarding` (menu lateral > **"Mon Profil" > "Onboarding"**)
3. `[UI]` L'assistant d'onboarding s'affiche avec les etapes
4. `[UI]` A l'etape **"Import de donnees"**, localiser la section LinkedIn
5. `[BOUTON]` Cliquer sur **"Connecter LinkedIn"**
6. `[UI]` Un dialogue s'ouvre avec un champ URL
7. `[CHAMP]` Saisir : `https://www.linkedin.com/in/jean-dupont-pm`
8. `[BOUTON]` Cliquer sur **"Importer"** dans le dialogue

#### Resultat attendu

- [ ] `[UI]` Indicateur de chargement pendant le traitement
- [ ] `[UI]` Message de succes : "Profil LinkedIn importe"
- [ ] `[UI]` Les competences extraites s'affichent
- [ ] `[API]` `POST /profile/import-linkedin` retourne le profil mis a jour

#### Tests d'erreur

| Action | Erreur attendue |
|--------|----------------|
| URL invalide (pas linkedin.com) | `[UI]` "URL LinkedIn invalide" |
| Champ vide | `[UI]` Bouton "Importer" desactive |

---

### TC-2.2 — Uploader un CV au format PDF

| Champ | Detail |
|-------|--------|
| **US** | US-2.2 (P0) |
| **Role** | Apprenant |
| **Endpoint API** | `POST /api/v1/profile/upload-cv` |

#### Donnees de test

- Fichier : `cv-test-pm.pdf` (tout fichier PDF < 5 Mo)

#### Etapes detaillees

1. `[UI]` A l'etape "Import de donnees" du onboarding
2. `[BOUTON]` Cliquer sur **"Importer un CV (PDF)"**
3. `[UI]` Un selecteur de fichier s'ouvre
4. `[UI]` Selectionner un fichier PDF
5. `[UI]` Observer l'indicateur de progression (upload + analyse IA)

#### Resultat attendu

- [ ] `[UI]` Barre de progression ou spinner pendant l'upload
- [ ] `[UI]` Message : "CV analyse avec succes"
- [ ] `[UI]` Les experiences et competences extraites s'affichent
- [ ] `[API]` `POST /profile/upload-cv` avec `Content-Type: multipart/form-data`

#### Tests d'erreur

| Action | Erreur attendue |
|--------|----------------|
| Fichier non-PDF (ex: .docx) | `[UI]` "Format non supporte. Seul le PDF est accepte" |
| Fichier > 10 Mo | `[UI]` "Fichier trop volumineux (max 10 Mo)" |
| Aucun fichier selectionne | `[UI]` Bouton reste desactive |

---

### TC-2.3 — Remplir le questionnaire d'objectifs

| Champ | Detail |
|-------|--------|
| **US** | US-2.3 (P0) |
| **Role** | Apprenant |
| **Endpoint API** | `POST /api/v1/profile/questionnaire` |

#### Donnees de test

```json
{
  "objective": "Devenir chef de projet certifie PMP",
  "targetDomain": "Technologies de l'information",
  "experienceLevel": "beginner",
  "mainMotivation": "Reconversion professionnelle depuis le developpement",
  "additionalInfo": "J'ai 5 ans d'experience en developpement web"
}
```

#### Etapes detaillees

1. `[UI]` A l'etape **"Questionnaire"** du onboarding
2. `[CHAMP]` "Quel est votre objectif ?" → `Devenir chef de projet certifie PMP`
3. `[CHAMP]` "Domaine cible" → selectionner `Technologies de l'information`
4. `[CHAMP]` "Niveau d'experience en gestion de projet" → selectionner `Debutant`
5. `[CHAMP]` "Motivation principale" → `Reconversion professionnelle depuis le developpement`
6. `[CHAMP]` "Informations complementaires" (optionnel) → `J'ai 5 ans d'experience en developpement web`
7. `[BOUTON]` Cliquer sur **"Valider"** ou **"Suivant"**

#### Resultat attendu

- [ ] `[UI]` Validation du formulaire (react-hook-form + zod) — pas d'erreur
- [ ] `[UI]` Passage a l'etape suivante
- [ ] `[API]` `POST /profile/questionnaire` retourne le profil avec `diagnosticData` mis a jour

#### Verification API

```
POST /api/v1/profile/questionnaire
Authorization: Bearer <token_user>
Content-Type: application/json

Body: (donnees ci-dessus)

Reponse 200 :
{
  "id": "...",
  "userId": "...",
  "profileType": null,  // pas encore diagnostique
  "diagnosticData": {
    "objective": "Devenir chef de projet certifie PMP",
    "targetDomain": "Technologies de l'information",
    "experienceLevel": "beginner",
    "mainMotivation": "Reconversion professionnelle depuis le developpement"
  }
}
```

#### Tests d'erreur

| Action | Erreur attendue |
|--------|----------------|
| Objectif vide | `[UI]` Champ en rouge, message "Ce champ est requis" |
| Domaine non selectionne | `[UI]` "Veuillez selectionner un domaine" |
| Niveau d'experience non selectionne | `[UI]` "Ce champ est requis" |

---

### TC-2.4 — Test d'aptitude pour profil zero experience

| Champ | Detail |
|-------|--------|
| **US** | US-2.4 (P1) |
| **Role** | Apprenant (experience = `none`) |
| **Precondition** | Questionnaire rempli avec `experienceLevel: "none"` |
| **Endpoint API** | `POST /api/v1/profile/aptitude-test` |

#### Donnees de test

```json
{
  "answers": [
    { "questionId": "scenario-1", "answer": "B" },
    { "questionId": "scenario-2", "answer": "A" },
    { "questionId": "scenario-3", "answer": "C" }
  ]
}
```

#### Etapes detaillees

1. `[UI]` L'etape "Test d'aptitude" apparait (uniquement si experience = none)
2. `[UI]` 3 mini-scenarios de gestion de projet s'affichent
3. **Scenario 1** : Situation de priorisation — choisir une option parmi A/B/C
4. **Scenario 2** : Situation de gestion d'equipe — choisir une option
5. **Scenario 3** : Situation de gestion de risque — choisir une option
6. `[BOUTON]` Cliquer sur **"Valider le test"**

#### Resultat attendu

- [ ] `[UI]` 3 scenarios affiches avec descriptions et options radio/cards
- [ ] `[UI]` Score calcule et affiche (ex: "Score : 7/10")
- [ ] `[UI]` Passage automatique a l'etape diagnostic
- [ ] `[API]` `POST /profile/aptitude-test` retourne `{ "score": 7, "maxScore": 10, "details": [...] }`

#### Tests d'erreur

| Action | Erreur attendue |
|--------|----------------|
| Valider sans repondre a tous les scenarios | `[UI]` "Veuillez repondre a toutes les questions" |

---

### TC-2.5 — Recevoir le diagnostic IA (Gap Analysis)

| Champ | Detail |
|-------|--------|
| **US** | US-2.5 (P0) |
| **Role** | Apprenant |
| **Precondition** | Questionnaire rempli (TC-2.3) |
| **Endpoint API** | `POST /api/v1/profile/analyze` |

#### Etapes detaillees

1. `[UI]` A l'etape **"Diagnostic"**, l'analyse IA se lance automatiquement
2. `[UI]` Indicateur de chargement "Analyse en cours..."
3. `[UI]` Le resultat s'affiche apres quelques secondes

#### Resultat attendu

- [ ] `[UI]` **Type de profil** affiche : un parmi `ZERO_EXPERIENCE`, `BEGINNER`, `RECONVERSION`, `REINFORCEMENT`
- [ ] `[UI]` **Score diagnostic** affiche (0-100)
- [ ] `[UI]` **Lacunes identifiees** listees (ex: "Planification", "Gestion des risques")
- [ ] `[UI]` **Competences existantes** reconnues

#### Verification API

```
POST /api/v1/profile/analyze
Authorization: Bearer <token_user>

Reponse 200 :
{
  "profileType": "BEGINNER",
  "diagnosticScore": 45,
  "gaps": [
    { "skill": "Planification", "currentLevel": "basic", "targetLevel": "advanced", "gap": 60 },
    { "skill": "Gestion des risques", "currentLevel": "none", "targetLevel": "intermediate", "gap": 80 }
  ],
  "strengths": [
    { "skill": "Communication", "level": "intermediate" }
  ]
}
```

---

### TC-2.6 — Accepter ou modifier les competences suggerees

| Champ | Detail |
|-------|--------|
| **US** | US-2.6 (P0) |
| **Role** | Apprenant |
| **Precondition** | Diagnostic genere (TC-2.5) |
| **Endpoint API** | `PUT /api/v1/profile/skills` |

#### Donnees de test

```json
{
  "skills": [
    { "name": "Planification", "currentLevel": "basic", "targetLevel": "advanced" },
    { "name": "Gestion des risques", "currentLevel": "none", "targetLevel": "intermediate" },
    { "name": "Leadership", "currentLevel": "basic", "targetLevel": "advanced" }
  ]
}
```

#### Etapes detaillees

1. `[UI]` Sur l'ecran de diagnostic, voir les competences suggerees
2. `[BOUTON]` Cliquer sur **"X"** a cote d'une competence pour la supprimer
3. `[BOUTON]` Cliquer sur **"Ajouter une competence"**
4. `[CHAMP]` Saisir : `Leadership`
5. `[UI]` Ajuster le niveau cible via un slider ou dropdown
6. `[BOUTON]` Cliquer sur **"Valider mes competences"**

#### Resultat attendu

- [ ] `[UI]` La competence supprimee disparait de la liste
- [ ] `[UI]` La competence ajoutee apparait
- [ ] `[UI]` Les niveaux sont modifiables
- [ ] `[API]` `PUT /profile/skills` sauvegarde les modifications

---

### TC-2.7 — Choisir le secteur d'activite

| Champ | Detail |
|-------|--------|
| **US** | US-2.7 (P0) |
| **Role** | Apprenant |
| **Endpoint API** | `PUT /api/v1/profile/sector` |

#### Donnees de test

```json
{
  "sector": "IT"
}
```

#### Etapes detaillees

1. `[UI]` A l'etape **"Choix du parcours"**
2. `[UI]` L'IA suggere un secteur (ex: "IT" base sur le profil)
3. `[BOUTON]` Accepter la suggestion **ou** selectionner un autre secteur dans le dropdown
4. `[BOUTON]` Cliquer sur **"Confirmer"**

#### Resultat attendu

- [ ] `[UI]` La suggestion IA est pre-selectionnee
- [ ] `[UI]` Le dropdown permet de changer le secteur
- [ ] `[API]` `PUT /profile/sector` retourne le profil avec le secteur choisi

---

### TC-2.8 — Soumettre un projet personnalise

| Champ | Detail |
|-------|--------|
| **US** | US-2.8 (P2) |
| **Role** | Apprenant |
| **Endpoint API** | `POST /api/v1/profile/custom-project` |

#### Donnees de test

```json
{
  "projectName": "Refonte du site intranet",
  "description": "Migration de l'intranet legacy vers une solution moderne React/Node",
  "sector": "IT",
  "constraints": "Budget limite a 50k, equipe de 4 personnes, deadline 6 mois",
  "learningObjectives": "Apprendre la gestion de projet agile dans un contexte de migration"
}
```

#### Etapes detaillees

1. `[UI]` A l'etape "Choix du parcours", selectionner **"Projet personnalise"**
2. `[UI]` Un formulaire detaille s'affiche
3. `[CHAMP]` Nom du projet : `Refonte du site intranet`
4. `[CHAMP]` Description : (texte ci-dessus)
5. `[CHAMP]` Secteur : `IT`
6. `[CHAMP]` Contraintes : (texte ci-dessus)
7. `[CHAMP]` Objectifs d'apprentissage : (texte ci-dessus)
8. `[BOUTON]` Cliquer sur **"Generer mon scenario"**

#### Resultat attendu

- [ ] `[UI]` Validation zod du formulaire
- [ ] `[UI]` Indicateur de chargement "Generation du scenario..."
- [ ] `[API]` `POST /profile/custom-project` retourne le projet personnalise
- [ ] `[UI]` Redirection vers la finalisation du onboarding

#### Tests d'erreur

| Action | Erreur attendue |
|--------|----------------|
| Nom du projet vide | `[UI]` "Le nom du projet est requis" |
| Description < 20 caracteres | `[UI]` "La description doit faire au moins 20 caracteres" |

---

## EPIC 3 — Agent PMO (Mentor IA)

---

### TC-3.1 — Envoyer un message au PMO et recevoir une reponse en streaming

| Champ | Detail |
|-------|--------|
| **US** | US-3.1 (P0) |
| **Role** | Apprenant |
| **Route UI** | `/simulations/:id/pmo` |
| **Endpoint API** | `POST /api/v1/simulations/:simulationId/pmo/chat` (SSE) |
| **Precondition** | Simulation active existante |

#### Donnees de test

```json
{
  "message": "Quels sont les livrables attendus pour la phase d'initiation ?"
}
```

#### Etapes detaillees

1. `[UI]` Naviguer vers `/simulations` et cliquer sur une simulation active
2. `[UI]` Sur la page de detail, cliquer sur **"Chat PMO"** dans le menu ou la sidebar
3. `[UI]` La page `/simulations/:id/pmo` s'affiche avec le chat
4. `[CHAMP]` Dans la zone de saisie en bas, taper : `Quels sont les livrables attendus pour la phase d'initiation ?`
5. `[BOUTON]` Cliquer sur **"Envoyer"** (icone fleche) ou appuyer sur Entree

#### Resultat attendu

- [ ] `[UI]` Le message de l'apprenant apparait a droite (bulle utilisateur)
- [ ] `[UI]` Un indicateur "..." ou "PMO ecrit..." apparait
- [ ] `[UI]` La reponse du PMO arrive **mot par mot** en streaming (SSE)
- [ ] `[UI]` La reponse mentionne les livrables de la phase d'initiation (Charte de projet, Registre des parties prenantes)
- [ ] `[UI]` Les blocs de code dans la reponse ont un bouton **"Copier"**
- [ ] `[UI]` Le scroll suit automatiquement la reponse

#### Verification API (SSE)

```
POST /api/v1/simulations/<simId>/pmo/chat
Authorization: Bearer <token_user>
Content-Type: application/json
Accept: text/event-stream

Body: { "message": "Quels sont les livrables attendus pour la phase d'initiation ?" }

Reponse SSE :
data: {"type":"token","content":"Les "}
data: {"type":"token","content":"livrables "}
data: {"type":"token","content":"attendus "}
...
data: {"type":"done","content":""}
```

#### Tests d'erreur

| Action | Erreur attendue |
|--------|----------------|
| Message vide | `[UI]` Bouton "Envoyer" desactive |
| Message > 5000 caracteres | `[API]` 400 : "message must be shorter than or equal to 5000 characters" |
| Simulation inexistante | `[API]` 404 : "Simulation introuvable" |
| Simulation d'un autre utilisateur | `[API]` 403 : "Acces refuse" |

---

### TC-3.2 — PMO contextuellement informe de la simulation

| Champ | Detail |
|-------|--------|
| **US** | US-3.2 (P0) |
| **Role** | Apprenant |
| **Precondition** | Simulation avec KPIs et decisions existantes |
| **Endpoint API** | `GET /api/v1/simulations/:simulationId/pmo/context` |

#### Etapes detaillees

1. `[UI]` Ouvrir le chat PMO d'une simulation en cours
2. `[CHAMP]` Taper : `Comment vont mes KPIs ?`
3. `[BOUTON]` Envoyer

#### Resultat attendu

- [ ] `[UI]` Le PMO cite les KPIs actuels (ex: "Budget: 85/100, Delai: 72/100, Qualite: 90/100")
- [ ] `[UI]` Le **panneau contextuel** (droite du chat) affiche :
  - Phase en cours (ex: "PLANNING")
  - KPIs avec barres de progression
  - Livrables en cours avec statuts
  - Decisions prises recemment
- [ ] `[UI]` Les livrables dans le panneau sont cliquables (lien vers `/simulations/:id/deliverables/:delId/edit`)

#### Verification API

```
GET /api/v1/simulations/<simId>/pmo/context
Authorization: Bearer <token_user>

Reponse 200 :
{
  "currentPhase": { "name": "Planning", "type": "PLANNING", "order": 2 },
  "kpis": { "budget": 85, "schedule": 72, "quality": 90, "scope": 88, "risk": 65 },
  "pendingDeliverables": [
    { "id": "...", "title": "WBS", "type": "wbs", "status": "DRAFT", "dueDate": "2026-03-15" }
  ],
  "recentDecisions": [
    { "id": "...", "title": "Choix de la methodologie", "selectedOption": 1 }
  ]
}
```

---

### TC-3.3 — Rappels de livrables en attente

| Champ | Detail |
|-------|--------|
| **US** | US-3.3 (P0) |
| **Role** | Apprenant |
| **Precondition** | Livrables en statut DRAFT ou non soumis |

#### Etapes detaillees

1. `[UI]` Ouvrir `/simulations/:id/pmo`
2. `[UI]` Observer le header du chat

#### Resultat attendu

- [ ] `[UI]` Un badge **"Rappels"** avec un nombre (ex: "3") apparait dans le header
- [ ] `[UI]` Un bandeau systeme en haut du chat liste les livrables en attente :
  - Ex: "Vous avez 3 livrables a rendre : Charte de projet, WBS, Plan de communication"
- [ ] `[UI]` Le PMO mentionne proactivement les livrables en retard dans ses reponses
- [ ] `[UI]` Les noms de livrables dans le bandeau sont cliquables

---

### TC-3.4 — Demander un template au PMO

| Champ | Detail |
|-------|--------|
| **US** | US-3.4 (P0) |
| **Role** | Apprenant |

#### Etapes detaillees

1. `[CHAMP]` Taper : `Donne-moi le template de la charte de projet`
2. `[BOUTON]` Envoyer

#### Resultat attendu

- [ ] `[UI]` Le PMO repond avec le contenu du template en Markdown
- [ ] `[UI]` Le contenu est affiche dans un bloc de code avec coloration syntaxique
- [ ] `[BOUTON]` Un bouton **"Copier"** apparait en haut du bloc de code
- [ ] `[UI]` Cliquer sur "Copier" → toast "Copie dans le presse-papiers"
- [ ] `[UI]` Le template correspond a celui cree par l'admin (EPIC 1)

---

### TC-3.5 — Accueil par l'agent RH

| Champ | Detail |
|-------|--------|
| **US** | US-3.5 (P1) |
| **Role** | Apprenant |
| **Precondition** | Nouvelle simulation demarree |
| **Endpoint API** | `POST /api/v1/simulations/:simulationId/pmo/init` |

#### Etapes detaillees

1. `[UI]` Creer une nouvelle simulation (cf. TC-simulation)
2. `[UI]` Naviguer vers `/simulations/:id/pmo`
3. `[UI]` Observer le premier message

#### Resultat attendu

- [ ] `[UI]` Un message de bienvenue de l'**agent RH** s'affiche automatiquement
- [ ] `[UI]` Le message contient :
  - Nom de l'entreprise
  - Culture d'entreprise (strict/agile/collaborative)
  - Poste du joueur
  - Regles de fonctionnement
- [ ] `[UI]` Le ton correspond a la culture :
  - STRICT : formel, "Nous attendons de vous..."
  - AGILE : decontracte, "Bienvenue dans l'equipe !"
  - COLLABORATIVE : chaleureux, "Nous sommes ravis de vous accueillir"

---

### TC-3.6 — Presentation du projet par le PMO

| Champ | Detail |
|-------|--------|
| **US** | US-3.6 (P0) |
| **Role** | Apprenant |
| **Precondition** | Apres le message RH (TC-3.5) |

#### Resultat attendu

- [ ] `[UI]` Apres le message RH, le **PMO** prend la parole
- [ ] `[UI]` Le PMO presente :
  - Le projet et ses objectifs
  - Les phases PMI a suivre
  - La methodologie (predictive/agile/hybride)
- [ ] `[UI]` Le message est structure avec des titres et bullet points

---

### TC-3.7 — Livrables attendus avec deadlines

| Champ | Detail |
|-------|--------|
| **US** | US-3.7 (P0) |
| **Role** | Apprenant |

#### Etapes detaillees

1. `[UI]` Dans le panneau contextuel (droite), observer la section "Livrables"

#### Resultat attendu

- [ ] `[UI]` Chaque livrable affiche :
  - Titre (ex: "Charte de projet")
  - Deadline avec date
  - Statut (DRAFT, SUBMITTED, etc.)
- [ ] `[UI]` Les deadlines proches (< 2 jours) sont en **rouge**
- [ ] `[UI]` Les deadlines a venir (2-5 jours) sont en **orange**
- [ ] `[UI]` Les livrables sont cliquables → navigation vers l'editeur

---

## EPIC 4 — Systeme de Livrables

---

### TC-4.1 — Editer un livrable en Markdown avec auto-save

| Champ | Detail |
|-------|--------|
| **US** | US-4.1 (P0) |
| **Role** | Apprenant |
| **Route UI** | `/simulations/:id/deliverables/:delId/edit` |
| **Endpoint API** | `PATCH /api/v1/simulations/:simId/deliverables/:id/content` |

#### Donnees de test

```json
{
  "content": "# Charte de Projet — Refonte E-commerce\n\n## Objectifs\n- Augmenter le taux de conversion de 15%\n- Reduire le temps de chargement < 2s\n- Migrer vers une architecture micro-services\n\n## Perimetre\n**Inclus** : Front-end, Back-end, Base de donnees\n**Exclu** : Application mobile, SEO\n\n## Parties prenantes\n| Nom | Role |\n|-----|------|\n| M. Martin | Sponsor |\n| Mme Durand | Chef de projet |\n| Equipe Dev | Execution |"
}
```

#### Etapes detaillees

1. `[UI]` Naviguer vers `/simulations/:id/deliverables`
2. `[UI]` La liste des livrables s'affiche avec statuts
3. `[BOUTON]` Cliquer sur un livrable en statut **"DRAFT"** (ex: "Charte de projet")
4. `[UI]` L'editeur Markdown s'ouvre sur `/simulations/:id/deliverables/:delId/edit`
5. `[CHAMP]` Ecrire le contenu Markdown dans la zone d'edition (panneau gauche)
6. `[UI]` Observer la preview HTML dans le panneau droit
7. `[UI]` Attendre 3-5 secondes sans taper → l'auto-save se declenche
8. `[BOUTON]` Cliquer sur **"Copier le template"** pour pre-remplir avec le template admin

#### Resultat attendu

- [ ] `[UI]` L'editeur a deux panneaux : edition (gauche) + preview (droite)
- [ ] `[UI]` La preview se met a jour en temps reel pendant la frappe
- [ ] `[UI]` Indicateur "Sauvegarde..." puis "Sauvegarde" apres auto-save
- [ ] `[UI]` Le bouton **"Copier le template"** colle le contenu du template dans l'editeur
- [ ] `[API]` `PATCH /simulations/:simId/deliverables/:id/content` est appele automatiquement

#### Verification API (auto-save)

```
PATCH /api/v1/simulations/<simId>/deliverables/<delId>/content
Authorization: Bearer <token_user>
Content-Type: application/json

Body: { "content": "# Charte de Projet — Refonte E-commerce\n..." }

Reponse 200 :
{
  "id": "...",
  "title": "Charte de projet",
  "content": "# Charte de Projet — Refonte E-commerce...",
  "status": "DRAFT",
  "updatedAt": "2026-03-07T..."
}
```

---

### TC-4.2 — Soumettre un livrable pour evaluation IA

| Champ | Detail |
|-------|--------|
| **US** | US-4.2 (P0) |
| **Role** | Apprenant |
| **Precondition** | Livrable redige (TC-4.1) |
| **Endpoint API** | `POST /api/v1/simulations/:simId/deliverables/:id/submit` |

#### Etapes detaillees

1. `[UI]` Sur l'editeur de livrable, verifier que du contenu est ecrit
2. `[BOUTON]` Cliquer sur **"Soumettre pour evaluation"** (bouton primaire en haut a droite)
3. `[UI]` Un dialogue de confirmation apparait : "Etes-vous sur de vouloir soumettre ce livrable ?"
4. `[BOUTON]` Cliquer sur **"Confirmer"**
5. `[UI]` Indicateur de chargement "Evaluation en cours..."

#### Resultat attendu

- [ ] `[UI]` Spinner/barre de progression pendant l'evaluation IA (5-15 secondes)
- [ ] `[UI]` Redirection automatique vers `/simulations/:id/deliverables/:delId/evaluation`
- [ ] `[UI]` Le statut du livrable passe a **"EVALUATED"**
- [ ] `[API]` `POST /simulations/:simId/deliverables/:id/submit` retourne l'evaluation

#### Verification API

```
POST /api/v1/simulations/<simId>/deliverables/<delId>/submit
Authorization: Bearer <token_user>

Reponse 200 :
{
  "id": "...",
  "status": "EVALUATED",
  "evaluation": {
    "score": 72,
    "grade": "B",
    "strengths": ["Objectifs clairs", "Perimetre bien defini"],
    "weaknesses": ["Budget non detaille", "Risques non mentionnes"],
    "recommendations": ["Ajouter une section budget", "Identifier les risques majeurs"],
    "pmiAlignment": { "covered": ["4.1"], "missing": ["4.2", "4.3"] }
  }
}
```

#### Tests d'erreur

| Action | Erreur attendue |
|--------|----------------|
| Soumettre un livrable vide (sans contenu) | `[UI]` "Le livrable doit contenir du contenu avant la soumission" |
| Soumettre un livrable deja evalue | `[UI]` Bouton "Soumettre" remplace par "Reviser" |

---

### TC-4.3 — Liste des livrables avec statut et score

| Champ | Detail |
|-------|--------|
| **US** | US-4.3 (P0) |
| **Role** | Apprenant |
| **Route UI** | `/simulations/:id/deliverables` |
| **Endpoint API** | `GET /api/v1/simulations/:simId/deliverables` |

#### Etapes detaillees

1. `[UI]` Naviguer vers `/simulations/:id/deliverables`

#### Resultat attendu

- [ ] `[UI]` Tableau/liste avec colonnes : **Titre**, **Type**, **Phase**, **Statut**, **Score**, **Date**
- [ ] `[UI]` Badges de statut colores :
  - `DRAFT` → gris
  - `SUBMITTED` → bleu
  - `EVALUATED` → jaune/orange
  - `VALIDATED` → vert
  - `REVISION_REQUESTED` → rouge
- [ ] `[UI]` Le score est affiche (ex: "72/100") pour les livrables evalues
- [ ] `[UI]` Cliquer sur un livrable → navigation vers l'editeur

#### Verification API

```
GET /api/v1/simulations/<simId>/deliverables
Authorization: Bearer <token_user>

Reponse 200 :
[
  {
    "id": "...",
    "title": "Charte de projet",
    "type": "project-charter",
    "status": "EVALUATED",
    "score": 72,
    "grade": "B",
    "phaseOrder": 1,
    "createdAt": "...",
    "updatedAt": "..."
  },
  {
    "id": "...",
    "title": "WBS",
    "type": "wbs",
    "status": "DRAFT",
    "score": null,
    "phaseOrder": 2
  }
]
```

---

### TC-4.4 — Voir le template en panneau lateral

| Champ | Detail |
|-------|--------|
| **US** | US-4.4 (P1) |
| **Role** | Apprenant |
| **Endpoint API** | `GET /api/v1/simulations/:simId/deliverables/:id/template` |

#### Etapes detaillees

1. `[UI]` Sur l'editeur de livrable (`/simulations/:id/deliverables/:delId/edit`)
2. `[BOUTON]` Cliquer sur **"Voir le template"** ou icone panneau lateral

#### Resultat attendu

- [ ] `[UI]` Un panneau lateral s'ouvre montrant le template de reference
- [ ] `[UI]` Le contenu du template est en Markdown rendu
- [ ] `[UI]` L'editeur et le template sont visibles cote a cote (split view)
- [ ] `[BOUTON]` Bouton **"Copier le template"** pour pre-remplir l'editeur

---

### TC-4.5 — Evaluation detaillee avec score et recommandations

| Champ | Detail |
|-------|--------|
| **US** | US-4.5 (P0) |
| **Role** | Apprenant |
| **Route UI** | `/simulations/:id/deliverables/:delId/evaluation` |
| **Endpoint API** | `GET /api/v1/simulations/:simId/deliverables/:id/evaluation` |
| **Precondition** | Livrable soumis et evalue (TC-4.2) |

#### Etapes detaillees

1. `[UI]` Naviguer vers `/simulations/:id/deliverables/:delId/evaluation`
2. `[UI]` Observer les differentes sections

#### Resultat attendu

- [ ] `[UI]` **Score** : grand chiffre (ex: "72/100") avec cercle de progression
- [ ] `[UI]` **Note lettre** : badge colore (A=vert, B=bleu, C=jaune, D=orange, F=rouge)
- [ ] `[UI]` **Points forts** : liste avec icones check vertes
  - Ex: "Objectifs clairs et mesurables"
  - Ex: "Perimetre bien delimite"
- [ ] `[UI]` **Lacunes** : liste avec icones warning orange
  - Ex: "Section budget absente"
  - Ex: "Risques non identifies"
- [ ] `[UI]` **Recommandations** : paragraphe ou liste
  - Ex: "Ajoutez une estimation budgetaire meme approximative"
- [ ] `[UI]` **Checklist des criteres** : chaque critere est coche (vert) ou non (rouge)

---

### TC-4.6 — Voir l'exemple de reference apres evaluation

| Champ | Detail |
|-------|--------|
| **US** | US-4.6 (P0) |
| **Role** | Apprenant |
| **Endpoint API** | `GET /api/v1/simulations/:simId/deliverables/:id/reference` |
| **Precondition** | Livrable evalue, template avec referenceExample |

#### Etapes detaillees

1. `[UI]` Sur la page d'evaluation, faire defiler vers le bas
2. `[UI]` Localiser la section **"Exemple de reference"**

#### Resultat attendu

- [ ] `[UI]` Le contenu de l'exemple de reference (configure par l'admin) est affiche
- [ ] `[UI]` Le contenu est rendu en Markdown
- [ ] `[UI]` Bordure verte/bleue pour distinguer du contenu de l'apprenant

---

### TC-4.7 — Alignement PMI (outputs couverts)

| Champ | Detail |
|-------|--------|
| **US** | US-4.7 (P1) |
| **Role** | Apprenant |

#### Etapes detaillees

1. `[UI]` Sur la page d'evaluation, localiser la Card **"Alignement PMI"**

#### Resultat attendu

- [ ] `[UI]` Liste des outputs PMI couverts (icone check verte)
- [ ] `[UI]` Liste des outputs PMI manquants (icone X rouge)
- [ ] `[UI]` Score de couverture (ex: "3/5 outputs couverts - 60%") avec badge

---

### TC-4.8 — Reviser et resoumettre un livrable

| Champ | Detail |
|-------|--------|
| **US** | US-4.8 (P0) |
| **Role** | Apprenant |
| **Endpoint API** | `POST /api/v1/simulations/:simId/deliverables/:id/revise` |
| **Precondition** | Livrable evalue avec score < 100 |

#### Etapes detaillees

1. `[UI]` Sur la page d'evaluation, observer le bouton **"Reviser"**
2. `[BOUTON]` Cliquer sur **"Reviser"**
3. `[UI]` L'editeur s'ouvre avec le contenu precedent
4. `[UI]` Observer l'indicateur **"Revision 2/5"** (ou X/Y selon le profil)
5. `[CHAMP]` Modifier le contenu en ajoutant les sections manquantes
6. `[BOUTON]` Cliquer sur **"Soumettre pour evaluation"** a nouveau
7. `[UI]` Observer la nouvelle note

#### Resultat attendu

- [ ] `[UI]` L'indicateur de revision affiche "Revision 2/5" (profil ZERO_EXPERIENCE)
- [ ] `[UI]` L'historique des evaluations precedentes est visible (section collapsible)
- [ ] `[UI]` La nouvelle evaluation devrait avoir un score superieur
- [ ] `[API]` `POST /simulations/:simId/deliverables/:id/revise` remet le statut en DRAFT

#### Tests d'erreur

| Action | Erreur attendue |
|--------|----------------|
| Reviser au-dela du max (ex: 6e revision pour ZERO_EXP) | `[UI]` "Nombre maximum de revisions atteint" |
| `[API]` | 400 : "Maximum revision count reached" |

---

### TC-4.9 — Creer un compte-rendu de reunion

| Champ | Detail |
|-------|--------|
| **US** | US-4.9 (P0) |
| **Role** | Apprenant |
| **Endpoint API** | `POST /api/v1/simulations/:simId/meetings/:meetingId/create-minutes` |
| **Precondition** | Reunion terminee |

#### Etapes detaillees

1. `[UI]` Apres une reunion virtuelle, une notification invite a rediger le CR
2. `[BOUTON]` Cliquer sur **"Rediger le compte-rendu"**
3. `[UI]` L'editeur s'ouvre avec un livrable de type `meeting-minutes`
4. `[CHAMP]` Rediger le CR de memoire (sans notes)
5. `[BOUTON]` Cliquer sur **"Soumettre"**

#### Resultat attendu

- [ ] `[UI]` Le livrable `meeting-minutes` est cree automatiquement
- [ ] `[UI]` Le titre pre-rempli mentionne la reunion (ex: "CR — Reunion de lancement")
- [ ] `[API]` `POST /simulations/:simId/meetings/:meetingId/create-minutes` cree le livrable

---

### TC-4.10 — Comparaison du CR apprenant vs CR genere par l'IA

| Champ | Detail |
|-------|--------|
| **US** | US-4.10 (P0) |
| **Role** | Apprenant |
| **Precondition** | CR soumis et evalue (TC-4.9) |

#### Etapes detaillees

1. `[UI]` Sur la page d'evaluation du CR, localiser la section **"Comparaison"**

#### Resultat attendu

- [ ] `[UI]` **Vue comparee** : CR de l'apprenant (bordure verte) vs CR IA (bordure bleue)
- [ ] `[UI]` Score de couverture affiche (ex: "75% de couverture")
- [ ] `[UI]` Les differences structurelles sont mises en evidence
- [ ] `[UI]` Les points manques dans le CR apprenant sont signales

---

## EPIC 5 — Immersion Narrative

---

### TC-5.1 — Recevoir l'email de bienvenue du DRH

| Champ | Detail |
|-------|--------|
| **US** | US-5.1 (P1) |
| **Role** | Apprenant |
| **Route UI** | `/simulations/:id/emails` |
| **Endpoint API** | `POST /api/v1/simulations/:simId/emails/generate-welcome` |
| **Precondition** | Nouvelle simulation creee |

#### Etapes detaillees

1. `[UI]` Creer une simulation via `/simulations/new` en choisissant un scenario
2. `[BOUTON]` Cliquer sur **"Demarrer la simulation"**
3. `[UI]` Une fois la simulation creee, naviguer vers le menu **"Emails"** ou cliquer sur l'icone enveloppe
4. `[UI]` La boite de reception s'affiche sur `/simulations/:id/emails`

#### Resultat attendu

- [ ] `[UI]` Un email de bienvenue est present dans la boite de reception
- [ ] `[UI]` Expediteur : **"DRH"** ou **"Direction des Ressources Humaines"**
- [ ] `[UI]` Objet : contient "Bienvenue" ou "Integration"
- [ ] `[UI]` Badge **"NON LU"** affiche sur l'email
- [ ] `[UI]` Le contenu de l'email mentionne :
  - Le nom de l'entreprise
  - Le poste du joueur
  - La culture d'entreprise
  - Les attentes generales

#### Verification API

```
GET /api/v1/simulations/<simId>/emails
Authorization: Bearer <token_user>

Reponse 200 :
[
  {
    "id": "...",
    "from": "Direction des Ressources Humaines",
    "subject": "Bienvenue chez TechCorp — Votre integration",
    "content": "Cher(e) collegue, nous sommes ravis...",
    "priority": "MEDIUM",
    "status": "UNREAD",
    "phaseOrder": 1,
    "createdAt": "..."
  }
]
```

#### Variation par culture

| Culture | Ton attendu dans l'email |
|---------|------------------------|
| STRICT | Formel : "Nous vous prions de prendre connaissance des procedures..." |
| AGILE | Decontracte : "Bienvenue dans l'equipe ! On est contents de t'avoir..." |
| COLLABORATIVE | Chaleureux : "Nous sommes ravis de vous accueillir parmi nous..." |

---

### TC-5.2 — Identite de l'entreprise visible

| Champ | Detail |
|-------|--------|
| **US** | US-5.2 (P1) |
| **Role** | Apprenant |
| **Route UI** | `/simulations/:id/intranet` |

#### Etapes detaillees

1. `[UI]` Naviguer vers `/simulations/:id/intranet`

#### Resultat attendu

- [ ] `[UI]` Nom de l'entreprise affiche en grand (titre)
- [ ] `[UI]` Secteur d'activite visible (ex: "Technologies de l'information")
- [ ] `[UI]` Taille de l'entreprise (ex: "250 employes")
- [ ] `[UI]` Culture affichee avec badge (STRICT/AGILE/COLLABORATIVE)
- [ ] `[UI]` Poste du joueur visible (ex: "Chef de projet IT")
- [ ] `[UI]` Logo ou identite visuelle coherente

---

### TC-5.3 — Influence de la culture sur le ton des interactions

| Champ | Detail |
|-------|--------|
| **US** | US-5.3 (P1) |
| **Role** | Apprenant |
| **Precondition** | Simulation avec culture STRICT |

#### Etapes detaillees

1. `[UI]` Creer une simulation avec un scenario de culture STRICT
2. `[UI]` Ouvrir le chat PMO
3. `[CHAMP]` Taper : `J'ai pris du retard sur le planning`
4. `[BOUTON]` Envoyer

#### Resultat attendu — Culture STRICT

- [ ] `[UI]` Le PMO repond de maniere formelle et exigeante
- [ ] `[UI]` Ex: "Le retard est inacceptable dans notre contexte. Quelles mesures correctives proposez-vous ?"
- [ ] `[UI]` La tolerance aux erreurs est faible
- [ ] `[UI]` Le feedback est direct et severe

#### Resultat attendu — Culture AGILE (a tester separement)

- [ ] `[UI]` Le PMO repond de maniere pragmatique
- [ ] `[UI]` Ex: "Pas de panique, voyons comment adapter le sprint. Quels items peut-on reporter ?"

#### Resultat attendu — Culture COLLABORATIVE (a tester separement)

- [ ] `[UI]` Le PMO repond de maniere empathique
- [ ] `[UI]` Ex: "Je comprends, voyons ensemble comment redistribuer la charge avec l'equipe."

---

### TC-5.4 — Reception d'emails simules en cours de simulation

| Champ | Detail |
|-------|--------|
| **US** | US-5.4 (P1) |
| **Role** | Apprenant |
| **Endpoint API** | `POST /api/v1/simulations/:simId/emails/generate` |
| **Precondition** | Simulation active, avancement de phase |

#### Donnees de test

```json
{
  "phaseOrder": 2
}
```

#### Etapes detaillees

1. `[UI]` Avancer la simulation a la phase 2 (PLANNING) via le bouton **"Phase suivante"**
2. `[UI]` Naviguer vers `/simulations/:id/emails`
3. `[UI]` Observer les nouveaux emails

#### Resultat attendu

- [ ] `[UI]` De nouveaux emails apparaissent dans la boite de reception
- [ ] `[UI]` Les expediteurs sont divers : Sponsor, Client, Equipe technique, etc.
- [ ] `[UI]` Les sujets sont contextuels a la phase PLANNING
- [ ] `[UI]` Badge compteur d'emails non lus dans le menu lateral

#### Verification API

```
POST /api/v1/simulations/<simId>/emails/generate
Authorization: Bearer <token_user>
Body: { "phaseOrder": 2 }

Reponse 201 :
[
  {
    "id": "...",
    "from": "Sponsor - M. Directeur",
    "subject": "Point sur le budget previsionnel",
    "priority": "HIGH",
    "status": "UNREAD"
  },
  {
    "id": "...",
    "from": "Equipe technique",
    "subject": "Question sur le perimetre technique",
    "priority": "MEDIUM",
    "status": "UNREAD"
  }
]
```

---

### TC-5.5 — Lire et repondre a un email

| Champ | Detail |
|-------|--------|
| **US** | US-5.5 (P1) |
| **Role** | Apprenant |
| **Route UI** | `/simulations/:id/emails/:emailId` |
| **Endpoint API** | `POST /api/v1/simulations/:simId/emails/:emailId/respond` |

#### Donnees de test

```json
{
  "response": "Bonjour M. Directeur,\n\nLe budget previsionnel est en cours de finalisation. Nous prevoyons un montant de 150k EUR reparti comme suit :\n- Developpement : 80k\n- Infrastructure : 40k\n- Tests et deploiement : 30k\n\nJe vous transmettrai le document complet d'ici vendredi.\n\nCordialement"
}
```

#### Etapes detaillees

1. `[UI]` Dans la boite de reception, cliquer sur un email non lu
2. `[UI]` La page `/simulations/:id/emails/:emailId` s'affiche
3. `[UI]` L'email complet s'affiche avec expediteur, date, contenu
4. `[UI]` Le statut passe automatiquement de "NON LU" a "LU"
5. `[BOUTON]` Cliquer sur **"Repondre"**
6. `[CHAMP]` Rediger la reponse dans la zone de texte
7. `[BOUTON]` Cliquer sur **"Envoyer"**

#### Resultat attendu

- [ ] `[UI]` L'email est marque comme lu (badge disparait)
- [ ] `[UI]` La zone de reponse s'ouvre sous l'email
- [ ] `[UI]` Apres envoi, l'IA evalue la reponse
- [ ] `[UI]` Feedback affiche : pertinence (score), ton (adequat/inadequat), qualite
- [ ] `[API]` `POST /simulations/:simId/emails/:emailId/respond` retourne l'evaluation

#### Verification API

```
POST /api/v1/simulations/<simId>/emails/<emailId>/respond
Authorization: Bearer <token_user>
Body: { "response": "Bonjour M. Directeur..." }

Reponse 200 :
{
  "evaluation": {
    "relevanceScore": 85,
    "toneAppropriate": true,
    "feedback": "Reponse claire et structuree. Le detail du budget est apprecie."
  }
}
```

#### Tests d'erreur

| Action | Erreur attendue |
|--------|----------------|
| Reponse vide | `[UI]` Bouton "Envoyer" desactive |
| Reponse > 5000 caracteres | `[API]` 400 : "response must be shorter than or equal to 5000 characters" |

---

### TC-5.6 — Prioriser des emails simultanees

| Champ | Detail |
|-------|--------|
| **US** | US-5.6 (P2) |
| **Role** | Apprenant |
| **Endpoint API** | `POST /api/v1/simulations/:simId/emails/generate-simultaneous` |

#### Etapes detaillees

1. `[API]` Declencher la generation d'emails simultanes :
   ```
   POST /api/v1/simulations/<simId>/emails/generate-simultaneous
   Body: { "phaseOrder": 3 }
   ```
2. `[UI]` Naviguer vers `/simulations/:id/emails`
3. `[UI]` Observer les 3+ emails arrives en meme temps

#### Resultat attendu

- [ ] `[UI]` 3+ emails avec des priorites differentes :
  - **HIGH** (rouge) : ex: "URGENT — Probleme serveur de production"
  - **MEDIUM** (orange) : ex: "Reunion de suivi demain"
  - **LOW** (gris) : ex: "Newsletter interne — Equipe du mois"
- [ ] `[UI]` Les badges de priorite sont visuellement distincts
- [ ] `[UI]` L'ordre de traitement impacte les KPIs (repondre d'abord au HIGH = bonus)

---

### TC-5.7 — Reunion avec le Sponsor en phase Initiation

| Champ | Detail |
|-------|--------|
| **US** | US-5.7 (P1) |
| **Role** | Apprenant |
| **Precondition** | Simulation en phase INITIATION |

#### Etapes detaillees

1. `[UI]` En phase d'initiation, aller sur le dashboard simulation (`/simulations/:id/dashboard`)
2. `[BOUTON]` Chercher l'option **"Reunion avec le Sponsor"** ou **"Demarrer une reunion"**
3. `[UI]` La reunion virtuelle demarre avec le Sponsor (avatar IA)
4. `[CHAMP]` Poser des questions : "Quels sont les objectifs prioritaires du projet ?"

#### Resultat attendu

- [ ] `[UI]` La reunion avec le Sponsor est accessible uniquement en phase INITIATION
- [ ] `[UI]` Le Sponsor IA repond de maniere coherente avec le scenario
- [ ] `[UI]` Les reponses clarifient les objectifs, le budget et les contraintes
- [ ] `[UI]` Un livrable `meeting-minutes` est cree apres la reunion

---

### TC-5.8 — Recevoir et gerer une demande de changement client

| Champ | Detail |
|-------|--------|
| **US** | US-5.8 (P1) |
| **Role** | Apprenant |
| **Endpoint API** | `POST /api/v1/simulations/:simId/emails/generate-change-request` |
| **Precondition** | Simulation en phase EXECUTION |

#### Etapes detaillees

1. `[API]` Generer une demande de changement :
   ```
   POST /api/v1/simulations/<simId>/emails/generate-change-request
   Authorization: Bearer <token_user>
   ```
2. `[UI]` Naviguer vers la boite mail
3. `[UI]` Ouvrir l'email de demande de changement
4. `[UI]` Analyser l'impact propose
5. `[BOUTON]` Accepter ou refuser le changement

#### Resultat attendu

- [ ] `[UI]` Email du client avec une demande de modification du perimetre
- [ ] `[UI]` L'analyse d'impact est presentee :
  - Impact budget : ex: "+15k EUR"
  - Impact delai : ex: "+2 semaines"
  - Impact qualite : ex: "Risque de regression"
- [ ] `[UI]` Deux boutons : **"Accepter le changement"** / **"Refuser le changement"**
- [ ] `[UI]` La decision impacte les KPIs immediatement
- [ ] `[UI]` Un livrable de type `change-request` est genere automatiquement

---

## EPIC 6 — Adaptation par Profil

---

### TC-6.1 — Mode "Coach Patient" pour profil zero experience

| Champ | Detail |
|-------|--------|
| **US** | US-6.1 (P1) |
| **Role** | Apprenant (profil `ZERO_EXPERIENCE`) |
| **Precondition** | UserProfile.profileType = ZERO_EXPERIENCE |

#### Etapes detaillees

1. `[UI]` Se connecter avec un compte dont le profil est ZERO_EXPERIENCE
2. `[UI]` Ouvrir le chat PMO (`/simulations/:id/pmo`)
3. `[UI]` Observer les messages du PMO

#### Resultat attendu

- [ ] `[UI]` Avant chaque demande de livrable, le PMO explique **"pourquoi"** :
  - Ex: "La charte de projet est importante parce qu'elle formalise l'accord entre toutes les parties prenantes. Sans elle, les objectifs risquent d'etre mal compris."
- [ ] `[UI]` Le ton est **pedagogique et encourageant**
- [ ] `[UI]` Les explications sont plus longues et detaillees que pour un profil avance
- [ ] `[UI]` Le PMO utilise des analogies et des exemples concrets

#### Comparaison avec profil REINFORCEMENT

| Aspect | ZERO_EXPERIENCE | REINFORCEMENT |
|--------|----------------|---------------|
| Explication du "pourquoi" | Oui, detaillee | Non, directe |
| Ton | Bienveillant, patient | Exigeant, professionnel |
| Longueur des reponses | Longues | Courtes et directes |

---

### TC-6.2 — Tooltips glossaire PMI contextuels

| Champ | Detail |
|-------|--------|
| **US** | US-6.2 (P1) |
| **Role** | Apprenant (profil ZERO_EXPERIENCE ou BEGINNER) |
| **Endpoint API** | `GET /api/v1/reference-documents/glossary` |

#### Etapes detaillees

1. `[UI]` Naviguer dans la simulation (dashboard, livrables, etc.)
2. `[UI]` Survoler un terme PMI (ex: "WBS", "RACI", "Chemin critique")

#### Resultat attendu

- [ ] `[UI]` Un tooltip apparait au survol avec :
  - **Definition** : "WBS (Work Breakdown Structure) : Decomposition hierarchique du travail en lots"
  - **Exemple** : "Ex: Pour un site web, on decompose en : Design, Dev Front, Dev Back, Tests, Deploiement"
- [ ] `[UI]` Les termes soulignables sont marques visuellement (pointille, couleur)
- [ ] `[UI]` Les definitions proviennent du glossaire admin (EPIC 1, TC-1.9)

---

### TC-6.3 — Rollback de decision (zero experience)

| Champ | Detail |
|-------|--------|
| **US** | US-6.3 (P2) |
| **Role** | Apprenant (profil ZERO_EXPERIENCE) |
| **Endpoint API** | `POST /api/v1/simulations/:id/decisions/:decId/rollback` |
| **Precondition** | Decision prise avec mauvais resultat, profil ZERO_EXPERIENCE |

#### Etapes detaillees

1. `[UI]` Naviguer vers `/simulations/:id/decisions/:decId`
2. `[UI]` Prendre une decision (choisir l'option la moins favorable)
3. `[UI]` Observer le resultat negatif (KPIs baissent)
4. `[BOUTON]` Cliquer sur **"Revenir en arriere"** ou **"Annuler cette decision"**
5. `[UI]` Observer les KPIs restaures

#### Resultat attendu

- [ ] `[UI]` Le bouton "Revenir en arriere" est visible apres une mauvaise decision
- [ ] `[UI]` Compteur affiche : **"Retours en arriere restants : 3/3"** puis **"2/3"** apres usage
- [ ] `[UI]` Les KPIs sont restaures a l'etat precedent
- [ ] `[UI]` Un message pedagogique explique pourquoi c'etait une mauvaise decision

#### Verification API

```
POST /api/v1/simulations/<simId>/decisions/<decId>/rollback
Authorization: Bearer <token_user>

Reponse 200 :
{
  "success": true,
  "rollbacksRemaining": 2,
  "restoredKpis": { "budget": 85, "schedule": 78, "quality": 90 },
  "explanation": "L'option choisie aurait augmente les couts de 20%..."
}
```

#### Limites par profil

| Profil | Rollbacks max |
|--------|--------------|
| ZERO_EXPERIENCE | 3 |
| BEGINNER | 2 |
| RECONVERSION | 1 |
| REINFORCEMENT | 0 (pas de rollback) |

#### Tests d'erreur

| Action | Erreur attendue |
|--------|----------------|
| Rollback avec profil REINFORCEMENT | `[API]` 403 : "Rollback non disponible pour votre profil" |
| 4e rollback pour ZERO_EXP | `[API]` 400 : "Nombre maximum de rollbacks atteint" |

---

### TC-6.4 — Questions pedagogiques des avatars IA

| Champ | Detail |
|-------|--------|
| **US** | US-6.4 (P2) |
| **Role** | Apprenant (profil ZERO_EXPERIENCE) |

#### Etapes detaillees

1. `[UI]` Participer a une reunion avec des membres d'equipe IA
2. `[UI]` Observer les interventions des avatars

#### Resultat attendu

- [ ] `[UI]` Les avatars IA posent des questions pedagogiques :
  - Ex: "Avez-vous pense a identifier les risques lies a cette approche ?"
  - Ex: "Quel serait l'impact sur le budget si nous choisissions cette option ?"
- [ ] `[UI]` Les questions guident indirectement vers la bonne reponse
- [ ] `[UI]` Ce comportement est specifique au profil ZERO_EXPERIENCE

---

### TC-6.5 — Nombre de processus PMI actifs par profil

| Champ | Detail |
|-------|--------|
| **US** | US-6.5 (P0) |
| **Role** | Systeme |
| **Endpoint API** | `GET /api/v1/profile/adaptation` |

#### Etapes detaillees

1. `[API]` Avec un profil ZERO_EXPERIENCE :
   ```
   GET /api/v1/profile/adaptation
   Authorization: Bearer <token_user_zero_exp>
   ```
2. `[API]` Comparer avec un profil REINFORCEMENT

#### Resultat attendu

```
// Profil ZERO_EXPERIENCE
{
  "profileType": "ZERO_EXPERIENCE",
  "activePmiProcesses": 8,
  "pmiProcessList": ["4.1", "5.1", "5.2", "5.4", "6.1", "6.2", "10.1", "10.2"],
  ...
}

// Profil REINFORCEMENT
{
  "profileType": "REINFORCEMENT",
  "activePmiProcesses": 22,
  "pmiProcessList": ["4.1", "4.2", "4.3", "5.1", "5.2", "5.3", ...],
  ...
}
```

| Profil | Processus PMI actifs |
|--------|---------------------|
| ZERO_EXPERIENCE | 8-10 |
| BEGINNER | 12-15 |
| RECONVERSION | 15-20 |
| REINFORCEMENT | 20-25 |

---

### TC-6.6 — Ton du PMO adapte au profil

| Champ | Detail |
|-------|--------|
| **US** | US-6.6 (P0) |
| **Role** | Apprenant |

#### Etapes detaillees

1. `[UI]` Ouvrir le PMO avec un profil ZERO_EXPERIENCE
2. `[CHAMP]` Taper : `Je ne sais pas quoi faire`
3. `[UI]` Observer le ton de la reponse
4. `[UI]` Repeter avec un profil REINFORCEMENT

#### Resultat attendu par profil

| Profil | Ton (system prompt) | Exemple de reponse |
|--------|--------------------|--------------------|
| ZERO_EXPERIENCE | `patient_coach` | "Pas de souci, c'est normal ! Commençons par identifier ce que vous devez livrer. Regardons ensemble la liste..." |
| BEGINNER | `encouraging_mentor` | "Bonne question. Regardez votre liste de livrables, quel est le plus urgent selon vous ?" |
| RECONVERSION | `pragmatic_advisor` | "Priorisez. Consultez vos KPIs et concentrez-vous sur le livrable le plus en retard." |
| REINFORCEMENT | `demanding_expert` | "Analysez vos KPIs, identifiez le chemin critique et agissez. Vous avez les outils." |

---

### TC-6.7 — Nombre de revisions par profil

| Champ | Detail |
|-------|--------|
| **US** | US-6.7 (P1) |
| **Role** | Apprenant |

#### Verification

| Profil | Revisions max par livrable |
|--------|---------------------------|
| ZERO_EXPERIENCE | 5 |
| BEGINNER | 3 |
| RECONVERSION | 2 |
| REINFORCEMENT | 1 |

- [ ] `[UI]` L'indicateur "Revision X/Y" dans l'editeur affiche le bon maximum
- [ ] `[API]` Apres le max de revisions, `POST /deliverables/:id/revise` retourne 400

---

### TC-6.8 — Frequence des interventions proactives du PMO

| Champ | Detail |
|-------|--------|
| **US** | US-6.8 (P1) |
| **Role** | Systeme |

#### Resultat attendu

| Profil | Frequence d'intervention |
|--------|------------------------|
| ZERO_EXPERIENCE | Haute (rappels frequents, suggestions proactives) |
| BEGINNER | Moyenne |
| RECONVERSION | Faible |
| REINFORCEMENT | Minimale (uniquement sur demande ou erreur critique) |

- [ ] `[API]` `GET /profile/adaptation` retourne `interventionFrequency: "high"` pour ZERO_EXP

---

## EPIC 7 — Valorisation et Certification

---

### TC-7.1 — Debriefing complet de fin de simulation

| Champ | Detail |
|-------|--------|
| **US** | US-7.1 (P0) |
| **Role** | Apprenant |
| **Route UI** | `/simulations/:id/debriefing` |
| **Endpoint API** | `GET /api/v1/simulations/:simId/debriefing` |
| **Precondition** | Simulation terminee (phase CLOSURE completee) |

#### Etapes detaillees

1. `[UI]` Terminer une simulation (passer toutes les phases jusqu'a CLOSURE)
2. `[UI]` Cliquer sur **"Voir le debriefing"** dans le dashboard ou naviguer vers `/simulations/:id/debriefing`

#### Resultat attendu

- [ ] `[UI]` **Score global** : grand chiffre (ex: "78/100") avec cercle de progression
- [ ] `[UI]` **Scores par competence** (6 dimensions) :
  - Planification : X/100
  - Communication : X/100
  - Gestion des risques : X/100
  - Leadership : X/100
  - Rigueur documentaire : X/100
  - Adaptabilite : X/100
- [ ] `[UI]` **Points forts** : 3-5 bullet points avec icones vertes
- [ ] `[UI]` **Axes d'amelioration** : 3-5 bullet points avec icones orange
- [ ] `[UI]` **Recommandations** : paragraphe personnalise genere par l'IA

#### Verification API

```
GET /api/v1/simulations/<simId>/debriefing
Authorization: Bearer <token_user>

Reponse 200 :
{
  "globalScore": 78,
  "competencyScores": {
    "planning": 82,
    "communication": 75,
    "riskManagement": 68,
    "leadership": 80,
    "documentation": 85,
    "adaptability": 72
  },
  "strengths": [
    "Excellente structuration des livrables",
    "Communication claire avec les parties prenantes",
    "Bonne gestion du budget"
  ],
  "improvements": [
    "Renforcer l'identification des risques",
    "Ameliorer la reactivite face aux changements"
  ],
  "recommendations": "Nous vous recommandons de vous concentrer sur...",
  "closureMeetingCompleted": true
}
```

---

### TC-7.2 — Radar chart des 6 competences

| Champ | Detail |
|-------|--------|
| **US** | US-7.2 (P1) |
| **Role** | Apprenant |
| **Precondition** | Debriefing genere (TC-7.1) |

#### Etapes detaillees

1. `[UI]` Sur la page de debriefing, localiser la Card **"Competences evaluees"**

#### Resultat attendu

- [ ] `[UI]` Radar chart Recharts avec **6 axes** :
  - Planification
  - Communication
  - Gestion des risques
  - Leadership
  - Rigueur (documentaire)
  - Adaptabilite
- [ ] `[UI]` Les scores sont affiches sur chaque axe (valeurs 0-100)
- [ ] `[UI]` Le polygone colore represente le profil de l'apprenant
- [ ] `[UI]` La grille de fond (PolarGrid) est visible

---

### TC-7.3 — Exporter le portfolio en PDF

| Champ | Detail |
|-------|--------|
| **US** | US-7.3 (P0) |
| **Role** | Apprenant |
| **Route UI** | `/simulations/:id/portfolio` |
| **Endpoint API** | `GET /api/v1/simulations/:simId/portfolio` |

#### Etapes detaillees

1. `[UI]` Naviguer vers `/simulations/:id/portfolio`
2. `[UI]` Observer le contenu du portfolio (livrables, scores)
3. `[BOUTON]` Cliquer sur **"Exporter en PDF"**

#### Resultat attendu

- [ ] `[UI]` Toast : "Export PDF en cours..."
- [ ] `[UI]` La fenetre d'impression du navigateur s'ouvre (`window.print()`)
- [ ] `[UI]` Les boutons de navigation ont la classe `print:hidden` et n'apparaissent pas a l'impression
- [ ] `[UI]` Le portfolio imprime contient :
  - Score global
  - Liste des livrables avec scores
  - Section "Lecons apprises" (si livrables de type closure-report ou lessons-learned)
- [ ] `[API]` `GET /simulations/:simId/portfolio` retourne les donnees du portfolio

#### Verification API

```
GET /api/v1/simulations/<simId>/portfolio
Authorization: Bearer <token_user>

Reponse 200 :
{
  "simulation": { "id": "...", "scenario": { "title": "..." } },
  "globalScore": 78,
  "deliverables": [
    {
      "id": "...",
      "title": "Charte de projet",
      "type": "project-charter",
      "status": "VALIDATED",
      "score": 85,
      "grade": "A",
      "content": "..."
    }
  ],
  "badge": { "id": "...", "title": "...", "globalScore": 78 }
}
```

---

### TC-7.5 — Badge "Competence Verifiee"

| Champ | Detail |
|-------|--------|
| **US** | US-7.5 (P1) |
| **Role** | Apprenant |
| **Endpoint API** | `GET /api/v1/users/me/badges` |
| **Precondition** | Simulation terminee et debriefing genere |

#### Etapes detaillees

1. `[UI]` Apres le debriefing, naviguer vers **"Mon Profil" > "Mes badges"** (`/profile/badges`)

#### Resultat attendu

- [ ] `[UI]` Un badge est genere avec :
  - Titre (ex: "Chef de projet IT - Niveau Confirme")
  - Score global
  - Date d'obtention
  - Scenario associe
- [ ] `[API]` `GET /users/me/badges` retourne la liste des badges

---

### TC-7.6 — Page de detail d'un badge

| Champ | Detail |
|-------|--------|
| **US** | US-7.6 (P1) |
| **Role** | Apprenant |
| **Route UI** | `/profile/badges/:badgeId` |
| **Endpoint API** | `GET /api/v1/badges/:id` |

#### Etapes detaillees

1. `[UI]` Sur `/profile/badges`, cliquer sur un badge
2. `[UI]` La page `/profile/badges/:badgeId` s'affiche

#### Resultat attendu

- [ ] `[UI]` Titre du badge en grand
- [ ] `[UI]` Score global avec cercle de progression
- [ ] `[UI]` Radar chart des competences
- [ ] `[UI]` Section debriefing resume
- [ ] `[UI]` Boutons d'action dans la toolbar :
  - **"Copier le lien"**
  - **"Partager sur LinkedIn"**
  - **"Partager"** (dialogue)
  - **"Debriefing complet"** (lien)

---

### TC-7.7 — Partager un badge sur LinkedIn et copier le lien

| Champ | Detail |
|-------|--------|
| **US** | US-7.7 (P3) |
| **Role** | Apprenant |
| **Precondition** | Badge existant (TC-7.5) |

#### Etapes detaillees

1. `[UI]` Sur `/profile/badges/:badgeId`
2. `[BOUTON]` Cliquer sur **"Copier le lien"**
3. `[UI]` Observer le toast
4. `[BOUTON]` Cliquer sur **"Partager sur LinkedIn"**
5. `[UI]` Observer l'ouverture d'un nouvel onglet

#### Resultat attendu

- [ ] `[UI]` "Copier le lien" → Toast **"Lien copie dans le presse-papiers"**
- [ ] `[UI]` Le lien copie est de la forme : `http://localhost:5173/badges/<badgeId>/verify`
- [ ] `[UI]` "Partager sur LinkedIn" → ouvre `https://www.linkedin.com/sharing/share-offsite/?url=...` dans un nouvel onglet
- [ ] `[UI]` La page publique `/badges/:badgeId/verify` est accessible **sans authentification**

#### Verification page publique

1. `[UI]` Ouvrir le lien copie dans un navigateur **en navigation privee** (non connecte)
2. `[UI]` La page de verification du badge s'affiche avec :
   - Titre du badge
   - Score
   - Date d'obtention
   - Logo ProjectSim360

---

### TC-7.8 — Suggestions de modifications CV

| Champ | Detail |
|-------|--------|
| **US** | US-7.8 (P2) |
| **Role** | Apprenant |
| **Route UI** | `/simulations/:id/cv-suggestions` |
| **Endpoint API** | `GET /api/v1/simulations/:simId/cv-suggestions` |

#### Etapes detaillees

1. `[UI]` Naviguer vers `/simulations/:id/cv-suggestions`

#### Resultat attendu

- [ ] `[UI]` Section **"Lignes d'experience"** : 3-5 lignes suggerees
  - Ex: "Pilotage d'un projet de migration cloud (budget 150k EUR, equipe de 8)"
  - Ex: "Gestion de 5 parties prenantes avec reporting hebdomadaire"
- [ ] `[UI]` Section **"Competences a mettre en avant"** : 5-8 competences
  - Ex: "Gestion de projet", "Planification", "Gestion des risques"
- [ ] `[BOUTON]` Bouton **"Copier"** a cote de chaque section
- [ ] `[UI]` Cliquer "Copier" → toast "Copie dans le presse-papiers"

---

### TC-7.9 — Premier CV pour profil zero experience

| Champ | Detail |
|-------|--------|
| **US** | US-7.9 (P2) |
| **Role** | Apprenant (profil ZERO_EXPERIENCE) |

#### Etapes detaillees

1. `[UI]` Avec un profil ZERO_EXPERIENCE, aller sur `/simulations/:id/cv-suggestions`
2. `[UI]` Localiser la section **"Votre premier CV"**

#### Resultat attendu

- [ ] `[UI]` Section **"Votre premier CV"** affichee (uniquement si profil ZERO_EXPERIENCE)
- [ ] `[UI]` Contenu genere par l'IA : section Experience complete (100-200 mots)
- [ ] `[BOUTON]` Bouton **"Copier"** fonctionnel
- [ ] `[UI]` Note d'information en bleu : **"Ce CV est genere a partir de votre simulation. Personnalisez-le avant de l'utiliser."**
- [ ] `[UI]` Cette section n'apparait PAS pour les profils BEGINNER, RECONVERSION, REINFORCEMENT

---

### TC-7.10 — Presentation finale au comite

| Champ | Detail |
|-------|--------|
| **US** | US-7.10 (P1) |
| **Role** | Apprenant |
| **Precondition** | Simulation en phase CLOSURE |

#### Etapes detaillees

1. `[UI]` Sur le debriefing (`/simulations/:id/debriefing`), faire defiler
2. `[UI]` Localiser la Card **"Presentation finale"**

#### Resultat attendu

- [ ] `[UI]` Card avec titre "Presentation finale"
- [ ] `[UI]` Description du processus de soutenance
- [ ] `[UI]` Badge selon etat :
  - **"Presentation effectuee"** (badge vert `success`) si `closureMeetingCompleted: true`
  - **"Presentation non effectuee"** (badge orange `warning`) si `false`

---

### TC-7.11 — Document de lecons apprises

| Champ | Detail |
|-------|--------|
| **US** | US-7.11 (P1) |
| **Role** | Apprenant |

#### Etapes detaillees

1. `[UI]` En phase CLOSURE, aller sur `/simulations/:id/deliverables`
2. `[UI]` Trouver le livrable de type `lessons-learned`
3. `[BOUTON]` Cliquer pour l'editer
4. `[CHAMP]` Rediger les lecons apprises
5. `[BOUTON]` Soumettre pour evaluation
6. `[UI]` Naviguer vers `/simulations/:id/portfolio`

#### Resultat attendu

- [ ] `[UI]` Le livrable `lessons-learned` est disponible en phase CLOSURE
- [ ] `[UI]` Apres soumission, il apparait dans la section **"Lecons apprises"** du portfolio
- [ ] `[UI]` La section portfolio affiche pour chaque lesson :
  - Titre
  - Badge de statut (COMPLETED vert / autre orange)
  - Note si evaluee
  - Apercu du contenu (4 lignes max avec `line-clamp-4`)

---

## EPIC 8 — Recrutement Cote Recruteur

---

### TC-8.1 — Connexion recruteur et acces au module

| Champ | Detail |
|-------|--------|
| **US** | US-8.1 (P0) |
| **Role** | Recruteur (`recruiter@sim360.dev`) |
| **Route UI** | `/recruitment/campaigns` |

#### Etapes detaillees

1. `[UI]` Naviguer vers `http://localhost:5173/auth/sign-in`
2. `[CHAMP]` Email : `recruiter@sim360.dev`
3. `[CHAMP]` Mot de passe : `Recruiter123!`
4. `[BOUTON]` Cliquer sur **"Se connecter"**
5. `[UI]` Observer le menu lateral

#### Resultat attendu

- [ ] `[UI]` Connexion reussie, redirection vers le dashboard
- [ ] `[UI]` Menu lateral contient la section **"Recrutement"** avec :
  - "Campagnes" → `/recruitment/campaigns`
  - "Nouvelle campagne" → `/recruitment/campaigns/new`
- [ ] `[UI]` Page `/recruitment/campaigns` accessible
- [ ] `[UI]` Note en bas de la page join : **"Vous etes recruteur ? Contactez-nous pour creer votre espace entreprise."**

#### Tests d'erreur

| Action | Erreur attendue |
|--------|----------------|
| user@sim360.dev tente d'acceder a `/recruitment/campaigns` | `[API]` 403 Forbidden (role USER insuffisant) |
| Mauvais mot de passe | `[UI]` "Identifiants incorrects" |

---

### TC-8.2 — Creer une campagne de recrutement (wizard multi-etapes)

| Champ | Detail |
|-------|--------|
| **US** | US-8.2 (P0) |
| **Role** | Recruteur |
| **Route UI** | `/recruitment/campaigns/new` |
| **Endpoint API** | `POST /api/v1/recruitment/campaigns` |

#### Donnees de test

```json
{
  "title": "Campagne Chef de Projet IT - Mars 2026",
  "jobTitle": "Chef de Projet IT Senior",
  "jobDescription": "Nous recherchons un chef de projet IT senior capable de piloter des projets de migration cloud et de transformation digitale. Le candidat ideal maitrise les methodologies PMI et a au moins 5 ans d'experience.",
  "requiredSkills": [
    { "skill": "Gestion de projet", "weight": 9 },
    { "skill": "Communication", "weight": 8 },
    { "skill": "Gestion des risques", "weight": 7 },
    { "skill": "Leadership", "weight": 8 },
    { "skill": "Methodologie Agile", "weight": 6 }
  ],
  "experienceLevel": "senior",
  "projectTypes": ["Migration cloud", "Transformation digitale"],
  "culture": "AGILE",
  "maxCandidates": 10
}
```

#### Etapes detaillees — Etape 1 : Poste

1. `[UI]` Naviguer vers `/recruitment/campaigns/new`
2. `[UI]` Le wizard s'affiche avec 3 etapes : **Poste** → **Culture** → **Recapitulatif**
3. `[CHAMP]` Titre de la campagne : `Campagne Chef de Projet IT - Mars 2026`
4. `[CHAMP]` Titre du poste : `Chef de Projet IT Senior`
5. `[CHAMP]` Description du poste : (texte ci-dessus)
6. `[CHAMP]` Niveau d'experience : selectionner `Senior`
7. `[CHAMP]` Types de projets : saisir `Migration cloud`, appuyer Entree, saisir `Transformation digitale`
8. `[UI]` Section **"Competences requises"** :
9. `[CHAMP]` Saisir `Gestion de projet` dans le champ texte
10. `[BOUTON]` Cliquer sur **"Ajouter"**
11. `[UI]` Un slider (1-10) apparait a cote de la competence
12. `[UI]` Glisser le slider a **9/10**
13. `[UI]` Repeter pour les 4 autres competences
14. `[CHAMP]` Max candidats : `10`
15. `[BOUTON]` Cliquer sur **"Suivant"**

#### Etapes detaillees — Etape 2 : Culture

16. `[UI]` 3 cards de culture s'affichent :
    - **Stricte / Predictive** (icone bouclier) — "Processus rigoureux, planification detaillee..."
    - **Agile / Iterative** (icone fleches) — "Sprints courts, adaptation continue..."
    - **Collaborative / Hybride** (icone personnes) — "Equilibre entre structure et flexibilite..."
17. `[BOUTON]` Cliquer sur la card **"Agile / Iterative"**
18. `[UI]` La card selectionnee a une bordure primaire et une icone check
19. `[UI]` Section upload de documents (optionnel, cf. TC-8.4)
20. `[BOUTON]` Cliquer sur **"Suivant"**

#### Etapes detaillees — Etape 3 : Recapitulatif

21. `[UI]` Le recapitulatif affiche :
    - Titre, poste, description
    - Competences avec poids
    - Culture selectionnee
    - Documents uploades (si applicable)
22. `[BOUTON]` Cliquer sur **"Creer la campagne"**

#### Resultat attendu

- [ ] `[UI]` Toast : "Campagne creee avec succes"
- [ ] `[UI]` Redirection vers `/recruitment/campaigns/:id`
- [ ] `[UI]` La campagne est en statut **DRAFT**
- [ ] `[API]` `POST /recruitment/campaigns` retourne la campagne creee

#### Verification API

```
POST /api/v1/recruitment/campaigns
Authorization: Bearer <token_recruiter>
Content-Type: application/json

Body: (donnees ci-dessus)

Reponse 201 Created :
{
  "id": "uuid-genere",
  "title": "Campagne Chef de Projet IT - Mars 2026",
  "jobTitle": "Chef de Projet IT Senior",
  "status": "DRAFT",
  "slug": "campagne-chef-de-projet-it-mars-2026-abc123",
  "culture": "AGILE",
  "maxCandidates": 10,
  "requiredSkills": [...],
  "createdAt": "..."
}
```

#### Tests d'erreur

| Action | Erreur attendue |
|--------|----------------|
| Titre vide | `[UI]` Champ en rouge, "Ce champ est requis" |
| Description < 10 caracteres | `[UI]` "La description doit faire au moins 10 caracteres" |
| 0 competences ajoutees | `[UI]` "Ajoutez au moins une competence" |
| Poids hors 1-10 | `[UI]` Slider bloque entre 1 et 10 |

---

### TC-8.3 — Definir la culture d'entreprise

| Champ | Detail |
|-------|--------|
| **US** | US-8.3 (P0) |
| **Role** | Recruteur |
| **Precondition** | Wizard etape 2 (TC-8.2) |

#### Resultat attendu (deja couvert dans TC-8.2 etape 2)

- [ ] `[UI]` 3 options presentees en cards avec icones distinctes
- [ ] `[UI]` Selection visuellement confirmee : bordure primaire + fond colore + icone check
- [ ] `[UI]` Une seule culture selectionnable a la fois
- [ ] `[UI]` La culture choisie influence :
  - Le ton du PMO dans les simulations des candidats
  - La tolerance aux erreurs
  - Les types d'evenements aleatoires

---

### TC-8.4 — Uploader des documents internes anonymises

| Champ | Detail |
|-------|--------|
| **US** | US-8.4 (P2) |
| **Role** | Recruteur |
| **Precondition** | Wizard etape 2 (TC-8.2) |

#### Etapes detaillees

1. `[UI]` A l'etape "Culture" du wizard, localiser la section **"Documents internes (optionnel)"**
2. `[BOUTON]` Cliquer sur la zone d'upload ou **"Choisir un fichier"**
3. `[UI]` Selectionner un fichier PDF (< 10 Mo)
4. `[UI]` Le fichier apparait dans la liste avec nom et taille
5. `[BOUTON]` Cliquer sur **"X"** pour supprimer un fichier
6. `[UI]` Ajouter un 2e fichier
7. `[UI]` Observer l'avertissement de securite

#### Resultat attendu

- [ ] `[UI]` Zone d'upload accepte : **PDF, DOCX** uniquement
- [ ] `[UI]` Limite : **10 Mo** par fichier, **5 fichiers** maximum
- [ ] `[UI]` Chaque fichier affiche : nom, taille (ex: "rapport-annuel.pdf — 2.3 Mo")
- [ ] `[BOUTON]` Bouton **"X"** pour supprimer chaque fichier
- [ ] `[UI]` Message d'avertissement jaune : **"Assurez-vous d'anonymiser les donnees sensibles"**
- [ ] `[UI]` Les documents sont visibles dans le recapitulatif (etape 3)

#### Tests d'erreur

| Action | Erreur attendue |
|--------|----------------|
| Fichier .xlsx ou .png | `[UI]` "Format non supporte. Seuls PDF et DOCX sont acceptes" |
| Fichier > 10 Mo | `[UI]` "Fichier trop volumineux (max 10 Mo)" |
| 6e fichier | `[UI]` "Maximum 5 fichiers atteint" |

---

### TC-8.5 — Generation automatique du scenario IA

| Champ | Detail |
|-------|--------|
| **US** | US-8.5 (P0) |
| **Role** | Recruteur |
| **Endpoint API** | `POST /api/v1/recruitment/campaigns/:id/generate-scenario` |
| **Precondition** | Campagne creee en DRAFT (TC-8.2) |

#### Etapes detaillees

1. `[UI]` Sur le detail de la campagne (`/recruitment/campaigns/:id`)
2. `[BOUTON]` Cliquer sur **"Generer le scenario"**
3. `[UI]` Indicateur de chargement "Generation du scenario par l'IA..."

#### Resultat attendu

- [ ] `[UI]` Le scenario est genere en 10-30 secondes
- [ ] `[UI]` Toast : "Scenario genere avec succes"
- [ ] `[UI]` Le scenario est adapte au poste, a la culture et aux competences
- [ ] `[API]` Le scenario est lie a la campagne

---

### TC-8.6 — Publier la campagne et obtenir le lien partageable

| Champ | Detail |
|-------|--------|
| **US** | US-8.6 (P0) |
| **Role** | Recruteur |
| **Endpoint API** | `POST /api/v1/recruitment/campaigns/:id/publish` |

#### Etapes detaillees

1. `[UI]` Sur le detail de la campagne en DRAFT
2. `[BOUTON]` Cliquer sur **"Publier la campagne"** ou **"Activer"**
3. `[UI]` Le statut passe a ACTIVE
4. `[UI]` Un lien de recrutement apparait
5. `[BOUTON]` Cliquer sur **"Copier le lien"**

#### Resultat attendu

- [ ] `[UI]` Statut passe de DRAFT (gris) a **ACTIVE** (vert)
- [ ] `[UI]` Lien affiche : `http://localhost:5173/recruitment/join/<slug>`
- [ ] `[BOUTON]` "Copier le lien" → toast **"Lien copie"**
- [ ] `[UI]` Option QR code disponible
- [ ] `[UI]` Le lien est accessible publiquement (tester en navigation privee)

---

### TC-8.7 — Barre de progression des candidats

| Champ | Detail |
|-------|--------|
| **US** | US-8.7 (P2) |
| **Role** | Recruteur |
| **Precondition** | Campagne avec `maxCandidates: 5` et des candidats |

#### Resultat attendu

- [ ] `[UI]` Barre de progression : **"X / 5 candidats"**
- [ ] `[UI]` A 80% (4/5) : badge **"Bientot complet"** (warning jaune)
- [ ] `[UI]` A 100% (5/5) : badge **"Campagne complete"** (destructive rouge)
- [ ] `[UI]` La couleur de la barre change progressivement :
  - < 80% : bleu/primaire
  - >= 80% : jaune/warning
  - 100% : rouge/destructive

---

### TC-8.8 — Fermer une campagne manuellement

| Champ | Detail |
|-------|--------|
| **US** | US-8.8 (P0) |
| **Role** | Recruteur |
| **Endpoint API** | `POST /api/v1/recruitment/campaigns/:id/close` |

#### Etapes detaillees

1. `[UI]` Sur le detail d'une campagne ACTIVE
2. `[BOUTON]` Cliquer sur **"Fermer la campagne"**
3. `[UI]` Dialogue de confirmation : "Etes-vous sur de vouloir fermer cette campagne ?"
4. `[BOUTON]` Cliquer sur **"Confirmer"**

#### Resultat attendu

- [ ] `[UI]` Statut passe a **CLOSED** (badge gris/rouge)
- [ ] `[UI]` Le lien public affiche **"Cette campagne est terminee"**
- [ ] `[API]` `POST /recruitment/campaigns/:id/close` retourne `{ "status": "CLOSED" }`
- [ ] `[UI]` Les candidats en cours peuvent terminer leur simulation

---

### TC-8.9 — Dashboard recruteur avec KPIs

| Champ | Detail |
|-------|--------|
| **US** | US-8.9 (P0) |
| **Role** | Recruteur |
| **Route UI** | `/recruitment/campaigns/:id` (onglet Dashboard) |
| **Endpoint API** | `GET /api/v1/recruitment/campaigns/:id/dashboard` |

#### Etapes detaillees

1. `[UI]` Sur `/recruitment/campaigns/:id`, cliquer sur l'onglet **"Dashboard"**

#### Resultat attendu

- [ ] `[UI]` **6 cards KPI** :
  | Card | Valeur attendue | Icone |
  |------|----------------|-------|
  | Total | Nombre total de candidats | Personnes |
  | En attente | Candidats PENDING | Horloge |
  | En cours | Candidats IN_PROGRESS | Fleche |
  | Termines | Candidats COMPLETED | Check |
  | Abandonnes | Candidats DROPPED | X |
  | Score moyen | Moyenne des scores (ex: "72%") | Etoile |
- [ ] `[UI]` **Taux de completion** : cercle de progression avec pourcentage
- [ ] `[UI]` **Score moyen** : cercle avec valeur

---

### TC-8.10 — Tableau des candidats avec details

| Champ | Detail |
|-------|--------|
| **US** | US-8.10 (P0) |
| **Role** | Recruteur |
| **Endpoint API** | `GET /api/v1/recruitment/campaigns/:id/candidates` |

#### Etapes detaillees

1. `[UI]` Sur le detail de la campagne, onglet **"Candidats"**

#### Resultat attendu

- [ ] `[UI]` Tableau avec colonnes :
  | Colonne | Contenu |
  |---------|---------|
  | Nom | Nom du candidat |
  | Email | Email |
  | Statut | Badge colore (PENDING=bleu, IN_PROGRESS=jaune, COMPLETED=vert, DROPPED=rouge) |
  | Phase en cours | Ex: "EXECUTION" |
  | Phase d'abandon | Rempli si DROPPED (ex: "PLANNING") |
  | Score | Ex: "78/100" (vide si non termine) |
  | Match | Ex: "85%" |
  | Date debut | Date d'inscription |
  | Date fin | Date de completion |
- [ ] `[UI]` Les lignes sont **cliquables** → navigation vers `/recruitment/campaigns/:id/candidates/:candidateId`
- [ ] `[UI]` Dropdown **"Trier par competence"** avec options : Score global, Hard Skills, Soft Skills, Fiabilite, Adaptabilite, Leadership

---

### TC-8.11 — Liste des campagnes avec statistiques

| Champ | Detail |
|-------|--------|
| **US** | US-8.11 (P1) |
| **Role** | Recruteur |
| **Route UI** | `/recruitment/campaigns` |
| **Endpoint API** | `GET /api/v1/recruitment/campaigns` |

#### Etapes detaillees

1. `[UI]` Naviguer vers `/recruitment/campaigns`

#### Resultat attendu

- [ ] `[UI]` Tableau avec colonnes : **Titre**, **Poste**, **Statut** (badge), **Candidats** (count), **Termines**, **Score moy.**, **Date**
- [ ] `[UI]` Filtre par statut : **DRAFT**, **ACTIVE**, **CLOSED**, **ARCHIVED**
- [ ] `[UI]` Colonne "Termines" affiche `completedCount`
- [ ] `[UI]` Colonne "Score moy." affiche `averageScore` (ex: "72%")
- [ ] `[UI]` Cliquer sur une ligne → detail de la campagne

#### Verification API

```
GET /api/v1/recruitment/campaigns?status=ACTIVE&page=1&limit=10
Authorization: Bearer <token_recruiter>

Reponse 200 :
{
  "data": [
    {
      "id": "...",
      "title": "Campagne Chef de Projet IT",
      "jobTitle": "Chef de Projet IT Senior",
      "status": "ACTIVE",
      "_count": { "candidates": 5 },
      "completedCount": 3,
      "averageScore": 72.5,
      "createdAt": "..."
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

---

## EPIC 9 — Recrutement Cote Candidat

---

### TC-9.1 — Page publique d'une campagne

| Champ | Detail |
|-------|--------|
| **US** | US-9.1 (P0) |
| **Role** | Candidat (non connecte) |
| **Route UI** | `/recruitment/join/:slug` |
| **Endpoint API** | `GET /api/v1/recruitment/join/:slug` |

#### Etapes detaillees

1. `[UI]` Ouvrir un navigateur en **navigation privee** (non connecte)
2. `[UI]` Coller le lien de recrutement : `http://localhost:5173/recruitment/join/<slug>`

#### Resultat attendu

- [ ] `[UI]` **Nom de l'entreprise** affiche en badge en haut
- [ ] `[UI]` **Titre du poste** visible en grand
- [ ] `[UI]` Sous-titre : **"Evaluation par simulation de gestion de projet"**
- [ ] `[UI]` Description du processus de simulation
- [ ] `[UI]` **3 cards d'information** :
  - "Decisions strategiques" — "Prenez des decisions qui impactent le projet"
  - "Reunions virtuelles" — "Echangez avec des participants IA"
  - "Livrables professionnels" — "Produisez des documents de gestion de projet"
- [ ] `[UI]` Duree estimee affichee : **"~1 heure"** avec icone horloge
- [ ] `[BOUTON]` **"Commencer l'evaluation"** visible et actif
- [ ] `[UI]` Note : **"Vous serez guide etape par etape tout au long de la simulation"**

#### Verification API (endpoint public)

```
GET /api/v1/recruitment/join/<slug>
(PAS de header Authorization — endpoint public)

Reponse 200 :
{
  "campaign": {
    "title": "Campagne Chef de Projet IT",
    "jobTitle": "Chef de Projet IT Senior",
    "companyName": "...",
    "culture": "AGILE",
    "status": "ACTIVE"
  }
}
```

#### Cas campagne fermee

1. `[UI]` Acceder a une campagne CLOSED
2. `[UI]` Le message **"Cette campagne est terminee"** s'affiche
3. `[UI]` Le bouton "Commencer" est masque ou desactive

#### Cas campagne complete

1. `[UI]` Acceder a une campagne avec max candidats atteint
2. `[UI]` Le message **"Cette campagne a atteint le nombre maximum de candidats"** s'affiche

---

### TC-9.2 — Inscription et association a la campagne

| Champ | Detail |
|-------|--------|
| **US** | US-9.2 (P0) |
| **Role** | Candidat |
| **Endpoint API** | `POST /api/v1/recruitment/join/:slug/start` |

#### Etapes detaillees

1. `[UI]` Sur la page publique, cliquer sur **"Commencer l'evaluation"**
2. `[UI]` Redirection vers la page de connexion/inscription si non connecte
3. `[UI]` Creer un compte ou se connecter
4. `[UI]` Retour automatique sur la page de la campagne

#### Resultat attendu

- [ ] `[UI]` Apres authentification, association automatique a la campagne
- [ ] `[API]` `POST /recruitment/join/:slug/start` cree le CandidateResult et la simulation
- [ ] `[UI]` Redirection vers la simulation : `/simulations/<simulationId>`

---

### TC-9.3 — Profiling accelere du candidat

| Champ | Detail |
|-------|--------|
| **US** | US-9.3 (P0) |
| **Role** | Candidat |

#### Etapes detaillees

1. `[UI]` Apres le join, le candidat passe un profiling rapide
2. `[UI]` Option 1 : Connecter LinkedIn (rapide)
3. `[UI]` Option 2 : Questionnaire court (5 questions)
4. `[BOUTON]` Valider

#### Resultat attendu

- [ ] `[UI]` Le profiling est **accelere** (pas le onboarding complet de l'EPIC 2)
- [ ] `[UI]` 5 questions maximum
- [ ] `[UI]` Le profil est cree et associe a la campagne
- [ ] `[UI]` Redirection vers la simulation apres profiling

---

### TC-9.4 — Simulation calibree pour ~1 heure

| Champ | Detail |
|-------|--------|
| **US** | US-9.4 (P0) |
| **Role** | Candidat |
| **Precondition** | Profiling complete, scenario genere |

#### Resultat attendu

- [ ] `[UI]` La simulation utilise le scenario genere pour la campagne
- [ ] `[UI]` Les phases sont compressees pour une duree cible de ~1h
- [ ] `[UI]` La culture d'entreprise influence le PMO
- [ ] `[UI]` Les competences evaluees correspondent aux `requiredSkills` du poste

---

### TC-9.5 — Ecran final du candidat

| Champ | Detail |
|-------|--------|
| **US** | US-9.5 (P1) |
| **Role** | Candidat |
| **Precondition** | Simulation terminee |

#### Resultat attendu

- [ ] `[UI]` Score global affiche (grand chiffre)
- [ ] `[UI]` Message de remerciement
- [ ] `[BOUTON]` Option **"Voir le debriefing simplifie"**
- [ ] `[UI]` Navigation possible vers le debriefing complet

---

## EPIC 10 — Recrutement Analyse et Decision

---

### TC-10.1 — Rapport 360 d'un candidat

| Champ | Detail |
|-------|--------|
| **US** | US-10.1 (P0) |
| **Role** | Recruteur |
| **Route UI** | `/recruitment/campaigns/:id/candidates/:candidateId` |
| **Endpoint API** | `GET /api/v1/recruitment/campaigns/:id/candidates/:candidateId` |
| **Precondition** | Candidat avec simulation terminee |

#### Etapes detaillees

1. `[UI]` Sur le detail de la campagne, onglet Candidats
2. `[BOUTON]` Cliquer sur la ligne d'un candidat **COMPLETED**
3. `[UI]` La page du rapport s'affiche

#### Resultat attendu

- [ ] `[UI]` **Score global** : grand cercle avec chiffre (ex: "78/100")
- [ ] `[UI]` **5 dimensions evaluees** :
  | Dimension | Description |
  |-----------|------------|
  | Hard Skills | Maitrise PMI, precision planification, gestion budget |
  | Soft Skills | Communication, reaction au stress, negociation |
  | Fiabilite | Respect des engagements, coherence des livrables |
  | Adaptabilite | Reaction aux changements, gestion des imprevus |
  | Leadership | Prise de decision, gestion d'equipe |
- [ ] `[UI]` Chaque dimension a un score sur 100

---

### TC-10.2 — Vue synthetique avec radar et points forts/faibles

| Champ | Detail |
|-------|--------|
| **US** | US-10.2 (P0) |
| **Role** | Recruteur |

#### Resultat attendu

- [ ] `[UI]` **Radar chart** avec les 5 dimensions du TC-10.1
- [ ] `[UI]` **3 points forts** (icone check verte) :
  - Ex: "Excellente structuration des livrables"
- [ ] `[UI]` **3 points faibles** (icone warning orange) :
  - Ex: "Gestion des risques insuffisante"
- [ ] `[UI]` **Pourcentage de match** avec barre de progression

---

### TC-10.3 — Justification IA detaillee

| Champ | Detail |
|-------|--------|
| **US** | US-10.3 (P0) |
| **Role** | Recruteur |

#### Resultat attendu

- [ ] `[UI]` Section **"Analyse IA"** ou **"Justification"**
- [ ] `[UI]` Texte de **300-500 mots**
- [ ] `[UI]` Le texte contient des **exemples concrets** tires de la simulation :
  - Ex: "Le candidat a su gerer efficacement la demande de changement en phase d'execution..."
  - Ex: "Cependant, le registre des risques n'a pas ete mis a jour apres la phase de planning..."
- [ ] `[UI]` Ton objectif et factuel

---

### TC-10.4 — Classement automatique des candidats (shortlist)

| Champ | Detail |
|-------|--------|
| **US** | US-10.4 (P0) |
| **Role** | Recruteur |
| **Route UI** | `/recruitment/campaigns/:id/shortlist` |
| **Endpoint API** | `GET /api/v1/recruitment/campaigns/:id/shortlist` |

#### Etapes detaillees

1. `[UI]` Sur le detail de la campagne
2. `[BOUTON]` Cliquer sur **"Generer la shortlist"** ou naviguer vers l'onglet Shortlist

#### Resultat attendu

- [ ] `[UI]` Header : **"Sur X candidats, voici les Y que nous recommandons"**
- [ ] `[UI]` Candidats classes par score decroissant
- [ ] `[UI]` Chaque candidat affiche :
  - **Numero de position** (1, 2, 3...)
  - **Nom**
  - **Score global** (ex: "82/100")
  - **Justification IA courte** (1 ligne)

---

### TC-10.5 — Selectionner des candidats pour comparaison

| Champ | Detail |
|-------|--------|
| **US** | US-10.5 (P0) |
| **Role** | Recruteur |

#### Etapes detaillees

1. `[UI]` Sur la page shortlist, cocher **2 candidats**
2. `[UI]` Observer le texte d'instruction et le bouton

#### Resultat attendu

- [ ] `[UI]` Texte : **"Selectionnez 2 candidats pour les comparer"**
- [ ] `[UI]` Cases a cocher a cote de chaque candidat
- [ ] `[BOUTON]` **"Comparer"** apparait quand exactement 2 sont selectionnes
- [ ] `[UI]` Le bouton est desactive si 0 ou 1 selectionne
- [ ] `[BOUTON]` Bouton "Comparer" aussi visible dans la toolbar (haut de page)

---

### TC-10.6 — Trier les candidats par competence

| Champ | Detail |
|-------|--------|
| **US** | US-10.6 (P1) |
| **Role** | Recruteur |

#### Etapes detaillees

1. `[UI]` Sur le tableau des candidats (onglet Candidats du detail campagne)
2. `[UI]` Localiser le dropdown **"Trier par competence"**
3. `[BOUTON]` Selectionner **"Hard Skills"**
4. `[UI]` Observer le re-tri du tableau
5. `[BOUTON]` Selectionner **"Leadership"**

#### Resultat attendu

- [ ] `[UI]` Options du dropdown :
  - Score global
  - Hard Skills
  - Soft Skills
  - Fiabilite
  - Adaptabilite
  - Leadership
- [ ] `[UI]` Le tableau est retrie selon la competence choisie
- [ ] `[UI]` L'ordre des candidats change visuellement

---

### TC-10.7 — Comparaison cote a cote de 2 candidats

| Champ | Detail |
|-------|--------|
| **US** | US-10.7 (P1) |
| **Role** | Recruteur |
| **Route UI** | `/recruitment/campaigns/:id/compare` |
| **Endpoint API** | `POST /api/v1/recruitment/campaigns/:id/compare` |
| **Precondition** | 2 candidats selectionnes (TC-10.5) |

#### Donnees de test

```json
{
  "candidateIds": ["uuid-candidat-1", "uuid-candidat-2"]
}
```

#### Etapes detaillees

1. `[UI]` Depuis la shortlist, selectionner 2 candidats
2. `[BOUTON]` Cliquer sur **"Comparer"**
3. `[UI]` La page `/recruitment/campaigns/:id/compare` s'affiche

#### Resultat attendu

- [ ] `[UI]` **Vue split** : Candidat A (gauche) | Candidat B (droite)
- [ ] `[UI]` **Radar charts** superposes ou cote a cote
- [ ] `[UI]` **Barres de comparaison** par competence (double barre)
- [ ] `[UI]` Section **"Analyse IA des differences"** :
  - Ex: "Le candidat A excelle en communication tandis que le candidat B montre de meilleures capacites en gestion des risques..."
- [ ] `[UI]` **Recommandation** texte de l'IA

---

### TC-10.8 — Guide d'entretien personnalise IA

| Champ | Detail |
|-------|--------|
| **US** | US-10.8 (P1) |
| **Role** | Recruteur |
| **Route UI** | `/recruitment/campaigns/:id/candidates/:candidateId/interview` |
| **Endpoint API** | `GET /api/v1/recruitment/campaigns/:id/candidates/:candidateId/interview-guide` |

#### Etapes detaillees

1. `[UI]` Sur le rapport d'un candidat
2. `[BOUTON]` Cliquer sur **"Guide d'entretien"**
3. `[UI]` La page s'affiche avec les questions

#### Resultat attendu

- [ ] `[UI]` **5-10 questions** personnalisees, chacune avec :
  | Element | Exemple |
  |---------|---------|
  | **Question** | "Lors de la simulation, vous avez choisi de reporter la livraison plutot que de reduire le perimetre. Pourquoi ?" |
  | **Contexte** | "Le candidat a fait face a un retard de 2 semaines en phase d'execution" |
  | **Insight attendu** | "Evaluer la capacite du candidat a justifier ses choix strategiques" |
- [ ] `[BOUTON]` **"Imprimer"** en haut a droite
- [ ] `[UI]` Cliquer "Imprimer" → `window.print()` ouvre la fenetre d'impression

---

### TC-10.9 — Partager le rapport candidat

| Champ | Detail |
|-------|--------|
| **US** | US-10.9 (P2) |
| **Role** | Recruteur |

#### Etapes detaillees

1. `[UI]` Sur le rapport candidat
2. `[BOUTON]` Cliquer sur **"Partager"**
3. `[UI]` Generer un lien securise

#### Resultat attendu

- [ ] `[UI]` Lien securise genere avec duree limitee
- [ ] `[UI]` Le lien donne acces en lecture seule au rapport
- [ ] `[UI]` Option de configuration de la duree (24h, 7 jours, 30 jours)

---

### TC-10.10 — Adequation poste vs candidat (Gap Analysis)

| Champ | Detail |
|-------|--------|
| **US** | US-10.10 (P1) |
| **Role** | Recruteur |
| **Precondition** | Rapport candidat avec requiredSkills dans la campagne |

#### Etapes detaillees

1. `[UI]` Sur le rapport candidat, faire defiler vers la section **"Adequation au poste"**

#### Resultat attendu

- [ ] `[UI]` **Pourcentage de match global** : grand cercle (ex: "85%")
- [ ] `[UI]` **Gap analysis par competence** :
  | Competence | Niveau requis | Niveau demontre | Ecart |
  |-----------|--------------|----------------|-------|
  | Gestion de projet | 9/10 | 8/10 | -1 (vert) |
  | Communication | 8/10 | 9/10 | +1 (vert) |
  | Gestion des risques | 7/10 | 5/10 | -2 (rouge) |
- [ ] `[UI]` **Barres de progression duales** pour chaque competence :
  - Barre bleue : niveau requis
  - Barre verte/rouge : niveau demontre
- [ ] `[UI]` **Code couleur** :
  - Vert si demontre >= requis
  - Rouge si demontre < requis
- [ ] `[UI]` **Valeur numerique de l'ecart** : "+1" ou "-2"

---

## Scenario Transverse — Parcours Complet Apprenant

> Ce scenario bout-en-bout couvre le parcours type d'un apprenant de l'inscription a la valorisation. Il traverse les EPICs 2, 3, 4, 5, 6 et 7.

### STE-01 — Parcours complet apprenant (zero experience)

| Champ | Detail |
|-------|--------|
| **US couvertes** | 2.2-2.7, 3.1-3.7, 4.1-4.10, 5.1-5.8, 6.1-6.8, 7.1-7.11 |
| **Role** | Nouvel utilisateur |
| **Duree estimee** | 45-60 min de test manuel |

#### Phase 1 — Inscription et Onboarding (EPIC 2)

1. Creer un nouveau compte via `/auth/sign-up`
2. Naviguer vers `/onboarding`
3. Uploader un CV PDF (TC-2.2) → verifier l'extraction
4. Remplir le questionnaire avec `experienceLevel: "none"` (TC-2.3)
5. Passer le test d'aptitude — 3 scenarios (TC-2.4) → profil ZERO_EXPERIENCE
6. Recevoir le diagnostic IA (TC-2.5) → verifier type ZERO_EXPERIENCE
7. Ajuster les competences (TC-2.6) → ajouter "Leadership"
8. Choisir le secteur "IT" (TC-2.7)
9. `[BOUTON]` Cliquer **"Terminer l'onboarding"**

**Verification** : `[API]` `GET /profile` retourne `profileType: "ZERO_EXPERIENCE"`

#### Phase 2 — Initiation (EPICs 3, 5, 6)

10. Creer une simulation : `/simulations/new` → choisir scenario "Refonte e-commerce"
11. Verifier l'email de bienvenue dans `/simulations/:id/emails` (TC-5.1)
12. Ouvrir le chat PMO (TC-3.5) → message RH puis PMO
13. Verifier le **mode Coach Patient** (TC-6.1) : le PMO explique le "pourquoi"
14. Demander un template (TC-3.4) → verifier le bloc code + bouton Copier
15. Observer les tooltips PMI (TC-6.2) au survol des termes
16. Verifier les deadlines dans le panneau contextuel (TC-3.7)

#### Phase 3 — Livrables Initiation (EPIC 4)

17. Aller sur `/simulations/:id/deliverables` (TC-4.3) → liste avec statuts
18. Ouvrir la Charte de projet → editeur Markdown (TC-4.1)
19. Copier le template, completer le contenu
20. Soumettre pour evaluation (TC-4.2) → attendre l'evaluation IA
21. Voir l'evaluation detaillee (TC-4.5) : score, grade, forces, lacunes
22. Voir l'exemple de reference (TC-4.6)
23. Voir l'alignement PMI (TC-4.7)
24. Reviser et resoumettre (TC-4.8) → verifier "Revision 2/5"

#### Phase 4 — Planning et Execution (EPICs 3, 4, 5, 6)

25. Avancer en phase PLANNING
26. Verifier les nouveaux emails (TC-5.4)
27. Prendre une decision → choisir option suboptimale
28. Utiliser le rollback (TC-6.3) → verifier KPIs restaures, compteur "2/3"
29. Participer a une reunion → observer questions pedagogiques des avatars (TC-6.4)
30. Rediger le CR de reunion (TC-4.9)
31. Comparer CR vs IA (TC-4.10) → bordures vertes/bleues
32. Avancer en phase EXECUTION
33. Recevoir une demande de changement (TC-5.8) → accepter/refuser
34. Gerer les emails simultanees avec priorites (TC-5.6)

#### Phase 5 — Monitoring et Closure (EPICs 4, 7)

35. Verifier les KPIs sur `/simulations/:id/kpis`
36. Avancer en phase CLOSURE
37. Rediger le lessons-learned (TC-7.11)
38. Presentation finale (TC-7.10)

#### Phase 6 — Valorisation (EPIC 7)

39. Voir le debriefing (`/simulations/:id/debriefing`) → score + radar (TC-7.1, TC-7.2)
40. Telecharger le portfolio PDF (TC-7.3) → verifier section "Lecons apprises"
41. Voir les suggestions CV (TC-7.8) → section "Votre premier CV" (TC-7.9)
42. Voir le badge (`/profile/badges`) (TC-7.5, TC-7.6)
43. Partager sur LinkedIn (TC-7.7) → copier le lien, verifier page publique

**Verification finale** :
- [ ] Le parcours se deroule sans erreur 500
- [ ] L'adaptation ZERO_EXPERIENCE est visible partout
- [ ] Les KPIs refletent les decisions prises
- [ ] Le portfolio contient tous les livrables soumis

---

## Scenario Transverse — Parcours Complet Recruteur

> Ce scenario couvre le cycle de vie complet d'une campagne de recrutement.

### STR-01 — Parcours complet recruteur + candidat

| Champ | Detail |
|-------|--------|
| **US couvertes** | 8.1-8.11, 9.1-9.5, 10.1-10.10 |
| **Roles** | Recruteur + Candidat |
| **Duree estimee** | 30-45 min (hors simulation candidat) |

#### Phase 1 — Configuration (Recruteur)

1. Se connecter : `recruiter@sim360.dev` / `Recruiter123!` (TC-8.1)
2. Creer une campagne avec le wizard (TC-8.2) :
   - Poste : "Chef de Projet Digital"
   - 5 competences avec poids
   - Culture : AGILE
   - Max candidats : 10
3. Uploader un document PDF (TC-8.4)
4. Generer le scenario IA (TC-8.5)
5. Publier la campagne (TC-8.6)
6. Copier le lien de recrutement

#### Phase 2 — Candidature (Candidat)

7. En navigation privee, ouvrir le lien (TC-9.1) → verifier la page publique
8. Cliquer "Commencer", s'inscrire (TC-9.2)
9. Profiling rapide (TC-9.3)
10. Demarrer la simulation (TC-9.4)
11. Terminer la simulation, voir l'ecran final (TC-9.5)

#### Phase 3 — Monitoring (Recruteur)

12. Retourner sur le detail de la campagne
13. Verifier le dashboard KPI (TC-8.9) : 1 candidat complete
14. Voir le candidat dans le tableau (TC-8.10)
15. Verifier les stats sur la liste des campagnes (TC-8.11)
16. Verifier la barre de progression (TC-8.7)

#### Phase 4 — Analyse (Recruteur)

17. Cliquer sur le candidat → rapport 360 (TC-10.1, TC-10.2, TC-10.3)
18. Verifier l'adequation au poste (TC-10.10) : gap analysis
19. Generer la shortlist (TC-10.4, TC-10.5)
20. Trier par competence (TC-10.6)
21. Selectionner 2 candidats, comparer (TC-10.7)
22. Generer le guide d'entretien (TC-10.8)
23. Partager le rapport (TC-10.9)

#### Phase 5 — Cloture (Recruteur)

24. Fermer la campagne (TC-8.8)
25. Verifier que le lien public affiche "Campagne terminee"
26. Archiver la campagne

**Verification finale** :
- [ ] Cycle complet DRAFT → ACTIVE → CLOSED fonctionne
- [ ] Le rapport candidat est coherent avec la simulation
- [ ] Shortlist, comparaison et guide d'entretien sont generes
- [ ] Les metriques du dashboard sont exactes

---

## Annexe — Matrice de couverture US / Test Cases

| US | Test Case(s) | Priorite |
|----|-------------|----------|
| US-1.1 | TC-1.1 | P0 |
| US-1.2 | TC-1.2 | P0 |
| US-1.3 | TC-1.3 | P0 |
| US-1.4 | TC-1.4 | P1 |
| US-1.5 | TC-1.5 | P0 |
| US-1.6 | TC-1.6 | P0 |
| US-1.7 | TC-1.7 | P1 |
| US-1.8 | TC-1.8 | P1 |
| US-1.9 | TC-1.9 | P1 |
| US-2.1 | TC-2.1 | P1 |
| US-2.2 | TC-2.2, STE-01.3 | P0 |
| US-2.3 | TC-2.3, STE-01.4 | P0 |
| US-2.4 | TC-2.4, STE-01.5 | P1 |
| US-2.5 | TC-2.5, STE-01.6 | P0 |
| US-2.6 | TC-2.6, STE-01.7 | P0 |
| US-2.7 | TC-2.7, STE-01.8 | P0 |
| US-2.8 | TC-2.8 | P2 |
| US-3.1 | TC-3.1, STE-01.14 | P0 |
| US-3.2 | TC-3.2, STE-01.16 | P0 |
| US-3.3 | TC-3.3, STE-01.16 | P0 |
| US-3.4 | TC-3.4, STE-01.14 | P0 |
| US-3.5 | TC-3.5, STE-01.12 | P1 |
| US-3.6 | TC-3.6, STE-01.12 | P0 |
| US-3.7 | TC-3.7, STE-01.16 | P0 |
| US-4.1 | TC-4.1, STE-01.18-19 | P0 |
| US-4.2 | TC-4.2, STE-01.20 | P0 |
| US-4.3 | TC-4.3, STE-01.17 | P0 |
| US-4.4 | TC-4.4 | P1 |
| US-4.5 | TC-4.5, STE-01.21 | P0 |
| US-4.6 | TC-4.6, STE-01.22 | P0 |
| US-4.7 | TC-4.7, STE-01.23 | P1 |
| US-4.8 | TC-4.8, STE-01.24 | P0 |
| US-4.9 | TC-4.9, STE-01.30 | P0 |
| US-4.10 | TC-4.10, STE-01.31 | P0 |
| US-5.1 | TC-5.1, STE-01.11 | P1 |
| US-5.2 | TC-5.2 | P1 |
| US-5.3 | TC-5.3 | P1 |
| US-5.4 | TC-5.4, STE-01.26 | P1 |
| US-5.5 | TC-5.5 | P1 |
| US-5.6 | TC-5.6, STE-01.34 | P2 |
| US-5.7 | TC-5.7 | P1 |
| US-5.8 | TC-5.8, STE-01.33 | P1 |
| US-6.1 | TC-6.1, STE-01.13 | P1 |
| US-6.2 | TC-6.2, STE-01.15 | P1 |
| US-6.3 | TC-6.3, STE-01.28 | P2 |
| US-6.4 | TC-6.4, STE-01.29 | P2 |
| US-6.5 | TC-6.5 | P0 |
| US-6.6 | TC-6.6 | P0 |
| US-6.7 | TC-6.7 | P1 |
| US-6.8 | TC-6.8 | P1 |
| US-7.1 | TC-7.1, STE-01.39 | P0 |
| US-7.2 | TC-7.2, STE-01.39 | P1 |
| US-7.3 | TC-7.3, STE-01.40 | P0 |
| US-7.4 | — (integre dans TC-7.3) | P2 |
| US-7.5 | TC-7.5, STE-01.42 | P1 |
| US-7.6 | TC-7.6, STE-01.42 | P1 |
| US-7.7 | TC-7.7, STE-01.43 | P3 |
| US-7.8 | TC-7.8, STE-01.41 | P2 |
| US-7.9 | TC-7.9, STE-01.41 | P2 |
| US-7.10 | TC-7.10, STE-01.38 | P1 |
| US-7.11 | TC-7.11, STE-01.37 | P1 |
| US-8.1 | TC-8.1, STR-01.1 | P0 |
| US-8.2 | TC-8.2, STR-01.2 | P0 |
| US-8.3 | TC-8.3, STR-01.2 | P0 |
| US-8.4 | TC-8.4, STR-01.3 | P2 |
| US-8.5 | TC-8.5, STR-01.4 | P0 |
| US-8.6 | TC-8.6, STR-01.5-6 | P0 |
| US-8.7 | TC-8.7, STR-01.16 | P2 |
| US-8.8 | TC-8.8, STR-01.24 | P0 |
| US-8.9 | TC-8.9, STR-01.13 | P0 |
| US-8.10 | TC-8.10, STR-01.14 | P0 |
| US-8.11 | TC-8.11, STR-01.15 | P1 |
| US-9.1 | TC-9.1, STR-01.7 | P0 |
| US-9.2 | TC-9.2, STR-01.8 | P0 |
| US-9.3 | TC-9.3, STR-01.9 | P0 |
| US-9.4 | TC-9.4, STR-01.10 | P0 |
| US-9.5 | TC-9.5, STR-01.11 | P1 |
| US-10.1 | TC-10.1, STR-01.17 | P0 |
| US-10.2 | TC-10.2, STR-01.17 | P0 |
| US-10.3 | TC-10.3, STR-01.17 | P0 |
| US-10.4 | TC-10.4, STR-01.19 | P0 |
| US-10.5 | TC-10.5, STR-01.19 | P0 |
| US-10.6 | TC-10.6, STR-01.20 | P1 |
| US-10.7 | TC-10.7, STR-01.21 | P1 |
| US-10.8 | TC-10.8, STR-01.22 | P1 |
| US-10.9 | TC-10.9, STR-01.23 | P2 |
| US-10.10 | TC-10.10, STR-01.18 | P1 |

**Total : 86 US → 64 test cases + 2 scenarios transverses = 100% de couverture**
