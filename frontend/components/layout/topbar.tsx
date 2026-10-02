"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { formatDistanceToNow } from "date-fns";
import {
  Award,
  Bell,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  FileInput,
  Megaphone,
  Menu,
  Moon,
  Sun,
  UserPlus,
  Video,
  Wallet,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLinkItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProfileSheet } from "@/components/layout/profile-sheet";
import { roleHomePath } from "@/hooks/useAuth";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from "@/hooks/useNotifications";
import { cn } from "cn";
import { AppNotification, NotificationType } from "@/types/notification";
import { AuthUser } from "@/types/auth";

interface TopbarProps {
  user: AuthUser;
  title: string;
  onOpenMobileSidebar: () => void;
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const NOTIFICATION_ICON: Record<NotificationType, { icon: typeof Bell; chip: string }> = {
  ACCOUNT_APPROVED: { icon: CheckCircle2, chip: "bg-status-good/10 text-status-good" },
  ACCOUNT_REJECTED: { icon: XCircle, chip: "bg-destructive/10 text-destructive" },
  TASK_PUBLISHED: { icon: ClipboardList, chip: "bg-secondary/10 text-secondary" },
  SUBMISSION_EVALUATED: { icon: ClipboardCheck, chip: "bg-secondary/10 text-secondary" },
  INTERVIEW_SCHEDULED: { icon: Video, chip: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400" },
  CERTIFICATE_ISSUED: { icon: Award, chip: "bg-secondary/10 text-secondary" },
  APPLICATION_STATUS_CHANGED: { icon: Briefcase, chip: "bg-secondary/10 text-secondary" },
  ANNOUNCEMENT: { icon: Megaphone, chip: "bg-secondary/10 text-secondary" },
  PAYMENT_SUBMITTED: { icon: Wallet, chip: "bg-secondary/10 text-secondary" },
  PAYMENT_APPROVED: { icon: Wallet, chip: "bg-status-good/10 text-status-good" },
  PAYMENT_REJECTED: { icon: Wallet, chip: "bg-destructive/10 text-destructive" },
  PAYMENT_RECORDED: { icon: Wallet, chip: "bg-status-good/10 text-status-good" },
  SUBMISSION_RECEIVED: { icon: FileInput, chip: "bg-secondary/10 text-secondary" },
  USER_PENDING_APPROVAL: {
    icon: UserPlus,
    chip: "bg-status-warning/15 text-amber-800 dark:text-status-warning",
  },
};

const DEFAULT_NOTIFICATION_ICON = { icon: Bell, chip: "bg-secondary/10 text-secondary" };

function NotificationRow({
  notification,
  onRead,
}: {
  notification: AppNotification;
  onRead: (id: string) => void;
}) {
  // A type this build doesn't know yet (backend deployed ahead of the frontend, or a stale bundle)
  // must fall back to a generic icon rather than crash the whole layout.
  const { icon: Icon, chip } =
    (NOTIFICATION_ICON as Partial<typeof NOTIFICATION_ICON>)[notification.type] ?? DEFAULT_NOTIFICATION_ICON;

  const content = (
    <div className="flex w-full items-start gap-2.5 whitespace-normal py-1">
      <span className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl", chip)}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <p className={cn("truncate text-sm", !notification.read ? "font-semibold text-foreground" : "text-foreground")}>
            {notification.title}
          </p>
          {!notification.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />}
        </div>
        <p className="line-clamp-2 text-xs text-muted-foreground">{notification.message}</p>
        <p className="text-[11px] text-muted-foreground">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  );

  if (notification.link) {
    return (
      <DropdownMenuLinkItem
        render={<Link href={notification.link} />}
        className="items-start px-2 py-1.5"
        onClick={() => !notification.read && onRead(notification._id)}
      >
        {content}
      </DropdownMenuLinkItem>
    );
  }

  return (
    <DropdownMenuItem
      className="items-start px-2 py-1.5"
      onClick={() => !notification.read && onRead(notification._id)}
    >
      {content}
    </DropdownMenuItem>
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={cn(TOOLBAR_BUTTON, "relative overflow-hidden")}
    >
      {/* Sun and moon swap with a small rotate/scale so the toggle feels tactile. */}
      <Sun className="h-[18px] w-[18px] rotate-0 scale-100 text-amber-500 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-0 text-sky-300 transition-all duration-300 dark:rotate-0 dark:scale-100" />
    </button>
  );
}

/** Round icon button used inside the top bar's tool pill. */
const TOOLBAR_BUTTON =
  "inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground outline-none transition-all hover:bg-card hover:text-foreground hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring data-popup-open:bg-card data-popup-open:text-foreground data-popup-open:shadow-sm";

export function Topbar({ user, title, onOpenMobileSidebar }: TopbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const { data: notificationsData } = useNotifications();
  const markAsRead = useMarkNotificationRead();
  const markAllAsRead = useMarkAllNotificationsRead();
  const notifications = notificationsData?.notifications ?? [];

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 lg:hidden"
          onClick={onOpenMobileSidebar}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Link href={roleHomePath(user.role)} className="flex shrink-0 items-center gap-2 lg:hidden">
          <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-black/5">
            <Image src="/ssr-logo.webp" alt="SSR Institute" fill sizes="36px" className="object-contain p-1" />
          </div>
        </Link>

        <h1 className="truncate text-base font-semibold text-foreground sm:text-lg">{title}</h1>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-0.5 rounded-full border border-border/70 bg-muted/60 p-1">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(TOOLBAR_BUTTON, "relative")}
            aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
          >
            <Bell className={cn("h-[18px] w-[18px]", unreadCount > 0 && "text-secondary")} />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-50" />
                <span className="relative inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 px-1 text-[10px] font-bold leading-none text-white shadow-sm ring-2 ring-card">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent glass={false} align="end" className="w-[min(20rem,calc(100vw-1rem))] p-2">
            <div className="flex items-center justify-between px-1 py-1.5">
              <p className="text-sm font-semibold text-foreground">Notifications</p>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllAsRead.mutate()}
                  className="text-xs font-medium text-secondary hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            <DropdownMenuSeparator className="-mx-2" />
            {notifications.length === 0 ? (
              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                You&apos;re all caught up.
              </div>
            ) : (
              <ScrollArea className="h-80">
                <div className="flex flex-col gap-0.5 pr-2 pt-1">
                  {notifications.map((notification) => (
                    <NotificationRow
                      key={notification._id}
                      notification={notification}
                      onRead={(id) => markAsRead.mutate(id)}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        </div>

        <button
          type="button"
          onClick={() => setProfileOpen(true)}
          className="group flex items-center gap-2.5 rounded-full border border-border/70 bg-card p-1 shadow-sm outline-none transition-all hover:border-secondary/40 hover:shadow-md hover:shadow-secondary/10 focus-visible:ring-2 focus-visible:ring-ring sm:pr-3"
          aria-label="Open account panel"
        >
          <span className="relative shrink-0">
            {/* Gradient ring in the sidebar's teal family. */}
            <span className="block rounded-full bg-gradient-to-br from-[#00b8d4] via-secondary to-[#0b5568] p-[2px]">
              <Avatar className="h-8 w-8 ring-2 ring-card">
                {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                <AvatarFallback className="bg-gradient-to-br from-[#0b5568] to-[#0a2b34] text-xs font-semibold text-white">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
            </span>
            {user.status === "ACTIVE" && (
              <span
                className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-card"
                aria-hidden
              />
            )}
          </span>
          <span className="hidden min-w-0 text-left leading-tight sm:block">
            <span className="block max-w-[10rem] truncate text-sm font-semibold text-foreground">{user.name}</span>
            <span className="mt-0.5 inline-block rounded-full bg-secondary/10 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-secondary">
              {user.role.toLowerCase()}
            </span>
          </span>
          <ChevronDown
            className={cn(
              "hidden h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:text-foreground sm:block",
              profileOpen && "rotate-180"
            )}
          />
        </button>
        </div>
      </div>

      <ProfileSheet user={user} open={profileOpen} onOpenChange={setProfileOpen} />
    </header>
  );
}
