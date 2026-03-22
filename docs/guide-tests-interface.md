# Guide de tests via l'interface web — ProjectSim360

> Tests manuels etape par etape depuis le navigateur.
> Date : 2026-03-22

---

## Prerequis

1. Services lances : `docker compose up -d` + API (port 3001) + Webapp (port 5173)
2. Base seedee : `pnpm db:seed`
3. Cle IA configuree dans `.env` : `ANTHROPIC_API_KEY` ou `OPENAI_API_KEY`
4. Navigateur ouvert sur http://localhost:5173

### Comptes

| Email | Mot de passe | Usage |
|-------|-------------|-------|
| `admin@sim360.dev` | `Admin123!` | Tests principaux (SUPER_ADMIN, pas de 2FA) |
| `recruiter@sim360.dev` | `Recruiter123!` | Tests recrutement |

---

## Parcours 1 — Scenario Greenfield + Generation IA

### Etape 1 : Connexion
1. Aller sur http://localhost:5173
2. Se connecter avec `admin@sim360.dev` / `Admin123!`
3. **Verifier** : Redirection vers le dashboard

### Etape 2 : Generer un scenario avec l'IA
1. Menu lateral → **Simulations** → **Nouvelle simulation**
2. Cliquer sur l'onglet **"Generer avec l'IA"**
3. Remplir le formulaire :
   - Nom du projet : `Application de covoiturage`
   - Secteur : `Technologies de l'information`
   - Difficulte : `Intermediaire`
   - Type : `Nouveau projet (Greenfield)`
   - Cocher : `Utiliser mon profil pour calibrer le scenario`
   - Description : `Developper une app mobile de covoiturage pour une ville de 200 000 habitants`
4. Cliquer **"Generer le scenario"**
5. **Verifier** : Spinner pendant ~15-30 secondes, puis une modal s'ouvre
6. **Verifier dans la modal** :
   - Titre coherent avec la description
   - Badge "Intermediaire" en jaune
   - Badge "Nouveau projet" en bleu
   - Badge "Genere par l'IA" en bleu
   - 3 stats en haut a droite : nombre de phases (5), duree, nombre d'objectifs
   - Section "Objectifs du scenario" avec 3-4 objectifs numerotes
   - Section "Competences travaillees" en pills violets
   - Section "Deroulement du projet" avec 5 phases en grille
   - Pas d'emojis nulle part
7. Cliquer **"Lancer la simulation"**
8. **Verifier** : Redirection vers la page de la simulation

### Etape 3 : Passation — Accueil RH
1. **Verifier** la page simulation :
   - Statut "Passation" (badge bleu)
   - Banner de passation avec 3 etapes : Accueil RH (actif), Passation PMO (gris), Demarrage (gris)
   - Connecteurs visibles entre les etapes
   - Boutons Emails/Livrables **masques** dans la toolbar
   - KPIs, decisions, timeline **non visibles**
2. Cliquer **"Commencer l'accueil RH"**
3. **Verifier** la page meeting :
   - Titre : "Accueil RH — Bienvenue dans l'entreprise"
   - 2 participants : **Claire Dumont** (DRH) + **Maxime Roche** (Office Manager)
   - Objectifs numerotes (pas de checks verts)
   - Icones correctes (pas de carres vides ou de caracteres bizarres)
4. Cliquer **"Demarrer la reunion"**
5. Envoyer un message : `Bonjour, pouvez-vous me presenter la culture de l'entreprise ?`
6. **Verifier** : Claire Dumont repond avec des details sur la culture adaptee au secteur IT
7. Envoyer : `Quels outils vais-je utiliser ?`
8. **Verifier** : Reponse coherente sur les outils
9. Cliquer **"Cloturer la reunion"**
10. **Verifier** : Compte-rendu genere

### Etape 4 : Passation — PMO
1. Retourner sur la page simulation (bouton "Retour")
2. **Verifier** : Etape RH cochee en vert, etape PMO active (violet)
3. Cliquer **"Commencer la passation PMO"**
4. **Verifier** :
   - Titre : "Passation PMO — Presentation du projet"
   - 1 participant : **Alexandre Bertrand** (Responsable PMO)
   - Objectifs lies a la methodologie PMBOK
5. Demarrer la reunion
6. Envoyer : `Quelle methodologie allons-nous suivre ?`
7. **Verifier** : Le PMO explique les 5 phases PMI
8. Envoyer : `Quels sont les livrables attendus ?`
9. **Verifier** : Reponse detaillee sur les livrables par phase
10. Cloturer la reunion

