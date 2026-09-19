"use client";

import { GraduationCap } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { TopNav } from "@/components/layout/top-nav";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
    <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-secondary/[0.06]">
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
        <div className="fixed flex h-screen w-64 flex-col">
          <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/30">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-sidebar-foreground">SSR Portal</p>
              <p className="text-[11px] text-sidebar-foreground/60">SSR Institute</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-4">
            <TopNav role={user.role} variant="list" />
          </div>

          <div className="border-t border-sidebar-border p-4 text-[11px] text-sidebar-foreground/50">
            © {new Date().getFullYear()} SSR Institute
          </div>
        </div>
      </aside>

      <Sheet open={isMobileSidebarOpen} onOpenChange={(open) => !open && closeMobileSidebar()}>
        <SheetContent side="left" className="w-72 bg-sidebar p-0 text-sidebar-foreground">
          <SheetHeader className="border-b border-sidebar-border px-5 py-4">
            <SheetTitle className="flex items-center gap-2 text-left text-sidebar-foreground">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <GraduationCap className="h-4 w-4" />
              </span>
              SSR Portal
            </SheetTitle>
          </SheetHeader>
          <TopNav role={user.role} variant="list" onNavigate={closeMobileSidebar} className="px-3 py-4" />
        </SheetContent>
      </Sheet>

      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar user={user} title={title} onOpenMobileSidebar={openMobileSidebar} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
