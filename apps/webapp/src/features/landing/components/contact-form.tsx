import { useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { FormattedMessage, useIntl } from 'react-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api-client';
import { publicPath } from '@/i18n/public-locale';
import { usePublicLocale } from '../hooks/use-public-locale';

export const CONTACT_EMAIL = 'hello@simex.pro';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function ContactForm() {
  const { formatMessage } = useIntl();
  const locale = usePublicLocale();
  const { pathname } = useLocation();
  const [status, setStatus] = useState<Status>('idle');
  // Time between display and submit: bots submit in milliseconds, humans do not.
  const shownAt = useRef<number>(Date.now());

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(2, formatMessage({ id: 'contact.validation.name' })).max(120),
        email: z.string().trim().email(formatMessage({ id: 'contact.validation.email' })).max(254),
        message: z.string().trim().min(10, formatMessage({ id: 'contact.validation.message' })).max(4000),
        website: z.string().max(200).optional(),
      }),
    [formatMessage],
  );
  type Values = z.infer<typeof schema>;

  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { name: '', email: '', message: '', website: '' } });

  const onSubmit = async (values: Values) => {
    setStatus('sending');
    try {
      await api.post('/public/contact', { ...values, locale, page: pathname, elapsedMs: Date.now() - shownAt.current });
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <div role="status" className="rounded-2xl border border-[var(--success-500)]/30 bg-[var(--success-500)]/10 p-8">
        <CheckCircle2 className="mb-3 size-8 text-[var(--success-500)]" aria-hidden="true" />
        <h2 className="font-display text-xl font-bold text-foreground">{formatMessage({ id: 'contact.success.title' })}</h2>
        <p className="mt-2 text-muted-foreground">{formatMessage({ id: 'contact.success.text' })}</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{formatMessage({ id: 'contact.form.name' })}</FormLabel>
              <FormControl>
                <Input autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{formatMessage({ id: 'contact.form.email' })}</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" inputMode="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{formatMessage({ id: 'contact.form.message' })}</FormLabel>
              <FormControl>
                <Textarea rows={6} placeholder={formatMessage({ id: 'contact.form.messagePlaceholder' })} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Honeypot: invisible to people, filled by bots. */}
        <div className="absolute -left-[9999px] top-0 h-px w-px overflow-hidden" aria-hidden="true">
          <label htmlFor="contact-website">Website</label>
          <input id="contact-website" type="text" tabIndex={-1} autoComplete="off" {...form.register('website')} />
        </div>

        {status === 'error' && (
          <p role="alert" className="text-sm text-destructive">
            {formatMessage({ id: 'contact.error' }, { email: CONTACT_EMAIL })}
          </p>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            <FormattedMessage
              id="contact.form.privacy"
              values={{
                privacy: (chunks) => (
                  <Link key="privacy" to={publicPath('privacy', locale)} className="underline hover:text-foreground">
                    {chunks}
                  </Link>
                ),
              }}
            />
          </p>
          <Button type="submit" variant="primary" size="md" disabled={status === 'sending'} className="bg-[var(--accent-500)] text-[var(--brand-900)] hover:bg-[var(--accent-400)] hover:text-[var(--brand-900)]">
            {formatMessage({ id: status === 'sending' ? 'contact.form.sending' : 'contact.form.submit' })}
          </Button>
        </div>
      </form>
    </Form>
  );
}