### Etape 5 : Demarrage du projet
1. Retourner sur la page simulation
2. **Verifier** : Banner "Passation terminee" avec les 2 premieres etapes en vert et bouton **"Commencer le projet"**
3. Cliquer **"Commencer le projet"**
4. **Verifier** :
   - Statut passe a "En cours" (badge violet)
   - Banner de passation **disparait**
   - KPIs visibles (5 jauges)
   - Boutons Emails/Livrables **visibles** dans la toolbar
   - Decisions en attente affichees si disponibles
   - PMO FAB visible en bas a droite

### Etape 6 : Email de bienvenue PMBOK
1. Cliquer **"Emails"** dans la toolbar
2. **Verifier** : Au moins 1 email de la DRH dans la boite
3. Ouvrir l'email de bienvenue
4. **Verifier** le contenu enrichi :
   - Section "Methodologie Projet" avec les 5 phases PMI
   - Section "Gouvernance" avec les roles
   - Section "Procedures Standards" (changements, risques, qualite, communication)
   - Section "Outils a disposition"
   - Section "Contacts cles"
   - Section "Prochaines etapes"

### Etape 7 : Voice Q&A dans le PMO
1. Cliquer sur le **bouton rond PMO** en bas a droite
2. Le chat PMO s'ouvre
3. Cliquer sur le **bouton microphone** (a cote du champ de saisie)
4. **Verifier** : Le bouton pulse en rouge
5. Parler : "Quel est l'etat du budget du projet ?"
6. Cliquer pour arreter l'enregistrement
7. **Verifier** : Spinner de transcription, puis le texte transcrit apparait dans le champ
8. Envoyer le message
9. **Verifier** : Le PMO repond normalement

### Etape 8 : Livrables — Production et evaluation
1. Cliquer **"Livrables"** dans la toolbar
2. **Verifier** : Liste des livrables avec onglets "Tous / Mes livrables / Delegues / En approbation"
3. Ouvrir un livrable en DRAFT (ex: "Charte de projet")
4. Ecrire du contenu Markdown dans l'editeur
5. **Verifier** : Auto-save (indicateur "Sauvegarde...")
6. Cliquer **"Soumettre pour evaluation"**
7. **Verifier** : Score IA (0-100), grade (A-F), points positifs, points a ameliorer, PMI outputs
8. Cliquer **"Voir l'exemple de reference"**
9. **Verifier** : Comparaison cote-a-cote entre le livrable et le "Jumeau Parfait"

### Etape 9 : Livrables — Delegation a un expert
1. Retourner a la liste des livrables
2. Sur un autre livrable en DRAFT, cliquer **"Assigner a un expert"**
3. **Verifier** : Dialog avec la liste des membres d'equipe (avatar, nom, role, expertise, personnalite)
4. Selectionner un expert, ajouter une instruction : `Inclure une analyse des risques`
5. Cliquer **"Assigner"**
6. **Verifier** : Le livrable passe en statut "DELEGATED", contenu genere par l'IA apres quelques secondes
7. Lire le contenu — il doit refleter le persona de l'expert
8. Si insatisfait, cliquer **"Demander revision"** avec un feedback
9. **Verifier** : Contenu regenere en tenant compte du feedback

