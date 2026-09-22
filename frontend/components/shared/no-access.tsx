"use client";

import Image from "next/image";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

interface NoAccessProps {
  title?: string;
  message?: string;
  buttonLabel?: string;
  buttonHref?: string;
}

/** Full empty-state takeover for a locked section (career resources, etc.) — spec: these
 * stay locked until the student completes a course, so this replaces the section's content
 * entirely rather than just banner-ing on top of it. */
export function NoAccess({
  title = "No Access Yet",
  message = "You don't have access to this section yet. Complete any one course to unlock it.",
  buttonLabel = "Go to Courses",
  buttonHref = "/student/courses",
}: NoAccessProps) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="relative w-full max-w-[300px] sm:max-w-[380px]">
        <Image
          src="/illustrations/no-access.webp"
          alt="Two students pointing at a locked gate labeled 'No Access', encouraging you to complete a course to unlock this section"
          width={547}
          height={456}
          className="h-auto w-full select-none"
          priority
        />
      </div>
      <div className="space-y-1.5">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">{title}</h1>
        <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      </div>
      <Link
        href={buttonHref}
        className="clay-btn mt-1 flex items-center gap-2 bg-[#0092b5] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#00a6cc]"
      >
        <GraduationCap className="h-4 w-4" />
        {buttonLabel}
      </Link>
    </div>
  );
}
