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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileUploadField } from "@/components/shared/file-upload-field";
import { useMySubmission, useSubmitTask } from "@/hooks/useTasks";
import { StudentTask } from "@/types/task";

interface SubmitTaskDialogProps {
  task: StudentTask | null;
  onOpenChange: (open: boolean) => void;
}

export function SubmitTaskDialog({ task, onOpenChange }: SubmitTaskDialogProps) {
  const { data: existing } = useMySubmission(task?._id ?? null);
  const submitMutation = useSubmitTask(task?._id ?? "");

  // User edits this session, layered over the server-derived defaults below —
  // avoids syncing fetched data into state inside an effect.
  const [overrides, setOverrides] = useState<{ fileUrl?: string; comments?: string }>({});

  const fileUrl = overrides.fileUrl ?? existing?.fileUrl ?? "";
  const comments = overrides.comments ?? existing?.comments ?? "";

  function handleOpenChange(open: boolean) {
    if (!open) setOverrides({});
    onOpenChange(open);
  }

  const alreadyEvaluated = existing?.status === "EVALUATED";

  function handleSubmit() {
    if (!task) return;
    submitMutation.mutate(
      { fileUrl: fileUrl || undefined, comments: comments || undefined },
      { onSuccess: () => handleOpenChange(false) }
    );
  }

  return (
    <Dialog open={!!task} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{task?.title}</DialogTitle>
          <DialogDescription>
            Due {task ? new Date(task.dueDate).toLocaleDateString() : ""} · Max marks {task?.maxMarks}
          </DialogDescription>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">{task?.description}</p>

        {alreadyEvaluated ? (
          <div className="rounded-md border border-border p-3 text-sm">
            <p className="font-medium">
              Marks: {existing?.marks}/{task?.maxMarks}
            </p>
            {existing?.feedback && <p className="mt-1 text-muted-foreground">{existing.feedback}</p>}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="submission-url">Submission link or file</Label>
              <FileUploadField
                value={fileUrl}
                onChange={(url) => setOverrides((prev) => ({ ...prev, fileUrl: url }))}
                folder="submissions"
                placeholder="https://... (GitHub repo, file link, etc.) or upload a file"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="submission-comments">Comments</Label>
              <Textarea
                id="submission-comments"
                rows={3}
                placeholder="Optional"
                value={comments}
                onChange={(e) => setOverrides((prev) => ({ ...prev, comments: e.target.value }))}
              />
            </div>
          </div>
        )}

        {!alreadyEvaluated && (
          <DialogFooter>
            <Button onClick={handleSubmit} disabled={submitMutation.isPending} className="w-full">
              {submitMutation.isPending ? "Submitting..." : existing ? "Update submission" : "Submit"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
