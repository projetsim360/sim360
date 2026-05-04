import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import {
  Code2,
  Building2,
  Rocket,
  Leaf,
  Banknote,
  Heart,
  Sparkles,
  UserCheck,
  Award,
  Twitter,
  Linkedin,
  Play,
  Menu,
  X,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';

/* ─── Nav ──────────────────────────────────────────────────────────── */

function StickyNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Fonctionnalités', href: '#fonctionnalites' },
    { label: 'Tarifs', href: '#tarifs' },
    { label: 'FAQ', href: '#comment-ca-marche' },
    { label: 'Témoignages', href: '#temoignages' },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-card/80 backdrop-blur-md shadow-sm border-b border-border' : 'bg-transparent'
      }`}
    >
      <div className="flex items-center justify-between px-6 lg:px-8 py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/" aria-label="Accueil Simex pro">
          <Logo />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/auth/login">
            <Button variant="outline" size="sm">Connexion</Button>
          </Link>
          <Link to="/auth/register">
            <Button variant="primary" size="sm">Essai gratuit</Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden bg-card border-t border-border px-6 py-6 flex flex-col gap-5">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-3 pt-2 border-t border-border">
            <Link to="/auth/login" onClick={() => setMobileOpen(false)}>
              <Button variant="outline" size="sm" className="w-full">Connexion</Button>
            </Link>
            <Link to="/auth/register" onClick={() => setMobileOpen(false)}>
              <Button variant="primary" size="sm" className="w-full">Essai gratuit</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

/* ─── Hero ─────────────────────────────────────────────────────────── */

function HeroSection() {
  return (
    <section
      id="hero"
      className="pt-32 pb-24 lg:pt-40 lg:pb-32 px-6 lg:px-8 bg-background"
      style={{
        backgroundImage:
          'radial-gradient(ellipse 800px 600px at 80% 0%, rgba(238,122,58,0.08), transparent)',
      }}
    >
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
        {/* Left */}
        <div>
          <span className="inline-flex bg-[var(--accent-500)]/15 text-[var(--accent-300)] text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-[var(--accent-500)]/20">
            🎯 Beta — gratuit jusqu&apos;au 31 juillet
          </span>

          <h1
            className="font-display font-extrabold text-[40px] sm:text-[52px] lg:text-[64px] leading-[1.05] tracking-[-0.02em] text-balance text-foreground"
          >
            La gestion de projet n&apos;est pas une théorie.{' '}
            <span className="text-[var(--accent-500)]">Vivez-la.</span>
          </h1>

          <p className="text-lg lg:text-xl text-muted-foreground mt-6 max-w-xl">
            Plongez dans 12 scénarios immersifs alimentés par l&apos;IA. Pilotez budget, équipe et imprévus comme un senior PM — sans les conséquences réelles.
          </p>

          <div className="flex flex-wrap gap-4 mt-10">
            <Link to="/auth/register">
              <Button variant="primary" size="lg">
                Lancer ma première simulation
              </Button>
            </Link>
            <a
              href="#comment-ca-marche"
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
            >
              <span
                className="size-9 rounded-full border-2 border-current flex items-center justify-center"
              >
                <Play size={14} className="ml-0.5" />
              </span>
              Voir la démo · 2 min
            </a>
          </div>
        </div>

        {/* Right — Browser mockup */}
        <div className="relative">
          <div
            className="relative w-full aspect-[4/3] rounded-2xl border border-[var(--brand-700)]/20 bg-[var(--brand-900)] overflow-hidden"
            style={{
              boxShadow:
                '0 30px 80px rgba(15,26,46,0.2), 0 12px 24px rgba(15,26,46,0.1)',
            }}
          >
            {/* Traffic lights */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
              <span className="size-3 rounded-full" style={{ background: '#ff5f56' }} />
              <span className="size-3 rounded-full" style={{ background: '#ffbd2e' }} />
              <span className="size-3 rounded-full" style={{ background: '#27c93f' }} />
              <span className="ml-4 flex-1 bg-white/10 rounded text-[10px] text-white/40 px-3 py-0.5 text-center">
                app.simexpro.io/simulation/erp-globalfinance
              </span>
            </div>

            {/* Dashboard interior */}
            <div className="p-5 flex flex-col gap-4">
              <p className="text-white/70 text-sm font-medium">Déploiement ERP GlobalFinance</p>

              {/* KPI tiles */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-[10px] uppercase tracking-widest text-white/50 mb-1">Budget</p>
                  <p className="font-display font-extrabold text-2xl text-[var(--accent-500)]">65%</p>
                  <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full w-[65%] rounded-full bg-[var(--accent-500)]" />
                  </div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                  <p className="text-[10px] uppercase tracking-widest text-white/50 mb-1">Risques</p>
                  <p className="font-display font-extrabold text-2xl text-white">4</p>
                  <p className="text-[10px] text-white/50 mt-1">actifs · 2 critiques</p>
                </div>
              </div>

              {/* AI analysis bar */}
              <div className="bg-white/5 rounded-xl p-4 border border-[var(--accent-500)]/30">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] uppercase tracking-widest text-[var(--accent-400)] font-bold">
                    Analyse IA en cours
                  </p>
                  <span className="text-[10px] text-white/50">75%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full w-[75%] rounded-full"
                    style={{
                      background:
                        'linear-gradient(90deg, var(--accent-500), var(--accent-400))',
                      boxShadow: '0 0 8px rgba(238,122,58,0.5)',
                    }}
                  />
                </div>
              </div>

              {/* Skeleton lines */}
              <div className="space-y-2">
                <div className="h-2 rounded bg-white/10 w-4/5" />
                <div className="h-2 rounded bg-white/10 w-3/5" />
                <div className="h-2 rounded bg-white/10 w-2/3" />
              </div>
            </div>

            {/* Float badge */}
            <div
              className="absolute top-16 right-4 bg-[var(--accent-500)]/20 border border-[var(--accent-500)]/40 rounded-full px-3 py-1 text-[11px] font-semibold text-[var(--accent-300)]"
            >
              En cours · Tour 4
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Trust Band ────────────────────────────────────────────────────── */

function TrustBand() {
  const logos = ['BOUYGUES', 'BNP PARIBAS', 'SNCF', 'KPMG', 'ESSEC', 'POLYTECHNIQUE'];

  return (
    <section className="py-10 px-6 lg:px-8 bg-card/40 border-y border-border">
      <div className="max-w-7xl mx-auto">
        <p className="text-xs uppercase tracking-widest text-muted-foreground text-center mb-6">
          Ils nous font confiance
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-4 opacity-60">
          {logos.map((logo) => (
            <span
              key={logo}
              className="text-foreground/60 font-semibold text-base"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Stats Band ────────────────────────────────────────────────────── */

function StatsBand() {
  const stats = [
    { value: '+12 000', label: 'simulations complétées' },
    { value: '98%', label: 'satisfaction apprenants' },
    { value: '650+', label: 'entreprises partenaires' },
  ];

  return (
    <section className="py-20 border-y border-border bg-background" id="stats">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <h3 className="font-display font-extrabold text-5xl text-[var(--accent-500)]">
                {s.value}
              </h3>
              <p className="text-sm text-muted-foreground tracking-wide uppercase mt-2">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Comment ça marche ─────────────────────────────────────────────── */

function HowItWorksSection() {
  const steps = [
    {
      n: '01',
      title: 'Choisissez',
      desc: 'Sélectionnez votre secteur et votre rôle. Chaque scénario est généré par l\'IA sur la base de vrais cas d\'entreprise.',
    },
    {
      n: '02',
      title: 'Agissez',
      desc: 'Prenez des décisions stratégiques, animez des réunions avec des acteurs IA, gérez votre budget et vos équipes.',
    },
    {
      n: '03',
      title: 'Analysez',
      desc: 'Recevez un feedback comportemental détaillé et un bilan de compétences exportable sur LinkedIn.',
    },
  ];

  return (
    <section
      id="comment-ca-marche"
      className="py-24 px-6 lg:px-8 bg-[var(--brand-700)] text-white scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-center mb-4">
          3 étapes vers la maîtrise
        </h2>
        <p className="text-lg text-white/70 max-w-2xl mx-auto text-center mb-16">
          De la première décision au feedback IA, en moins d&apos;une heure par scénario.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.n}
              className="bg-white/5 border-t-2 border-[var(--accent-500)] rounded-xl p-8 backdrop-blur-sm"
            >
              <p className="text-[var(--accent-500)] font-bold text-sm tracking-widest">
                ÉTAPE {step.n}
              </p>
              <h3 className="font-display font-bold text-2xl mt-3 mb-3 text-white">
                {step.title}
              </h3>
              <p className="text-white/70 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Domaines d'immersion ──────────────────────────────────────────── */

function DomainsSection() {
  const domains = [
    {
      Icon: Code2,
      title: 'IT & Cloud Scaling',
      desc: 'Sprints, déploiements critiques, équipes distantes.',
    },
    {
      Icon: Building2,
      title: 'Infrastructure & BTP',
      desc: 'Logistique chantier, sous-traitants, aléas terrain.',
    },
    {
      Icon: Rocket,
      title: 'Hyper-croissance',
      desc: 'Time-to-Market et scalabilité humaine d\'une licorne.',
    },
    {
      Icon: Leaf,
      title: 'Transition écologique',
      desc: 'Projets ESG sous contraintes carbone strictes.',
    },
    {
      Icon: Banknote,
      title: 'Finance & Banque',
      desc: 'Conformité, audits, reporting, KPIs réglementaires.',
    },
    {
      Icon: Heart,
      title: 'Santé & Pharma',
      desc: 'Essais cliniques, validation, mise sur le marché.',
    },
  ];

  return (
    <section
      id="fonctionnalites"
      className="py-24 px-6 lg:px-8 bg-background scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display font-extrabold text-4xl text-foreground">
            Choisissez votre univers
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            12 scénarios calqués sur de vrais cabinets et entreprises. Mis à jour chaque trimestre.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {domains.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="bg-card rounded-2xl p-8 border border-border hover:border-[var(--accent-500)] hover:-translate-y-1 transition-all duration-300 cursor-default"
            >
              <div className="size-12 rounded-lg bg-[var(--accent-500)]/15 text-[var(--accent-400)] flex items-center justify-center mb-5">
                <Icon size={22} />
              </div>
              <h3 className="font-display font-bold text-xl mb-2 text-foreground">
                {title}
              </h3>
              <p className="text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Pourquoi Simex pro ─────────────────────────────────────────────── */

function WhySection() {
  const pillars = [
    {
      Icon: Sparkles,
      title: 'Réalisme IA',
      desc: 'Acteurs virtuels qui réagissent aux décisions, négocient, doutent. Pas de scripts.',
    },
    {
      Icon: UserCheck,
      title: 'Feedback senior',
      desc: 'Analyse comportementale après chaque livrable. Vous savez précisément où progresser.',
    },
    {
      Icon: Award,
      title: 'Certification reconnue',
      desc: 'Badges PMI-ready exportables sur LinkedIn. Validés par 650+ recruteurs.',
    },
  ];

  return (
    <section className="py-24 px-6 lg:px-8 bg-card">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display font-extrabold text-4xl text-foreground">
            La méthode qui change la donne
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-12">
          {pillars.map(({ Icon, title, desc }) => (
            <div key={title} className="text-center">
              <div className="size-16 rounded-full bg-[var(--accent-500)]/20 text-[var(--accent-400)] flex items-center justify-center mx-auto mb-6 border border-[var(--accent-500)]/30">
                <Icon size={28} />
              </div>
              <h3 className="font-display font-bold text-xl mb-3 text-foreground">
                {title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Témoignages ───────────────────────────────────────────────────── */

function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        'J\'ai progressé en 3 semaines plus que sur 6 mois en mission. La simulation force à prendre des décisions sous pression — c\'est ça qui fait la différence.',
      name: 'Léa M.',
      role: 'Junior PM → Senior PM en 2026',
      photo: '/media/landing/testi-lea.jpg',
    },
    {
      quote:
        'Le réalisme est bluffant. On ressent vraiment la pression du budget qui fond. C\'est exactement ce dont nos consultants avaient besoin.',
      name: 'Marc D.',
      role: 'Chef de projet, KPMG',
      photo: '/media/landing/testi-marc.jpg',
    },
    {
      quote:
        'C\'est l\'outil qu\'on cherchait pour évaluer les soft skills sans biais de CV. En 45 minutes, on sait exactement comment un candidat gère la pression.',
      name: 'Sophie V.',
      role: 'DRH, Bouygues',
      photo: '/media/landing/testi-sophie.jpg',
    },
  ];

  return (
    <section
      id="temoignages"
      className="py-24 px-6 lg:px-8 scroll-mt-20"
      style={{ background: 'rgba(255, 255, 255, 0.02)' }}
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="font-display font-extrabold text-4xl text-foreground text-center mb-16">
          Ils ont fait le saut
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map(({ quote, name, role, photo }) => (
            <div
              key={name}
              className="bg-card rounded-2xl p-8 border border-border flex flex-col"
            >
              <p className="italic text-[15px] leading-relaxed text-foreground flex-1">
                &ldquo;{quote}&rdquo;
              </p>
              <div className="flex items-center gap-4 mt-6 pt-6 border-t border-border">
                <img
                  src={photo}
                  alt={name}
                  className="size-12 rounded-full object-cover bg-muted"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.className =
                      'size-12 rounded-full bg-[var(--accent-500)]/20 flex items-center justify-center text-[var(--accent-300)] font-bold text-sm border border-[var(--accent-500)]/30';
                    fallback.textContent = name.charAt(0);
                    target.parentNode?.insertBefore(fallback, target);
                  }}
                />
                <div>
                  <p className="font-semibold text-sm">{name}</p>
                  <p className="text-xs text-muted-foreground">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Tarifs ────────────────────────────────────────────────────────── */

function PricingSection() {
  const plans = [
    {
      name: 'Aspirant',
      price: '0€',
      period: '/mois',
      featured: false,
      features: [
        '3 scénarios d\'initiation',
        'IA texte',
        'Dashboard personnel',
        'Support email',
      ],
      cta: 'S\'inscrire',
      ctaVariant: 'outline' as const,
    },
    {
      name: 'Professionnel',
      price: '29€',
      period: '/mois',
      featured: true,
      features: [
        'Scénarios illimités',
        'IA vocale temps réel',
        'Mentor IA personnalisé',
        'Certificats PMI-ready',
        'Mode multi-joueur',
      ],
      cta: 'Démarrer l\'essai',
      ctaVariant: 'primary' as const,
    },
    {
      name: 'Entreprise',
      price: 'Sur mesure',
      period: '',
      featured: false,
      features: [
        'Scénarios sur-mesure',
        'Dashboard équipe',
        'Intégration SSO',
        'Account manager dédié',
      ],
      cta: 'Contacter les ventes',
      ctaVariant: 'outline' as const,
    },
  ];

  return (
    <section
      id="tarifs"
      className="py-24 px-6 lg:px-8 bg-background scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display font-extrabold text-4xl text-foreground">
            Choisissez votre plan
          </h2>
          <p className="text-muted-foreground mt-3">
            Sans carte bancaire. Annulation en un clic.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-card rounded-2xl p-8 border relative overflow-visible ${
                plan.featured
                  ? 'border-2 border-[var(--accent-500)] scale-[1.02]'
                  : 'border-border'
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--accent-500)] text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  LE PLUS CHOISI
                </div>
              )}

              <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent-600)] mb-4">
                {plan.name}
              </p>

              <div className="mb-6">
                <span className="font-display font-extrabold text-5xl text-foreground">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-muted-foreground text-sm ml-1">{plan.period}</span>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-foreground/80">
                    <Check size={16} className="text-[var(--accent-500)] mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Link to="/auth/register">
                <Button variant={plan.ctaVariant} size="sm" className="w-full">
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Final CTA ─────────────────────────────────────────────────────── */

function FinalCTA() {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{ backgroundImage: "url('/media/landing/cta-immersive.jpg')" }}
      />
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(238,122,58,0.30) 0%, transparent 50%), rgba(15,26,46,0.85)',
        }}
      />
      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto text-center text-white">
        <p className="text-xs font-bold tracking-widest uppercase text-[var(--accent-400)] mb-3">
          Prêt à franchir le pas ?
        </p>
        <h2 className="font-display font-extrabold text-4xl lg:text-5xl mt-3 mb-6">
          Votre prochain rôle de PM commence ici.
        </h2>
        <p className="text-white/80 text-lg max-w-2xl mx-auto mb-10">
          Rejoignez 12 000+ apprenants qui transforment leur carrière sans risquer une vraie mission.
        </p>
        <Link to="/auth/register">
          <Button variant="primary" size="lg">
            Commencer mon essai gratuit
          </Button>
        </Link>
        <p className="text-white/60 text-sm mt-4">
          Sans carte bancaire. Annulation en un clic.
        </p>
      </div>
    </section>
  );
}

/* ─── Footer ────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="bg-[var(--brand-900)] text-white py-20 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Col 1 — Brand */}
          <div className="lg:col-span-2">
            <Logo onDark />
            <p className="text-white/60 text-sm leading-relaxed mt-4 max-w-sm">
              La plateforme qui transforme vos décisions virtuelles en valeur professionnelle réelle.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="text-white/50 hover:text-white transition-colors"
              >
                <Twitter size={18} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-white/50 hover:text-white transition-colors"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Col 2 — Produit */}
          <div>
            <h4 className="font-semibold text-sm text-white mb-5">Produit</h4>
            <ul className="space-y-3">
              {['Fonctionnalités', 'Scénarios', 'Tarifs', 'Démo'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-white/60 hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Compagnie */}
          <div>
            <h4 className="font-semibold text-sm text-white mb-5">Compagnie</h4>
            <ul className="space-y-3">
              {['À propos', 'Carrières', 'Blog', 'Contact'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-white/60 hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Légal — separate row on smaller grid */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-sm text-white/40">
            © 2026 Simex pro. Tous droits réservés.
          </p>
          <ul className="flex flex-wrap gap-6">
            {['Confidentialité', 'CGU', 'Mentions légales', 'Cookies'].map((item) => (
              <li key={item}>
                <a href="#" className="text-xs text-white/40 hover:text-white/70 transition-colors">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

/* ─── Main export ───────────────────────────────────────────────────── */

export default function LandingPage() {
  // Force dark mode on the landing page regardless of the user's
  // app-wide theme preference. The `dark` class flips all CSS var
  // aliases (--background, --card, --foreground…) to their dark
  // values via the `.dark { … }` block in globals.css.
  return (
    <div className="dark min-h-screen bg-background text-foreground overflow-x-hidden">
      <StickyNav />
      <HeroSection />
      <TrustBand />
      <StatsBand />
      <HowItWorksSection />
      <DomainsSection />
      <WhySection />
      <TestimonialsSection />
      <PricingSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
