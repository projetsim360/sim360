import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage, AvatarIndicator, AvatarStatus } from "@/components/ui/avatar";
import { MessageSquarePlus, History, Settings, HelpCircle, LogOut, Moon, Sun } from "@/components/keenicons/icons";
import { useTheme } from "next-themes";
import { useLayout } from "./context";
import { useAuth } from "@/providers/auth-provider";

interface UserDropdownMenuProps {
  isCollapsed?: boolean;
}

export function UserDropdownMenu({ isCollapsed = false }: UserDropdownMenuProps) {
	const {isMobile} = useLayout();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const fullName = user ? `${user.firstName} ${user.lastName}` : '';
  const initials = user
    ? `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`.toUpperCase()
    : '?';
  const apiBase = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <DropdownMenu>
			{isCollapsed ? (
				<DropdownMenuTrigger className="cursor-pointer py-1.5">
					<Avatar className="size-9">
						{user?.avatar ? (
							<AvatarImage src={`${apiBase}${user.avatar}`} alt={fullName} />
						) : null}
						<AvatarFallback>{initials}</AvatarFallback>
						<AvatarIndicator className="-end-1.5 -top-1.5">
							<AvatarStatus variant="online" className="size-2.5" />
						</AvatarIndicator>
					</Avatar>
				</DropdownMenuTrigger>
			) : (
				<DropdownMenuTrigger className="cursor-pointer" asChild>
					<div className="flex items-center gap-2.5 lg:px-2 py-1.5 rounded-md hover:bg-muted transition-colors w-full">
						<Avatar className="size-9">
							{user?.avatar ? (
								<AvatarImage src={`${apiBase}${user.avatar}`} alt={fullName} />
							) : null}
							<AvatarFallback>{initials}</AvatarFallback>
							<AvatarIndicator className="-end-1.5 -top-1.5">
								<AvatarStatus variant="online" className="size-2.5" />
							</AvatarIndicator>
						</Avatar>
						<div className="hidden lg:flex flex-col items-start flex-1 min-w-0">
							<span className="text-sm font-semibold text-foreground truncate w-full">{fullName}</span>
							<span className="text-xs text-muted-foreground truncate w-full">{user?.email}</span>
						</div>
					</div>
				</DropdownMenuTrigger>
			)}
			<DropdownMenuContent className="w-56" side="top" align={isMobile ? "end" : "start"} sideOffset={11}>
				{/* User Information Section */}
				<div className="flex items-center gap-2.5 px-2.5 py-1.5">
					<Avatar>
						{user?.avatar ? (
							<AvatarImage src={`${apiBase}${user.avatar}`} alt={fullName} />
						) : null}
						<AvatarFallback>{initials}</AvatarFallback>
						<AvatarIndicator className="-end-1.5 -top-1.5">
							<AvatarStatus variant="online" className="size-2.5" />
						</AvatarIndicator>
					</Avatar>
					<div className="flex flex-col items-start">
						<span className="text-sm font-semibold text-foreground">{fullName}</span>
						<span className="text-xs text-muted-foreground">{user?.email}</span>
					</div>
				</div>

				<DropdownMenuSeparator />

				{/* Chat Actions */}
				<DropdownMenuItem>
					<MessageSquarePlus/>
					<span>New Chat</span>
				</DropdownMenuItem>

				<DropdownMenuItem>
					<History/>
					<span>Chat History</span>
				</DropdownMenuItem>

				<DropdownMenuSeparator />

				{/* Settings */}
				<DropdownMenuItem>
					<Settings/>
					<span>Settings</span>
				</DropdownMenuItem>

				<DropdownMenuItem>
					<HelpCircle/>
					<span>Help & Support</span>
				</DropdownMenuItem>

				<DropdownMenuSeparator />

				{/* Theme Toggle */}
				<DropdownMenuItem onClick={toggleTheme}>
					{theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
					<span>{theme === "light" ? "Dark mode" : "Light mode"}</span>
				</DropdownMenuItem>

				<DropdownMenuSeparator />

				{/* Action Items */}
				<DropdownMenuItem onClick={logout}>
					<LogOut/>
					<span>Sign out</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
  );
}
