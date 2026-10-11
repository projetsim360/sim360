import { Link } from 'react-router';
import { FormattedMessage, useIntl } from 'react-intl';
import { motion } from 'framer-motion';
import { Play, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';

export function HeroSection() {
  const { formatMessage } = useIntl();
  const { user } = useAuth();

  return (
    <section
      id="hero"
      className="bg-background px-6 pb-24 pt-32 lg:px-8 lg:pb-32 lg:pt-40 [background-image:radial-gradient(ellipse_800px_600px_at_80%_0%,rgba(238,122,58,0.08),transparent)]"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
          <motion.span
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--accent-500)]/20 bg-[var(--accent-500)]/15 px-3 py-1.5 text-xs font-semibold text-[var(--accent-300)]"
            animate={{
              boxShadow: ['0 0 0 0 rgba(238,122,58,0.0)', '0 0 0 6px rgba(238,122,58,0.12)', '0 0 0 0 rgba(238,122,58,0.0)'],
            }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Target size={13} aria-hidden="true" />
            {formatMessage({ id: 'hero.badge' })}
          </motion.span>

          <h1 className="font-display text-balance text-[40px] font-extrabold leading-[1.05] tracking-[-0.02em] text-foreground sm:text-[52px] lg:text-[64px]">
            <FormattedMessage id="hero.title" values={{ accent: (chunks) => <span className="text-[var(--accent-500)]">{chunks}</span> }} />
          </h1>

          <p className="mt-6 max-w-xl text-lg text-muted-foreground lg:text-xl">{formatMessage({ id: 'hero.subtitle' })}</p>

          <div className="mt-10 flex flex-wrap gap-4">
            {user ? (
              <Link to="/simulations">
                <Button variant="primary" size="lg">
                  {formatMessage({ id: 'hero.ctaLoggedIn' })}
                </Button>
              </Link>
            ) : (
              <Link to="/auth/sign-up">
                <Button variant="primary" size="lg">
                  {formatMessage({ id: 'hero.cta' })}
                </Button>
              </Link>
            )}
            <a
              href="#comment-ca-marche"
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
            >
              <span className="flex size-9 items-center justify-center rounded-full border-2 border-current">
                <Play size={14} className="ml-0.5" aria-hidden="true" />
              </span>
              {formatMessage({ id: 'hero.secondary' })}
            </a>
          </div>
        </motion.div>

        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative flex aspect-[16/10] w-full flex-col overflow-hidden rounded-2xl border border-[var(--brand-700)]/20 bg-[var(--brand-900)] shadow-[0_30px_80px_rgba(15,26,46,0.2),0_12px_24px_rgba(15,26,46,0.1)]">
            <div className="z-10 flex shrink-0 items-center gap-2 border-b border-white/10 bg-[var(--brand-900)] px-4 py-3">
              <span className="size-3 rounded-full bg-[#ff5f56]" />
              <span className="size-3 rounded-full bg-[#ffbd2e]" />
              <span className="size-3 rounded-full bg-[#27c93f]" />
              <span className="ml-4 flex-1 rounded bg-white/10 px-3 py-0.5 text-center text-[10px] text-white/40">app.simex-pro.com/dashboard</span>
            </div>
            <div className="relative flex-1 overflow-hidden">
              <img
                src="/media/landing/hero-dashboard.png"
                alt={formatMessage({ id: 'hero.mockupAlt' })}
                className="absolute inset-0 h-full w-full object-cover object-top"
                loading="eager"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <motion.div
              className="absolute right-4 top-16 z-20 inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-500)]/95 px-3 py-1 text-[11px] font-semibold text-white shadow-lg backdrop-blur-sm"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <motion.span className="size-1.5 rounded-full bg-white" animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }} />
              {formatMessage({ id: 'hero.liveBadge' })}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
