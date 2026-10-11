# Vidéo de démo

Produit `apps/webapp/public/media/landing/demo-{fr,en}.{mp4,webm,vtt}` et `demo-poster.webp`, servis par le site public sur la page Démo et hébergés dans le projet (décision D6 de la feuille de route).

## Générer

```bash
pnpm --filter @sim360/webapp build          # le site public doit être construit
pnpm --filter @sim360/webapp preview        # http://localhost:4173
pnpm demo:video                             # les deux langues, ~3 min
pnpm demo:video --locale fr                 # une seule langue
```

Prérequis : macOS (synthèse vocale `say`, voix Amélie fr_CA et Samantha en_US), `ffmpeg` avec libx264, libvpx-vp9 et libopus, Playwright (dépendance du dépôt).

## Comment c'est fait

1. **Narration** : `scenes.mjs` décrit chaque scène (texte FR et EN, durée visuelle minimale). Chaque phrase est synthétisée séparément ; sa durée fixe celle de la scène.
2. **Captation** : Playwright enregistre le site public en 1280 × 720 (`recordVideo`), scène par scène : accueil, bande pilote, les trois étapes animées, le catalogue (API simulée par `CATALOGUE_FIXTURE`), les tarifs, le pied de page. Un bandeau de titre discret est injecté dans la page.
3. **Assemblage** : ffmpeg place chaque narration au début de sa scène, encode en H.264 (MP4, `faststart`) et VP9/Opus (WebM), extrait l'affiche et écrit les sous-titres WebVTT depuis la chronologie mesurée.

Fichiers de travail dans `tools/demo-video/.work/` (ignorés par git).

## Remplacer par de vraies captures produit

La vidéo actuelle montre le site public et ses maquettes animées : le compte démo n'existe pas en production et aucune pile locale n'était disponible au moment de la production. Quand une pile avec `prisma/seed-demo-user.ts` est accessible :

1. Ajouter dans `run.mjs` une action par écran produit (connexion, tableau de bord, réunion, rapport) qui navigue dans l'application avec le compte démo.
2. Déclarer les scènes correspondantes dans `scenes.mjs` avec leur narration.
3. Relancer `pnpm demo:video`. Rien d'autre ne change : sous-titres, durées et encodage suivent.

Voix humaine : remplacer l'étape `narrate()` par la lecture de fichiers `tools/demo-video/voice/<locale>/<scene>.wav` ; le reste de la chaîne est identique.
