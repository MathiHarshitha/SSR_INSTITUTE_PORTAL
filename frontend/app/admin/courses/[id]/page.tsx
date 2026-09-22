"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { cn } from "cn";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ModuleFormDialog } from "@/components/admin/module-form-dialog";
import { ModuleCard } from "@/components/admin/module-card";
import { useCourse } from "@/hooks/useCourses";
import { useCreateModule, useDeleteModule, useModules, useReorderModules, useUpdateModule } from "@/hooks/useModules";
import { AdminModule, ModuleFormInput } from "@/types/module";
import { CourseStatus } from "@/types/course";

function statusBadgeClassName(status: CourseStatus): string {
  switch (status) {
    case "PUBLISHED":
      return "bg-status-good/10 text-status-good";
    case "ARCHIVED":
      return "bg-status-neutral/10 text-status-neutral";
    case "DRAFT":
      return "bg-muted text-muted-foreground";
  }
}

export default function CourseCurriculumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: courseId } = use(params);

  const { data: course, isLoading: isLoadingCourse } = useCourse(courseId);
  const { data: modules, isLoading: isLoadingModules } = useModules(courseId);

  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<AdminModule | null>(null);
  const [deletingModule, setDeletingModule] = useState<AdminModule | null>(null);

  const createModule = useCreateModule(courseId);
  const updateModule = useUpdateModule(courseId);
  const deleteModule = useDeleteModule(courseId);
  const reorderModules = useReorderModules(courseId);

  function openAddModule() {
    setEditingModule(null);
    setModuleDialogOpen(true);
  }

  function openEditModule(module: AdminModule) {
    setEditingModule(module);
    setModuleDialogOpen(true);
  }

  function handleModuleSubmit(input: ModuleFormInput) {
    if (editingModule) {
      updateModule.mutate({ id: editingModule._id, input }, { onSuccess: () => setModuleDialogOpen(false) });
    } else {
      createModule.mutate(input, { onSuccess: () => setModuleDialogOpen(false) });
    }
  }

  function moveModule(index: number, direction: -1 | 1) {
    if (!modules) return;
    const next = [...modules];
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= next.length) return;
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    reorderModules.mutate(next.map((m) => m._id));
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/courses"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "px-0")}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to courses
      </Link>

      {isLoadingCourse ? (
        <Skeleton className="h-20 w-full" />
      ) : course ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-foreground">{course.name}</h2>
              <Badge className={statusBadgeClassName(course.status)}>{course.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {course.duration} · ₹{course.fee.toLocaleString("en-IN")}
              {course.category ? ` · ${course.category}` : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/admin/courses/${courseId}/final-assessment`}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Final Assessment
            </Link>
            <Button onClick={openAddModule}>
              <Plus className="h-4 w-4" />
              Add module
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Course not found.</p>
      )}

      {isLoadingModules ? (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : !modules || modules.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">No modules yet</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Add a module to start building this course&apos;s syllabus.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {modules.map((module, index) => (
            <ModuleCard
              key={module._id}
              courseId={courseId}
              module={module}
              isFirst={index === 0}
              isLast={index === modules.length - 1}
              onMoveUp={() => moveModule(index, -1)}
              onMoveDown={() => moveModule(index, 1)}
              onEdit={() => openEditModule(module)}
              onDelete={() => setDeletingModule(module)}
            />
          ))}
        </div>
      )}

      <ModuleFormDialog
        open={moduleDialogOpen}
        onOpenChange={setModuleDialogOpen}
        module={editingModule}
        isSubmitting={createModule.isPending || updateModule.isPending}
        onSubmit={handleModuleSubmit}
      />

      <ConfirmDialog
        open={!!deletingModule}
        onOpenChange={(open) => !open && setDeletingModule(null)}
        title="Delete this module?"
        description={`"${deletingModule?.name}" and all its lessons will be permanently removed.`}
        confirmLabel="Delete"
        destructive
        isLoading={deleteModule.isPending}
        onConfirm={() => {
          if (deletingModule) {
            deleteModule.mutate(deletingModule._id, { onSuccess: () => setDeletingModule(null) });
          }
        }}
      />
    </div>
  );
}
