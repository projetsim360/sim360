import { Logo } from '@/components/logo';

const VALUE_PROPS = [
  'Des scénarios complets : brief, équipe simulée, décisions, imprévus',
  'Budget, délai, qualité et moral qui réagissent à chaque décision',
  'Un retour détaillé après chaque livrable',
];

const PILOT_POINTS = ['Accès complet pendant le pilote', 'Ligne directe avec l’équipe produit'];

/**
 * Right-hand (desktop) / top (mobile) panel of the auth flow.
 * Decorative layers are Tailwind arbitrary values; on small screens only the logo and the
 * tagline show, so the form stays first in the reading flow.
 */
export function AuthBranding() {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[var(--brand-900)]">
      <img
        src="/media/app/auth-immersive.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-30 saturate-50"
        onError={(e) => {
          e.currentTarget.hidden = true;
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,var(--brand-900)_0%,rgba(26,43,72,0.85)_35%,rgba(238,122,58,0.30)_65%,var(--brand-900)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_75%_25%,rgba(238,122,58,0.40)_0%,transparent_60%)]" />

      <div className="relative z-10 flex h-full flex-col gap-6 p-6 sm:p-8 lg:gap-0 lg:p-16">
        <a href="/" aria-label="Simex pro, accueil" className="w-fit">
          <Logo onDark className="text-[24px] lg:text-[28px]" />
        </a>

        <div className="flex max-w-xl flex-col gap-10 lg:my-12 lg:flex-1 lg:justify-center">
          <div className="flex flex-col gap-3 lg:gap-6">
            <h2 className="font-display text-[26px] leading-[1.1] font-extrabold tracking-[-0.02em] text-balance text-white sm:text-[32px] lg:text-[44px]">
              La gestion de projet n’est pas une théorie.{' '}
              <span className="text-[var(--accent-400)]">Vivez-la.</span>
            </h2>
            <p className="hidden max-w-md font-body text-[17px] leading-relaxed text-white/80 lg:block">
              La plateforme québécoise de simulation pour futurs chefs de projet, formateurs et équipes
              de recrutement.
            </p>
          </div>

          <ul className="m-0 hidden list-none flex-col gap-3.5 p-0 lg:flex">
            {VALUE_PROPS.map((prop) => (
              <li key={prop} className="flex items-start gap-3 text-[15px] leading-snug text-white/85">
                <CheckIcon />
                <span>{prop}</span>
              </li>
            ))}
          </ul>

          <div className="hidden rounded-r-md border-l-2 border-[var(--accent-500)] bg-white/5 p-4 backdrop-blur-sm lg:block">
            <p className="m-0 mb-2 text-[11px] font-semibold tracking-[1px] text-[var(--accent-300)] uppercase">
              Programme pilote 2026
            </p>
            <p className="m-0 mb-3 text-[15px] leading-relaxed text-white/90">
              Simex pro est en phase pilote au Québec. Vos retours décident des prochains scénarios.
            </p>
            <ul className="m-0 flex list-none flex-wrap gap-x-6 gap-y-1 p-0 text-[13px] text-white/75">
              {PILOT_POINTS.map((point) => (
                <li key={point} className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-[var(--accent-500)]" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="m-0 hidden text-[12px] text-white/60 lg:block">
          Conçu au Québec · Prix en dollars canadiens
        </p>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      className="mt-0.5 size-5 shrink-0 text-[var(--accent-500)]"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <path d="M5 10l3.5 3.5L15 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
