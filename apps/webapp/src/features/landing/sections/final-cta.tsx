import { Link } from 'react-router';
import { useIntl } from 'react-intl';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { usePublicSession } from '../providers/public-session';
import { Reveal } from '../components/reveal';

export function FinalCta() {
  const { formatMessage } = useIntl();
  const { user } = usePublicSession();
  const reduced = useReducedMotion();

  return (
    <section className="relative overflow-hidden px-6 py-32">
      {/* Slow Ken Burns on the backdrop; still for reduced motion. */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center [background-image:url('/media/landing/cta-immersive.webp')]"
        animate={reduced ? undefined : { scale: [1, 1.08] }}
        transition={{ duration: 24, repeat: Infinity, repeatType: 'mirror', ease: 'linear' }}
      />
      <div className="absolute inset-0 [background:linear-gradient(to_bottom,rgba(238,122,58,0.30)_0%,transparent_50%),rgba(15,26,46,0.85)]" />
      <Reveal className="relative z-10 mx-auto max-w-3xl text-center text-white">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--accent-400)]">{formatMessage({ id: 'cta.kicker' })}</p>
        <h2 className="mb-6 mt-3 font-display text-4xl font-extrabold lg:text-5xl">{formatMessage({ id: 'cta.title' })}</h2>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-white/80">{formatMessage({ id: 'cta.text' })}</p>
        {user ? (
          <Button asChild variant="primary" size="lg" className="bg-[var(--accent-500)] text-[var(--brand-900)] hover:bg-[var(--accent-400)] hover:text-[var(--brand-900)]">
            <Link to="/simulations">{formatMessage({ id: 'cta.buttonLoggedIn' })}</Link>
          </Button>
        ) : (
          <>
            <Button asChild variant="primary" size="lg" className="bg-[var(--accent-500)] text-[var(--brand-900)] hover:bg-[var(--accent-400)] hover:text-[var(--brand-900)] shadow-[0_12px_32px_rgba(238,122,58,0.35)]">
              <Link to="/auth/sign-up">{formatMessage({ id: 'cta.button' })}</Link>
            </Button>
            <p className="mt-4 text-sm text-white/60">{formatMessage({ id: 'cta.note' })}</p>
          </>
        )}
      </Reveal>
    </section>
  );
}
