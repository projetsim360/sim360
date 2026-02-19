import { Link } from 'react-router-dom';
import { APP_RESOURCES_MENU } from '@/config/menu.config';

export function SidebarMenuSecondary() {
  const resourceGroup = APP_RESOURCES_MENU[0];
  const items = resourceGroup?.children ?? [];

  return (
    <div>
      <h3 className="text-xs text-muted-foreground uppercase ps-5 inline-block mb-3">
        {resourceGroup?.title ?? 'Ressources'}
      </h3>
      <div className="flex flex-col w-full gap-1.5 px-3.5">
        {items.map((item, index) => (
          <Link
            key={index}
            to={item.path ?? '#'}
            className="group flex items-center gap-2.5 py-1 px-1"
          >
            {item.icon && (
              <span className="bg-black rounded-md flex items-center justify-center size-7">
                <item.icon className="size-3.5 text-white" />
              </span>
            )}
            <span className="text-sm text-secondary-foreground group-hover:text-mono">
              {item.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
