import { PublicPage } from '../components/public-page';
import { ProseSections, type ProseSection } from '../components/prose-sections';
import { LEGAL_ENTITY } from '../content/legal-entity';

const SECTIONS: ProseSection[] = [
  { titleKey: 'legal.publisher.title', textKey: 'legal.publisher.text' },
  { titleKey: 'legal.host.title', textKey: 'legal.host.text' },
  { titleKey: 'legal.ip.title', textKey: 'legal.ip.text' },
  { titleKey: 'legal.contact.title', textKey: 'legal.contact.text' },
];

export default function LegalPage() {
  return (
    <PublicPage id="legal">
      <ProseSections
        sections={SECTIONS}
        updated={LEGAL_ENTITY.lastUpdated}
        values={{ name: LEGAL_ENTITY.name, neq: LEGAL_ENTITY.neq, address: LEGAL_ENTITY.address, email: LEGAL_ENTITY.email, host: LEGAL_ENTITY.host }}
      />
    </PublicPage>
  );
}
