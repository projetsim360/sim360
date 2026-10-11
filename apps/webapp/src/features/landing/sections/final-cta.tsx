import { Link } from 'react-router';
import { useIntl } from 'react-intl';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';
import { Reveal } from '../components/reveal';

export function FinalCta() {
  const { formatMessage } = useIntl();
  const { user } = useAuth();

  return (
    <section className="relative overflow-hidden px-6 py-32">
      <div className="absolute inset-0 bg-cover bg-center [background-image:url('/media/landing/cta-immersive.jpg')]" />
      <div className="absolute inset-0 [background:linear-gradient(to_bottom,rgba(238,122,58,0.30)_0%,transparent_50%),rgba(15,26,46,0.85)]" />
      <Reveal className="relative z-10 mx-auto max-w-3xl text-center text-white">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--accent-400)]">{formatMessage({ id: 'cta.kicker' })}</p>
        <h2 className="mb-6 mt-3 font-display text-4xl font-extrabold lg:text-5xl">{formatMessage({ id: 'cta.title' })}</h2>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-white/80">{formatMessage({ id: 'cta.text' })}</p>
        {user ? (
          <Link to="/simulations">
            <Button variant="primary" size="lg">
              {formatMessage({ id: 'cta.buttonLoggedIn' })}
            </Button>
          </Link>
        ) : (
          <>
            <Link to="/auth/sign-up">
              <Button variant="primary" size="lg">
                {formatMessage({ id: 'cta.button' })}
              </Button>
            </Link>
            <p className="mt-4 text-sm text-white/60">{formatMessage({ id: 'cta.note' })}</p>
          </>
        )}
      </Reveal>
    </section>
  );
}
