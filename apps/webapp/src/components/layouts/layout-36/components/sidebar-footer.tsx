import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, User, Users, Sparkles, LogOut, Sun, Moon } from "@/components/keenicons/icons";
import { useTheme } from "next-themes";
import { useAuth } from "@/providers/auth-provider";

export function SidebarFooter() {
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
    <div className="flex items-center shrink-0 px-2.5 py-5">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between px-3 py-6 hover:bg-muted text-foreground rounded-xl"
          >
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                {user?.avatar ? (
                  <AvatarImage src={`${apiBase}${user.avatar}`} alt={fullName} />
                ) : null}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{fullName}</span>
            </div>
            <ChevronsUpDown className="h-4 w-4 opacity-70" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          side="top"
          className="w-57 rounded-xl p-1"
        >
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4 opacity-80" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Users className="mr-2 h-4 w-4 opacity-80" />
            Accounts
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Sparkles className="mr-2 h-4 w-4 opacity-80" />
            Upgrade
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={toggleTheme}>
            {theme === "light" ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
            {theme === "light" ? "Dark mode" : "Light mode"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>
            <LogOut className="mr-2 h-4 w-4 opacity-80" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
