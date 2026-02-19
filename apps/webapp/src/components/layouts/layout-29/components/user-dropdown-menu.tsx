import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage, AvatarIndicator, AvatarStatus } from "@/components/ui/avatar";
import { Clock, Target, Users, Building2, User, Settings, Shield, Moon, Sun, Zap, Download, ExternalLink, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import { useAuth } from "@/providers/auth-provider";

export function UserDropdownMenu() {
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
			<DropdownMenuTrigger className="cursor-pointer">
				<Avatar className="size-7">
					{user?.avatar ? (
						<AvatarImage src={`${apiBase}${user.avatar}`} alt={fullName} />
					) : null}
					<AvatarFallback>{initials}</AvatarFallback>
					<AvatarIndicator className="-end-2 -top-2">
						<AvatarStatus variant="online" className="size-2.5" />
					</AvatarIndicator>
				</Avatar>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56" side="bottom" align="end" sideOffset={11}>
				{/* User Information Section */}
				<div className="flex items-center gap-3 px-3 py-2">
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
						<span className="text-xs text-muted-foreground">{user?.role || ''}</span>
						<Badge variant="success" appearance="outline" size="sm" className="mt-1">Pro Plan</Badge>
					</div>
				</div>

				<DropdownMenuItem className="cursor-pointer py-1 rounded-md border border-border hover:bg-muted">
					<Clock/>
					<span>Set availability</span>
				</DropdownMenuItem>

				<DropdownMenuSeparator />

				{/* Core Actions */}
				<DropdownMenuItem>
					<Target/>
					<span>My Projects</span>
					<Badge variant="info" size="sm" appearance="outline" className="ms-auto">3</Badge>
				</DropdownMenuItem>

				<DropdownMenuItem>
					<Users/>
					<span>Team Management</span>
				</DropdownMenuItem>

				<DropdownMenuItem>
					<Building2/>
					<span>Organization</span>
				</DropdownMenuItem>

				<DropdownMenuSeparator />

				{/* Settings */}
				<DropdownMenuItem>
					<User/>
					<span>Profile Settings</span>
				</DropdownMenuItem>

				<DropdownMenuItem>
					<Settings/>
					<span>Preferences</span>
				</DropdownMenuItem>

				<DropdownMenuItem>
					<Shield/>
					<span>Security</span>
				</DropdownMenuItem>

				<DropdownMenuSeparator />

				{/* Theme Toggle */}
				<DropdownMenuItem onClick={toggleTheme}>
					{theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
					<span>{theme === "light" ? "Dark mode" : "Light mode"}</span>
				</DropdownMenuItem>

				<DropdownMenuSeparator />

				{/* Developer Tools */}
				<DropdownMenuSub>
					<DropdownMenuSubTrigger>
						<Zap/>
						<span>Developer Tools</span>
					</DropdownMenuSubTrigger>
					<DropdownMenuSubContent className="w-48">
						<DropdownMenuItem>API Documentation</DropdownMenuItem>
						<DropdownMenuItem>Code Repository</DropdownMenuItem>
						<DropdownMenuItem>Testing Suite</DropdownMenuItem>
					</DropdownMenuSubContent>
				</DropdownMenuSub>

				<DropdownMenuItem>
					<Download/>
					<span>Download SDK</span>
					<ExternalLink className="size-3 ms-auto" />
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
