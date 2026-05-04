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
  ChevronDown,
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
    { label: 'FAQ', href: '#faq' },
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
            className="relative w-full aspect-[16/10] rounded-2xl border border-[var(--brand-700)]/20 bg-[var(--brand-900)] overflow-hidden flex flex-col"
            style={{
              boxShadow:
                '0 30px 80px rgba(15,26,46,0.2), 0 12px 24px rgba(15,26,46,0.1)',
            }}
          >
            {/* Traffic lights + URL bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 shrink-0 bg-[var(--brand-900)] z-10">
              <span className="size-3 rounded-full" style={{ background: '#ff5f56' }} />
              <span className="size-3 rounded-full" style={{ background: '#ffbd2e' }} />
              <span className="size-3 rounded-full" style={{ background: '#27c93f' }} />
              <span className="ml-4 flex-1 bg-white/10 rounded text-[10px] text-white/40 px-3 py-0.5 text-center">
                app.simexpro.io/dashboard
              </span>
            </div>

            {/* Real product screenshot fills remaining frame area */}
            <div className="relative flex-1 overflow-hidden">
              <img
                src="/media/landing/hero-dashboard.png"
                alt="Aperçu du tableau de bord Simex pro"
                className="absolute inset-0 w-full h-full object-cover object-top"
                loading="eager"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>

            {/* Float badge — overlay above screenshot */}
            <div
              className="absolute top-16 right-4 bg-[var(--accent-500)]/90 backdrop-blur-sm rounded-full px-3 py-1 text-[11px] font-semibold text-white shadow-lg z-20"
            >
              En direct · Tour 4
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

