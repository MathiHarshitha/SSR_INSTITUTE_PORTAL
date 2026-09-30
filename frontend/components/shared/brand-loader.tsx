import Image from "next/image";
import { cn } from "cn";

interface BrandLoaderProps {
  label?: string;
  /** Cover the whole viewport (route/session loading). Set false to fill a container instead. */
  fullScreen?: boolean;
  className?: string;
}

// Ring geometry (viewBox 0 0 160 160). The arc runs clockwise from 12 o'clock to 5 o'clock and
// the whole ring rotates, so the dot at the arc's end always leads.
const C = 80;
const R = 72;
const END_DEG = 60;
const endX = C + R * Math.cos((END_DEG * Math.PI) / 180);
const endY = C + R * Math.sin((END_DEG * Math.PI) / 180);
const ARC = `M ${C} ${C - R} A ${R} ${R} 0 0 1 ${endX.toFixed(2)} ${endY.toFixed(2)}`;

/** SSR logo with a spinning brand-coloured ring. White background in light mode, dark in dark mode. */
export function BrandLoader({ label = "Loading", fullScreen = true, className }: BrandLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center gap-6 bg-white dark:bg-background",
        fullScreen ? "fixed inset-0 z-100" : "min-h-64 w-full",
        className
      )}
    >
      <div className="relative h-40 w-40 text-secondary">
        <svg
          viewBox="0 0 160 160"
          className="absolute inset-0 h-full w-full animate-[spin_1.4s_linear_infinite] motion-reduce:animate-none"
          aria-hidden
        >
          <defs>
            <linearGradient id="brand-loader-arc" gradientUnits="userSpaceOnUse" x1={C} y1={C - R} x2={endX} y2={endY}>
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.05" />
              <stop offset="100%" stopColor="currentColor" />
            </linearGradient>
            <filter id="brand-loader-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>
          <circle cx={C} cy={C} r={R} fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="6" />
          <path d={ARC} fill="none" stroke="url(#brand-loader-arc)" strokeWidth="6" strokeLinecap="round" />
          <circle cx={endX} cy={endY} r="10" fill="currentColor" opacity="0.35" filter="url(#brand-loader-glow)" />
          <circle cx={endX} cy={endY} r="8" className="fill-white dark:fill-background" />
          <circle cx={endX} cy={endY} r="5.5" fill="currentColor" />
        </svg>

        {/* White disc so the logo (which has a white background) reads cleanly in dark mode too. */}
        <div className="absolute inset-5 flex items-center justify-center rounded-full bg-white shadow-lg shadow-secondary/10 ring-1 ring-black/5 dark:shadow-secondary/25">
          <Image src="/ssr-logo.webp" alt="SSR Institute" width={64} height={64} priority className="h-16 w-16 object-contain" />
        </div>
      </div>

      <p className="flex items-baseline text-lg font-semibold tracking-wide text-foreground">
        {label}
        <span className="ml-0.5 flex gap-1 text-secondary" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="brand-loader-dot inline-block h-1.5 w-1.5 rounded-full bg-current"
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </span>
      </p>
    </div>
  );
}
