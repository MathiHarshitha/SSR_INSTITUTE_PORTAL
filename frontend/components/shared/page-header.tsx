import { LucideIcon, Quote } from "lucide-react";

interface PageHeaderProps {
  eyebrow: string;
  eyebrowIcon?: LucideIcon;
  title: string;
  titleAccent?: string;
  subtitle: string;
  quote: string;
  illustration?: string;
}

export function PageHeader({
  eyebrow,
  eyebrowIcon: EyebrowIcon,
  title,
  titleAccent,
  subtitle,
  quote,
  illustration = "/illustrations/online-learning.svg",
}: PageHeaderProps) {
  return (
    <div className="clay relative overflow-hidden bg-gradient-to-br from-card to-muted/40 p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          {eyebrow && (
            <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-secondary">
              {EyebrowIcon && <EyebrowIcon className="h-3.5 w-3.5" />}
              {eyebrow}
            </p>
          )}
          <h1 className="text-2xl font-extrabold leading-tight sm:text-3xl">
            <span className="text-foreground">{title}</span>
            {titleAccent && <span className="text-secondary"> {titleAccent}</span>}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <div className="hidden shrink-0 items-center gap-3 md:flex">
          <div className="relative h-24 w-28 shrink-0 lg:h-28 lg:w-32">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={illustration} alt="" className="h-full w-full object-contain" />
          </div>
          <div className="clay flex max-w-[13rem] items-start gap-2 px-3 py-2">
            <Quote className="h-4 w-4 shrink-0 text-secondary" />
            <p className="text-xs font-medium italic leading-snug text-foreground">
              {quote}
              <span className="mt-0.5 block not-italic text-[11px] text-muted-foreground">— SSR Institute</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
