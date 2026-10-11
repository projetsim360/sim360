import { useIntl } from 'react-intl';
import { motion } from 'framer-motion';
import { Reveal } from '../components/reveal';
import { DOMAINS } from '../content/domains';

export function DomainsSection() {
  const { formatMessage } = useIntl();
  return (
    <section id="fonctionnalites" className="scroll-mt-20 bg-background px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mb-16 text-center">
          <h2 className="font-display text-4xl font-extrabold text-foreground">{formatMessage({ id: 'domains.title' })}</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{formatMessage({ id: 'domains.subtitle' })}</p>
        </Reveal>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {DOMAINS.map(({ id, icon: Icon, titleKey, textKey, image }, i) => (
            <motion.article
              key={id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent-500)]"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-[var(--brand-900)]">
                <img
                  src={image}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover opacity-80 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand-900)] via-[var(--brand-900)]/40 to-transparent" />
                <div className="absolute left-4 top-4 flex size-11 items-center justify-center rounded-lg bg-[var(--accent-500)]/90 text-white backdrop-blur-sm">
                  <Icon size={22} aria-hidden="true" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="mb-2 font-display text-xl font-bold text-foreground">{formatMessage({ id: titleKey })}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{formatMessage({ id: textKey })}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
