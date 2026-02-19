import { APP_SIDEBAR_MENU, toNavConfig } from './menu.config';
import type { NavConfig } from './menu.config';

export type { NavConfig };
export type NavItem = NavConfig[number];

export const MAIN_NAV: NavConfig = toNavConfig(APP_SIDEBAR_MENU);
