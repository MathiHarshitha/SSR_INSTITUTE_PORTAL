import Link from "next/link";
import Image from "next/image";
import {
  Briefcase,
  Award,
  Users,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CoursesSection } from "@/components/home/courses-section";
import { cn } from "cn";

const PROCESS_STEPS = [
  { title: "Learn", description: "Structured, module-based curriculum led by industry trainers." },
  { title: "Practice", description: "Hands-on assignments, quizzes and real-world projects." },
  { title: "Get Certified", description: "Verifiable certificates issued on successful completion." },
  { title: "Get Placed", description: "Mock interviews, job listings and dedicated placement support." },
];

const STATS = [
  { label: "Students Trained", value: "1,000+" },
  { label: "Expert Trainers", value: "25+" },
  { label: "Courses Offered", value: "10+" },
  { label: "Hiring Partners", value: "50+" },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="glass-strong sticky top-0 z-40 border-b border-border/60 !rounded-none">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5">
              <Image src="/ssr-logo.webp" alt="SSR Institute" fill sizes="36px" className="object-contain p-1" priority />
            </div>
            <span className="text-sm font-semibold text-foreground">SSR Portal</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <a href="#courses" className="hover:text-foreground">Courses</a>
            <a href="#process" className="hover:text-foreground">Process</a>
            <a href="#placements" className="hover:text-foreground">Placements</a>
            <a href="#contact" className="hover:text-foreground">Contact</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }))}>
              Login
            </Link>
            <Link href="/register/student" className={cn(buttonVariants())}>
              Register
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="border-b border-border bg-gradient-to-b from-muted/60 to-background">
          <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Learn. Practice. Get Certified. Get Placed.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground sm:text-lg">
              SSR Portal connects students, trainers, courses, practical learning, assessments and
              placement opportunities in one platform.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/register/student" className={cn(buttonVariants({ size: "lg" }))}>
                Student Login <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/register/trainer"
                className={cn(buttonVariants({ size: "lg", variant: "secondary" }))}
              >
                Trainer Login
              </Link>
              <Link
                href="/register/student"
                className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
              >
                Register
              </Link>
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-12 sm:px-6 md:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="courses" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-semibold text-foreground">Our Courses</h2>
          <p className="mt-1 text-muted-foreground">Industry-relevant training programs.</p>
          <CoursesSection />
        </section>

        <section id="process" className="border-y border-border bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="text-2xl font-semibold text-foreground">Training Process</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {PROCESS_STEPS.map((step, i) => (
                <div key={step.title} className="glass rounded-2xl p-5 shadow-md shadow-black/5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {i + 1}
                  </div>
                  <h3 className="mt-3 font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="placements" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <Briefcase className="h-6 w-6 text-secondary" />
                <CardTitle className="text-base">Placement Support</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Dedicated job listings, eligibility tracking and application management.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Users className="h-6 w-6 text-secondary" />
                <CardTitle className="text-base">Expert Trainers</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Learn from experienced industry professionals across every course.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Award className="h-6 w-6 text-secondary" />
                <CardTitle className="text-base">Verified Certificates</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Every certificate is verifiable online with a unique certificate ID.
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="border-t border-border bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
            <BarChart3 className="mx-auto h-8 w-8 text-primary" />
            <h2 className="mt-3 text-2xl font-semibold text-foreground">
              Ready to start your journey with SSR Institute?
            </h2>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link href="/register/student" className={cn(buttonVariants({ size: "lg" }))}>
                Register as Student
              </Link>
              <Link
                href="/register/trainer"
                className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
              >
                Register as Trainer
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="glass-strong border-t border-border/60 !rounded-none">
        <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-muted-foreground sm:px-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
            <div>
              <p className="font-semibold text-foreground">SSR Institute</p>
              <p className="mt-1">Training Institute Management Portal</p>
            </div>
            <p>© {new Date().getFullYear()} SSR Institute. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
