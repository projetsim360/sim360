# EPIC 6 — Adaptation par Profil

> Le parcours s'adapte au niveau de l'apprenant : un debutant absolu ne vit pas la meme experience qu'un chef de projet confirme.

---

## Profil zero experience

| ID | User Story | Criteres d'acceptation | Priorite |
|----|-----------|------------------------|----------|
| US-6.1 | En tant qu'apprenant sans experience, je veux que le PMO m'explique le "pourquoi" de chaque livrable avant de me le demander, afin de comprendre l'interet de ce que je produis. | - Le PMO en mode "Coach Patient" ajoute une explication contextualisee avant chaque demande — Ex: *"Dans le monde reel, si on ne definit pas les regles au debut, le client changera d'avis tous les jours. Voici pourquoi nous allons rediger ce document ensemble."* — Ce comportement est desactive pour les profils avances | P1 |
| US-6.2 | En tant qu'apprenant sans experience, je veux voir des bulles d'aide contextuelles quand je rencontre des termes PMI (WBS, parties prenantes, baseline...), afin de comprendre le vocabulaire. | - Detection des termes PMI dans l'interface (chat PMO, livrables, reunions) — Tooltip au survol avec : definition simple + exemple concret du quotidien — Donnees depuis le glossaire admin (EPIC 1, US-1.9) — Desactivable dans les preferences | P1 |
| US-6.3 | En tant qu'apprenant sans experience, je veux pouvoir revenir en arriere apres une mauvaise decision, afin d'apprendre sans etre bloque. | - Apres une decision a fort impact negatif, le Mentor intervient : *"Tu viens de depenser 50% du budget sur une tache secondaire. Veux-tu revenir en arriere ou assumer les consequences ?"* — Rollback possible (max 3 fois par simulation pour zero-exp, 1 fois pour debutant, 0 pour les autres) | P2 |
| US-6.4 | En tant qu'apprenant sans experience, je veux que les avatars de l'equipe IA me posent des questions pedagogiques, afin de me guider indirectement. | - Les participants IA en mode "pedagogique" ajoutent des questions-guides — Ex: *"Chef, vous ne m'avez pas donne de date limite pour ce rapport, est-ce que c'est normal ?"* — Active uniquement pour les profils zero-exp et beginner | P2 |

---

## Adaptation de la difficulte

| ID | User Story | Criteres d'acceptation | Priorite |
|----|-----------|------------------------|----------|
| US-6.5 | En tant que systeme, je veux ajuster le nombre de processus PMI actifs selon le profil, afin de ne pas submerger un debutant. | - Mapping : zero-exp → 8-10 processus, beginner → 12-15, reconversion → 15-20, reinforcement → 20-25 — Les processus inactifs sont masques (pas de livrables demandes, pas de decisions associees) — Configuration stockee dans le scenario genere | P0 |
| US-6.6 | En tant que systeme, je veux ajuster le ton et la severite du PMO selon le profil, afin que le coaching soit adapte au niveau. | - Zero-exp : patient, pedagogique, explications detaillees — Beginner : bienveillant, feedback constructif — Reconversion : professionnel, direct — Reinforcement : exigeant, feedback sec, note severement — Configuration injectee dans le prompt systeme du PMO | P0 |
| US-6.7 | En tant que systeme, je veux ajuster le nombre de revisions autorisees par livrable selon le profil, afin de moduler la tolerance a l'erreur. | - Zero-exp : 5 revisions — Beginner : 3 — Reconversion : 2 — Reinforcement : 1 — Stocke dans `UserDeliverable.maxRevisions` a la creation | P1 |
| US-6.8 | En tant que systeme, je veux ajuster la frequence des interventions proactives du PMO selon le profil, afin de favoriser l'autonomie des profils avances. | - Zero-exp : le PMO intervient a chaque etape, rappels frequents — Beginner : rappels reguliers — Reconversion : rappels a la demande uniquement — Reinforcement : le PMO ne parle que si on lui demande | P1 |

---

## Notes techniques

- **Pas de nouveau module** : ces US modifient le comportement de modules existants (PMO, livrables, reunions)
- **Configuration** : Un objet `ProfileConfig` derive du `UserProfile.profileType` qui definit tous les parametres d'adaptation
- **Impact sur les prompts IA** : Le `PmoAiService` et le `MeetingAiService` recoivent le `profileType` dans leur contexte
- **Frontend** : Le composant de tooltips PMI est transversal (a ajouter dans le layout de simulation)
- **Dependances** : EPIC 2 (profiling — le profileType doit exister), EPIC 3 (PMO — le ton est ajuste), EPIC 4 (livrables — max revisions)
