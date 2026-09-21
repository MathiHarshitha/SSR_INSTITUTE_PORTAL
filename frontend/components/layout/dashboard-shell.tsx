"use client";

import Image from "next/image";
import { Rocket, LogOut } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { TopNav } from "@/components/layout/top-nav";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useUIStore } from "@/store/ui-store";
import { useLogout } from "@/hooks/useAuth";
import { AuthUser } from "@/types/auth";

interface DashboardShellProps {
  user: AuthUser;
  title: string;
  children: React.ReactNode;
}

function SidebarAurora() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="bg-dot-grid absolute inset-0 opacity-[0.07]" />
      <div className="animate-aurora absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#5b6cff] opacity-70 blur-3xl" />
      <div
        className="animate-aurora absolute -right-24 top-16 h-80 w-80 rounded-full bg-[#d946ef] opacity-60 blur-3xl"
        style={{ animationDelay: "-5s" }}
      />
      <div
        className="animate-aurora absolute -left-16 top-1/2 h-64 w-64 rounded-full bg-[#22d3ee] opacity-45 blur-3xl"
        style={{ animationDelay: "-10s" }}
      />
      <div
        className="animate-aurora absolute -right-16 bottom-16 h-72 w-72 rounded-full bg-[#fb923c] opacity-45 blur-3xl"
        style={{ animationDelay: "-2s" }}
      />
      <div
        className="animate-aurora absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-[#22c55e] opacity-35 blur-3xl"
        style={{ animationDelay: "-7s" }}
      />
      <div className="absolute inset-0 bg-[#10142a]/60" />
    </div>
  );
}

function SidebarLogo() {
  return (
    <div className="relative z-10 flex h-14 shrink-0 items-center gap-2.5 border-b border-white/10 px-4">
      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white shadow-md ring-1 ring-black/5">
        <Image src="/ssr-logo.webp" alt="SSR Institute" fill sizes="32px" className="object-contain p-1" priority />
      </div>
      <div className="min-w-0 leading-tight">
        <p className="animate-sidebar-shimmer truncate bg-gradient-to-r from-[#7dd3fc] via-[#f0abfc] via-40% to-[#7dd3fc] bg-clip-text text-sm font-bold text-transparent">
          SSR Institute
        </p>
        <p className="text-[10px] text-white/50">Learn • Build • Grow</p>
      </div>
    </div>
  );
}

function SidebarPromo() {
  return (
    <div className="animate-sidebar-glow relative z-10 mx-3 mb-2 flex items-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-br from-[#4f5ff5] via-[#8b3ff5] to-[#c026d3] px-3 py-2.5 text-white shadow-lg shadow-black/20">
      <div className="bg-dot-grid pointer-events-none absolute inset-0 opacity-30" />
      <Rocket className="animate-sidebar-float relative h-5 w-5 shrink-0" />
      <div className="relative min-w-0 leading-tight">
        <p className="truncate text-[11px] font-bold">Better Skills, Brighter Future</p>
        <p className="truncate text-[10px] text-white/75">Keep learning, keep growing</p>
      </div>
    </div>
  );
}

function SidebarLogout() {
  const logout = useLogout();
  return (
    <button
      type="button"
      onClick={() => logout.mutate()}
      disabled={logout.isPending}
      className="relative z-10 mx-3 mb-3 flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-rose-500/10 hover:text-rose-300 disabled:opacity-50"
    >
      <LogOut className="h-4 w-4 shrink-0" />
      <span>{logout.isPending ? "Logging out…" : "Logout"}</span>
    </button>
  );
}

export function DashboardShell({ user, title, children }: DashboardShellProps) {
  const isMobileSidebarOpen = useUIStore((s) => s.isMobileSidebarOpen);
  const openMobileSidebar = useUIStore((s) => s.openMobileSidebar);
  const closeMobileSidebar = useUIStore((s) => s.closeMobileSidebar);

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="relative hidden w-64 shrink-0 overflow-hidden bg-gradient-to-b from-[#241a4d] via-[#181c3a] to-[#0d1128] lg:block">
        <SidebarAurora />
        <div className="relative z-10 flex h-screen w-64 flex-col">
          <SidebarLogo />

          <div className="scrollbar-none flex-1 overflow-y-auto px-3 py-3">
            <TopNav role={user.role} variant="list" />
          </div>

          <SidebarPromo />
          <SidebarLogout />
        </div>
      </aside>

      <Sheet open={isMobileSidebarOpen} onOpenChange={(open) => !open && closeMobileSidebar()}>
        <SheetContent
          side="left"
          className="relative w-72 overflow-hidden border-0 bg-gradient-to-b from-[#241a4d] via-[#181c3a] to-[#0d1128] p-0 text-white"
        >
          <SidebarAurora />
          <SheetHeader className="relative z-10 border-b border-white/10 px-5 py-4">
            <SheetTitle className="flex items-center gap-2.5 text-left text-white">
              <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-black/5">
                <Image src="/ssr-logo.webp" alt="SSR Institute" fill sizes="32px" className="object-contain p-1" />
              </span>
              SSR Institute
            </SheetTitle>
          </SheetHeader>
          <div className="relative z-10 flex h-[calc(100%-4.5rem)] flex-col justify-between">
            <div className="scrollbar-none flex-1 overflow-y-auto px-3 py-3">
              <TopNav role={user.role} variant="list" onNavigate={closeMobileSidebar} />
            </div>
            <div>
              <SidebarPromo />
              <SidebarLogout />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        <Topbar user={user} title={title} onOpenMobileSidebar={openMobileSidebar} />
        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
