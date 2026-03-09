import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/auth-provider';
import { APP_SIDEBAR_MENU } from '@/config/menu.config';
import { SIMULATION_CONTEXT_MENU } from '@/config/simulation-context-menu';
import type { MenuConfig, MenuItem, UserRole } from '@/config/types';

// Regex pour extraire l'id de simulation depuis l'URL
const SIMULATION_PATH_RE = /\/simulations\/([a-zA-Z0-9_-]+)/;

function filterItems(items: MenuConfig, userRole: UserRole): MenuConfig {
  return items.reduce<MenuConfig>((acc, item) => {
    if (item.roles && !item.roles.includes(userRole)) {
      return acc;
    }

    if (item.children) {
      const filteredChildren = filterItems(item.children, userRole);
      if (filteredChildren.length === 0 && !item.heading && !item.separator) {
        return acc;
      }
      acc.push({ ...item, children: filteredChildren.length > 0 ? filteredChildren : undefined });
    } else {
      acc.push(item);
    }

    return acc;
  }, []);
}

function replaceSimId(items: MenuConfig, simId: string): MenuConfig {
  return items.map((item) => {
    const updated: MenuItem = { ...item };
    if (updated.path) {
      updated.path = updated.path.replace(':simId', simId);
    }
    if (updated.rootPath) {
      updated.rootPath = updated.rootPath.replace(':simId', simId);
    }
    if (updated.children) {
      updated.children = replaceSimId(updated.children, simId);
    }
    return updated;
  });
}

export function useContextualMenu(): {
  menu: MenuConfig;
  isInSimulation: boolean;
  simulationId: string | null;
} {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const userRole = (user?.role as UserRole) || 'MEMBER';

  return useMemo(() => {
    const match = pathname.match(SIMULATION_PATH_RE);

    // Exclure les paths comme /simulations/new
    const isInSimulation = !!match && match[1] !== 'new';
    const simulationId = isInSimulation ? match![1] : null;

    if (isInSimulation && simulationId) {
      const contextMenu = replaceSimId(SIMULATION_CONTEXT_MENU, simulationId);
      const filtered = filterItems(contextMenu, userRole);
      return { menu: filtered, isInSimulation, simulationId };
    }

    const filtered = filterItems(APP_SIDEBAR_MENU, userRole);
    return { menu: filtered, isInSimulation: false, simulationId: null };
  }, [pathname, userRole]);
}
