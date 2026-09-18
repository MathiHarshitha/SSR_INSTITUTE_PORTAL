"use client";

import { usePathname } from "next/navigation";
import { RequireAuth } from "@/components/shared/require-auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { NAV_ITEMS } from "@/constants/nav";
import { Role } from "@/types/auth";
import { useAuthStore } from "@/store/auth-store";

function pageTitleFor(role: Role, pathname: string): string {
  const items = NAV_ITEMS[role];
  const match = items.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  return match?.label ?? "Dashboard";
}

export function RoleDashboardLayout({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  return (
    <RequireAuth allowedRoles={[role]}>
      {user && (
        <DashboardShell user={user} title={pageTitleFor(role, pathname)}>
          {children}
        </DashboardShell>
      )}
    </RequireAuth>
  );
}