### Etape 10 : Livrables — Circuit d'approbation
1. Soumettre le livrable delegue pour evaluation IA
2. Apres evaluation, definir la **chaine d'approbation** : selectionner le Sponsor comme reviewer
3. Cliquer **"Soumettre pour approbation"**
4. **Verifier** : Statut passe en "En approbation" (badge ambre)
5. Attendre quelques secondes (l'IA reviewer evalue automatiquement)
6. **Verifier** la **timeline d'approbation** :
   - Dot vert = approuve, dot rouge = rejete, dot gris = en attente
   - Commentaire du reviewer visible
7. **Verifier** le statut final : "Valide" (vert) ou "Rejete" (rouge avec motif)

---

## Parcours 2 — Scenario Brownfield (reprise de projet)

### Etape 1 : Selectionner le scenario Brownfield
1. Menu → **Nouvelle simulation**
2. Onglet **"Catalogue"**
3. Reperer la card **"Reprise d'un projet ERP en difficulte"**
4. **Verifier** : Badge "Reprise" en ambre sur la card, badge "Avance" en rouge
5. Cliquer sur la card

### Etape 2 : Verifier la modal de detail
1. **Verifier** dans la modal :
   - Badge "Avance" rouge + Badge "Reprise en cours" ambre
   - Description mentionnant le precedent chef de projet parti
   - 3 stats : 5 phases, 5h, 4 objectifs
   - Section "Deroulement" : Phases 1-2 barrees ("Termine"), Phase 3 surlignee ("Depart")
   - Section **"Contexte de reprise"** (fond ambre) :
     - 4 stats : **15j** retard, **65%** budget, **4** risques actifs, Moral **Bas**
     - Citation du precedent CP en italique
     - Liste des risques avec dots de severite (rouge = CRITICAL, orange = HIGH)
2. Cliquer **"Lancer la simulation"**

### Etape 3 : Passation Brownfield
1. **Verifier** : Simulation en ONBOARDING, depart phase 3 (Execution)
2. Faire l'accueil RH
3. **Verifier** : Claire Dumont presente la culture adaptee au secteur **Finance** (compliance, dress code, reporting)
4. Faire la passation PMO
5. **Verifier** : Alexandre Bertrand est **direct et transparent** :
   - Mentionne les retards accumules
   - Parle du budget consomme a 65%
   - Cite les risques actifs (integrateur defaillant, turnover, specs rejetees)
   - Propose des pistes d'action
6. Commencer le projet

### Etape 4 : Verifier l'etat Brownfield
1. **Verifier** les KPIs degredes :
   - Budget bas (~35%)
   - Risque eleve
   - Moral equipe bas
2. **Verifier** le panneau "Historique herite" :
   - Badge "Reprise en cours" dans l'en-tete
   - Notes du precedent CP
   - 4 stats (retard, budget, risques, moral)
   - Decisions passees avec impact (dots vert/rouge)
3. **Verifier** les phases :
   - Phases 1-2 marquees COMPLETED
   - Phase 3 (Execution) marquee ACTIVE
   - Decisions disponibles en phase 3 (ex: "Gestion integrateur defaillant")

### Etape 5 : Prendre des decisions de crise
1. Ouvrir la decision **"Gestion de l'integrateur defaillant"**
2. **Verifier** : 3 options avec impacts KPI decrits
3. Choisir une option
4. **Verifier** : KPIs mis a jour
5. Ouvrir la reunion de crise **"Reunion de crise avec le Sponsor"**
6. **Verifier** : Le Sponsor (Jean-Paul Mercier) est "tres mecontent, impatient"
7. Discuter pour le rassurer
8. Cloturer

---

## Parcours 3 — Mentorat Premium

### Etape 1 : Preparer un compte MENTOR
1. Ouvrir Prisma Studio : `pnpm db:studio`
2. Table **users** → trouver `admin@sim360.dev`
3. Changer le champ **role** de `SUPER_ADMIN` a `MENTOR`
4. Sauvegarder
5. Se deconnecter et se reconnecter

### Etape 2 : Dashboard mentor
1. Menu lateral → **Mentorat**
2. **Verifier** la page `/mentoring` :
   - 3 cards de stats : evaluations en attente, sessions actives, sessions terminees
   - Liste des evaluations sans review mentor
   - Liste des sessions

### Etape 3 : Creer une review mentor
> Prerequis : avoir au moins une simulation avec un livrable evalue par l'IA
1. Dans la liste des evaluations en attente, cliquer **"Evaluer"**
2. Remplir le formulaire :
   - Score humain : `82`
   - Leadership : `75`
   - Diplomatie : `80`
   - Posture : `70`
   - Feedback : `Bonne maitrise technique, mais la communication avec le Sponsor manque de finesse`
   - Recommandations : `Travailler la presentation des mauvaises nouvelles en reunion`
3. Soumettre
4. **Verifier** : Review creee, evaluation disparait de la liste "en attente"

### Etape 4 : Session de mentorat
1. Creer une session de mentorat (type Debriefing)
2. **Verifier** : Session creee en statut "Planifiee"
3. Ouvrir la session
4. Envoyer un message : `Comment avez-vous gere le conflit avec le Sponsor ?`
5. **Verifier** : Message enregistre
6. Completer la session

### Etape 5 : Remettre le role SUPER_ADMIN
1. Prisma Studio → remettre `admin@sim360.dev` en `SUPER_ADMIN`

---

## Parcours 4 — Portfolio et export

> Prerequis : avoir une simulation avec au moins 2-3 livrables evalues

### Etape 1 : Consulter le portfolio
1. Menu → **Valorisation** → **Portfolio** (ou depuis la page simulation)
2. **Verifier** :
   - Liste des livrables avec scores
   - Stats globales (total livrables, evalues, score moyen, valides)

### Etape 2 : Filtrer par score
1. Utiliser le **slider de score minimum**
2. **Verifier** : La liste se filtre pour n'afficher que les livrables >= au score choisi

### Etape 3 : Exporter en PDF
1. Cliquer **"Exporter PDF"**
2. **Verifier** : Un fichier HTML se telecharge
3. Ouvrir le fichier : resume avec stats, liste des livrables, scores, date de generation

### Etape 4 : Exporter en ZIP
1. Cliquer **"Exporter ZIP"**
2. **Verifier** : Un fichier ZIP se telecharge
3. Extraire : `portfolio-summary.html` + dossier `livrables/` avec chaque livrable en `.md`

---

## Parcours 5 — Scenarios recommandes

### Etape 1 : Verifier les recommandations
1. Menu → **Nouvelle simulation** → Onglet **"Catalogue"**
2. **Verifier** en haut de page :
   - Si le profil est complete : section **"Recommandes pour vous"** avec 1-3 scenarios
   - Badge "Recommande" en jaune sur chaque card
   - Si le profil n'est pas complete : section absente (pas d'erreur)

