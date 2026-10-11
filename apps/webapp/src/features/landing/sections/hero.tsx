import { useRef } from 'react';
import { Link } from 'react-router';
import { FormattedMessage, useIntl } from 'react-intl';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Play, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePublicSession } from '../providers/public-session';
import { MeshBackground } from '../components/mesh-background';
import { useScrollContainer } from '../hooks/use-scroll-container';

export function HeroSection() {
  const { formatMessage } = useIntl();
  const { user } = usePublicSession();
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const container = useScrollContainer(sectionRef);
  const { scrollY } = useScroll({ container });
  // Light parallax: the mockup drifts up a little faster than the copy while leaving the viewport.
  const mockupY = useTransform(scrollY, [0, 600], [0, reduced ? 0 : -48]);
  const copyY = useTransform(scrollY, [0, 600], [0, reduced ? 0 : 20]);

  const primaryCta = user ? { to: '/simulations', id: 'hero.ctaLoggedIn' as const } : { to: '/auth/sign-up', id: 'hero.cta' as const };

  return (
    <section ref={sectionRef} id="hero" className="relative overflow-hidden bg-background px-6 pb-24 pt-32 lg:px-8 lg:pb-32 lg:pt-40">
      <MeshBackground />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* CSS entrance on the wrapper, framer parallax on the inner element: a running CSS animation
            would otherwise override framer's inline transform. */}
        <div className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-700 motion-reduce:animate-none">
        <motion.div style={{ y: copyY }}>
          <motion.span
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--accent-500)]/20 bg-[var(--accent-500)]/15 px-3 py-1.5 text-xs font-semibold text-[var(--accent-300)]"
            animate={reduced ? undefined : { boxShadow: ['0 0 0 0 rgba(238,122,58,0.0)', '0 0 0 6px rgba(238,122,58,0.12)', '0 0 0 0 rgba(238,122,58,0.0)'] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Target size={13} aria-hidden="true" />
            {formatMessage({ id: 'hero.badge' })}
          </motion.span>

          <h1 className="font-display text-balance text-[40px] font-extrabold leading-[1.05] tracking-[-0.02em] text-foreground sm:text-[52px] lg:text-[64px]">
            <FormattedMessage id="hero.title" values={{ accent: (chunks) => <span className="text-[var(--accent-500)]">{chunks}</span> }} />
          </h1>

          <p className="mt-6 max-w-xl text-lg text-muted-foreground lg:text-xl">{formatMessage({ id: 'hero.subtitle' })}</p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <motion.div whileHover={reduced ? undefined : { y: -2 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
              <Button asChild variant="primary" size="lg" className="bg-[var(--accent-500)] text-[var(--brand-900)] hover:bg-[var(--accent-400)] hover:text-[var(--brand-900)] shadow-[0_12px_32px_rgba(238,122,58,0.35)]">
                <Link to={primaryCta.to}>{formatMessage({ id: primaryCta.id })}</Link>
              </Button>
            </motion.div>
            <a
              href="#comment-ca-marche"
              className="group inline-flex items-center gap-2 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
            >
              <span className="flex size-9 items-center justify-center rounded-full border-2 border-current transition-transform group-hover:scale-105">
                <Play size={14} className="ml-0.5" aria-hidden="true" />
              </span>
              {formatMessage({ id: 'hero.secondary' })}
            </a>
          </div>
        </motion.div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-6 fill-mode-both delay-150 duration-700 motion-reduce:animate-none">
        <motion.div className="relative" style={{ y: mockupY }}>
          <div className="relative flex aspect-[16/10] w-full flex-col overflow-hidden rounded-2xl border border-[var(--brand-700)]/20 bg-[var(--brand-900)] shadow-[0_30px_80px_rgba(15,26,46,0.35),0_12px_24px_rgba(15,26,46,0.15)]">
            <div className="z-10 flex shrink-0 items-center gap-2 border-b border-white/10 bg-[var(--brand-900)] px-4 py-3">
              <span className="size-3 rounded-full bg-[#ff5f56]" />
              <span className="size-3 rounded-full bg-[#ffbd2e]" />
              <span className="size-3 rounded-full bg-[#27c93f]" />
              <span className="ml-4 flex-1 rounded bg-white/10 px-3 py-0.5 text-center text-[10px] text-white/60">app.simex-pro.com/dashboard</span>
            </div>
            <div className="relative flex-1 overflow-hidden animate-in fade-in fill-mode-both delay-300 duration-700 motion-reduce:animate-none">
              <img
                src="/media/landing/hero-dashboard.webp"
                alt={formatMessage({ id: 'hero.mockupAlt' })}
                className="absolute inset-0 h-full w-full object-cover object-top"
                loading="eager"
                fetchPriority="high"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </div>
          <div className="absolute right-4 top-16 z-20 inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-500)]/95 px-3 py-1 text-[11px] font-semibold text-white shadow-lg backdrop-blur-sm animate-in fade-in zoom-in-95 fill-mode-both delay-500 duration-500 motion-reduce:animate-none">
            <motion.span
              className="size-1.5 rounded-full bg-white"
              animate={reduced ? undefined : { opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            />
            {formatMessage({ id: 'hero.liveBadge' })}
          </div>
        </motion.div>
        </div>
      </div>
    </section>
  );
}
