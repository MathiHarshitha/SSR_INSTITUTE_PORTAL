import Link from "next/link";
import { ArrowRight, LucideIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

interface PageBannerProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  ctaLabel?: string;
  ctaHref?: string;
  tone?: "light" | "dark";
  illustration?: string;
}

export function PageBanner({
  icon: Icon,
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  tone = "light",
  illustration,
}: PageBannerProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-start justify-between gap-3 overflow-hidden p-4 sm:flex-row sm:items-center sm:p-5",
        tone === "dark"
          ? "rounded-3xl bg-[#0f172a] text-white shadow-lg"
          : "clay bg-gradient-to-br from-secondary/10 via-card to-accent/10"
      )}
    >
      {illustration && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={illustration} alt="" className="absolute inset-y-0 right-0 -z-0 h-full w-40 object-cover opacity-90 sm:w-56" />
          <div
            className={cn(
              "pointer-events-none absolute inset-0",
              tone === "dark"
                ? "bg-gradient-to-r from-[#0f172a] via-[#0f172a]/85 to-transparent"
                : "bg-gradient-to-r from-card via-card/80 to-transparent"
            )}
          />
        </>
      )}
      <div className="relative flex items-center gap-3">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
            tone === "dark" ? "bg-white/10" : "bg-white shadow-sm"
          )}
        >
          <Icon className={cn("h-5 w-5", tone === "dark" ? "text-white" : "text-secondary")} />
        </span>
        <div className="min-w-0">
          <p className="truncate font-bold">{title}</p>
          <p className={cn("truncate text-xs", tone === "dark" ? "text-white/70" : "text-muted-foreground")}>{subtitle}</p>
        </div>
      </div>
      {ctaLabel && ctaHref && (
        <Link href={ctaHref} className={cn(buttonVariants({ size: "sm" }), "relative shrink-0")}>
          {ctaLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}
