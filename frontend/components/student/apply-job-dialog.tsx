"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApplyToJob } from "@/hooks/useStudentJobs";
import { StudentJob } from "@/types/job";

interface ApplyJobDialogProps {
  job: StudentJob | null;
  onOpenChange: (open: boolean) => void;
}

export function ApplyJobDialog({ job, onOpenChange }: ApplyJobDialogProps) {
  const [resumeUrl, setResumeUrl] = useState("");
  const applyMutation = useApplyToJob();

  function handleApply() {
    if (!job) return;
    applyMutation.mutate(
      { jobId: job._id, resumeUrl: resumeUrl || undefined },
      {
        onSuccess: () => {
          onOpenChange(false);
          setResumeUrl("");
        },
      }
    );
  }

  return (
    <Dialog open={!!job} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Apply — {job?.title}</DialogTitle>
          <DialogDescription>{job?.company}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-2">
          <Label htmlFor="resume-url">Resume URL (optional)</Label>
          <Input
            id="resume-url"
            placeholder="https://..."
            value={resumeUrl}
            onChange={(e) => setResumeUrl(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button onClick={handleApply} disabled={applyMutation.isPending} className="w-full">
            {applyMutation.isPending ? "Submitting..." : "Submit application"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
