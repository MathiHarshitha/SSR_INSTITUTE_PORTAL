import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Privacy Policy & Student Terms",
  description: "SSR Institute privacy policy and student terms.",
};

const LAST_UPDATED = "September 30, 2026";

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "Student Information",
    body: (
      <p>
        SSR Institute may collect and use student information such as name, phone number, email
        address, educational details, course information, attendance, assessments, and other
        details required for academic and administrative purposes.
      </p>
    ),
  },
  {
    title: "Fees & Refunds",
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>Course fees must be paid according to the applicable fee structure.</li>
        <li>
          <strong className="text-foreground">Fees once paid are non-refundable.</strong>
        </li>
        <li>
          Fees cannot be refunded due to withdrawal, absence, change of course, personal reasons,
          or failure to complete the course.
        </li>
        <li>Students are advised to understand the course details before making payment.</li>
      </ul>
    ),
  },
  {
    title: "Attendance & Punctuality",
    body: (
      <p>
        Students are expected to attend classes regularly and arrive on time. Students are
        responsible for completing missed lessons, assignments, and assessments.
      </p>
    ),
  },
  {
    title: "Discipline & Trainer Instructions",
    body: (
      <>
        <p>
          Students must maintain respectful and professional behaviour with trainers, staff, and
          other students.
        </p>
        <p>
          Students must follow reasonable academic, safety, classroom, and disciplinary
          instructions given by trainers and institute staff.
        </p>
        <p>
          Disrespectful behaviour, harassment, disruption of classes, or inappropriate conduct may
          result in disciplinary action.
        </p>
      </>
    ),
  },
  {
    title: "Course & Institute Property",
    body: (
      <>
        <p>
          Course materials, assignments, documents, videos, software, and other resources provided
          by SSR Institute are intended for enrolled students and must not be copied, shared, sold,
          or distributed without permission.
        </p>
        <p>
          Students must handle institute equipment, facilities, and other property responsibly.
          Any intentional damage or misuse may result in appropriate action.
        </p>
      </>
    ),
  },
  {
    title: "Certificates",
    body: (
      <p>
        Certificates are issued only to students who satisfy the applicable course completion and
        academic requirements of SSR Institute.
      </p>
    ),
  },
  {
    title: "Photos & Media",
    body: (
      <p>
        SSR Institute may capture photographs or videos during classes, workshops, events, or
        institute activities for educational, promotional, or social media purposes. Students who
        have concerns about the use of their image may contact the institute.
      </p>
    ),
  },
  {
    title: "Privacy & Security",
    body: (
      <p>
        SSR Institute takes reasonable measures to protect student information and uses it for
        legitimate academic, administrative, communication, and institutional purposes.
      </p>
    ),
  },
  {
    title: "Policy Violations",
    body: (
      <p>
        SSR Institute reserves the right to take appropriate action, including suspension or
        termination of course access, in cases of serious misconduct, misuse of institute
        resources, harassment, fraud, or violation of institute policies.
      </p>
    ),
  },
  {
    title: "Policy Updates",
    body: (
      <p>
        SSR Institute may update these policies when necessary. Updated policies will be
        communicated or published through the appropriate institute channels.
      </p>
    ),
  },
  {
    title: "Contact Us",
    body: (
      <address className="space-y-1 not-italic">
        <p className="font-semibold text-foreground">SSR Institute</p>
        <p>Software &amp; Electrical Training Institute</p>
        <p>Vijayawada, Andhra Pradesh, India</p>
        <p className="pt-2">
          <span className="font-medium text-foreground">Website:</span>{" "}
          <a href="https://ssrinstitute.in" target="_blank" rel="noreferrer" className="text-primary hover:underline">
            ssrinstitute.in
          </a>
        </p>
        <p>
          <span className="font-medium text-foreground">Email:</span>{" "}
          <a href="mailto:ssrvijayawada@gmail.com" className="text-primary hover:underline">
            ssrvijayawada@gmail.com
          </a>
          ,{" "}
          <a href="mailto:Smartskillsrecruitment@gmail.com" className="text-primary hover:underline">
            Smartskillsrecruitment@gmail.com
          </a>
        </p>
        <p>
          <span className="font-medium text-foreground">Phone:</span>{" "}
          <a href="tel:+917799811611" className="text-primary hover:underline">
            7799811611
          </a>
        </p>
      </address>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="glass-strong sticky top-0 z-30 border-b border-border/60 !rounded-none">
        <div className="mx-auto flex h-16 max-w-4xl items-center px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5">
              <Image src="/ssr-logo.webp" alt="SSR Institute" fill sizes="36px" className="object-contain p-1" priority />
            </div>
            <span className="text-sm font-semibold text-foreground">SSR Portal</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          SSR Institute Privacy Policy &amp; Student Terms
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Last Updated: {LAST_UPDATED}</p>

        <p className="mt-6 leading-relaxed text-muted-foreground">
          SSR Institute, Vijayawada, is committed to providing a professional, respectful, and
          effective learning environment. By enrolling in our courses or participating in institute
          activities, students agree to follow the policies below.
        </p>

        <div className="mt-8 space-y-8">
          {SECTIONS.map((section, index) => (
            <section key={section.title}>
              <h2 className="text-lg font-semibold text-foreground">
                {index + 1}. {section.title}
              </h2>
              <div className="mt-2 space-y-2 leading-relaxed text-muted-foreground">{section.body}</div>
            </section>
          ))}
        </div>

        <p className="mt-10 border-t border-border/60 pt-6 text-sm text-muted-foreground">
          By enrolling in a course or participating in SSR Institute activities, students
          acknowledge that they have read and agreed to these policies.
        </p>
      </main>
    </div>
  );
}
