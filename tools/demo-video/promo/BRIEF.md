---
workflow: general-video
flow: automation
storyboard: no
message: "Simex pro : vivez un vrai projet avant de le piloter pour de vrai"
destination: embed
aspect: 1920x1080
language: fr
audience: "futurs chefs de projet, formateurs, équipes RH au Québec"
length: 60s
angle: product-showcase
---

## Intent

Vidéo de démonstration du produit Simex pro, ouverte dans une modale depuis « Voir la démo »
sur la page d'accueil (simex-pro.com) et sur la page Démo. Elle doit montrer l'application
elle-même — tableau de bord, catalogue de scénarios, fiche scénario, décision et indicateurs,
réunion avec participants simulés, rapport final — reconstituée en HTML animé, fidèle à
app.simex-pro.com (cadre SimexShell, compteurs, jauges, cascades, caméra), et donner envie
de s'inscrire au programme pilote. Ton : confiant, concret, premium, sans « IA ».
Deux versions rendues depuis la même composition : français (Québec) et anglais, voix de
synthèse (macOS `say`, Amélie fr_CA / Samantha en_US), sous-titres WebVTT.

## Assets

- Aucune capture : toutes les scènes produit sont des maquettes HTML/CSS animées dans `index.html`.
- `../../../apps/webapp/public/fonts/montserrat/*.woff2` — police d'affichage de la marque.
- `../../../apps/webapp/public/media/landing/hero-dashboard.webp` — secours si une capture manque.

## Customizations

- Count-up sur le score du rapport et les indicateurs (dataviz-countup).
- Interface reconstituée dans un cadre applicatif avec mouvements de caméra (device-surface-showcase).
- Ouverture et fermeture typographiques (kinetic-type-beats, logo-assemble-lockup) avec le
  wordmark « Simex • pro » et l'URL simex-pro.com.
- Sortie : MP4 H.264 1080p + WebM, nommés `demo-fr` / `demo-en`, < 12 Mo chacun.

## Notes

- Palette : fond `#0F1A2E` (brand-900) / texte `#FAFAF9` / accent `#EE7A3A` (warm orange),
  tokens de `apps/webapp/src/styles/theme.css`. Polices : Montserrat (titres), Inter (UI).
- Jamais le mot « IA » ni « AI » : « participants simulés », « mentor virtuel », « retour ».
- Ne pas inventer de chiffres (pas de « 12 000 apprenants ») : le pilote est honnête.
- Le pipeline précédent (`tools/demo-video/run.mjs`, captation du site) reste disponible.
