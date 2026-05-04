import { Logo } from '@/components/logo';

const VALUE_PROPS = [
  'Vivez 12 scénarios issus de vrais cabinets',
  'Pilotez budget, équipe et sponsor en temps réel',
  'Recevez un feedback senior après chaque livrable',
];

const TRUST_PARTNERS = ['Bouygues', 'BNP Paribas', 'SNCF', 'KPMG'];

export function AuthBranding() {
  return (
    <div className="relative overflow-hidden bg-[var(--brand-900)] flex flex-col w-full h-full">
      {/* Layer 1 — image (decorative, fades on error) */}
      <img
        src="/media/app/auth-immersive.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-30 saturate-50"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />

      {/* Layer 2 — diagonal aurora gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(135deg, var(--brand-900) 0%, rgba(26,43,72,0.85) 35%, rgba(238,122,58,0.30) 65%, var(--brand-900) 100%)',
        }}
      />

      {/* Layer 3 — radial warm glow upper-right */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 75% 25%, rgba(238,122,58,0.40) 0%, transparent 60%)',
        }}
      />

      {/* Layer 4 — content */}
      <div className="relative z-10 flex flex-col h-full p-10 lg:p-16">
        {/* Top: Logo */}
        <div>
          <Logo onDark className="text-[28px]" />
        </div>

        {/* Mid: tagline + sub + value props + testimonial */}
        <div className="flex-1 flex flex-col justify-center max-w-xl gap-10 my-12">
          <div className="flex flex-col gap-6">
            <h2 className="font-display font-extrabold text-white leading-[1.1] tracking-[-0.02em] text-[40px] lg:text-[44px] text-balance">
              La gestion de projet
              <br />
              n'est pas une théorie.
              <br />
              Vivez-la.
            </h2>
            <p className="font-body text-[17px] text-white/80 max-w-md leading-relaxed">
              Plateforme de simulation pour PM ambitieux et recruteurs exigeants.
            </p>
          </div>

          <ul className="flex flex-col gap-3.5 list-none p-0 m-0">
            {VALUE_PROPS.map((prop) => (
              <li
                key={prop}
                className="flex items-start gap-3 text-white/85 text-[15px] leading-snug"
              >
                <CheckIcon />
                <span>{prop}</span>
              </li>
            ))}
          </ul>

          <blockquote className="bg-white/5 backdrop-blur-sm border-l-2 border-[var(--accent-500)] rounded-r-md p-4 m-0">
            <p className="font-body italic text-white/95 text-[15px] leading-relaxed mb-2">
              « J'ai progressé en 3 semaines plus que sur 6 mois en mission. »
            </p>
            <footer className="text-[13px] text-white/65">
              — Léa M., Junior PM → Senior PM en 2026
            </footer>
          </blockquote>
        </div>

        {/* Bottom: trust bar */}
        <div className="flex flex-col gap-3">
          <p className="text-[11px] tracking-[1px] uppercase text-white/55 font-semibold">
            En confiance chez
          </p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
            {TRUST_PARTNERS.map((partner) => (
              <span
                key={partner}
                className="text-white/65 text-[14px] font-semibold tracking-tight"
              >
                {partner}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      className="size-5 text-[var(--accent-500)] shrink-0 mt-0.5"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <path
        d="M5 10l3.5 3.5L15 7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
