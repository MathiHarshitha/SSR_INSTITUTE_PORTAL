"use client";

import { ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { SubmissionStatus } from "@/types/task";

export interface ViewableSubmission {
  student: { name: string; email: string };
  status: SubmissionStatus;
  submittedAt?: string;
  content?: string;
  fileUrl?: string;
  comments?: string;
  marks?: number;
  feedback?: string;
}

interface SubmissionViewDialogProps {
  submission: ViewableSubmission | null;
  taskTitle?: string;
  maxMarks?: number;
  onOpenChange: (open: boolean) => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

/** Read-only view of everything a student handed in for a task. */
export function SubmissionViewDialog({ submission, taskTitle, maxMarks, onOpenChange }: SubmissionViewDialogProps) {
  const hasAnything = submission && (submission.content || submission.fileUrl || submission.comments);

  return (
    <Dialog open={!!submission} onOpenChange={onOpenChange}>
      {/* Opens on top of the submissions dialog, so it uses a solid background rather than the
          translucent glass style, which would let the list underneath show through. */}
      <DialogContent className="bg-popover! sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{submission?.student.name}&apos;s submission</DialogTitle>
          <DialogDescription>
            {taskTitle}
            {submission?.submittedAt && ` · Submitted ${new Date(submission.submittedAt).toLocaleString()}`}
          </DialogDescription>
        </DialogHeader>

        {submission && (
          <div className="max-h-[60vh] space-y-4 overflow-y-auto text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{submission.status}</Badge>
              <span className="text-muted-foreground">{submission.student.email}</span>
            </div>

            {submission.fileUrl && (
              <Field label="File / link">
                <a
                  href={submission.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open submitted file
                </a>
                <p className="break-all text-xs text-muted-foreground">{submission.fileUrl}</p>
              </Field>
            )}

            {submission.content && (
              <Field label="Answer">
                <p className="whitespace-pre-wrap rounded-md border border-border bg-muted/40 p-3">
                  {submission.content}
                </p>
              </Field>
            )}

            {submission.comments && (
              <Field label="Student comments">
                <p className="whitespace-pre-wrap">{submission.comments}</p>
              </Field>
            )}

            {!hasAnything && <p className="text-muted-foreground">This submission has no content attached.</p>}

            {submission.status === "EVALUATED" && (
              <Field label="Evaluation">
                <p className="font-medium">
                  {submission.marks ?? "—"}
                  {maxMarks !== undefined && ` / ${maxMarks}`}
                </p>
                {submission.feedback && <p className="text-muted-foreground">{submission.feedback}</p>}
              </Field>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
