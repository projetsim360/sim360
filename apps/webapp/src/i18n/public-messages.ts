import { fr, type PublicMessageKey } from './locales/fr';
import { en } from './locales/en';
import type { PublicLocale } from './public-locale';

export type PublicMessages = Record<PublicMessageKey, string>;

export const PUBLIC_MESSAGES: Record<PublicLocale, PublicMessages> = { fr, en };

export type { PublicMessageKey };
