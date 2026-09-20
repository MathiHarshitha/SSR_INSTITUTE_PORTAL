"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { LessonContentSheet } from "@/components/admin/lesson-content-sheet";
import {
  useCreateLesson,
  useDeleteLesson,
  useLessons,
  useReorderLessons,
  useUpdateLesson,
} from "@/hooks/useModules";
import { AdminLesson, AdminTopic, LessonFormInput } from "@/types/module";

interface TopicCardProps {
  moduleId: string;
  topic: AdminTopic;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function TopicCard({
  moduleId,
  topic,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}: TopicCardProps) {
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<AdminLesson | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<AdminLesson | null>(null);

  const { data: lessons, isLoading } = useLessons(topic._id);
  const createLesson = useCreateLesson(topic._id, moduleId);
  const updateLesson = useUpdateLesson(topic._id);
  const deleteLesson = useDeleteLesson(topic._id, moduleId);
  const reorderLessons = useReorderLessons(topic._id);

  function openAddLesson() {
    setEditingLesson(null);
    setLessonDialogOpen(true);
  }

  function openEditLesson(lesson: AdminLesson) {
    setEditingLesson(lesson);
    setLessonDialogOpen(true);
  }

  function handleLessonSubmit(input: LessonFormInput) {
    if (editingLesson) {
      updateLesson.mutate({ id: editingLesson._id, input }, { onSuccess: () => setLessonDialogOpen(false) });
    } else {
      createLesson.mutate(input, { onSuccess: () => setLessonDialogOpen(false) });
    }
  }

  function moveLesson(index: number, direction: -1 | 1) {
    if (!lessons) return;
    const next = [...lessons];
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= next.length) return;
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    reorderLessons.mutate(next.map((l) => l._id));
  }

  return (
    <Card className="border-dashed">
      <CardHeader className="flex flex-row items-start justify-between gap-2 py-3">
        <div>
          <CardTitle className="text-sm">{topic.name}</CardTitle>
          {topic.description && <p className="text-xs text-muted-foreground">{topic.description}</p>}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-xs" disabled={isFirst} onClick={onMoveUp} aria-label="Move topic up">
            <ArrowUp className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon-xs" disabled={isLast} onClick={onMoveDown} aria-label="Move topic down">
            <ArrowDown className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={onEdit} aria-label="Edit topic">
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-destructive hover:text-destructive"
            onClick={onDelete}
            aria-label="Delete topic"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <Skeleton className="h-8 w-full" />
        ) : !lessons || lessons.length === 0 ? (
          <p className="text-sm text-muted-foreground">No lessons yet.</p>
        ) : (
          <ul className="space-y-1">
            {lessons.map((lesson, index) => (
              <li
                key={lesson._id}
                className="flex items-center justify-between rounded-md border border-border px-3 py-1.5 text-sm"
              >
                <span className="flex items-center gap-2">
                  {lesson.title}
                  {!lesson.published && <Badge variant="outline">Draft</Badge>}
                  {lesson.estimatedMinutes ? (
                    <span className="text-xs text-muted-foreground">{lesson.estimatedMinutes} min</span>
                  ) : null}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    disabled={index === 0}
                    onClick={() => moveLesson(index, -1)}
                    aria-label="Move lesson up"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    disabled={index === lessons.length - 1}
                    onClick={() => moveLesson(index, 1)}
                    aria-label="Move lesson down"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon-xs" onClick={() => openEditLesson(lesson)} aria-label="Edit lesson">
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeletingLesson(lesson)}
                    aria-label="Delete lesson"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <Button variant="outline" size="sm" onClick={openAddLesson}>
          <Plus className="h-3.5 w-3.5" />
          Add lesson
        </Button>
      </CardContent>

      <LessonContentSheet
        open={lessonDialogOpen}
        onOpenChange={setLessonDialogOpen}
        lesson={editingLesson}
        isSubmitting={createLesson.isPending || updateLesson.isPending}
        onSubmit={handleLessonSubmit}
      />

      <ConfirmDialog
        open={!!deletingLesson}
        onOpenChange={(open) => !open && setDeletingLesson(null)}
        title="Delete this lesson?"
        description={`"${deletingLesson?.title}" will be permanently removed.`}
        confirmLabel="Delete"
        destructive
        isLoading={deleteLesson.isPending}
        onConfirm={() => {
          if (deletingLesson) {
            deleteLesson.mutate(deletingLesson._id, { onSuccess: () => setDeletingLesson(null) });
          }
        }}
      />
    </Card>
  );
}
