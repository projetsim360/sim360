import { useMemo } from 'react';
import { useAuth } from '@/providers/auth-provider';
import type { MenuConfig, MenuItem, UserRole } from '@/config/types';

function filterItems(items: MenuConfig, userRole: UserRole): MenuConfig {
  return items.reduce<MenuConfig>((acc, item) => {
    // Si l'item a des roles définis et que l'utilisateur n'en fait pas partie, on le masque
    if (item.roles && !item.roles.includes(userRole)) {
      return acc;
    }

    // Filtrer récursivement les children
    if (item.children) {
      const filteredChildren = filterItems(item.children, userRole);
      // Si tous les children sont filtrés, masquer le parent aussi (sauf headings/separators)
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

export function useFilteredMenu(menu: MenuConfig): MenuConfig {
  const { user } = useAuth();
  const userRole = (user?.role as UserRole) || 'MEMBER';

  return useMemo(() => filterItems(menu, userRole), [menu, userRole]);
}
