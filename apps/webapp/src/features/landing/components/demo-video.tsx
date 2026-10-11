import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useIntl } from 'react-intl';
import { Clapperboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePublicLocale } from '../hooks/use-public-locale';

/**
 * Self-hosted demo video (roadmap lot 5): `public/media/landing/demo-<locale>.{mp4,webm,vtt}`
 * with a poster. The files are probed on mount (`preload="none"` never reports a missing
 * source by itself); until they exist, the player gives way to an honest "coming" card.
 */
export function DemoVideo() {
  const { formatMessage } = useIntl();
  const locale = usePublicLocale();
  const [available, setAvailable] = useState<boolean | null>(null);
  const base = `/media/landing/demo-${locale}`;

  useEffect(() => {
    let cancelled = false;
    fetch(`${base}.mp4`, { method: 'HEAD' })
      .then((r) => !cancelled && setAvailable(r.ok && (r.headers.get('content-type') ?? '').startsWith('video/')))
      .catch(() => !cancelled && setAvailable(false));
    return () => {
      cancelled = true;
    };
  }, [base]);

  if (available === false) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center">
        <Clapperboard className="mb-4 size-10 text-[var(--accent-400)]" aria-hidden="true" />
        <h2 className="font-display text-xl font-bold text-foreground">{formatMessage({ id: 'demo.unavailable.title' })}</h2>
        <p className="mt-2 max-w-md text-muted-foreground">{formatMessage({ id: 'demo.unavailable.text' })}</p>
        <Button asChild variant="primary" size="sm" className="mt-6 bg-[var(--accent-500)] text-[var(--brand-900)] hover:bg-[var(--accent-400)] hover:text-[var(--brand-900)]">
          <Link to="/auth/sign-up">{formatMessage({ id: 'demo.cta' })}</Link>
        </Button>
      </div>
    );
  }

  return (
    <video
      className="aspect-video w-full rounded-2xl border border-border bg-[var(--brand-900)]"
      controls
      preload="none"
      playsInline
      poster="/media/landing/demo-poster.webp"
      aria-label={formatMessage({ id: 'demo.videoLabel' })}
      aria-busy={available === null}
    >
      <source src={`${base}.webm`} type="video/webm" />
      <source src={`${base}.mp4`} type="video/mp4" />
      <track kind="subtitles" srcLang="fr" src="/media/landing/demo-fr.vtt" label="Français" default={locale === 'fr'} />
      <track kind="subtitles" srcLang="en" src="/media/landing/demo-en.vtt" label="English" default={locale === 'en'} />
    </video>
  );
}
