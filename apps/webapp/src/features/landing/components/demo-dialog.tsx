import { useState, type ReactNode } from 'react';
import { useIntl } from 'react-intl';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePublicLocale } from '../hooks/use-public-locale';

/**
 * "Voir la démo" opens the product video in a modal, on top of the current page.
 * The video element is mounted only while the dialog is open, so nothing downloads before
 * the click, and closing the dialog stops playback.
 */
export function DemoDialog({ children }: { children: ReactNode }) {
  const { formatMessage } = useIntl();
  const locale = usePublicLocale();
  const [open, setOpen] = useState(false);
  const base = `/media/landing/demo-${locale}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[min(96vw,1100px)] max-w-none gap-0 border-white/10 bg-[var(--brand-900)] p-0 sm:rounded-2xl">
        <DialogTitle className="sr-only">{formatMessage({ id: 'demo.videoLabel' })}</DialogTitle>
        {open && (
          <video
            className="aspect-video w-full rounded-2xl bg-black"
            controls
            autoPlay
            playsInline
            poster="/media/landing/demo-poster.webp"
            aria-label={formatMessage({ id: 'demo.videoLabel' })}
          >
            <source src={`${base}.webm`} type="video/webm" />
            <source src={`${base}.mp4`} type="video/mp4" />
            <track kind="subtitles" srcLang="fr" src="/media/landing/demo-fr.vtt" label="Français" default={locale === 'fr'} />
            <track kind="subtitles" srcLang="en" src="/media/landing/demo-en.vtt" label="English" default={locale === 'en'} />
          </video>
        )}
      </DialogContent>
    </Dialog>
  );
}
