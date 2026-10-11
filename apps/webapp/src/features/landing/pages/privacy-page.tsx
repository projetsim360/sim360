import { PublicPage } from '../components/public-page';
import { ProseSections, type ProseSection } from '../components/prose-sections';
import { LEGAL_ENTITY } from '../content/legal-entity';

const SECTIONS: ProseSection[] = Array.from({ length: 8 }, (_, i) => ({
  titleKey: `privacy.s${i + 1}.title` as ProseSection['titleKey'],
  textKey: `privacy.s${i + 1}.text` as ProseSection['textKey'],
}));

export default function PrivacyPage() {
  return (
    <PublicPage id="privacy">
      <ProseSections
        sections={SECTIONS}
        updated={LEGAL_ENTITY.lastUpdated}
        values={{
          officer: LEGAL_ENTITY.privacyOfficer,
          email: LEGAL_ENTITY.email,
          host: LEGAL_ENTITY.host,
          processors: LEGAL_ENTITY.processors.join(', '),
        }}
      />
    </PublicPage>
  );
}
