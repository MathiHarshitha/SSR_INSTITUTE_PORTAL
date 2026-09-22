"use client";

import Image from "next/image";
import Link from "next/link";
import { User as UserIcon } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { TopNav } from "@/components/layout/top-nav";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUIStore } from "@/store/ui-store";
import { NAV_ITEMS } from "@/constants/nav";
import { AuthUser } from "@/types/auth";

interface DashboardShellProps {
  user: AuthUser;
  title: string;
  children: React.ReactNode;
}

function SidebarBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* soft color-mesh glows */}
      <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-[#7c6cf0] opacity-25 blur-[90px]" />
      <div className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-[#3b82f6] opacity-[0.18] blur-[110px]" />
      <div className="absolute -left-24 bottom-10 h-72 w-72 rounded-full bg-[#4c3bd6] opacity-[0.22] blur-[100px]" />

      {/* horizontal wave bands for depth */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 300 900"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="sidebar-wave-a" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4a52c4" />
            <stop offset="100%" stopColor="#332f8a" />
          </linearGradient>
          <linearGradient id="sidebar-wave-b" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3d47ab" />
            <stop offset="100%" stopColor="#282a72" />
          </linearGradient>
        </defs>
        <path
          d="M-20,110 C55,40 125,180 190,110 C240,60 280,150 320,90 L320,940 L-20,940 Z"
          fill="url(#sidebar-wave-a)"
          opacity="0.2"
        />
        <path
          d="M-20,300 C55,230 125,370 190,300 C240,250 280,340 320,280 L320,940 L-20,940 Z"
          fill="url(#sidebar-wave-b)"
          opacity="0.22"
        />
        <path
          d="M-20,500 C55,430 125,570 190,500 C240,450 280,540 320,480 L320,940 L-20,940 Z"
          fill="#262a68"
          opacity="0.3"
        />
        <path
          d="M-20,690 C55,630 125,750 190,690 C240,645 280,725 320,670 L320,940 L-20,940 Z"
          fill="#0e1130"
          opacity="0.6"
        />
      </svg>

      {/* fine grain texture for a matte, premium finish */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.05] mix-blend-overlay" aria-hidden="true">
        <filter id="sidebar-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#sidebar-grain)" />
      </svg>

      {/* vignette so top/bottom edges recede */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/45" />
    </div>
  );
}

function SidebarLogo() {
  return (
    <div className="relative z-10 flex h-16 shrink-0 items-center gap-3 px-5">
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-black/5">
        <Image src="/ssr-logo.webp" alt="SSR Institute" fill sizes="36px" className="object-contain p-1" priority />
      </div>
      <div className="min-w-0 leading-tight">
        <p className="truncate text-base font-bold text-white">SSR Institute</p>
        <p className="truncate text-[11px] text-white/50">Learn • Build • Grow</p>
      </div>
    </div>
  );
}

function SidebarProfile({ user, onNavigate }: { user: AuthUser; onNavigate?: () => void }) {
  const profileHref = NAV_ITEMS[user.role].find((item) => item.label === "Profile")?.href ?? "/";
  return (
    <div className="relative z-10 mx-3 mb-2 shrink-0 border-t border-white/10 pt-2">
      <Link
        href={profileHref}
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2 transition-colors hover:bg-white/10"
      >
        <Avatar className="h-9 w-9 shrink-0 ring-1 ring-white/15">
          {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
          <AvatarFallback className="bg-white/10 text-white">
            <UserIcon className="h-5 w-5" strokeWidth={1.75} />
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-[13px] font-semibold text-white">{user.name}</p>
          <p className="truncate text-[11px] capitalize text-white/50">{user.role.toLowerCase()}</p>
        </div>
      </Link>
    </div>
  );
}

export function DashboardShell({ user, title, children }: DashboardShellProps) {
  const isMobileSidebarOpen = useUIStore((s) => s.isMobileSidebarOpen);
  const openMobileSidebar = useUIStore((s) => s.openMobileSidebar);
  const closeMobileSidebar = useUIStore((s) => s.closeMobileSidebar);

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="relative hidden w-64 shrink-0 overflow-hidden bg-gradient-to-br from-[#2a2470] via-[#1b1f45] to-[#080a18] lg:block">
        <SidebarBackdrop />
        <div className="relative z-10 flex h-screen w-64 flex-col">
          <SidebarLogo />

          <div className="flex-1 overflow-hidden px-3 py-2">
            <TopNav role={user.role} variant="list" activeLayoutId="sidebar-active-desktop" />
          </div>

          <SidebarProfile user={user} />
        </div>
      </aside>

      <Sheet open={isMobileSidebarOpen} onOpenChange={(open) => !open && closeMobileSidebar()}>
        <SheetContent
          side="left"
          className="relative w-72 overflow-hidden border-0 bg-gradient-to-br from-[#2a2470] via-[#1b1f45] to-[#080a18] p-0 text-white"
        >
          <SidebarBackdrop />
          <SheetHeader className="relative z-10 px-5 py-4">
            <SheetTitle className="flex items-center gap-3 text-left text-white">
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-black/5">
                <Image src="/ssr-logo.webp" alt="SSR Institute" fill sizes="36px" className="object-contain p-1" />
              </span>
              SSR Institute
            </SheetTitle>
          </SheetHeader>
          <div className="relative z-10 flex h-[calc(100%-4.5rem)] flex-col">
            <div className="flex-1 overflow-hidden px-3 py-2">
              <TopNav
                role={user.role}
                variant="list"
                onNavigate={closeMobileSidebar}
                activeLayoutId="sidebar-active-mobile"
              />
            </div>

            <SidebarProfile user={user} onNavigate={closeMobileSidebar} />
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
