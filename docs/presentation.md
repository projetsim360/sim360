# ProjectSim360 — Presentation des travaux realises

---

## Authentification et Profil

Le socle d'authentification est entierement en place.

Un utilisateur peut s'inscrire, recevoir un email de verification, se connecter, et acceder a la plateforme. La connexion via Google est disponible. La double authentification par QR code est fonctionnelle — activation, desactivation et verification a la connexion.

Cote gestion de profil : l'utilisateur peut modifier ses informations, changer son email ou son mot de passe, uploader un avatar, et supprimer son compte. Un wizard d'onboarding guide les nouveaux inscrits.

La securite est en place : verrouillage du compte apres 5 tentatives echouees, rotation automatique des tokens de session, limitation du nombre de requetes, et tracabilite RGPD sur les consentements.

Le systeme de roles fonctionne a 5 niveaux : super-admin, admin, manager, membre et lecteur. Les permissions sont appliquees sur chaque route.

---

## Moteur de Scenarios

### Catalogue et creation de scenarios

Le catalogue de scenarios est fonctionnel. On peut parcourir les scenarios disponibles, les filtrer par difficulte et par secteur, et consulter la fiche detaillee de chacun : description, objectifs pedagogiques, competences ciblees, nombre de phases, duree estimee.

Les managers et admins peuvent creer de nouveaux scenarios avec toutes les phases, les templates de reunions, de decisions et d'evenements aleatoires.

### Lancement d'une simulation

Quand un apprenant lance une simulation, tout est instancie automatiquement a partir du scenario : le projet fictif avec son equipe et ses livrables, les 5 indicateurs de performance initialises, les phases avec leurs reunions et decisions planifiees. L'apprenant est redirige vers sa simulation prete a jouer.

### Progression par phases

La simulation se deroule en 5 phases : initiation, planification, execution, monitoring et cloture. La progression est lineaire — pour passer a la phase suivante, il faut avoir traite toutes les decisions en attente, resolu tous les evenements, termine les reunions obligatoires, et ne pas avoir de KPI en zone critique.

La barre de progression est visible dans le detail de la simulation avec le statut de chaque phase.

La mise en pause et la reprise de simulation sont operationnelles.

### Prise de decision

Les decisions sont presentees avec leur contexte et 2 a 4 options. L'apprenant fait son choix et l'impact sur les indicateurs est applique immediatement. L'IA evalue ensuite la decision : score de pertinence, comparaison avec le choix optimal, detection de tendance comportementale.

L'historique des decisions est consultable dans la timeline.

### Evenements aleatoires

Les evenements aleatoires se declenchent au passage de phase, en fonction d'une probabilite et de l'etat des indicateurs. Chaque evenement propose 2 a 3 options de reaction avec des impacts differents. Le systeme notifie l'apprenant en temps reel.

### Gestion de projet

L'apprenant peut consulter son equipe fictive (membres avec leur role, expertise, moral et disponibilite), suivre ses livrables (statut, score qualite, echeance) et mettre a jour leur avancement.

---

## Reunions Virtuelles

### Liste et filtres

La liste des reunions d'une simulation est disponible avec filtrage par type (kickoff, standup, comite de pilotage, retrospective, crise), par phase et par statut. Chaque reunion affiche le nombre de participants et un acces direct au detail.

### Briefing et lancement

Avant de demarrer une reunion, l'apprenant voit le briefing : description, objectifs, liste des participants avec leur role et personnalite. Il lance la reunion quand il est pret, et un chronometre demarre.

### Reunions en mode texte

L'interface de chat permet d'echanger avec les participants IA. L'apprenant choisit a qui il s'adresse, envoie son message, et la reponse arrive en temps reel mot par mot. Chaque participant repond selon sa personnalite — un participant resistant ne reagira pas comme un cooperatif.

L'IA tient compte de l'etat du projet, des decisions passees et de l'historique de la conversation pour des reponses coherentes.

### Reunions en mode audio

J'ai mis en place un mode conference audio. Chaque participant IA a sa propre voix. L'interface reprend les codes d'une visioconference : vue grille avec tous les participants, vue speaker centree sur celui qui parle, panneau de transcription lateral, et controles en bas (micro, mode tous/individuel, raccrocher, plein ecran).

L'apprenant peut parler a tous les participants en meme temps ou s'adresser a un seul.

### Cloture et compte-rendu

A la cloture de la reunion, l'IA genere automatiquement un compte-rendu : resume des echanges, decisions cles prises, actions a mener avec responsable et echeance, et impact calcule sur les indicateurs. Ce compte-rendu est consultable a tout moment.

---

## Intelligence Artificielle

Quatre services IA specialises sont en place :

- **Reunions** : generation des reponses de chaque participant avec un prompt adapte a sa personnalite, son role et le contexte du projet. Fonctionne en streaming pour un affichage progressif.

- **Decisions** : evaluation de chaque choix avec un score sur 100, detection de patterns (tendance prudente, agressive, equilibree ou inconsistante), et explication pedagogique quand le choix differe de l'optimal.

- **Feedback** : generation de rapports de phase et de rapport final avec points forts, axes d'amelioration, scores par competence et recommandations.

- **Evenements** : generation de descriptions d'evenements contextuelles en fonction de l'etat du projet.

Le systeme supporte deux fournisseurs d'IA avec basculement automatique si le premier est indisponible. La consommation de tokens est tracee par simulation pour le suivi des couts.

---

## Tableaux de bord et indicateurs

### Dashboard global

L'apprenant voit un resume de toute son activite : nombre de simulations en cours et terminees, score moyen, graphique d'evolution dans le temps, dernieres activites, et prochaines actions a effectuer avec des liens directs.

### Dashboard de simulation

Pour chaque simulation, un dashboard detaille affiche :
- Les 5 indicateurs sous forme de jauges circulaires (budget, delai, qualite, moral equipe, risque)
- Le score global
- La phase en cours avec la barre de progression
- Les actions en attente : decisions, evenements et reunions
- Les alertes quand un indicateur passe sous le seuil critique
- L'activite recente

### Historique des indicateurs

Un graphique multi-lignes montre l'evolution des 5 indicateurs dans le temps. Chaque point correspond a un snapshot pris apres une decision, un evenement ou une reunion. Le seuil critique est materialise. L'export en image est disponible. Un tableau detaille liste chaque snapshot avec son declencheur.

### Vue formateur

Les managers et admins accedent a un dashboard formateur : liste des apprenants avec leur score moyen, nombre de simulations, alertes sur les profils en difficulte, et filtres par statut, scenario et periode.

---

## Notifications et temps reel

Chaque action importante declenche une notification en temps reel : debut ou fin de reunion, decision en attente, evenement aleatoire, passage de phase, indicateur critique.

Les notifications arrivent instantanement dans l'interface. Certaines declenchent aussi un email selon les preferences de l'utilisateur. Toutes les actions sont journalisees pour l'audit.

Les indicateurs de performance se mettent a jour en direct dans le dashboard a chaque decision ou evenement, sans recharger la page.

---

## Ce qui reste a finaliser

- **Rapports pedagogiques** : la generation IA est prete, il reste a construire la persistance des rapports, les pages de consultation et l'export PDF.

- **Abonnement et paiement** : les 4 plans sont definis (gratuit, starter, pro, entreprise), il reste a integrer le paiement en ligne et la gestion des factures.
