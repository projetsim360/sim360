# EPIC 10 — Recrutement — Analyse et Decision

> L'IA analyse les candidats et aide le recruteur a prendre sa decision.
> C'est l'"Analyse Cognitive et Comportementale" et le "Score Licorne" decrits dans Parcours_Utilisateur_Business.pdf.

---

## Rapport 360

| ID | User Story | Criteres d'acceptation | Priorite |
|----|-----------|------------------------|----------|
| US-10.1 | En tant que recruteur, je veux consulter un rapport d'aptitude 360 pour chaque candidat termine, afin d'evaluer ses competences reelles (pas son CV). | - **Hard Skills** : maitrise PMI (qualite des livrables), precision de la planification, gestion budgetaire — **Soft Skills** : communication (analyse textuelle/vocale des reunions), gestion du stress (reaction aux crises), negociation (interaction avec le client IA), resolution de conflits — **Indice de fiabilite** : correlation entre les promesses en reunion et les actions dans le planning — **Adaptabilite** : reaction face aux imprevus et changements — **Leadership** : capacite a diriger l'equipe et arbitrer | P0 |
| US-10.2 | En tant que recruteur, je veux voir le score global et les scores par competence d'un candidat sur une vue synthetique, afin d'avoir une evaluation rapide. | - Score global (0-100) en gros — Graphique radar par dimension (hard skills, soft skills, fiabilite, adaptabilite, leadership) — Points forts et points faibles en 3 bullet points chacun | P0 |
| US-10.3 | En tant que recruteur, je veux lire la justification IA detaillee pour chaque candidat, afin de comprendre le raisonnement derriere les scores. | - Texte en prose genere par l'IA (300-500 mots) — Explication des forces, faiblesses, cas particuliers observes — Exemples concrets tires de la simulation : "Lors de la reunion de crise, le candidat a..." | P0 |

---

## Ranking et Short-list

| ID | User Story | Criteres d'acceptation | Priorite |
|----|-----------|------------------------|----------|
| US-10.4 | En tant que recruteur, je veux voir un classement automatique de tous les candidats par score, afin d'identifier rapidement les meilleurs profils. | - Tableau triable : nom, score global, statut, date completion — Tri par score global ou par competence specifique — Filtres : statut (termine/en cours/abandonne), score minimum | P0 |
| US-10.5 | En tant que recruteur, je veux que l'IA me suggere une short-list des N meilleurs candidats avec justification, afin de reduire le volume a traiter. | - Parametrable : nombre de candidats dans la short-list (defaut: 10) — Chaque candidat avec : score, 1 phrase de justification IA — Vue dediee avec resume : "Sur 250 candidats, voici les 10 que nous recommandons" — Explication des criteres de selection utilises | P0 |
| US-10.6 | En tant que recruteur, je veux filtrer les candidats par competence specifique, afin de cibler un besoin precis (ex: "les meilleurs en gestion de risque"). | - Dropdown de selection de competence — Classement re-trie selon la competence selectionnee — Vue mise a jour dynamiquement | P1 |

---

## Aide a la decision

| ID | User Story | Criteres d'acceptation | Priorite |
|----|-----------|------------------------|----------|
| US-10.7 | En tant que recruteur, je veux comparer deux candidats finalistes cote a cote, afin de trancher entre eux sur des criteres objectifs. | - Vue split screen : rapport 360 du candidat A vs candidat B — L'IA souligne les differences cles dans un encart — Ex: *"Le Candidat A est meilleur pour stabiliser un budget en derive, le Candidat B est meilleur pour motiver une equipe demotivee."* — Selection de 2 candidats depuis la liste | P1 |
| US-10.8 | En tant que recruteur, je veux recevoir un guide d'entretien final genere par l'IA pour un candidat, afin de poser les bonnes questions en entretien physique. | - 5-10 questions personnalisees basees sur les erreurs et comportements observes — Ex: *"Pendant le test, le candidat a ignore le risque financier au profit du delai. Interrogez-le sur sa vision de la rentabilite."* — Format imprimable / exportable PDF | P1 |
| US-10.9 | En tant que recruteur, une fois le candidat recrute, je veux transmettre le rapport de simulation au futur manager, afin qu'il sache sur quels points coacher la nouvelle recrue. | - Export PDF du rapport 360 complet — Ou lien de partage securise avec expiration configurable (7/14/30 jours) — Le rapport inclut : forces, faiblesses, recommandations de coaching | P2 |
| US-10.10 | En tant que recruteur, je veux voir l'ecart entre le profil du candidat et le profil ideal defini dans la campagne, afin de mesurer l'adequation. | - Pourcentage de match global — Ecarts par competence : requis vs demontre — Graphique superpose : profil ideal vs profil candidat | P1 |

---

## Notes techniques

- **Service backend** : `CandidateReportService` (IA — generation du rapport 360), `RankingService` (IA — classement + short-list), `ComparisonService` (IA — comparaison), `InterviewGuideService` (IA — guide d'entretien)
- **Endpoints** : `GET /recruitment/campaigns/:id/candidates/:candidateId` (rapport 360), `GET /recruitment/campaigns/:id/shortlist`, `GET /recruitment/campaigns/:id/compare?ids=A,B`, `GET /recruitment/campaigns/:id/candidates/:candidateId/interview-guide`
- **Frontend** : Pages `/recruitment/campaigns/:id/candidates/:candidateId` (rapport 360), `/recruitment/campaigns/:id/shortlist`, `/recruitment/campaigns/:id/compare`, `/recruitment/campaigns/:id/candidates/:candidateId/interview`
- **Dependances** : EPIC 8 (campagne), EPIC 9 (candidat a termine la simulation), tous les modules de simulation (les donnees brutes viennent des livrables, reunions, decisions, KPIs)
