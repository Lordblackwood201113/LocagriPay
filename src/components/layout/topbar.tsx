import { UserButton } from "@clerk/react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Role } from "@/lib/constants";
import { ROLE_LABELS } from "@/lib/constants";
import { GlobalSearch } from "./global-search";

interface TopbarProps {
  userRole: Role | null;
  userName: string | null;
  onMenuToggle: () => void;
}

export function Topbar({ userRole, userName, onMenuToggle }: TopbarProps) {
  return (
    <header className="flex items-center h-14 border-b bg-[hsl(var(--card))] px-4 shrink-0">
      <div className="lg:hidden mr-2">
        <Button variant="ghost" size="icon" onClick={onMenuToggle} aria-label="Ouvrir le menu">
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <span className="lg:hidden text-lg font-bold">LOCAGRI PAY</span>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <GlobalSearch />
        {userName && (
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-medium">{userName}</span>
            {userRole && (
              <span className="text-xs text-[hsl(var(--muted-foreground))]">
                {ROLE_LABELS[userRole]}
              </span>
            )}
          </div>
        )}
        <UserButton />
      </div>
    </header>
  );
}
