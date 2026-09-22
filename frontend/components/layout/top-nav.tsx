"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "cn";
import { NAV_ITEMS } from "@/constants/nav";
import { Role } from "@/types/auth";

interface TopNavProps {
  role: Role;
  onNavigate?: () => void;
  variant?: "pills" | "list";
  className?: string;
  activeLayoutId?: string;
}

export function TopNav({ role, onNavigate, variant = "pills", className, activeLayoutId = "nav-active" }: TopNavProps) {
  const pathname = usePathname();
  const items = NAV_ITEMS[role];

  if (variant === "list") {
    return (
      <nav className={cn("flex h-full flex-col justify-between gap-1", className)}>
        {items
          .filter((item) => item.label !== "Profile")
          .map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "relative flex items-center gap-3 rounded-2xl px-3.5 py-2 text-[13.5px] font-medium transition-colors",
                  isActive ? "text-white" : "text-white/65 hover:bg-white/5 hover:text-white"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId={activeLayoutId}
                    className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-[#0092b5] to-[#00b8d4] shadow-md shadow-black/20"
                    transition={{ type: "spring", stiffness: 480, damping: 34 }}
                  />
                )}
                <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
      </nav>
    );
  }

  return (
    <nav className={cn("items-center gap-1 overflow-x-auto rounded-full bg-muted/70 p-1", className)}>
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition-all",
              isActive
                ? "bg-secondary text-secondary-foreground shadow-sm shadow-secondary/20"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
