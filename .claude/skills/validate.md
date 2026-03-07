---
name: validate
description: Validates a completed User Story end-to-end before moving to the next one. Checks build, lint, types, API endpoints, and frontend pages.
disable-model-invocation: true
---

# /validate — Validation de User Story

Quand l'utilisateur invoque `/validate`, execute le workflow suivant de bout en bout.

## Workflow

### 1. Identifier la US a valider
- Demande a l'utilisateur quelle US valider (ex: "US-1.1") si non precise
- Lis le fichier `docs/US/validation-rules.md` pour trouver les criteres E2E de cette US
- Lis le fichier epic correspondant dans `docs/US/` pour les criteres d'acceptation

### 2. Verification technique (automatique)
Execute ces commandes dans l'ordre et rapporte les resultats :

```bash
# Build
pnpm --filter @sim360/core build
pnpm --filter @sim360/api build
pnpm --filter @sim360/webapp build

# Lint
pnpm lint

# Typecheck
pnpm typecheck
```

Si l'une echoue, STOP et rapporte l'erreur. Ne continue pas.

### 3. Verification API (si la US a un endpoint backend)
- Verifie que le serveur API peut demarrer : `pnpm --filter @sim360/api dev` (en background)
- Attend que `GET http://localhost:3001/health` reponde 200
- Execute les appels curl decrits dans les criteres E2E de la US
- Verifie les codes de reponse HTTP et la structure des donnees retournees
- Arrete le serveur

### 4. Verification Frontend (si la US a une page)
- Verifie que la webapp compile : `pnpm --filter @sim360/webapp build`
- Verifie que les routes sont enregistrees dans `app-routing.tsx`
- Verifie que les imports ne sont pas casses

### 5. Verification des criteres d'acceptation
Pour chaque critere d'acceptation de la US :
- Verifie dans le code que le critere est implemente
- Utilise Grep pour trouver les elements lies
- Rapporte : PASSE / ECHOUE / A VERIFIER MANUELLEMENT

### 6. Rapport de validation
Genere un rapport structure :

```
## Rapport de Validation — US-X.X

### Verification technique
- Build core   : OK/FAIL
- Build API    : OK/FAIL
- Build webapp : OK/FAIL
- Lint         : OK/FAIL
- Typecheck    : OK/FAIL

### Verification API
- Endpoint X   : OK/FAIL (details)

### Criteres d'acceptation
- Critere 1    : PASSE/ECHOUE/MANUEL
- Critere 2    : PASSE/ECHOUE/MANUEL

### Verdict : VALIDE / NON VALIDE
Raison si non valide : ...
```

### 7. Decision
- Si VALIDE : met a jour MEMORY.md avec la progression, propose de passer a la US suivante
- Si NON VALIDE : liste les corrections necessaires et propose de les implementer
