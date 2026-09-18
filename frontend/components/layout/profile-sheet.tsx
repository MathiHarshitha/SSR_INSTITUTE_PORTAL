"use client";

import Link from "next/link";
import { LogOut, Mail, Phone, ShieldCheck, User as UserIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { AuthUser } from "@/types/auth";
import { useLogout } from "@/hooks/useAuth";

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

function statusBadgeClassName(status: AuthUser["status"]): string {
  switch (status) {
    case "ACTIVE":
      return "bg-status-good/10 text-status-good";
    case "SUSPENDED":
      return "bg-status-serious/15 text-orange-800 dark:text-status-serious";
    case "BLOCKED":
    case "REJECTED":
      return "bg-status-critical/10 text-status-critical";
    case "PENDING":
      return "bg-muted text-muted-foreground";
  }
}

export function ProfileSheet({ user, open, onOpenChange }: ProfileSheetProps) {
  const logout = useLogout();
  const profileHref = `/${user.role.toLowerCase()}/profile`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-sm">
        <SheetHeader>
          <SheetTitle className="sr-only">Account</SheetTitle>
          <SheetDescription className="sr-only">Your account details and logout</SheetDescription>
          <div className="flex flex-col items-center gap-3 pt-2 text-center">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-lg font-semibold text-primary-foreground">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-base font-semibold text-foreground">{user.name}</p>
              <div className="mt-1 flex items-center justify-center gap-1.5">
                <Badge variant="outline">{user.role}</Badge>
                <Badge className={statusBadgeClassName(user.status)}>{user.status}</Badge>
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-1 px-4">
          <div className="flex items-center gap-3 rounded-md px-2 py-2 text-sm">
            <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{user.email}</span>
          </div>
          {user.phone && (
            <div className="flex items-center gap-3 rounded-md px-2 py-2 text-sm">
              <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span>{user.phone}</span>
            </div>
          )}
          {user.lastLoginAt && (
            <div className="flex items-center gap-3 rounded-md px-2 py-2 text-sm">
              <ShieldCheck className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-muted-foreground">
                Last login {new Date(user.lastLoginAt).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        <Separator className="my-2" />

        <div className="space-y-2 px-4">
          <Link
            href={profileHref}
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium hover:bg-muted"
          >
            <UserIcon className="h-4 w-4" />
            View full profile
          </Link>
        </div>

        <SheetFooter>
          <Button
            variant="outline"
            className="w-full text-destructive hover:text-destructive"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            <LogOut className="h-4 w-4" />
            {logout.isPending ? "Logging out..." : "Log out"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
