# EPIC 2 — Profiling et Analyse de l'Apprenant

> Le systeme comprend qui est l'utilisateur et ce qu'il veut devenir, pour personnaliser son parcours.
> C'est la phase "Cameleon" decrite dans Parcours_Utilisateur_PM.pdf.

---

## Ingestion de donnees

| ID | User Story | Criteres d'acceptation | Priorite |
|----|-----------|------------------------|----------|
| US-2.1 | En tant qu'apprenant, je veux connecter mon profil LinkedIn, afin que le systeme recupere automatiquement mon historique professionnel et mes competences. | - OAuth LinkedIn — Extraction : experiences pro, competences declarees, soft skills validees, reseau — Stockage dans `UserProfile.linkedinData` (JSON) — Gestion des erreurs si le profil est prive | P1 |
| US-2.2 | En tant qu'apprenant, je veux uploader mon CV au format PDF, afin que le systeme extraie mes informations meme si je n'ai pas LinkedIn. | - Upload PDF (max 5 Mo) — Extraction par IA : experiences, competences, formations, certifications — Stockage dans `UserProfile.cvData` (JSON) — Feedback visuel : "Nous avons detecte X experiences et Y competences" | P0 |
| US-2.3 | En tant qu'apprenant, je veux remplir un questionnaire d'intention, afin de preciser mes objectifs meme sans CV ni LinkedIn. | - Questions : quel est votre objectif ? (renforcer / reconversion / decouverte) ; domaine vise ? ; experience actuelle en gestion de projet ? (aucune / debutant / confirme) ; motivation principale ? — Reponses stockees dans `UserProfile.questionnaireData` | P0 |
| US-2.4 | En tant qu'apprenant sans aucune experience, je veux passer un test d'aptitude naturelle (mini-cas de 5 min), afin que l'IA evalue mon sens logique et mon organisation. | - Mini-scenario interactif : "Organiser un anniversaire avec 3 contraintes" — L'IA note : sens logique, capacite de priorisation, organisation naturelle — Resultat stocke dans le profil — Sert a orienter vers un parcours accessible | P1 |

---

## Diagnostic IA (Gap Analysis)

| ID | User Story | Criteres d'acceptation | Priorite |
|----|-----------|------------------------|----------|
| US-2.5 | En tant qu'apprenant, je veux recevoir un diagnostic personnalise (Gap Analysis) base sur mes donnees, afin de savoir quelles competences je dois travailler. | - Detection du profil type : `zero-experience` / `beginner` / `reconversion` / `reinforcement` — Liste des competences avec : nom, niveau actuel (none/basic/intermediate/advanced), niveau cible, ecart — Message personnalise : "Votre profil montre une forte expertise en Marketing, mais pour devenir Chef de Projet BTP, vous devez maitriser la gestion des sous-traitants." — Suggestion de secteur + difficulte | P0 |
| US-2.6 | En tant qu'apprenant, je veux voir les competences suggerees et pouvoir les accepter, modifier ou en ajouter, afin de personnaliser mon parcours. | - Liste de competences avec checkboxes pre-cochees — Possibilite d'ajouter des competences manuellement — Boutons "Accepter la suggestion" et "Personnaliser" | P0 |
| US-2.7 | En tant qu'apprenant, je veux choisir un secteur d'activite (IT, BTP, Sante, Marketing, Evenementiel...) ou accepter la suggestion de l'IA, afin que la simulation corresponde a mon objectif. | - Dropdown avec secteurs disponibles — Option "Suggestion IA" pre-selectionnee — Le secteur influence le scenario genere | P0 |
| US-2.8 | En tant qu'apprenant, je veux soumettre un projet reel que je connais, afin que l'IA genere une simulation basee sur ce cas concret. | - Formulaire : titre du projet, description, contexte, contraintes, livrables attendus — L'IA genere un scenario personnalise a partir de ces informations — Validation avant lancement | P2 |

---

## Notes techniques

- **Table Prisma** : `UserProfile` (nouveau)
- **Module backend** : `ProfileModule` (apps/api/src/modules/profile/)
- **Services** : `ProfileService` (CRUD profil), `ProfileAnalysisService` (IA — gap analysis)
- **Endpoints** : `POST /profile/upload-cv`, `POST /profile/questionnaire`, `POST /profile/analyze`, `POST /profile/aptitude-test`, `POST /profile/import-linkedin`
- **Frontend** : Pages d'onboarding sequentielles (`/onboarding/profile-import` → `/onboarding/questionnaire` → `/onboarding/diagnostic` → `/onboarding/choose-path`)
- **Dependances** : Aucune (peut etre developpe en parallele de l'EPIC 1)
