import { fr, type AppMessageKey } from './fr';
import { en } from './en';
import type { AppLocale } from './locale';

export type AppMessages = Record<AppMessageKey, string>;

export const APP_MESSAGES: Record<AppLocale, AppMessages> = { fr, en };

export type { AppMessageKey };
