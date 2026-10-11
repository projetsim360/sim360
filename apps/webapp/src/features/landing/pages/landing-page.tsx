import { HeroSection } from '../sections/hero';
import { PilotBand } from '../sections/pilot-band';
import { HowItWorksSection } from '../sections/how-it-works';
import { DomainsSection } from '../sections/domains';
import { WhySection } from '../sections/why';
import { PricingSection } from '../sections/pricing';
import { FaqSection } from '../sections/faq';
import { FinalCta } from '../sections/final-cta';

/** Public home page. Nav, footer, locale and document head come from `PublicShell`. */
export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <PilotBand />
      <HowItWorksSection />
      <DomainsSection />
      <WhySection />
      <PricingSection />
      <FaqSection />
      <FinalCta />
    </>
  );
}
