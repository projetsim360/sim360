# Feuille de route — landing page, bilinguisme FR/EN, prix en CAD

Date : 11 octobre 2026
Source : demande du 11 octobre (motion sur la landing, CTA connecté, moins de « IA », vidéo de démo, pages du footer, plateforme FR/EN, prix en CAD, application québécoise). Décisions arrêtées le 11 octobre, section 2.
Méthode : chaque point a été vérifié par lecture du code. Les charges sont des estimations en jours-développeur, à affiner lot par lot.

---

## 1. État des lieux (vérifié dans le code)

| Sujet | Constat |
|---|---|
| Landing | `apps/webapp/src/pages/landing/landing-page.tsx`, 1 305 lignes dans un seul fichier, 11 sections (hero, bande de confiance, chiffres, comment ça marche, domaines, pourquoi, témoignages, tarifs, FAQ, CTA final, footer). Framer Motion déjà utilisé (`Reveal`, `CountUp`, animation du hero). |
| Nav | « Connexion » et « Essai gratuit » toujours affichés, même connecté. `useAuth()` est disponible sur la landing (`AuthProvider` enveloppe tout le routeur) : `user`, `isLoading`. |
| Footer | 12 liens en `href="#"` : Produit (Fonctionnalités, Scénarios, Tarifs, Démo), Compagnie (À propos, Carrières, Blog, Contact), Légal (Confidentialité, CGU, Mentions légales, Cookies). Twitter et LinkedIn pointent vers les domaines génériques. Contact : `mailto:hello@simex.pro`. |
| Preuves sociales | Fictives : logos BOUYGUES, BNP PARIBAS, SNCF, KPMG, ESSEC, POLYTECHNIQUE ; « +12 000 simulations », « 98 % », « 650+ entreprises » ; témoignages Léa M., Marc D. (KPMG), Sophie V. Marques tierces utilisées sans accord, références françaises pour un produit québécois. |
| Terme « IA » | Landing : 0 occurrence (nettoyée dans PR #5). Reste côté apprenant : `mentor-review-page.tsx` (1), `conference-controls.tsx` (1). Côté admin : `token-usage.tsx` (5), entrée de menu « Utilisation IA » (2), volontairement conservées. |
| Prix | `0€`, `29€ /mois`, « Sur mesure ». Aucun module de paiement dans le code. 4 plans en base (`TenantPlan` : FREE, STARTER, PRO, ENTERPRISE) contre 3 plans affichés. |
| i18n | `react-intl` v7 dans `package.json` mais jamais câblé (aucun `IntlProvider`). `User.language` existe en base (défaut `fr`). Tous les textes webapp sont en dur en français. API : 86 messages d'exception en français. 4 gabarits de courriel en français. Prompts IA imposent « Réponds en français ». Seeds : 2 377 lignes de contenu FR (scénarios, gabarits de livrables). |
| Vidéo | Aucun média vidéo. `public/media/landing/` existe. Un compte démo seedé (`prisma/seed-demo-user.ts`) peut servir aux captures. |
| Infra | Le web prod tourne encore sur le build du 20 septembre. Toute livraison landing passe par un Redeploy manuel du service web sur Kapapra. |

---

## 2. Décisions (arrêtées le 11 octobre 2026)

| # | Question | Décision |
|---|---|---|
| D1 | Preuves sociales fictives | **Retirées.** Remplacées par une bande « Programme pilote 2026 » sans logo tiers ni chiffre inventé, jusqu'à disposer de vrais partenaires et chiffres. |
| D2 | Grille de prix CAD | **Proposition en section 3, lot 3, à valider.** 4 plans publics alignés sur les 4 plans en base. Taxes en sus. |
| D3 | Blog et Carrières | **Pas de blog** : lien retiré. Carrières : page simple « Aucun poste ouvert, écrivez-nous ». |
| D4 | URL bilingues et périmètre | **Préfixe `/en` sur les pages publiques seulement** (landing, pages du footer, catalogue, démo). **La traduction de l'application connectée et du back-office fait l'objet d'une PR et d'une feuille de route séparées** (section 6). |
| D5 | Portée EN du contenu pédagogique | Tous les scénarios et gabarits, traduction automatique puis relecture humaine. Rattaché à la feuille de route séparée (D4). |
| D6 | Vidéo : voix et hébergement | **Voix de synthèse** FR puis EN, sous-titres dans les deux langues. **Fichiers hébergés dans le projet** (`apps/webapp/public/media/landing/`), servis par le nginx du service web. |
| D7 | Contact | Formulaire `/contact` vers un courriel via Resend, avec anti-spam. **Adresse destinataire à fournir** ; `hello@simex.pro` par défaut. |
| D8 | Cookies et analytics | Aucun traceur aujourd'hui, donc pas de bandeau : la page « Cookies » indique qu'il n'y a que des cookies de session. À revoir avant tout ajout d'analytics. |

---

## 3. Lots

Ordre conçu pour ne rien écrire deux fois : l'infra i18n (lot 6a) arrive dès le sprint 1, pour que toute nouvelle page ou section publique soit écrite directement avec des messages traduisibles.

### Lot 0 — Fondations de la landing (1,5 j)

Prérequis de tout le reste.

- Découper `landing-page.tsx` en `src/features/landing/` : `sections/` (une section par fichier), `components/` (`Reveal`, `CountUp`, `StickyNav`, `Footer`), `content/` (données : plans, FAQ, domaines, liens du footer).
- Créer un `PublicLayout` (nav + footer partagés) utilisé par la landing et toutes les pages du footer.
- Déclarer les routes publiques dans `features/landing/config/landing.routes.tsx`, enregistrées dans `app-routing-setup.tsx`.
- Vérification : typecheck, build, rendu identique à l'actuel (capture avant/après Playwright).

### Lot 1 — Nav et CTA connectés (0,5 j)

- `StickyNav` : si `user`, remplacer « Connexion / Essai gratuit » par « Tableau de bord » (+ avatar via `resolveAssetUrl`). Pendant `isLoading`, un squelette de 90 px, pas de saut.
- Même logique sur le hero et le CTA final : « Reprendre ma simulation » quand connecté.
- Menu mobile idem.
- Vérification : Playwright avec et sans jeton dans `localStorage`.

### Lot 2 — Motion et attractivité (3 à 4 j)

- Hero : fond dégradé animé (mesh léger en CSS, pas de canvas), maquette produit qui s'assemble à l'arrivée, léger parallaxe au défilement (`useScroll` + `useTransform`), bouton principal avec micro-interaction.
- Comment ça marche : ligne de progression qui se dessine au défilement, maquettes d'étapes animées en séquence.
- Cartes domaines et plans : élévation et bordure au survol, stagger à l'apparition.
- Nav collante qui se compacte après 80 px.
- Preuves sociales (D1) : suppression de la bande de logos, des trois chiffres et des témoignages. À la place, une bande « Programme pilote 2026 » : ce que le pilote offre, qui peut rejoindre, un CTA. `CountUp` reste dans le code pour le jour où il y aura de vrais chiffres.
- Règles : `useReducedMotion` respecté partout ; aucune animation sur le texte au-dessus de la ligne de flottaison avant le LCP ; mobile-first ; budget Lighthouse : LCP < 2,5 s, CLS < 0,1 sur la landing.
- Vérification : Lighthouse mobile et desktop, captures 375 / 768 / 1280 / 1920.

### Lot 3 — Prix en CAD (0,5 à 1 j)

#### Grille proposée (à valider)

Logique : le coût variable est dominé par les réunions vocales en temps réel (modèle audio facturé à la minute, de l'ordre de 1 à 3 $ CAD la réunion de 20 minutes) et, loin derrière, par les réunions écrites et les évaluations. Les plans se différencient donc d'abord sur le vocal. Le gratuit sert à essayer, l'Apprenant vise l'étudiant et le junior, le Professionnel celui qui prépare une certification ou un poste, l'Équipe les écoles, les formateurs et les entreprises (y compris le mode recrutement). Repères : les abonnements de formation grand public au Canada se situent entre 20 et 80 $ CAD par mois.

| Plan | `TenantPlan` | Mensuel | Annuel (2 mois offerts) | Inclus |
|---|---|---|---|---|
| Découverte | FREE | 0 $ | — | 3 scénarios d'initiation, 5 réunions écrites par mois, tableau de bord personnel, retour de fin de réunion, support par courriel |
| Apprenant | STARTER | 19 $ | 190 $ | Tous les scénarios, réunions écrites illimitées, 4 réunions vocales par mois, plan de progression, 1 certificat de parcours |
| Professionnel | PRO | 49 $ | 490 $ | Tout Apprenant, réunions vocales illimitées (usage raisonnable : 30 par mois), mentor virtuel et mode coach, certificats PMI-ready, export des rapports, réunions personnalisées, mode multi-joueur |
| Équipe | ENTERPRISE | Sur mesure, à partir de 29 $ par siège par mois, 10 sièges minimum | Sur mesure | Tout Professionnel, tableau de bord formateur, scénarios sur mesure, mode recrutement (campagnes et évaluation de candidats), SSO, gestionnaire de compte |

Options à trancher : tarif étudiant (-40 % sur Apprenant et Professionnel avec courriel d'établissement), campagne de recrutement à l'unité pour une entreprise sans abonnement (par exemple 299 $ par campagne, 20 candidats inclus).

Tous les prix en dollars canadiens, taxes en sus (TPS et TVQ ajoutées à la facturation). Facturation mensuelle sans engagement, annuelle payée d'avance.

#### Implémentation

- Source unique `features/landing/content/pricing.ts` : montant en cents, devise `CAD`, période, plan en base correspondant, limites affichées.
- Formatage via `Intl.NumberFormat` : `fr-CA` → « 19 $ », `en-CA` → « CA$19 » ; mention « taxes en sus » / « plus taxes » ; bascule mensuel / annuel.
- Aucun paiement en ligne dans ce lot : les CTA mènent à l'inscription (plan FREE) ou au formulaire de contact (Équipe). Stripe en CAD avec TPS/TVQ fera l'objet d'une feuille de route séparée.
- Les limites affichées (réunions par mois) doivent correspondre aux quotas réellement appliqués par l'API (`AiTokenQuota` par tenant) : vérifier et aligner avant publication.
- Vérification : test unitaire du formatage dans les deux locales et de la correspondance plan affiché / `TenantPlan`.

### Lot 4 — Pages derrière les liens du footer (4 à 5 j de dev, contenu à part)

Toutes sous `PublicLayout`, bilingues dès l'écriture (lot 6a), avec `<title>` et meta description par page.

| Lien | Route FR / EN | Contenu | Dev |
|---|---|---|---|
| Fonctionnalités | ancre `/#fonctionnalites` | existant | 0 |
| Scénarios | `/scenarios` · `/en/scenarios` | Catalogue public des scénarios (secteur, durée, niveau). Nouveau endpoint `GET /scenarios/public` en `@Public`, champs publics seulement, cache 5 min. En EN : titres et résumés traduits quand ils existent, repli FR sinon. | 1 j |
| Tarifs | ancre `/#tarifs` | lot 3 | 0 |
| Démo | `/demo` · `/en/demo` | Lecteur vidéo (lot 5), 3 points clés, CTA inscription. | 0,5 j |
| À propos | `/a-propos` · `/en/about` | Mission, équipe, ancrage québécois. Texte à fournir. | 0,5 j |
| Carrières | `/carrieres` · `/en/careers` | Page simple (D3). | 0,25 j |
| Blog | retiré (D3) | | 0 |
| Contact | `/contact` · `/en/contact` | Formulaire (nom, courriel, message), `POST /contact` : validation, honeypot, limite 5 / h / IP via Throttler, envoi Resend vers l'adresse D7. | 1 j |
| Confidentialité | `/confidentialite` · `/en/privacy` | Politique conforme à la Loi 25 : responsable de la protection des renseignements personnels, finalités, hébergement, sous-traitants (Anthropic, OpenAI, Resend), droits d'accès et de retrait, conservation. Gabarit dev, texte à valider par un juriste. | 0,5 j |
| CGU | `/cgu` · `/en/terms` | Gabarit, texte à valider. | 0,25 j |
| Mentions légales | `/mentions-legales` · `/en/legal` | Raison sociale, NEQ, adresse, hébergeur. Données à fournir. | 0,25 j |
| Cookies | `/cookies` · `/en/cookies` | Cookies de session seulement (D8). | 0,25 j |

- Réseaux sociaux : vraies URL ou suppression des icônes.
- Vérification : test Playwright qui ouvre chaque lien du footer et attend un 200 avec un `h1`, dans les deux langues.

### Lot 5 — Vidéo de démo (3 à 4 j)

1. Script 60 à 90 s, FR d'abord : problème (apprendre la gestion de projet sans projet), parcours (choisir un scénario, décision, réunion avec participants simulés, retour du mentor), promesse. Sans le mot « IA ».
2. Captures : parcours scripté en Playwright sur le compte démo, 1920 × 1080, données réalistes, thème clair.
3. Montage : titres, légendes, zooms sur les actions clés, musique libre de droits. Composition HyperFrames (titres et sous-titres synchronisés, rendu MP4) ou outil de montage classique, au choix.
4. Voix de synthèse FR puis EN (D6), sous-titres `.vtt` FR et EN.
5. Export : MP4 H.264 1080p et WebM, affiche (poster) WebP. Cible : moins de 12 Mo par version, deux versions (1080p pour `/demo`, 720p pour la miniature du hero).
6. Diffusion (D6) : fichiers dans `apps/webapp/public/media/landing/` (`demo-fr.mp4`, `demo-en.mp4`, `.webm`, `.vtt`, poster). Ajouter `mp4|webm|vtt` à la règle nginx des assets statiques avec cache long, et vérifier que nginx envoie bien les requêtes `Range` (lecture et avance rapide sur iOS). `<video preload="none" poster>` sur `/demo`, miniature cliquable dans le hero. Image Docker du web : environ +30 Mo, acceptable.
- Vérification : lecture sur Safari iOS, Chrome Android, desktop ; poids et temps de démarrage mesurés ; `curl -I -H "Range: bytes=0-1"` renvoie 206.

### Lot 6 — FR/EN : pages publiques dans cette feuille de route, application dans une autre (D4)

#### 6a. Infrastructure i18n (2 j), sprint 1

- Câbler `react-intl` : `IntlProvider` dans `App.tsx`, catalogues `src/locales/fr.json` et `en.json`, extraction `@formatjs/cli` avec identifiants stables (`landing.hero.title`).
- Résolution de la langue : préfixe `/en` sur les routes publiques ; dans l'application, `User.language` (déjà en base) sinon préférence locale, sinon `navigator.language`, défaut `fr`. `<html lang>` synchronisé.
- `LanguageSwitcher` dans la nav publique (bascule `/` ↔ `/en`). Dans l'application connectée, le commutateur arrive avec la feuille de route séparée.
- Formats : dates et nombres en `fr-CA` / `en-CA` via `FormattedDate`, `FormattedNumber`.
- `hreflang` et `canonical` sur chaque page publique ; `sitemap.xml` avec les deux langues.
- Garde-fou : test unitaire qui échoue si une clé manque dans l'un des deux catalogues.
- Conformité Québec : français par défaut et toujours au moins aussi visible que l'anglais sur les pages commerciales (Charte de la langue française). La version anglaise n'est jamais servie par défaut.

#### 6b. Textes des pages publiques (inclus dans les lots 2, 3, 4)

Landing, pages du footer, catalogue public, démo, formulaire de contact : écrits directement avec `FormattedMessage`, catalogue EN rédigé en même temps que le FR.

#### Feuille de route séparée : application connectée et back-office (20 à 25 j, PR distincte)

Pour mémoire, afin de ne pas perdre l'inventaire fait le 11 octobre :

- Textes de la webapp connectée (8 à 12 j) : migration feature par feature, messages zod, toasts, `menu.config.ts`, libellés de rôles, pluriels ICU, commutateur de langue dans le topbar écrivant `User.language`.
- API et courriels (3 j) : 86 messages d'exception → codes + dictionnaire FR/EN résolu par `Accept-Language` puis `User.language` ; 4 gabarits de courriel × 2 langues.
- Participants simulés et retours (1 à 2 j) : langue de l'apprenant passée aux prompts (texte, audio, évaluations, mentor, assistant).
- Contenu pédagogique (5 à 8 j) : table `ScenarioTranslation` (`locale`, champ, valeur, index `(scenarioId, locale)`, repli FR), migration, admin référentiel FR / EN, traduction automatique des seeds puis relecture (D5).

### Lot 7 — Vocabulaire sans « IA » (0,5 j)

- Corriger les 2 occurrences apprenant restantes (`mentor-review-page.tsx`, `conference-controls.tsx`).
- Glossaire dans `docs/` : « participants simulés », « mentor virtuel », « assistant », « analyse automatique », « retour personnalisé ».
- Garde-fou : étendre le test d'accents existant pour échouer sur `\bIA\b` dans les dossiers apprenant et landing (admin exclu), et sur `\bAI\b` dans le catalogue EN.

### Lot 8 — Qualité et mise en ligne (1 à 2 j)

- Playwright : landing dans les deux langues et deux états de connexion ; tous les liens du footer ; formulaire de contact ; vidéo chargée et `Range` fonctionnel.
- Lighthouse (performance, accessibilité, SEO) ≥ 90 sur la landing, mobile et desktop. Axe sans erreur bloquante.
- Responsive vérifié à 375, 768, 1024, 1440.
- Mise en ligne : merge sur `main`, Redeploy du service web sur Kapapra (manuel), vérification du bundle servi comme fait le 11 octobre.

---

## 4. Enchaînement proposé

| Sprint | Lots | Livrable visible |
|---|---|---|
| 1 | 0, 6a, 1, 3, 7 | Landing découpée, i18n câblé avec bascule `/` ↔ `/en`, nav connectée, grille CAD, plus de « IA » côté apprenant |
| 2 | 2 | Landing animée, bande « Programme pilote » à la place des preuves fictives |
| 3 | 4 | 10 pages publiques FR/EN, formulaire de contact, catalogue public |
| 4 | 5 | Vidéo de démo FR/EN en ligne, hébergée dans le projet |
| 5 | 8 | QA, performance, mise en ligne |

Total estimé pour cette feuille de route : 15 à 19 jours-développeur. La feuille de route séparée (application et back-office FR/EN) ajoute 20 à 25 jours, parallélisables par agents ; la relecture humaine des traductions pédagogiques en est le chemin critique.

Dépendances externes : validation de la grille de prix (D2), textes légaux et « À propos » (toi ou un juriste), adresse de contact (D7), identité légale (NEQ, adresse) pour les mentions légales.

---

## 5. Hors périmètre, à planifier séparément

- Application connectée et back-office FR/EN (voir lot 6, feuille de route séparée).
- Paiement en ligne (Stripe en CAD, TPS/TVQ, facturation) et application réelle des quotas par plan.
- Blog et contenu éditorial.
- Analytics et bandeau de consentement (seulement si un traceur est ajouté).
- Autres langues que FR/EN.
