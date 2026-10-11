import { useIntl } from 'react-intl';
import { Mail } from 'lucide-react';
import { PublicPage } from '../components/public-page';
import { ContactForm, CONTACT_EMAIL } from '../components/contact-form';

export default function ContactPage() {
  const { formatMessage } = useIntl();
  return (
    <PublicPage id="contact" width="wide">
      <div className="grid items-start gap-10 lg:grid-cols-[3fr_2fr]">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <ContactForm />
        </div>
        <aside className="rounded-2xl border border-border bg-card/60 p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-foreground">{formatMessage({ id: 'contact.alt.title' })}</h2>
          <p className="mt-4 inline-flex items-center gap-2 text-foreground/85">
            <Mail size={16} aria-hidden="true" />
            {formatMessage(
              { id: 'contact.alt.email' },
              {
                email: (
                  <a key="email" href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--accent-400)] hover:underline">
                    {CONTACT_EMAIL}
                  </a>
                ),
              },
            )}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">{formatMessage({ id: 'contact.alt.hours' })}</p>
        </aside>
      </div>
    </PublicPage>
  );
}
