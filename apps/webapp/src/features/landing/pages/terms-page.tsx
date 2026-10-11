import { PublicPage } from '../components/public-page';
import { ProseSections, type ProseSection } from '../components/prose-sections';
import { LEGAL_ENTITY } from '../content/legal-entity';

const SECTIONS: ProseSection[] = Array.from({ length: 8 }, (_, i) => ({
  titleKey: `terms.s${i + 1}.title` as ProseSection['titleKey'],
  textKey: `terms.s${i + 1}.text` as ProseSection['textKey'],
}));

export default function TermsPage() {
  return (
    <PublicPage id="terms">
      <ProseSections sections={SECTIONS} updated={LEGAL_ENTITY.lastUpdated} />
    </PublicPage>
  );
}
