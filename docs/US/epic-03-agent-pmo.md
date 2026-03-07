# EPIC 3 — Agent PMO (Mentor IA)

> Le PMO est l'interlocuteur principal de l'apprenant tout au long de la simulation.
> Il guide, evalue, conseille et adapte son ton selon le profil de l'utilisateur.

---

## Conversation avec le PMO

| ID | User Story | Criteres d'acceptation | Priorite |
|----|-----------|------------------------|----------|
| US-3.1 | En tant qu'apprenant, je veux discuter avec le PMO via un chat en temps reel (streaming), afin de recevoir des conseils methodologiques a tout moment. | - Interface chat similaire aux reunions existantes — Reponse en streaming (SSE) — Historique de conversation persistant par simulation — Accessible depuis n'importe quelle page de la simulation | P0 |
| US-3.2 | En tant qu'apprenant, je veux que le PMO connaisse l'etat actuel de ma simulation (phase, KPIs, livrables soumis, decisions prises), afin que ses conseils soient pertinents et contextualises. | - Le prompt systeme du PMO est enrichi dynamiquement avec : phase courante, KPIs, livrables soumis + scores, decisions passees, evenements en cours, profil utilisateur — Le contexte est actualise a chaque message | P0 |
| US-3.3 | En tant qu'apprenant, je veux que le PMO me rappelle les livrables en attente et les prochaines etapes, afin de ne pas perdre le fil de la simulation. | - Le PMO peut lister : livrables attendus non soumis, prochaines actions, echeances — Rappels proactifs si un livrable est en retard (configurable selon le profil, cf. EPIC 6) | P0 |
| US-3.4 | En tant qu'apprenant, je veux demander un template de livrable au PMO, afin d'avoir un modele pour rediger mon document. | - L'apprenant ecrit "donne-moi le template de la charte de projet" — Le PMO detecte l'intention et retourne le template depuis `DeliverableTemplate` — Le template est affiche dans le chat et telechargeable | P0 |

---

## Accueil et orientation

| ID | User Story | Criteres d'acceptation | Priorite |
|----|-----------|------------------------|----------|
| US-3.5 | En tant qu'apprenant, je veux etre accueilli par un agent RH a mon entree dans l'entreprise fictive, afin de decouvrir la culture et les regles de l'entreprise. | - Premiere interaction automatique au lancement de la simulation — L'agent RH presente : nom de l'entreprise, secteur, culture, regles internes — Le ton est adapte a la culture generee (stricte/agile/collaborative) — Transition naturelle vers le PMO | P1 |
| US-3.6 | En tant qu'apprenant, je veux que le PMO me presente le projet, les phases et la methodologie a suivre, afin de comprendre ce qui est attendu de moi. | - Apres l'accueil RH, le PMO enchaine automatiquement — Il explique : les 5 phases du projet, ce qui est attendu a chaque phase, les standards utilises (PMI) — Le ton s'adapte au profil (coach patient vs examinateur) | P0 |
| US-3.7 | En tant qu'apprenant, je veux que le PMO me precise les livrables attendus a chaque etape avec les echeances, afin de savoir exactement quoi produire. | - Liste structuree consultable : phase → livrables → description → echeance — Accessible a tout moment via une commande dans le chat PMO ou via un panneau lateral | P0 |

---

## Notes techniques

- **Service backend** : `PmoAiService` (apps/api/src/modules/ai/services/pmo-ai.service.ts)
- **Interface** : `PmoContext` = { simulation, currentPhase, userProfile, companyCulture, submittedDeliverables, pendingDeliverables, referenceDocuments, conversationHistory, simulationState }
- **Endpoint** : `POST /api/v1/simulations/:id/pmo/chat` (SSE stream), `GET /api/v1/simulations/:id/pmo/context`
- **Frontend** : Page `/simulation/:id/pmo` — reutiliser les composants de chat des reunions
- **Dependances** : EPIC 1 (le PMO a besoin des templates et documents de reference pour fonctionner)
- **Stockage conversations** : Reutiliser le modele `MeetingMessage` ou creer un modele `PmoConversation` dedie
