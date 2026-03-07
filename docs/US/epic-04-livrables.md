# EPIC 4 — Systeme de Livrables

> L'apprenant produit des livrables qui sont evalues par le PMO (IA).
> Principe fondamental : l'IA ne genere PAS les livrables, l'apprenant les produit et l'IA evalue.

---

## Soumission

| ID | User Story | Criteres d'acceptation | Priorite |
|----|-----------|------------------------|----------|
| US-4.1 | En tant qu'apprenant, je veux rediger un livrable dans un editeur riche (Markdown), afin de produire un document structure. | - Editeur Markdown avec preview temps reel (split view) — Sauvegarde automatique en brouillon toutes les 30s — Indicateur de sauvegarde visible | P0 |
| US-4.2 | En tant qu'apprenant, je veux soumettre mon livrable pour evaluation, afin de recevoir un feedback du PMO. | - Bouton "Soumettre pour evaluation" avec confirmation — Changement de statut : draft → submitted — Declenchement automatique de l'evaluation IA — Indicateur de chargement pendant l'evaluation | P0 |
| US-4.3 | En tant qu'apprenant, je veux voir la liste de tous mes livrables avec leur statut, afin de suivre ma progression. | - Tableau : titre, type, phase, statut (draft/submitted/evaluated/revised/validated), score, date — Filtres par phase et statut — Badge de comptage : "3/7 livrables valides" | P0 |
| US-4.4 | En tant qu'apprenant, je veux consulter le template fourni par le PMO pendant que je redige, afin de m'en inspirer. | - Split view ou panneau lateral : template a gauche, editeur a droite — Le template est en lecture seule — Bouton pour copier des sections du template | P1 |

---

## Evaluation

| ID | User Story | Criteres d'acceptation | Priorite |
|----|-----------|------------------------|----------|
| US-4.5 | En tant qu'apprenant, je veux recevoir une evaluation detaillee de mon livrable apres soumission, afin de savoir ce qui est bien et ce qui manque. | - Score (0-100) + note lettre (A/B/C/D/F) — Sections : points positifs, points a ameliorer, elements manquants, elements incorrects, recommandations — Affichage structure et lisible | P0 |
| US-4.6 | En tant qu'apprenant, je veux voir un exemple de reference (le livrable "parfait") apres mon evaluation, afin de comprendre l'ecart. | - Affichage cote a cote : mon livrable vs le livrable de reference — Disponible uniquement apres soumission (jamais avant) — Differences mises en evidence visuellement | P0 |
| US-4.7 | En tant qu'apprenant, je veux voir l'alignement PMI de mon livrable (quels outputs du processus PMI sont couverts), afin de comprendre le standard professionnel. | - Section dans l'evaluation : outputs attendus selon le PMI / outputs couverts / outputs manquants — Lien avec le processus PMI associe (ex: "4.1 — Develop Project Charter") | P1 |
| US-4.8 | En tant qu'apprenant, je veux pouvoir reviser et resoumettre mon livrable apres evaluation, afin de m'ameliorer par iteration. | - Bouton "Reviser" disponible apres evaluation — Le livrable repasse en mode edition — Numero de revision incremente automatiquement — Nombre max de revisions configurable selon le profil (cf. EPIC 6) — Chaque re-soumission declenche une nouvelle evaluation | P0 |

---

## Cas special : Compte-rendu de reunion

| ID | User Story | Criteres d'acceptation | Priorite |
|----|-----------|------------------------|----------|
| US-4.9 | En tant qu'apprenant, apres une reunion, je veux etre invite a rediger le compte-rendu moi-meme, afin de pratiquer cette competence. | - A la cloture d'une reunion → notification : "Redigez le compte-rendu de cette reunion" — Redirection vers l'editeur pre-rempli : date, participants, sujet, objectifs — Le CR auto-genere par l'IA existant n'est PAS montre a l'apprenant a ce stade | P0 |
| US-4.10 | En tant qu'apprenant, je veux que mon compte-rendu soit compare au compte-rendu genere par l'IA, afin de voir ce que j'ai oublie ou mal formule. | - L'IA genere son propre CR en arriere-plan (invisible avant soumission) — Apres soumission : vue comparaison cote a cote — Mise en evidence des differences : elements manques, ajouts non pertinents, formulation | P0 |

---

## Matrice des livrables par phase PMI

| Phase | Livrables | Type (enum) |
|-------|-----------|-------------|
| Initiating | Charte de Projet | `project-charter` |
| Initiating | Registre des Parties Prenantes | `stakeholder-register` |
| Planning | WBS (Structure de Decoupage) | `wbs` |
| Planning | Echeancier (Gantt) | `schedule` |
| Planning | Budget previsionnel | `budget` |
| Planning | Plan de gestion des risques | `risk-plan` |
| Planning | Registre des risques | `risk-register` |
| Planning | Plan de communication | `communication-plan` |
| Executing | Compte-rendu de reunion | `meeting-minutes` |
| Executing | Rapport d'avancement | `progress-report` |
| Monitoring | Rapport d'etat | `status-report` |
| Monitoring | Demande de changement | `change-request` |
| Closing | Bilan de projet | `project-closure` |
| Closing | Lecons apprises | `lessons-learned` |
| Closing | PV de reception | `acceptance-record` |

---

## Notes techniques

- **Table Prisma** : `UserDeliverable` (nouveau — distinct du `Deliverable` existant qui represente les livrables du projet fictif)
- **Module backend** : `DeliverableModule` (apps/api/src/modules/deliverables/)
- **Services** : `DeliverableService` (CRUD), `DeliverableEvaluationService` (IA)
- **Endpoints** : `GET/POST /simulations/:id/deliverables`, `POST /simulations/:id/deliverables/:id/evaluate`, `POST /simulations/:id/deliverables/:id/revise`
- **Frontend** : Pages `/simulation/:id/deliverables` (liste), `/simulation/:id/deliverables/new` (editeur), `/simulation/:id/deliverables/:id/review` (evaluation)
- **Dependances** : EPIC 1 (templates + criteres d'evaluation), EPIC 3 (le PMO declenche les demandes de livrables)
