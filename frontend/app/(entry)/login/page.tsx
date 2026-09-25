import { LoginBrand } from "@/components/auth/login/login-brand";
import { LoginPanel } from "@/components/auth/login/login-panel";
import { LoginThemeToggle } from "@/components/auth/login/login-theme-toggle";
import styles from "@/components/auth/login/login.module.css";

export default function LoginPage() {
  return (
    <div className={styles.root}>
      <LoginBrand />
      <LoginThemeToggle />
      <LoginPanel />
    </div>
  );
}
