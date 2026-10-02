"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  ChevronRight,
  Clock,
  LogOut,
  Mail,
  Phone,
  ShieldCheck,
  User as UserIcon,
  XIcon,
  LucideIcon,
} from "lucide-react";
import { cn } from "cn";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AuthUser } from "@/types/auth";
import { useLogout } from "@/hooks/useAuth";
import { LogoutConfirmDialog, STUDENT_QUOTES } from "@/components/layout/logout-confirm-dialog";

interface ProfileSheetProps {
  user: AuthUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Status pill tuned for the dark hero band: a soft tint with a dot, always with the text. */
function statusPillClassName(status: AuthUser["status"]): { pill: string; dot: string } {
  switch (status) {
    case "ACTIVE":
      return { pill: "bg-emerald-400/15 text-emerald-100 ring-emerald-300/30", dot: "bg-emerald-300" };
    case "SUSPENDED":
      return { pill: "bg-orange-400/15 text-orange-100 ring-orange-300/30", dot: "bg-orange-300" };
    case "BLOCKED":
    case "REJECTED":
      return { pill: "bg-red-400/15 text-red-100 ring-red-300/30", dot: "bg-red-300" };
    case "PENDING":
      return { pill: "bg-white/10 text-white/80 ring-white/20", dot: "bg-white/60" };
  }
}

function DetailRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0 leading-tight">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

export function ProfileSheet({ user, open, onOpenChange }: ProfileSheetProps) {
  const logout = useLogout();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const profileHref = `/${user.role.toLowerCase()}/profile`;
  const status = statusPillClassName(user.status);
  const role = user.role.charAt(0) + user.role.slice(1).toLowerCase();

  function askToLogout() {
    // A fresh quote each time the confirmation opens (students only see it).
    setQuoteIndex(Math.floor(Math.random() * STUDENT_QUOTES.length));
    setConfirmOpen(true);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* Solid background (not the translucent glass default) so the page doesn't show through.
          No scrolling: the content is compact enough to fit, and the logout footer is pinned to
          the bottom of the panel. */}
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full gap-0 overflow-hidden border-l-0 bg-background! p-0 sm:max-w-sm"
      >
        <SheetTitle className="sr-only">Account</SheetTitle>
        <SheetDescription className="sr-only">Your account details and logout</SheetDescription>

        <div className="flex min-h-0 flex-1 flex-col">
        {/* Hero band — same teal gradient family as the app sidebar. */}
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-[#0b5568] via-[#0a3d4a] to-[#06161b] px-6 pb-5 pt-7 text-center text-white">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#00b8d4] opacity-25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-[#0092b5] opacity-30 blur-3xl" />
          <div className="bg-dot-grid pointer-events-none absolute inset-0 opacity-[0.12]" />

          <SheetClose
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute right-3 top-3 text-white/80 hover:bg-white/10 hover:text-white"
              />
            }
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </SheetClose>

          <div className="relative flex flex-col items-center">
            <div className="rounded-full bg-gradient-to-br from-white/60 to-white/10 p-[3px] shadow-xl shadow-black/30">
              <Avatar className="h-16 w-16 ring-4 ring-[#0a3d4a]">
                {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                <AvatarFallback className="bg-white/15 text-xl font-semibold text-white">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
            </div>

            <p className="mt-3 text-lg font-semibold tracking-tight">{user.name}</p>
            <p className="text-xs text-white/60">{user.email}</p>

            <div className="mt-3 flex items-center gap-2">
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white/90 ring-1 ring-white/20">
                {role}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1",
                  status.pill
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} aria-hidden />
                {user.status}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4 px-4 py-4">
          <section>
            <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Account details
            </p>
            <div className="divide-y divide-border/60 overflow-hidden rounded-2xl bg-card shadow-[0_1px_3px_rgba(15,23,42,0.06),0_4px_12px_-4px_rgba(15,23,42,0.08)]">
              <DetailRow icon={Mail} label="Email" value={user.email} />
              {user.phone && <DetailRow icon={Phone} label="Phone" value={user.phone} />}
              {user.lastLoginAt && (
                <DetailRow
                  icon={Clock}
                  label="Last login"
                  value={
                    <span title={new Date(user.lastLoginAt).toLocaleString()}>
                      {formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true })}
                    </span>
                  }
                />
              )}
            </div>
          </section>

          <section>
            <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Quick links
            </p>
            <div className="divide-y divide-border/60 overflow-hidden rounded-2xl bg-card shadow-[0_1px_3px_rgba(15,23,42,0.06),0_4px_12px_-4px_rgba(15,23,42,0.08)]">
              <Link
                href={profileHref}
                onClick={() => onOpenChange(false)}
                className="group flex items-center gap-3 px-3 py-2 transition-colors hover:bg-muted/60"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-white shadow-sm shadow-secondary/30">
                  <UserIcon className="h-4 w-4" aria-hidden />
                </span>
                <span className="flex-1 text-sm font-medium text-foreground">View full profile</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/privacy-policy"
                target="_blank"
                className="group flex items-center gap-3 px-3 py-2 transition-colors hover:bg-muted/60"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <ShieldCheck className="h-4 w-4" aria-hidden />
                </span>
                <span className="flex-1 text-sm font-medium text-foreground">Privacy Policy</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </section>
        </div>
        </div>

        <SheetFooter className="mt-0 shrink-0 gap-3 px-4 pb-5 pt-3">
          <Button
            variant="ghost"
            className="h-11 w-full rounded-2xl bg-destructive/10 font-semibold text-destructive transition-colors hover:bg-destructive hover:text-white focus-visible:ring-destructive/30"
            onClick={askToLogout}
            disabled={logout.isPending}
          >
            <LogOut className="h-4 w-4" />
            {logout.isPending ? "Logging out..." : "Log out"}
          </Button>
          <p className="text-center text-[11px] text-muted-foreground">SSR Institute · Learn • Build • Grow</p>
        </SheetFooter>

        {/* Rendered inside the sheet so Base UI treats it as a nested dialog. */}
        <LogoutConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          role={user.role}
          quoteIndex={quoteIndex}
          isPending={logout.isPending}
          onConfirm={() => logout.mutate()}
        />
      </SheetContent>
    </Sheet>
  );
}
