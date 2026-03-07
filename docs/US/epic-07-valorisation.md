# EPIC 7 — Valorisation et Certification

> L'apprenant repart avec des preuves tangibles de son experience.
> C'est "L'Avantage Injuste" decrit dans Parcours_Utilisateur_PM.pdf.

---

## Debriefing de fin de simulation

| ID | User Story | Criteres d'acceptation | Priorite |
|----|-----------|------------------------|----------|
| US-7.1 | En tant qu'apprenant, a la fin de la simulation, je veux recevoir un debriefing complet du PMO, afin de connaitre mon bilan global. | - Score global (0-100) + scores par competence — Points forts demontres — Axes d'amelioration prioritaires — Comparaison avec le profil ideal — Recommandations concretes de progression — Ton direct et sans filtre : *"Tu es excellent en planification, mais tu perds tes moyens en reunion de crise."* | P0 |
| US-7.2 | En tant qu'apprenant, je veux voir un graphique radar de mes competences dans le debriefing, afin de visualiser mes forces et faiblesses d'un coup d'oeil. | - Graphique radar avec axes : planification, communication, gestion des risques, leadership, rigueur documentaire, adaptabilite — Scores sur 100 pour chaque axe | P1 |

---

## Portfolio de livrables

| ID | User Story | Criteres d'acceptation | Priorite |
|----|-----------|------------------------|----------|
| US-7.3 | En tant qu'apprenant, je veux telecharger un portfolio PDF contenant tous les livrables que j'ai produits, afin de prouver mes competences aupres d'employeurs. | - Export PDF avec : page de garde (nom, simulation, date, score global), sommaire, chaque livrable avec son score et sa note, synthese finale — Estampille "Valide par ProjectSim360 (Standard PMI)" — Les livrables inclus sont ceux produits par l'apprenant, pas les references | P0 |
| US-7.4 | En tant qu'apprenant, je veux telecharger un ZIP avec tous mes livrables individuels, afin de les reutiliser comme exemples dans mon travail. | - Un fichier Markdown ou PDF par livrable — Fichier de synthese avec les scores — Noms de fichiers explicites : `01-charte-de-projet.pdf`, `02-wbs.pdf`, etc. | P2 |

---

## Badges et certification

| ID | User Story | Criteres d'acceptation | Priorite |
|----|-----------|------------------------|----------|
| US-7.5 | En tant qu'apprenant, je veux recevoir un badge de "Competence Verifiee" detaillant les situations gerees, afin d'enrichir mon profil. | - Badge genere automatiquement a la completion de la simulation — Texte specifique au vecu : "A gere avec succes un conflit fournisseur et un depassement budgetaire de 15%" — Inclut : competences validees, score, duree, difficulte du scenario | P1 |
| US-7.6 | En tant qu'apprenant, je veux consulter mes badges sur ma page profil, afin de voir mon parcours global et ma progression. | - Page `/profile/badges` — Liste des badges avec : titre, date, simulation associee, score, details — Visuel attractif (card avec icone/couleur selon le niveau) | P1 |
| US-7.7 | En tant qu'apprenant, je veux partager un badge sur LinkedIn ou par lien, afin de valoriser mon experience aupres de mon reseau. | - Bouton "Partager sur LinkedIn" — Lien public de verification : `/badges/:id/verify` — Page publique avec les details du badge (sans donnees sensibles) | P3 |

---

## Suggestions CV

| ID | User Story | Criteres d'acceptation | Priorite |
|----|-----------|------------------------|----------|
| US-7.8 | En tant qu'apprenant, je veux recevoir des suggestions de modifications pour mon CV apres la simulation, afin de valoriser mon experience. | - L'IA analyse le profil + resultats de la simulation — Suggestions concretes : lignes a ajouter a la section "Experience", competences a mettre en avant — Format actionnable et copiable | P2 |
| US-7.9 | En tant qu'apprenant sans experience, je veux que l'IA m'aide a creer mon premier CV de chef de projet, afin de devenir employable. | - L'IA dit : *"Tu n'avais pas d'experience, mais tu viens de gerer un projet de 3 mois simule en 4 heures. Tu as produit 5 documents. Voici comment les presenter sur ton CV."* — Generation d'un brouillon de section CV | P2 |

---

## Soutenance finale

| ID | User Story | Criteres d'acceptation | Priorite |
|----|-----------|------------------------|----------|
| US-7.10 | En tant qu'apprenant, en phase de cloture, je veux presenter mes resultats devant un "Comite de Direction" (agents IA), afin de pratiquer la soutenance de projet. | - Reunion speciale avec 3-4 membres du comite (DG, Directeur Financier, DSI, DRH — agents IA) — L'apprenant presente, le comite pose des questions — Evaluation : clarte de la presentation, maitrise du sujet, capacite a repondre aux objections | P1 |
| US-7.11 | En tant qu'apprenant, en phase de cloture, je veux documenter mes lecons apprises, afin de clore le projet selon les bonnes pratiques. | - Formulaire guide : qu'est-ce qui a bien fonctionne ? / qu'est-ce qui a mal fonctionne ? / que feriez-vous differemment ? — Evalue par le PMO comme un livrable — Fait partie du bilan de cloture | P1 |

---

## Notes techniques

- **Tables Prisma** : `CompetencyBadge` (nouveau)
- **Module backend** : `ValorizationModule` (apps/api/src/modules/valorization/)
- **Services** : `DebriefingService` (IA), `PortfolioService` (generation PDF/ZIP), `BadgeService`, `CvSuggestionService` (IA)
- **Endpoints** : `GET /simulations/:id/debriefing`, `GET /simulations/:id/portfolio?format=pdf|zip`, `GET /users/me/badges`, `GET /simulations/:id/cv-suggestions`
- **Frontend** : Pages `/simulation/:id/debriefing`, `/simulation/:id/portfolio`, `/profile/badges`, `/simulation/:id/cv-suggestions`, `/simulation/:id/closing/presentation`
- **Dependances** : EPIC 4 (livrables — le portfolio contient les livrables produits), EPIC 3 (PMO — le debriefing est genere par le PMO)
