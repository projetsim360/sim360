import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';

/* ─── Data ─────────────────────────────────────────────────────────── */

const NAV_LINKS = [
  { label: 'Scenarios', href: '#scenarios' },
  { label: 'Tarifs', href: '#tarifs' },
  { label: 'Methodologie', href: '#methodologie' },
  { label: 'Entreprises', href: '#entreprises' },
];

const STATS = [
  { value: 12000, suffix: '+', label: 'Sessions Validees' },
  { value: 98.4, suffix: '%', label: 'Satisfaction Job' },
  { value: 650, suffix: '+', label: 'Sponsors Entreprise' },
];

const SECTORS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <path d="M4 16V4h16v12H4zm0 0v4h16v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 8h6m-6 3h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: 'IT & Cloud Scaling',
    desc: 'Gerez des deploiements critiques et des cycles de sprints sous haute pression technologique.',
    gradient: 'from-indigo-500/20 to-violet-600/20',
    border: 'group-hover:border-indigo-400/50',
    glow: 'group-hover:shadow-indigo-500/10',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <path d="M3 21h18M5 21V7l7-4 7 4v14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 21v-6h6v6m-6-10h.01M15 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: 'Infrastructure & BTP',
    desc: 'Maitrisez la logistique, les imprevus chantiers et la coordination des sous-traitants.',
    gradient: 'from-emerald-500/20 to-teal-600/20',
    border: 'group-hover:border-emerald-400/50',
    glow: 'group-hover:shadow-emerald-500/10',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
        <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Hyper-croissance',
    desc: "Accelerez le Time-to-Market et gerez la scalabilite humaine d'une licorne naissante.",
    gradient: 'from-amber-500/20 to-orange-600/20',
    border: 'group-hover:border-amber-400/50',
    glow: 'group-hover:shadow-amber-500/10',
  },
];

const METHODOLOGY_STEPS = [
  {
    step: '01',
    title: 'Immersion scenario',
    desc: "Choisissez votre secteur et decouvrez votre role de chef de projet dans un contexte realiste genere par l'IA.",
    accent: 'text-indigo-400',
    line: 'bg-indigo-500',
  },
  {
    step: '02',
    title: 'Decisions & reunions IA',
    desc: "Prenez des decisions strategiques, animez des reunions avec des participants IA dotes de personnalites uniques.",
    accent: 'text-violet-400',
    line: 'bg-violet-500',
  },
  {
    step: '03',
    title: 'Feedback & certification',
    desc: "Recevez une analyse detaillee de vos performances et obtenez une certification valorisable.",
    accent: 'text-emerald-400',
    line: 'bg-emerald-500',
  },
];

const PLANS = [
  {
    name: 'Explorer',
    price: '0',
    credits: '2 Credits / jour',
    features: [
      "1 Scenario d'initiation",
      'IA Text-only',
      'Rapport de fin de session',
    ],
    cta: 'Demarrer Gratuitement',
    featured: false,
  },
  {
    name: 'Professional',
    price: '29',
    credits: '15 Credits / jour',
    features: [
      'Tous les scenarios Premium',
      'Interaction Vocale Temps Reel',
      'Mentor IA Personnalise',
      'Export Portfolio & Certificat',
    ],
    cta: 'Acces Integral',
    featured: true,
  },
  {
    name: 'Elite',
    price: '59',
    credits: '40 Credits / jour',
    features: [
      'Simulations de Crise Illimitees',
      'Certification Blockchain PMI-ready',
      'Analyse Comportementale 360',
      'Support Expert 24/7',
    ],
    cta: 'Devenir Expert',
    featured: false,
  },
];

const ENTERPRISES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: 'Evaluez vos candidats',
    desc: "Lancez des campagnes de recrutement basees sur des simulations reelles pour identifier les meilleurs talents.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
        <path d="M3 3v18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 14l4-4 4 4 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Analysez les performances',
    desc: "Rapports detailles sur les competences de vos equipes : leadership, prise de decision, gestion du stress.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
        <path d="M12 2l3 9h9l-7 5 3 9-8-6-8 6 3-9-7-5h9l3-9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Formez en continu',
    desc: "Offrez un environnement d'apprentissage immersif pour developper les competences projet.",
  },
];

