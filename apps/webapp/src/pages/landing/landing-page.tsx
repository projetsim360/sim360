import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from 'next-themes';
import { isAuthenticated } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Drawer, DrawerTitle, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Marquee } from '@/components/ui/marquee';
import { WordRotate } from '@/components/ui/word-rotate';
import { HeroVideoDialog } from '@/components/ui/hero-video-dialog';
import { AnimatedTooltip } from '@/components/ui/animated-tooltip';
import { Boxes } from '@/components/ui/background-boxes';
import { RainbowButton } from '@/components/ui/rainbow-button';

/* ─── Custom Landing Components ─────────────────────────────────── */

function CustomBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#4b2f95]/20 dark:border-[#4b2f95]/40 bg-[#4b2f95]/5 dark:bg-[#4b2f95]/10 px-4 py-1.5 text-sm font-semibold text-[#4b2f95] dark:text-[#c4a0ff]">
      {children}
    </span>
  );
}

function CustomTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn('text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight', className)}>
      {children}
    </h2>
  );
}

function CustomSubtitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed', className)}>
      {children}
    </p>
  );
}

/* ─── Data ─────────────────────────────────────────────────────────── */

const NAV_ITEMS = ['Accueil', 'Fonctionnalites', 'Tarifs', 'FAQ', 'Contact'];

const ROTATING_WORDS = ['Projets IT', 'Chantiers BTP', 'Startups'];

