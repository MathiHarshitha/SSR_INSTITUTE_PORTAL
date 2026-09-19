"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Bell, Menu } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuLinkItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProfileSheet } from "@/components/layout/profile-sheet";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from "@/hooks/useNotifications";
import { cn } from "cn";
import { AppNotification } from "@/types/notification";
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

function NotificationRow({
  notification,
  onRead,
}: {
  notification: AppNotification;
  onRead: (id: string) => void;
}) {
  const content = (
    <div className="flex w-full flex-col gap-0.5 whitespace-normal py-0.5">
      <div className="flex items-center gap-1.5">
        {!notification.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />}
        <p className={cn("text-sm", !notification.read ? "font-medium text-foreground" : "text-foreground")}>
          {notification.title}
        </p>
      </div>
      <p className="text-xs text-muted-foreground">{notification.message}</p>
      <p className="text-[11px] text-muted-foreground">
        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
      </p>
    </div>
  );

  if (notification.link) {
    return (
      <DropdownMenuLinkItem
        render={<Link href={notification.link} />}
        onClick={() => !notification.read && onRead(notification._id)}
      >
        {content}
      </DropdownMenuLinkItem>
    );
  }

  return (
    <DropdownMenuItem onClick={() => !notification.read && onRead(notification._id)}>
      {content}
    </DropdownMenuItem>
  );
}

export function Topbar({ user, title, onOpenMobileSidebar }: TopbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const { data: notificationsData } = useNotifications();
  const markAsRead = useMarkNotificationRead();
  const markAllAsRead = useMarkAllNotificationsRead();
  const notifications = notificationsData?.notifications ?? [];

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onOpenMobileSidebar}
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-base font-semibold text-foreground sm:text-lg">{title}</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={buttonVariants({ variant: "ghost", size: "icon" }) + " relative"}
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -right-1 -top-1 h-4 min-w-4 justify-center rounded-full bg-accent p-0 text-[10px] text-accent-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-1.5 py-1">
              <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllAsRead.mutate()}
                  className="text-xs text-primary hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                You&apos;re all caught up.
              </div>
            ) : (
              <ScrollArea className="h-80">
                <div className="flex flex-col gap-0.5 pr-2">
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

        <button
          type="button"
          onClick={() => setProfileOpen(true)}
          className="flex items-center gap-2 rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Open account panel"
        >
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
        </button>
      </div>

      <ProfileSheet user={user} open={profileOpen} onOpenChange={setProfileOpen} />
    </header>
  );
}
