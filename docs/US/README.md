# ProjectSim360 — User Stories

> **Version** : 1.0
> **Date** : 2026-03-06
> **Source** : cahier-des-charges.md, Parcours_Utilisateur_PM.pdf, Parcours_Utilisateur_Business.pdf
> **Convention** : `En tant que [role], je veux [action], afin de [benefice]`
> **Priorite** : P0 = indispensable, P1 = important, P2 = souhaitable, P3 = nice-to-have

---

## Epics

| # | Epic | Fichier | US | P0 | P1 | P2 | P3 |
|---|------|---------|----|----|----|----|-----|
| 1 | Administration du Referentiel | [epic-01-admin-referentiel.md](./epic-01-admin-referentiel.md) | 9 | 5 | 4 | 0 | 0 |
| 2 | Profiling et Analyse de l'Apprenant | [epic-02-profiling.md](./epic-02-profiling.md) | 8 | 5 | 2 | 1 | 0 |
| 3 | Agent PMO (Mentor IA) | [epic-03-agent-pmo.md](./epic-03-agent-pmo.md) | 7 | 5 | 2 | 0 | 0 |
| 4 | Systeme de Livrables | [epic-04-livrables.md](./epic-04-livrables.md) | 10 | 7 | 2 | 0 | 1 |
| 5 | Immersion Narrative | [epic-05-immersion-narrative.md](./epic-05-immersion-narrative.md) | 8 | 0 | 6 | 2 | 0 |
| 6 | Adaptation par Profil | [epic-06-adaptation-profil.md](./epic-06-adaptation-profil.md) | 8 | 2 | 4 | 2 | 0 |
| 7 | Valorisation et Certification | [epic-07-valorisation.md](./epic-07-valorisation.md) | 11 | 2 | 5 | 3 | 1 |
| 8 | Recrutement — Cote Recruteur | [epic-08-recrutement-recruteur.md](./epic-08-recrutement-recruteur.md) | 11 | 6 | 2 | 3 | 0 |
| 9 | Recrutement — Cote Candidat | [epic-09-recrutement-candidat.md](./epic-09-recrutement-candidat.md) | 5 | 4 | 1 | 0 | 0 |
| 10 | Recrutement — Analyse et Decision | [epic-10-recrutement-analyse.md](./epic-10-recrutement-analyse.md) | 9 | 4 | 3 | 1 | 1 |
| | **TOTAL** | | **86** | **40** | **31** | **12** | **3** |

---

## Ordre d'implementation recommande

| Ordre | Epic(s) | Justification |
|-------|---------|---------------|
| 1 | EPIC 1 (Admin Referentiel) | Fondation : alimente le PMO et les evaluations |
| 2 | EPIC 3 + 4 (PMO + Livrables) | Coeur de la nouvelle experience apprenant |
| 3 | EPIC 2 (Profiling) | Personnalisation du parcours |
| 4 | EPIC 6 (Adaptation Profil) | Exploite le profiling pour moduler l'experience |
| 5 | EPIC 5 (Immersion Narrative) | Enrichissement de l'experience |
| 6 | EPIC 7 (Valorisation) | Sortie de simulation enrichie |
| 7 | EPIC 8 + 9 + 10 (Recrutement) | Nouveau marche, depend de tout le reste |

---

## Dependances entre epics

```
EPIC 1 (Admin Referentiel)
  |
  +---> EPIC 3 (Agent PMO) ----+
  |                             |
  +---> EPIC 4 (Livrables) ----+---> EPIC 7 (Valorisation)
                                |
EPIC 2 (Profiling) ------------+---> EPIC 6 (Adaptation)
                                |
                                +---> EPIC 5 (Immersion)
                                |
                                +---> EPIC 8+9+10 (Recrutement)
```