const PEOPLE = [
  { id: 1, name: 'Sophie Martin', designation: 'Chef de projet IT', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face' },
  { id: 2, name: 'Thomas Durand', designation: 'Scrum Master', image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop&crop=face' },
  { id: 3, name: 'Marie Leclerc', designation: 'PMO Senior', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face' },
  { id: 4, name: 'Lucas Bernard', designation: 'Product Owner', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' },
  { id: 5, name: 'Emma Petit', designation: 'Directrice Projet', image: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=100&h=100&fit=crop&crop=face' },
  { id: 6, name: 'Pierre Moreau', designation: 'Ingenieur QA', image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face' },
];

const FEATURES = [
  {
    id: 'ai-simulation',
    title: 'Simulation IA Immersive',
    description: 'Plongez dans des scenarios realistes generes par intelligence artificielle. Chaque decision impacte le projet en temps reel avec des consequences visibles sur les KPIs.',
    stats: '12k+',
    metric: 'Sessions completees',
    colors: {
      bg: 'bg-[#4b2f95]/10 dark:bg-[#4b2f95]/20',
      icon: 'text-[#4b2f95]',
      hover: 'hover:border-[#4b2f95]',
      gradient: 'from-[#4b2f95] via-[#6b3fa0] to-[#f14f1a]',
    },
    iconPath: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z',
  },
  {
    id: 'pmo-agent',
    title: 'Agent PMO Intelligent',
    description: "Un assistant IA disponible 24/7 qui vous guide, repond a vos questions et s'adapte a votre niveau de competences avec un ton personnalise.",
    stats: '98.4%',
    metric: 'Satisfaction',
    colors: {
      bg: 'bg-red-100/40 dark:bg-red-950/40',
      icon: 'text-red-600',
      hover: 'hover:border-red-500',
      gradient: 'from-red-500 via-red-600 to-red-700',
    },
    iconPath: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
  },
  {
    id: 'advanced-eval',
    title: 'Evaluation Avancee',
    description: 'Analyse 360 de vos competences : leadership, prise de decision, gestion du stress et communication avec des rapports detailles.',
    stats: '650+',
    metric: 'Entreprises',
    colors: {
      bg: 'bg-emerald-100/40 dark:bg-emerald-950/40',
      icon: 'text-emerald-600',
      hover: 'hover:border-emerald-500',
      gradient: 'from-emerald-500 via-emerald-600 to-emerald-700',
    },
    iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
  {
    id: 'certification',
    title: 'Certification & Portfolio',
    description: 'Obtenez des certifications valorisables basees sur les referentiels PMI et construisez un portfolio partage de vos realisations.',
    stats: '25%',
    metric: 'Boost carrieres',
    colors: {
      bg: 'bg-amber-100/40 dark:bg-amber-950/20',
      icon: 'text-amber-600',
      hover: 'hover:border-amber-500',
      gradient: 'from-amber-500 via-amber-600 to-amber-700',
    },
    iconPath: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
  },
];

const STEPS = [
  {
    id: 1,
    title: 'Immersion scenario',
    description: "Choisissez votre secteur et decouvrez votre role de chef de projet dans un contexte realiste genere par l'IA.",
    iconPath: 'M9.663 17h4.674M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  },
  {
    id: 2,
    title: 'Decisions & Reunions IA',
    description: "Prenez des decisions strategiques et animez des reunions avec des participants IA dotes de personnalites uniques.",
    iconPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  },
  {
    id: 3,
    title: 'Livrables & Evaluation',
    description: "Redigez vos livrables guides par l'IA, soumettez-les et recevez un feedback detaille en temps reel.",
    iconPath: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
  },
  {
    id: 4,
    title: 'Certification & Portfolio',
    description: "Recevez une analyse detaillee de vos performances et obtenez une certification valorisable sur LinkedIn.",
    iconPath: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
  },
];

const PLANS = [
  {
    name: 'Explorer',
    monthlyPrice: '$0',
    yearlyPrice: '$0',
    description: 'Parfait pour decouvrir la plateforme',
    features: [
      "1 Scenario d'initiation",
      '2 Credits IA / jour',
      'Agent PMO Text-only',
      'Rapport de fin de session',
      'Acces communaute',
    ],
    popular: false,
  },
  {
    name: 'Professional',
    monthlyPrice: '$29',
    yearlyPrice: '$290',
    description: 'Ideal pour monter en competences',
    features: [
      'Tous les scenarios Premium',
      '15 Credits IA / jour',
      'Interaction Vocale Temps Reel',
      'Mentor IA Personnalise',
      'Export Portfolio & Certificat',
      'Scenarios personnalises',
      'Support prioritaire',
    ],
    popular: true,
  },
  {
    name: 'Elite',
    monthlyPrice: '$59',
    yearlyPrice: '$590',
    description: 'Pour les experts et les equipes',
    features: [
      'Simulations de Crise Illimitees',
      '40 Credits IA / jour',
      'Certification PMI-ready',
      'Analyse Comportementale 360',
      'Support Expert 24/7',
      'API & Integrations',
      'Rapports avances',
      'Onboarding dedie',
    ],
    popular: false,
  },
];

const TESTIMONIALS = [
  { name: 'Sophie Martin', role: 'Chef de projet, Capgemini', content: 'ProjectSim360 a transforme notre formation interne. Nos chefs de projet progressent 3x plus vite.' },
  { name: 'Thomas Durand', role: 'DRH, BNP Paribas', content: 'Le mode recrutement nous a permis d\'identifier des talents exceptionnels que les entretiens classiques auraient manques.' },
  { name: 'Marie Leclerc', role: 'PMO Senior, Bouygues', content: 'Les scenarios BTP sont incroyablement realistes. Mes equipes adorent les simulations de crise.' },
  { name: 'Lucas Bernard', role: 'Directeur IT, Societe Generale', content: 'L\'agent PMO intelligent est bluffant. Il s\'adapte vraiment au niveau de chaque utilisateur.' },
  { name: 'Emma Petit', role: 'Formatrice, CNAM', content: 'Un outil pedagogique revolutionnaire. Mes etudiants sont beaucoup plus engages.' },
  { name: 'Pierre Moreau', role: 'CTO, Alan', content: 'La certification est reconnue par nos partenaires. Un vrai plus pour les candidats.' },
  { name: 'Julie Rousseau', role: 'VP Engineering, Doctolib', content: 'L\'analyse 360 nous donne des insights qu\'aucun autre outil ne fournit.' },
  { name: 'Antoine Lefevre', role: 'Manager, Accenture', content: 'Nous avons reduit notre temps de formation de 40% grace a ProjectSim360.' },
  { name: 'Claire Dubois', role: 'Scrum Master, Thales', content: 'Les reunions avec participants IA sont etonnamment realistes et pedagogiques.' },
  { name: 'Marc Fontaine', role: 'CEO, StartupStudio', content: 'Le meilleur investissement formation que nous ayons fait cette annee.' },
];

const FAQ_ITEMS = [
  { question: "Qu'est-ce que ProjectSim360 exactement ?", answer: "ProjectSim360 est une plateforme SaaS de simulation de gestion de projet alimentee par l'intelligence artificielle. Vous etes immerge dans des scenarios realistes ou vous prenez des decisions strategiques, animez des reunions avec des participants IA et gerez un projet de bout en bout." },
  { question: 'Ai-je besoin de connaissances en gestion de projet ?', answer: "Non, la plateforme s'adapte a votre niveau grace au profilage initial. Que vous soyez debutant ou chef de projet confirme, l'IA ajuste la complexite des scenarios, le vocabulaire et les attentes." },
  { question: 'Comment fonctionne le systeme de credits ?', answer: "Chaque action consommant des ressources IA (reunions, decisions, feedback) utilise des credits. Votre plan definit le nombre de credits quotidiens. Les credits non utilises ne sont pas reportes." },
  { question: 'Les certifications sont-elles reconnues ?', answer: "Oui, nos certifications sont basees sur les referentiels PMI et PRINCE2. Elles incluent un portfolio detaille de vos performances et sont partageables sur LinkedIn." },
  { question: 'Comment fonctionne le mode recrutement ?', answer: "Les recruteurs creent des campagnes avec des scenarios adaptes au poste. Les candidats passent la simulation, et un rapport 360 est genere automatiquement." },
  { question: 'Puis-je annuler a tout moment ?', answer: "Oui, aucun engagement minimum. Vous conservez l'acces jusqu'a la fin de votre periode de facturation en cours." },
  { question: "Quelles technologies d'IA utilisez-vous ?", answer: "Nous utilisons Anthropic (Claude) et OpenAI avec failover automatique pour une disponibilite maximale et des reponses de haute qualite." },
  { question: 'Proposez-vous des offres entreprises sur mesure ?', answer: "Absolument ! Pour les grandes organisations, nous proposons des tarifs et fonctionnalites personnalises. Contactez notre equipe commerciale." },
];

/* ─── Logo Component ─────────────────────────────────────────────── */

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <div className="size-8 rounded-lg bg-gradient-to-br from-[#4b2f95] to-[#f14f1a] flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" className="size-5 text-white">
          <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className="text-lg font-bold text-foreground">ProjectSim360</span>
    </Link>
  );
}

/* ─── SVG Icon Helper ────────────────────────────────────────────── */

function SvgIcon({ path, className }: { path: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={path} />
    </svg>
  );
}

/* ─── Star Component ─────────────────────────────────────────────── */

function Star({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

/* ─── Header ─────────────────────────────────────────────────────── */

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('accueil');
  const isLoggedIn = isAuthenticated();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      if (window.scrollY < 50) {
        setActiveSection('accueil');
        return;
      }
      const sections = ['fonctionnalites', 'tarifs', 'faq', 'contact'];
      const scrollPosition = window.scrollY + 200;
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            return;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (item: string) => {
    setIsOpen(false);
    if (item === 'Accueil') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const targetId = item.toLowerCase().replace(/ /g, '-');
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const isActiveItem = (item: string) => {
    const sectionMap: Record<string, string> = {
      Accueil: 'accueil',
      Fonctionnalites: 'fonctionnalites',
      Tarifs: 'tarifs',
      FAQ: 'faq',
      Contact: 'contact',
    };
    return activeSection === sectionMap[item];
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        isScrolled ? 'bg-background/60 backdrop-blur-sm shadow-xs' : 'bg-transparent',
      )}
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Logo />

        <div className="flex items-center gap-2.5">
          {/* Desktop nav */}
          <nav className="hidden md:flex items-center space-x-8">
            {NAV_ITEMS.map((item) => (
              <button
                key={item}
                onClick={() => handleNavClick(item)}
                className={cn(
                  'cursor-pointer transition-colors relative group',
                  isActiveItem(item) ? 'text-[#4b2f95] dark:text-[#c4a0ff]' : 'text-accent-foreground hover:text-[#4b2f95] dark:hover:text-[#c4a0ff]',
                )}
              >
                {item}
                <span className={cn('absolute -bottom-1 left-0 h-0.5 bg-[#4b2f95] dark:bg-[#c4a0ff] transition-all', isActiveItem(item) ? 'w-full' : 'w-0 group-hover:w-full')} />
              </button>
            ))}

            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {/* Sun icon (visible in dark mode) */}
              <svg className="size-5 hidden dark:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
              {/* Moon icon (visible in light mode) */}
              <svg className="size-5 block dark:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            </Button>

            <Button variant="default" asChild>
              <Link to={isLoggedIn ? '/dashboard' : '/auth/sign-in'}>
                {isLoggedIn ? 'Dashboard' : 'Connexion'}
              </Link>
            </Button>
          </nav>

          {/* Mobile nav */}
          <div className="md:hidden flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <svg className="size-5 hidden dark:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
              <svg className="size-5 block dark:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            </Button>
            <Drawer open={isOpen} onOpenChange={setIsOpen}>
              <DrawerTrigger asChild>
                <Button className="cursor-pointer text-muted-foreground hover:bg-transparent hover:text-foreground" variant="ghost" size="icon">
                  <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                </Button>
              </DrawerTrigger>
              <DrawerContent className="px-6 pb-8">
                <DrawerTitle />
                <nav className="flex flex-col space-y-4 mt-6">
                  {NAV_ITEMS.map((item) => (
                    <Button
                      key={item}
                      onClick={() => handleNavClick(item)}
                      variant="ghost"
                      className={cn(
                        'w-full justify-start hover:text-[#4b2f95]',
                        isActiveItem(item) && 'text-[#4b2f95] font-medium',
                      )}
                    >
                      {item}
                    </Button>
                  ))}
                  <div className="pt-4">
                    <RainbowButton className="w-full" asChild>
                      <Link to={isLoggedIn ? '/dashboard' : '/auth/sign-in'}>
                        {isLoggedIn ? 'Dashboard' : 'Commencer'}
                      </Link>
                    </RainbowButton>
                  </div>
                </nav>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ─── Hero Section ───────────────────────────────────────────────── */

function HeroSection() {
  const isLoggedIn = isAuthenticated();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMouse({
      x: (e.clientX - rect.left - rect.width / 2) / rect.width,
      y: (e.clientY - rect.top - rect.height / 2) / rect.height,
    });
  };

  return (
    <section
      className="relative lg:min-h-screen bg-gradient-to-br from-gray-50 dark:from-zinc-950 via-[#4b2f95]/5 dark:via-black to-[#f14f1a]/5 dark:to-zinc-950 pt-25 pb-20 lg:pt-40 lg:pb-20 overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMouse({ x: 0, y: 0 })}
    >
      {/* Animated gradient orbs — keep motion for repeating animations */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute left-[10%] top-[15%] w-[320px] h-[320px] dark:w-[160px] dark:h-[160px] rounded-full bg-[#4b2f95]/30 dark:bg-[#4b2f95]/20 opacity-90 blur-[60px]"
          animate={{ scale: [1, 1.13, 1], opacity: [0.85, 1, 0.85], x: mouse.x * 70, y: mouse.y * 40 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute left-[18%] top-[23%] w-[90px] h-[90px] rounded-full bg-[#4b2f95]/15 dark:bg-[#4b2f95]/10 opacity-95 blur-[10px]"
          animate={{ scale: [1, 1.08, 1], opacity: [0.92, 1, 0.92], x: mouse.x * 90, y: mouse.y * 60 }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute right-[12%] top-[30%] w-[220px] h-[220px] rounded-full bg-[#f14f1a]/20 dark:bg-[#f14f1a]/10 opacity-80 blur-[40px]"
          animate={{ scale: [1, 1.08, 1], opacity: [0.75, 0.95, 0.75], x: mouse.x * -60, y: mouse.y * 30 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute left-[35%] bottom-[18%] w-[180px] h-[180px] rounded-full bg-[#4b2f95]/20 dark:bg-[#4b2f95]/15 opacity-80 blur-[30px]"
          animate={{ scale: [1, 1.16, 1], opacity: [0.7, 0.9, 0.7], x: mouse.x * 40, y: mouse.y * -60 }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-[#4b2f95]/10 via-[#4b2f95]/5 to-[#f14f1a]/10"
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e5e7eb' fill-opacity='0.3'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          {/* Headline with WordRotate */}
          <h1 className="font-black flex flex-col md:flex-row items-center gap-0.5 md:gap-1.5 justify-center text-3xl lg:text-7xl font-bold mb-4 lg:mb-8 leading-[1.2]">
            <span className="bg-gradient-to-r from-[#4b2f95] via-[#3a2470] to-[#4b2f95] dark:from-gray-50 dark:via-[#c4a0ff] dark:to-[#4b2f95] bg-clip-text text-transparent">
              Simulez des
            </span>
            <WordRotate
              words={ROTATING_WORDS}
              className="bg-gradient-to-r from-[#f14f1a] to-[#4b2f95] bg-clip-text text-transparent w-[365px]"
            />
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-xl text-muted-foreground mb-6 md:mb-10 max-w-[600px] mx-auto leading-relaxed">
            Pilotez des projets realistes avec l'IA. Prenez des decisions, animez des reunions et obtenez une certification.
          </p>

          {/* CTA buttons */}
          <div className="inline-flex items-center gap-3 mb-10">
            <Button size="lg" className="cursor-pointer hover:[&_svg]:translate-x-1 w-46" asChild>
              <Link to={isLoggedIn ? '/dashboard' : '/auth/sign-up'}>
                {isLoggedIn ? 'Aller au dashboard' : 'Demarrer gratuitement'}
                <svg className="h-5 w-5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="cursor-pointer w-46" asChild>
              <a href="#fonctionnalites">
                Explorer les fonctionnalites
              </a>
            </Button>
          </div>

          {/* Social proof — AnimatedTooltip + stars */}
          <div className="flex flex-col items-center gap-2.5 mb-10">
            <div className="flex gap-2.5">
              <div className="flex -space-x-2 me-2.5">
                <AnimatedTooltip items={PEOPLE} />
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, idx) => (
                  <Star key={idx} className="h-5 w-5 text-yellow-500" />
                ))}
              </div>
            </div>
            <div className="text-center text-muted-foreground text-sm font-medium">
              Adopte par des milliers de professionnels
            </div>
          </div>

          {/* Hero Video Dialog */}
          <div className="relative max-w-5xl mx-auto">
            <HeroVideoDialog
              trigger={
                <div className="bg-[#4b2f95]/10 dark:bg-[#c4a0ff]/10 backdrop-blur-md rounded-full p-4 shadow-lg">
                  <div className="bg-background rounded-full p-3 shadow-lg">
                    <svg className="size-6 text-[#4b2f95] dark:text-[#c4a0ff] fill-[#4b2f95] dark:fill-[#c4a0ff] ml-0.5" viewBox="0 0 24 24">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                </div>
              }
              animationStyle="from-center"
              videoSrc="https://www.youtube.com/embed/dQw4w9WgXcQ"
              thumbnailSrc="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=675&fit=crop"
              thumbnailAlt="ProjectSim360 Demo"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works Section ───────────────────────────────────────── */

function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const manuallyTriggered = useRef(false);

  const stepDuration = 5000;

  useEffect(() => {
    if (isPaused) return;
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 100 / (stepDuration / 50)));
    }, 50);

    const stepTimeout = setTimeout(() => {
      setActiveStep((prev) => {
        manuallyTriggered.current = false;
        return (prev + 1) % STEPS.length;
      });
    }, stepDuration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(stepTimeout);
    };
  }, [activeStep, isPaused]);

  const handleStepClick = (index: number) => {
    setActiveStep(index);
    manuallyTriggered.current = true;
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 4000);
  };

  return (
    <section className="py-24 border-b border-border/50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-center flex-col text-center gap-5 mb-16">
          <CustomBadge>Methodologie</CustomBadge>
          <CustomTitle>Comment ca marche ?</CustomTitle>
          <CustomSubtitle>
            Notre processus structure vous guide de l'immersion a la certification, avec l'IA comme partenaire.
          </CustomSubtitle>
        </div>

        <div className="flex flex-col gap-12 max-w-6xl mx-auto">
          {/* Step navigation */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className="flex flex-col items-center cursor-pointer transition-all duration-300 overflow-hidden"
                onClick={() => handleStepClick(index)}
              >
                <div className="size-12 bg-[#4b2f95]/10 dark:bg-[#4b2f95]/15 rounded-full flex items-center justify-center">
                  <SvgIcon path={step.iconPath} className="size-5 text-[#4b2f95] dark:text-[#c4a0ff]" />
                </div>
                <h3 className={cn('p-5 pb-3 text-xl font-semibold mb-0 transition-colors duration-300', index === activeStep ? 'text-foreground' : 'text-muted-foreground')}>
                  {step.title}
                </h3>
                <div className="w-full h-0.5 bg-border/60">
                  <AnimatePresence>
                    {index === activeStep && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="h-0.5 w-full overflow-hidden"
                      >
                        <motion.div
                          className="h-0.5 bg-gradient-to-r from-[#4b2f95] to-[#f14f1a]"
                          style={{ width: `${progress}%` }}
                          transition={{ duration: 0.05, ease: 'linear' }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>

          {/* Step description */}
          <div className="relative w-full rounded-xl overflow-hidden border border-border shadow-xs shadow-black/5 bg-background">
            <div className="p-8 md:p-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className="text-center max-w-2xl mx-auto"
                >
                  <div className="size-16 bg-[#4b2f95]/10 dark:bg-[#4b2f95]/15 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <SvgIcon path={STEPS[activeStep].iconPath} className="size-8 text-[#4b2f95] dark:text-[#c4a0ff]" />
                  </div>
                  <h4 className="text-2xl font-bold text-foreground mb-4">{STEPS[activeStep].title}</h4>
                  <p className="text-muted-foreground leading-relaxed text-lg">{STEPS[activeStep].description}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-4">
            Pret a commencer ? Il ne faut que 5 minutes.
          </p>
          <Button size="lg" asChild>
            <Link to="/auth/sign-up">Demarrer maintenant</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ─── Features Section ───────────────────────────────────────────── */

function FeaturesSection() {
  return (
    <section id="fonctionnalites" className="py-24 bg-background border-b border-border/50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-center flex-col text-center gap-5 mb-16">
          <CustomBadge>Fonctionnalites</CustomBadge>
          <CustomTitle>Tout ce dont vous avez besoin</CustomTitle>
          <CustomSubtitle>
            Notre plateforme fournit tous les outils pour simuler, apprendre et certifier vos competences en gestion de projet.
          </CustomSubtitle>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {FEATURES.map((feature) => (
            <div
              key={feature.id}
              className="group"
            >
              <Card className={cn('h-full bg-background border border-border transition-all duration-500 p-8 relative overflow-hidden hover:shadow-lg hover:-translate-y-2', feature.colors.hover)}>
                <CardContent className="p-0">
                  <div className="flex items-start justify-between mb-8">
                    <div className={cn('size-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-500 relative overflow-hidden', feature.colors.bg)}>
                      <SvgIcon path={feature.iconPath} className={cn('size-5 relative z-10', feature.colors.icon)} />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-semibold text-foreground mb-1">{feature.stats}</div>
                      <div className="text-sm text-muted-foreground font-medium uppercase tracking-wide">{feature.metric}</div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-6 group-hover:text-foreground transition-colors leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed font-medium">
                    {feature.description}
                  </p>
                </CardContent>
                <div className={cn('absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left', feature.colors.gradient)} />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50/0 to-slate-100/0 group-hover:from-slate-50/30 group-hover:to-slate-100/10 dark:from-slate-900/0 dark:to-slate-800/0 transition-all duration-500 pointer-events-none" />
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials Section ───────────────────────────────────────── */

function TestimonialsSection() {
  const firstColumn = TESTIMONIALS.slice(0, 5);
  const secondColumn = TESTIMONIALS.slice(5, 10);

  const TestimonialCard = ({ testimonial }: { testimonial: (typeof TESTIMONIALS)[0] }) => (
    <div className="flex-shrink-0 w-[350px] bg-gradient-to-br from-[#4b2f95]/5 to-[#f14f1a]/5 dark:from-[#4b2f95]/10 dark:to-[#f14f1a]/5 rounded-xl p-6 border border-border/50 shadow-sm mx-1.5">
      <p className="text-muted-foreground mb-4 font-medium">{testimonial.content}</p>
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full bg-gradient-to-br from-[#4b2f95] to-[#f14f1a] flex items-center justify-center text-white font-semibold text-sm">
          {testimonial.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <div className="font-semibold text-foreground">{testimonial.name}</div>
          <div className="text-sm text-muted-foreground">{testimonial.role}</div>
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-24 bg-background overflow-hidden border-b border-border/50">
      <div className="container mx-auto px-6 lg:px-12 mb-16">
        <div className="flex items-center justify-center flex-col text-center gap-5 mb-16">
          <CustomBadge>Temoignages</CustomBadge>
          <CustomTitle>Ils nous font confiance</CustomTitle>
          <CustomSubtitle>
            Decouvrez pourquoi des milliers de professionnels utilisent ProjectSim360 pour developper leurs competences.
          </CustomSubtitle>
        </div>
      </div>

      <div className="w-full mx-auto px-6">
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden gap-1.5 mx-auto">
          <Marquee pauseOnHover className="[--duration:40s] grow">
            {firstColumn.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </Marquee>
          <Marquee reverse pauseOnHover className="[--duration:40s] grow">
            {secondColumn.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </Marquee>
          <div className="pointer-events-none absolute inset-y-0 start-0 w-1/12 bg-gradient-to-r from-background" />
          <div className="pointer-events-none absolute inset-y-0 end-0 w-1/12 bg-gradient-to-l from-background" />
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing Section ────────────────────────────────────────────── */

function PricingSection() {
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const isYearly = billingPeriod === 'yearly';

  return (
    <section id="tarifs" className="py-24 bg-background border-b border-border/50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-center flex-col text-center gap-5">
          <CustomBadge>Tarifs</CustomBadge>
          <CustomTitle>Tarification simple & transparente</CustomTitle>
          <CustomSubtitle className="mb-10">
            Choisissez le plan ideal pour votre parcours.
            <br />
            Tous les plans incluent un essai gratuit de 14 jours.
          </CustomSubtitle>

          <div className="flex items-center justify-center mb-18">
            <ToggleGroup
              type="single"
              value={billingPeriod}
              onValueChange={(value) => value && setBillingPeriod(value)}
              className="bg-accent rounded-xl gap-1 p-1.5"
            >
              <ToggleGroupItem
                value="monthly"
                className="cursor-pointer flex items-center rounded-lg text-sm font-medium px-6 py-2 data-[state=on]:bg-background data-[state=on]:shadow-sm"
              >
                Mensuel
              </ToggleGroupItem>
              <ToggleGroupItem
                value="yearly"
                className="cursor-pointer flex items-center rounded-lg text-sm font-medium px-6 py-2 data-[state=on]:bg-background data-[state=on]:shadow-sm"
              >
                Annuel
                <Badge variant="outline" className="leading-0 rounded-sm px-1 py-0.5 text-[11px] bg-[#4b2f95]/10 border-[#4b2f95]/10 text-[#4b2f95] dark:text-[#c4a0ff] dark:bg-[#4b2f95]/20 dark:border-[#4b2f95]/20 font-semibold ml-2">
                  -20%
                </Badge>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {PLANS.map((plan, index) => (
            <div key={index}>
              <Card className={cn(
                'h-full relative transition-all duration-300 group',
                plan.popular ? 'border-[#4b2f95] shadow-2xl scale-105' : 'border-border hover:border-[#4b2f95]',
              )}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-[#4b2f95] to-[#f14f1a] text-white px-2.5 py-1">
                      <Star className="h-3 w-3 me-0.5" />
                      Le plus populaire
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center py-6">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-muted-foreground mb-5">
                    {plan.description}
                  </CardDescription>
                  <div className="flex items-end justify-center">
                    <div className="relative h-16 flex items-end">
                      <AnimatePresence mode="popLayout">
                        <motion.span
                          key={isYearly ? 'yearly' : 'monthly'}
                          initial={{ opacity: 0, y: 20, scale: 0.8 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -20, scale: 0.8 }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                          className="text-5xl font-bold bg-gradient-to-r from-[#4b2f95] to-[#f14f1a] bg-clip-text text-transparent relative"
                        >
                          {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                    <span className="text-muted-foreground ms-1 mb-1">
                      {isYearly ? '/an' : '/mois'}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <svg className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-6">
                    <Button className="w-full cursor-pointer hover:scale-[1.025] active:scale-[0.98] transition-transform" size="lg" variant={plan.popular ? 'default' : 'outline'} asChild>
                      <Link to="/auth/sign-up">Commencer</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ Section ────────────────────────────────────────────────── */

function FaqSection() {
  return (
    <section className="py-24 bg-background" id="faq">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-center flex-col text-center gap-5 mb-25">
          <CustomBadge>FAQ</CustomBadge>
          <CustomTitle>Questions frequentes</CustomTitle>
          <CustomSubtitle>
            Vous avez des questions ? Nous avons les reponses. Voici les questions les plus courantes sur notre plateforme.
          </CustomSubtitle>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {FAQ_ITEMS.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-background rounded-lg border! border-border px-6 hover:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-start font-semibold text-foreground hover:text-[#4b2f95] data-[state=open]:text-[#4b2f95] transition-colors cursor-pointer">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="flex flex-col justify-center items-center gap-1.5 text-center mt-12">
          <span className="text-muted-foreground">Encore des questions ?</span>
          <a href="#contact" className="text-[#4b2f95] hover:text-[#3a2470] transition-colors hover:underline">
            Contactez notre equipe
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─── Call To Action Section ─────────────────────────────────────── */

function CallToActionSection() {
  return (
    <section className="h-96 relative w-full overflow-hidden bg-zinc-900 flex flex-col items-center justify-center">
      <div className="absolute inset-0 w-full h-full bg-zinc-900 z-20 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
      <Boxes />

      <div className="container mx-auto px-6 text-center relative z-10">
        <p className="text-white/80 font-semibold text-sm uppercase tracking-wide mb-6">
          Pret a commencer ?
        </p>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-10">
          Lancez votre essai gratuit aujourd'hui.
        </h2>
        <Button variant="outline" size="lg" className="font-semibold" asChild>
          <Link to="/auth/sign-up">Demarrer gratuitement</Link>
        </Button>
      </div>
    </section>
  );
}

/* ─── Contact Section ────────────────────────────────────────────── */

function ContactSection() {
  return (
    <section id="contact" className="py-24 bg-background border-b border-border/50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-center flex-col text-center gap-5 mb-16">
          <CustomBadge>Contact</CustomBadge>
          <CustomTitle>Parlons de votre projet</CustomTitle>
          <CustomSubtitle>
            Vous souhaitez une offre entreprise personnalisee ou avez des questions ? Contactez-nous.
          </CustomSubtitle>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Nom</label>
                  <input className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#4b2f95]" placeholder="Votre nom" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
                  <input className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#4b2f95]" placeholder="votre@email.com" type="email" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Entreprise</label>
                <input className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#4b2f95]" placeholder="Nom de votre entreprise" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Message</label>
                <textarea className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#4b2f95] min-h-[120px]" placeholder="Decrivez votre besoin..." />
              </div>
              <Button className="w-full" size="lg">
                Envoyer le message
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────────── */

function FooterSection() {
  const links = {
    produit: ['Fonctionnalites', 'Tarifs', 'Scenarios', 'API'],
    entreprise: ['A propos', 'Recrutement', 'Partenaires', 'Contact'],
    support: ['Centre d\'aide', 'Communaute', 'Documentation', 'Securite'],
  };

  const socialLinks = [
    { label: 'X (Twitter)', icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
    { label: 'GitHub', icon: 'M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z' },
    { label: 'LinkedIn', icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
  ];

  return (
    <footer className="bg-background relative overflow-hidden">
      <div className="container px-6 mx-auto pt-14 pb-6 border-b border-border/50">
        <div className="flex flex-col lg:flex-row justify-between items-start">
          <div className="lg:w-1/3 mb-12 lg:mb-0">
            <div className="flex items-center mb-3">
              <Logo />
            </div>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Transformez votre carriere en gestion de projet avec la puissance de l'IA. Simulez, apprenez, certifiez.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href="#"
                  className="size-9 border border-border/60 text-muted-foreground rounded-md flex items-center justify-center hover:text-foreground hover:scale-110 active:scale-90 transition-all"
                  aria-label={social.label}
                >
                  <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div className="w-full grow lg:w-auto lg:grow-0 lg:w-2/3 flex justify-end">
            <div className="w-full lg:w-auto flex justify-between flex-wrap lg:grid lg:grid-cols-3 gap-8 lg:gap-16">
              {Object.entries(links).map(([category, items]) => (
                <div key={category}>
                  <h3 className="font-medium text-base mb-4 capitalize text-muted-foreground/80">{category}</h3>
                  <ul className="text-base space-y-2">
                    {items.map((item, itemIndex) => (
                      <li key={itemIndex}>
                        <a href="#" className="text-accent-foreground hover:text-[#4b2f95] transition-colors hover:underline">
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Separator className="my-6 bg-border/50" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            &copy; 2026 ProjectSim360. Tous droits reserves.
          </p>
          <p className="text-muted-foreground text-sm mt-4 md:mt-0">
            Propulse par{' '}
            <a href="#" className="text-foreground hover:text-[#4b2f95] hover:underline">
              IA Anthropic & OpenAI
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ─── Main Landing Page ──────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden max-w-[100vw]">
      <Header />
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <FaqSection />
      <CallToActionSection />
      <ContactSection />
      <FooterSection />
    </div>
  );
}
