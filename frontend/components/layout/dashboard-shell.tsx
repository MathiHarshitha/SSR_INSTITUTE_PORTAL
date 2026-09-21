"use client";

import Image from "next/image";
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
    <div className="flex min-h-screen">
      <aside className="glass-nav hidden w-64 shrink-0 border-r border-sidebar-border lg:block">
        <div className="fixed flex h-screen w-64 flex-col">
          <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-md shadow-primary/20 ring-1 ring-black/5">
              <Image src="/ssr-logo.webp" alt="SSR Institute" fill sizes="36px" className="object-contain p-1" priority />
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
        <SheetContent side="left" className="glass-nav w-72 p-0 text-sidebar-foreground">
          <SheetHeader className="border-b border-sidebar-border px-5 py-4">
            <SheetTitle className="flex items-center gap-2.5 text-left text-sidebar-foreground">
              <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-black/5">
                <Image src="/ssr-logo.webp" alt="SSR Institute" fill sizes="32px" className="object-contain p-1" />
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
