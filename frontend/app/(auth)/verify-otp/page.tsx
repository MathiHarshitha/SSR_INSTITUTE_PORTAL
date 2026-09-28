"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { verifyOtpSchema, VerifyOtpFormValues } from "@/schemas/auth.schema";
import { authService } from "@/services/auth.service";
import { extractErrorMessage } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

/** Emails can take a few minutes to arrive, and each resend invalidates the previous code — so
 * resending is held back briefly to stop students replacing a code that's still on its way. */
const RESEND_COOLDOWN_SECONDS = 60;

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  // Starts counting on arrival, since a code was just sent at registration.
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const form = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { otp: "" },
  });

  async function onSubmit(values: VerifyOtpFormValues) {
    if (!email) {
      toast.error("Missing email. Please register again.");
      return;
    }
    setIsSubmitting(true);
    try {
      await authService.verifyOtp(email, values.otp);
      toast.success("Email verified. Your account is now awaiting admin approval.");
      router.push("/login");
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    if (!email || cooldown > 0) return;
    setIsResending(true);
    try {
      const message = await authService.resendOtp(email);
      toast.success(message);
      form.resetField("otp");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setIsResending(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Verify your email</CardTitle>
        <CardDescription>
          {email ? (
            <>We sent a 6-digit code to <strong>{email}</strong>.</>
          ) : (
            "Enter the 6-digit verification code sent to your email."
          )}
        </CardDescription>
        <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
          The email can take a few minutes to arrive. If you don&apos;t see it, check your{" "}
          <strong>Spam</strong> or <strong>Promotions</strong> folder.
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification code</FormLabel>
                  <FormControl>
                    <Input
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="123456"
                      className="text-center text-lg tracking-[0.5em]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Verifying..." : "Verify email"}
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Didn&apos;t get a code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || cooldown > 0}
            className="font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:no-underline"
          >
            {isResending ? "Sending..." : cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
          </button>
          <p className="mt-1 text-xs">Requesting a new code replaces the previous one — use the latest email.</p>
        </div>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary hover:underline">
            Back to login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense>
      <VerifyOtpForm />
    </Suspense>
  );
}
