import { Banknote, Building2, Code2, Heart, Leaf, Rocket, type LucideIcon } from 'lucide-react';
import type { PublicMessageKey } from '@/i18n/public-messages';

export interface Domain {
  id: string;
  icon: LucideIcon;
  titleKey: PublicMessageKey;
  textKey: PublicMessageKey;
  image: string;
}

export const DOMAINS: readonly Domain[] = [
  { id: 'it', icon: Code2, titleKey: 'domains.it.title', textKey: 'domains.it.text', image: '/media/landing/domain-it.webp' },
  { id: 'construction', icon: Building2, titleKey: 'domains.construction.title', textKey: 'domains.construction.text', image: '/media/landing/domain-btp.webp' },
  { id: 'startup', icon: Rocket, titleKey: 'domains.startup.title', textKey: 'domains.startup.text', image: '/media/landing/domain-startup.webp' },
  { id: 'eco', icon: Leaf, titleKey: 'domains.eco.title', textKey: 'domains.eco.text', image: '/media/landing/domain-eco.webp' },
  { id: 'finance', icon: Banknote, titleKey: 'domains.finance.title', textKey: 'domains.finance.text', image: '/media/landing/domain-finance.webp' },
  { id: 'health', icon: Heart, titleKey: 'domains.health.title', textKey: 'domains.health.text', image: '/media/landing/domain-health.webp' },
];
