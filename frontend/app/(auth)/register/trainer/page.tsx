"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { registerTrainerSchema, RegisterTrainerFormValues } from "@/schemas/auth.schema";
import { authService } from "@/services/auth.service";
import { extractErrorMessage } from "@/lib/api-client";
import { LoginMascot } from "@/components/auth/login/login-mascot";
import styles from "@/components/auth/login/login.module.css";
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
  FormDescription,
  FormMessage,
} from "@/components/ui/form";

export default function RegisterTrainerPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Presentation only: the mascot covers its eyes while a password field is focused.
  const [passwordFocused, setPasswordFocused] = useState(false);
  const form = useForm<RegisterTrainerFormValues>({
    resolver: zodResolver(registerTrainerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      qualification: "",
      specialization: "",
      skills: "",
    },
  });

  async function onSubmit(values: RegisterTrainerFormValues) {
    setIsSubmitting(true);
    try {
      const result = await authService.registerTrainer(values);
      toast.success("Registration submitted. Check your email for a verification code.");
      router.push(`/verify-otp?email=${encodeURIComponent(result.email)}`);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.panelStack} style={{ maxWidth: "32rem" }}>
      <LoginMascot mood={passwordFocused ? "cover" : "watch"} gaze={0.5} />
      <Card className="relative z-[1] w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Trainer registration</CardTitle>
          <CardDescription>
            Create your trainer account. An admin will review and approve it before you can log in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              onFocus={(e) => {
                const name = e.target instanceof HTMLInputElement ? e.target.name : "";
                setPasswordFocused(name === "password" || name === "confirmPassword");
              }}
              onBlur={() => setPasswordFocused(false)}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Full name</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="9876543210" {...field} />
                      </FormControl>
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
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="qualification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qualification</FormLabel>
                      <FormControl>
                        <Input placeholder="M.Tech" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="experienceYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience (years)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} max={60} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="specialization"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Specialization</FormLabel>
                      <FormControl>
                        <Input placeholder="MERN Full Stack" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Skills</FormLabel>
                      <FormControl>
                        <Input placeholder="React, Node.js, MongoDB" {...field} />
                      </FormControl>
                      <FormDescription>Separate skills with commas.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Create account"}
              </Button>
            </form>
          </Form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
