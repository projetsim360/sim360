# EPIC 1 — Administration du Referentiel

> Les admins alimentent la base de connaissances que le PMO utilise pour guider et evaluer les apprenants.
> Sans ce referentiel, le PMO n'a rien a fournir ni a comparer.

---

## Templates de livrables

| ID | User Story | Criteres d'acceptation | Priorite |
|----|-----------|------------------------|----------|
| US-1.1 | En tant qu'admin, je veux creer un template de livrable (charte de projet, WBS, registre des risques...) avec son contenu modele, afin que le PMO puisse le fournir aux apprenants. | - Formulaire avec : type, phase PMI (Initiating/Planning/Executing/Monitoring/Closing), titre, description, contenu template (Markdown), criteres d'evaluation (JSON structuree), processus PMI associe (ex: "4.1"), niveau de difficulte (discovery/standard/advanced) | P0 |
| US-1.2 | En tant qu'admin, je veux modifier un template de livrable existant, afin de l'ameliorer au fil du temps. | - L'edition incremente automatiquement le numero de version — L'ancienne version reste accessible | P0 |
| US-1.3 | En tant qu'admin, je veux desactiver un template sans le supprimer, afin de le retirer des nouvelles simulations sans impacter celles en cours. | - Toggle actif/inactif — Les simulations en cours conservent leur snapshot du template | P0 |
| US-1.4 | En tant qu'admin, je veux lister et filtrer les templates par phase, type et difficulte, afin de retrouver facilement un template. | - Tableau avec colonnes : titre, type, phase, difficulte, version, statut, date modif — Filtres cumulables — Tri par colonne | P1 |
| US-1.5 | En tant qu'admin, je veux ajouter un exemple de reference ("livrable parfait") a un template, afin que le PMO puisse le montrer a l'apprenant apres evaluation. | - Champ texte riche (Markdown) lie au template — Cet exemple n'est jamais visible avant la soumission du livrable par l'apprenant | P0 |

---

## Documents de reference

| ID | User Story | Criteres d'acceptation | Priorite |
|----|-----------|------------------------|----------|
| US-1.6 | En tant qu'admin, je veux creer un document de reference (bonne pratique, standard, glossaire), afin d'enrichir les connaissances du PMO. | - Categories : template / standard / best-practice / glossary — Phase PMI optionnelle (null = toutes phases) — Processus PMI optionnel (ex: "5.19") — Contenu en Markdown | P0 |
| US-1.7 | En tant qu'admin, je veux modifier un document de reference, afin de le mettre a jour selon l'evolution des standards. | - Versionnement automatique a chaque modification — Historique consultable | P1 |
| US-1.8 | En tant qu'admin, je veux lister et filtrer les documents par categorie et par phase, afin de gerer efficacement le referentiel. | - Tableau avec filtres : categorie, phase, actif/inactif — Recherche textuelle sur le titre | P1 |
| US-1.9 | En tant qu'admin, je veux gerer un glossaire des termes PMI (WBS, Parties prenantes, Baseline...), afin que les bulles d'aide contextuelles soient alimentees pour les debutants. | - Chaque entree : terme, definition simple, exemple concret du quotidien — Categorie "glossary" dans ReferenceDocument — Utilise par le frontend pour afficher des tooltips | P1 |

---

## Notes techniques

- **Tables Prisma** : `DeliverableTemplate`, `ReferenceDocument`
- **Module backend** : `ReferenceDocumentModule` (apps/api/src/modules/reference-documents/)
- **Endpoints** : CRUD sur `/api/v1/admin/deliverable-templates` et `/api/v1/admin/reference-documents`
- **Acces** : Roles ADMIN et SUPER_ADMIN uniquement
- **Frontend** : 2 pages admin (une pour templates, une pour documents) avec tableau + formulaire modal
