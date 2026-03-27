import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { useCurrentUser } from "@/hooks/use-current-user";
import { OfflineIndicator } from "@/components/shared/offline-indicator";
import { Spinner } from "@/components/ui/spinner";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export function AppLayout() {
  const { role, name, isLoading } = useCurrentUser();
  const [sheetOpen, setSheetOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--muted))]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar — always visible on lg+ */}
      <aside className="hidden lg:flex w-64 flex-col shrink-0">
        <Sidebar userRole={role} />
      </aside>

      {/* Mobile sidebar — Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="w-[280px] max-w-[80vw] p-0">
          <Sidebar userRole={role} onNavigate={() => setSheetOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <Topbar
          userRole={role}
          userName={name}
          onMenuToggle={() => setSheetOpen(true)}
        />
        <main className="flex-1 p-4 md:p-6 bg-[hsl(var(--muted))]">
          <Outlet />
        </main>
        <OfflineIndicator />
      </div>
    </div>
  );
}