---

## Parcours 6 — Verifications visuelles

### Liste des simulations (`/simulations`)
| # | Element | Verification |
|---|---------|-------------|
| 1 | Cards simulation | Cursor pointer au hover, bordure brand au hover |
| 2 | KPIs | 5 mini-jauges circulaires (pas de barres), couleurs brand/ambre/rouge |
| 3 | Phase progression | Barre segmentee avec compteur (ex: 1/5) |
| 4 | Date | Format relatif ("Aujourd'hui", "Il y a 3j") |
| 5 | Badges | Secteur + difficulte + nombre de decisions en attente |
| 6 | Titre au hover | Change de couleur en brand |

### Nouvelle simulation (`/simulations/new`)
| # | Element | Verification |
|---|---------|-------------|
| 1 | Onglets | "Catalogue" et "Generer avec l'IA" bien stylises |
| 2 | Cards scenarios | Cursor pointer, hover border brand, pas de shadow |
| 3 | Modal detail | Largeur 820px, scrollable, header gradient, footer sticky |
| 4 | Icones | KeenIcon partout, aucun emoji |
| 5 | Brownfield card | Badge "Reprise" sans emoji |

### Page meeting (`/meetings/{id}`)
| # | Element | Verification |
|---|---------|-------------|
| 1 | Icone demarrer | Rocket (pas de carre vide) |
| 2 | Icone audio | Speaker (pas de carre vide) |
| 3 | Icone objectifs | Focus (pas de carre vide) |
| 4 | Objectifs briefing | Numeros dans cercles gris (pas de checks verts) |
| 5 | Objectifs en cours | Cercles vides (pas de checks verts) |
| 6 | Toggle Texte/Audio | Icones centrees verticalement |
| 7 | Chronometre | Icone horloge centree |
| 8 | Icone micro (conference) | Cercle vert avec micro SVG lisible sous "Vous" |

### Passation (banner dans simulation-detail)
| # | Element | Verification |
|---|---------|-------------|
| 1 | Cercles etapes | Vert = termine (check SVG), violet = actif (icone), gris = futur |
| 2 | Connecteurs | Lignes de 2px entre les cercles, vertes si etape terminee |
| 3 | Labels | Vert/violet/gris selon etat, description en dessous |
| 4 | Bouton CTA | Centre, taille normale, icone eclair SVG (pas emoji) |
| 5 | Barre gradient | Fine barre coloree en haut de la card |
| 6 | Ombres | Aucune ombre sur la card ni le bouton |

---

## Checklist de validation finale

### Fonctionnalites
- [ ] Scenario Greenfield : generation IA + lancement + passation complete
- [ ] Scenario Brownfield : contexte herite + KPIs degredes + decisions de crise
- [ ] Passation bloque le projet tant qu'elle n'est pas terminee
- [ ] Email PMBOK avec 7 sections detaillees
- [ ] Voice Q&A : micro → transcription → envoi message
- [ ] Livrables : production, evaluation IA, Jumeau Parfait
- [ ] Livrables : delegation a un expert IA + revision
- [ ] Livrables : circuit d'approbation avec timeline
- [ ] Mentorat : review mentor + session interactive
- [ ] Portfolio : filtrage par score + export PDF + export ZIP
- [ ] Scenarios recommandes selon le profil

### UX
- [ ] Aucun emoji comme icone
- [ ] Toutes les icones KeenIcon sont visibles (pas de carres vides)
- [ ] Cursor pointer sur tous les elements cliquables
- [ ] Modal pour le detail de scenario (pas de panneau inline)
- [ ] Palette coherente brand-500 / ambre / destructive
- [ ] Pas d'ombres sur les cards et boutons
- [ ] Dates relatives sur la liste des simulations

### Erreurs a ne pas voir
- [ ] Pas de 500 sur `/scenarios/recommended` (meme sans profil)
- [ ] Pas de page blanche apres la passation
- [ ] Pas de scroll surprise au clic sur un scenario
- [ ] Pas d'emoji rocket/micro dans les boutons
- [ ] Pas de checks verts sur les objectifs non atteints
