import Image from "next/image";
import styles from "./login.module.css";

export function LoginBrand() {
  return (
    <div className={styles.brand}>
      <span className={styles.logoTile}>
        <Image src="/ssr-logo.webp" alt="" fill sizes="44px" className="object-contain p-1.5" priority />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-bold tracking-[0.18em] text-foreground">SSR INSTITUTE</span>
        <span className="block text-xs text-muted-foreground">Learning Management System</span>
      </span>
    </div>
  );
}
