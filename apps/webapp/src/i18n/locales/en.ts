import type { PublicMessageKey } from './fr';

/**
 * English catalogue of the public pages. `satisfies` makes the build fail when a key
 * is missing or extra compared to `fr.ts`.
 */
export const en = {
  // ─── Meta ──────────────────────────────────────────────────────────────
  'meta.title': 'Simex pro — Project management simulation',
  'meta.description':
    'Learn project management by living it: immersive scenarios, simulated participants, senior-level feedback. Made in Québec.',

  // ─── Nav ───────────────────────────────────────────────────────────────
  'nav.home': 'Simex pro home',
  'nav.features': 'Features',
  'nav.howItWorks': 'How it works',
  'nav.pricing': 'Pricing',
  'nav.faq': 'FAQ',
  'nav.signIn': 'Sign in',
  'nav.freeTrial': 'Start free',
  'nav.dashboard': 'Dashboard',
  'nav.menu': 'Menu',
  'nav.closeMenu': 'Close menu',
  'nav.switchLanguage': 'Français',
  'nav.switchLanguageAria': 'Voir cette page en français',

  // ─── Hero ──────────────────────────────────────────────────────────────
  'hero.badge': '2026 pilot program',
  'hero.title': 'Project management is not a theory. <accent>Live it.</accent>',
  'hero.subtitle':
    'Dive into immersive scenarios drawn from real projects. Steer budget, team and surprises like a senior project lead, without the real-world consequences.',
  'hero.cta': 'Start my first simulation',
  'hero.ctaLoggedIn': 'Back to my simulations',
  'hero.secondary': 'How it works · 2 min',
  'hero.mockupAlt': 'Preview of the Simex pro dashboard',
  'hero.liveBadge': 'Live · Round 4',

  // ─── Pilot band ────────────────────────────────────────────────────────
  'pilot.kicker': '2026 pilot program',
  'pilot.title': 'Shape the platform with us',
  'pilot.text':
    'Simex pro is in its pilot phase in Québec. Students, trainers and teams who join now get every scenario and steer the next features.',
  'pilot.point.1': 'Full access during the pilot',
  'pilot.point.2': 'A direct line to the product team',
  'pilot.point.3': 'Your feedback shapes the next scenarios',
  'pilot.cta': 'Join the pilot',

  // ─── How it works ──────────────────────────────────────────────────────
  'how.title': '3 steps to mastery',
  'how.subtitle': 'From the first decision to the debrief, in under an hour per scenario.',
  'how.step1.title': 'Pick your scenario',
  'how.step1.text':
    'Choose from scenarios modelled on real projects: construction, IT, ecological transition, hyper-growth. Each one opens with a sponsor brief and a realistic team context.',
  'how.step1.point.1': 'Sponsor brief and defined budget constraints',
  'how.step1.point.2': 'Virtual team of 5 to 8 people',
  'how.step1.point.3': 'Realistic timeline: 8 to 12 simulated weeks',
  'how.step2.title': 'Steer decisions in real time',
  'how.step2.text':
    'Round after round, negotiate with simulated participants, trade off budget against quality, handle the unexpected. Every choice moves the indicators live.',
  'how.step2.point.1': 'Simulated participants who react and negotiate',
  'how.step2.point.2': 'Random events: resignations, delays, audits',
  'how.step2.point.3': 'Indicators updated after every decision',
  'how.step3.title': 'Get senior-level feedback',
  'how.step3.text':
    'Your decisions are analysed, patterns surfaced, and you receive a report calibrated on the PMI standard, enriched by your mentor.',
  'how.step3.point.1': 'Overall score plus a score per dimension (5 axes)',
  'how.step3.point.2': 'At least 3 concrete recommendations',
  'how.step3.point.3': 'Anonymised comparison with your cohort',

  // ─── Mockups ───────────────────────────────────────────────────────────
  'mockup.actors': 'Actors',
  'mockup.kpis': 'Indicators',
  'mockup.budgetUsed': 'Budget used',
  'mockup.teamMorale': 'Team morale',
  'mockup.moraleLow': 'Low',
  'mockup.option1': 'Postpone the sprint',
  'mockup.option2': 'Reinforce the team',
  'mockup.option3': 'Cut scope',
  'mockup.globalScore': 'Overall score',
  'mockup.recommendation': 'Recommendation #1',
  'mockup.recommendationText':
    'Your handling of people risks is below the PMI threshold. Strengthen weekly communication with stakeholders to lift the Team score.',
  'mockup.axis.communication': 'Communication',
  'mockup.axis.schedule': 'Schedule',
  'mockup.axis.team': 'Team',
  'mockup.axis.budget': 'Budget',
  'mockup.axis.risk': 'Risk',

  // ─── Domains ───────────────────────────────────────────────────────────
  'domains.title': 'Pick your world',
  'domains.subtitle': 'Scenarios modelled on real projects and organisations. New worlds are added regularly.',
  'domains.it.title': 'IT & cloud scaling',
  'domains.it.text': 'Sprints, critical deployments, remote teams.',
  'domains.construction.title': 'Infrastructure & construction',
  'domains.construction.text': 'Site logistics, subcontractors, field surprises.',
  'domains.startup.title': 'Hyper-growth',
  'domains.startup.text': 'Time to market and the human scaling of a unicorn.',
  'domains.eco.title': 'Ecological transition',
  'domains.eco.text': 'ESG projects under strict carbon constraints.',
  'domains.finance.title': 'Finance & banking',
  'domains.finance.text': 'Compliance, audits, reporting, regulatory indicators.',
  'domains.health.title': 'Health & pharma',
  'domains.health.text': 'Clinical trials, validation, market launch.',

  // ─── Why ───────────────────────────────────────────────────────────────
  'why.title': 'The method that changes the game',
  'why.pillar1.title': 'Realistic exchanges',
  'why.pillar1.text': 'Simulated participants who react to decisions, negotiate, hesitate. No scripts.',
  'why.pillar2.title': 'Senior-level feedback',
  'why.pillar2.text': 'Your decisions are analysed after every deliverable. You know exactly where to improve.',
  'why.pillar3.title': 'Verifiable credentials',
  'why.pillar3.text': 'Badges aligned with the PMI standard, exportable to LinkedIn, each with its own verification link.',

  // ─── Pricing ───────────────────────────────────────────────────────────
  'pricing.title': 'Pick your plan',
  'pricing.subtitle': 'No credit card. Cancel in one click.',
  'pricing.billing.monthly': 'Monthly',
  'pricing.billing.annual': 'Annual',
  'pricing.billing.annualSave': '2 months free',
  'pricing.perMonth': '/month',
  'pricing.billedAnnually': 'Billed {total} per year',
  'pricing.taxes': 'Prices in Canadian dollars, plus applicable taxes.',
  'pricing.custom': 'Custom',
  'pricing.fromPerSeat': 'from {price} per seat per month, {seats}-seat minimum',
  'pricing.mostPopular': 'Most popular',
  'pricing.cta.signup': 'Sign up',
  'pricing.cta.start': 'Get started',
  'pricing.cta.contact': 'Contact us',
  'pricing.plan.free.name': 'Discovery',
  'pricing.plan.free.feature.1': '3 introductory scenarios',
  'pricing.plan.free.feature.2': '5 written meetings per month',
  'pricing.plan.free.feature.3': 'Personal dashboard',
  'pricing.plan.free.feature.4': 'End-of-meeting feedback',
  'pricing.plan.free.feature.5': 'Email support',
  'pricing.plan.starter.name': 'Learner',
  'pricing.plan.starter.feature.1': 'Every scenario',
  'pricing.plan.starter.feature.2': 'Unlimited written meetings',
  'pricing.plan.starter.feature.3': '4 voice meetings per month',
  'pricing.plan.starter.feature.4': 'Progression plan',
  'pricing.plan.starter.feature.5': '1 course certificate',
  'pricing.plan.pro.name': 'Professional',
  'pricing.plan.pro.feature.1': 'Everything in Learner',
  'pricing.plan.pro.feature.2': 'Unlimited voice meetings (fair use)',
  'pricing.plan.pro.feature.3': 'Virtual mentor and coach mode',
  'pricing.plan.pro.feature.4': 'PMI-ready certificates',
  'pricing.plan.pro.feature.5': 'Report exports',
  'pricing.plan.pro.feature.6': 'Custom meetings',
  'pricing.plan.pro.feature.7': 'Multiplayer mode',
  'pricing.plan.enterprise.name': 'Team',
  'pricing.plan.enterprise.feature.1': 'Everything in Professional',
  'pricing.plan.enterprise.feature.2': 'Trainer dashboard',
  'pricing.plan.enterprise.feature.3': 'Custom scenarios',
  'pricing.plan.enterprise.feature.4': 'Recruitment mode: campaigns and candidate assessment',
  'pricing.plan.enterprise.feature.5': 'Single sign-on (SSO)',
  'pricing.plan.enterprise.feature.6': 'Account manager',

  // ─── FAQ ───────────────────────────────────────────────────────────────
  'faq.kicker': 'Your questions',
  'faq.title': 'Everything you want to know',
  'faq.subtitle': 'If your question is not listed, write to us at {email}.',
  'faq.q1': 'How long does a simulation take?',
  'faq.a1':
    'Between 45 minutes and 2 hours depending on the scenario. You can pause at any time and come back later: your progress is saved.',
  'faq.q2': 'Are the credentials recognised?',
  'faq.a2':
    'Each credential is calibrated on the PMI standard and carries a public verification link any recruiter can check. The badge exports straight to LinkedIn.',
  'faq.q3': 'Can I use Simex pro with my team or colleagues?',
  'faq.a3':
    'Multiplayer mode is included in the Professional plan. Invite colleagues into the same simulation and debrief together with the shared report.',
  'faq.q4': 'Are my data and decisions confidential?',
  'faq.a4':
    'Your simulation decisions are strictly private. Aggregated, anonymised data is used only to improve scenarios and to place you within your cohort. Simex pro is built in Québec and complies with Law 25.',
  'faq.q5': 'How does the evaluation work?',
  'faq.a5':
    'An analysis engine observes your decisions, your budget-versus-quality trade-offs and your communication style with the simulated participants, then compares your profile with PMI good practice to produce contextual feedback.',
  'faq.q6': 'Can I cancel at any time?',
  'faq.a6':
    'Yes. One-click cancellation from your dashboard, no fees. If you cancel mid-month, you keep access until the end of the paid period.',
  'faq.q7': 'How is Simex pro different from a regular online course?',
  'faq.a7':
    'A course explains the theory. Simex pro makes you live the practice: you decide under pressure, negotiate with an unhappy sponsor, handle a surprise resignation. Feedback is about your actions, not quizzes.',
  'faq.q8': 'Are scenarios updated?',
  'faq.a8':
    'Yes. New scenarios and updates to existing contexts arrive regularly. Professional and Team subscribers get them at no extra cost.',

  // ─── Final CTA ─────────────────────────────────────────────────────────
  'cta.kicker': 'Ready to take the leap?',
  'cta.title': 'Your next project-lead role starts here.',
  'cta.text': 'Join the pilot program and transform your practice without risking a real assignment.',
  'cta.button': 'Start my free trial',
  'cta.buttonLoggedIn': 'Back to my simulations',
  'cta.note': 'No credit card. Cancel in one click.',

  // ─── Footer ────────────────────────────────────────────────────────────
  'footer.tagline': 'The platform that turns your virtual decisions into real professional value.',
  'footer.product': 'Product',
  'footer.company': 'Company',
  'footer.link.features': 'Features',
  'footer.link.howItWorks': 'How it works',
  'footer.link.scenarios': 'Scenarios',
  'footer.link.pricing': 'Pricing',
  'footer.link.faq': 'FAQ',
  'footer.link.demo': 'Demo',
  'footer.link.about': 'About',
  'footer.link.careers': 'Careers',
  'footer.link.contact': 'Contact',
  'footer.link.privacy': 'Privacy',
  'footer.link.terms': 'Terms of use',
  'footer.link.legal': 'Legal notice',
  'footer.link.cookies': 'Cookies',
  'footer.copyright': '© {year} Simex pro. All rights reserved.',
  'footer.madeIn': 'Made in Québec',
  'footer.social.linkedin': 'Simex pro on LinkedIn',
} as const satisfies Record<PublicMessageKey, string>;
