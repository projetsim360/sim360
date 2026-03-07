# EPIC 5 — Immersion Narrative

> L'apprenant est plonge dans une histoire, pas dans un tableau de bord.
> On ne commence pas par un formulaire mais par un email de bienvenue.

---

## Welcome Pack

| ID | User Story | Criteres d'acceptation | Priorite |
|----|-----------|------------------------|----------|
| US-5.1 | En tant qu'apprenant, au lancement d'une simulation, je veux recevoir un email de bienvenue dans une boite mail simulee, afin de me sentir immerge dans l'entreprise fictive. | - Boite mail simulee avec 1er email : bienvenue + presentation du poste — Expediteur : DRH de l'entreprise fictive — Ton adapte a la culture d'entreprise (formel/decontracte) | P1 |
| US-5.2 | En tant qu'apprenant, je veux voir mon nom de poste et l'identite de l'entreprise fictive (nom, secteur, taille, culture), afin de comprendre le contexte dans lequel j'evolue. | - Bandeau ou page "Intranet" avec : logo genere, nom d'entreprise, secteur, poste de l'apprenant — Visible en permanence dans la simulation | P1 |
| US-5.3 | En tant qu'apprenant, je veux que la culture d'entreprise (stricte/agile/collaborative) influence le ton des communications et la tolerance aux erreurs, afin que chaque simulation soit unique. | - Le temperament est genere au lancement (ou choisi par le recruteur en mode recrutement) — Impacte : ton du PMO, severite des evaluations, frequence des imprevus, formalisme des livrables — Stocke dans la simulation | P1 |

---

## Boite mail simulee

| ID | User Story | Criteres d'acceptation | Priorite |
|----|-----------|------------------------|----------|
| US-5.4 | En tant qu'apprenant, je veux recevoir des emails simules de parties prenantes pendant la simulation, afin de vivre des situations realistes. | - Emails generes par l'IA selon le contexte — Expediteurs : client, fournisseur, membre de l'equipe, sponsor, DG — Priorites : urgent/haute/normale/basse — Arrives a des moments cles (debut de phase, apres un evenement, etc.) | P1 |
| US-5.5 | En tant qu'apprenant, je veux lire un email simule et y repondre, afin de pratiquer la communication professionnelle ecrite. | - Vue lecture avec expediteur, sujet, corps — Zone de reponse en texte libre — L'IA evalue la reponse : pertinence, ton, completude — Score de reponse stocke | P1 |
| US-5.6 | En tant qu'apprenant, je veux devoir prioriser mes emails (repondre au client en colere OU valider une facture), afin de pratiquer la gestion des priorites. | - Plusieurs emails arrivent simultanement — L'ordre de traitement impacte les KPIs — Le PMO peut commenter la strategie de priorisation choisie | P2 |

---

## Interactions enrichies

| ID | User Story | Criteres d'acceptation | Priorite |
|----|-----------|------------------------|----------|
| US-5.7 | En tant qu'apprenant en phase d'initialisation, je veux pouvoir appeler le Sponsor du projet pour clarifier les objectifs, afin que mon projet parte sur de bonnes bases. | - Reunion IA avec le Sponsor (comme les reunions existantes) — Si l'apprenant ne pose pas les bonnes questions, les objectifs restent flous — Impact mesurable en phase de planification (KPIs + qualite des livrables) | P1 |
| US-5.8 | En tant qu'apprenant, je veux recevoir des demandes de changement du client en cours d'execution, afin de pratiquer la gestion du perimetre et l'analyse d'impact. | - Le "client" (IA) envoie un email ou demande une reunion pour modifier le perimetre — L'apprenant doit : evaluer l'impact (cout, delai, qualite), rediger une demande de changement formelle, decider d'accepter ou refuser — Impact sur les KPIs selon la decision | P1 |

---

## Notes techniques

- **Table Prisma** : `SimulatedEmail` (nouveau)
- **Module backend** : `SimulatedEmailModule` (apps/api/src/modules/simulated-emails/)
- **Generation** : Les emails sont generes par un service IA au debut de chaque phase + en reaction aux evenements
- **Endpoints** : `GET /simulations/:id/emails`, `GET /simulations/:id/emails/:id`, `POST /simulations/:id/emails/:id/respond`
- **Frontend** : Pages `/simulation/:id/emails` (boite de reception), `/simulation/:id/emails/:id` (lecture + reponse), `/simulation/:id/intranet` (page entreprise)
- **Dependances** : EPIC 3 (le PMO commente les reponses aux emails), moteur de simulation existant (KPIs)