function MockupStep01() {
  return (
    <div className="relative w-full aspect-[4/3] rounded-2xl border border-white/10 bg-[var(--brand-900)] overflow-hidden shadow-2xl">
      {/* Traffic light header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
        <span className="size-3 rounded-full" style={{ background: '#ff5f56' }} />
        <span className="size-3 rounded-full" style={{ background: '#ffbd2e' }} />
        <span className="size-3 rounded-full" style={{ background: '#27c93f' }} />
        <span className="ml-4 flex-1 bg-white/10 rounded text-[10px] text-white/40 px-3 py-0.5 text-center">
          app.simexpro.io/scenarios
        </span>
      </div>
      {/* Scenario picker grid */}
      <div className="p-4 grid grid-cols-2 gap-3 h-[calc(100%-44px)]">
        {/* Card 1 — selected */}
        <div className="bg-white/5 rounded-xl p-3 border-2 border-[var(--accent-500)] flex flex-col gap-2 relative"
          style={{ boxShadow: '0 0 12px rgba(238,122,58,0.2)' }}>
          <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--accent-400)] bg-[var(--accent-500)]/15 rounded px-1.5 py-0.5 self-start">
            IT
          </span>
          <div className="h-2 bg-white/30 rounded w-4/5" />
          <div className="h-2 bg-white/20 rounded w-3/5" />
          <div className="mt-auto h-1 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full w-[72%] rounded-full bg-[var(--accent-500)]" />
          </div>
          <div className="absolute top-2 right-2 size-4 rounded-full bg-[var(--accent-500)] flex items-center justify-center">
            <Check size={10} className="text-white" />
          </div>
        </div>
        {/* Card 2 */}
        <div className="bg-white/5 rounded-xl p-3 border border-white/10 flex flex-col gap-2">
          <span className="text-[9px] font-bold uppercase tracking-widest text-blue-400 bg-blue-400/15 rounded px-1.5 py-0.5 self-start">
            BTP
          </span>
          <div className="h-2 bg-white/20 rounded w-4/5" />
          <div className="h-2 bg-white/10 rounded w-3/5" />
          <div className="mt-auto h-1 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full w-[45%] rounded-full bg-blue-400/60" />
          </div>
        </div>
        {/* Card 3 */}
        <div className="bg-white/5 rounded-xl p-3 border border-white/10 flex flex-col gap-2">
          <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-400/15 rounded px-1.5 py-0.5 self-start">
            ECO
          </span>
          <div className="h-2 bg-white/20 rounded w-4/5" />
          <div className="h-2 bg-white/10 rounded w-2/3" />
          <div className="mt-auto h-1 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full w-[30%] rounded-full bg-emerald-400/60" />
          </div>
        </div>
        {/* Card 4 */}
        <div className="bg-white/5 rounded-xl p-3 border border-white/10 flex flex-col gap-2">
          <span className="text-[9px] font-bold uppercase tracking-widest text-violet-400 bg-violet-400/15 rounded px-1.5 py-0.5 self-start">
            FIN
          </span>
          <div className="h-2 bg-white/20 rounded w-4/5" />
          <div className="h-2 bg-white/10 rounded w-1/2" />
          <div className="mt-auto h-1 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full w-[58%] rounded-full bg-violet-400/60" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MockupStep02() {
  return (
    <div className="relative w-full aspect-[4/3] rounded-2xl border border-white/10 bg-[var(--brand-900)] overflow-hidden shadow-2xl">
      {/* Traffic light header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
        <span className="size-3 rounded-full" style={{ background: '#ff5f56' }} />
        <span className="size-3 rounded-full" style={{ background: '#ffbd2e' }} />
        <span className="size-3 rounded-full" style={{ background: '#27c93f' }} />
        <span className="ml-4 flex-1 bg-white/10 rounded text-[10px] text-white/40 px-3 py-0.5 text-center">
          app.simexpro.io/simulation/tour-4
        </span>
      </div>
      {/* Decision interface */}
      <div className="p-4 flex flex-col gap-3 h-[calc(100%-44px)]">
        {/* Top row: actors + KPIs */}
        <div className="flex gap-3 flex-1">
          {/* Actors column */}
          <div className="flex flex-col gap-2 w-2/5">
            <p className="text-[9px] uppercase tracking-widest text-white/50 font-bold">Acteurs</p>
            {[
              { initials: 'MS', name: 'Marc', role: 'Sponsor', color: 'bg-blue-500' },
              { initials: 'ND', name: 'Nina', role: 'DevLead', color: 'bg-violet-500' },
              { initials: 'TC', name: 'Tom', role: 'PMO', color: 'bg-emerald-500' },
            ].map((actor) => (
              <div key={actor.name} className="flex items-center gap-2">
                <span className={`size-6 rounded-full ${actor.color} flex items-center justify-center text-[8px] font-bold text-white shrink-0`}>
                  {actor.initials}
                </span>
                <div>
                  <p className="text-[10px] text-white/80 font-medium leading-none">{actor.name}</p>
                  <p className="text-[9px] text-white/40 leading-none mt-0.5">{actor.role}</p>
                </div>
              </div>
            ))}
          </div>
          {/* KPI column */}
          <div className="flex flex-col gap-2 flex-1">
            <p className="text-[9px] uppercase tracking-widest text-white/50 font-bold">KPIs</p>
            <div className="bg-white/5 rounded-lg p-2.5 border border-white/10">
              <p className="text-[9px] text-white/50 mb-0.5">Budget consommé</p>
              <p className="text-base font-display font-extrabold text-[var(--accent-500)]">65%</p>
            </div>
            <div className="bg-white/5 rounded-lg p-2.5 border border-red-500/30">
              <p className="text-[9px] text-white/50 mb-0.5">Moral équipe</p>
              <p className="text-base font-display font-extrabold text-red-400">Low</p>
            </div>
          </div>
        </div>
        {/* Decision options */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/5 rounded-lg p-2 border border-white/10 text-center">
            <p className="text-[9px] text-white/50 leading-snug">Reporter le sprint</p>
          </div>
          <div className="bg-white/5 rounded-lg p-2 border-2 border-[var(--accent-500)] text-center"
            style={{ boxShadow: '0 0 8px rgba(238,122,58,0.2)' }}>
            <p className="text-[9px] text-[var(--accent-300)] font-semibold leading-snug">Renforcer l&apos;équipe</p>
          </div>
          <div className="bg-white/5 rounded-lg p-2 border border-white/10 text-center">
            <p className="text-[9px] text-white/50 leading-snug">Réduire le scope</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockupStep03() {
  // SVG pentagon radar — 5 vertices
  // Pentagon points (cx=80, cy=70, r=52) starting from top, clockwise
  const cx = 80;
  const cy = 70;
  const r = 52;
  const axes = [
    { label: 'Communication', value: 82, angle: -90 },
    { label: 'Délai', value: 88, angle: -18 },
    { label: 'Équipe', value: 74, angle: 54 },
    { label: 'Budget', value: 71, angle: 126 },
    { label: 'Risque', value: 65, angle: 198 },
  ];

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const outerPts = axes.map((a) => ({
    x: cx + r * Math.cos(toRad(a.angle)),
    y: cy + r * Math.sin(toRad(a.angle)),
  }));
  const innerPts = axes.map((a) => ({
    x: cx + (r * a.value / 100) * Math.cos(toRad(a.angle)),
    y: cy + (r * a.value / 100) * Math.sin(toRad(a.angle)),
  }));
  const outerPath = outerPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z';
  const innerPath = innerPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z';

  // Label positions — offset outward from vertex
  const labelOffset = 14;
  const labelPts = axes.map((a) => ({
    x: cx + (r + labelOffset) * Math.cos(toRad(a.angle)),
    y: cy + (r + labelOffset) * Math.sin(toRad(a.angle)),
    label: a.label,
    value: a.value,
  }));

  return (
    <div className="relative w-full aspect-[4/3] rounded-2xl border border-white/10 bg-[var(--brand-900)] overflow-hidden shadow-2xl">
      {/* Traffic light header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
        <span className="size-3 rounded-full" style={{ background: '#ff5f56' }} />
        <span className="size-3 rounded-full" style={{ background: '#ffbd2e' }} />
        <span className="size-3 rounded-full" style={{ background: '#27c93f' }} />
        <span className="ml-4 flex-1 bg-white/10 rounded text-[10px] text-white/40 px-3 py-0.5 text-center">
          app.simexpro.io/rapport/erp-globalfinance
        </span>
      </div>
      {/* Report content */}
      <div className="p-4 flex flex-col gap-3 h-[calc(100%-44px)]">
        {/* Score global */}
        <div className="flex items-center gap-3">
          <div>
            <p className="text-[9px] uppercase tracking-widest text-white/50 font-bold">Score global</p>
            <p className="font-display font-extrabold text-3xl text-[var(--accent-500)] leading-none">78<span className="text-base text-white/40">/100</span></p>
          </div>
          {/* SVG Radar */}
          <div className="flex-1">
            <svg viewBox="0 0 160 140" className="w-full h-full" style={{ maxHeight: '90px' }}>
              {/* Background pentagon */}
              <path d={outerPath} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              {/* Mid pentagon */}
              <path
                d={axes.map((a, i) => {
                  const pt = { x: cx + (r * 0.5) * Math.cos(toRad(a.angle)), y: cy + (r * 0.5) * Math.sin(toRad(a.angle)) };
                  return `${i === 0 ? 'M' : 'L'}${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
                }).join(' ') + ' Z'}
                fill="none"
                stroke="rgba(255,255,255,0.07)"
                strokeWidth="1"
              />
              {/* Axis lines */}
              {outerPts.map((p, i) => (
                <line key={i} x1={cx} y1={cy} x2={p.x.toFixed(1)} y2={p.y.toFixed(1)} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              ))}
              {/* Data polygon */}
              <path d={innerPath} fill="rgba(238,122,58,0.25)" stroke="var(--accent-500)" strokeWidth="1.5" />
              {/* Data dots */}
              {innerPts.map((p, i) => (
                <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="2.5" fill="var(--accent-500)" />
              ))}
              {/* Labels */}
              {labelPts.map((p) => (
                <text
                  key={p.label}
                  x={p.x.toFixed(1)}
                  y={p.y.toFixed(1)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="7"
                  fill="rgba(255,255,255,0.55)"
                >
                  {p.value}
                </text>
              ))}
            </svg>
          </div>
        </div>
        {/* Recommendation card */}
        <div className="flex-1 bg-white/5 rounded-lg p-3 border border-[var(--accent-500)]/30 flex flex-col gap-1.5">
          <p className="text-[9px] uppercase tracking-widest text-[var(--accent-400)] font-bold">Recommandation #1</p>
          <p className="text-[11px] text-white/70 leading-snug">
            Votre gestion des risques humains est en-dessous du seuil PMI. Renforcez la communication hebdomadaire avec les parties prenantes pour améliorer le score Équipe.
          </p>
        </div>
      </div>
    </div>
  );
}

function HowItWorksSection() {
  return (
    <section
      id="comment-ca-marche"
      className="py-24 px-6 lg:px-8 bg-[var(--brand-700)] scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-white mb-4">
            3 étapes vers la maîtrise
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            De la première décision au feedback IA, en moins d&apos;une heure par scénario.
          </p>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-20">
          {/* Step 01 — text LEFT, mockup RIGHT */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Text — order-2 on mobile (below mockup), order-1 on desktop (left) */}
            <div className="space-y-5 order-2 lg:order-1">
              <span
                className="font-display font-extrabold text-[80px] leading-none tracking-tighter text-transparent block"
                style={{ WebkitTextStroke: '1px var(--accent-500)' }}
              >
                01
              </span>
              <h3 className="font-display font-bold text-3xl lg:text-4xl text-white">
                Choisissez votre scénario
              </h3>
              <p className="text-white/70 text-lg leading-relaxed">
                Sélectionnez parmi 12 scénarios calqués sur de vrais cabinets : BTP, IT, transition éco, hyper-croissance. Chaque scénario démarre avec un brief sponsor et un contexte d&apos;équipe réaliste.
              </p>
              <ul className="space-y-2.5 text-white/85 text-[15px]">
                <li className="flex items-start gap-3">
                  <Check size={18} className="text-[var(--accent-400)] mt-0.5 shrink-0" />
                  Brief sponsor et contraintes budgétaires définies
                </li>
                <li className="flex items-start gap-3">
                  <Check size={18} className="text-[var(--accent-400)] mt-0.5 shrink-0" />
                  Équipe virtuelle de 5 à 8 personnes
                </li>
                <li className="flex items-start gap-3">
                  <Check size={18} className="text-[var(--accent-400)] mt-0.5 shrink-0" />
                  Calendrier réaliste : 8 à 12 semaines de simulation
                </li>
              </ul>
            </div>
            {/* Mockup — order-1 on mobile (above text), order-2 on desktop (right) */}
            <div className="order-1 lg:order-2">
              <MockupStep01 />
            </div>
          </div>

          {/* Step 02 — mockup LEFT, text RIGHT */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Mockup — order-1 both mobile and desktop (left) */}
            <div className="order-1">
              <MockupStep02 />
            </div>
            {/* Text — order-2 both mobile and desktop (right) */}
            <div className="space-y-5 order-2">
              <span
                className="font-display font-extrabold text-[80px] leading-none tracking-tighter text-transparent block"
                style={{ WebkitTextStroke: '1px var(--accent-500)' }}
              >
                02
              </span>
              <h3 className="font-display font-bold text-3xl lg:text-4xl text-white">
                Pilotez les décisions en temps réel
              </h3>
              <p className="text-white/70 text-lg leading-relaxed">
                Tour par tour, négociez avec les acteurs IA, arbitrez budget vs qualité, gérez les imprévus. Chaque choix impacte les KPIs en direct.
              </p>
              <ul className="space-y-2.5 text-white/85 text-[15px]">
                <li className="flex items-start gap-3">
                  <Check size={18} className="text-[var(--accent-400)] mt-0.5 shrink-0" />
                  Acteurs IA qui réagissent et négocient
                </li>
                <li className="flex items-start gap-3">
                  <Check size={18} className="text-[var(--accent-400)] mt-0.5 shrink-0" />
                  Imprévus aléatoires (démissions, retards, audits)
                </li>
                <li className="flex items-start gap-3">
                  <Check size={18} className="text-[var(--accent-400)] mt-0.5 shrink-0" />
                  KPIs mis à jour à chaque décision
                </li>
              </ul>
            </div>
          </div>

          {/* Step 03 — text LEFT, mockup RIGHT */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Text — order-2 on mobile (below mockup), order-1 on desktop (left) */}
            <div className="space-y-5 order-2 lg:order-1">
              <span
                className="font-display font-extrabold text-[80px] leading-none tracking-tighter text-transparent block"
                style={{ WebkitTextStroke: '1px var(--accent-500)' }}
              >
                03
              </span>
              <h3 className="font-display font-bold text-3xl lg:text-4xl text-white">
                Recevez un feedback senior
              </h3>
              <p className="text-white/70 text-lg leading-relaxed">
                L&apos;IA analyse vos décisions, identifie les patterns et vous livre un rapport calibré sur le standard PMI. Personnalisable par mentor.
              </p>
              <ul className="space-y-2.5 text-white/85 text-[15px]">
                <li className="flex items-start gap-3">
                  <Check size={18} className="text-[var(--accent-400)] mt-0.5 shrink-0" />
                  Score global + scores par dimension (5 axes)
                </li>
                <li className="flex items-start gap-3">
                  <Check size={18} className="text-[var(--accent-400)] mt-0.5 shrink-0" />
                  3 recommandations actionnables minimum
                </li>
                <li className="flex items-start gap-3">
                  <Check size={18} className="text-[var(--accent-400)] mt-0.5 shrink-0" />
                  Comparaison avec votre cohorte (anonymisée)
                </li>
              </ul>
            </div>
            {/* Mockup — order-1 on mobile (above text), order-2 on desktop (right) */}
            <div className="order-1 lg:order-2">
              <MockupStep03 />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Domaines d'immersion ──────────────────────────────────────────── */

const DOMAINS = [
  {
    icon: Code2,
    title: 'IT & Cloud Scaling',
    description: 'Sprints, déploiements critiques, équipes distantes.',
    image: '/media/landing/domain-it.png',
  },
  {
    icon: Building2,
    title: 'Infrastructure & BTP',
    description: 'Logistique chantier, sous-traitants, aléas terrain.',
    image: '/media/landing/domain-btp.jpg',
  },
  {
    icon: Rocket,
    title: 'Hyper-croissance',
    description: 'Time-to-Market et scalabilité humaine d\'une licorne.',
    image: '/media/landing/domain-startup.jpg',
  },
  {
    icon: Leaf,
    title: 'Transition écologique',
    description: 'Projets ESG sous contraintes carbone strictes.',
    image: '/media/landing/domain-eco.jpg',
  },
  {
    icon: Banknote,
    title: 'Finance & Banque',
    description: 'Conformité, audits, reporting, KPIs réglementaires.',
    image: '/media/landing/domain-finance.jpg',
  },
  {
    icon: Heart,
    title: 'Santé & Pharma',
    description: 'Essais cliniques, validation, mise sur le marché.',
    image: '/media/landing/domain-health.jpg',
  },
];

function DomainsSection() {
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
          {DOMAINS.map(({ icon: Icon, title, description, image }) => (
            <a
              key={title}
              href="#"
              className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-[var(--accent-500)] hover:-translate-y-1 transition-all duration-300 block"
            >
              {/* Image header */}
              <div className="relative aspect-[16/10] overflow-hidden bg-[var(--brand-900)]">
                <img
                  src={image}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand-900)] via-[var(--brand-900)]/40 to-transparent" />
                {/* Icon badge */}
                <div className="absolute top-4 left-4 size-11 rounded-lg bg-[var(--accent-500)]/90 backdrop-blur-sm text-white flex items-center justify-center">
                  <Icon size={22} />
                </div>
              </div>
              {/* Content */}
              <div className="p-6">
                <h3 className="font-display font-bold text-xl mb-2 text-foreground">
                  {title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {description}
                </p>
              </div>
            </a>
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

/* ─── FAQ ───────────────────────────────────────────────────────────── */

function FaqSection() {
  const FAQS = [
    {
      q: 'Combien de temps prend une simulation ?',
      a: 'Entre 45 minutes et 2 heures selon le scénario. Vous pouvez la mettre en pause à tout moment et reprendre plus tard — votre progression est sauvegardée.',
    },
    {
      q: 'La certification est-elle reconnue par les recruteurs ?',
      a: 'Oui. Notre certification est calibrée sur le référentiel PMI et reconnue par 650+ entreprises partenaires (Bouygues, BNP Paribas, KPMG…). Le badge est exportable directement sur LinkedIn.',
    },
    {
      q: 'Puis-je utiliser Simex pro en équipe ou avec des collègues ?',
      a: 'Le mode multi-joueur est inclus dans le plan Professionnel. Vous pouvez inviter jusqu\'à 4 collègues sur une même simulation et débriefer ensemble grâce au rapport partagé.',
    },
    {
      q: 'Mes données et décisions sont-elles confidentielles ?',
      a: 'Vos décisions de simulation sont strictement privées. Les données agrégées (anonymisées) servent uniquement à améliorer les scénarios et à vous comparer à votre cohorte. Conformité RGPD complète, hébergement en Europe.',
    },
    {
      q: 'Comment fonctionne l\'IA d\'évaluation ?',
      a: 'L\'IA observe vos décisions, vos arbitrages budget/qualité, votre style de communication avec les acteurs virtuels. Elle compare ensuite votre profil aux best practices PMI et à 12 000+ sessions historiques pour produire un feedback contextualisé.',
    },
    {
      q: 'Puis-je annuler à tout moment ?',
      a: 'Oui. Annulation en un clic depuis votre tableau de bord, sans frais. Si vous annulez en cours de mois, vous gardez accès jusqu\'à la fin de la période payée.',
    },
    {
      q: 'Quelle différence entre Simex pro et un MOOC classique ?',
      a: 'Un MOOC vous explique la théorie. Simex pro vous fait vivre la pratique. Vous ne regardez pas une vidéo : vous prenez des décisions sous pression, vous négociez avec un sponsor mécontent, vous gérez une démission imprévue. Le feedback est sur vos actions réelles, pas sur des QCM.',
    },
    {
      q: 'Les scénarios sont-ils mis à jour régulièrement ?',
      a: 'Oui. 1 à 2 nouveaux scénarios par trimestre, mise à jour des contextes existants à chaque release. Tous les abonnés Professionnel et Entreprise reçoivent les nouveautés sans surcoût.',
    },
  ];

  return (
    <section id="faq" className="py-24 px-6 lg:px-8 scroll-mt-20">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[var(--accent-400)] font-bold text-xs tracking-widest uppercase mb-3">
            Vos questions
          </p>
          <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-foreground mb-4">
            Tout ce que vous voulez savoir
          </h2>
          <p className="text-muted-foreground text-lg">
            Si votre question n&apos;est pas listée, écrivez-nous à{' '}
            <a href="mailto:hello@simex.pro" className="text-[var(--accent-400)] hover:underline">
              hello@simex.pro
            </a>
            .
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq) => (
            <details
              key={faq.q}
              className="group bg-card border border-border rounded-xl overflow-hidden transition-colors hover:border-[var(--accent-500)]/40"
            >
              <summary className="flex items-center justify-between gap-6 px-6 py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <span className="font-semibold text-foreground text-[15px] lg:text-base">
                  {faq.q}
                </span>
                <ChevronDown
                  size={20}
                  className="text-muted-foreground shrink-0 transition-transform duration-200 group-open:rotate-180"
                />
              </summary>
              <div className="px-6 pb-5 text-muted-foreground text-[15px] leading-relaxed">
                {faq.a}
              </div>
            </details>
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
    <div className="dark min-h-screen w-full flex-1 bg-background text-foreground overflow-x-hidden">
      <StickyNav />
      <HeroSection />
      <TrustBand />
      <StatsBand />
      <HowItWorksSection />
      <DomainsSection />
      <WhySection />
      <TestimonialsSection />
      <PricingSection />
      <FaqSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
