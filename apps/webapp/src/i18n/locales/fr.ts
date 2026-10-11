/**
 * French catalogue of the public pages. Source of truth for the key set:
 * `en.ts` must declare exactly the same keys (enforced by its `satisfies`).
 *
 * Rich text uses react-intl tags, e.g. `<accent>…</accent>`.
 */
export const fr = {
  // ─── Meta ──────────────────────────────────────────────────────────────
  'meta.title': 'Simex pro — Simulation de gestion de projet',
  'meta.description':
    'Apprenez la gestion de projet en la vivant : scénarios immersifs, participants simulés, retours de niveau senior. Conçu au Québec.',

  // ─── Nav ───────────────────────────────────────────────────────────────
  'nav.home': 'Accueil Simex pro',
  'nav.features': 'Fonctionnalités',
  'nav.howItWorks': 'Comment ça marche',
  'nav.pricing': 'Tarifs',
  'nav.faq': 'FAQ',
  'nav.signIn': 'Connexion',
  'nav.freeTrial': 'Essai gratuit',
  'nav.dashboard': 'Tableau de bord',
  'nav.menu': 'Menu',
  'nav.closeMenu': 'Fermer le menu',
  'nav.switchLanguage': 'English',
  'nav.switchLanguageAria': 'View this page in English',

  // ─── Hero ──────────────────────────────────────────────────────────────
  'hero.badge': 'Programme pilote 2026',
  'hero.title': 'La gestion de projet n’est pas une théorie. <accent>Vivez-la.</accent>',
  'hero.subtitle':
    'Plongez dans des scénarios immersifs issus de vrais projets. Pilotez budget, équipe et imprévus comme un chef de projet senior, sans les conséquences réelles.',
  'hero.cta': 'Lancer ma première simulation',
  'hero.ctaLoggedIn': 'Reprendre mes simulations',
  'hero.secondary': 'Comment ça marche · 2 min',
  'hero.mockupAlt': 'Aperçu du tableau de bord Simex pro',
  'hero.liveBadge': 'En direct · Tour 4',

  // ─── Pilot band (replaces fictitious logos, numbers and testimonials) ──
  'pilot.kicker': 'Programme pilote 2026',
  'pilot.title': 'Façonnez la plateforme avec nous',
  'pilot.text':
    'Simex pro est en phase pilote au Québec. Les étudiants, formateurs et équipes qui rejoignent maintenant accèdent à tous les scénarios et orientent les prochaines fonctionnalités.',
  'pilot.point.1': 'Accès complet pendant le pilote',
  'pilot.point.2': 'Ligne directe avec l’équipe produit',
  'pilot.point.3': 'Vos retours façonnent les prochains scénarios',
  'pilot.cta': 'Rejoindre le pilote',

  // ─── How it works ──────────────────────────────────────────────────────
  'how.title': '3 étapes vers la maîtrise',
  'how.subtitle': 'De la première décision au retour d’expérience, en moins d’une heure par scénario.',
  'how.step1.title': 'Choisissez votre scénario',
  'how.step1.text':
    'Sélectionnez parmi plusieurs scénarios calqués sur de vrais projets : construction, TI, transition écologique, hyper-croissance. Chaque scénario démarre avec un brief du commanditaire et un contexte d’équipe réaliste.',
  'how.step1.point.1': 'Brief du commanditaire et contraintes budgétaires définies',
  'how.step1.point.2': 'Équipe virtuelle de 5 à 8 personnes',
  'how.step1.point.3': 'Calendrier réaliste : 8 à 12 semaines de simulation',
  'how.step2.title': 'Pilotez les décisions en temps réel',
  'how.step2.text':
    'Tour par tour, négociez avec les participants simulés, arbitrez budget et qualité, gérez les imprévus. Chaque choix fait bouger les indicateurs en direct.',
  'how.step2.point.1': 'Participants simulés qui réagissent et négocient',
  'how.step2.point.2': 'Imprévus aléatoires : démissions, retards, audits',
  'how.step2.point.3': 'Indicateurs mis à jour à chaque décision',
  'how.step3.title': 'Recevez un retour de niveau senior',
  'how.step3.text':
    'Vos décisions sont analysées, les tendances identifiées, et vous recevez un rapport calibré sur le référentiel PMI, enrichi par votre mentor.',
  'how.step3.point.1': 'Score global et scores par dimension (5 axes)',
  'how.step3.point.2': 'Au moins 3 recommandations concrètes',
  'how.step3.point.3': 'Comparaison anonymisée avec votre cohorte',

  // ─── Mockups (illustrative screens) ────────────────────────────────────
  'mockup.actors': 'Acteurs',
  'mockup.kpis': 'Indicateurs',
  'mockup.budgetUsed': 'Budget consommé',
  'mockup.teamMorale': 'Moral de l’équipe',
  'mockup.moraleLow': 'Bas',
  'mockup.option1': 'Reporter le sprint',
  'mockup.option2': 'Renforcer l’équipe',
  'mockup.option3': 'Réduire la portée',
  'mockup.globalScore': 'Score global',
  'mockup.recommendation': 'Recommandation nº 1',
  'mockup.recommendationText':
    'Votre gestion des risques humains est sous le seuil PMI. Renforcez la communication hebdomadaire avec les parties prenantes pour améliorer le score Équipe.',
  'mockup.axis.communication': 'Communication',
  'mockup.axis.schedule': 'Délai',
  'mockup.axis.team': 'Équipe',
  'mockup.axis.budget': 'Budget',
  'mockup.axis.risk': 'Risque',

  // ─── Domains ───────────────────────────────────────────────────────────
  'domains.title': 'Choisissez votre univers',
  'domains.subtitle':
    'Des scénarios calqués sur de vrais projets et organisations. De nouveaux univers s’ajoutent régulièrement.',
  'domains.it.title': 'TI et infonuagique',
  'domains.it.text': 'Sprints, déploiements critiques, équipes à distance.',
  'domains.construction.title': 'Infrastructure et construction',
  'domains.construction.text': 'Logistique de chantier, sous-traitants, aléas de terrain.',
  'domains.startup.title': 'Hyper-croissance',
  'domains.startup.text': 'Délai de mise en marché et croissance humaine d’une licorne.',
  'domains.eco.title': 'Transition écologique',
  'domains.eco.text': 'Projets ESG sous contraintes carbone strictes.',
  'domains.finance.title': 'Finance et banque',
  'domains.finance.text': 'Conformité, audits, reddition de comptes, indicateurs réglementaires.',
  'domains.health.title': 'Santé et pharma',
  'domains.health.text': 'Essais cliniques, validation, mise en marché.',

  // ─── Why ───────────────────────────────────────────────────────────────
  'why.title': 'La méthode qui change la donne',
  'why.pillar1.title': 'Réalisme des échanges',
  'why.pillar1.text': 'Des participants simulés qui réagissent aux décisions, négocient, doutent. Pas de scripts.',
  'why.pillar2.title': 'Retour de niveau senior',
  'why.pillar2.text': 'Analyse de vos décisions après chaque livrable. Vous savez précisément où progresser.',
  'why.pillar3.title': 'Attestation vérifiable',
  'why.pillar3.text':
    'Badges alignés sur le référentiel PMI, exportables sur LinkedIn, chacun avec son lien de vérification.',

  // ─── Pricing ───────────────────────────────────────────────────────────
  'pricing.title': 'Choisissez votre plan',
  'pricing.subtitle': 'Sans carte de crédit. Annulation en un clic.',
  'pricing.billing.monthly': 'Mensuel',
  'pricing.billing.annual': 'Annuel',
  'pricing.billing.annualSave': '2 mois offerts',
  'pricing.perMonth': '/mois',
  'pricing.billedAnnually': 'Facturé {total} par an',
  'pricing.taxes': 'Prix en dollars canadiens, taxes en sus.',
  'pricing.custom': 'Sur mesure',
  'pricing.fromPerSeat': 'dès {price} par siège et par mois, {seats} sièges minimum',
  'pricing.mostPopular': 'Le plus choisi',
  'pricing.cta.signup': 'S’inscrire',
  'pricing.cta.start': 'Démarrer',
  'pricing.cta.contact': 'Nous contacter',
  'pricing.plan.free.name': 'Découverte',
  'pricing.plan.free.feature.1': '3 scénarios d’initiation',
  'pricing.plan.free.feature.2': '5 réunions écrites par mois',
  'pricing.plan.free.feature.3': 'Tableau de bord personnel',
  'pricing.plan.free.feature.4': 'Retour de fin de réunion',
  'pricing.plan.free.feature.5': 'Soutien par courriel',
  'pricing.plan.starter.name': 'Apprenant',
  'pricing.plan.starter.feature.1': 'Tous les scénarios',
  'pricing.plan.starter.feature.2': 'Réunions écrites illimitées',
  'pricing.plan.starter.feature.3': '4 réunions vocales par mois',
  'pricing.plan.starter.feature.4': 'Plan de progression',
  'pricing.plan.starter.feature.5': '1 certificat de parcours',
  'pricing.plan.pro.name': 'Professionnel',
  'pricing.plan.pro.feature.1': 'Tout le plan Apprenant',
  'pricing.plan.pro.feature.2': 'Réunions vocales illimitées (usage raisonnable)',
  'pricing.plan.pro.feature.3': 'Mentor virtuel et mode coach',
  'pricing.plan.pro.feature.4': 'Certificats PMI-ready',
  'pricing.plan.pro.feature.5': 'Export des rapports',
  'pricing.plan.pro.feature.6': 'Réunions personnalisées',
  'pricing.plan.pro.feature.7': 'Mode multijoueur',
  'pricing.plan.enterprise.name': 'Équipe',
  'pricing.plan.enterprise.feature.1': 'Tout le plan Professionnel',
  'pricing.plan.enterprise.feature.2': 'Tableau de bord formateur',
  'pricing.plan.enterprise.feature.3': 'Scénarios sur mesure',
  'pricing.plan.enterprise.feature.4': 'Mode recrutement : campagnes et évaluation de candidats',
  'pricing.plan.enterprise.feature.5': 'Authentification unique (SSO)',
  'pricing.plan.enterprise.feature.6': 'Gestionnaire de compte',

  // ─── FAQ ───────────────────────────────────────────────────────────────
  'faq.kicker': 'Vos questions',
  'faq.title': 'Tout ce que vous voulez savoir',
  'faq.subtitle': 'Si votre question n’est pas listée, écrivez-nous à {email}.',
  'faq.q1': 'Combien de temps prend une simulation ?',
  'faq.a1':
    'Entre 45 minutes et 2 heures selon le scénario. Vous pouvez la mettre en pause à tout moment et reprendre plus tard : votre progression est sauvegardée.',
  'faq.q2': 'Les attestations sont-elles reconnues ?',
  'faq.a2':
    'Chaque attestation est calibrée sur le référentiel PMI et porte un lien de vérification public que n’importe quel recruteur peut consulter. Le badge s’exporte directement sur LinkedIn.',
  'faq.q3': 'Puis-je utiliser Simex pro en équipe ou avec des collègues ?',
  'faq.a3':
    'Le mode multijoueur est inclus dans le plan Professionnel. Vous pouvez inviter des collègues sur une même simulation et débriefer ensemble grâce au rapport partagé.',
  'faq.q4': 'Mes données et décisions sont-elles confidentielles ?',
  'faq.a4':
    'Vos décisions de simulation sont strictement privées. Les données agrégées et anonymisées servent uniquement à améliorer les scénarios et à vous situer dans votre cohorte. Simex pro est conçu au Québec et respecte la Loi 25.',
  'faq.q5': 'Comment fonctionne l’évaluation ?',
  'faq.a5':
    'Un moteur d’analyse observe vos décisions, vos arbitrages budget et qualité et votre style de communication avec les participants simulés, puis compare votre profil aux bonnes pratiques PMI pour produire un retour contextualisé.',
  'faq.q6': 'Puis-je annuler à tout moment ?',
  'faq.a6':
    'Oui. Annulation en un clic depuis votre tableau de bord, sans frais. Si vous annulez en cours de mois, vous gardez l’accès jusqu’à la fin de la période payée.',
  'faq.q7': 'Quelle différence entre Simex pro et un cours en ligne classique ?',
  'faq.a7':
    'Un cours vous explique la théorie. Simex pro vous fait vivre la pratique : vous prenez des décisions sous pression, vous négociez avec un commanditaire mécontent, vous gérez une démission imprévue. Le retour porte sur vos actions, pas sur des questionnaires.',
  'faq.q8': 'Les scénarios sont-ils mis à jour ?',
  'faq.a8':
    'Oui. De nouveaux scénarios et des mises à jour des contextes existants arrivent régulièrement. Les abonnés Professionnel et Équipe les reçoivent sans surcoût.',

  // ─── Final CTA ─────────────────────────────────────────────────────────
  'cta.kicker': 'Prêt à franchir le pas ?',
  'cta.title': 'Votre prochain rôle de chef de projet commence ici.',
  'cta.text': 'Rejoignez le programme pilote et transformez votre pratique sans risquer une vraie mission.',
  'cta.button': 'Commencer mon essai gratuit',
  'cta.buttonLoggedIn': 'Reprendre mes simulations',
  'cta.note': 'Sans carte de crédit. Annulation en un clic.',

  // ─── Footer ────────────────────────────────────────────────────────────
  'footer.tagline': 'La plateforme qui transforme vos décisions virtuelles en valeur professionnelle réelle.',
  'footer.product': 'Produit',
  'footer.company': 'Entreprise',
  'footer.link.features': 'Fonctionnalités',
  'footer.link.howItWorks': 'Comment ça marche',
  'footer.link.scenarios': 'Scénarios',
  'footer.link.pricing': 'Tarifs',
  'footer.link.faq': 'FAQ',
  'footer.link.demo': 'Démo',
  'footer.link.about': 'À propos',
  'footer.link.careers': 'Carrières',
  'footer.link.contact': 'Contact',
  'footer.link.privacy': 'Confidentialité',
  'footer.link.terms': 'Conditions d’utilisation',
  'footer.link.legal': 'Mentions légales',
  'footer.link.cookies': 'Cookies',
  'footer.copyright': '© {year} Simex pro. Tous droits réservés.',
  'footer.madeIn': 'Conçu au Québec',
  'footer.social.linkedin': 'Simex pro sur LinkedIn',
} as const;

export type PublicMessageKey = keyof typeof fr;
