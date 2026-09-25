"use client";

import { KeyboardEvent, RefObject, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { ArrowRight, Eye, EyeOff, GraduationCap, Lock, LucideIcon, Mail, Presentation, ShieldCheck } from "lucide-react";
import { cn } from "cn";
import { loginSchema, LoginFormValues } from "@/schemas/auth.schema";
import { useLogin } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LoginMascot, MascotMood } from "./login-mascot";
import styles from "./login.module.css";

type PortalRole = "student" | "trainer" | "admin";

/* The backend decides the account's role and useLogin routes to that role's
 * dashboard, so this selector only tailors the panel — it is never sent. */
const ROLES: { value: PortalRole; label: string; icon: LucideIcon }[] = [
  { value: "student", label: "Student", icon: GraduationCap },
  { value: "trainer", label: "Trainer", icon: Presentation },
  { value: "admin", label: "Admin", icon: ShieldCheck },
];

function RoleSelector({ value, onChange }: { value: PortalRole; onChange: (role: PortalRole) => void }) {
  const index = ROLES.findIndex((r) => r.value === value);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const step = event.key === "ArrowRight" ? 1 : -1;
    const next = ROLES[(index + step + ROLES.length) % ROLES.length];
    onChange(next.value);
    event.currentTarget.querySelector<HTMLButtonElement>(`[data-role="${next.value}"]`)?.focus();
  }

  return (
    <div
      role="radiogroup"
      aria-label="I am signing in as"
      className={cn("clay-inset", styles.segTrack)}
      onKeyDown={onKeyDown}
    >
      <span className={styles.segThumb} style={{ ["--index" as string]: index }} aria-hidden />
      {ROLES.map(({ value: role, label, icon: Icon }) => (
        <button
          key={role}
          type="button"
          role="radio"
          data-role={role}
          aria-checked={role === value}
          tabIndex={role === value ? 0 : -1}
          className={styles.segOption}
          onClick={() => onChange(role)}
        >
          <Icon className="h-4 w-4" aria-hidden />
          {label}
        </button>
      ))}
    </div>
  );
}

/** Scales the panel (via --fit) so it always fits the viewport height instead of scrolling. */
function useFitToHeight(wrapRef: RefObject<HTMLDivElement | null>, stackRef: RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const stack = stackRef.current;
    if (!wrap || !stack) return;
    const fit = () => {
      // offsetHeight ignores the scale, so this measures the panel's natural height
      const scale = Math.min(1, wrap.clientHeight / stack.offsetHeight);
      stack.style.setProperty("--fit", String(Math.max(scale, 0.5)));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(wrap);
    observer.observe(stack);
    return () => observer.disconnect();
  }, [wrapRef, stackRef]);
}

function RegisterHint({ role }: { role: PortalRole }) {
  if (role === "admin") {
    return <>Admin access is issued by SSR Institute.</>;
  }
  const isTrainer = role === "trainer";
  return (
    <>
      {isTrainer ? "Joining as faculty?" : "New to SSR Institute?"}{" "}
      <Link
        href={isTrainer ? "/register/trainer" : "/register/student"}
        className="font-medium text-secondary hover:underline"
      >
        Register as {isTrainer ? "trainer" : "student"}
      </Link>
    </>
  );
}

export function LoginPanel() {
  const [role, setRole] = useState<PortalRole>("student");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  useFitToHeight(wrapRef, stackRef);

  const login = useLogin();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  function onSubmit(values: LoginFormValues) {
    login.mutate(values);
  }

  // Presentation only: the mascot follows the email and hides its eyes for the password.
  const email = useWatch({ control: form.control, name: "email" }) ?? "";
  const mood: MascotMood = passwordFocused ? (showPassword ? "peek" : "cover") : "watch";

  return (
    <div ref={wrapRef} className={styles.panelWrap}>
      <div ref={stackRef} className={styles.panelStack}>
        <LoginMascot mood={mood} gaze={email.length / 28} />
        <section className={styles.panel} aria-labelledby="login-title">
          <header className="mb-6 space-y-1.5">
            <h2 id="login-title" className="text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem]">
              Welcome Back <span aria-hidden>👋</span>
            </h2>
            <p className="text-sm text-muted-foreground">Continue your learning journey.</p>
          </header>

          <RoleSelector value={role} onChange={setRole} />

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <div className={styles.field}>
                      <Mail className={styles.fieldIcon} aria-hidden />
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          autoComplete="email"
                          className={styles.input}
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <div
                      className={styles.field}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={(e) => {
                        // the show/hide button is part of the field; keep the mascot's pose while it has focus
                        if (!e.currentTarget.contains(e.relatedTarget)) setPasswordFocused(false);
                      }}
                    >
                      <Lock className={styles.fieldIcon} aria-hidden />
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          autoComplete="current-password"
                          className={cn(styles.input, styles.passwordInput)}
                          {...field}
                        />
                      </FormControl>
                      <button
                        type="button"
                        className={styles.revealBtn}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        aria-pressed={showPassword}
                        onClick={() => setShowPassword((v) => !v)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-2 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="font-normal text-muted-foreground">Remember me</FormLabel>
                    </FormItem>
                  )}
                />
                <Link href="/forgot-password" className="text-sm font-medium text-secondary hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className={cn("w-full", styles.cta)} disabled={login.isPending}>
                {login.isPending ? (
                  "Signing in..."
                ) : (
                  <>
                    Login <ArrowRight className="!size-[1.1rem]" aria-hidden />
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="clay-inset mt-6 flex items-center gap-3 px-4 py-3">
            <span className={styles.puck} style={{ ["--tone" as string]: "var(--chart-2)", fontSize: "0.85rem" }}>
              <ShieldCheck aria-hidden />
            </span>
            <span className="leading-tight">
              <span className="block text-xs font-semibold text-foreground">Secure Learning Space</span>
              <span className="block text-xs text-muted-foreground">Your learning journey stays secure.</span>
            </span>
          </div>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            <RegisterHint role={role} />
          </p>
        </section>
      </div>
    </div>
  );
}
