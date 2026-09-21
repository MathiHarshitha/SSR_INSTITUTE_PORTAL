import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="glass-strong sticky top-0 z-30 border-b border-border/60 !rounded-none">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5">
              <Image src="/ssr-logo.webp" alt="SSR Institute" fill sizes="36px" className="object-contain p-1" priority />
            </div>
            <span className="text-sm font-semibold text-foreground">SSR Portal</span>
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
