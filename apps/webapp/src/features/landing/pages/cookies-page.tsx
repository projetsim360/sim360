import { PublicPage } from '../components/public-page';
import { ProseSections, type ProseSection } from '../components/prose-sections';
import { LEGAL_ENTITY } from '../content/legal-entity';

const SECTIONS: ProseSection[] = [
  { titleKey: 'cookies.s1.title', textKey: 'cookies.s1.text' },
  { titleKey: 'cookies.s2.title', textKey: 'cookies.s2.text' },
  { titleKey: 'cookies.s3.title', textKey: 'cookies.s3.text' },
];

export default function CookiesPage() {
  return (
    <PublicPage id="cookies">
      <ProseSections sections={SECTIONS} updated={LEGAL_ENTITY.lastUpdated} />
    </PublicPage>
  );
}
