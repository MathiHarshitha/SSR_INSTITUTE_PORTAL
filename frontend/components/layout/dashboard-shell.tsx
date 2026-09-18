"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useUIStore } from "@/store/ui-store";
import { AuthUser } from "@/types/auth";

interface DashboardShellProps {
  user: AuthUser;
  title: string;
  children: React.ReactNode;
}

export function DashboardShell({ user, title, children }: DashboardShellProps) {
  const isMobileSidebarOpen = useUIStore((s) => s.isMobileSidebarOpen);
  const openMobileSidebar = useUIStore((s) => s.openMobileSidebar);
  const closeMobileSidebar = useUIStore((s) => s.closeMobileSidebar);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed h-screen w-64">
          <Sidebar role={user.role} />
        </div>
      </aside>

      <Sheet open={isMobileSidebarOpen} onOpenChange={(open) => !open && closeMobileSidebar()}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Sidebar role={user.role} onNavigate={closeMobileSidebar} />
        </SheetContent>
      </Sheet>

      <div className="flex min-h-screen flex-1 flex-col lg:pl-0">
        <Topbar user={user} title={title} onOpenMobileSidebar={openMobileSidebar} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
