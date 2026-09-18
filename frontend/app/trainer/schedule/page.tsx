"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useBatches } from "@/hooks/useBatches";
import { useClasses, useCreateClass, useDeleteClass, useUpdateClass } from "@/hooks/useSchedule";
import { ClassFormDialog } from "@/components/trainer/class-form-dialog";
import { ClassScheduleEntry, ClassScheduleFormInput } from "@/types/schedule";

export default function TrainerSchedulePage() {
  const { data: batchData } = useBatches({ page: 1, limit: 100 });
  const batches = batchData?.batches ?? [];

  const { data: classes, isLoading, isError } = useClasses({});
  const createMutation = useCreateClass();
  const updateMutation = useUpdateClass();
  const deleteMutation = useDeleteClass();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassScheduleEntry | null>(null);
  const [deletingClass, setDeletingClass] = useState<ClassScheduleEntry | null>(null);

  function openCreate() {
    setEditingClass(null);
    setDialogOpen(true);
  }

  function openEdit(entry: ClassScheduleEntry) {
    setEditingClass(entry);
    setDialogOpen(true);
  }

  function handleSubmit(input: ClassScheduleFormInput) {
    if (editingClass) {
      updateMutation.mutate({ id: editingClass._id, input }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createMutation.mutate(input, { onSuccess: () => setDialogOpen(false) });
    }
  }

  const upcoming = (classes ?? []).filter((c) => new Date(c.date) >= new Date(new Date().toDateString()));
  const past = (classes ?? []).filter((c) => new Date(c.date) < new Date(new Date().toDateString()));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Class Schedule</h2>
          <p className="text-sm text-muted-foreground">Schedule and manage classes for your batches.</p>
        </div>
        <Button onClick={openCreate} disabled={batches.length === 0}>
          <Plus className="h-4 w-4" />
          Schedule class
        </Button>
      </div>

      {isError ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Failed to load schedule.
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : !classes || classes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No classes scheduled yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">Upcoming</h3>
            <div className="space-y-2">
              {upcoming.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming classes.</p>
              ) : (
                upcoming.map((c) => (
                  <Card key={c._id}>
                    <CardContent className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{c.topic}</p>
                        <p className="text-sm text-muted-foreground">
                          {c.batch.name} · {new Date(c.date).toLocaleDateString()} · {c.startTime}–
                          {c.endTime}
                        </p>
                        {c.meetingLink && (
                          <a
                            href={c.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <Video className="h-3 w-3" />
                            Join link
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(c)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeletingClass(c)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {past.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">Past</h3>
              <div className="space-y-2 opacity-70">
                {past.map((c) => (
                  <Card key={c._id}>
                    <CardContent>
                      <p className="font-medium">{c.topic}</p>
                      <p className="text-sm text-muted-foreground">
                        {c.batch.name} · {new Date(c.date).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <ClassFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        batches={batches}
        classEntry={editingClass}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!deletingClass}
        onOpenChange={(open) => !open && setDeletingClass(null)}
        title="Delete this class?"
        description={`"${deletingClass?.topic}" will be removed from the schedule.`}
        confirmLabel="Delete"
        destructive
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (deletingClass) {
            deleteMutation.mutate(deletingClass._id, { onSuccess: () => setDeletingClass(null) });
          }
        }}
      />
    </div>
  );
}