/* ─── Animated Counter ────────────────────────────────────────────── */

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const triggered = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true;
          const duration = 2000;
          const start = performance.now();
          const isFloat = target % 1 !== 0;
          const tick = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(isFloat ? parseFloat((eased * target).toFixed(1)) : Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  const display = target % 1 !== 0 ? count.toFixed(1) : count.toLocaleString();

  return (
    <div ref={ref} className="tabular-nums">
      {display}{suffix}
    </div>
  );
}

/* ─── Scroll reveal hook ──────────────────────────────────────────── */

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────────────── */

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Force dark body background and fix layout for landing page
  useEffect(() => {
    const prev = document.body.style.backgroundColor;
    const root = document.getElementById('root');
    document.documentElement.style.backgroundColor = '#06090f';
    document.body.style.backgroundColor = '#06090f';
    document.body.style.overflow = 'auto';
    if (root) {
      root.style.display = 'block';
    }
    return () => {
      document.documentElement.style.backgroundColor = '';
      document.body.style.backgroundColor = prev;
      document.body.style.overflow = '';
      if (root) {
        root.style.display = '';
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#06090f] text-slate-100 antialiased overflow-x-hidden selection:bg-indigo-500/30 selection:text-white">

      {/* ─── Ambient background ─────────────────────────────────── */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] rounded-full bg-indigo-600/[0.07] blur-[120px]" />
        <div className="absolute bottom-1/4 -right-40 w-[600px] h-[600px] rounded-full bg-violet-600/[0.05] blur-[100px]" />
        <div className="absolute top-1/2 -left-20 w-[400px] h-[400px] rounded-full bg-emerald-600/[0.04] blur-[80px]" />
      </div>

      {/* ─── Navigation ─────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#06090f]/80 backdrop-blur-2xl border-b border-white/[0.06] py-4'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          <a href="#" className="flex items-center gap-1 no-underline group">
            <span className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
              S
            </span>
            <span className="text-lg font-bold text-white ml-2 tracking-tight">
              Project<span className="text-indigo-400">Sim360</span>
            </span>
          </a>
          <ul className="hidden lg:flex items-center gap-1 list-none">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="px-4 py-2 rounded-lg text-sm text-slate-400 no-underline hover:text-white hover:bg-white/[0.06] transition-all duration-200"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3">
            <Link
              to="/auth/sign-in"
              className="text-sm text-slate-300 no-underline hover:text-white transition-colors hidden sm:block"
            >
              Se connecter
            </Link>
            <Link
              to="/auth/sign-up"
              className="relative px-5 py-2.5 rounded-xl text-sm font-semibold text-white no-underline bg-gradient-to-r from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-px active:translate-y-0 transition-all duration-200"
            >
              Essai gratuit
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ───────────────────────────────────────────────── */}
      <header className="relative pt-32 pb-20 lg:pt-36 lg:pb-28">
        {/* Hero centered text */}
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center mb-16">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-8 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Plateforme IA de simulation projet
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight mb-6">
              <span className="bg-gradient-to-b from-white via-white to-slate-400 bg-clip-text text-transparent">L'experience ne s'apprend pas.</span>
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
                Elle se simule.
              </span>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-base lg:text-lg text-slate-400 leading-relaxed mb-10 max-w-xl mx-auto">
              Pilotez des projets critiques, gerez des equipes pilotees par l'IA et forgez votre expertise a travers l'immersion reelle.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <a
                href="#tarifs"
                className="group relative inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white no-underline bg-gradient-to-r from-indigo-500 to-violet-600 shadow-[0_8px_32px_rgba(99,102,241,0.35)] hover:shadow-[0_12px_48px_rgba(99,102,241,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
              >
                Commencer maintenant
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </a>
              <a
                href="#methodologie"
                className="inline-flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-medium text-slate-300 no-underline hover:text-white hover:bg-white/[0.05] transition-all duration-200"
              >
                <span className="flex items-center justify-center w-10 h-10 rounded-full border border-white/15 bg-white/[0.04] backdrop-blur-sm">
                  <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </span>
                Voir la demo
              </a>
            </div>
          </Reveal>
        </div>

        {/* Hero centered mockup */}
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-1 items-center">

            {/* App Mockup */}
            <Reveal delay={400} className="relative">
              <div className="relative">
                {/* Glow behind */}
                <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-violet-500/10 to-transparent rounded-[32px] blur-2xl" />

                <div className="relative rounded-2xl border border-white/[0.08] bg-[#0c1019]/90 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden">
                  {/* Window chrome */}
                  <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div className="px-4 py-1 rounded-md bg-white/[0.05] text-[11px] text-slate-500 font-mono">
                        app.projectsim360.com
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-5">
                    {/* Top bar */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-[10px] font-bold text-white">S</div>
                        <div>
                          <div className="h-2.5 w-24 bg-white/10 rounded" />
                          <div className="h-2 w-16 bg-white/[0.05] rounded mt-1.5" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-16 h-7 rounded-md bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                          <span className="text-[9px] text-emerald-400 font-bold">EN COURS</span>
                        </div>
                      </div>
                    </div>

                    {/* KPI row */}
                    <div className="grid grid-cols-3 gap-3">
                      {['Budget', 'Delai', 'Qualite'].map((kpi, i) => (
                        <div key={kpi} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                          <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-2">{kpi}</div>
                          <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${i === 0 ? 'bg-indigo-500 w-[72%]' : i === 1 ? 'bg-amber-400 w-[45%]' : 'bg-emerald-500 w-[88%]'}`}
                            />
                          </div>
                          <div className="text-right mt-1">
                            <span className="text-[10px] text-slate-400 font-mono">{i === 0 ? '72%' : i === 1 ? '45%' : '88%'}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* AI sync bar */}
                    <div className="rounded-xl bg-gradient-to-r from-indigo-500/[0.08] via-violet-500/[0.08] to-indigo-500/[0.08] border border-indigo-500/15 p-4 flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] text-indigo-300 font-semibold tracking-wider uppercase mb-1.5">Synchronisation IA</div>
                        <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                          <div className="h-full w-3/4 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.5)]" />
                        </div>
                      </div>
                      <span className="text-[11px] text-indigo-400 font-mono font-semibold">75%</span>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </header>

      {/* ─── Stats ──────────────────────────────────────────────── */}
      <section className="relative border-y border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-16 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-0 sm:divide-x divide-white/[0.06]">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 100} className="text-center px-8">
              <div className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-2">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-[0.2em] font-medium">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── Sectors ────────────────────────────────────────────── */}
      <section id="scenarios" className="py-28 lg:py-36">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <Reveal className="text-center mb-16">
            <p className="text-xs text-indigo-400 uppercase tracking-[0.25em] font-semibold mb-4">Scenarii d'immersion</p>
            <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-b from-white to-slate-300 bg-clip-text text-transparent">Domaines d'Immersion</span>
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {SECTORS.map((s, i) => (
              <Reveal key={s.title} delay={i * 120}>
                <div className={`group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-8 lg:p-10 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl ${s.glow} ${s.border} cursor-default`}>
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${s.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-slate-300 mb-6 group-hover:text-white group-hover:border-white/20 transition-colors">
                      {s.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white">{s.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">{s.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Methodology ────────────────────────────────────────── */}
      <section id="methodologie" className="py-28 lg:py-36 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/[0.08] to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <Reveal className="text-center mb-20">
            <p className="text-xs text-indigo-400 uppercase tracking-[0.25em] font-semibold mb-4">Processus</p>
            <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-5">
              <span className="bg-gradient-to-b from-white to-slate-300 bg-clip-text text-transparent">Comment ca marche ?</span>
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto">
              Une approche pedagogique immersive en 3 etapes, alimentee par l'intelligence artificielle.
            </p>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-16 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-indigo-500/30 via-violet-500/30 to-emerald-500/30" />
            {METHODOLOGY_STEPS.map((step, i) => (
              <Reveal key={step.step} delay={i * 150}>
                <div className="relative text-center lg:text-left">
                  {/* Step number */}
                  <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0c1019] border border-white/[0.08] mb-8 z-10">
                    <span className={`text-lg font-bold ${step.accent}`}>{step.step}</span>
                  </div>
                  <h3 className="text-lg font-bold mb-3 text-white">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ────────────────────────────────────────────── */}
      <section id="tarifs" className="py-28 lg:py-36">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <Reveal className="text-center mb-16">
            <p className="text-xs text-indigo-400 uppercase tracking-[0.25em] font-semibold mb-4">Tarifs</p>
            <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-5">
              <span className="bg-gradient-to-b from-white to-slate-300 bg-clip-text text-transparent">Tarification Flexible</span>
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto">
              Progressez a votre rythme avec notre systeme de credits journaliers.
            </p>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {PLANS.map((plan, i) => (
              <Reveal key={plan.name} delay={i * 120}>
                <div
                  className={`relative rounded-2xl p-8 lg:p-10 transition-all duration-300 ${
                    plan.featured
                      ? 'bg-gradient-to-b from-indigo-500/[0.12] to-[#0c1019] border-2 border-indigo-500/30 shadow-[0_0_60px_rgba(99,102,241,0.12)] scale-[1.02]'
                      : 'bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1]'
                  }`}
                >
                  {plan.featured && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg shadow-indigo-500/30">
                        Le plus choisi
                      </span>
                    </div>
                  )}
                  <div>
                    <p className={`text-sm font-semibold mb-5 ${plan.featured ? 'text-indigo-400' : 'text-slate-400'}`}>
                      {plan.name}
                    </p>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-5xl font-extrabold tracking-tight text-white">${plan.price}</span>
                      <span className="text-sm text-slate-500">/mois</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/15 mb-8">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-xs text-emerald-400 font-semibold">{plan.credits}</span>
                    </div>
                  </div>
                  <ul className="space-y-3.5 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm text-slate-400">
                        <svg className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#"
                    className={`block text-center py-3.5 rounded-xl text-sm font-semibold no-underline transition-all duration-200 ${
                      plan.featured
                        ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-px'
                        : 'bg-white/[0.05] text-white border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.12]'
                    }`}
                  >
                    {plan.cta}
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Enterprises ────────────────────────────────────────── */}
      <section id="entreprises" className="py-28 lg:py-36 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/[0.06] to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <Reveal className="text-center mb-16">
            <p className="text-xs text-indigo-400 uppercase tracking-[0.25em] font-semibold mb-4">Solutions B2B</p>
            <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-5">
              <span className="bg-gradient-to-b from-white to-slate-300 bg-clip-text text-transparent">Pour les Entreprises</span>
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto">
              Recrutez, evaluez et formez vos equipes avec des simulations sur mesure.
            </p>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {ENTERPRISES.map((e, i) => (
              <Reveal key={e.title} delay={i * 120}>
                <div className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 lg:p-10 transition-all duration-300 hover:border-white/[0.1] hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center text-indigo-400 mb-6 group-hover:bg-indigo-500/15 transition-colors">
                    {e.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-3 text-white">{e.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{e.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="text-center">
            <Link
              to="/auth/sign-up"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold text-white no-underline bg-gradient-to-r from-indigo-500 to-violet-600 shadow-[0_8px_32px_rgba(99,102,241,0.3)] hover:shadow-[0_12px_48px_rgba(99,102,241,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
            >
              Demander une demo entreprise
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ─── CTA Banner ─────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <Reveal>
            <div className="relative rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
              <div className="relative px-10 py-16 lg:px-16 lg:py-20 text-center">
                <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4 tracking-tight">
                  Pret a simuler votre premier projet ?
                </h2>
                <p className="text-indigo-100/80 max-w-md mx-auto mb-8">
                  Rejoignez des milliers de professionnels qui developpent leurs competences projet avec l'IA.
                </p>
                <Link
                  to="/auth/sign-up"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold text-indigo-600 no-underline bg-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                >
                  Commencer gratuitement
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-16">
            <div className="col-span-2">
              <a href="#" className="flex items-center gap-2 no-underline mb-5">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold text-xs">S</span>
                <span className="text-lg font-bold text-white tracking-tight">
                  Project<span className="text-indigo-400">Sim360</span>
                </span>
              </a>
              <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                L'unique plateforme qui transforme vos decisions virtuelles en valeur professionnelle reelle.
              </p>
            </div>
            {[
              {
                title: 'Produit',
                links: ['Scenarios IA', 'Classement mondial', 'Certifications'],
              },
              {
                title: 'Compagnie',
                links: ['A propos', 'Partenaires', 'Carrieres'],
              },
              {
                title: 'Legal',
                links: ['Confidentialite', 'CGU', 'Mentions Legales'],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-xs text-slate-400 uppercase tracking-[0.15em] font-semibold mb-5">{col.title}</h4>
                <ul className="space-y-3 list-none">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-slate-500 no-underline hover:text-slate-300 transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-600">
              &copy; {new Date().getFullYear()} ProjectSim360. Tous droits reserves.
            </p>
            <div className="flex items-center gap-5">
              {['Twitter', 'LinkedIn', 'GitHub'].map((s) => (
                <a key={s} href="#" className="text-xs text-slate-600 no-underline hover:text-slate-400 transition-colors">
                  {s}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
