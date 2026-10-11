# Vidéos de démo

Deux chaînes produisent `apps/webapp/public/media/landing/demo-{fr,en}.{mp4,webm,vtt}` et `demo-poster.webp`, lus par la modale « Voir la démo » et la page Démo du site public.

## 1. Vidéo produit (HyperFrames) — `promo/`

La vidéo en ligne. Composition HTML animée (GSAP) dans `promo/index.html` : huit scènes, 61 s, 1920 × 1080, bilingue par variables de rendu.

- **Interface reconstituée en HTML** : les six scènes produit (tableau de bord, catalogue, fiche scénario, mes simulations, réunion, rapport) sont des maquettes animées fidèles à l'application (cadre `SimexShell` : barre latérale, barre du haut, contenu), pas des captures. Chaque élément s'anime (compteurs, jauges, cascades, caméra) et la qualité reste vectorielle à toute résolution. Référence visuelle : `app.simex-pro.com` ; mettre la maquette à jour quand l'interface change.
- **Narration** : `promo/narration.json` (FR et EN), synthèse `say` (Amélie fr_CA, Samantha en_US) dans `promo/assets/audio/<lang>/sN.m4a`, durées dans `durations.json`.
- **Langue** : variable `lang` (`fr` par défaut) et `vo1…vo8` (fichiers audio). `variables.en.json` contient le jeu anglais.

```bash
pnpm demo:promo:check      # lint, runtime, layout, motion, contraste (npm run check dans promo/)
pnpm demo:promo:render     # renders/demo-fr.mp4 et renders/demo-en.mp4
pnpm demo:promo:publish    # copie MP4, encode WebM, écrit les .vtt et l'affiche dans public/media/landing
```

Prévisualisation éditable : `cd tools/demo-video/promo && npx hyperframes preview --background` (Studio).

Pour changer un texte : `COPY` dans `index.html` (les deux langues côte à côte, y compris les libellés de l'interface) et `narration.json`, puis régénérer la narration (voir `run.mjs` pour la commande `say`) et relancer check → render → publish.

## 2. Captation du site public (Playwright) — `run.mjs`

Ancienne chaîne, conservée : enregistre le site public lui-même (`pnpm demo:video`). Utile pour une vidéo « visite du site » ; la vidéo produit ci-dessus la remplace sur le site.
