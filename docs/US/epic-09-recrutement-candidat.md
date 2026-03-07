# EPIC 9 — Recrutement — Cote Candidat

> Le candidat clique sur le lien de recrutement et vit un "entretien d'embauche de 48h compresse en 1h".
> Il reutilise le meme moteur de simulation que le parcours apprenant, avec un scenario adapte.

---

| ID | User Story | Criteres d'acceptation | Priorite |
|----|-----------|------------------------|----------|
| US-9.1 | En tant que candidat, je veux cliquer sur le lien de recrutement et voir une page d'accueil expliquant le processus, afin de savoir ce qui m'attend avant de commencer. | - Page publique (accessible sans auth) — Affiche : nom de l'entreprise (pas les details internes), description du processus ("Vous allez piloter un projet fictif..."), duree estimee (~1h), bouton "Commencer l'evaluation" — Design professionnel et rassurant | P0 |
| US-9.2 | En tant que candidat, je veux creer un compte ou me connecter avant de commencer, afin que mes resultats soient sauvegardes et transmis au recruteur. | - Inscription simplifiee : email + mot de passe + nom/prenom — Ou connexion existante si deja inscrit — Redirection automatique vers le profiling apres auth — Association automatique avec la campagne (via le slug dans l'URL) | P0 |
| US-9.3 | En tant que candidat, je veux passer un profiling rapide (LinkedIn ou questionnaire court), afin que la simulation soit adaptee a mon profil. | - Version acceleree du profiling EPIC 2 : LinkedIn OU questionnaire court (5 questions max) — Les donnees servent a : adapter la simulation + alimenter le rapport du recruteur — Pas de Gap Analysis visible pour le candidat (c'est interne) | P0 |
| US-9.4 | En tant que candidat, je veux vivre une simulation generee en fonction de mon profil ET des exigences du recruteur, afin que l'evaluation soit pertinente et equitable. | - Le scenario combine : profil du candidat (niveau) + fiche de poste du recruteur + culture d'entreprise — Meme moteur de simulation (PMO, livrables, reunions, decisions, evenements) — Duree calibree pour ~1h (sous-ensemble de processus PMI) | P0 |
| US-9.5 | En tant que candidat, je veux voir un ecran de fin avec mon score global, afin d'avoir un retour immediat sur ma performance. | - Ecran de fin : score global (sans le detail fin reserve au recruteur) — Message : "Merci ! Vos resultats ont ete transmis a [nom entreprise]." — Bouton "Voir mon debriefing" (debriefing simplifie, cf. EPIC 7) — Bouton "Creer un compte complet" pour devenir apprenant | P1 |

---

## Notes techniques

- **Pas de nouveau module** : reutilise `RecruitmentModule` (EPIC 8) + moteur de simulation existant + modules EPIC 2/3/4
- **Endpoint public** : `GET /recruitment/join/:slug` (info campagne), `POST /recruitment/join/:slug/start` (demarre la simulation)
- **Frontend** : Page publique `/recruitment/join/:slug` (landing), puis redirection vers le parcours de simulation standard
- **Association** : A la creation du compte, un `CandidateResult` est cree avec `campaignId` + `userId`
- **Dependances** : EPIC 8 (la campagne doit exister), EPIC 2 (profiling rapide), EPIC 3+4 (PMO + livrables pour la simulation)
